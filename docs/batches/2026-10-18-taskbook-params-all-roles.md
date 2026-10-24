# 2026-10-18 · 任务书五项参数扩所有角色
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 16:33「为什么只是 eng-coder 和 eng-designer 改了参数结构化，别的没改？」+ 16:35「A/B/C 哪一种能够提供最好的结果？」+ 16:36「B，好，开始吧」——B = 一套通吃（五项定义不动，门扩到所有 spawn 角色，description 按角色解释内容）。需求档 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md` §2 功能点 2（已随正 · 含 why）。
> 台账 = #1657（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**用户裁定（三轮 · 逐字）**

- **16:33**：「为什么只是 eng-coder 和 eng-designer 改了参数结构化，别的没改？」
- **16:35**：「A/B/C 哪一种能够提供最好的结果？」
- **16:36**：「B，好，开始吧。」

**三方案与父侧判断（用户取 B）**

| 方案 | 形态 | 父侧判断 |
|---|---|---|
| A | 按角色分五套参数集 | ❌ 同一概念五个名字（「范围」在 explore / 「约束」在 plan / 「设计要点」在 eng 是同一件事）+ 五套校验 = 五种漂移 |
| **B** | **一套通吃**（五项定义不动，门扩所有角色，description 按角色解释内容） | ✅ **用户取此**——单套校验、单点演进 |
| C | 核心三项 + 角色特有二项 | ❌ 切分线永远争不清（`acceptance` 对 explore 也有意义），每次都要重谈边界 |

**父侧实证（为什么 B 的五项对非工程角色也成立）**

拿 `explore` 试填：

```
goal          = 找到 spawn 门在校验什么
knownFacts    = 已查 agent-tools/ 与 doc-check/
designPoints  = 只读，不写任何文件；不碰 bench/      ← 「范围与禁止范围」
acceptance    = 给出 file:line + 调用链
reportFormat  = 清单 + 每项一句
```

**五项全部成立**——`designPoints` 对 `explore` = 「只读哪些 / 不碰什么」，是同一概念、不是不同概念。

**本批要做的**

| # | 改动 |
|---|---|
| 1 | `spawn-gates.mjs` 的门：射程从 eng-coder / eng-designer 扩到**所有 spawn 角色**（工程模式 = explore / eng-coder / eng-designer；普通模式 = explore / plan / coder） |
| 2 | `subagent.mjs` 五条 description：`REQUIRED for role='eng-coder'/'eng-designer' spawns` → **所有 spawn**；`designPoints` 补「非工程角色 = 范围与禁止范围」的解释 |
| 3 | 提示词面（EN + CN）：任务书说明从「eng 角色」改为「所有角色」，并按角色补一句内容差异 |
| 4 | 需求档已随正（`SPEC-DELEGATION.md` §2 功能点 2 + AC-M5-2） |

**边界**

- **五项定义零改**（名字 / 数量 / 顺序 / 判据三条）
- 不新增参数、不改 `round` / `files`
- `escalate` 不是 spawn，不受此门管
- 不改 `task` 的角色二分（普通角色仍可只传 `task`？——**设计要回答**：若五项对所有角色必带，`task` 对普通角色还是不是合法载体）

**父侧改判：B → C（2026-10-18 16:42 · 用户「那先按C跑试试」）**

**为什么改**：用户看完父侧举的例子（`explore` 的 `designPoints` = 「只读，不碰 bench/」）指出——**那就是硬套**。父侧承认：`designPoints` 这个名字不中性，B 的前提不成立。

**重新数过五项的名字**：

| 参数 | 名字中性 |
|---|---|
| `goal` / `knownFacts` / `acceptance` / `reportFormat` | ✅ 中性 |
| `designPoints` | ❌ **工程专用**（「设计要点」） |

⇒ 五项里**只有第五项需要按角色分名**。

**C 的形态**：

| 层 | 参数 |
|---|---|
| 四项核心（所有 spawn 角色） | `goal` / `knownFacts` / `acceptance` / `reportFormat` |
| 第五项（按角色） | 工程角色 = `designPoints`（设计要点与禁止范围）∥ explore / plan / coder = `scope`（范围与禁止范围：只读哪些 / 不碰什么） |

**为什么不取 A**：A = 每角色一套独立参数集 ⇒ explore / plan / coder 三套**完全同形**（只是三份拷贝）。

**C 的代价（如实登记）**：schema 里会同时有 `designPoints` 与 `scope` 两个近义参数 ⇒ agent 可能问「填哪个」。缓解 = 两条 description 互相指路（`designPoints`：工程角色用，其它角色请用 `scope`；`scope`：反之）。

**父侧已办**：需求档 `SPEC-DELEGATION.md` §2 功能点 2 已按 C 改写（四项核心 + 第五项按角色 + why）。

**待设计回答**：`TASK_BOOK_PARAMS` 这个「名集单源」常量在 C 下怎么组织（四条核心一个常量 + 两份角色名集？还是三个常量？），以及门怎么按角色取集。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-18（C 形态 · 评审轮 1 修复 7 条全收（16 档：产品码 8 · 提示词 4 · 设计档 3 · 生成面 1）· 改法正本见 2.12）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.0 本批条目（覆盖）

本批条目 **1 项** = 批档 §1 的改判落地（用户 2026-10-18 16:42「那先按C跑试试」：B → C）。需求源 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md` §2 功能点 2 + AC-M5-2（父侧 16:42 已按 C 改写，本席以其为准）；台账 #1657。**无新增需求条目**。

下拆 7 个工作项：

| # | 工作项 | 判性 | 处置 | 回指 |
|---|---|---|---|---|
| ① | `spawn-gates.mjs`：名集按 C 组织（core 四项 + fifth 两名）+ 门按角色取集判 | 机制面 | 2.3.1 | AC-1 / 2 / 4 |
| ② | `subagent.mjs`：schema 加 `scope`（六参共存）+ 第五项两条 description 互相指路 + 四条核心改「every spawn role」+ `task` 定位改写 | 描述面 | 2.3.2 | AC-1 / 2 / 3 |
| ③ | `subagent-spawn.mjs`：门从 eng 分支移到所有角色；拼装按角色取名集 | 装配面 | 2.3.3 | AC-1 / 2 / 3 / 5 |
| ④ | `tool-docs/subagent.md`：模型可见描述面单点随门走 | 描述面 | 2.3.4 | AC-8 |
| ⑤ | `agent/family-tools.mjs`：eng 子代理的内部 explore 通道（勘察 / 审计）同受新门——描述面补一句 | **派生必要面**（KD-C4） | 2.3.5 | AC-1 / 3 |
| ⑥ | 提示词面 EN 两档 + CN 正本两档 | 提示词面 | 2.3.6 / 2.3.7 | AC-9 |
| ⑦ | 机制所有者设计档随正 + `API-CONTRACT.md` 重生成 | 文档连续性 + 生成面 | 2.3.8 / 2.3.9 | AC-10 |

**禁止项逐条落点**：核心四项名零改（2.3.1 署名不变）· `round` / `files` 语义零改（2.3.3 只在 eng 分支保留 `validateRoundParam`）· `escalate` 不动（2.3.3 证据行）· 不加新判据（2.3.1(e) 判据仍三条）· 两第五项不互相顶替（2.3.1(e) + 2.6 AC-3）。

### 2.1 先例与勘察证据

**同类先例（对齐 ∥ 偏离）**：

| 面 | 先例坐标 | 对齐 ∥ 偏离 |
|---|---|---|
| 名集单源 + 门 + 拼装 | `thincoder-core/agent-tools/spawn-gates.mjs:53`（`TASK_BOOK_PARAMS`）→ `:69`（校验）→ `:87`（拼装）；门调用 `thincoder-core/agent-tools/subagent-spawn.mjs:237-240` | **对齐**：常量与谓词同置一档（D2）、schema 只声明不复写值集、门在 `buildSpawnChild` 单点调用。**偏离**：名集从「一份五项数组」改为「core + fifth 两段 + `taskBookParamsFor(role)` 派生」——C 下第五项两名，若写成两份五项数组则核心四项被手写两遍（AC-4 反例） |
| 角色集合判必带 | `validateRoundParam`（`spawn-gates.mjs:31-45`）与 `subagent.mjs:240` 的 `ROLES` 集合 | **对齐**：沿用同一工程角色集合（eng-coder / eng-designer），不新造角色分类词、不加角色 enum |
| 描述面随门走 | `docs/core/design/AGENT-LOOP-SUBAGENT.md:655-677`（§6.30 · KD-TF1 / KD-TF3） | **对齐**：`tool-docs/subagent.md:23` 与 §6.30 代码块逐字全等（D2 单源）；描述只作人类可读声明、不进对象级 `required` |
| 同形追加 schema 参数 | 批 `2026-10-18-taskbook-params` §2.3.2（五条属性同形并入） | **对齐**：`scope` 与既有五条同形（`type:"string"` + `REQUIRED for …` description）；`required: []` 不动（多 action 单工具） |

**勘察证据（本席实读，2026-10-18 16:5x）**：`spawn-gates.mjs` 138 行（`:18` 样例 / `:53` 名集 / `:56-62` 标签 / `:69` 校验 / `:87` 拼装）· `subagent.mjs` 421 行（`:39` import / `:142` task / `:153-157` 四条核心与 `designPoints` / `:226` 载体判据 / `:240` ROLES）· `subagent-spawn.mjs` 421 行（`:31` import / `:41-47` `taskBriefOf` / `:222` 观测 / `:233-240` 门 / `:357` input）· `tool-docs/subagent.md` 38 行（`:23` / `:25-26`）· `agent/family-tools.mjs` 204 行（`:128-129` 两档描述 / `:93` props 展开自 `subagentTool`）· `permission.mjs:38`（拼装消费点）· bench（`probe/data.mjs:10,116,145` · `check/probe.check.mjs:17,61,80,120-124` · `check/probe-frozen.mjs` 106 行 · `probe/driver.mjs:25,97-99`）· EN `persona-engineering.md:158-167` / `discipline-normal.md:206-213` · CN `docs/core/design/prompts/persona-engineering.md:162-171` / `discipline-normal.md:203-210` · 设计档 `AGENT-LOOP-SUBAGENT.md` §6.22 / §6.30 / §6.29.3 · `ENGINEERING-MODE-V2.md:265` · `MODEL-BENCH.md:1346,1368`。

**escalate 不受本门管的证据（AC-5）**：本门只挂在 `buildSpawnChild`（`subagent-spawn.mjs:198`）；全仓 `buildSpawnChild(` 调用点仅 2 处 = `subagent.mjs:286`（spawn 路径）+ `bench/probe/driver.mjs:99`（探针装配腿）。escalate 子代理自建：`subagent-actions.mjs:165-172` 与 `escalate-async.mjs:204` 直调 `createAgent({role:"coder"})`——不经本门，行为零改。

**外部公共源：无相关**（仓内机制参数化，无外部 API / 协议面）；工作树内独立公共源文档仓 `thincoder.com/` `thinworker.com/` = 站点静态资源，非技术源；`D:\ref\` 未在 `PROJECT-MANIFEST.json` 的 `index.publicRepos` 声明 ⇒ 本批未查。

**基线读数（实测）**：`node bench/check/run.mjs` = **117 passed / 0 failed（exit 0）**；`doc_check`（target = 仓根）= **160 条命中（锚 160 · 行宽 0）**——**不是 0**，与批任务书 AC-6 的字面前提不符（见 2.9 待裁 ①，本席给出的可判替代口径在 2.6 AC-6）。

### 2.2 设计档落点

- 机制所有者档（**本席已落**，行内改写、行数零变）：`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.22（`:246` 定位 / `:248` 门序 / `:253` F2 / `:257` 落点 / `:258` D2 / `:265` AC-M5-2）· §6.30（`:663` 描述正本 / `:674` KD-TF1 / `:676` KD-TF3）· §6.29.3（`:640` 扫描对象句）· `docs/core/design/ENGINEERING-MODE-V2.md:265` · `docs/core/design/MODEL-BENCH.md:1346` 与 `:1368`。
- CN 提示词正本两档（**本席已落**，见 2.3.7）：`docs/core/design/prompts/persona-engineering.md`（`:162` `/` `:164` `/` `:167` `/` `:171`）· `docs/core/design/prompts/discipline-normal.md`（`:203` `/` `:205` `/` `:207` `/` `:210`）。
- 本批设计载体 = 本 §2（逐处改前 → 改后 / 决策 / 验收 / 边界 / 用例）。
- 生成面：`docs/core/design/API-CONTRACT.md` 由 `node scripts/api-contract.mjs --write` 重生成（不手改）。
- 需求档随正 = 主 agent 笔（2.10）。

