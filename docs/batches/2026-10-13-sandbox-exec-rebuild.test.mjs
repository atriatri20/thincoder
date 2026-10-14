/**
 * 2026-10-13-sandbox-exec-rebuild.test.mjs — thincoder-server 批内单测件（`sandbox-exec-rebuild` 批 · 执行面主体——
 * 建盒链 ∥ 六动作 ∥ 参数集 ∥ 放置 ∥ 三定时器 ∥ 实时门 ∥ v22 迁移 ∥ #1351 事务 ∥ 拆案读判；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/EXECUTION.md` §12–§13；腿 ↔ 用例在括号）：
 *   N65（建盒全链——假 Docker + 假 SSH 逐条命中 + 参数集逐值 + 网桥读回复核）∥ N66（六动作链：启/停/轮换/快照/恢复/销毁）
 *   ∥ N69（三定时器：空闲 `last_active_at` ∥ 墙钟引擎 `StartedAt` ∥ 周期快照）∥ N70（放置 + 补放置）
 *   ∥ B67（配额不可用 ⇒ 零建盒 + `quota_apply_failed`）∥ B68（未绑 ⇒ 503 两因分列 ∥ 满员无候选）∥ B69（快照越 `diskMb` ⇒ 中止零行 ∥ 容器不在 ⇒ 跳过）
 *   ∥ B70（恢复两径：`archive put` 成 ∥ 拒 ⇒ SSH `tar xzf -` 备径）∥ E50（引擎不可达 ⇒ 502 人话 + 零半态）∥ E51（主机失败 ⇒ 步名 + 人话）
 *   ∥ B77（链前置：`config.host` 非 IPv4 字面量 ⇒ 建盒/启动确保/轮换重建三链链首停——零步执行）∥ B-裁（补放置建盒失败 ⇒ `placement_failed` 审计 + 行留——收口修复轮）
 *   ∥ E52（#1351 登记带入单事务——注入带入面炸 ⇒ 零残留）∥ E54（v21 库升 v22：存量保形 + 表消 + 幂等）∥ 拆案读判（工作区面在册 ∥ `routes.mjs` 零残留）。
 * 假件口径：Docker = 注入 `clientForRunner`（盒链）∥ 真 `fetchImpl` 假件（放置探活——走真 `docker.mjs` 客户端）；SSH = 注入 `deps.host`（逐条记录 command/stdin）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { randomBytes } from "node:crypto"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const BOX = await load("thincoder-server/src/sandbox/box.mjs")
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")

const NOW = 1_770_000_000_000 // 固定时钟（可注入面）
const TEMP = mkdtempSync(join(tmpdir(), "tc-exec-rebuild-"))
const CONFIG = { host: "10.0.0.5", port: 3000, db: join(TEMP, "gateway.db") }

// ── 库种子（成员/节点/工作区——列面 = v22）────────────────────────────────────

function seedDb({ settings = {} } = {}) {
  const db = DB.openDatabase(":memory:")
  const created = new Date(NOW).toISOString()
  db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)").run("root", "管理员", "scrypt", created)
  const admin = db.prepare("SELECT * FROM members WHERE username = 'root'").get()
  db.prepare("INSERT INTO api_keys (member_id, key_hash, key_hint, status, created_at) VALUES (?, 'hash-1', 'sk-tc-aaaa', 'active', ?)").run(admin.id, created)
  const keyId = Number(db.prepare("SELECT id FROM api_keys WHERE key_hint = 'sk-tc-aaaa'").get().id)
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('node-a', 'http://10.0.0.9:2375', 'active', '{\"apiVer\":\"1.44\"}', ?)").run(created)
  const runner = db.prepare("SELECT * FROM sandbox_runners WHERE name = 'node-a'").get()
  db.prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, stop_reason, base_image, created_at)
    VALUES ('ws-1', ?, ?, 'sk-tc-wsplain', ?, '{}', NULL, NULL, ?)`).run(admin.id, keyId, runner.id, created)
  const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE name = 'ws-1'").get()
  for (const [key, value] of Object.entries(settings)) {
    db.prepare("INSERT INTO sandbox_settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(key, JSON.stringify(value))
  }
  db.prepare("DELETE FROM sandbox_rules WHERE kind = 'domain'").run() // 盒链测试不涉域名解析（域面 = `-egress` 件——零真 DNS 外呼）
  return { db, admin, runner, workspace }
}

// ── 假主机命令面（SSH——逐条记录 command/stdin）────────────────────────────────

function fakeHost({ fail = () => false, stdoutOf = () => "" } = {}) {
  const calls = []
  const call = async (row, command, opts = {}) => {
    calls.push({ command, stdin: opts.stdin ?? null, label: opts.label ?? null })
    if (fail(command)) return { exitCode: 1, stdout: "", stderr: "boom（假件）" }
    return { exitCode: 0, stdout: stdoutOf(command), stderr: "" }
  }
  const run = async (row, command, opts = {}) => {
    const out = await call(row, command, opts)
    if (out.exitCode !== 0) throw new Error(`主机命令非零退出（exit=${out.exitCode}）：boom（假件）`)
    return out
  }
  return { calls, call, run, execOf: (row) => (command, opts = {}) => call(row, command, opts) }
}

/** 配额就位缺省读数（xfs + pquota 径——项目 id = 100000 + wsId，块 = diskMb × 1024）。 */
function quotaStdout(command, workspaceId, diskMb = 4096) {
  if (command.includes("findmnt")) return "/ xfs rw,pquota\n"
  if (command.includes("bsize=")) return "bsize=4096\n"
  if (command.includes("report -p -b -n")) return `${100000 + workspaceId} 0 0 ${(diskMb * 1024 * 1024) / 4096} 0 [------]\n`
  return ""
}

/** 闸下发缺省读数（nft 在场——`nft -f -` 收体）。 */
function egressStdout(command) {
  if (command === "sh -c 'command -v nft'") return "/usr/sbin/nft\n" // 探针命令随正（egress 修复轮 2026-10-14：sh -c 包裹——sudo 安全）
  return ""
}

// ── 假 Docker 客户端（盒链直调面——与 `docker.mjs` 客户端同名法）────────────────

