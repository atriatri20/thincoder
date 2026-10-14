/**
 * 2026-10-13-index-scope-declared.test.mjs — 索引范围声明化批（台账 #1367）批次本地单元测试档。
 * 批档 = `docs/batches/2026-10-13-index-scope-declared.md`（§2 用例表与判据腿 L-⑧-1–6）。
 * 名随批次档 · 住批次目录 · 不进仓套件；复跑（从仓库根 `thincoder/`）：
 *   node --test docs/batches/2026-10-13-index-scope-declared.test.mjs
 * 数据面纪律：只用夹具 ∥ 沙箱库（tmp）——真库（`~/.thincoder/memory.db`）零触碰（`node --test`
 * 进程 NODE_TEST_CONTEXT ⇒ `logEvent` 不落盘——`log.mjs` writeEnabled）。
 * embedding 桩：`embedding.mjs` 经模块钩子短接到确定性桩（零网络——读面向量支判别面）。
 *
 * 用例（判据腿 → 本件）：
 *   #1 L-⑧-1 范围直调矩阵（两族锚 × docRoot 串/数组/null/文件值 × codePaths 缺省/[]/多段；档非法；伪档）
 *   #2 L-⑧-2 双径零收录 + 三缝（listProjectFiles git ∥ walk ∥ reindexFile ∥ gitSync）
 *   #3 L-⑧-3 读面即时不可见（存量行）+ 多 origin/无过滤形 + 保护位
 *   #4 L-⑧-4 零回归锚（N-S12）：声明面内文件——收录 ∥ mtime 增量 ∥ 行数 ∥ 检索结果逐字等值
 *   #5 L-⑧-5 零索引 ∥ 不回落（反例锁）
 *   #6 L-⑧-6 两层锚（并集）+ 判定句机检形 + 深 cwd
 *   #7 写门即清缓存（修复轮 · 发现③）：同进程写门建/改档（init ∥ write）⇒ declaredIndexScope 即变（零重启）
 * 批档 §2 用例表映射：#1(normal)→本件 #2 ∥ #1；#2(normal)→本件 #6①；#3(boundary 零索引)→本件 #5；
 * #4(boundary 深 cwd)→本件 #6③；#5(boundary 存量行+全量同步)→本件 #3；#6(error 非法子目录档)→本件 #1⑤；
 * #7(error 影子档)→本件 #1⑥。
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url)) // 仓根（docs/batches 两层深）
const coreUrl = (rel) => pathToFileURL(join(ROOT, "thincoder-core", rel)).href

// ─── embedding 桩（零网络；向量确定：一切向量 = 同一单位向量——读面向量支判别面）────────────

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
const syncTailMod = await import(coreUrl("memory/sync-tail.mjs"))
const originMod = await import(coreUrl("memory/origin.mjs"))

const { createMemory } = schemaMod
const { normalizeOrigin } = originMod
const { declaredIndexScope, isInDeclaredScope, clearDeclarationCache } = conv
const { listProjectFiles } = fileListMod

// ─── 夹具工具 ────────────────────────────────────────────────────────────────

const DIRS = []
const sandbox = (tag) => { const d = mkdtempSync(join(tmpdir(), `isc-${tag}-`)); DIRS.push(d); return d }
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
/** 声明「文档面 = docs（其余四子键 null）∥ 代码面 = src 段」。 */
const DECL = { docRoot: { requirements: "docs", specs: null, design: null, modules: null, batches: null }, codePaths: ["src"] }
const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
const rels = (entries) => entries.map((e) => e.rel.replace(/\\/g, "/")).sort()
/** 行快照（含 embedding 的 base64——逐键对比用；不落网络 ∥ 不落 fs）。 */
const snap = (db, table) => db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()
  .map((r) => JSON.stringify({ ...r, embedding: r.embedding ? Buffer.from(r.embedding).toString("base64") : null }))
const pathsOf = (db, table) => db.prepare(`SELECT path FROM ${table} ORDER BY path`).all().map((r) => r.path)
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
const metaFor = (mem) => {
  for (const k of ["embedding_model", "code_embedding_model", "doc_embedding_model"]) mem.db.prepare(`INSERT INTO meta (key, value) VALUES (?, 'stub-model')`).run(k)
}
const captureWarn = async (fn) => {
  const lines = []
  const orig = console.warn
  console.warn = (...a) => lines.push(a.map(String).join(" "))
  try { return { value: await fn(), lines } } finally { console.warn = orig }
}
/** 业务可观察面（工具输出面——rowid ∥ bm25 rank 为内部值，不作等值判据）。 */
const observable = (rows) => rows.map((r) => ({
  path: r.path, language: r.language, heading: r.heading ?? null, symbol: r.symbol_name ?? null,
  content: r.content, line_start: r.line_start, line_end: r.line_end, score: r._score ?? null,
}))
const mtimeOf = (p) => Math.floor(statSync(p).mtimeMs)

