/**
 * reasoning-levels.mjs — 思考档位值域桥（console-reasoning-levels 批——台账 #1303；`gateway/API.md` §2.2/§4 ∥
 * `agent/ADMIN-AGENT.md` §11.4）：值域单源 = 核 `thincoder-core/model-specs.mjs`
 * `specForModel(上游真名).reasoningEffortEnum`（运行期直读——服务端零第二清单 ∥ 零落库词表）。
 * 三消费面同经本件：`GET /api/admin/providers` 行 `modelReasoning`（稀疏图——空档零键）∥
 * 会话设置面 `PATCH …/chats/:id { reasoning }` 值域校验 ∥ 回合装配（枚举内才携 `reasoningEffort`）。
 *
 * 标识解析径（三处同经）：会话 `model` = 对外标识（别名 ∥ `provider/model`）⇒ 先经别名反查
 * （`providers.mjs`/KD-SV-59）解上游真名，再取枚举（别名模型 = 别名所指上游枚举——不另退中性）。
 *
 * 装载与注入：`@thincoder/core` **懒载**（`await import(...)`——部署前提 = 依赖声明；本仓开发/测试经注入缝
 * 替身，沿 `run.mjs` `loadCoreChat` 同式）+ 缓存单例（载失败同样缓存——不逐请求重试）。
 * **缺核 ⇒ 抛**（`CORE_MISSING_MESSAGE`）：调用侧退化（档位面退中性——`{}` ∥ 零字段 ∥ PATCH 400 人话），
 * **回合不阻断**；警告一条（模块级旗——一进程一条，`noteDegraded`）。
 */
import { providerAliasIndex } from "./providers.mjs"

/** 缺核报错文（调用侧人话面单源）。 */
export const CORE_MISSING_MESSAGE = "思考档位值域源不可用：@thincoder/core（model-specs.mjs）未装载"

let injectedSpecLookup = null // 注入缝（单元测试档替身；缺省 null ⇒ 懒载真核——生产行为不变）
let coreSpecLookup = null // 懒载缓存（真核 `specForModel`）
let coreError = null // 装载失败缓存（零重试）
let warnedDegraded = false // 缺核警告旗（一进程一条）

/** 注入（单元测试档）：`specLookup(model) ⇒ spec`（核 `specForModel` 替身形）；`null` = 复位懒载。 */
export function setReasoningLevelsDeps({ specLookup = null } = {}) {
  injectedSpecLookup = typeof specLookup === "function" ? specLookup : null
  warnedDegraded = false
}

/** 取读器（显式 override > 注入缝 > 懒载真核）：缺核 ⇒ 抛（失败缓存——不逐请求重试）。 */
async function specReader(override = null) {
  if (typeof override === "function") return override
  if (injectedSpecLookup !== null) return injectedSpecLookup
  if (coreSpecLookup === null && coreError === null) {
    try {
      const mod = await import("@thincoder/core/model-specs.mjs")
      coreSpecLookup = (model) => mod.specForModel(model)
    } catch (e) {
      coreError = e
    }
  }
  if (coreSpecLookup === null) throw new Error(`${CORE_MISSING_MESSAGE}（${coreError?.message ?? "懒载失败"}）`)
  return coreSpecLookup
}

/** 枚举归一：spec ⇒ `string[]`（缺 ∥ 非数组 ⇒ `[]` = 无档中性；数组原样透传——零改写）。 */
function levelsFromSpec(spec) {
  const levels = spec?.reasoningEffortEnum
  return Array.isArray(levels) ? levels : []
}

/** 枚举（`[]` = 无档）：`levelsOf(上游真名) ⇒ string[]`。 */
export async function levelsOf(model, { specLookup = null } = {}) {
  return levelsFromSpec((await specReader(specLookup))(String(model ?? "")))
}

/** 稀疏图（键 = 上游真名 ∥ 空档零键）：`modelReasoningMap(上游真名数组) ⇒ { [name]: string[] }`。 */
export async function modelReasoningMap(models = [], { specLookup = null } = {}) {
  const read = await specReader(specLookup)
  const out = {}
  for (const name of models) {
    const levels = levelsFromSpec(read(String(name ?? "")))
    if (levels.length > 0) out[String(name)] = levels
  }
  return out
}

/** 对外标识 ⇒ 枚举（别名反查 KD-SV-59）：未命中注册表 ⇒ `[]`（零档中性）。 */
export async function levelsOfRef(db, ref, { specLookup = null } = {}) {
  const hit = providerAliasIndex(db).lookup(String(ref ?? ""))
  if (hit === null) return []
  return levelsOf(hit.model, { specLookup })
}

/** 缺核退化警告（模块级旗——一进程一条）；出 = 本条是否发出。`error` = 失败因（携进日志——免「真核 API 漂移」与「未装载」同为一条人话不可辨）。 */
export function noteDegraded(log = null, where = "reasoning", error = null) {
  if (warnedDegraded === true) return false
  warnedDegraded = true
  log?.warn?.("reasoning_levels_core_missing", {
    where,
    cause: error === null ? null : String(error?.message ?? error),
    message: `${CORE_MISSING_MESSAGE}——档位面退中性（零档 ∥ 零字段）；生产镜像内核为声明依赖`,
  })
  return true
}
