# 工具参数排雷——缺了就拒 · 设计（批 #2150）

> 需求 = 批档 `docs/batches/2026-11-07-tool-param-zero-defaults.md` §1（用户 2026-11-07 18:59「工具参数应该先清默认值」· 19:05「不用等，这个已经确定了，就是缺了就拒！」）。判据总纲 = `docs/core/design/PROMPT-SYSTEM.md` §6.77（`#2149` 已立）。
> 改动面 = §4 清单；处数单源 = §2 各表行数（一处一行，不另设概数）。
>
> **处数口径**（逐处以本档各表行为准）：第四层 = §2.1 五行（`thincoder-core/agent-tools/batch-ledger-bind.mjs` 的 bind ∥ attach 各占一行）；第一层 = §2.2 五行、六个落点（第 5 行是 `manifest` 两个工具面各一处 schema）；第三层 = §2.3 三行（第 2 行随 §2.2 第 1 行消形，不单列改法）。

## 1. 模块目标与判据

工具面参数**缺了就显式拒**——报文点名缺哪个参数，不替调用方选（不拿锚、不拿 depth、不拿池子替调用方做决定）。

**判据总纲（引用，不重述）**：`docs/core/design/PROMPT-SYSTEM.md` §6.77「一个参数默认 = 替调用方做了一次没有依据的决定」。C2 行给出落地三件：删「Defaults to…」句、schema 加 `required: true`、缺参 ⇒ 工具实现第一行拒（带参数名）——本批三件同落（§2.2 ∥ §2.5 ∥ AC-8）。

**收窄的分界（为什么不是全部参数都进改动面）**：判据落在**有没有造值**上，不落在「写没写 optional」上。

- **造值 = 病**：缺参时代码**自己造一个值**——`args.seconds ?? 180` ∥ `clampRecent` 的 `return 5` ∥ `args.async ?? (depth === 0)` ∥ `args.verification ?? {}` ∥ 缺 `target` 时拿会话锚顶。调用方漏了，程序照走，错在三层之外才被看见。
- **不造值 = 不是病**：缺参时语义自明、值不来自代码——`consult.models` 不给 = 全池，池子来自配置。这类删默认值只留一个空壳 `required`，不产生拒。

**最近先例**：`existing: thincoder-core/agent-tools/doc-check.mjs`（`report` 面 `docs` 必填）· 逐字「is required in report mode — pass the explicit list of documents to judge」· consumers = 模型读到的 `doc_check` 拒文。

- **对齐**：本批 5 条新拒文同形（工具名 + 参数名 + `is required` + 怎么传），零新报文形（§2.4）。
- **一处偏离**：`timer.seconds` 不做 schema `required`——`thincoder-core/tool-docs/timer.md` 逐字「`seconds`, `at`, `every` and `daily` are mutually exclusive — passing more than one is a validation error」，四式互斥「至少一式」表达不了 `required`；偏离理由 = 表达能力，不是口味（KD-5）。

**调研取证**：

- 仓外公开源：`PROJECT-MANIFEST.json` 的 `index.publicRepos` 读回 `[]` ⇒ 无仓外公开源可查；本批外部断言 = 零（不联网）。
- 库内判据面已查：`docs/core/design/PROMPT-SYSTEM.md` §6.77（判据总纲与 C2 落地三件）∥ `docs/core/design/DOC-CHECK.md`（§2 入参形表 ∥ §5 KD-10 ∥ §6 AC-8 ∥ AC-11 ∥ §7 用例 7-11 ∥ 7-14 ∥ 7-15）∥ `docs/core/design/MANIFEST.md`（KD-M1-39 工作区列候选先例）∥ `docs/core/requirements/DOC-CHECK.md`（F17 声明根表述）∥ `thincoder-core/tool-docs/`（工具面模型可见描述面）。相关项已逐条落入 §2 判语与 §2.5 清单。

## 2. 逐处机制

三条入参契约（全批共用，逐处判语落在下面三张表）：

- **定位参数必填**：`target` 缺 ∥ 空串 ∥ `null` ⇒ 拒，报文点名 `target`。
- **锚退到基根位**：会话锚不再作 `target` 的缺省；它只作**相对形 `target` 的基根**。锚取不到（`ctx?.agent?.cwd` ∥ `ctx?.cwd` 皆空）且 `target` 是相对形 ⇒ 拒、点名锚——**不许落 `process.cwd()`**。
  依据 `thincoder-core/path-resolve.mjs`「const start = resolve(anchor ?? ".")」：锚缺位即隐藏兜底，那是本批要治的病换个位置复发（KD-9）。
- **造值参数必填**：缺参时代码不再造值；缺 ⇒ 拒点名。不造值的真可选只删描述句里的 default。

### 2.1 第四层——锚/`cwd` 兜底

