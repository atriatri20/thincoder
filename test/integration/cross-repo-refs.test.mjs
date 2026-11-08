/**
 * cross-repo-refs.test.mjs — 集成用例 37-1 … 37-4（RTM CLI 端故事 37「声明出边：可引用谁由 publicRepos 定」）。
 *
 * 判据原文 = `test/RTM.md` 故事索引表 CLI 37 行 + `test/rtm/paths.md` 的 37 节；
 * 机制 = `docs/core/design/PATH-RESOLUTION.md` §2.7（声明仓引用：核 ∥ 未核 ∥ 红 · 环检 · 叶仓）。
 * 业务入口 = 真工具调用（`doc_check` ∥ `ledger`），断言的是**报面文本与退出形**（首行 verdict + 行形），
 * 不是内部函数返回值。夹具 = 系统临时域（零落仓 + 并发免疫）；台账缝 `_setLedgerDirForTest` 隔离真实用户目录。
 *
 * 四行对应关系（行号 = RTM 定死的号）：
 * 37-1 声明不免除存在性（但只在根在盘这一格）· 37-2 未声明即拒（文档面拒 / 台账面仍硬拒）·
 * 37-3 方向成环即拒 · 叶仓被声明后可解析 · 37-4 判不了就列报（未核）与「没看」在报面上分得开。
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"

const { clearDeclarationCache } = await import("../../thincoder-core/declaration.mjs")
const ledgerM = await import("../../thincoder-core/ledger.mjs")
const ledgerAdd = ledgerM.ledgerAdd

const LEDGER_DIR = mkdtempSync(join(tmpdir(), "cr-int-ledger-"))
ledgerM._setLedgerDirForTest(LEDGER_DIR)
const TMP = []
after(() => {
  ledgerM._resetLedgerDirForTest()
  removeTempDirBestEffort(LEDGER_DIR)
  for (const d of TMP) removeTempDirBestEffort(d)
})

/** 项目夹具：`docRoot` 五键齐（裸档名要能经 `docRoot` 各键找到）；`publicRepos` = 本仓的声明出边。 */
const manifestOf = (publicRepos = []) => JSON.stringify({
  version: 1,
  phase: "initial-dev",
  docRoot: {
    requirements: "docs/core/requirements",
    specs: "docs/core/specs",
    design: "docs/core/design",
    modules: "docs/core/modules",
    batches: "docs/batches",
    standards: null,
  },
  codePaths: ["thincoder-core"],
  index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos },
}, null, 2)

function put(root, rel, body = "# x\n") {
  const abs = join(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, body)
  return abs
}

/** 建一个 `parent/` 域：`repos` = { 目录名 → { publicRepos?, hasManifest?, files? } }。 */
function makeWorld(repos) {
  const parent = mkdtempSync(join(tmpdir(), "cr-int-"))
  TMP.push(parent)
  for (const [name, spec] of Object.entries(repos)) {
    const root = join(parent, name)
    mkdirSync(root, { recursive: true })
    if (spec.hasManifest !== false) writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestOf(spec.publicRepos ?? []))
    for (const [rel, body] of Object.entries(spec.files ?? {})) put(root, rel, body)
  }
  return { parent, at: (name) => join(parent, name) }
}

const ctx0 = (root) => ({ depth: 0, agent: { cwd: root, config: { agent: { engineering: true } }, planMode: false, autoApprove: false } })
const run = (root, doc, mode) => String(docCheckTool.execute({ mode, docs: [doc], target: root }, ctx0(root)))
const firstLine = (text) => text.split("\n")[0]

/** 种一行未决账（台账面用法与既有夹具同形）。 */
async function seedRow(root, recordRel) {
  put(root, recordRel, "# 夹具批 · 跨仓引用\n\n## §1 讨论（主 agent）\n**状态行**：🔄 进行中（…）\n")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具批 · 跨仓引用" }, boundary: root })
  await ledgerTool.execute({ action: "update", id, status: "在途", task_book: recordRel }, ctx0(root))
  return id
}

