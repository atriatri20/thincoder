/**
 * subagent-spawn.mjs — spawn 路径装配（2026-09-05 module-split：subagent.mjs 726
 * > 500 硬限——spawn 前置 helpers（effectiveSubagentModel/resolveDesignSlot——审计块
 * 构造器 2026-09-22 起另立 ./audit-block.mjs）+ AGENT-LOOP-SUBAGENT.md §6.9 调度参数准入（prepareScheduling）+ child 装配
 * （buildSpawnChild）verbatim 迁入（仅闭包变量参数化），语义零变；executeAsyncSpawn
 * 另在 subagent-run.mjs。subagent.mjs execute 经本文件 import 调用。
 * 2026-09-07：executeConsumeDesignAction 消费执行器（token 链终消费制——与 spawn 侧
 * slot 族同域——ENGINEERING-MODE.md §2.6 F1——removeDesignTokenSlot 自 token-ttl.mjs）。
 * 2026-09-22（台账 #23 · AGENT-LOOP-SUBAGENT.md §6.26）：审计块构造器外提 `./audit-block.mjs`；
 * spawn 级固定机制性指令改走 system 固块（`child._spawnSystemBlock` 单点绑定——消费点 = 核
 * `prepareRun`），`input` 只留任务书。2026-10-24（§6.22）：工程角色 `input` = 一行机械任务书行
 * （批档绝对路径 + §2 指向句），任务书本体由子代理自读 §2。
 */

import { relative } from "node:path"
import {
  createAgent,
  readonlyToolNames, escapeXml, excludeSubagentTools,
} from "../agent.mjs"
import { allocRelay, wrapChildCallbacks, relayPrefixOf, chargeDesignerSurveySpawn, rootAgentOf } from "../agent/spawn-child.mjs"
// B8（TOOLS.md §6.29 ④）：eng 两角色的受限父历史（同名 `read_history`，只在 extraTools 注入）
import { makeBatchHistoryTool, recordBatchHistoryStart } from "./read-history.mjs"
// B4（TOOLS.md §6.29 ①）：只读角色的 action 级变体派生（构造器单源 = `agent/helpers.mjs`，
// 判据单源 = `agent/dispatch-gates.mjs` 的 `readonlyActionOf`）。
import { deriveReadonlyTools } from "../agent/helpers.mjs"
import { readonlyActionTest } from "../agent/dispatch-gates.mjs"
// TUI-OOM-ROOTCAUSE（AGENT-LOOP.md §6.15）：子代理人读线窗口常量单源（store 零依赖）。
import { RECORD_WINDOW_MESSAGES } from "../session-store.mjs"
import { validateDesignToken } from "./advisor.mjs"
import { tokenExpired, removeDesignTokenSlot, reconcileEngTokensFromSlot } from "../token-ttl.mjs"
import { resolveChildProvider, buildChildRunOpts, enqueueAsk } from "./subagent-async.mjs"
import { nextSubagentId } from "./subagent-scheduler.mjs"
import {
  normalizeFileList, describeBlockers, assertNoDepCycle, depInfo, batchDocInFlight,
} from "./subagent-scheduler.mjs"
// M5 F2（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.3）：任务书 round 枚举 + 五项结构化参数校验/拼装本体落
// spawn-gates.mjs（纯谓词零依赖）——本处只加 import 调用。
import {
  validateRoundParam, validateTaskBookParams, composeTaskBookBrief,
  isEngineeringRole, rejectEngFreeTextParams,
} from "./spawn-gates.mjs"
// 台账 #23（AGENT-LOOP-SUBAGENT.md §6.26 · D23-3）：审计块构造器外提（`buildAuditBlock` 纯函数）
// ——spawn 档只做「收集 + 绑定」；块文本逐字搬移（D23-4）。
import { buildAuditBlock } from "./audit-block.mjs"
// 批次档路径解析单源（BATCH-RECORD.md §4.15 · 台账 #287）：门内解析改经叶档（读面非抛形），
// 与 append / create 同源——门判据仍「参数在 + 路径可读」，错误文案逐字零变。
import { resolveBatchReadPath, resolveBatchReadResult } from "./batch-paths.mjs"
// `files` 落点单源 = 统一解析层（实调点 = `normalizeFileList`——`thincoder-core/agent-tools/subagent-scheduler.mjs`
// 的 `const abs = resolvePathTarget(cwd, f, ...)`）：本档不再预解析（预解析会让该面的三条门判吃绝对形而漏判）。
import { danglingSameNameHint } from "../path-resolve.mjs"
// S5 文档坐标行（AGENT-LOOP-SUBAGENT.md §6.61）：三层坐标的取数三件（读档 ∥ 缺键判别 ∥ 路径解析）
// 全走既有出口——本档零新解析、零新导出。`manifest.mjs` 早已在本档静态闭包内（`./batch-paths.mjs`
// 同引），本行不新开依赖边。
import { readManifest, docRootBase, docRootPaths } from "../manifest.mjs"

/** 不可读拒文的追加提示（§2.6：既有文案逐字在前）——同名候选 ∥ 判不出唯一的候选全列；无提示 ⇒ 空串。 */
function unreadableHint(cwd, given) {
  const r = resolveBatchReadResult(cwd, given)
  if (r.state === "dangling") {
    const hint = danglingSameNameHint(r)
    return hint ? `；${hint}` : ""
  }
  if (r.state === "ambiguous") return `；Candidates: ${r.candidates.join(" ∥ ")}`
  return ""
}