| # | 文件 | 改前现状（逐字） | 判语 |
|---|---|---|---|
| 1 | `thincoder-core/agent-tools/doc-check.mjs` | `const anchor = ctx?.agent?.cwd ?? ctx?.cwd`；头注「`target` 缺省时锚即声明根，照跑。」 | **锚行保留**（相对形 `docs` / `target` 的基根，见 `resolvePathTarget(anchor, …)` 与 `resolve(anchor, givenTarget ?? "")`）；**改的是缺省支**：`target` 必填，缺 ⇒ 拒点名。头注「缺省时锚即声明根」半句删。（已落盘） |
| 2 | `thincoder-core/agent-tools/manifest.mjs` | `const base = ctx?.agent?.cwd ?? ctx?.cwd` ∥ `return args?.target ? resolve(base, String(args.target)) : resolve(base)`；`resolveTarget` 注「缺省 = 会话锚」 | **判缺落地**：`args?.target` 不是非空字符串 ⇒ 抛，报文点名 `target`；`base` 保留作相对形基根，注删「缺省 = 会话锚」半句。工作区绝对值 `target` ⇒ 照既有 `projectView` 五态（`workspace` 态列候选，零新解析器） |
| 3 | `thincoder-core/agent-tools/eng.mjs` | `enter` 的锚入参 | **不改**：工作区锚下 `resolveEngineeringManifest` 返回 `code:"workspace"`，`enter` 判过该态后照开模式、零附着——下游已显式报错并放行，没有替调用方拿主意（KD-2） |
| 4 | `thincoder-core/agent-tools/batch-ledger-bind.mjs`（`createBatchRecord`） | `const anchor = cwd ?? ctx?.agent?.cwd` | **不改**：`cwd` 是调用方恒传的签名参数（`thincoder-core/agent-tools/batch.mjs` 逐字「const cwd = agent.cwd」），缺省退锚是形状防御，非造值（KD-3） |
| 5 | `thincoder-core/agent-tools/batch-ledger-bind.mjs`（`attachBatchRecord`） | 同第 4 行同形 | **不改**（同上） |

**为什么第 4 ∥ 5 行不改（连「拒文换单源」一起撤）**：候选可见性**已经**由既有的 `thincoder-core/agent-tools/batch-paths.mjs` 提供——逐字「belongs to no project」+ 下辖项目全列 + 「Pass an explicit path under a project」。

- `resolveBatchCreatePath` 的判据：目标不属候选项目 ⇒ 直接抛 `workspaceCreateError`（已带候选）；属候选 ⇒ 落项目基底内，`resolveLedgerRoot` 必得根。
- 无根支只在**普通无项目目录**可达；那时 `thincoder-core/ledger-db.mjs` 的 `noRootMessage` 尾段按逐字「const tail = picked.state === "ambiguous" ? … : ""」为空。
- ⇒ 本批在该档**零改**：换单源不产生任何可观察变化，是「为改而改」。

### 2.2 第一层——schema 明写默认

| # | 工具面 | 改前现状（逐字） | 判语 |
|---|---|---|---|
| 1 | `timer.seconds` | `thincoder-core/agent-tools/timer.mjs` schema「Thinking budget in seconds (default 180)」+ `Number(args.seconds ?? 180)` | **必填化**：删「(default 180)」句；`?? 180` 删；四式皆无 ⇒ 拒「`timer: seconds is required for a one-shot timer (or pass at / every / daily) — got none`」。schema `required` 保持 `[]`（KD-5）。`thincoder-core/tool-docs/timer.md` 零触（该档无 180 句） |
| 2 | `subagent.recent` | `thincoder-core/agent-tools/subagent.mjs` schema「action:'observe' only (optional, default 5): how many recent-turn summaries (1..20).」+ `thincoder-core/agent-tools/subagent-actions-query.mjs` 逐字「if (!Number.isFinite(v)) return 5」 | **必填化**（造值 = 病：`return 5` 与 `args.seconds ?? 180` 同形，只删描述句等于把 5 变成**不披露**的默认值）。`observe` 入口缺 `recent` ⇒ 拒点名；`clampRecent` 只钳 1..20、不再造值。schema 描述改「Required for action:'observe': how many recent-turn summaries (1..20)」 |
| 3 | `consult.models` | `thincoder-core/agent-tools/consult.mjs` schema「(default: all)」+ `selectConsultModels` 的 `selectors == null` ⇒ 全池 | **optional 不变**（不造值：全池来自配置，缺参语义自明）；只删「(default: all)」改「Optional subset to narrow the pool — omit to run the whole pool」 |
| 4 | `doc-check.target` | `thincoder-core/agent-tools/doc-check.mjs` schema「Defaults to the session anchor.」+ `thincoder-core/tool-docs/doc_check.md` 逐字「Arguments — `target` (optional): the **declared root** for this call, not one coordinate system for the whole list.」∥「It defaults to the session anchor.」 | **必填**：schema 描述删该句改「Required — pass the project root you mean (a relative `target` matching several existing directories is still ambiguous and refused)」；schema 加 `required: ["target"]`（AC-8）；tool-docs 两处删 optional ∥ default 改 Required。已落盘 |
| 5 | `manifest.target`（两处 schema） | `thincoder-core/agent-tools/manifest.mjs` 两个工具面各一句「Explicit target directory — defaults to the session anchor」，两处 `required: ["action"]`；`thincoder-core/tool-docs/manifest.md` 逐字「target — explicit target directory; defaults to the session anchor, relative paths resolve against it.」∥ `thincoder-core/tool-docs/manifest-read.md` 同形 | **必填**：两处描述改「Required — pass the project root or directory you mean (relative paths resolve against the session anchor; a workspace target is reported with its project list)」；两处 `required` 改 `["action", "target"]`；两个 tool-docs 档同改 |

### 2.3 第三层——真替值

`thincoder-core/agent-tools/subagent-actions-query.mjs` 的 `clampRecent` 造值与 §2.2 第 2 行同形，处置已并入该行（同一个 `recent` 参数的两半）。

