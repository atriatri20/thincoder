/**
 * batch-ledger-bind.test.mjs — 集成用例 13-1 … 13-6（RTM CLI 端故事 13「建批档就有台账」）。
 *
 * 判据原文 = `test/RTM.md` 第 13 节；机制 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.4。
 * **进入口 = 父侧 `batch` 工具**（create 的真实调用面）——断言的是**终态**（档在盘 + 行在途 + 档头真实 #N），
 * 事务内步序不进判据（§2.4 末条）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-ledger-bind.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool, configureBatchSegment, resetBatchSegment } from "../../thincoder-core/agent-tools/batch.mjs"
import { appendLedgerNoToHeader } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"
const { _setLedgerDirForTest, _resetLedgerDirForTest, ledgerAdd, ledgerDbPath, ledgerQuery, ledgerUpdate } = await import("../../thincoder-core/ledger.mjs")

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const SCRATCH = join(ROOT, ".thincoder/tmp")
const ledgerDir = mkdtempSync(join(SCRATCH, "bind-ledger-"))
_setLedgerDirForTest(ledgerDir)
const fixtures = []
after(() => {
  _resetLedgerDirForTest()
  for (const p of fixtures) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

function makeProject(tag) {
  mkdirSync(SCRATCH, { recursive: true })
  const root = mkdtempSync(join(SCRATCH, `bind-${tag}-`))
  fixtures.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  return root
}
const ctxOf = (root) => ({ depth: 0, agent: { cwd: root, config: { agent: { engineering: true } } } })
/** 收口用 ctx：`engineering: false` ⇒ 零设计凭证段（本例只断言理由引文行）。 */
const closeCtxOf = (root) => ({ depth: 0, agent: { cwd: root, config: { agent: { engineering: false } } } })
/** 补齐收口链（§2 / §3 / §4 / §6 各有内容 + §3 状态行 = 评审通过）—— 13-4 要跑真收口。 */
function fillChain(root, rel) {
  const abs = join(root, rel)
  const out = []
  for (const line of readFileSync(abs, "utf8").split("\n")) {
    const m = /^## §(\d)/.exec(line)
    if (!m) { out.push(line); continue }
    out.push(line, "", `集成夹具内容（§${m[1]}）。`, "")
    if (m[1] === "3") out.push("**状态行**：评审通过", "")
  }
  writeFileSync(abs, out.join("\n"))
}
const tool = batchTool(null)
const rowsOf = (root) => ledgerQuery({ cwd: root, boundary: root })
const headerOf = (root, rel) => readFileSync(join(root, rel), "utf8").split("\n").find((l) => l.startsWith("> 台账"))

test("CLI 13-1 不传 ledger 建一档 ⇒ 台账 +1 行 在途 · task_book = 该档 · 档头写真实 #N", async () => {
  const root = makeProject("13-1")
  // 题设补一格（§9 delta · 13-1「同面无未决行**且无预定行**」）：有预定行时走 13-5 的认领径
  assert.equal(rowsOf(root).filter((r) => (r.task_book ?? "").endsWith("（预定）")).length, 0, "题设：库里没有预定行")
  assert.equal(rowsOf(root).length, 0)
  await tool.execute({ action: "create", path: "docs/batches/t.md", topic: "t", source: "集成夹具" }, ctxOf(root))
  const rows = rowsOf(root)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].status, "在途")
  assert.equal(rows[0].task_book, "docs/batches/t.md")
  assert.equal(rows[0].trigger, "归批")
  assert.match(headerOf(root, "docs/batches/t.md"), new RegExp(`^> 台账 = #${rows[0].id}（`))
  assert.doesNotMatch(headerOf(root, "docs/batches/t.md"), /#<编号>/, "没有占位残留")
})