/** 任务书播报文本：该角色名集拼装 + 可选 task 自由文本（拼装空 ⇒ 原 task 逐字——旧形零变）。 */
function taskBriefOf(args, role) {
  const composed = composeTaskBookBrief(args, role)
  if (!composed) return args.task
  const extra = typeof args.task === "string" ? args.task.trim() : ""
  return extra ? `${composed}\n\n${extra}` : composed
}

/** 原 #309 任务书 token 观测（`child:batchdoc-ref`）已废止——2026-10-24 用户裁定
 *  「不允许跨批引用」后，工程角色 input 只剩一行机械文本，扫描对象失效；无场景分支不留
 *  （AGENT-LOOP-SUBAGENT.md §6.29.3）。 */

/**
 * Effective subagent model override for a role (CLI parity shared with VS Code):
 * priority — subagent tool `model` arg > config.agent.subagentModels[role] > config.agent.subagentModel > null (inherit parent).
 * The literal "default" (case-insensitive) means "no tool-arg override → run the
 * chain" — same as omitting the parameter (2026-09-05 user ruling).
 */
export function effectiveSubagentModel(parent, role, modelArg) {
  // "default" alias (2026-09-05 user ruling — ARCHITECTURE.md 子 agent 模型指定):
  // the literal "default", matched case-insensitively, explicitly declares "no
  // override at the tool-arg level → run the default priority chain" (type-level
  // subagentModels[role] → global subagentModel → null = inherit parent). It is
  // equivalent to omitting the parameter / passing ""/null/undefined (which fall
  // through below). Any other value still overrides.
  if (modelArg && String(modelArg).toLowerCase() !== "default") return modelArg
  const cfg = parent.config?.agent ?? {}
  return cfg.subagentModels?.[role] ?? cfg.subagentModel ?? null
}

/**
 * Resolve the design-token slot for an eng-coder spawn (2026-09-01 multi-design, FR3):
 * - designId given → exact slot lookup (no match = explicit error, never a fuzzy guess)
 * - designId omitted → exactly ONE slot must exist (single-design compatibility); with
 *   multiple slots we refuse rather than pick one (T16: never silently aim the wrong design)
 * Returns { token } on success; throws with a parent-actionable message otherwise.
 * R16 (2026-09-06): the slot Map is the authority; the format/TTL check itself stays in
 * validateDesignToken (2026-09-06: HMAC 防伪层已删——token 为无签名流程凭证——见
 * ENGINEERING-MODE.md 2026-09-06 段）。
 * DESIGN-TOKEN-SETTLEMENT D2（2026-09-08）：内存 Map miss（指定 designId 不在 / 空 Map）
 * 时回读槽文件权威台账 reconcile + 判定（reconcileEngTokensFromSlot——与 dispatch 写门
 * D3 同源）——覆盖"进程重启后槽有但 Map 未及回填/缓存与槽不一致"（槽文件 = 权威台账）。
 * TTL 过滤保留（reconcile 只并入未过期项）。单值镜像 `_engDesignToken` 已随 D3 退役——
 * 本门禁不再读镜像（AC3 零命中）。
 */
export function resolveDesignSlot(parent, designIdArg) {
  let slots = parent._engDesignTokens
  const hasSlots = slots instanceof Map && slots.size > 0
  // D2：内存 miss（指定 designId 不在 或 空 Map）→ 权威槽回读 reconcile + 判定
  if (designIdArg ? !(hasSlots && slots.has(designIdArg)) : !hasSlots) {
    const rec = reconcileEngTokensFromSlot(parent)
    if (rec && rec !== slots) slots = rec
  }
  // F2d: both refusal branches carry the HELD id list — after a
  // persistence restore the parent has no digest to look the id up in; the error
  // list is the only discovery path (ids are not credentials — the token is).
  const size = slots instanceof Map ? slots.size : 0
  const heldIds = size > 0 ? [...slots.keys()].join(", ") : "(none)"
  if (designIdArg) {
    if (!(slots instanceof Map) || !slots.has(designIdArg)) {
      throw new Error(`designId not found — no approved design review holds this id. Run advisor with type='design' again and pass the designId echoed with the token. (session holds ${size} approved design slot(s); held design ids: ${heldIds})`)
    }
    return { token: slots.get(designIdArg) }
  }
  if (size > 1) {
    throw new Error(`Multiple approved designs in this session (${size}) — pass the designId parameter (echoed with each token) to choose which design this eng-coder spawn belongs to. Held design ids: ${heldIds}`)
  }
  if (size === 1) return { token: [...slots.values()][0] }
  throw designTokenRefusal("missing")
}

/**
 * consume-design 动作执行器（2026-09-07 token 链终消费制——ENGINEERING-MODE.md §2.6 F1）：
 * 父侧验收核销时显式调用——读槽值 → removeDesignTokenSlot（移除该 designId 槽）→ 消费后同
 * designId 再 spawn = resolveDesignSlot not found 机械拒；落盘失败回滚内存槽 + 抛错
 * （不留半消费态，可重试——D1 评审 #1 同款失败语义）。
 * 2026-10-07 批 ledger-tool（#927 并入）：选择器扩展（designIds / expired / olderThanDays——
 * 恰一，fail-closed）+ 清点面 `design-slots` 落 `./design-slots.mjs`（清点 / 批量选择 / 消费核
 * 单源迁入——单枚形态拒文 / 回执逐字不变）；本处仅保本档 import 面（subagent.mjs / 既有消费点零改）。
 */
export { executeConsumeDesignAction } from "./design-slots.mjs"