| # | 工具面 | 改前现状（逐字） | 判语 |
|---|---|---|---|
| 1 | `subagent.async` | 「const wantAsync = args.async ?? ((ctx.depth ?? 0) === 0)」+ schema「default at depth 0 = true (async; the report arrives automatically); depth>0 always sync. async:false forces the blocking flight.」 | **必填**：缺 ⇒ 拒「`subagent: async is required — pass true for an async spawn or false for a blocking flight`」；schema 描述改「Required: `true` = async spawn (report via the auto channel); `false` = blocking; omitting it is refused. At depth>0 every spawn is synchronous — an explicit `async: true` there is refused.」**连带** `thincoder-core/agent-tools/advisor.mjs` 逐字「const isAsync = asyncRequested || (depth === 0 && args.async !== false)」同形随改（KD-7）。**仍生效的约束逐句保留**（depth>0 一律同步 ∥ 显式 `async:true` 在 depth>0 被拒），理由见 KD-12 |
| 2 | `timer.seconds ?? 180` | `Number(args.seconds ?? 180)` | 随 §2.2 第 1 行消形，不单列改法 |
| 3 | `verify.verification` | 逐字「const v = args.verification ?? {}」+ 缺 status 时出「VERIFY BLOCKED: no verification status was declared.」 | **有码面必填**：`codeFiles.length > 0` 且 `args.verification` 不在场 ⇒ **先置 `ctx.agent._verifyPassed = false`、再抛**「`verify: verification is required when code files changed — declare {status: 'passed'|'failed'|'skipped'}`」。**无码面（`codeFiles.length === 0`）不要求**，既有语义零变（KD-6） |

**`verify` 抛的两件后果（判语，不是留白）**：

- **报告体丢失**：抛不出 `lines`。缺参是入参面语义、不是报告面；报错文本身带声明形与值枚举（沿用既有逐字「use 'passed' | 'failed' | 'skipped'」），调用方拿得到可执行下一步。**接受**：与其余四条缺参拒同形，一致比多一段报文体重要。
- **`_verifyPassed` 必须落到 false**：不改状态就抛 ⇒ `thincoder-core/agent/completion.mjs` 逐字「agent._verifiedThisRun && agent._verifyPassed === false」读到的仍是上一轮的值；上一轮若为 `true`，本次交付门被悄悄放行。⇒ **抛之前一行赋值**（fail-closed：未声明不许留「已通过」）。
- `_verifiedThisRun` 本档不设（`grep` 于 `thincoder-core/agent-tools/verify.mjs` 零命中）——拒一次不伪造成一轮验证，模型收到报错后带参重调。

### 2.4 新落地的 existing-piece 三问

| # | 新落地 | 三问答案 |
|---|---|---|
| 1 | `doc_check` 缺 `target` 拒文 | `existing: thincoder-core/agent-tools/doc-check.mjs`（`report` 面 `docs` 必填拒）· name: 「is required in report mode — pass the explicit list of documents to judge」· consumers = 模型读到的 `doc_check` 拒文 ⇒ **复用同形**（工具名 + 参数名 + `is required` + 怎么传） |
| 2 | `manifest` 缺 `target` 拒文 | 同上一条同形（同族工具、同一参数名 `target`）⇒ 复用；工作区候选列法复用 `projectView` 的 `workspace` 态（`docs/core/design/MANIFEST.md` KD-M1-39） |
| 3 | `timer` 缺式拒文 | `existing: thincoder-core/agent-tools/doc-check.mjs`（`unknown mode` 拒：点名 + 给可取值）· consumers = 模型 ⇒ 复用「问题 — 用 A 或 B」同形 |
| 4 | `subagent` ∥ `advisor` 缺 `async` 拒文 | 同第 3 条同形（点名参数 + 给 true ∥ false 两个合法值）⇒ 复用 |
| 5 | `verify` 缺 `verification` 拒文 | `existing: thincoder-core/agent-tools/verify.mjs`（`unknown verification.status` 拒）· name: 「use 'passed' | 'failed' | 'skipped'.」· consumers = 模型 ⇒ 值枚举逐字复用，只补「不在场」那一支 |
| 6 | §2.5 各行的 schema ∥ 描述句改写（§2.2 与 §2.3 的 schema 行 + §2.5 表内各行） | `existing but unusable`: 原句在盘、可改——**不可用的只是其中的默认半句**（「Defaults to…」∥「(default: all)」∥「(optional, default 5)」∥「default at depth 0」，C2 逐字「删「Defaults to…」句，schema 加 `required: true`」）；句子其余描述（「the declared root for this call」一族）**保留沿用**，不是新造描述 |

### 2.5 D11 同轮改齐清单

模型可见面与注释面里写着旧契约的句子，实施同轮改齐——不改等于把旧默认教给下一位读者。