// ───────────────────── #1 L-⑧-1 范围直调矩阵 ─────────────────────

test("#1 范围直调矩阵（declaredIndexScope ∥ isInDeclaredScope）——L-⑧-1", async () => {
  // ① 锚带档（docRoot 串值 + codePaths 缺省）+ 一级子目录 A 带档（数组值 + 多段 codePaths）
  const base = sandbox("t1")
  const proj = join(base, "proj")
  const A = join(proj, "A")
  mkdirSync(join(proj, "B"), { recursive: true }) // B 无档 ⇒ 零条目
  writeManifest(proj, { docRoot: { requirements: "docs/RELEASE.md", specs: null, design: null, modules: null, batches: null }, codePaths: ["src"] })
  writeManifest(A, { docRoot: { requirements: ["docs", "notes/CHANGELOG.md"], specs: null, design: null, modules: null, batches: null }, codePaths: ["packages/foo/src"] })
  const scope = declaredIndexScope(proj)
  assert.ok(Object.isFrozen(scope) && Object.isFrozen(scope[0]) && Object.isFrozen(scope[0].docPaths), "冻结条目数组 ∥ 条目 ∥ 键数组")
  assert.deepEqual(scope.map((e) => e.root), [proj, A], "条目 = 锚 + 一级子目录（带档者，按名序）")
  assert.deepEqual([...scope[0].docPaths], ["docs/RELEASE.md"], "锚 docPaths = 根相对文件值（恰该文件）")
  assert.deepEqual([...scope[0].codePaths], ["src"], "锚 codePaths 缺键 ⇒ 默认 [\"src\"]")
  assert.deepEqual([...scope[1].docPaths], ["docs", "notes/CHANGELOG.md"], "数组值合并展开（目录值 ∥ 文件值，去重保序）")
  assert.deepEqual([...scope[1].codePaths], ["packages/foo/src"], "多段序列（统一按段序列）")
  assert.equal(declaredIndexScope(proj), scope, "同 dir 复取 = 同回执（缓存）")
  for (const [rel, want, note] of [
    ["docs/RELEASE.md", true, "文件值恰该文件"],
    ["docs/other.md", false, "文件值不吞同目录他档"],
    ["docs/RELEASE.md/x.md", true, "前缀规则（恰等 ∨ 后随 `/`）——文件值下的伪子路径同判（不可达形；同面① 口径）"],
    ["other/b.md", false, "未声明 ⇒ 不进"],
    ["src/a.mjs", true, "代码面段序列"],
    ["deep/nested/src/x.mjs", true, "段序列任意深度"],
    ["deep/srcx/y.mjs", false, "段边界不吞"],
    ["A/docs/y.md", true, "A 条目（数组值序 1：目录前缀）"],
    ["A/docs/sub/deep.md", true, "A 目录前缀（路径及子树）"],
    ["A/notes/CHANGELOG.md", true, "A 条目（数组值序 2：文件值恰该文件）"],
    ["A/notes/OTHER.md", false, "A 文件值不吞同目录他档"],
    ["A/packages/foo/src/z.mjs", true, "A 多段序列任意深度"],
    ["A/packages/foo/srcx/z.mjs", false, "多段序列边界不吞"],
    ["B/docs/b.md", false, "无档子目录 ⇒ 整树不进"],
    ["../outside/x.md", false, "越根 ⇒ 不命中"],
  ]) assert.equal(isInDeclaredScope(rel, scope, proj), want, `${note}：${rel}`)

  // ② 锚无档（零子目录带档）⇒ 条目集空 ∥ 谓词恒假（含 base 缺省形）
  const bare = join(base, "bare")
  mkdirSync(bare, { recursive: true })
  const empty = declaredIndexScope(bare)
  assert.deepEqual(empty, [], "无档 ⇒ 条目集空")
  assert.equal(isInDeclaredScope("docs/x.md", empty, bare), false, "空范围 ⇒ 不命中")
  assert.equal(isInDeclaredScope("docs/x.md", null, bare), false, "scope 缺 ⇒ 不命中（fail-closed）")
  assert.equal(isInDeclaredScope("docs/x.md", scope), false, "base 缺省（进程 cwd）⇒ 树外 ⇒ 不命中")

  // ③ docRoot null（本面无）∥ codePaths []（无段面）
  const d3 = join(base, "d3")
  writeManifest(d3, { docRoot: { requirements: null, specs: null, design: null, modules: null, batches: null }, codePaths: [] })
  const s3 = declaredIndexScope(d3)
  assert.deepEqual([...s3[0].docPaths], [], "五子键全 null ⇒ 文档面零根")
  assert.deepEqual([...s3[0].codePaths], [], "codePaths [] ⇒ 无段面")
  assert.equal(isInDeclaredScope("docs/x.md", s3, d3), false, "文档面零根 ⇒ 不命中")
  assert.equal(isInDeclaredScope("src/a.mjs", s3, d3), false, "无段面 ⇒ 不命中")

  // ④ 文档面根自身值（`.`）⇒ 整根
  const d4 = join(base, "d4")
  writeManifest(d4, { docRoot: { requirements: ".", specs: null, design: null, modules: null, batches: null }, codePaths: [] })
  const s4 = declaredIndexScope(d4)
  assert.deepEqual([...s4[0].docPaths], ["."], "根自身值 ⇒ `.` 哨兵")
  assert.equal(isInDeclaredScope("anywhere/x.md", s4, d4), true, "整根面命中")

  // ⑤ 档非法（坏 JSON）：该条目按默认值参与 + 既有可见告警（KD-M1-32 链）——不静默成零
  const d5 = join(base, "d5")
  writeManifest(d5, DECL)
  mkdirSync(join(d5, "Bad"), { recursive: true })
  writeFileSync(join(d5, "Bad", "PROJECT-MANIFEST.json"), "{ not json")
  clearDeclarationCache()
  const w5 = await captureWarn(() => declaredIndexScope(d5))
  assert.equal(w5.value.length, 2, "非法档 ⇒ 该条目仍在（不静默成零）")
  assert.deepEqual([...w5.value[1].docPaths], ["docs/requirements", "docs/requirements/specs", "docs/design", "docs/design/modules", "docs/batches"], "非法档 ⇒ docRoot 默认五路径")
  assert.deepEqual([...w5.value[1].codePaths], ["src"], "非法档 ⇒ codePaths 默认")
  assert.ok(w5.lines.length >= 1, "既有可见告警在场（声明链单源）")

  // ⑥ 伪档（点段 ∥ 内建名单段）⇒ 不入条目扫描
  const d6 = join(base, "d6")
  writeManifest(d6, DECL)
  mkFile(d6, ".thincoder/tmp/PROJECT-MANIFEST.json", "{ }")
  mkFile(d6, "node_modules/pkg/PROJECT-MANIFEST.json", "{ }")
  clearDeclarationCache()
  assert.deepEqual(declaredIndexScope(d6).map((e) => e.root), [d6], "影子档 ∥ 跳过段档不入条目扫描")
})