// ── spawn 调度参数准入（AGENT-LOOP-SUBAGENT.md §6.9 D-SD1/D-SD3）────────────
// files/dependsOn 声明即契约（v1：不做任务书文本自动解析——不可靠）。缺省（两者皆
// 缺）= 既有语义零改动（不参与冲突检测/无校验——legacy spawn 零开销直通）。
// 校验序：参数形态 → 依赖 unknown id（非 consumed 墓碑——T-SD10）→ 依赖环可达
// （T-SD5——防御断言：自然流程不可达）→ 等待态判定。判定结果：wait/depc 阻塞 →
// async 入 queued 等位（spawn 返回带 reason——D-SD3b）；**sync spawn（async:false）
// 命中阻塞 → 明确错误——不队列化 sync——sync 语义零变更（round2 #7——T-SD13）**。
/** 准入（参数化提取——2026-09-05 module-split）：返回归一化 { files, dependsOn }。
 *  filesRaw 目录声明 fail-closed（检测器 throw → 错误即工具结果 JSON）。 */
export function prepareScheduling(parent, filesRaw, dependsRaw, wantAsync) {
  const files = []
  if (filesRaw !== undefined && filesRaw !== null) {
    try {
      files.push(...normalizeFileList(filesRaw, parent.cwd))
    } catch (e) {
      return { files: [], dependsOn: [], errorJson: JSON.stringify({ status: "error", error: e.message }) }
    }
  }
  if (filesRaw !== undefined && filesRaw !== null && !Array.isArray(filesRaw)) {
    throw new Error("subagent files must be an array of file paths (the write domain this task declares)")
  }
  const dependsOn = []
  if (dependsRaw !== undefined && dependsRaw !== null) {
    if (!Array.isArray(dependsRaw)) throw new Error("subagent dependsOn must be an array of async subagent ids (from prior spawn returns)")
    for (const d of dependsRaw) {
      if (typeof d !== "string" && typeof d !== "number") {
        throw new Error(`subagent dependsOn entries must be async subagent ids — got ${JSON.stringify(d)}`)
      }
      dependsOn.push(String(d))
    }
  }
  if (files.length > 0 || dependsOn.length > 0) {
    for (const d of dependsOn) {
      if (depInfo(parent, d).state === "unknown") {
        throw new Error(`subagent dependsOn: unknown async subagent id: ${d} — dependsOn references ids from prior async spawn returns; an id already consumed (auto-delivered to the model) counts as satisfied, anything else is a mistake`)
      }
    }
    assertNoDepCycle(parent, dependsOn)
    const block = describeBlockers(parent, { _files: files, _dependsOn: dependsOn })
    if (!wantAsync && block.kind !== "slot") {
      throw new Error(`sync spawn (async:false) cannot queue behind a scheduling conflict: ${block.detail} — pass async:true to queue the task (the scheduler starts it when the blockers clear), or wait for them to finish first`)
    }
  }
  return { files, dependsOn, errorJson: null }
}

/** S4 写域行（AGENT-LOOP-SUBAGENT.md §6.26「写域行（S4）」）：表头 + 逐条绝对路径 + 两句语义——
 *  本档局部纯函数（D23-9：不外提模块）。两句不可省：缺① 子代理读成「我只能写这些」⇒ 该写的漏掉；
 *  缺② 仍把任务书 §2 全文当成自己的改动面（本块的病因）。清单不截断——截断正是本块要消除的
 *  「看不见」。返回块文本（块间分隔由装配侧 `join("\n\n")` 施加）。 */
function filesBlockOf(files) {
  return `Files declared for this spawn (the write domain this task declares, for scheduling):\n` +
    files.map((f) => `- ${f}`).join("\n") +
    `\n\nThis list is not an authorization boundary: touching a file outside it is allowed — report every out-of-list file you changed, with its reason. It is also not the whole change surface: other spawns on this task declare their own files, and what is listed here is your share only.`
}

/** §6.61 契约 ② 的两件常量：层键固定 = 这三层（`specs` ∥ `modules` ∥ `standards` 不读——多的层每发再付
 *  一次 token，KD-DC3）；前缀逐字（英文——与兄弟块同语体），层串接在其后。 */
const DOCS_COORDINATE_KEYS = ["requirements", "design", "batches"]
const DOCS_COORDINATE_PREFIX = "Docs (project-root relative, declared by this project's PROJECT-MANIFEST.json docRoot):"

/** S5 文档坐标行（AGENT-LOOP-SUBAGENT.md §6.61「子代理文档坐标行」）：本项目 manifest 声明的三层
 *  文档坐标（`requirements` ∥ `design` ∥ `batches`），项目根相对形，一行随 system 固块下发；
 *  未声明的层呈现 `(undeclared)`。
 *
 *  **「未声明」的判别单源 = `readManifest` 同次返回的 `missingKeys`**——它在**原始档**上算得，与补默认
 *  后的值分属两个事实。不能看返回的 `manifest.docRoot[键]` 判：`readManifest` 的返回值已 `fillDefaults`，
 *  `docs/design` 这类默认路径与一条真声明同形，打出去就是把项目从未声明的坐标当声明发给子代理
 *  （KD-DC2——比不发更坏，它看起来像声明）。
 *
 *  **读不出（缺档 ∥ 坏档 ∥ 校验不过 ∥ 读抛 ∥ 项目根解析链 I/O 异常）⇒ 返回 null，调用点不推块**：不加本行
 *  的结果 = 本批之前的行为，业务结果零变（KD-DC4；这不是兜底式静默——坐标取不到不该赔掉一次 spawn）。
 *
 *  **护栏宽度 = 整段坐标计算**（读档 + 基数解析 + 路径映射 + 串拼装），不是只包读档那一句（§6.61.2 ④ ·
 *  AC-DC-8）：基数取法 `docRootBase(cwd)` 走项目发现链，而树根那一环 `owningProject` 的 `statSync` 无护栏
 *  ⇒ 该链的 I/O 异常照原样上抛；只包读档那一句，「读不出不赔掉一次 spawn」就只兑现一半。
 *
 *  本档局部纯函数（D23-9：不外提模块——块文本一行、无逐字跨档消费者）。返回块文本 ∥ null。 */
