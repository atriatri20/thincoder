/**
 * model-test.mjs — 模型测试执行器（`agent/ADMIN-AGENT.md` §12.1 ∥ KD-SV-205；model-test-tool 批——台账 #1390）：
 * 对**已配渠道点名**发一次**真实调用**——单请求探针（经本进程网关链 loopback：`POST <selfBase>/v1/chat/completions`，
 * `stream: true`；本回合发送者的 `admin-agent` sk）∥ SSE 流扫描（首个非空内容增量 ∥ usage 末帧）∥ 读数归一（五件）。
 * 走链 ⇒ 记账/配额/限流**照常**（零第二份——§12.1②）；TTFB/吞吐不落库（读数 = 会话面结果——零迁移）。
 *
 * 读数闭集五支（§12.1③）：`ok`（2xx ＋ 流正常终结〔读取侧 done——`[DONE]` 非必需〕；零内容增量亦归〔空答 ⇒ `ttfbMs:null`〕）∥
 * `timeout`（预算耗尽——携 `phase`：`before_first_byte` ∥ `generating`）∥ `http_error`（响应非 2xx——携 `httpStatus` ＋ 原文摘录）∥
 * `bad_response`（2xx 但不可用：非 SSE 形 ∥ 解析不出事件〔零可解析事件且无 `[DONE]`〕）∥ `broken_stream`（传输中断——fetch 级失败亦归；
 * 首内容增量后携部分读数 ∥ 首内容增量前中断亦归〔零部分读数〕）。
 * 键在场形（§12.1③——不适用 ⇒ 缺席〔键不落〕；有源缺值 ⇒ null）：恒在 = `ok`／`status`／`model`／`totalMs`／`outputChars`（零产出 = 0）；
 * `ttfbMs`——无首内容增量 ⇒ null；`tps`／`tokens`——usage 缺 ⇒ null（**不估**；生成窗非正〔亚毫秒完成〕亦 null）；条件键 = `httpStatus` 仅 `http_error` ∥
 * `phase` 仅 `timeout` ∥ `error` 仅 `http_error`／`bad_response`（原文摘录：原样不重写；帽 500 字——逾限截断加注〔总长含注记 ≤ 帽〕；
 * 有界读 8 KiB——共享件 `readBodyExcerpt`）。
 * `totalMs`／`ttfbMs`／`tps` 分母窗以**注入钟**读时（`now` 注入口——单元测试档逐值相等断言；生产 = `Date.now`）。
 * 中止 = `AbortSignal.any([超时, 回合中止信号])`（`ctx.signal` 透传——中止即断开探针，沿 KD-SV-107）；回合中止（非超时）⇒ 抛工具级错误。
 * 最近先例（对齐 ∥ 偏离）：对齐 = 单动词入列（工具名集八件不变）＋ 读数自含不落库（控制台三件诊断先例）；偏离 = 经网关链**记账并计配额**
 * （诊断三件 = 零计费）——依据 = 用户 00:50 裁「走网关链，记账」＋账只能对在网关链（全文 = `agent/ADMIN-AGENT.md` §9 KD-SV-205）。
 */
import { RESPONSE_EXCERPT_READ_CAP, readBodyExcerpt, upstreamHeaders, upstreamUrl } from "../gateway/forward.mjs"
import { TAP_MAX_LINE_BYTES, pickUsage } from "../gateway/sse-tap.mjs"

/** 探针预算（秒——§12.1①：缺省 **60** ∥ 上界 **600**；界值依据 = 单请求 10 分钟窗——先于回合预算 20 min 收尾，超时读数可得）。 */
export const MODEL_TEST_TIMEOUT_S = 60
/** 探针预算上界（秒——非正/非数/越界 ⇒ 工具级错误人话；与 `exec` 同面「值域形」先例，界值依据在设计面）。 */
export const MODEL_TEST_TIMEOUT_S_MAX = 600
/** 探针输入字符帽（`prompt` 逾 2000 字 ⇒ 工具级错误人话——§12.1①）。 */
export const MODEL_TEST_PROMPT_MAX = 2000
/** 内置探针句（`prompt` 缺省——沿向量探针 `EMBEDDING_PROBE_TEXT` 同字面）。 */
export const MODEL_TEST_PROBE_TEXT = "ping"
/** `error` 摘录帽（字——原文摘录 500 字，§12.1③；有界读 8 KiB = 共享件读帽）。 */
export const MODEL_TEST_ERROR_MAX = 500
/** 状态闭集五支（机检锚点——§12.1③）。 */
export const MODEL_TEST_STATUSES = Object.freeze(["ok", "timeout", "http_error", "bad_response", "broken_stream"])

/** 状态人话（`summary` 面——§12.1①）。 */
const STATUS_TEXT = Object.freeze({ ok: "正常", timeout: "超时（预算耗尽）", http_error: "HTTP 错误", bad_response: "响应不可用", broken_stream: "流中断" })

