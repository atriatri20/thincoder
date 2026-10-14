/**
 * sync.mjs — 成员同步引擎 + 调度器 + 体检（project/PROJECTS.md §5「同步机制」∥ §13「事件接收端」触发链；
 * team-projects-permissions 批（B2））。
 *
 * 语义（§5）：单向（平台为源——本地零反向）；触发三径（手动 ∥ 定时 ∥ 事件）；调度器检查周期 60s，到期判据 =
 * `enabled=1 ∧ now - COALESCE(last_sync_at, created_at) ≥ interval_minutes`（**`sync_mode` 不参与调度判据**——
 * `event` 源照跑 = 对账兜底）；同步算法 = 名册全量对账（单事务应用段——失败回滚零部分写；同名手工行不触；
 * 名册外 sync 行删；截断 ⇒ 跳过删除段）；结果入库（`last_sync_at` = 尝试时刻 ∥ `last_sync_result_json`）+ 审计一行。
 * 并发锁 = 单源在飞（进程内态——单实例部署；重启清零，定时对账兜底）；事件撞锁 ⇒ 待跑旗合并（§13）。
 */
import { HttpError } from "../gateway/errors.mjs"
import { credentialKeyPath, decryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { PlatformError, checkToken, fetchRoster } from "./platform-client.mjs"
import { recordCheckResult, recordSyncResult, sourceRowOr404 } from "./git-sources.mjs"

/** 调度器检查周期（§5：60s）。 */
export const SYNC_CHECK_INTERVAL_MS = 60000

/** 到期判据（§5——纯函数：`enabled=1 ∧ now - COALESCE(last_sync_at, created_at) ≥ interval_minutes`；`sync_mode` 不参与）。 */
export function dueAt(row, ts) {
  if (!(row?.enabled === 1 || row?.enabled === true)) return false
  const base = Date.parse(row.last_sync_at ?? row.created_at ?? "")
  if (!Number.isFinite(base)) return false
  return ts - base >= Number(row.interval_minutes) * 60000
}

/**
 * 名册应用（§5 算法 3——单事务；失败回滚零部分写）：名册逐人（档 = 映射表）⇒
 * 同名行在场：`origin='sync'` ⇒ 更新 `level`/`synced_role`；`origin='manual'` ⇒ **不触**（KD-SV-116）；
 * 不在场 ⇒ 插入（`origin='sync'`）；名册外且 `origin='sync'` 的行 ⇒ 删除；`truncated` ⇒ **跳过删除段**（KD-SV-122）。
 */
export function applyRoster(db, projects, roster, { truncated = false, at = new Date().toISOString() } = {}) {
  const counts = { added: 0, updated: 0, removed: 0 }
  const select = db.prepare("SELECT * FROM project_members WHERE project_id = ?")
  const insert = db.prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, ?, 'sync', ?, ?, ?)")
  const update = db.prepare("UPDATE project_members SET level = ?, synced_role = ?, updated_at = ? WHERE id = ?")
  const remove = db.prepare("DELETE FROM project_members WHERE id = ?")
  db.exec("BEGIN")
  try {
    for (const project of projects) {
      const rows = select.all(project.id)
      const byName = new Map(rows.map((row) => [row.username.toLowerCase(), row]))
      const seen = new Set()
      for (const person of roster) {
        const key = String(person.username).toLowerCase()
        seen.add(key)
        const existing = byName.get(key)
        if (!existing) {
          const info = insert.run(project.id, person.username, person.level, person.role ?? null, at, at)
          byName.set(key, { id: Number(info.lastInsertRowid), username: person.username, level: person.level, synced_role: person.role ?? null, origin: "sync" }) // 随插随记账——同趟重复行（大小写异形）落更新支，不撞唯一约束
          counts.added += 1
          continue
        }
        if (existing.origin === "manual") continue // 手工行优先——同步不触（本地决定不被覆盖）
        if (existing.level !== person.level || existing.synced_role !== person.role) {
          update.run(person.level, person.role ?? null, at, existing.id)
          counts.updated += 1
        }
      }
      if (truncated) continue // 截断 ⇒ 只增改不删（防误删——KD-SV-122）
      for (const row of rows) {
        if (row.origin !== "sync") continue
        if (seen.has(row.username.toLowerCase())) continue
        remove.run(row.id)
        counts.removed += 1
      }
    }
    db.exec("COMMIT")
  } catch (e) {
    db.exec("ROLLBACK")
    throw e
  }
  return counts
}

