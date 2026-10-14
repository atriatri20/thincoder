/**
 * 2026-10-13-sandbox-exec-rebuild-egress.test.mjs — thincoder-server 批内单测件（`sandbox-exec-rebuild` 批 · 出站闸——
 * 规则文本位次 ∥ 下发幂等 ∥ DNS 闸三径 ∥ 解析过滤 ∥ 临时集回收；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-egress.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/EXECUTION.md` §5/§6/§12–§13；腿 ↔ 用例在括号）：
 *   N67（位次逐行：L1 → 内置允许 → 显式 deny → 允许集 → 种子 deny → 默认拒；两条基线链同锚；重复下发同文本）
 *   ∥ N67b（下发幂等：修订号未变 ⇒ 零外呼；`rulesRev` +1 ⇒ 重下发）∥ N68（DNS 三径：白名单域 ⇒ 即答；纯 CIDR 域 ⇒ 回落子集；新域 ⇒ 持答 ⇒ `once` 裁定 ⇒ 答 + 临时集）
 *   ∥ B71（零挂起：L1/显式 deny 域/非盒源/超时）∥ B72（解析空 ⇒ REFUSED；部分拒 ⇒ 子集答）∥ B73（规则删行即生效 ∥ 盒零重建）
 *   ∥ 解析过滤（allow 域解析集逐 IP 过闸）∥ 临时集回收（TTL 到点消解 + 文本重算）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const EGRESS = await load("thincoder-server/src/sandbox/egress.mjs")
const DNS = await load("thincoder-server/src/sandbox/dns-gate.mjs")
const RULES = await load("thincoder-server/src/sandbox/rules.mjs")
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const HOSTS = await load("thincoder-server/src/sandbox/hosts.mjs")

const NOW = 1_770_000_000_000
const TEMP = mkdtempSync(join(tmpdir(), "tc-egress-"))
const CONFIG = { host: "10.0.0.5", port: 3000, db: join(TEMP, "gateway.db") }
const WORKSPACE_ID = 1

/** 种子：成员/节点/工作区（绑定）+ 显式规则两条（deny CIDR ∥ allow 域）。 */
function seedDb({ bound = true, settings = {} } = {}) {
  const db = DB.openDatabase(":memory:")
  const created = new Date(NOW).toISOString()
  db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('root','管理员','h','admin',?)").run(created)
  db.prepare("INSERT INTO api_keys (member_id, key_hash, key_hint, status, created_at) VALUES (1,'KH','sk-x','active',?)").run(created)
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('node-a','http://10.0.0.9:2375','active','{\"apiVer\":\"1.44\"}',?)").run(created)
  db.prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, created_at)
    VALUES ('ws-1', 1, 1, 'sk-x', ${bound ? 1 : "NULL"}, '{}', ?)`).run(created)
  db.prepare("INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES ('cidr','deny','203.0.113.0/24',NULL,NULL,0,'显式拒','admin',?, 'test')").run(created)
  db.prepare("INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES ('domain','allow','allowed.example',NULL,NULL,0,'显式放','admin',?, 'test')").run(created)
  db.prepare("INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES ('cidr','allow','198.51.100.0/24',NULL,NULL,0,'纯 CIDR 白名单','admin',?, 'test')").run(created)
  db.prepare("INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES ('domain','deny','denied.example',NULL,NULL,0,'显式拒域','admin',?, 'test')").run(created)
  for (const [key, value] of Object.entries(settings)) {
    db.prepare("INSERT INTO sandbox_settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(key, JSON.stringify(value))
  }
  return db
}

/** 解析面（`resolveImpl` 注入——零真 DNS 外呼）。 */
function resolver(map) {
  return async (host) => map[host] ?? []
}

/** 假主机命令面（记录 command/stdin；`nft` 在场 ⇒ nft 径）。 */
function fakeExec({ calls = [] } = {}) {
  const run = async (command, opts = {}) => {
    calls.push({ command, stdin: opts.stdin ?? null, label: opts.label ?? null })
    if (command === "command -v nft") return { exitCode: 0, stdout: "/usr/sbin/nft\n", stderr: "" }
    return { exitCode: 0, stdout: "", stderr: "" }
  }
  run.calls = calls
  return run
}

/** 路由面假件（真 registry + 假 req/res）。 */
function makeRoutes() {
  const handlers = new Map()
  return { handlers, add: (method, path, handler) => handlers.set(`${method} ${path}`, handler) }
}

function makeRes() {
  const out = { status: null, payload: null }
  return {
    out,
    res: {
      headersSent: false,
      writeHead(status) {
        out.status = status
      },
      end(text) {
        out.payload = text === undefined || text === "" ? null : JSON.parse(text)
      },
    },
  }
}

/** 探活假 fetch（登记面自检——真 `docker.mjs` 客户端链）。 */
function probeFetch(onlineIds) {
  const payload = { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64", ServerVersion: "29.1.3", Containers: 0, ContainersRunning: 0 }
  return async (url) => {
    const hit = onlineIds.find((item) => String(url).startsWith(item.address))
    if (!hit) throw new Error("unreachable")
    return { status: 200, ok: true, text: async () => JSON.stringify(payload), json: async () => payload }
  }
}

// ── N67：位次 / 两链 / 幂等 / 解析过滤 ──────────────────────────────────────

test("N67 规则文本位次逐行 + 两条基线链同锚 + 重复下发同文本 + 解析过滤", async () => {
  const db = seedDb()
  const rules = RULES.listRules(db)
  const resolveImpl = resolver({
    "allowed.example": ["93.184.216.34", "10.1.2.3"], // 后者落 RFC1918 种子 deny ⇒ 须被过滤
    "registry.npmjs.org": ["104.16.0.35"],
    "github.com": ["140.82.121.4"],
    "*.githubusercontent.com": [],
    "gitee.com": ["180.76.0.1"],
    "*.gitee.com": ["180.76.0.2"],
  })
  const first = await EGRESS.buildNftRuleText({ rules, config: CONFIG, resolveImpl })
  const lines = first.text.split("\n").map((line) => line.trim())
  const at = (needle) => lines.findIndex((line) => line.includes(needle))
  const l1 = at("ip daddr { 127.0.0.0/8, 169.254.0.0/16 } drop")
  const builtin = at("ip daddr 10.0.0.5 tcp dport 3000 accept")
  const explicitDeny = at("ip daddr 203.0.113.0/24 drop")
  const explicitAllow = at("ip daddr 93.184.216.34 accept")
  const seedDeny = at("ip daddr 10.0.0.0/8 drop")
  const last = lines.lastIndexOf("drop") // 默认拒（链尾）
  assert.ok(l1 > 0 && builtin > 0 && explicitDeny > 0 && explicitAllow > 0 && seedDeny > 0, `位次行缺失：${[l1, builtin, explicitDeny, explicitAllow, seedDeny].join(",")}`)
  assert.ok(l1 < builtin, "位次：L1 须先于内置允许")
  assert.ok(builtin < explicitDeny, "位次：内置允许须先于显式 deny")
  assert.ok(explicitDeny < explicitAllow, "位次：显式 deny 须先于允许集")
  assert.ok(explicitAllow < seedDeny, "位次：允许集须先于种子 deny")
  assert.ok(seedDeny < last, "位次：种子 deny 须先于默认拒")
  // 两条基线链（同锚 `iifname "tcws*"`——forward ∥ input；缺 input ⇒ 盒 → 宿主自身裸奔）
  assert.ok(lines.includes(`chain hook_forward {`) && lines.includes(`chain hook_input {`), "两条基线链未同场")
  assert.equal(lines.filter((line) => line === `iifname "tcws*" jump tcws_egress`).length, 2, "两链未同锚同跳")
  // 解析过滤：allow 域解析集逐 IP 过闸——RFC1918 命中种子 deny ⇒ 不入允许集
  assert.equal(lines.some((line) => line.includes("10.1.2.3")), false, "被种子 deny 的解析 IP 仍入允许集")
  assert.ok(first.allowIps.includes("93.184.216.34") && !first.allowIps.includes("10.1.2.3"))
  // 重复计算/下发同文本
  const second = await EGRESS.buildNftRuleText({ rules, config: CONFIG, resolveImpl })
  assert.equal(second.text, first.text, "两次全量重算文本不一致（非幂等）")
  assert.ok(first.text.startsWith(`table inet ${EGRESS.NFT_TABLE} {`) || first.text.split("\n")[0] === "", "nft 表头未命中")
  db.close()
})

test("N67b 下发幂等：修订号未变 ⇒ 零外呼；`rulesRev` +1 ⇒ 重下发", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const calls = []
  const exec = fakeExec({ calls })
  const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = 1").get()
  const resolveImpl = resolver({ "allowed.example": ["93.184.216.34"] })
  await EGRESS.ensureEgressApplied({ db, runner, exec, config: CONFIG, now: () => NOW, resolveImpl })
  assert.ok(calls.length > 0, "首次下发零外呼")
  const sent = calls.filter((item) => item.command === "nft -f -")
  assert.equal(sent.length, 1)
  assert.match(sent[0].stdin, /table inet thincoder_egress/, "全量定义未入 stdin（`nft -f -`）")
  const callsAfterFirst = calls.length
  await EGRESS.ensureEgressApplied({ db, runner, exec, config: CONFIG, now: () => NOW, resolveImpl })
  assert.equal(calls.length, callsAfterFirst, "修订号未变仍重下发（非幂等）")
  RULES.bumpRulesRev() // 规则变更 ⇒ 修订号 +1 ⇒ 必重下发
  await EGRESS.ensureEgressApplied({ db, runner, exec, config: CONFIG, now: () => NOW, resolveImpl })
  assert.equal(calls.length > callsAfterFirst, true, "修订号变更未重下发")
  db.close()
})

test("B73 规则删行即生效（重算文本无该项）∥ 盒零重建（零容器面调用）", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const calls = []
  const exec = fakeExec({ calls })
  const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = 1").get()
  const resolveImpl = resolver({})
  let clientBuilt = 0
  const deps = { db, config: CONFIG, now: () => NOW, resolveImpl, execOf: () => exec, clientForRunner: () => { clientBuilt += 1; throw new Error("不应触引擎面") } }
  await EGRESS.dispatchEgressAll({ ...deps, reason: "规则变更" })
  const rule = db.prepare("SELECT * FROM sandbox_rules WHERE target = '203.0.113.0/24'").get()
  RULES.deleteRule(db, rule.id, { actor: "test" })
  calls.length = 0
  await EGRESS.dispatchEgressAll({ ...deps, reason: "规则删除" })
  const pushed = calls.filter((item) => item.command === "nft -f -").map((item) => item.stdin).join("\n")
  assert.equal(pushed.includes("203.0.113.0/24"), false, "删行后文本仍含该项（未即时生效）")
  assert.equal(clientBuilt, 0, "删行触了容器面（盒须零重建）")
  db.close()
})

// ── N68 / B71 / B72：DNS 闸 ────────────────────────────────────────────────

/** 闸装配（假解析 + 假主机面；网段登记 ⇒ 盒源归属；`now` 可换——超时腿用真钟）。 */
function makeGate({ db, resolveImpl, config = CONFIG, now = () => NOW }) {
  const calls = []
  const exec = fakeExec({ calls })
  const gate = DNS.createDnsGate({ db, config, now, resolveImpl, execOf: () => exec })
  gate.registerNetwork(WORKSPACE_ID, "172.31.9.0/24")
  return { gate, calls }
}

/** 查询帧 + 应答收集器（`respond`）。 */
function ask(gate, host, { sourceIp = "172.31.9.7", ips = undefined } = {}) {
  const frames = []
  const query = { id: 0x1234, name: host, type: 1, cls: 1 }
  return gate
    .handleQuery({ id: query.id, query, host: ips === undefined ? { name: host } : { name: host, ips }, sourceIp, respond: (frame) => frames.push(frame) })
    .then((outcome) => ({ outcome, frames }))
}

function answersOf(frame) {
  return frame.readUInt16BE(6)
}

test("N68 三径：白名单域 ⇒ 即答 ∥ 纯 CIDR 域 ⇒ 回落子集 ∥ 新域 ⇒ 持答 ⇒ `once` 裁定 ⇒ 答 + 临时集", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const { gate } = makeGate({ db, resolveImpl: resolver({ "allowed.example": ["93.184.216.34"], "raw.example": ["198.51.100.9"] }) })
  // 径一：白名单域（域规则命中 ⇒ 即答）
  const one = await ask(gate, "allowed.example")
  assert.equal(one.outcome, "answered")
  assert.equal(answersOf(one.frames[0]), 1)
  assert.equal(one.frames[0].readUInt16BE(2) & 0x0f, DNS.RCODE_NOERROR)
  // 径二：纯 CIDR 域（无域规则 ⇒ 逐 IP 回落 ⇒ 命中显式 CIDR 白名单 ⇒ 子集答）
  const two = await ask(gate, "raw.example")
  assert.equal(two.outcome, "answered")
  assert.equal(answersOf(two.frames[0]), 1)
  // 径三：新域 ⇒ 持答（待批）⇒ 裁定 `once` ⇒ 答 + 临时集
  const three = await ask(gate, "fresh.example", { ips: ["93.184.216.40"] })
  assert.equal(three.outcome, "held")
  assert.equal(three.frames.length, 0, "持答期间不应答")
  const pending = db.prepare("SELECT * FROM sandbox_pending WHERE status = 'open' ORDER BY id DESC LIMIT 1").get()
  assert.ok(pending, "待批行未落")
  assert.equal(pending.host, "fresh.example")
  RULES.resolvePending(db, pending.id, "once", { actor: "test", actorId: 1, now: NOW })
  await gate.notifyDecision(pending.id)
  assert.equal(three.frames.length, 1, "裁定后未应答")
  assert.equal(answersOf(three.frames[0]), 1)
  assert.equal(EGRESS.tempIpsAt(NOW).some((item) => item.ip === "93.184.216.40"), true, "`once` 未入临时集")
  assert.equal(gate.waitersOf().length, 0, "等待表未回收")
  gate.stop()
  db.close()
})

test("B71 零挂起：L1 域 ∥ 显式拒域 ⇒ REFUSED；非盒源 ⇒ 忽略零答；超时 ⇒ REFUSED（窗到点）", async () => {
  const db = seedDb({ bound: false }) // 无绑定 ⇒ 网段重读零外呼
  db.prepare("INSERT INTO sandbox_settings (k, v) VALUES ('pendingTimeoutSeconds', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v").run()
  // 超时腿用真钟（窗到点扫 = 按「当前时刻」判——注入固定钟会让扫永认为行新鲜）
  const { gate } = makeGate({ db, resolveImpl: resolver({ "localhost.example": ["127.0.0.1"], "denied.example": ["93.184.216.34"] }), now: () => Date.now() })
  // L1（127.0.0.0/8）⇒ REFUSED + 零挂起
  const l1 = await ask(gate, "localhost.example")
  assert.equal(l1.outcome, "refused")
  assert.equal(l1.frames[0].readUInt16BE(2) & 0x0f, DNS.RCODE_REFUSED)
  assert.equal(gate.waitersOf().length, 0)
  // 显式拒域 ⇒ REFUSED（零挂起零待批）
  const denied = await ask(gate, "denied.example")
  assert.equal(denied.outcome, "refused")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_pending WHERE host = 'denied.example'").get().n, 0, "显式拒域仍落了待批")
  // 非盒源 ⇒ 忽略（零答）
  const foreign = await ask(gate, "allowed.example", { sourceIp: "8.8.8.8" })
  assert.equal(foreign.outcome, "ignored")
  assert.equal(foreign.frames.length, 0)
  // 超时：新域持答 ⇒ 窗到点（pendingTimeoutSeconds = 1）⇒ REFUSED + 待批行超时
  const held = await ask(gate, "slow.example", { ips: ["93.184.216.41"] })
  assert.equal(held.outcome, "held")
  await new Promise((resolve) => setTimeout(resolve, 1300))
  assert.equal(held.frames.length, 1, "超时未应答")
  assert.equal(held.frames[0].readUInt16BE(2) & 0x0f, DNS.RCODE_REFUSED)
  const row = db.prepare("SELECT * FROM sandbox_pending WHERE host = 'slow.example'").get()
  assert.equal(row.status, "timeout", `超时未收口：${row.status}`)
  assert.equal(gate.waitersOf().length, 0)
  gate.stop()
  db.close()
})

test("N68b 网段表惰性重读（§6「重启后按需重读」）：进程重启（表空）⇒ 查问自触发重读 ⇒ 重读后即答", async () => {
  const db = seedDb() // 工作区绑定节点 1（地址 http://10.0.0.9:2375；runtime_json 携 apiVer = 登记自检协商产物——KD-SV-81）
  EGRESS.resetEgressRuntime()
  const urls = []
  const fetchImpl = async (url) => {
    urls.push(String(url))
    if (String(url).includes("/version")) {
      const payload = { Version: "29.1.3", ApiVersion: "1.44", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" }
      return { status: 200, ok: true, text: async () => JSON.stringify(payload), json: async () => payload }
    }
    if (String(url).includes("/networks/")) {
      const payload = { Name: "tc-ws-1", IPAM: { Config: [{ Subnet: "172.31.9.0/24" }] } }
      return { status: 200, ok: true, text: async () => JSON.stringify(payload), json: async () => payload }
    }
    const miss = { message: "not found" }
    return { status: 404, ok: false, text: async () => JSON.stringify(miss), json: async () => miss }
  }
  const exec = fakeExec({ calls: [] })
  const gate = DNS.createDnsGate({ db, config: CONFIG, now: () => NOW, resolveImpl: resolver({ "allowed.example": ["93.184.216.34"] }), execOf: () => exec, fetchImpl })
  // 零 `registerNetwork` 预置（= 重启后进程）：首次查问自触发重读
  const first = await ask(gate, "allowed.example")
  assert.equal(first.outcome, "answered", "惰性重读未生效（表未填 ⇒ 非盒源忽略）")
  assert.ok(urls.some((url) => url.includes("/networks/tc-ws-1")), "网络面 inspect 未被调用（客户端成员名不达）")
  gate.stop()
  db.close()
})

test("N68c 同 host 重问 ⇒ 旧持答退位（一 pending 一条目）：旧问得 REFUSED，裁定后新问答成", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const { gate } = makeGate({ db, resolveImpl: resolver({}) })
  const one = ask(gate, "fresh2.example", { ips: ["93.184.216.80"] })
  const first = await one
  assert.equal(first.outcome, "held")
  const two = ask(gate, "fresh2.example", { ips: ["93.184.216.80"] })
  const second = await two
  assert.equal(second.outcome, "held")
  assert.equal(gate.waitersOf().length, 1, "同 host 两问未收口为一条目")
  assert.equal(first.frames.length, 1, "旧持答未退位（应答）")
  assert.equal(first.frames[0].readUInt16BE(2) & 0x0f, DNS.RCODE_REFUSED)
  const pending = db.prepare("SELECT * FROM sandbox_pending WHERE status = 'open' ORDER BY id DESC LIMIT 1").get()
  RULES.resolvePending(db, pending.id, "once", { actor: "test", actorId: 1, now: NOW })
  await gate.notifyDecision(pending.id)
  assert.equal(second.frames.length, 1, "裁定后新问未答（旧 timer 反删新条目）")
  assert.equal(answersOf(second.frames[0]), 1)
  gate.stop()
  db.close()
})

test("B72 解析空 ⇒ REFUSED（fail-closed）；部分拒 ⇒ 子集答（剔除被拒 IP）；全拒 ⇒ REFUSED", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const created = new Date(NOW).toISOString()
  db.prepare("INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES ('domain','allow','mixed.example',NULL,NULL,0,'混合域','admin',?, 'test')").run(created)
  const { gate } = makeGate({
    db,
    resolveImpl: resolver({ "void.example": [], "mixed.example": ["93.184.216.50", "203.0.113.9"] /* 后者落显式 deny */ }),
  })
  const empty = await ask(gate, "void.example")
  assert.equal(empty.outcome, "refused", "解析空未拒")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_pending").get().n, 0, "解析空仍落待批")
  const mixed = await ask(gate, "mixed.example")
  assert.equal(mixed.outcome, "answered", "部分拒未走子集答")
  const frame = mixed.frames[0]
  assert.equal(answersOf(frame), 1, `子集答记录数不符：${answersOf(frame)}`)
  const tail = frame.subarray(frame.length - 4).join(".")
  assert.equal(tail, "93.184.216.50", `子集答 IP 不符：${tail}`)
  // 子集空（域规则命中而逐 IP 全拒）⇒ REFUSED（不得以待批代替拒）
  const allDenied = await ask(gate, "mixed.example", { ips: ["203.0.113.9"] })
  assert.equal(allDenied.outcome, "refused", "全拒未走 REFUSED")
  assert.equal(allDenied.frames[0].readUInt16BE(2) & 0x0f, DNS.RCODE_REFUSED)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_pending WHERE host = 'mixed.example'").get().n, 0, "全拒仍落待批")
  gate.stop()
  db.close()
})

// ── 临时集回收 ──────────────────────────────────────────────────────────────

test("N67c 规则变更 ⇒ 同步下发 + 响应告警：成事腿 `egressState.ok` ∥ 节点下发失败 ⇒ `warning` + 审计 `egress_apply_failed`", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const routes = makeRoutes()
  let failPush = false
  const calls = []
  const { token } = SESSION.createSession(db, 1) // 管理员 id = 1（种子）
  // 主机凭据就位（闸下发经 SSH 面——先落凭据，才到 spawn 替身）
  HOSTS.setHostCredential(db, db.prepare("SELECT * FROM sandbox_runners WHERE id = 1").get(), { sshPort: 22, sshUser: "root", authKind: "password", secret: "pw", sudoSecret: null }, { config: CONFIG, now: () => NOW })
  SANDBOX.registerSandboxRoutes(routes, {
    db,
    config: CONFIG,
    now: () => NOW,
    fetchImpl: probeFetch([]),
    deps: {
      resolveImpl: async () => [],
      execImpl: async (cmd, args, opts = {}) => {
        if (cmd === "sshpass" && args[0] === "-V") return { code: 0, stdout: "1.09", stderr: "" } // sshpass 探针（非真 ssh 调用）
        const command = String(args.at(-1) ?? "")
        calls.push({ remote: command, input: opts.input ?? null })
        if (command === "command -v nft") return { code: 0, stdout: "/usr/sbin/nft\n", stderr: "" }
        if (failPush && command === "nft -f -") return { code: 1, stdout: "", stderr: "nft: 拒（假件）" }
        return { code: 0, stdout: "", stderr: "" }
      },
    },
  })
  const add = routes.handlers.get("POST /api/admin/sandbox/rules")
  const body = (payload) => ({ headers: { cookie: `tc_session=${token}` }, on(event, cb) { if (event === "data") cb(Buffer.from(JSON.stringify(payload))); if (event === "end") cb(); return this }, off() { return this }, readableEnded: false, resume() {} })
  // 成事腿：落库后即下发（同步——响应前已落 stdin）+ egressState.ok
  const one = makeRes()
  await add(body({ kind: "cidr", action: "deny", target: "198.18.0.0/15" }), one.res, { params: {} })
  assert.equal(one.out.status, 200)
  assert.equal(one.out.payload.egressState.ok, true, `同步下发未就位：${JSON.stringify(one.out.payload.egressState)}`)
  assert.ok(calls.some((item) => item.remote === "nft -f -"), "响应前未下发（非同步）")
  // 失败腿：节点拒 ⇒ ok:false + warning + 审计行；规则仍已落库（不反噬）
  failPush = true
  const two = makeRes()
  await add(body({ kind: "cidr", action: "deny", target: "198.19.0.0/16" }), two.res, { params: {} })
  assert.equal(two.out.status, 200)
  assert.equal(two.out.payload.egressState.ok, false)
  assert.match(String(two.out.payload.warning ?? ""), /下发未就位/)
  assert.ok(two.out.payload.rule, "下发失败反噬了已落库事实")
  const audit = db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%egress_apply_failed%' ORDER BY id DESC LIMIT 1").get()
  assert.ok(audit, "下发失败审计未落")
  assert.ok(String(audit.detail).includes("runnerId"), "审计 detail 键集缺 runnerId")
  db.close()
})

test("临时集到点 ⇒ 变更判据为真（`tempSetsNeedRepush`——ticker 面重算触发位）", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const calls = []
  const exec = fakeExec({ calls })
  const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = 1").get()
  await EGRESS.ensureEgressApplied({ db, runner, exec, config: CONFIG, now: () => NOW, resolveImpl: async () => [] })
  assert.equal(EGRESS.tempSetsNeedRepush(db, NOW), false, "零临时集却报需重算")
  EGRESS.addTempIps(["93.184.216.70"], { host: "fresh.example", now: NOW, ttlMs: 600_000 })
  assert.equal(EGRESS.tempSetsNeedRepush(db, NOW + 1000), true, "临时集新增未报需重算")
  // 新增后已下发（指纹含它）⇒ 期间不报；到点消解 ⇒ 报（节点侧留存须重算）
  await EGRESS.ensureEgressApplied({ db, runner, exec, config: CONFIG, now: () => NOW + 1000, resolveImpl: async () => [] })
  assert.equal(EGRESS.tempSetsNeedRepush(db, NOW + 1000), false, "刚下发却又报需重算")
  assert.equal(EGRESS.tempSetsNeedRepush(db, NOW + 600_001), true, "到点消解未报需重算")
  db.close()
})

test("临时集回收：TTL 到点消解 ⇒ 文本重算不含该 IP；`resetEgressRuntime` 清空", async () => {
  const db = seedDb()
  EGRESS.resetEgressRuntime()
  const rules = RULES.listRules(db)
  const resolveImpl = resolver({})
  EGRESS.addTempIps(["93.184.216.60"], { host: "fresh.example", now: NOW, ttlMs: 600_000 })
  const during = await EGRESS.buildNftRuleText({ rules, config: CONFIG, tempIps: EGRESS.tempIpsAt(NOW + 1000), resolveImpl })
  assert.ok(during.text.includes("ip daddr 93.184.216.60 accept"), "临时集未入允许集")
  assert.equal(EGRESS.tempIpsAt(NOW + 600_001).length, 0, "TTL 到点未消解")
  const after = await EGRESS.buildNftRuleText({ rules, config: CONFIG, tempIps: EGRESS.tempIpsAt(NOW + 600_001), resolveImpl })
  assert.equal(after.text.includes("93.184.216.60"), false, "TTL 到点后文本仍含临时 IP（未重算）")
  EGRESS.resetEgressRuntime()
  assert.equal(EGRESS.tempSetOf().length, 0, "重置未清临时集")
  db.close()
})
