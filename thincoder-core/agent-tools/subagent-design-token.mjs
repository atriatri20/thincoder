/**
 * subagent-design-token.mjs — **设计令牌门**族：design-token 槽解析、七态拒句、eng-coder spawn 的令牌判定。
 *
 * 机制单源 = `docs/core/design/TOOLS.md` §6.25（③ 七态拒句 ∥ ④ 令牌门）与 `docs/core/design/ENGINEERING-MODE.md`
 * 的设计令牌结算段；本档只实现，不重述口径。
 * **为什么单独立档**：这一族是 spawn 门里唯一「判授权」的部分（其余门判参数与路径），消费者只有
 * `subagent-spawn.mjs` 的 child 装配点——整族搬走不动装配面一字（`docs/core/design/PATH-RESOLUTION.md` §3 末条）。
 *
 * 导出面两处消费：装配点（`gateDesignToken`）与再导出面（`subagent-spawn.mjs` 原样再导出 `resolveDesignSlot`
 * ∥ `designTokenRefusal` ⇒ `subagent.mjs` 的再导出行与用例的 import 行零改）。
 */
import { readEngTokenBatchesFromSlot, readEngTokenSealsFromSlot, removeDesignTokenSlot, reconcileEngTokensFromSlot, tokenExpired } from "../token-ttl.mjs"
import { validateDesignToken } from "./advisor.mjs"
// 评审封印的字节口径单源（settle 与闸面同调一个函数——两处各写一份字节法，必漂）。
import { designDocHash, designSealHash } from "./design-token.mjs"
// 批档比较的归一单源（§9 的匹配规则：`resolve` + 分隔符归一 + win32 折小写）——本门不自写第二份。
import { batchPathKey } from "./design-slots.mjs"

/**
 * Resolve the design-token slot for an eng-coder spawn (2026-09-01 multi-design, FR3):
 * - designId given → exact slot lookup (no match = explicit error, never a fuzzy guess)
 * - designId omitted → exactly ONE slot must exist (single-design compatibility); with
 *   multiple slots we refuse rather than pick one (T16: never silently aim the wrong design)
 * Returns { token, designId } on success (designId = the slot actually resolved — the spawn may omit
 * it while a single slot exists, and the batch/seal steps still need its key); throws with a
 * parent-actionable message otherwise.
 * R16 (2026-09-06): the slot Map is the authority; the format/TTL check itself stays in
 * validateDesignToken (2026-09-06: HMAC 防伪层已删——token 为无签名流程凭证——见
 * ENGINEERING-MODE.md 2026-09-06 段）。
 * DESIGN-TOKEN-SETTLEMENT D2（2026-09-08）：内存 Map miss（指定 designId 不在 / 空 Map）
 * 时回读槽文件权威台账 reconcile + 判定（reconcileEngTokensFromSlot——与 dispatch 写门
 * D3 同源）——覆盖"进程重启后槽有但 Map 未及回填/缓存与槽不一致"（槽文件 = 权威台账）。
 * TTL 过滤保留（reconcile 只并入未过期项）。单值镜像 `_engDesignToken` 已随 D3 退役——
 * 本门禁不再读镜像（AC3 零命中）。
 */
export function resolveDesignSlot(parent, designIdArg) {
  let slots = parent._engDesignTokens
  const hasSlots = slots instanceof Map && slots.size > 0
  // D2：内存 miss（指定 designId 不在 或 空 Map）→ 权威槽回读 reconcile + 判定
  if (designIdArg ? !(hasSlots && slots.has(designIdArg)) : !hasSlots) {
    const rec = reconcileEngTokensFromSlot(parent)
    if (rec && rec !== slots) slots = rec
  }
  // F2d: both refusal branches carry the HELD id list — after a
  // persistence restore the parent has no digest to look the id up in; the error
  // list is the only discovery path (ids are not credentials — the token is).
  const size = slots instanceof Map ? slots.size : 0
  const heldIds = size > 0 ? [...slots.keys()].join(", ") : "(none)"
  if (designIdArg) {
    if (!(slots instanceof Map) || !slots.has(designIdArg)) {
      throw new Error(`designId not found — no approved design review holds this id. Run advisor with type='design' again and pass the designId echoed with the token. (session holds ${size} approved design slot(s); held design ids: ${heldIds})`)
    }
    return { token: slots.get(designIdArg), designId: designIdArg }
  }
  if (size > 1) {
    throw new Error(`Multiple approved designs in this session (${size}) — pass the designId parameter (echoed with each token) to choose which design this eng-coder spawn belongs to. Held design ids: ${heldIds}`)
  }
  if (size === 1) return { token: [...slots.values()][0], designId: [...slots.keys()][0] }
  throw designTokenRefusal("missing", null, {})
}

