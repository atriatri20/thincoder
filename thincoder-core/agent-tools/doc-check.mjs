/**
 * agent-tools/doc-check.mjs — `doc_check` 工具：文档纪律机检（产品内建 · 两种问法）。
 *
 * 设计 = `docs/core/design/DOC-DISCIPLINE.md` §3.20 条目 S（判据 = 锚 ∥ 段判据 | 行号坐标 · 参数内置常量）。
 * 工具形：**无动作枚举**——`mode` = 同一条判据的两种问法（`report` = 报告态 ∥ `gate` = 交付时点的裁定）；
 * **只读**（零副作用 · 免审批 · 可并行）；参数 `target` / `mode` / `docs` / `lines`。
 * `target` = **声明根**（不是整批的坐标系）：清单里每个档用它**自己的项目根**判（判据单源 = `docs/core/design/DOC-CHECK.md` §2）；
 *   普通目录 ∥ 多项目工作区都能当声明根，照它判——工作区锚不再提前返回；`target` 缺省时锚即声明根，照跑。
 * 判据参数 = 引擎内置常量 `DOC_CHECK_BUILTINS`——不读 manifest、不硬编码本仓路径、不扫目录。
 * 判定范围 = 调用方传入的档：`report` 面 `docs` 必填（不给 ⇒ 明确报错，零遍历）；
 * `gate` 面缺省 = 本会话触达记账里的 `.md`（交付面按轮次收窄的唯一来源）。
 * `lines` = 只读数面（内容行数 + 源 / 单元测试档的尺寸档位标记）——**不是判据**：本面只透传，
 * 校验与拒绝全住引擎（抛错单源 = `../doc-check/index.mjs`），`gate` + `lines` 在开判之前拒绝、不产 verdict 首行。
 * `report` 非门禁（硬）：输出不得被读作拒执行的理由（用户令 > 机检——§2 总则族）；
 * `gate` 的强制面住交付协议 + 批次档 §6 前置，工具本体同样不阻断任何动作。
 * 描述外置：模型可见文本单点 = `tool-docs/doc_check.md`（`DESC` 单一解析面）。
 * 装配段 = `agent/family-tools.mjs` 三处（depth-0 / eng-coder / eng-designer）——写文档 / 设计档的角色面。
 */
import { resolve } from "node:path"
import { projectRootView } from "../manifest.mjs"
import { resolvePathTarget } from "../path-resolve.mjs"
import { runDocCheck } from "../doc-check/index.mjs"
import { DESC } from "../tools/shared.mjs"

