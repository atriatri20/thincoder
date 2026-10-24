/**
 * spawn-gates.mjs — M5 委派与 spawn 门新门禁统一落点（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.3）：
 * 全部新增门禁逻辑集中于此——装配点（buildSpawnChild / normalizeFileList）只加 import 调用。
 * 已实现：F2（round 枚举 + 任务书参数校验/拼装——四项核心 + 第五项按角色）· F6（files 声明面拦截谓词）。
 * 裁撤（2026-09-17 主 agent 裁定——不落代码）：
 *   - F4 修复轮窄带：全量勘察散文 marker 不可机判（误拒风险不可接受）→ 由 F2 的 round 参数承载轮次语义；
 *   - F5 advisor 角色：advisor 不入 spawn 通道（评审走 advisor 工具）——enum 收正为
 *     explore/eng-designer/eng-coder。
 * 零依赖：本模块零 import（叶子——纯谓词层，无环、无反向依赖）。
 */

/** F2 round 合法值（初始轮 / 修正轮——「派单必带」= 无默认值）。
 * 单源：本档为唯一字面量处——schema 面（`agent-tools/subagent.mjs`）与谓词面（本档）同引用（D2）。
 */
export const ROUND_VALUES = ["initial", "fix"]

/** 任务书样例内容（供人照抄；不是门的判据——门只判存在 / 类型 / 非空）：核心四项一份，
 *  第五项按角色各一份（工程角色 = `designPoints` ∥ explore / plan / coder = `scope`）。 */
const TASK_BOOK_CORE_MIN = {
  goal: "实现批准设计（样例任务书——四项核心 + 角色第五项齐备）。",
  knownFacts: "设计已评审通过、token 已签发、批次档在册。",
  acceptance: "设计档的验收口径逐条可机验、项目验证链全绿。",
  reportFormat: "交付表 + 文件路径 + 验证命令与结果。",
}

/** 工程角色样例（核心四项 + `designPoints`）。 */
export const ENG_TASK_BOOK_MIN = { ...TASK_BOOK_CORE_MIN, designPoints: "仅落设计档受影响文件清单；禁夹带新语义。" }

/** 非工程角色样例（核心四项 + `scope`）——explore / plan / coder。 */
export const PLAIN_TASK_BOOK_MIN = { ...TASK_BOOK_CORE_MIN, scope: "只读：相关源 / 设计档；不写任何文件、不碰 bench/。" }

/**
 * F2 round 结构化参数校验（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）：
 * round 枚举（initial|fix，必带集合 = eng-coder/eng-designer）。
 * 缺 / 非法 → 抛错（派单缺陷——spawn 机械拒）。
 */
export function validateRoundParam(args) {
  const a = args ?? {}
  const missing = []
  if (!ROUND_VALUES.includes(a.round)) {
    missing.push(a.round === undefined || a.round === null
      ? `round (${ROUND_VALUES.join("|")}) — the structured round parameter`
      : `round ∈ {${ROUND_VALUES.join(", ")}} (got ${JSON.stringify(a.round)})`)
  }
  if (missing.length === 0) return
  throw new Error(
    `Engineering spawn round gate: ${missing.join(" · ")}. ` +
    `The spawn contract requires the structured round parameter (initial|fix); ` +
    `the five task-book parameters are enforced by a separate gate (validateTaskBookParams) — ` +
    `a missing or invalid round is a dispatch defect and the spawn is refused.`)
}

/**
 * F2 任务书名集（**所有 spawn 角色**）：core = 四项核心（全员必带）；fifth = 第五项两名
 * ——工程角色 = `designPoints` ∥ explore / plan / coder = `scope`。
 * 单源：本档为唯一名集处——校验 / 拼装 / 探针夹具校验一律经 `taskBookParamsFor(role)` 派生（D2）。
 * 样例对象 = `ENG_TASK_BOOK_MIN` / `PLAIN_TASK_BOOK_MIN`（供人照抄）。
 */
export const TASK_BOOK_PARAMS = {
  core: ["goal", "knownFacts", "acceptance", "reportFormat"],
  fifth: { engineering: "designPoints", plain: "scope" },
}

/** 角色 → 第五项类别（唯一判据；**与模式无关**——工程模式里的 explore 也取 plain）。
 *  未知角色取 plain：spawn 路径上角色 enum 门先拒收（`agent-tools/subagent.mjs` 的 `ROLES`），到不了本门。 */
function fifthClassOf(role) {
  return role === "eng-coder" || role === "eng-designer" ? "engineering" : "plain"
}

/** 角色 → 该角色的任务书名集（四项核心 + 第五项；序 = 拼装序：第五项插在 `knownFacts` 之后，
 *  与 C 之前 eng 角色的拼装序逐字相同——审计摘要 marker `/^Design points/i` 不受影响）。 */
export function taskBookParamsFor(role) {
  const core = TASK_BOOK_PARAMS.core
  return [...core.slice(0, 2), TASK_BOOK_PARAMS.fifth[fifthClassOf(role)], ...core.slice(2)]
}

/** 拼装标签（不导出；仅词面，不是判据——无任何匹配读它）。 */
const TASK_BOOK_LABELS = {
  goal: "Goal & why",
  knownFacts: "Known facts",
  designPoints: "Design points & forbidden scope",
  scope: "Scope (what to read / what not to touch)",
  acceptance: "Acceptance criteria",
  reportFormat: "Delivery report format",
}

