/**
 * box.mjs — 盒链（sandbox/EXECUTION.md §3/§4/§8 ∥ KD-SV-162…169）：
 * 建盒链（① 卷目录 → ② 配额 → ④ 镜像就位 → ⑤ 网络 → ⑥ 容器 → ⑦ 启动）∥
 * 启动确保链（①→②→⑤→④→⑥→⑦；容器缺 ⇒ 创建后再起，已在跑 ⇒ 幂等）∥ 六动作链（启动/停止/轮换/快照/恢复/销毁）∥
 * 三定时器（空闲 `last_active_at` ∥ 墙钟引擎 `StartedAt` ∥ 周期快照——tick 30s）∥ 放置（复用 `registry` 实时探活 ∥ 补放置）。
 *
 * 两腿：Docker API 直调（`docker.mjs` 客户端）∥ SSH 主机侧（`hosts.execOnHost`——sudo 口令经 stdin）。
 * **无队列**：动作 = 请求内幂等直调链，失败 ⇒ 停 + 行留 + 重试续链。
 * 卷 = 主机路径绑定 `<workspaceRoot>/<ws-id>`（KD-SV-162——与卷族并存不代管）；配额 = 主机侧项目配额（`quota.mjs`——不可用 ⇒ 建盒停）。
 * 载荷参数集（N65 逐值机检）= `Image`（底座派生 tag ⇒ 自定义底座 ∥ `settings.image`）∥ `Env` 四键 ∥ `WorkingDir /workspace` ∥
 * 不覆写 `Cmd`（镜像 CMD——§8 壳起）∥ `Binds <path>:/workspace` ∥ `ReadonlyRootfs` ∥ `Tmpfs` ∥ `CapDrop ALL` ∥
 * `NetworkMode tc-ws-<id>` ∥ `Memory`/`NanoCpus`/`PidsLimit`。
 * 注入口径（单元测试档假件）：`now` ∥ `fetchImpl`/`requestImpl`（Docker 传输）∥ `execImpl`（SSH spawn）∥ `host`（主机命令面全替）∥ `actor`。
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { gunzipSync, gzipSync } from "node:zlib"
import { join } from "node:path"
import { recordAudit } from "../accounts/audit.mjs"
import { dataDir } from "../store/credential-crypto.mjs"
import { customBaseOf, ensureDerivedImage } from "./derive.mjs"
import { clientForRunner } from "./docker.mjs"
import { execOnHost } from "./hosts.mjs"
import { applyDiskQuota, releaseLoopbackVolume } from "./quota.mjs"
import { authForImageRef } from "./registry-creds.mjs"
import { containerNameOf, getSettings, placeWorkspace, resolveLimits, sandboxPublicBase, tryPlacePending } from "./registry.mjs"
import { SSH_COMMAND_TIMEOUT_S } from "./ssh.mjs"

/** 建盒链步名（逐条可测——N65/B67）。 */
export const BOX_CHAIN_STEPS = Object.freeze(["① 卷目录准备", "② 配额就位", "④ 镜像就位", "⑤ 网络", "⑥ 容器", "⑦ 启动"])

/** tick 周期（§3——30s）。 */
export const TICK_INTERVAL_MS = 30_000

/** 快照 blob 子目录（数据目录下——容器重建不丢）。 */
export const CHECKPOINT_DIR = "sandbox-checkpoints"

/** 容器内工作区挂载点（§3）。 */
export const WORKSPACE_MOUNT = "/workspace"

/** 快照存档上限告警类（越上限 ⇒ 中止零行——KD-SV-167）。 */
export class BoxStepError extends Error {
  constructor(step, message) {
    super(`${step}失败：${message}`)
    this.name = "BoxStepError"
    this.step = step
  }
}

// ── 命名/路径/设置 ──────────────────────────────────────────────────────────

/** 工作区网络名（引擎面——按工作区一网）。 */
export function networkNameOf(workspaceId) {
  return `tc-ws-${Number(workspaceId)}`
}

/** 工作区卷路径（主机侧 = `<workspaceRoot>/<ws-id>`——KD-SV-162）。 */
export function workspacePathOf(settings, workspaceId) {
  const root = String(settings?.workspaceRoot ?? "").replace(/\/+$/, "")
  if (root === "") throw new BoxStepError("① 卷目录准备", "workspaceRoot 未设（节点侧工作区根路径——设置面补）")
  return `${root}/${Number(workspaceId)}`
}

/** 盒设置（全局默认 + 表内值；`workspaceRoot` 缺省常量——键归设置面）。 */
export function boxSettings(db) {
  return getSettings(db)
}

