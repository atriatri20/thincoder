/**
 * registry.mjs — 沙盒编排核心（sandbox/SANDBOX.md §2/§3/§5/§8；sandbox-exec-rebuild 批收正）：
 * 节点登记/读数/可用性（**Docker API 节点**）∥ 放置（KD-SV-171——在线 active 最少绑定者）∥ 全局设置与每工作区资源覆写 ∥ 盒读数。
 *
 * 节点面（KD-SV-79/80/81）：登记 = 连通自检读数落 `runtime_json`（`address` ∥ `status` active/disabled）；读数 = 读时探活（无心跳 ∥ 无后台定时器）；
 * **写门 = 实时探活**（KD-SV-166——`requireSandboxAvailable`：候选 active 并发轻探 `GET /info`（3s），≥1 在线 ⇒ 过；全离线 ∥ 无行 ⇒ 503 `sandbox_unavailable`，不降级、零缓存）。
 * **队列/心跳死件已删净**（KD-SV-161/166——原 `TASK_KINDS`/`enqueueTask`/`claimTasks`/`reportTask`/`sweepStuckTasks`/`lastTaskView`/心跳三件全退场：
 * 动作 = 请求内直调链（`box.mjs`）；节点存活 = 读时探活；无 daemon ∥ 无心跳 ∥ 无领取方）。
 * **连接面 TLS 档**（增补 #2——KD-SV-192…195）：行连接元数据（`connection` scheme 派生 ∥ `tls` state/updatedAt——零材料）；
 * 材料四列写入走 `tls` 参（`docker-tls.mjs` 产物）；本档零材料回显。
 * 资源取值序（§2）：全局默认（`sandbox_settings`）⇒ 逐键叠加工作区覆写（覆写优先）——解析结果随建盒/重建载荷下发（载荷构造 = `box.mjs`）。
 */
import { HttpError } from "../gateway/errors.mjs"
import { clientForRunner, normalizeDockerAddress } from "./docker.mjs"
import { connectionKindOf, tlsMetaOf } from "./docker-tls.mjs"

/** 停因词表（`stop_reason` 列——服务器动作注记；gateway/API.md §2.7）。 */
export const STOP_REASONS = Object.freeze(["idle_ttl", "wallclock_ttl", "manual"])

/** 每工作区覆写键集（SANDBOX §2——资源 + TTL）。 */
export const LIMIT_KEYS = Object.freeze(["cpus", "memMb", "pids", "diskMb", "idleTtlMinutes", "wallclockTtlHours"])

/** 工作区名上限（`sandbox:<名>` 须入 key 名（≤ 40 字符）——`sandbox:` 前缀 8 字符）∥ 节点名上限（§3）。 */
export const WORKSPACE_NAME_MAX = 30
export const RUNNER_NAME_MAX = 40

/** 全局默认设置（键全集与值形 = gateway/API.md §2.5；缺省值 = 实现定值——控制台可改）。
 *  `maxBoxesPerRunner`/`workspaceRoot` = v22 两键（sandbox-exec-rebuild 批——放置容量 ∥ 节点侧工作区根路径）。 */
export const DEFAULT_SETTINGS = Object.freeze({
  cpus: 2,                              // 数（可小数）
  memMb: 4096,                          // 正整数
  pids: 512,
  diskMb: 4096,
  idleTtlMinutes: 30,                   // 空闲超时（§3 定时器）
  wallclockTtlHours: 24,                // 墙钟 TTL（§3 定时器）
  checkpointEveryMinutes: 15,           // WIP 快照周期（§5）
  checkpointKeep: 5,                    // 快照保留份数（§5）
  pendingTimeoutSeconds: 60,            // 待批挂起窗（§6）
  tmpfsMb: 256,                         // tmpfs /tmp 容积（披露 D1）
  image: "thincoder-sandbox:1",         // 盒镜像（§3「镜像 = 控制台预填设置」缺省值）
  maxBoxesPerRunner: 8,                 // 单节点盒数上限（放置容量——KD-SV-171）
  workspaceRoot: "/var/lib/thincoder/workspaces", // 节点侧工作区根路径（卷 = `<workspaceRoot>/<ws-id>`——KD-SV-162）
  memberWorkspaceLimit: 3,              // 每成员工作区数上限（正整数——KD-SV-156；成员建工作区越限 ⇒ 400 `workspace_limit_reached`）
})