function docsCoordinatesBlockOf(cwd) {
  try {
    const read = readManifest(cwd)
    if (!read.ok || !read.manifest) return null // 缺档 ∥ 坏 JSON ∥ 校验不过（契约 ③ 读档格）
    const missing = new Set(read.missingKeys ?? [])
    // 整键缺 ∥ 非对象 ⇒ 三层皆按未声明。**不另设「三层全未声明」分支**：它就是下面这条逐层判据连用三次。
    const wholeUndeclared = missing.has("docRoot")
    const base = docRootBase(cwd)
    const layers = DOCS_COORDINATE_KEYS.map((key) => {
      if (wholeUndeclared || missing.has(`docRoot.${key}`)) return `${key} = (undeclared)`
      const value = read.manifest.docRoot?.[key]
      // 显式「本面无」（`null`）与缺键同呈现：`docRootPaths(null) = []` 已定那一读（MANIFEST.md §2.7）。
      if (value === null || value === undefined) return `${key} = (undeclared)`
      // 路径一律项目根相对、`/` 分隔；解析为空（声明 = 项目根自身）呈现为 `.`。
      const roots = docRootPaths(value, cwd).map((abs) => relative(base, abs).replaceAll("\\", "/") || ".")
      return `${key} = ${roots.join(", ")}`
    })
    return `${DOCS_COORDINATE_PREFIX} ${layers.join(" · ")}`
  } catch {
    // 读档非 ENOENT 读错（权限 ∥ 目录等）· 项目根解析链的 I/O 异常：一律收成「读不出」（契约 ④）
    return null
  }
}

/**
 * AGENT-LOOP-SUBAGENT.md §6.9 准入通过后的 child 装配（2026-09-05 module-split——自 execute 参数化提取，
 * 原 318-488 段 verbatim——语义零变）。副作用保留：relay 取号（sync 支 allocRelay——
 * `[model]` 出生声明归 SYNC-CANCEL 单点，#133）/ 子代理 _logId / _engTaskInput 携带 /
 * _spawnSystemBlock 绑定（台账 #23——spawn 固块单点）全部在此发生。返回阻塞/异步两路径共用的
 * { child, input, childOpts, childRunOpts, relayPrefix, childProvider }。
 */