/** server 基址去 `/v1`（盒内 env `TC_SERVER_URL`——§3 参数集）。 */
export function serverBaseOf(config = {}) {
  return sandboxPublicBase(config).replace(/\/v1$/, "")
}

// ── 主机命令面（SSH——逐条；sudo 口令经 stdin）────────────────────────────────

/** 主机命令面：`call`（非零原样返回 ∥ 传输级失败抛）∥ `run`（非零 ⇒ 抛——盒链步用）∥ `execOf(row)`（`quota` 收的形）。 */
export function createHostExec({ config = {}, execImpl = null, now = Date.now } = {}) {
  const call = async (row, command, { stdin = null, timeoutS = SSH_COMMAND_TIMEOUT_S } = {}) => {
    const privileged = row?.sudo_cipher ? `sudo -S ${command}` : command // 提权口径：`sudo_cipher` 在 ⇒ `sudo -S `（口令经 stdin）
    const out = await execOnHost(row, { command: privileged, timeoutS, stdin }, { config, execImpl, now })
    return { exitCode: out.exitCode, stdout: out.stdout, stderr: out.stderr }
  }
  const run = async (row, command, opts = {}) => {
    const out = await call(row, command, opts)
    if (out.exitCode !== 0) {
      const tail = `${out.stderr ?? ""}${out.stdout ?? ""}`.trim().slice(-200)
      throw new Error(`主机命令非零退出（exit=${out.exitCode}）：${tail || "(无输出)"}`)
    }
    return out
  }
  return { call, run, execOf: (row) => (command, opts = {}) => call(row, command, opts) }
}

// ── 载体（客户端/依赖归一）──────────────────────────────────────────────────

function clientOf(runner, deps) {
  const factory = deps.clientForRunner ?? clientForRunner
  return factory(runner, { fetchImpl: deps.fetchImpl ?? fetch, config: deps.config ?? {}, requestImpl: deps.requestImpl ?? null })
}

function hostOf(deps) {
  return deps.host ?? createHostExec({ config: deps.config ?? {}, execImpl: deps.execImpl ?? null, now: deps.now ?? Date.now })
}

/** 步包装（未命名错误 ⇒ 归入步名；已知 `BoxStepError` 原样透传）。 */
async function step(name, fn) {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof BoxStepError) throw e
    throw new BoxStepError(name, e?.message ?? String(e))
  }
}

/** 审计（链级——`sandbox_event` + kind；actor 缺省 `system`）。 */
function auditBox(db, deps, { kind, target, detail, ts }) {
  recordAudit(db, {
    type: "sandbox_event",
    actor: deps.actor?.name ?? "system",
    actorId: deps.actor?.id ?? null,
    target,
    detail: { kind, ...detail },
    ts,
  })
}

// ── 载荷（N65 参数集逐值）────────────────────────────────────────────────────

/** 建盒载荷（§3 参数集；`imageTag` = ④ 派生 tag ⇒ 自定义底座 ∥ 缺省 `settings.image`）。 */
export function buildBoxPayload(db, workspace, { settings = null, config = {}, imageTag = null, path = null } = {}) {
  const resolved = settings ?? boxSettings(db)
  const limits = resolveLimits(db, workspace, resolved)
  const volumePath = path ?? workspacePathOf(resolved, workspace.id)
  const hostConfig = {
    Binds: [`${volumePath}:${WORKSPACE_MOUNT}`],
    ReadonlyRootfs: true, // 唯卷可写（§3）
    Tmpfs: { "/tmp": `size=${Number(resolved.tmpfsMb)}m` },
    CapDrop: ["ALL"],
    NetworkMode: networkNameOf(workspace.id),
    Memory: Number(limits.memMb) * 1024 * 1024,
    NanoCpus: Number(limits.cpus) * 1e9,
    PidsLimit: Number(limits.pids),
  }
  return {
    Image: imageTag ?? customBaseOf(workspace) ?? resolved.image,
    Env: [
      `OPENAI_BASE_URL=${sandboxPublicBase(config)}`,
      `OPENAI_API_KEY=${workspace.key_plain}`,
      `TC_SERVER_URL=${serverBaseOf(config)}`,
      `HOME=${WORKSPACE_MOUNT}/home`,
    ],
    WorkingDir: WORKSPACE_MOUNT,
    HostConfig: hostConfig,
  }
}

// ── 引擎面小助手 ────────────────────────────────────────────────────────────