### 2.3 机制设计（逐处 · 改前 → 改后）

#### 2.3.1 `thincoder-core/agent-tools/spawn-gates.mjs`（138 → 预计 170 行，Δ +32）

**(a) 头注 `:4`**（行内改，0 行）：`已实现：F2（round 枚举 + 任务书五项结构化参数校验/拼装）· F6（files 声明面拦截谓词）。` → `已实现：F2（round 枚举 + 任务书参数校验/拼装——四项核心 + 第五项按角色）· F6（files 声明面拦截谓词）。`

**(b) 样例对象（`:17-24` 8 行 → 14 行，Δ +6）**——核心四项内容一份（不重复写），第五项按角色各一份：

```js
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
```

**(c) 名集 + 两段派生（`:47-53` 7 行 → 23 行，Δ +16）**——C 的单一出处；`TASK_BOOK_PARAMS` 名不变（需求档 §2 功能点 2 的「单源」字面仍指得到实体）：

```js
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
```

**(d) 标签表（`:55-62`，Δ +1）**：加一行 `scope: "Scope (what to read / what not to touch)",`（`designPoints` 标签逐字不变——审计摘要与探针判官读它）。

**(e) `validateTaskBookParams`（`:64-83` 20 行 → 29 行，Δ +9）**——判据三条零改；角色参与**取名集**，只多一句指路文案（不构成新判据）：

```js
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
```

**(f) `composeTaskBookBrief`（`:85-95`，Δ 0）**：签名加 `role`，循环对象改 `taskBookParamsFor(role)`——拼装单点不变（子代理 input / batchDoc 观测 / 权限预览 / 探针判官同源）：

```js
export function composeTaskBookBrief(args, role) {
  const a = args ?? {}
  const parts = []
  for (const name of taskBookParamsFor(role)) {
    const v = a[name]
    if (typeof v === "string" && v.trim() !== "") parts.push(`${TASK_BOOK_LABELS[name]}: ${v.trim()}`)
  }
  return parts.join("\n\n")
}
```

**Δ 复算**：+6（b）+16（c）+1（d）+9（e）+0（f）+0（a）= **+32 ⇒ 170**。

#### 2.3.2 `thincoder-core/agent-tools/subagent.mjs`（421 → 预计 422 行，Δ +1）

**(a) `task` description（`:142`，行内改，0 行）**：

改前：`For action:'eng-coder'/'eng-designer' spawns: the brief IS the five structured parameters (goal / knownFacts / designPoints / acceptance / reportFormat) — a free-text `task` alone is refused. For other roles: either the five parameters or a free-text `task` (the five satisfy the brief for every role; `task` is then an optional supplement). For action:'escalate': goal, constraints, entry files, acceptance criteria.`

改后：`For action:'spawn' (any role): OPTIONAL free-text supplement — the brief itself is the structured task-book parameters (four core: goal / knownFacts / acceptance / reportFormat, plus the role's fifth: designPoints for eng-coder/eng-designer, scope for explore/plan/coder); a task-only spawn is refused. For action:'escalate': the brief (goal, constraints, entry files, acceptance criteria).`

**(b) schema 参数（`:153-157` → `:153-158`，Δ +1）**——四条核心改「every spawn role」，第五项两条互相指路：

```js
      goal: { type: "string", description: "REQUIRED for every spawn role: the task book's goal & why — the problem this solves and the cost chain (content only, no label — the runtime composes the labels)." },
      knownFacts: { type: "string", description: "REQUIRED for every spawn role: the facts and file paths the parent already verified — the child must not re-explore them." },
      designPoints: { type: "string", description: "REQUIRED for role='eng-coder'/'eng-designer' (the fifth task-book parameter for engineering roles): design points & forbidden scope — what to land and what must not be touched. Non-engineering roles use `scope` instead — `scope` never substitutes for this one." },
      scope: { type: "string", description: "REQUIRED for role='explore'/'plan'/'coder' (the fifth task-book parameter for non-engineering roles): scope & forbidden scope — what to read / search and what not to touch. Engineering roles use `designPoints` instead — `designPoints` never substitutes for this one." },
      acceptance: { type: "string", description: "REQUIRED for every spawn role: acceptance criteria — machine-verifiable (commands / thresholds / assertion counts)." },
      reportFormat: { type: "string", description: "REQUIRED for every spawn role: the delivery-report format the child must produce." },
```

**(c) `required: []` 不动**（多 action 单工具，父侧前批裁定沿用）。

**(d) 载体判据（`:226`，行内改，0 行）**：`composeTaskBookBrief(args)` → `composeTaskBookBrief(args, args.role)`；错误文案改为 `"subagent action:'spawn' requires the structured task-book parameters (four core + the role's fifth: designPoints for eng-coder/eng-designer, scope for explore/plan/coder) — a free-text task alone is not the brief."`。**语义**：本判据只兜「全空 + 未知角色」；角色合法时由 2.3.3 的机械门给出逐参点名的拒绝。

**(e) `:39` import 不动**（`ROUND_VALUES` + `composeTaskBookBrief` 已在）。

#### 2.3.3 `thincoder-core/agent-tools/subagent-spawn.mjs`（421 → 预计 419 行，Δ −2）

| 位置 | 改前 → 改后 |
|---|---|
| `:41-47` `taskBriefOf` | 签名 `taskBriefOf(args)` → `taskBriefOf(args, role)`；体内 `composeTaskBookBrief(args)` → `composeTaskBookBrief(args, role)`（0 行） |
| `:222` 观测留痕 | `taskBriefOf(args)` → `taskBriefOf(args, role)`（0 行） |
| `:357` input | `taskBriefOf(args)` → `taskBriefOf(args, role)`（0 行） |
| `:233-240` 门（8 行 → 6 行，Δ −2） | 见下 |

```js
  // M5 F2（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）：任务书参数门——**所有 spawn 角色**。
  // 工程角色：round 枚举（initial|fix）+ 四项核心 + `designPoints`；explore / plan / coder：
  // 四项核心 + `scope`。判据三条零改（存在 ∧ string ∧ trim 非空）；落点 = batchDoc 门之后、
  // token 门之前（门序 = AGENT-LOOP-SUBAGENT.md §6.22）。
  if (role === "eng-coder" || role === "eng-designer") validateRoundParam(args)
  validateTaskBookParams(args, role)
```

**语义点**：①`round` 仍只在工程角色分支（**语义零改**——AC-5）；②任务书门改为无条件调用 ⇒ **普通模式的 explore / plan / coder 同受检**（C 的「所有 spawn 角色」按角色判、不按模式判——见 KD-C3）；③输入拼装 `input` 按角色取名集 ⇒ 普通角色子代理收到的任务书文本 = 四项核心 + `scope`（标签 `Scope (what to read / what not to touch):`）。

**Δ 复算**：−2（门块）+ 0 + 0 + 0 = **−2 ⇒ 419**。

#### 2.3.4 `thincoder-core/tool-docs/subagent.md`（38 → 预计 39 行，Δ +1）

**(a) `:23` 整行替换**（与 `docs/core/design/AGENT-LOOP-SUBAGENT.md:663` 逐字全等，D2 单源——本席已把设计档该代码块改成同一字面）：

```text
Task book (every spawn role): four core structured parameters — goal (goal & why), knownFacts (the facts you already verified), acceptance (machine-verifiable criteria), reportFormat (delivery-report format) — plus ONE fifth parameter named by role: designPoints (design points & forbidden scope) for eng-coder/eng-designer, scope (scope & forbidden scope — what to read / what not to touch) for explore/plan/coder. All five are required: a missing, blank or non-string value is refused with the parameter named, and one role's fifth name never substitutes for the other's. They are composed into the child's brief in that order. A free-text task is an optional supplement, never the whole brief; round (initial|fix) is mandatory for eng-coder/eng-designer.
```

**(b) `:25-26` 参数骨架**：`:26` 的 eng-coder 示例逐字保留，其后加一行非工程示例（Δ +1）——「参数即骨架」的形对三分之二角色同样要可见：

```text
subagent(role="explore", goal="…", knownFacts="…", scope="…", acceptance="…", reportFormat="…")
```

Δ 复算：0（a）+1（b）= **+1 ⇒ 39**。

#### 2.3.5 `thincoder-core/agent/family-tools.mjs`（204 → 204 行，Δ 0）——**派生必要面**

**为什么必须改**：eng 子代理的内部 explore 通道（eng-designer 的勘察 / eng-coder 的审计）把 `subagentTool.parameters.properties` 整块展开（`family-tools.mjs:93`）⇒ schema 自动带上 `scope`；但该通道的 **description 被整段替换**（`:128-129`），读不到 `tool-docs/subagent.md:23` 的任务书段。C 之后「只传 `task` 的 explore spawn」会被门拒 ⇒ **不带这句，两条内部通道当场死掉**（实测现状：两份 persona 只写「委派 explore 子代理」，args 依据全在工具描述里）。

**改法**（`:128` 与 `:129` 两条描述字符串各追加一句，行内改、Δ 0）：

```text
 The spawn carries the five task-book parameters (four core: goal / knownFacts / acceptance / reportFormat + `scope`); a task-only spawn is refused.
```

**边界**：只补这一句；角色 enum / action enum / 删参面（`async` / `id` / `designToken` / `designId` / `batchDoc` / `round`）零改。

#### 2.3.6 EN 运行面两档（eng-coder 落笔；主 agent 内容权）

**`thincoder-core/prompts/persona-engineering.md`（227 → 227 行，Δ 0）**——`:158` / `:160` / `:163` / `:167` 四行行内改写；`:162` / `:164` / `:165` / `:166` 逐字不动（两条 ⚠️ 与 `files` 调度通道句保留原位）：

- `:158` → `- Every dispatch carries a task book — **four core = structured spawn parameters, every spawn role** (pass them as parameters; the runtime composes the child's brief in fixed order — `task` is only an optional free-text supplement):`
- `:160` → `  **`round`** (initial / fix — eng-coder / eng-designer only; fix rounds are point-fixes only: a full survey drags a small fix back into minutes)`
- `:163` → `  **The fifth parameter is named by role**: **`designPoints`** (design points & forbidden scope) for eng-coder / eng-designer ∥ **`scope`** (scope & forbidden scope — what to read / what not to touch) for explore / plan / coder — pass exactly one; the wrong name is refused (neither substitutes for the other)`
- `:167` → `  Every spawn role: a missing / blank / non-string value = mechanically refused with the parameter named (the criterion stops at presence, type and trim — content is never read) — normal-mode explore / plan / coder spawns included.`

**`thincoder-core/prompts/discipline-normal.md`（263 → 264 行，Δ +1）**——`:206` / `:208` / `:210` / `:213` 改写，新增第五项一行：

- `:206` → `- Every delegation carries a task book — **four core = structured spawn parameters, every spawn role** (`task` is only an optional free-text supplement):`
- `:208` → `  **`round`** (initial | fix — eng-coder / eng-designer only; fix rounds are point-fixes only, no full survey)`
- `:210`（原 `designPoints` 行）→ 两行：`  **The fifth parameter is named by role**: **`designPoints`** (design points & forbidden scope) for eng-coder / eng-designer ∥ **`scope`** (scope & forbidden scope — what to read / what not to touch) for explore / plan / coder — pass exactly one; the wrong name is refused`（+1 行，因原行同时承载 `acceptance` 前序位置，拆开后行数 +1）
- `:213` → `  Every spawn role: a missing / blank / non-string value is mechanically refused with the parameter named (the criterion stops at presence, type and trim — content is never read) — normal-mode explore / plan / coder spawns included.`

两档与 CN 正本（2.3.7）逐点对位；英文 = 精确翻译（需求 §8.4）。

#### 2.3.7 CN 正本两档（**本席已落**，Δ 均 0）