// ───────────────────── #2 L-⑧-2 双径零收录 + 三缝 ─────────────────────

test("#2 双径零收录 + 三缝（listProjectFiles ∥ reindexFile ∥ gitSync）——L-⑧-2", async () => {
  const base = sandbox("t2")
  const proj = join(base, "proj")
  const files = {
    "docs/x.md": "# X\nscopetoken x\n",
    "docs/sub/deep.md": "# Deep\nscopetoken deep\n",
    "src/a.mjs": "// scopetoken a\nexport const a = 1\n",
    "other/b.md": "# Other\nscopetoken other\n",
    "nested/other/c.mjs": "// scopetoken nested other\n",
    "vendor/lib.js": "// scopetoken vendor\n",
  }
  for (const [rel, text] of Object.entries(files)) mkFile(proj, rel, text)
  writeManifest(proj, DECL)
  const exts = new Set([".md", ".mjs", ".js"])
  const KEEP = ["docs/sub/deep.md", "docs/x.md", "src/a.mjs"]

  // ① walk 径（非 git）：逐文件准入、不剪枝——范围外零返回
  const walked = await listProjectFiles(proj, exts)
  assert.equal(walked.truncated, false, "walk 未截断")
  assert.deepEqual(rels(walked.entries), KEEP, "walk 径：范围外零收录 ∥ 声明面内照收")

  // ② git 径（ls-files）：逐字同集（excludes 隔离防宿主 ignore 隐去留存面）
  git(proj, ["init", "-q"])
  const excludeFile = join(base, "empty-excludes")
  writeFileSync(excludeFile, "")
  git(proj, ["config", "core.excludesFile", excludeFile.replaceAll("\\", "/")])
  assert.deepEqual(rels((await listProjectFiles(proj, exts)).entries), KEEP, "git ∥ walk 同判（逐字同集）")

  const origin = normalizeOrigin(proj)
  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = proj
  try {
    // ③ 全扫双写：范围外零落行
    await codeSyncMod.codeSync(memory, proj)
    await docsMod.docSync(memory, proj)
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["docs/sub/deep.md", "docs/x.md"], "doc 面 = 声明文档面")
    assert.deepEqual(pathsOf(memory.db, "code_chunks"), ["src/a.mjs"], "code 面 = 声明段面（含 .json 类根级档 ⇒ 不在声明段内）")

    // ④ 单文件缝（reindexFile）：范围外零写 ∥ 声明面内同址照写（零回归）
    await codeSyncMod.reindexFile(memory, proj, join(proj, "other", "b.md"))
    await codeSyncMod.reindexFile(memory, proj, join(proj, "nested", "other", "c.mjs"))
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["docs/sub/deep.md", "docs/x.md"], "reindexFile 范围外零写（doc）")
    assert.deepEqual(pathsOf(memory.db, "code_chunks"), ["src/a.mjs"], "reindexFile 范围外零写（code）")
    await codeSyncMod.reindexFile(memory, proj, join(proj, "docs", "x.md"))
    assert.ok(pathsOf(memory.db, "doc_chunks").includes("docs/x.md"), "声明面内单文件缝照写")

    // ⑤ gitSync diff 缝：提交落锚 ⇒ 改范围外档 + 声明面内档 ⇒ 范围外零落行 ∥ 声明面内更新
    git(proj, ["add", "-A"])
    git(proj, ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "init"])
    await codeSyncMod.codeSync(memory, proj)
    mkFile(proj, "other/b.md", "# Other\nscopetoken other v2\n")
    mkFile(proj, "src/a.mjs", "// scopetoken a v2\nexport const a = 2\n")
    const gs = await codeSyncMod.gitSync(memory, proj)
    assert.ok(gs && gs.updated >= 1, "diff 缝走增量（声明面内档入更新）")
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["docs/sub/deep.md", "docs/x.md"], "diff 缝范围外零落行（doc）")
    assert.ok((await codeSearchMod.codeSearch(memory, "scopetoken", { limit: 5 })).some((r) => r.content.includes("v2")), "声明面内档经 diff 缝已更新")
  } finally { memory.db.close() }
})