/** 七态拒句（逐字 = TOOLS.md §6.25 ③）：missing / mismatch / expired / invalid /
 *  batch-mismatch / seal-mismatch / seal-unreadable。
 *  第三参 `scope` **必传、不设默认值**（三参形单源 = DESIGN-TOKEN-SETTLEMENT §10.2）：无名字可点的态传
 *  `{}`，缺参在构造器入口拒——缺省值会默默代调用方决定「没有名字」，而错位的判决三条层下去才看得出来。
 *  四个带名字的态各自入参：mismatch ⇒ designId 走第二参 · batch-mismatch ⇒ `{boundBatch, givenBatch}` 两个绝对路径 ·
 *  seal-mismatch ⇒ `{changed: [<可变路径…>]}`（按 `docs` 原序；空数组 ⇒ 无路径形）· seal-unreadable ⇒ `{path}`。
 *  designId 与路径都不是凭证，七句均零令牌值回显。 */
export function designTokenRefusal(kind, designId, scope) {
  if (scope === undefined || scope === null || typeof scope !== "object" || Array.isArray(scope)) {
    const got = scope === null ? "null" : Array.isArray(scope) ? "an array" : typeof scope
    throw new Error(`designTokenRefusal: the third parameter \`scope\` is required and must be an object — got ${got} for kind="${kind}"; pass {} when the refusal names nothing (DESIGN-TOKEN-SETTLEMENT §10.2「三参形」).`)
  }
  if (kind === "missing") return new Error("designToken missing — the eng-coder spawn is refused: no usable token for an approved design slot came with this spawn. Pass the designToken parameter with the exact value from the subagent action:'design-slots' row (the text after designToken=), copied verbatim; if that list is empty, no design review has been approved in this session yet — run advisor with type='design' first. No token value is echoed here.")
  if (kind === "mismatch") return new Error("designToken mismatch — the eng-coder spawn is refused: the value passed does not equal the token held for this design slot. Re-read the subagent action:'design-slots' row and pass the value after designToken= verbatim, unchanged. No token value is echoed here." + (designId ? ` (designId: ${designId})` : ""))
  if (kind === "expired") return new Error("designToken expired — the eng-coder spawn is refused: the token matches this design slot but is past its TTL. The expired slot has been removed; run advisor with type='design' again on the current design and pass the newly issued token — an expired authorization cannot be retried. No token value is echoed here.")
  if (kind === "batch") return new Error(`designToken batch mismatch — the eng-coder spawn is refused: this token was issued for ${scope?.boundBatch ?? "(unknown)"}, but this spawn implements ${scope?.givenBatch ?? "(unknown)"}. Use the token from this batch's design review.`)
  if (kind === "seal") {
    // 点名判定（§10.2「拒文点名变了的那几份档」）：有可比路径 ⇒ 列路径形；一条都点不出来（旧封印行
    // 没有 `docHashes`）⇒ 保留无路径形。两形业务结果相同（照旧拒），差的只是报面上的名字。
    const changed = Array.isArray(scope.changed) ? scope.changed.filter((p) => typeof p === "string" && p) : []
    if (changed.length > 0) return new Error(`designToken seal mismatch — the reviewed documents changed after the review passed: ${changed.join(", ")} — re-run the review, or revert those files to the version the review approved.`)
    return new Error("designToken seal mismatch — the reviewed documents changed after the review passed (this seal records no per-document hashes, so no path can be named) — re-run the review, or revert the change.")
  }
  if (kind === "seal-unreadable") return new Error(`designToken seal unreadable — the eng-coder spawn is refused: the reviewed document ${scope?.path ?? "(unknown)"} cannot be read, so the seal cannot be checked. Restore that file, or re-run the review, and spawn again.`)
  return new Error("designToken invalid — the eng-coder spawn is refused: the value passed equals this design slot's stored token, but that stored value is not a well-formed token, so no expiry can be judged and the slot was left in place. Run advisor with type='design' to issue a fresh token for this design; a malformed record never passes the gate. No token value is echoed here.")
}

/** 拒文点名（DESIGN-TOKEN-SETTLEMENT §10.2「拒文点名变了的那几份档」）：按封印行的 `docs` 原序逐档
 *  重算，与 `docHashes` 里同一路径的记值比对，返回不等的那些路径。**只服务报面**——判定值仍是组合
 *  `hash`，本函数不参与放行与否。旧封印行没有 `docHashes`（本改动之前写下的）⇒ 空数组 ⇒ 拒文走无路径形。
 *  逐档读不到由调用方的 `try` 收成 `seal-unreadable`（fail-closed：判不了就不放行）。
 *  @param {{docs: string[], docHashes?: {path: string, hash: string}[]}} seal 槽里那一行封印
 *  @returns {string[]} 变了的档路径（按 `docs` 原序） */
function changedDocsOf(seal) {
  if (!Array.isArray(seal.docHashes)) return []
  const recorded = new Map()
  for (const d of seal.docHashes) {
    if (d && typeof d === "object" && typeof d.path === "string" && typeof d.hash === "string" && !recorded.has(d.path)) recorded.set(d.path, d.hash)
  }
  const changed = []
  for (const p of seal.docs) {
    const want = recorded.get(p)
    if (want === undefined) continue
    if (designDocHash(p) !== want) changed.push(p)
  }
  return changed
}

