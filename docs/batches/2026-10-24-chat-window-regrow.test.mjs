/** 批档（2026-10-24 · 会话切换卡顿批——ZCode ConversationTimeline 虚拟化对位）：
 *  用户实测「切换对话载入历史一卡一卡，要等很久」——根因 = 预载链每页**长窗 + 全量重建**（大会话
 *  4700+ 块 ≈ 24 次 O(窗) 重建 = O(n²)）＋ chatModel 全量挂载（limit 被退役）＋ chatLimit 跨会话残留。
 *  修 = 渲染窗回归（尾侧 limit 块）＋ 跟滚门（预载并入不进 DOM）＋ 同尾整置整帧退 ∕ 上滚按需增长。
 *  本档四腿：chatModel 窗切片 ∕ nextWindow 跟滚门 ∕ 同尾指纹 ∕ 上滚增长判据（纯函数面；DOM 面源锁）。 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { pathToFileURL } from "node:url"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const url = (rel) => pathToFileURL(join(ROOT, rel)).href
registerHooks({
  resolve(spec, context, next) {
    if (spec.startsWith("/rc/")) return { url: url(`thincoder-render-core/${spec.slice(4)}`), shortCircuit: true, format: "module" }
    if (spec.startsWith("@thincoder/core/")) return { url: url(`thincoder-core/${spec.slice("@thincoder/core/".length)}`), shortCircuit: true, format: "module" }
    return next(spec, context)
  },
})

let visibleWindow, nextWindow, chatModel, MAX_RENDER_BLOCKS, TOP_GROW_PX

const blocks = (n) => Array.from({ length: n }, (_, i) => ({ kind: "assistant", text: `block-${i}` }))

test("① visibleWindow：尾侧切片 ∕ hidden 计数（窗回归）", async () => {
  ;({ visibleWindow } = await import(url("thincoder-desktop/renderer/store.mjs")))
  ;({ nextWindow } = await import(url("thincoder-desktop/renderer/views/chat-scroll.mjs")))
  ;({ chatModel } = await import(url("thincoder-desktop/renderer/views/chat-model.mjs")))
  ;({ MAX_RENDER_BLOCKS, TOP_GROW_PX } = await import(url("thincoder-desktop/renderer/views/chat-scroll.mjs")))
  const w = visibleWindow(blocks(4703), 150)
  assert.equal(w.visible.length, 150)
  assert.equal(w.hidden, 4553)
  assert.equal(w.visible.at(-1).text, "block-4702", "尾侧（最新块在窗内）")
  const small = visibleWindow(blocks(20), 150)
  assert.equal(small.visible.length, 20)
  assert.equal(small.hidden, 0, "小于窗限 ⇒ 全量 ∕ 零 hidden")
})

test("② chatModel：窗生效（4703 块挂 150）", async () => {
  const { chatModel: cm } = await import(url("thincoder-desktop/renderer/views/chat-model.mjs"))
  const m = cm({ activeSession: "2", blocks: blocks(4703), following: true, history: {} }, 150)
  assert.equal(m.blocks.length, 150, "挂载 = 窗内块（原全量 4703 = O(n²) 卡顿源）")
  assert.equal(m.hidden, 4553)
})

test("③ nextWindow 跟滚门（调用点门 = paintChat 传 `following ? 0 : added`）", async () => {
  // 批结束沿（inFlight true → false）＋ following（跟滚）⇒ 预载头侧并入不进窗（调用点传 0）
  assert.equal(nextWindow({ limit: 150, inFlight: true }, false, 0), 150, "跟滚：头侧并入零增长（added 门为 0）")
  assert.equal(nextWindow({ limit: 150, inFlight: true }, false, 200), 350, "非跟滚（上滚读旧）：随并入增")
  // 非批结束沿（流式尾追加）⇒ 零增（尾侧天然在窗内——原语义保持）
  assert.equal(nextWindow({ limit: 150, inFlight: false }, false, 5), 150)
  // 重入（页读进行中）⇒ 零增（原语义）
  assert.equal(nextWindow({ limit: 150, inFlight: true }, true, 200), 150)
})

test("④ 上滚增长常量 ∕ 源面锁（onNearTop 接线 ∕ 同尾跳过 ∕ seal 扩展）", async () => {
  assert.ok(TOP_GROW_PX > 0 && TOP_GROW_PX <= 120, "近真顶阈（≤120px）")
  const src = (await import("node:fs")).readFileSync(join(ROOT, "thincoder-desktop/renderer/app.mjs"), "utf8")
  assert.ok(src.includes("onNearTop"), "attachScroll deps 接 onNearTop（上滚增长出口）")
  assert.ok(src.includes('op.source === "backfill"'), "同尾跳过判据读 build op source（回合尾整置不可跳）")
  assert.ok(src.includes("tailFp(prev?.blocks) === tailFp(state.blocks)"), "尾指纹不变才跳")
  assert.ok(src.includes("limitGrew"), "seal 扩展：上滚挂载的头插补偿")
  const pr = (await import("node:fs")).readFileSync(join(ROOT, "thincoder-desktop/renderer/page-read.mjs"), "utf8")
  assert.ok(pr.includes('source: "backfill"'), "回填整置 op 携 backfill 标")
})
