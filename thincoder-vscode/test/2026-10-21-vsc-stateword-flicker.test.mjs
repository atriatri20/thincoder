/**
 * 2026-10-21-vsc-stateword-flicker.test.mjs — 块头状态词三支补测（批 `2026-10-21-nested-sub-label`）
 *
 * 用户 2026-10-21 18:01 现象（截图 + 描述）：
 *   ① explore 时能显示 `explore#1/Thinking…`，中间**穿插一下** `Thinking…` 再恢复；
 *   ② 跑 advisor 时完全不显示 advisor，一直是 `Thinking…`。
 *
 * 根因（本轮实读）：
 *   ① `state.mjs` 的 started 分支**无条件**清 `stateWord`，而挂起期心跳每 ~2s 补投一次 started
 *      （日志 10:01:45/47/49/51 连续四条 `status:"started"`）⇒ 每 2s 闪回裸词。
 *   ② 顾问评审的产出以 **toolOutput** 回传（`advisor.mjs:237` `onOutput: ctx.onOutput` ⇒
 *      `onToolOutput`），而输出面按设计从不写状态词 ⇒ 顾问跑的整段标题停在裸词。
 *
 * 宿主 = happy-dom（与 `2026-10-20-vsc-subagent-think-label` 同形）。
 */
import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync } from "node:fs"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()

globalThis.acquireVsCodeApi = () => ({ postMessage: () => {}, getState: () => undefined, setState: () => {} })
document.body.innerHTML = `<div id="messages"></div><div id="subagent-activity"></div>`

const { setStrings } = await import("../webview/i18n.js")
const { subBlocksReduce } = await import("../node_modules/@thincoder/render-core/subblocks/state.mjs")
const { renderSubBlock, renderSubagentChunk } = await import(
  "../node_modules/@thincoder/render-core/subblocks/block.mjs"
)

const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)
const THINK = zh["status.thinking"] + "…"

const DEPS = { now: () => 1_000 }

function model(overrides = {}) {
  return {
    key: "sub:eng-coder#2",
    label: "eng-coder#2",
    role: "eng-coder",
    id: 2,
    startedAt: 1,
    pool: true,
    status: "running",
    stateWord: null,
    frozen: false,
    queued: false,
    maxTurns: 0,
    ...overrides,
  }
}

const header = (block) => block.querySelector("summary .sub-hdr")?.textContent ?? ""

test("S1 重发 started 不清状态词（心跳每 ~2s）；queued→running 才清一次", () => {
  const list = [model({ stateWord: `explore#1/${THINK}` })]
  subBlocksReduce(list, { status: "started", role: "eng-coder", id: 2, pool: true }, DEPS)
  assert.equal(list[0].stateWord, `explore#1/${THINK}`, "重发 started 不得清（否则 2s 闪回）")

  const q = [model({ status: "queued", queued: true, stateWord: "queued · position 1" })]
  subBlocksReduce(q, { status: "started", role: "eng-coder", id: 2, pool: true }, DEPS)
  assert.equal(q[0].stateWord, null, "queued→running 清排队标注")
  assert.equal(q[0].queued, false)
})

test("S2 顾问的 toolOutput 让标题显示 advisor（只写名字，不写输出文本）", () => {
  const block = renderSubBlock(model())
  block._subMeta.stateWord = null
  renderSubagentChunk(block, {
    role: "eng-coder", id: 2, kind: "tool",
    text: "### Verdict\npass",
    sub: "advisor#1",
    face: "toolOutput", tool: "advisor",
  })
  assert.equal(block._subMeta.stateWord, "advisor#1/advisor", "子标 + advisor")
  assert.ok(header(block).endsWith(" advisor#1/advisor"), `头行 = ${header(block)}`)

  // T-A44 第二半：同载荷再投一段输出 ⇒ 状态词不变，且绝不把输出正文拼进状态词
  renderSubagentChunk(block, {
    role: "eng-coder", id: 2, kind: "tool",
    text: "### Another finding\nmore text",
    sub: "advisor#1",
    face: "toolOutput", tool: "advisor",
  })
  assert.equal(block._subMeta.stateWord, "advisor#1/advisor", "输出换了，名字不变")
  assert.ok(!block._subMeta.stateWord.includes("Another"), "状态词不含输出正文")

  // 顶层顾问（无 sub）
  const top = renderSubBlock(model())
  top._subMeta.stateWord = null
  renderSubagentChunk(top, {
    role: "eng-coder", id: 2, kind: "tool", text: "review…",
    face: "toolOutput", tool: "advisor",
  })
  assert.equal(top._subMeta.stateWord, "advisor")
})

test("S3 普通输出行（toolOutput 非 advisor）仍零改写（输出面不入状态词）", () => {
  const block = renderSubBlock(model())
  block._subMeta.stateWord = "explore#1/read — src/x.mjs"
  renderSubagentChunk(block, {
    role: "eng-coder", id: 2, kind: "tool",
    text: "line1\nline2", sub: "explore#1",
    face: "toolOutput", tool: "read",
  })
  assert.equal(block._subMeta.stateWord, "explore#1/read — src/x.mjs", "输出不改写")
})