/** 容器读回（按名——幂等采用判据；引擎不可达 ⇒ 抛 `⑥ 容器` 步错）。 */
async function findContainer(client, name) {
  try {
    const res = await client.containers()
    const list = Array.isArray(res?.json) ? res.json : []
    return list.find((item) => String(item?.Names?.[0] ?? "").replace(/^\//, "") === name) ?? null
  } catch (e) {
    throw new BoxStepError("⑥ 容器", `引擎读回失败：${e?.apiMessage ?? e?.message ?? e}`)
  }
}

async function inspectNetworkOrNull(client, name) {
  try {
    return await client.inspectNetwork(name)
  } catch (e) {
    if (e?.status === 404) return null
    throw e
  }
}

/** ⑤ 网络（幂等：409 ⇒ 读回采用）。 */
async function stepNetwork(client, workspace) {
  const name = networkNameOf(workspace.id)
  const existing = await inspectNetworkOrNull(client, name)
  if (existing !== null) return { created: false }
  try {
    await client.createNetwork({ Name: name, Driver: "bridge" })
  } catch (e) {
    if (e?.status !== 409) throw new BoxStepError("⑤ 网络", `网络创建失败：${e?.apiMessage ?? e?.message ?? e}`)
  }
  const read = await inspectNetworkOrNull(client, name) // 409 ⇒ 读回采用；成功径 ⇒ 读回确认
  if (read === null) throw new BoxStepError("⑤ 网络", `网络创建后读回不到：${name}`)
  return { created: true }
}

/** ⑥ 容器（幂等：在场 ⇒ 采用；名冲突 409 ⇒ 读回采用；创建前先读 ⇒ 零重复建）。 */
async function stepContainer(client, workspace, payload) {
  const name = containerNameOf(workspace.id)
  const existing = await findContainer(client, name)
  if (existing !== null) return { created: false, Id: existing.Id ?? null }
  try {
    const res = await client.createContainer(name, payload)
    return { created: true, Id: res?.json?.Id ?? null }
  } catch (e) {
    if (e?.status === 409) {
      const adopted = await findContainer(client, name)
      if (adopted !== null) return { created: false, Id: adopted.Id ?? null }
      throw new BoxStepError("⑥ 容器", `容器名冲突且读回无果：${name}`)
    }
    throw new BoxStepError("⑥ 容器", `容器创建失败：${e?.apiMessage ?? e?.message ?? e}`)
  }
}

/** ④ 镜像就位（仅自定义底座触——缺省腿零新增调用 ∥ 零新审计行；返回容器该用的镜像引用）。 */
async function stepImage(db, workspace, runner, client, settings, deps) {
  const baseRef = customBaseOf(workspace)
  if (baseRef === null) return settings.image
  const derived = await ensureDerivedImage(client, {
    baseRef,
    standardImage: settings.image,
    registryAuth: authForImageRef(db, baseRef, { config: deps.config ?? {} }),
    audit: { db, actor: deps.actor?.name ?? "system", actorId: deps.actor?.id ?? null, runnerId: runner.id, workspaceId: workspace.id, target: baseRef },
    now: deps.now ?? Date.now,
  })
  return derived.tag
}

/** ② 配额就位（主机侧项目配额——不可用 ⇒ 抛（建盒停）；配额失败审计 `quota_apply_failed`（KD-SV-163）；
 *  自愈留痕 `quota_recovered`（KD-SV-200——绑定物理动作：**两径皆落**——成功返回携 `recovery` ∥ 重建/重接/降级后下游失败由错误携 `err.recovery`）。 */
async function stepQuota(db, deps, runner, workspace, host, path, limits) {
  const trace = (recovery) =>
    auditBox(db, deps, {
      kind: "quota_recovered",
      target: workspace.name,
      detail: { workspaceId: workspace.id, runnerId: runner.id, recovery, path },
      ts: (deps.now ?? Date.now)(),
    })
  let applied
  try {
    applied = await applyDiskQuota({ exec: host.execOf(runner), workspaceId: workspace.id, path, diskMb: limits.diskMb })
  } catch (e) {
    if (e?.recovery !== undefined && e?.recovery !== null) trace(e.recovery) // 卷已重建/重接 ⇒ 不因后续失败丢痕
    auditBox(db, deps, { kind: "quota_apply_failed", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner.id, reason: String(e?.message ?? e).slice(0, 300) }, ts: (deps.now ?? Date.now)() })
    throw e
  }
  if (applied?.recovery !== undefined && applied?.recovery !== null) trace(applied.recovery)
  return applied
}

/** 盒态批量读（按节点 `containers()` 一次——工作区列表面用；引擎不可达 ⇒ 逐行 `unreachable`）。 */
export async function readBoxStatesOf(db, workspaces, deps = {}) {
  const out = new Map()
  const byRunner = new Map()
  for (const workspace of workspaces) {
    if (workspace.runner_id === null || workspace.runner_id === undefined) {
      out.set(workspace.id, { boxState: "stopped", stopReason: workspace.stop_reason ?? null, containerId: null, unreachable: false, bound: false })
      continue
    }
    if (!byRunner.has(workspace.runner_id)) {
      const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
      let list = null
      if (runner) {
        try {
          const res = await clientOf(runner, deps).containers()
          list = Array.isArray(res?.json) ? res.json : []
        } catch {
          list = null
        }
      }
      byRunner.set(workspace.runner_id, { runner, list })
    }
    const { runner, list } = byRunner.get(workspace.runner_id)
    const base = { boxState: "stopped", stopReason: workspace.stop_reason ?? null, containerId: null, unreachable: false, bound: runner !== undefined && runner !== null }
    if (runner === undefined || runner === null || list === null) {
      out.set(workspace.id, { ...base, unreachable: true })
      continue
    }
    const hit = list.find((item) => String(item?.Names?.[0] ?? "").replace(/^\//, "") === containerNameOf(workspace.id))
    out.set(workspace.id, hit === undefined ? base : { ...base, boxState: String(hit.State ?? "") === "running" ? "running" : "stopped", containerId: hit.Id ?? null })
  }
  return out
}

/** ① 卷目录准备（`mkdir -p` ∥ `chown 1000:1000` 两条——§3；逐条可测）。 */
async function stepVolume(host, runner, path) {
  await host.run(runner, `mkdir -p ${path}`)
  await host.run(runner, `chown 1000:1000 ${path}`)
}

// ── 建盒链（①→⑦）───────────────────────────────────────────────────────────

/**
 * 建盒全链（N65）：① 卷目录 → ② 配额 → ④ 镜像就位（仅自定义底座）→ ⑤ 网络 → ⑥ 容器 → ⑦ 启动。
 * 任一步失败 ⇒ 抛 `BoxStepError`（步名 + 人话）——**零半态**：已落步幂等可重试（行留）。
 * **步级失败审计（#1397）**：`BoxStepError ∧ step ≠ ②`（② 配额步 = 专用 kind `quota_apply_failed`——**不叠通用行**）
 * ⇒ 行 `sandbox_event/box_step_failed`（`detail = { kind, workspaceId, runnerId, step, reason（截 300） }`）；
 * 含 ① 前置形错（`workspacePathOf` 抛在链前——同链级 catch 内）；抛出的错误原样透传（响应人话不变）。
 */
export async function createWorkspaceBox(db, workspace, runner, deps = {}) {
  try {
    return await createBoxChain(db, workspace, runner, deps)
  } catch (e) {
    if (e instanceof BoxStepError && e.step !== "② 配额就位") {
      auditBox(db, deps, {
        kind: "box_step_failed",
        target: workspace.name,
        detail: { workspaceId: workspace.id, runnerId: runner.id, step: e.step, reason: String(e?.message ?? e).slice(0, 300) },
        ts: (deps.now ?? Date.now)(),
      })
    }
    throw e
  }
}

/** 建盒链本体（①→⑦）——失败审计归 `createWorkspaceBox` 链级 catch（#1397）。 */
async function createBoxChain(db, workspace, runner, deps = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const path = workspacePathOf(settings, workspace.id)
  const host = hostOf(deps)
  const client = clientOf(runner, deps)
  const limits = resolveLimits(db, workspace, settings)

  await step("① 卷目录准备", () => stepVolume(host, runner, path))
  await step("② 配额就位", () => stepQuota(db, deps, runner, workspace, host, path, limits))
  const image = await step("④ 镜像就位", () => stepImage(db, workspace, runner, client, settings, deps))
  await step("⑤ 网络", () => stepNetwork(client, workspace))
  const container = await step("⑥ 容器", () => stepContainer(client, workspace, buildBoxPayload(db, workspace, { settings, config: deps.config ?? {}, imageTag: image, path })))
  await step("⑦ 启动", () => client.startContainer(container.Id ?? containerNameOf(workspace.id)))
  db.prepare("UPDATE sandbox_workspaces SET stop_reason = NULL WHERE id = ?").run(workspace.id)
  auditBox(db, deps, { kind: "workspace_create", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner.id, path, image }, ts: now() })
  return { workspaceId: workspace.id, runnerId: runner.id, path, image }
}

/** 启动确保链（①→②→⑤→④→⑥→⑦；容器缺 ⇒ 创建后再起 ∥ 已在跑 ⇒ 幂等返回）。 */
export async function startWorkspaceBox(db, workspace, runner, deps = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const path = workspacePathOf(settings, workspace.id)
  const host = hostOf(deps)
  const client = clientOf(runner, deps)
  const limits = resolveLimits(db, workspace, settings)
  const name = containerNameOf(workspace.id)

  const existing = await findContainer(client, name)
  if (existing !== null) {
    const state = await client.containerState(existing.Id)
    if (state?.state?.running === true) return { started: true, noop: true } // 已在跑 ⇒ 幂等
  }
  await step("① 卷目录准备", () => stepVolume(host, runner, path))
  await step("② 配额就位", () => stepQuota(db, deps, runner, workspace, host, path, limits))
  await step("⑤ 网络", () => stepNetwork(client, workspace))
  // 建盒径的 ④（缓存命中零构建）——`base_image` 在场时容器须用派生 tag（`settings.image` = 供体）
  const image = await step("④ 镜像就位", () => stepImage(db, workspace, runner, client, settings, deps))
  const container = await step("⑥ 容器", () => stepContainer(client, workspace, buildBoxPayload(db, workspace, { settings, config: deps.config ?? {}, imageTag: image, path })))
  await step("⑦ 启动", () => client.startContainer(container.Id ?? name))
  db.prepare("UPDATE sandbox_workspaces SET stop_reason = NULL WHERE id = ?").run(workspace.id)
  auditBox(db, deps, { kind: "box_start", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner.id, image }, ts: now() })
  return { started: true, noop: false }
}

/** 停止（幂等：未建 ∥ 已停 ⇒ 无操作；停因注记 = `stop_reason`；**卷零触**）。 */
export async function stopWorkspaceBox(db, workspace, runner, deps = {}, { reason = "manual" } = {}) {
  const now = deps.now ?? Date.now
  const client = clientOf(runner, deps)
  const name = containerNameOf(workspace.id)
  const hit = await findContainer(client, name)
  let stopped = false
  if (hit !== null) {
    const state = await client.containerState(hit.Id)
    if (state?.state?.running !== false) {
      await client.stopContainer(hit.Id)
      stopped = true
    }
  }
  db.prepare("UPDATE sandbox_workspaces SET stop_reason = ? WHERE id = ?").run(reason, workspace.id)
  auditBox(db, deps, { kind: "box_stop", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner.id, stopReason: reason, stopped }, ts: now() })
  return { stopped, reason }
}

