/**
 * egress.mjs — 主机侧件②：出站闸本体（sandbox/EXECUTION.md §5 ∥ KD-SV-76/164/165——求值 → 规则文本 → 下发）。
 *
 * 求值单源 = `rules.mjs`（`listRules`/`sortRules`/`evaluateEgress`/`HARD_DENY_CIDRS`——本档零第二求值；主机侧只收具体 CIDR/IP 集）。
 * 规则文本（nft——全量重算幂等）：表 `inet thincoder_egress`；**基线链两条 = `hook forward` + `hook input`**（同锚 `iifname "tcws*"`、
 * 同盒链同位次——`forward` = 盒 → 外发向 ∥ `input` = 盒 → 宿主自身方向；两条俱在方为「全协议/全端口」）；盒链位次 = 强制面总序：
 *   ① L1 不变量 ⇒ drop ∥ ② 内置允许（server 地址:HTTP 口 + UDP 53）⇒ accept ∥ ③ 显式 deny 行 ⇒ drop ∥
 *   ④ 允许集（显式 allow ∥ 种子 allow 解析集 ∥ 临时集——逐 IP 过闸子集）⇒ accept ∥ ⑤ 种子 deny 行 ⇒ drop ∥ ⑥ 默认 ⇒ drop。
 * 域规则 ⇒ 服务端解析（3s 预算）⇒ 逐 IP 过 `evaluateEgress`（`host` 在场）⇒ 允许的 IP 入 allow 集；解析空 ⇒ 零 allow 条目（fail-closed）。
 * 下发 = SSH：`command -v nft` 探（无 ⇒ iptables 备径：`TC-EGRESS` 链重建，**两向同挂**——`FORWARD` + `INPUT` 各一跳入
 * `TC-EGRESS`（同锚 `-i tcws+`、同序））⇒ 删旧表（不存在 ⇒ 跳过）⇒ `nft -f -` 落全量定义（单事务原子）。
 * 就位复核 = 进程内 per-node 记录 `{ rulesRev, ok, at }` 对当前修订号；缺 ∥ 失败 ∥ 落后 ⇒ 先补下发；补发失败 ⇒ 调用方停（fail-closed）。
 * 漂移披露：外部手改节点 nft ⇒ 下次下发（全量重算）收正；两次下发之间 = 漂移窗（不做常驻守护）。
 * 临时集 = 待批 `once` 放行的 host 解析集（TTL = `RECENT_RESOLUTION_MS` ⇒ 到点消解并重算——§6）。
 */
import { Resolver } from "node:dns/promises"
import { recordAudit } from "../accounts/audit.mjs"
import { HARD_DENY_CIDRS, RECENT_RESOLUTION_MS, cidrMatch, evaluateEgress, getRulesRev, listRules, sortRules } from "./rules.mjs"
import { sandboxPublicBase } from "./registry.mjs"

/** nft 表/链名与盒锚（§5——锚 = 工作区网桥名 `tcws<id>`）。 */
export const NFT_TABLE = "thincoder_egress"
export const NFT_CHAIN = "tcws_egress"
export const EGRESS_ANCHOR = "tcws*"
export const IPT_CHAIN = "TC-EGRESS"
export const IPT_ANCHOR = "tcws+"

/** 域规则解析预算（§5——3s）。 */
export const RESOLVE_TIMEOUT_MS = 3000

/** 下发侧常量（探针/删除/落表/SSH 超时秒）。 */
export const EGRESS_SSH_TIMEOUT_S = 60

/** 出站闸失败（`step` = 步名；`message` = 人话——调用侧转 502/停）。 */
export class EgressError extends Error {
  constructor(step, message) {
    super(message)
    this.name = "EgressError"
    this.step = step
  }
}

// ── 内置允许（生命线——盒 → server 网关地址:HTTP 口 + UDP 53；§5 位次②）────────────────

/** server 地址（IPv4 字面量——`config.host`；非 IPv4 ⇒ null：零条目 + 如实标，不猜）。 */
export function serverIpOf(config = {}) {
  const host = typeof config.host === "string" ? config.host.trim() : ""
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? host : null
}

/** server HTTP 端口（`sandboxPublicBase` 同源——config.host/port 组成）。 */
export function serverPortOf(config = {}) {
  const base = sandboxPublicBase(config)
  try {
    return Number(new URL(base).port) || 80
  } catch {
    return 80
  }
}

