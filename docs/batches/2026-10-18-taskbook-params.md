# 2026-10-18 · 任务书五段参数化
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 10:34「我为什么要用自由文本干这事儿？为什么需要五个字段就给五个参数？」+ 10:37「目标/已知事实这些，也要做，我认为目前这样是不够的，我反感的是用正则去撞自由文本，而不是说要求不需要提」+ 10:42「可以，现在就派，自动跑完」——直系前情 = 批 `2026-10-18-prompt-residual-fixes` 第 ⑥ 项（删五段文本正则门），批档 `docs/batches/2026-10-18-prompt-residual-fixes.md`。
> 台账 = #1653（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**用户裁定（三句 · 逐字）**

- **10:34**：「我为什么要用自由文本干这事儿？为什么需要五个字段就给五个参数？」
- **10:37**：「目标/已知事实这些，也要做，我认为目前这样是不够的，我反感的是用正则去撞自由文本，而不是说要求不需要提。」
- **10:42**：「可以，现在就派，自动跑完。」
- **10:41（边界澄清·逐字）**：「我没要求过检查写得好！是你他妈的在加戏！」

**本批条目（一项）**

任务书五段从「散文 + 正则查标题」改为 **schema 参数**——五项必填，判据 = 类型 + `trim()` 非空。

| 新参数 | 旧字段 |
|---|---|
| `goal` | 目标与理由 |
| `knownFacts` | 已知事实 |
| `designPoints` | 设计要点与禁止范围 |
| `acceptance` | 验收标准 |
| `reportFormat` | 交付报告格式 |

**边界（不许越）**

- **只做「提没提」**：参数在不在、是不是字符串、trim 后是否非空。**不做内容质量检查**——用户 10:41 明确从未要求；任何「写得好不好」的判据都属加戏。
- **不设正则**：不再有「撞中文标题 / 英文 marker」的任何形态。
- **不做验收标准的结构化子对象**（如 `[{command, expect}]`）——那是父侧上一轮自行提出的，用户未要求，**本批不做**。
- **删正则门是前提、不是本批内容**：由批 `2026-10-18-prompt-residual-fixes` 第 ⑥ 项（`eng-coder#155` 在跑）完成；本批在其落地后实施（同一文件 `spawn-gates.mjs`，不能并行改）。

**已结构化的两项（沿用，不改）**：`round`（枚举 `initial|fix`）· `files`（字符串数组）。

**为什么不是加戏**：用户 10:37 的原话区分了两件事——**反感正则撞文本**（删）∧ **要求本身要提**（建）。本批做的是后者。

**父侧裁定（设计报告 7 条上抛 · 2026-10-18 10:50）**

| # | 上抛 | 裁定 |
|---|---|---|
| 1 | 验收行「`required` 含五项」与多 action 单工具相抵 | **已裁**：采纳设计倾向 ①②③（description 声明 + `TASK_BOOK_PARAMS` 门 + `required: []` 不动）。验收行改读「必带集合含五项」，原字面作废 |
| 2 | 前批 §2.10① 的舱 D 文案（「唯一机械必带 = `round`」）与本批方向相反 | **判为时序，非矛盾**：前批收口时（10:44）真态确为「只有 `round`」，§6 记的是当时真态、历史正确，**不追改**（前批已冻结）。**需求档由本批实施轮改写**为「五项 + `round`」——本批 AC 覆盖该面，实施后两档自洽。设计无需为此改设计 |
| 3 | `PROMPT-SYSTEM.md:281/:647/:854` · `TOOLS.md:917/:950` · `DOC-DISCIPLINE.md:1400` 仍写旧门 | **前批已裁「记录面留史」**（见前批 §6 五）；本批不再处置 |
| 4 | `permission.mjs:37` 权限面板标签取 `args.task`，工程角色改传五项后可能为空 | **登记待办**（不在本批射程）；父侧本轮落台账行 |
| 5 | `MODEL-BENCH.md` §10.4 p1 与运行面副本漂移 | **已收正**，接受 |
| 6 | `ENG_TASK_BOOK_MIN` 由文本骨架改为五项参数样例对象 | **接受**。理由：文本骨架会教人漏传参数——模板的**形**必须与门的**形**同构，否则模板反向误导。用户 06:58「删门不删模板」的**留模板**之意不变，只换形 |
| 7 | §2 两条自检更正（行号回折 / `task` 判据改载体） | **接受**，以 §2 标注「以本条为准」处为准 |

**前置核对（设计 2.11 第三条）**：设计报告称「前批 §5 状态行只记舱 A」= **其读时旧快照**；父侧本刻实证 `docs/batches/2026-10-18-prompt-residual-fixes.md:622` = `**状态行**：实施完成（舱 A 五档 + 舱 B ⑥ · 审计 clean · 评审 pass · fix round 0）` ⇒ **三条前置全绿，可实施**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-10-18 修复轮 · #157 十一条逐条落盘 · 2.11 三条前置全绿（依据 = `docs/batches/2026-10-18-prompt-residual-fixes.md:622`））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.0 方法与理由（决定 + 理由 · 先例 · 公共源勘察）

**决定**：任务书五段从「散文标题 + 正则门」改为 **schema 结构化参数**——五项必填，判据只有三条（参数存在 ∧ `typeof === "string"` ∧ `trim()` 非空）；五项由运行时按固定序拼进子代理任务书文本，工程角色的 `task` 退为可选自由文本补充。**理由**：正则门只认标题、查不到内容（前批 ⑥ 已删）；把「提没提」交给参数承载后，判据是类型判断，不读一个字的语义——正是用户 10:37 的区分（**反感正则撞自由文本 ≠ 要求不必提**，批档 §1）。

**先例（对齐 ∥ 偏离）**：

| 面 | 先例坐标 | 先例批（可一跳） | 对齐 ∥ 偏离 |
|---|---|---|---|
| 结构化参数 + 门 | `round`：schema enum（`thincoder-core/agent-tools/subagent.mjs:152`，值集 = `spawn-gates.mjs:15` 的 `ROUND_VALUES`）→ `validateRoundParam`（`spawn-gates.mjs:34`）→ 调用点 `subagent-spawn.mjs:229-231` | 引入批档不在盘（历史重贴为单提交 `c90b08fb`）；在盘最近处置 = 批 `2026-10-18-prompt-residual-fixes` §2 6.1 表（`docs/batches/2026-10-18-prompt-residual-fixes.md:710-715`——旧字段门收为 `validateRoundParam`） | **对齐**：同形落——常量与谓词同置 `spawn-gates.mjs`（D2），schema 引用不复制值集，门在 `buildSpawnChild` 同点调用；必带集合同 = eng-coder/eng-designer |
| 参数直接承载声明 | `files`（`subagent.mjs:154` 字符串数组 → `normalizeFileList`，`subagent-spawn.mjs:146-157`） | 引入 = §20 任务调度器提交 `5f9748f4`（`files` / `dependsOn` 准入），批档不在盘（同 `c90b08fb`）；在盘纪律先例 = `docs/batches/2026-10-15-doc-ref-direction-cleanup.md:97`（「`files` 是调度通道」实证行） | **对齐**：不做文本解析、不做内容校验 |
| 任务书载体 | 旧形 `input = args.task`（`subagent-spawn.mjs:348`）；五项若只作门面 = 「为过门而写标签」 | 无引入批（本批为第一例：参数 → 拼装单点）；同向判据 = 上批删正则门（`docs/batches/2026-10-18-prompt-residual-fixes.md:832`） | **偏离**：五项必须进场（拼装单点 `composeTaskBookBrief`），否则参数是装饰——这与前批删正则门的判据同源（标签成本无收益） |
| 工具描述面 | §6.30 先例（描述随门走；`docs/core/design/AGENT-LOOP-SUBAGENT.md:655-677`） | 批 `toolface-first-use-fixes`（2026-10-05 · 台账 #938）；批档已清，在盘坐标 = `docs/batches/2026-10-15-doc-ref-direction-cleanup.md:1095`（原 §6.30 标题逐字含批名与台账号） | **对齐**：描述面逐字载明参数形，不复写值集 |

**公共源勘察（证据行）**：仓内已查 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.22 / §6.30 · `docs/core/design/ENGINEERING-MODE-V2.md:265` · `docs/core/design/MODEL-BENCH.md` §10.2–§10.4 · `docs/core/requirements/ENGINEERING-MODE-V2.md` §8.2 · `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md` · `thincoder-core/prompts/persona-engineering.md` / `discipline-normal.md`（两模式派单节）· `thincoder-core/tool-docs/subagent.md` · `bench/probe/*` / `bench/check/probe.check.mjs` · `scripts/api-contract.mjs`。**外部源：无相关**（本批为仓内机制参数化，无外部 API / 协议面）；工作树内独立公共源文档仓：无（`thincoder.com/` / `thinworker.com/` = 站点静态资源，非技术源文档）。`D:\ref\` 参考系未声明于 `PROJECT-MANIFEST.json` 的 `index.publicRepos` ⇒ 本批未查。

### 2.1 本批条目（覆盖）

本批条目 **1 项**（批档 §1：任务书五段 → 五项 schema 参数），下拆 7 个工作项——同一需求的处置面，不另立条目。需求源 = 批档 §1（用户 2026-10-18 10:34 / 10:37 逐字）+ 台账 `#1653`；**无新增需求条目**。

| # | 工作项 | 判性 | 处置 | 回指 |
|---|---|---|---|---|
| ① | 五项进 schema + 机械门（判据 = 存在 / string / trim 非空） | 机制空位（正则门删后的替换形） | 2.3.1–2.3.2 | AC-1..AC-4 |
| ② | 五项进场：拼装配进子代理任务书（`task` 退为可选补充） | 同一决定的装配面（不进场 ⇒ 参数成装饰） | 2.3.3 | AC-5 |
| ③ | 调用方改到新形态（schema / 装配 / 探针 driver / probe / 夹具 / 常驻自检） | 连带 | 2.3.1–2.3.4 | AC-3..AC-7 |
| ④ | 工具描述与提示词改到参数形（tool-docs + EN 两档 + CN 两档） | 连带（描述随门走） | 2.3.5–2.3.7 | AC-8 |
| ⑤ | 机制所有者设计档随正（§6.22 / §6.30 / EM-V2:265 / MODEL-BENCH §10.3–§10.4） | 文档连续性 | 2.3.8 | AC-9 |
| ⑥ | `API-CONTRACT.md` 重生成 | 生成面 | 2.3.9 | AC-10 |
| ⑦ | 需求档随正（**主 agent 笔**） | 三链一致 | 2.10 ① | AC-11 |

**批准前提（父侧已裁，2026-10-18 10:4x）**：验收行「schema 的 `required` 集合含五项」经上抛裁定改为——①五项在 schema 逐个可读、description 写 `REQUIRED for …`；②机械必带集合 = `spawn-gates.mjs` 导出的 `TASK_BOOK_PARAMS`；③对象级 `required` 保持 `[]`。理由：`subagent.mjs:133-161` 是多 action 单工具，对象级 `required` 会把 `{action:"status", id}` 误标「缺五项」。**本项不再是待裁项**。

### 2.2 设计档落点