function fakeClient({ containers = [], network = null, archive = Buffer.from("tar-payload"), failOn = () => false } = {}) {
  const calls = []
  const state = { containers: containers.map((item) => ({ ...item })), network }
  const guard = (op) => {
    const message = failOn(op)
    if (message) {
      const e = new Error(message)
      e.status = 500
      throw e
    }
  }
  const find = (id) => state.containers.find((item) => item.Id === id)
  return {
    calls,
    state,
    info: async () => ({ json: { ServerVersion: "29.1.3", Containers: state.containers.length, ContainersRunning: 0 } }),
    containers: async () => {
      guard("containers")
      return { json: state.containers }
    },
    containerState: async (id) => {
      guard("containerState")
      const item = find(id) ?? {}
      return { state: { status: item.State ?? "stopped", running: item.State === "running", startedAt: item.StartedAt ?? new Date(NOW - 1000).toISOString(), finishedAt: null, exitCode: 0 } }
    },
    createNetwork: async (body) => {
      guard("createNetwork")
      state.network = { Name: body.Name, Options: body.Options, IPAM: { Config: [{ Subnet: "172.31.9.0/24" }] } }
      calls.push({ op: "createNetwork", body })
      return { json: { Id: "net-1" } }
    },
    inspectNetwork: async (name) => {
      calls.push({ op: "inspectNetwork", name })
      if (state.network === null) {
        const e = new Error("network not found")
        e.status = 404
        throw e
      }
      return { json: state.network }
    },
    deleteNetwork: async (name) => {
      calls.push({ op: "deleteNetwork", name })
      state.network = null
      return { json: {} }
    },
    archiveGet: async (id, path) => {
      guard("archiveGet")
      calls.push({ op: "archiveGet", id, path })
      return { status: 200, buffer: archive }
    },
    archivePut: async (id, path, tar) => {
      guard("archivePut")
      calls.push({ op: "archivePut", id, path, bytes: tar.length })
      return { status: 200, json: { message: "ok" } }
    },
    createContainer: async (name, body) => {
      guard("createContainer")
      const item = { Id: `c${state.containers.length + 1}`, Names: [`/${name}`], State: "created", StartedAt: new Date(NOW - 1000).toISOString() }
      state.containers.push(item)
      calls.push({ op: "createContainer", name, body })
      return { json: { Id: item.Id } }
    },
    startContainer: async (ref) => {
      guard("startContainer")
      const item = find(ref) ?? state.containers.find((entry) => String(entry.Names?.[0] ?? "").replace(/^\//, "") === ref)
      if (item) item.State = "running"
      calls.push({ op: "startContainer", ref })
      return { json: {} }
    },
    stopContainer: async (ref) => {
      guard("stopContainer")
      const item = find(ref) ?? state.containers.find((entry) => String(entry.Names?.[0] ?? "").replace(/^\//, "") === ref)
      if (item) item.State = "exited"
      calls.push({ op: "stopContainer", ref })
      return { json: {} }
    },
    deleteContainer: async (ref, opts = {}) => {
      guard("deleteContainer")
      calls.push({ op: "deleteContainer", ref, force: opts.force })
      state.containers = state.containers.filter((entry) => entry.Id !== ref && String(entry.Names?.[0] ?? "").replace(/^\//, "") !== ref)
      return { json: {} }
    },
    imageDetail: async (ref) => {
      throw new DOCKER.DockerError("api", `No such image: ${ref}`, { status: 404, apiMessage: `No such image: ${ref}` })
    },
    pullImage: async () => ({ text: "" }),
    buildImage: async () => ({ text: "" }),
  }
}

function boxDeps({ db, client, host, config = null, extra = {} } = {}) {
  // 每调用一个独立数据目录（快照 blob 落点——避免同钟同 id 的档名跨用例互踩）
  const dir = mkdtempSync(join(tmpdir(), "tc-box-"))
  return { db, config: config ?? { ...CONFIG, db: join(dir, "gateway.db") }, now: () => NOW, host, clientForRunner: () => client, log: null, resolveImpl: async () => [], ...extra }
}

// ── 路由面假件（真 registry + 假 req/res）────────────────────────────────────

function makeRoutes() {
  const handlers = new Map()
  return { handlers, add: (method, path, handler) => handlers.set(`${method} ${path}`, handler) }
}

function makeReq(body, { token = null } = {}) {
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), "utf8")
  return {
    headers: { cookie: token === null ? "" : `tc_session=${token}`, "content-type": "application/json" },
    readableEnded: false,
    on(event, cb) {
      if (event === "data" && payload !== null) cb(payload)
      if (event === "end") cb()
      return this
    },
    off() {
      return this
    },
    resume() {},
  }
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

/** 调用注册面处理器（`values` = 路径逐段值——`:id`/`:action`；未捕获 ⇒ 原样抛——断言「零残留」用）。 */
async function callRoute(routes, method, path, { db, config = CONFIG, token = null, body = undefined, deps = {}, values = [] } = {}) {
  const handler = routes.handlers.get(`${method} ${path}`)
  assert.ok(handler, `路由未注册：${method} ${path}`)
  const { res, out } = makeRes()
  if (body === undefined) {
    await handler(makeReq(undefined, { token }), res, { params: paramsOf(path, values) })
    return out
  }
  await handler(makeReq(body, { token }), res, { params: paramsOf(path, values) })
  return out
}

/** 路径参数（`:id`/`:action` 逐段取——假 ctx 面）。 */
function paramsOf(template, values = []) {
  const names = [...template.matchAll(/:([A-Za-z]+)/g)].map((match) => match[1])
  const out = {}
  for (const [index, name] of names.entries()) out[name] = values[index]
  return out
}

// ── N65：建盒全链（逐条命中 + 参数集逐值）────────────────────────────────────

test("N65 建盒全链：①卷目录→②配额→③闸复核→④镜像(缺省跳过)→⑤网络→⑥容器→⑦启动；参数集逐值", async () => {
  const { db, admin, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({ network: null })
  const result = await BOX.createWorkspaceBox(db, workspace, runner, { ...boxDeps({ db, client, host }), actor: { name: admin.name, id: admin.id } })

  // ① 卷目录（两条——`mkdir -p` ∥ `chown 1000:1000`；路径 = workspaceRoot/<id>）
  assert.deepEqual(host.calls.slice(0, 2).map((item) => item.command), ["mkdir -p /var/lib/thincoder/workspaces/1", "chown 1000:1000 /var/lib/thincoder/workspaces/1"])
  // ② 配额（探明 ⇒ xfs 项目配额 —— 项目 id = 100000 + ws_id）
  const quotaCommands = host.calls.map((item) => item.command).filter((command) => /findmnt|xfs_quota|xfs_info/.test(command))
  assert.ok(quotaCommands.some((command) => command.includes(`project -s -p /var/lib/thincoder/workspaces/1 100001`)), `xfs 项目绑定未命中：${quotaCommands.join(" ∥ ")}`)
  assert.ok(quotaCommands.some((command) => command.includes("limit -p bhard=4096m 100001")), "xfs 限额未命中")
  // ③ 闸就位复核（nft 面——全量定义经 stdin 落表）
  const nftDrop = host.calls.find((item) => item.command === "nft -f -")
  assert.ok(nftDrop && typeof nftDrop.stdin === "string" && nftDrop.stdin.includes("table inet thincoder_egress"), "闸下发未命中（nft 全量定义）")
  assert.match(nftDrop.stdin, /iifname "tcws\*" jump tcws_egress/)
  // ⑤ 网络（载荷：桥名 = 闸锚 tcws<id>；读回复核）
  const networkCall = client.calls.find((item) => item.op === "createNetwork")
  assert.equal(networkCall.body.Name, "tc-ws-1")
  assert.equal(networkCall.body.Options["com.docker.network.bridge.name"], "tcws1")
  assert.ok(client.calls.some((item) => item.op === "inspectNetwork"), "网络读回复核未命中")
  // ⑥ 容器（参数集逐值——N65）
  const created = client.calls.find((item) => item.op === "createContainer")
  assert.equal(created.name, "tc-ws-1")
  const body = created.body
  assert.equal(body.Image, "thincoder-sandbox:1") // 缺省底座（标准镜像）
  assert.deepEqual(body.Env, [
    "OPENAI_BASE_URL=http://10.0.0.5:3000/v1",
    "OPENAI_API_KEY=sk-tc-wsplain",
    "TC_SERVER_URL=http://10.0.0.5:3000",
    "HOME=/workspace/home",
  ])
  assert.equal(body.WorkingDir, "/workspace")
  assert.equal(body.Cmd, undefined) // 不覆写 Cmd（镜像 CMD——壳起）
  assert.deepEqual(body.HostConfig.Binds, ["/var/lib/thincoder/workspaces/1:/workspace"])
  assert.equal(body.HostConfig.ReadonlyRootfs, true)
  assert.deepEqual(body.HostConfig.Tmpfs, { "/tmp": "size=256m" })
  assert.deepEqual(body.HostConfig.CapDrop, ["ALL"])
  assert.equal(body.HostConfig.NetworkMode, "tc-ws-1")
  assert.deepEqual(body.HostConfig.Dns, ["10.0.0.5"])
  assert.equal(body.HostConfig.Memory, 4096 * 1024 * 1024)
  assert.equal(body.HostConfig.NanoCpus, 2e9)
  assert.equal(body.HostConfig.PidsLimit, 512)
  // ⑦ 启动 + 审计（`workspace_create`）+ stop_reason 清零
  assert.ok(client.calls.some((item) => item.op === "startContainer"))
  const audit = db.prepare("SELECT detail FROM audit_events WHERE type = 'sandbox_event' ORDER BY id DESC LIMIT 1").get()
  assert.ok(String(audit.detail).includes("workspace_create"))
  assert.equal(db.prepare("SELECT stop_reason FROM sandbox_workspaces WHERE id = ?").get(workspace.id).stop_reason, null)
  assert.equal(result.image, "thincoder-sandbox:1")
})

test("N65b 自定义底座：④ 镜像就位走派生（缺底座 ⇒ 拉取 ⇒ 构建 ⇒ tag 入容器 Image）", async () => {
  const { db, runner, workspace } = seedDb()
  db.prepare("UPDATE sandbox_workspaces SET base_image = 'ghcr.io/acme/base:1' WHERE id = ?").run(workspace.id)
  const base = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({})
  const built = []
  const notFound = (ref) => new DOCKER.DockerError("api", `No such image: ${ref}`, { status: 404, apiMessage: `No such image: ${ref}` })
  client.imageDetail = async (ref) => {
    if (ref === "ghcr.io/acme/base:1") return { json: { Id: "sha256:base" } }
    if (ref === "thincoder-sandbox:1") return { json: { Id: "sha256:std" } }
    throw notFound(ref) // 派生 tag 不在店 ⇒ 实构（缓存腿 = 下方第二次调用）
  }
  client.buildImage = async (tag) => {
    built.push(tag)
    return { text: "" }
  }
  await BOX.createWorkspaceBox(db, base, runner, boxDeps({ db, client, host }))
  assert.equal(built.length, 1, "派生构建未触发")
  const created = client.calls.find((item) => item.op === "createContainer")
  assert.equal(created.body.Image, built[0]) // 容器用派生 tag（非底座原引用）
  const audit = db.prepare("SELECT detail FROM audit_events WHERE type = 'sandbox_event' AND detail LIKE '%image_derive%'").get()
  assert.ok(audit, "实构成功 ⇒ 审计 `image_derive` 未落")
  // 缓存腿：tag 已在店 ⇒ 零构建（第二次建盒零新 build 调用）
  client.imageDetail = async (ref) => {
    if (ref === "ghcr.io/acme/base:1") return { json: { Id: "sha256:base" } }
    if (ref === "thincoder-sandbox:1") return { json: { Id: "sha256:std" } }
    return { json: { Id: "sha256:derived" } }
  }
  await BOX.createWorkspaceBox(db, base, runner, boxDeps({ db, client, host }))
  assert.equal(built.length, 1, "缓存命中仍触了构建（tag 在场应采用）")
})

// ── B67：配额不可用 ⇒ 零建盒 + 审计 ─────────────────────────────────────────

test("B67 配额不可用 ⇒ 建盒停（零容器零网络 + `quota_apply_failed`）", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({
    stdoutOf: (command) => (command.includes("findmnt") ? "/ xfs rw\n" : ""), // 非 pquota ⇒ 走 loopback 备径
    fail: (command) => command.includes("truncate") || command.includes("mkfs") || command.includes("mount -o loop"),
  })
  const client = fakeClient({})
  await assert.rejects(() => BOX.createWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host })), /② 配额就位失败/)
  assert.equal(client.calls.filter((item) => item.op === "createContainer").length, 0, "配额不可用仍建了容器")
  assert.equal(client.calls.filter((item) => item.op === "createNetwork").length, 0, "配额不可用仍建了网络")
  const audit = db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%quota_apply_failed%'").get()
  assert.ok(audit, "配额失败审计未落")
})

// ── N66：六动作链 ───────────────────────────────────────────────────────────

test("N66 启动链：容器缺 ⇒ ①→②→⑤→⑥→⑦（创建后再起）；已在跑 ⇒ 幂等 noop", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({})
  const first = await BOX.startWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host }))
  assert.equal(first.noop, false)
  assert.ok(client.calls.some((item) => item.op === "createContainer"))
  assert.ok(client.calls.some((item) => item.op === "startContainer"))
  const second = await BOX.startWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host }))
  assert.equal(second.noop, true, "已在跑未走幂等 noop")
  assert.equal(client.calls.filter((item) => item.op === "startContainer").length, 1)
})

