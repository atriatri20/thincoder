// thincoder-core/test/advisor-project-context.test.mjs — FR42 批内单元用例（AC-48 / AC-49）
import test from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { NO_DOC_MAP_NOTICE, NO_STANDARDS_NOTICE, findDocumentMap, injectDocumentMap, injectProjectStandards } from "../advisor/project-context.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, "../..")

/** 五键 manifest（docRoot 用默认五路径——Document Map 的派生源就是它，没有 advisor 键）。 */
const MANIFEST = {
  version: 1,
  phase: "initial-dev",
  docRoot: {
    requirements: "docs/requirements",
    specs: "docs/requirements/specs",
    design: "docs/design",
    modules: "docs/design/modules",
    batches: "docs/batches",
  },
  codePaths: ["src"],
  index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos: [] },
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "advisor-project-context-"))
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify(MANIFEST, null, 2) + "\n")
  return root
}

const withFixture = (fn) => { const root = fixture(); try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) } }
const write = (root, p, text) => { const abs = join(root, p); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, text) }

test("AC-48① · 声明根下有 README ⇒ 注入该档（声明序 design 先）", () => withFixture((root) => {
  write(root, "docs/design/README.md", "# 设计层地图\n")
  write(root, "docs/README.md", "# 公共祖先前的地图\n")
  assert.equal(findDocumentMap(root), join(root, "docs/design/README.md"))
  const parts = []
  assert.equal(injectDocumentMap({ cwd: root }, parts, root), join(root, "docs/design/README.md"))
  assert.ok(parts.includes("# 设计层地图\n"), "档内容入消息")
  assert.equal(parts.includes("## Document Map"), true)
}))

test("AC-48② · 声明根皆无 ⇒ 公共祖先 README（本仓落点 docs/README.md）", () => withFixture((root) => {
  write(root, "docs/README.md", "# 文档地图\n")
  assert.equal(findDocumentMap(root), join(root, "docs/README.md"))
  const parts = []
  assert.equal(injectDocumentMap({ cwd: root }, parts, root), join(root, "docs/README.md"))
}))

test("AC-48③ · 两级皆无 ⇒ 显式降级句（零静默）", () => withFixture((root) => {
  assert.equal(findDocumentMap(root), null)
  const parts = []
  assert.equal(injectDocumentMap({ cwd: root }, parts, root), null)
  assert.ok(parts.includes(NO_DOC_MAP_NOTICE), "降级句在场")
}))

test("AC-48 · standards 面恒为显式降级（无声明支、段仍在）", () => withFixture((root) => {
  const parts = []
  assert.equal(injectProjectStandards({ cwd: root }, parts, root), null)
  assert.ok(parts.includes("## Project Standards"), "段仍注入（评审知道这一维没查）")
  assert.ok(parts.includes(NO_STANDARDS_NOTICE), "降级句在场")
}))

test("AC-48 · 本仓实跑：map 落到 docs/README.md（默认 docRoot 派生，不靠 advisor 声明）", () => {
  const map = findDocumentMap(REPO)
  assert.equal(map, join(REPO, "docs", "README.md"))
  assert.equal(relative(REPO, map).replace(/\\/g, "/"), "docs/README.md")
})

test("AC-49 · project-context.mjs ∥ declaration.mjs：docMap / standardsDoc 读取分支零残留", () => {
  for (const f of ["advisor/project-context.mjs", "declaration.mjs"]) {
    const text = readFileSync(join(REPO, "thincoder-core", f), "utf8")
    for (const token of ["docMap", "standardsDoc", "?.advisor", "conv.advisor"]) {
      assert.equal(text.includes(token), false, `${f} 仍有：${token}`)
    }
  }
})