export const SETTING_KEYS = Object.freeze(Object.keys(DEFAULT_SETTINGS))

// ── 小助手 ───────────────────────────────────────────────────────────────────

function parseJson(text, fallback) {
  try {
    const value = JSON.parse(text)
    return value === null || typeof value !== "object" ? fallback : value
  } catch {
    return fallback
  }
}

function trimText(value, max, { field = "值", allowEmpty = false } = {}) {
  const text = typeof value === "string" ? value.trim() : ""
  if (!allowEmpty && text === "") throw new Error(`${field}不可为空`)
  if (text.length > max) throw new Error(`${field}超长（≤ ${max} 字符；实长 ${text.length}）`)
  return text
}

// ── 设置（全局默认——§8「资源与 TTL」）───────────────────────────────────────

/** 有效设置 = 默认 ∪ 表内值（表只存被设置过的键）。 */
export function getSettings(db) {
  const stored = new Map(db.prepare("SELECT k, v FROM sandbox_settings").all().map((row) => [row.k, row.v]))
  const out = {}
  for (const key of SETTING_KEYS) {
    if (!stored.has(key)) {
      out[key] = DEFAULT_SETTINGS[key]
      continue
    }
    try {
      out[key] = JSON.parse(stored.get(key))
    } catch {
      out[key] = DEFAULT_SETTINGS[key]
    }
  }
  return out
}

/** 单键值校验（API §2.5「值形逐键」）：cpus = 正数；余 = 正整数；`image`/`workspaceRoot` = 非空字符串。 */
export function validateSettingValue(key, value) {
  if (key === "image") return trimText(value, 200, { field: "镜像名" })
  if (key === "workspaceRoot") return trimText(value, 400, { field: "工作区根路径" })
  const num = Number(value)
  if (!Number.isFinite(num)) throw new Error(`${key} 须为数值：${JSON.stringify(value)}`)
  if (key === "cpus") {
    if (num <= 0) throw new Error(`cpus 须为正数：${num}`)
    return num
  }
  if (!Number.isInteger(num) || num <= 0) throw new Error(`${key} 须为正整数：${JSON.stringify(value)}`)
  return num
}

/** 设置写（键级合并——值 = 整键替换；`null` = 删键回落默认）；未知键 ∥ 形非法 ⇒ 抛（库零变）。 */
export function patchSettings(db, patch) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) throw new Error("设置写面须为对象（{ <键>: 值 }）")
  const keys = Object.keys(patch)
  if (keys.length === 0) throw new Error("设置写面为空（至少一键）")
  const ops = keys.map((key) => {
    if (!SETTING_KEYS.includes(key)) throw new Error(`未知设置键：${key}（键集 = ${SETTING_KEYS.join(" ∥ ")}）`)
    return [key, patch[key] === null ? null : validateSettingValue(key, patch[key])]
  })
  for (const [key, value] of ops) {
    if (value === null) db.prepare("DELETE FROM sandbox_settings WHERE k = ?").run(key)
    else db.prepare("INSERT INTO sandbox_settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(key, JSON.stringify(value))
  }
  return getSettings(db)
}

// ── 每工作区覆写（§2「资源 + TTL」）──────────────────────────────────────────

/** 覆写校验：键集 ⊆ `LIMIT_KEYS`；cpus = 正数；余 = 正整数；`null` = 删键（回落全局默认）。 */
export function validateLimitsPatch(patch) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) throw new Error("limits 须为对象（{ <键>: 值 }；值 null = 删键）")
  const out = {}
  for (const [key, value] of Object.entries(patch)) {
    if (!LIMIT_KEYS.includes(key)) throw new Error(`未知覆写键：${key}（键集 = ${LIMIT_KEYS.join(" ∥ ")}）`)
    out[key] = value === null ? null : validateSettingValue(key, value)
  }
  return out
}

/** 键级合并（出现键 = 应用；值 null = 删键）——返回新覆写对象（库零变 ⇒ 抛在写前）。 */
export function mergeLimits(existingJson, patch) {
  const merged = { ...parseJson(existingJson, {}) }
  for (const [key, value] of Object.entries(validateLimitsPatch(patch))) {
    if (value === null) delete merged[key]
    else merged[key] = value
  }
  return merged
}