test("N66b 停止：停容器 + `stop_reason` 注记；未建 ⇒ 无操作（卷零触）", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({ containers: [{ Id: "c9", Names: ["/tc-ws-1"], State: "running" }] })
  const result = await BOX.stopWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host }), { reason: "manual" })
  assert.equal(result.stopped, true)
  assert.ok(client.calls.some((item) => item.op === "stopContainer"))
  assert.equal(db.prepare("SELECT stop_reason FROM sandbox_workspaces WHERE id = ?").get(workspace.id).stop_reason, "manual")
  assert.equal(host.calls.length, 0, "停止链触了主机面（卷 = 主机路径——停止零触）")
})

test("N66c 轮换重建：删容器 → ①→②→④→⑥→⑦（新 key 入 env）；网络不复建", async () => {
  const { db, runner, workspace } = seedDb()
  db.prepare("UPDATE sandbox_workspaces SET key_plain = 'sk-tc-newkey' WHERE id = ?").run(workspace.id)
  const updated = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }], network: { Name: "tc-ws-1", Options: { "com.docker.network.bridge.name": "tcws1" }, IPAM: { Config: [{ Subnet: "172.31.9.0/24" }] } } })
  const result = await BOX.rotateWorkspaceBox(db, updated, runner, boxDeps({ db, client, host }))
  assert.equal(result.rotated, true)
  assert.equal(client.calls[0].op, "deleteContainer", "轮换未先删容器")
  const created = client.calls.find((item) => item.op === "createContainer")
  assert.ok(created.body.Env.includes("OPENAI_API_KEY=sk-tc-newkey"), "新 key 未入 env")
  assert.equal(client.calls.filter((item) => item.op === "startContainer").length, 1)
})

