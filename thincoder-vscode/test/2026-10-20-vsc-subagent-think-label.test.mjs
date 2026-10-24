/**
 * 2026-10-20-vsc-subagent-think-label.test.mjs — 子代理块头状态词：think 支**零改写**（对齐 CLI）
 * （批档 2026-10-20-subagent-think-label · 2026-10-21-think-align-cli · 台账 #1720 · 需求 F-W23）。
 * 契约单源 = `docs/vsc/design/WEBVIEW.md` §5.2（嵌套身份前缀 D-W42 = 工具行 ∥ think 零改写 D-W43）。
 *
 * 八用例（驱动核件 `subblocks/block.mjs` `renderSubagentChunk` → `activity-view.mjs` `noteChunk`）：
 *   T-A33 嵌套工具行后接 think ⇒ 零改写（修前红：旧 think 覆盖）· T-A34 顶层 think 正控（含 `sub` 空串/非字符串边界）· T-A35 工具行支零变 ∥ 旧载荷无 `tool`
 *   · T-A36 同源（VSC shim 纯再导出 · 桌面同件 · CLI 零触）· T-A37 两刷新路径同值（DOM-only 写入反例）
 *   · T-A38 多段嵌套（think 零改写 ∥ 工具行前缀逐字）· T-A39 出生前缺省正控 · T-A40 冻结块负控
 * 宿主 = happy-dom（`@happy-dom/global-registrator`，VSC devDep）——状态词读真 DOM 头行文本，
 * 串匹配桩在此必红（头行由 `refreshBlock` 构树，非载荷回显）。
 */
import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync, realpathSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()

// 宿主桥 + 静态骨架（`state.js` 载入前必须就位——与 `2026-10-20-vsc-queue-band` 同形）
globalThis.acquireVsCodeApi = () => ({ postMessage: () => {}, getState: () => undefined, setState: () => {} })
document.body.innerHTML = `<div id="messages"></div><div id="subagent-activity"></div>`

const { ctx, S } = await import("../webview/state.js")
const { refreshLiveHeaders } = await import("../webview/activity.js")

const { setStrings } = await import("../webview/i18n.js") // 核 i18n 的再导出 shim——`t` 与核件同模块实例
const { renderSubBlock, renderSubagentChunk } = await import(
  "../node_modules/@thincoder/render-core/subblocks/block.mjs"
)
const { refreshBlock } = await import("../node_modules/@thincoder/render-core/subblocks/activity-view.mjs")

const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)

/** think 词 = 词键 `status.thinking` + 静态 `…`（核 `W.thinking()`——词面随词键，本档读 zh 值作期望）。 */
const THINK = zh["status.thinking"] + "…"

/** 建 live 子代理块（核 `renderSubBlock`；meta 形 = 核 `buildModel` 缺省字段）。 */
function makeBlock(overrides = {}) {
  return renderSubBlock({
    key: "sub:eng-coder#3",
    label: "eng-coder#3",
    role: "eng-coder",
    id: 3,
    startedAt: Date.now(),
    pool: true,
    status: "running",
    stateWord: null,
    frozen: false,
    maxTurns: 0,
    ...overrides,
  })
}

/** 头行文本（`refreshBlock` 重建的 `summary > .sub-hdr`——真 DOM 读）。 */
const header = (block) => block.querySelector("summary .sub-hdr")?.textContent ?? ""

/** think chunk 载荷（relay 真形：`sub` 在场即嵌套前缀；缺省 = 顶层子代理）。 */
function thinkPayload(extra = {}) {
  return { role: "eng-coder", id: 3, kind: "think", text: "…", face: "think", ...extra }
}

/** 工具 chunk 载荷（relay 真形）。 */
function toolPayload(extra = {}) {
  return { role: "eng-coder", id: 3, kind: "tool", text: "x", ...extra }
}

// ─── T-A33 嵌套 think：状态词零改写（CLI 对齐）──────────────────────────────

test("T-A33 嵌套 think：无工具时带身份 ∥ 有工具时零改写", () => {
  // 无前置工具：think 给缺省支带上干活者身份（`advisor#1/思考中…`）——名字不被吃掉
  const fresh = makeBlock()
  renderSubagentChunk(fresh, thinkPayload({ sub: "advisor#1" }))
  assert.equal(fresh._subMeta.stateWord, `advisor#1/${THINK}`, "无前置工具 ⇒ 身份 + think 词")
  assert.ok(header(fresh).endsWith(` advisor#1/${THINK}`), `头行带身份；实际 = ${header(fresh)}`)
  // 先嵌套工具行、后嵌套 think：标题保持「子代理名/最后工具」（think 零改写）
  const block = makeBlock()
  renderSubagentChunk(block, toolPayload({
    tool: "read", cmd: "src/x.mjs", sub: "advisor#1", face: "tool", text: "advisor#1/read — src/x.mjs",
  }))
  renderSubagentChunk(block, thinkPayload({ sub: "advisor#1" }))
  assert.equal(block._subMeta.stateWord, "advisor#1/read — src/x.mjs", "think 后仍 = 上一个工具行（零改写）")
  assert.ok(
    header(block).endsWith(" advisor#1/read — src/x.mjs"),
    `头行保留工具行；实际头行 = ${header(block)}`,
  )
})