export function buildSpawnChild(parent, ctx, args, role, wantAsync, files, dependsOn, engAuditAttempt) {
  // Provider/model override: tool `model` arg > subagentModels[role] > subagentModel > parent provider
  const childProvider = resolveChildProvider(parent, effectiveSubagentModel(parent, role, args.model))
  // 工程角色（任务书 = 批次档 §2，零任务书文本参数）——AGENT-LOOP-SUBAGENT.md §6.22.1。
  const engineeringRole = isEngineeringRole(role)

  // ── batchDoc gate（ENGINEERING-MODE.md §2.12 + §2.15 D1——FR20 #9 机械面）────────
  // 工程模式下 spawn 工程角色（**eng-coder / eng-designer**——第 2 批扩为角色集合）必传
  // 批次档路径（需求 §1.11 铁律 #5 随件传递的机械面）。落点 = 本装配点（token 门之前）：
  // sync 与 async 两条 spawn 路径都经过 buildSpawnChild——一处校验双路生效，错误出口与
  // token 门一致（§2.13.1 选型 A）。
  // 路径语义照 `files` 先例：cwd 相对或绝对均可，`\` 归一为 `/`；解析序单源 = §4.15（cwd → 项目根 →
  // 逐基底，读面取首个可读）——cwd 非项目根时根相对串不再必拒（BR-29/BR-33）。错误文案带
  // **实际角色名**（§2.15 越界文案参数化——designer 撞门时不误导）与逐字不可读后缀。
  // §4.16（2026-10-09）：coder（普通模式）**可选**携 `batchDoc`——非强制（「spawn 强制 batchDoc」=
  // 工程专属、不移植）；传则须可读（同评审面判据）⇒ `child._batchDoc` 绑定 §5 记录通道；
  // 未携 ⇒ 不绑定、照常 spawn。
  let batchDocAbs = null
  if (engineeringRole) {
    const given = typeof args.batchDoc === "string" ? args.batchDoc.trim() : ""
    // 「无果 ⇒ 既有文案 + 追加同名候选」（§2.6——既有拒文逐字在前，层的提示只追加）。
    const refusal = (suffix = "") => new Error(
      `batchDoc is required for role='${role}' — pass the batch record path (e.g. <repo>/docs/batches/<batch>-<topic>.md; relative paths resolve against the session cwd first, then candidate project roots — or absolute); spawn refused without it.` + suffix)
    if (!given) throw refusal()
    batchDocAbs = resolveBatchReadPath(parent.cwd, given)
    if (!batchDocAbs) throw refusal(` (given path is not a readable file${unreadableHint(parent.cwd, given)})`)
  } else if (role === "coder") {
    const given = typeof args.batchDoc === "string" ? args.batchDoc.trim() : ""
    if (given) {
      batchDocAbs = resolveBatchReadPath(parent.cwd, given)
      if (!batchDocAbs) {
        throw new Error("batchDoc for role='coder' — pass the batch record path (e.g. <repo>/docs/batches/<batch>-<topic>.md; relative paths resolve against the session cwd first, then candidate project roots — or absolute); when provided it must resolve to a readable file (omit batchDoc to spawn without the §5 record-write binding)." + unreadableHint(parent.cwd, given))
      }
    }
  }

  // ── AGENT-LOOP-SUBAGENT.md §6.58 批次档复用护栏（2026-10-28 batchdoc-reuse-guard）──
  // 同一档已有在飞 spawn ⇒ 拒发（2026-10-28 11:34 事故：两席共用一本批档、文件域互不重叠 ⇒
  // 语法坏档 + 一席复原）。判据 = 池内在飞条目的 `_batchDoc` 与本次解析出的绝对路径按 fileKey
  // 相等（谓词单源 = `batchDocInFlight`——池派生事实住 subagent-scheduler.mjs，读法同 `depInfo`）。
  // 只用结构性事实（池 + 路径相等），不做文本匹配（TOOLS.md §6.4）。
  // **不读 `round`**（KD-BG1）：修正轮靠「前一轮已 settle ⇒ 不在在飞集」自然放行；前一轮仍
  // 在飞就派修正轮 = 同一种两写者病，照拒。
  // **非对称是判据的一部分，勿「顺手统一」**：被检面只覆盖工程角色（本分支内），占用者是池内
  // 任何带 `_batchDoc` 的条目、不分角色（普通面 coder 携 batchDoc 也算）；sync spawn 不入池 ⇒
  // 它不是占用者（§6.58.7 第 7 条）。
  // 拒因文案逐字模板 = §6.58.2（文案单源 = 本处——下游断言逐字对照）。
  if (engineeringRole) {
    const occupant = batchDocInFlight(parent, batchDocAbs)
    if (occupant) {
      throw new Error(`batchDoc is already in flight — spawn refused. Batch record: ${batchDocAbs}. Occupant: ${occupant.role}#${occupant.id} (status: ${occupant.status}). One batch record serves one concurrent spawn: wait for ${occupant.role}#${occupant.id} to settle, or cancel it, then spawn again.`)
    }
  }

  // M5 F2 + §6.22（2026-10-24）任务书门——按角色分流：
  //   工程角色（eng-coder / eng-designer）：零任务书文本参数——八个自由文本键命中即拒（键在场即拒）并点名
  //     （值全空白也拒）；随后 round 枚举（initial|fix）。
  //   explore / plan / coder / tester：四项核心 + `scope` 必带（判据三条零改：存在 ∧ string ∧ trim 非空）。
  // 落点 = batchDoc 门之后、token 门之前（门序 = AGENT-LOOP-SUBAGENT.md §6.22.1）。
  if (engineeringRole) {
    rejectEngFreeTextParams(args, role)
    validateRoundParam(args)
  } else {
    validateTaskBookParams(args, role)
  }

  // eng-coder token gate（TOOLS.md §6.25 ④）：判定本体 = gateDesignToken（本档模块尾）——
  // missing / mismatch / expired / invalid 四态各出互异拒句；拒绝集合与旧三条件合取全等。
  // 返回值 = 槽内令牌，必须落回 issuedToken：下方 `child._engDesignId` 回写依赖它。
  let issuedToken
  if (role === "eng-coder") issuedToken = gateDesignToken(parent, args)

  // ── B7（TOOLS.md §6.29 B7）：eng-designer 的勘察预算计数 ──────────────────────────
  // 计的是**设计席发起的勘察**（`parent._role === "eng-designer"` 且本 spawn 的 role = explore），
  // 不是设计师自己的被派次数——模型面承诺的是「≤6 explore spawns per batch」。
  // 判据序（设计档原话「先完成角色、同步方式与 batchDoc 准入再计数」）：角色/同步两道门在
  // `gateEngCoderSpawn`（调用方，本函数之前已过）；本角色的 batchDoc 绑定在设计师自己那一次 spawn
  // 就过完了门（`parent._batchDoc`）；任务书门在本函数上方 ⇒ 到此处仍未拒的 spawn 才占额度。
  // 载体 = depth-0 根 agent 的独立 Map（K5：挂一次性 designer child 上会在 fix respawn 归零）。
  if (role === "explore" && parent?._role === "eng-designer" && parent._batchDoc) {
    chargeDesignerSurveySpawn(rootAgentOf(parent), parent._batchDoc)
  }

  // ── B8（TOOLS.md §6.29 ④）：eng 两角色的限量父历史 ────────────────────────────────
  // 绑定的是**父会话**（depth-0 根 agent）与**本批起点**；未绑定角色（explore/plan/coder/tester/consult）
  // 一个新历史工具都拿不到（K7：新工具解决不了「没有 _batchDoc 时范围怎么定」）。
  if (engineeringRole) recordBatchHistoryStart(rootAgentOf(parent), batchDocAbs, Date.now())

  // Filter tool set by role: explore/plan are read-only (plan is a planning agent, its deliverable is the plan itself)
  let tools
  if (role === "explore" || role === "plan") {
    // B4（TOOLS.md §6.29）：整把只读集 ∪ action 级只读变体——旧形只认 `t.readonly`，`git` / `memory` /
    // `settings` / `process` 整把不是只读，于是它们的只读动作在只读角色里一起消失（需求 B4 的直接病因）。
    // 判据单源 = 运行期 `readonlyActionOf`（经 `readonlyActionTest` 适配）——不另写一份只读动作名单。
    tools = deriveReadonlyTools(parent.tools, readonlyActionTest)
  } else if (role === "tester") {
    // tester = the THIRD tool face (AGENT-LOOP-SUBAGENT.md §6.59.2 ④): read-only set ∪ {execute, bash},
    // minus {verify, advisor}.
    //   · Allowlist form (D-TT1) — a new non-readonly tool stays OUT by default (the write face is fail-closed);
    //     a new readonly tool joins automatically through the same formula.
    //   · Why subtract `verify` / `advisor`: both produce a VERDICT, not a reading — "I declare this delivery
    //     good" and "open a review, produce a judgment". A tester's product is readings (F-TT3: it does not
    //     close a judgment on the parent's behalf), and `advisor` is `readonly: true`, so leaving it in would
    //     make 「it does not run reviews」 a sentence nobody enforces. Both subtractions are by name, explicit,
    //     and do not depend on the tool's `readonly` flag — that flag says "writes nothing", not "concludes nothing".
    const allowed = readonlyToolNames(parent.tools)
    const TRIMMED = new Set(["verify", "advisor"])
    tools = parent.tools.filter((t) => (allowed.has(t.name) && !TRIMMED.has(t.name)) || t.name === "execute" || t.name === "bash")
  } else {
    tools = parent.tools
  }
  // Then the depth>0 exclusion (TOOLS.md §6.16): role selection above, exclusion LAST — both
  // branches converge here (`question` = interactive main-session tool; a child has no user to ask).
  tools = excludeSubagentTools(tools)

  // PROMPT-SYSTEM 施工② G3（2026-09-10）：overlay（人格）装载随装配改造退役——人格槽
  // 由 assemblePrompt 的 D1 场景表按 role 承载（persona-{role}，explore/coder/plan =
  // PERSONA_NORMAL 同源）；child.overlay 恒空（setup 不再前缀叠加）。
  const overlay = ""

  // explore/plan: force read-only permission; coder/default: AUTO passes through directly,
  // manual mode queues permission requests for the parent agent's approval UI (human in the loop, child agent is no longer silently rejected)
  let childPermission
  if (role === "explore" || role === "plan") {
    childPermission = async () => false
  } else if (parent.autoApprove) {
    childPermission = async () => true
  } else {
    childPermission = async (name, toolArgs) => {
      if (!ctx.onPermissionRequest) return false
      // SYNC-CANCEL v2（用户裁——2026-09-09）：工具权限 ask 加 owner key 标识——
      // name `${key}/${tool}`（原 `${role}/${tool}` 无 key——模态 deny 归属判定 +
      // 显示可辨 child）；relayPrefix 在 buildSpawnChild 尾部定值——闭包运行于 child
      // 实际 runAgent（buildSpawnChild 返回后）——无 TDZ 风险
      const ownerKey = relayPrefix.slice(0, -1)
      const ask = () => {
        // ⏹ 后（entry.stopped）不再弹模态——直接拒绝（_permQueue 排队 ask 到达时查
        // stopped 旗标——子代理随即在 abort 检出点解绕——v2 模态 deny）
        if (parent._syncChildAborts?.get(ownerKey)?.stopped) return Promise.resolve(false)
        return ctx.onPermissionRequest(`${ownerKey}/${name}`, toolArgs)
      }
      // Queue parallel child agent permission requests to avoid two popups simultaneously overwriting each other (lesson from question tool)
      return enqueueAsk(parent, "_permQueue", ask)
    }
  }

  // G6（施工②）+ §2.15 B4（第 2 批）：工程角色场景即工程纪律——engineering=true 使 setup
  // 场景映射落到 assemblePrompt("eng-coder"/"eng-designer")（persona-{role} + common +
  // discipline-engineering）；designer 也必须 engineering=true 才能装配工程纪律槽。
  const childConfig = engineeringRole
    ? { ...parent.config, agent: { ...parent.config.agent, engineering: true } }
    : parent.config

  const child = createAgent({
    provider: childProvider,
    tools,
    config: childConfig,
    cwd: parent.cwd,
    memory: parent.memory,
    overlay,
    role,
  })
  // TUI-OOM-ROOTCAUSE（AGENT-LOOP.md §6.15）：子代理人读线窗口置位（常量单源
  // session-store.mjs）——机制复用主 agent 同路径（context.mjs pushReal 驱逐）；
  // 每个 child 原先各自一份永不压缩的 _fullHistory（勘察 C2 乘数面）。
  child._historyWindow = RECORD_WINDOW_MESSAGES

  // BATCH-RECORD.md §2 批次档段写入通道绑定（第 4 批；§4.16 扩 coder 可选分支）：工程角色
  // （eng-coder/eng-designer）把批次档绝对路径记在 child 上——setup 挂载 `batch` 时读它；
  // 携绑定的 coder（普通模式，可选）同点绑定。无路径参数的工具靠这条绑定决定目标档
  // （spawn 门已保证「参数在 + 路径可读」）。
  const batchBound = engineeringRole || (role === "coder" && !!batchDocAbs)
  if (batchBound) child._batchDoc = batchDocAbs

  // Token-verified design review → child is authorized to modify files without re-reviewing
  if (role === "eng-coder") child._engDesignReviewed = true
  // AGENT-LOOP-SUBAGENT.md §6.7.6 D-E3 task-domain authorization: approved design + spawn task = authorization.
  // The child's OWN tools skip ONLY the onPermissionRequest ask (autoApprove
  // equivalent — dispatch.mjs permission stage); every other gate (JSON parse /
  // unknown tool / planMode / design-token) still applies (T-E14). Non-eng-coder
  // children keep the manual per-write parent approval (human in the loop).
  if (role === "eng-coder") child._engTaskAuthorized = true
  // designId rides the child bookkeeping: the delivery report carries the designId
  // so the divergence-audit fix round re-spawns with the SAME slot (2026-09-01 FR3).
  // DESIGN-TOKEN-SETTLEMENT D3 (2026-09-08): the single-value `_engDesignToken` mirror
  // is retired — no mirror copy on the child (nothing reads it; the slot ledger + the
  // spawn-time token validation are the only authorities).
  if (role === "eng-coder" && issuedToken) {
    child._engDesignId = args.designId ?? null
  }

  // §6.7.4 子代理零 git（D-AG1——2026-09-04 用户裁定）：explore/plan 一律不注入
  // git 上下文——子代理证据链 = 任务书 ∪ 磁盘当前状态（read/glob/grep）∪（审计时）
  // _touchedFiles，无一项来自 git；注入的全工作区脏状态快照与任务域无关，会误导
  // 审计/探索（"status 里这个文件算不算超清单？"）。注入分支整体删除（B 方案
  // git 只读变体亦随裁定废弃——D-AG5）。顶层主 agent 注入保留（§3 prepareRun——
  // setup.mjs depth===0——D-AG7 范围边界）。
  // §6.22.2 子代理任务输入：工程角色 `input` = 一行机械任务书行（批档绝对路径 + §2 指向句）——
  // 任务书本体由子代理自读 §2（KD-SC5：运行时不抽取正文注入，避免过期副本 / 脆标题解析）；
  // 非工程角色 = 既有拼装（context 前缀 + 任务书参数 + 可选 task——零变）。
  const input = engineeringRole
    ? `Task book: §2 of the batch record at ${batchDocAbs} — read it before acting; it is the only task channel for this spawn.`
    : (args.context ? `Context:\n${args.context}\n\nTask:\n${taskBriefOf(args, role)}` : taskBriefOf(args, role))
  // 台账 #23（AGENT-LOOP-SUBAGENT.md §6.26 · D23-1）：**spawn 级固定机制性指令改走 system 固块**——
  // 两处（批次档路径行 + 审计模板块）原随 user 首条下发，压缩把首条并入摘要即丢（长任务中后期
  // 既看不到批次档路径、也看不到审计模板 ⇒ 过度勘察的真病根）；固块值在 child 生命周期内恒定
  // ⇒ run 内 system 前缀逐字节稳定（前缀缓存不破），且不在 `agent.history` 内 ⇒ 压缩结构上吞不掉。
  // 收集序 = 批次档行 → 审计块 → 写域行（S4，见下）→ 文档坐标行（S5，见下）；空数组 ⇒ 不绑定
  // （depth-0 不进本函数、system 逐字节同改前——§6.26 缓存契约兼容证明）。S5 与角色无关 ⇒
  // explore ∥ plan 的子代理也会带上它；它随本项目 manifest 声明而定、与 spawn 参数无关，同一 child 终身不变。
  const spawnBlocks = []
  // §2.11 第 1 点（FR16 载体 + FR17 铁律 #5 的机械面）：批次档**绝对路径**下发给工程角色
  // （eng-coder 实现 / eng-designer 写稿）——任务书本体 = 本档 §2；本行让子代理"拿到本档路径"。
  // 工程角色恒注入；携绑定 coder（§4.16）随绑定注入（绑定 coder 要能读到本档）。
  if (batchBound) spawnBlocks.push(`Batch record (batchDoc): ${batchDocAbs}`)
  // AGENT-LOOP-SUBAGENT.md §6.7.6 D-E2 ③ + §6.22 KD-SC6：审计 spawn 的范围证据 = 机械跟踪的
  // `_touchedFiles` ∪ 批档 §2（审计子代理自读）——**不是** eng-coder 自述（自述可恰好漏掉应抓的
  // 越界档）。块文本（含模板逐字）住 `./audit-block.mjs`（D23-3 外提）。
  if (engAuditAttempt !== null) spawnBlocks.push(buildAuditBlock(ctx))
  // §6.26「写域行（S4）」：`files`（本 spawn 的预期写域，`prepareScheduling` 已归一化）非空 ⇒ 追加
  // 一格——写域此前只有调度器知道，子代理只能猜自己的改动面；空 / 未传 ⇒ 不推块，system 逐字节同改前。
  if (files.length > 0) spawnBlocks.push(filesBlockOf(files))
  // §6.61「子代理文档坐标行（S5）」：本项目声明的三层文档坐标一行随 system 面下发。子代理此前也读得到
  // `docRoot`（`manifestReadTool` 按需主动读），但那得先想到坐标记在 manifest 里、再知道键名——本行把
  // 答案在 spawn 时就放进 system 面，省掉的只是那一趟（出口零新解析）。读不出 ⇒ 不推块。
  const docsBlock = docsCoordinatesBlockOf(parent.cwd)
  if (docsBlock) spawnBlocks.push(docsBlock)
  // The child's own task input rides the child object: D23-6 —— `_engTaskInput` 语义 = **一行机械
  // 任务书行**（批档绝对路径 + §2 指向句；不含固块）。
  if (engineeringRole) child._engTaskInput = input
  // spawn 固块单点绑定（sync / async 同点——buildSpawnChild 唯一调用点）：此后只读 ⇒ 同一
  // child 的任意 run（resume 续跑 / 报告追问重跑）逐字节恒定；消费点 = 核 `prepareRun`。
  if (spawnBlocks.length > 0) child._spawnSystemBlock = spawnBlocks.join("\n\n")

  // Relay content/reasoning/tool/output to the parent TUI via the unified spawn-child
  // pipeline (AGENT-LOOP-SUBAGENT.md §6.7.2 D3). Prefix includes a unique id: parallel child agents
  // with the same role stay independent and don't overwrite each other.
  // Format: role#id/  →  onToken("coder#2/writing..."), onToolCall("coder#2/read", args)
  // Async id allocation (AGENT-LOOP-SUBAGENT.md §6.7.3): reserve the relay counter at
  // spawn time — the returned id must be stable while the item sits in the queue.
  // The [model] token (TUI block creation) is DEFERRED to actual start so queued
  // children don't paint an empty panel block ("queued 态不显示").
  let relayPrefix
  if (wantAsync) {
    // SUBAGENT-ID-COUNTER-AGENT（2026-09-09）：async id 取号统一走 nextSubagentId
    // （池活续号兜底——counter 载体= agent 本体 _subAgentCounter——跨 run/跨压缩
    // 存活——per-run reset 清单不含它）。sync 分支只取号（allocRelay）不进池——照旧。
    const id = nextSubagentId(parent)
    relayPrefix = relayPrefixOf(role, id)
  } else {
    // #133（sync 出生序）：装配面**只取号**（allocRelay）——`[model]` 出生声明不由此处发射，
    // 改由 SYNC-CANCEL 单点 `armSyncChildAbort(parent, key, baseSignal, announce)` 在 registry
    // 写入**之后**当场宣告（`agent-tools/subagent.mjs` 阻塞路径）。先宣告后登记 ⇒ VSC 载荷
    // 产者（panel-subagent-relay `syncLiveOf`）采样必空 ⇒ sync 块 ⏹ 运行期不可达（本缺陷根因）。
    relayPrefix = allocRelay(parent, role ?? "sub")
  }
  // LOGGING（LOGGING.md）：子代理内部事件（子内 llm:*/tool:*）以 childId 归属——
  // agent._logId 随 runAgent 的 logCtx 透出（主文件单文件全记、按 childId grep）。
  child._logId = relayPrefix.slice(0, -1)
  // SUBAGENT-UPSTREAM-CHANNEL（AGENT-LOOP-UPSTREAM.md §6.27.4 W1——spawn 主路径，sync + async
  // 共用）：子 → 父在飞通道装配单点（label = relay 前缀去尾；`sync` 供工具返回注分形）。
  child._upstream = { parent, label: relayPrefix.slice(0, -1), sync: !wantAsync }
  const childOpts = {
    onPermissionRequest: childPermission,
    ...wrapChildCallbacks(relayPrefix, ctx.callbacks),
  }
  const childRunOpts = buildChildRunOpts(ctx)
  // B8（TOOLS.md §6.29 ④）：eng 两角色各挂一枚**本批窗口**的受限 `read_history`（同名工具、
  // 经 extraTools 注入——装配面在 `agent/setup.mjs` 的 `extraTools` 段）。未绑定角色不挂（K7）。
  if (engineeringRole) childRunOpts.extraTools = [makeBatchHistoryTool(rootAgentOf(parent), batchDocAbs)]
  return { child, input, childOpts, childRunOpts, relayPrefix, childProvider }
}

