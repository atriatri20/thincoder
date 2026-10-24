// thincoder-core/test/doc-check-scope.test.mjs — 本批批内用例（FR42：范围 = 传入清单 · 解析两级）
import test from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { runDocCheck } from "../doc-check/index.mjs"
import { docCheckTool } from "../agent-tools/doc-check.mjs"

/** 夹具：五键 manifest（**无**退场键 / 无参数声明面）
 *  docs/deep/common.md   含一条指向不存在档的指针（命中源；token 用 absent-doc.md）
 *  docs/clean.md         干净一档（无指针）
 *  docs/bare.md         以裸名引用 docs/deep/common.md（跨目录裸名 ⇒ 现口径报 档缺）
 *  docs/canary.md        含悬空指针（不在任何清单内——证「只判传入档」）
 *  不可判档样本：outside/other.md（在盘 · 可判） · docs/notes.txt（非 .md） · docs/deep（目录） */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "doc-check-scope-"))
  const w = (rel, text = "") => {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, text)
  }
  w("PROJECT-MANIFEST.json", JSON.stringify({
    version: 1,
    phase: "initial-dev",
    docRoot: { requirements: "docs/requirements", specs: "docs/requirements/specs", design: "docs/design", modules: "docs/design/modules", batches: "docs/batches" },
    codePaths: ["src"],
    index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos: [] },
  }, null, 2) + "\n")
  w("docs/deep/common.md", "# 手册\n\n见 absent-doc.md 一节。\n")
  w("docs/bare.md", "# 裸名\n\n见 common.md 的说明。\n")
  w("docs/clean.md", "# 笔记\n\n干净一档。\n")
  w("docs/canary.md", "# 哨兵\n\n见 canary-absent.md。\n")
  w("outside/other.md", "# 域外\n")
  w("docs/notes.txt", "非 markdown\n")
  return root
}
const withFixture = (fn) => { const root = fixture(); try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) } }

test("DS-201 · report + docs 只判清单内档（哨兵不判）", () => withFixture((root) => {
  const scoped = runDocCheck(root, { docs: ["docs/clean.md"] }).report
  assert.match(scoped, /^范围：传入清单 1 档（整档入判 · 判定范围 = 解析范围）$/m)
  assert.match(scoped, /^命中 0 条（锚 0 · 行宽 0）$/m)
  assert.doesNotMatch(scoped, /canary/, "未传入的哨兵不入判")
}))

test("DS-202 · report + docs 给有问题的档 ⇒ 命中", () => withFixture((root) => {
  const scoped = runDocCheck(root, { docs: ["docs/deep/common.md"] }).report
  assert.match(scoped, /^命中 1 条（锚 1 · 行宽 0）$/m)
  assert.match(scoped, /✗ 锚·档缺 docs\/deep\/common\.md:3 `absent-doc\.md`/)
}))

test("DS-203 · 不可判档（缺档 ∥ 非 markdown ∥ 目录）⇒ 报错点名，零判定", () => withFixture((root) => {
  assert.throws(() => runDocCheck(root, { docs: ["docs/missing-file.md"] }), /docs\/missing-file\.md（not on disk）/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/notes.txt"] }), /docs\/notes\.txt（not a markdown document）/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/deep"] }), /docs\/deep（not a markdown document）/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/notes.txt"] }), (e) => !/notes\.txt（not on disk）/.test(String(e)))
}))

test("DS-204 · 清单必填：不给 ∥ [] ∥ 非数组 ∥ 非字符串条目 ⇒ 报错（无全域兜底、无静默收窄）", () => withFixture((root) => {
  assert.throws(() => runDocCheck(root), /`docs` is required/)
  assert.throws(() => runDocCheck(root, { docs: [] }), /docs is empty/)
  assert.throws(() => runDocCheck(root, { docs: "docs/clean.md" }), /`docs` must be an array of paths/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/clean.md", 42] }), /`docs` entries \[1\] are not paths/)
}))

test("DS-205 · gate 面：域内档 + 缺档 ∥ 非 markdown ⇒ 跳过行在场、首行逐字", () => withFixture((root) => {
  const out = runDocCheck(root, { mode: "gate", docs: ["docs/clean.md", "docs/missing-file.md", "docs/notes.txt"], docsSource: "explicit" }).report
  assert.equal(out.split("\n")[0], "DOC-CHECK GATE: PASS")
  assert.match(out, /^范围：显式 docs 1 档 · 阈值 300 字符（工具内置常量）$/m)
  assert.ok(out.includes("跳过 1 档（已不在盘，未检）：docs/missing-file.md"))
  assert.ok(out.includes("跳过 1 档（非 markdown 档，未检）：docs/notes.txt"))
  assert.ok(out.includes("结论：0 条命中（1 档全清）"))
}))

test("DS-206 · gate 面：清单为空 ⇒ PASS（0 档）+「0 档受检」明写（不得读成「已检」）", () => withFixture((root) => {
  const out = runDocCheck(root, { mode: "gate", docs: [], docsSource: "session" }).report
  assert.equal(out.split("\n")[0], "DOC-CHECK GATE: PASS（0 档）")
  assert.ok(out.includes("0 档受检"), "空范围必须明写「0 档受检」")
  assert.ok(out.includes("范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs"), "零触达不写「见上方跳过行」")
  // 触达过但全被跳过 ⇒ 另一支措辞（跳过行在上方，在场）
  const skippedOnly = runDocCheck(root, { mode: "gate", docs: ["docs/missing-file.md"], docsSource: "session" }).report
  assert.equal(skippedOnly.split("\n")[0], "DOC-CHECK GATE: PASS（0 档）")
  assert.ok(skippedOnly.includes("跳过 1 档（已不在盘，未检）：docs/missing-file.md"))
  assert.ok(skippedOnly.includes("范围为空：本会话触达的档均不可判（见上方跳过行）——若确认改过 ⇒ 显式传 docs"))
  const explicit = runDocCheck(root, { mode: "gate", docs: [], docsSource: "explicit" }).report
  assert.equal(explicit.split("\n")[0], "DOC-CHECK GATE: PASS（0 档）")
  assert.ok(explicit.includes("0 档受检"))
  assert.ok(explicit.includes("范围为空：显式 docs 是空清单——列出要判的档后复跑"), "空清单不指向不存在的跳过行")
}))

test("DS-207 · 裸名不跨目录解析：清单档引用别的目录的档 ⇒ 档缺（旧全域索引面已退场）", () => withFixture((root) => {
  const r = runDocCheck(root, { docs: ["docs/bare.md"] })
  assert.match(r.report, /✗ 锚·档缺 docs\/bare\.md:3 `common\.md`/)
}))

test("DS-208 · docs 非数组 ⇒ 明确拒（工具面 ∥ 引擎面），不落全域", () => withFixture((root) => {
  const viaTool = docCheckTool.execute({ docs: "docs/clean.md" }, { agent: { cwd: root } })
  assert.match(viaTool, /^doc_check: `docs` must be an array of paths \(got string\)/)
  assert.doesNotMatch(viaTool, /文档纪律机检/)
  assert.throws(() => runDocCheck(root, { docs: "docs/clean.md" }), /`docs` must be an array of paths/)
}))

test("DS-209 · 工具面 report 模式不给 docs ⇒ 明确报错（不退回全域）", () => withFixture((root) => {
  const viaTool = docCheckTool.execute({}, { agent: { cwd: root } })
  assert.match(viaTool, /^doc_check: `docs` is required in report mode/)
  assert.doesNotMatch(viaTool, /文档纪律机检/)
}))