| # | 文件 | 改前（逐字） | 改成 |
|---|---|---|---|
| 1 | `thincoder-core/tool-docs/doc_check.md` | 「Arguments — `target` (optional): the **declared root** for this call」∥「It defaults to the session anchor.」 | 「Arguments — `target` (required): …」；缺省句改「Pass the project root you mean — omitting it is refused (the session anchor is the base for relative `docs` entries, not a default).」 |
| 2 | `thincoder-core/tool-docs/subagent.md` | 「(default 5, via recent)」∥「Default-async at depth 0」∥「Async spawn: top-level spawns are async by default — never pass async:false at depth 0」∥「Inside subagents (depth>0) spawns are always synchronous.」 | `recent` 句改「(required for observe, 1..20)」；`async` 段改「Async spawn: pass `async: true` — the spawn returns {id, status:"running"} immediately; the report arrives automatically (the explicit async:false is a mechanism parameter, not for model use)」；「Inside subagents (depth>0) spawns are always synchronous」**保留**——「not for model use」∥ depth>0 同步两句仍生效（KD-12） |
| 3 | `thincoder-core/agent-tools/advisor.mjs` | schema「Background review: default at depth 0 = true (ack now, report via digest); async:false forces the blocking review. depth>0 → always sync.」∥ 拒文尾「Call advisor again without async:true (or with async:false).」∥ 注释「an explicit async:true there is rejected, the default never flips」 | schema 改「Background review: Required — `true` = review in the background (ack now, report via digest); `false` = the blocking review; omitting it is refused. depth>0 → always sync: an explicit `async: true` there is refused.」；拒文尾句改「Call advisor again with async:false.」（`async` 必填后「without async:true」= 缺参 = 另一条拒路）；注释改「depth 0 可异步、depth>0 一律同步——显式 `async:true` 在那里被拒（判据不变）」 |
| 4 | `thincoder-core/agent-tools/doc-check.mjs` | 头注「`target` 缺省时锚即声明根，照跑。」∥ 守卫注释「`target` 缺省时锚即声明根——工作区锚照它判」∥ 守卫注释「「给了」判据 = **一个非空字符串**（KD-10）」 | 头注改「`target` 必填；锚只作相对形基根」；两处守卫注释改「`target` 必填——缺 ∥ 空串 ∥ `null` ⇒ 拒点名」；「键存在 ∥ 非空字符串」两分在缺 = 拒之后合一。（已落盘） |
| 5 | `thincoder-core/agent-tools/manifest.mjs` `resolveTarget` 注 | 「缺省 = 会话锚」 | 「`target` 必填；`base` 只作相对形基根」 |
| 6 | `thincoder-core/tools/shared.mjs`（`PROJECT_PARAM_DESC`） | 「`manifest` 在定位参数缺位时必带」 | 删 `manifest` 一项（`target` 必填后 `project` 不再替它补位）；其余三工具（`bash` ∥ `memory` ∥ `execute`）照旧 |
| 7 | `docs/core/design/MANIFEST.md` | 两处「defaults to the session anchor」 | 「Required — pass the project root or directory you mean」 |
| 8 | `docs/core/design/TOOLS.md` | `timer` 四式行的「默认 180s」句 | 删该半句（`seconds` 必填化后失效） |
| 9 | `docs/core/design/PROMPT-SYSTEM.md` §6.77 的活样本句 | 「Defaults to the session anchor」活样本 | **保留**：它是判据的取证句（C2 的反例输入列），不是工具面现行描述；该档本批不改 |
| 10 | `docs/core/design/DOC-CHECK.md` | 见 §4.3 | 见 §4.3（已随 `#2148` 收口落盘） |
| 11 | `docs/core/requirements/DOC-CHECK.md`（F17） | 「**「声明根」= 调用方显式给出的根**（工具面收到的 `target`，或父侧会话锚）」 | 「（工具面收到的 `target`——必填；会话锚只作相对形的基根，不作缺省声明根）」；引擎面 `root` 缺省拒的表述（AC-15 ③）不变 |
| 12 | `thincoder-core/tool-docs/advisor.md` | 「ASYNC (depth 0 only): the review runs in the BACKGROUND by default」∥「Inside a child (depth>0) reviews are always synchronous (`async:true` rejected).」 | 第一句改「ASYNC (depth 0 only): pass `async: true` to run the review in the background — omitting it is refused」；第二句**保留**（仍生效，KD-12）。`§3` 契约行把 `advisor` 的 `async` 改必填，这一档是同一条判据的模型可见面（批档评审 #17） |
| 13 | `thincoder-core/tool-docs/manifest.md` | 「target — explicit target directory; defaults to the session anchor, relative paths resolve against it.」∥「- init [target]」∥「Read only when `target` is absent — `target` wins when present.」 | `target` 段改「target — the project root or directory you mean; **required** — omitting it is refused. Relative paths resolve against the session anchor.」；三处动作行的可选方括号去掉（`read` ∥ `init` ∥ `write <key> <value>`，`target` 必填）；`project` 句删「Read only when `target` is absent — 」半句，改「`target` is required and wins; `project` never replaces it」 |
| 14 | `thincoder-core/tool-docs/manifest-read.md` | 「target — explicit target directory; defaults to the session anchor, relative paths resolve against it.」∥「read [target]」 | 同第 13 条的 `target` 段改法与动作行去方括号 |
| 15 | `thincoder-core/agent-tools/subagent.mjs`（注释与 schema） | schema「default at depth 0 = true (async; the report arrives automatically); depth>0 always sync. async:false forces the blocking flight.」∥ 注释「depth>0 spawns default to sync」∥ 注释「default to async for EVERY role」 | schema 改 §2.3 第 1 行的「改成」句；两处注释改「`recent` ∥ `async` 皆必填；depth>0 无异步——显式 `async:true` 下游拒（`async spawn only available at the top level`）」 |
| 16 | `thincoder-core/agent-tools/subagent-actions-query.mjs`（注释） | 「recent 参数钳制（默认 ~5 条摘要」 | 「recent 参数钳制（必填，1..20；不再造默认值）」 |

## 3. 接口契约

| 工具面 | 参数 | 旧契约 | 新契约 |
|---|---|---|---|
| `doc_check` | `target` | 缺省 = 会话锚 | **必填**——缺 ∥ 空串 ∥ `null` ⇒ 拒点名 `target`；绝对工作区路径 ⇒ 照判（各档按自身根）；相对形 ⇒ 基根 = 会话锚，锚缺位 ⇒ 拒点名锚 |
| `manifest`（read ∥ init ∥ write） | `target` | 缺省 = 会话锚 | **必填**——缺 ⇒ 拒点名；工作区值 ⇒ 列候选（既有 `projectView` 五态） |
| `eng`（enter） | 锚入参（无 schema 面） | 工作区态下游显式放行（零附着） | **不变** |
| `batch`（create ∥ attach） | 锚入参（无 schema 面） | 工作区锚 ⇒ 属候选照落 ∥ 不属候选报明带候选 | **不变** |
| `timer` | `seconds` | 缺省 180 | **四式至少一式**——`seconds` ∥ `at` ∥ `every` ∥ `daily` 皆无 ⇒ 拒点名 |
| `subagent`（observe） | `recent` | optional，缺省 5 | **必填**——缺 ⇒ 拒点名；1..20 钳制照旧 |
| `consult_start` | `models` | optional，缺省全池 | **不变**——描述删「(default: all)」 |
| `subagent`（spawn）∥ `advisor` | `async` | 缺省 = depth 0 | **必填**——缺 ⇒ 拒点名；depth>0 一律同步、显式 `async:true` 在 depth>0 ⇒ 拒（既有判据不变） |
| `verify` | `verification` | 缺省 `{}` ⇒ BLOCKED 报面 | **有码面必填**——缺 ⇒ 置 `_verifyPassed = false` 后拒点名（非 BLOCKED 报面） |