/** 轮换重建（删容器 → ①→② → ④(缓存) → ⑥ → ⑦；网络既有 ⇒ 不复建）。 */
export async function rotateWorkspaceBox(db, workspace, runner, deps = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const path = workspacePathOf(settings, workspace.id)
  const host = hostOf(deps)
  const client = clientOf(runner, deps)
  const limits = resolveLimits(db, workspace, settings)
  const name = containerNameOf(workspace.id)

  const hit = await findContainer(client, name)
  if (hit !== null) await client.deleteContainer(hit.Id, { force: true }) // 删容器 = 卷零触（卷 = 主机路径）
  await step("① 卷目录准备", () => stepVolume(host, runner, path))
  await step("② 配额就位", () => stepQuota(db, deps, runner, workspace, host, path, limits))
  const image = await step("④ 镜像就位", () => stepImage(db, workspace, runner, client, settings, deps))
  const container = await step("⑥ 容器", () => stepContainer(client, workspace, buildBoxPayload(db, workspace, { settings, config: deps.config ?? {}, imageTag: image, path })))
  await step("⑦ 启动", () => client.startContainer(container.Id ?? name))
  auditBox(db, deps, { kind: "box_start", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner.id, image, rotate: true }, ts: now() })
  return { rotated: true, image }
}

