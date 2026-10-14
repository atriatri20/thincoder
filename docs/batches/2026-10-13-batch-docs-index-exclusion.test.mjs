/**
 * 2026-10-13-batch-docs-index-exclusion.test.mjs — 批次档面默认排除批（台账 #1366）批次本地单元件。
 * 批档 = `docs/batches/2026-10-13-batch-docs-index-exclusion.md`（§2 用例表 #1–#6 = 本件六例；判据腿 L-⑦-1–5）。
 * 名随批次档 · 住批次目录 · 不进仓套件；复跑（从仓库根 `thincoder/`）：
 *   node --test docs/batches/2026-10-13-batch-docs-index-exclusion.test.mjs
 * 数据面纪律：只用夹具 ∥ 沙箱库（tmp）——真库（`~/.thincoder/memory.db`）零触碰（`node --test`
 * 进程 NODE_TEST_CONTEXT ⇒ `logEvent` 不落盘——`log.mjs` writeEnabled）。
 * embedding 桩：`embedding.mjs` 经模块钩子短接到确定性桩（零网络——#6 向量支判别面）。
 *
 * 腿（用例表 # → 判据腿）：
 *   #1 双径零收录 + 检索零命中 + 参照等值 + reindexFile/gitSync 缝 + 保护位（L-⑦-2 ∥ L-⑦-3 半 ∥ L-⑦-4）
 *   #2 工作区根开法（无 manifest；rel = `thincoder/docs/batches/x.md`）——任意深度段序（L-⑦-1）
 *   #3 自定义 ∥ `null` ∥ 数组 ∥ `.`/`..` 值 + 投影（L-⑦-5 ∥ L-⑦-1 联合口径）
 *   #4 干扰树照收（段边界不吞）+ 面① 零回归锚（L-⑦-1）
 *   #5 非法 manifest 回默认声明（坏 JSON ∥ 形态错——零抛）（error）
 *   #6 沙箱库读面：批次档行 ∥ `index.excludePaths` 命中行即时零命中 ∥ 非命中可见 ∥ 参照等值
 *      ∥ origin 覆盖参两态 ∥ 向量支 ∥ 多 origin 支（L-⑦-3 全谓词腿）
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url)) // 仓根（docs/batches 两层深）
const coreUrl = (rel) => pathToFileURL(join(ROOT, "thincoder-core", rel)).href

// ─── embedding 桩（零网络；向量确定：一切向量 = 同一单位向量——#6 判别面）────────────────────

const PROBE_DIM = 32
const PROBE_UNIT = 1 / Math.sqrt(PROBE_DIM)
const EMBED_REAL = coreUrl("embedding.mjs")
const EMBED_STUB = "data:text/javascript," + encodeURIComponent(`
export function cosine(a, b) { let s = 0; const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) s += a[i] * b[i]; return s }
export function toBlob(vec) { return Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength) }
export function fromBlob(buf) { if (buf.byteOffset % 4 !== 0) buf = new Uint8Array(buf); if (buf.byteLength % 4 !== 0) return new Float32Array(0); return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4) }
export async function embed(embedder, texts) { return texts.map(() => new Float32Array(${PROBE_DIM}).fill(${PROBE_UNIT})) }
export function createEmbedder(config) { return { baseURL: config?.baseURL ?? "stub://", apiKey: "stub", model: config?.model ?? "stub-model" } }
export async function embedTolerant(embedder, texts, opts = {}) { return { vectors: await embed(embedder, texts, opts), skipped: [] } }
`)
registerHooks({
  resolve(specifier, context, next) {
    const r = next(specifier, context)
    if (r?.url === EMBED_REAL) return { url: EMBED_STUB, shortCircuit: true }
    return r
  },
})

const emb = await import(coreUrl("embedding.mjs")) // ⇒ 桩（toBlob 用）
const schemaMod = await import(coreUrl("memory/schema.mjs"))
const conv = await import(coreUrl("conventions.mjs"))
const fileListMod = await import(coreUrl("memory/file-list.mjs"))
const codeSyncMod = await import(coreUrl("memory/code-sync.mjs"))
const docsMod = await import(coreUrl("memory/docs.mjs"))
const codeSearchMod = await import(coreUrl("memory/code-search.mjs"))
const originMod = await import(coreUrl("memory/origin.mjs"))

const { createMemory } = schemaMod
const { normalizeOrigin } = originMod
const { isExcludedRelPath, loadProjectDeclaration, clearDeclarationCache } = conv
const { listProjectFiles } = fileListMod

// ─── 夹具工具 ────────────────────────────────────────────────────────────────

const DIRS = []
const sandbox = (tag) => { const d = mkdtempSync(join(tmpdir(), `bde-${tag}-`)); DIRS.push(d); return d }
after(() => { for (const d of DIRS) { try { rmSync(d, { recursive: true, force: true, maxRetries: 3 }) } catch { /* 尽力清理 */ } } })