## 4. 受影响文件清单

**清单行数 = 下表行数**（不另设概数）。

**档层结论**：越线 0 档——本表 10 个源档全部落在工具内置软线 ∥ 硬线之内，无一档需拆分。量法 = 对下表 10 个源档跑一次 `doc_check({action:"report", lines:[…]})`（命令 = `doc_check` 的 `lines` 读数）；逐档行数留在批档与交付报告，不写进本档。

### 4.1 源档

| 文件 | 改动 |
|---|---|
| `thincoder-core/agent-tools/doc-check.mjs` | `target` 缺省拒判 + schema 描述 + `required: ["target"]` + 头注与守卫注释两处（§2.1 第 1 行 ∥ §2.2 第 4 行 ∥ §2.5 第 4 条）——（已落盘） |
| `thincoder-core/agent-tools/manifest.mjs` | `resolveTarget` 判缺抛 + 两处 schema 描述 + 两处 `required` + 注释（§2.1 第 2 行 ∥ §2.2 第 5 行 ∥ §2.5 第 5 条） |
| `thincoder-core/agent-tools/timer.mjs` | 删「(default 180)」+ 删 `?? 180` + 四式皆无拒文（§2.2 第 1 行） |
| `thincoder-core/agent-tools/subagent.mjs` | `async` 判缺抛 + `recent` 判缺抛 + schema 两处描述 + 两处注释（§2.2 第 2 行 ∥ §2.3 第 1 行 ∥ §2.5 第 15 条） |
| `thincoder-core/agent-tools/subagent-actions-query.mjs` | `recent` 判缺 + `clampRecent` 删 `return 5` + 注释（§2.2 第 2 行 ∥ §2.5 第 16 条） |
| `thincoder-core/agent-tools/advisor.mjs` | `async` 判缺抛 + schema 描述 + 拒文尾句 + 注释（§2.3 第 1 行 ∥ §2.5 第 3 条） |
| `thincoder-core/agent-tools/consult.mjs` | schema 删「(default: all)」（§2.2 第 3 行） |
| `thincoder-core/agent-tools/verify.mjs` | `verification` 判缺 + 置 `_verifyPassed = false` + schema 描述（§2.3 第 3 行） |
| `thincoder-core/tools/shared.mjs` | `PROJECT_PARAM_DESC` 删 `manifest` 一项（§2.5 第 6 条） |
| `thincoder-core/agent/family-tools.mjs` | 工程模式 spawn-only 的 `subagent` 变体自声明固定 `async`（同步）并撤 `delete props.async`——该通道 schema 本无 `async`，必填化后不声明即每次派单被拒；同步是该通道的契约，不是留默认值（§2.3 第 1 行） |

### 4.2 工具面描述档

| 文件 | 改动 |
|---|---|
| `thincoder-core/tool-docs/doc_check.md` | `target` 段改必填（§2.5 第 1 条） |
| `thincoder-core/tool-docs/manifest.md` | `target` 段 + 三处动作行 + `project` 句改必填形（§2.5 第 13 条） |
| `thincoder-core/tool-docs/manifest-read.md` | `target` 段 + 动作行改必填形（§2.5 第 14 条） |
| `thincoder-core/tool-docs/subagent.md` | `recent` ∥ `async` 句改（§2.5 第 2 条） |
| `thincoder-core/tool-docs/advisor.md` | `async` 段改必填、depth>0 同步句保留（§2.5 第 12 条） |

### 4.3 设计档 ∥ 需求档

`#2148` 已收口，其设计档已解冻 ⇒ 下列各条已落盘（①–⑬ 见 `docs/core/design/DOC-CHECK.md`；⑭ 见 §7）。