/**
 * 建同步调度器（§5——入口接线）：`{ check, start, stop, syncNow, triggerEvent, checkPat, isRunning, isPending }`。
 * 锁与待跑旗 = **进程内态**（§13 存储面与重启：单实例部署、零持久化；重启清零——定时对账兜底）。
 * `deps` = 注入口径（单元测试档：`fetchImpl` 假平台 ∥ `timeoutMs` 覆盖）；缺省 = 生产行为不变。
 */
export function createSyncScheduler({ db, config = {}, log = null, deps = {}, now = Date.now, intervalMs = SYNC_CHECK_INTERVAL_MS } = {}) {
  if (!db) throw new Error("createSyncScheduler：缺少 db")
  const running = new Set() // 单源锁（在飞源 id）
  const pending = new Set() // 待跑旗（事件撞锁 ⇒ 合并为一次；§13）
  let timer = null
  const fetchImpl = deps.fetchImpl ?? fetch
  const timeoutMs = deps.timeoutMs ?? null // 缺省 ⇒ 客户端按平台解析（`readTimeoutOf`）；注入面恒胜

  /** PAT 解密（不可解 ⇒ 归 `auth` 失败——键文件轮换/丢失面如实报）。 */
  function tokenOf(row) {
    const key = loadOrCreateCredentialKey(credentialKeyPath(config))
    try {
      return decryptSecret(row.token_cipher, key)
    } catch (e) {
      throw new PlatformError("auth", `凭据不可解（键文件变更？）：${e.message}`)
    }
  }

  function auditSync(row, result, { actor, actorId }) {
    recordAudit(db, {
      type: "project_event",
      actor,
      actorId: actorId ?? null,
      target: "",
      detail: { kind: "source_sync", sourceId: row.id, trigger: result.trigger, ok: result.ok, ...(result.ok ? {} : { errorKind: result.kind }), counts: result.counts },
      ts: now(),
    })
  }

  /** 同步一趟（§5 算法 1–4）：出 = 响应体（自含形——成 `{ ok:true, ms, counts }` ∥ 败 `{ ok:false, error:{kind,message}, ms }`）。 */
  async function performSync(row, { trigger, actor, actorId = null }) {
    const started = now()
    const counts = { projects: 0, roster: 0, added: 0, updated: 0, removed: 0 }
    const projects = db.prepare("SELECT * FROM projects WHERE source_id = ? ORDER BY id").all(row.id)
    counts.projects = projects.length // 无项目也执行名册拉取（验凭据 + 记录结果）
    let body = null
    let result = null
    let tokenState = null
    try {
      const roster = await fetchRoster({ platform: row.platform, baseURL: row.base_url, token: tokenOf(row), scope: row.scope, scopeKind: row.scope_kind ?? null, fetchImpl, timeoutMs })
      counts.roster = roster.members.length
      const applied = applyRoster(db, projects, roster.members, { truncated: roster.truncated, at: new Date(now()).toISOString() })
      counts.added = applied.added
      counts.updated = applied.updated
      counts.removed = applied.removed
      tokenState = "ok"
      const ms = now() - started
      body = { ok: true, ms, counts, ...(roster.truncated ? { truncated: true } : {}) }
      result = { ok: true, at: new Date(now()).toISOString(), ms, trigger, counts, ...(roster.truncated ? { truncated: true } : {}) }
    } catch (e) {
      if (!(e instanceof PlatformError)) throw e // 非分类错（bug）不假装分类——上抛 500
      if (e.kind === "auth") tokenState = "invalid"
      const ms = now() - started
      body = { ok: false, error: { kind: e.kind, message: e.message }, ms }
      result = { ok: false, at: new Date(now()).toISOString(), ms, trigger, kind: e.kind, message: e.message, counts }
    }
    recordSyncResult(db, { id: row.id, at: result.at, result, tokenState })
    auditSync(row, result, { actor, actorId })
    return body
  }

  /** 单源执行（锁协议）：在飞 ⇒ 手动/调度拒（调用面转 400/跳过）∥ 事件 ⇒ 置待跑旗；结束 ⇒ 旗在 ⇒ 续跑一次。 */
  async function execute(row, { trigger, actor, actorId = null, merge = false }) {
    if (running.has(row.id)) {
      if (merge) {
        pending.add(row.id)
        return { locked: true }
      }
      return { locked: true }
    }
    running.add(row.id)
    try {
      return { locked: false, body: await performSync(row, { trigger, actor, actorId }) }
    } finally {
      running.delete(row.id)
      if (pending.has(row.id)) {
        pending.delete(row.id)
        const fresh = db.prepare("SELECT * FROM git_sources WHERE id = ?").get(row.id)
        if (fresh) {
          execute(fresh, { trigger: "event", actor: "webhook" }).catch((e) => log?.warn("project_sync_merged_failed", { sourceId: fresh.id, message: e?.message ?? String(e) }))
        }
      }
    }
  }

  /** 到期扫描（§5：逐源串行——调度撞锁跳过）。 */
  async function check() {
    const rows = db.prepare("SELECT * FROM git_sources ORDER BY id").all().filter((row) => dueAt(row, now()))
    for (const row of rows) {
      if (running.has(row.id)) continue
      try {
        await execute(row, { trigger: "schedule", actor: "scheduler" })
      } catch (e) {
        log?.warn("project_sync_failed", { sourceId: row.id, message: e?.message ?? String(e) })
      }
    }
  }

  return {
    isRunning: (id) => running.has(Number(id)),
    isPending: (id) => pending.has(Number(id)),
    check,
    /** 手动「立即同步」（§2.9——进行中 ⇒ 400 人话；不成统一信封）。 */
    async syncNow(id, { actor, actorId = null } = {}) {
      const row = sourceRowOr404(db, id)
      const outcome = await execute(row, { trigger: "manual", actor, actorId })
      if (outcome.locked) throw new HttpError("invalid_request_error", "该源正在同步中，稍后再试")
      return outcome.body
    },
    /** 事件触发（§13——先回 200 受理；撞锁 ⇒ 待跑旗合并）。 */
    triggerEvent(id) {
      const row = db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(id))
      if (!row) return { accepted: false }
      execute(row, { trigger: "event", actor: "webhook", merge: true }).catch((e) => log?.warn("project_sync_event_failed", { sourceId: row.id, message: e?.message ?? String(e) }))
      return { accepted: true }
    },
    /** PAT 体检（§5——成 ⇒ `token_state='ok'`；败 ⇒ `auth` ⇒ `invalid`；两类皆写 `token_checked_at`）。 */
    async checkPat(id, { actor, actorId = null } = {}) {
      const row = sourceRowOr404(db, id)
      const started = now()
      let body = null
      let state = null
      try {
        await checkToken({ platform: row.platform, baseURL: row.base_url, token: tokenOf(row), fetchImpl, timeoutMs })
        state = "ok"
        body = { ok: true, ms: now() - started }
      } catch (e) {
        if (!(e instanceof PlatformError)) throw e
        state = e.kind === "auth" ? "invalid" : null
        body = { ok: false, error: { kind: e.kind, message: e.message }, ms: now() - started }
      }
      recordCheckResult(db, { id: row.id, at: now(), tokenState: state })
      recordAudit(db, {
        type: "project_event",
        actor,
        actorId: actorId ?? null,
        target: "",
        detail: { kind: "source_check", sourceId: row.id, ok: body.ok, ...(body.ok ? {} : { errorKind: body.error.kind }) },
        ts: now(),
      })
      return body
    },
    /** 装配接线（§5：启动即检一次 + 周期 60s；定时器 unref——不阻停机）。 */
    start() {
      void check().catch((e) => log?.warn("project_sync_check_failed", { message: e?.message ?? String(e) }))
      timer = setInterval(() => {
        void check().catch((e) => log?.warn("project_sync_check_failed", { message: e?.message ?? String(e) }))
      }, intervalMs)
      timer.unref?.()
      return timer
    },
    stop() {
      if (timer) clearInterval(timer)
      timer = null
    },
  }
}