const mkFile = (dir, rel, text) => {
  const p = join(dir, ...rel.split("/"))
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, text)
  return p
}
const writeManifest = (dir, obj) => {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "PROJECT-MANIFEST.json"), JSON.stringify(obj, null, 2))
  clearDeclarationCache()
}
const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
const mtimeOf = (p) => Math.floor(statSync(p).mtimeMs)
const rels = (entries) => entries.map((e) => e.rel.replace(/\\/g, "/")).sort()
/** 行快照（含 embedding 的 base64——逐键对比用；不落网络 ∥ 不落 fs）。 */
const snap = (db, table) => db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
  .map((r) => JSON.stringify({ ...r, embedding: r.embedding ? Buffer.from(r.embedding).toString("base64") : null }))
const countOf = (db, table, origin, like) => Number(db.prepare(
  `SELECT COUNT(*) AS n FROM ${table} WHERE origin = ? AND path LIKE ?`).get(origin, like).n)
const rowsOfPath = (db, table, origin, path) => db.prepare(
  `SELECT * FROM ${table} WHERE origin = ? AND path = ? ORDER BY line_start`).all(origin, path)
  .map((r) => JSON.stringify({ ...r, embedding: r.embedding ? Buffer.from(r.embedding).toString("base64") : null }))
const embBlob = () => emb.toBlob(new Float32Array(PROBE_DIM).fill(PROBE_UNIT))
const insDoc = (db, origin, path, mtime, content, { heading = "" } = {}) =>
  db.prepare(`INSERT INTO doc_chunks (origin, path, language, heading, content, line_start, line_end, mtime_ms, embedding, seg_content) VALUES (?, ?, 'markdown', ?, ?, 1, 1, ?, ?, ?)`)
    .run(origin, path, heading, content, mtime, embBlob(), content)
const insCode = (db, origin, path, mtime, content, { symbol = "" } = {}) =>
  db.prepare(`INSERT INTO code_chunks (origin, path, language, chunk_type, symbol_name, content, line_start, line_end, mtime_ms, embedding, seg_content) VALUES (?, ?, 'javascript', 'file', ?, ?, 1, 1, ?, ?, ?)`)
    .run(origin, path, symbol, content, mtime, embBlob(), content)
const captureWarn = async (fn) => {
  const lines = []
  const orig = console.warn
  console.warn = (...a) => lines.push(a.map(String).join(" "))
  try { return { value: await fn(), lines } } finally { console.warn = orig }
}
/** 业务可观察面（工具输出面——rowid ∥ bm25 rank 为内部值，不作等值判据：FTS-only 路原样返 FTS 行）。 */
const observable = (rows) => rows.map((r) => ({
  path: r.path, language: r.language, heading: r.heading ?? null, symbol: r.symbol_name ?? null,
  content: r.content, line_start: r.line_start, line_end: r.line_end, score: r._score ?? null,
}))

// ───────────────────────── #1 双径零收录 + 检索零命中 + 缝 + 保护位 ─────────────────────────

