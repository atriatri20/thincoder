/**
 * routes.mjs — 沙盒控制台面与成员面（sandbox/SANDBOX.md §3/§8/§9；端点表 = gateway/API.md §2.5/§2.7；runner-admin-console 批——节点增/删 + 运行面读数）。
 *
 * sandbox-exec-rebuild 批收正（本档）：**队列死件删净**（原两处展示面 `sweepStuckTasks` 续跑调用随队列退场全删——KD-SV-161）∥
 * **工作区面拆出**（workspace 列表/建/改/动作四路由 + 视图件外迁 `workspace-routes.mjs`——直调链重写归其档；本档零残留）∥
 * **连接面 TLS 档**（增补 #2——KD-SV-192…195：添加节点体扩 `connection`/`tls`；新 `PUT …/runners/:id/connection` 全列覆写）。
 * 容器面十路由与镜像族/卷族/托管接入三族已拆 `container-routes.mjs` ∥ `image-routes.mjs` ∥ `volume-routes.mjs` ∥ `onboarding-routes.mjs`（§13 分族成档）。
 * `/api/admin/sandbox/*`（判权 `requireAdmin`）∥ `/api/me/sandbox/*`（成员面——会话 + 恒本人过滤）。
 *
 * 节点面（§3）：添加 = 连通自检（引导步 → 协商 → 复读——`docker.mjs`；TLS 档三件入 `https.request` 选项）⇒ 落行 + **网段 deny 幂等带入**（§4 强制面 ⑤）
 * + 审计（`runner_add` 携逐项带入读数 + `tls` 布尔 ∥ 自检失败行）；**连接方式编辑** = `PUT …/connection`（改地址/切档/换材料同径——先自检后落库，失败 ⇒ 库零变；关 TLS = 原子）；
 * 删除 = 二选一（保留 ∥ 连删）；运行面读数 = 读时探活（`GET <base>/v<ver>/info`——3s ∥ 并发；无心跳/无后台定时器——KD-SV-80）；节点面恒可用。
 * 可用性门（KD-SV-71/166）：`overview` 常回应（`status: unavailable` + 原因）；写动作（工作区创建 ∥ 动作/建盒）⇒ 503 `sandbox_unavailable`（实时探活——`registry.requireSandboxAvailable`，消费面随工作区拆档）；
 * 规则 ∥ 设置 ∥ 待批裁定 = 不设门；成员面读 = 契约明文（API §2.7）——静态可用性不可用 ⇒ 503（读数语义沿既有）。
 * 两参透传（增补 #2——与 `fetchImpl` 同形）：`config`（连接材料解密所需）∥ `requestImpl`（`node:https` 假件缝）——本档逐调用点下传（子族注册同携）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin, requireSession } from "../accounts/session.mjs"
import {
  boxStateOf, deleteRunnerChain, getSettings, insertRunner, normalizeRunnerName, patchSettings, runnerRowOr404, runnerRows, runnerView,
  sandboxAvailability, sandboxPublicBase, tryPlacePending,
} from "./registry.mjs"
import { clientForRunner, normalizeDockerAddress, selfCheckDocker } from "./docker.mjs"
import { normalizeConnectionKind, parseTlsMaterials, sealTlsMaterials } from "./docker-tls.mjs"
import { parseHostCredentialInput, revokeHostCredential, setHostCredential } from "./hosts.mjs"
import { registerContainerRoutes } from "./container-routes.mjs"
import { registerImageRoutes } from "./image-routes.mjs"
import { registerVolumeRoutes } from "./volume-routes.mjs"
import { registerOnboardingRoutes } from "./onboarding-routes.mjs"
import { registerWorkspaceRoutes } from "./workspace-routes.mjs"
import { createHostExec, placePendingWorkspaces } from "./box.mjs"
import { dispatchEgressAll } from "./egress.mjs"
import { bumpRulesRev, createRule, deleteRule, getRulesRev, importSegmentDenies, listPending, listRules, openPendingOf, resolvePending, updateRule } from "./rules.mjs"

/** 快照读数（`sandbox_checkpoints`——登记行由快照链写入；本档 = 成员面读取面）。 */
function checkpointCount(db, workspaceId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints WHERE workspace_id = ?").get(Number(workspaceId)).n)
}

