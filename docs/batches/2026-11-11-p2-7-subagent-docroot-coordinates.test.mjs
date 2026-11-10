/**
 * 2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs — 本批改面单元测试档（用毕即删，与批档同名同目录）。
 *
 * 覆盖 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.5 的 AC-DC-1 – AC-DC-5（AC-DC-6 = 文档门，由
 * `doc_check` 跑，本档不跑）。用例 1–8 与 §6.61.6 用例表逐条对应；表外另补三格（表无行、AC ／契约有要求）：
 * 「manifest 读抛」（AC-DC-4 的红侧第三格）、「`docRoot` 整键缺 ∥ 非对象」（契约 ③ 整键格）、「零回归」。
 * 核法（cwd = 仓根）：`node --test docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs`
 *
 * 夹具 = 系统临时目录里的真项目（真 `PROJECT-MANIFEST.json` + 真批档）+ 真 `buildSpawnChild` 装配
 * （零网络、零 LLM：子代理只装配、不驱跑）。
 *
 * **每格取两侧读数**：同一句断言在绿夹具上必须为真、在红侧输入上必须为假——所以本档任一格都能当场
 * 变红，红绿不跟「本笔提没提交」绑在一起。三处红侧尤其实：缺 `design` 那格的真断言是「块里没有
 * `docs/design`」，而同一个原始档经 `fillDefaults` 给的正是 `docs/design`——两处读数相左，才证明
 * 「默认值 ≠ 声明」这一判别真的在起作用（KD-DC2），而不是一句同义反复。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { createAgent } from "../../thincoder-core/agent.mjs"
import { buildSpawnChild } from "../../thincoder-core/agent-tools/subagent-spawn.mjs"
import { gateEngCoderSpawn } from "../../thincoder-core/agent/spawn-child.mjs"
import { readManifest } from "../../thincoder-core/manifest.mjs"
import { fillDefaults } from "../../thincoder-core/manifest-schema.mjs"

const DOCS_PREFIX = "Docs (project-root relative, declared by this project's PROJECT-MANIFEST.json docRoot):"
const TMP = []
const mktmp = (tag) => {
  const d = mkdtempSync(join(tmpdir(), `p27-${tag}-`))
  TMP.push(d)
  return d
}
process.on("exit", () => {
  for (const d of TMP) {
    try { rmSync(d, { recursive: true, force: true }) } catch { /* 清理失败不覆盖判定 */ }
  }
})

/** 夹具项目：可选 manifest 内容 + 一条真批档。`manifest === undefined` ⇒ 不建 manifest 档。 */
function project(tag, manifest) {
  const root = mktmp(tag)
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  if (manifest !== undefined) writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifest)
  const batchDoc = join(root, "docs/batches/x.md")
  writeFileSync(batchDoc, "# batch\n")
  return { root, batchDoc }
}

const PROVIDER = { name: "fixture", model: "fixture-model", apiKey: "fixture-key" }
const CTX = (agent, depth = 0) => ({ depth, agent, callbacks: {}, signal: null, onPermissionRequest: async () => true })

/** 父 agent（真 `createAgent`——零网络：夹具从不驱跑子代理）。 */
function parentOf(root, role = null) {
  const parent = createAgent({
    provider: PROVIDER, tools: [], config: { agent: { engineering: true } },
    cwd: root, memory: null, overlay: "", role,
  })
  parent.autoApprove = true
  parent._subAgentCounter = 0
  return parent
}

/** 工程角色一发（真装配）⇒ 返回 `_spawnSystemBlock`。 */
function designerBlock({ root, batchDoc }) {
  const parent = parentOf(root)
  const built = buildSpawnChild(parent, CTX(parent), { role: "eng-designer", async: false, batchDoc, round: "initial" }, "eng-designer", false, [], [], null)
  return built.child._spawnSystemBlock ?? ""
}

const docsLineOf = (block) => String(block ?? "").split("\n").find((l) => l.startsWith(DOCS_PREFIX)) ?? null