test("N66d 快照：`archive get` ⇒ gzip 落盘 + 行落（保留份数裁剪）；重复拍同结果", async () => {
  const { db, runner, workspace } = seedDb({ settings: { checkpointKeep: 2 } })
  const host = fakeHost()
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }] })
  for (let index = 0; index < 3; index += 1) {
    const result = await BOX.snapshotWorkspace(db, workspace, runner, boxDeps({ db, client, host }), { note: `第 ${index + 1} 拍` })
    assert.ok(result.checkpointId > 0)
    assert.ok(readFileSync(result.path).length > 0, "blob 未落盘")
    assert.equal(result.size, readFileSync(result.path).length)
  }
  const rows = db.prepare("SELECT * FROM sandbox_checkpoints WHERE workspace_id = ? ORDER BY id DESC").all(workspace.id)
  assert.equal(rows.length, 2, "保留份数裁剪未生效（checkpointKeep = 2）")
  const audit = db.prepare("SELECT COUNT(*) AS n FROM audit_events WHERE detail LIKE '%\"checkpoint\"%'").get()
  assert.equal(Number(audit.n), 3)
})

test("N66e 恢复两径：`archive put` 成 ∥ 拒 ⇒ SSH `tar xzf -` 备径（stdin = 存档字节）", async () => {
  const { db, runner, workspace } = seedDb()
  {
    const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) })
    const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }] })
    const snap = await BOX.snapshotWorkspace(db, workspace, runner, boxDeps({ db, client, host }))
    const checkpoint = db.prepare("SELECT * FROM sandbox_checkpoints WHERE id = ?").get(snap.checkpointId)
    const restored = await BOX.restoreWorkspace(db, workspace, runner, checkpoint, boxDeps({ db, client, host }))
    assert.equal(restored.mechanism, "archive")
    assert.ok(client.calls.some((item) => item.op === "archivePut"), "archive put 未命中")
    assert.ok(host.calls.some((item) => item.command === `rm -rf /var/lib/thincoder/workspaces/1/*`), "清卷步未命中")
  }
  // 备径：`archive put` 抛 ⇒ SSH `tar xzf -`
  {
    const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) })
    const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }], failOn: (op) => (op === "archivePut" ? "put 拒（假件）" : false) })
    const checkpoint = db.prepare("SELECT * FROM sandbox_checkpoints ORDER BY id DESC LIMIT 1").get()
    const restored = await BOX.restoreWorkspace(db, workspace, runner, checkpoint, boxDeps({ db, client, host }))
    assert.equal(restored.mechanism, "ssh", "备径未触发")
    const tarCall = host.calls.find((item) => item.command.startsWith("tar xzf -"))
    assert.ok(tarCall, "SSH 备径命令未命中")
    assert.ok(Buffer.isBuffer(tarCall.stdin) || typeof tarCall.stdin === "string", "备径未喂 stdin")
  }
})

test("N66f 销毁：停 ∥ 删容器 ∥ 删网络 ∥ 卷清理 ∥ 行删（含快照行 + 待批行）", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) })
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }], network: { Name: "tc-ws-1", Options: { "com.docker.network.bridge.name": "tcws1" } } })
  await BOX.snapshotWorkspace(db, workspace, runner, boxDeps({ db, client, host }))
  db.prepare("INSERT INTO sandbox_pending (runner_id, workspace_id, host, hits, first_seen_at, last_seen_at, status) VALUES (?, ?, 'x.com', 1, ?, ?, 'open')").run(runner.id, workspace.id, NOW, NOW)
  const result = await BOX.destroyWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host }), { deleteVolume: true })
  assert.equal(result.destroyed, true)
  assert.equal(client.calls.filter((item) => item.op === "deleteContainer").length, 1)
  assert.equal(client.calls.filter((item) => item.op === "deleteNetwork").length, 1)
  assert.ok(host.calls.some((item) => item.command.includes("rm -rf /var/lib/thincoder/workspaces/1")), "卷目录清理未命中")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces").get().n, 0)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints").get().n, 0)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_pending").get().n, 0)
  const audit = db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%workspace_destroy%'").get()
  assert.ok(audit, "`workspace_destroy` 审计未落")
})

// ── B69：快照边界 ───────────────────────────────────────────────────────────

