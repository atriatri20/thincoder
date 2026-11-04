/**
 * agent-tools/batch.mjs — 批次档生命周期工具（KD-4 拆分主档：**action 分发 + schema + 路径解析面 +
 * 评审实例绑定 + #84 记账缝**）。
 *
 * 单工具 `batch`，action = create（建档，§4.11）/ attach（给现役档补挂台账行，§4.21.3）/ append（段写入）/ edit
 * （段内就地改，§4.19）/ status（段属主状态行流转，§4.12）/ close（收口冻结，§4.13）。写入面**按段分权、不按段分处置**：
 * 六段各自只有一个作者，作者对本段可 append 加内容 ∥ edit 就地改既有行（§4.19）；状态行只有一个写者（status）。
 * 权威规格 = `docs/core/design/BATCH-RECORD.md` §4（契约/挂载/用例 §4.8/骨架 §4.10/
 * 参数面 §4.11–§4.13 · §4.21）。
 *
 * 2026-11-05 拆档族把**段写入执行面**（append ∥ edit 的执行体、共用助手与八条拒串）搬进
 * `batch-record-write.mjs`——本档只留模型可见的 schema 与分发（改 schema 不该翻过 300 行执行体）。
 * 其余依赖单向：`batch-segment-vocab ← batch-skeleton ← …（gate ∥ closeout ∥ reopen ∥ lifecycle ∥
 * record-write）← 本档`。
 *
 * 身份判据（D-BR17/D-BR18/D-BR21）：主 agent 调用 ctx 带 `depth === 0`（dispatch 装配）；
 * eng 子代理 `depth > 0`（`agent._role` 定段）；评审实例 ctx 无 depth 但工具以 `review: true`
 * 绑定。create/close/attach 仅 depth-0 放行；depth-0 的 append/status/close/attach 可选 `path`（D-BR21：
 * 缺省 = findInFlightBatch 取唯一在飞批，0/复数 ⇒ throw）；子代理/评审传 path ⇒ 拒（目标 =
 * spawn/实例注入，语法上写不到别处——运行期门拒）。append 段白名单（**模式感知**——§4.16）：
 * depth-0 → 工程 §1/§4/§6 ∥ 普通 §1/§2/§4/§5/§6 · eng-designer → §2 · 评审 → §3 · eng-coder → §5 ·
 * coder（普通模式分支增表——SEGMENT_BY_ROLE_NORMAL）→ §5；status 写域 = 调用者自己段（模式感知
 * ——见 batch-lifecycle.mjs）。**edit 的段域 = 同模式 append 白名单**（§4.19「段域」行——一张表两
 * 个动作，不另立第二张）：能 append 哪段就 edit 哪段，两动作只差写法（段尾加内容 ∥ 段内改既有字）。
 * append 迁移面错误串**逐字保持
 * "batch_segment:" 前缀**（§4.1 全表锚断言）；"batch:" 前缀 = 新增错误面（create/close/status/
 * edit 锚判据/findInFlight/path 门/dispatch）。
 *
 * 导出面（名与形逐字不变——2026-11-05 拆档族后仍由本档出）：`batchTool`（主名）· `resolveBatchDocPath` ·
 * `batchDocBases` · `batchDocForReview` · `configureBatchSegment` / `resetBatchSegment`（#84 记账缝——
 * 契约名不变，AC-11 零改）· `MAX_TEXT_CHARS`（经 `batch-record-write.mjs` re-export）· `SEGMENT_BY_ROLE`。
 *
 * #84 记账面（CORE-UNIFICATION §2.13.4）：写入成功后的记账**按端注入**——核内缺省 no-op = CLI
 * 语义零行为变；端装配经 `configureBatchSegment({ onWrite })` 覆盖（VSC 侧现形 = `_touchedFiles`
 * 记账）。核内零端名分支（契约 5——只认 `onWrite` 函数名）。**缝住本档**：它唯一的读者是下面
 * `batchTool.execute`（取值后经 `onWritten` 形参递给五条 action）——缝与读者同档，执行体侧只收形参。
 */
