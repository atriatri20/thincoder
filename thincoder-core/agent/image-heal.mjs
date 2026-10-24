/**
 * agent/image-heal.mjs — 图片拒绝自愈（PROVIDER.md §6.26；批 image-history-400 · 台账 #1450）。
 *
 * 判定（T1 图像语义 400 ∥ T2 同态重复）→ 全剥历史图（copy-on-write，人读线 `_fullHistory`
 * 零损）→ 机读注记 → `_imageFailStreak` 记账（单源本档）。返回 `{ healed, dropped }`；零抛
 * （失败面不阻断回合驱动——落账为尽力面）。重发（一次，非重试）与「再败照抛」归
 * agent/chat-call.mjs catch 支；清零接口 = clearImageFailStreak（调用点 = chat-call 成功路径）。
 */
import { looksLikeImageRejection } from "../provider/errors.mjs"
import { stripRejectedImages } from "../provider/normalize.mjs"
import { logEvent } from "../log.mjs"

/** 机读注记（§6.26 逐字；N = 剥除数）。 */
const healNote = (n) =>
  `[System reminder: the provider rejected the image payload (HTTP 4xx) — ${n} image(s) were dropped from the context so the session can continue; the request was re-sent. Re-read a downscaled copy with read_image if still needed, and tell the user which image(s) were dropped.]`

/** 状态码提取（§6.26——技法同 T2 族：`LLM API error 4xx:` 构造位文本取码；非该族 ⇒ 0）。 */
function statusCodeOf(text) {
  const m = String(text ?? "").match(/LLM API error (\d{3}):/)
  return m ? Number(m[1]) : 0
}

/** 历史 image part 计数（T1/T2 的「史含图」判据 + dropped 取数）。 */
function countImageParts(messages) {
  let n = 0
  if (!Array.isArray(messages)) return 0
  for (const m of messages) {
    if (!Array.isArray(m?.content)) continue
    for (const p of m.content) if (p?.type === "image_url") n++
  }
  return n
}

/** 成功路径清零（§6.26——清零调用点 = chat-call.mjs；Abort 豁免 ∥ 失败不清零）。 */
export function clearImageFailStreak(agent) {
  if (agent) agent._imageFailStreak = 0
}

/**
 * 判定 ∥ 剥除 ∥ 注记 ∥ streak 记账（§6.26 机制 1–3。判定先后：T2 读本回合自增前值）。
 * @returns {{ healed: boolean, dropped: number }}
 */
export function healImageRejection(agent, error) {
  try {
    // Abort 类失败豁免：既不自增也不清零（中断不是「被拒」——重启后原样重发）
    if (!agent || error?.name === "AbortError") return { healed: false, dropped: 0 }
    const message = String(error?.message ?? "")
    const code = statusCodeOf(message)
    const is4xxNon429 = code >= 400 && code < 500 && code !== 429 // 429 归 provider 重试族
    const prev = Number(agent._imageFailStreak) || 0
    if (is4xxNon429) agent._imageFailStreak = prev + 1 // 自增（T2 判据读上值——见上方调用序）
    const dropped = countImageParts(agent.history)
    if (dropped === 0) return { healed: false, dropped: 0 } // 剥除后自熄面：两判据皆需「史含图」
    const t1 = code === 400 && looksLikeImageRejection(message) // 图像语义 400（HTTP 400 合取）
    const t2 = is4xxNon429 && prev >= 1 // 结构兜底：上一回合同类失败（防网关文案不在词表内）
    if (!t1 && !t2) return { healed: false, dropped: 0 }
    // 全剥（历史本体持久修正——后续回合不再重发毒图）+ 机读注记（模型知晓 + 复合指令）
    agent.history = stripRejectedImages(agent.history)
    agent.history.push({ role: "user", content: healNote(dropped) })
    logEvent("llm:image-heal", { dropped, streak: agent._imageFailStreak, model: agent.provider?.model })
    return { healed: true, dropped }
  } catch {
    return { healed: false, dropped: 0 } // §6.26 零抛：失败面不阻断回合驱动
  }
}
