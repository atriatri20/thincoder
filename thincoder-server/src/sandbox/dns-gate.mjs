/**
 * dns-gate.mjs — 出站闸②：域名闸与待批（sandbox/EXECUTION.md §6 ∥ KD-SV-165——**server 进程内 UDP 53 DNS 应答器**）。
 *
 * 面：UDP 53（`node:dgram`——零新进程 ∥ 零节点侧常驻）；盒内解析器 = 建盒 `Dns` 注入（§3）。
 * 归属判：收包源 IP ∈ 某工作区网络网段（建网络后读 `IPAM.Subnet` 记录于进程内 map；重启后按需重读）；非盒源 ⇒ **忽略（零答）**。
 * 请求处理（全链 ≤ `pendingTimeoutSeconds` 持答窗）：
 *   ① 解析上游（3s 预算——答与判同源，零解析 ⇒ REFUSED）；
 *   ② `evaluateEgress`（`host` 在场；`builtinAllow` = 内置允许行）——
 *      放行（`domain_allow`；或纯 CIDR 白名单回落：`domain_no_match` 时逐 IP 以 `host:null` 重判取允许子集）⇒
 *      **确保该 IP 集在节点闸内（不在 ⇒ 同步补下发；补发失败 ⇒ REFUSED）** ⇒ 应答（TTL 60s）；
 *      显式拒（`hard_deny` ∥ `domain_deny` ∥ `unresolved`；`ip_deny` ⇒ 逐 IP 子集为空时同拒）⇒ REFUSED（**零挂起零待批**）；
 *   ③ 未命中（逐 IP 亦无允许）⇒ 待批径：`markPending`（同 host 去重 + `hits++`）⇒ **持答** ⇒ 窗内裁定三态或超时（§6）。
 * 裁定抵达：进程内等待表（`pendingId → 持答`）；管理员裁定 handler 落库后调 `notifyDecision(pendingId)` 回填；闸重启 ⇒ 持答丢（客户端重问即重判）。
 * 边界：UDP 只（TCP 53 不做——如实登）；DNS 闸**非强制点**（强制点 = nft——直连 IP 恒过 nft）。
 */
import { createSocket } from "node:dgram"
import { cidrMatch, evaluateEgress, listRules, markPending, sweepPendingTimeouts } from "./rules.mjs"
import { addTempIps, allowCovers, builtinAllowForEvaluation, ensureEgressApplied, markEgressFailed, resolveHostIps, tempIpsAt } from "./egress.mjs"
import { getSettings } from "./registry.mjs"
import { clientForRunner } from "./docker.mjs"

/** 监听端口（UDP 53——§1「server 侧新监听 = DNS 闸 UDP 53」）。 */
export const DNS_PORT = 53
/** 应答 TTL（秒——§6）。 */
export const ANSWER_TTL_S = 60
/** 网段表惰性重读冷却（毫秒——重启后按需重读，不逐包打节点）。 */
export const SUBNET_REFRESH_COOLDOWN_MS = 10000
/** DNS 记录型（只答 A；余型 ⇒ 空答——UDP 只/无截断回退）。 */
export const DNS_TYPE_A = 1
/** rcode（NOERROR ∥ REFUSED）。 */
export const RCODE_NOERROR = 0
export const RCODE_REFUSED = 5

// ── 报文编解码（RFC1035 最小面——单问题；无压缩指针入）────────────────────────

/** 查询解析（出 = `{ id, name, type, cls }`；不成形/多问题/压缩指针 ⇒ null）。 */
export function parseDnsQuery(buffer) {
  const raw = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer ?? [])
  if (raw.length < 12) return null
  const id = raw.readUInt16BE(0)
  const qdcount = raw.readUInt16BE(4)
  if (qdcount !== 1) return null // 单问题面（多问题/零问题 ⇒ null——与头注同口径）
  const labels = []
  let offset = 12
  while (offset < raw.length) {
    const length = raw[offset]
    if (length === 0) {
      offset += 1
      break
    }
    if ((length & 0xc0) !== 0) return null // 压缩指针（查询面不做——如实拒解析）
    if (offset + 1 + length > raw.length) return null
    labels.push(raw.subarray(offset + 1, offset + 1 + length).toString("latin1"))
    offset += 1 + length
  }
  if (labels.length === 0 || offset + 4 > raw.length) return null
  return { id, name: labels.join("."), type: raw.readUInt16BE(offset), cls: raw.readUInt16BE(offset + 2) }
}

