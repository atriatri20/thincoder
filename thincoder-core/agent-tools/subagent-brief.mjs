/**
 * subagent-brief.mjs — **任务书与 system 固块拼装**族：任务书播报文本、写域行（S4）、文档坐标行（S5）。
 *
 * 机制单源 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.22（任务书）∥ §6.26（写域行 S4）∥ §6.61（文档坐标行 S5）；
 * 本档只拼文本，不判准入——三条门的判据住 `./spawn-gates.mjs` 与 `./subagent-spawn.mjs`。
 * **为什么单独立档**：这三个函数是纯拼装（入参 → 一段文本），消费者只有 `subagent-spawn.mjs` 的 child 装配点；
 * 把它整族搬走是分拆落点（`docs/core/design/PATH-RESOLUTION.md` §3 末条），装配面一句调用都没动。
 */
import { relative } from "node:path"

import { docRootBase, docRootPaths, readManifest } from "../manifest.mjs"
import { composeTaskBookBrief } from "./spawn-gates.mjs"

/** 任务书播报文本：该角色名集拼装 + 可选 task 自由文本（拼装空 ⇒ 原 task 逐字——旧形零变）。 */
export function taskBriefOf(args, role) {
  const composed = composeTaskBookBrief(args, role)
  if (!composed) return args.task
  const extra = typeof args.task === "string" ? args.task.trim() : ""
  return extra ? `${composed}\n\n${extra}` : composed
}

/** S4 写域行（AGENT-LOOP-SUBAGENT.md §6.26「写域行（S4）」）：表头 + 逐条绝对路径 + 两句语义——
 *  本档局部纯函数（D23-9：不外提模块）。两句不可省：缺① 子代理读成「我只能写这些」⇒ 该写的漏掉；
 *  缺② 仍把任务书 §2 全文当成自己的改动面（本块的病因）。清单不截断——截断正是本块要消除的
 *  「看不见」。返回块文本（块间分隔由装配侧 `join("\n\n")` 施加）。 */
export function filesBlockOf(files) {
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
 *  返回块文本 ∥ null。 */
export function docsCoordinatesBlockOf(cwd) {
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