test("CLI 13-2 传 待讨论 号 ⇒ 该行 在途 + 指针回填（不新建行）", async () => {
  const root = makeProject("13-2")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "已排的活" }, boundary: root })
  await tool.execute({ action: "create", path: "docs/batches/u.md", topic: "u", source: "集成夹具", ledger: `#${id}` }, ctxOf(root))
  const rows = rowsOf(root)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, id)
  assert.equal(rows[0].status, "在途")
  assert.equal(rows[0].task_book, "docs/batches/u.md")
})

test("CLI 13-3 传 已核销 号 ⇒ 拒，档零落盘、行零改", async () => {
  const root = makeProject("13-3")
  // 造一条带工作证据的已核销行
  writeFileSync(join(root, "docs/batches/old.md"), "# 老批\n\n## §1 讨论（主 agent）\n**状态行**：已收口 2026-10-26\n\n## §3 设计评审（评审子代理）\n**状态行**：评审通过\n")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "老账", task_book: "docs/batches/old.md", trigger: "归批", evidence: "工作完成证据" }, boundary: root })
  const { ledgerUpdate, ledgerClose } = await import("../../thincoder-core/ledger.mjs")
  ledgerUpdate({ cwd: root, id, patch: { status: "待设计" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "在途" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "待核销" }, boundary: root })
  ledgerClose({ cwd: root, id, status: "已核销", boundary: root, agent: {} })
  const before = rowsOf(root).find((r) => r.id === id)
  await assert.rejects(
    () => tool.execute({ action: "create", path: "docs/batches/new.md", topic: "new", source: "集成夹具", ledger: `#${id}` }, ctxOf(root)),
    (e) => /is 已核销 — an archived row cannot carry a new batch record/.test(e.message),
  )
  assert.equal(existsSync(join(root, "docs/batches/new.md")), false, "档零落盘")
  assert.deepEqual(rowsOf(root).find((r) => r.id === id), before, "行零改")
})

test("CLI 13-4 同面有未决行：省略 ledger ⇒ 拒并列该行（零写）；携 newDebt ⇒ 档落盘 + 理由入 evidence", async () => {
  const root = makeProject("13-4")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "池里的旧欠条", board: "core" }, boundary: root })
  const before = rowsOf(root)
  await assert.rejects(
    () => tool.execute({ action: "create", path: "docs/batches/v.md", topic: "v", source: "集成夹具", board: "core" }, ctxOf(root)),
    (e) => {
      assert.match(e.message, /^batch: 1 unsettled row\(s\) already exist on this face/)
      assert.ok(e.message.includes(`  #${id} 待讨论 池里的旧欠条`), "拒文列该行")
      return true
    },
  )
  assert.equal(existsSync(join(root, "docs/batches/v.md")), false, "批档零落盘")
  assert.deepEqual(rowsOf(root), before, "台账零行写入")
  await tool.execute({ action: "create", path: "docs/batches/v.md", topic: "v", source: "集成夹具", board: "core", newDebt: "这是另一件事" }, ctxOf(root))
  const created = rowsOf(root).find((r) => r.task_book === "docs/batches/v.md")
  assert.equal(created.evidence, "新事理由：这是另一件事", "理由入新行 evidence")
  assert.equal(created.status, "在途")
  // 理由读面：本批收口回执引一行（设计档 LEDGER.md §6.3「理由的读面与时点」）
  fillChain(root, "docs/batches/v.md")
  const receipt = await tool.execute({ action: "close", path: "docs/batches/v.md", completed: [created.id], closeEvidence: "夹具收口证据" }, closeCtxOf(root))
  assert.ok(receipt.includes(`  新事理由（#${created.id}）：这是另一件事`), "本批收口回执引该理由一行")
})