/** 取值序（§2）：全局默认 ⇒ 逐键叠加工作区覆写（覆写优先）——建盒/重建载荷逐值（载荷构造 = `box.mjs`）。 */
export function resolveLimits(db, workspace, settings = getSettings(db)) {
  const overrides = parseJson(workspace.limits_json, {})
  const out = {}
  for (const key of LIMIT_KEYS) out[key] = overrides[key] ?? settings[key]
  return out
}

// ── 节点（登记/读数/可用性——§3；Docker API 节点）────────────────────────────

/** 节点名归一（≤ 40 字符——§3；空 ⇒ 抛）。 */
export function normalizeRunnerName(raw) {
  return trimText(raw, RUNNER_NAME_MAX, { field: "节点名" })
}

/** 主机 SSH 元数据（§3 行形：`ssh: { user, port, authKind, credential: { state, updatedAt } }`——**密文零回显**：本件只出元数据，密列永不出库面）。
 *  状态三值 `none` ∥ `sealed` ∥ `revoked`（列缺省 `'none'`——存量行零回填）。 */
export function sshMetaOf(row) {
  return {
    user: row.ssh_user ?? null,
    port: row.ssh_port ?? null,
    authKind: row.auth_kind ?? null,
    credential: { state: row.credential_state ?? "none", updatedAt: row.credential_updated_at ?? null },
  }
}

/** 节点读数（§3 `overview` 基础行——`online`/`version`/`containers` 三值由路由面读时探活并上；`ssh` = 主机凭据元数据——KD-SV-133；
 *  `connection`/`tls` = 连接面元数据（增补 #2——scheme 派生 + state/updatedAt，**零材料字段**））。 */
export function runnerView(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    status: row.status,
    selfCheck: parseJson(row.runtime_json, {}),
    ssh: sshMetaOf(row),
    connection: connectionKindOf(row.address),
    tls: tlsMetaOf(row),
    createdAt: row.created_at,
  }
}

/** 节点行（id 序——登记/探活/删除面共用）。 */
export function runnerRows(db) {
  return db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all()
}

export function listRunners(db) {
  return runnerRows(db).map(runnerView)
}

/** 节点行 or 404（`not_found`）。 */
export function runnerRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `节点不存在：${id}`)
  return row
}

/** 节点寻址 = 名 ∥ 地址两形（§12：`docker`/`exec` 两工具**单源**）。判据 = 原值逐等（name ∥ address）∪ 地址归一后逐等
 *  （`normalizeDockerAddress` 同规则——明文 ∥ TLS 两档各试；相抵形归一抛 ⇒ 跳过）；未在册 ∥ 多命中（歧义）⇒ 抛（工具级错误人话；不猜）。 */
export function runnerByRef(db, raw, { field = "host（注册节点名 ∥ 地址）", max = 300 } = {}) {
  const value = trimText(raw, max, { field })
  const hits = db.prepare("SELECT * FROM sandbox_runners WHERE name = ? OR address = ? ORDER BY id").all(value, value)
  for (const tls of [false, true]) {
    try {
      hits.push(...db.prepare("SELECT * FROM sandbox_runners WHERE address = ? ORDER BY id").all(normalizeDockerAddress(value, { tls }))) // 归一形同判（两形皆命中 ⇒ 下方歧义收口）
    } catch {
      /* 非该档地址形（归一抛）⇒ 跳过该档 */
    }
  }
  const rows = [...new Map(hits.map((row) => [row.id, row])).values()]
  if (rows.length === 0) throw new Error(`节点未在册：${value}（先 runners.add 登记，或用 runners.list 查已登记节点）`)
  if (rows.length > 1) throw new Error(`节点名歧义：${value} 命中 ${rows.length} 个注册节点（#${rows.map((row) => row.id).join(" ∥ #")}）——改用不重名的名字或地址`)
  return rows[0]
}

/** 登记一行（连通自检通过后落库——§3；`runtime` = 自检读数逐值 ∥ `tls` = 连接材料四列值对（`sealTlsMaterials` 产物；
 *  缺省 `null` = 明文档 ⇒ 四列全 NULL——不携档零行为变化）。重名 ⇒ 抛（调用方 400——零落库）。 */