- `docs/core/design/prompts/persona-engineering.md`：`:162`（`五项` → `四项核心 = spawn 结构化参数（所有 spawn 角色必传）`）· `:164`（`round` 加「eng-coder / eng-designer 必带」）· `:167`（`designPoints` 行 → `第五项按角色：designPoints ∥ scope——只填一个，填错名字 = 拒（两者不互相顶替）`）· `:171`（`工程角色缺任一…` → `所有 spawn 角色：…——普通模式的 explore / plan / coder 同样受检`）。档 235 行不变。
- `docs/core/design/prompts/discipline-normal.md`：`:203` / `:205` / `:207` / `:210` 同形改写。档 257 行不变。

#### 2.3.8 机制所有者设计档随正（**本席已落**，行数零变）

`docs/core/design/AGENT-LOOP-SUBAGENT.md`（679）：§6.22 `:246` 定位 / `:248` 门序 / `:253` F2 / `:257` 落点（加 `taskBookParamsFor`）/ `:258` D2 / `:265` AC-M5-2；§6.30 `:663` 描述正本（= 2.3.4(a) 字面）/ `:674` KD-TF1 / `:676` KD-TF3；§6.29.3 `:640` 扫描对象句。
`docs/core/design/ENGINEERING-MODE-V2.md:265`（524 行不变）：委派治理句改为「四项核心所有 spawn 角色 + 第五项按角色 + `round`（eng 角色）」。
`docs/core/design/MODEL-BENCH.md`（1749 行不变）：`:1346`（门句改指 `taskBookParamsFor("eng-designer")`）· `:1368`（夹具族头句改为「工程角色名集逐字：四项核心 + `designPoints`」+ `composeTaskBookBrief(params, "eng-designer")`）。

#### 2.3.9 `docs/core/design/API-CONTRACT.md` 重生成

`node scripts/api-contract.mjs --write`（不手改）。新增导出行：`PLAIN_TASK_BOOK_MIN`（const）· `taskBookParamsFor`（fn）；`TASK_BOOK_PARAMS` 行保留（形态由数组变对象，行文不变）；`spawn-gates.mjs` 其余导出与 `subagent-spawn.mjs` 导出行号随动。

### 2.4 关键决策记录（含被否方案）

| # | 取舍 | 理由 | 被否方案（拒因） |
|---|---|---|---|
| KD-C1 | **名集单源 = `TASK_BOOK_PARAMS = { core: [四项], fifth: { engineering, plain } }` + `taskBookParamsFor(role)` 派生**（保留常量名） | 每个名字恰好手写一次；每角色名集只有一条派生路径（D2）；`TASK_BOOK_PARAMS` 字面仍在 ⇒ 需求档 §2「`TASK_BOOK_PARAMS` 单源」指得到实体 | ① 两个五项数组（`ENG_TASK_BOOK_PARAMS` + `PLAIN_TASK_BOOK_PARAMS`）⇒ 核心四项手写两遍（AC-4 反例）；② 五角色 Map（5 × 5 名）⇒ 核心四项手写五遍；③ 六名并集数组（`designPoints` + `scope` 同列）⇒ 「任务书五项」读成六项、拼装会同时吐两段第五项 |
| KD-C2 | **`task` = spawn 的可选补充文本，不再是任何 spawn 角色的合法单独载体** | C 的「四项核心所有 spawn 角色」= 全部角色必带参数；`task` 若仍能单独成载，等于门按角色豁免 ⇒ 出现第二个判据源，且 AC-2（explore 缺 `scope` ⇒ 拒）失效 | ① 删掉 `task` 参数 ⇒ 同一工具还承载 `escalate`（其任务书就是 `task`），且 action 条件化 schema 不是本工具形态；② 普通角色保留 `task` 单独成载（B 时代规则）⇒ 与「所有角色」相抵、AC-2 破 |
| KD-C3 | **门按角色判，不按模式判** ⇒ 普通模式的 explore / plan / coder 同样机械受检 | 需求 §2 写的是「所有 spawn 角色」，C 表格列明「普通模式 = explore / plan / coder」；按模式豁免会造出「同一角色在两种模式下判据不同」的第二个口径 | 只对工程模式生效（拒因：explore 在两模式同名同义，判据分叉后提示词要教两套，且普通模式的 `scope` 无机械面） |
| KD-C4 | **`family-tools.mjs` 两条内部通道描述各补一句任务书契约**（本批范围 +1 档） | eng 子代理的内部 explore 通道 description 被整段替换、读不到工具描述的任务书段；C 之后「只传 `task` + `role:"explore"`」被拒 ⇒ 勘察 / 审计两条通道死掉（`persona-eng-designer.md:33` 的委派、eng-coder 的审计）。补一句 = 让新门在内部通道**可发现**，不是新语义 | ① 不动（拒因：交付即带断链——内部审计 spawn 全部被拒）；② 给 depth>0 的 explore 开豁免（拒因：与 AC-2「explore 缺 scope ⇒ 拒」直接相抵，且是需求未授权的新豁免） |
| KD-C5 | **`scope` 的拼装标签 = `Scope (what to read / what not to touch)`** | 「scope & forbidden scope」英文重复；括号形与 CN 正本「范围与禁止范围——只读哪些 / 不碰什么」逐点对位 | `Scope & forbidden scope`（拒因：同词重复、读者要猜差别） |
| KD-C6 | **`PROBE_VERSION` 不 bump（保持 2）** | §10.2 的轴 = 夹具字面 / 判据与行为类表 / 停止条件 / 判官 rubric / 参数口径。本批夹具字面逐字不变、eng-designer 的 args 与拼装文本逐字不变、判官与停止条件零改 ⇒ 跨版本读数严格可比；bump 会向「测量口径换代」发假信号（KD-27 / KD-30 同源判据） | bump 到 3（拒因：假不可比信号；若评审认为「名集组织」属参数口径面，改一个整数 + `probe.check.mjs:61` 一处断言即可，代价一行） |
| KD-C7 | **跨角色误填的指路进文案、不进判据** | C 的代价 = 两个近义参数可能问「填哪个」；缺右名 + 左名在场时补一句 `(got scope instead — that name belongs to …)` 直接消解该问题，且判据仍是三条（存在 ∧ string ∧ trim） | 把「两第五项同时在场」判为拒（拒因：= 加新判据，违反本批禁止项；且父侧 schema 里 `designPoints` + `scope` 同传不会造成歧义——门只取当前角色的那一个） |

### 2.5 受影响文件与测试覆盖

计数口径 = 行数（`readFileSync(f,"utf8").split("\n")`，文件以换行结尾时去掉末尾一个空元素）；「改前」= 本批落笔前读数（2026-10-18 16:5x 本席实测）；「预计」由实施轮实测复核。每行 Δ 的复算式见表后。

| 文件 | 面 | 改前 | 预计改后 | Δ |
|---|---|---|---|---|
| `thincoder-core/agent-tools/spawn-gates.mjs` | 产品码 | 138 | 170 | +32 |
| `thincoder-core/agent-tools/subagent.mjs` | 产品码 | 421 | 422 | +1 |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品码 | 421 | 419 | −2 |
| `thincoder-core/agent/family-tools.mjs` | 产品码 | 204 | 204 | 0 |
| `thincoder-core/tool-docs/subagent.md` | 产品码（描述面） | 38 | 39 | +1 |
| `thincoder-core/prompts/persona-engineering.md` | EN 运行面 | 227 | 227 | 0 |
| `thincoder-core/prompts/discipline-normal.md` | EN 运行面 | 263 | 264 | +1 |
| `docs/core/design/prompts/persona-engineering.md` | CN 正本（**已落**） | 235 | 235 | 0 |
| `docs/core/design/prompts/discipline-normal.md` | CN 正本（**已落**） | 257 | 257 | 0 |
| `bench/probe/data.mjs` | 产品码（bench） | 215 | 216 | +1 |
| `bench/check/probe-frozen.mjs` | 产品码（bench） | 106 | 106 | 0 |
| `bench/check/probe.check.mjs` | 产品码（bench 自检） | 285 | 295 | +10 |
| `bench/probe/driver.mjs` | 产品码（bench） | 266 | 266 | 0 |
| `bench/probe.mjs` | 产品码（bench） | 310 | 310 | 0 |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档（**已落**） | 679 | 679 | 0 |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 设计档（**已落**） | 524 | 524 | 0 |
| `docs/core/design/MODEL-BENCH.md` | 设计档（**已落**） | 1749 | 1749 | 0 |
| `docs/core/design/API-CONTRACT.md` | 生成面 | 4436 | 重生成 | ~0（+2 导出 行、行号随动） |

**bench 面逐档改法（实施轮）**

- `bench/probe/data.mjs`（215 → 216）：`:10` import 的 `TASK_BOOK_PARAMS` → `taskBookParamsFor`；新增一行 `const PROBE_FIXTURE_ROLE = "eng-designer"`（注释注明 = `probe/driver.mjs` 的 `PROBE_ROLE`）；`:116` `Object.fromEntries(taskBookParamsFor(PROBE_FIXTURE_ROLE).map((k) => [k, f[k]]))`；`:120` `composeTaskBookBrief(taskBookParams, PROBE_FIXTURE_ROLE)`；`:145` 循环对象同改。**夹具字面零改**（三族仍 = 四项核心 + `designPoints`）。
- `bench/check/probe-frozen.mjs`（106）：**零改**（夹具字面未动 ⇒ 两层逐字等值保持）。
- `bench/check/probe.check.mjs`（285 → 295）：`:17` import 加 `PLAIN_TASK_BOOK_MIN` / `taskBookParamsFor`；`:80` 同构自检改为两条（工程样例 ↔ `taskBookParamsFor("eng-designer")`、非工程样例 ↔ `taskBookParamsFor("explore")`，+3）；`:119-124` 门断言改为按角色两组 + 跨角色误填两条（+7）。
- `bench/probe/driver.mjs` / `bench/probe.mjs`：**零改**（`assembleProbeChild` 的 `args` 形与角色不变；判官输入的 `taskBook` 文本逐字不变）。

**测试覆盖**：本项目单元测试零留存（`thincoder-core/test/` 与 `thincoder-cli/test/` 现只有 runner）；本批的可机检面 = `bench/check/probe.check.mjs` 常驻自检（探针装配腿 + 门断言组）+ `node bench/check/run.mjs` 全跑。`doc_check` 为报告态（非门禁），本批口径见 AC-6。

### 2.6 验收对照（回指需求档 AC-M5-2 与批任务书 AC-1..AC-7）

| # | 判据 | 达成方式（可机检） | 回指 |
|---|---|---|---|
| AC-1 | 工程角色（eng-coder / eng-designer）缺四项核心或 `designPoints` 任一 ⇒ 拒并点名 | `validateTaskBookParams(args, "eng-coder")`：core 四项 + `designPoints`；`probe.check.mjs` 断言组逐参 `assert.throws(… /<param>/)` | 批任务书 ① |
| AC-2 | explore / plan / coder 缺四项核心或 `scope` 任一 ⇒ 拒并点名 | 同上以 `scope` 为第五项；三角色取同一名集（`taskBookParamsFor` 相等断言） | 批任务书 ② |
| AC-3 | 跨角色误填不受检顶替：eng 角色只给 `scope` ⇒ 仍拒（点名 `designPoints`）；非工程角色只给 `designPoints` ⇒ 仍拒（点名 `scope`） | `probe.check.mjs` 两条反例断言：`{...plainTb, designPoints, scope: undefined}` 对 `"eng-coder"` ⇒ `/designPoints/`；`{...engTb, scope, designPoints: undefined}` 对 `"explore"` ⇒ `/scope/` | 批任务书 ③ |
| AC-4 | 「名集单源」仍是单一出处（不许两份手写名集） | 核心四项数组字面全仓唯一（`spawn-gates.mjs` 的 `TASK_BOOK_PARAMS.core`）；两名第五项字面各出现一处（`TASK_BOOK_PARAMS.fifth`）；一切名单消费点走 `taskBookParamsFor(role)`（`grep -c 'taskBookParamsFor'` 命中 = 定义 1 + 消费 ≥4） | 批任务书 ④ |
| AC-5 | `escalate` 不受此门管 | 结构证据：门只挂 `buildSpawnChild`（`subagent-spawn.mjs:198`）；escalate 自建 child（`subagent-actions.mjs:165-172`）不经该函数；`round` 语义零改（仍在 eng 分支） | 批任务书 ⑤ |
| AC-6 | 本批改过的每个文档档 `doc_check` 零命中 | **口径收正**：全仓基线 160 条（`AGENTS.md` / `CHANGELOG.md` / `X.md` 类历史锚，非本批引入）⇒ 本批判据 = **本批改动的每个文档档，改动后命中数 = 改动前读数（不新增）**：`AGENT-LOOP-SUBAGENT.md` 4 · `MODEL-BENCH.md` 2 · `discipline-normal.md`（CN）5 · 其余本批档 0（本席交付前已实测，见 2.9 ①） | 批任务书 ⑥（口径改写，待父侧裁） |
| AC-7 | `node bench/check/run.mjs` 全绿 | 基线 117 passed / 0 failed（exit 0）；本批后仍须同数或以上、0 failed | 批任务书 ⑦ |
| AC-8 | 描述面与门一致 | `tool-docs/subagent.md:23` 与 `AGENT-LOOP-SUBAGENT.md:663` 逐字全等（`node -e` 两串比对）；schema 六条 description 与门的名集同名（`grep designPoints/scope` 双向各 1） | 2.3.2 / 2.3.4 |
| AC-9 | 提示词面按 C 写 | EN 两档 + CN 两档各含「four core / 四项核心」「第五项按角色」「所有 spawn 角色」三句；`五项 = spawn 结构化参数` 旧句零命中（四档） | 2.3.6 / 2.3.7 |
| AC-10 | 设计档与 API-CONTRACT 同步 | `AGENT-LOOP-SUBAGENT.md` §6.22 / §6.30 已按 C 改写（本席已落）；`node scripts/api-contract.mjs --check` exit 0 | 2.3.8 / 2.3.9 |