test("CLI 13-5 预定批指针：标记值可登记；标记指在盘档 / 去标记指未建档 ⇒ 拒；建档认领同一行；两条指一档 ⇒ 拒并点名", async () => {
  const root = makeProject("13-5")
  const MARK = "（预定）"
  const reserved = `docs/batches/w.md${MARK}`
  // ① 先登记意图：带标记且所指档未建 ⇒ 通过（`taskBookOnDisk` 读 false，是读数不是闸门）
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "预定的活", task_book: reserved, trigger: "归批" }, boundary: root })
  assert.equal(rowsOf(root).find((r) => r.id === id).task_book, reserved)
  assert.equal(rowsOf(root).find((r) => r.id === id).taskBookOnDisk, false)
  // ② 同值去掉标记 ⇒ 既有串逐字拒（档未建）
  await assert.rejects(
    () => ledgerTool.execute({ action: "update", id, task_book: "docs/batches/w.md" }, ctxOf(root)),
    (e) => /task_book 指向的档不存在：docs\/batches\/w\.md/.test(e.message),
  )
  // ③ 标记指在盘档 ⇒ 拒（标记多余）
  writeFileSync(join(root, "docs/batches/on-disk.md"), "# 在盘\n")
  await assert.rejects(
    () => ledgerTool.execute({ action: "update", id, task_book: `docs/batches/on-disk.md${MARK}` }, ctxOf(root)),
    (e) => e.message === `task_book：预定指针所指的档已在盘（去掉「（预定）」标记即可）：docs/batches/on-disk.md${MARK}`,
  )
  // ④ 建档 ⇒ 认领同一行（不开新行）、指针变规范形、行 在途
  const created = await tool.execute({ action: "create", path: "docs/batches/w.md", topic: "w", source: "集成夹具" }, ctxOf(root))
  assert.match(created, /claimed/, `回执点名认领：${created}`)
  const mine = rowsOf(root).filter((r) => r.task_book === "docs/batches/w.md")
  assert.equal(mine.length, 1, "只有认领的那一行，没有新开行")
  assert.equal(mine[0].id, id)
  assert.equal(mine[0].status, "在途")
  assert.match(headerOf(root, "docs/batches/w.md"), new RegExp(`^> 台账 = #${id}（`), "档头写的就是认领到的号")
  // ⑤ 两条预定行指同一档 ⇒ create 拒并逐行点名（先清掉上一步的认领，才回到「两条预定」的形）
  const root2 = makeProject("13-5b")
  const a = ledgerAdd({ cwd: root2, row: { kind: "tech_todo", title: "甲", task_book: `docs/batches/z.md${MARK}`, trigger: "归批" }, boundary: root2 })
  const b = ledgerAdd({ cwd: root2, row: { kind: "tech_todo", title: "乙", task_book: `docs/batches/z.md${MARK}`, trigger: "归批" }, boundary: root2 })
  await assert.rejects(
    () => tool.execute({ action: "create", path: "docs/batches/z.md", topic: "z", source: "集成夹具" }, ctxOf(root2)),
    (e) => {
      assert.match(e.message, /^batch: 2 reserved ledger rows point at docs\/batches\/z\.md/)
      assert.ok(e.message.includes(`  #${a} 待讨论 甲`), "逐行点名甲")
      assert.ok(e.message.includes(`  #${b} 待讨论 乙`), "逐行点名乙")
      return true
    },
  )
  assert.equal(existsSync(join(root2, "docs/batches/z.md")), false, "批档零落盘")
})