// ── 37-1 声明不免除存在性（但只在「声明根在本机」这一格）──────────────────────
test('CLI 37-1 文档门 × 声明出边：A 声明 ../B 且 B 在机 —— 指在盘档 ⇒ PASS；指缺档 ⇒ 锚·档缺 + 首行 REFUSED', { timeout: 60_000 }, async () => {
  const w = makeWorld({
    A: {
      publicRepos: ["../B"],
      files: {
        "docs/core/design/ok.md": "# 在盘\n\n① B/docs/guide.md\n",
        "docs/core/design/miss.md": "# 缺档\n\n① B/docs/gone.md\n",
      },
    },
    B: { publicRepos: [], files: { "docs/guide.md": "# 对面仓\n\n## 1. 一节\n" } },
  })
  const A = w.at("A")

  const ok = run(A, "docs/core/design/ok.md", "gate")
  assert.equal(firstLine(ok), "DOC-CHECK GATE: PASS", `已声明且根在盘、档在盘 ⇒ 零命中；实际：${ok}`)

  const miss = run(A, "docs/core/design/miss.md", "report")
  assert.match(miss, /✗ 锚·档缺 docs\/core\/design\/miss\.md:3 `B\/docs\/gone\.md`/, `声明不免除存在性；实际：${miss}`)
  assert.match(miss, /声明仓 B（声明根 \.\.\/B，本机在盘：在）/, `点名声明仓与「根在盘」；实际：${miss}`)
  assert.equal(firstLine(run(A, "docs/core/design/miss.md", "gate")), "DOC-CHECK GATE: REFUSED（锚 1 条）", "缺档进闸")
})

// ── 37-2 未声明即拒（文档面拒；台账面同形指针仍硬拒——两面判的不是一件事）──────────
test('CLI 37-2 文档门 × 同级目录：未声明仓名 ⇒ 锚·档缺 + 未声明注解 + 同级候选；同输入改台账面仍硬拒', { timeout: 60_000 }, async () => {
  const w = makeWorld({
    A: { publicRepos: [], files: { "docs/core/design/undeclared.md": "# 未声明\n\n① C/docs/leaf.md\n" } },
    C: { hasManifest: false, files: { "docs/leaf.md": "# 叶仓\n" } },
  })
  const A = w.at("A")

  const report = run(A, "docs/core/design/undeclared.md", "report")
  assert.match(report, /✗ 锚·档缺 docs\/core\/design\/undeclared\.md:3 `C\/docs\/leaf\.md`/, `未声明即拒；实际：${report}`)
  assert.match(report, /本机同级目录：.*C/, `列同级候选；实际：${report}`)
  assert.match(report, /该名未在 index\.publicRepos 声明/, `点名未声明；实际：${report}`)
  assert.equal(firstLine(run(A, "docs/core/design/undeclared.md", "gate")), "DOC-CHECK GATE: REFUSED（锚 1 条）", "未声明进闸")

  // 台账面：同形跨仓指针（task_book 指向未声明仓）⇒ 写门硬拒（L4 判据零改）。`cwd` 显式给仓根——
  // 不给则台账面按 task_book 的目录推起算点，而那目录本身就不存在（拒因会变成「项目目录不存在」）。
  await seedRow(A, "docs/batches/2026-11-08-x.md")
  const id = ledgerAdd({ cwd: A, row: { kind: "tech_todo", title: "夹具行 · 跨仓指针" }, boundary: A })
  await assert.rejects(
    () => ledgerTool.execute({ action: "update", cwd: A, id, status: "在途", task_book: "C/docs/leaf.md" }, ctx0(A)),
    /task_book 指向的档不存在/,
    "台账面跨仓指针硬拒（文档面认声明表，台账面不认）",
  )
})