- 本批设计载体 = 本 §2（条目 / 逐处改前→改后 / 验收 / 决策 / 边界）。
- 机制所有者档（**本席已落，见 2.3.8**）：`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.22 / §6.30 · `docs/core/design/ENGINEERING-MODE-V2.md:265` · `docs/core/design/MODEL-BENCH.md` §10.3-2 / §10.4。
- CN 提示词两档（**本席已落，见 2.3.7**）：`docs/core/design/prompts/persona-engineering.md:162-172` · `docs/core/design/prompts/discipline-normal.md:203-211`。
- 生成面：`docs/core/design/API-CONTRACT.md` 由 `node scripts/api-contract.mjs --write` 重生成（不手改）。
- 需求档 = 主 agent 笔（2.10 ①；AC-11）。

### 2.3 机制设计（逐处 · 改前 → 改后）

#### 2.3.1 `thincoder-core/agent-tools/spawn-gates.mjs`（91 行 → 预计 138 行）

**(a) 头注 `:4`**：`已实现：F2（round 结构化参数校验）· F6（files 声明面拦截谓词）。` → `已实现：F2（round 枚举 + 任务书五项结构化参数校验/拼装）· F6（files 声明面拦截谓词）。`

**(b) `ENG_TASK_BOOK_MIN`（`:17-26`）改为五项参数样例对象**（保留常量名 = 前批「留作模板」裁定；形状随新机制——文本骨架会教人把标签写进 `task` 而漏传参数，属活陷阱）：

```js
/** 任务书五项参数样例（供人照抄；不是门的判据——门只判存在 / 类型 / 非空）。 */
export const ENG_TASK_BOOK_MIN = {
  goal: "实现批准设计（样例任务书——五项参数齐备）。",
  knownFacts: "设计已评审通过、token 已签发、批次档在册。",
  designPoints: "仅落设计档受影响文件清单；禁夹带新语义。",
  acceptance: "设计档的验收口径逐条可机验、项目验证链全绿。",
  reportFormat: "交付表 + 文件路径 + 验证命令与结果。",
}
```

**(c) 新增五项名集（D2 单源）+ 校验 + 拼装**（`ROUND_VALUES` / `validateRoundParam` 原样不动）：

```js
/** F2 任务书五项结构化参数（必带集合 = eng-coder/eng-designer）。
 * 单源：本档为唯一名集处——校验（validateTaskBookParams）、拼装（composeTaskBookBrief）、
 * 错误文案与探针夹具校验同引用（D2）。
 */
export const TASK_BOOK_PARAMS = ["goal", "knownFacts", "designPoints", "acceptance", "reportFormat"]

/** 拼装标签（不导出；仅词面，不是判据——无任何匹配读它）。 */
const TASK_BOOK_LABELS = {
  goal: "Goal & why",
  knownFacts: "Known facts",
  designPoints: "Design points & forbidden scope",
  acceptance: "Acceptance criteria",
  reportFormat: "Delivery report format",
}

/**
 * F2 任务书五项参数校验（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）：
 * 判据只有三条——参数存在 ∧ typeof string ∧ trim() 非空。不读内容：无正则、
 * 无标题匹配、无双语 marker。缺 / 空白 / 非字符串 → 合并抛，文案逐项点名该参数。
 */
export function validateTaskBookParams(args) {
  const a = args ?? {}
  const failed = []
  for (const name of TASK_BOOK_PARAMS) {
    const v = a[name]
    if (v === undefined || v === null) failed.push(`${name} — missing (the task book is five structured parameters)`)
    else if (typeof v !== "string") failed.push(`${name} — must be a string (got ${typeof v})`)
    else if (v.trim() === "") failed.push(`${name} — blank (trim() is empty)`)
  }
  if (failed.length === 0) return
  throw new Error(
    `Engineering spawn task-book gate: ${failed.join(" · ")}. ` +
    `The task book is five structured parameters (${TASK_BOOK_PARAMS.join(" / ")}) required for eng-coder/eng-designer spawns; ` +
    `a missing, blank or non-string value is a dispatch defect and the spawn is refused.`)
}

/** 五项参数 → 子代理任务书文本（**非门禁**，纯拼装）：按 TASK_BOOK_PARAMS 固定序 + 标签，
 * 空值跳过，`\n\n` 分隔。拼装单源 = 本函数——子代理 input 与探针判官的「任务书全文」同源。 */
export function composeTaskBookBrief(args) {
  const a = args ?? {}
  const parts = []
  for (const name of TASK_BOOK_PARAMS) {
    const v = a[name]
    if (typeof v === "string" && v.trim() !== "") parts.push(`${TASK_BOOK_LABELS[name]}: ${v.trim()}`)
  }
  return parts.join("\n\n")
}
```

**判据面红线**：本档新增代码**零正则字面**（`/…/` = 0）、零中文词面（标签为英文；中文 `目标与理由` 类字面在 `spawn-gates.mjs` / `subagent.mjs` 全文零命中）——AC-6 机检。

#### 2.3.2 `thincoder-core/agent-tools/subagent.mjs`（414 行 → 预计 421 行）

**(a) 五条 schema 属性**（`:152` `round` 之后插入；新 `:153-157`；`async` 起顺延 +5）：

```js
      goal: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' spawns: the task book's goal & why — the problem this solves and the cost chain (content only, no label — the runtime composes the labels)." },
      knownFacts: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' spawns: the facts and file paths the parent already verified — the child must not re-explore them." },
      designPoints: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' spawns: design points & forbidden scope — what to land and what must not be touched." },
      acceptance: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' spawns: acceptance criteria — machine-verifiable (commands / thresholds / assertion counts)." },
      reportFormat: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' spawns: the delivery-report format the child must produce." },
```

**(b) `task` description（`:142`）改写**：

改前：`Required for action:'spawn' (the self-contained task brief) and action:'escalate' (goal, constraints, entry files, acceptance criteria).`

改后（载体形——五项即满足任务书，`task` 是另一载体）：`For action:'spawn' (any role) the brief is either the five structured task-book parameters (goal / knownFacts / designPoints / acceptance / reportFormat) or a free-text task — the five parameters satisfy the brief for every role, and task is then an optional supplement (explore/plan/coder normally use task alone; eng-coder/eng-designer must carry the five). For action:'escalate': goal, constraints, entry files, acceptance criteria.`

**(c) `required: []`（`:160` → 新 `:165`）不动**（父侧裁定；多 action 单工具）。

**(d) 运行时 task 必填判据（`:219`）改为「载体二选一」**：五项结构化参数（拼装后非空）或 `task` 自由文本——两者皆缺才拒。不按角色豁免：CN / EN 普通模式派单节同样指向五项参数，只给工程角色豁免会让普通模式 `coder`「按提示词传五项却仍被 task 判据拒」= 假拒面。

改前：

```js
    if (typeof args.task !== "string" || !args.task.trim()) {
      throw new Error("subagent action:'spawn' requires a task (the self-contained task brief).")
    }
```

改后：

```js
    // 任务书载体二选一：五项结构化参数（拼装后非空）或 task 自由文本——两者皆缺 ⇒ 拒。
    // （工程角色另有五项必带门 = spawn-gates.validateTaskBookParams，落 buildSpawnChild。）
    if (!composeTaskBookBrief(args) && (typeof args.task !== "string" || !args.task.trim())) {
      throw new Error("subagent action:'spawn' requires a task (the self-contained task brief) or the five structured task-book parameters.")
    }
```

**(e) `:39` import 扩为**（行数不变）：

```js
import { ROUND_VALUES, composeTaskBookBrief } from "./spawn-gates.mjs"
```

#### 2.3.3 `thincoder-core/agent-tools/subagent-spawn.mjs`（412 行 → 预计 421 行）

| 位置（改前） | 改前 → 改后 |
|---|---|
| `:29` 注释 | `任务书 round 结构化参数校验本体落` → `任务书 round 枚举 + 五项结构化参数校验/拼装本体落` |
| `:31` import | `import { validateRoundParam } from "./spawn-gates.mjs"` → `import { validateRoundParam, validateTaskBookParams, composeTaskBookBrief } from "./spawn-gates.mjs"` |
| `:205` 之前新增本地 helper | 见下 |
| `:214` | `logBatchDocRefs(parent, role, args.task, batchDocAbs)` → `logBatchDocRefs(parent, role, taskBriefOf(args), batchDocAbs)`（五项里的 `.md` 引用同样进观测面） |
| `:229-231` 门 | `if (role === "eng-coder" \|\| role === "eng-designer") { validateRoundParam(args) }` → 同分支内追加 `validateTaskBookParams(args)`（round 之后、token 门之前；门序 = §6.22） |
| `:348` input | `let input = args.context ? \`Context:\n${args.context}\n\nTask:\n${args.task}\` : args.task` → `let input = args.context ? \`Context:\n${args.context}\n\nTask:\n${taskBriefOf(args)}\` : taskBriefOf(args)` |

本地 helper（不导出；放在文件头 import 之后）：

```js
/** 任务书播报文本：五项参数拼装 + 可选 task 自由文本（无五项 ⇒ 原 task 逐字——旧形零变）。 */
function taskBriefOf(args) {
  const composed = composeTaskBookBrief(args)
  if (!composed) return args.task
  const extra = typeof args.task === "string" ? args.task.trim() : ""
  return extra ? `${composed}\n\n${extra}` : composed
}
```

**语义点**：①五项 → 子代任务书的拼装单点；②`_engTaskInput = input`（`:373`）随之 = 拼装文本——审计摘要的 `验收标准` / `Acceptance criteria` 标记仍命中（`audit-block.mjs:29`）；③`_taskSeal = taskSeal(input)`（`subagent-run.mjs:93`）随之变化 = 如实；④`task` 只给、五项全缺（工程角色）⇒ 门拒（旧法不再放行）。

#### 2.3.4 探针腿（四个文件 + 冻结副本）

**夹具两层机检的形状（先钉死）**：`bench/check/probe.check.mjs:62` 的 `assert.deepEqual(FROZEN_FIXTURES, FROZEN_COPY)` 比较**整个族对象** ⇒ 两侧族对象的键集与值必须逐键相同。

冻结族（`bench/probe/data.mjs` 与 `bench/check/probe-frozen.mjs` 各一份，逐字相同）：

```js
  p1: {
    goal: "…",
    knownFacts: "…",
    designPoints: "…",
    acceptance: "…",
    reportFormat: "…",
    files: { … },
    targets: [ … ],
  },
```

运行面项（`FIXTURES`——**派生面**，冻结副本不复制它）：

```js
{
  id,
  taskBookParams,     // Object.fromEntries(TASK_BOOK_PARAMS.map((k) => [k, f[k]]))
  taskBook,           // composeTaskBookBrief(taskBookParams)
  targets: [...f.targets],
  sandboxFiles: fixtureFiles(id),
  batchDoc: batchDocOf(id),
}
```

**`bench/probe/data.mjs`（217 → 215 行）**

