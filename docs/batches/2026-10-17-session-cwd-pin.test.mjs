/** 批档（2026-10-17 · 会话窗 cwd 钉扎批）：主窗单指针漂移后，窗域会话动作（切模型 ∕ 档位 ∕ 发送 ∕ 历史 ∕ @ 补全）
 *  不得跨项目解析——cwd 由发窗钉扎（`win._swinCwd`）显式透传，缺省回退 `currentCwd()`（主窗行为零改）。
 *  用户实测：「独立窗口切模型不生效（slot-missing）」= 漂移后主窗现项目无该槽；更险 = 同号槽**静默写错会话**。
 *  两腿：① `turn-input` send 穿透（ensure ∕ 附件装配取显式 cwd）② `at-complete` 显式 cwd 枚举（真 fs 夹具）。 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createTurnInput } from "../../thincoder-desktop/src/main/turn-input.mjs"
import { createAtComplete } from "../../thincoder-desktop/src/main/at-complete.mjs"

test("send 穿透：显式 cwd 优先于 projects.currentCwd()，缺省回退指针", async () => {
  const seen = []
  const ensure = async (key, slot, cwdOverride) => {
    seen.push({ key, slot, cwdOverride })
    return { config: { locale: "zh-CN" }, provider: { model: "m" }, history: [] }
  }
  const deps = {
    post: () => {}, ensure, flights: new Map(), queued: { add: () => ({ ok: false }) },
    chain: { postQueue: () => {} }, suspension: { active: () => false },
    drive: () => {}, projects: { currentCwd: () => "F:\\pointer" }, denyGates: () => {}, capPending: new Map(),
  }
  const { send } = createTurnInput(deps)
  // ① 显式钉扎 ⇒ ensure 收钉扎值（非指针值）
  await send("2", "hi", null, "F:\\pinned")
  assert.equal(seen.at(-1).cwdOverride, "F:\\pinned")
  // ② 主窗（无钉扎 = undefined）⇒ 回退指针
  await send("2", "hi", null, undefined)
  assert.equal(seen.at(-1).cwdOverride, "F:\\pointer")
  // ③ 坏键仍 bad-key（判序前置）
  assert.equal((await send("x", "hi", null, "F:\\pinned")).reason, "bad-key")
})

test("at:complete：显式 cwd 枚举钉扎项目（真 fs 夹具），缺省回退指针", async () => {
  const dir = mkdtempSync(join(tmpdir(), "cwd-pin-"))
  mkdirSync(join(dir, "assets"))
  writeFileSync(join(dir, "assets", "alpha.txt"), "a")
  writeFileSync(join(dir, "beta.txt"), "b")
  const { atComplete } = createAtComplete({ projects: { currentCwd: () => "F:\\pointer" } })
  // ① 显式钉扎 ⇒ 候选出自钉扎目录（指针目录零枚举对象）
  const r1 = await atComplete("@al", 7, dir)
  assert.equal(r1.ok, true)
  assert.equal(r1.seq, 7)
  const rels = r1.matches.map((m) => m.rel ?? m.path ?? String(m))
  assert.ok(rels.some((x) => String(x).includes("alpha")), `钉扎目录候选应在场：${JSON.stringify(rels)}`)
  // ② 缺省 ⇒ 回退指针（无项目 ⇒ 空候选）
  const r2 = await atComplete("@", 8, undefined)
  assert.deepEqual(r2.matches, [])
})