### 2.7 用例表（正常 / 边界 / 错误）

| # | 类 | 输入（args + role） | 期望 |
|---|---|---|---|
| 1 | 正常 | `{goal,knownFacts,designPoints,acceptance,reportFormat}` + `eng-designer` | 放行；拼装文本 = 五段，第三段 `Design points & forbidden scope:` |
| 2 | 正常 | `{goal,knownFacts,scope,acceptance,reportFormat}` + `explore` | 放行；拼装文本 = 五段，第三段 `Scope (what to read / what not to touch):` |
| 3 | 正常 | 同 2 的 args + `plan` / `coder` | 放行（三角色名集相等：`taskBookParamsFor("plan")` = `taskBookParamsFor("coder")` = `taskBookParamsFor("explore")`） |
| 4 | 边界 | 工程 args 里**额外**多带 `scope` | 放行（额外参数不判、不顶替）；拼装只取 `designPoints`（角色名集） |
| 5 | 边界 | 非工程 args 里**额外**多带 `designPoints` | 放行；拼装只取 `scope` |
| 6 | 错误 | 工程角色只给 `scope`（无 `designPoints`） | 拒；点名 `designPoints` + 指路句 `(got scope instead …)` |
| 7 | 错误 | `explore` 只给 `designPoints`（无 `scope`） | 拒；点名 `scope` + 指路句 |
| 8 | 错误 | 任一角色 `goal` 缺失 / `knownFacts` 全空白 / `acceptance` 非字符串 | 拒；逐项点名（`missing` / `blank` / `must be a string`） |
| 9 | 错误 | 任意角色只给 `task`（无任务书参数） | 拒（`:226` 载体判据放行后由机械门点名缺参；两者全空则 `:226` 先拒） |
| 10 | 错误 | 未知角色（如 `"Coder"`） | 拒于 `subagent.mjs:240` 的 `ROLES` 门（文案不变；任务书门到不了） |
| 11 | 对照 | `action:"escalate"` + `task` | 不受本门影响（不经 `buildSpawnChild`） |

### 2.8 边界（本批不做）

- 不做实现（eng-coder 职责）、不签发 token、不跑真实探针跑批（触网花钱 = 用户点名）。
- 不改核心四项名 / 不改 `round` · `files` 语义 / 不动 `escalate` / 不加新判据 / 不新增角色或动作。
- 不改 `composeTaskBookBrief` 的拼装序（第五项仍在 `knownFacts` 之后）、不改标签的既有四条英文词面。
- 不清理全仓 160 条 `doc_check` 历史锚（`AGENTS.md` / `CHANGELOG.md` / `X.md` 类；属仓库级文档债——另一批，见 2.9 ①）。
- 不改 `persona-eng-coder.md` / `persona-eng-designer.md` 正文（内部通道的 args 契约单点在 `family-tools.mjs` 描述面——D2；两份 persona 现行文本只述「委派 explore」，未写 args，无冲突）。
- 不在提示词里加 explore 派单示例（`persona-engineering.md:154` 的 eng-coder 示例行保留原样；可发现性由 schema + 工具描述 + 规则行承担）。

### 2.9 上抛项 / 待裁

① **`doc_check` 基线不是 0**（`[上抛·待裁]`）：批任务书 AC-6 写「全仓 `doc_check` 零命中」，实测 **160 条**（锚 160 · 行宽 0；全部为本批之前既有，典型 = `AGENTS.md` 档缺——该文件住工作区根 `d:\teamcode\AGENTS.md`，不在 `d:\teamcode\thincoder\` 内）。本席的处置 = 2.6 AC-6 改判为「本批改动的每个文档档：命中数不新增」（基线逐档已列），全仓 160 条作为独立文档债另批清。**请裁：接受该口径 ∥ 本批兼清全仓**（后者会显著扩大范围，且多数命中属锚纪律政策面）。
② **普通模式从此有机械门**（`[上抛·知会]`）：C 按角色判 ⇒ 普通模式的 explore / plan / coder spawn 也必带四项核心 + `scope`，缺 = 机械拒。这是用户可见行为变化（此前普通模式只靠纪律），已写进 EN / CN 普通模式派单节。若父侧认为普通模式应保持软约束，那是需求层改判（要改 SPEC §2 功能点 2 的「所有 spawn 角色」），本席不自行收窄。
③ **内部 explore 通道增补一档**（`[上抛·知会]`，见 KD-C4）：`agent/family-tools.mjs` 不在批任务书列的四档内，但不改则 eng-designer 勘察 / eng-coder 审计两条通道被新门拒死——故列入本批（影响面 +0 行、+1 句 ×2）。

### 2.10 需求档随正（**主 agent 笔**）

- `docs/core/requirements/ENGINEERING-MODE-V2.md:430`：现盘「派单任务书五项 = 结构化 spawn 参数（`goal`/`knownFacts`/`designPoints`/`acceptance`/`reportFormat`——缺任一即拒）」在 C 下对非工程角色为假 ⇒ 改为「四项核心（`goal`/`knownFacts`/`acceptance`/`reportFormat`）+ 第五项按角色（工程 = `designPoints` ∥ explore/plan/coder = `scope`）——缺任一即拒，跨角色顶替仍拒」。
- `docs/core/requirements/ENGINEERING-MODE-V2.md:433`：现盘「五个结构化参数（`goal`/`knownFacts`/`designPoints`/…）」同因改同上形；「机械门按 `TASK_BOOK_PARAMS` 逐项判」改为「按 `taskBookParamsFor(role)` 逐项判」（名集单源不变）。
- 可选收正（建议，不阻塞）：`ENGINEERING-MODE-V2-SPEC-DELEGATION.md` AC-M5-2 现文「任务书五项参数缺任一 → 拒并点名该参数——所有 spawn 角色同受检」成立但未点明第五项按角色分名 ⇒ 建议补一句「工程角色判 `designPoints`、explore/plan/coder 判 `scope`；跨角色顶替仍拒」（= 本批 AC-3 的需求面锚）。

### 2.11 交付前复测与更正（append-only，不改上文字面）

**① AC-6 按字面成立——撤回 2.6 的「口径收正」与 2.9 ①**：
以**工作树引擎**直跑 `runDocCheck("d:/teamcode/thincoder")` = **0 条命中**（锚 0 · 行宽 0 · 212 档）。批任务书 AC-6「全仓 `doc_check` 零命中」**不需要改判**。
本席先前三次读数（160 / 161 / 159）来自**会话进程内的旧引擎缓存**——工作树的 `thincoder-core/doc-check/anchors.mjs` 已由并行轮修准，而本会话的工具面仍持进程启动时载入的旧模块（= DOC-CHECK 需求 F8 写的失效模式：引擎档 mtime > 进程启动时刻）。⇒ **2.6 AC-6 的替代口径撤回**；**2.9 ① 撤回**（不是待裁项）。教训记此：机检读数先核引擎版本，再信数字。

**② 两处行宽修正（本席已落）**：首轮落笔后 `docs/core/design/AGENT-LOOP-SUBAGENT.md:246`（373 字符）与 `docs/core/design/ENGINEERING-MODE-V2.md:265`（372 字符）超 `checkConfig.lineWidth = 300`（旧引擎同样报行宽 2 条，与引擎版本无关）⇒ 各拆成两行。两档行数随之为：`AGENT-LOOP-SUBAGENT.md` 679 → **680**、`ENGINEERING-MODE-V2.md` 524 → **525**（2.5 表内这两行的 0 值以本段为准）。

**③ 2.5 表一处实测更正**：`thincoder-core/agent/family-tools.mjs` 现盘 **203** 行（表内 204——read 工具的「N lines total」含末尾空元素；行数口径 = 去末元素）。Δ 仍为 0。

**④ 改动面计数更正**（2.0 / 状态行的「10 档」不准）：实际改动 = **15 档** = 产品码 7（spawn-gates · subagent · subagent-spawn · family-tools · tool-docs · `probe/data.mjs` · `probe.check.mjs`）+ 提示词 4（EN 2 + CN 2）+ 设计档 3（AGENT-LOOP-SUBAGENT · ENGINEERING-MODE-V2 · MODEL-BENCH）+ 生成面 1（API-CONTRACT）；**零改 3 档**（`probe-frozen.mjs` · `probe/driver.mjs` · `bench/probe.mjs`）= 2.5 表 18 行之全部。

**⑤ 并行轮触碰面登记**（`git status` 实读；**非本席改动**，本批之外的另一个在途轮）：`docs/README.md` · `docs/core/design/BATCH-RECORD.md` · `docs/core/design/DOC-DISCIPLINE.md` · `thincoder-core/doc-check/anchors.mjs` · `docs/core/requirements/DOC-CHECK.md`（新）· `docs/batches/2026-10-18-doc-check-gate.md`（新）· `docs/core/requirements/ENGINEERING-MODE-V2.md:612`（一行）· **`thincoder-core/agent-tools/subagent.mjs:142`（把上批的「载体二选一」文案回退成更早的形）** · CN `prompts/persona-eng-coder.md` / `persona-eng-designer.md`（加文档机检门）。
对本批的三点影响：ⓐ `subagent.mjs:142` 的「改前」字面以**落笔时盘面**为准（2.3.2(a) 的**改后**字面不变；行数不变）；ⓑ 本批 `files` 含 `subagent.mjs`，与并行轮同档——派单时须声明 `files`，由调度器串行化；ⓒ CN 提示词面有两档正被并行轮写（本批不动那两档——见 2.8 边界），本批只动 `persona-engineering` / `discipline-normal`。

**⑥ 需求档 `ENGINEERING-MODE-V2-SPEC-DELEGATION.md` 的 M 状态** = 主 agent 16:42 的 C 改写（本批需求源本身，未提交），非并行轮。

### 2.12 评审轮 1 修复（7 条全收 · 本节覆盖上文对应行）

**来源**：批档 §3 轮次 1（`advisor#8`，changes-required：🔴1 · 🟡4 · 🔵2），父侧 7 条全收。**口径**：本节与上文冲突处一律以本节字面为准——2.3 / 2.5 / 2.6 / 2.7 / 2.10 的对应行被本节替换；本节未提及的行不变。原因：§2 只可追加，不能改上文。

#### 2.12.1 #1（🔴）`thincoder-core/permission.mjs` 纳入改动面

**改法（2.3 原无此小节，改法正本 = 本节）**：`:38` 行内改，Δ 0。

