/**
 * path-resolution.test.mjs — 集成用例 29-1 … 29-4（RTM CLI 端故事 29「路径解析统一层」）。
 *
 * 判据原文 = `test/rtm/paths.md` 第 29 节；机制 = `docs/core/design/PATH-RESOLUTION.md` §2。
 * 业务入口全部是真工具调用（`batch` / `ledger` / `doc_check`），断言的是**回执文本与落盘结果**——
 * 不是内部函数返回值。夹具 = 系统临时域（零落仓 + 并发免疫）；台账缝 `_setLedgerDirForTest` 隔离真实用户目录。
 *
 * 四行对应关系（行号 = RTM 定死的号）：
 * 29-1 裸档名 ⇒ 批档写入落盘、门不再判档缺 · 29-2 三面同一句报明（拒 + 候选全列）·
 * 29-3 仓外一律不判（出仓的在盘 ∥ 不在盘都零输出）· 29-4 同名多处在册算「在」、零命中照拒。
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"

const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerAdd } = await import("../../thincoder-core/ledger.mjs")

const LEDGER_DIR = mkdtempSync(join(tmpdir(), "pr-int-ledger-"))
_setLedgerDirForTest(LEDGER_DIR)
const TMP = []
after(() => {
  _resetLedgerDirForTest()
  removeTempDirBestEffort(LEDGER_DIR)
  for (const d of TMP) removeTempDirBestEffort(d)
})

const BATCH_SKELETON = [
  "# 夹具批 · 路径解析",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中（…）",
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "## §4 用户批准（主 agent）",
  "",
  "## §5 实施记录（eng-coder）",
  "",
  "## §6 验证与收口（父代理）",
  "",
].join("\n")

/** 项目夹具：`docRoot` 五键齐（裸档名要能经 `docRoot.batches` / `docRoot` 各键找到）。 */
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

