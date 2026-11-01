/**
 * provider/normalize.mjs — pre-send payload normalization (2026-08-31 extract).
 *
 * Split from core.mjs (TODO #2: 420 lines, past the 300 advisory). These two
 * pure functions sanitize the message array right before it hits the wire;
 * no dependency on chat()/retry logic. core.mjs re-exports them so
 * provider/index.mjs keeps its import paths.
 */

import { crc32 as pngCrc32, inflateSync } from "node:zlib"

const RASTER_IMAGE_URL = /^data:image\/(png|jpe?g|gif|webp);base64,/

/** 历史图片累计字节预算（D-PR32——40MB 级请求体的保守下界，留两张大图余量；可调）。 */
export const IMAGE_HISTORY_BYTES_BUDGET = 32 * 1024 * 1024

/** 图片驱逐占位文本（D-PR32 逐字）。 */
const IMAGE_BUDGET_PLACEHOLDER = "[image omitted — dropped to keep the request under the history image budget]"

/** 图片拒绝剥除占位文本（PROVIDER.md §6.26 逐字——逐图原位替换）。 */
export const IMAGE_REJECTED_PLACEHOLDER = "[image omitted — the provider rejected the image payload; dropped from history so the session can continue. Re-read a smaller copy if the image is still needed.]"

/** 单 part 的 base64 载荷长度（仅 data URL；非 data 引用不过请求体、零计账）。 */
function imagePartBytes(p) {
  if (p?.type !== "image_url") return 0
  const url = p.image_url?.url
  if (typeof url !== "string" || !url.startsWith("data:")) return 0
  const comma = url.indexOf(",")
  return comma >= 0 ? url.length - comma - 1 : 0
}

/** 图像 part 替换核（D-PR32 字节驱逐 ∥ §6.26 拒绝剥除共用——`drop` = `${mi}:${pi}` 键集；
 *  命中 part 原位换 `placeholder`；copy-on-write：未命中消息原引用返回）。 */
function replaceImageParts(messages, drop, placeholder) {
  return messages.map((m, mi) => {
    const parts = m?.content
    if (!Array.isArray(parts)) return m
    let changed = false
    const next = parts.map((p, pi) => {
      if (!drop.has(`${mi}:${pi}`)) return p
      changed = true
      return { type: "text", text: placeholder }
    })
    return changed ? { ...m, content: next } : m
  })
}

/**
 * 历史图片累计字节预算（D-PR32）：全部 image part 的 base64 载荷和超 budgetBytes 时，
 * 从**最老**图起替换为占位文本，直到剩余 ≤ 预算。纯函数 + 拷贝语义（未改动时返回原引用；
 * 改动时仅重建涉及的消息对象）——发送前对消息副本用；注入面对 `history` 本体回写（同函数同预算）。
 * @param {Array} messages
 * @param {number} [budgetBytes]
 * @param {string} [placeholder] 占位文本（缺省 = D-PR32 逐字原文——§6.26 新增参零扰）
 */
export function capHistoryImages(messages, budgetBytes = IMAGE_HISTORY_BYTES_BUDGET, placeholder = IMAGE_BUDGET_PLACEHOLDER) {
  if (!Array.isArray(messages)) return messages
  const hits = []
  let total = 0
  for (let mi = 0; mi < messages.length; mi++) {
    const parts = messages[mi]?.content
    if (!Array.isArray(parts)) continue
    for (let pi = 0; pi < parts.length; pi++) {
      const bytes = imagePartBytes(parts[pi])
      if (bytes <= 0) continue
      total += bytes
      hits.push({ mi, pi, bytes })
    }
  }
  if (total <= budgetBytes || hits.length === 0) return messages
  const drop = new Set()
  let remaining = total
  for (const hit of hits) {
    if (remaining <= budgetBytes) break
    drop.add(`${hit.mi}:${hit.pi}`)
    remaining -= hit.bytes
  }
  return replaceImageParts(messages, drop, placeholder)
}

/**
 * 图片拒绝剥除（PROVIDER.md §6.26）：全部 image part 一次原位换 `IMAGE_REJECTED_PLACEHOLDER`
 * （全剥——单图归因信息不存在；只剥最新 ⇒ 二连败）。copy-on-write：仅重建含图消息对象
 * （两线共享消息对象——人读线 `_fullHistory` 内图不动）；无图 ⇒ 原引用返回。
 * @param {Array} messages
 */