export const docCheckTool = {
  name: "doc_check",
  description: DESC("doc_check"),
  parameters: {
    type: "object",
    properties: {
      target: { type: "string", description: "The declared root for this call — not one coordinate system for the whole list. Each document is judged against its own project root (the nearest ancestor holding PROJECT-MANIFEST.json); `target` supplies only the base for relative `docs` entries and the root for a document whose ancestors hold no manifest. Defaults to the session anchor. A plain directory or a multi-project workspace is a legal value — it is judged as given, not refused; a relative `target` that matches several existing directories is still ambiguous and refused." },
      mode: { type: "string", enum: ["report", "gate"], description: "How to ask the same three-criteria check. \"report\" (default): a non-gating report over the documents you list in docs. \"gate\": the delivery gate — the documents this round touched (docs, or this session's written documents when docs is omitted), whole-file judged, first line a machine-readable verdict (DOC-CHECK GATE: PASS / REFUSED / ERROR)." },
      docs: { type: "array", items: { type: "string" }, description: "The documents to judge, as paths relative to the project root or absolute — each is judged whole; nothing else is read except the targets those documents point at. Required in \"report\" mode (there is no default range: omitting it is refused, not widened). Omitted in \"gate\" mode ⇒ the Markdown documents this session wrote. A path that is not on disk or is not a Markdown document is an error (no document judged) in report mode and a visible skipped line in gate mode." },
      lines: { type: "array", items: { type: "string" }, description: "Files to measure, as paths relative to the project root or absolute — a reading, never a criterion. One line of content count per file, source, unit-test and Markdown files alike; source and unit-test files also carry a size-tier mark once they pass a threshold. `report` mode only: `gate` refuses it (passing it there is an error, not an ignored argument), because a reading must not move a verdict. Every listed file must be on disk and readable — a list that cannot be measured whole is an error, never a partial reading." },
    },
  },
  readonly: true,
  execute(args, ctx) {
    const anchor = ctx?.agent?.cwd ?? ctx?.cwd
    const mode = args?.mode === undefined ? "report" : String(args.mode)
    if (mode !== "report" && mode !== "gate") return `doc_check: unknown mode "${mode}" — use "report" (a report over the documents you list) or "gate" (this round's documents).`
    // `target` 的路径判定经统一解析层（`kind:"dir"` / `order:"root-first"`）：判不出唯一根 ⇒ 报明候选（KD-5
    // 的形），解析出 ⇒ 用。`dangling` 不阻断本面——本面判据 = 内置常量、不读声明面，任可判目录都能跑
    // （受判档由 `docs` 给定），故无项目根时按显式目标 ∥ 会话锚照跑（受理判据归本面）。
    // `ambiguous` 只在**调用方给了 `target`** 时才是真歧义（相对目标在多个候选基根上各有一份，挑一个就是替用户改路径）；
    // `target` 缺省时锚即声明根——工作区锚照它判（§2.4：「声明根自身不是项目」不是触发条件）。
    const picked = resolvePathTarget(anchor, args?.target, { kind: "dir", order: "root-first" })
    if (picked.state === "ambiguous" && args?.target !== undefined) {
      if (mode === "gate") {
        return [
          "DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）",
          `候选：${picked.candidates.join(" ∥ ")}`,
          "处置：指名项目根（`target`）后复跑",
        ].join("\n")
      }
      return `doc_check: ${anchor} is a workspace holding ${picked.candidates.length} projects — pass the project root explicitly via target:\n` +
        picked.candidates.map((c) => `- ${c}`).join("\n")
    }
    const target = picked.state === "resolved" ? picked.abs : resolve(anchor, args?.target ? String(args.target) : "")
    const explicit = Array.isArray(args?.docs) ? args.docs : null
    if (args?.docs !== undefined && !Array.isArray(args.docs)) {
      return `doc_check: \`docs\` must be an array of paths (got ${typeof args.docs}) — a bare string is refused rather than read as a whole-domain request; pass ["<path>"].`
    }
    if (explicit && explicit.some((d) => typeof d !== "string")) {
      return "doc_check: every `docs` entry must be a path string — a non-string entry is refused rather than coerced (no document was judged)."
    }
    // 工作区**不再提前返回**（§3）：声明根不因自身不是项目（普通目录 ∥ 多项目工作区）而被拒——照它判，
    // 各档的根由引擎按自己的落点定。`root` = 归属命中的项目根 ∥ 声明根（`none` / `workspace` 两支同此式）。
    const view = projectRootView(target)
    const root = view.state === "ok" ? view.root : target
    // `lines` 只透传：校验 / 抛错 / gate 面拒绝全住引擎（单源）——本面不另写一份校验，否则就多一份会漂的判据。
    const lineArg = args?.lines
    if (mode === "gate") {
      const docs = explicit ?? (Array.isArray(ctx?.agent?._touchedFiles) ? ctx.agent._touchedFiles : [])
        .filter((p) => typeof p === "string" && p.toLowerCase().endsWith(".md"))
      return runDocCheck(root, { mode: "gate", docs, docsSource: explicit ? "explicit" : "session", lines: lineArg }).report
    }
    // 报告态：清单是唯一范围来源——不给就是拒绝（不是「全域」）。
    if (explicit === null) {
      return "doc_check: `docs` is required in report mode — pass the explicit list of documents to judge (e.g. docs: [\"docs/design/X.md\"]). There is no default range: nothing is scanned unless you name it."
    }
    return runDocCheck(root, { docs: explicit, docsSource: "explicit", lines: lineArg }).report
  },
}