// ───────────────────── #3 L-⑧-3 读面即时不可见 + 保护位 ─────────────────────

test("#3 读面即时不可见（存量行）+ 多 origin/无过滤形 + 保护位——L-⑧-3", async () => {
  const base = sandbox("t3")
  const projA = join(base, "projA")
  const projB = join(base, "projB")
  writeManifest(projA, DECL) // 文档面 docs ∥ 代码面 src
  writeManifest(projB, { docRoot: { requirements: "notes", specs: null, design: null, modules: null, batches: null }, codePaths: ["lib"] })
  // 范围外档在盘（保护位腿：范围外但存在 ⇒ 收尾不得删）
  const fKeepDoc = mkFile(projA, "docs/keep.md", "# Keep\nsharedtoken sharedtoken\n")
  const fKeepCode = mkFile(projA, "src/app.mjs", "// sharedtoken sharedtoken\nexport const app = 1\n")
  const fOutDoc = mkFile(projA, "other/legacy.md", "# Legacy\nsharedtoken legacy\n")
  const fOutCode = mkFile(projA, "vendor/legacy.js", "// sharedtoken legacy\n")
  const fBatchDoc = mkFile(projA, "docs/batches/x.md", "# Batch\nsharedtoken batch\n")
  const fManifest = join(projA, "PROJECT-MANIFEST.json")
  const A = normalizeOrigin(projA)
  const B = normalizeOrigin(projB)

  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = projA
  memory.embedder = { model: "stub-model" } // 向量支判别面（桩零网络）
  const db = memory.db
  metaFor(memory)
  // 存量行夹具（「范围外从未入索引」等价面）：范围外（含嵌套形）∥ 面⑥ 批次档 ∥ 声明面内 ∥ 异 origin
  insDoc(db, A, "docs/keep.md", mtimeOf(fKeepDoc), "sharedtoken sharedtoken")
  insDoc(db, A, "other/legacy.md", mtimeOf(fOutDoc), "sharedtoken legacy row")
  insDoc(db, A, "nested/other/legacy.md", 1, "sharedtoken nested legacy")
  insDoc(db, A, "docs/batches/x.md", mtimeOf(fBatchDoc), "sharedtoken batch record")
  insDoc(db, A, "notes/a.md", 1, "sharedtoken a-undeclared")
  insDoc(db, B, "notes/b.md", 1, "sharedtoken b-kept")
  insDoc(db, B, "docs/b.md", 1, "sharedtoken b-undeclared")
  insCode(db, A, "src/app.mjs", mtimeOf(fKeepCode), "// sharedtoken sharedtoken\napp")
  insCode(db, A, "vendor/legacy.js", mtimeOf(fOutCode), "// sharedtoken legacy")
  insCode(db, A, "PROJECT-MANIFEST.json", mtimeOf(fManifest), "{}")
  insCode(db, B, "lib/d.mjs", 1, "// sharedtoken b-lib")
  insCode(db, B, "src/e.mjs", 1, "// sharedtoken b-undeclared")
  const OUT_DOC = ["docs/batches/x.md", "nested/other/legacy.md", "notes/a.md", "other/legacy.md"]
  const OUT_CODE = ["PROJECT-MANIFEST.json", "vendor/legacy.js"]
  try {
    // ① 三种调用形态：范围外行即时零命中 ∥ 声明面内照常可见（行 origin 为 base——同路径异 origin 异判）
    const dDefault = await docsMod.docSearch(memory, "sharedtoken", { limit: 10 })
    assert.deepEqual(dDefault.map((r) => r.path), ["docs/keep.md"], "默认路：范围外 ∥ 面⑥ 批次档行零命中")
    const dMulti = await docsMod.docSearch(memory, "sharedtoken", { limit: 10, origins: [A, B] })
    assert.deepEqual(dMulti.map((r) => r.path).sort(), ["docs/keep.md", "notes/b.md"], "多 origin：逐行 origin 为 base（B 声明面可见 ∥ B 未声明面零命中）")
    const dUnfiltered = await docsMod.docSearch(memory, "sharedtoken", { limit: 10, origins: [] })
    assert.deepEqual(dUnfiltered.map((r) => r.path).sort(), ["docs/keep.md", "notes/b.md"], "无过滤形：行 origin 随行可得（游标键列）")
    const cDefault = await codeSearchMod.codeSearch(memory, "sharedtoken", { limit: 10 })
    assert.deepEqual(cDefault.map((r) => r.path), ["src/app.mjs"], "codeSearch：范围外行零命中（向量支 top-K 内亦同判）")

    // ② 参照等值：同语料「无范围外行」沙箱库 ⇒ 三种调用逐字等值
    const ref = createMemory({ dbPath: join(base, "ref.db") })
    ref.codeOrigin = projA
    ref.embedder = { model: "stub-model" }
    metaFor(ref)
    insDoc(ref.db, A, "docs/keep.md", mtimeOf(fKeepDoc), "sharedtoken sharedtoken")
    insDoc(ref.db, B, "notes/b.md", 1, "sharedtoken b-kept")
    insCode(ref.db, A, "src/app.mjs", mtimeOf(fKeepCode), "// sharedtoken sharedtoken\napp")
    insCode(ref.db, B, "lib/d.mjs", 1, "// sharedtoken b-lib")
    try {
      assert.equal(JSON.stringify(observable(dDefault)), JSON.stringify(observable(await docsMod.docSearch(ref, "sharedtoken", { limit: 10 }))), "默认路 = 参照（逐字等值）")
      assert.equal(JSON.stringify(observable(dMulti)), JSON.stringify(observable(await docsMod.docSearch(ref, "sharedtoken", { limit: 10, origins: [A, B] }))), "多 origin = 参照（逐字等值）")
      assert.equal(JSON.stringify(observable(dUnfiltered)), JSON.stringify(observable(await docsMod.docSearch(ref, "sharedtoken", { limit: 10, origins: [] }))), "无过滤形 = 参照（逐字等值）")
      assert.equal(JSON.stringify(observable(cDefault)), JSON.stringify(observable(await codeSearchMod.codeSearch(ref, "sharedtoken", { limit: 10 }))), "code 面 = 参照（逐字等值）")
    } finally { ref.db.close() }

    // ③ 保护位：全量同步 ⇒ 范围外存量行逐键等前值（收尾短路）∥ 行不删 ∥ 查询面仍零命中
    const outDocBefore = OUT_DOC.map((p) => rowsOfPath(db, "doc_chunks", A, p))
    const outCodeBefore = OUT_CODE.map((p) => rowsOfPath(db, "code_chunks", A, p))
    const docCount = Number(db.prepare(`SELECT COUNT(*) AS n FROM doc_chunks`).get().n)
    const codeCount = Number(db.prepare(`SELECT COUNT(*) AS n FROM code_chunks`).get().n)
    await codeSyncMod.codeSync(memory, projA)
    await docsMod.docSync(memory, projA)
    assert.deepEqual(OUT_DOC.map((p) => rowsOfPath(db, "doc_chunks", A, p)), outDocBefore, "范围外 ∥ 面⑥ 存量行逐键等前值（doc）")
    assert.deepEqual(OUT_CODE.map((p) => rowsOfPath(db, "code_chunks", A, p)), outCodeBefore, "范围外存量行逐键等前值（code）")
    assert.deepEqual(OUT_DOC.map((p) => rowsOfPath(db, "doc_chunks", A, p).length), OUT_DOC.map(() => 1), "范围外存量行仍在库（行不删）")
    assert.equal(Number(db.prepare(`SELECT COUNT(*) AS n FROM doc_chunks`).get().n), docCount, "doc 行数逐字不变")
    assert.equal(Number(db.prepare(`SELECT COUNT(*) AS n FROM code_chunks`).get().n), codeCount, "code 行数逐字不变")
    assert.deepEqual((await docsMod.docSearch(memory, "sharedtoken", { limit: 10 })).map((r) => r.path), ["docs/keep.md"], "同步后查询面仍零命中（即时不可见不待清理）")
  } finally { memory.db.close() }
})