export function stripRejectedImages(messages) {
  if (!Array.isArray(messages)) return messages
  const drop = new Set()
  for (let mi = 0; mi < messages.length; mi++) {
    const parts = messages[mi]?.content
    if (!Array.isArray(parts)) continue
    for (let pi = 0; pi < parts.length; pi++) {
      if (parts[pi]?.type === "image_url") drop.add(`${mi}:${pi}`)
    }
  }
  if (drop.size === 0) return messages
  return replaceImageParts(messages, drop, IMAGE_REJECTED_PLACEHOLDER)
}

export function stripImagesForTextModel(messages, spec) {
  let changed = false
  const out = messages.map((m) => {
    if (!Array.isArray(m.content) || !m.content.some((p) => p?.type === "image_url")) return m
    let msgChanged = false
    const parts = m.content.map((p) => {
      if (p?.type !== "image_url") return p
      const url = p.image_url?.url || ""
      if (!url.startsWith("data:")) return p
      if (spec.multimodal && RASTER_IMAGE_URL.test(url)) return p
      msgChanged = true
      const reason = spec.multimodal
        ? `unsupported format ${url.match(/^data:([^;,]+)/)?.[1] || "unknown"}`
        : "this model does not support image input"
      return { type: "text", text: `[image omitted — ${reason}]` }
    })
    if (!msgChanged) return m
    changed = true
    return { ...m, content: parts }
  })
  return changed ? out : messages
}

/** Magic-byte sniff for raster images (single source — the read tool's bad-bytes gate and the
 *  wire-side quarantine below both consume this). Matches png/jpeg/gif/webp ⇒ its mime; garbage /
 *  truncated / non-image bytes ⇒ null. Judges CONTENT, not declarations.
 *  Exported (re-exported from tools/file.mjs for its test floor). */
export function sniffImageMime(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf ?? [])
  if (b.length < 12) return null
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png"
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  const head6 = b.slice(0, 6).toString("latin1")
  if (head6 === "GIF87a" || head6 === "GIF89a") return "image/gif"
  if (b.slice(0, 4).toString("latin1") === "RIFF" && b.slice(8, 12).toString("latin1") === "WEBP") return "image/webp"
  return null
}

/** PNG 完整解码判据（伪件实锤批 · 2026-10-12）：头 8 字节真魔数 ∕ IHDR 合法 ∕ 逐块 CRC ∕ IDAT zlib
 *  膨胀尺寸 = h×(1+行字节) 四关全过才算图——**头验拦不住「真魔数 + 偽内部」件**（真机毒源正是它：
 *  上游做完整解码 ⇒ 1210）。失败 ⇒ false（含截断 ∕ CRC 错 ∕ 膨胀尺寸不合）。 */
function pngComplete(b) {
  try {
    let off = 8
    let w = 0, h = 0, depth = 0, color = 0
    const idat = []
    while (off + 12 <= b.length) {
      const len = b.readUInt32BE(off)
      const type = b.slice(off + 4, off + 8).toString("latin1")
      const data = b.slice(off + 8, off + 8 + len)
      if (pngCrc32(Buffer.concat([b.slice(off + 4, off + 8), data])) !== b.readUInt32BE(off + 8 + len)) return false
      if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; color = data[9] }
      else if (type === "IDAT") idat.push(data)
      else if (type === "IEND") break
      off += 12 + len
    }
    if (idat.length === 0 || w === 0 || h === 0 || depth === 0) return false
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color]
    if (channels === undefined) return false
    const rowBytes = Math.ceil((w * channels * depth) / 8)
    return inflateSync(Buffer.concat(idat)).length === h * (1 + rowBytes)
  } catch {
    return false
  }
}

/** 光栅图**完整可解码**判据（发侧隔离 ∕ 读侧拒注入同源）：PNG = 全解码四关；JPEG = EOI 尾标记在场；
 *  GIF = 图像描述符（0x2C）+ trailer（0x3B）收尾；WebP = RIFF 长度场与实际长度一致。真图零误伤
 *  （浏览器能显示的件全过）；伪件 ∕ 截断件 ⇒ false。 */