| 文件 | 逐项改写 |
|---|---|
| `docs/core/design/DOC-CHECK.md` | ①§2 入参形表的「不传 `target`」行（逐字「照判——`target` 缺省时锚即声明根」）改「拒——报文点名 `target`」；②同表 `target: null` 行（逐字「与「不传」**同结论**」）改「同缺省，拒」；③同表 `target: ""` 行（逐字「与「不传」**同结论**」）改「拒（「给了」= 非空字符串）」；④「不传 `target` ⇒ 照判」盘上已成立·上锁一句改「不传 `target` ⇒ 拒」；⑤§2.2 的「不传 `target` 时锚就是声明根、照判」半句删（留「不拿会话锚当整批的公共坐标系」）；⑥§2.4 两层的「`target` 缺省 ∥ 空串 ⇒ 按会话锚兜底」改「⇒ 工具面拒」；⑦§3 工具面行尾的「`target` 缺省时锚即声明根，照跑」改「`target` 必填，缺 ⇒ 拒」；⑧`AC-8`（等价性判法里的「与「不传 `target`（锚 = 工作区）」那一问对比」）改「与「`target` = 工作区绝对路径」那一问对比」，缺参面另判；**同行自己的坏法句一并改写**——逐字「坏法 = 恢复 `view.state === "workspace"` 提前返回」⇒「「不传」那一问变 `ERROR`、与各根那一问不等 ⇒ 红」改为指向「`target` = 工作区绝对路径」那一问（恢复提前返回 ⇒ 那一问变 `ERROR`、与各项目根那一问不等 ⇒ 红）——「不传」那一问已不存在，不得沿用；⑨`AC-11`（逐字「`target: null` ≡ 不传 `target`」）改「两问皆拒、报文点名 `target`」；**同行坏法句一并改写**——逐字「**坏法** = 守卫写回 `args?.target !== undefined`」后的「⇒ `null` 那一问进 `ambiguous` 拒支 ⇒ 红」改「⇒ `null` 那一问走歧义支 ∥ 兜底支，报文与 `{}` 那一问不同 ⇒ 红」——红点仍落在「两问同结论」这条不变式上；⑩`KD-10` 判据句保留（「给了」= 非空字符串），红点描述改「守卫写回『键存在』⇒ `null` 落兜底支 ⇒ 拒文缺失 ⇒ 红」；⑪用例 `7-11`（逐字「不传 `target`、清单跨两项目」）输入改「`target` = 工作区绝对路径」；⑫用例 `7-14`（逐字「`{target: null}` 与不传各跑一次」）判据改「两问皆拒、报文明同」；⑬用例 `7-15` **保留**（非空 `target` 解析为多项目工作区 ⇒ 拒并列候选，与本裁定同向）；⑭§7 的 RTM 记述（`test/rtm/paths.md` 的 `29-2` ∥ `test/rtm/guard.md` 的 `36-1` ∥ `36-2` ∥ `36-3`）随 §7 的改写同步 |
| `docs/core/requirements/DOC-CHECK.md` | F17 的「或父侧会话锚」半句改写（§2.5 第 11 条）——需求档改写属主 agent（D1），本批点名不改笔 |

## 5. 关键决策

| # | 决策 | 弃案 | 理由 |
|---|---|---|---|
| KD-1 | 「缺了定位参数」是拒点，「目标目录不是项目」不是 | 「无可用项目根就拒」一刀切 | 目标 = 工作区 ∥ 普通目录是合法声明根（各档按自身根判，`docs/core/design/DOC-CHECK.md` §2.4 已立）；把「不是项目」当拒点会拆掉 `#2148` 刚立的定根判据 |
| KD-2 | `eng` 不改 | 删锚兜底求「一致」 | 工作区态下游显式报错并放行（零附着），没有替调用方拿主意；删了会断既有判据、造新支 |
| KD-3 | `batch-ledger-bind` 零改（连拒文换单源也撤） | 拒文换 `noRootMessage` 单源 | 候选可见性已由 `workspaceCreateError` 提供（逐字「belongs to no project」+ 项目全列）；无根支只在普通无项目目录可达、尾段本就为空 ⇒ 无可观察变化 |
| KD-4 | 不造值的真可选只删描述句；**造值的必填化** | 「描述写 optional 的一律不动」 | 判据落在有没有造值：`consult.models` 缺省 = 全池（值来自配置）；`recent` 的 `return 5` 是代码造的 5，与 `args.seconds ?? 180` 同形 ⇒ 必填，否则删描述句只是把默认值藏起来 |
| KD-5 | `timer.seconds` 必填化归「四式至少一式」判，schema `required` 保持 `[]` | `required: ["seconds"]` | schema 表达不了「四式互斥、至少一式」（`thincoder-core/tool-docs/timer.md` 逐字「mutually exclusive」）；判在工具面，理由同上 |
| KD-6 | `verify.verification` 判缺抛，不落 BLOCKED 报面；抛前置 `_verifyPassed = false` | 落既有 BLOCKED ∥ 只抛不置状态 | BLOCKED = 「声明了 failed / 跳而无因」的门面语义，缺参是入参面语义；只抛不置状态会让上一轮的 `true` 留在 `thincoder-core/agent/completion.mjs` 读的那个标志上（§2.3 后果段） |
| KD-7 | `subagent.async` 必填化连带 `advisor` 同形随改 | 只改 `subagent` | 同一句话的另一半（D11），留一半就是下一批的活样本 |
| KD-8 | `thincoder-core/agent-tools/doc-check.mjs` 与 `docs/core/design/DOC-CHECK.md` 的改写等 `#2148` 收口、解冻后落 | 与 `#2148` 改动拼盘 | `#2148` 实施在飞、正按旧契约改同一批档；两把笔不同时改一份档，改写排后并落 `#2150` 的账 |
| KD-9 | 锚保留，退到基根位；锚缺位 ⇒ 拒点名，不落 `process.cwd()` | 删锚行「消兜底」 | `thincoder-core/path-resolve.mjs` 逐字「const start = resolve(anchor ?? ".")」——删锚行等于把一个显式兜底换成隐藏的 `process.cwd()` 兜底，正是本批要治的病 |
| KD-10 | 缺参拒文同族同形（工具名 + 参数名 + 怎么传），值枚举逐字沿用现状 | 每条自拟报文体 | 先例在盘（`doc_check` 的 `docs` 必填拒 ∥ `verify` 的 status 枚举）；同形让模型一次学会五处 |
| KD-11 | 三个 `target` 面同落 schema `required` | 只落代码拒判（描述句 + 抛） | 判据总纲 C2 三件要求（删默认句 + `required: true` + 实现第一行拒）；只做两件等于半条判据 |
| KD-12 | 必填化改写只删「默认」半句，仍生效的约束逐句保留 | 整句换成一句「omitting it is refused」 | `async` 的 depth>0 仍是一条活判据（`thincoder-core/agent-tools/subagent-run.mjs` 逐字「async spawn only available at the top level」∥ `thincoder-core/agent-tools/advisor.mjs` 逐字「async reviews are only available at depth 0」）——描述面删了它，模型读到的与代码做的相反，而代码照旧拒 |

