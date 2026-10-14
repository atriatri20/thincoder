/**
 * projects.mjs — 项目（仓）/项目成员存储 + 能力矩阵判定（project/PROJECTS.md §3「权限模型」∥ §5「加仓两径」∥
 * §14「项目删除」；team-projects-permissions 批（B2））。
 *
 * 语义（§3）：项目 = 一行一个 git 仓（一对一）；成员行 = 用户名 × 档位 × 来源；判定函数 `capabilitiesOf` =
 * 六键能力矩阵（admin 恒全量真 ∥ 负责人 = 成员管理 + 改显示名 ∥ 管理档 = +成员管理 ∥ 读写 = 写门 ∥ 只读 = 只读）；
 * 可见性 = 未授权即不可见（列表零出现 ∥ 直取 404 不辨——KD-SV-120）。地址唯一 = **跨形归一单键**（§5——http/https/ssh/scp 同键）。
 * 删除 = admin + 同事务级联（`project_members` 随删——零孤儿）+ 审计（§14）。端点面 = `routes.mjs`/`admin-routes.mjs`。
 */
import { HttpError } from "../gateway/errors.mjs"
import { findMemberByUsername } from "../accounts/members.mjs"

/** 档位三值（§3：只读 ∥ 读写 ∥ 管理）。 */
export const LEVELS = Object.freeze(["read", "readwrite", "manage"])

/** 成员用户名形（§2.9：trim 非空 ∥ ≤64 ∥ 无 `/`）。 */
export const USERNAME_MAX = 64

/** 显示名上限（形护——防无界串入库；需求未定长）。 */
export const DISPLAY_NAME_MAX = 200

/** 成员行读数（§2.9 详情 `members[]` 行形）。 */
export function memberView(row) {
  return { username: row.username, level: row.level, origin: row.origin, syncedRole: row.synced_role }
}

/** 仓地址归一（§5 **跨形单键**）：trim ∥ 去 scheme 与用户段 ∥ scp 形 `:` ⇒ `/` ∥ 去尾斜杠 + `.git` 尾 ⇒ `host[:port]/path`。 */
export function normalizeAddress(raw) {
  let text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error("仓地址不可为空")
  if (/\s/.test(text)) throw new Error(`仓地址不可含空白：${text}`)
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text) && /^[^/@\s]+@[^/:\s]+:/.test(text)) {
    text = text.replace(/^[^/@\s]+@/, "").replace(":", "/") // scp 形 `git@host:path` ⇒ `host/path`
  } else {
    text = text.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "") // 去 scheme
    text = text.replace(/^[^/@\s]*@/, "") // 去用户段
  }
  text = text.replace(/\/+$/, "").replace(/\.git$/i, "").replace(/\/+$/, "")
  const slash = text.indexOf("/")
  if (slash <= 0 || slash === text.length - 1) {
    throw new Error(`仓地址形非法：${raw}（规范形 = host[:port]/path——如 https://git.example.com/org/repo）`)
  }
  return text
}

/** 显示名缺省（§2.2：地址末段——去 `.git` 尾后取末段）。 */
export function defaultDisplayName(address) {
  const parts = String(address).split("/")
  return parts[parts.length - 1] || String(address)
}

