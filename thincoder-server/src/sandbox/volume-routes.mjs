/**
 * volume-routes.mjs — 卷族路由（sandbox/SANDBOX.md §3 卷族 ∥ gateway/API.md §2.5 两行；sandbox-volumes 批——台账 #1291）。
 * 分族成档缘由（SANDBOX §13）：容器/镜像族按族拆（卷族循此例，不预建网络族）。
 *
 * 语义（§3）：引擎即真源（KD-SV-104——沿 KD-SV-79）——列表 = 读时读（`GET …/volumes`；`Volumes` 缺/null ⇒ `[]`）；
 * 删除 = 动作直调（204 ⇒ 200）；**名形先校验**（字母/数字起头 + `[A-Za-z0-9_.-]` 续——非法 ⇒ 400 **零外呼**，防路径段穿越）；
 * 引擎 404（无此卷）⇒ 404 `not_found`；**409（在用卷）⇒ 400 人话 + 处置句**（如实携引擎原文——不前置预检，引擎即真源）；余 ⇒ 502。
 * 审计（键集单源 = `accounts/ACCOUNTS.md` §2.1）：删除一行（`volume_delete`——`kind`+`runnerId`+`volume`）；列表零审计（读动作）。
 * **零自动建卷**（首用即建归引擎——我方零建卷调用；建容器的卷字段 = 名字进既有 `Binds` 径，形零改——§3）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { DockerError, clientForRunner } from "./docker.mjs"
import { runnerRowOr404 } from "./registry.mjs"
import { dockerFailure } from "./container-routes.mjs"

/** 卷名形（Docker 卷名口径：字母/数字起头 + `[A-Za-z0-9_.-]` 续——防路径段穿越；非法 ⇒ 路由 400 零外呼）。 */
export function normalizeVolumeTarget(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("卷名不可为空")
  if (name.length > 255) throw new Error(`卷名超长（≤ 255 字符；实长 ${name.length}）`)
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) throw new Error(`卷名形非法（Docker 卷名形：字母/数字起头，可含 _ . -）：${name}`)
  return name
}

/** 卷列表行（engine `GET /volumes` 形 ⇒ §3 读形；字段如实取 `Name`/`Driver`/`CreatedAt`——`Volumes` 缺/null ⇒ `[]`）。 */
export function volumeView(item = {}) {
  return {
    name: item.Name ?? null,
    driver: item.Driver ?? null,
    createdAt: item.CreatedAt ?? null,
  }
}

/** 删除失败映射（§3）：404 ⇒ 404；409（在用卷）⇒ 400 人话 + 处置句（携引擎原文）；余 ⇒ 502。 */
export function volumeDeleteFailure(e) {
  if (e instanceof DockerError && e.kind === "api") {
    if (e.status === 409) {
      return new HttpError(
        "invalid_request_error",
        `卷正被容器使用——无法删除（引擎 409：${e.apiMessage || e.message}）——请先删除或改用该卷的容器，再试`,
      )
    }
    if (e.status === 404) return new HttpError("not_found", `卷不存在（引擎 404）：${e.apiMessage || "no such volume"}`)
    return new HttpError("upstream_error", `引擎错误：${e.message}`)
  }
  return dockerFailure(e)
}

/** 注册卷族两路由（§3）：`fetchImpl` = Docker 传输注入口（单元测试档假件；缺省 = 全局 fetch——生产行为不变）；`config`（TLS 档材料解密——增补 #2）∥ `requestImpl`（假件缝）同链下传。 */
export function registerVolumeRoutes(routes, { db, fetchImpl = fetch, config = {}, requestImpl = null, now = Date.now, readTimeoutMs, actionTimeoutMs } = {}) {
  if (!db) throw new Error("registerVolumeRoutes：缺少 db")

  const clientOf = (runner) =>
    clientForRunner(runner, {
      fetchImpl,
      config,
      requestImpl,
      ...(readTimeoutMs ? { readTimeoutMs } : {}),
      ...(actionTimeoutMs ? { actionTimeoutMs } : {}),
    })

  // 列表（读时读——KD-SV-104；零审计）
  routes.add("GET", "/api/admin/sandbox/runners/:id/volumes", async (req, res, ctx) => {
    requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    let payload
    try {
      payload = await clientOf(runner).volumes()
    } catch (e) {
      throw dockerFailure(e)
    }
    const list = Array.isArray(payload.json?.Volumes) ? payload.json.Volumes : []
    sendJson(res, 200, { volumes: list.map(volumeView) })
  })

  // 删除（名形先校验 ⇒ 400 零外呼；204 ⇒ 200 + 审计 volume_delete）
  routes.add("DELETE", "/api/admin/sandbox/runners/:id/volumes/:name", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const runner = runnerRowOr404(db, ctx.params.id)
    let name
    try {
      name = normalizeVolumeTarget(ctx.params.name)
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    try {
      await clientOf(runner).removeVolume(name)
    } catch (e) {
      throw volumeDeleteFailure(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: runner.name,
      detail: { kind: "volume_delete", runnerId: runner.id, volume: name },
      ts: now(),
    })
    sendJson(res, 200, { ok: true, name })
  })
}