function makeProject(files = {}, publicRepos = []) {
  // **建在私有父目录下**（`<私有>/proj`）：夹具根不直接落在 `tmpdir()` 下，免得同级目录里的东西
  // （别的夹具、系统临时物件）参与判定——每个夹具只答自己那一档的事。
  const parent = mkdtempSync(join(tmpdir(), "pr-int-proj-"))
  TMP.push(parent)
  const root = join(parent, "proj")
  mkdirSync(root, { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestOf(publicRepos))
  for (const [rel, body] of Object.entries(files)) put(root, rel, body)
  return root
}

function put(root, rel, body = "# x\n") {
  const abs = join(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, body)
  return abs
}

const agentOf = (root) => ({ cwd: root, config: { agent: { engineering: true } }, planMode: false, autoApprove: false })
const ctx0 = (root) => ({ depth: 0, agent: agentOf(root) })

// ── 29-1 唯一项目根 + 裸档名 ⇒ 批档写入落盘，门不再判档缺 ────────────────────
test('CLI 29-1 父侧 batch append：裸档名定位批档 ⇒ 写入落盘，文档门不再判档缺', { timeout: 60_000 }, async (t) => {
  const root = makeProject({ "docs/batches/2026-11-02-bare.md": BATCH_SKELETON })
  put(root, "docs/batches/bare-ref.md", "# 被引档\n\n正文。\n")
  await seedRow(root, "docs/batches/2026-11-02-bare.md")
  const tool = batchTool(null)

  const receipt = String(await tool.execute(
    { action: "append", path: "2026-11-02-bare.md", segment: "§1", text: "举证：bare-ref.md 这一笔已核对。" },
    ctx0(root),
  ))
  assert.match(receipt, /appended/, `裸档名定位成"可读批档"并写入，实际：${receipt}`)
  assert.doesNotMatch(receipt, /DOC-CHECK GATE: REFUSED/, `门不再判档缺，实际：${receipt}`)
  assert.match(readFileSync(join(root, "docs/batches/2026-11-02-bare.md"), "utf8"), /bare-ref\.md 这一笔已核对/, "文本已落盘")
})

// ── 29-2 各一笔报明：三面（批档 / 台账 / 文档门）在工作区锚下都拒（文档门面 = 点名 `target`） ─────
test('CLI 29-2 工作区锚：批档 / 台账 / 文档门三面各一笔报明形——拒（文档门面 = 点名 `target`）', { timeout: 60_000 }, async (t) => {
  const ws = mkdtempSync(join(tmpdir(), "pr-int-ws-"))
  TMP.push(ws)
  for (const name of ["pa", "pb"]) {
    mkdirSync(join(ws, name), { recursive: true })
    writeFileSync(join(ws, name, "PROJECT-MANIFEST.json"), manifestOf())
  }
  const batch = batchTool(null)
  const ledger = ledgerTool
  const docCheck = docCheckTool

  // ① 批档读面：相对形判不出唯一 ⇒ 候选项名两个项目
  await assert.rejects(
    () => batch.execute({ action: "status", path: "docs/batches/x.md", value: "进行中" }, ctx0(ws)),
    (e) => /not a readable file/.test(e.message) && /Candidates: .*pa.*pb/.test(e.message),
    "批档面拒 + 候选全列",
  )
  // ② 台账读面：无根 ⇒ 报明 + 下辖候选
  await assert.rejects(
    () => ledger.execute({ action: "count" }, ctx0(ws)),
    (e) => /未找到项目根/.test(e.message) && /下辖候选项目：.*pa.*pb/.test(e.message),
    "台账面拒 + 候选全列",
  )
  // ③ 文档门：`target` 必填——不传 ⇒ 拒、报文点名 `target`（不再走歧义支：首行不是 gate ERROR 串）
  const gate = String(docCheck.execute({ mode: "gate", docs: [] }, ctx0(ws)))
  assert.match(gate, /^doc_check: `target` is required/, `文档门面拒、报文点名 target，实际：${gate}`)
  assert.doesNotMatch(gate, /DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）/, `target 必填后不再走歧义支，实际：${gate}`)
})

// ── 29-3 仓外一律不判（需求 F4 ∥ AC-4）──────────────────────────────
// 判据单源 = `docs/core/design/DOC-CHECK.md` §4「仓外一律不看」：`../` 开头的 token 一个字都不出——
// 在盘的不报、不在盘的也不报（门不知道别的仓长什么样）。反向控制：仓内真悬空照拦。
test('CLI 29-3 仓外一律不判：`../` 出仓（在盘 ∥ 不在盘）零输出、首行 PASS；仓内真悬空照拒', { timeout: 60_000 }, async () => {
  const root = makeProject({
    "docs/outside.md": "# 域外两条\n\n① ../../outside/docs/hit.md\n\n② ../../outside/docs/miss.md\n",
    "docs/inside.md": "# 仓内真悬空（反向控制）\n\n① docs/ghost-in-proj.md\n",
  })
  // 域外那一侧放一份**真实存在**的档：在盘与不在盘两种都零输出，才是「一律不判」
  mkdirSync(join(dirname(root), "outside", "docs"), { recursive: true })
  writeFileSync(join(dirname(root), "outside", "docs", "hit.md"), "# 域外在盘档\n")
  // 判据走**诊断面**（`report` = 判整份）：`gate` 只判本批变更区，而这里没有绑定的批档 —— 没有变更区就没东西可判。
  const run = (doc) => String(docCheckTool.execute({ mode: "report", docs: [doc], target: root }, ctx0(root)))

  const out = run("docs/outside.md")
  assert.equal(out.split("\n")[0], "DOC-CHECK GATE: PASS", `仓外两条都不判：${out}`)
  assert.doesNotMatch(out, /这个档不存在/, `仓外连命中行都不出：${out}`)

  // 反向控制：仓外不判不是「凡解不到就不判」——仓内真悬空照拦（红侧）
  const inside = run("docs/inside.md")
  assert.match(inside, /DOC-CHECK GATE: REFUSED/, `仓内真悬空照拦：${inside}`)
  assert.match(inside, /docs\/inside\.md docs\/ghost-in-proj\.md/, `命中行点名该档与该 token：${inside}`)
})

// ── 29-4「有就行」，不判唯一（用户 2026-11-12 裁定）──────────────────
// 判据单源 = `docs/core/design/DOC-CHECK.md` §3：仓内任一档以该 token 结尾 ⇒ 在，不报；
// 一份都没有 ⇒ 报。红绿并置：只留绿侧的话，把判据关掉的实现也能绿。
test('CLI 29-4 同名多处在册 ⇒ 零输出、首行 PASS（不判唯一）；仓内零命中 ⇒ 拒、点名该 token', { timeout: 60_000 }, async () => {
  const root = makeProject({
    "thincoder-core/src/dup.mjs": "export {}\n",
    "thincoder-vscode/src/dup.mjs": "export {}\n",
    "docs/dup-ok.md": "# 同名两份\n\n① src/dup.mjs\n",
    "docs/dup-bad.md": "# 零命中\n\n① missing/no-such-file-xyz.mjs\n",
  })
  const run = (doc) => String(docCheckTool.execute({ mode: "report", docs: [doc], target: root }, ctx0(root)))

  const ok = run("docs/dup-ok.md")
  assert.equal(ok.split("\n")[0], "DOC-CHECK GATE: PASS", `同名两份是「在」、不是第三种结果：${ok}`)
  assert.doesNotMatch(ok, /这个档不存在/, `gate 面一个命中行都不出：${ok}`)

  const bad = run("docs/dup-bad.md")
  assert.match(bad, /DOC-CHECK GATE: REFUSED/, `零命中照拒：${bad}`)
  assert.match(bad, /docs\/dup-bad\.md missing\/no-such-file-xyz\.mjs/, `命中行点名该 token：${bad}`)
})

/** 种一行未决账（批档写门 / 台账面用法与既有夹具同形）。 */
async function seedRow(root, recordRel, { writeRecord = false } = {}) {
  if (writeRecord) put(root, recordRel, BATCH_SKELETON)
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具批 · 路径解析" }, boundary: root })
  const ledger = ledgerTool
  await ledgerTool.execute({ action: "update", id, status: "在途", task_book: recordRel }, ctx0(root))
  return id
}