/** eng-coder spawn 的令牌门（TOOLS.md §6.25 ④⑤⑥）：resolveDesignSlot 的既有两条 designId
 *  诊断零改 → 参数在场 → 值相等 → 值有效 → 批归属 → 评审封印。槽删除只在 tokenExpired(given)
 *  成立时发生（D-R16c ③）；mismatch / invalid / batch / seal 不删槽（T-R16d）。返回槽内令牌
 *  （调用方回写 designId 依赖它）；sync / async 两路共经装配点——一处判定双路生效。
 *
 *  ⑤ 批归属（DESIGN-TOKEN-SETTLEMENT §10.1）：比较对象 = `buildSpawnChild` 的 batchDoc 门已解析
 *  好的绝对路径（第三参；本步不自己解析 `args.batchDoc`——解析单源在那一处）。旁列**严格读**：
 *  槽文件读不到 ⇒ 抛，不落进「旁列无值 ⇒ 不拦」。旁列无值（旧槽 ∥ 该次评审不带批档）⇒ 跳过。
 *  ⑥ 评审封印（§10.2）：只读槽里记下的 `docs` 复算，不自己推清单（自己推 = 两处各自定义「被审档」）。
 *  无封印值（旧槽）⇒ 跳过；被审档读不到 ⇒ 拒（fail-closed——判不了就不放行）。
 *  @param {string} opts.batchDocAbs 第三参恒由装配点给（eng-coder 缺 batchDoc 时更早的门已拒）；旁列有值
 *  而它不是串 = 接线故障 ⇒ throw（不是一条给用户看的拒因）。 */
export function gateDesignToken(parent, args, { batchDocAbs }) {
  const slot = resolveDesignSlot(parent, args?.designId)
  const issuedToken = slot.token
  // 非字符串 ⇒ 空串 ⇒ missing（本意——T9 锁定）
  const given = typeof args?.designToken === "string" ? args.designToken : ""
  if (!issuedToken || !given.trim()) throw designTokenRefusal("missing", null, {})
  if (given !== issuedToken) throw designTokenRefusal("mismatch", args?.designId, {})
  if (!validateDesignToken(given)) {
    const expired = tokenExpired(given)
    if (expired) removeDesignTokenSlot(parent, args?.designId, given)
    throw designTokenRefusal(expired ? "expired" : "invalid", null, {})
  }
  // ⑤ 批归属：旁列有值 ∧ 归一后 ≠ 本次 spawn 的 batchDoc 绝对路径 ⇒ 拒。排在封印之前 = 先判便宜的那条
  // （归属不符时不必逐档读盘算 hash；判据顺序单源 = TOOLS.md §6.25 ③ 的顺序行）。
  const batches = readEngTokenBatchesFromSlot(parent, { strict: true })
  // 「读到、没有这个 designId 的行」与「行在、值不成形」同判为**无归属**（与 `restoreEngTokens` 同一取舍：
  // 成形与否由写者保证；结构损坏在整档层已由严格读的 `JSON.parse` 兜住）。这不是一条宽容读。
  const bound = batches && typeof batches[slot.designId] === "string" ? batches[slot.designId] : null
  if (bound) {
    if (typeof batchDocAbs !== "string" || !batchDocAbs.trim()) {
      throw new Error(`gateDesignToken: design slot ${slot.designId} carries a batch attribution (${bound}) but the spawn passed no resolved batchDoc — the batchDoc gate runs before the token gate, so this is a wiring fault, not an input to judge.`)
    }
    if (batchPathKey(bound) !== batchPathKey(batchDocAbs)) {
      throw designTokenRefusal("batch", null, { boundBatch: bound, givenBatch: batchDocAbs })
    }
  }
  // ⑥ 评审封印：有封印值 ∧ 重算的 sha256 ≠ 记下的值 ⇒ 拒；清单里一份档读不到 ⇒ 拒（fail-closed）。
  const seals = readEngTokenSealsFromSlot(parent, { strict: true })
  const seal = seals && seals[slot.designId]
  // 成形不全的行也按「无封印值」跳过（与 `restoreEngTokens` 同一取舍）——它与「旧槽无值」不是同一种事实，
  // 是写明的一笔降级：成形由写者保证，整档结构损坏已由严格读的解析失败兜住；设计 §10.2 只裁到「旧槽无值 ⇒ 不拦」。
  const hasSeal = seal && typeof seal === "object" && typeof seal.hash === "string"
    && Array.isArray(seal.docs) && seal.docs.every((p) => typeof p === "string")
  if (hasSeal) {
    let actual
    let changed = []
    try {
      actual = designSealHash(seal.docs)
      // 只有组合值不等才逐档比（多数派单走不到这里）；逐档读不到由同一条 catch 收成 seal-unreadable。
      if (actual !== seal.hash) changed = changedDocsOf(seal)
    } catch (e) {
      throw designTokenRefusal("seal-unreadable", null, { path: e?.sealPath ?? "(unknown)" })
    }
    if (actual !== seal.hash) throw designTokenRefusal("seal", null, { changed })
  }
  return issuedToken
}