- 改前：`  if (base === "subagent") return cap(composeTaskBookBrief(args) || args.task || "", 500)`
- 改后：`  if (base === "subagent") return cap(composeTaskBookBrief(args, args.role) || args.task || "", 500)`

**2.5 表新增一行**：`thincoder-core/permission.mjs`｜产品码（人审预览面）｜**132**｜132｜0。
（评审记 133 行 = read 工具口径，含末尾空元素；本项目行数口径去末元素 ⇒ 132，与 2.1 勘察证据同一记法。）

**选「传 `args.role`」，不取「默认回退 `role = args?.role`」**：

1. 默认回退把新形参变成非必填——漏传的调用点在语法上无痕。本 🔴 的成因正是「漏传一个实参 ⇒ 静默换错名集」；默认回退把同一失效模式从「漏传实参」搬到「args 里没有 role」，等于给同一个坑换了个入口。
2. `permission.mjs` 的 `args` 就是工具入参：spawn 路径上 `role` 由 `subagent.mjs:241` 的 `ROLES` 门兜底（缺 ⇒ 拒），消费点显式取值即与 schema 契约同名（`:144` 的 role enum）。默认形把这层关系藏进签名。
3. 默认回退还会让 `subagent-spawn.mjs` 两处显式传参（`:222` / `:357` 经 `taskBriefOf(args, role)`）退化成可选噪音——显式面一消失，下一轮改动就无法靠阅读发现漏传点。
4. 成本相同（都是一行），没有理由选弱的那条。

**行为验证 = AC-11 第 1 条**：`formatPermission("subagent", {action:"spawn", role:"eng-designer", goal, knownFacts, designPoints, acceptance, reportFormat})` 的输出须含 `Design points & forbidden scope:`。改前形（role 未传）⇒ 该段缺失 ⇒ 断言红（缺陷可复现，不是空断言）。

**语义边界**：非 spawn 动作（`escalate` / `status` / …）`args.role` 缺失 ⇒ 取 plain 名集；这些动作不带任务书五项，拼装结果与改前逐字相同（`escalate` 的 goal / acceptance 仍命中，`designPoints` 本就无值）——**预览行为对非 spawn 动作零变**。

#### 2.12.2 #2（🟡）EN `discipline-normal.md` 改回 263 → 263（Δ 0）

**撤回 2.3.6 该项的「两行 / +1」及其理由**——「原行同时承载 `acceptance` 前序位置」与盘面不符：`:210` 是独立的 `designPoints` 行，`acceptance` 在 `:211`。

`thincoder-core/prompts/discipline-normal.md`（**263 → 263，Δ 0**）：`:210` **单行替换**（改后整行，273 字符 < `checkConfig.lineWidth` 300）：

```text
  **The fifth parameter is named by role**: **`designPoints`** (design points & forbidden scope) for eng-coder / eng-designer ∥ **`scope`** (scope & forbidden scope — what to read / what not to touch) for explore / plan / coder — pass exactly one; the wrong name is refused
```

`:206` / `:208` / `:213` 按 2.3.6 原字面落（行内改，0 行）。**Δ 复算**：0（`:206`）+ 0（`:208`）+ 0（`:210` 同行换）+ 0（`:213`）= **0 ⇒ 263**，与 CN 同档 `:207` 单行替换（Δ 0）对位。

#### 2.12.3 #3（🟡）需求档 `round` 必带集：2.10 增列三行（主 agent 笔）

2.10 在原有两条之外**增列**（原文保留，回指 AC-5：`round` 仅 eng-coder / eng-designer）：