/** 显示名归一（trim 非空 ∥ ≤200）。 */
export function normalizeDisplayName(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("显示名不可为空")
  if (name.length > DISPLAY_NAME_MAX) throw new Error(`显示名超长（≤ ${DISPLAY_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 成员用户名归一（trim 非空 ∥ ≤64 ∥ 无 `/`）。 */
export function normalizeUsername(raw) {
  const username = typeof raw === "string" ? raw.trim() : ""
  if (username === "") throw new Error("用户名不可为空")
  if (username.length > USERNAME_MAX) throw new Error(`用户名超长（≤ ${USERNAME_MAX} 字符；实长 ${username.length}）`)
  if (username.includes("/")) throw new Error(`用户名不可含 "/"：${username}`)
  return username
}

/** 档位归一（三值枚举）。 */
export function normalizeLevel(raw) {
  const level = typeof raw === "string" ? raw.trim() : ""
  if (!LEVELS.includes(level)) throw new Error(`档位非法：${JSON.stringify(raw ?? null)}（合法值：${LEVELS.join(" ∥ ")}）`)
  return level
}

/**
 * 能力矩阵判定（§3 判定函数逐值）：出 = `{ level, owner, admin, can: { view, write, manageMembers, rename, editAddress, delete } }`。
 * 六键语义 = §3 表（admin 全真 ∥ 负责人 = 成员管理 + 改显示名，地址/删除除外 ∥ 管理档 = 成员管理 ∥ 读写 = 写门 ∥ 只读 = 只读）。
 */
export function capabilitiesOf(db, member, project) {
  const admin = member?.role === "admin"
  const username = typeof member?.username === "string" ? member.username : ""
  const owner = Boolean(project?.owner_username) && username !== "" && project.owner_username.toLowerCase() === username.toLowerCase()
  const row = username === "" || !project ? null : db.prepare("SELECT level FROM project_members WHERE project_id = ? AND username = ?").get(project.id, username)
  const level = row?.level ?? null
  return {
    level,
    owner,
    admin,
    can: {
      view: admin || owner || level !== null,
      write: admin || owner || level === "readwrite" || level === "manage",
      manageMembers: admin || owner || level === "manage",
      rename: admin || owner,
      editAddress: admin,
      delete: admin,
    },
  }
}

/** 可见性门（KD-SV-120）：非成员/非负责人/非 admin ⇒ **404 不辨**（消息「项目不存在或不可见」）；出 = `{ row, caps }`。 */
export function projectOr404(db, member, id) {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", "项目不存在或不可见")
  const caps = capabilitiesOf(db, member, row)
  if (!caps.can.view) throw new HttpError("not_found", "项目不存在或不可见")
  return { row, caps }
}

/** 能力门（403 人话——判据句 2/4/5/6；页面显隐非判据）。 */
export function requireCapability(caps, key, message) {
  if (!caps.can[key]) throw new HttpError("forbidden", message)
}

/** `LIKE` 子串模式（`%`/`_`/`\` 转义——`ESCAPE '\'` 消费）。 */
function likePattern(q) {
  return `%${String(q).replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`
}

/** 可见项目列表（§2.9 行：admin ⇒ 全量 ∥ 其余 ⇒ 成员行 ∪ 负责人命中集——恒过滤；`q` = 显示名/地址子串）。 */
export function listVisibleProjects(db, member, { q = null } = {}) {
  const admin = member?.role === "admin"
  const username = typeof member?.username === "string" ? member.username : ""
  const where = []
  const args = []
  if (!admin) {
    where.push("(EXISTS (SELECT 1 FROM project_members m WHERE m.project_id = p.id AND m.username = ?) OR (p.owner_username IS NOT NULL AND p.owner_username = ? COLLATE NOCASE))")
    args.push(username, username)
  }
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : null
  if (search !== null) {
    where.push("(p.display_name LIKE ? ESCAPE '\\' OR p.address LIKE ? ESCAPE '\\')")
    args.push(likePattern(search), likePattern(search))
  }
  const rows = db
    .prepare(`SELECT p.* FROM projects p ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.id`)
    .all(...args)
  const readings = batchReadings(db, rows, member) // 一次装配（成员数/源/我的档位——免 N+1）
  return rows.map((row) => projectView(db, row, member, readings))
}

/** 批取读数（成员数 ∥ 源 ∥ 我的档位——免 N+1）。 */
function batchReadings(db, rows, member) {
  const ids = rows.map((row) => row.id)
  const counts = new Map()
  const mine = new Map()
  const sources = new Map()
  if (ids.length > 0) {
    const marks = ids.map(() => "?").join(",")
    for (const item of db.prepare(`SELECT project_id, COUNT(*) AS n FROM project_members WHERE project_id IN (${marks}) GROUP BY project_id`).all(...ids)) {
      counts.set(item.project_id, Number(item.n))
    }
    const username = typeof member?.username === "string" ? member.username : ""
    if (username !== "") {
      for (const item of db.prepare(`SELECT project_id, level FROM project_members WHERE username = ? AND project_id IN (${marks})`).all(username, ...ids)) {
        mine.set(item.project_id, item.level)
      }
    }
    const sourceIds = [...new Set(rows.map((row) => row.source_id).filter((id) => id !== null && id !== undefined))]
    if (sourceIds.length > 0) {
      const sourceMarks = sourceIds.map(() => "?").join(",")
      for (const item of db.prepare(`SELECT id, name, platform FROM git_sources WHERE id IN (${sourceMarks})`).all(...sourceIds)) {
        sources.set(item.id, { id: item.id, name: item.name, platform: item.platform })
      }
    }
  }
  return { counts, mine, sources }
}

/** 项目行形（§2.9 列表行 = 详情 `project` 同形）：`{ id, displayName, address, source, owner, level, memberCount }`。 */
export function projectView(db, row, member, readings = null) {
  const batch = readings ?? batchReadings(db, [row], member)
  return {
    id: row.id,
    displayName: row.display_name,
    address: row.address,
    source: row.source_id === null || row.source_id === undefined ? null : batch.sources.get(row.source_id) ?? null,
    owner: row.owner_username,
    level: batch.mine.get(row.id) ?? null,
    memberCount: batch.counts.get(row.id) ?? 0,
  }
}

/** 详情（§2.9）：`{ project（行形）, members[], my{ level, owner, admin, can } }`。 */
export function detailOf(db, row, member) {
  const caps = capabilitiesOf(db, member, row)
  const members = db.prepare("SELECT * FROM project_members WHERE project_id = ? ORDER BY id").all(row.id).map(memberView)
  return { project: projectView(db, row, member), members, my: caps }
}

/** 地址撞库判据（归一键 —— 唯一约束的人话化：重复挂仓拒——AC-44①）；`excludeId` = 排自身（改址回同一键 = 零改动——不算「撞他仓」）。 */
function duplicateAddresses(db, candidates, { excludeId = null } = {}) {
  const dup = new Set()
  const seen = new Set()
  for (const address of candidates) {
    if (seen.has(address)) dup.add(address)
    seen.add(address)
  }
  const check = db.prepare("SELECT id FROM projects WHERE address = ? AND (? IS NULL OR id <> ?)")
  for (const address of seen) {
    if (check.get(address, excludeId, excludeId)) dup.add(address)
  }
  return dup
}

/**
 * 加仓两形一件（§2.9 `POST /api/admin/projects`）：① `{ sourceId, repos: [{ address, displayName? }] }`（批量——勾选提交）
 * ∥ ② `{ address, displayName?, owner? }`（手输保底——源缺省 NULL）。**全成或全拒**（撞重复 ⇒ 抛 400 列重复项、零落库）。
 * 出 = `{ rows, audits }`（audits = 逐项目 `project_add` 行素材——调用面落库）。
 */
export function createProjects(db, { member, input = {}, now = Date.now() } = {}) {
  const body = input !== null && typeof input === "object" ? input : {}
  const batchForm = Object.hasOwn(body, "repos")
  const drafts = []
  let sourceId = null
  if (batchForm) {
    const repos = body.repos
    if (!Array.isArray(repos) || repos.length === 0) throw new Error("批量加仓须携 repos（非空数组——勾选提交）")
    sourceId = Number(body.sourceId)
    const source = db.prepare("SELECT id FROM git_sources WHERE id = ?").get(sourceId)
    if (!source) throw new Error(`源不存在：${body.sourceId}（先添源或走手输保底）`)
    for (const item of repos) {
      const address = normalizeAddress(item?.address)
      drafts.push({ address, displayName: normalizeDisplayName(item?.displayName ?? defaultDisplayName(address)), owner: null })
    }
  } else {
    const address = normalizeAddress(body.address)
    let owner = null
    if (Object.hasOwn(body, "owner") && body.owner !== null && String(body.owner).trim() !== "") {
      const target = findMemberByUsername(db, String(body.owner).trim())
      if (!target) throw new Error(`负责人须为现存成员：${String(body.owner).trim()}`)
      owner = target.username
    }
    drafts.push({ address, displayName: normalizeDisplayName(body.displayName ?? defaultDisplayName(address)), owner })
  }
  const dup = duplicateAddresses(db, drafts.map((draft) => draft.address))
  if (dup.size > 0) throw new Error(`重复挂仓：${[...dup].join(" ∥ ")}（仓地址唯一——跨形归一后同键；零落库）`)
  const createdAt = new Date(now).toISOString()
  const rows = []
  const audits = []
  db.exec("BEGIN")
  try {
    for (const draft of drafts) {
      const info = db
        .prepare("INSERT INTO projects (source_id, address, display_name, owner_username, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(sourceId, draft.address, draft.displayName, draft.owner, member?.id ?? null, createdAt)
      const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(info.lastInsertRowid))
      rows.push(row)
      audits.push({ projectId: row.id, displayName: row.display_name, sourceId: sourceId })
      if (draft.owner !== null) {
        db.prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, 'manage', 'manual', NULL, ?, ?)").run(
          row.id,
          draft.owner,
          createdAt,
          createdAt,
        )
      }
    }
    db.exec("COMMIT")
  } catch (e) {
    db.exec("ROLLBACK")
    throw e
  }
  return { rows, audits }
}