test("B69 快照越 `diskMb` 上限 ⇒ 中止零行 + `checkpoint_fail`；容器不在 ⇒ 跳过", async () => {
  const { db, runner, workspace } = seedDb({ settings: { diskMb: 1 } })
  const host = fakeHost()
  const big = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }], archive: randomBytes(2 * 1024 * 1024) }) // 不可压数据（越 1 MiB 上限）
  const skipped = await BOX.snapshotWorkspace(db, workspace, runner, boxDeps({ db, client: big, host }))
  assert.equal(skipped.skipped, true)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints").get().n, 0, "越上限仍落了行")
  assert.ok(db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%checkpoint_fail%'").get(), "`checkpoint_fail` 未落")
  const absent = fakeClient({ containers: [] })
  const noop = await BOX.snapshotWorkspace(db, workspace, runner, boxDeps({ db, client: absent, host }))
  assert.equal(noop.skipped, true)
  assert.equal(absent.calls.filter((item) => item.op === "archiveGet").length, 0, "容器不在仍打了存档面")
})

// ── N69：三定时器 ───────────────────────────────────────────────────────────

test("N69 空闲定时器：`last_active_at` 越 `idleTtlMinutes` ⇒ 停 + `idle_ttl`", async () => {
  const { db, runner, workspace } = seedDb({ settings: { idleTtlMinutes: 30 } })
  const host = fakeHost()
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }] })
  // 空闲信号源二 = 审计动作行（detail.workspaceId）
  db.prepare("INSERT INTO audit_events (ts, type, actor_name, detail) VALUES (?, 'sandbox_event', 'test', ?)").run(NOW - 31 * 60_000, JSON.stringify({ kind: "box_start", workspaceId: workspace.id }))
  const out = await BOX.tickBoxes(db, boxDeps({ db, client, host }))
  assert.deepEqual(out.stopped, [{ workspaceId: workspace.id, reason: "idle_ttl" }])
  assert.equal(db.prepare("SELECT stop_reason FROM sandbox_workspaces WHERE id = ?").get(workspace.id).stop_reason, "idle_ttl")
})

test("N69b 墙钟定时器：引擎 `StartedAt` 越 `wallclockTtlHours` ⇒ 停 + `wallclock_ttl`（空闲信号新鲜）", async () => {
  const { db, runner, workspace } = seedDb({ settings: { wallclockTtlHours: 24, idleTtlMinutes: 30 } })
  const host = fakeHost()
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }] })
  client.containerState = async () => ({ state: { running: true, startedAt: new Date(NOW - 25 * 3_600_000).toISOString() } })
  db.prepare("INSERT INTO audit_events (ts, type, actor_name, detail) VALUES (?, 'sandbox_event', 'test', ?)").run(NOW - 60_000, JSON.stringify({ kind: "box_start", workspaceId: workspace.id }))
  const out = await BOX.tickBoxes(db, boxDeps({ db, client, host }))
  assert.deepEqual(out.stopped, [{ workspaceId: workspace.id, reason: "wallclock_ttl" }])
})

test("N69c 周期快照定时器：最新 checkpoint / `StartedAt` 起算越 `checkpointEveryMinutes` ⇒ 拍一份", async () => {
  const { db, runner, workspace } = seedDb({ settings: { checkpointEveryMinutes: 15, wallclockTtlHours: 240, idleTtlMinutes: 600 } })
  const host = fakeHost()
  const client = fakeClient({ containers: [{ Id: "c1", Names: ["/tc-ws-1"], State: "running" }] })
  client.containerState = async () => ({ state: { running: true, startedAt: new Date(NOW - 20 * 60_000).toISOString() } })
  db.prepare("INSERT INTO audit_events (ts, type, actor_name, detail) VALUES (?, 'sandbox_event', 'test', ?)").run(NOW - 60_000, JSON.stringify({ kind: "box_start", workspaceId: workspace.id }))
  const out = await BOX.tickBoxes(db, boxDeps({ db, client, host }))
  assert.equal(out.snapshotted.length, 1, "周期快照未触发")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints").get().n, 1)
  const again = await BOX.tickBoxes(db, boxDeps({ db, client, host }))
  assert.equal(again.snapshotted.length, 0, "新一轮 tick 未按最新 checkpoint 起算（重复拍）")
})

// ── N70 / B68：放置 ─────────────────────────────────────────────────────────

