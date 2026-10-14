/**
 * 2026-10-13-ledger-live-refresh.test.mjs — 台账状态行「写后即时刷新」批内单测件
 * （批档 = docs/batches/2026-10-13-ledger-live-refresh.md · 轻通道缺陷修复）。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-ledger-live-refresh.test.mjs`
 *
 * 判据源 = 用户 2026-10-13「写了以后就要立即更新」（批档 §1）：
 *   C1 库目录出现 .db 写 ⇒ 去抖后重扫（render 推进 + `state.ledger.scannedAt` 落值）
 *   C2 非 .db 文件（表过滤）⇒ 不触发
 *   C3 `state.processing` 期间（回合中写台账——本症现场）⇒ 变更轮仍放行重扫
 *   C4 dispose ⇒ 不再触发
 *   C5 目录后建（watcher 短重试补挂）⇒ 首写也被观测（2026-10-13 评审 #5 修复）
 */
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-core"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

test("C1/C2/C4 写后即时：库目录写 ⇒ 重扫；非 .db 忽略；dispose 停", { timeout: 30000 }, async () => {
  const { _setLedgerDirForTest, _resetLedgerDirForTest } = await load("thincoder-core/ledger-db.mjs")
  const { startLedgerSurface } = await load("thincoder-core/ledger-surface.mjs")
  const dir = mkdtempSync(join(tmpdir(), "ledger-live-"))
  _setLedgerDirForTest(dir)
  try {
    let renders = 0
    const state = {}
    const h = startLedgerSurface({ state, anchor: ROOT, render: () => { renders++ } })
    await sleep(250)
    const first = renders
    assert.ok(first >= 1, `首扫应已渲染（renders=${first}）`)
    assert.ok(state.ledger && typeof state.ledger.scannedAt === "number", "state.ledger.scannedAt 应落值")
    const t0 = state.ledger.scannedAt
    writeFileSync(join(dir, "probe.db"), "x")
    await sleep(1000)
    assert.ok(renders > first, `写库后应重扫（renders ${first} → ${renders}）`)
    assert.ok(state.ledger.scannedAt >= t0, "scannedAt 应推进")
    const mid = renders
    writeFileSync(join(dir, "notes.txt"), "x")
    await sleep(1000)
    assert.equal(renders, mid, "非 .db 文件不触发（表过滤）")
    h.dispose()
    writeFileSync(join(dir, "probe2.db"), "x")
    await sleep(1000)
    assert.equal(renders, mid, "dispose 后不再触发")
  } finally {
    _resetLedgerDirForTest()
    try { rmSync(dir, { recursive: true, force: true }) } catch { /* Windows 句柄余留——tmp 自清 */ }
  }
})

test("C3 回合中写台账也放行（processing 只挡定时轮）", { timeout: 30000 }, async () => {
  const { _setLedgerDirForTest, _resetLedgerDirForTest } = await load("thincoder-core/ledger-db.mjs")
  const { startLedgerSurface } = await load("thincoder-core/ledger-surface.mjs")
  const dir = mkdtempSync(join(tmpdir(), "ledger-live-"))
  _setLedgerDirForTest(dir)
  try {
    let renders = 0
    const state = { processing: true }
    const h = startLedgerSurface({ state, anchor: ROOT, render: () => { renders++ } })
    await sleep(250)
    assert.equal(renders, 0, "processing 期间首扫（定时轮族）应跳过")
    writeFileSync(join(dir, "probe.db"), "x")
    await sleep(1000)
    assert.ok(renders >= 1, `processing 期间写库仍应重扫（renders=${renders}）`)
    h.dispose()
  } finally {
    _resetLedgerDirForTest()
    try { rmSync(dir, { recursive: true, force: true }) } catch { /* tmp 自清 */ }
  }
})

test("C5 目录后建：watcher 短重试补挂 ⇒ 首写也被观测（评审 #5 修复）", { timeout: 30000 }, async () => {
  const { _setLedgerDirForTest, _resetLedgerDirForTest } = await load("thincoder-core/ledger-db.mjs")
  const { startLedgerSurface } = await load("thincoder-core/ledger-surface.mjs")
  const base = mkdtempSync(join(tmpdir(), "ledger-live-"))
  const dir = join(base, "ledger") // 刻意不建——复现「首写才建」窗口
  _setLedgerDirForTest(dir)
  try {
    let renders = 0
    const h = startLedgerSurface({ state: {}, anchor: ROOT, render: () => { renders++ } })
    await sleep(250)
    const first = renders
    mkdirSync(dir, { recursive: true })
    await sleep(2600) // 短重试拍（2s）+ 余量 ⇒ watcher 应已补挂
    writeFileSync(join(dir, "probe.db"), "x")
    await sleep(1000)
    assert.ok(renders > first, `目录后建后首写应触发重扫（renders ${first} → ${renders}；未补挂则要等 120s 兜底）`)
    h.dispose()
  } finally {
    _resetLedgerDirForTest()
    try { rmSync(base, { recursive: true, force: true }) } catch { /* tmp 自清 */ }
  }
})