/** 项目改一件（§2.9 `PATCH /api/projects/:id`——一次一件）：`displayName`（负责人 ∥ admin）∥ `address`（仅 admin）∥ `owner`（仅 admin，须命中现存成员）。出 = `{ row, keys, values }`。 */
export function updateProject(db, { capability, project, input = {}, now = Date.now() } = {}) {
  const body = input !== null && typeof input === "object" ? input : {}
  const present = ["displayName", "address", "owner"].filter((key) => Object.hasOwn(body, key))
  if (present.length !== 1) throw new Error("项目改一次一件（displayName ∥ address ∥ owner）")
  const key = present[0]
  const values = {}
  let next = { display_name: project.display_name, address: project.address, owner_username: project.owner_username }
  if (key === "displayName") {
    requireCapability(capability, "rename", "改显示名需负责人或管理员")
    values.displayName = normalizeDisplayName(body.displayName)
    next.display_name = values.displayName
  } else if (key === "address") {
    requireCapability(capability, "editAddress", "改仓地址仅管理员")
    const address = normalizeAddress(body.address)
    if (duplicateAddresses(db, [address], { excludeId: project.id }).size > 0) throw new Error(`重复挂仓：${address}（仓地址唯一——跨形归一后同键；零落库）`)
    values.address = address
    next.address = address
  } else {
    if (capability.admin !== true) throw new HttpError("forbidden", "指派负责人仅管理员")
    const username = normalizeUsername(body.owner)
    const target = db.prepare("SELECT username FROM project_members WHERE project_id = ? AND username = ?").get(project.id, username)
    if (!target) throw new Error(`负责人须为该项目现存成员：${username}`)
    values.owner = target.username
    next.owner_username = target.username
  }
  db.prepare("UPDATE projects SET display_name = ?, address = ?, owner_username = ? WHERE id = ?").run(next.display_name, next.address, next.owner_username, project.id)
  return { row: db.prepare("SELECT * FROM projects WHERE id = ?").get(project.id), keys: present, values }
}