/** 读数摘录（原文原样；帽 500 字——**逾限截断加注**〔§12.1③〕：尾注口径沿 `chat.mjs` `capText`，总长含注记 ≤ 帽）。 */
function excerptOf(text) {
  if (typeof text !== "string") return ""
  const trimmed = text.trim()
  const note = "…（截断）"
  if (trimmed.length <= MODEL_TEST_ERROR_MAX) return trimmed
  return `${trimmed.slice(0, Math.max(0, MODEL_TEST_ERROR_MAX - note.length))}${note}`
}

/**
 * SSE 事件扫描（字符串行面——CRLF ∥ 非 `data:` 行容错沿 `sse-tap.mjs` 口径；BOM 剥除本面**逐行**〔较流首口径更宽——不误判 `bad_response`〕；单行上限同源 `TAP_MAX_LINE_BYTES`）。
 * `feed(chunk)` 喂字节块（出 = 本块解码文本——摘录累积面用）；`flush()` 冲解码器与末行；`events` = 可解析事件数；
 * `terminator` = `[DONE]` 在场（SSE 形证人）。
 */
function createEventScanner({ onEvent }) {
  const decoder = new TextDecoder()
  let buffer = ""
  let events = 0
  let terminator = false
  const handleLine = (raw) => {
    let line = raw
    if (line.length > 0 && line.charCodeAt(0) === 0xfeff) line = line.slice(1) // 行首 BOM 剥除（本面逐行容错——较流首口径更宽）
    if (line.endsWith("\r")) line = line.slice(0, -1) // CRLF 容错
    if (!line.startsWith("data:")) return
    const payload = line.slice(5).trim()
    if (payload === "") return
    if (payload === "[DONE]") {
      terminator = true
      return
    }
    let parsed
    try {
      parsed = JSON.parse(payload)
    } catch {
      return // 非 JSON 行忽略（不抛）
    }
    events += 1
    onEvent(parsed)
  }
  const scan = (final) => {
    for (;;) {
      const nl = buffer.indexOf("\n")
      if (nl === -1) break
      const line = buffer.slice(0, nl)
      buffer = buffer.slice(nl + 1)
      handleLine(line)
    }
    if (buffer.length > TAP_MAX_LINE_BYTES) buffer = "" // 超长行弃扫（同源口径——不缓冲全流）
    if (final && buffer !== "") {
      const rest = buffer
      buffer = ""
      handleLine(rest)
    }
  }
  return {
    feed(chunk) {
      const text = decoder.decode(chunk, { stream: true })
      buffer += text
      scan(false)
      return text
    },
    flush() {
      buffer += decoder.decode() // 冲出解码器缓存（stream: true 的收尾）
      scan(true)
    },
    events: () => events,
    terminator: () => terminator,
  }
}

/** 双信号合成（预算 ∥ 回合中止——缺回合信号 ⇒ 单用预算；沿 KD-SV-107 口径）。 */
function combineSignals(budget, signal) {
  return signal === null || signal === undefined ? budget : AbortSignal.any([budget, signal])
}

/**
 * 跑一次模型测试（§12.1②③——单请求；出 = 读数五件 ＋ 恒在键，形 = 键在场形表）。
 * 入参：`baseURL` = 出口基址（`<selfBase>/v1`——`chatProviderOf` 描述子 `.provider.baseURL`）∥ `apiKey` = 管理面 sk 明文 ∥
 * `model` = **对外标识**（请求体 `model` ＋ 读数 `model` 同值——网关链派发口径）∥ `prompt` = 探针输入 ∥ `timeoutS` = 预算（秒）∥
 * `fetchImpl` = 探针传输（假件缝——默认 `fetch`）∥ `now` = 注入钟 ∥ `signal` = 回合中止信号 ∥ `log`。
 * 回合中止（非预算耗尽）⇒ 抛（工具级错误——回灌模型自纠）。
 */