// ───────────────────── #4 L-⑧-4 零回归锚（N-S12）─────────────────────

test("#4 零回归锚（N-S12）：声明面内文件收录 ∥ mtime 增量 ∥ 行数 ∥ 检索逐字等值——L-⑧-4", async () => {
  // 基线 = 本件落盘前（范围门前）同夹具实测读数（命令同本件档头；逐字固化于此，故该腿可机检）
  const base = sandbox("t4")
  const proj = join(base, "proj")
  mkFile(proj, "docs/guide.md", "# Guide\nsharedtoken guide body\n")
  mkFile(proj, "docs/sub/deep.md", "# Deep\nsharedtoken deep body\n")
  mkFile(proj, "src/a.mjs", "// sharedtoken a\nexport const a = 1\n")
  mkFile(proj, "src/util/b.mjs", "// sharedtoken b\nexport const b = 2\n")
  writeManifest(proj, DECL)
  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = proj
  memory.embedder = { model: "stub-model" }
  metaFor(memory)
  try {
    const res = await codeSyncMod.codeSync(memory, proj)
    const dres = await docsMod.docSync(memory, proj)
    // ① 收录面（同步收录 ∥ 行数）：逐字等基线
    assert.deepEqual(res.errors, [], "code 同步零错")
    assert.deepEqual(dres.errors, [], "doc 同步零错")
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["docs/guide.md", "docs/sub/deep.md"], "doc 面 = 基线（行数 ∥ 路径逐字）")
    assert.deepEqual(pathsOf(memory.db, "code_chunks"), ["src/a.mjs", "src/util/b.mjs"], "code 面 = 基线（行数 ∥ 路径逐字）")
    // ② 检索结果逐字等值（含 heading ∥ content ∥ 行区间 ∥ 分数——业务可观察面）
    const dHits = await docsMod.docSearch(memory, "sharedtoken", { limit: 10 })
    const cHits = await codeSearchMod.codeSearch(memory, "sharedtoken", { limit: 10 })
    assert.deepEqual(observable(dHits), [
      { path: "docs/guide.md", language: "markdown", heading: "docs/guide.md > Guide", symbol: null, content: "# Guide\nsharedtoken guide body", line_start: 1, line_end: 3, score: 0.03 },
      { path: "docs/sub/deep.md", language: "markdown", heading: "docs/sub/deep.md > Deep", symbol: null, content: "# Deep\nsharedtoken deep body", line_start: 1, line_end: 3, score: 0.03 },
    ], "docSearch = 基线（逐字等值）")
    assert.deepEqual(observable(cHits), [
      { path: "src/a.mjs", language: "javascript", heading: null, symbol: "", content: "// sharedtoken a\nexport const a = 1", line_start: 1, line_end: 3, score: 0.03 },
      { path: "src/util/b.mjs", language: "javascript", heading: null, symbol: "", content: "// sharedtoken b\nexport const b = 2", line_start: 1, line_end: 3, score: 0.03 },
    ], "codeSearch = 基线（逐字等值）")
    // ③ mtime 增量：复跑 = 零更新零删除（全 skip）∥ 行快照逐字不变（快照取在检索后——惰性向量回填已落定）
    const docSnap = snap(memory.db, "doc_chunks")
    const codeSnap = snap(memory.db, "code_chunks")
    const res2 = await codeSyncMod.codeSync(memory, proj)
    const dres2 = await docsMod.docSync(memory, proj)
    assert.equal(res2.updated, 0, "code 复跑零更新（mtime 增量）")
    assert.equal(res2.skipped, res2.total, "code 复跑全 skip")
    assert.equal(dres2.updated, 0, "doc 复跑零更新（mtime 增量）")
    assert.equal(dres2.skipped, dres2.total, "doc 复跑全 skip")
    assert.deepEqual(snap(memory.db, "doc_chunks"), docSnap, "doc 行快照逐字不变")
    assert.deepEqual(snap(memory.db, "code_chunks"), codeSnap, "code 行快照逐字不变")
    // ④ 面① 谓词语义零改（直调零回归锚）：缺省 `[]` ⇒ 仅面⑥ 约定段判真
    assert.equal(conv.isExcludedRelPath("a/b.mjs", conv.loadProjectDeclaration(proj), proj), false, "面① 非命中（缺省 []）")
    assert.equal(conv.isExcludedRelPath("docs/batches/x.md", conv.loadProjectDeclaration(proj), proj), true, "面⑥ 约定段仍排除（零改）")
    // ⑤ 保护位缺省语义零改（既有调用方）：未传 `scope` ⇒ 范围面不判——非命中 stale 照删（本批修）
    const deleted = []
    const fakeMem = { db: { prepare: () => ({ run: (origin, path) => deleted.push(path) }) } }
    const removed = await syncTailMod.sweepStaleRows(fakeMem, {
      table: "code_chunks", origin: "d:/x/sub", indexed: new Map([["build/old.mjs", 1], ["gone.mjs", 1]]),
      seen: new Set(), decl: { root: proj, index: { excludePaths: ["sub/build"] } }, base: join(proj, "sub"),
    })
    assert.equal(removed, 1, "未传 scope ⇒ 范围面不判（既有调用方语义零改）")
    assert.deepEqual(deleted, ["gone.mjs"], "非命中 stale 照删 ∥ 面① 命中照护")
  } finally { memory.db.close() }
})

