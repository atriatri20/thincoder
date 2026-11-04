/**
 * ssh-text.mjs — SSH **可见文本面**单点（剥离 ∥ 归一 ∥ 遮蔽）。
 *
 * 2026-11-05 拆档族从 `ssh-transport.mjs` 外移：这三件是「字节 → 可见文本」的纯函数链，不含子进程、
 * 计时与就绪判定——传输面其余部分全是进程与等待。设计 = `docs/core/design/TOOLS.md` §6.22（D-TO23）。
 *
 * 搬家形 = 具名符号整块外移、体逐字、字段名零改：`createStripper` ∥ `normalizeText` ∥ `createMask` ∥
 * `escapeNote` 与两件私有常量（`INVISIBLE_SPLIT` ∥ `MASK_SEG_MIN`）。原档 import 回来并原样再导出
 * ⇒ `ssh-session.mjs` / `ssh-transfer.mjs` / `ssh-vault.mjs` 的 import 行零改。
 *
 * **`flushEscapes` 没跟出来**：它的体除了读 `strippers` 的收场形态，还把交出的字节经 `handleChunk`
 * 汇入 `logStream` / `buf` / 等待者（传输面的运行时汇聚点，仍住原档）——搬过来就得反向 import 原档，
 * 而两档互 import 在 ESM 下会成环。它的读者面全在原档内部（无档外消费者），落点不改导出面。
 *
 * 依赖单向：`本档 ← ssh-transport.mjs`（本档零 import、零 fs、零状态）。
 */