/** 内置允许条目（文本面——逐端口/协议收窄；server 非 IPv4 ⇒ 零条目）。 */
export function builtinAllowEntries(config = {}) {
  const ip = serverIpOf(config)
  if (ip === null) return []
  return [
    { target: ip, port: serverPortOf(config), protocol: "tcp" },
    { target: ip, port: 53, protocol: "udp" },
  ]
}

/** 内置允许条目（求值面——`evaluateEgress` 的 `builtinAllow` 形：全端口/全协议的生命线判）。 */
export function builtinAllowForEvaluation(config = {}) {
  const ip = serverIpOf(config)
  return ip === null ? [] : [{ kind: "cidr", target: ip, port: null, protocol: null }]
}

// ── 解析（域规则 ⇒ IP 集；3s 预算）────────────────────────────────────────────

/** 上游解析（缺省 = `node:dns`；注入 = 假件/测试）。出 = IPv4 字面量数组（空 = 未解析）。 */
export async function resolveHostIps(host, { resolveImpl = null, timeoutMs = RESOLVE_TIMEOUT_MS } = {}) {
  if (typeof resolveImpl === "function") return (await resolveImpl(host)) ?? []
  const resolver = new Resolver()
  let timer = null
  try {
    const ips = await Promise.race([
      resolver.resolve4(host),
      new Promise((resolve) => {
        timer = setTimeout(() => {
          try { resolver.cancel() } catch { /* 已结 */ }
          resolve([])
        }, timeoutMs)
      }),
    ])
    return Array.isArray(ips) ? ips : []
  } catch {
    return [] // 解析败/空 ⇒ 零 IP（fail-closed——由调用侧判）
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** L1 恒拒判（判据单源 = `rules.mjs` `HARD_DENY_CIDRS` ∥ `cidrMatch`——本档零第二匹配实现）。 */
export function isHardDenied(ip) {
  return HARD_DENY_CIDRS.some((cidr) => cidrMatch(cidr, ip))
}

/** 允许集覆盖判（条目 = 具体 IP ∥ CIDR——CIDR 条目按其网段判：`198.51.100.0/24` 覆盖 `198.51.100.9`）。 */
export function allowCovers(allowIps, ip) {
  return (Array.isArray(allowIps) ? allowIps : []).some((entry) => entry === ip || (String(entry).includes("/") && cidrMatch(String(entry), ip)))
}

// ── 规则文本（全量重算——纯函数面：可测）──────────────────────────────────────

/** 单条规则 ⇒ 主机侧条目（cidr = 直取；domain = 解析后逐 IP 过滤——`host` 在场过闸）。 */
async function entriesOf(rule, { rules, resolveImpl, builtinAllow, timeoutMs }) {
  const base = { port: rule.port ?? null, protocol: rule.protocol ?? null }
  if (rule.kind === "cidr") return [{ ...base, target: rule.target }]
  const ips = await resolveHostIps(rule.target, { resolveImpl, timeoutMs })
  if (ips.length === 0) return [] // 解析空 ⇒ 零条目（fail-closed）
  const kept = rule.action === "allow"
    ? ips.filter((ip) => evaluateEgress(rules, { host: rule.target, ips: [ip], builtinAllow }).action === "allow")
    : ips
  return kept.map((ip) => ({ ...base, target: ip }))
}

/** 条目 ⇒ nft 行尾（`ip daddr <目标>[ <协议> dport <口>]`）。 */
export function nftTargetOf(entry) {
  const port = entry.port === null || entry.port === undefined ? "" : ` dport ${entry.port}`
  if (entry.port === null || entry.port === undefined) return `ip daddr ${entry.target}`
  if (entry.protocol === "tcp" || entry.protocol === "udp") return `ip daddr ${entry.target} ${entry.protocol}${port}`
  return `ip daddr ${entry.target} meta l4proto { tcp, udp }${port}`
}

/** 条目 ⇒ iptables 行尾（`-d <目标> [-p <协议> --dport <口>]`）。 */
export function iptablesTargetOf(entry) {
  const proto = entry.protocol === "tcp" || entry.protocol === "udp" ? ` -p ${entry.protocol}` : entry.port === null || entry.port === undefined ? "" : " -p tcp"
  const port = entry.port === null || entry.port === undefined ? "" : ` --dport ${entry.port}`
  return `-d ${entry.target}${proto}${port}`
}

/** 去重（同文本首见保留——重复下发同结果）。 */
function dedupe(lines) {
  const seen = new Set()
  return lines.filter((line) => (seen.has(line) ? false : (seen.add(line), true)))
}

/**
 * 规则文本（nft——全量重算幂等；纯函数面：入 = 规则表 + 解析面 + 临时集）。
 * 出 = `{ text, allowIps, entries }`（`allowIps` = 允许集 IP 全集——就位复核/补发判据用）。
 */
export async function buildNftRuleText({ rules, config = {}, tempIps = [], resolveImpl = null, timeoutMs = RESOLVE_TIMEOUT_MS }) {
  const sorted = sortRules(rules)
  const builtin = builtinAllowForEvaluation(config)
  const explicitDeny = sorted.filter((rule) => rule.action === "deny" && rule.source !== "default")
  const explicitAllow = sorted.filter((rule) => rule.action === "allow" && rule.source !== "default")
  const seedDeny = sorted.filter((rule) => rule.action === "deny" && rule.source === "default")
  const seedAllow = sorted.filter((rule) => rule.action === "allow" && rule.source === "default")
  const expand = async (list) => {
    const out = []
    for (const rule of list) out.push(...(await entriesOf(rule, { rules: sorted, resolveImpl, builtinAllow: builtin, timeoutMs })))
    return out
  }
  const [denyEntries, allowEntries, seedDenyEntries, seedAllowEntries] = [await expand(explicitDeny), await expand(explicitAllow), await expand(seedDeny), await expand(seedAllow)]
  const tempEntries = tempIps
    .filter((item) => item !== null && typeof item === "object" && !isHardDenied(item.ip))
    .map((item) => ({ target: item.ip, port: item.port ?? null, protocol: item.protocol ?? null }))
  const template = (entries, target) => entries.map((entry) => `${nftTargetOf(entry)} ${target}`)
  const l1Line = `ip daddr { ${HARD_DENY_CIDRS.join(", ")} } drop`
  const builtinLines = builtinAllowEntries(config).map((entry) => `${nftTargetOf(entry)} accept`)
  const lines = [
    ...dedupe([
      l1Line,
      ...builtinLines,
      ...template(denyEntries, "drop"),
      ...template([...allowEntries, ...seedAllowEntries, ...tempEntries], "accept"),
      ...template(seedDenyEntries, "drop"),
      "drop",
    ]),
  ]
  const allowIps = [...allowEntries, ...seedAllowEntries, ...tempEntries].map((entry) => entry.target)
  const text = [
    `table inet ${NFT_TABLE} {`,
    `\tchain hook_forward {`,
    `\t\ttype filter hook forward priority filter; policy accept;`,
    `\t\tiifname "${EGRESS_ANCHOR}" jump ${NFT_CHAIN}`,
    `\t}`,
    `\tchain hook_input {`,
    `\t\ttype filter hook input priority filter; policy accept;`,
    `\t\tiifname "${EGRESS_ANCHOR}" jump ${NFT_CHAIN}`,
    `\t}`,
    `\tchain ${NFT_CHAIN} {`,
    ...lines.map((line) => `\t\t${line}`),
    `\t}`,
    `}`,
    "",
  ].join("\n")
  return { text, allowIps, entries: { l1Line, builtinLines, denyEntries, allowEntries, seedDenyEntries, seedAllowEntries, tempEntries } }
}

/** 条目 ⇒ iptables 追加命令（端口在场而无协议 ⇒ tcp/udp 两行——与 nft `meta l4proto` 同义）。 */
function iptablesAppend(entry, target) {
  const line = (protocol) => `iptables -w -A ${IPT_CHAIN} ${iptablesTargetOf({ ...entry, protocol })} -j ${target}`
  if (entry.port !== null && entry.port !== undefined && entry.protocol !== "tcp" && entry.protocol !== "udp") return [line("tcp"), line("udp")]
  return [line(entry.protocol)]
}

/** iptables 备径命令（纯函数面——链重建 + 两向同挂；同锚 `-i tcws+`、同序 = 盒链位次照上）。出 = 命令数组（逐条 SSH）。 */
export function iptablesCommandsOf(entries, config = {}) {
  const rulesLines = dedupe([
    `iptables -w -A ${IPT_CHAIN} -d 127.0.0.0/8 -j DROP`,
    `iptables -w -A ${IPT_CHAIN} -d 169.254.0.0/16 -j DROP`,
    ...builtinAllowEntries(config).flatMap((entry) => iptablesAppend(entry, "ACCEPT")),
    ...entries.denyEntries.flatMap((entry) => iptablesAppend(entry, "DROP")),
    ...entries.allowEntries.flatMap((entry) => iptablesAppend(entry, "ACCEPT")),
    ...entries.seedAllowEntries.flatMap((entry) => iptablesAppend(entry, "ACCEPT")),
    ...entries.tempEntries.flatMap((entry) => iptablesAppend(entry, "ACCEPT")),
    ...entries.seedDenyEntries.flatMap((entry) => iptablesAppend(entry, "DROP")),
    `iptables -w -A ${IPT_CHAIN} -j DROP`,
  ])
  const hook = (chain) => `iptables -w -C ${chain} -i ${IPT_ANCHOR} -j ${IPT_CHAIN} 2>/dev/null || iptables -w -I ${chain} -i ${IPT_ANCHOR} -j ${IPT_CHAIN}`
  return [
    `iptables -w -N ${IPT_CHAIN} 2>/dev/null; iptables -w -F ${IPT_CHAIN}`,
    rulesLines.length === 0 ? "true" : rulesLines.join(" && "), // 失败即断：中途失败 ⇒ 本命令非零 ⇒ 调用侧抛（两条 hook 在后续命令——未挂 ⇒ 链未引用，无流量放行）
    hook("FORWARD"),
    hook("INPUT"),
  ]
}

/** iptables 备径命令（求值 + 文本同源——`buildNftRuleText` 的条目面复用）。 */
export async function buildIptablesCommands({ rules, config = {}, tempIps = [], resolveImpl = null, timeoutMs = RESOLVE_TIMEOUT_MS }) {
  const { entries } = await buildNftRuleText({ rules, config, tempIps, resolveImpl, timeoutMs })
  return iptablesCommandsOf(entries, config)
}

// ── 下发（SSH 逐条——单事务）─────────────────────────────────────────────────

/** 非零退出 ⇒ 抛（`allowNonZero` = 删除旧表类步——不存在即跳过）。 */
async function ssh(exec, label, command, { stdin = null, allowNonZero = false } = {}) {
  let result
  try {
    result = await exec(command, { label, stdin, timeoutS: EGRESS_SSH_TIMEOUT_S })
  } catch (e) {
    throw new EgressError(label, `出站闸下发失败（${label}）：${e?.message ?? e}`)
  }
  if (result.exitCode !== 0 && !allowNonZero) {
    const tail = `${result.stderr ?? ""}${result.stdout ?? ""}`.trim().slice(-200)
    throw new EgressError(label, `出站闸下发失败（${label}，exit=${result.exitCode}）：${tail || "(无输出)"}`)
  }
  return result
}

/** 下发一份全量定义到节点（nft 优先 ∥ iptables 备径；返回实际径）。 */
export async function pushEgressRuleset(exec, { text, iptablesCommands }) {
  // 探针 = `sh -c` 包裹（sudo 前缀只吃二进制——裸内建 `command` 会被当可执行文件跑）；非零容忍（nft 缺席 ⇒ 走 iptables 备径，2026-10-14 真机实证）
  const probe = await ssh(exec, "nft 探针", `sh -c 'command -v nft'`, { allowNonZero: true })
  const useNft = String(probe.stdout ?? "").trim() !== ""
  if (useNft) {
    await ssh(exec, "删旧表", `nft delete table inet ${NFT_TABLE}`, { allowNonZero: true })
    await ssh(exec, "落全量定义", `nft -f -`, { stdin: text })
    return "nft"
  }
  for (const [index, command] of iptablesCommands.entries()) {
    await ssh(exec, `iptables 备径（${index + 1}/${iptablesCommands.length}）`, command)
  }
  return "iptables"
}

// ── 就位状态（进程内 per-node——重启重建）─────────────────────────────────────

/** per-node 记录：`runnerId → { rulesRev, ok, at, mechanism, allowIps }`（软状态——重启即空，缺 ⇒ 补下发）。 */
const appliedState = new Map()

export function egressStateOf(runnerId) {
  return appliedState.get(Number(runnerId)) ?? null
}

/** 状态清空（测试隔离/进程重建口径）。 */
export function resetEgressRuntime() {
  appliedState.clear()
  tempSet.length = 0
}

/**
 * 就位确保（§5 就位复核——建盒/启动前置）：当前修订号一致 ∧ 上次成功 ∧ 允许集覆盖 `needIps` ⇒ 通过（零外呼）；
 * 否则全量重算 + 下发；失败 ⇒ 抛（fail-closed——调用侧停）。
 */
export async function ensureEgressApplied({ db, runner, exec, config = {}, now = Date.now, log = null, reason = "就位复核", needIps = [], resolveImpl = null }) {
  const previous = appliedState.get(Number(runner.id)) ?? null
  const rev = getRulesRev()
  const covered = needIps.every((ip) => allowCovers(previous?.allowIps, ip))
  const tempKey = tempFingerprintOf(now())
  const tempStale = previous?.ok === true && typeof previous.tempKey === "string" && previous.tempKey !== tempKey // 临时集变更（新增/到点）⇒ 旧就位已过期
  if (previous && previous.ok && previous.rulesRev === rev && covered && !tempStale) return previous
  const rules = listRules(db)
  const tempIps = tempIpsAt(now())
  const { text, allowIps, entries } = await buildNftRuleText({ rules, config, tempIps, resolveImpl })
  const iptablesCommands = iptablesCommandsOf(entries, config)
  const mechanism = await pushEgressRuleset(exec, { text, iptablesCommands })
  const state = { rulesRev: rev, ok: true, at: now(), mechanism, allowIps, tempKey }
  appliedState.set(Number(runner.id), state)
  log?.info?.("egress_applied", { runnerId: runner.id, reason, mechanism, rulesRev: rev })
  return state
}

/** 下发状态标记为「未就位」（失败后——展示面用）。`now` 收时钟函数或时间值（调用面两形皆有）。 */
export function markEgressFailed(runnerId, { error, now = Date.now } = {}) {
  const at = typeof now === "function" ? now() : now
  const previous = appliedState.get(Number(runnerId)) ?? { rulesRev: null, allowIps: [] }
  appliedState.set(Number(runnerId), { ...previous, ok: false, at, error: String(error?.message ?? error).slice(0, 300) })
}

/** 全节点下发（规则增删/裁定；逐节点失败 ⇒ 记读数 + 审计面留痕——不抛，返回读数）。 */
export async function dispatchEgressAll({ db, config = {}, now = Date.now, log = null, reason = "规则变更", execOf, resolveImpl = null }) {
  const rows = db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
  const results = []
  for (const row of rows) {
    try {
      const state = await ensureEgressApplied({ db, runner: row, exec: execOf(row), config, now, log, reason, resolveImpl })
      results.push({ runnerId: row.id, ok: true, mechanism: state.mechanism, rulesRev: state.rulesRev })
    } catch (e) {
      markEgressFailed(row.id, { error: e, now: now() })
      log?.warn?.("egress_apply_failed", { runnerId: row.id, message: e?.message ?? String(e) })
      recordAudit(db, { type: "sandbox_event", actor: "system", target: row.name, detail: { kind: "egress_apply_failed", runnerId: row.id, reason, message: String(e?.message ?? e).slice(0, 300) }, ts: now() })
      results.push({ runnerId: row.id, ok: false, error: String(e?.message ?? e) })
    }
  }
  return results
}

// ── 临时集（待批 `once` 放行——TTL = RECENT_RESOLUTION_MS；到点消解并重算）────────

/** 临时集（`{ ip, host, expiresAt }`——进程内；重启丢 ⇒ DNS 重问重判）。 */
const tempSet = []

/** 临时项入集（同 ip 刷新到期；`once` 裁定后调用）。 */
export function addTempIps(ips, { host = null, now = Date.now(), ttlMs = RECENT_RESOLUTION_MS } = {}) {
  const expiresAt = now + ttlMs
  for (const ip of Array.isArray(ips) ? ips : []) {
    const existing = tempSet.find((item) => item.ip === ip)
    if (existing) {
      existing.expiresAt = expiresAt
      existing.host = host
      continue
    }
    tempSet.push({ ip, host, expiresAt, addedAt: now })
  }
  return tempSet.length
}

/** 当前有效临时项（到点消解——`buildRuleText`/下发前取数）。 */
export function tempIpsAt(now = Date.now()) {
  return tempSet.filter((item) => item.expiresAt > now)
}

/** 临时集指纹（有效项 `ip@到期` 排序串——「到点消解 ⇒ 重算」的变更判据）。 */
export function tempFingerprintOf(now = Date.now()) {
  return tempIpsAt(now).map((item) => `${item.ip}@${item.expiresAt}`).sort().join("|")
}

/** 临时集到点 ⇒ 需重算（ticker 面调用——§6「TTL 后消解并重算」）：与上次下发时指纹不一致 ⇒ true。 */
export function tempSetsNeedRepush(db, nowAt = Date.now()) {
  const fingerprint = tempFingerprintOf(nowAt)
  const rows = db.prepare("SELECT id FROM sandbox_runners ORDER BY id").all()
  return rows.some((row) => {
    const state = appliedState.get(Number(row.id))
    return state?.ok === true && typeof state.tempKey === "string" && state.tempKey !== fingerprint
  })
}

/** 临时集读面（测试/展示——含已过期项）。 */
export function tempSetOf() {
  return [...tempSet]
}