// ───────────────────── #5 L-⑧-5 零索引 ∥ 不回落（反例锁）─────────────────────

test("#5 零索引 ∥ 不回落全树（反例锁）——L-⑧-5", async () => {
  const base = sandbox("t5")
  const proj = join(base, "proj") // 锚 ∥ 子目录皆无档
  const files = { "docs/guide.md": "# Guide\nzerotoken guide\n", "src/a.mjs": "// zerotoken a\nexport const a = 1\n", "README.md": "# Root\nzerotoken root\n" }
  for (const [rel, text] of Object.entries(files)) mkFile(proj, rel, text)
  mkdirSync(join(proj, "sub"), { recursive: true })
  clearDeclarationCache()
  assert.deepEqual(declaredIndexScope(proj), [], "全无档 ⇒ 条目集空")
  // ① 双径：walk 径 ∥ git 径皆空（可索引文件在盘——反例锁：不是「树里没东西」）
  const exts = new Set([".md", ".mjs"])
  assert.deepEqual(rels((await listProjectFiles(proj, exts)).entries), [], "walk 径零收录（不回落全树）")
  git(proj, ["init", "-q"])
  assert.deepEqual(rels((await listProjectFiles(proj, exts)).entries), [], "git 径零收录（不回落全树）")
  // ② 同步零新增 ∥ 读面零命中
  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = proj
  try {
    await codeSyncMod.codeSync(memory, proj)
    await docsMod.docSync(memory, proj)
    assert.equal(Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM doc_chunks`).get().n), 0, "同步零新增（doc）")
    assert.equal(Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM code_chunks`).get().n), 0, "同步零新增（code）")
    assert.deepEqual(await docsMod.docSearch(memory, "zerotoken", { limit: 5 }), [], "读面零命中（doc）")
    assert.deepEqual(await codeSearchMod.codeSearch(memory, "zerotoken", { limit: 5 }), [], "读面零命中（code）")
  } finally { memory.db.close() }
})