// 描述面 = `tool-docs/batch.md`（#15 描述外置统一——工厂形描述经 DESC 单一解析面，工厂调用期取值）
import { DESC } from "../tools/shared.mjs"
import { SEGMENT_BY_ROLE } from "./batch-skeleton.mjs"
import { batchDocBases, resolveBatchDocPath } from "./batch-paths.mjs"
import { createBatchRecord, attachBatchRecord } from "./batch-ledger-bind.mjs"
import { closeBatchRecord, findInFlightBatch, statusBatchRecord } from "./batch-lifecycle.mjs"
import { appendBatchRecord, editBatchRecord } from "./batch-record-write.mjs"

export { SEGMENT_BY_ROLE, batchDocBases, resolveBatchDocPath }
export { MAX_TEXT_CHARS } from "./batch-record-write.mjs"

// ─── #84 记账面注入缝（「记账面按端注入」，形态参 §2.13.5 注入缝）───────────────
/**
 * 写入成功后的记账注入面（**缺省 no-op** = CLI 语义零行为变）：端装配层可覆盖——把写成的
 * 批次档记入调用者写域（VSC 侧现形 = `agent._touchedFiles` 记账，供子代理合入 / recent_changes /
 * verify / advisor 默认范围消费）。核内零端名分支（契约 5——本档只认 `onWrite` 函数名）。
 * 形态与 `tools/write-path.mjs` 的 `configureWritePath` 同款：模块级、缺省不覆盖、null 撤销。
 */
let injectedOnWrite = null
export function configureBatchSegment(impl) {
  injectedOnWrite = impl && typeof impl.onWrite === "function" ? impl.onWrite : null
}
/** 撤销注入（测试与端装配生命周期用——缺省态 = 零记账）。 */
export function resetBatchSegment() { injectedOnWrite = null }

/**
 * 批次档路径解析单源（`BATCH-RECORD.md` §4.15 · 台账 #287——实现住 `batch-paths.mjs`，本档 re-export）：
 * 候选序 cwd → 项目根 → 逐基底 · 读面取首个**可读**（口径仍「若传则须可读」，错误文案逐字零变）·
 * create 取首个落基底内 · 锚定防嵌套（按路径段判）。四处调用点（create / 读面 / 评审门 / spawn 门）
 * 均经该叶档——本档不再持第二份解析实现。
 */

/**
 * 设计评审的实例绑定解析（BATCH-RECORD.md §4.2/§4.3——评审实例的唯一路径来源）：
 *  - 同步路径：调用方（advisor 工具）把实例绑定显式放进 callbacks（**带 batchDoc 键**，
 *    未绑定即 null）——以此为准，不再回看池条目（防同步/异步混跑时串档）；
 *  - 异步路径：本评审所在**池条目**的 `run.batchDoc`（文档集 = 实例键，各评审各取各条）。
 */
export function batchDocForReview(agent, documents, callbacks = null) {
  if (callbacks && "batchDoc" in callbacks) return callbacks.batchDoc ?? null
  const key = JSON.stringify([...(documents ?? [])].sort())
  for (const e of agent?._asyncAdvisors?.values?.() ?? []) {
    if (e.status === "running" && e.reviewType === "design" && JSON.stringify([...(e.documents ?? [])].sort()) === key) {
      return e.run?.batchDoc ?? null
    }
  }
  return null
}

/**
 * 批次档生命周期工具工厂（主名 `batch`——单工具五 action）。
 * @param {string|null} batchDoc — 绑定的目标档（spawn：`child._batchDoc`；评审：实例键；
 *   depth-0 主 agent 挂载时 = null——目标走 D-BR21 可选 path / 在飞扫描）
 * @param {{review?: boolean}} [opts] — review=true 表示"设计评审实例"形态（写 §3 + 工具盖戳）
 */
