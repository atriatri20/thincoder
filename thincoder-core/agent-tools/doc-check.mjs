/**
 * agent-tools/doc-check.mjs — `doc_check` 工具：文档机检（只判三件事）。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md`：① 一段太长 ∥ ② 拿行号做锚 ∥ ③ 悬空指针。
 * 工具形：**无动作枚举**——`mode` 只是这一笔的意图，而两个 mode 的**判域不同**（单源 = 同档 §6）：
 * `report` = 诊断面，判整份；`gate` = 交付判定，只判**本批变更区**。同一句话不许两面各说一套。
 * **时点 = 收口**（§9）：它读的是已经在盘的档，与收口同处境——批档面整份不进判域（两个 mode 同此一判）。
 * `gate` 的基线取**绑定给本席的批档**（`ctx.agent._batchDoc`）§1 的记入行：没有绑定 ⇒ 没有「本批」可指
 * ⇒ 没有要判的行，一个档也不判（不猜一份在途批档来当基线）。
 * **`report` 面只读（零副作用 · 免审批 · 可并行）**；**`gate` 面写索引**：判之前对它此行判的那几份档逐个
 * `git add -- <该档>`（按路径限定，不 `git add -A`）——索引外的新档 `git diff` 看不见，那不是「没改」（§6）。
 * 两面都不写档字节、都不问审批。参数 `target` / `mode` / `docs`。
 * `target` = 基根（相对 `docs` 条目按它解析）；每份档的项目根沿它自己往上找（单源 = 引擎）。
 * 判定范围 = 调用方传入的档：`report` 面 `docs` 必填（不给 ⇒ 明确报错，零遍历）；
 * `gate` 面缺省 = 本会话触达记账里的 `.md`（交付面按轮次收窄的唯一来源）。
 * 描述外置：模型可见文本单点 = `tool-docs/doc_check.md`（`DESC` 单一解析面）。
 * 装配段 = `agent/family-tools.mjs` 三处（depth-0 / eng-coder / eng-designer）——写文档 / 设计档的角色面。
 */
import { isAbsolute, resolve } from "node:path"
import { projectRootView } from "../manifest.mjs"
import { resolvePathTarget } from "../path-resolve.mjs"
import { runDocCheck, MOMENT } from "../doc-check/index.mjs"
import { baseShaOf } from "./batch-gate.mjs"
import { changedRegionsOf, stageDocs } from "./batch-regions.mjs"
import { DESC } from "../tools/shared.mjs"

export const docCheckTool = {
  name: "doc_check",
  description: DESC("doc_check"),
  parameters: {
    type: "object",
    properties: {
      target: { type: "string", description: "The base root for this call: relative `docs` entries resolve against it, and a document that belongs to no project falls back to it. Required — there is no default; the session anchor is the base for relative paths, never a substitute for `target`." },
      mode: { type: "string", enum: ["report", "gate"], description: "What this call is for. \"report\" (default): the diagnostic face — every named document is judged whole. \"gate\": the delivery-time verdict — only this batch's changed region inside each named document is judged (docs, or this session's written documents when docs is omitted). Both judge the same three things and print the same sentences; the first line is DOC-CHECK GATE: PASS or REFUSED." },
      docs: { type: "array", items: { type: "string" }, description: "The documents to judge, as paths relative to `target` or absolute. In \"report\" mode each is judged whole (the diagnostic face); in \"gate\" mode only this batch's changed region inside it is judged, so a pre-existing dangling pointer outside the region is not reported. Required in \"report\" mode (there is no default range: omitting it is refused, not widened). Omitted in \"gate\" mode ⇒ the Markdown documents this session wrote." },
    },
    required: ["target"],
  },
  readonly: true,
  execute(args, ctx) {
    const anchor = ctx?.agent?.cwd ?? ctx?.cwd
    const mode = args?.mode === undefined ? "report" : String(args.mode)
    if (mode !== "report" && mode !== "gate") return `doc_check: unknown mode "${mode}" — use "report" (look at the documents you list) or "gate" (this round's documents).`
    const givenTarget = typeof args?.target === "string" && args.target.trim() !== "" ? args.target : undefined
    if (givenTarget === undefined) {
      return "doc_check: `target` is required — pass the base root you mean (an absolute path, or a path relative to the session anchor). There is no default: the session anchor is the base for relative paths, never a substitute for `target`."
    }
    if (!anchor && !isAbsolute(givenTarget)) {
      return "doc_check: no session anchor is available (`ctx.agent.cwd` / `ctx.cwd` both empty) — pass `target` as an absolute path; a relative `target` has no base to resolve against, and this tool will not fall back to `process.cwd()`."
    }
    const picked = resolvePathTarget(anchor, givenTarget, { kind: "dir", order: "root-first" })
    if (picked.state === "ambiguous") {
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
    const target = picked.state === "resolved" ? picked.abs : resolve(anchor, givenTarget)
    const explicit = Array.isArray(args?.docs) ? args.docs : null
    if (args?.docs !== undefined && !Array.isArray(args.docs)) {
      return `doc_check: \`docs\` must be an array of paths (got ${typeof args.docs}) — a bare string is refused rather than read as a whole-domain request; pass ["<path>"].`
    }
    if (explicit && explicit.some((d) => typeof d !== "string")) {
      return "doc_check: every `docs` entry must be a path string — a non-string entry is refused rather than coerced (no document was judged)."
    }
    const view = projectRootView(target)
    const root = view.state === "ok" ? view.root : target
    if (mode === "gate") {
      const docs = explicit ?? (Array.isArray(ctx?.agent?._touchedFiles) ? ctx.agent._touchedFiles : [])
        .filter((p) => typeof p === "string" && p.toLowerCase().endsWith(".md"))
      if (docs.length === 0) return "DOC-CHECK GATE: ERROR（0 档受检——本轮没有碰过 .md）"
      // 判域只是一部分：先按**收口时点**裁掉批档面（§9），再只判**本批变更区**（§6）——区内照判三件、区外一个字都不出。
      // 基线 = 绑定给本席的批档（谁在判，谁已经知道自己是哪一批）：不猜一份在途批档，不去扫发现面。
      // 没有绑定 ⇒ 没有「本批」可指 ⇒ 没有要判的行 ⇒ 一档也不判（空表 = 每一档都没有条目）。
      const bound = typeof ctx?.agent?._batchDoc === "string" && ctx.agent._batchDoc.trim() !== "" ? ctx.agent._batchDoc : null
      const sha = bound ? baseShaOf(bound) : null
      const absDocs = docs.map((d) => resolve(root, d))
      // `gate` 面在判之前会 `git add` 它此行判的那几份档（§6）：索引外的新档 `git diff` 看不见，那不是「没改」。
      // 按路径限定、不 `git add -A`。没有绑定的批档 ⇒ 没有基线 ⇒ 没有要取的区，索引也不动。
      if (sha) stageDocs(root, absDocs)
      const regions = sha ? changedRegionsOf(root, sha, absDocs).regions : new Map()
      return runDocCheck(root, { docs, moment: MOMENT.close, regions }).report
    }
    if (explicit === null) {
      return "doc_check: `docs` is required in report mode — pass the explicit list of documents to judge (e.g. docs: [\"docs/design/X.md\"]). There is no default range: nothing is scanned unless you name it."
    }
    // `report` = 诊断面：判整份（`regions: null`）。时点不按 mode 分，按**谁在调**分（§9）——批档面两个 mode 都不进判域。
    return runDocCheck(root, { docs: explicit, moment: MOMENT.close, regions: null }).report
  },
}