test("CLI 13-6 档头号集对 items：解绑行不误报；缺号命中 header-row-missing；删号后恢复一致", async () => {
  const root = makeProject("13-6")
  const rel = "docs/batches/h.md"
  await tool.execute({ action: "create", path: rel, topic: "h", source: "集成夹具" }, ctxOf(root))
  const first = rowsOf(root)[0]
  const attached = await tool.execute({ action: "attach", path: join(root, rel), title: "补挂的新事", newDebt: "这是另一件事" }, ctxOf(root))
  assert.match(attached, /batch: attached ledger row/)
  const second = rowsOf(root).find((r) => r.id !== first.id)
  // 退回边合法解绑：行仍在 items、档头仍登记它，不得被判成缺行。
  ledgerUpdate({ cwd: root, id: second.id, patch: { status: "待讨论", evidence: "退回等待" }, boundary: root })
  const unbound = await tool.execute({ action: "check", path: join(root, rel) }, ctxOf(root))
  assert.match(unbound, /  record = open · rows = 1 · consistent = true/)
  assert.match(unbound, new RegExp(`headerRows #${second.id} inLedger = true`))
  const missing = 900000001
  const abs = join(root, rel)
  const withMissing = appendLedgerNoToHeader(readFileSync(abs, "utf8"), missing).src
  writeFileSync(abs, withMissing)
  const bad = await tool.execute({ action: "check", path: abs }, ctxOf(root))
  assert.match(bad, /consistent = false/)
  assert.match(bad, new RegExp(`headerRows #${missing} inLedger = false`))
  assert.match(bad, /header-row-missing/)
  assert.match(bad, /主路径 = 把该号从档头 台账 行删掉/)
  assert.match(bad, /次路 = 重跑 attach/)
  assert.match(bad, /同面还有未决行时须带显式 ledger:/)
  // 主路径 = 普通文档写删号；本批仍只有第一条在途行，六类均不命中。
  writeFileSync(abs, withMissing.replace(` · #${missing}`, ""))
  const good = await tool.execute({ action: "check", path: abs }, ctxOf(root))
  assert.match(good, /  record = open · rows = 1 · consistent = true/)
  assert.doesNotMatch(good, /header-row-missing|closed-but-open-rows|closed-but-settling|open-but-unwritable|open-but-settled|pointer-stale/)
  assert.match(good, new RegExp(`headerRows #${first.id} inLedger = true`))

  // attach 残态整链：档头写盘后同步置只读，UPDATE 触发器再炸 ⇒ 回写失败、第二串与第六类同拍出现。
  const residualRoot = makeProject("13-6-attach-residual")
  await tool.execute({ action: "create", path: rel, topic: "h", source: "集成夹具" }, ctxOf(residualRoot))
  const { DatabaseSync } = await import("node:sqlite")
  const db = new DatabaseSync(ledgerDbPath(residualRoot, residualRoot))
  db.exec("CREATE TRIGGER p02_attach_fail BEFORE UPDATE ON items FOR EACH ROW WHEN NEW.status = '在途' BEGIN SELECT RAISE(ABORT, 'injected: attach ledger failure'); END")
  configureBatchSegment({ onWrite: (_agent, target) => chmodSync(target, 0o444) })
  let attachErr = null
  try {
    attachErr = await tool.execute({ action: "attach", path: join(residualRoot, rel), title: "会留下残号的新事", newDebt: "独立的另一件事" }, ctxOf(residualRoot)).then(() => null, (e) => e)
  } finally {
    resetBatchSegment()
    try { db.exec("DROP TRIGGER IF EXISTS p02_attach_fail") } finally { db.close() }
    chmodSync(join(residualRoot, rel), 0o644)
  }
  assert.ok(attachErr)
  assert.match(attachErr.message, /^batch: attach failed — 台账事务未提交（injected: attach ledger failure）；档头回滚也失败（.+）——半状态成立：档头留着 #\d+，台账里没有这一行。/)
  const missingId = Number(/档头留着 #(\d+)/.exec(attachErr.message)?.[1])
  assert.ok(Number.isInteger(missingId) && missingId > 0)
  assert.ok(attachErr.message.includes("it names header-row-missing"))
  const residual = await tool.execute({ action: "check", path: join(residualRoot, rel) }, ctxOf(residualRoot))
  assert.match(residual, /consistent = false/)
  assert.match(residual, new RegExp(`headerRows #${missingId} inLedger = false`))
  assert.match(residual, /header-row-missing/)
  const residualSrc = readFileSync(join(residualRoot, rel), "utf8")
  writeFileSync(join(residualRoot, rel), residualSrc.replace(` · #${missingId}`, ""))
  assert.match(await tool.execute({ action: "check", path: join(residualRoot, rel) }, ctxOf(residualRoot)), /  record = open · rows = 1 · consistent = true/)
})
