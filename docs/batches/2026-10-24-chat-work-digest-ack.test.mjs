/** 批档（2026-10-24 · 会话折叠 digest-ack 回退批）：用户实测「这会话把输出也折叠进去了」——
 *  后台子代理消化链在真输出后尾追（chat-digest 状态行 ∕ subagent 归档卡 ∕ 模型 ack 单行），ack 块
 *  （assistant 型）按「最后一块」判据抢走轮尾正文位 ⇒ 真报告整段折进「已工作」条。
 *  修 = `finalOf(blocks)`（纯函数）：尾块非 assistant ⇒ null；尾块 = digest-ack ⇒ 回退前一真输出块。
 *  本档三腿：正常尾 ∕ ack 尾回退 ∕ 尾块非 assistant（真 DOM 元素——`linkdom` 先例查批档库；
 *  此处用极简 stub——`chat-work` 判据只读 `data-block-kind` ∕ `textContent`）。 */
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

import { test } from "node:test"
import assert from "node:assert/strict"


const block = (kind, text) => ({
  getAttribute: (name) => (name === "data-block-kind" ? kind : null),
  textContent: text ?? "",
})

let finalOf
test("① 正常尾：尾块 = assistant 真输出 ⇒ 即 final", async () => {
  ;({ finalOf } = await import("../../thincoder-desktop/renderer/chat-work.mjs"))
  const report = block("assistant", "评估完成。先把结论放在前面……")
  const out = finalOf([block("user", "问"), block("tool", "grep"), block("reasoning", "思考中"), report])
  assert.equal(out, report)
})

test("② digest-ack 尾：回退前一个真输出块（用户实测病灶）", async () => {
  const report = block("assistant", "评估完成。先把结论放在前面……480 用例全绿……")
  const ack = block("assistant", "[digest-ack #1] digested — 后台 pytest 实为全绿：日志尾行 480 passed")
  const out = finalOf([block("tool", "grep"), report, block("tool", "grep"), ack])
  assert.equal(out, report, "真输出留折叠区外；ack 折进工作区")
})

test("③ 尾块非 assistant（回合被砍）⇒ null ∕ 全 ack ⇒ null ∕ 空集 ⇒ null", async () => {
  assert.equal(finalOf([block("assistant", "前文"), block("tool", "bash")]), null)
  const ack1 = block("assistant", "[digest-ack #1] digested — a")
  const ack2 = block("assistant", "[digest-ack #2] deferred — b")
  assert.equal(finalOf([ack1, ack2]), null)
  assert.equal(finalOf([]), null)
})