// ─── T-A34 顶层 think（正控）───────────────────────────────────────────────

test("T-A34 顶层 think：状态词零改写（正控）", () => {
  const block = makeBlock()
  renderSubagentChunk(block, thinkPayload())
  assert.equal(block._subMeta.stateWord, null, "think 不写状态词（无前置工具）")
  assert.ok(header(block).endsWith(` ${THINK}`), `头行以裸 think 词收尾；实际头行 = ${header(block)}`)
  assert.equal(header(block).includes(`/${THINK}`), false, "零 `/` 前缀")
  // 先嵌套工具行、后顶层 think ⇒ 标题仍是工具行（think 不参与，也就无前缀残留问题）
  renderSubagentChunk(block, toolPayload({ tool: "read", cmd: "src/x.mjs", sub: "advisor#1", face: "tool" }))
  renderSubagentChunk(block, thinkPayload())
  assert.equal(block._subMeta.stateWord, "advisor#1/read — src/x.mjs", "嵌套工具行后接顶层 think ⇒ 零改写")
  // 边界（批档 §6）：`sub` 空串 / 非字符串 ⇒ 零抛（think 支不读 sub）
  for (const bogus of ["", 1]) {
    const probe = makeBlock()
    assert.doesNotThrow(() => renderSubagentChunk(probe, thinkPayload({ sub: bogus })))
    assert.equal(probe._subMeta.stateWord, null, `sub = ${JSON.stringify(bogus)} ⇒ 零改写、零抛`)
  }
})

// ─── T-A35 工具行支零变 ∥ 输出面零写入 ─────────────────────────────────────

test("T-A35 工具行支零变 ∥ 旧载荷无 `tool` ⇒ 状态词零改写", () => {
  const nested = makeBlock()
  renderSubagentChunk(nested, toolPayload({
    tool: "read", cmd: "src/x.mjs", sub: "advisor#1", face: "tool", text: "advisor#1/read — src/x.mjs",
  }))
  assert.equal(nested._subMeta.stateWord, "advisor#1/read — src/x.mjs", "嵌套工具行 = `<sub>/<tool> — <cmd ≤60>`（零变）")

  const top = makeBlock()
  renderSubagentChunk(top, toolPayload({ tool: "read", cmd: "src/x.mjs", face: "tool", text: "read — src/x.mjs" }))
  assert.equal(top._subMeta.stateWord, "read — src/x.mjs", "无 `sub` 工具行 = `<tool> — <cmd ≤60>`（零变）")

  const before = top._subMeta.stateWord
  renderSubagentChunk(top, toolPayload({ face: "toolOutput", text: "output line" })) // 无 `tool` 字段
  assert.equal(top._subMeta.stateWord, before, "`face: \"toolOutput\"` 无 `tool` ⇒ 状态词零改写")
  renderSubagentChunk(top, toolPayload({ text: "legacy output" })) // 旧载荷：无 face / 无 tool
  assert.equal(top._subMeta.stateWord, before, "旧载荷无 `tool` 字段 ⇒ 状态词零改写（输出面零写入）")
})

// ─── T-A36 同源（VSC + 桌面同件 · CLI 零触）────────────────────────────────

test("T-A36 同源：VSC 端档 = 纯再导出 shim · 核件与桌面同文件 · CLI 零触", () => {
  const shim = readFileSync(new URL("../webview/activity-view.js", import.meta.url), "utf8")
  assert.match(
    shim,
    /export \* from "\.\.\/node_modules\/@thincoder\/render-core\/subblocks\/activity-view\.mjs"/,
    "端档 = 纯再导出（`export *`）",
  )
  assert.equal(/function\s+(?:noteChunk|refreshBlock)/.test(shim), false, "端档零本地实现（写点不落在端档）")

  const core = realpathSync(fileURLToPath(
    new URL("../node_modules/@thincoder/render-core/subblocks/activity-view.mjs", import.meta.url),
  ))
  assert.match(
    core.replace(/\\/g, "/"),
    /\/thincoder-render-core\/subblocks\/activity-view\.mjs$/,
    "用例 import 的核路径实解析到 thincoder-render-core 同一文件（桌面 `/rc/` 直映射同件）",
  )

  const cliPanel = readFileSync(new URL("../../thincoder-cli/src/tui/subagent-panel.mjs", import.meta.url), "utf8")
  assert.equal(
    cliPanel.includes("render-core/subblocks/activity-view"),
    false,
    "CLI 自持面板词面——不消费核 activity-view（CLI 零改）",
  )
})