/** IPv4 文本 ⇒ 4 字节（不成形 ⇒ null）。 */
function ipv4Bytes(text) {
  const parts = String(text ?? "").split(".")
  if (parts.length !== 4) return null
  const out = Buffer.alloc(4)
  for (const [index, part] of parts.entries()) {
    const value = Number(part)
    if (!Number.isInteger(value) || value < 0 || value > 255) return null
    out[index] = value
  }
  return out
}

/**
 * 应答装配（`rcode = 0` ⇒ 附 A 记录；`rcode = 5` ⇒ 零记录）。
 * 出 = Buffer（原查询 id 回填；RD 位沿用查询；RA = 1）。
 */
export function buildDnsResponse({ id, query = null, ips = [], ttl = ANSWER_TTL_S, rcode = RCODE_NOERROR }) {
  const question = query === null ? Buffer.alloc(0) : questionSectionOf(query)
  const answers = (rcode === RCODE_NOERROR ? ips : []).map((ip) => ipv4Bytes(ip)).filter((bytes) => bytes !== null)
  const header = Buffer.alloc(12)
  header.writeUInt16BE(id & 0xffff, 0)
  const rd = query?.flags !== undefined && (query.flags & 0x0100) !== 0 ? 0x0100 : 0x0100 // RD 恒回（查询一般带 RD——零改语义：回显 = 1）
  header.writeUInt16BE(0x8000 | rd | 0x0080 | (rcode & 0x0f), 2)
  header.writeUInt16BE(question === null || question.length === 0 ? 0 : 1, 4)
  header.writeUInt16BE(answers.length, 6)
  header.writeUInt16BE(0, 8)
  header.writeUInt16BE(0, 10)
  const parts = [header, question]
  for (const bytes of answers) {
    const answer = Buffer.alloc(16)
    answer.writeUInt16BE(0xc00c, 0) // 名称指针 ⇒ 问题区
    answer.writeUInt16BE(DNS_TYPE_A, 2)
    answer.writeUInt16BE(1, 4) // IN
    answer.writeUInt32BE(ttl >>> 0, 6)
    answer.writeUInt16BE(4, 10)
    bytes.copy(answer, 12)
    parts.push(answer)
  }
  return Buffer.concat(parts)
}

/** 问题区回显（QNAME 长度前缀 + qtype + qclass）。 */
export function questionSectionOf(query) {
  const labels = String(query.name ?? "").split(".").filter((item) => item !== "")
  const chunks = []
  for (const label of labels) {
    if (label.length === 0 || label.length > 63) continue
    const head = Buffer.from([label.length])
    chunks.push(head, Buffer.from(label, "latin1"))
  }
  chunks.push(Buffer.from([0]))
  const tail = Buffer.alloc(4)
  tail.writeUInt16BE(query.type ?? DNS_TYPE_A, 0)
  tail.writeUInt16BE(query.cls ?? 1, 2)
  return Buffer.concat([...chunks, tail])
}

// ── 闸本体（工厂——进程内状态：等待表 ∥ 网段表）──────────────────────────────

/**
 * DNS 闸（§6）。注入面（单元测试档假件）：`resolveImpl`（上游解析）∥ `execOf`（节点主机命令——补下发）∥
 * `fetchImpl`（节点网络 inspect——网段表重读）∥ `now`（时钟）。
 */