test("#1 双径零收录 + 检索零命中 + 参照等值 + 缝 + 保护位（L-⑦-2 ∥ L-⑦-3 半 ∥ L-⑦-4）", async () => {
  const base = sandbox("t1")
  const proj = join(base, "proj")
  // 夹具：批次档面（含子树批量档——剪枝判别面）∥ 干扰三树 ∥ 留存面
  mkFile(proj, "docs/batches/x.md", "# BatchRecord\nbatchonlytoken body\n")
  mkFile(proj, "docs/batches/sub/y.md", "# Nested\nbatchonlytoken nested\n")
  for (let i = 0; i < 40; i++) mkFile(proj, `docs/batches/bulk/f${i}.md`, "# bulk\nbatchonlytoken bulk\n")
  mkFile(proj, "docs/guide.md", "# Guide\nkeepdoctoken body\n")
  mkFile(proj, "src/a.mjs", "// keepcodetoken\nexport const a = 1\n")
  mkFile(proj, "docs/batchlog/z.md", "# batchlog\nfenceone\n")
  mkFile(proj, "docsX/batches/z.md", "# docsX\nfencetwo\n")
  mkFile(proj, "batches/z.md", "# bare\nfencethree\n")
  writeManifest(proj, { index: { excludePaths: [] } })
  const exts = new Set([".md", ".mjs"])
  const KEEP = ["batches/z.md", "docs/batchlog/z.md", "docs/guide.md", "docsX/batches/z.md", "src/a.mjs"]

  // ① walk 径（非 git）：剪枝形——批次子树零展开（40 档 > maxFiles ⇒ 未剪枝必截断）
  const walked = await listProjectFiles(proj, exts, { maxFiles: 10 })
  assert.equal(walked.truncated, false, "批次子树零展开（未耗 MAX_WALK_FILES 预算——剪枝形）")
  assert.deepEqual(rels(walked.entries), KEEP, "walk 径：批次档面零收录 ∥ 干扰树照收")

  // ② git 径（ls-files）：同树 init 后复跑——逐字同集（excludes 隔离防宿主 ignore 隐去留存面）
  git(proj, ["init", "-q"])
  const excludeFile = join(base, "empty-excludes")
  writeFileSync(excludeFile, "")
  git(proj, ["config", "core.excludesFile", excludeFile.replaceAll("\\", "/")])
  const listed = await listProjectFiles(proj, exts)
  assert.deepEqual(rels(listed.entries), KEEP, "git ∥ walk 同剪（逐字同集）")

  const origin = normalizeOrigin(proj)
  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = proj
  try {
    // ③ 全扫双写：批次档面零落行
    await codeSyncMod.codeSync(memory, proj)
    await docsMod.docSync(memory, proj)
    const paths = (t) => memory.db.prepare(`SELECT path FROM ${t}`).all().map((r) => r.path)
    assert.equal(paths("doc_chunks").filter((p) => p.startsWith("docs/batches/")).length, 0, "doc 零收录")
    assert.equal(paths("code_chunks").filter((p) => p.startsWith("docs/batches/")).length, 0, "code 零收录")
    assert.deepEqual([...new Set(paths("doc_chunks"))].sort(), ["batches/z.md", "docs/batchlog/z.md", "docs/guide.md", "docsX/batches/z.md"], "doc 面 = 留存面（干扰树照收）")
    assert.ok(paths("code_chunks").includes("src/a.mjs"), "code 面含留存档")

    // ④ 检索：批次档面零命中 ∥ 留存面命中且与「无批次档语料」参照逐字等值
    assert.equal((await docsMod.docSearch(memory, "batchonlytoken", { limit: 5 })).length, 0, "docSearch 批次档零命中")
    assert.equal((await codeSearchMod.codeSearch(memory, "batchonlytoken", { limit: 5 })).length, 0, "codeSearch 批次档零命中")
    const keepHits = await docsMod.docSearch(memory, "keepdoctoken", { limit: 5 })
    assert.deepEqual(keepHits.map((r) => r.path), ["docs/guide.md"], "doc 留存面命中")
    assert.deepEqual((await codeSearchMod.codeSearch(memory, "keepcodetoken", { limit: 5 })).map((r) => r.path), ["src/a.mjs"], "code 留存面命中")

    const projRef = join(base, "projRef") // 参照 = 无批次档/干扰树的同语料
    mkFile(projRef, "docs/guide.md", "# Guide\nkeepdoctoken body\n")
    mkFile(projRef, "src/a.mjs", "// keepcodetoken\nexport const a = 1\n")
    writeManifest(projRef, { index: { excludePaths: [] } })
    const ref = createMemory({ dbPath: join(base, "ref.db") })
    ref.codeOrigin = projRef
    try {
      await codeSyncMod.codeSync(ref, projRef)
      await docsMod.docSync(ref, projRef)
      assert.equal(JSON.stringify(observable(keepHits)), JSON.stringify(observable(await docsMod.docSearch(ref, "keepdoctoken", { limit: 5 }))), "doc 留存面结果 = 参照（逐字等值）")
      assert.equal(JSON.stringify(observable(await codeSearchMod.codeSearch(memory, "keepcodetoken", { limit: 5 }))),
        JSON.stringify(observable(await codeSearchMod.codeSearch(ref, "keepcodetoken", { limit: 5 }))), "code 留存面结果 = 参照（逐字等值）")
    } finally { ref.db.close() }

    // ⑤ 单文件缝（reindexFile）：批次档路径零写
    await codeSyncMod.reindexFile(memory, proj, join(proj, "docs", "batches", "x.md"))
    assert.equal(countOf(memory.db, "doc_chunks", origin, "docs/batches/%"), 0, "reindexFile 批次档路径零写")

    // ⑥ gitSync diff 缝：提交落锚 ⇒ 改批次档 + 改留存档 ⇒ 批次档零落行 ∥ 留存档更新
    git(proj, ["add", "-A"])
    git(proj, ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "init"])
    await codeSyncMod.codeSync(memory, proj)
    mkFile(proj, "docs/batches/x.md", "# BatchRecord\nbatchonlytoken v2\n")
    mkFile(proj, "src/a.mjs", "// keepcodetoken v2\nexport const a = 2\n")
    const gs = await codeSyncMod.gitSync(memory, proj)
    assert.ok(gs && gs.updated >= 1, "diff 缝走增量（留存档入更新）")
    assert.equal(countOf(memory.db, "doc_chunks", origin, "docs/batches/%"), 0, "diff 缝批次档零落行")
    assert.ok((await codeSearchMod.codeSearch(memory, "keepcodetoken", { limit: 5 })).some((r) => r.content.includes("v2")), "留存档经 diff 缝已更新")

    // ⑦ 保护位（L-⑦-4）：注入存量批次档行 ⇒ 全量同步不删不损 ∥ 非批次档行数逐字不变
    insDoc(memory.db, origin, "docs/batches/x.md", 1, "legacy batch record row")
    const injected = rowsOfPath(memory.db, "doc_chunks", origin, "docs/batches/x.md")
    assert.equal(injected.length, 1, "存量批次档行在册")
    const docCount = Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM doc_chunks`).get().n)
    const codeCount = Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM code_chunks`).get().n)
    await codeSyncMod.codeSync(memory, proj)
    await docsMod.docSync(memory, proj)
    assert.deepEqual(rowsOfPath(memory.db, "doc_chunks", origin, "docs/batches/x.md"), injected, "批次档存量行逐键等前值（收尾保护位短路）")
    assert.equal(Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM doc_chunks`).get().n), docCount, "非批次档路径行数逐字不变（doc）")
    assert.equal(Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM code_chunks`).get().n), codeCount, "非批次档路径行数逐字不变（code）")
  } finally { memory.db.close() }
})

