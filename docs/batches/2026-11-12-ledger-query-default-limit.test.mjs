/**
 * 2026-11-12-ledger-query-default-limit.test.mjs — 本批单测（载体 = 设计档 `docs/core/design/LEDGER.md` §7.2
 * 「分页（`query` 工具面）」条的验收 ①–⑥；收口删除）。
 *
 * 判的是**本批改动面**：`query` 分支的排序落点、游标形判、切片与尾行四态、描述面数字同步；以及核仍全量
 * （分页不落进业务读径）。夹具 = 独立项目 + 临时会话槽根 + 临时台账库目录，不触真实用户数据。
 *
 * 复跑（cwd = 仓根）：`node --test docs/batches/2026-11-12-ledger-query-default-limit.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../../test/teardown.mjs"
import { DESC } from "../../thincoder-core/tools/shared.mjs"

import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerQuery, ledgerTool, ledgerReadTool } = await import("../../thincoder-core/ledger.mjs")
// W8 契约②：node:sqlite 链只经动态 import 进入。
const { QUERY_PAGE_SIZE } = await import("../../thincoder-core/ledger-db.mjs")

const BATCH = "docs/batches/fixture.md"
const sessionsDir = mkdtempSync(join(tmpdir(), "lqp-sessions-"))
const ledgerDir = mkdtempSync(join(tmpdir(), "lqp-ledger-"))
_setSessionsDirForTest(sessionsDir)
_setLedgerDirForTest(ledgerDir)
const projects = []
after(() => {
  _resetSessionsDirForTest()
  _resetLedgerDirForTest()
  for (const p of projects) removeTempDirBestEffort(p)
  removeTempDirBestEffort(sessionsDir)
  removeTempDirBestEffort(ledgerDir)
})

/** 夹具 = 带声明的项目根（`在途` 行的 `task_book` 指针须在盘）。 */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "lqp-"))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  writeFileSync(join(root, BATCH), ["# 夹具批", "", "## §1 讨论（主 agent）", "**状态行**：🔄 进行中", ""].join("\n"))
  const agent = { cwd: root, _slot: 1, _sessionStart: "2026-11-12T00:00:00.000Z", _touchedFiles: [], config: { agent: { engineering: true } } }
  return { root, agent }
}

const ctxOf = (agent) => ({ depth: 0, agent })
const exec = (ctx, args) => ledgerTool.execute(args, ctx)

/** 排序键单源（设计档 §7.2「无时间戳行的位置」）+ 倒序 + `id` 兜底——本用例的独立预期序。 */
const sortKeyOf = (r) => r.updated_at ?? r.created_at ?? ""
const expectedOrder = (rows) =>
  [...rows].sort((a, b) => {
    const ka = sortKeyOf(a), kb = sortKeyOf(b)
    return ka === kb ? b.id - a.id : ka < kb ? 1 : -1
  })

/** 工具面回执 = JSON 行集 + 空行 + 尾行（设计档 §7.2「回执行形」）。 */
const page = async (ctx, args = {}) => {
  const text = await exec(ctx, { action: "query", ...args })
  const cut = text.indexOf("\n\n")
  return { rows: JSON.parse(text.slice(0, cut)), tail: text.slice(cut + 2) }
}
const cursorOfTail = (tail) => /cursor:"([^"]*)"\}\)$/.exec(tail)[1]

/** 种 28 行：25 条 tech_todo 推进到 `在途`（可被 `status` 过滤命中）+ 3 条 requirement 撤回 `已废弃`。 */
async function seed(ctx) {
  const inFlight = []
  for (let i = 0; i < 25; i++) {
    const { id } = JSON.parse(await exec(ctx, { action: "add", kind: "tech_todo", title: `在途-${i}`, task_book: BATCH, evidence: "夹具证据" }))
    await exec(ctx, { action: "update", id, status: "在途" })
    inFlight.push(id)
  }
  for (let i = 0; i < 3; i++) {
    const { id } = JSON.parse(await exec(ctx, { action: "add", kind: "requirement", title: `已废弃-${i}`, evidence: "夹具证据" }))
    await exec(ctx, { action: "close", id, status: "已废弃" })
  }
  return { inFlight }
}