// ── AC-DC-1 ∥ 用例 1：夹具 F1 逐字 ─────────────────────────────────────────────
test("AC-DC-1 夹具 F1 ⇒ Docs 行逐字等于契约 ② 的示例串，且是固块末行、项目根相对", () => {
  const f1 = project("f1", JSON.stringify({
    version: 1,
    phase: "initial-dev",
    docRoot: {
      requirements: "docs/requirements",
      design: ["docs/core/design", "docs/vsc/design"],
      batches: "docs/batches",
    },
  }, null, 2))
  const block = designerBlock(f1)
  const EXPECTED = `${DOCS_PREFIX} requirements = docs/requirements · design = docs/core/design, docs/vsc/design · batches = docs/batches`
  assert.equal(docsLineOf(block), EXPECTED, "Docs 行须逐字等于契约 ② 的示例串（同层 `, ` 并列 / 层间 ` · `）")
  assert.ok(block.endsWith(`\n\n${EXPECTED}`), "Docs 行须追加在既有三块之后（固块末行）")
  // 项目根相对：行里不得出现夹具的绝对根、也不得出现盘符形
  assert.ok(!docsLineOf(block).includes(f1.root), "坐标不得是绝对路径")
  assert.ok(!/[A-Za-z]:[\\/]/.test(docsLineOf(block)), "坐标不得带盘符")
})

// ── 用例 2：根数与形无关 ────────────────────────────────────────────────────────
test("用例 2 同一夹具把 design 改回单串 ⇒ 该层单路径，仍以 ` · ` 与邻层分隔", () => {
  const f = project("one", JSON.stringify({
    version: 1,
    phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", design: "docs/core/design", batches: "docs/batches" },
  }, null, 2))
  assert.equal(
    docsLineOf(designerBlock(f)),
    `${DOCS_PREFIX} requirements = docs/requirements · design = docs/core/design · batches = docs/batches`,
    "形 = 层 = 值，与根数无关",
  )
})

// ── AC-DC-2 ∥ 用例 3：缺子键（红侧一格）────────────────────────────────────────
test("AC-DC-2 缺 docRoot.design ⇒ (undeclared)，全文不含默认值 docs/design", () => {
  const raw = { version: 1, phase: "initial-dev", docRoot: { requirements: "docs/requirements", batches: "docs/batches" } }
  const f = project("nodefault", JSON.stringify(raw, null, 2))
  const block = designerBlock(f)
  assert.equal(
    docsLineOf(block),
    `${DOCS_PREFIX} requirements = docs/requirements · design = (undeclared) · batches = docs/batches`,
    "缺键那层须明写未声明",
  )
  assert.ok(!block.includes("docs/design"), `默认路径不得被打成声明（块里出现了 docs/design）：${docsLineOf(block)}`)
  // 红侧对照：同一个原始档经补默认给的正是被禁的那条路径——两处读数相左，判别才不是同义反复
  assert.equal(fillDefaults(raw).docRoot.design, "docs/design", "补默认确实会给出 docs/design（本节挡的就是它）")
})

// ── AC-DC-3 ∥ 用例 4：显式「本面无」（红侧二格）────────────────────────────────
test("AC-DC-3 docRoot.batches = null ⇒ (undeclared)", () => {
  const f = project("null", JSON.stringify({
    version: 1,
    phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", design: "docs/core/design", batches: null },
  }, null, 2))
  assert.equal(
    docsLineOf(designerBlock(f)),
    `${DOCS_PREFIX} requirements = docs/requirements · design = docs/core/design · batches = (undeclared)`,
    "显式本面无与缺键同呈现（docRootPaths(null) = []）",
  )
})