/** 不可见处（遮蔽比较面的切段器——与剥离同一类目：CSI ∥ ESC+1 ∥ 任一控制字符）。 */
const INVISIBLE_SPLIT = /\x1b\[[\x20-\x3f]*[\x40-\x7e]|\x1b[^\x1b]?|[\x00-\x1f\x7f]/

/** 遮蔽分段下限（§6.22 ③「`≥ 4` 为选定策略值」：3 字符以下与正常输出撞面过高）。 */
const MASK_SEG_MIN = 4

/** 有状态剥离器（§6.22 ③）：三类序列 CSI ∥ OSC ∥ 单字符控制 + `\r\n`∥裸 `\r` 归 `\n`。
 *  状态跨 chunk 携带（序列被 chunk 边界切开不残留成字面）；三类之外的序列（DCS / APC 等）按
 *  单字符控制处理——头字节剥掉，体内字节当可见文本如实交出（设计「表外序列的出口」）。
 *  `push` = 返回边界（状态保留）；`end` = 收场（硬超时 ∥ close ∥ 会话终结：尾部半条序列丢弃并计一次）。 */
export function createStripper() {
  let state = "ground" // ground ∥ esc ∥ csi ∥ osc ∥ oscEsc ∥ charset
  let pendingCr = false // chunk 尾的 `\r`（下一片首字为 `\n` ⇒ 仍归一条——跨 chunk 的 CRLF）
  const scan = (text) => {
    const s = String(text ?? "")
    let out = ""
    let i = 0
    while (i < s.length) {
      const ch = s[i]
      if (pendingCr) {
        pendingCr = false
        out += "\n"
        if (ch === "\n") { i += 1; continue }
      }
      if (state === "esc") {
        state = "ground"
        if (ch === "[") state = "csi"
        else if (ch === "]") state = "osc"
        else if (ch === "(" || ch === ")" || ch === "*" || ch === "+") state = "charset"
        else if (ch === "\x1b") state = "esc"
        i += 1
        continue
      }
      if (state === "charset") { state = "ground"; i += 1; continue } // `ESC ( 0` 字符集指定（既有覆盖不回归）
      if (state === "csi") {
        const c = ch.charCodeAt(0)
        if (c >= 0x20 && c <= 0x3f) { i += 1; continue } // 参数 ∥ 中间字节
        if (c >= 0x40 && c <= 0x7e) { state = "ground"; i += 1; continue } // 终字节
        state = "ground" // 类外字 ⇒ 序列作废，本字按常规面重判（不吞可见字节）
        continue
      }
      if (state === "osc") {
        if (ch === "\x07") { state = "ground"; i += 1; continue }
        if (ch === "\x1b") { state = "oscEsc"; i += 1; continue }
        i += 1
        continue
      }
      if (state === "oscEsc") {
        state = "ground"
        if (ch === "\\") { i += 1; continue } // `ESC \` = ST
        state = "osc" // 非 ST ⇒ 本字仍在 OSC 体内（ESC 已丢弃，体内字节本就要丢）
        continue
      }
      if (ch === "\x1b") { state = "esc"; i += 1; continue }
      if (ch === "\r") {
        if (i + 1 >= s.length) { pendingCr = true; i += 1; continue }
        out += "\n"
        i += s[i + 1] === "\n" ? 2 : 1
        continue
      }
      if (ch === "\n" || ch === "\t") { out += ch; i += 1; continue }
      const code = ch.charCodeAt(0)
      if (code < 0x20 || code === 0x7f) { i += 1; continue } // BEL ∥ 退格 ∥ 其余 C0（保留 `\n` / `\t`）
      out += ch
      i += 1
    }
    return out
  }
  return {
    /** 喂一片（返回可交出文本；半条序列留给下一片）。 */
    feed(text) { return scan(text) },
    /** 收场：尾部半条序列丢弃并计一次；其前后的可见字节照常交出。 */
    end(text = "") {
      let out = scan(text)
      if (pendingCr) { out += "\n"; pendingCr = false }
      const dropped = state === "ground" ? 0 : 1
      state = "ground"
      return { text: out, dropped }
    },
  }
}

/** 同一归一（无状态旁路——遮蔽比较面用：秘密值先过控制字节剥离 + CRLF 归一）。 */
export function normalizeText(text) {
  return createStripper().end(String(text ?? "")).text
}

/** 秘密遮蔽过滤器：字面移除 + `len-1` 尾缓冲（跨 chunk 切分不泄；尾至沉降冲涮）。
 *  比较面 = 与剥离同一归一（§6.22 ③）：秘密值先归一、再按不可见处切段（段长 ≥ 4）——
 *  裸字面匹配会漏掉夹控制字节 ∥ 被 chunk 切开的回显。 */
export function createMask() {
  const secrets = []
  let tail = ""
  let keep = 0
  return {
    add(secret) {
      const raw = String(secret ?? "")
      if (!raw) return
      const table = [normalizeText(raw), ...raw.split(INVISIBLE_SPLIT).filter((seg) => seg.length >= MASK_SEG_MIN)]
      for (const s of table) {
        if (!s || secrets.includes(s)) continue
        secrets.push(s)
        keep = Math.max(keep, s.length - 1)
      }
    },
    push(text) {
      let out = tail + String(text ?? "")
      for (const s of secrets) out = out.split(s).join("")
      if (out.length <= keep) { tail = out; return "" }
      const emit = out.slice(0, out.length - keep)
      tail = out.slice(out.length - keep)
      return emit
    },
    /** 尾缓冲现行内容（**判据面用**：门①② 要看到已达字节——尾在 drain 时释放，判据不得被它推迟）。 */
    peek() { return tail },
    /** 沉降时冲涮尾缓冲：**只放行非秘密前缀段**（尾内最长可疑后缀一律扣下——整尾 ∥ 移位前缀
     *  都不出返回面；扣下的至多 `秘密长-1` 字符，代价 < 前缀外泄）。 */
    flush() {
      const t = tail
      tail = ""
      if (!t) return ""
      let cut = 0
      for (const s of secrets) {
        const max = Math.min(t.length, s.length - 1)
        for (let L = 1; L <= max; L++) if (t.endsWith(s.slice(0, L))) cut = Math.max(cut, L)
      }
      return cut ? t.slice(0, t.length - cut) : t
    },
  }
}

/** 半条序列收场注记（§6.22 ③ flush②）——报告一次即清零。 */
export function escapeNote(entry) {
  const n = entry.escDropped ?? 0
  if (!n) return ""
  entry.escDropped = 0
  return `\n— ${n} incomplete escape sequence dropped`
}