// ───────────────────────── #2 工作区根开法（任意深度段序）─────────────────────────

test("#2 工作区根开法（无 manifest；rel = `thincoder/docs/batches/x.md`）——任意深度段序（L-⑦-1）", async () => {
  const base = sandbox("t2")
  const ws = join(base, "ws") // 工作区根（无 manifest——本会话 origin = 工作区根实测开法同形）
  mkFile(ws, "thincoder/docs/batches/x.md", "# batch\n")
  mkFile(ws, "thincoder/src/a.mjs", "export const a = 1\n")
  const decl = loadProjectDeclaration(ws)
  assert.equal(decl.root, ws, "无 manifest ⇒ 判基 = 会话锚（根起步调用面）")
  assert.deepEqual(decl.batchRecords.map((s) => [...s]), [], "声明值零序列（约定段恒在）")
  assert.equal(isExcludedRelPath("thincoder/docs/batches/x.md", decl, ws), true, "工作区根开法：任意深度段序命中")
  assert.equal(isExcludedRelPath("thincoder/docs/batches/x.md", decl), true, "缺省判基（rel 原样）同判")
  assert.equal(isExcludedRelPath("thincoder/src/a.mjs", decl, ws), false, "非批次档不命中")
  assert.equal(isExcludedRelPath("../outside/docs/batches/z.md", decl, ws), true, "越根 ⇒ 面⑥ 判原样 rel（不回退）")

  const listed = await listProjectFiles(ws, new Set([".md", ".mjs"]))
  assert.deepEqual(rels(listed.entries), ["thincoder/src/a.mjs"], "工作区根开法 listing：嵌套批次档零收录")
})

// ───────────────────────── #3 自定义 ∥ null ∥ 数组 ∥ `.`/`..` 值 ─────────────────────────