// ── 37-3 方向：成环即拒；叶仓（无 manifest）被声明后其档可解析 ─────────────────
test('CLI 37-3 文档门 × 出边图：A ↔ B 互声明 ⇒ 锚·环引 + REFUSED；叶仓被声明 ⇒ 零环引且其档可解析', { timeout: 60_000 }, async () => {
  const club = makeWorld({
    A: { publicRepos: ["../B"], files: { "docs/core/design/plain.md": "# 正文\n\n无指针一段。\n" } },
    B: { publicRepos: ["../A"], files: {} },
  })
  const ring = run(club.at("A"), "docs/core/design/plain.md", "gate")
  assert.match(ring, /✗ 锚·环引 PROJECT-MANIFEST\.json（.*A）publicRepos 成环：A → B → A/, `成环即拒、链写全；实际：${ring}`)
  assert.equal(firstLine(ring), "DOC-CHECK GATE: REFUSED（锚 1 条）", "环与档缺同计锚")

  // 叶仓：C 无 manifest、被 A 声明 ⇒ 零环引，且 C 内的在盘档照常可解析
  const leaf = makeWorld({
    A: { publicRepos: ["../C"], files: { "docs/core/design/leaf-ref.md": "# 叶仓引用\n\n① C/docs/leaf.md\n" } },
    C: { hasManifest: false, files: { "docs/leaf.md": "# 叶仓\n" } },
  })
  const leafReport = run(leaf.at("A"), "docs/core/design/leaf-ref.md", "gate")
  assert.equal(firstLine(leafReport), "DOC-CHECK GATE: PASS", `叶仓被声明后可解析；实际：${leafReport}`)
  assert.doesNotMatch(leafReport, /锚·环引/, "叶仓没有出边 ⇒ 零环引")
})

// ── 37-4 判不了就列报（未核）：与「没看」在报面上分得开 ─────────────────────
test('CLI 37-4 文档门 × 本机缺仓：声明根不在本机 ⇒ 未核 1 条（列报不入闸）、首行 PASS；删掉声明再跑 ⇒ 锚·档缺 + REFUSED', { timeout: 60_000 }, async () => {
  const w = makeWorld({
    A: { publicRepos: ["../Ghost"], files: { "docs/core/design/ghost-ref.md": "# 缺仓\n\n① Ghost/docs/guide.md\n" } },
  })
  const A = w.at("A")

  const report = run(A, "docs/core/design/ghost-ref.md", "report")
  assert.match(report, /未核 1 条（声明源缺位——列报不入闸）/, `判不了就列报；实际：${report}`)
  assert.match(report, /未核（声明源缺位）  仓 Ghost：声明根 .*Ghost 本机不存在（声明项 = \.\.\/Ghost）  触发 = .*ghost-ref\.md:3 `Ghost\/docs\/guide\.md`/, `逐声明根一行、点名指针；实际：${report}`)
  assert.match(report, /环走查止步（该根无出边可读）/, `同一行的「触发」另半边（两个产出方共用一形）；实际：${report}`)
  assert.doesNotMatch(report, /✗ 锚·/, `未核不落锚命中；实际：${report}`)
  assert.equal(firstLine(run(A, "docs/core/design/ghost-ref.md", "gate")), "DOC-CHECK GATE: PASS", "未核不入闸")

  // 同一指针删掉声明再跑 ⇒ 它就是一条普通的悬空指针（「判不了」与「没看」两跑并置）
  writeFileSync(join(A, "PROJECT-MANIFEST.json"), manifestOf([]))
  clearDeclarationCache()
  const after = run(A, "docs/core/design/ghost-ref.md", "gate")
  assert.match(after, /✗ 锚·档缺 docs\/core\/design\/ghost-ref\.md:3/, `删掉声明 ⇒ 判缺；实际：${after}`)
  assert.equal(firstLine(after), "DOC-CHECK GATE: REFUSED（锚 1 条）", "删掉声明后进闸")
  assert.doesNotMatch(after, /未核 1 条/, "声明不在 ⇒ 没有「判不了」这一形")
  // 落盘文本读回（夹具自身也是被判档的一半证据）
  assert.match(readFileSync(join(A, "docs/core/design/ghost-ref.md"), "utf8"), /Ghost\/docs\/guide\.md/, "夹具档在盘")
})