export function insertRunner(db, { name, address, runtime = {}, now = Date.now(), tls = null } = {}) {
  const resolved = normalizeRunnerName(name)
  if (typeof address !== "string" || address.trim() === "") throw new Error("登记缺节点地址（address）")
  try {
    const created = new Date(now).toISOString()
    const info = tls === null
      ? db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES (?, ?, 'active', ?, ?)")
        .run(resolved, address.trim(), JSON.stringify(runtime ?? {}), created)
      : db.prepare(`INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at, tls_ca, tls_cert, tls_key_cipher, tls_updated_at)
          VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?)`)
        .run(resolved, address.trim(), JSON.stringify(runtime ?? {}), created, tls.ca, tls.cert, tls.keyCipher, tls.updatedAt)
    return db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(Number(info.lastInsertRowid))
  } catch (e) {
    if (/UNIQUE constraint failed: sandbox_runners\.name/.test(String(e?.message))) {
      throw new Error(`节点名已存在：${resolved}（换一个名字，或先清理旧登记）`)
    }
    throw e
  }
}

/** 可用节点（静态面——`status = 'active'`；在线判 = `probeRunner` 实时探活，调用方组合）。 */
export function usableRunners(db) {
  return runnerRows(db).filter((row) => row.status === "active")
}

/** 单节点轻探（`GET /info`——读类 3s 超时；失败 ⇒ `false`——离线读数不外推、零缓存）。 */
export async function probeRunner(row, { fetchImpl = fetch, config = {}, requestImpl = null } = {}) {
  try {
    await clientForRunner(row, { fetchImpl, config, requestImpl }).info()
    return true
  } catch {
    return false
  }
}

/** 可用性读数（静态面——成员面读门用；**写门 = `requireSandboxAvailable`（实时探活——KD-SV-166）**）。 */
export function sandboxAvailability(db) {
  const rows = runnerRows(db)
  if (rows.length === 0) return { status: "unavailable", reason: "无节点注册" }
  if (!rows.some((row) => row.status === "active")) return { status: "unavailable", reason: "无可用节点（节点均非 active）" }
  return { status: "available" }
}

/** 写门（KD-SV-166——**实时探活**：候选 `active` 并发轻探（3s、零缓存、不降级）；≥1 在线 ⇒ 过；全离线 ∥ 无行 ⇒ 503 `sandbox_unavailable`）。
 *  调用面 = 写动作（建盒/盒动作/派生）；读面零门；节点面恒可用（登记/删除不受门限——B68）。 */
export async function requireSandboxAvailable(db, { detail = null, fetchImpl = fetch, config = {}, requestImpl = null } = {}) {
  const rows = usableRunners(db)
  if (rows.length > 0) {
    const online = await Promise.all(rows.map((row) => probeRunner(row, { fetchImpl, config, requestImpl })))
    if (online.some(Boolean)) return
  }
  const reason = rows.length > 0 ? "无可用节点（active 节点全部不可达）" : runnerRows(db).length > 0 ? "无可用节点（节点均非 active）" : "无节点注册"
  throw new HttpError("sandbox_unavailable", detail ? `${detail}（${reason}）` : `沙盒不可用：${reason}`)
}

/** 绑定节点门（§7 绑定面动作——启动/停止/销毁/轮换/快照/恢复 ⇒ **探绑定节点**；离线 ⇒ 503 `sandbox_unavailable` 人话——与创建面 `requireSandboxAvailable`（探任一）成对）。
 *  `runner` = 绑定行（`sandbox_workspaces.runner_id` 解析所得；未绑 ⇒ 传 `null`）；三因分列人话：未绑定（先放置）∥ 非 active ∥ 不可达。零缓存、不降级（与写门同口径）。 */
export async function requireRunnerAvailable(runner, { detail = null, fetchImpl = fetch, config = {}, requestImpl = null } = {}) {
  const fail = (reason) => {
    throw new HttpError("sandbox_unavailable", detail === null ? `沙盒不可用：${reason}` : `${detail}（${reason}）`)
  }
  if (runner === null || runner === undefined) fail("未绑定节点——先放置")
  if (runner.status !== "active") fail(`绑定节点非 active（${runner.name}——改档或重放置）`)
  if (!(await probeRunner(runner, { fetchImpl, config, requestImpl }))) fail(`绑定节点不可达（${runner.name} @ ${runner.address}）`)
}