test("#3 自定义 ∥ `null` ∥ 数组 ∥ `.`/`..` 值 + 投影（L-⑦-5 ∥ L-⑦-1 联合口径）", () => {
  // ① 自定义串：新位置同罩 ∧ 旧约定位置仍罩 ∧ `declared` 旗零动
  const d1 = sandbox("t3a")
  writeManifest(d1, { docRoot: { batches: "notes/records" } })
  const c1 = loadProjectDeclaration(d1)
  assert.deepEqual(c1.batchRecords.map((s) => [...s]), [["notes", "records"]], "投影 = 声明值段序列")
  assert.equal(c1.declared, false, "docRoot 族不入 `declared` 旗（现状零改）")
  assert.equal(isExcludedRelPath("notes/records/x.md", c1, d1), true, "自定义新位置命中")
  assert.equal(isExcludedRelPath("a/notes/records/y.md", c1, d1), true, "任意深度命中")
  assert.equal(isExcludedRelPath("docs/batches/x.md", c1, d1), true, "旧约定位置仍罩（无条件）")
  assert.equal(isExcludedRelPath("notes/recordsx/x.md", c1, d1), false, "段边界不吞")
  assert.equal(isExcludedRelPath("notes/record/x.md", c1, d1), false, "段序列短缺不命中")

  // ② `null`：非逃生口（约定段恒在 ∥ 零附加目标）
  const d2 = sandbox("t3b")
  writeManifest(d2, { docRoot: { batches: null } })
  const c2 = loadProjectDeclaration(d2)
  assert.deepEqual(c2.batchRecords.map((s) => [...s]), [], "null ⇒ 零附加目标")
  assert.equal(isExcludedRelPath("docs/batches/x.md", c2, d2), true, "null 下约定段仍排除（非逃生口）")
  assert.equal(isExcludedRelPath("notes/records/x.md", c2, d2), false, "null 不引入新位置")

  // ③ 数组值：两序均罩 ∧ 约定段恒在
  const d3 = sandbox("t3c")
  writeManifest(d3, { docRoot: { batches: ["notes/records", "docs/archive"] } })
  const c3 = loadProjectDeclaration(d3)
  assert.equal(isExcludedRelPath("notes/records/x.md", c3, d3), true, "数组序 1 命中")
  assert.equal(isExcludedRelPath("docs/archive/y.md", c3, d3), true, "数组序 2 命中")
  assert.equal(isExcludedRelPath("docs/batches/x.md", c3, d3), true, "约定段恒在")

  // ④ `.`/`..` 段值：取剔除后实义段序列
  const d4 = sandbox("t3d")
  writeManifest(d4, { docRoot: { batches: "./notes/../records/" } })
  const c4 = loadProjectDeclaration(d4)
  assert.deepEqual(c4.batchRecords.map((s) => [...s]), [["notes", "records"]], "`.`/`..` 段剔除后实义序列")
  assert.equal(isExcludedRelPath("notes/records/x.md", c4, d4), true, "实义序列命中")

  // ⑤ 首段 `..` 值：剔除后失锚为余段序列（设计档 §6.14 面⑥ 规则「取实义段序列」之如实后果——已登记批次报告）
  const d5 = sandbox("t3e")
  writeManifest(d5, { docRoot: { batches: "../docs" } })
  const c5 = loadProjectDeclaration(d5)
  assert.deepEqual(c5.batchRecords.map((s) => [...s]), [["docs"]], "`..` 剔除 ⇒ 余段（单段）序列")
  assert.equal(isExcludedRelPath("a/docs/x.md", c5, d5), true, "单段序列任意深度命中（放宽后果如实断言）")
})

// ───────────────────────── #4 干扰树照收 ∥ 面① 零回归锚 ─────────────────────────

