/**
 * migrations.mjs — 结构迁移链注册表（store/STORE.md §2/§3）：
 * v1–v26 段链（append-only ∥ 每段单事务）+ `migrate` ∥ `readVersion` ∥ `SCHEMA_VERSION`；开库/PRAGMA = `db.mjs`（本档反向零依赖）。
 *
 * 拆分（publicnet 批 · 台账 #1243——触发线 700 越 + v26 越 800 硬顶）：DDL 常量按版本区间落 `./migrations/` 三档
 * （`ddl-v1-v11.mjs` ∥ `ddl-v12-v20.mjs` ∥ `ddl-v21-v26.mjs`——逐字搬迁零语义），本档只留序表 + 回填件 + 两条入口。
 * 对外导出面（`MIGRATIONS` ∥ `SCHEMA_VERSION` ∥ `migrate` ∥ `readVersion`）逐字不变——`db.mjs` 与调用方零改。
 *
 * 口径：v2–v21 段 = **纯搬移零语义**；v22 收正段 = 沙盒批；v23 增段 = member-face-chat 批（十六型）；
 * v24 增段 = server-mcp 批（十七型）；v25 = 审批免问旗；v26 增段 = publicnet 批（十八型：+ `security_event`）。
 * 结构单源 = `store/STORE.md` §2（逐段），本档不复制语义。
 */
import { DDL_V1, DDL_V10, DDL_V11, DDL_V2, DDL_V3, DDL_V4, DDL_V5, DDL_V6, DDL_V7, DDL_V8, DDL_V9 } from "./migrations/ddl-v1-v11.mjs"
import {
  DDL_V12,
  DDL_V13,
  DDL_V14,
  DDL_V15,
  DDL_V16,
  DDL_V17,
  DDL_V18,
  DDL_V19,
  DDL_V20,
} from "./migrations/ddl-v12-v20.mjs"
import { DDL_V21, DDL_V22, DDL_V23, DDL_V24, DDL_V25, DDL_V26 } from "./migrations/ddl-v21-v26.mjs"

/** v18 回填移交（存量 `keep` ∧ 成功行 ⇒ 主机行七列 + run 行密列零化 + `'moved'`——`sandbox/SANDBOX.md` §3 主机凭据块）。
 *  同类两口径：**接收行** = 逐列值（同 runner 多行 ⇒ 后者胜——id 序）∥ **未接收行**（`keep` 未成功 ∥ 密文已零化 ∥ 余既有行）⇒ 新列 NULL/`'none'`（零伪造回填）。
 *  密文原样搬运（同一 `data/credentials.key`——KD-SV-84 单源；零解密零重加密）。 */
function backfillHostCredentials(db) {
  const rows = db.prepare(`SELECT id, runner_id, ssh_port, ssh_user, auth_kind, secret_cipher, sudo_cipher, finished_at, created_at
    FROM sandbox_onboarding WHERE credential_mode = 'keep' AND status = 'succeeded' AND secret_cipher IS NOT NULL ORDER BY id`).all()
  const writeHost = db.prepare(`UPDATE sandbox_runners SET ssh_port = ?, ssh_user = ?, auth_kind = ?, secret_cipher = ?, sudo_cipher = ?,
    credential_state = 'sealed', credential_updated_at = ? WHERE id = ?`)
  const zeroRun = db.prepare(`UPDATE sandbox_onboarding SET secret_cipher = NULL, sudo_cipher = NULL, credential_state = 'moved' WHERE id = ?`)
  for (const row of rows) {
    const written = writeHost.run(row.ssh_port ?? null, row.ssh_user ?? null, row.auth_kind ?? null, row.secret_cipher, row.sudo_cipher ?? null, row.finished_at ?? row.created_at, row.runner_id)
    if (written.changes === 0) continue // 接收行不在（runner_id NULL ∥ 行已删）⇒ 留 run 行（与 live 径同判——零吞密）
    zeroRun.run(row.id)
  }
}