// ── 放置（KD-SV-171）────────────────────────────────────────────────────────

/** 已绑工作区计数（放置判据——`sandbox_workspaces` 行派生；零新列）。 */
function bindingCounts(db) {
  const out = new Map()
  for (const row of db.prepare("SELECT runner_id, COUNT(*) AS n FROM sandbox_workspaces WHERE runner_id IS NOT NULL GROUP BY runner_id").all()) {
    out.set(row.runner_id, Number(row.n))
  }
  return out
}

/** 放置：候选 = `active` ∧ 在线（实时探活）∧ 已绑工作区数 < `maxBoxesPerRunner`；取已绑数最少（并列 ⇒ id 最小）。
 *  无候选 ⇒ `null`（保持未绑 + 明示「待人放」——**不降级**）。 */
export async function placeWorkspace(db, { fetchImpl = fetch, config = {}, requestImpl = null, settings = null } = {}) {
  const resolved = settings ?? getSettings(db)
  const rows = usableRunners(db)
  if (rows.length === 0) return null
  const counts = bindingCounts(db)
  const capacity = Number(resolved.maxBoxesPerRunner ?? DEFAULT_SETTINGS.maxBoxesPerRunner)
  const probed = await Promise.all(rows.map(async (row) => ({ row, online: await probeRunner(row, { fetchImpl, config, requestImpl }) })))
  const candidates = probed
    .filter((item) => item.online && (counts.get(item.row.id) ?? 0) < capacity)
    .map((item) => ({ row: item.row, bound: counts.get(item.row.id) ?? 0 }))
  if (candidates.length === 0) return null
  candidates.sort((a, b) => (a.bound - b.bound) || (a.row.id - b.row.id))
  return candidates[0].row
}

/** 未放置工作区补放置（KD-SV-171 触发③——节点登记成功后后台调用，**不阻断响应**；绑定为限——建盒链驱动 = `box.mjs`（同批另档））。
 *  出 = 已绑定工作区 id 列表；无候选 ⇒ 零动（行留未绑）。 */
export async function tryPlacePending(db, { fetchImpl = fetch, config = {}, requestImpl = null, settings = null } = {}) {
  const unbound = db.prepare("SELECT * FROM sandbox_workspaces WHERE runner_id IS NULL ORDER BY id").all()
  const placed = []
  for (const workspace of unbound) {
    const runner = await placeWorkspace(db, { fetchImpl, config, requestImpl, settings })
    if (!runner) continue
    db.prepare("UPDATE sandbox_workspaces SET runner_id = ? WHERE id = ?").run(runner.id, workspace.id)
    placed.push(workspace.id)
  }
  return placed
}

// ── 盒读数（读时读引擎——EXECUTION §3）──────────────────────────────────────

/** 工作区盒名（引擎面唯一名——幂等采用判据；§3）。 */
export function containerNameOf(workspaceId) {
  return `tc-ws-${Number(workspaceId)}`
}

/** 工作区盒读数（**读时读引擎**：`containers/json` 按名匹配；不在 ⇒ 「未建/stopped」）。出 = `{ boxState, stopReason, containerId, unreachable }`：
 *  `stopReason` = 服务器动作注记列（v22 增——引擎态零镜像；未迁库行 ⇒ `null`）∥
 *  `unreachable` = 引擎不可达/无客户端 ⇒ 「读数不可得」（`boxState` 按 `stopped` 呈现 + 该旗如实标，调用方自决明示）。 */