/** 行地址取主机名（连接面切档缺省 = 保留主机 + 按目标档补 scheme/缺省端口——§3 连接方式块）。 */
function hostOfAddress(address) {
  try {
    return new URL(String(address)).hostname
  } catch {
    return String(address ?? "")
  }
}

/**
 * 注册沙盒控制台面（节点/规则/待批/设置面）+ 成员面 + 子族（容器/镜像/卷/托管接入）。
 * 注入口径（单元测试档替身）：`now`（时钟——生产行为不变）∥ `fetchImpl`（Docker 传输——节点面 ∥ 探活；明文行恒用之，零行为变化）∥
 * `config`（TLS 连接材料解密所需——增补 #2）∥ `requestImpl`（`node:https` 假件缝——缺省 `null`）∥ `deps`（托管接入面替身——见 `onboarding.mjs`）。
 */
export function registerSandboxRoutes(routes, { db, config = {}, log = null, now = Date.now, fetchImpl = fetch, requestImpl = null, deps = {} } = {}) {
  if (!db) throw new Error("registerSandboxRoutes：缺少 db（openDatabase 产物）")
  const publicBase = sandboxPublicBase(config)
  const hostExec = createHostExec({ config, execImpl: deps.execImpl ?? null, now }) // 主机命令面（闸下发用——SSH 逐条）
  const execOf = (row) => hostExec.execOf(row)
  /** 规则变更 ⇒ 逐节点全量重算下发（**同步**——落库后即下发；失败逐节点记读数 + 审计 + 响应告警，不反噬已落库事实；KD-SV-164）。 */
  const pushEgress = async (reason) => {
    let results = []
    try {
      results = await dispatchEgressAll({ db, config, now, log, reason, execOf, resolveImpl: deps.resolveImpl ?? null })
    } catch (e) {
      log?.warn("egress_dispatch_failed", { reason, message: e?.message ?? String(e) })
      return { ok: false, results: [], error: String(e?.message ?? e), reason }
    }
    const failed = results.filter((item) => item.ok === false)
    return { ok: failed.length === 0, results, reason, failed }
  }
  const injected = { importSegmentDenies: deps.importSegmentDenies ?? null, dnsGate: deps.dnsGate ?? null } // 单元测试档假件缝（事务回滚 ∥ 裁定回填）

  // ── ① 运行面（读时探活——KD-SV-80：每节点现打 `/info`，3s ∥ 并发）────────────────
  routes.add("GET", "/api/admin/sandbox/overview", async (req, res) => {
    requireAdmin(db, req)
    const rows = runnerRows(db)
    const probed = await Promise.all(
      rows.map(async (row) => {
        const base = runnerView(row)
        try {
          const info = await clientForRunner(row, { fetchImpl, config, requestImpl }).info()
          return {
            ...base,
            online: true,
            version: info.json?.ServerVersion ?? null,
            containers: { total: Number(info.json?.Containers ?? 0), running: Number(info.json?.ContainersRunning ?? 0) },
          }
        } catch (e) {
          log?.warn("sandbox_runner_probe_failed", { runnerId: row.id, message: e?.message ?? String(e) })
          return { ...base, online: false, version: null, containers: null } // 离线读数不外推（§3）
        }
      }),
    )
    const available = probed.some((item) => item.online)
    const reason = available ? null : rows.length === 0 ? "无节点注册" : "节点全部不可达"
    sendJson(res, 200, { status: available ? "available" : "unavailable", ...(reason ? { reason } : {}), runners: probed })
  })

  // 添加节点（§3——连通自检：引导步 → 协商 → 复读；TLS 档（增补 #2）三件入 `https.request` 选项；
  // 形非法/相抵/缺件 ⇒ 400 零外呼；自检失败 ⇒ 502 + 零落库 + 审计行）
  routes.add("POST", "/api/admin/sandbox/runners", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let name, kind, materials, address
    try {
      name = normalizeRunnerName(body?.name)
      kind = normalizeConnectionKind(body?.connection)
      materials = kind === "tls" ? parseTlsMaterials(body?.tls) : null
      if (materials === null && body?.tls !== undefined && body?.tls !== null) {
        throw new Error("明文档不携材料（`tls` 三件仅 TLS 档在场——不变量 https ⇔ 三件齐）")
      }
      address = normalizeDockerAddress(body?.address, { tls: kind === "tls" }) // 按档补 scheme + 缺省端口；显式 scheme 与档相抵 ⇒ 400（零外呼）
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 重名/形非法 ⇒ 400（先库查后自检——网面零触）
    }
    if (db.prepare("SELECT id FROM sandbox_runners WHERE name = ?").get(name)) {
      throw new HttpError("invalid_request_error", `节点名已存在：${name}`)
    }
    let check
    try {
      check = await selfCheckDocker({ address, fetchImpl, config, requestImpl, ...(materials === null ? {} : { tls: materials }) })
    } catch (e) {
      recordAudit(db, {
        type: "sandbox_event",
        actor: admin.name,
        actorId: admin.id,
        target: name,
        detail: { kind: "runner_selfcheck_failed", address, reason: e?.message ?? String(e) },
        ts: now(),
      })
      throw new HttpError("upstream_error", `连通自检失败：${e?.message ?? e}`) // 502 + 逐句人话 + 零落库
    }
    let row
    let segments
    db.exec("BEGIN") // #1351（KD-SV-174）：登记行 ∥ 带入行 ∥ 审计行 = 单事务（任一步失败 ⇒ 回滚零残留）
    try {
      row = insertRunner(db, {
        name,
        address: check.baseUrl,
        runtime: check.readings,
        now: now(),
        tls: materials === null ? null : sealTlsMaterials(materials, { config, now }), // 私钥 AES-256-GCM 落库（零回显——行形只出 state/updatedAt）
      })
      // 网段 deny 幂等带入（§4 强制面 ⑤——节点段 = 登记地址 host /24；服务器段 = 盒 env `OPENAI_BASE_URL` 地址 /24，取值点单源 = `publicBase`）：
      // 首见 ⇒ 行入 + `rulesRev` +1 + 审计一行（「自动带入」）；段已在 ⇒ 零重行零动零审计；不可推导（通配/非 IPv4）⇒ 零行 + 登记读数如实标。
      segments = (injected.importSegmentDenies ?? importSegmentDenies)(db, [{ kind: "runner", address: row.address }, { kind: "server", address: publicBase }], { now: now() })
      recordAudit(db, {
        type: "sandbox_event",
        actor: admin.name,
        actorId: admin.id,
        target: name,
        detail: { kind: "runner_add", runnerId: row.id, address: row.address, segments, tls: kind === "tls" }, // 增补 #2：detail 增 `tls` 布尔（零秘密）
        ts: now(),
      })
      db.exec("COMMIT")
    } catch (e) {
      db.exec("ROLLBACK")
      if (e instanceof HttpError) throw e
      throw new HttpError("upstream_error", `登记事务回滚（零残留）：${e?.message ?? e}`) // 内部面炸 ⇒ 502 人话（输入形非法仍 400）
    }
    // 补放置（KD-SV-171 触发③——登记成功后后台：**不阻断响应**；绑定 + 建盒链驱动 = `box.mjs`；逐工作区失败 ⇒ 行留未绑 + 读数）
    void placePendingWorkspaces(db, {
      config,
      now,
      log,
      fetchImpl,
      requestImpl,
      resolveImpl: deps.resolveImpl ?? null,
      ...(deps.host ? { host: deps.host } : {}),
      ...(deps.clientForRunner ? { clientForRunner: deps.clientForRunner } : {}),
    }).catch((e) => log?.warn("sandbox_place_pending_failed", { message: e?.message ?? String(e) }))
    sendJson(res, 200, { runner: runnerView(row) }) // 行形与 overview 同拍（`ssh` + `connection`/`tls` 元数据同携——零材料）
  })

  // 连接方式编辑（增补 #2——§3 连接方式块 ∥ gateway/API.md §2.5）：全列覆写（改地址 ∥ 切档 ∥ 换材料同径）；
  // **先自检后落库**（失败 ⇒ 502 + 库零变）；**关 TLS = 原子**（地址回 `http` + 材料清零——单语句）；不存在 ⇒ 404。
  routes.add("PUT", "/api/admin/sandbox/runners/:id/connection", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req)
    let kind, materials, address
    try {
      if (body?.connection === undefined || body?.connection === null) {
        throw new Error('connection 必携（全列覆写——"plain" ∥ "tls"；`null` 亦拒——缺省携带会静默关 TLS，不接）') // API §2.5 PUT 体形：`connection` 无 `?`
      }
      kind = normalizeConnectionKind(body?.connection)
      materials = kind === "tls" ? parseTlsMaterials(body?.tls) : null
      if (materials === null && body?.tls !== undefined && body?.tls !== null) {
        throw new Error("明文档不携材料（`tls` 三件仅 TLS 档在场——不变量 https ⇔ 三件齐）")
      }
      const given = typeof body?.address === "string" && body.address.trim() !== "" ? body.address : hostOfAddress(runner.address)
      address = normalizeDockerAddress(given, { tls: kind === "tls" }) // 地址缺省 ⇒ 保留主机 + 按目标档补 scheme/缺省端口
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 形非法/相抵/缺件 ⇒ 400（库零变）
    }
    let check
    try {
      check = await selfCheckDocker({ address, fetchImpl, config, requestImpl, ...(materials === null ? {} : { tls: materials }) })
    } catch (e) {
      recordAudit(db, {
        type: "sandbox_event",
        actor: admin.name,
        actorId: admin.id,
        target: runner.name,
        detail: { kind: "runner_selfcheck_failed", runnerId: runner.id, address, reason: e?.message ?? String(e) },
        ts: now(),
      })
      throw new HttpError("upstream_error", `连通自检失败（库零变）：${e?.message ?? e}`)
    }
    const sealed = materials === null ? null : sealTlsMaterials(materials, { config, now })
    db.prepare("UPDATE sandbox_runners SET address = ?, tls_ca = ?, tls_cert = ?, tls_key_cipher = ?, tls_updated_at = ? WHERE id = ?")
      .run(check.baseUrl, sealed?.ca ?? null, sealed?.cert ?? null, sealed?.keyCipher ?? null, sealed?.updatedAt ?? null, runner.id)
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: runner.name,
      detail: { kind: "runner_connection", runnerId: runner.id, address: check.baseUrl, tls: kind === "tls" }, // 零秘密（四键）
      ts: now(),
    })
    sendJson(res, 200, { runner: runnerView(db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(runner.id)) })
  })

  // 删除节点（§3——二选一「保留 ∥ 连删」；链全文 = `registry.deleteRunnerChain`（chat 工具面同函数——KD-SV-90 §12））
  routes.add("DELETE", "/api/admin/sandbox/runners/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req).catch(() => ({}))
    const { kept, removed } = await deleteRunnerChain(db, runner, { containers: body?.containers, confirm: body?.confirm === true }, { fetchImpl, config, requestImpl })
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: runner.name,
      detail: { kind: "runner_delete", kept, removed },
      ts: now(),
    })
    sendJson(res, 200, { ok: true, id: runner.id, kept, removed })
  })

  // 主机凭据（§3 主机凭据块 ∥ §9：两端点——路由体归 `hosts.mjs`（单源）；密列零回显（响应 = `runnerView` 元数据））
  routes.add("PUT", "/api/admin/sandbox/runners/:id/credential", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req)
    let input
    try {
      input = parseHostCredentialInput(body) // 形非法 ⇒ 400；库零变（E59）
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    sendJson(res, 200, { runner: runnerView(setHostCredential(db, runner, input, { config, actor: admin.name, actorId: admin.id, now })) })
  })

  routes.add("DELETE", "/api/admin/sandbox/runners/:id/credential", (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    let updated
    try {
      updated = revokeHostCredential(db, runner, { actor: admin.name, actorId: admin.id, now }) // 无凭据在留 ⇒ 400（零副作用）
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    sendJson(res, 200, { runner: runnerView(updated) })
  })

  // ── ② 出站规则 ────────────────────────────────────────────────────────────
  routes.add("GET", "/api/admin/sandbox/rules", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { rules: listRules(db), rulesRev: getRulesRev() })
  })

  routes.add("POST", "/api/admin/sandbox/rules", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let created
    try {
      created = createRule(db, body, { actor: admin.name, actorId: admin.id, now: now() }) // source ∈ {admin, default}（default = 采纳建议入默认单）
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e.message)
    }
    const egressState = await pushEgress("规则新増") // 下发触发①：规则增删 ⇒ 全量重算（删行即生效——B73；盒零重建）
    sendJson(res, 200, {
      rule: created.rule,
      rulesRev: created.rulesRev,
      egressState,
      ...(egressState.ok ? {} : { warning: `规则已落库，但下发未就位（${egressState.failed?.length ?? 0} 个节点）——见审计 egress_apply_failed` }),
    })
  })

  routes.add("PATCH", "/api/admin/sandbox/rules/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let updated
    try {
      updated = updateRule(db, ctx.params.id, body, { actor: admin.name, actorId: admin.id, now: now() })
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e.message)
    }
    const egressState = await pushEgress("规则修改")
    sendJson(res, 200, {
      rule: updated.rule,
      rulesRev: updated.rulesRev,
      egressState,
      ...(egressState.ok ? {} : { warning: `规则已落库，但下发未就位（${egressState.failed?.length ?? 0} 个节点）——见审计 egress_apply_failed` }),
    })
  })

  routes.add("DELETE", "/api/admin/sandbox/rules/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const removed = deleteRule(db, ctx.params.id, { actor: admin.name, actorId: admin.id })
    const egressState = await pushEgress("规则删除")
    sendJson(res, 200, {
      rule: removed.rule,
      rulesRev: removed.rulesRev,
      egressState,
      ...(egressState.ok ? {} : { warning: `规则已落库，但下发未就位（${egressState.failed?.length ?? 0} 个节点）——见审计 egress_apply_failed` }),
    })
  })

  // ── ③ 待批队列 ────────────────────────────────────────────────────────────
  routes.add("GET", "/api/admin/sandbox/pending", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, listPending(db, { now: now() }))
  })

  routes.add("POST", "/api/admin/sandbox/pending/:id/resolve", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    const row = db.prepare("SELECT * FROM sandbox_pending WHERE id = ?").get(Number(ctx.params.id))
    if (!row) throw new HttpError("not_found", `待批不存在：${ctx.params.id}`)
    let resolved
    try {
      resolved = resolvePending(db, row.id, body?.decision, { actor: admin.name, actorId: admin.id, now: now() })
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e.message)
    }
    sendJson(res, 200, { ok: true, pending: resolved.pending, rule: resolved.rule, rulesRev: resolved.rulesRev })
    void injected.dnsGate?.notifyDecision?.(row.id) // 裁定回填（§6）：持答中的 DNS 请求 ⇒ 先下发再应答 ∥ 拒 ⇒ REFUSED
  })

  // ── ④ 资源与 TTL（设置面）────────────────────────────────────────────────
  routes.add("GET", "/api/admin/sandbox/settings", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { settings: getSettings(db) })
  })

  routes.add("PATCH", "/api/admin/sandbox/settings", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    const before = getSettings(db)
    let after
    try {
      after = patchSettings(db, body)
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 形/范围不过 ⇒ 400 库零变
    }
    const changed = JSON.stringify(before) !== JSON.stringify(after)
    if (changed) {
      bumpRulesRev() // §2.5：设置变更 ⇒ rulesRev +1（下发即生效）
      recordAudit(db, { type: "config_update", actor: admin.name, actorId: admin.id, target: "sandbox_settings", detail: { keys: Object.keys(body ?? {}) }, ts: now() }) // 沿配置控制台先例（键名清单——值永不入；SANDBOX §2 审计型面未列设置 ⇒ 用既有 config_update，见批档 §5）
    }
    sendJson(res, 200, { settings: after, rulesRev: getRulesRev() })
  })

  // ── 成员面（本人——§2.7；恒本人过滤）──────────────────────────────────────
  routes.add("GET", "/api/me/sandbox/workspaces", async (req, res) => {
    const { member } = requireSession(db, req)
    const availability = sandboxAvailability(db) // 读面读数语义沿既有（API §2.7「不可用 ⇒ 503」）；写门 = 实时探活（写面）
    if (availability.status === "unavailable") throw new HttpError("sandbox_unavailable", `沙盒不可用：${availability.reason}`)
    const clients = new Map() // 每节点一客户端（读时读引擎——EXECUTION §3）
    const clientOf = (runner) => {
      if (!clients.has(runner.id)) clients.set(runner.id, clientForRunner(runner, { fetchImpl, config, requestImpl }))
      return clients.get(runner.id)
    }
    const workspaces = []
    for (const workspace of db.prepare("SELECT * FROM sandbox_workspaces WHERE owner_member_id = ? ORDER BY id").all(member.id)) {
      const runner = workspace.runner_id === null ? null : db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(workspace.runner_id)
      const box = await boxStateOf(workspace, runner, { client: runner === null ? null : clientOf(runner) })
      workspaces.push({
        id: workspace.id,
        name: workspace.name,
        runnerName: runner?.name ?? null, // 所属 runner（未绑定 ⇒ null——§8 成员面；端侧呈「未绑定」）
        boxState: box.boxState,
        stopReason: box.stopReason,
        checkpointCount: checkpointCount(db, workspace.id),
        pending: openPendingOf(db, workspace.id, { now: now() }),
      })
    }
    sendJson(res, 200, { workspaces })
  })

  // ── 工作区面（拆分档 `workspace-routes.mjs`——列表/创建/PATCH(limits+baseImage)/派生/快照/五动作）──
  registerWorkspaceRoutes(routes, { db, config, log, now, fetchImpl, requestImpl, deps: { ...deps, dnsGate: injected.dnsGate } })

  // ── 容器面（拆分档——SANDBOX §13 预案①）────────────────────────────────────
  registerContainerRoutes(routes, { db, fetchImpl, config, requestImpl, now })

  // ── 镜像族（拆分档——SANDBOX §13 分族成档；sandbox-docker-admin 批）──────────
  registerImageRoutes(routes, { db, fetchImpl, config, requestImpl, now })

  registerVolumeRoutes(routes, { db, fetchImpl, config, requestImpl, now }) // 卷族（拆分档——SANDBOX §13 分族成档；sandbox-volumes 批）

  // ── 托管接入面（四端点转注册——`bin` ±0；起跑后立即交回，进度经读时轮询）────
  const onboarding = registerOnboardingRoutes(routes, { db, config, log, now, deps })
  onboarding.resumeInterrupted() // 重启恢复（KD-SV-86）：在途 `running` ⇒ `interrupted`（如实收尾 + 凭据按模式处置）
}