- 头注块（`:1-9`）后新增一行 import（本档现无 import）：`import { TASK_BOOK_PARAMS, composeTaskBookBrief } from "../../thincoder-core/agent-tools/spawn-gates.mjs"`（+1；跨树 import 先例 = 前批同档 import 已删的 `validateTaskBookFields`）。
- `:13` `PROBE_VERSION = 1` → `2`（夹具对象形态 + 子代输入文本变化 ⇒ §10.2「夹具 / 参数口径」轴 +1；0 行）。
- `FROZEN_FIXTURES` 头注（`:51-55`）：`taskBook` 逐字 = §10.4 → 五项参数逐字 = §10.4（0 行）。
- 三族（`p1` `:57-67` / `p2` `:68-84` / `p3` `:85-112`）：`taskBook: [` + 五行 + `].join("\n")`（七行）→ 五行平铺字段（每族 −2，合 −6）；字段值逐字 = 改前五段去掉中文标签（3 族 × 5 = 15 个字段）。
- `FIXTURES`（`:119-128`）：加 `const taskBookParams = Object.fromEntries(TASK_BOOK_PARAMS.map((k) => [k, f[k]]))` 一行；`taskBook: f.taskBook,` 一行 → `taskBookParams,` + `taskBook: composeTaskBookBrief(taskBookParams),` 两行（合 +2）。
- `validateFixtures`（`:140-163`）：头注「任务书在场（非空串）」→「任务书五项逐项在场（string ∧ trim 非空）」（0 行）；`:148-150` 三行非空串检查 → 四行逐项循环（+1）：

```js
    for (const name of TASK_BOOK_PARAMS) {
      const v = f[name]
      if (typeof v !== "string" || v.trim() === "") throw new Error(`夹具族「${id}」任务书字段「${name}」缺失或为空`)
    }
```

⇒ 217 + 1 − 6 + 2 + 1 = **215**（Δ −2）。

**`bench/check/probe-frozen.mjs`（112 → 106 行）**：三族同形改写为五行平铺字段（字段值逐字复制 `data.mjs`），每族 −2 ⇒ **−6**。**不**复制 `taskBookParams` / `taskBook`（派生面不是夹具字面）。族对象键集 = 五项 + `files` + `targets`，与 `data.mjs` 逐键相同 ⇒ `probe.check.mjs:62` 的 `deepEqual` 保持绿。

**`bench/probe/driver.mjs`（266 行，行数不变）**

- `:97-99` `assembleProbeChild({ parent, ctx, model, batchDoc, taskBook })` → `({ …, taskBookParams })`；`const args = { ...taskBookParams, round: "initial", batchDoc, model }`。
- `:103-105` `assemblyLeg` / `:176` / `:222` `runProbeRun`：入参 `taskBook` → `taskBookParams`（判官面仍用 `fixture.taskBook`，见 `probe.mjs`）。

**`bench/probe.mjs`（310 行，行数不变）**：`:104`（`runProbeRun`）与 `:201`（`assemblyLeg`）各加 `taskBookParams: fixture.taskBookParams`；判官调用 `:113` / `:228` 仍传 `taskBook: fixture.taskBook`。

**`bench/check/probe.check.mjs`（267 → 273 行）**

- `:17` import 追加 `validateTaskBookParams`（同行改，0 行）。
- `:60` `PROBE_VERSION` 断言 1 → 2（0 行）。
- `:64` `FROZEN_COPY.p1.taskBook !== FROZEN_COPY.p2.taskBook` → `new Set([FROZEN_COPY.p1.goal, FROZEN_COPY.p2.goal, FROZEN_COPY.p3.goal]).size === 3`（反例控制：三族任务书互不相同；0 行）。
- `:67` 用例名按盘上实际标题重锚（下一行「夹具 schema：…」逐字替换）：`夹具 schema：任务书五项齐备（各为非空串）/ targets ⊆ 树内档 / 路径沙箱内相对形态`（两个分句逐字保留；0 行）。
- `:86` / `:103` 两处 `taskBook: fixture.taskBook` → `taskBookParams: fixture.taskBookParams`；`:257-259` 判官三调仍传 `taskBook: fixture.taskBook`（判官读拼装后的全文）。
- `:104-106` round 断言保留；其后新增五项常驻断言（+6 行）：

```js
    // 任务书五项：齐全放行；缺 / 空白 / 非字符串 ⇒ 机械拒并点名该参数
    const tb = { goal: "g", knownFacts: "k", designPoints: "d", acceptance: "a", reportFormat: "r" }
    assert.doesNotThrow(() => validateTaskBookParams(tb))
    assert.throws(() => validateTaskBookParams({ ...tb, goal: undefined }), /goal/)
    assert.throws(() => validateTaskBookParams({ ...tb, knownFacts: "   " }), /knownFacts/)
    assert.throws(() => validateTaskBookParams({ ...tb, acceptance: 42 }), /acceptance/)
```

⇒ 267 + 6 = **273**（Δ +6）。断言住在既有 `check()` 块内 ⇒ 登记块数不变（计数口径 = `bench/check/harness.mjs:20-23` 登记 / `:36-46` 逐块判）。

#### 2.3.5 `thincoder-core/tool-docs/subagent.md`（43 → 38 行）

`:23` 整行替换为（与 `docs/core/design/AGENT-LOOP-SUBAGENT.md:663` 代码块**逐字全等**，D2 单源；载体形 = 五项即满足任务书，`task` 是另一载体）：

```text
Task book (eng-coder / eng-designer spawns): five structured parameters — goal (goal & why), knownFacts, designPoints (design points & forbidden scope), acceptance (acceptance criteria), reportFormat (delivery-report format) — plus round (initial|fix — the structured parameter). All five are required for engineering roles: a missing, blank or non-string value is refused with the parameter named. They are composed into the child's brief in that order. For any role the brief is either these five parameters or a free-text task; task is then an optional supplement (for explore/plan/coder, task alone is the brief).
```

`:25-31`（七行：引导句 + 六行文本骨架）→ 两行参数骨架（−5 行）：

```text
Pass one parameter per field — contents only (the runtime adds the labels):
subagent(role="eng-coder", round="initial", goal="…", knownFacts="…", designPoints="…", acceptance="…", reportFormat="…", batchDoc="<batch record>", designToken="…")
```

⇒ 43 − 5 = **38**。

#### 2.3.6 EN 运行面两档（eng-coder 落笔；主 agent 内容权）

- `thincoder-core/prompts/persona-engineering.md:158-167`：字段列表 → 参数列表（`goal` / `round` / `knownFacts` / `designPoints` / `acceptance` / `reportFormat`），尾句改为「工程角色缺任一 / 空白 / 非字符串 = 机械拒并点名该参数」；两条 ⚠️（known-facts 是读数 / `files` 是调度通道）逐字保留。
- `thincoder-core/prompts/discipline-normal.md:206-213`：同形改法，一句「工程模式下机械拒；普通模式按本条纪律执行（缺项 = 委托缺陷）」。
- 两档与 CN 正本（2.3.7）逐点对位；英文 = 精确翻译（需求 §8.4）。

#### 2.3.7 CN 正本两档（**本席已落**）

- `docs/core/design/prompts/persona-engineering.md:162-172`：`- 每次委派都带任务书——**五项 = spawn 结构化参数**（直接传参；子代理读到的任务书由运行时按固定序拼装，`task` 只作自由文本补充）：` + 六行参数列表（`goal` / `round` / `knownFacts` / `designPoints` / `acceptance` / `reportFormat`）+ 门判据句；两条 ⚠️ 原句未动。档 232 → 233 行。
- `docs/core/design/prompts/discipline-normal.md:203-211`：同形；档 256 → 257 行。

#### 2.3.8 机制所有者设计档随正

**`docs/core/design/AGENT-LOOP-SUBAGENT.md`（673 → 679 行，已落）**：§6.22 定位 / 门序 / F2 行 / 落点句 / AC-M5-2（`:246` / `:248` / `:253` / `:257` / `:264`）；§6.30 标题 / 描述字面 / 参数骨架 / KD-TF1 / 新增 KD-TF3 / 边界（`:655`–`:677`）。

**同档三处正文（本席本轮就地改 · 行内改写 · 改前 → 改后逐行记录）**

**① `:451`——`buildSpawnChild` 接口契约「改后」listing**

改前：

```js
let input = args.context ? `Context:\n${args.context}\n\nTask:\n${args.task}` : args.task
```

改后（= 2.3.3 规定的实现形，非「意图版」）：

```js
let input = args.context ? `Context:\n${args.context}\n\nTask:\n${taskBriefOf(args)}` : taskBriefOf(args)
```

**② `:640`——§6.29.3 门区句**

改前：

```text
spawn 门区（`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `batchDoc` 门；扫描对象 = `args.task` 任务书文本）——提取与命中三定：
```

改后：

```text
spawn 门区（`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `batchDoc` 门；扫描对象 = 拼装后的任务书文本（五项拼装 + 可选 `task`））——提取与命中三定：
```

**③ `:663`——§6.30 描述正本（与 `tool-docs/subagent.md:23` D2 共享的字面）**

改前：

```text
Task book (eng-coder / eng-designer spawns): five structured parameters — goal (goal & why), knownFacts, designPoints (design points & forbidden scope), acceptance (acceptance criteria), reportFormat (delivery-report format) — plus round (initial|fix — the structured parameter). All five are required: a missing, blank or non-string value is refused with the parameter named. They are composed into the child's brief in that order; task is an optional free-text supplement for these roles (for other roles task is the brief).
```

改后：2.3.5 的载体形新字面（617 字符；落笔后与 `tool-docs/subagent.md:23` 逐字全等）。

三处皆单行内改写 ⇒ 档案总行数 **679 不变**（实读：改前 679 → 改后 679），不新增 / 删除小节，§6.22 / §6.30 其余正文零触。

- `docs/core/design/ENGINEERING-MODE-V2.md:265`：委派治理句改为「五个结构化 spawn 参数 + `round`；五项按固定序拼进子代理任务书」。档 524 行不变。
- `docs/core/design/MODEL-BENCH.md`：§10.3-2 args 形与门句（`:1344-1345`）；§10.4 三族正本改五字段形（`:1367` / `:1372-1376` / `:1389-1393` / `:1406-1410`），并把 `p1` 的 `设计落点` 对齐 data.mjs 现盘字面 `本批设计落点`（原两档漂移，逐字正本层按运行面统一）。档 1748 → **1749** 行（§10.3-2 的 `args` 行回折 +1）。

#### 2.3.9 `docs/core/design/API-CONTRACT.md` 重生成

`node scripts/api-contract.mjs --write`（不手改）。新导出 = `TASK_BOOK_PARAMS` / `validateTaskBookParams` / `composeTaskBookBrief` 三行；`spawn-gates.mjs` / `subagent-spawn.mjs` 其余导出行号随动。

### 2.4 参数 vs 旧五段对照

| 参数 | 旧五段（标签） | 判据（唯一三条） | 拼装标签（子代可见） |
|---|---|---|---|
| `goal` | 目标与理由 (goal & why) | 存在 ∧ string ∧ trim 非空 | `Goal & why:` |
| `knownFacts` | 已知事实 (known facts) | 同上 | `Known facts:` |
| `designPoints` | 设计要点与禁止范围 (design points & forbidden scope) | 同上 | `Design points & forbidden scope:` |
| `acceptance` | 验收标准 (acceptance criteria) | 同上 | `Acceptance criteria:` |
| `reportFormat` | 交付报告格式 (delivery-report format) | 同上 | `Delivery report format:` |

**不做**（用户 10:41 边界）：不做内容质量检查、不做 `acceptance` 结构化子对象、不做长度下限、不做语义校验。判据 = `spawn-gates.mjs` 的三行（存在 / 类型 / trim）。