/**
 * F2 任务书参数校验（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）· **所有 spawn 角色**：
 * 名集按角色取（`taskBookParamsFor(role)`）。判据只有三条——参数存在 ∧ typeof string ∧
 * trim() 非空。不读内容：无正则、无标题匹配、无双语 marker。缺 / 空白 / 非字符串 → 合并抛，
 * 文案逐项点名该参数；第五项缺失而另一名在场时，文案附一句指路（只作文案，不加判据）。
 */
export function validateTaskBookParams(args, role) {
  const a = args ?? {}
  const names = taskBookParamsFor(role)
  const fifth = TASK_BOOK_PARAMS.fifth[fifthClassOf(role)]
  const otherFifth = fifth === "designPoints" ? "scope" : "designPoints"
  const failed = []
  for (const name of names) {
    const v = a[name]
    if (v === undefined || v === null) {
      const hint = name === fifth && a[otherFifth] !== undefined && a[otherFifth] !== null
        ? ` (got ${otherFifth} instead — that name belongs to the ${fifthClassOf(role) === "engineering" ? "explore/plan/coder" : "eng-coder/eng-designer"} spawns)`
        : ""
      failed.push(`${name} — missing (the task book is four core parameters + the role's fifth)${hint}`)
    }
    else if (typeof v !== "string") failed.push(`${name} — must be a string (got ${typeof v})`)
    else if (v.trim() === "") failed.push(`${name} — blank (trim() is empty)`)
  }
  if (failed.length === 0) return
  throw new Error(
    `Spawn task-book gate (role='${role}'): ${failed.join(" · ")}. ` +
    `The task book is four core parameters (${TASK_BOOK_PARAMS.core.join(" / ")}) plus ${fifth} ` +
    `(the fifth parameter for role='${role}'); a missing, blank or non-string value is a dispatch defect and the spawn is refused.`)
}

/** 五参 → 子代理任务书文本（**非门禁**，纯拼装）：按 `taskBookParamsFor(role)` 固定序 + 标签，
 * 空值跳过，`\n\n` 分隔。拼装单源 = 本函数——子代理 input 与探针判官的「任务书全文」同源。 */
export function composeTaskBookBrief(args, role) {
  const a = args ?? {}
  const parts = []
  for (const name of taskBookParamsFor(role)) {
    const v = a[name]
    if (typeof v === "string" && v.trim() !== "") parts.push(`${TASK_BOOK_LABELS[name]}: ${v.trim()}`)
  }
  return parts.join("\n\n")
}

/**
 * F6 过程档 basename 族（父侧维护文件——AGENT-LOOP-SUBAGENT.md §6.9 R26 同族扩展）：
 * CHANGELOG.md。（台账 = 用户数据目录键控库——项目内无文件，不再入族；老台账族 todo.md /
 * todo-archive.md / checklist 族随 M2 SQLite 化 + M7 checklist 废除退役。）
 * 大小写不敏感全名匹配（路径任意层——归一化在调用点 normalizeFileList 已做）。
 */
const PROCESS_BASENAMES = new Set(["changelog.md"])

/**
 * 写域 basename（**模式无关**——#33 二道防线；`PROJECT-MANIFEST.json` 是项目级状态档，其写门对任何会话生效；设计 docs/core/design/MANIFEST.md §2.5 / KD-M1-14）：
 * PROJECT-MANIFEST.json = M1 项目状态档——写门唯主 agent（`manifest.mjs` `writeManifest` 的
 * `writer` 闸，fail-closed）；本常量 = `files` 声明面**第二道防线**（子代理无法把该路径声明为
 * 写域）。字面量（匹配前已大小写归一；**不** import `MANIFEST_REL`——保本模块「叶子·零 import」
 * 性质；单源指针 = `thincoder-core/manifest.mjs`）。**不入** `PROCESS_BASENAMES`：两族理由不同
 * ——过程档 = 父侧对账职责；本档 = 写门唯主 agent。
 */
const MANIFEST_BASENAME = "project-manifest.json"

/**
 * F6 files 声明面拦截谓词（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）：
 * scripts/*（工程工具面不入域——**层级锚定：仅仓根与直接子层**——目录名在深层不携带
 * face 信息（2026-10-14 收正：#1449——`deployment/<x>/scripts/*` 类交付物放行）——内容
 * 产物 only）与过程档（父侧职责）→ 收集全部违规后抛合并错误（fail-closed——错误即工具
 * 结果 JSON——无排队残留）。目录声明不在本谓词（normalizeFileList 循环内先行拒——错误
 * 序不变）。调用点 = normalizeFileList（subagent-scheduler.mjs——本谓词在循环后跑——
 * 目录错误先于过程档错误）。
 */
export function rejectEngineeringFilePaths(files) {
  const violations = []
  for (const f of Array.isArray(files) ? files : []) {
    const segs = String(f).replace(/\\/g, "/").split("/").filter((s) => s)
    const base = (segs[segs.length - 1] ?? "").toLowerCase()
    if (segs.slice(0, 2).some((s) => s.toLowerCase() === "scripts")) {
      violations.push(`engineering-tools face path ${f} must not be listed in files — scripts/* at the repo root or a direct child package is the engineering-tools face, not a content product (applies to every session, not engineering-mode-scoped; files carries source/test/design-doc paths only)`)
    } else if (PROCESS_BASENAMES.has(base)) {
      violations.push(`Parent-side maintained file ${f} must not be listed in files — reconciliation is the parent's duty; use the design-doc path if you need to edit a design doc`)
    } else if (base === MANIFEST_BASENAME) {
      violations.push(`Manifest file ${f} must not be listed in files — PROJECT-MANIFEST.json is the project state manifest and the main agent is its only writer (M1 write gate); this files-domain check is the second line of defense`)
    }
  }
  if (violations.length > 0) throw new Error(violations.join("\n"))
}
