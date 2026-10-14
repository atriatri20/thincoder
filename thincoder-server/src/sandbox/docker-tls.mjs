/**
 * docker-tls.mjs — 连接面 TLS 档（`sandbox/SANDBOX.md` §3 连接方式块 ∥ `sandbox/EXECUTION.md` §2.1/§15 KD-SV-192…195；
 * sandbox-exec-rebuild 批 · 增补 #2——用户 2026-10-13 22:43 裁「明文保缺省 + TLS 客户端证书可选」）：
 * ① **三件形校验**（CA ∥ 客户端证书 ∥ 客户端私钥——`parseTlsMaterials`；材料用户自备，不自建 PKI）
 * ② **材料存取**（私钥 AES-256-GCM 复用 `store/credential-crypto.mjs`——沿 KD-SV-84；CA/证书 = 原文档列）
 * ③ **连接元数据视图**（`connectionKindOf` = 地址 scheme 单源派生 ∥ `tlsMetaOf` 只出 state/updatedAt——**零回显/零回填/零导出**）
 * ④ **`node:https` 传输适配件**（`httpsFetchOf`——fetch 形最小件 `(url, { method, signal, headers, body }) → { status, text(), arrayBuffer() }`；
 *    `ca`/`cert`/`key` 逐值入 `https.request` 选项；`requestImpl` = 假件缝——缺省 `null` ⇒ `node:https` 本尊）。
 *
 * 不变量（服务端双向校验——路由面）：`https` ⇔ 三件齐（零半档）；明文路径零涉（`clientForRunner` 对 `http://` 行恒用注入 `fetchImpl`，不构造本件适配件）。
 * 密面纪律：三件只进不出——响应/审计/日志零材料字段；本件不导出任何「读回材料」的展示形（`tlsMaterialsOf` 仅执行前解密入传输选项，调用方不得外泄）。
 */