export async function boxStateOf(workspace, runner, { client = null } = {}) {
  const stopReason = workspace?.stop_reason ?? null
  const base = { boxState: "stopped", stopReason, containerId: null, unreachable: false }
  if (!runner) return base // 未绑定 ⇒ 「未建」（零外呼）
  if (client === null) return { ...base, unreachable: true }
  try {
    const res = await client.containers()
    const name = containerNameOf(workspace.id)
    const hit = (Array.isArray(res.json) ? res.json : []).find((item) => String(item?.Names?.[0] ?? "").replace(/^\//, "") === name)
    if (!hit) return base
    return { ...base, boxState: String(hit.State ?? "") === "running" ? "running" : "stopped", containerId: hit.Id ?? null }
  } catch {
    return { ...base, unreachable: true }
  }
}

/** 服务基址（盒内 env `OPENAI_BASE_URL`——config.host/port 组成；取值点单源 = 网段自动带入同址）。 */
export function sandboxPublicBase(config = {}) {
  const host = typeof config.host === "string" && config.host.trim() !== "" ? config.host.trim() : "127.0.0.1"
  const port = Number(config.port) > 0 ? Number(config.port) : 80
  const hostPart = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host
  return `http://${hostPart}:${port}/v1`
}

/**
 * 删节点链（SANDBOX §3 删除行 ∥ KD-SV-90 §12——**共享助手**：控制台删除路由与 chat 工具面两调用点单源）。
 * 步序：① 承载工作区确认（`confirm` 缺 ⇒ 400）⇒ ② 容器处置校验（`keep` ∥ `remove`）⇒ ③ 读时列容器（不可达 ⇒ 仅 `keep` 可过）
 * ⇒ ④ `remove` 逐删强删（任一失败 ⇒ 502 + 登记行保留）⇒ ⑤ 工作区解绑 + 删登记行 ⇒ ⑥ 弃置工作区续放置。
 * **审计写不随迁**（调用侧各留：控制台 = `sandbox_event`/`runner_delete` ∥ chat = 只 `chat_call` 行——KD-SV-91）。
 * 出 = `{ id, name, kept, removed }`（`fetchImpl`/`config`/`requestImpl` = Docker 传输注入面——单元测试档替身）。
 */
export async function deleteRunnerChain(db, runner, { containers = undefined, confirm = false } = {}, { fetchImpl = fetch, config = {}, requestImpl = null } = {}) {
  const bound = db.prepare("SELECT id, name FROM sandbox_workspaces WHERE runner_id = ? ORDER BY id").all(runner.id)
  if (bound.length > 0 && confirm !== true) {
    throw new HttpError(
      "invalid_request_error",
      `节点上仍有 ${bound.length} 个工作区（${bound.map((item) => item.name).join(" ∥ ")}）——先重建到新机，或确认丢弃 ⇒ confirm: true`,
    )
  }
  const disposition = containers
  if (disposition !== undefined && disposition !== "keep" && disposition !== "remove") {
    throw new HttpError("invalid_request_error", `containers 仅收 keep ∥ remove：${String(disposition)}`)
  }
  let listed = []
  let reachable = true
  try {
    const res = await clientForRunner(runner, { fetchImpl, config, requestImpl }).containers()
    listed = Array.isArray(res.json) ? res.json : []
  } catch {
    reachable = false
  }
  if (!reachable && disposition !== "keep") {
    throw new HttpError("upstream_error", `节点不可达——仅「保留」处置可过（连删需节点可达）：${runner.name}`)
  }
  if (reachable && listed.length > 0 && disposition === undefined) {
    throw new HttpError("invalid_request_error", `节点上承载 ${listed.length} 个容器——请选处置：containers: "keep"（容器原样留机）∥ "remove"（逐个强删）`)
  }
  let kept = 0
  let removed = 0
  if (disposition === "remove") {
    const failed = []
    for (const item of listed) {
      const id = item.Id
      const name = String(item.Names?.[0] ?? id).replace(/^\//, "")
      try {
        await clientForRunner(runner, { fetchImpl, config, requestImpl }).deleteContainer(id, { force: true })
        removed += 1
      } catch (e) {
        failed.push(`${name}（${e?.message ?? e}）`)
      }
    }
    if (failed.length > 0) {
      throw new HttpError(
        "upstream_error",
        `连删未净：已删 ${removed}/${listed.length}——失败清单：${failed.join(" ∥ ")}（登记行保留；修好后重试）`,
      )
    }
    kept = 0
  } else {
    kept = listed.length
  }
  db.prepare("UPDATE sandbox_workspaces SET runner_id = NULL WHERE runner_id = ?").run(runner.id)
  db.prepare("DELETE FROM sandbox_runners WHERE id = ?").run(runner.id)
  await tryPlacePending(db, { fetchImpl, config, requestImpl }) // 弃置工作区续跑（有在线节点即重放置）
  return { id: runner.id, name: runner.name, kept, removed }
}