/** 存档字节取（`requestBytes` 出 `{ status, buffer }` ⇒ 直取；流形 ⇒ 逐块收）。 */
export async function readArchiveBytes(res) {
  if (Buffer.isBuffer(res)) return res
  if (Buffer.isBuffer(res?.buffer)) return res.buffer
  if (res?.stream !== undefined && res.stream !== null && typeof res.stream[Symbol.asyncIterator] === "function") {
    const chunks = []
    for await (const chunk of res.stream) chunks.push(Buffer.from(chunk))
    return Buffer.concat(chunks)
  }
  throw new Error("存档读数不成形（`buffer` ∥ 异步流皆缺）")
}

/** 快照保留裁剪（保留 = `checkpointKeep` 份；越份 ⇒ 删最旧行 + blob）。 */
function pruneCheckpoints(db, workspaceId, keep) {
  const rows = db.prepare("SELECT * FROM sandbox_checkpoints WHERE workspace_id = ? ORDER BY id DESC").all(Number(workspaceId))
  const removed = []
  for (const row of rows.slice(Math.max(0, Number(keep)))) {
    try {
      rmSync(row.blob_path, { force: true })
    } catch {
      /* blob 已不在——行照删（读数面收口） */
    }
    db.prepare("DELETE FROM sandbox_checkpoints WHERE id = ?").run(row.id)
    removed.push(row.id)
  }
  return removed
}