// ── 契约 ③ 整键格：三层皆按未声明（不另设分支）──────────────────────────────────
test("契约 ③ 整键格 docRoot 整键缺 ∥ 非对象 ⇒ 三层皆 (undeclared)", () => {
  const allUndeclared = `${DOCS_PREFIX} requirements = (undeclared) · design = (undeclared) · batches = (undeclared)`
  const noKey = project("nodocroot", JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  assert.equal(docsLineOf(designerBlock(noKey)), allUndeclared, "整键缺 ⇒ 三层皆未声明")
  const wrongShape = project("badshape", JSON.stringify({ version: 1, phase: "initial-dev", docRoot: "docs" }, null, 2))
  assert.equal(docsLineOf(designerBlock(wrongShape)), allUndeclared, "整键非对象 ⇒ 同一判据（该函数只推整键名）")
})

// ── AC-DC-4 红侧三格：读不出 ⇒ 不推块，spawn 照常 ──────────────────────────────
test("AC-DC-4 红侧一格 ∥ 用例 5：无 manifest 档 ⇒ spawn 正常返回，块内无 Docs (", () => {
  const f = project("nofile", undefined)
  // 前置读数：夹具所在环境确实「无档」（祖链上也没有 manifest）——否则本格测的不是它想测的那一格
  assert.equal(readManifest(f.root).reason, "missing", "夹具须处于「无档」态（临时目录祖链上无 PROJECT-MANIFEST.json）")
  const block = designerBlock(f)
  assert.ok(!block.includes("Docs ("), `读不出不得推块：${block}`)
  assert.ok(block.includes("Batch record (batchDoc):"), "spawn 照常（其余固块照推）")
})

test("AC-DC-4 红侧二格 ∥ 用例 6：manifest 坏 JSON ⇒ 同上", () => {
  const f = project("badjson", "{ this is not json")
  assert.equal(readManifest(f.root).reason, "invalid", "夹具须处于「坏档」态")
  const block = designerBlock(f)
  assert.ok(!block.includes("Docs ("), `坏档不得推块：${block}`)
  assert.ok(block.includes("Batch record (batchDoc):"), "spawn 照常")
})

test("AC-DC-4 红侧三格：manifest 读抛（档路径是目录 ⇒ EISDIR）⇒ 同上，不赔掉一次 spawn", () => {
  const f = project("throw", undefined)
  mkdirSync(join(f.root, "PROJECT-MANIFEST.json")) // 非 ENOENT 读错：readManifest fail-closed 上抛
  assert.throws(() => readManifest(f.root), /EISDIR|EACCES|EPERM|illegal operation/i, "夹具须真的让读档抛错（否则本格测不到 catch 支）")
  const block = designerBlock(f) // 不抛 ⇒ 装配点收住了
  assert.ok(!block.includes("Docs ("), `读抛不得推块：${block}`)
  assert.ok(block.includes("Batch record (batchDoc):"), "spawn 照常")
})

// ── AC-DC-5 甲 ∥ 用例 7：工程角色 + files ──────────────────────────────────────
test("AC-DC-5 甲 eng-designer + files ⇒ 批档行（首）→ 写域行 → Docs 行（末），无审计块", () => {
  const f = project("alpha", JSON.stringify({
    version: 1, phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", design: "docs/core/design", batches: "docs/batches" },
  }, null, 2))
  const parent = parentOf(f.root)
  const files = [join(f.root, "a.mjs"), join(f.root, "b.mjs")]
  const built = buildSpawnChild(parent, CTX(parent), { role: "eng-designer", async: false, batchDoc: f.batchDoc, round: "initial" }, "eng-designer", false, files, [], null)
  const block = built.child._spawnSystemBlock ?? ""
  const iBatch = block.indexOf("Batch record (batchDoc):")
  const iFiles = block.indexOf("Files declared for this spawn")
  const iDocs = block.indexOf(DOCS_PREFIX)
  assert.ok(iBatch === 0, `批档行须为首块：${block.slice(0, 120)}`)
  assert.ok(iFiles > iBatch, "写域行须在批档行之后（零换序）")
  assert.ok(iDocs > iFiles, "Docs 行须在写域行之后（追加在既有三块之尾）")
  assert.ok(!block.includes("[Audit scope — mechanical context"), "工程角色一发不含审计块")
  assert.ok(block.includes(`- ${files[0]}`) && block.includes(`- ${files[1]}`), "写域行原文零改（两条都在）")
})

// ── AC-DC-5 乙 ∥ 用例 8：审计子代理 + files ────────────────────────────────────
// ⚠ 判读口径：审计块模板**自身**带 `Batch record (batchDoc): <abs>` 一句（`thincoder-core/agent-tools/audit-block.mjs`
// 无条件拼入，本批明令既有三块零改）。故「块内无 `Batch record (batchDoc):`」按**块**读——没有独立的
// 批档行块；该串以审计块内那一句的形式存在，是既有的、不是本批新增的一块。
test("AC-DC-5 乙 eng-coder 父下 explore + files ⇒ 审计块（首）→ 写域行 → Docs 行（末），无独立批档行块", () => {
  const f = project("beta", JSON.stringify({
    version: 1, phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", design: "docs/core/design", batches: "docs/batches" },
  }, null, 2))
  const parent = parentOf(f.root, "eng-coder")
  parent._batchDoc = f.batchDoc
  // 真门取得审计尝试号（判据单源 = `gateEngCoderSpawn`；真实调用点同样把它传进 buildSpawnChild）
  const attempt = gateEngCoderSpawn(parent, 1, "explore", false)
  assert.equal(typeof attempt, "number", "eng-coder 父下的 explore 须走审计路径")
  const files = [join(f.root, "c.mjs")]
  const built = buildSpawnChild(
    parent, CTX(parent, 1),
    { role: "explore", goal: "g", knownFacts: "k", scope: "s", acceptance: "a", reportFormat: "r", async: false },
    "explore", false, files, [], attempt,
  )
  const block = built.child._spawnSystemBlock ?? ""
  const iAudit = block.indexOf("[Audit scope — mechanical context")
  const iFiles = block.indexOf("Files declared for this spawn")
  const iDocs = block.indexOf(DOCS_PREFIX)
  assert.ok(iAudit === 0, `审计块须为首块：${block.slice(0, 120)}`)
  assert.ok(iFiles > iAudit, "写域行须在审计块之后")
  assert.ok(iDocs > iFiles, "Docs 行须为末块")
  // 无独立批档行块：整块不以该串开头，且该串唯一出现位置在审计块内（写域块起点之前）
  assert.ok(!block.startsWith("Batch record (batchDoc):"), "审计一发不得推批档行块（batchBound 为假）")
  assert.equal(block.split("Batch record (batchDoc):").length - 1, 1, "该串只出现一次——即审计块模板里那一句")
  const iMarker = block.indexOf("Batch record (batchDoc):")
  assert.ok(iMarker > iAudit && iMarker < iFiles, "该串住在审计块内（首块内、写域块之前），不是独立一块")
  assert.ok(block.includes(`- ${files[0]}`), "写域行原文零改（那一条在）")
})

// ── 既有块零改的兜底读数：Docs 块只加不改 ──────────────────────────────────────
test("零回归：Docs 块恒为末块的单行，不吸收、不改写前三块的文本", () => {
  const f = project("regress", JSON.stringify({
    version: 1, phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", design: "docs/core/design", batches: "docs/batches" },
  }, null, 2))
  const parent = parentOf(f.root)
  const built = buildSpawnChild(parent, CTX(parent), { role: "eng-designer", async: false, batchDoc: f.batchDoc, round: "initial" }, "eng-designer", false, [join(f.root, "a.mjs")], [], null)
  const block = built.child._spawnSystemBlock ?? ""
  const tail = `\n\n${DOCS_PREFIX} requirements = docs/requirements · design = docs/core/design · batches = docs/batches`
  assert.ok(block.endsWith(tail), "Docs 块 = 整块末行，长度不受 trio 影响")
  const withoutDocs = block.slice(0, block.length - tail.length)
  assert.ok(withoutDocs.startsWith("Batch record (batchDoc):"), "去掉 Docs 块后即改前形态（既有三块逐字未动）")
  assert.deepEqual(readdirSync(f.root).sort(), ["PROJECT-MANIFEST.json", "docs"], "零副作用：装配只读盘、不落盘")
})
