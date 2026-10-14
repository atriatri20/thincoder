/**
 * workspace-routes.mjs — 工作区面（sandbox/EXECUTION.md §3/§7/§8 ∥ gateway/API.md §2.5；自 `routes.mjs` 拆出——sandbox-exec-rebuild 批）：
 * 列表 ∥ 创建（**写门实时化** + 放置 + 绑定 + key 签发 + 建盒链直调）∥ PATCH（资源覆写 + 底座绑定 `baseImage`）∥
 * 派生构建（`…/derive`——底座可换增补）∥ 快照列表 ∥ 动作（`start` ∥ `stop` ∥ `destroy` ∥ `rotate-key` ∥ `restore`——**请求内幂等直调链**，无队列）。
 *
 * 读时读引擎（`box.mjs` `readBoxStatesOf`——按节点 `containers()` 一次批量）；未绑工作区动作 ⇒ 503（人话两因分列——
 * 因一「先放置」= 无非候选但行未绑 ∥ 因二「待人放」= 无候选）；链失败 ⇒ 502 + **行留**（重试续链，幂等）。
 * 全链机制 = `sandbox/EXECUTION.md` §3；审计 kind 全集 = `accounts/ACCOUNTS.md` §2.1。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { findMemberById } from "../accounts/members.mjs"
import { getKeyById } from "../accounts/keys.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import {
  WORKSPACE_NAME_MAX, getSettings, mergeLimits, placeWorkspace, requireRunnerAvailable, requireSandboxAvailable, resolveLimits, runnerRowOr404,
} from "./registry.mjs"
import { clientForRunner, parseImageRef } from "./docker.mjs"
import { customBaseOf, deriveFailure, ensureDerivedImage } from "./derive.mjs"
import { issueWorkspaceKey, revokeWorkspaceKey, rotateWorkspaceKey } from "./credentials.mjs"
import { authForImageRef } from "./registry-creds.mjs"
import {
  createWorkspaceBox, destroyWorkspaceBox, readBoxStatesOf, restoreWorkspace, rotateWorkspaceBox, startWorkspaceBox, stopWorkspaceBox,
} from "./box.mjs"

/** 动作集（§2.5 动作行——无队列：五动作 = 请求内直调链）。 */
export const WORKSPACE_ACTIONS = Object.freeze(["start", "stop", "destroy", "rotate-key", "restore"])