/** 快照（全量 `archive get` ⇒ gzip 落 `data/sandbox-checkpoints/` ⇒ 行落；越 `diskMb` 上限 ⇒ 中止零行；容器不在 ⇒ 跳过）。 */
export async function snapshotWorkspace(db, workspace, runner, deps = {}, { note = "" } = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const client = clientOf(runner, deps)
  const limits = resolveLimits(db, workspace, settings)
  const name = containerNameOf(workspace.id)
  const hit = deps.containerId ? { Id: deps.containerId } : await findContainer(client, name)
  if (hit === null) return { skipped: true, reason: "容器不在（快照 = 引擎存档——盒不在 ⇒ 零拍）" }
  let tar
  try {
    tar = await readArchiveBytes(await client.archiveGet(hit.Id, WORKSPACE_MOUNT))
  } catch (e) {
    throw new BoxStepError("快照", `存档取件失败：${e?.apiMessage ?? e?.message ?? e}`)
  }
  const gz = gzipSync(tar)
  const limitBytes = Number(limits.diskMb) * 1024 * 1024
  if (gz.length > limitBytes) {
    auditBox(db, deps, {
      kind: "checkpoint_fail",
      target: workspace.name,
      detail: { workspaceId: workspace.id, size: gz.length, limitBytes, reason: "越工作区 diskMb 配额上限" },
      ts: now(),
    })
    return { skipped: true, reason: `存档 ${(gz.length / 1048576).toFixed(1)} MiB 越工作区 diskMb 上限（${limits.diskMb} MiB）——中止零行` }
  }
  const dir = join(dataDir(deps.config ?? {}), CHECKPOINT_DIR)
  mkdirSync(dir, { recursive: true })
  const stamp = new Date(now()).toISOString().replace(/[:.]/g, "-")
  const blobPath = join(dir, `${workspace.id}-${stamp}.tar.gz`)
  writeFileSync(blobPath, gz)
  const info = db
    .prepare("INSERT INTO sandbox_checkpoints (workspace_id, created_at, size, blob_path, note) VALUES (?, ?, ?, ?, ?)")
    .run(workspace.id, new Date(now()).toISOString(), gz.length, blobPath, String(note ?? ""))
  const checkpointId = Number(info.lastInsertRowid)
  const pruned = pruneCheckpoints(db, workspace.id, settings.checkpointKeep)
  auditBox(db, deps, { kind: "checkpoint", target: workspace.name, detail: { workspaceId: workspace.id, checkpointId, size: gz.length, pruned }, ts: now() })
  return { checkpointId, size: gz.length, path: blobPath, pruned }
}

/** 恢复（① 停 → ② 清卷 → ③ 解包（`archive put`；引擎拒 ⇒ SSH `tar xzf -` 备径）→ ④ 启动）。 */
export async function restoreWorkspace(db, workspace, runner, checkpoint, deps = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const path = workspacePathOf(settings, workspace.id)
  const host = hostOf(deps)
  const client = clientOf(runner, deps)
  const name = containerNameOf(workspace.id)
  if (checkpoint === null || checkpoint === undefined) throw new BoxStepError("恢复", "快照不存在（先拍快照，或换一份）")
  let blob
  try {
    blob = gunzipSync(readFileSync(checkpoint.blob_path))
  } catch (e) {
    throw new BoxStepError("恢复", `快照档读取/解压失败（${checkpoint.blob_path}）：${e?.message ?? e}`)
  }
  // ① 停（幂等）
  const hit = await findContainer(client, name)
  if (hit !== null) {
    const state = await client.containerState(hit.Id)
    if (state?.state?.running !== false) await client.stopContainer(hit.Id)
  }
  // ② 清卷（主机侧——卷 = 主机路径，容器停 ⇒ 目录可清）
  await step("② 清卷", () => host.run(runner, `rm -rf ${path}/*`))
  // ③ 解包：容器缺 ⇒ 先建（载荷同建盒）；`archive put` 拒 ⇒ SSH 备径（`tar xzf -`，stdin = 存档字节）
  let containerId = hit?.Id ?? null
  if (containerId === null) {
    const image = await step("④ 镜像就位", () => stepImage(db, workspace, runner, client, settings, deps))
    const created = await step("⑥ 容器", () => stepContainer(client, workspace, buildBoxPayload(db, workspace, { settings, config: deps.config ?? {}, imageTag: image, path })))
    containerId = created.Id
  }
  let mechanism = "archive"
  try {
    await client.archivePut(containerId, WORKSPACE_MOUNT, blob)
  } catch (e) {
    mechanism = "ssh"
    try {
      await host.run(runner, `tar xzf - -C ${path}`, { stdin: blob })
    } catch (fallbackError) {
      throw new BoxStepError("③ 解包", `两径皆败——引擎：${e?.apiMessage ?? e?.message ?? e} ∥ SSH 备径：${fallbackError?.message ?? fallbackError}`)
    }
  }
  // ④ 启动
  await step("⑦ 启动", () => client.startContainer(containerId))
  await host.run(runner, `chown -R 1000:1000 ${path}`).catch(() => {}) // 解包属主收口（尽力而为——失败不改链终态）
  db.prepare("UPDATE sandbox_workspaces SET stop_reason = NULL WHERE id = ?").run(workspace.id)
  auditBox(db, deps, { kind: "box_start", target: workspace.name, detail: { workspaceId: workspace.id, checkpointId: checkpoint.id, mechanism, restored: true }, ts: now() })
  return { restored: true, mechanism, checkpointId: checkpoint.id }
}