export function createDnsGate({ db, config = {}, log = null, now = Date.now, fetchImpl = fetch, requestImpl = null, resolveImpl = null, execOf = null, port = DNS_PORT, host = "0.0.0.0" } = {}) {
  if (!db) throw new Error("createDnsGate：缺 db")
  /** 等待表（`pendingId → { respond, host, ips, type, timer, workspaceId, runnerId }`）。 */
  const waiters = new Map()
  /** 网段表（`workspaceId → subnet`——建网络后登记；重启后按需重读）。 */
  const subnets = new Map()
  let socket = null
  let lastRefreshAt = 0

  /** 工作区网段登记（建网络后调用——`IPAM.Subnet`）。 */
  function registerNetwork(workspaceId, subnet) {
    if (typeof subnet === "string" && subnet.includes("/")) subnets.set(Number(workspaceId), subnet)
  }

  /** 源 IP 归属（出 = `{ workspaceId, subnet }` ∥ null——非盒源忽略）。 */
  function workspaceForIp(ip) {
    for (const [workspaceId, subnet] of subnets.entries()) {
      if (cidrMatch(subnet, ip)) return { workspaceId, subnet }
    }
    return null
  }

  /** 网段表惰性重读（重启后/表空时——逐工作区 inspect 其网络；冷却 10s）。 */
  async function refreshNetworks({ force = false } = {}) {
    if (!force && now() - lastRefreshAt < SUBNET_REFRESH_COOLDOWN_MS) return false
    lastRefreshAt = now()
    let changed = false
    for (const workspace of db.prepare("SELECT id, runner_id FROM sandbox_workspaces WHERE runner_id IS NOT NULL ORDER BY id").all()) {
      const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
      if (!runner) continue
      try {
        const client = clientForRunner(runner, { fetchImpl, config, requestImpl })
        if (typeof client.inspectNetwork !== "function") continue
        const res = await client.inspectNetwork(`tc-ws-${workspace.id}`) // 客户端成员 = 平铺 `inspectNetwork`（§9 网络面）
        const subnet = res?.json?.IPAM?.Config?.[0]?.Subnet ?? null
        if (subnet) {
          registerNetwork(workspace.id, subnet)
          changed = true
        }
      } catch (e) {
        log?.warn?.("dns_gate_subnet_refresh_failed", { workspaceId: workspace.id, message: e?.message ?? String(e) })
      }
    }
    return changed
  }

  /** 允许集就位确保（§6：不在 ⇒ 同步补下发；补发失败/仍缺 ⇒ REFUSED）。 */
  async function ensureIpsApplied({ workspaceId, ips }) {
    const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(Number(workspaceId))
    if (!workspace || workspace.runner_id === null) return { ok: false, reason: "工作区未绑定节点（补下发无落点）" }
    const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
    if (!runner) return { ok: false, reason: "绑定节点不在册" }
    const exec = execOf === null ? null : execOf(runner)
    if (exec === null) return { ok: false, reason: "节点主机命令面未装配（execOf 缺）" }
    try {
      const state = await ensureEgressApplied({ db, runner, exec, config, now, log, reason: "DNS 放行前置", needIps: ips, resolveImpl })
      const missing = ips.filter((ip) => !allowCovers(state.allowIps, ip))
      if (missing.length > 0) return { ok: false, reason: `补发后闸内仍缺：${missing.join(" ∥ ")}` }
      return { ok: true }
    } catch (e) {
      markEgressFailed(runner.id, { error: e, now: now() }) // 未就位标记（展示面——逐问不重审计，避审计刷屏）
      return { ok: false, reason: e?.message ?? String(e), runnerId: runner.id }
    }
  }

  /** 应答帧送出（等待表持答与即时应答同径）。 */
  function respondWith(respond, { id, query, ips, rcode }) {
    try {
      respond(buildDnsResponse({ id, query, ips, rcode }))
    } catch (e) {
      log?.warn?.("dns_gate_respond_failed", { message: e?.message ?? String(e) })
    }
  }

  /** 逐 IP 过闸子集（域上下文 ⇒ `host` 在场；回落 ⇒ `host:null`）。 */
  function allowedSubset({ host, ips, useHost }) {
    const rules = listRules(db)
    const builtin = builtinAllowForEvaluation(config)
    return ips.filter((ip) => evaluateEgress(rules, { host: useHost ? host : null, ips: [ip], builtinAllow: builtin }).action === "allow")
  }

  /**
   * 查询处理（socket 面与测试面同径）。`respond` = 应答回调（socket.send 包装）；出 = 处置读数（`answered ∥ refused ∥ ignored ∥ held`）。
   * 非盒源 ⇒ `ignored`（零答）；L1/显式 deny/解析空 ⇒ `refused`（零挂起）；未命中 ⇒ `held`（等待表 + 超时）。
   */
  async function handleQuery({ id, query, host, sourceIp, respond, type = DNS_TYPE_A }) {
    if (workspaceForIp(sourceIp) === null) {
      await refreshNetworks()
      if (workspaceForIp(sourceIp) === null) return "ignored"
    }
    const { workspaceId } = workspaceForIp(sourceIp)
    const ips = Array.isArray(host?.ips) ? host.ips : await resolveHostIpsVia(host?.name ?? "")
    const name = String(host?.name ?? "")
    if (Number(type) !== DNS_TYPE_A) {
      respondWith(respond, { id, query, rcode: RCODE_NOERROR }) // 只答 A（AAAA/余型 ⇒ 空答——不伪造他型记录）
      return "answered"
    }
    if (ips.length === 0) {
      respondWith(respond, { id, query, rcode: RCODE_REFUSED }) // 零解析 ⇒ REFUSED（fail-closed）
      return "refused"
    }
    const rules = listRules(db)
    const builtin = builtinAllowForEvaluation(config)
    const verdict = evaluateEgress(rules, { host: name, ips, builtinAllow: builtin })
    if (verdict.action === "deny" && verdict.reason !== "domain_no_match" && verdict.reason !== "ip_deny") {
      respondWith(respond, { id, query, rcode: RCODE_REFUSED }) // hard_deny ∥ domain_deny ∥ unresolved ⇒ 零挂起零待批
      return "refused"
    }
    let allowed = []
    if (verdict.action === "allow" && verdict.reason === "builtin_allow") allowed = [...ips]
    else if (verdict.action === "allow") allowed = allowedSubset({ host: name, ips, useHost: true }) // 逐 IP 过闸子集
    else if (verdict.reason === "ip_deny") allowed = allowedSubset({ host: name, ips, useHost: true }) // 部分拒 ⇒ 子集
    else allowed = allowedSubset({ host: name, ips, useHost: false }) // domain_no_match ⇒ 纯 CIDR 白名单回落
    if (allowed.length > 0) {
      const applied = await ensureIpsApplied({ workspaceId, ips: allowed })
      if (!applied.ok) {
        log?.warn?.("dns_gate_apply_failed", { host: name, workspaceId, reason: applied.reason, runnerId: applied.runnerId ?? null })
        respondWith(respond, { id, query, rcode: RCODE_REFUSED })
        return "refused"
      }
      respondWith(respond, { id, query, ips: allowed })
      return "answered"
    }
    // 显式拒类（L1/域拒/解析空之外：`ip_deny` 且过闸子集空）⇒ REFUSED（零挂起零待批——不得以待批代替拒）
    if (verdict.action === "deny" && verdict.reason !== "domain_no_match") {
      respondWith(respond, { id, query, rcode: RCODE_REFUSED })
      return "refused"
    }
    // 未命中 ⇒ 待批径（持答 ≤ 窗；裁定回填或超时）
    const pending = markPending(db, { runnerId: workspaceIdToRunnerId(workspaceId), workspaceId, host: name, now: now() })
    const timeoutMs = Number(pending.timeoutSeconds ?? getSettings(db).pendingTimeoutSeconds ?? 60) * 1000
    const timer = setTimeout(() => {
      const current = waiters.get(pending.id)
      if (current?.timer === timer) waiters.delete(pending.id) // 仅自条目不撤后到者（同 host 重问）
      sweepPendingTimeouts(db, { now: now() })
      respondWith(respond, { id, query, rcode: RCODE_REFUSED })
    }, timeoutMs)
    timer.unref?.()
    const stale = waiters.get(pending.id)
    if (stale) {
      clearTimeout(stale.timer) // 同 host 重问 ⇒ 旧持答退位（一 pending 一条目，避免旧 timer 反删新条目）
      respondWith(stale.respond, { id: stale.id, query: stale.query, rcode: RCODE_REFUSED })
    }
    waiters.set(pending.id, { respond, id, query, host: name, ips, workspaceId, timer })
    log?.info?.("dns_gate_pending", { pendingId: pending.id, host: name, workspaceId, hits: pending.hits })
    return "held"
  }

  function workspaceIdToRunnerId(workspaceId) {
    const workspace = db.prepare("SELECT runner_id FROM sandbox_workspaces WHERE id = ?").get(Number(workspaceId))
    return workspace?.runner_id ?? 0
  }

  /** 上游解析（注入面优先——同 `egress.resolveHostIps` 口径；3s 预算）。 */
  async function resolveHostIpsVia(name) {
    if (typeof resolveImpl === "function") return (await resolveImpl(name)) ?? []
    return resolveHostIps(name)
  }

  /** 裁定回填（§6：管理员裁定 handler 落库后调用）——三态逐径（once = 临时集 ∥ remember = 规则行在场 ∥ deny/超时 ⇒ REFUSED）。 */
  async function notifyDecision(pendingId) {
    const waiter = waiters.get(Number(pendingId)) ?? null
    if (waiter !== null) {
      waiters.delete(Number(pendingId))
      clearTimeout(waiter.timer)
    }
    const row = db.prepare("SELECT * FROM sandbox_pending WHERE id = ?").get(Number(pendingId))
    const status = row?.status ?? "timeout"
    if (status === "approved_once" && waiter !== null) addTempIps(waiter.ips, { host: waiter.host, now: now() })
    if (waiter === null) return false // 无持答者（闸重启/已被超时收口）：裁定行在库，客户端重问 ⇒ `markPending` 另开新行重判（§6 边界「零人工」）
    if (status === "approved_once" || status === "approved_remember") {
      const applied = await ensureIpsApplied({ workspaceId: waiter.workspaceId, ips: waiter.ips })
      if (!applied.ok) {
        log?.warn?.("dns_gate_decision_apply_failed", { pendingId, reason: applied.reason })
        respondWith(waiter.respond, { id: waiter.id, query: waiter.query, rcode: RCODE_REFUSED })
        return true
      }
      const rules = listRules(db)
      const builtin = builtinAllowForEvaluation(config)
      const temp = new Set(tempIpsAt(now()).map((item) => item.ip))
      const answered = waiter.ips.filter(
        (ip) => temp.has(ip) || evaluateEgress(rules, { host: waiter.host, ips: [ip], builtinAllow: builtin }).action !== "deny",
      )
      respondWith(waiter.respond, { id: waiter.id, query: waiter.query, ips: answered.length > 0 ? answered : waiter.ips })
      return true
    }
    respondWith(waiter.respond, { id: waiter.id, query: waiter.query, rcode: RCODE_REFUSED })
    return true
  }

  /** UDP 面启动（`node:dgram`——绑定失败 ⇒ 抛；停机 = `stop`）。 */
  function start() {
    if (socket) return socket
    socket = createSocket("udp4")
    socket.on("message", (message, rinfo) => {
      const parsed = parseDnsQuery(message)
      if (!parsed) return
      const respond = (frame) => socket.send(frame, rinfo.port, rinfo.address)
      handleQuery({ id: parsed.id, query: parsed, host: { name: parsed.name }, sourceIp: rinfo.address, respond, type: parsed.type }).catch((e) => {
        log?.warn?.("dns_gate_query_failed", { message: e?.message ?? String(e) })
      })
    })
    socket.on("error", (e) => log?.warn?.("dns_gate_socket_error", { message: e?.message ?? String(e) }))
    socket.bind(port, host)
    return socket
  }

  function stop() {
    for (const [id, waiter] of waiters.entries()) {
      clearTimeout(waiter.timer)
      waiters.delete(id)
    }
    if (socket) {
      const closing = socket
      socket = null
      try {
        closing.close()
      } catch {
        /* 已关 */
      }
    }
  }

  return {
    start,
    stop,
    handleQuery,
    notifyDecision,
    registerNetwork,
    workspaceForIp,
    refreshNetworks,
    waitersOf: () => [...waiters.keys()],
    subnetsOf: () => new Map(subnets),
    port,
  }
}