## 6. 验收

| # | 判据 | 回指 |
|---|---|---|
| AC-1 | `manifest` 缺 `target` ⇒ 拒、报文含 `target`、零判定（普通项目锚 ∥ 工作区锚两种 ctx 各一次）；传项目根 ⇒ 五态照常；传工作区绝对路径 ⇒ `workspace` 态列候选 | §2.1 第 2 行 |
| AC-2 | `timer {list:true}` ∥ `{cancel:id}` 照常；`{}` ⇒ 拒、报文含 `seconds`；`{seconds:5}` ∥ `{at:"…"}` 照常 | §2.2 第 1 行 |
| AC-3 | `subagent {role:"explore", …}` 无 `async` ⇒ 拒含 `async`；`advisor` 同；`observe` 无 `recent` ⇒ 拒含 `recent`；`recent:3` 照常且摘要条数 ≤3；**depth>0 时显式 `async:true` 照旧被拒**（`subagent` 逐字「async spawn only available at the top level」∥ `advisor` 逐字「async reviews are only available at depth 0」——必填化不动这条判据） | §2.2 第 2 行 ∥ §2.3 第 1 行 ∥ KD-12 |
| AC-4 | `verify` 有码面无 `verification` ⇒ 拒含 `verification` ∧ 该次 `ctx.agent._verifyPassed === false`；`{verification:{status:"failed"}}` ⇒ 既有 BLOCKED 报面逐字不变；全档改 ⇒ 不要求 | §2.3 第 3 行 |
| AC-5 | `doc_check` 缺 `target` ⇒ 拒含 `target`（`report` ∥ `gate` 两面，零判定）；`target` = 工作区绝对路径 ⇒ 照判、各档按自身根；相对 `target` + ctx 无锚 ⇒ 拒、报文点名锚 | §2.1 第 1 行 ∥ KD-9 |
| AC-6 | D11 改齐（**逐档逐句核**，判法两半均由 §2.5 表逐行导出；射程 = §2.5 第 1–8 ∥ 12–16 条）：①**旧句清零**——各行「改前（逐字）」格里的每一句，在该行点名的文件里字面命中 0；②**新句在场**——同一行「改成」格里的必填 ∥ 拒句，在同一文件里字面命中 ≥1；③全局抽扫兜底：`grep` 于 `thincoder-core/`（全档，含 `thincoder-core/agent-tools/doc-check.mjs`）查「Defaults to the session anchor」∥「defaults to the session anchor」∥「(default: all)」∥「(optional, default 5)」∥「default at depth 0」∥「(default 180)」∥「缺省 = 会话锚」∥「`manifest` 在定位参数缺位时必带」⇒ 0 命中。射程外的两类：第 9 条是保留项（判据取证句）、第 11 条属主 agent（需求档，已在盘改齐） | §2.5 |
| AC-7 | 锚不作 `target` 缺省、仍是相对形的基根：符号坐标 `anchor`（`thincoder-core/agent-tools/doc-check.mjs`）∥ `resolveTarget` 的 `base`（`thincoder-core/agent-tools/manifest.mjs`）两处保留；判法 = AC-5 第三笔（无锚 + 相对 `target` ⇒ 拒，不落 `process.cwd()`） | §2.1 ∥ KD-9 |
| AC-8 | schema `required` 落地：`doc_check` 的 `parameters.required === ["target"]`（已落盘）；`manifest` 两个工具面的 `required` 均含 `target`（= `["action", "target"]`）；三处描述句无「Defaults to」∥「defaults to」 | §2.2 第 4 ∥ 5 行 ∥ KD-11 |
| AC-9 | 本批单元档全绿（AC-1..AC-8 各一法，坏法见 §6.2）；单元档与批档同名同目录、用毕即删 | §6.2 |

### 6.2 跑者与坏法

跑者 = 本批单元档（与批档同名、同目录——按单元测试档命名约定加后缀）：

```text
node --test docs/batches/2026-11-07-tool-param-zero-defaults.test.mjs
```

逐条坏法（改回去就红）：

| AC | 坏法（破在哪一行） |
|---|---|
| AC-1 | `resolveTarget` 恢复 `: resolve(base)` 缺省支 ⇒ ① 变「静默用锚」 |
| AC-2 | 恢复 `Number(args.seconds ?? 180)` ⇒ ② 变「180 兜底」 |
| AC-3 | 恢复 `args.async ?? ((ctx.depth ?? 0) === 0)` ⇒ ① 变「depth 决定」；恢复 `clampRecent` 的 `return 5` ⇒ ④ 的条数断言不触发拒；删 depth>0 的拒门（`thincoder-core/agent-tools/subagent-run.mjs` 逐字「if ((ctx.depth ?? 0) > 0)」那段）⇒ ⑤ 变「子代理里异步跑起来」 |
| AC-4 | 删「抛前置 `_verifyPassed = false`」⇒ 断言「该次为 false」红（上一轮 `true` 残留） |
| AC-5 | `target` 判据写回「键存在」（`args?.target !== undefined`）⇒ 空串 ∥ `null` 两问变照判 ⇒ 红 |
| AC-6 | §2.5 任一「现文」句原样留在盘上 ⇒ ① 命中非 0；任一行「改成」句未落 ⇒ ② 命中 0 |
| AC-7 | `target` 相对形改走 `resolve(anchor ?? ".")` ⇒ 无锚那笔变照判 ⇒ 红 |
| AC-8 | `required` 数组写回 `["action"]` ∥ 删 `["target"]` ⇒ 断言红 |