/** 销毁（① 停 ② 删容器 ③ 删网络 ④ 卷目录清理 ⑤ 行删：快照行 + blob）。`deleteVolume` = 路由显式确认项。 */
export async function destroyWorkspaceBox(db, workspace, runner, deps = {}, { deleteVolume = true } = {}) {
  const now = deps.now ?? Date.now
  const settings = deps.settings ?? boxSettings(db)
  const client = runner === null ? null : clientOf(runner, deps)
  const name = containerNameOf(workspace.id)
  if (client !== null) {
    const hit = await findContainer(client, name)
    if (hit !== null) {
      const state = await client.containerState(hit.Id).catch(() => null)
      if (state?.state?.running !== false) await client.stopContainer(hit.Id).catch(() => {})
      await client.deleteContainer(hit.Id, { force: true })
    }
    const network = await inspectNetworkOrNull(client, networkNameOf(workspace.id)).catch(() => null)
    if (network !== null) await client.deleteNetwork(networkNameOf(workspace.id)).catch(() => {})
  }
  if (deleteVolume && runner !== null) {
    const path = workspacePathOf(settings, workspace.id)
    const host = hostOf(deps)
    // loopback 备径余项（KD-SV-199）：卸挂载（未挂 ⇒ 零动作、不抛）+ detach loop（back-file 属本工作区者——外来 ∥ 他工作区零动）
    // ⇒ 删目录与镜像；失败 ⇒ 抛（停 + 行留 + 重试续链——静默失败即残留成因）
    await releaseLoopbackVolume({ exec: host.execOf(runner), path })
    await host.run(runner, `rm -rf ${path} ${path}.loop.img`)
  }
  const snapshots = db.prepare("SELECT blob_path FROM sandbox_checkpoints WHERE workspace_id = ?").all(workspace.id)
  for (const row of snapshots) {
    try {
      rmSync(row.blob_path, { force: true })
    } catch {
      /* blob 已不在 */
    }
  }
  db.prepare("DELETE FROM sandbox_checkpoints WHERE workspace_id = ?").run(workspace.id)
  db.prepare("DELETE FROM sandbox_workspaces WHERE id = ?").run(workspace.id)
  auditBox(db, deps, { kind: "workspace_destroy", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner?.id ?? null, volumeDeleted: deleteVolume, snapshots: snapshots.length }, ts: now() })
  auditBox(db, deps, { kind: "box_destroy", target: workspace.name, detail: { workspaceId: workspace.id, runnerId: runner?.id ?? null, volumeDeleted: deleteVolume }, ts: now() })
  return { destroyed: true, deleteVolume, snapshots: snapshots.length }
}

// ── 定时器（tick 30s——N69）─────────────────────────────────────────────────

/** 空闲判据取数（派生读两源：`usage` 键索引 ∥ 审计动作行 `detail.workspaceId`——零新列；无读数 ⇒ null）。 */
export function lastActiveAtOf(db, workspace) {
  const usage = Number(db.prepare("SELECT MAX(ts) AS ts FROM usage WHERE key_id = ?").get(Number(workspace.key_id))?.ts ?? NaN)
  const audit = Number(
    db.prepare("SELECT MAX(ts) AS ts FROM audit_events WHERE type = 'sandbox_event' AND json_extract(detail, '$.workspaceId') = ?").get(Number(workspace.id))?.ts ?? NaN,
  )
  const values = [usage, audit].filter((value) => Number.isFinite(value))
  return values.length === 0 ? null : Math.max(...values)
}