### 2.5 受影响文件与测试覆盖

计数口径 = 行数（`readFileSync(f,"utf8").split("\n")`，文件以换行结尾时去掉末尾一个空元素——不把幻影末元素计入）；「改前」= 本批落笔前的读数（CN 两档与三档设计档为本批已落后的现值，其「改前」列是落笔前数）；读数 = 2026-10-18 10:55 本席在盘实测；「预计」由实施轮实测复核。每行 Δ 的复算式见表后「Δ 复算」。

| 文件 | 面 | 改前（行） | 预计改后 | Δ |
|---|---|---|---|---|
| `thincoder-core/agent-tools/spawn-gates.mjs` | 产品码 | 91 | 138 | +47 |
| `thincoder-core/agent-tools/subagent.mjs` | 产品码 | 414 | 421 | +7 |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品码 | 412 | 421 | +9 |
| `thincoder-core/tool-docs/subagent.md` | 产品码（描述面） | 43 | 38 | −5 |
| `bench/probe/data.mjs` | 产品码（bench 未列工程工具面 ⇒ fail-closed） | 217 | 215 | −2 |
| `bench/check/probe-frozen.mjs` | 产品码（bench 自检） | 112 | 106 | −6 |
| `bench/probe/driver.mjs` | 产品码（bench） | 266 | 266 | 0 |
| `bench/probe.mjs` | 产品码（bench） | 310 | 310 | 0 |
| `bench/check/probe.check.mjs` | 产品码（bench 自检） | 267 | 273 | +6 |
| `thincoder-core/prompts/persona-engineering.md` | EN 运行面 | 226 | 227 | +1 |
| `thincoder-core/prompts/discipline-normal.md` | EN 运行面 | 262 | 263 | +1 |
| `docs/core/design/prompts/persona-engineering.md` | CN 正本（**已落**） | 232 | 233 | +1 |
| `docs/core/design/prompts/discipline-normal.md` | CN 正本（**已落**） | 256 | 257 | +1 |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档（**已落**） | 673 | 679 | +6 |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 设计档（**已落**） | 524 | 524 | 0 |
| `docs/core/design/MODEL-BENCH.md` | 设计档（**已落**） | 1748 | 1749 | +1 |
| `docs/core/design/API-CONTRACT.md` | 生成面 | 4433 | 重生成 | 生成区随动 |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | 需求档（**主 agent 笔**） | 760 | 760 | 0（三行改写） |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md` | 需求档（**主 agent 笔**） | 44 | 44 | 0（两处改写） |

**Δ 复算（逐条对应小节；括号内 = 该小节的编辑清单）**：`spawn-gates` +47 = −2（样例对象 10 行 → 8，2.3.1(b)）+ 49（名集 6 ∥ 标签 9 ∥ 校验 21 ∥ 拼装 13，含块间空行，2.3.1(c)）· `subagent.mjs` +7 = +5（五条 schema，2.3.2(a)）+ 2（task 判据 3 → 5 行，2.3.2(d)；description 与 import 皆同行改）· `subagent-spawn` +9 = +8（`taskBriefOf` 7 行 + 空行，2.3.3）+ 1（门内 `validateTaskBookParams(args)` 一行）· `tool-docs` −5 = 0（`:23` 同行换，2.3.5）+ −5（`:25-31` 七行 → 两行）· `data.mjs` −2 = +1（import）− 6（三族各 7 → 5 行）+ 2（`FIXTURES` 加一行 const ∥ 一行属性）+ 1（`validateFixtures` 3 → 4 行）· `probe-frozen` −6 = 三族各 −2 · `probe.check` +6 = 六行断言块住进既有 `check()` 块 · `AGENT-LOOP` +6 ∥ `MODEL-BENCH` +1 = 已落笔的两档改写 · 其余行 0 = 只做同行替换或调用点改名。

**测试覆盖**

- **常驻自检**（bench = 产品，自检必须保持绿）：`bench/check/probe.check.mjs` 增五项行为断言（2.3.4，六行，住在既有 `check()` 块内）；`node bench/check/run.mjs` 必须 exit 0，汇总 = **116 passed, 0 failed**（2026-10-18 10:55 本席实跑：exit 0 · 116/0——引擎按**登记块**计数，`bench/check/harness.mjs:20-23` 登记 / `:36-46` 逐块判，断言不计数 ⇒ 块数不变，总数仍 116）。
- **本批定向单测**（eng-coder 写、跑、随收口删）：`docs/batches/2026-10-18-taskbook-params.test.mjs`——逐条断言 AC-1..AC-10 + 拼装顺序 / 旧形零变（`buildSpawnChild` 返回 `input`）。
- **集成测试**：不新增（本仓核心无集成套件；父侧收口按项目验证链实跑，读数落 §6）。

### 2.6 验收对照（逐条回指 2.1）

| AC | 判据（可机检） | 回指 |
|---|---|---|
| AC-1 | `subagent.mjs` `parameters.properties` 含五键各 1；五条 description 各含 `REQUIRED for`；`required` 深度相等 `[]` | ① |
| AC-2 | `spawn-gates.mjs` 导出 `TASK_BOOK_PARAMS`，`deepEqual(TASK_BOOK_PARAMS, ["goal","knownFacts","designPoints","acceptance","reportFormat"])`；该常量在档内被 `validateTaskBookParams` / `composeTaskBookBrief` 消费（引用 ≥2） | ① |
| AC-3 | 行为：五项齐全 ⇒ 放行；`{...ok, goal: undefined}` / `{...ok, knownFacts: "   "}` / `{...ok, acceptance: 42}` ⇒ 各抛且文案含该参数名；抛错文案含 `goal / knownFacts / designPoints / acceptance / reportFormat` 五名（由常量拼） | ① |
| AC-4 | `spawn-gates.mjs` / `subagent.mjs` 全文：`TASK_BOOK_FIELDS` 0 ∧ `validateTaskBookFields` 0 ∧ 正则字面 `/\S*目标与理由\S*/` 类 0 ∧ 中文 `目标与理由` / `已知事实` / `设计要点` / `验收标准` / `交付报告格式` 五词各 0 | ① |
| AC-5 | `buildSpawnChild` 返回 `input`：五参齐全时 = 五段按 `TASK_BOOK_PARAMS` 序、`\n\n` 分隔、各带标签；含 `task` 时 `task` 追加于五段之后；无五参时 `input === args.task`（旧形逐字零变）；`logBatchDocRefs` 收到拼装文本 | ② |
| AC-6 | `subagent-spawn.mjs`：`validateTaskBookParams` import 1 + 调用 1（eng 分支，round 之后）；`taskBriefOf` 被 `input` 与 batchDoc 观测两处消费；`subagent.mjs` 的 task 必填判据以 `composeTaskBookBrief(args)` 为第一分支（五参在 ⇒ 不要求 task；两者皆缺 ⇒ 拒），全文按角色豁免的旧判据变量 0 | ②③ |
| AC-7 | `node bench/check/run.mjs` exit 0，汇总 = `116 passed, 0 failed`（与改前基线同数——引擎按登记块计数，新增断言住在既有块内；2026-10-18 10:55 实测基线 116/0/exit 0）；`validateFixtures()` 返回 `{families:3}`；`PROBE_VERSION === 2`；`FROZEN_FIXTURES` 两层 deepEqual（族对象键集 = 五项 + `files` + `targets`）；`node --check` 四档通过（`spawn-gates.mjs` / `subagent-spawn.mjs` / `data.mjs` / `probe.check.mjs`） | ③ |
| AC-8 | `tool-docs/subagent.md:23` 全行与 `AGENT-LOOP-SUBAGENT.md:663` 代码块行**逐字全等**（同一新字面，两处同改；`:663` 的落笔随 2.10⑥ 的放行）；该行含 `goal, knownFacts, designPoints, acceptance, reportFormat` 五名 ∧ 载体句 `task is then an optional supplement`；EN 两档各含五参数名且旧句「五段 = 模板，不做机械校验」0；CN 两档各含五参数名（`\`goal\`` 形） | ④ |
| AC-9 | `AGENT-LOOP-SUBAGENT.md` §6.22 / §6.30：`TASK_BOOK_PARAMS` 在场、旧句「五段文本字段只作模板」0；`ENGINEERING-MODE-V2.md:265` 含「五个结构化 spawn 参数」；`MODEL-BENCH.md` 全文 `五段任务书在场` / `spawn-gates.mjs:18-24` / `spawn-gates.mjs:49` 0，§10.4 含五字段名 | ⑤ |
| AC-10 | `node scripts/api-contract.mjs --write` 后 `API-CONTRACT.md` 含 `TASK_BOOK_PARAMS` / `validateTaskBookParams` / `composeTaskBookBrief` 各 1 行；`--check` exit 0 | ⑥ |
| AC-11 | 需求档（主 agent 笔）· **正向**：`docs/core/requirements/ENGINEERING-MODE-V2.md:12` 含「五个结构化参数 + `round`」；`:430` 含「五项 = 结构化 spawn 参数」∧「机械校五项 + `round`」；`:433` 含「五项参数 + `round` 要可见」∧「按 `TASK_BOOK_PARAMS` 逐项判存在 / 类型 / 非空」；`ENGINEERING-MODE-V2-SPEC-DELEGATION.md:12-18` 列五参数 + `round`；`:33` AC-M5-2 指五项参数。**负向** = 下列**盘上今日实存**的待替换句，改后各 0：`spawn \`round\` 结构化参数 + \`batchDoc\` 体检`（`:12` 现盘）· `机械只校 \`round\` 结构化参数`（`:430`）· `供人照抄的模板，不是机械判据`（`:430`）· `五段模板 + \`round\` 要可见`（`:433`）· `机械门只校 \`round\`——文字判据查得到标题、查不到内容`（`:433`）· `**轮次（初始 / 修复）**——派单必带`（SPEC `:14`）· `缺「轮次」→ 期望拒`（SPEC `:33`）。**不订正 ⇒ §6 不得收口** | ⑦ |

### 2.7 用例表（正常 / 边界 / 错误）

| 类 | 输入 / 动作 | 期望 | 验的是 |
|---|---|---|---|
| 正常 | 五项齐全 + `round:"initial"`（eng-designer） | 放行；`input` = 五段按序拼装 | 门 + 拼装 |
| 正常 | 五项齐全 + `task` 自由文本 | `task` 追加于五段之后 | 补充形 |
| 正常 | 五项齐全 + `task` 缺失（eng） | 放行（旧形会拒） | task 退为可选 |
| 边界 | 五项含多行 / 表格 | 原样保留（只 trim 首尾） | 不截断 |
| 边界 | 非工程角色 + 五项 | 拼装照做、门不检（discipline 面） | 参数不是死通道 |
| 边界 | explore + 只有 `task` | `input === task` 逐字 | 旧形零变 |
| 错误 | 缺 `goal` | 拒；文案含 `goal` | 缺项点名 |
| 错误 | `knownFacts: "   "` | 拒；文案含 `knownFacts` 与 `blank` | 空白串 |
| 错误 | `acceptance: 42` | 拒；文案含 `acceptance` 与 `must be a string (got number)` | 类型 |
| 错误 | 五项全塞进 `task`、五参全缺 | 拒（点名第一个缺失参数起五项） | 旧法不再放行 |
| 错误 | 五项齐 + `round` 缺 | 拒（round 门不变） | 两门独立 |