export function batchTool(batchDoc = null, { review = false } = {}) {
  return {
    name: "batch",
    description: DESC("batch"), // 模型可见文本 = tool-docs/batch.md
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["create", "attach", "append", "edit", "status", "close"],
          description: "Which lifecycle step to run: create (new record) / attach — hang a ledger row on an ALREADY EXISTING in-flight record (depth-0 only: a reopened record taking on a new piece of work; opens a new row, or takes over an unsettled one with ledger:\"#<id>\", and writes its number into the header 台账 line) / append (add text to the END of your section) / edit — replace one anchored range inside YOUR OWN section (§1–§6 alike; your identity decides which section) / status (your section's status line) / close (freeze the record).",
        },
        path: {
          type: "string",
          description: "depth-0 only (D-BR21) — the batch record to operate on (若传则须可读). Omit it to target the unique in-flight record (0 or ≥2 in flight ⇒ refuse). Sub-agents and design reviews: do NOT pass path — your target record arrives via the spawn binding / the review instance key.",
        },
        segment: {
          type: "string",
          description: "append/edit/status only — the batch-record section you are writing (e.g. \"§4\"). Declares the section number only; your identity decides what is actually writable (main agent: append/edit §1/§4/§6 · status §1 (engineering) / append/edit §1/§2/§4/§5/§6 · status §1/§2/§5 (normal); eng-designer §2; eng-coder §5; normal-mode coder with a batchDoc binding §5; design review §3). edit reads the same whitelist as append — one table, two actions: the section you may append is the section you may rewrite in place.",
        },
        text: {
          type: "string",
          description: "append only — the markdown to append (for a design review §3: the round's conclusion table — one row per finding, its evidence a pointer — plus the VERDICT line and the counts; the report's own text stays out). Limit 20000 characters per call; longer content is refused — split it into multiple calls (each call becomes its own section, N continues). A line that STARTS with the status-line form (`**状态行**：…`) is refused — that line has one writer (`status`); quote it with a leading `> ` instead, or write it as prose.",
        },
        oldText: {
          type: "string",
          description: "edit only — oldText must match exactly once, byte for byte (line endings included), inside the section body; newText replaces that range, and an empty newText deletes it. Refused with nothing written: a blank oldText, zero hits, two or more hits (the matching lines are named), an anchor crossing the section boundary, an anchor touching the section's PROTECTED status line (the first `**状态行**：` line of its header zone — one writer: `status`; deleting a status line elsewhere, e.g. a surplus copy, is allowed), any replacement that introduces a `**状态行**：` line, and any edit that would leave MORE status lines in the header zone than before.",
        },
        newText: {
          type: "string",
          description: "edit only — the replacement text for the anchored range; an empty string deletes the range. Limit 20000 characters per call (same cap as append); longer is refused — split it into several edits of one anchored range each. Credentials are stripped mechanically (same as append); a `## §N` heading line is refused (skeleton protection), and on §3 a `### 轮次 N（评审子代理）` line is dropped (the round stamp is tool-generated only).",
        },
        value: {
          type: "string",
          description: "status only — the new status-line value (single line; exactly one legal keyword of your section's STATUS_WORDS entry: §1 进行中/已收口 · §2 设计完成 · §3 评审通过 · §5 实施完成 — plus decoration only: surrounding symbols / a trailing ISO date / whitespace; prose goes to `note`).",
        },
        note: {
          type: "string",
          description: "status only — prose that lands as a parenthetical on the status line (`**状态行**：进行中（note）`). Single line; must carry no STATUS_WORDS keyword (those go in `value`) and no skeleton placeholders. Omit for a plain value. On the reopen path (a frozen record, §1 → 进行中) `note` is REQUIRED and lands verbatim in the §1 reopen record instead of the status-line parenthetical (it may name the frozen keyword there).",
        },
        topic: {
          type: "string",
          description: "create only — the batch subject word shared by the record header (keep the file name aligned with it).",
        },
        source: {
          type: "string",
          description: "create only — REQUIRED: the record's origin line (来源 = …; single line). It fills the header's 编制 line; without it the skeleton's placeholder would block the record's first append/status (topic-style fail-closed). Nothing is written when it is missing.",
        },
        ledger: {
          type: "string",
          description: "create / attach — optional: an existing ledger entry number to take over (e.g. \"#1830\"; a leading # is optional) — on attach that is how a reopened record takes over an unsettled row. Omit it and the call opens a NEW ledger row in the same call (status 在途 · task_book = this record · trigger 归批; attach needs title for that) — but only when no unsettled row exists on the same face (board); otherwise it is refused and lists the candidates, and you pass either ledger:\"#<id>\" to take one over or newDebt:\"<why this is not one of them>\". Pass an archived / settled / foreign-owned row and it is refused. The row and the record are one action — there is no separate registration step.",
        },
        newDebt: {
          type: "string",
          description: "create / attach — optional: one line saying why this is a NEW debt rather than one of the unsettled rows already on the same face (board). Required only when you omit ledger while that face has unsettled rows; the reason lands in the new row's evidence and is quoted in this record's closeout receipt. Omit both ledger and newDebt while unsettled rows exist ⇒ refused with the candidate list.",
        },
        board: {
          type: "string",
          description: "create / attach — optional: the owning board for the header's 台账 line (e.g. \"core\"). Given, the opened/taken-over row is a requirement and carries this board; omitted, the row is a tech_todo. create writes it into the header 括注 (未给 ⇒ 「—」); attach never rewrites the parenthesis group — it only appends to the number list.",
        },
        title: {
          type: "string",
          description: "attach only — REQUIRED when attach opens a new ledger row (not needed when you take one over with ledger): the row's own subject, i.e. what this new piece of work is. It is the same thing as the ledger row's title (one concept, one name); do not reuse the batch's original subject — a reopened record taking on a new debt is not a second copy of the old one.",
        },
        date: {
          type: "string",
          description: "create only — the record date (YYYY-MM-DD); defaults to today.",
        },
        prev: {
          type: "string",
          description: "create only — the predecessor pointer line (前情); a leading `前情 = ` prefix is stripped automatically (idempotent — repeated prefixes included); defaults to 无（独立批）.",
        },
      },
      required: ["action"],
    },
    async execute(args, ctx) {
      const agent = ctx?.agent ?? {}
      const cwd = agent.cwd
      const bases = batchDocBases(cwd) // 歧义锚 ⇒ 候选项目基底并集（#828——create / 在飞 / 写门基底集同源）
      const onWritten = injectedOnWrite
      /** depth-0 目标定位（D-BR21）：path 传 ⇒ 可读性门；缺省 ⇒ 唯一在飞批（depth-0）/
       *  绑定解析（子代理/评审）。status/close 经此注入 lifecycle；append 自带同款分支。 */
      const pickTarget = (raw) => {
        const given = typeof raw === "string" && raw.trim() ? raw : null
        if (given) {
          if (review || ctx?.depth !== 0) {
            throw new Error("batch: path is a depth-0-only parameter (D-BR21) — your target record arrives via the spawn binding / the review instance key. Nothing was written.")
          }
          return resolveBatchDocPath(cwd, given)
        }
        if (!review && ctx?.depth === 0) return findInFlightBatch(cwd, bases)
        if (batchDoc) return resolveBatchDocPath(cwd, batchDoc)
        throw new Error("batch: no batch record is bound to this caller — the target arrives via the spawn binding / the review instance key / the depth-0 in-flight scan, and none is present. Nothing was written.")
      }
      switch (args?.action) {
        case "create":
          return createBatchRecord({ args, ctx, review, cwd, bases, onWritten })
        case "attach":
          return attachBatchRecord({ args, ctx, review, cwd, pickTarget, onWritten })
        case "append":
          return appendBatchRecord({ args, ctx, review, batchDoc, onWritten })
        case "edit":
          return editBatchRecord({ args, ctx, review, batchDoc, onWritten })
        case "status":
          return statusBatchRecord({ args, ctx, review, pickTarget, onWritten })
        case "close":
          return closeBatchRecord({ args, ctx, review, pickTarget, onWritten })
        default:
          throw new Error(`batch: unknown action ${JSON.stringify(args?.action ?? null)} — pass one of create / attach / append / edit / status / close.`)
      }
    },
  }
}