## 7. 集成测试设计（RTM 增量）

读 `test/RTM.md` 与故事 36 的分册 `test/rtm/guard.md`、故事 29 的 `test/rtm/paths.md` 后按增量作答。

**两行的改前现状（逐字）**：

- `test/rtm/guard.md` 的 `36-1`：入参逐字「一次交付调用 `doc_check({mode:"gate", docs:[两档]})`，不传 `target`」，判据逐字「首行逐字 `DOC-CHECK GATE: PASS`（「不传 `target`」那一问的形）」。
- `test/rtm/paths.md` 的 `29-2`：第三笔逐字「`doc_check({mode:"gate"})` 不带 `target`」；判据逐字「三面同一句报明形：拒 + 候选全列」∥「文档门首行 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）` + 候选行」。

**两行对同一个调用断言相反结论**（一行「不传 ⇒ `PASS`」，一行「不传 ⇒ `ERROR`」）。盘上真值 = 不传 ⇒ 取会话锚作声明根 ⇒ 照判（`thincoder-core/agent-tools/doc-check.mjs` 逐字「`target` 缺省时锚即声明根——工作区锚照它判」）⇒ `36-1` 是真账，`29-2` 是假账（今天就是红的）。本批的裁定让真值反转（`target` 必填 ⇒ 不传 ⇒ 拒），两行都要动：

- **破行 = 3**（`target` 变必填后，入参不带 `target` 的调用一律被拒 ⇒ 判据不再成立；三行同属 `test/integration/doc-check-per-file-root.test.mjs`，改写形一律 = 入参补 `target` = 该工作区的绝对路径——工作区作声明根是合法值，各档仍按自身根判）：
  1. `test/rtm/guard.md` 的 `36-1`——期望三句不变（首行 `PASS` + 两个项目根 + 一条 verdict）；异常列删「缺省 = 会话锚即声明根」半句、改「`target` 必填：不传 ⇒ 拒、点名 `target`；本行钉的是『目标 = 工作区、清单跨两项目 ⇒ 各档按自身根判』」。跑者 = `test/integration/doc-check-per-file-root.test.mjs`（入参补 `target`）。
  2. 同档 `36-2`——入参同样不带 `target`（逐字「一次交付调用 `doc_check({mode:"gate", docs:[两档]})`」）；判据（两条互不相同的行首标签 + 一条 verdict）不变。跑者 = `test/integration/doc-check-per-file-root.test.mjs`（入参补 `target`）。
  3. 同档 `36-3`——入参逐字「一次交付调用 `doc_check({mode:"gate", docs:[A 档, B 档]})`，不传 `target`」；判据（首行 `REFUSED（锚 1 条）` + 唯一命中属 A 档）不变。跑者 = `test/integration/doc-check-per-file-root.test.mjs`（入参补 `target`）。
- **假账改正 = 1**：`test/rtm/paths.md` 的 `29-2`——判据列的「文档门照判不拒」在盘上早已不成立（真值是拒），本批把该笔改成新契约下的报明形「拒 + 报文点名 `target`」（三面仍是「各一笔报明形」的故事）；「工作区作声明根照判」那一面移入 `36-1` 的改写形，不在两行重复断。跑者 = `test/integration/path-resolution.test.mjs`（入参补 `target`；判据按本条改写）。
- **跑者同改 = 6 档**：参数改必填即改契约，契约的调用点必须同改——入参补 `target`（各档夹具根）∥ `async:false`，判据除 `29-2` 那笔外一字未动：`test/integration/doc-check-per-file-root.test.mjs` ∥ `test/integration/doc-check-fence-verdict.test.mjs` ∥ `test/integration/doc-check-line-counts.test.mjs` ∥ `test/integration/doc-check-line-refs.test.mjs` ∥ `test/integration/batchdoc-reuse-guard.test.mjs` ∥ `test/integration/path-resolution.test.mjs`。
- **冗余行 = 0**。
- **缺的行 = 0**：缺参拒这一面已落在改写后的 `29-2` 第三笔上（同一业务面、同一报文）；另立一行会与它断言同一行为。若评审裁定该面须归故事 36 自己的账，`test/rtm/guard.md` 故事 36 下 `36-4` 号未占（`36-1` ∥ `36-2` ∥ `36-3` 在盘），行名与落行由实施轮的 RTM 改动落定。
- **单元档**：与批档同名同目录（命令见 §6.2），AC-1..AC-8 各一法，用毕即删。

## 8. 边界（本批不做）

- 全仓其余函数的签名默认参——判据已立（`docs/core/design/PROMPT-SYSTEM.md` §6.77），清存量另批。
- 只描述 optional、缺参**不造值**的参数（`advisor.type` ∥ `read-history.path` ∥ `subagent`/`verify` 一族）——不动。
- 判空形 `?? null`（只为报错信息显示）——不属造值。
- `thincoder-core/agent-tools/` 之外的目录另有的消费形（`thincoder-core/agent/` ∥ `thincoder-core/advisor/` 等）——不在盘点面；本批只碰 §2.5 第 6 条那一句（`PROJECT_PARAM_DESC` 的规则句被本批改假，D11 同轮改齐）。
- `thincoder-core/agent-tools/eng.mjs` ∥ `thincoder-core/agent-tools/batch-ledger-bind.mjs` ∥ `thincoder-core/agent-tools/batch-lifecycle.mjs` ∥ `thincoder-core/agent-tools/batch-reopen.mjs` 的锚消费形——判语已裁（KD-2 ∥ KD-3），零改。
- `test/**` 与提示词面——不属本批笔域；RTM 改写形在 §7 给，落行归实施轮。