// ───────────────────── #6 L-⑧-6 两层锚 ∥ 判定句 ∥ 深 cwd ─────────────────────

test("#6 两层锚（并集）+ 判定句机检形 + 深 cwd——L-⑧-6", async () => {
  const base = sandbox("t6")
  const ws = join(base, "ws") // 工作区根（无自身 manifest）
  const A = join(ws, "A")
  mkFile(A, "docs/spec.md", "# Spec\nlayertoken A spec\n")
  mkFile(A, "src/c.mjs", "// layertoken A c\n")
  mkFile(A, "other/x.md", "# A other\nlayertoken A other\n")
  mkFile(ws, "B/docs/b.md", "# B\nlayertoken B\n") // B 无 manifest ⇒ 全树零命中
  mkFile(ws, "README.md", "# Root\nlayertoken root\n") // 锚自身未声明文件
  writeManifest(A, DECL)

  // ① 判定句机检形（需求 §4.15 判定句）：A 命中 ∥ B 全树零命中 ∥ 锚自身未声明文件零命中
  const memory = createMemory({ dbPath: join(base, "memory.db") })
  memory.codeOrigin = ws
  try {
    await codeSyncMod.codeSync(memory, ws)
    await docsMod.docSync(memory, ws)
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["A/docs/spec.md"], "A 文档面命中 ∥ B ∥ 锚散档零命中")
    assert.deepEqual(pathsOf(memory.db, "code_chunks"), ["A/src/c.mjs"], "A 代码面命中 ∥ B ∥ 锚散档零命中")
    assert.deepEqual((await docsMod.docSearch(memory, "layertoken", { limit: 10 })).map((r) => r.path), ["A/docs/spec.md"], "读面同判")

    // ② 锚自带档 ⇒ 自身声明 ∪ 子目录声明（并集）
    mkFile(ws, "root-docs/r.md", "# RootDoc\nlayertoken root doc\n")
    mkFile(ws, "scripts/s.mjs", "// layertoken root script\n")
    writeManifest(ws, { docRoot: { requirements: "root-docs", specs: null, design: null, modules: null, batches: null }, codePaths: ["scripts"] })
    await codeSyncMod.codeSync(memory, ws)
    await docsMod.docSync(memory, ws)
    assert.deepEqual(pathsOf(memory.db, "doc_chunks"), ["A/docs/spec.md", "root-docs/r.md"], "并集：锚声明 ∪ 子目录声明（doc）")
    assert.deepEqual(pathsOf(memory.db, "code_chunks"), ["A/src/c.mjs", "scripts/s.mjs"], "并集：锚声明 ∪ 子目录声明（code）")
    assert.ok(!pathsOf(memory.db, "code_chunks").includes("PROJECT-MANIFEST.json"), "根级散档（manifest 本体）不在声明面 ⇒ 不进")
  } finally { memory.db.close() }

  // ③ 深 cwd（锚 = 项目内子目录）⇒ 管辖 manifest 生效（面按仓根相对）
  const proj = join(base, "proj")
  const deep = join(proj, "pkg")
  mkFile(proj, "docs/guide.md", "# Guide\ndeeptoken guide\n")
  mkFile(proj, "pkg/src/a.mjs", "// deeptoken deep a\n")
  mkFile(proj, "pkg/docs/x.md", "# PkgDoc\ndeeptoken pkg doc\n")
  writeManifest(proj, DECL)
  const dScope = declaredIndexScope(deep)
  assert.deepEqual(dScope.map((e) => e.root), [proj], "深 cwd ⇒ 管辖 manifest 生效（条目根 = 仓根）")
  assert.equal(isInDeclaredScope("src/a.mjs", dScope, deep), true, "面板按仓根相对：pkg/src 命中 src 段（任意深度）")
  assert.equal(isInDeclaredScope("docs/x.md", dScope, deep), false, "docRoot 值在 origin 外（仓根 docs/）⇒ 文档面 0（如实）")
  const dmem = createMemory({ dbPath: join(base, "deep.db") })
  dmem.codeOrigin = deep
  try {
    await codeSyncMod.codeSync(dmem, deep)
    await docsMod.docSync(dmem, deep)
    assert.deepEqual(pathsOf(dmem.db, "code_chunks"), ["src/a.mjs"], "深 cwd code 面 = 声明段面")
    assert.deepEqual(pathsOf(dmem.db, "doc_chunks"), [], "深 cwd doc 面 = 0（docRoot 值在 origin 外——如实）")
  } finally { dmem.db.close() }
})