/** 探活假 fetch（真 `docker.mjs` 客户端链——`/version` + `/v1.44/info`）。 */
function probeFetch(onlineIds) {
  const payload = { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64", ServerVersion: "29.1.3", Containers: 0, ContainersRunning: 0 }
  return async (url) => {
    const hit = onlineIds.find((item) => String(url).startsWith(item.address))
    if (!hit) throw new Error("unreachable")
    return { status: 200, ok: true, text: async () => JSON.stringify(payload), json: async () => payload }
  }
}

test("N70 放置：在线 active 取最少绑定者（并列 ⇒ id 小）；满员 ⇒ 无候选；补放置建盒", async () => {
  const { db, workspace } = seedDb()
  const created = new Date(NOW).toISOString()
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('node-b', 'http://10.0.0.10:2375', 'active', '{}', ?)").run(created)
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('node-c', 'http://10.0.0.11:2375', 'disabled', '{}', ?)").run(created)
  const rows = db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
  db.prepare("UPDATE sandbox_workspaces SET runner_id = NULL WHERE id = ?").run(workspace.id) // 未绑（待放置）
  const deps = { db, config: CONFIG, fetchImpl: probeFetch(rows), now: () => NOW, resolveImpl: async () => [] }
  const picked = await BOX.selectRunnerForWorkspace(db, deps)
  assert.equal(picked.name, "node-a") // node-a（0 绑）∥ node-b（0 绑）⇒ 并列取 id 小
  const { placePendingWorkspaces } = BOX
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({})
  const out = await placePendingWorkspaces(db, { ...deps, host, clientForRunner: () => client })
  assert.deepEqual(out.placed, [workspace.id])
  assert.deepEqual(out.boxed, [workspace.id])
  assert.equal(db.prepare("SELECT runner_id FROM sandbox_workspaces WHERE id = ?").get(workspace.id).runner_id, picked.id)
})

test("B 裁（收口修复轮）：补放置建盒失败 ⇒ 审计 `placement_failed`（逐工作区一条 ∥ 行留——绑定保留）", async () => {
  const { db, workspace } = seedDb()
  db.prepare("UPDATE sandbox_workspaces SET runner_id = NULL WHERE id = ?").run(workspace.id) // 未绑（待放置）
  const rows = db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
  const deps = { db, config: CONFIG, fetchImpl: probeFetch(rows), now: () => NOW, resolveImpl: async () => [] }
  const host = fakeHost({ fail: (command) => command.startsWith("mkdir -p") }) // ① 步失败 ⇒ 链停（建盒未成）
  const client = fakeClient({})
  const logs = []
  const out = await BOX.placePendingWorkspaces(db, { ...deps, host, clientForRunner: () => client, log: { warn: (...args) => logs.push(args) } })
  assert.deepEqual(out.placed, [workspace.id], "放置先行（绑定已落）")
  assert.deepEqual(out.boxed, [], "建盒失败 ⇒ 不入 boxed")
  assert.equal(db.prepare("SELECT runner_id FROM sandbox_workspaces WHERE id = ?").get(workspace.id).runner_id, rows[0].id, "行留（绑定保留——catch 不解绑，与创建面同构）")
  const audit = db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' AND json_extract(detail, '$.kind') = 'placement_failed'").all()
  assert.equal(audit.length, 1, "逐工作区一条")
  const detail = JSON.parse(audit[0].detail)
  assert.deepEqual(Object.keys(detail).sort(), ["kind", "reason", "runnerId", "workspaceId"], "detail 键集（ACCOUNTS §2.1）")
  assert.deepEqual([detail.workspaceId, detail.runnerId], [workspace.id, rows[0].id], "两 id 逐值")
  assert.match(String(detail.reason), /卷目录准备失败|主机命令非零退出/, `reason 携步名/原文：${detail.reason}`)
  assert.equal(audit[0].target_name, workspace.name, "target = 工作区名（沿 `quota_apply_failed` 同形）")
  assert.equal(audit[0].ts, NOW, "ts = 注入钟")
  assert.equal(logs.length, 1, "`box_place_create_failed` 日志行保留")
})

test("B68 满员 ⇒ 无候选（留未绑 + 待人放）；成员/控制面动作 ⇒ 503 两因分列", async () => {
  const { db, admin, workspace } = seedDb({ settings: { maxBoxesPerRunner: 1 } })
  const created = new Date(NOW).toISOString()
  db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('u2', '甲', 'h', 'user', ?)").run(created)
  const other = db.prepare("SELECT * FROM members WHERE username = 'u2'").get()
  const keyId = Number(db.prepare("SELECT id FROM api_keys LIMIT 1").get().id)
  db.prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, created_at)
    VALUES ('ws-2', ?, ?, 'sk-2', 1, '{}', ?)`).run(other.id, keyId, created)
  const rows = db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
  const deps = { db, config: CONFIG, fetchImpl: probeFetch(rows), now: () => NOW }
  assert.equal(await BOX.selectRunnerForWorkspace(db, deps), null, "满员仍有候选（未按 maxBoxesPerRunner 收口）")

  // 控制面动作：未绑工作区 ⇒ 503（因一「先放置」）；满员无候选 ⇒ 因二「待人放」
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  db.prepare("UPDATE sandbox_workspaces SET runner_id = NULL WHERE id = ?").run(workspace.id)
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch(rows), deps: { host: fakeHost(), clientForRunner: () => fakeClient({}) } })
  let failure = null
  try {
    await callRoute(routes, "POST", "/api/admin/sandbox/workspaces/:id/:action", { db, token, body: {}, values: [workspace.id, "start"] })
  } catch (e) {
    failure = e
  }
  assert.ok(failure, "未绑动作未拒")
  assert.equal(failure.code, "sandbox_unavailable")
  assert.match(failure.message, /待人放/, `因二措辞未命中：${failure.message}`)
})

// ── E50 / E51：失败面（502 人话 ∥ 步名 + 零半态）────────────────────────────

test("B68b 绑定节点门（§7）：绑定节点离线 ⇒ 503（非 502——探绑定节点，非任一 active）", async () => {
  const { db, admin, workspace } = seedDb()
  const { token } = SESSION.createSession(db, admin.id)
  const routes = makeRoutes()
  // 绑定节点不可达（probeFetch 空集——真探活面）∥ 建盒径挂假件（假设门未拦则差）
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([]), deps: { host: fakeHost(), clientForRunner: () => fakeClient({}) } })
  const failure = await callRoute(routes, "POST", "/api/admin/sandbox/workspaces/:id/:action", { db, token, body: {}, values: [workspace.id, "start"] }).then(() => null, (e) => e)
  assert.equal(failure.code, "sandbox_unavailable")
  assert.match(failure.message, /绑定节点不可达|绑定节点非 active/, `措辞未命中绑定节点：${failure.message}`)
})

test("E50 引擎不可达 ⇒ 502 人话 + 零半态（链不续跑）", async () => {
  const { db, admin, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({ failOn: (op) => (op === "containers" ? "connect ECONNREFUSED 10.0.0.9:2375" : false) })
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([runner]), deps: { host, clientForRunner: () => client } })
  const handler = routes.handlers.get("POST /api/admin/sandbox/workspaces/:id/:action")
  const { res, out } = makeRes()
  let failure = null
  try {
    await handler(makeReq({}, { token }), res, { params: { id: String(workspace.id), action: "start" } })
  } catch (e) {
    failure = e
  }
  assert.ok(failure, "不可达未抛")
  assert.equal(failure.code, "upstream_error") // 502
  assert.match(failure.message, /引擎|ECONNREFUSED/, `人话未携原因：${failure.message}`)
  assert.equal(client.calls.filter((item) => item.op === "startContainer").length, 0, "零半态：不可达仍起了容器")
  assert.equal(out.status, null)
})

test("E51 主机命令失败 ⇒ 步名 + 人话（零容器）", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({ fail: (command) => command.startsWith("mkdir -p") })
  const client = fakeClient({})
  await assert.rejects(() => BOX.createWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host })), (e) => {
    assert.match(e.message, /① 卷目录准备失败/)
    assert.match(e.message, /主机命令非零退出/)
    assert.equal(e.step, "① 卷目录准备")
    return true
  })
  assert.equal(client.calls.length, 0, "卷目录失败仍触了引擎面")
})

test("B77 链前置（fail-closed）：`config.host` 非 IPv4 字面量（域名 ∥ IPv6）⇒ 建盒/启动确保/轮换重建三链链首停（零步执行）", async () => {
  const { db, runner, workspace } = seedDb()
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, workspace.id) + egressStdout(command) })
  const client = fakeClient({})
  for (const [label, badHost] of [["域名", "sandbox.example.com"], ["IPv6", "fd00::5"]]) {
    for (const [chain, run] of [
      ["建盒", () => BOX.createWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host, config: { ...CONFIG, host: badHost } }))],
      ["启动确保", () => BOX.startWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host, config: { ...CONFIG, host: badHost } }))],
      ["轮换重建", () => BOX.rotateWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host, config: { ...CONFIG, host: badHost } }))],
    ]) {
      await assert.rejects(run, (e) => {
        assert.equal(e.step, "链前置", `${label}·${chain}：步名`)
        assert.match(e.message, /非 IPv4 字面量/, `${label}·${chain}：人话`)
        assert.match(e.message, /静默断网/, `${label}·${chain}：处置句`)
        return true
      })
    }
  }
  assert.equal(host.calls.length, 0, "零 SSH 调用（零步执行）")
  assert.equal(client.calls.length, 0, "零 Docker 调用（零步执行）")
  assert.equal(db.prepare("SELECT runner_id FROM sandbox_workspaces WHERE id = ?").get(workspace.id).runner_id, runner.id, "行保留（绑定未动）")
  // 地址修正后重试照常
  const retry = await BOX.createWorkspaceBox(db, workspace, runner, boxDeps({ db, client, host }))
  assert.equal(retry.workspaceId, workspace.id, "改 IPv4 后重试照常")
  assert.ok(client.calls.some((item) => item.op === "createContainer"), "修正后建盒链照跑")
})

// ── E52：#1351 登记带入单事务（注入带入面炸 ⇒ 零残留）────────────────────────

test("E52 #1351：带入行 ∥ 登记行 ∥ 审计行 = 单事务（带入面炸 ⇒ 全回滚零残留）", async () => {
  const { db, admin } = seedDb()
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  const bomb = () => {
    throw new Error("带入面炸（假件）")
  }
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([{ address: "http://10.0.0.20:2375" }]), deps: { importSegmentDenies: bomb } })
  const handler = routes.handlers.get("POST /api/admin/sandbox/runners")
  const before = db.prepare("SELECT COUNT(*) AS n FROM sandbox_runners").get().n
  const auditsBefore = db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n
  await assert.rejects(
    () => handler({ headers: { cookie: `tc_session=${token}` }, on(event, cb) {
      if (event === "data") cb(Buffer.from(JSON.stringify({ name: "node-x", address: "10.0.0.20:2375" })))
      if (event === "end") cb()
      return this
    }, off() { return this }, readableEnded: false, resume() {} },
      makeRes().res,
      { params: {} }),
    /带入面炸|invalid_request_error/,
  )
  // 自检要真打自检面 ⇒ 用可探活的假 fetch（未命中 ⇒ 502；此处断言「零残留」两条：行面 ∥ 审计面）
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_runners").get().n, before, "登记行未回滚")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, auditsBefore, "审计行未回滚")
})

test("E52b #1351 成事径：带入行 + 登记行 + 审计行三同拍（commit 后逐项在）", async () => {
  const { db, admin } = seedDb()
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([{ address: "http://10.0.0.21:2375" }]), deps: {} })
  const handler = routes.handlers.get("POST /api/admin/sandbox/runners")
  const { res, out } = makeRes()
  const req = { headers: { cookie: `tc_session=${token}` }, on(event, cb) {
    if (event === "data") cb(Buffer.from(JSON.stringify({ name: "node-y", address: "10.0.0.21:2375" })))
    if (event === "end") cb()
    return this
  }, off() { return this }, readableEnded: false, resume() {} }
  await handler(req, res, { params: {} })
  assert.equal(out.status, 200)
  const row = db.prepare("SELECT * FROM sandbox_runners WHERE name = 'node-y'").get()
  assert.ok(row, "登记行未落")
  const audit = db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%runner_add%'").get()
  assert.ok(audit, "审计行未落")
})

// ── E54：v21 ⇒ v22 迁移（存量保形 + 表消 + 幂等）────────────────────────────

test("E54 v21 库升 v22：存量工作区行逐值保形 ∥ `sandbox_tasks` 表消 ∥ 再开幂等", () => {
  const file = join(TEMP, `v21-${Date.now()}.db`)
  const chain21 = DB.MIGRATIONS.filter((step) => step.v <= 21)
  const legacy = DB.openDatabase(file, { migrations: chain21 })
  assert.equal(DB.readVersion(legacy), 21)
  legacy.exec("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('u','u','h','admin','2026-01-01')")
  legacy.exec("INSERT INTO api_keys (member_id, key_hash, key_hint, status, created_at) VALUES (1,'KH','sk-tc-old','active','2026-01-01')")
  legacy.exec(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, required_labels_json, limits_json, created_at)
    VALUES ('legacy', 1, 1, 'sk-tc-legacy', NULL, '{"a":"b"}', '{"cpus":3}', '2026-01-01')`)
  legacy.exec("INSERT INTO sandbox_tasks (runner_id, kind, payload_json, status, created_at) VALUES (1, 'sandbox.start', '{}', 'queued', '2026-01-01')")
  legacy.close()

  const upgraded = DB.openDatabase(file)
  assert.equal(DB.readVersion(upgraded), DB.MIGRATIONS.at(-1).v) // 升到链头（原写死 22——v23/v24 他批已落，2026-10-14 随正）
  const row = upgraded.prepare("SELECT * FROM sandbox_workspaces WHERE name = 'legacy'").get()
  assert.equal(row.key_plain, "sk-tc-legacy")
  assert.equal(row.limits_json, '{"cpus":3}')
  assert.equal(row.stop_reason, null)
  assert.equal(row.base_image, null)
  assert.equal(row.created_at, "2026-01-01")
  assert.equal(upgraded.prepare("PRAGMA table_info(sandbox_workspaces)").all().some((col) => col.name === "required_labels_json"), false)
  assert.equal(upgraded.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sandbox_tasks'").get(), undefined)
  const registryCols = upgraded.prepare("PRAGMA table_info(registry_credentials)").all()
  assert.deepEqual(registryCols.map((col) => col.name), ["id", "host", "username", "secret_cipher", "created_at", "updated_at", "created_by"], "列面七行——`updated_at` 在 `created_by` 前（单源 = `store/STORE.md` §2 v22 段）")
  assert.equal(registryCols.find((col) => col.name === "updated_at").notnull, 1, "`updated_at TEXT NOT NULL`（收口修复轮 C——DDL 收正）")
  const tlsCols = upgraded.prepare("PRAGMA table_info(sandbox_runners)").all().map((col) => col.name).filter((name) => name.startsWith("tls_"))
  assert.deepEqual(tlsCols.sort(), ["tls_ca", "tls_cert", "tls_key_cipher", "tls_updated_at"].sort())
  upgraded.close()

  const again = DB.openDatabase(file)
  assert.equal(DB.readVersion(again), DB.MIGRATIONS.at(-1).v) // 幂等 = 停链头（同上随正）
  assert.equal(again.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces").get().n, 1)
  again.close()
})

// ── 拆案读判：工作区面在册 ∥ `routes.mjs` 零残留 ────────────────────────────

test("拆案读判：工作区面注册在 `workspace-routes.mjs`（六端点）；`routes.mjs` 零残留", async () => {
  const { db } = seedDb()
  const routes = makeRoutes()
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([]) })
  for (const key of [
    "GET /api/admin/sandbox/workspaces",
    "POST /api/admin/sandbox/workspaces",
    "PATCH /api/admin/sandbox/workspaces/:id",
    "POST /api/admin/sandbox/workspaces/:id/derive",
    "GET /api/admin/sandbox/workspaces/:id/checkpoints",
    "POST /api/admin/sandbox/workspaces/:id/:action",
  ]) {
    assert.ok(routes.handlers.has(key), `端点未注册：${key}`)
  }
  const source = readFileSync(join(ROOT, "thincoder-server/src/sandbox/routes.mjs"), "utf8")
  assert.equal(source.includes("/api/admin/sandbox/workspaces"), false, "routes.mjs 仍残留工作区面路由")
  assert.ok(source.includes("registerWorkspaceRoutes"), "routes.mjs 未挂工作区面注册")
  const wsSource = readFileSync(join(ROOT, "thincoder-server/src/sandbox/workspace-routes.mjs"), "utf8")
  assert.ok(wsSource.includes("baseImage"), "底座绑定读/写面未落（增补块）")
})

