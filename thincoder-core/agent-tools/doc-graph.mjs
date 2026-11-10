/**
 * agent-tools/doc-graph.mjs — `doc_graph` 工具面：入参校验 ∥ 动作分派 ∥ 文本回执。
 *
 * 设计单源 = `docs/core/design/DOC-GRAPH.md` §2.5（工具面）∥ §2.5.5（两变体契约）∥ §3（登记面）；机制单源 =
 * `../doc-graph.mjs`。工具形与同族（`ledger` ∥ `team_ledger` ∥ `doc_check`）同构：**一个工具 + `action` 枚举**
 * 四种问法（`scan` 扫 ∥ `forward` 正向 ∥ `reverse` 反向 ∥ `chain` 链路）——`doc_check` 那边是「判决」的两种问法，
 * 两者判的东西不同，故不并成一个工具（KD-2）。
 *
 * **两变体同体、动作集一处字面**（构造单源 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.2 ②）：参数化工厂
 * `makeDocGraphTool(actions, { readonly, docName, unscanned })` 产出两形——全量 `docGraphTool`（四动作，depth-0 主 agent 段）
 * ∥ 只读 `docGraphReadTool`（三动作、无 `scan`，全部 depth>0 角色段与 advisor 面）。动作集一处字面 `ALL_ACTIONS`、
 * 只读集由它派生 ⇒ schema 的 `enum` ∥ execute 的护栏 ∥ 拒文里的取值集三处取同一个 `actions` 参数，变体不写第二份
 * 字面对象（先例 = `../ledger-tools.mjs` 的 `makeLedgerTool`）。描述从同一 `actions` 生成（`ACTION_CLAUSES`）、
 * 各自一份描述档；未建图策略（`unscanned`）由只读变体传 `readonly-empty`（TOOLS.md §6.29 ③）。
 *
 * **子代理段为什么不给 `scan`**：`scan` 把边落进台账库（`doc_edges` 表）——一次显式动作，没有常驻进程、没有 watch
 * （需求 §3）；而 depth>0 段拿到的台账是**只读**变体 ⇒ 同一段里没有可依的写面，多个子代理并发扫还会重写同一张共享
 * 边表（D-DT1）。父侧扫一次、子代理查同一份库。只读性按 action 判（`isReadonlyAction`，与 `ledger` 同形）：三个
 * 查询走只读句柄、免审批；`scan` 走写面。
 *
 * **参数零默认**（设计 §2.5）：`target` 恒必填；`forward` ∥ `reverse` ∥ `chain` 的 `node`、`chain` 的 `depth` 缺一即拒
 * 并**点名**那一个——给默认值就是替调用方做决定。两个可选参数（`scan` 的 `scope` ∥ 三个读动作的 `kind`）缺席的含义
 * 都由回执首行印出来（`全仓` / `范围 K 档` ∥ 本次生效的 kind 集合），不靠调用方记。
 * `kind` 的**闭集校验住在核里**（`doc-graph.mjs` 的 `kindFilterOf`，闭集单源 = `ledger-db.mjs` 的 `DOC_EDGE_KINDS`）：
 * 本档只判形（必为字符串），闭集外拒并点名那个值由核做——一处校验，两个入口（工具 ∥ 直调核）。
 *
 * W8 契约②：本档只**动态** import `../doc-graph.mjs`（它自己再动态 import 台账库）——端壳静态闭包零 `node:sqlite`。
 * 描述外置：模型可见文本单点 = `tool-docs/{doc_graph,doc_graph-read}.md`（`DESC` 单一解析面）——
 * 两变体各一份描述档（TOOLS.md §6.29「描述面也分两份」：只读变体的字面里没有它执行不到的 `scan` 段）。
 */
import { isAbsolute, resolve } from "node:path"
import { DESC } from "../tools/shared.mjs"

/** `target` 归一：相对路径按会话锚解析（锚缺位 + 相对形 ⇒ 拒、点名锚——不落 `process.cwd()`）。 */
function targetOf(args, ctx) {
  const anchor = ctx?.agent?.cwd ?? ctx?.cwd
  const given = args?.target
  if (typeof given !== "string" || given.trim() === "") {
    throw new Error("doc_graph：target 缺失（必填）——请给项目根（带 PROJECT-MANIFEST.json 的那个目录）")
  }
  if (!isAbsolute(given) && !anchor) {
    throw new Error("doc_graph：会话锚不可用（`ctx.agent.cwd` / `ctx.cwd` 都空）——请把 target 写成绝对路径；相对 target 没有基根，本工具不落 `process.cwd()`")
  }
  return resolve(anchor ?? ".", given)
}

/** 全量动作集——本档唯一字面。 */
const ALL_ACTIONS = ["scan", "forward", "reverse", "chain"]
/** 只读动作集——由上一行派生，不写第二份字面（`scan` 归主 agent，见文件头）。 */
const READ_ACTIONS = ALL_ACTIONS.filter((a) => a !== "scan")

/** 逐动作的一句话（`action` 参数描述的唯一措辞来源：描述从**本变体的动作集**生成——只读变体的字面
 *  因此不含 `scan`，而两变体的措辞只有这一份，漂移由「同一张表同时派生动作与描述」挡住）。 */