test("#4 干扰树照收（段边界不吞）+ 面① 零回归锚（L-⑦-1）", async () => {
  const base = sandbox("t4")
  const proj = join(base, "proj")
  writeManifest(proj, { index: { excludePaths: ["openclaw"] } }) // 面① 声明在场：面⑥ 不吞 ∥ 零回归
  const decl = loadProjectDeclaration(proj)
  for (const rel of ["docs/batches", "docs/batches/x.md", "a/docs/batches/b.md", "thincoder/docs/batches/x.md"]) {
    assert.equal(isExcludedRelPath(rel, decl, proj), true, `正例：${rel}`)
  }
  for (const rel of ["docs/batchesx/x.md", "docs/batch/x.md", "doc/batches/x.md", "docsX/batches/x.md", "batches/x.md", "xdocs/batches/y.md"]) {
    assert.equal(isExcludedRelPath(rel, decl, proj), false, `判假围栏：${rel}`)
  }
  assert.equal(isExcludedRelPath("openclaw/a.mjs", decl, proj), true, "面① 前缀命中（零回归）")
  assert.equal(isExcludedRelPath("openclaw-fork/a.mjs", decl, proj), false, "面① 边界不吞（零回归）")
  assert.equal(isExcludedRelPath("a/b.mjs", decl, proj), false, "非命中面（零回归锚）")

  const files = {
    "docs/batches/x.md": "# b\n", "docs/batch/x.md": "# c\n", "docs/batchlog/z.md": "# l\n",
    "docsX/batches/z.md": "# x\n", "batches/z.md": "# n\n", "src/a.mjs": "export const a = 1\n",
  }
  for (const [rel, text] of Object.entries(files)) mkFile(proj, rel, text)
  const listed = await listProjectFiles(proj, new Set([".md", ".mjs"]))
  assert.deepEqual(rels(listed.entries), ["batches/z.md", "docs/batch/x.md", "docs/batchlog/z.md", "docsX/batches/z.md", "src/a.mjs"],
    "干扰树逐档照收 ∥ 批次档面零收录")
})

// ───────────────────────── #5 非法 manifest 回默认声明（零抛）─────────────────────────

test("#5 非法 manifest 回默认声明（坏 JSON ∥ 形态错——零抛）（error）", async () => {
  // ① 坏 JSON
  const d1 = sandbox("t5a")
  mkdirSync(d1, { recursive: true })
  writeFileSync(join(d1, "PROJECT-MANIFEST.json"), "{ not json")
  clearDeclarationCache()
  const w1 = await captureWarn(() => loadProjectDeclaration(d1))
  assert.ok(w1.lines.length >= 1, "回默认可见（一行告警）")
  assert.deepEqual(w1.value.batchRecords.map((s) => [...s]), [], "声明值回默认（零序列）")
  assert.equal(w1.value.root, d1, "root 仍在（判基不丢）")
  assert.equal(isExcludedRelPath("docs/batches/x.md", w1.value, d1), true, "坏 JSON 下批次档面照排除")

  // ② 形态错（docRoot.batches 非法形态 ⇒ 档非法）
  const d2 = sandbox("t5b")
  writeFileSync(join(d2, "PROJECT-MANIFEST.json"), JSON.stringify({ docRoot: { batches: 42 } }))
  clearDeclarationCache()
  const w2 = await captureWarn(() => loadProjectDeclaration(d2))
  assert.ok(w2.lines.length >= 1, "形态错可见（一行告警）")
  assert.equal(isExcludedRelPath("docs/batches/x.md", w2.value, d2), true, "形态错下批次档面照排除")

  // ③ 零抛腿（端到端）：坏档树下同步零抛 ∥ 批次档零收录
  mkFile(d1, "docs/batches/x.md", "# batch\nbatchonlytoken\n")
  mkFile(d1, "docs/guide.md", "# Guide\nkeepdoctoken\n")
  const memory = createMemory({ dbPath: join(d1, "memory.db") })
  try {
    await captureWarn(async () => { await codeSyncMod.codeSync(memory, d1); await docsMod.docSync(memory, d1) }) // 回默认告警已在 ①② 断言；此处只防空输出噪声
    const docPaths = memory.db.prepare(`SELECT path FROM doc_chunks`).all().map((r) => r.path)
    assert.deepEqual(docPaths, ["docs/guide.md"], "坏档树下：批次档零收录 ∥ 留存面照收（零抛）")
  } finally { memory.db.close() }
})

// ───────────────────────── #6 沙箱库读面（存量行即时不可见）─────────────────────────