test("工作区面：PATCH `baseImage`（归一 + 审计）∥ 派生端点（无底座 ⇒ 400 人话）", async () => {
  const { db, admin, workspace } = seedDb()
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch([]) })
  const patch = routes.handlers.get("PATCH /api/admin/sandbox/workspaces/:id")
  const { res, out } = makeRes()
  await patch({ headers: { cookie: `tc_session=${token}` }, on(event, cb) {
    if (event === "data") cb(Buffer.from(JSON.stringify({ baseImage: "ghcr.io/acme/base" })))
    if (event === "end") cb()
    return this
  }, off() { return this }, readableEnded: false, resume() {} }, res, { params: { id: String(workspace.id) } })
  assert.equal(out.status, 200)
  assert.equal(out.payload.workspace.baseImage, "ghcr.io/acme/base:latest") // 缺标签补 latest
  const audit = db.prepare("SELECT detail FROM audit_events WHERE detail LIKE '%workspace_base%'").get()
  assert.ok(audit, "`workspace_base` 审计未落")
  // 恢复标准
  const cleared = makeRes()
  await patch({ headers: { cookie: `tc_session=${token}` }, on(event, cb) {
    if (event === "data") cb(Buffer.from(JSON.stringify({ baseImage: null })))
    if (event === "end") cb()
    return this
  }, off() { return this }, readableEnded: false, resume() {} }, cleared.res, { params: { id: String(workspace.id) } })
  assert.equal(cleared.out.payload.workspace.baseImage, null)
  // 形非法 ⇒ 400（库零变）
  let failure = null
  try {
    await patch({ headers: { cookie: `tc_session=${token}` }, on(event, cb) {
      if (event === "data") cb(Buffer.from(JSON.stringify({ baseImage: "acme/base@sha256:abc" })))
      if (event === "end") cb()
      return this
    }, off() { return this }, readableEnded: false, resume() {} }, makeRes().res, { params: { id: String(workspace.id) } })
  } catch (e) {
    failure = e
  }
  assert.equal(failure.code, "invalid_request_error")
  assert.equal(db.prepare("SELECT base_image FROM sandbox_workspaces WHERE id = ?").get(workspace.id).base_image, null, "400 后库被改")
  // 派生端点：无自定义底座 ⇒ 400 人话
  let deriveFailure = null
  try {
    await callRoute(routes, "POST", "/api/admin/sandbox/workspaces/:id/derive", { db, token, values: [workspace.id] })
  } catch (e) {
    deriveFailure = e
  }
  assert.equal(deriveFailure.code, "invalid_request_error")
  assert.match(deriveFailure.message, /未绑自定义底座/)
})