const ACTION_CLAUSES = {
  scan: "collects the edges into the ledger database (one explicit pass, no background index)",
  forward: "lists the edges leaving a node",
  reverse: "lists the edges pointing at a node",
  chain: "walks outward from a node layer by layer, one layer per edge count",
}
/** `action` 参数描述（按本变体动作集生成；全量四个动作时与旧字面逐字相同）。 */
const actionDescOf = (actions) => `The question to ask: ${actions.map((a) => `\`${a}\` ${ACTION_CLAUSES[a]}`).join(" · ")}.`

/**
 * 工具工厂：两个装配面同体，只有 `actions` ∥ `readonly` ∥ `docName` ∥ `unscanned` 四个参数不同。
 * @param {string[]} actions — 本变体的 action 闭集（schema `enum` ∥ execute 护栏 ∥ 拒文取值集三处同取本参数）。
 * @param {{readonly?: boolean, docName?: string, unscanned?: 'throw'|'readonly-empty'}} [opts] — `readonly` 缺省 false
 *   （全量）；`docName` = 该变体的描述档名（`tool-docs/<docName>.md`）；`unscanned` = 未建图策略（B5：
 *   只读变体传 `readonly-empty`，全量保持抛既有指引）。
 */
function makeDocGraphTool(actions, { readonly = false, docName = "doc_graph", unscanned = "throw" } = {}) {
  const readOnlyVariant = readonly
  return {
    name: "doc_graph",
    description: DESC(docName),
    parameters: {
      type: "object",
      required: ["action"],
      properties: {
        action: { type: "string", enum: actions, description: actionDescOf(actions) },
        target: {
          type: "string",
          description: "The project root this call is about (the directory carrying PROJECT-MANIFEST.json; a relative path resolves against the session anchor). Required for every action — there is no default: the session anchor is the base for a relative path, never a substitute for `target`.",
        },
        node: {
          type: "string",
          description: "The node to start from, written in the identity form: `req:F16` · `doc:<path>` · `doc:<path>#<section>` · `case:CLI 41-1` · `symbol:editTool` · `ledger:#2236`. Required for forward / reverse / chain — a missing node is refused by name, never answered with an empty result.",
        },
        depth: {
          type: "number",
          description: "How many edge steps to walk (`chain` only, required there): depth 1 = the immediate neighbours, depth 2 = their neighbours, and so on. Hops are counted in edges, not nodes. There is no default — a missing depth is refused by name.",
        },
        // `scope` 只服务 `scan` ⇒ 只存在全量 schema（B6：只读角色面不出现它执行不了的参数）
        ...(readOnlyVariant ? {} : {
          scope: {
            type: "array",
            items: { type: "string" },
            description: "`scan` only, optional: re-scan just these documents (project-root-relative or absolute). Their edges are deleted and rebuilt; every other document's edges stay untouched. Omit it to scan the whole repository — the receipt's first field always says which of the two it did (`全仓` / `范围 K 档`).",
          },
        }),
        kind: {
          type: "string",
          description: "`forward` / `reverse` / `chain` only, optional: a comma-separated subset of edge kinds to read — `cites`, `cites-req`, `mentions-case`, `case-file`, `cites-symbol`, `imports`. The edges are filtered before sorting and layering, so a narrowed run is a complete run, not a few lines pulled out of a big receipt. Omit it to read every kind (ledger projections included); the receipt's first line always prints the set in force. A value outside that closed set is refused by name — it is never treated as an empty set.",
        },
      },
      additionalProperties: false,
    },
    readonly,
    /** 只读性按 action（先例 = `ledger` 的 `isReadonlyAction`）：三查询免审批，`scan` 走侧效门。
     *  只读变体的动作集不含 `scan` ⇒ 它恒为真，与 `readonly: true` 同向，不需要第二份实现。 */
    isReadonlyAction(args) { return args?.action !== "scan" },
    async execute(args, ctx) {
      const action = args?.action
      // schema 的 enum 是建议性的（provider 不强制）——枚举外的值必须由入口拒，且只印本变体的取值集。
      if (!actions.includes(action)) {
        throw new Error(`doc_graph：action 非法（${JSON.stringify(action ?? null)}）——取值 ∈ {${actions.join(", ")}}`)
      }
      const target = targetOf(args, ctx)
      const boundary = ctx?.agent?.cwd ?? ctx?.cwd
      const kindArg = args?.kind
      if (kindArg !== undefined && typeof kindArg !== "string") {
        throw new Error(`doc_graph：kind 须为逗号分隔的字符串（收到 ${typeof kindArg}）——如 "cites,imports"；闭集外拒并点名那一个值（由核校验）`)
      }
      const mod = await import("../doc-graph.mjs")
      if (action === "scan") {
        const scope = args?.scope
        if (scope !== undefined && !Array.isArray(scope)) {
          throw new Error(`doc_graph：scope 须为路径数组（收到 ${typeof scope}）——只重扫几档就给 ["<path>"]；给空数组等号于全仓`)
        }
        return mod.scanDocGraph({ target, scope, boundary })
      }
      return mod.queryDocGraph({ action, target, node: args?.node, depth: args?.depth, kind: kindArg, boundary, unscanned })
    },
  }
}

/** 全量变体（depth-0 主 agent 段）：四动作，含 `scan`；未建图仍抛既有指引（逐字不变）。 */
export const docGraphTool = makeDocGraphTool(ALL_ACTIONS, { readonly: false })
/** 只读变体（全部 depth>0 角色段与 advisor 面）：三动作、无 `scan`；同名不塌缩——两变体互斥装配。
 *  未建图返可读空态（不要求父代跑 scan、不隐式写共享边表）。 */
export const docGraphReadTool = makeDocGraphTool(READ_ACTIONS, { readonly: true, docName: "doc_graph-read", unscanned: "readonly-empty" })