/** 工作区名校验（trim；唯一性在写前由 SQLite UNIQUE 兜——400 报文）。 */
function normalizeWorkspaceName(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("工作区名不可为空")
  if (name.length > WORKSPACE_NAME_MAX) throw new Error(`工作区名超长（≤ ${WORKSPACE_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 底座引用归一（§2.5——形 `名[:标签]`，缺标签补 `latest`；空 ∥ 含 `@` ∥ 超长 ⇒ 400）。出 = `名:标签` ∥ null（恢复标准）。 */
export function normalizeBaseImage(raw) {
  if (raw === null || raw === undefined) return null
  const parsed = parseImageRef(raw) // 形非法 ⇒ 抛（调用侧转 400——库零变）
  return `${parsed.image}:${parsed.tag}`
}

function workspaceRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `工作区不存在：${id}`)
  return row
}

function checkpointCount(db, workspaceId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints WHERE workspace_id = ?").get(Number(workspaceId)).n)
}

/** 工作区行读数（§2.5 列表行——密文零下发：key 只出 `keyHint`；底座 `baseImage` 原样（归一引用 ∥ null = 标准））。 */
export function workspaceView(db, workspace, box, { now = Date.now } = {}) {
  const runner = workspace.runner_id === null ? null : db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
  const owner = findMemberById(db, workspace.owner_member_id)
  const key = getKeyById(db, workspace.key_id)
  let pending = null
  const open = db
    .prepare("SELECT * FROM sandbox_pending WHERE workspace_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1")
    .get(Number(workspace.id))
  if (open) pending = { host: open.host, since: open.first_seen_at }
  return {
    id: workspace.id,
    name: workspace.name,
    ownerMemberId: workspace.owner_member_id,
    ownerName: owner?.name ?? null,
    runnerId: workspace.runner_id,
    runnerName: runner?.name ?? null,
    runnerStatus: runner?.status ?? null,
    boxState: box?.boxState ?? "stopped",
    stopReason: workspace.stop_reason ?? box?.stopReason ?? null,
    checkpointCount: checkpointCount(db, workspace.id),
    pending,
    keyHint: key?.key_hint ?? null,
    keyStatus: key?.status ?? null,
    baseImage: workspace.base_image ?? null,
    limits: JSON.parse(workspace.limits_json || "{}"),
    limitsResolved: resolveLimits(db, workspace, getSettings(db)),
    createdAt: workspace.created_at,
    now,
  }
}

/** 注册工作区面（§2.5 六端点）。注入口径 = `routes.mjs` 同拍（`now`/`fetchImpl`/`requestImpl`/`config`/`deps`）。 */
export function registerWorkspaceRoutes(routes, { db, config = {}, log = null, now = Date.now, fetchImpl = fetch, requestImpl = null, deps = {} } = {}) {
  if (!db) throw new Error("registerWorkspaceRoutes：缺少 db")
  const boxDeps = { db, config, log, now, fetchImpl, requestImpl, dnsGate: deps.dnsGate ?? null, ...deps }

  // ── ① 列表（读时读引擎——按节点批量；零审计）────────────────────────────────
  routes.add("GET", "/api/admin/sandbox/workspaces", async (req, res) => {
    requireAdmin(db, req)
    const rows = db.prepare("SELECT * FROM sandbox_workspaces ORDER BY id").all()
    const boxes = await readBoxStatesOf(db, rows, boxDeps).catch(() => new Map())
    sendJson(res, 200, { workspaces: rows.map((row) => workspaceView(db, row, boxes.get(row.id), { now: now() })) })
  })

  // ── ② 创建（写门实时化 ⇒ 503；放置 + 绑定 + key 签发 + 建盒链）──────────────
  routes.add("POST", "/api/admin/sandbox/workspaces", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    await requireSandboxAvailable(db, { detail: "创建工作区需要节点", fetchImpl, config, requestImpl })
    const body = await readJsonBody(req)
    let name, owner, initialLimits, baseImage
    try {
      name = normalizeWorkspaceName(body?.name)
      owner = findMemberById(db, Number(body?.ownerMemberId))
      if (!owner) throw new Error(`负责人不存在：${String(body?.ownerMemberId)}`)
      baseImage = normalizeBaseImage(body?.baseImage === undefined ? null : body.baseImage)
      const raw = body?.limits === null || body?.limits === undefined ? {} : body.limits
      for (const key of Object.keys(raw)) {
        if (raw[key] === null) throw new Error(`初始覆写不收 null（删键请用 PATCH）：${key}`)
      }
      initialLimits = mergeLimits("{}", raw)
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    if (db.prepare("SELECT id FROM sandbox_workspaces WHERE name = ?").get(name)) {
      throw new HttpError("invalid_request_error", `工作区名已存在：${name}`)
    }
    const key = issueWorkspaceKey(db, { ownerMemberId: owner.id, workspaceName: name, now: now() })
    const info = db
      .prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, stop_reason, base_image, created_at)
        VALUES (?, ?, ?, ?, NULL, ?, NULL, ?, ?)`)
      .run(name, owner.id, key.id, key.plain, JSON.stringify(initialLimits), baseImage, new Date(now()).toISOString())
    let workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(Number(info.lastInsertRowid))
    const runner = await placeWorkspace(db, { fetchImpl, config, requestImpl }) // KD-SV-171：在线 active 最少绑定者；无候选 ⇒ null（留未绑）
    if (runner !== null) {
      db.prepare("UPDATE sandbox_workspaces SET runner_id = ? WHERE id = ?").run(runner.id, workspace.id)
      workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
      try {
        await createWorkspaceBox(db, workspace, runner, { ...boxDeps, actor: { name: admin.name, id: admin.id } })
      } catch (e) {
        throw new HttpError("upstream_error", `建盒链失败（行留——重试续链，幂等）：${e?.message ?? e}`)
      }
    }
    sendJson(res, 200, { workspace: workspaceView(db, workspace, null, { now: now() }) })
  })

  // ── ③ PATCH（资源覆写 + 底座绑定；至少一键；生效 = 下次建盒/重建）───────────
  routes.add("PATCH", "/api/admin/sandbox/workspaces/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const workspace = workspaceRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req)
    const hasLimits = body?.limits !== null && body?.limits !== undefined
    const hasBase = body !== null && typeof body === "object" && Object.hasOwn(body, "baseImage")
    if (!hasLimits && !hasBase) {
      throw new HttpError("invalid_request_error", "至少一键（`limits` ∥ `baseImage`）——`limits` = 资源覆写（值 null = 删键）；`baseImage` = 底座引用（null = 恢复标准）")
    }
    if (hasLimits) {
      let merged
      try {
        merged = mergeLimits(workspace.limits_json, body.limits)
      } catch (e) {
        throw new HttpError("invalid_request_error", e.message) // 校验不过 ⇒ 400（库零变）
      }
      db.prepare("UPDATE sandbox_workspaces SET limits_json = ? WHERE id = ?").run(JSON.stringify(merged), workspace.id)
      recordAudit(db, {
        type: "sandbox_event",
        actor: admin.name,
        actorId: admin.id,
        target: workspace.name,
        detail: { kind: "workspace_limits", workspaceId: workspace.id, limits: merged },
        ts: now(),
      })
    }
    if (hasBase) {
      let normalized
      try {
        normalized = normalizeBaseImage(body.baseImage)
      } catch (e) {
        throw new HttpError("invalid_request_error", e.message)
      }
      db.prepare("UPDATE sandbox_workspaces SET base_image = ? WHERE id = ?").run(normalized, workspace.id)
      recordAudit(db, {
        type: "sandbox_event",
        actor: admin.name,
        actorId: admin.id,
        target: workspace.name,
        detail: { kind: "workspace_base", workspaceId: workspace.id, baseImage: normalized }, // 标准 ⇒ null
        ts: now(),
      })
    }
    const updated = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
    sendJson(res, 200, { workspace: workspaceView(db, updated, null, { now: now() }) }) // 生效 = 下次建盒/重建（运行中盒零触）
  })

  // ── ④ 派生构建（同步——最坏 ≈20 分钟；无绑定/无底座/供体缺 ⇒ 400 人话）──────
  routes.add("POST", "/api/admin/sandbox/workspaces/:id/derive", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const workspace = workspaceRowOr404(db, ctx.params.id)
    const baseRef = customBaseOf(workspace)
    if (baseRef === null) throw new HttpError("invalid_request_error", `工作区「${workspace.name}」未绑自定义底座（先「设底座」——标准镜像无需派生）`)
    if (workspace.runner_id === null) throw new HttpError("invalid_request_error", `工作区「${workspace.name}」未绑节点（派生 = 某工作区在某节点上构建——先放置）`)
    const runner = runnerRowOr404(db, workspace.runner_id)
    const settings = getSettings(db)
    const started = now()
    try {
      const derived = await ensureDerivedImage(clientForRunner(runner, { fetchImpl, config, requestImpl }), {
        baseRef,
        standardImage: settings.image,
        registryAuth: authForImageRef(db, baseRef, { config }),
        audit: { db, actor: admin.name, actorId: admin.id, runnerId: runner.id, workspaceId: workspace.id, target: baseRef },
        now,
      })
      sendJson(res, 200, { ok: true, base: derived.base, tag: derived.tag, cached: derived.cached, pulled: derived.pulled, ms: now() - started })
    } catch (e) {
      throw deriveFailure(e) // DeriveError ⇒ 400 人话 ∥ DockerError ⇒ 400/502（KD-SV-185）
    }
  })

  // ── ⑤ 快照列表（恢复动作选参用；零审计）────────────────────────────────────
  routes.add("GET", "/api/admin/sandbox/workspaces/:id/checkpoints", (req, res, ctx) => {
    requireAdmin(db, req)
    const workspace = workspaceRowOr404(db, ctx.params.id)
    const rows = db.prepare("SELECT * FROM sandbox_checkpoints WHERE workspace_id = ? ORDER BY id DESC").all(workspace.id)
    sendJson(res, 200, {
      checkpoints: rows.map((row, index) => ({ id: row.id, createdAt: row.created_at, size: row.size, note: row.note, latest: index === 0 })),
    })
  })

  // ── ⑥ 动作（五动作——请求内直调链；幂等 = 目标态已成立 ⇒ 200 noop）─────────
  routes.add("POST", "/api/admin/sandbox/workspaces/:id/:action", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const action = String(ctx.params.action)
    if (!WORKSPACE_ACTIONS.includes(action)) {
      throw new HttpError("invalid_request_error", `未知动作：${action}（可选：${WORKSPACE_ACTIONS.join(" ∥ ")}）`)
    }
    const workspace = workspaceRowOr404(db, ctx.params.id)
    if (workspace.runner_id === null) {
      const candidate = await placeWorkspace(db, { fetchImpl, config, requestImpl })
      throw new HttpError(
        "sandbox_unavailable",
        candidate === null
          ? `工作区「${workspace.name}」待人放（先放置再走链——节点均满员 ∥ 无在线 active）`
          : `工作区「${workspace.name}」尚无绑定节点——先放置（有候选节点，补放置后重试）`,
      )
    }
    const runner = runnerRowOr404(db, workspace.runner_id)
    await requireRunnerAvailable(runner, { detail: `工作区「${workspace.name}」动作「${action}」需要绑定节点在线`, fetchImpl, config, requestImpl }) // §7 绑定面：探绑定节点（非任一 active）
    const body = await readJsonBody(req).catch(() => ({}))
    const actor = { actor: { name: admin.name, id: admin.id } }
    /** 链错误 ⇒ 502（`upstream_error` + 人话——机/主机侧失败，行留重试续链）；`HttpError` 原样。 */
    const chain = async (fn) => {
      try {
        return await fn()
      } catch (e) {
        if (e instanceof HttpError) throw e
        throw new HttpError("upstream_error", e?.message ?? String(e))
      }
    }
    if (action === "start") {
      const result = await chain(() => startWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }))
      sendJson(res, 200, { ok: true, action, ...result })
      return
    }
    if (action === "stop") {
      const result = await chain(() => stopWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }, { reason: "manual" }))
      sendJson(res, 200, { ok: true, action, ...result })
      return
    }
    if (action === "destroy") {
      const boxes = await readBoxStatesOf(db, [workspace], boxDeps).catch(() => new Map())
      const box = boxes.get(workspace.id)
      const snapshots = checkpointCount(db, workspace.id)
      if (body?.confirm !== true) {
        throw new HttpError(
          "invalid_request_error",
          `销毁不可逆（含卷目录与快照）：boxState=${box?.boxState ?? "stopped"} ∥ 快照 ${snapshots} 份——确认请携 confirm: true`,
        )
      }
      revokeWorkspaceKey(db, workspace, { now: now() }) // 销毁即吊销工作区 key
      recordAudit(db, {
        type: "key_revoke",
        actor: admin.name,
        actorId: admin.id,
        target: workspace.name,
        detail: { keyHint: getKeyById(db, workspace.key_id)?.key_hint ?? null, workspaceId: workspace.id },
        ts: now(),
      })
      const result = await chain(() => destroyWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }, { deleteVolume: body?.deleteVolume !== false }))
      sendJson(res, 200, { ok: true, action, ...result })
      return
    }
    if (action === "rotate-key") {
      const issued = rotateWorkspaceKey(db, workspace, { now: now() }) // 吊销旧 + 签发新（旧即断 401）
      db.prepare("UPDATE sandbox_workspaces SET key_id = ?, key_plain = ? WHERE id = ?").run(issued.id, issued.plain, workspace.id)
      const updated = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
      recordAudit(db, {
        type: "key_rotate",
        actor: admin.name,
        actorId: admin.id,
        target: updated.name,
        detail: { keyHint: issued.hint, workspaceId: updated.id },
        ts: now(),
      })
      const result = await chain(() => rotateWorkspaceBox(db, updated, runner, { ...boxDeps, ...actor })) // 重建：新 key 入盒 env
      sendJson(res, 200, { ok: true, action, ...result, keyHint: issued.hint })
      return
    }
    // restore（`checkpointId` 可选——缺省最近）
    const checkpointId = body?.checkpointId === undefined || body?.checkpointId === null ? null : Number(body.checkpointId)
    const checkpoint =
      checkpointId === null
        ? db.prepare("SELECT * FROM sandbox_checkpoints WHERE workspace_id = ? ORDER BY id DESC LIMIT 1").get(workspace.id) ?? null
        : db.prepare("SELECT * FROM sandbox_checkpoints WHERE id = ? AND workspace_id = ?").get(checkpointId, workspace.id) ?? null
    if (checkpoint === null) throw new HttpError("invalid_request_error", `快照不存在（workspace = ${workspace.name}；先拍快照，或换一份）`)
    const result = await chain(() => restoreWorkspace(db, workspace, runner, checkpoint, { ...boxDeps, ...actor }))
    sendJson(res, 200, { ok: true, action, ...result })
  })
}