/** 成员行 or 404（同名不辨大小写——NOCASE 唯一）。 */
function memberRowOr404(db, projectId, username) {
  const row = db.prepare("SELECT * FROM project_members WHERE project_id = ? AND username = ?").get(projectId, username)
  if (!row) throw new HttpError("not_found", `成员不存在：${username}`)
  return row
}

/** 负责人保护（§3 判据句 5）：目标 = 负责人 ∧ 非 admin ⇒ 403。 */
function guardOwner(project, member, targetRow) {
  if (member?.role === "admin") return
  if (project.owner_username && targetRow.username.toLowerCase() === project.owner_username.toLowerCase()) {
    throw new HttpError("forbidden", "负责人不可被非管理员移除或降档")
  }
}

/** 加成员（§2.9：负责人 ∥ 管理档 ∥ admin）；同名已在 ⇒ 400；出 = 成员行读数。 */
export function addMember(db, { project, input = {}, now = Date.now() } = {}) {
  const username = normalizeUsername(input?.username)
  const level = normalizeLevel(input?.level)
  if (db.prepare("SELECT id FROM project_members WHERE project_id = ? AND username = ?").get(project.id, username)) {
    throw new Error(`成员已存在：${username}（改档请走改档径）`)
  }
  const at = new Date(now).toISOString()
  db.prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, ?, 'manual', NULL, ?, ?)").run(
    project.id,
    username,
    level,
    at,
    at,
  )
  return memberRowOr404(db, project.id, username)
}

/** 改档（§2.9：同权 + 负责人保护）；出 = 成员行读数。 */
export function setMemberLevel(db, { project, member, input = {}, now = Date.now() } = {}) {
  const target = memberRowOr404(db, project.id, normalizeUsername(input?.username ?? input?.target))
  const level = normalizeLevel(input?.level)
  guardOwner(project, member, target)
  db.prepare("UPDATE project_members SET level = ?, updated_at = ? WHERE id = ?").run(level, new Date(now).toISOString(), target.id)
  return memberRowOr404(db, project.id, target.username)
}

/** 移除成员（§2.9：同权 + 负责人保护）；出 = 被删行读数。 */
export function removeMember(db, { project, member, username } = {}) {
  const target = memberRowOr404(db, project.id, normalizeUsername(username))
  guardOwner(project, member, target)
  db.prepare("DELETE FROM project_members WHERE id = ?").run(target.id)
  return target
}

/** 项目删除（§14：`project_members` 同事务随删——零孤儿；出 = 被删项目行 + memberCount）。 */
export function deleteProject(db, { project } = {}) {
  const memberCount = Number(db.prepare("SELECT COUNT(*) AS n FROM project_members WHERE project_id = ?").get(project.id).n)
  db.exec("BEGIN")
  try {
    db.prepare("DELETE FROM project_members WHERE project_id = ?").run(project.id)
    db.prepare("DELETE FROM projects WHERE id = ?").run(project.id)
    db.exec("COMMIT")
  } catch (e) {
    db.exec("ROLLBACK")
    throw e
  }
  return { row: project, memberCount }
}