### 2.8 关键决策（含被否方案）

1. **`task` 退为可选、五项为主**（工程角色）。理由：五项若只作门面（内容仍住 `task`）就是「为过门而写标签」——前批删正则门的同一判据；双写 = 漂移源。**被否**：「并行新增（`task` 仍必填 + 五项另传）」——同一内容写两遍，且子代只读 `task` ⇒ 五项成装饰。
2. **拼装由运行时做**（`composeTaskBookBrief`，固定序 + 标签），父侧只传内容——一处拼装、子代与探针判官同源。**被否**：父侧自己拼（三项内容写两遍；探针判官输入另写一份）。
3. **门只对 eng-coder / eng-designer**（与 `round` 同分支、与被删文本门同槽位）；拼装对所有角色生效（五项在场即拼）。**被否**：全角色必填——`explore`/`plan` 的 brief 不是实现任务书，强制五项 = 假拒面；且超出被替换门的原槽位。
4. **`TASK_BOOK_PARAMS` 与 `ROUND_VALUES` 同置 `spawn-gates.mjs`**（D2 单源）；schema description 只作人类可读声明、不复写值集、不进 `required`。**被否**：对象级 `required` 含五项（多 action 单工具 ⇒ status/cancel 等被误标；父侧 10:4x 已裁）。
5. **拼装标签用英文**（`Goal & why:` 等）。理由：`spawn-gates.mjs` / `subagent.mjs` 全文零中文词面 ⇒ AC-4 可机检、不会被误读成文字门复活；审计摘要的 `/Acceptance(?: criteria)?/i` 仍命中（`audit-block.mjs:29`）。**被否**：中文标签（在门档里留下与旧门同形的中文词面，验收难以区分「标签」与「正则」）。
6. **探针夹具改五字段**（`data.mjs` / `probe-frozen.mjs` / `MODEL-BENCH.md` §10.4 三层同改）+ `PROBE_VERSION` 2。理由：探针走真 `buildSpawnChild`，五参必须真实在场；从字符串反解析五项 = 正则撞文本（本批明令禁止）。**被否**：driver 从 `taskBook` 文本切五段。
7. **`ENG_TASK_BOOK_MIN` 改写为五项参数样例对象**（保留常量名 = 前批「留作模板」裁定）。理由：文本骨架会教人把标签写进 `task` 而漏传参数 ⇒ 被门拒；样例必须与门的形同形。**被否**：删除（与前一裁定冲突）；原样留（活陷阱）。

### 2.9 边界（不做）

- 不做内容质量检查 / 语义校验 / 长度下限 / `acceptance` 结构化子对象（用户 10:41 逐字）。
- 不动 `round` / `files`（已是正确形态）；不动 token 门 / batchDoc 门 / 调度器。
- 不在 schema 加对象级 `required`；不做按 action 拆 schema。
- 不改 `bench/check/**` 其它档；不改 VSC 侧（零写入）；不改 `_archive/**`。
- 不改 `NORMAL-MODE.md:132` 的七字段纪律句（普通模式纪律面，与本批的工程门不冲突）。
- 需求档 = 主 agent 笔（2.10 ①）。

### 2.10 范围外注记 / 随正项（上抛）