// ─── T-A37 两刷新路径同值（DOM-only 写入反例）──────────────────────────────

test("T-A37 两刷新路径同值（1 s 拍 ∥ 覆盖式重建——DOM-only 写入反例）", () => {
  const block = makeBlock()
  renderSubagentChunk(block, toolPayload({
    tool: "read", cmd: "src/x.mjs", sub: "advisor#1", face: "tool", text: "advisor#1/read — src/x.mjs",
  }))
  renderSubagentChunk(block, thinkPayload({ sub: "advisor#1" }))
  // ① 1 s 同点刷（真 tick 体：panels `_panelTimer` → `refreshLiveHeaders` → `refreshBlock`；
  //    门 = `_subMeta` 非冻结 ∧ `isConnected` ⇒ 块须入活动区与 `S._subBlocks`）
  ctx.activityEl.appendChild(block)
  S._subBlocks.set("sub:eng-coder#3", block)
  refreshLiveHeaders()
  assert.ok(header(block).endsWith(" advisor#1/read — src/x.mjs"), "路径①（1 s 拍重绘）⇒ 仍是工具行")
  // ② 覆盖式重建：头词 DOM 被清空后按块级 meta 重建
  block.querySelector("summary").replaceChildren()
  refreshBlock(block)
  assert.ok(header(block).endsWith(" advisor#1/read — src/x.mjs"), "路径②（覆盖式重建）⇒ 同值")
  assert.equal(block._subMeta.stateWord, "advisor#1/read — src/x.mjs", "两路径的取值源 = 块级 stateWord 单字段（think 未污染）")
  // 清账：块出区 + map 复位（本文件其余用例用独立块）
  S._subBlocks.delete("sub:eng-coder#3")
  block.remove()
})

// ─── T-A38 多段嵌套 ────────────────────────────────────────────────────────

test("T-A38 多段嵌套：工具行前缀逐字拼接 ∥ 无工具 think 带身份", () => {
  const block = makeBlock()
  renderSubagentChunk(block, thinkPayload({ sub: "advisor#1/explore#2" }))
  assert.equal(block._subMeta.stateWord, `advisor#1/explore#2/${THINK}`, "无工具时 = 多段前缀 + think 词")
  renderSubagentChunk(block, toolPayload({
    tool: "read", cmd: "src/x.mjs", sub: "advisor#1/explore#2", face: "tool",
    text: "advisor#1/explore#2/read — src/x.mjs",
  }))
  assert.equal(block._subMeta.stateWord, "advisor#1/explore#2/read — src/x.mjs", "多段前缀 = `path.inner.join(\"/\")` 原样")
  assert.ok(header(block).endsWith(" advisor#1/explore#2/read — src/x.mjs"), "头行状态词逐字同形")
})

// ─── T-A39 出生前缺省（正控）───────────────────────────────────────────────

test("T-A39 出生前缺省：裸 think 词（正控）", () => {
  const block = makeBlock()
  assert.equal(block._subMeta.stateWord, null, "出生时字段缺席（消费侧缺省支：stateWord 非真值——产者置 null 见核 state.mjs:65，本用例只验读侧）")
  assert.ok(
    header(block).endsWith(` ${THINK}`),
    `缺省支 = 裸 think 词（stateWord 缺席 ⇒ W.thinking()）；实际头行 = ${header(block)}`,
  )
  assert.equal(header(block).includes(`/${THINK}`), false, "缺省零前缀")
})

// ─── T-A40 冻结块负控 ──────────────────────────────────────────────────────

test("T-A40 冻结块负控：think chunk 零改写", () => {
  const block = makeBlock({ frozen: true, status: "done" })
  const before = header(block)
  renderSubagentChunk(block, thinkPayload({ sub: "advisor#1" }))
  assert.equal(block._subMeta.stateWord, null, "冻结守卫：think 不写状态词")
  assert.equal(header(block), before, "头行零改写")
  assert.equal(block.querySelector(".advisor-content").children.length, 0, "内容零追加（appendAdvisorChunk 冻结守卫同守）")
})