/** 迁移链：每段 = `{ v, up(db) }`（v = 目标结构版本，自 1 起递增）；结构每变一次追一段（+1）。 */
export const MIGRATIONS = [
  { v: 1, up: (db) => db.exec(DDL_V1) },
  { v: 2, up: (db) => db.exec(DDL_V2) },
  { v: 3, up: (db) => db.exec(DDL_V3) },
  { v: 4, up: (db) => db.exec(DDL_V4) },
  { v: 5, up: (db) => db.exec(DDL_V5) },
  { v: 6, up: (db) => db.exec(DDL_V6) },
  { v: 7, up: (db) => db.exec(DDL_V7) },
  { v: 8, up: (db) => db.exec(DDL_V8) },
  { v: 9, up: (db) => db.exec(DDL_V9) },
  { v: 10, up: (db) => db.exec(DDL_V10) },
  { v: 11, up: (db) => db.exec(DDL_V11) },
  { v: 12, up: (db) => db.exec(DDL_V12) },
  { v: 13, up: (db) => db.exec(DDL_V13) },
  { v: 14, up: (db) => db.exec(DDL_V14) },
  { v: 15, up: (db) => db.exec(DDL_V15) },
  { v: 16, up: (db) => db.exec(DDL_V16) },
  { v: 17, up: (db) => db.exec(DDL_V17) },
  { v: 18, up: (db) => { db.exec(DDL_V18); backfillHostCredentials(db) } }, // v18：主机表七列 + 四态 CHECK + 回填移交（迁移段 = 结构变 + 回填——单事务同段）
  { v: 19, up: (db) => db.exec(DDL_V19) }, // v19：`api_keys.key_plain` 增列（管理面 sk 明文面——零回填）
  { v: 20, up: (db) => db.exec(DDL_V20) }, // v20：团队台账表 + 两索引 + 审计 CHECK 重建（十五型：+ ledger_event——零回填）
  { v: 21, up: (db) => db.exec(DDL_V21) }, // v21：`git_sources.scope_kind` 增列 + 存量回填（gitee 范围三态——零猜测；非 gitee 零动）
  { v: 22, up: (db) => db.exec(DDL_V22) }, // v22：沙盒收正（工作区表重建 + `sandbox_tasks` 删表 + `registry_credentials` 建表 + 连接材料四列——列面/语义单源 = store/STORE.md §2 v22 段）
  { v: 23, up: (db) => db.exec(DDL_V23) }, // v23：成员 git 凭据表 + 审计 CHECK 重建（十六型：+ member_event——会话两表不建；语义单源 = store/STORE.md §2 v23 段）
  { v: 24, up: (db) => db.exec(DDL_V24) }, // v24：`mcp_servers` 建表 + 审计 CHECK 重建（十七型：+ mcp_event；语义单源 = store/STORE.md §2 v24 段）
  { v: 25, up: (db) => db.exec(DDL_V25) }, // v25：`agent_chats.auto_approve` 增列（审批免问旗——KD-SV-226；语义单源 = store/STORE.md §2 v25 段）
  { v: 26, up: (db) => db.exec(DDL_V26) }, // v26：审计 CHECK 重建（十八型：+ security_event——publicnet 批 · 台账 #1243；语义单源 = store/STORE.md §2 v26 段）
]

/** 当前结构版本（= 链尾段号——store/STORE.md §1）。 */
export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].v

/** 迁移：读 `user_version` ⇒ 顺序执行 `v > 当前` 的段（每段单事务 + 升号；抛错 ⇒ 回滚 + 抛）。 */
export function migrate(db, { migrations = MIGRATIONS } = {}) {
  let version = readVersion(db)
  for (const step of migrations) {
    if (step.v <= version) continue
    db.exec("BEGIN")
    try {
      step.up(db)
      db.exec(`PRAGMA user_version = ${Number(step.v)}`)
      db.exec("COMMIT")
      version = step.v
    } catch (e) {
      db.exec("ROLLBACK")
      throw new Error(`迁移失败（v${step.v}）：${e.message}`)
    }
  }
  return version
}

/** 结构版本读数（空库 ⇒ 0）。 */
export function readVersion(db) {
  return Number(db.prepare("PRAGMA user_version").get().user_version ?? 0)
}