/** tick 一轮：逐绑定工作区读盒态 ⇒ 空闲停 ∥ 墙钟停 ∥ 周期快照（盒不在 ⇒ 零动；逐节点失败不吞——记读数）。 */
export async function tickBoxes(db, deps = {}) {
  const now = (deps.now ?? Date.now)()
  const settings = deps.settings ?? boxSettings(db)
  const out = { checked: 0, skipped: 0, stopped: [], snapshotted: [], failed: [] }
  const rows = db.prepare("SELECT * FROM sandbox_workspaces WHERE runner_id IS NOT NULL ORDER BY id").all()
  const clients = new Map()
  for (const workspace of rows) {
    const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
    if (!runner) continue
    out.checked += 1
    try {
      if (!clients.has(runner.id)) clients.set(runner.id, clientOf(runner, deps))
      const client = clients.get(runner.id)
      const hit = await findContainer(client, containerNameOf(workspace.id))
      if (hit === null) {
        out.skipped += 1
        continue
      }
      const state = await client.containerState(hit.Id)
      if (state?.state?.running !== true) {
        out.skipped += 1
        continue
      }
      const limits = resolveLimits(db, workspace, settings)
      // ① 空闲（`last_active_at` = 派生读两源）
      const lastActive = lastActiveAtOf(db, workspace)
      if (lastActive !== null && now - lastActive >= Number(limits.idleTtlMinutes) * 60_000) {
        await stopWorkspaceBox(db, workspace, runner, { ...deps, now: () => now }, { reason: "idle_ttl" })
        out.stopped.push({ workspaceId: workspace.id, reason: "idle_ttl" })
        continue
      }
      // ② 墙钟（引擎 `StartedAt`）
      const startedAt = Date.parse(state.state.startedAt ?? "")
      if (Number.isFinite(startedAt) && now - startedAt >= Number(limits.wallclockTtlHours) * 3_600_000) {
        await stopWorkspaceBox(db, workspace, runner, { ...deps, now: () => now }, { reason: "wallclock_ttl" })
        out.stopped.push({ workspaceId: workspace.id, reason: "wallclock_ttl" })
        continue
      }
      // ③ 周期快照（最新 checkpoint ∥ `StartedAt` 起算）
      const last = db.prepare("SELECT created_at FROM sandbox_checkpoints WHERE workspace_id = ? ORDER BY id DESC LIMIT 1").get(workspace.id)
      const anchor = last ? Date.parse(last.created_at) : startedAt
      if (Number.isFinite(anchor) && now - anchor >= Number(settings.checkpointEveryMinutes) * 60_000) {
        const result = await snapshotWorkspace(db, workspace, runner, { ...deps, now: () => now, containerId: hit.Id }, { note: "周期快照" })
        out.snapshotted.push({ workspaceId: workspace.id, ...result })
      }
    } catch (e) {
      out.failed.push({ workspaceId: workspace.id, message: e?.message ?? String(e) })
      deps.log?.warn?.("box_tick_failed", { workspaceId: workspace.id, message: e?.message ?? String(e) })
    }
  }
  return out
}

// ── 放置（N70/B68——复用 `registry` 实时探活与补放置）────────────────────────

/** 放置（§3）：在线 active 中最少绑定者 + `maxBoxesPerRunner`；无候选 ⇒ null（留未绑 + 「待人放」）。 */
export async function selectRunnerForWorkspace(db, deps = {}) {
  return placeWorkspace(db, { fetchImpl: deps.fetchImpl ?? fetch, config: deps.config ?? {}, requestImpl: deps.requestImpl ?? null })
}

/** 补放置（登记成功 / tick 面）——返回 `{ placed, boxed }`（建盒链驱动 = 本档 `createWorkspaceBox`；建盒失败 ⇒ 逐工作区审计 `placement_failed` + 行留（绑定保留））。 */
export async function placePendingWorkspaces(db, deps = {}) {
  const placed = await tryPlacePending(db, { fetchImpl: deps.fetchImpl ?? fetch, config: deps.config ?? {}, requestImpl: deps.requestImpl ?? null })
  const boxed = []
  for (const workspaceId of placed) {
    const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspaceId)
    if (!workspace || workspace.runner_id === null) continue // 行已删/未绑定 ⇒ 跳过（取数在前——不靠 null 传播）
    const runner = db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
    if (!runner) continue
    try {
      await createWorkspaceBox(db, workspace, runner, deps)
      boxed.push(workspaceId)
    } catch (e) {
      // 补放置失败 ⇒ 审计 `placement_failed`（逐工作区一条；行留——绑定保留，与创建面同构；ACCOUNTS §2.1）
      auditBox(db, deps, {
        kind: "placement_failed",
        target: workspace.name,
        detail: { workspaceId: workspace.id, runnerId: runner.id, reason: String(e?.message ?? e).slice(0, 300) },
        ts: (deps.now ?? Date.now)(),
      })
      deps.log?.warn?.("box_place_create_failed", { workspaceId, message: e?.message ?? String(e) })
    }
  }
  return { placed, boxed }
}
