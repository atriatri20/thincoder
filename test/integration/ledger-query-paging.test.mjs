/**
 * ledger-query-paging.test.mjs — 集成用例 CLI 51-1。
 *
 * 业务入口 = 真 `ledger` 工具的 `query` action（模型读台账的那一面）。业务可观察结果 = 一次查询只把
 * 当前页的行交给模型、并把「怎么翻下一页」写在尾行里；照抄那条命令翻页仍是同一本账（过滤不丢、总数不变）；
 * `count` 与页总数各按自己口径成立；游标形不合当场拒（逐字拒文、不回首页），形对而落在末行之后只回一页空
 * （`docs/core/design/LEDGER.md` §7.2「分页（`query` 工具面）」）。
 * 判据回指 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` §④ `AC-M2-41`。
 * 夹具 = 独立项目、会话槽根与台账库目录，不触真实用户数据。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/ledger-query-paging.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerTool } = await import("../../thincoder-core/ledger.mjs")

const sessionsDir = mkdtempSync(join(tmpdir(), "lqpaging-sessions-"))
const ledgerDir = mkdtempSync(join(tmpdir(), "lqpaging-ledger-"))
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

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "lqpaging-"))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  const agent = { cwd: root, _slot: 1, _sessionStart: "2026-11-12T00:00:00.000Z", _touchedFiles: [], config: { agent: { engineering: true } } }
  return { root, agent }
}

const exec = (ctx, args) => ledgerTool.execute(args, ctx)

/** 工具面回执 = JSON 行集 + 空行 + 尾行；尾行里那条翻页命令原样取出（模型「照抄」的正是它）。 */
const page = async (ctx, args = {}) => {
  const text = await exec(ctx, { action: "query", ...args })
  const cut = text.indexOf("\n\n")
  return { rows: JSON.parse(text.slice(0, cut)), tail: text.slice(cut + 2) }
}
/** 尾行里的下一页命令 → 调用参数（只解析本用例要验的那两块：回显的 kind 与 cursor）。 */
const nextCallOf = (tail) => {
  const m = /下一页：ledger\(\{action:"query"(?:, kind:"([^"]+)")?, cursor:"([^"]+)"\}\)$/.exec(tail)
  assert.ok(m, `尾行须带翻页命令：${tail}`)
  return { kind: m[1], cursor: m[2] }
}

test("CLI 51-1 台账查询分页：超过十条只回一页，照抄尾行命令翻页仍读同一本账，count 另是一本账，游标形不合当场拒", async () => {
  const { root, agent } = fixture()
  const ctx = { depth: 0, agent }

  // 夹具：25 条技术待办 + 5 条需求；其中 3 条需求撤回已废弃 ⇒ 六态全含 30 行，未决四态 27 行
  const techTodo = []
  for (let i = 0; i < 25; i++) techTodo.push(JSON.parse(await exec(ctx, { action: "add", kind: "tech_todo", title: `技术待办-${i}` })).id)
  for (let i = 0; i < 5; i++) {
    const { id } = JSON.parse(await exec(ctx, { action: "add", kind: "requirement", title: `需求-${i}`, evidence: "夹具证据" }))
    if (i < 3) await exec(ctx, { action: "close", id, status: "已废弃" })
  }

  // ① 一次查询只把当前页交给模型：30 行候选 ⇒ 恰 10 行 + 「共 30 行 · 第 1 页 · 下一页」
  const first = await page(ctx)
  assert.equal(first.rows.length, 10, `候选 30 行时首回恰一页：${first.rows.length}`)
  assert.match(first.tail, /^共 30 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页：ledger\(\{action:"query", cursor:"[^"]+"\}\)$/)

  // ② 照抄尾行那条命令 ⇒ 第 2 页，总数不变
  const second = await page(ctx, { cursor: nextCallOf(first.tail).cursor })
  assert.match(second.tail, /^共 30 行 · 第 2 页（第 11–20 行，按 updated_at 倒序）· 下一页：/)
  assert.equal(second.rows.length, 10)

  // ③ 带过滤照样一页十条（过滤不免截），照抄回显的过滤 + cursor ⇒ 仍是该过滤集、总数恒定、零旁过滤行
  const filtered = await page(ctx, { kind: "tech_todo" })
  assert.equal(filtered.rows.length, 10, "过滤命中 25 行 ⇒ 仍只回一页")
  assert.match(filtered.tail, /^共 25 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页：ledger\(\{action:"query", kind:"tech_todo", cursor:"[^"]+"\}\)$/, "尾行须回显本页生效的过滤，否则照抄就丢过滤")

  const walked = [...filtered.rows]
  let tail = filtered.tail
  for (let hop = 0; hop < 5 && !/· 已到末页$/.test(tail); hop++) {
    const step = nextCallOf(tail)
    const next = await page(ctx, { kind: step.kind, cursor: step.cursor })
    assert.match(next.tail, /^共 25 行 · /, `<N> 恒 25（不被翻页改味）：${next.tail}`)
    walked.push(...next.rows)
    tail = next.tail
  }
  assert.match(tail, /^共 25 行 · 第 3 页（第 21–25 行，按 updated_at 倒序）· 已到末页$/)

  assert.equal(walked.length, 25, `三页把 25 行恰好走完：${walked.length}`)
  assert.equal(new Set(walked.map((r) => r.id)).size, 25, "无重复行")
  assert.deepEqual([...walked.map((r) => r.id)].sort((a, b) => a - b), [...techTodo].sort((a, b) => a - b), "零旁过滤行：走过的全是该过滤集")
  assert.ok(walked.every((r) => r.kind === "tech_todo"))

  // ④ count 另是一本账：只数未决四态（27），页总数六态全含（30）
  const counted = JSON.parse(await exec(ctx, { action: "count" }))
  assert.equal(counted.count, 27, `count 只数未决四态：${JSON.stringify(counted)}`)
  assert.match(first.tail, /^共 30 行 · /, "页总数六态全含")
  assert.ok(counted.count <= 30, "未决数 ≤ 页总数")

  // ⑤ 游标形不合 ⇒ 拒（逐字拒文），不回首页、行集零返回；形对而游标落在末行之后 ⇒ 本页无行
  for (const bad of ["2026-11-02T09:49:2", "2026-11-02T09:49:21.077Z|abc"]) {
    await assert.rejects(() => exec(ctx, { action: "query", cursor: bad }), (e) => {
      assert.equal(e.message, `ledger(query)：cursor 非法：${JSON.stringify(bad)}（应为「<updated_at>|<id>」，照上一页尾行原样传入）`)
      return true
    })
  }
  const past = await page(ctx, { cursor: "0000-01-01T00:00:00.000Z|1" })
  assert.deepEqual(past.rows, [], "形对而值在末行之后：不回首页、不返回行")
  assert.equal(past.tail, "共 30 行 · 本页无行")
})