// ── design-token 门（TOOLS.md §6.25 ③④——四态互异拒句；拒绝集合与旧三条件合取全等） ──

/** 四态拒句（逐字 = TOOLS.md §6.25 ③）：missing / mismatch / expired / invalid。
 *  mismatch 可携 designId（非凭证）；四句均零令牌值回显。 */
export function designTokenRefusal(kind, designId) {
  if (kind === "missing") return new Error("designToken missing — the eng-coder spawn is refused: no usable token for an approved design slot came with this spawn. Pass the designToken parameter with the exact value from the subagent action:'design-slots' row (the text after designToken=), copied verbatim; if that list is empty, no design review has been approved in this session yet — run advisor with type='design' first. No token value is echoed here.")
  if (kind === "mismatch") return new Error("designToken mismatch — the eng-coder spawn is refused: the value passed does not equal the token held for this design slot. Re-read the subagent action:'design-slots' row and pass the value after designToken= verbatim, unchanged. No token value is echoed here." + (designId ? ` (designId: ${designId})` : ""))
  if (kind === "expired") return new Error("designToken expired — the eng-coder spawn is refused: the token matches this design slot but is past its TTL. The expired slot has been removed; run advisor with type='design' again on the current design and pass the newly issued token — an expired authorization cannot be retried. No token value is echoed here.")
  return new Error("designToken invalid — the eng-coder spawn is refused: the value passed equals this design slot's stored token, but that stored value is not a well-formed token, so no expiry can be judged and the slot was left in place. Run advisor with type='design' to issue a fresh token for this design; a malformed record never passes the gate. No token value is echoed here.")
}

/** eng-coder spawn 的令牌门（TOOLS.md §6.25 ④）：resolveDesignSlot 的既有两条 designId
 *  诊断零改 → 参数在场 → 值相等 → 值有效。槽删除只在 tokenExpired(given) 成立时发生
 *  （D-R16c ③）；mismatch / invalid 不删槽（T-R16d）。返回槽内令牌（调用方回写 designId
 *  依赖它）；sync / async 两路共经 buildSpawnChild——一处判定双路生效。 */
export function gateDesignToken(parent, args) {
  const issuedToken = resolveDesignSlot(parent, args?.designId).token
  // 非字符串 ⇒ 空串 ⇒ missing（本意——T9 锁定）
  const given = typeof args?.designToken === "string" ? args.designToken : ""
  if (!issuedToken || !given.trim()) throw designTokenRefusal("missing")
  if (given !== issuedToken) throw designTokenRefusal("mismatch", args?.designId)
  if (!validateDesignToken(given)) {
    const expired = tokenExpired(given)
    if (expired) removeDesignTokenSlot(parent, args?.designId, given)
    throw designTokenRefusal(expired ? "expired" : "invalid")
  }
  return issuedToken
}