// ───────────────────── #7 写门即清缓存（修复轮 · 发现③）─────────────────────

test("#7 写门成功即清缓存：同进程「补档即回归」（零重启）——修复轮 · 发现③", async () => {
  const base = sandbox("t7")
  const proj = join(base, "proj")
  mkdirSync(proj, { recursive: true })
  const { manifestTool } = await import(coreUrl("agent-tools/manifest.mjs"))
  const CTX = { agent: { cwd: base }, cwd: base } // dispatch 形态（先例：2026-10-08-manifest-agent-tool.test.mjs）
  clearDeclarationCache()
  // 写前陈值先在册（无档 ⇒ 声明回退 ∥ 零条目）——写门（非测试缝）若不清缓存，下文必读到陈值
  assert.equal(conv.loadProjectDeclaration(proj).declared, false, "写前：声明回退（陈值入 _cache）")
  assert.deepEqual(declaredIndexScope(proj), [], "写前：无档 ⇒ 零条目（陈值入 _scopeCache）")

  // ① init（建档成功路径）⇒ 锚条目即时出现——不调 clearDeclarationCache()（测试缝）
  const initOut = await manifestTool.execute({ action: "init", target: proj }, CTX)
  assert.match(initOut, /created default manifest/, "init 成功（写门放行）")
  const afterInit = declaredIndexScope(proj)
  assert.equal(afterInit.length, 1, "init 后（零重启）：锚条目即时出现（写门已清缓存）")
  assert.equal(afterInit[0].root, proj, "条目根 = 档所在目录")
  assert.deepEqual([...afterInit[0].codePaths], ["src"], "默认档新值生效（非陈值）")
  assert.equal(isInDeclaredScope("src/a.mjs", afterInit, proj), true, "谓词随新档即时判真")

  // ② write（改档成功路径）⇒ 声明 ∥ 范围逐字随动（旧值 src ⇒ 新值 lib——零重启）
  const writeOut = await manifestTool.execute({ action: "write", target: proj, key: "codePaths", value: '["lib"]' }, CTX)
  assert.match(writeOut, /set codePaths/, "write 成功（写门放行）")
  const afterWrite = declaredIndexScope(proj)
  assert.deepEqual([...afterWrite[0].codePaths], ["lib"], "write 后：新值即时（旧值 src 不得还魂）")
  assert.equal(conv.loadProjectDeclaration(proj).declared, true, "声明缓存（loadProjectDeclaration）同缝随动")
  assert.deepEqual([...conv.loadProjectDeclaration(proj).codePaths], ["lib"], "声明值逐字随动")
  assert.equal(isInDeclaredScope("lib/a.mjs", afterWrite, proj), true, "新段面即时判真")
  assert.equal(isInDeclaredScope("src/a.mjs", afterWrite, proj), false, "旧段面即时失效")

  // ③ 拒路径（写门失败）⇒ 盘零变 ∥ 范围照旧（失败路径不清——语义等值面）
  await assert.rejects(manifestTool.execute({ action: "write", target: proj, key: "noSuchKey", value: "1" }, CTX), /refused/, "白名单外键 ⇒ 拒")
  assert.deepEqual([...declaredIndexScope(proj)[0].codePaths], ["lib"], "拒后范围照旧（与盘一致）")
})