test("#6 沙箱库读面：批次档行 ∥ `index.excludePaths` 命中行即时零命中 ∥ 非命中可见 ∥ 参照等值（L-⑦-3）", async () => {
  const base = sandbox("t6")
  const projA = join(base, "projA")
  const projB = join(base, "projB")
  writeManifest(projA, { index: { excludePaths: ["legacy"] } })
  writeManifest(projB, {})
  // A 树在盘（保护位腿）：批次档 ∥ 面① 命中 ∥ 留存面
  const fBatchDoc = mkFile(projA, "docs/batches/x.md", "# Batch\nsharedtoken batch\n")
  const fBatchCode = mkFile(projA, "docs/batches/tool.js", "// sharedtoken tool\n")
  mkFile(projA, "legacy/old.md", "# Legacy\nsharedtoken legacy\n")
  const fKeepDoc = mkFile(projA, "src/keep.md", "# Keep\nsharedtoken sharedtoken\n")
  const fKeepCode = mkFile(projA, "src/app.mjs", "// sharedtoken sharedtoken\nexport const app = 1\n")
  const fManifest = join(projA, "PROJECT-MANIFEST.json")
  const A = normalizeOrigin(projA)
  const B = normalizeOrigin(projB)

  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = projA
  memory.embedder = { model: "stub-model" } // 向量支判别面（桩零网络）
  const db = memory.db
  db.prepare(`INSERT INTO meta (key, value) VALUES ('embedding_model', 'stub-model')`).run()
  db.prepare(`INSERT INTO meta (key, value) VALUES ('code_embedding_model', 'stub-model')`).run()
  db.prepare(`INSERT INTO meta (key, value) VALUES ('doc_embedding_model', 'stub-model')`).run()
  // 存量行夹具（行不删——「批次档从未入索引」等价面）：批次档（含嵌套形）∥ 面① 命中 ∥ 留存
  insDoc(db, A, "docs/batches/x.md", mtimeOf(fBatchDoc), "sharedtoken batch record")
  insDoc(db, A, "thincoder/docs/batches/y.md", 1, "sharedtoken nested batch")
  insDoc(db, A, "legacy/old.md", mtimeOf(join(projA, "legacy", "old.md")), "sharedtoken legacy row")
  insDoc(db, A, "src/keep.md", mtimeOf(fKeepDoc), "sharedtoken sharedtoken")
  insDoc(db, B, "src/other.md", 1, "sharedtoken")
  insCode(db, A, "docs/batches/tool.js", mtimeOf(fBatchCode), "// sharedtoken tool")
  insCode(db, A, "legacy/old.js", 1, "// sharedtoken legacy")
  insCode(db, A, "src/app.mjs", mtimeOf(fKeepCode), "// sharedtoken sharedtoken\napp")
  insCode(db, A, "PROJECT-MANIFEST.json", mtimeOf(fManifest), "{}")
  try {
    // ① 默认路（单 origin 快径）+ 覆盖参两态 + 无过滤形：批次档 ∥ 面① 命中行即时零命中
    const dDefault = await docsMod.docSearch(memory, "sharedtoken", { limit: 10 })
    assert.deepEqual(dDefault.map((r) => r.path), ["src/keep.md"], "默认路：存量批次档行 ∥ `index.excludePaths` 命中行零命中 ∥ 非命中可见")
    const dSame = await docsMod.docSearch(memory, "sharedtoken", { limit: 10, origins: [A] })
    assert.equal(JSON.stringify(dSame), JSON.stringify(dDefault), "覆盖参单 origin 同判（逐字等值）")
    const dMulti = await docsMod.docSearch(memory, "sharedtoken", { limit: 10, origins: [A, B] })
    assert.deepEqual(dMulti.map((r) => r.path).sort(), ["src/keep.md", "src/other.md"], "多 origin：逐行 origin 为 base（B 留存可见 ∥ 批次档行零命中）")
    const dUnfiltered = await docsMod.docSearch(memory, "sharedtoken", { limit: 10, origins: [] })
    assert.deepEqual(dUnfiltered.map((r) => r.path).sort(), ["src/keep.md", "src/other.md"], "无过滤形：行 origin 随行可得（游标键列）")
    const cDefault = await codeSearchMod.codeSearch(memory, "sharedtoken", { limit: 10 })
    const cPaths = cDefault.map((r) => r.path)
    assert.ok(!cPaths.some((p) => p.startsWith("docs/batches/") || p.startsWith("legacy/")), `codeSearch：批次档行 ∥ 面① 命中行零命中（同一谓词全判）：${cPaths}`)
    assert.ok(cPaths.includes("src/app.mjs"), "codeSearch：非命中留存面可见（向量支 top-K 内亦同判）")

    // ② 参照等值：同语料无隐藏行的沙箱库 ⇒ 三种调用逐字等值
    const ref = createMemory({ dbPath: join(base, "ref.db") })
    ref.codeOrigin = projA
    ref.embedder = { model: "stub-model" }
    ref.db.prepare(`INSERT INTO meta (key, value) VALUES ('embedding_model', 'stub-model')`).run()
    ref.db.prepare(`INSERT INTO meta (key, value) VALUES ('code_embedding_model', 'stub-model')`).run()
    ref.db.prepare(`INSERT INTO meta (key, value) VALUES ('doc_embedding_model', 'stub-model')`).run()
    insDoc(ref.db, A, "src/keep.md", mtimeOf(fKeepDoc), "sharedtoken sharedtoken")
    insDoc(ref.db, B, "src/other.md", 1, "sharedtoken")
    insCode(ref.db, A, "src/app.mjs", mtimeOf(fKeepCode), "// sharedtoken sharedtoken\napp")
    insCode(ref.db, A, "PROJECT-MANIFEST.json", mtimeOf(fManifest), "{}")
    try {
      assert.equal(JSON.stringify(dDefault), JSON.stringify(await docsMod.docSearch(ref, "sharedtoken", { limit: 10 })), "默认路 = 参照（逐字等值）")
      assert.equal(JSON.stringify(dMulti), JSON.stringify(await docsMod.docSearch(ref, "sharedtoken", { limit: 10, origins: [A, B] })), "多 origin = 参照（逐字等值）")
      assert.equal(JSON.stringify(dUnfiltered), JSON.stringify(await docsMod.docSearch(ref, "sharedtoken", { limit: 10, origins: [] })), "无过滤形 = 参照（逐字等值）")
      assert.equal(JSON.stringify(cDefault), JSON.stringify(await codeSearchMod.codeSearch(ref, "sharedtoken", { limit: 10 })), "code 面 = 参照（逐字等值）")
    } finally { ref.db.close() }

    // ③ 多 origin 支（声明公共仓同缝）：行 origin 为 base——同一路径串 C 下可见 ∥ P 下零命中（doc ∥ code 双面）
    const projC = join(base, "projC")
    const pubRoot = join(base, "pub")
    writeManifest(projC, { index: { publicRepos: ["../pub"] } })
    writeManifest(pubRoot, { docRoot: { batches: "notes/records" } }) // P 自定义位置：行 origin 为 base 方可判别
    const memC = createMemory({ dbPath: join(base, "multi.db") })
    memC.codeOrigin = projC
    try {
      const C = normalizeOrigin(projC)
      const P = normalizeOrigin(pubRoot)
      assert.equal(codeSearchMod.searchOrigins(memC).length, 2, "快径判据：两 origin（多 origin 支生效）")
      insCode(memC.db, C, "docs/batches/c.js", 1, "// sharedtoken batch")
      insCode(memC.db, C, "notes/records/c.js", 1, "// sharedtoken c")
      insCode(memC.db, P, "notes/records/p.js", 1, "// sharedtoken p")
      insCode(memC.db, P, "src/pub.js", 1, "// sharedtoken pub")
      insDoc(memC.db, C, "docs/batches/c.md", 1, "sharedtoken batch doc")
      insDoc(memC.db, C, "notes/records/d.md", 1, "sharedtoken d")
      insDoc(memC.db, P, "notes/records/p.md", 1, "sharedtoken p")
      const hits = (await codeSearchMod.codeSearch(memC, "sharedtoken", { limit: 10 })).map((r) => r.path).sort()
      assert.deepEqual(hits, ["notes/records/c.js", "src/pub.js"], "code 面：声明公共仓行可见 ∥ 批次档行零命中（行 origin 为 base——同路径串异 origin 异判）")
      const dHits = (await docsMod.docSearch(memC, "sharedtoken", { limit: 10 })).map((r) => r.path).sort()
      assert.deepEqual(dHits, ["notes/records/d.md"], "doc 面同判（同一 rowExcluded 机制在 doc ∥ code 两面共用）")
    } finally { memC.db.close() }

    // ④ 保护位（L-⑦-4）：全量同步不删不损（收尾短路）∥ 非批次档行数逐字不变
    const docBefore = snap(db, "doc_chunks")
    const codeBefore = snap(db, "code_chunks")
    await codeSyncMod.codeSync(memory, projA)
    await docsMod.docSync(memory, projA)
    assert.deepEqual(snap(db, "doc_chunks"), docBefore, "批次档 ∥ 面① 命中存量行逐键等前值（doc）")
    assert.deepEqual(snap(db, "code_chunks"), codeBefore, "批次档 ∥ 面① 命中存量行逐键等前值（code）")
    assert.equal(rowsOfPath(db, "doc_chunks", A, "docs/batches/x.md").length, 1, "批次档存量行仍在库（行不删）")
    assert.deepEqual((await docsMod.docSearch(memory, "sharedtoken", { limit: 10 })).map((r) => r.path), ["src/keep.md"], "同步后查询面仍零命中（即时不可见不待清理）")
  } finally { memory.db.close() }
})