test("验收 ①：候选 28 行、无过滤 ⇒ 首回恰 10 行 + 尾行；按尾行游标连翻，拼起来 = 候选全序（无重、无漏）", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  await seed(ctx)
  const full = expectedOrder(ledgerQuery({ cwd: root, boundary: root }))
  assert.equal(full.length, 28)

  const first = await page(ctx)
  assert.equal(first.rows.length, QUERY_PAGE_SIZE, "首回行数 = QUERY_PAGE_SIZE")
  assert.match(first.tail, /^共 28 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页：ledger\(\{action:"query", cursor:"[^"]+"\}\)$/)

  const second = await page(ctx, { cursor: cursorOfTail(first.tail) })
  assert.match(second.tail, /^共 28 行 · 第 2 页（第 11–20 行，按 updated_at 倒序）· 下一页：/)
  const third = await page(ctx, { cursor: cursorOfTail(second.tail) })
  assert.match(third.tail, /^共 28 行 · 第 3 页（第 21–28 行，按 updated_at 倒序）· 已到末页$/)

  const walked = [...first.rows, ...second.rows, ...third.rows].map((r) => r.id)
  assert.deepEqual(walked, full.map((r) => r.id), "三页拼起来 = 候选全序：无重复、无遗漏")
  assert.equal(new Set(walked).size, 28, "无重复行")
})

test("验收 ②：带 status 过滤且命中 25 行 ⇒ 同样 10 行一页（过滤不免截）；照尾行命令再调仍是同一过滤集、N 恒 25、零旁过滤行", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  const { inFlight } = await seed(ctx)

  const first = await page(ctx, { status: "在途" })
  assert.equal(first.rows.length, QUERY_PAGE_SIZE)
  assert.match(first.tail, /^共 25 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页：ledger\(\{action:"query", status:"在途", cursor:"[^"]+"\}\)$/, "尾行须回显本页生效的 status，否则照抄就丢过滤")

  const second = await page(ctx, { status: "在途", cursor: cursorOfTail(first.tail) })
  assert.match(second.tail, /^共 25 行 · 第 2 页（第 11–20 行，按 updated_at 倒序）· /)
  const third = await page(ctx, { status: "在途", cursor: cursorOfTail(second.tail) })
  assert.match(third.tail, /^共 25 行 · 第 3 页（第 21–25 行，按 updated_at 倒序）· 已到末页$/)

  const walked = [...first.rows, ...second.rows, ...third.rows]
  assert.ok(walked.every((r) => r.status === "在途"), "零旁过滤行：三页全是 在途 行")
  assert.deepEqual(walked.map((r) => r.id).sort((a, b) => a - b), [...inFlight].sort((a, b) => a - b), `${QUERY_PAGE_SIZE} 行一页把 25 行恰好走完`)

  // `cwd` 同一道理：换锚就换了库 ⇒ 回显逐字照抄
  const echoed = await page(ctx, { status: "在途", cwd: root })
  assert.ok(echoed.tail.includes(`, cwd:${JSON.stringify(root)}, cursor:"`), `尾行须回显 cwd：${echoed.tail}`)
})

test("验收 ③：游标形不合 ⇒ 拒（文案逐字）、行集零返回，且判于开库之前（同调用的无根错不打头阵）", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  await seed(ctx)
  const before = ledgerQuery({ cwd: root, boundary: root }).length

  for (const bad of ["2026-11-02T09:49:2", "2026-11-02T09:49:21.077Z|abc", "2026-11-02T09:49:21.077Z|0"]) {
    await assert.rejects(() => exec(ctx, { action: "query", cursor: bad }), (e) => {
      assert.equal(e.message, `ledger(query)：cursor 非法：${JSON.stringify(bad)}（应为「<updated_at>|<id>」，照上一页尾行原样传入）`)
      return true
    })
  }
  assert.equal(ledgerQuery({ cwd: root, boundary: root }).length, before, "拒之后零库动作：行集不变")

  // 形判在 `ledgerQuery` 之前（零库动作）：同一调用里「无根」与「游标坏」并存时，坏游标先说话
  const noProject = mkdtempSync(join(tmpdir(), "lqp-noproject-"))
  projects.push(noProject)
  await assert.rejects(
    () => exec({ depth: 0, agent: { ...agent, cwd: noProject } }, { action: "query", cwd: noProject, cursor: "2026-11-02T09:49:2" }),
    /cursor 非法/,
  )

  // 形对而游标已越过末行（比最后一行更旧）⇒ 本页无行（不是拒，也不是回首页）
  const beyond = await page(ctx, { cursor: "0000-01-01T00:00:00.000Z|1" })
  assert.deepEqual(beyond.rows, [])
  assert.equal(beyond.tail, `共 ${before} 行 · 本页无行`)
})

test("验收 ④：翻页期间插入更新时刻更晚的行 ⇒ 已发出的游标照旧，后续页不重不漏", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  await seed(ctx)
  const before = expectedOrder(ledgerQuery({ cwd: root, boundary: root }))

  const first = await page(ctx)
  const cursor = cursorOfTail(first.tail)
  const pageOneIds = first.rows.map((r) => r.id)

  const { id: newest } = JSON.parse(await exec(ctx, { action: "add", kind: "tech_todo", title: "翻页期插入" }))
  const second = await page(ctx, { cursor })

  assert.equal(second.rows[0].id, before[QUERY_PAGE_SIZE].id, "第 2 页首行 = 改前第 1 页尾行的下一行")
  assert.deepEqual(second.rows.map((r) => r.id), before.slice(QUERY_PAGE_SIZE, QUERY_PAGE_SIZE * 2).map((r) => r.id), "第 11–20 行原样续上")
  assert.equal(pageOneIds.filter((x) => second.rows.some((r) => r.id === x)).length, 0, "已读页零重复")
  assert.ok(!second.rows.some((r) => r.id === newest), "游标之上的新行不进本页")
})