test("工作区面：创建（放置 + key 签发 + 建盒链）∥ 销毁确认门（confirm 缺 ⇒ 400）", async () => {
  const { db, admin } = seedDb()
  const rows = db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
  const routes = makeRoutes()
  const { token } = SESSION.createSession(db, admin.id) // 会话用真钟（`resolveSession` 无 now 注入面——固定钟会造出「过期会话」）
  const host = fakeHost({ stdoutOf: (command) => quotaStdout(command, 2) + egressStdout(command) })
  const client = fakeClient({})
  SANDBOX.registerSandboxRoutes(routes, { db, config: CONFIG, now: () => NOW, fetchImpl: probeFetch(rows), deps: { host, clientForRunner: () => client } })
  const create = routes.handlers.get("POST /api/admin/sandbox/workspaces")
  const { res, out } = makeRes()
  await create({ headers: { cookie: `tc_session=${token}` }, on(event, cb) {
    if (event === "data") cb(Buffer.from(JSON.stringify({ name: "ws-new", ownerMemberId: admin.id, limits: { cpus: 4 } })))
    if (event === "end") cb()
    return this
  }, off() { return this }, readableEnded: false, resume() {} }, res, { params: {} })
  assert.equal(out.status, 200)
  assert.equal(out.payload.workspace.name, "ws-new")
  assert.equal(out.payload.workspace.runnerId, rows[0].id)
  assert.equal(out.payload.workspace.boxState, "stopped")
  assert.equal(out.payload.workspace.limits.cpus, 4)
  assert.equal(out.payload.workspace.keyHint !== null, true, "key 未签发（列表行缺 keyHint）")
  assert.ok(client.calls.some((item) => item.op === "createContainer"), "建盒链未跑")
  // 销毁确认门
  const destroy = routes.handlers.get("POST /api/admin/sandbox/workspaces/:id/:action")
  let failure = null
  try {
    await destroy(makeReq({}, { token }), makeRes().res, { params: { id: String(out.payload.workspace.id), action: "destroy" } })
  } catch (e) {
    failure = e
  }
  assert.equal(failure.code, "invalid_request_error")
  assert.match(failure.message, /confirm/)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces WHERE id = ?").get(out.payload.workspace.id).n, 1, "确认门未拦住销毁")
})
