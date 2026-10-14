/**
 * terminal-vt.mjs — VT 解析器·纯件（`webui/TERMINAL.md` §2.1/§2.2；终端核的**解析面**）：
 * **实施实读越 500 软线后按职责界线拆出**（拆案触发点在册——`webui/TERMINAL.md` §3「实施实读 >500 ⇒ 按职责界线拆
 * （候选 = VT 解析 ∥ 网格模型两档）」；本档 = 候选①，网格/语义 = `terminal-core.mjs`）。
 * 面 = **字符级状态机**（ground ∥ ESC ∥ CSI ∥ OSC ∥ 字符集设计）逐码点进食 ⇒ 事件回调
 * （`print`/`control`/`escape`/`csi`）——语义（网格/光标/SGR/模式位）归 `terminal-core.mjs`，本档零网格知识。
 * 字符集（G0/G1 设计 ∥ DEC 特殊图形线绘映射 ∥ SO/SI 移位）= 输出侧字符翻译，随解析面。
 * **零 DOM ∥ 零网络 ∥ 零控制台依赖**（可独立直测：喂文本 ⇒ 事件序列）。
 */

/** DEC 特殊图形（线绘——§2.2 字符集行：G0/G1 设计为 `0` 时按此表映射）。 */
const DEC_GRAPHICS = {
  "`": "◆", a: "▒", b: "␉", c: "␌", d: "␍", e: "␊", f: "°", g: "±", h: "␤", i: "␋", j: "┘", k: "┐", l: "┌",
  m: "└", n: "┼", o: "⎺", p: "⎻", q: "─", r: "⎼", s: "⎽", t: "├", u: "┤", v: "┴", w: "┬", x: "│", y: "≤",
  z: "≥", "{": "π", "|": "≠", "}": "£", "~": "·",
}

/**
 * 建解析器：`handlers` = `{ print(ch) ∥ control(code) ∥ escape(final) ∥ csi({ final, params, privateMark }) }`；
 * 返回 `{ write(text), reset() }`——`write` 逐码点进食（代理对安全），`reset` 清残态（新会话/RIS）。
 */
export function createParser({ print, control, escape, csi }) {
  let state = "ground"
  let params = []
  let privateMark = ""
  let subparam = false // 冒号子参组态（组内数字吞：`4:2` ⇒ 落 4——样式子参不做）
  let charsetMark = ""
  let g0 = "ascii"
  let g1 = "ascii"
  let shift = false

  /** 字符集设计（`ESC ( x` / `ESC ) x`——`0` = DEC 特殊图形 ∥ `B`/`A`/`U` = ASCII）。 */
  function designChar(ch) {
    const target = charsetMark === "(" ? "g0" : "g1"
    const set = ch === "0" ? "dec" : "ascii"
    if (target === "g0") g0 = set
    else g1 = set
  }

  function reset() {
    state = "ground"
    params = []
    privateMark = ""
    charsetMark = ""
    g0 = "ascii"
    g1 = "ascii"
    shift = false
  }

  function emitPrint(ch) {
    const active = shift ? g1 : g0
    print(active === "dec" && ch in DEC_GRAPHICS ? DEC_GRAPHICS[ch] : ch)
  }

  function feed(ch) {
    const code = ch.codePointAt(0)
    if (state === "ground") {
      if (code === 0x1b) { state = "esc"; privateMark = ""; return } // ESC ⇒ 序列态（§2.1）
      if (code < 0x20 || code === 0x7f) {
        if (code === 0x0e) shift = true // SO ⇒ G1
        else if (code === 0x0f) shift = false // SI ⇒ G0
        else if (code === 0x18 || code === 0x1a) reset() // CAN/SUB 取消序列
        else if (code !== 0x7f) control(code)
        return
      }
      emitPrint(ch)
      return
    }
    if (state === "esc") {
      if (ch === "[") { state = "csi"; params = []; privateMark = ""; subparam = false }
      else if (ch === "]") state = "osc"
      else if (ch === "(" || ch === ")") { state = "charset"; charsetMark = ch }
      else { state = "ground"; if (ch !== "\\") escape(ch) }
      return
    }
    if (state === "charset") {
      state = "ground"
      designChar(ch)
      return
    }
    if (state === "osc") {
      if (ch === "\x07") state = "ground" // BEL 收尾
      else if (ch === "\x1b") state = "osc-st"
      return
    }
    if (state === "osc-st") {
      state = ch === "\\" ? "ground" : "osc" // ST（`ESC \`）收尾
      return
    }
    // csi：参数（数字/分号）∥ 冒号子参组（吞——设计登记不做）∥ 私有标记（? > =）∥ 中间字节吞 ∥ 终符分派
    if (code >= 0x30 && code <= 0x39) {
      if (subparam) return // 子参组内数字：整组忽略（`4:2` 样式子参 ∥ `38:5:n` 冒号形——均不做）
      if (params.length === 0) params.push(0)
      params[params.length - 1] = params[params.length - 1] * 10 + (code - 48)
    } else if (ch === ";") { subparam = false; params.push(0) }
    else if (ch === ":") subparam = true // 子参组起（首个参数已落——基础属性照施，样式子参丢，`TERMINAL.md` §2.2 SGR 行）
    else if (ch === "?" || ch === ">" || ch === "=") privateMark = ch
    else if (code < 0x20) control(code)
    else if (code >= 0x40 && code <= 0x7e) {
      const event = { final: ch, params, privateMark }
      state = "ground"
      params = []
      privateMark = ""
      subparam = false
      csi(event)
    }
  }

  return {
    /** 喂文本（已解码字符串——逐码点；残态跨调用保持）。 */
    write(text) {
      for (const ch of String(text ?? "")) feed(ch)
    },
    reset,
  }
}
