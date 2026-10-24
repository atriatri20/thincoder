// thincoder-core/test/manifest-five-keys.test.mjs — FR42 批内单元用例（AC-45 / AC-46）
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { DEFAULT_MANIFEST, MANIFEST_SCHEMA, validateManifest } from "../manifest-schema.mjs"
import { readManifest, writeManifest } from "../manifest.mjs"

const FIVE = ["version", "phase", "docRoot", "codePaths", "index"]
const RETIRED = ["promptsLanding", "checkConfig", "advisor"]

/** 旧档夹具：五键 + 三个已退场键（其余合法——未知键非拒）。 */
function oldManifest() {
  return {
    version: 1,
    phase: "initial-dev",
    docRoot: {
      requirements: "docs/requirements",
      specs: "docs/requirements/specs",
      design: "docs/design",
      modules: "docs/design/modules",
      batches: "docs/batches",
    },
    promptsLanding: "thincoder-core/prompts",
    checkConfig: {}, // 旧档的已退场键：内容无人读（退场键整支不判），只证「未知键非拒」
    codePaths: ["src"],
    index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos: [] },
    advisor: { docMap: "", standardsDoc: "" },
  }
}

test("AC-45 · DEFAULT_MANIFEST 恰五键；MANIFEST_SCHEMA.keys 同集；nestedKeys 恰两族", () => {
  assert.deepEqual(Object.keys(DEFAULT_MANIFEST).sort(), [...FIVE].sort(), "默认档键集")
  assert.deepEqual([...MANIFEST_SCHEMA.keys].sort(), [...FIVE].sort(), "schema 键集 = 默认档键集（派生零改）")
  assert.deepEqual(Object.keys(MANIFEST_SCHEMA.nestedKeys).sort(), ["docRoot", "index"], "嵌套族恰两族")
  assert.deepEqual([...MANIFEST_SCHEMA.nestedKeys.docRoot].sort(), ["batches", "design", "modules", "requirements", "specs"])
  assert.deepEqual([...MANIFEST_SCHEMA.nestedKeys.index].sort(), ["codeExtensions", "docExtensions", "excludePaths", "publicRepos"])
  for (const gone of RETIRED) assert.equal(gone in DEFAULT_MANIFEST, false, `退场键仍在默认档：${gone}`)
  // 可写节点 12 = 整键 3 + docRoot 5 + index 4（写面白名单的计数源）
  assert.equal(MANIFEST_SCHEMA.keys.length - Object.keys(MANIFEST_SCHEMA.nestedKeys).length
    + Object.values(MANIFEST_SCHEMA.nestedKeys).reduce((n, subs) => n + subs.length, 0), 12)
})

test("AC-46 · 旧档残留三键 ⇒ ok:true + unknownKeys 含三名；write 一轮后档内三名消失", () => {
  const root = mkdtempSync(join(tmpdir(), "manifest-five-"))
  try {
    const file = join(root, "PROJECT-MANIFEST.json")
    writeFileSync(file, JSON.stringify(oldManifest(), null, 2) + "\n")
    const read = readManifest(root)
    assert.equal(read.ok, true, `旧档不得被拒：${(read.errors ?? []).join("；")}`)
    assert.deepEqual([...read.unknownKeys].sort(), [...RETIRED].sort(), "三名逐字进 unknownKeys")
    for (const gone of RETIRED) assert.equal(gone in read.manifest, false, `回填后仍带退场键：${gone}`)
    // 未知键语义零改的一侧：validateManifest 本身仍 ok（非拒）
    assert.equal(validateManifest(oldManifest()).ok, true)

    writeManifest(root, read.manifest, { writer: "main" })
    const text = readFileSync(file, "utf8")
    for (const gone of RETIRED) assert.equal(text.includes(`"${gone}"`), false, `写一轮后档内仍有：${gone}`)
    assert.deepEqual(Object.keys(JSON.parse(text)).sort(), [...FIVE].sort(), "写后档恰五键")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