import { request as httpsRequest } from "node:https"
import { credentialKeyPath, decryptSecret, encryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"

/** 连接档值域（地址 scheme 单源——不设 mode 列）。 */
export const CONNECTION_KINDS = Object.freeze(["plain", "tls"])

/** 材料单件上限（PEM 原文；与主机凭据 `SECRET_MAX` 同量级）。 */
export const TLS_MATERIAL_MAX = 20000

/** 连接档归一：缺省/空 ⇒ `plain`（不携档零行为变化）；表外 ⇒ 抛人话（调用方转 400）。 */
export function normalizeConnectionKind(raw) {
  if (raw === undefined || raw === null) return "plain"
  const text = String(raw).trim()
  if (text === "") return "plain"
  if (!CONNECTION_KINDS.includes(text)) throw new Error(`connection 非法：${text}（plain ∥ tls）`)
  return text
}

/** 三件形校验（TLS 档必备——缺件/空件/超长 ⇒ 抛人话；调用方转 400 零外呼）。出 = `{ ca, cert, key }`。 */
export function parseTlsMaterials(raw) {
  const input = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {}
  const out = {}
  for (const [field, label] of [
    ["ca", "tls.ca（CA 证书 PEM）"],
    ["cert", "tls.cert（客户端证书 PEM）"],
    ["key", "tls.key（客户端私钥 PEM）"],
  ]) {
    const value = typeof input[field] === "string" ? input[field] : ""
    if (value.trim() === "") throw new Error(`${label}必填（TLS 档三件齐——CA ∥ 客户端证书 ∥ 客户端私钥）`)
    if (value.length > TLS_MATERIAL_MAX) throw new Error(`${label} 超长（≤ ${TLS_MATERIAL_MAX} 字符；实长 ${value.length}）`)
    out[field] = value
  }
  return out
}

/** 连接档（scheme 单源派生——地址面唯一真相；非 `https://` 一律明文）。 */
export function connectionKindOf(address) {
  return /^https:\/\//i.test(String(address ?? "")) ? "tls" : "plain"
}

/** 行连接元数据（响应面——**零材料字段**：`state` 只回 `none`/`sealed` + `updatedAt`；未迁库行（列缺）⇒ `none`）。 */
export function tlsMetaOf(row) {
  const sealed = typeof row?.tls_key_cipher === "string" && row.tls_key_cipher !== ""
  return { state: sealed ? "sealed" : "none", updatedAt: row?.tls_updated_at ?? null }
}

/** 行材料齐备判（不变量右半边——`https` ⇔ 三件齐）。 */
export function hasTlsMaterials(row) {
  return (
    typeof row?.tls_ca === "string" && row.tls_ca !== "" &&
    typeof row?.tls_cert === "string" && row.tls_cert !== "" &&
    typeof row?.tls_key_cipher === "string" && row.tls_key_cipher !== ""
  )
}

/** 材料封入列值（`tls_ca`/`tls_cert` 原文档列 ∥ `tls_key_cipher` = 私钥密文 ∥ `tls_updated_at` = 时刻）。出 = 四列值对（调用方整列写入——全列覆写）。 */
export function sealTlsMaterials(materials, { config = {}, now = Date.now } = {}) {
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  return { ca: materials.ca, cert: materials.cert, keyCipher: encryptSecret(materials.key, key), updatedAt: new Date(now()).toISOString() }
}

/** 行材料解出（执行前读面——TLS 档每行一次；缺件/解密失败 ⇒ 抛人话）。出 = `{ ca, cert, key }`（仅入传输选项——零落盘零外泄）。 */
export function tlsMaterialsOf(row, { config = {} } = {}) {
  if (!hasTlsMaterials(row)) {
    throw new Error(`节点「${row?.name ?? row?.id}」连接档 = TLS 但材料不齐——请在「连接方式」弹窗重录三件（CA ∥ 客户端证书 ∥ 客户端私钥）`)
  }
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  try {
    return { ca: row.tls_ca, cert: row.tls_cert, key: decryptSecret(row.tls_key_cipher, key) }
  } catch (e) {
    throw new Error(`连接材料解密失败：${e?.message ?? String(e)}（请在「连接方式」弹窗重录）`)
  }
}

/**
 * `node:https` 传输适配件（fetch 形最小件——插既有 `fetchImpl` 缝；KD-SV-193）：
 * `(url, { method, signal, headers, body }) → { status, text(), arrayBuffer() }`；TLS 三件逐值入请求选项（`ca`/`cert`/`key`）。
 * `requestImpl` = 假件缝（单元测试档注入 `https.request` 替身；缺省 `null` ⇒ `node:https.request`）。
 * 预算归调用方 `signal`（Docker 客户端 `AbortSignal.timeout`——本件不另设超时）；传输错误原样抛（调用方按 `signal.aborted` 分类 timeout/unreachable）。
 */
export function httpsFetchOf(tls, { requestImpl = null } = {}) {
  const request = requestImpl ?? httpsRequest
  return (url, { method = "GET", signal = undefined, headers = undefined, body = undefined } = {}) =>
    new Promise((resolve, reject) => {
      const target = new URL(String(url))
      const payload = body === undefined || body === null ? null : Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8")
      const requestHeaders = { ...(headers ?? {}) }
      if (payload !== null && requestHeaders["content-length"] === undefined && requestHeaders["Content-Length"] === undefined) {
        requestHeaders["content-length"] = String(payload.length)
      }
      const req = request(
        {
          method,
          hostname: target.hostname,
          port: target.port === "" ? 443 : Number(target.port),
          path: `${target.pathname}${target.search}`,
          ca: tls.ca,
          cert: tls.cert,
          key: tls.key,
          headers: requestHeaders,
          ...(signal === undefined ? {} : { signal }),
        },
        (res) => {
          const chunks = []
          res.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
          res.on("end", () => {
            const buffer = Buffer.concat(chunks)
            resolve({
              status: res.statusCode,
              text: async () => buffer.toString("utf8"),
              arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
            })
          })
          res.on("error", reject)
        },
      )
      req.on("error", reject)
      if (payload !== null) req.write(payload)
      req.end()
    })
}