test("验收 ⑤：ledger count 与尾行 <N> 各按其口径成立（未决数 ≤ <N>，且 <N> 六态全含）", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  await seed(ctx)

  const noFilter = await page(ctx)
  const counted = JSON.parse(await exec(ctx, { action: "count" }))
  assert.equal(counted.count, 25, "count 只数未决四态（28 行里 3 行已废弃）")
  assert.match(noFilter.tail, /^共 28 行 · /, "<N> = 候选集六态全含")
  assert.ok(counted.count <= 28, "未决数 ≤ <N>")
})

test("验收 ⑥：核仍全量——> 10 行时 ledgerQuery 的行数、第 11 行起的行都还在（分页不落进业务读径）", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  await seed(ctx)
  const ordered = expectedOrder(ledgerQuery({ cwd: root, boundary: root }))

  const coreRows = ledgerQuery({ cwd: root, boundary: root })
  assert.equal(coreRows.length, 28, "核返回全量：写门 / 开批同面判 / buildScan 的行集与改前等值")
  assert.ok(coreRows.some((r) => r.id === ordered[27].id), "最深位次（第 28 行）在核里看得见")
  assert.ok(coreRows.filter((r) => r.status === "在途").length > QUERY_PAGE_SIZE, "第 11 行之后仍有在途行可判——截断若落进核，写门就会对它们静默放行")

  const onePage = await page(ctx)
  assert.equal(onePage.rows.length, QUERY_PAGE_SIZE, "工具面只改模型可见的行数")
})

test("声明面与描述面：query 增 cursor（两变体）；两档文案写死的行数 = String(QUERY_PAGE_SIZE)", () => {
  assert.equal(ledgerTool.parameters.properties.cursor?.type, "string", "全量变体声明须含 cursor（否则未知键拒，调用方永远翻不了页）")
  assert.equal(ledgerReadTool.parameters.properties.cursor?.type, "string", "只读变体声明须含 cursor（子代理读的就是这一面）")

  for (const name of ["ledger", "ledger-read"]) {
    const m = /(\d+) per page/.exec(DESC(name))
    assert.ok(m, `${name} 描述面须写死每页行数（模型读不到常量）`)
    assert.equal(m[1], String(QUERY_PAGE_SIZE), `${name} 的文案数字须恒等 String(QUERY_PAGE_SIZE)`)
  }
})