export function rasterImageComplete(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf ?? [])
  const mime = sniffImageMime(b)
  if (mime === null) return false
  try {
    if (mime === "image/png") return pngComplete(b)
    if (mime === "image/jpeg") return b.length > 4 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9
    if (mime === "image/gif") return b.length > 16 && b[b.length - 1] === 0x3b && b.includes(0x2c)
    if (mime === "image/webp") return b.length >= 12 && b.readUInt32LE(4) === b.length - 8
  } catch {
    return false
  }
  return false
}

/** 坏图隔离（1210 毒化批 · 2026-10-12）：`contextHistory` 持久化**含 base64 图 part** ⇒ 历史里的坏图
 *  （伪件 ∕ 截断件——曾由 read_image 误注入）**跨重启重放**，上游对坏图 part 恒 400
 *  （`[1210]图片输入格式/解析错误`）⇒ 该会话后续每个请求连带失败（连纯文本也死——毒在请求体里）。
 *  发送前逐 data-URL 图 part **完整可解码**判（`rasterImageComplete`——PNG 全解码四关，头验拦不住
 *  「真魔数 + 偽内部」件——真机毒源正是它）⇒ 不过 ⇒ 该 part 替换为占位文本（先例 =
 *  `stripImagesForTextModel` 的 omit 句式）⇒ **带毒旧会话下一回合自愈**（请求体恒净；休眠坏 part
 *  留在持久化里无害）。非 data 引用（http(s)）本地不可验 ⇒ 原样放行（上游自行取件）。
 *  纯函数 ∕ 拷贝语义（未命中返回原引用——幂等帧零重建）。 */
const MALFORMED_IMAGE_PLACEHOLDER = "[image omitted — malformed or corrupt image content]"

export function quarantineMalformedImages(messages) {
  if (!Array.isArray(messages)) return messages
  let changed = false
  const out = messages.map((m) => {
    if (!Array.isArray(m?.content) || !m.content.some((p) => p?.type === "image_url")) return m
    let msgChanged = false
    const parts = m.content.map((p) => {
      if (p?.type !== "image_url") return p
      const url = p.image_url?.url || ""
      if (!url.startsWith("data:") || !url.includes(",")) return p
      const bytes = Buffer.from(url.slice(url.indexOf(",") + 1), "base64")
      if (rasterImageComplete(bytes)) return p
      msgChanged = true
      return { type: "text", text: MALFORMED_IMAGE_PLACEHOLDER }
    })
    if (!msgChanged) return m
    changed = true
    return { ...m, content: parts }
  })
  return changed ? out : messages
}

/**
 * Enforce the OpenAI tool-message protocol on the outgoing payload: every tool message must
 * immediately follow the assistant message declaring its tool_call_id, and every declared
 * tool_call must have a result. Strict providers (DeepSeek) reject the whole request with 400
 * ("Messages with role 'tool' must be a response to a preceding message with 'tool_calls'").
 * History can legitimately violate this — parallel read_image injects a user message between
 * tool results, compaction splits, interrupted sessions leave dangling tool_calls — so sanitize
 * at send time. History itself is left untouched.
 */
export function normalizeToolPairing(messages) {
  // Detach all tool messages; reinsert each right after its owner assistant.
  const toolById = new Map()
  const rest = []
  for (const m of messages) {
    if (m.role === "tool") {
      if (!toolById.has(m.tool_call_id)) toolById.set(m.tool_call_id, m)
    } else {
      rest.push(m)
    }
  }
  if (toolById.size === 0 && !messages.some((m) => m.role === "assistant" && m.tool_calls?.length)) {
    return messages // no tool messages AND no tool_calls declared — nothing to enforce
  }
  const out = []
  for (const m of rest) {
    out.push(m)
    if (m.role !== "assistant" || !m.tool_calls?.length) continue
    for (const tc of m.tool_calls) {
      if (!tc || typeof tc !== "object") continue // 空元素不携带 id：跳过，不让整个回合崩（#31）
      const t = toolById.get(tc.id)
      if (t) {
        toolById.delete(tc.id)
        out.push(t)
      } else {
        // Declared tool_call with no recorded result (interrupted session / compaction split)
        out.push({
          role: "tool",
          tool_call_id: tc.id,
          content: "[Tool result missing: the call was interrupted or its result was dropped by context compaction]",
        })
      }
    }
  }
  // Leftovers in toolById are orphans (owner assistant compacted away or never recorded) — dropped
  return out
}