export async function runModelTest({ baseURL, apiKey, model, prompt = MODEL_TEST_PROBE_TEXT, timeoutS = MODEL_TEST_TIMEOUT_S, fetchImpl = fetch, now = Date.now, signal = null, log = null } = {}) {
  const started = now()
  const budget = AbortSignal.timeout(Math.max(1, Math.round(timeoutS * 1000))) // 整数毫秒（AbortSignal.timeout 只收整数）
  const combined = combineSignals(budget, signal)
  let status = null
  let httpStatus = null
  let error = null
  let ttfbMs = null
  let outputChars = 0
  let tokens = null
  let fetcher = null
  const scanner = createEventScanner({
    onEvent: (parsed) => {
      const content = parsed?.choices?.[0]?.delta?.content
      if (typeof content === "string" && content !== "") {
        if (ttfbMs === null) ttfbMs = now() - started // 首个**非空内容增量**（流首空壳块不计——§12.1③）
        outputChars += content.length
      }
      const picked = pickUsage(parsed) // usage 末次胜出（同 `sse-tap` 口径——三值原值）
      if (picked !== null) tokens = picked
    },
  })

  try {
    const response = await fetchImpl(upstreamUrl(baseURL, "/chat/completions"), {
      method: "POST",
      headers: upstreamHeaders({ apiKey }), // content-type + `Bearer <sk 明文>`（网关门验收）
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], stream: true }), // `stream_options` 由链侧注入（KD-SV-5）
      signal: combined,
    })
    httpStatus = response.status
    if (!response.ok) {
      // 摘录 = 共享件（有界读）；limit = 帽 + 1 ⇒ 逾限可判（多读 1 字只为「截断加注」判定，仍在 8 KiB 读帽内）
      error = excerptOf(await readBodyExcerpt(response, MODEL_TEST_ERROR_MAX + 1))
      status = "http_error"
    } else if (response.body?.getReader === undefined) {
      error = excerptOf(await readBodyExcerpt(response, MODEL_TEST_ERROR_MAX + 1)) // 2xx 无 body ⇒ 非 SSE 形（替身/异常形同判）
      status = "bad_response"
    } else {
      fetcher = response.body.getReader()
      let raw = ""
      let rawBytes = 0
      for (;;) {
        const { done, value } = await fetcher.read()
        if (done) break
        if (value === undefined || value === null) continue
        if (rawBytes < RESPONSE_EXCERPT_READ_CAP) { // 读帽 = 共享件同源常量（字节——「有界读 8 KiB」§12.1③）
          const text = scanner.feed(value)
          raw += text
          rawBytes += value.byteLength
          if (scanner.events() === 0 && !scanner.terminator() && rawBytes >= RESPONSE_EXCERPT_READ_CAP) {
            // 有界读：零事件零终结而累积已至读帽 ⇒ 非 SSE 形（不整段缓冲大响应——沿向量探活口径）
            await fetcher.cancel().catch(() => {})
            status = "bad_response"
            error = excerptOf(raw)
            break
          }
        } else {
          scanner.feed(value)
        }
      }
      if (status === null) {
        scanner.flush()
        status = scanner.events() === 0 && !scanner.terminator() ? "bad_response" : "ok" // 零可解析事件且无 [DONE] ⇒ 不可用
        if (status === "bad_response") error = excerptOf(raw)
      }
    }
  } catch (e) {
    if (budget.aborted) status = "timeout" // 预算耗尽（携阶段——见下）
    else if (signal !== null && signal !== undefined && signal.aborted) throw new Error(`模型测试已中止（回合中止——探针已断开）：${e?.message ?? String(e)}`)
    else status = "broken_stream" // 传输中断（fetch 级失败亦归；含首内容增量前中断）
    log?.warn("model_test_failed", { model, status, message: e?.message ?? String(e) })
  } finally {
    await fetcher?.cancel().catch(() => {}) // 读错/读毕/中止三径同取消（取消异常不掩原读数）
  }

  const totalMs = now() - started
  const windowMs = ttfbMs === null ? null : totalMs - ttfbMs
  const tps = tokens !== null && typeof tokens.completionTokens === "number" && windowMs !== null && windowMs > 0
    ? (tokens.completionTokens * 1000) / windowMs // 生成窗 = 首个内容增量 ⇒ 流终结（§12.1③）
    : null // usage 缺 ∥ 生成窗非正（亚毫秒完成——无可除窗）⇒ null（不估）
  const readings = { ok: true, status, model, totalMs, ttfbMs, tps, tokens, outputChars } // 键在场形（§12.1③——恒在键）
  if (status === "http_error") {
    readings.httpStatus = httpStatus
    readings.error = error ?? ""
  }
  if (status === "bad_response") readings.error = error ?? ""
  if (status === "timeout") readings.phase = ttfbMs === null ? "before_first_byte" : "generating"
  return readings
}

/** 人话一行（`summary`——§12.1①；读数缺值不编：空答 ∥ usage 缺如实略去对应段）。 */
export function modelTestSummaryOf(readings) {
  const bits = [`总 ${readings.totalMs}ms`]
  if (readings.ttfbMs !== null) bits.push(`首字节 ${readings.ttfbMs}ms`)
  if (readings.tps !== null) bits.push(`${readings.tps} tok/s`)
  bits.push(`输出 ${readings.outputChars} 字`)
  const head = `模型 ${readings.model}：${STATUS_TEXT[readings.status] ?? readings.status}`
  if (readings.status === "http_error") return `${head}（HTTP ${readings.httpStatus}）——${readings.error ?? ""}`
  if (readings.status === "bad_response") return `${head}——${readings.error ?? ""}`
  if (readings.status === "timeout") return `${head}（${readings.phase === "generating" ? "生成中" : "首字节前"}——${bits.join(" ∥ ")}）`
  return `${head}（${bits.join(" ∥ ")}）`
}