| 位置 | 现盘 → 改后 |
|---|---|
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md:7` | 「任务书必须带齐**五个结构化参数 + `round`**」→「任务书必须带齐**四项核心 + 第五项按角色**（工程角色 = `designPoints` ∥ explore / plan / coder = `scope`）；**`round` 仅 eng-coder / eng-designer 必带**」 |
| 同档 `:14` | 「**`round`（初始 / 修复）**——派单必带」→「**`round`（初始 / 修复）**——eng-coder / eng-designer 必带；explore / plan / coder 不带轮次语义」 |
| `docs/core/requirements/ENGINEERING-MODE-V2.md:12` | 「任务书必备**（五个结构化参数 + `round` + `batchDoc` 体检）」→「任务书必备**（四项核心 + 第五项按角色 + `round`（eng 角色）+ `batchDoc` 体检）」 |

**路径收正**：评审写「`ENGINEERING-MODE-V2.md:12`」未带目录层——实盘该句在 `docs/core/requirements/ENGINEERING-MODE-V2.md:12`；设计档 `docs/core/design/ENGINEERING-MODE-V2.md:12` 是 §1.1 总述句、无此句。清单按实盘路径落。

**同面自查（本席笔 · 已落，Δ 0）**：`docs/core/design/ENGINEERING-MODE-V2.md:68`（M5 模块表「任务书五个结构化参数 + `round` + files 声明面拦截」）在 C 下失准 ⇒ 改「任务书四项核心 + 第五项按角色 + `round` + files 声明面拦截」。该档仍 525 行。

#### 2.12.4 #4（🟡）取消 `PROBE_FIXTURE_ROLE`，直接 import `PROBE_ROLE`

`bench/probe/data.mjs`（**215 → 216，Δ +1**；替换 2.5 bench 段对该文件的改法）：

- 新增一行 `import { PROBE_ROLE } from "./driver.mjs"`（+1）。**无环**：`driver.mjs` 不 import `data.mjs`；全仓 `probe/data.mjs` 的消费者只有 `bench/probe.mjs:22` 与 `bench/check/probe.check.mjs:15`，两者都已加载 driver。
- **不新增** `PROBE_FIXTURE_ROLE` 常量——`:116` / `:120` / `:145` 直接用 `PROBE_ROLE`（一个事实一个名字）。
- `:10` 的 `TASK_BOOK_PARAMS` 换 `taskBookParamsFor`（改后本档不再引用 `TASK_BOOK_PARAMS`）。

**为什么不取「两份字面 + `assert.equal` 等值断言」**：断言只能在漂移发生后变红；import 让漂移不可能发生，代价相同（两者都是 +1 行）。**夹具字面零改**（三族仍 = 四项核心 + `designPoints`），`PROBE_VERSION` 仍为 2（KD-C6 不变）。

#### 2.12.5 #5（🟡）两处承重句进机检（新开 AC-11）

**新 AC-11**（回指 2.12.1 / 2.3.4(b) / 2.3.5）：`bench/check/probe.check.mjs` 新增一个 `check()` 块，三条断言：

1. **权限预览含第五项段**（#1）：`formatPermission("subagent", {action:"spawn", role:"eng-designer", goal:"g", knownFacts:"k", designPoints:"d", acceptance:"a", reportFormat:"r"})` 的输出含 `Design points & forbidden scope:`。
2. **两条内部 explore 通道描述各含契约句**（#5 · ⑤）：`family-tools.mjs` 源文本按 `/The spawn carries the five task-book parameters[^\n]*`scope`[^\n]*a task-only spawn is refused/g` 命中数 **= 2**（eng-designer 段 + eng-coder 段；删一句 ⇒ 1 ⇒ 红；句里丢 `scope` ⇒ 0 ⇒ 红）。
3. **非工程参数骨架行在产品描述面**（#5 · 2.3.4(b)）：`tool-docs/subagent.md` 源文本含 `subagent(role="explore"`。

**为什么用源文本而不是读工具对象**：描述文本就是产品面（模型读到的即此字面），断言对象 = 「该句在不在产品面」；改走 `assembleFamilyTools` 装配要拉 ledger / `node:sqlite` 侧链，换来的只是同一字面的另一条读法。
**为什么住 `probe.check.mjs`**：本项目单元测试零留存（2.5），`bench/check/run.mjs` 是唯一常驻机检面，本批门断言已定住此档。

**Δ**：`bench/check/probe.check.mjs` **285 → 305（+20）** = 原计划 +10（门断言两组 / 跨角色误填两条 / 非工程样例）+ AC-11 的 +10（新增 import 1 行 + `check()` 块 8 行 + 块前空行 1 行）；`:10` 的 `node:fs` import 加 `readFileSync`（0 行）。

#### 2.12.6 #6（🔵）「描述正本」坐标 `:663` → `:664`

实盘 `docs/core/design/AGENT-LOOP-SUBAGENT.md`：`:663` = 代码块围栏，`:664` = 描述正文。上文四处引用改指 `:664`——2.2 的 §6.30 坐标行、2.3.4(a) 首句、2.3.8 的 §6.30 段、AC-8 的比对句。AC-8 同时明记：比对时点在 **2.3.4(a) 落地后**（现盘 `tool-docs/subagent.md:23` 仍是改前旧字面，改前比对必红）。

#### 2.12.7 #7（🔵）`subagent.mjs:224-225` 注记并入 2.3.2(d) 改写范围

`thincoder-core/agent-tools/subagent.mjs`（**421 → 422，Δ +1 不变**；`:224-225` 注记 2 行 → 2 行，Δ 0）：

- 改前 `:224`：`    // 任务书载体二选一：五项结构化参数（拼装后非空）或 task 自由文本——两者皆缺 ⇒ 拒。`
- 改前 `:225`：`    // （工程角色另有五项必带门 = spawn-gates.validateTaskBookParams，落 buildSpawnChild。）`
- 改后 `:224`：`    // 任务书载体：结构化参数（拼装后非空）——task 只作补充；两者皆缺 ⇒ 此处先拒。`
- 改后 `:225`：`    // （五项必带门 = spawn-gates.validateTaskBookParams，覆盖所有 spawn 角色、落 buildSpawnChild——task-only 由该门点名拒。）`

`:226` / `:227` 按 2.3.2(d) 原字面落（`composeTaskBookBrief(args, args.role)` + 新文案）。

#### 2.12.8 受影响文件表（替换 2.5 全表 · **19 行**）

| # | 文件 | 面 | 改前 | 预计改后 | Δ |
|---|---|---|---|---|---|
| 1 | `thincoder-core/agent-tools/spawn-gates.mjs` | 产品码 | 138 | 170 | +32 |
| 2 | `thincoder-core/agent-tools/subagent.mjs` | 产品码 | 421 | 422 | +1 |
| 3 | `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品码 | 421 | 419 | −2 |
| 4 | `thincoder-core/permission.mjs` | 产品码（人审预览面） | 132 | 132 | 0 |
| 5 | `thincoder-core/agent/family-tools.mjs` | 产品码 | 203 | 203 | 0 |
| 6 | `thincoder-core/tool-docs/subagent.md` | 产品码（描述面） | 38 | 39 | +1 |
| 7 | `thincoder-core/prompts/persona-engineering.md` | EN 运行面 | 227 | 227 | 0 |
| 8 | `thincoder-core/prompts/discipline-normal.md` | EN 运行面 | 263 | 263 | 0 |
| 9 | `docs/core/design/prompts/persona-engineering.md` | CN 正本（已落） | 235 | 235 | 0 |
| 10 | `docs/core/design/prompts/discipline-normal.md` | CN 正本（已落） | 257 | 257 | 0 |
| 11 | `bench/probe/data.mjs` | 产品码（bench） | 215 | 216 | +1 |
| 12 | `bench/check/probe-frozen.mjs` | 产品码（bench） | 106 | 106 | 0 |
| 13 | `bench/check/probe.check.mjs` | 产品码（bench 自检） | 285 | 305 | +20 |
| 14 | `bench/probe/driver.mjs` | 产品码（bench） | 266 | 266 | 0 |
| 15 | `bench/probe.mjs` | 产品码（bench） | 310 | 310 | 0 |
| 16 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档（已落） | 680 | 680 | 0 |
| 17 | `docs/core/design/ENGINEERING-MODE-V2.md` | 设计档（已落） | 525 | 525 | 0 |
| 18 | `docs/core/design/MODEL-BENCH.md` | 设计档（已落） | 1749 | 1749 | 0 |
| 19 | `docs/core/design/API-CONTRACT.md` | 生成面 | 4436 | 重生成 | ~0 |

**计数对账（19 行）= 16 档有改动 + 3 档零改**：

- 有改动 16 = Δ≠0 共 6 档（#1 +32 · #2 +1 · #3 −2 · #6 +1 · #11 +1 · #13 +20）+ Δ 0 共 9 档（#4 #5 #7 #8 #9 #10 #16 #17 #18）+ 重生成 1 档（#19）。
- 零改 3 档 = #12 `probe-frozen.mjs` · #14 `probe/driver.mjs` · #15 `bench/probe.mjs`。
- **2.11④ 的「15 档 / 18 行」作废**：+ `permission.mjs` ⇒ **16 档 / 19 行**（2.11④ 的分面拆分同步 +1：产品码 7 → **8**）。

#### 2.12.9 AC / 用例 / 自查（替换 2.6 与 2.7 的对应行）

**2.6 验收表增一行（AC-1..AC-10 不变）**：

| # | 判据 | 达成方式（可机检） | 回指 |
|---|---|---|---|
| AC-11 | 三处承重句/面在位：① 权限预览含第五项段 ② 两条内部 explore 通道描述各含任务书契约句（含 `scope`） ③ 参数骨架含非工程角色示例行 | `bench/check/probe.check.mjs` 的 AC-11 块三条断言（见 2.12.5）；`node bench/check/run.mjs` 全绿即全部在位 | 2.12.1 / 2.3.4(b) / 2.3.5 |

**AC-8 修正句**：比对对象 = `tool-docs/subagent.md:23` ↔ `AGENT-LOOP-SUBAGENT.md:664`（逐字全等），**比对时点 = 2.3.4(a) 落地后**。

**2.7 用例表增一行（11 → 12 行）**：

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| 12 | 正常 | `formatPermission("subagent", {action:"spawn", role:"eng-designer", + 五项参数})` | 预览文本含 `Design points & forbidden scope:`（role 未传 ⇒ 缺该段） |

**三条机检自查（写后重读，逐项对账）**：

1. **引用集 ↔ 标题集**：本节引用的编号 2.12.1 – 2.12.9 全部为本节实有标题；跨节引用只指向上文实有标题（2.3.2(d) / 2.3.4(a) / 2.3.4(b) / 2.3.5 / 2.5 / 2.6 / 2.7 / 2.10 / 2.11④）。
2. **表行数 ↔ 汇总数**：2.12.8 表 = **19 行**，与标题「19 行」及下方对账 16 + 3 = 19 相等；2.7 表由 11 行增到 **12 行**；AC 由 10 条增到 **11 条**。
3. **断言 ↔ 实测**：本节引用的现盘行数（132 / 263 / 227 / 421 / 421 / 138 / 203 / 38 / 215 / 266 / 285 / 680 / 525 / 1749 / 235 / 257 / 4436）全部为本轮新进程实测读数（`split("\n")` 去末元素），非记忆值；「预计改后」列是 Δ 算术，标「预计」，由实施轮实测复核。

**本节边界**：不新增需求条目；不改机制本体、不改需求档（2.10 = 主 agent 笔，本节只补清单）、不改引擎判据；除 AC-11 的三条断言外不新增判据。

#### 2.12.10 2.12.5 第 2 条断言的正则（最终形 · 以本行为准）

`/The spawn carries the five task-book parameters[^\n]*scope[^\n]*a task-only spawn is refused/g`——`scope` 两侧的反引号不进模式（匹配不依赖引用风格），命中数仍 **= 2**；`probe.check.mjs` 预计改后仍为 **305**（同一行内改，Δ 不变）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审（独立评审子代理 · 判性对象 = 批档 §2 + 需求档 SPEC-DELEGATION + 设计档 AGENT-LOOP-SUBAGENT）**

| # | 类 | 严重度 | 问题 | 改法 |
|---|----|--------|------|------|
| 1 | 可行性 / 影响面完整 | 🔴 | `composeTaskBookBrief` 签名加 `role` 后，`thincoder-core/permission.mjs:38`（`cap(composeTaskBookBrief(args) \|\| args.task \|\| "", 500)`）传的是 `args` 一个实参 ⇒ 形参 `role` = `undefined` ⇒ `fifthClassOf(undefined)` = plain ⇒ **工程角色 spawn 的权限预览静默丢掉 `designPoints` 段**（人审面失真）。批档 `:219` 明写「拼装单点不变（子代理 input / batchDoc 观测 / 权限预览 / 探针判官同源）」，与该调用点在改后不成立；`:114` 勘察证据已把 `permission.mjs:38` 列为「拼装消费点」，但 2.3 / 2.5 全表（`:359-378`）无此档，无一行处置 | 2.5 加一行 `thincoder-core/permission.mjs`（现盘 133 行）并在 2.3 补改法：`:38` → `composeTaskBookBrief(args, args.role)`；或给 `composeTaskBookBrief(args, role = args?.role)` 加默认回退并在 2.3.1(f) 登记该默认；同时补一条 AC（预览文本含 `Design points & forbidden scope:`） |
| 2 | 清晰度 / 可复算 | 🟡 | EN `thincoder-core/prompts/discipline-normal.md` 的 263 → 264（Δ +1）无法由给定改法复算：`:323` 只给**一条**替换串（落在 `:210`），却记「→ 两行 / +1」；理由「原行同时承载 `acceptance` 前序位置」与盘面不符——`:210` 是独立 `designPoints` 行，`acceptance` 在 `:211`；CN 同档同一改动为 Δ 0（`docs/core/design/prompts/discipline-normal.md:203-210`，档 257 行不变）⇒ 实施轮会落 263 或自造一行 | 或补出第二行的字面并说明其位置，或把该行改回 263 → 263（Δ 0）并与 CN 档对位；同步改 2.3.6 的该项说明 |
| 3 | 需求覆盖 / 文档状态 | 🟡 | 需求档「`round` 必带集合」与设计不一致且本批未登记：`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md:7`「任务书必须带齐**五个结构化参数 + `round`**」与 `:14`「**`round`（初始 / 修复）**——派单必带」均未按角色收窄，而设计 AC-5 保持 `round` 仅 eng 角色（`:274`）。本批需求源即该档（`:87`），其 2.10 随正清单（`:437-438`）只开 `ENGINEERING-MODE-V2.md:430/:433`，未含此二行 | 2.10 增列 SPEC `:7` / `:14` 的收窄改写（`round` = eng-coder / eng-designer 必带），并把 `ENGINEERING-MODE-V2.md:12`（「五个结构化参数 + `round`」）一并列入随正清单 |
| 4 | 单源（D2） | 🟡 | `bench/probe/data.mjs` 新增 `PROBE_FIXTURE_ROLE = "eng-designer"`（`:382`）与 `bench/probe/driver.mjs:25` 的 `PROBE_ROLE` 是同一角色的两份手写字面——夹具名集靠 `taskBookParamsFor(PROBE_FIXTURE_ROLE)` 取、实际 spawn 靠 `PROBE_ROLE` 取，两者一旦漂移则夹具键集与门判据静默错位（KD-C6 的「跨版本严格可比」随之失真），而现有断言无一比对二者 | 改为 `import { PROBE_ROLE } from "./driver.mjs"`（driver 不 import data，无环；读面不受影响），或在 `probe.check.mjs` 加一条 `assert.equal(PROBE_FIXTURE_ROLE, PROBE_ROLE)` 并在该档登记 |
| 5 | 验收标准覆盖 | 🟡 | 两处承重改动没有机检项：⑤ `agent/family-tools.mjs:128-129` 的描述句（KD-C4 自称「不带这句，两条内部通道当场死掉」，批档 `:300`）与 2.3.4(b) 新增的非工程参数骨架行（`:290`）——AC-1/3 只验门行为、AC-8 只验 `tool-docs:23` 与设计档等值，删掉这两句所有 AC 仍绿 | 在 AC-8 或新开 AC 中加两条 grep 断言：`family-tools.mjs` 两档描述各含 `scope` 与「a task-only spawn is refused」；`tool-docs/subagent.md` 含 `role="explore"` 骨架行 |
| 6 | 引用准确性 | 🔵 | 「描述正本」的行号偏一：批档 `:284` / `:335` / `:400`（AC-8）把设计档描述句记为 `AGENT-LOOP-SUBAGENT.md:663`，实盘 `:663` 是代码块围栏、正文在 `:664`；AC-8 的 `node -e` 两串比对若照 `:663` 取会取到围栏行。另 `tool-docs/subagent.md:23` 现盘仍是改前旧字面（与 `:664` 不等值） | 行号改 `:664`；AC-8 明记「落地后（2.3.4(a) 完成后）比对」，避免被当成现状检查 |
| 7 | 清晰度（代码面残句） | 🔵 | `subagent.mjs:225` 的注记「（工程角色另有五项必带门 = spawn-gates.validateTaskBookParams，落 buildSpawnChild。）」在 C 下变成假陈述（该门覆盖所有 spawn 角色），2.3.2(d) 只改 `:226` 代码与文案、未含此注记 | 把 `:225` 注记纳入 2.3.2(d) 的改写范围（行数不变） |

**计数**：🔴 1 · 🟡 4 · 🔵 2。**VERDICT: changes-required**

### 轮次 2（评审子代理）

**设计评审轮 2（独立评审子代理 · 验证 §2.12 的 7 条修复 + 复查）**

| # | Orig# | 文件 | 严重度 | 状态 | 说明 |
|---|-------|------|--------|------|------|
| 1 | 1 | thincoder-core/permission.mjs · 批档 §2.12.1 | 🔴 | Fixed | §2.12.1 登记 `:38` → `composeTaskBookBrief(args, args.role)`（行内改 Δ 0）；2.12.8 表第 4 行 `permission.mjs 132 / 132 / 0` 在位；AC-11 第 1 条断言可满足且改前必红——标签实盘 = `spawn-gates.mjs:59` `  designPoints: "Design points & forbidden scope",`。非 spawn 动作（escalate 不带 `scope`/`designPoints`）拼装逐字不变，语义边界成立。选显式传参而非默认回退的 4 条理由成立（默认形参只是把「漏传实参」换成「args 无 role」，同一失效模式换入口）。 |
| 2 | 2 | thincoder-core/prompts/discipline-normal.md | 🟡 | Fixed | §2.12.2 撤回「两行 /+1」，改 263 → 263 单行替换；盘面确证原理由不成立：`:210` = `  **\`designPoints\`** (design points & forbidden scope)`、`:211` 才是 acceptance。替换串实测 273 字符 < lineWidth 300，与 CN 档 `:207` 的 Δ 0 对位，2.12.8 行 8 = 263/263/0 自洽。 |
| 3 | 3 | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md | 🟡 | Fixed | 需求源已收窄并落盘：`:7` = `委派治理的**结构承载**：任务书必须带齐**四项核心 + 第五项按角色**（工程角色 = \`designPoints\` ∥ 其它 = \`scope\`），\`round\` 仅 eng-coder / eng-designer 必带`；`:14` = `- **\`round\`（初始 / 修复）**——**eng-coder / eng-designer 必带**；explore / plan / coder 不带轮次语义`。§2.12.3 另把 `ENGINEERING-MODE-V2.md:12` 列入清单，该行已落 C 形。 |
| 4 | 4 | bench/probe/data.mjs | 🟡 | Fixed | §2.12.4 取消 `PROBE_FIXTURE_ROLE`，改 `import { PROBE_ROLE } from "./driver.mjs"`（+1 ⇒ 215→216）。无环成立：`driver.mjs:10-23` 的 import 集合不含 data.mjs；`driver.mjs:25` = `export const PROBE_ROLE = "eng-designer"`。data.mjs 消费者只有 `probe.check.mjs:15` 与 `bench/probe.mjs:22`，与 2.12.4 记载一致。 |
| 5 | 5 | bench/check/probe.check.mjs · agent/family-tools.mjs | 🟡 | Fixed | §2.12.5 / 2.12.10 新开 AC-11 三条断言，覆盖两处承重句：① 权限预览 ② family-tools 两条描述各含契约句（正则 `[^\n]*scope[^\n]*` 与 2.3.5 句序一致，命中 2 可达）③ `tool-docs/subagent.md` 含 `subagent(role="explore"`。字符面预算自洽：`probe.check.mjs:10` 现无 `readFileSync`（加名 0 行），新增 import 1 行 + check() 块 8 行 + 空行 1 行 = +10。 |
| 6 | 6 | docs/core/design/AGENT-LOOP-SUBAGENT.md | 🔵 | Fixed | §2.12.6 把描述正本坐标改指 `:664`（现盘 `:663` = 代码块围栏、`:664` = 描述正文），并记 AC-8 比对时点在 2.3.4(a) 落地后——现盘 `tool-docs/subagent.md:23` 仍是旧字面（`Task book (eng-coder / eng-designer spawns): five structured parameters …`），改前比对必红，记载正确。 |
| 7 | 7 | thincoder-core/agent-tools/subagent.mjs | 🔵 | Fixed | §2.12.7 把 `:224-225` 注记纳入改写；改前字面与现盘逐字一致（`:225` = `    // （工程角色另有五项必带门 = spawn-gates.validateTaskBookParams，落 buildSpawnChild。）`），Δ 0。 |
| 8 | (new) | 批档 §2.2 / §2.3.8 引用的 AGENT-LOOP-SUBAGENT.md 坐标 | 🔵 | New：§6.22 / §6.29.3 / §6.30 余 8 处坐标仍差一行 | 根因 = 2.11 ② 在 `:246` 拆行（+1）后全档下游坐标各后移一行；2.12.6 只修了描述句一处，并把成因记作「围栏 vs 正文」。现盘实读：门序 = `:249`（设计记 `:248`）· F2 = `:254`（记 `:253`）· 落点 = `:258`（记 `:257`）· D2 = `:259`（记 `:258`）· AC-M5-2 = `:266`（记 `:265`）· §6.29.3 扫描对象句 = `:641`（记 `:640`）· KD-TF1 = `:675`（记 `:674`）· KD-TF3 = `:677`（记 `:676`）。建议 2.2 / 2.3.8 坐标整体 +1，并注明根因 = 2.11② 拆行。 |
| 9 | (new) | docs/core/requirements/ENGINEERING-MODE-V2.md | 🟡 | New：2.10 随正两行未落盘（主 agent 笔 · 已登记 · 非阻塞） | 现盘 `:430` 仍为 `派单任务书五项 = 结构化 spawn 参数（\`goal\`/\`knownFacts\`/\`designPoints\`/\`acceptance\`/\`reportFormat\`——缺任一即拒）`、`:433` 仍为 `机械门按 \`TASK_BOOK_PARAMS\` 逐项判存在 / 类型 / 非空——不读内容。`——C 下前者对 explore/plan/coder 为假、后者名集已由数组变对象。两行已由 2.10 登记待改；层间冲突按「设计 > 需求」以设计档 §6.22 + SPEC §2 为准，实施轮需求源 = SPEC，故列会办、不阻塞。 |

**计数**：Fixed 7（原 🔴 1 已闭）· New 2（🔵 1 · 🟡 1）· 未决 🔴 0 · 开放 🟡 1 · 开放 🔵 1。

**VERDICT: pass**

## §4 用户批准（主 agent）

**用户授权（2026-10-18 16:33 / 16:35 / 16:36 / 16:42）**

- **16:33 逐字**：「为什么只是 eng-coder 和 eng-designer 改了参数结构化，别的没改？」
- **16:35 逐字**：「A/B/C 哪一种能够提供最好的结果？」
- **16:36 逐字**：「B，好，开始吧。」
- **16:42 逐字**：「那先按C跑试试。」（看完父侧举的 `explore` 例子后改判 C）

**方案改判轨迹**：B（一套通吃）→ 用户指出 `designPoints` 对非工程角色是硬套 → 父侧承认论证漏洞 → **C**（四项核心所有角色 + 第五项按角色命名）。

**评审轨迹**

| 轮 | 结果 | 处置 |
|---|---|---|
| 轮次 1（`advisor#8`） | **changes-required**（🔴 1 · 🟡 4 · 🔵 2） | 7 条全收 → `#10` 修正轮 |
| 复审（`advisor#12`） | **pass**（旧 7 条全闭合 · 新 2 条均 advisory） | 无阻塞项 |

**旧 🔴 的处置**（`permission.mjs:38` 漏改）：§2.12.1 登记 `:38` → `composeTaskBookBrief(args, args.role)`（行内改 Δ 0）；2.12.8 表新增第 4 行（132 / 132 / 0）；AC-11 第 1 条断言权限预览含 `Design points & forbidden scope:`（改前必红——标签实盘 = `spawn-gates.mjs:59`）。**选显式传参而非默认回退**，理由 = 默认形把「漏传实参」换成「args 无 role」，同一失效模式换入口。

**父侧终验（本刻实读）**

- 需求源已收窄并落盘：`SPEC-DELEGATION.md:7`（四项核心 + 第五项按角色 · `round` 仅 eng 两角色）· `:14`（eng 必带；explore / plan / coder 不带轮次语义）· `requirements/ENGINEERING-MODE-V2.md:12`（C 形）
- `EN discipline-normal.md:210` = `**\`designPoints\`** (design points & forbidden scope)`（设计要改的那行，与盘一致）· 档 263 行
- 全仓 `doc_check`（新进程直跑）= 0 命中

**残余（advisory · 非阻塞）**

| 项 | 内容 |
|---|---|
| 2.10 随正两行 | `requirements/ENGINEERING-MODE-V2.md:430` / `:433` 仍为 C 前措辞——主 agent 笔，随本批实施同拍落 |
| 坐标余 8 处 | §2.2 / §2.3.8 引用的 `AGENT-LOOP-SUBAGENT.md` 坐标整体差一行（2.11② 拆行的下游效应）——实施轮随正 |

**未批准项 = 无。**

## §5 实施记录（eng-coder）
**状态行**：实施完成（C 形态落地 · 19 行表逐行对上 · bench 118/0 · doc_check 0 命中 · 审计 CLEAN · 代码评审 pass（0 阻断））


**交付摘要**

按批档 §2（判据源 = §2.12，冲突处一律以 §2.12 字面为准）落地 C 形态：**四项核心**（`goal` / `knownFacts` / `acceptance` / `reportFormat`）对**所有 spawn 角色**必带 + **第五项按角色命名**（工程角色 = `designPoints` ∥ explore / plan / coder = `scope`）。名集单源 = `TASK_BOOK_PARAMS = { core, fifth }` + `taskBookParamsFor(role)` 派生；门在 `buildSpawnChild` 无条件调用；拼装 / 权限预览 / 批档观测 / 探针夹具一律按角色取名集（不再有第二个手写名单）。

**逐档改动（16 档有改动 + 3 档零改 = 2.12.8 表 19 行 · 行数 = split("\\n") 去末元素）**

| # | 档 | 面 | 改前 → 实测 | 落点（关键行） |
|---|---|---|---|---|
| 1 | `thincoder-core/agent-tools/spawn-gates.mjs` | 产品码 | 138 → **170** | `:4` 头注 · `:17-30` 样例（`TASK_BOOK_CORE_MIN` / `ENG_TASK_BOOK_MIN` / `PLAIN_TASK_BOOK_MIN`）· `:59-62` `TASK_BOOK_PARAMS = { core, fifth }` · `:66-68` `fifthClassOf` · `:72-75` `taskBookParamsFor` · `:82` `scope` 标签 · `:93-115` `validateTaskBookParams(args, role)` · `:119-127` `composeTaskBookBrief(args, role)` |
| 2 | `thincoder-core/agent-tools/subagent.mjs` | 产品码 | 421 → **422** | `:142` task 描述改「可选补充 + task-only 拒」· `:153-158` 四条核心改 `every spawn role` + 新增 `scope` + 两条第五项互指 `never substitutes` · `:225-226` 注记改写（§2.12.7）· `:227-228` 载体判据传 `args.role` + 新文案 |
| 3 | `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品码 | 421 → **419** | `:41-43` `taskBriefOf(args, role)` · `:222` / `:355` 两个调用点 · `:233-238` 门：`round` 仍只在 eng 分支 + `validateTaskBookParams(args, role)` 无条件 |
| 4 | `thincoder-core/permission.mjs` | 产品码（人审预览） | 132 → **132** | `:38` `composeTaskBookBrief(args, args.role)`（旧 🔴 落点；无默认回退，理由照 §2.12.1） |
| 5 | `thincoder-core/agent/family-tools.mjs` | 产品码 | 203 → **203** | `:128` / `:129` 两条内部 explore 通道描述各追加一句 `The spawn carries the five task-book parameters (four core: … + \`scope\`); a task-only spawn is refused.` |
| 6 | `thincoder-core/tool-docs/subagent.md` | 产品码（描述面） | 38 → **39** | `:23` 整行替换（与设计档 `:664` 逐字全等，两侧 757 字符）· `:27` 新增 explore 参数骨架行 |
| 7 | `thincoder-core/prompts/persona-engineering.md` | EN 运行面 | 227 → **227** | `:158` / `:160` / `:163` / `:167` 行内改写 |
| 8 | `thincoder-core/prompts/discipline-normal.md` | EN 运行面 | 263 → **263** | `:206` / `:208` / `:210` / `:213` 行内改写（§2.12.2 口径：`:210` 单行换，Δ 0） |
| 9 | `docs/core/design/prompts/persona-engineering.md` | CN 正本（设计者已落） | 235 → 235 | `:162` / `:164` / `:167` / `:171` 核为 C 形 |
| 10 | `docs/core/design/prompts/discipline-normal.md` | CN 正本（设计者已落） | 257 → 257 | `:203` / `:205` / `:207` / `:210` 核为 C 形 |
| 11 | `bench/probe/data.mjs` | 产品码（bench） | 215 → **216** | `:10-11` import `taskBookParamsFor` + `PROBE_ROLE`（§2.12.4：不新增 `PROBE_FIXTURE_ROLE`）· `:117` / `:121` / `:146` 消费 `PROBE_ROLE`；夹具字面零改 |
| 12 | `bench/check/probe-frozen.mjs` | 产品码（bench） | 106 → 106 | 零改（两层逐字等值保持） |
| 13 | `bench/check/probe.check.mjs` | 产品码（bench 自检） | 285 → **305** | `:10` 加 `readFileSync` · `:17-18` 导入 `PLAIN_TASK_BOOK_MIN` / `taskBookParamsFor` / `formatPermission` · `:81-84` 样例同构四条 · `:123-135` 按角色两组门断言 + 跨角色误填两条（含指路句）· `:139-146` AC-11 三条断言 |
| 14 | `bench/probe/driver.mjs` | 产品码（bench） | 266 → 266 | 零改 |
| 15 | `bench/probe.mjs` | 产品码（bench） | 310 → 310 | 零改 |
| 16 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档（已落） | 680 → 680 | §6.22 `:246-266` · §6.30 `:664` · §6.29.3 `:641` 核为 C 形 |
| 17 | `docs/core/design/ENGINEERING-MODE-V2.md` | 设计档（已落） | 525 → 525 | `:68` / `:265` 核为 C 形 |
| 18 | `docs/core/design/MODEL-BENCH.md` | 设计档（已落） | 1749 → 1749 | `:1346` / `:1368` 核为 C 形 |
| 19 | `docs/core/design/API-CONTRACT.md` | 生成面 | 4436 → 重生成 | `node scripts/api-contract.mjs --write` → `--check` exit 0；新增 `PLAIN_TASK_BOOK_MIN`（`:30`）/ `taskBookParamsFor`（`:72`），spawn-gates 导出行号随动（15 / 27 / 37 / 59 / 93 / 119 / 156） |

**AC-1..AC-11 实测读数**

| AC | 读数 |
|---|---|
| AC-1 | 工程角色（eng-coder / eng-designer）名集 = 四项核心 + `designPoints`；逐参（缺 / 全空白 / 非字符串）均拒且点名该参数 —— 直接调用实测 2 角色 × 5 参 × 3 态全拒；`probe.check.mjs:128-131` 常驻断言 |
| AC-2 | explore / plan / coder 名集 = 四项核心 + `scope`；逐参三态全拒并点名；三角色名集相等（`probe.check.mjs:83-84` 断言） |
| AC-3 | 跨角色误填仍拒（两条反例实测）：`eng-coder` 只给 `scope` ⇒ `designPoints — missing … (got scope instead — that name belongs to the explore/plan/coder spawns)`；`explore` 只给 `designPoints` ⇒ `scope — missing … (got designPoints instead — …)`。反向（误填名额外同传）放行、拼装只取本角色名集 |
| AC-4 | 核心四项数组字面全仓唯一（`spawn-gates.mjs:60` 1 处）；第五项名集对象字面唯一（`:61` 1 处）；`taskBookParamsFor` 17 处 / 3 档（定义 + 校验 + 拼装 + 批档观测 + 权限预览 + 夹具 + 自检）；旧形单参调用（`composeTaskBookBrief(args)` / `validateTaskBookParams(x)`）全仓 0 命中 |
| AC-5 | `buildSpawnChild(` 全仓 = 1 定义（`subagent-spawn.mjs:198`）+ 2 调用（`subagent.mjs:287` / `bench/probe/driver.mjs:99`）；escalate 执行器档不含该符号；`round` 仍只在 `role === "eng-coder" || role === "eng-designer"` 分支（`:237`） |
| AC-6 | `doc_check`（新进程 · report · 仓根）= **0 条命中**（锚 0 · 行宽 0 · 212 档）；gate 模式对本批 6 个文档档 = **DOC-CHECK GATE: PASS**（0 命中） |
| AC-7 | `node bench/check/run.mjs` = **118 passed / 0 failed**（基线 117 + 1 = 新增 AC-11 check） |
| AC-8 | `tool-docs/subagent.md:23` 与 `AGENT-LOOP-SUBAGENT.md:664` **逐字相等**（757/757 字符）；schema 六条描述：四条核心 `REQUIRED for every spawn role`、两名第五项互指 `never substitutes for this one` |
| AC-9 | EN 两档 + CN 两档各含「四项核心 / four core」「第五项按角色 / The fifth parameter is named by role」「所有 spawn 角色 / Every spawn role」三句；旧句 `five = structured spawn parameters` / `五项 = spawn 结构化参数` 四档 0 命中 |
| AC-10 | `node scripts/api-contract.mjs --check` = `OK(api-contract): 骨架零漂移（4335 条 · 860 档）` exit 0；设计档 §6.22 / §6.30 / §6.29.3 已在 C 形 |
| AC-11 | `probe.check.mjs:139-146` 三条：权限预览含 `Design points & forbidden scope:`（反例：role 未传 ⇒ 缺该段）；`family-tools.mjs` 契约句正则命中数 = 2；`tool-docs` 含 `subagent(role="explore"` |

**验证命令与结果**

- `node bench/check/run.mjs` → 118 passed / 0 failed（exit 0）
- `node scripts/api-contract.mjs --check` → OK（exit 0）
- `runDocCheck(repo, {mode:"report"})` → 命中 0 / 212 档；`{mode:"gate", docs:[6 档]}` → PASS
- `node --check` × 7 个改动 `.mjs` → 全 Syntax OK

**决策透明表**

| # | 取舍 | 依据 | 偏离（有 / 无） |
|---|---|---|---|
| D-1 | 名集 `{ core, fifth }` + 派生函数；样例对象拆核心一份 + 两角色各一份 | §2.3.1(b)(c) / KD-C1 | 无 |
| D-2 | 判据仍三条（存在 ∧ string ∧ trim 非空）；跨角色指路只进文案 | §2.3.1(e) / KD-C7 / 禁止项「不加新判据」 | 无 |
| D-3 | `composeTaskBookBrief(args, role)` 无默认回退；`permission.mjs` 显式传 `args.role` | §2.12.1（4 条理由） | 无 |
| D-4 | `round` 语义零改；`escalate` 零触；`files` 零触 | §2.3.3 / AC-5 | 无 |
| D-5 | 夹具字面零改、`PROBE_VERSION` 仍 2、`probe-frozen` / `driver` / `probe.mjs` 零改 | §2.12.4 / KD-C6 | 无 |
| D-6 | 需求档 `ENGINEERING-MODE-V2.md:430/:433` 与 `SPEC` 收窄未动 | §2.10 = 主 agent 笔（§4 残余表） | 未改（见「上抛·知会」） |

**审计与代码评审轮次（终态 = clean）**

| 轮 | 角色 | 范围 | 结论 |
|---|---|---|---|
| 1 | 内部探查审计（explore · 只读） | 批档 §2/§2.12 + 10 个改动档 + 设计档三处 + CN 两档 | **CLEAN**：四类偏差 0（PARTIAL 0 · SILENT-SIMPLIFICATION 0 · DOC-DRIFT 0 · OUT-OF-LIST 0）；建议 2 条（§5 空 → 本轮已补；未知角色窄形文案顺序 → 记「上抛·知会」）；AC-6 / AC-7 其只读工具面无法复跑（本席实跑读数见上） |
| 2 | 内部代码评审（advisor · code） | 10 个送审档 + 批档 + 需求档 + 设计档 | **VERDICT: pass**：0 🔴 · 2 🟡（均可选，reported-not-fixed）· 4 🔵。其中「`subagent.mjs` 实测 423 行、超表 1 行」一条经本席复测**驳回**：按项目口径（`split("\\n")` 去末元素）= **422**，423 是含末尾换行元素的读法；未改码 |

**评审项处置（逐条）**

| 评审项 | 处置 | 证据 |
|---|---|---|
| 🟡 门序行（`AGENT-LOOP-SUBAGENT.md:249`）把 files 面列在 token 门之后 | **报告不改**（设计档笔，非实施面）：实测 files 面在 `prepareScheduling`（`subagent.mjs:281`）内先于 `buildSpawnChild`（`:287`）跑 | `subagent-scheduler.mjs:64` 调 `rejectEngineeringFilePaths` |
| 🟡 §5 空、AC-6/AC-7 无记录 | **本轮已补**（即本段） | 本段读数 + 命令 |
| 🔵 逐参断言判别力（`probe.check.mjs:130` 的 `new RegExp(name)`） | **报告不改**：设计 `2.6` AC-1 行逐字钉的是 `assert.throws(… /<param>/)`，收紧即偏离设计字面 | 设计档 §2.6 AC-1 行 |
| 🔵 `PLAIN_TASK_BOOK_MIN` 样例内容只成立在读角色（`scope` 写「不写任何文件」） | **报告不改**：样例字面由 §2.3.1(b) 钉死；照抄到 coder 需自写 `scope` | `spawn-gates.mjs:29-30` |
| 🔵 「工程角色」谓词手写两份（`fifthClassOf` ∥ `subagent-spawn.mjs:237`） | **报告不改**：§2.1 明写沿用同一角色集合、不新造分类词 | `spawn-gates.mjs:67` / `subagent-spawn.mjs:237` |
| 🔵 `subagent.mjs` 423 行 | **驳回**（复测 422 行） | 见上表 |

**上抛项**

- `[上抛·知会]` **未知角色窄形**：`role:"Coder"` + 只带工程五参 + 无 `task` 时，拒绝来自 `subagent.mjs:227`（载体判据按 plain 名集拼装为空）而非 `:242` 的 ROLES 门。两条路都 fail-closed，且 §2.3.2(d) 明写该判据只兜「全空 + 未知角色」；仅设计 §2.7 用例 10 的括注在窄形下不精确。未改码（移动判据次序 = 未批准的改序）。
- `[上抛·知会]` **设计档门序行**：`AGENT-LOOP-SUBAGENT.md:249` 的 files 面次序与实测相反（详见评审项处置）。属设计档笔，本轮未动。
- `[上抛·知会]` **需求档未随正**：`docs/core/requirements/ENGINEERING-MODE-V2.md:430` / `:433` 仍为 C 前措辞（§2.10 = 主 agent 笔；§4 已登记为 advisory 残余）。

**坐标余 8 处随正（评审轮 2 #8 · 实读）**

`AGENT-LOOP-SUBAGENT.md`：§6.22 门序 `:249`（设计记 `:248`）· F2 `:254`（`:253`）· 落点 `:258`（`:257`）· D2 `:259`（`:258`）· AC-M5-2 `:266`（`:265`）· §6.29.3 `:641`（`:640`）· KD-TF1 `:675`（`:674`）· KD-TF3 `:677`（`:676`）。根因 = §2.11② 在 `:246` 拆行（+1）。描述正本 `:664` 已对上（与 `tool-docs:23` 逐字相等）。

**自查**

- 逐档行数与 §2.12.8 表 19 行**逐行相符**（18 个数值 + 1 个重生成）。
- 全仓 0 命中：`TASK_BOOK_PARAMS.map|join|includes|length`、`[...TASK_BOOK_PARAMS]`、`composeTaskBookBrief(args)`（单参）、`validateTaskBookParams(x)`（单参）、`taskBriefOf(args)`（单参）。
- 写后重读：`spawn-gates` 头注 / `taskBriefOf` 注释 / `subagent.mjs:225-226` 注记均已随新语义改写，无残留旧句、无调试代码。
- 设计档漂移：本轮**未新增**模块表 / 受影响文件表漂移（19 行表逐行对上）；评审项 2 的门序行漂移已报父侧。

## §6 验证与收口（父代理）

### 一、本批交付（C 方案）

任务书参数从「五项 · 仅 eng 角色」改为 **四项核心（所有 spawn 角色）+ 第五项按角色**（工程角色 = `designPoints` ∥ explore / plan / coder = `scope`）；`task` 退为所有角色的可选补充（task-only spawn 被拒）；名集单源 = `TASK_BOOK_PARAMS = { core, fifth }` + `taskBookParamsFor(role)` 派生。

### 二、父侧亲验读数（2026-10-18 17:3x · 全部本席实跑）

| 判据 | 读数 |
|---|---|
| 名集结构 | `spawn-gates.mjs` **170 行**；`TASK_BOOK_PARAMS = { core: [四项], fifth: { engineering: "designPoints", plain: "scope" } }` 在盘 |
| **跨角色误填反例** | eng 只给 `scope` ⇒ **THROW**（点名 `designPoints — missing … got scope instead`）；explore 只给 `designPoints` ⇒ **THROW**（点名 `scope — missing`）——**两第五项不互相顶替** ✓ |
| 正向 | eng + `designPoints` ⇒ PASS；explore + `scope` ⇒ PASS；拼装首段 = `Goal & why: …` |
| D2 逐字全等 | `tool-docs/subagent.md:23` ↔ `AGENT-LOOP-SUBAGENT.md:664` = **757/757 字符全等 True** |
| 旧 🔴 落点 | `permission.mjs:38` = `composeTaskBookBrief(args, args.role)`（显式传参，权限预览第五项段恢复） |
| bench | `node bench/check/run.mjs` = **118 passed / 0 failed / exit 0**（基线 117 + AC-11 新 check 1 条） |
| 19 档行数 | 与 §2.12.8 预测**逐档 ±0**（`#13` 表 + 父侧抽验 `spawn-gates` 170 / `tool-docs` 39） |
| doc_check | 新进程 report = 212 档 0 命中；gate（本批 6 档）= PASS |

### 三、父侧直接执行（标记 · 可 revert）

| # | 改动 | 依据 |
|---|---|---|
| 1 | 需求档 `ENGINEERING-MODE-V2.md:430` / `:433` 两行改 C 形（四项核心 + 第五项按角色 + `round` 仅 eng） | §2.10 登记的主 agent 笔随正项；`#13` 交付时仍未落 ⇒ 本轮落 |

### 四、`#13` 上抛处置

| # | 上抛 | 裁定 |
|---|---|---|
| 1 | 未知角色 + 只带工程五参 + 无 `task` 时，拒绝来自 `subagent.mjs:227`（载体判据）而非 `:242` ROLES 门——两者都 fail-closed，§2.7 用例 10 括注在此窄形下不精确 | **接受**（fail-closed 语义无损；用例括注属批档记录面，不改设计） |
| 2 | 需求档 `:430`/`:433` 未落 | **已落**（上表 #1） |
| 3 | `API-CONTRACT.md` 重生成吸收了并行轮（doc-check-gate）的行号漂移 | **接受**（生成面整区重写是设计行为，`--check` exit 0） |

### 五、遗留

无。评审轮 2 的 8 处设计档坐标漂移已由 `#13` 实读更正并记 §5。

### 六、结论

C 方案全链落地：名集单源（core + fifth 两段，每名字手写一次）· 门按角色取集 · 跨角色顶替被拒 · 六个消费点全改齐（含 `permission.mjs` 那个差点漏掉的）· 提示词四档 + 描述面 + bench 夹具全随动。**「explore 填 designPoints」的硬套已消除——第五项的名字现在对每个角色都说真话。**

**状态行** → 已收口 2026-10-18