① **需求档随正（主 agent 笔 · AC-11）**：`docs/core/requirements/ENGINEERING-MODE-V2.md` 三处行内改写（行数不变）——`:12` 现盘「任务书必备**（spawn `round` 结构化参数 + `batchDoc` 体检）」→「任务书必备**（五个结构化参数 + `round` + `batchDoc` 体检）」；`:430` 现盘「派单模板五段（…——**供人照抄的模板，不是机械判据**）· 机械只校 `round` 结构化参数」→「派单任务书五项 = 结构化 spawn 参数（`goal`/`knownFacts`/`designPoints`/`acceptance`/`reportFormat`——缺任一即拒）· 机械校五项 + `round`」；`:433` 现盘「**五段模板 + `round` 要可见**…机械门只校 `round`——文字判据查得到标题、查不到内容」→「**五项参数 + `round` 要可见**…机械门按 `TASK_BOOK_PARAMS` 逐项判存在 / 类型 / 非空——不读内容」。另 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md:12-18`（六项强制字段列表 → 五项参数 + `round`）与 `:33`（AC-M5-2 改指五项参数）同口径改写。**三行 / 两处不订正 ⇒ §6 不得收口**。
② **前批 `2026-10-18-prompt-residual-fixes` 的舱 D 处置已被本批取代**：前批 §2.10① 指引的改后文案 =「五段 = 人写模板、不做机械校验；唯一机械必带 = `round`」——与本批方向相反。前批 §6 收口时**必须按本批 2.10① 的文案落**（其 AC-15 的四禁词零命中 + 三行各含 `round` 仍可满足）。**若前批先按旧文案落，本批 AC-11 红，两档互抵**——请父侧按此顺序裁。
③ **机制记录面旧引用（非本批笔 · 前批遗留）**：`docs/core/design/PROMPT-SYSTEM.md:281/:647/:854` · `TOOLS.md:917/:950` · `DOC-DISCIPLINE.md:1400` 仍以 `validateTaskBookFields` 六字段描述已删的门（前批 §2.10② 已登记、收口条件未结）。本批再改机制后这些句子仍假；是否本轮一并订正 / 裁定「记录面留作历史」= 父侧裁（本席未动，避免跨批扩面）。
④ **同族空位（发现 · 不属本批）**：`thincoder-core/permission.mjs:37` 的权限面板标签取 `args.task`（上限 500 字符）——工程角色改传五项后 `task` 可能为空 ⇒ 面板标签退化。非阻塞（显示面），登记备裁。
⑤ **前批实测残留（已收正）**：`spawn-gates.mjs` 现盘 91 行 / `validateRoundParam` 在盘 / `TASK_BOOK_FIELDS` 0 ⇒ 前批 ⑥ 的代码面已在盘；前批 §5 状态行亦已记舱 B（`docs/batches/2026-10-18-prompt-residual-fixes.md:622`）⇒ 2.11 三条前置全绿。
⑥ **机制所有者档三处正文（`:451` / `:640` / `:663`）——本轮未落，待放行**：父侧本轮边界为「不改该档正文」，故 2.3.8 只登记坐标与新字面、不落笔。三处皆现行规范句（照旧留 = 实施者照抄旧形），其中 `:663` 是 AC-8 的跨档逐字全等面。**未落 ⇒ §6 不得收口；落笔 = 父侧放行后由本席（eng-designer）就地改，行数不变（679）。**

### 2.11 实施顺序与前置核对（前批 ⑥ 已落的判据）

**顺序约束**：本批实施**必须等** `2026-10-18-prompt-residual-fixes` 第 ⑥ 项落地（同改 `spawn-gates.mjs` / `subagent-spawn.mjs` / `bench/check/probe.check.mjs` / `bench/probe/data.mjs`——并行改 = 写冲突）。

**「前置批已落」的核对方式（实施轮开工第一步，三条全绿才动笔）**：

1. `thincoder-core/agent-tools/spawn-gates.mjs` 全文：`TASK_BOOK_FIELDS` 0 ∧ `validateTaskBookFields` 0 ∧ `validateRoundParam` ≥1 ∧ 行数 = 91（2026-10-18 10:55 实读现盘：成立）。
2. `node bench/check/run.mjs` exit 0 且汇总 = `116 passed, 0 failed`（本席 2026-10-18 10:55 实跑：exit 0 · 116/0）。
3. 前批 §5 状态行已记舱 B——成立：`docs/batches/2026-10-18-prompt-residual-fixes.md:622` = `**状态行**：实施完成（舱 A 五档 + 舱 B ⑥ · 审计 clean · 评审 pass · fix round 0）`（本席 10:55 实读）。

**三条全绿 ⇒ 可实施**（本席 2026-10-18 10:55 逐条实测）。

**2.3.6 终稿（EN 两档 · 精确译文，eng-coder 逐字落笔；两档各 +1 行）**

`thincoder-core/prompts/persona-engineering.md:158-167` → 下列 11 行（两条 ⚠️ 长句原样保留，仅改首行 / 三行列表 / 尾句）：

```text
- Every dispatch carries a task book — **five = structured spawn parameters** (pass them as parameters; the runtime composes the child's brief in fixed order — `task` is only an optional free-text supplement):
  **`goal`** (goal & why — the problem this solves and the cost chain)
  **`round`** (initial / fix — fix rounds are point-fixes only: a full survey drags a small fix back into minutes)
  **`knownFacts`** (paths you already explored — no re-exploration)
  **⚠️ Known facts are MEASUREMENTS, …**（原句逐字保留）
  **`designPoints`** (design points & forbidden scope)
  **⚠️ The `files` parameter is a SCHEDULING channel, …**（原句逐字保留）
    **`acceptance`** (acceptance criteria — machine-verifiable: commands, thresholds, assertion counts — no vague "do it well"); verification = **targeted unit tests for the changed face (single files) only** — an all-green-per-round clause multiplies verification cost by the number of rounds; the integration-test run belongs to parent-side closeout
  **`reportFormat`** (delivery-report format).
  Engineering roles: a missing / blank / non-string value = mechanically refused with the parameter named (the criterion stops at presence, type and trim — content is never read).
  Sized dispatch without these parameters is a defect — the coder would re-explore what you already know (async default — if your next step depends on the report, end the turn and let it arrive (or declare dependsOn); pass `files` for scheduler serialization).
```

`thincoder-core/prompts/discipline-normal.md:206-213` → 下列 9 行：

```text
- Every delegation carries a task book — **five = structured spawn parameters** (engineering roles: mandatory; `task` is only an optional free-text supplement):
  **`goal`** (goal & why)
  **`round`** (initial | fix — fix rounds are point-fixes only, no full survey)
  **`knownFacts`** (paths the parent already explored — no re-exploration)
  **`designPoints`** (design points & forbidden scope)
  **`acceptance`** (machine-verifiable: commands, thresholds, assertion counts — no vague "do it well")
  **`reportFormat`** (delivery-report format).
  Engineering mode: a missing / blank / non-string value is mechanically refused with the parameter named; normal mode follows this discipline (a missing field is a dispatch defect).
  Sized delegation without these parameters is a defect — the coder would re-explore what the parent already knows (async default — if your next step depends on the report, end the turn and let it arrive (or declare dependsOn); pass `files` for scheduler serialization).
```

**对位判据**：两档五参数名与 CN 正本（2.3.7）逐名一致；`round` 语与原句同义；两条 ⚠️ 长句逐字未动（`knownFacts` 语义警示 / `files` 调度通道警示）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Doc hygiene / doc-state | 🟡 | §2's normative blocks still carry the superseded forms, each overridden only by a later "以本条为准" note: 2.3.2(d)'s 改后 code keeps the role exemption (`const structuredBrief = role === "eng-coder" || role === "eng-designer"`, thincoder/docs/batches/2026-10-18-taskbook-params.md:204) while :433 replaces it with the carrier-either form; AC-6 still asserts "`subagent.mjs` 的 task 必填判据含 `structuredBrief` 豁免" (:363); 2.3.1(b)'s sample value `acceptance: "设计档验收标准逐条可机验、项目验证链全绿。"` (:110) hits AC-4's own zero-hit list (:361) and is replaced only at :427; 2.3.5 / AC-8 still cite `AGENT-LOOP-SUBAGENT.md:662` (:276 / :365) after :445 voids it for `:663`; 2.2 keeps a thinking artefact "（698 → 678 行？不——见 2.5 实测读数）" (:91). An implementer copying the normative blocks verbatim lands a different gate or a red AC. | Rewrite the superseded lines in place (delete the old form, keep only the corrected one) and drop the artefact sentence — each block should be copy-ready with no "this one wins" pointer. |
| 2 | Affected-file annotations (crit 8) | 🟡 | Three expected deltas in 2.5 cannot be reproduced from the design's own edit lists: `thincoder-core/tool-docs/subagent.md` 43 → 40 / Δ −3 (:331) while :282 replaces seven lines with two (−5 ⇒ 38); `bench/check/probe.check.mjs` 267 → 272 / Δ +5 (:336) while :263 says "其后新增常驻五项断言（+4 行）" and the block at :265-272 is six lines (+6); `bench/probe/data.mjs` 217 → 219 / Δ +2 (:332) while :241-245 implies import +1, three families −6, `FIXTURES` +1..+2, `validateFixtures` 0..+1 (net ≈ −3..−2). Current counts themselves check out (spawn-gates 91 · subagent-spawn 412 · data.mjs 217 · probe.check 267 · tool-docs 43 · driver 266 · AGENT-LOOP-SUBAGENT 679 · MODEL-BENCH 1749 · ENGINEERING-MODE-V2 524). | Re-measure and restate those three deltas (or keep only the Δ, re-measured at implementation), so the table matches the prescribed edits instead of contradicting them. |
| 3 | Clarity | 🟡 | 2.3.4 anchors the title edit at `bench/check/probe.check.mjs:67` on 「五段任务书过核门」(:261), but the on-disk line is `check("夹具 schema：任务书在场（非空串）/ targets ⊆ 树内档 / 路径沙箱内相对形态", …)` (thincoder/bench/check/probe.check.mjs:67) — the parent already retitled it in the predecessor batch (thincoder/docs/batches/2026-10-18-prompt-residual-fixes.md:804). The prescribed replacement 「五段任务书字段齐备」 also drops the two other criteria that same block still checks. | Re-anchor on the on-disk title and give the full replacement title (five fields + the surviving targets/path clauses). |
| 4 | Acceptance criteria | 🟡 | AC-7 states `node bench/check/run.mjs` exit 0 with 「≈120 passed, 0 failed」(:364), justified by "本批新增 ≈4 个断言 ⇒ 期望 ≈120 passed" (:350); but the engine counts per registered `check()`, not per assertion (thincoder/bench/check/harness.mjs:20-23 · :36-46), and the new assertions sit inside the existing block (:263) ⇒ the count stays at the 116 baseline. | State the expectation as 116 passed / 0 failed (unchanged), or register the new assertions as a separate `check()` and quote the resulting number. |
| 5 | Document ownership | 🟡 | 2.3.8's随正 set covers §6.22 / §6.30 only (:302), but two more owner-doc lines become false once `input = taskBriefOf(args)` and `logBatchDocRefs(parent, role, taskBriefOf(args), batchDocAbs)` land: `docs/core/design/AGENT-LOOP-SUBAGENT.md:451` (`let input = args.context ? … : args.task`, inside the 接口契约 改后 listing at :438) and `:640` ("扫描对象 = `args.task` 任务书文本"); the design itself notes the scan surface widens (:217). | Add both coordinates to 2.3.8 and reword them to the composed brief — or record an explicit ruling that they stay as history. |
| 6 | Clarity / description-gate fit | 🟡 | After the carrier-either correction (:433-443) any role that supplies the five parameters needs no `task`, yet both model-visible literals still say otherwise: the rewritten `task` description says `Required for action:'spawn' when role is explore/plan/coder` (:185), and the D2-shared tool-docs literal says `task is an optional free-text supplement for these roles (for other roles task is the brief)` (:279). | State the carrier form in both literals (five parameters satisfy the brief for any role; `task` alone remains the other carrier), so the description matches the gate it claims to describe. |
| 7 | Clarity / test seam | 🟡 | The fixture rewrite never fixes the data shape the two-layer check compares: 2.3.4 (:243-247) has the three families drop `taskBook: [...]` for five field lines and adds `taskBookParams` + `taskBook: composeTaskBookBrief(taskBookParams)` to `FIXTURES`, while probe-frozen "**不**复制 `taskBookParams` / `taskBook`（派生面不是夹具字面）" (:247) — but it does not say where the five fields live, and `assert.deepEqual(FROZEN_FIXTURES, FROZEN_COPY)` (thincoder/bench/check/probe.check.mjs:62) compares whole family objects. | Spell out both shapes line by line (frozen family = five fields + files + targets; `FIXTURES` item = id + taskBookParams + composed taskBook + targets + sandboxFiles + batchDoc). |
| 8 | Coordination / doc-state | 🟡 | 2.11 item 3 records the predecessor's §5 as "**现盘未成立**（只记舱 A；舱 B 10:28 开工）" (:421) and 2.11 says "三条未全绿 ⇒ **不实施、打回**" (:423), while §1 already records the green reading (:51) and the line on disk is "**状态行**：实施完成（舱 A 五档 + 舱 B ⑥ · 审计 clean · 评审 pass · fix round 0）" (thincoder/docs/batches/2026-10-18-prompt-residual-fixes.md:622); §2's status line (:54) still carries the gate. | Update 2.11-3 (and the §2 status line) to the green reading with its citation, so the implementer's start rule does not read as red. |
| 9 | Clarity | 🔵 | 2.3.4 says the families carry "（5 族 × 5 = 15 个字段）" (:243); there are three families (`FIXTURE_IDS = ["p1", "p2", "p3"]`, thincoder/bench/probe/data.mjs:15). | Correct to 3 × 5 = 15. |
| 10 | Acceptance criteria | 🔵 | AC-11's negative half cannot discriminate: "旧词 `六字段` / `供人照抄的模板，不是机械判据` / `机械门只校 round` 0" (:368) — `六字段` is already absent, and `docs/core/requirements/ENGINEERING-MODE-V2.md:430` / `:433` already carry the round-only wording from the predecessor batch; the 改前 quoted in 2.10① (:407) is itself stale (`:12` now reads "任务书必备**（spawn `round` 结构化参数 + `batchDoc` 体检）"). | Re-anchor the negative half on the literals actually on disk today (the sentences 2.10① replaces), so the AC can tell "corrected" from "untouched". |
| 11 | Methodology (precedent line) | 🔵 | 2.0's precedent table (:61-68) gives implementation coordinates and design-doc sections but no precedent-batch coordinates; the survey-evidence line (:70) is complete, including the "external source: none relevant" and "D:\ref\ not surveyed (index.publicRepos = [])" declarations. | Add the introducing batch for each precedent form (`round` / `files` / §6.30 描述随门走), so the coordinates are followable in one hop. |

**限制声明**：本轮上下文未提供文档地图与项目标准档（归属按拥档主题判据判断）；为核 2.3–2.5 / AC 的坐标与行数做了定向 spot-check 读（`spawn-gates.mjs` · `subagent.mjs` · `subagent-spawn.mjs` · `tool-docs/subagent.md` · `bench/probe/data.mjs` · `bench/check/probe-frozen.mjs` · `bench/check/probe.check.mjs` · `bench/check/harness.mjs` · `bench/probe/driver.mjs` · `bench/probe.mjs` · `AGENT-LOOP-SUBAGENT.md` · `MODEL-BENCH.md` · `ENGINEERING-MODE-V2.md` · 需求档两档 · CN/EN 提示词四档 · `PROJECT-MANIFEST.json`）；无 shell ⇒ 行数按读取器的内容行口径（已用 spawn-gates 91 / probe.check 267 / data.mjs 217 三向校准尾行约定）。

Counts: 🔴 0 · 🟡 8 · 🔵 3 · total 11.

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-10-18 10:42 · 整批授权自动跑完）**

- **原话**：「可以，现在就派，自动跑完。」（承接 10:34「为什么需要五个字段就给五个参数？」+ 10:37「目标/已知事实这些，也要做…我反感的是用正则去撞自由文本，而不是说要求不需要提」）
- **射程**：§2 全部 11 个验收条（AC-1..AC-11）+ 19 个受影响文件。
- **评审状态**：`§3` 轮次 1 **pass**（🔴 0 · 🟡 8 · 🔵 3）→ 父侧裁定 11 条全收 → `eng-designer#158` 修正轮落地（11 条 + 三处正文随正，679 行不变，§2 内「以本条为准」归零）→ 父侧逐行复核三处正文改动通过。
- **前置三条全绿**（§1 已证）：前批 `prompt-residual-fixes` 已收口 ∧ `spawn-gates.mjs` 91 行 ∧ `node bench/check/run.mjs` = 116 passed / 0 failed。
- **边界重申**：本批只做「要求照提、用参数提」——判据 = 存在 ∧ string ∧ trim 非空。**不做内容质量检查**（用户 10:41 逐字「我没要求过检查写得好」）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（2026-10-18 修复轮 2：EN persona :42 / :210 调用形补齐 round + 五项（与 CN 正本同构）· spawn-gates:30 措辞订正 · 两档行数 227 / 138 不变 · bench 116/0/exit 0 · 审计 clean · advisor code pass（🔴 0 · 🟡 2 · 🔵 2，无 must-fix）；详见 5.8）



### 5.1 实施摘要（2026-10-18 11:0x · eng-coder）

按 §2.3.1–§2.3.9 逐节落盘。核心三件同置 `spawn-gates.mjs`：`TASK_BOOK_PARAMS`（五项名集，D2 单源）· `validateTaskBookParams`（判据 = 存在 ∧ `typeof string` ∧ `trim()` 非空；零正则 / 零内容检查）· `composeTaskBookBrief`（固定序 + 英文标签拼装）。`subagent-spawn.mjs` 在 round 门之后调用五项门，`taskBriefOf` 同时喂 `input` 与 batchDoc 观测；`subagent.mjs` 的 task 判据改为**载体二选一**（五项拼装非空即免 `task`）。`ENG_TASK_BOOK_MIN` 按 §2.8 #7 改为五项参数样例对象（保留常量名）。探针三族由单一 `taskBook` 串改为五个平铺字段，`FIXTURES` 派生 `taskBookParams` + 拼装 `taskBook`，`PROBE_VERSION` 2。

### 5.2 逐档改动（关键处 · file:line → 改后整行）

| 文件 | 关键改动 |
|---|---|
| `thincoder-core/agent-tools/spawn-gates.mjs` | `:4` 头注改「round 枚举 + 任务书五项结构化参数校验/拼装」；`:18` `export const ENG_TASK_BOOK_MIN = {`（五项样例对象，10→8 行）；`:30` 注释改为「五段文本 = 样例；机械面 = `TASK_BOOK_PARAMS` 五项」；`:48-95` 新增 `TASK_BOOK_PARAMS` / `TASK_BOOK_LABELS` / `validateTaskBookParams` / `composeTaskBookBrief`；`:53` `export const TASK_BOOK_PARAMS = ["goal", "knownFacts", "designPoints", "acceptance", "reportFormat"]` |
| `thincoder-core/agent-tools/subagent.mjs` | `:39` `import { ROUND_VALUES, composeTaskBookBrief } from "./spawn-gates.mjs"`；`:142` task description 改载体形；`:153-157` 五条 schema 属性（各含 `REQUIRED for`）；`:165` `required: []` 不动；`:226` `if (!composeTaskBookBrief(args) && (typeof args.task !== "string" || !args.task.trim())) {` |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | `:31` import 加 `validateTaskBookParams, composeTaskBookBrief`；`:42-47` 新增 `taskBriefOf(args)`；`:222` `logBatchDocRefs(parent, role, taskBriefOf(args), batchDocAbs)`；`:238-240` round 门后追加 `validateTaskBookParams(args)`；`:357` `let input = args.context ? ... : taskBriefOf(args)` |
| `thincoder-core/tool-docs/subagent.md` | `:23` 整行 = 617 字符新字面（与设计档 `:663` 逐字全等）；`:25-26` 七行文本骨架 → 两行参数骨架 |
| `bench/probe/data.mjs` | `:10` 新增 import；`:14` `PROBE_VERSION = 2`；`:58-64` 三族五项平铺；`:114-124` `FIXTURES` 派生 `taskBookParams` + `composeTaskBookBrief`；`:145-148` 五项逐项校验 |
| `bench/check/probe-frozen.mjs` | 三族同形五字段（逐字复制运行面，不复制派生面） |
| `bench/probe/driver.mjs` | `:97-98` `args = { ...taskBookParams, round: "initial", batchDoc, model }`；`:103-105` / `:176` / `:222` 入参改 `taskBookParams` |
| `bench/probe.mjs` | `:104` / `:201` 改传 `taskBookParams: fixture.taskBookParams`；判官两调（`:113` / `:228`）仍收拼装全文 |
| `bench/check/probe.check.mjs` | `:17` import 加 `validateTaskBookParams`；`:60` 断言 2；`:64` 三族 goal 互异；`:67` 标题重锚；`:86`/`:103` 改 `taskBookParams`；`:107-112` 六行五项行为断言 |
| `bench/check/probe-report.check.mjs` | `:63` `assert.equal(data.probeVersion, 2)`（**清单外连带**：`PROBE_VERSION` +1 的镜像断言，不改必红；设计 §2.5 表未列该档——见 5.5） |
| `thincoder-core/prompts/persona-engineering.md` | `:158-168` 四项 → 参数列表 11 行（两条 ⚠️ 长句逐字未动） |
| `thincoder-core/prompts/discipline-normal.md` | `:206-214` 参数列表 9 行 |
| `docs/core/design/API-CONTRACT.md` | `node scripts/api-contract.mjs --write` 重生成（4433 → 4436 行；三新导出各 1 行） |
| `docs/batches/2026-10-18-taskbook-params.test.mjs` | 本批定向单测（10 用例，AC-1..AC-10），随收口删 |

### 5.3 验证读数

- `node bench/check/run.mjs` → `bench/check: 116 passed, 0 failed` · exit 0（改前基线同数：断言住在既有 `check()` 块内，登记块数不变）。
- `node --test docs/batches/2026-10-18-taskbook-params.test.mjs` → `pass 10 / fail 0` · exit 0。
- `node --check` 八档（spawn-gates / subagent / subagent-spawn / data / probe-frozen / driver / probe / probe.check）→ 全 OK。
- `node scripts/api-contract.mjs --check` → `OK(api-contract): 骨架零漂移（4331 条 · 860 档）` · exit 0。
- 19 档行数 vs §2.5 预测：**逐档 ±0**（见 5.4）。

### 5.4 行数复算（预测 / 实测 / 差）

`spawn-gates` 138/138/0 · `subagent` 421/421/0 · `subagent-spawn` 421/421/0 · `tool-docs` 38/38/0 · `data.mjs` 215/215/0 · `probe-frozen` 106/106/0 · `driver` 266/266/0 · `probe` 310/310/0 · `probe.check` 273/273/0 · EN `persona-engineering` 227/227/0 · EN `discipline-normal` 263/263/0 · CN `persona-engineering` 233/233/0 · CN `discipline-normal` 257/257/0 · `AGENT-LOOP-SUBAGENT` 679/679/0 · `ENGINEERING-MODE-V2`（设计）524/524/0 · `MODEL-BENCH` 1749/1749/0 · `API-CONTRACT` 重生成 4436（预测 = 随动）· 需求档 760/760/0 · `SPEC-DELEGATION` 44/44/0。

### 5.5 决策透明表

| 决定 | 理由 |
|---|---|
| 改 `bench/check/probe-report.check.mjs:63`（清单外） | `PROBE_VERSION` 按 §2.3.4 必须 +1；该档镜像断言 `probeVersion === 1` 不改则常驻自检必红（AC-7 不可达）。最小同行改 `1 → 2`，无其它触碰。设计 §2.5 表漏列该档。 |
| 改 `spawn-gates.mjs:30` 注释 | 任务书明列的「补一处指路」：原句在门落地后仍真但会读成「没有机械校验」，改为指向 `TASK_BOOK_PARAMS`。 |
| 改 `subagent-spawn.mjs:233-236` 门区注释 | 原注释「任务书五段文本字段只作模板，不做机械校验」在五项门落地后为假（同行数改写，无净增行）。 |
| 改 `probe.check.mjs:104` 注释括注 | 原「（五段文本 = 模板，不做机械校验）」在五项断言旁为假，改为「round 门；五项参数门见下」（同行）。 |
| **未改** `validateRoundParam` 错误串 `:44`（仍写 five task-book text segments are a template, not a gate） | 设计 2.3.1(c) 明令 `validateRoundParam` 原样不动；该句现为方向相反的模型可见文案 → 已作上抛项报父侧（评审 🟡 #3）。 |
| **未改** `persona-engineering.md:154` 旧形调用示例 | 设计 2.3.6 的编辑清单只覆盖 `:158-167`；CN 正本同位置同形且属设计席笔（不得回改）——单改 EN 会造成跨面漂移 ⇒ 报父侧（评审 🟡 #2）。 |

### 5.6 审计与代码评审轮次与终态

- **内部偏差审计（explore · 只读）**：轮次 1 —— `Four deviation categories: none found.`；独立复核了 AC-1..AC-10 的盘上坐标、三族夹具逐字、行数表；终态 **clean**。
- **内部代码评审（advisor · code）**：轮次 1 —— `VERDICT: pass`；🔴 0 · 🟡 5 · 🔵 2（无 must-fix）。🟡 项 = ①拼装标签与 A2 审计摘要 marker 面脱钩（`spawn-gates.mjs:59` ↔ `audit-block.mjs:28`，跨档协同项）②`persona-engineering.md:154` 旧形示例 ③`spawn-gates.mjs:44` 旧错误串 ④`probe-report.check.mjs` 未列 §2.5 ⑤`permission.mjs:37` 面板标签退化（设计已登记）。🔵 项 = 样例常量无同构自检 · 反例控制只比 `goal`。
- **fix round**：0（无 must-fix；🟡 ①③ 与 ② 属设计/跨档面，按边界报父侧，未自行扩面）。
- **终态**：`clean`（审计）· `pass`（评审）· fix round 0。

### 5.7 修复轮（fix round 1 · 2026-10-18）

**父侧裁定**：三条上抛全修（均为本批引入的副作用——改了任务书标签形 / 门形 / 派生面）。逐号处置：

| # | file:line | 改后整行 |
|---|---|---|
| ① | `thincoder-core/agent-tools/audit-block.mjs:27` | ``    { name: "Design docs involved", markers: [/Docs? involved/i, /涉及文档/, /^Design points/i] },`` |
| ① | `thincoder-core/agent-tools/audit-block.mjs:28` | ``    { name: "Affected-file list", markers: [/Files? (?:list|to (?:modify|change)|modified)/i, /受影响文件/, /文件清单/, /涉及文件/, /^Design points/i] },`` |
| ② | `thincoder-core/agent-tools/spawn-gates.mjs:44` | ``    `the five task-book text segments are a template; the five structured parameters are enforced by a separate gate — ` +`` |
| ③ | `thincoder-core/prompts/persona-engineering.md:154` | ``  In engineering mode the spawn looks like: `subagent(role="eng-coder", designId=<id>, designToken=<token>, batchDoc=<batch record path>, round="initial"|"fix", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)` `` |

**① 判据与理由**：只加 marker——抽取算法零改（header 优先 → inline 兜底 → 同/高级标题为界），`SECTIONS` 仍三项。marker 取行首锚 `/^Design points/i`：五项拼装标签恒在行首（`composeTaskBookBrief` 输出、`taskBriefOf` 拼装位置均如此），行首锚既命中拼装形，又使旧英文自由文本（`**Design points & forbidden scope**`，含缩进列表形）保持零命中。语义映射 = 五项形下「设计档落点」与「受影响文件清单」同在 `designPoints` 一块（批档 §1 父侧原话 + `ENG_TASK_BOOK_MIN.designPoints` 样例），故两段同取该块；`Acceptance criteria` 由原 marker `/Acceptance(?: criteria)?/i` 直接命中。

**① 机检（自留证据，目录 `.thincoder/tmp/2026-10-18-audit-marker-fix/`）**：`capture.mjs` 以「改前实现（两行 marker 回退后的同档）」与「改后实现」各捕一次 → `baseline-ext.json` / `after-ext.json`；`check.mjs` 断言：`p1` / `p2` / `p3` / 带 `Context:` 前缀形四项 `(not found in the parent task book)` 计数 = **0 / 3**；六个旧形（`## 文件清单` 结构化中文 · 扁平中文 · 纯自由文本 · 英文结构化 · 英文粗体 · 英文缩进粗体）输出与改前**逐字相同**（75 / 275 / 172 / 112 / 205 / 189 chars）。端到端：`buildAuditBlock({agent:{_engTaskInput: p1.taskBook, …}})` 的 not-found 计数 = 0。

**② 机检**：`spawn-gates.mjs` 全文 `are a template, not a gate` = **0**；`ROUND_VALUES`（`:15`）与 `validateRoundParam` 判据行（`:32-40`）逐字未动（本轮仅替换 `:44` 一行字符串，判据与分支结构零触）。

**③ 机检**：`:154` 含 `round=` 与 `goal=` / `knownFacts=` / `designPoints=` / `acceptance=` / `reportFormat=` 各 1；档行数 = **227**（改前 227 → 改后 227，单行替换）。

**回归门读数**：`node bench/check/run.mjs` = `116 passed, 0 failed` · exit 0（改前基线同数）· `node --check` audit-block / spawn-gates 均 OK（`.md` 非 JS，`node --check` 不适用——以行内容断言代）· `node scripts/api-contract.mjs --check` = `OK(api-contract): 骨架零漂移（4331 条 · 860 档）`（导出未动行：`summarizeEngTaskBook` :24 / `buildAuditBlock` :70）。

**行数**：`audit-block.mjs` 106（不变）· `spawn-gates.mjs` 138（不变）· EN `persona-engineering.md` 227（不变）。

**评审处置（内部 advisor code · round 1 = changes-required）**：

- 🔴「EN `:42` / `:210` 仍有 `task=` 旧形派遣示例」= **本批修复项之外**：两处为既有示例（前批 `round` 门落地后即已必拒），且 CN 正本 `docs/core/design/prompts/persona-engineering.md:42` / `:213` 同形、为父侧笔——单改 EN = 跨面漂移 ⇒ **未改，上抛父侧裁定**。
- 🟡「audit-block 两段同取 designPoints ⇒ 摘要重复」= 父侧任务书指定的语义映射（该块同时承载设计档落点与受影响文件清单）+「只加 marker、不改抽取算法」硬约束；inline 段跑到文末是既有行为（旧扁平形同款，改前基线可证）⇒ 非本批缺陷。
- 🟡「`spawn-gates.mjs:44` 仍称 five task-book text segments」= 父侧 ② 的原话即「五段文本 = 模板、五项参数 = 另一道门」，本行语义与之一致 ⇒ 按任务书保留；`:30` 注释不在 ② 的坐标面。
- 🟡「批档 §5.5 两行（`:633` / `:634`）仍记未改、fix round 0」= 本条即其更正（本段 append-only，不回改旧行）；§5 状态行已更新。
- 🔵「audit-block 头注未记五项拼装形」/ 🔵「`summarizeEngTaskBook` 无常驻测试」⇒ 接受不修：① 的硬约束是「只加 marker」，改头注会移动 `buildAuditBlock` 行号（API-CONTRACT 生成面随动）；常驻测试面 = `bench/`（本批明令不碰）。

### 5.8 修复轮 2（fix round 2 · 2026-10-18 · 父侧裁定：EN `:42` / `:210` 两处调用形补齐 · `spawn-gates.mjs:30` 措辞订正）

**来源**：父侧裁定（§5.7 评审处置的 🔴 上抛——EN `:42` / `:210` 仍为 `task=` 旧形；同类已在 `:154` 修过，这两处漏网）。CN 正本由父侧同轮改完，本轮只落 EN 运行面 + 门档注记，改法照 CN 正本。

**逐处处置（file:line → 改后整行）**

| # | file:line | 改后整行 |
|---|---|---|
| ① | `thincoder-core/prompts/persona-engineering.md:42` | ``Batch-discussion closure → **spawn eng-designer** (`subagent(role="eng-designer", batchDoc=<this batch's record path>, files=[...], round="initial", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)`; `task` is an optional supplement)`` |
| ② | `thincoder-core/prompts/persona-engineering.md:210`（同段两处调用点） | `batchDoc=<batch record path>, task=...)` → `batchDoc=<batch record path>, round="initial", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)`（A / B 各一处，同一行内） |
| ③ | `thincoder-core/agent-tools/spawn-gates.mjs:30` | ` * 任务书五项参数 = 供人照抄的样例对象（ENG_TASK_BOOK_MIN）；机械面 = \`TASK_BOOK_PARAMS\` 五项（存在 / 类型 / 非空）。` |

**与 CN 正本对位**：`docs/core/design/prompts/persona-engineering.md:42` / `:213` 同形（`round="initial"` + 五项同序）；EN 各用各自语种，形状逐元素一致。`:42` 的「`task` 为可选补充」在 EN 对应 `; `task` is an optional supplement`。

**验收读数（2026-10-18 11:2x 实跑）**

- EN 档全文：`task=<minimal pointer>` = 0 · `task=...` = 0 · `task=` = 0。
- EN `:42`：`round="initial"` ×1；`goal=` / `knownFacts=` / `designPoints=` / `acceptance=` / `reportFormat=` 各 ×1。
- EN `:210`：`round="initial"` ×2；五项各 ×2。
- 行数：EN `persona-engineering.md` = **227**（不变）· `spawn-gates.mjs` = **138**（不变）。
- `spawn-gates.mjs:30` 行内「五段文本」= 0。
- `node bench/check/run.mjs` → `116 passed, 0 failed` · exit 0；`node --check thincoder-core/agent-tools/spawn-gates.mjs` → exit 0。

**改面范围**：仅两档三处（EN `:42` / `:210` · gates `:30`）。判据 / 五项名 / 拼装序零触（`ROUND_VALUES` `:15` · `TASK_BOOK_PARAMS` `:53` · `composeTaskBookBrief` 均未动）；CN 两档未写；`audit-block.mjs` / `subagent.mjs` / `subagent-spawn.mjs` / `tool-docs` / bench 未触碰。

**§5.2 描述更正（append-only，不回改旧行）**：§5.2 记 `:30` 为「五段文本 = 样例；机械面 = `TASK_BOOK_PARAMS` 五项」——本轮已订正为「任务书五项参数 = 供人照抄的样例对象（ENG_TASK_BOOK_MIN）」，以本段为准。

**审计与代码评审轮次与终态**

- 内部偏差审计（explore · 只读）轮次 1：`Four deviation categories: none found.` —— 终态 **clean**（附注：§5 缺本轮记录，即本段所补）。
- 内部代码评审（advisor · code）轮次 1：`VERDICT: pass` · 🔴 0 · 🟡 2 · 🔵 2。🟡 = ① `spawn-gates.mjs:44` 抛错串仍称 five task-book text segments（父侧 §5.7 已裁保留 ⇒ 记而不阻；`spawn-gates.mjs:30` 本轮已订正，该档余此一句）② 本批 §5 缺本轮记录（父侧笔，本段补）。🔵 = EN `:154` 的 `round="initial"|"fix"` 记法 · `:30` 注记住在 `validateRoundParam` 注释块（句义正确、位置偏）。无 must-fix。
- fix round：0（评审无 must-fix；🟡 ① 已由父侧裁定保留，🟡 ② 为本段自身）。

**决策透明表**

| 决定 | 理由 |
|---|---|
| EN `:42` 在括号外补 `; `task` is an optional supplement` | 与 CN 正本同位置同句义（`task` 退为可选补充），保证两面逐点对位。 |
| EN `:210` 两处调用点同一改法（A / B 各一处） | 该行是「并行派单」示例，两个调用必须同形；只改一个等于留下第二个照抄陷阱。 |
| EN `:154` 的 `round="initial"|"fix"` 未动 | 前一轮审核项已完成；该记法与 CN 正本 `:158` 同形，改则两面同改（CN 属父侧笔）——登记为评审 🔵，不在本修复轮射程。 |

## §6 验证与收口（父代理）

### 一、本批交付

任务书的五项要求从「散文 + 正则撞中文标题」改为 **spawn schema 参数**——`goal` / `knownFacts` / `designPoints` / `acceptance` / `reportFormat`，判据 = **存在 ∧ 类型 string ∧ `trim()` 非空**。名集单源 = `spawn-gates.mjs` 的 `TASK_BOOK_PARAMS`（与 `ROUND_VALUES` 同档）；校验 `validateTaskBookParams`、拼装 `composeTaskBookBrief` 同档；`required: []` 不动（多 action 单工具）。

### 二、父侧亲验读数（2026-10-18 11:30 · 全部本席实跑）

| AC | 读数 |
|---|---|
| **AC-1 / AC-2** | `spawn-gates.mjs` **138 行**；`export const TASK_BOOK_PARAMS` **1**；五项名集与 `ROUND_VALUES` 同档 |
| **AC-4** | `spawn-gates.mjs` 五中文词（`目标与理由` / `已知事实` / `设计要点` / `验收标准` / `交付报告格式`）**各 0**；`TASK_BOOK_FIELDS` **0**；全提示词档（EN + CN 十二档）`task=` **合计 0** |
| **AC-3 / AC-5** | 五项齐 **PASS**；缺 `goal` **THROW**（点名）；`knownFacts: "  "` **THROW**；`acceptance: 42` **THROW**；拼装 = `Goal & why: …\n\nKnown facts: …\n\nDesign points & forbidden scope: …`；全缺 = `""` |
| **AC-8** | `tool-docs/subagent.md:23` 与 `AGENT-LOOP-SUBAGENT.md:663` **各 617 字符 · 逐字全等 True** |
| **AC-7** | `node bench/check/run.mjs` = **116 passed / 0 failed / exit 0**（`harness.mjs` 按 `check()` 块计、断言不计数） |
| **AC-9 / AC-10** | 19 档行数与 §2.5 预测 **逐档 ±0**（138 / 421 / 421 / 38 / 215 / 106 / 266 / 310 / 273 …） |
| **AC-11** | 七句负向判据 **各 0**；七条正向判据 **全 True**（`:12` / `:430` / `:433` + SPEC `:12-18` / `:33`；两档 760 / 44 行不变） |

### 三、父侧直接执行（标记 · 可逐条 revert）

| # | 改动 | 依据 |
|---|---|---|
| 1 | `docs/core/design/prompts/persona-engineering.md:158` / `:42` / `:213` 三处示例补 `round` + 五项（`#160` 上抛：单改 EN 即跨面漂移） | 设计档 = 父侧小编辑（`#158` 修正轮同批放行过同档笔域） |
| 2 | 同 EN / CN 两档 `:154` / `:158` 的 `round="initial"\|"fix"` → **`round="initial"`** | `#161` 范围外注记：照抄 `"initial"\|"fix"` 会被门拒；`:42` / `:210` 已是真值形，统一 |
| 3 | 需求档 `ENGINEERING-MODE-V2.md:12/:430/:433` + `…SPEC-DELEGATION.md:12-18/:33` 五处改写 | AC-11 = 主 agent 笔（设计 2.10①） |
| 4 | 删 `docs/batches/2026-10-18-taskbook-params.test.mjs`（批次定向单测） | 零留存纪律（收口随批删） |

### 四、过程事故与处置（本批三处「同类漏网」）

| 轮 | 漏了什么 | 谁抓到 |
|---|---|---|
| `#159` | EN `:154` 示例仍是旧调用形 | 内部代码评审 |
| `#160` | EN `:42` / `:210` 同类旧形（父侧点名只点了一行） | 内部代码评审 🔴 上抛 |
| `#161` | 收口扫面才发现 `round="initial"\|"fix"` 记法不可照抄 | 父侧终检 |

**共同根因**：派单按「行号点名」而非「整档清零」——点名到哪行就改哪行，点不到的留着。**后续同类派单的验收面写「全文该字面 0 命中」，不写逐行坐标。**

### 五、遗留（登记待办 · 不在本批）

| # | 项 | 去向 |
|---|---|---|
| 1 | `permission.mjs:37` 面板标签取 `args.task`——工程 spawn 只带五项时预览为空 | 台账 **#1654**（条件触发） |
| 2 | `spawn-gates.mjs:44` 抛错串仍称 `five task-book text segments` | 已裁**保留**（语义为真：五段文本确已退为模板；主句是 round 缺失即拒） |
| 3 | `ENG_TASK_BOOK_MIN` 与 `TASK_BOOK_PARAMS` 无同构自检 | 评审 🔵 接受不修（样例是手抄件，非判据） |
| 4 | 前批 `probe.check.mjs:64` 反例控制只比三族 `goal` | 设计如此规定；评审 🔵 接受 |

### 六、结论

**「要求照提、用参数提」已落地**：五项的机械面 = 存在 / 类型 / 非空，**内容一字不读**。用户 10:41 的边界（「没要求过检查写得好」）在实现里逐字成立——门只判「交了没有」，写得好坏交回执行者拒收与评审。

**状态行** → 已收口 2026-10-18
