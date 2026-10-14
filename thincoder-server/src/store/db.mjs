/**
 * db.mjs — 库 ∥ PRAGMA ∥ 开库装配（store/STORE.md §1–§3；accounts 与 metering 共用）。
 *
 * 单库单连接（`DatabaseSync`）；结构版本 = `PRAGMA user_version`；
 * **迁移链已外提 `src/store/migrations.mjs`**（sandbox-exec-rebuild 批 · KD-SV-172/173——触发线 700 越；本档保开库/PRAGMA/版本引用；
 * 迁移段/段链/migrate/readVersion = 该档，本档原样再导出——存量引用零改）。
 * 库文件缺省 = `data/gateway.db`（运行期生成，不入 git）。
 */
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { MIGRATIONS, migrate } from "./migrations.mjs"

export { MIGRATIONS, SCHEMA_VERSION, migrate, readVersion } from "./migrations.mjs"

/** 连接级 PRAGMA（store/STORE.md §1——每次开库必设）。 */
export function applyPragmas(db) {
  db.exec("PRAGMA journal_mode = WAL")     // 读并发 + 单写者
  db.exec("PRAGMA synchronous = NORMAL")   // 进程崩溃安全；掉电丢最后若干提交（计量档位——登记在册）
  db.exec("PRAGMA busy_timeout = 5000")
  db.exec("PRAGMA foreign_keys = ON")
}

/** 开库：建父目录 → 连接 → PRAGMA → 迁移链；任何一步失败 ⇒ 关连接 + 抛（fail-closed）。 */
export function openDatabase(file, { migrations = MIGRATIONS } = {}) {
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  try {
    applyPragmas(db)
    migrate(db, { migrations })
  } catch (e) {
    db.close()
    throw new Error(`库打开失败：${file}（${e.message}）`)
  }
  return db
}
