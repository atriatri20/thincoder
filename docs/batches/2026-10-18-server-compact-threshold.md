# 2026-10-18 · server-compact-threshold
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 22:37「开」（承 22:36「#1673 怎么表述我不关心，我只关心最后的实现会是怎样」+ 22:33「我说的是上下文压缩那个问题」）。病根 = 服务面压缩阈值写死 100,000，核侧已改按模型窗口现算，两端随模型规模**反向漂移**；且 `ADMIN-AGENT.md` §17.3 A3 节标题写「取核——消跨端差异」而第 5 条写「阈值与核不同源」，同一节自相抵。。
> 台账 = #1673（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧）

**用户令**：2026-10-18 22:37「开」——承「#1673 怎么表述我不关心，我只关心最后的实现会是怎样」。

**病根（父侧实读，非推测）**：

| 事实 | 坐标 |
|---|---|
| 核侧阈值 = 按模型窗口现算 | `thincoder-core/config.mjs:191` `resolveCompactThreshold(explicit, modelOrProvider)`：`explicit != null` ⇒ 显式；否则 `requestBudget(provider).threshold` |
| 算式 | 同档 `:165`–`:183`：`threshold = min(usable, ⌊window × 0.8⌋)`，`usable = window − reserve`，`reserve` = **实际发出的 max_tokens**（不封顶） |
| 服务面阈值 = 写死常量 | `thincoder-server/src/agent/chat-compact.mjs:24` `DEFAULT_COMPACT_THRESHOLD = 100_000`；`:260` 缺省入参；唯一生产调用点 `thincoder-server/src/agent/chat.mjs:571` **不传 threshold** ⇒ 恒取 100,000 |
| 服务端**没有** `compactThreshold` 配置键 | `thincoder-server/` 全树 grep 该名 = 0（仅在 `chat-compact.mjs:23/:14` 的注释里出现） |
| 设计档自相抵 | `docs/server/design/agent/ADMIN-AGENT.md:629` 节标题「**A3 上下文压缩（取核——消跨端差异）**」∥ 同节 `:636`「**阈值与核不同源**：…服务面 = 固定 100,000、不随模型窗变化」 |

**行为实测（父侧新进程直跑 `requestBudget`）**：

```
{model:'deepseek-flash'}    → window 1,000,000 · reserve 384,000 · threshold 616,000
{model:'gpt-4o'}            → window   128,000 · reserve  16,000 · threshold 102,400
{model:'unknown-model-x'}   → window   128,000 · reserve  32,000 · threshold  96,000（缺省规格 + 控制台告警一行）
resolveCompactThreshold(undefined, {model:'deepseek-flash'}) → 616,000 auto
resolveCompactThreshold(700000, …)                          → 700,000 explicit
```

⇒ **服务面恒 100,000**：128K 级模型它压得**偏晚**（核 96,000 已压，它还在涨，有溢出风险面）；1M 级模型它压得**早得多**（核 616,000 才压，它在 10 万就砍掉大量仍可用的上下文）。**两端随模型规模反向漂移。**

**处置方向（父侧定的实现形，交设计席定形细节）**：

- 生产调用点改为**走核算式**：`resolveCompactThreshold(undefined, modelExit.provider)` ⇒ 按本会话在用模型算线；`chat-compact.mjs:260` 的缺省入参**保留**作为「调用方未传时」的兜底。
- **不新增配置项**（服务端现无该键；核心显式优先的语义由核函数自带，日后要加配置再连同界面一并做）。
- 缺口兜底已验：模型查不到 ⇒ 缺省规格 128K/32K ⇒ 96,000，**并有一条控制台告警**（不会出现阈值为 0 导致每轮压缩）。
- 设计档收正：`:629` 标题与 `:636` 二者只能留一个说法——接了核算式之后「消跨端差异」成立，`:636` 的「不同源」须改写为「同源（按在用模型现算）+ 兜底常量」。

**边界**：不动核的算式；不改压缩产物形态（标记行 / 原行保留 / 失败降级）；不改成员面 UI；不动 `requestBudget`。

**行为变更面（须在设计里写清）**：老会话阈值从 100,000 变为按模型算 ⇒ 128K 模型更早压、1M 模型更晚压。**压缩只影响后续回放视野**，已落库原文不动。

### 父侧补正（2026-10-18 22:49 · 对 `eng-designer#20` 观察项 7）

**§1 前文的坐标与判断已过期，以本段为准**：

| 前文位置 | 原写 | 现况 |
|---|---|---|
| `:21` | 「设计档**自相抵**：`:629` 标题 ∥ `:636` 不同源」 | **已不成立**——`:636` 已改为「阈值 = 按在用模型现算（与核同源）」，标题保留且名副其实。**这一条是发现时的病根记录，不是现存缺陷** |
| `:40` / `:37` | 落点 `:629` / `:635`–`:638` | 改动后**行号漂移**：标题 `:633`、第 5 条 `:639`–`:642`、§17.2 A3 行 `:620`（`eng-designer#20` 已随正批档 `:66`/`:67`/`:76`/`:118`） |

**父侧判定**：§1 是**讨论记录面**，保留当时判断不追改（它记的是「当时为什么开这一批」）；**现存事实以 §2 与设计档为准**。

**另记一条父侧复跑实证（支撑 #5 的结论）**：

```
git show v0.10.8-core:thincoder-core/config.mjs  →  COMPACT_RATIO = 0.6   （旧算式）
现盘 thincoder-core/config.mjs                   →  COMPACT_RATIO = 0.8   （现行）
git tag --contains 460fcbac                      →  空（该提交未进任何 tag）
```

⇒ **`^0.10.7` 装到 0.10.8 仍取旧算式**（`floor(usable × 0.6)`），本批在产线的阈值会静默为旧值，直到核发布含 `460fcbac` 的版本并把地板抬到该版本。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-18
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>


### 一、本批条目（覆盖 ∥ 不在本批）

| # | 条目 | 覆盖 |
|---|---|---|
| C1 | 服务面压缩阈值改取核算式（按在用模型现算） | ✅ 本批 |
| C2 | 兜底常量保留（调用方未传 ∥ 缺核 ∥ 取值失败） | ✅ 本批 |
| C3 | 设计档 §17.3 A3 标题与第 5 条收成一种说法 | ✅ 本批 |
| C4 | 行为变更面与回滚面写清（只影响后续回放视野） | ✅ 本批（§2 五 / 六） |
| N1 | 新增 `agent.compactThreshold` 配置项 | ❌ 不在本批（理由 = §2 三·④ 决策 D2） |
| N2 | 核侧算式 / 压缩产物形态 / 成员面 UI / EN 提示词 | ❌ 不动 |

### 二、设计档落点（已落笔，本席笔）

`docs/server/design/agent/ADMIN-AGENT.md`：

- `:620` §17.2「新增（3 面）」A3 行 —— 增 `@thincoder/core/config.mjs` `resolveCompactThreshold`（`:191`）——阈值；落点列增「阈值取数」。
- `:639`–`:642` §17.3 A3 第 5 条 —— 收口后逐字：

```
5. 失败链 = 进程内计数 ＋ 达 `COMPRESS_FAILURE_LIMIT`（= 3——取件 = `@thincoder/core/context.mjs`）⇒ 降级 `compressFallback`（确定性截断——同落标记行）；
   **阈值 = 按在用模型现算（与核同源）**：起跑段 `compactThresholdOf`（`chat-compact.mjs`）取数——会话外标经 §11.4 标识解析径解上游真名 ⇒ 核 `resolveCompactThreshold(undefined, { model })`（`@thincoder/core/config.mjs:191`；算式单源 = `CONTEXT-COMPACTION.md` §6.17，本档不复述）⇒ 传 `compactTurnHistory` 的 `threshold`。
   `DEFAULT_COMPACT_THRESHOLD`（`chat-compact.mjs:24` = 100,000）= **兜底**（调用方未传 ∥ 缺核 ∥ 取值失败——`compactTurnHistory` 缺省入参 `:260`）；模型名未登记 ⇒ 核缺省规格（128K/32K ⇒ 96,000）＋ 核一条告警（`model-specs.mjs:294`）——服务面不复述算式、不加第二条告警。
   生效面 = 后续回合起跑段；已落库原文 ∥ 既有标记行零动（回放按 `covers` 解析，与阈值无关）。
```

`:640`–`:642` 现为唯一说法（「与核同源」＋「兜底常量」），节标题（现 `:633`）「A3 上下文压缩（取核——消跨端差异）」保留——接核算式后该说法成立。

### 三、机制设计（8 项）

**① 方案与理由**

阈值取数从「服务端常量」改为「核现算」，且**模型标识先解上游真名**：

```
会话外标（chat.model：别名 ∥ provider/model）
  └─ §11.4 标识解析径（`providerAliasIndex(db).lookup`——实件 = `thincoder-server/src/gateway/providers.mjs:79`，形 = `createAliasIndex(listProviderEntries(db))`（`:80`）；与 A1 规格同一解析面）
       └─ 上游真名 ⇒ resolveCompactThreshold(undefined, { model })   ← 核单一入口（算式不外搬）
            └─ 阈值 ⇒ compactTurnHistory({ …, threshold })
```

理由逐条：

1. **单源**：算式、显式优先、缺省规格兜底全在核 `resolveCompactThreshold` 内；服务面只搬「模型是谁」，不搬「怎么算」。
2. **先解上游真名（偏离父侧字面坐标，本席定形）**：`buildChatExit` 携的 loopback 描述子 `model` = 会话**外标**（`chat.mjs:426` 实读 `model: ref`——注释「对外标识」），上游真名 `upstream: hit.model` 在 `chat.mjs:430` 出函数即丢。**实测（核现盘直跑）**：`resolveCompactThreshold(undefined, { model: "flash" })` ⇒ **96,000**（DEFAULT_SPEC 兜底 + 告警），而该别名所指 1M 模型应为 616,000。**返回形实测 = `{ value, auto }`**（`thincoder-core/config.mjs:192` ∥ `:194`——第二键是 `auto`，非 `source`；解构 `const { value }` 有据）。⇒ 字面传 `modelExit.provider` 会让别名配置静默落 96,000（比现状更保守，且与本批目标相反）。故走 §11.4 同一解析径（A1 规格 ∥ 档位枚举两处已用同法）。
3. **`resolveCompactThreshold` 是必用入口**（父侧钉死）：显式优先语义在它内部，本批不新增显式来源，`explicit` 恒 `undefined`。

**先例行（①-a）**：先例 = 服务端「取核 + 动载 + 注入口 + 缺核降级」三面既有形（`chat-compact.mjs:56/:72/:88` `loadCoreSpecs`/`loadCoreHelpers`/`loadCoreCompact`；消费面 `specOfRef` `:123`）。对齐 = 同法（`loadCoreConfig` + 缓存 + `coreConfig` 注入口 + 一面一条警告）。偏离 = 阈值这一面多一层外标反查（理由见 ①-2），且**不复述核算式**（引 `CONTEXT-COMPACTION.md` §6.17）——先例面内无第二处算式副本。

**勘察证据行（①-b）**：`PROJECT-MANIFEST.json` `index.publicRepos = []`（仓外无声明源）。仓内查过：`docs/core/design/CONTEXT-COMPACTION.md` §6.17（`:630` 请求预算单源——算式与四消费面）、`docs/server/design/agent/ADMIN-AGENT.md` §11.4（`:236` 标识解析径）∥ §16.2（`:542`；loopback 描述子取数 = `chat.mjs:399`–`:444`）∥ §17.2–§17.3、`docs/core/design/API-CONTRACT.md`（`:1100` `resolveCompactThreshold` 条目 · `:3241` `DEFAULT_COMPACT_THRESHOLD` 条目）、`thincoder-core/config.mjs:151-195`、`thincoder-core/model-specs.mjs:250-336`、`thincoder-server/src/gateway/providers.mjs:79-127`。相关 = 上述；无第二份服务端压缩设计档（压缩机制唯一住所 = `ADMIN-AGENT.md` §17.3 A3）。

**② 接口契约**

| 件 | 形 | 消费面 |
|---|---|---|
| `loadCoreConfig({ coreConfig })` | 动载 `@thincoder/core/config.mjs`，形校验 `["resolveCompactThreshold"]`，缓存 + 失败缓存零重试 | `compactThresholdOf` |
| `upstreamOfRef({ db, ref, log })` | `Promise<string \| null>`——外标 ⇒ 上游真名；失败面一条 `chat_core_face_missing`（face=`specs`） | `specOfRef` ∥ `compactThresholdOf` |
| `compactThresholdOf({ db, ref, model, coreConfig, log })` | `Promise<number>`——正整数阈值；缺核 ∥ 取名失败 ∥ 取值非正数 ⇒ `DEFAULT_COMPACT_THRESHOLD`（= 100,000）。`model` = 单测注入口（给上游真名，免库） | `chat.mjs` 起跑段 |
| `compactTurnHistory({ …, threshold })` | 不变（缺省入参 `:260` 保留 = 兜底） | `chat.mjs:571` |

数据流：`chat.model`（会话行）→ `upstreamOfRef` → `resolveCompactThreshold(undefined, { model })` → `threshold` → `compressIfNeeded(垫片, threshold, …)`（核内判 `history` 体量是否过线）。零新增库表 ∥ 零新增配置键 ∥ 零产物形态变化。

**③ 受影响文件表**

| 文件 | 现行行数 | 预期增量 | 改点 |
|---|---|---|---|
| `thincoder-server/src/agent/chat-compact.mjs` | 334（口径 = `split("\n").length − 1`） | +50 / −3 ⇒ ≈381 | `:13`–`:14` 头注合并改写；`:23` 常量注释改写；`:29`–`:34` 增 `coreConfigCache`/`coreConfigError`；`:108` 后增 `loadCoreConfig`；`:123` 拆出 `upstreamOfRef`（`specOfRef` 改调它）；`compactTurnHistory` 前增 `compactThresholdOf` |
| `thincoder-server/src/agent/chat.mjs` | 745（口径 = `split("\n").length − 1`） | +4 / −1 ⇒ ≈748 | `:48` import 增 `compactThresholdOf`；`:461`–`:464` deps 注释增 `coreConfig`；`:570`–`:583` 起跑段先算 `compactThreshold` 再传 |
| `docs/server/design/agent/ADMIN-AGENT.md` | 661 | ⇒ **665**（**已落**） | `:620` §17.2 A3 行；`:639`–`:642` §17.3 A3 第 5 条；§6 表 `chat.mjs` 745 ∥ 增 `chat-compact.mjs` 行；`:44` 依赖陈述 ∥ `:237` 解析件实名 ∥ `:659` 核面零改句；§13 R92 披露 |
| `thincoder-server/package.json` | 31 | ±1 | `:17` `@thincoder/core` `^0.10.7` ⇒ 含 A3 阈值算式的核版本（号于核发布时定；发布序 = 先发核，`docs/server/design/PROJECT.md` §2.3③）；抬版前本批阈值在产线为旧算式读数（D6） |
| `thincoder-server/test/compact-threshold.test.mjs`（新增·临时） | 0 | ≈110 | 机判形（§2 三·⑥ T1–T8；T8 = 起跑段接线腿——`:memory:` 真库 + 假出口 + 阈值捕捉替身）——**§5 收口即删**（单元测试档零留存） |

行数判：`chat.mjs` 实读 745 已越 500 咨询线——本批净变 **+4 / −1**（≤15 ⇒ 微触不拆，既有裁决 = `docs/server/design/agent/ADMIN-AGENT.md:158`（KD-SV-208④）∥ `:164`（KD-SV-228）；实落 >15 ⇒ 先拆后落）；`chat-compact.mjs` 334 ⇒ ≈381（未越 500）；两档均远 800 硬限。

**三处代码落点（逐字——改后）**

1. `thincoder-server/src/agent/chat-compact.mjs`（`loadCoreCompact` 之后）：

```js
/** 核件装载（`config.mjs`——`resolveCompactThreshold`；同上一档先例）。 */
export async function loadCoreConfig({ coreConfig = null } = {}) {
  if (coreConfig !== null) return coreConfig
  if (coreConfigCache !== null) return coreConfigCache
  if (coreConfigError !== null) throw coreConfigError
  try {
    const mod = await import("@thincoder/core/config.mjs")
    assertCoreFace(mod, ["resolveCompactThreshold"], "config")
    coreConfigCache = Object.freeze({ resolveCompactThreshold: mod.resolveCompactThreshold })
    return coreConfigCache
  } catch (e) {
    coreConfigError = e
    throw e
  }
}
```

2. `thincoder-server/src/agent/chat-compact.mjs`（`specOfRef` 换实现 + 新增阈值取数）：

```js
/** 上游真名反查（§11.4 标识解析单源）：会话外标（别名 ∥ `provider/model`）⇒ 上游真名；缺名 ∥ 反查失败 ⇒ `null`（失败面一条警告）。 */
export async function upstreamOfRef({ db, ref, log = null } = {}) {
  try {
    const { providerAliasIndex } = await import("../gateway/providers.mjs")
    return providerAliasIndex(db).lookup(String(ref ?? ""))?.model ?? null
  } catch (e) {
    noteCoreFaceDegraded(log, "specs", e)
    return null
  }
}

/** A1 规格取件（上游真名 ⇒ 核规格；缺核 ∥ 缺名 ⇒ `null`——自建形回落，回合不阻断）。 */
export async function specOfRef({ db, ref, coreSpecs = null, log = null } = {}) {
  return specOfUpstream(await upstreamOfRef({ db, ref, log }), { coreSpecs, log })
}

/** A3 压缩阈值取核（§17.3 A3——与核同源）：外标 ⇒ 上游真名 ⇒ 核 `resolveCompactThreshold(undefined, { model })`
 *  （算式单源 = `CONTEXT-COMPACTION.md` §6.17，本档不复述）。缺核 ∥ 取名失败 ∥ 取值非正数 ⇒ 兜底 `DEFAULT_COMPACT_THRESHOLD`
 *  （模型名未登记时核自落缺省规格并告警——服务面不加第二条）。`model` = 单测注入口（给上游真名，免库）。 */
export async function compactThresholdOf({ db = null, ref = null, model = null, coreConfig = null, log = null } = {}) {
  try {
    const config = await loadCoreConfig({ coreConfig })
    const name = typeof model === "string" && model !== ""
      ? model
      : (await upstreamOfRef({ db, ref, log })) ?? (typeof ref === "string" ? ref : "")
    const { value } = config.resolveCompactThreshold(undefined, { model: name })
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : DEFAULT_COMPACT_THRESHOLD
  } catch (e) {
    noteCoreFaceDegraded(log, "config", e)
    return DEFAULT_COMPACT_THRESHOLD
  }
}
```

3. `thincoder-server/src/agent/chat.mjs`（起跑段）：

```js
    // A3 阈值（§17.3 A3——与核同源）：按本会话在用模型现算（外标 ⇒ 上游真名 ⇒ 核 `resolveCompactThreshold`；缺核 ∥ 失败 ⇒ 兜底常量）
    const compactThreshold = await compactThresholdOf({ db, ref: chat.model, coreConfig: deps.coreConfig ?? null, log })
    const compacted = await compactTurnHistory({
      entries,
      history,
      provider: deps.compactProvider ?? modelExit.provider ?? null, // loopback 描述子（缺位 ⇒ 跳过压缩）
      systemPrompt: CHAT_SYSTEM_BRIEF,
      tools: tools.schemas,
      signal: controller.signal,
      cwd: deps.cwd ?? process.cwd(),
      coreCompact: deps.coreCompact ?? null,
      pad,
      chatId: chat.id,
      threshold: compactThreshold,
      log,
    })
```

常量与缺省入参**保留**（父侧钉死）：`DEFAULT_COMPACT_THRESHOLD = 100_000`（`:24`）∥ `threshold = DEFAULT_COMPACT_THRESHOLD`（`:260`）。注释改写（改后逐字）：

```js
 * 阈值口径 = **取核现算**（`compactThresholdOf`——外标 ⇒ 上游真名 ⇒ 核 `resolveCompactThreshold`，与核同源）；
 * `DEFAULT_COMPACT_THRESHOLD`（= 100_000）= **调用方未传 ∥ 缺核 ∥ 取值失败时的兜底**。
```

```js
/** 压缩阈值兜底常量（**调用方未传 `threshold` ∥ 缺核 ∥ 取值失败**时用；生产阈值 = `compactThresholdOf` 按在用模型现算——与核同源）。 */
```

**④ 关键决策（含被否项）**

| # | 决策 | 理由 | 被否 |
|---|---|---|---|
| D1 | 阈值取数放调用点（`chat.mjs`），取数器住 `chat-compact.mjs` | 沿父侧方向「调用点现算」；加载器与解析器同在 `chat-compact.mjs`（与三件加载器同居一处，单一住所） | ①在 `compactTurnHistory` 内部隐式现算（会把「阈值」这一入参变成藏起来的副效应，缺省入参的意义随之失真）②在 `chat.mjs` 内联写法（第二份加载器） |
| D2 | **不新增配置项** | 服务端全树无 `agent.compactThreshold` 键（grep = 0）；产品常识 = 每个配置项须有界面写面，而本批禁止改成员面 UI ⇒ 建立键 = 建立无写面的配置项。核的显式优先语义原样可用，日后加键 = 同一调用点传 `explicit` 一行 | 建 `agent.compactThreshold` 键（须连同控制台写面，另批） |
| D3 | 缺模型规格时**服务面不复述、不加告警** | 核已落 DEFAULT_SPEC（128K/32K ⇒ 96,000）并打一条 `[config] model "…" not found in MODEL_SPECS`（`model-specs.mjs:294`，按模型名每名一次）。服务面复述 = 第二份算式；再加一条告警 = 同一事实两条来源 | 服务面自带兜底算式（第二份）∥ 服务面二次告警（重复行） |
| D4 | 阈值按**上游真名**算（偏离父侧字面坐标） | 见 ①-2 实测：外标直传 ⇒ 别名配置落 96,000 | 字面 `resolveCompactThreshold(undefined, modelExit.provider)` |
| D5 | 缺核 ∥ 取名失败 ⇒ 100,000（**不跳过压缩**） | 兜底常量仍在，压缩照常；缺 `config.mjs` 但 `context.mjs` 在位 ⇒ 只有阈值面退化，不并入「A3 跳过」 | 缺核即跳过压缩（把一次装载失败放大成整面停摆） |
| D6 | 阈值随**核版本**（服务面不自持算式） | 取核 = 公式与兜底都在核；读数以仓内核工作树为准（`config.mjs:168` `requestBudget` ＋ `:191` `resolveCompactThreshold`，算式 = `min(usable, ⌊window × 0.8⌋)`）。**地板核版本 = 不足**（2026-10-18 实读）：`thincoder-server/package.json:17` 声明 `^0.10.7`，而 v0.10.7 ∥ v0.10.8 的 `resolveCompactThreshold` = `floor(usable × 0.6)`（`git show v0.10.7-core:thincoder-core/config.mjs`）——导出在场、算式旧，`assertCoreFace` 只判导出 ⇒ 阈值静默旧式（`gpt-4o` 67,200 vs 102,400；`deepseek-flash` 369,600 vs 616,000）。**处置** = `thincoder-server/package.json` 抬至含该算式的核版本（号于核发布时定；发布序 = 先发核，`docs/server/design/PROJECT.md` §2.3③）；抬版前不得以 `^0.10.7` 发行 | 服务面固定 100,000（现状——两端反向漂移） ∥ 只判导出的形校验（判不出算式——另立算式探测 = 第二份算式，D3 所拒） |
| D7 | 每回合多一次 providers 读（`upstreamOfRef`） | 以「解析单源」换一次小表查询（providers 行数 = 渠道数级）；未另建缓存（渠道换表须即时随动，缓存会滞后） | 复用 `specOfRef` 内部反查结果（须改 A1 导出面，收益 = 一次小查询，不抵改动面） |

**⑤ 验收对照（回指本批条目）**

| 条目 | 验收判据 | 机判形 |
|---|---|---|
| C1 | 阈值按在用模型现算：1M 档（`deepseek-flash`）⇒ 616,000 ＞ 100,000；预留 ≥ 20% 窗口的 128K 档（`kimi-k2.7-code` ∥ 未登记模型——预留 32K）⇒ 96,000 ＜ 100,000（128K 窗但预留 < 20% 的 `gpt-4o` ⇒ 102,400，方向相反——五 读数表在册，不按「128K 一律更早」判） | T1 / T2 |
| C1 | 地板含 A3 算式：`thincoder-server/package.json` 声明抬至含 `requestBudget` 算式的核发布；未抬则本批不发行（0.10.7/0.10.8 算式 = `floor(usable × 0.6)`——导出在场不代算式同位） | 实读 `thincoder-server/package.json:17` ＋ 发布序（`docs/server/design/PROJECT.md` §2.3③） |
| C1 | 别名外标解析到上游真名（不是 96,000 兜底） | T5 |
| C1 | 接线：起跑段把现算阈值传进压缩面（非缺省入参） | T8 |
| C2 | 未传 `threshold` ⇒ 100,000；缺核 ⇒ 100,000 | T4 / T6 |
| C2 | 模型名未登记 ⇒ 96,000 且不抛 | T3 |
| C3 | `ADMIN-AGENT.md` §17.3 A3 无「不同源 ∥ 自持常量 ∥ 固定 100,000」残句，含「与核同源」+「兜底」 | `grep` 零命中断言 |
| C4 | 只影响后续起跑段；已落库原文与标记行零动 | 结构断言：标记行 `covers` 解析路径未改（本批零触碰 `chat-store.mjs`） |

**⑥ 用例表（正常 ∥ 边界 ∥ 错误）**

| # | 类 | 输入 | 期望输出 |
|---|---|---|---|
| T1 | 正常 | `compactThresholdOf({ model: "kimi-k2.7-code", coreConfig })` | `96000`（< 100,000） |
| T2 | 正常 | `compactThresholdOf({ model: "deepseek-flash", coreConfig })` | `616000`（> 100,000） |
| T3 | 边界 | `compactThresholdOf({ model: "unknown-model-x", coreConfig })` | `96000`，不抛；核一行告警 |
| T4 | 边界 | `compactTurnHistory({ provider: {model:"x"}, coreCompact: 记录阈值替身 })` 不传 `threshold` | 传入核的阈值 = `100000`（缺省入参仍生效） |
| T5 | 正常 | `compactThresholdOf({ db: 别名假库(flash→deepseek-flash), ref: "flash", coreConfig })` | `616000`（≠ 96,000） |
| T6 | 错误 | `compactThresholdOf({ coreConfig: { resolveCompactThreshold() { throw } } })` | `100000`（兜底，不抛） |
| T7 | 错误 | `compactThresholdOf({ ref: "无此别名" })`（无核 ∥ 无注入） | `100000`（兜底） |
| T8 | 正常（接线腿） | `runChatTurn`——db = `openDatabase(":memory:")`（`thincoder-server/src/store/db.mjs:25`）；会话行 = `createChat(db, { model: "deepseek-flash" })`；content = `"hi"`；deps = `{ chat: 假出口（单轮文本，携 provider）, tools: { schemas: [], readonlyOf: () => true }, coreConfig: 仓内核件直引, coreCompact: 三件替身（记录 compressIfNeeded 收到的 threshold；compressFallback 空函数；COMPRESS_FAILURE_LIMIT: 3） }` | `compressIfNeeded` 收到 `threshold = 616000`（≠ 缺省 100,000）——证明起跑段把现算值传进压缩面，而非落 `:260` 缺省入参。（既有 `…-admin-agent-chat.test.mjs` 已随其批收口删除——单元测试档零留存 ⇒ 该腿落本批临时档） |

**取数说明（本席实读）**：本机 `thincoder-server/node_modules` **无** `@thincoder/core`（仅 `render-core` junction——`ls thincoder-server/node_modules/@thincoder`）⇒ 不注入时 `loadCoreConfig` 抛 ⇒ 兜底 100,000（T7 的真实来源）。故 T1/T2/T3/T5 的 `coreConfig` **必须直引仓内核件真件**：`await import("../../thincoder-core/config.mjs")`（沿 `chat-compact.mjs:9` 注释先例「仓内直引真件」）。别名假库形（T5 已实测可跑）：`{ prepare: () => ({ all: () => [{ id:1, name:"p1", base_url:"http://x", api_key:"k", models_json: JSON.stringify([{ name:"deepseek-flash", alias:"flash" }]), settings_json:"{}", model_meta_json:"{}", proxy:0 }] }) }` ⇒ `providerAliasIndex(db).lookup("flash")` = `{ provider:"p1", model:"deepseek-flash" }` ⇒ 阈值 616,000。

**T8 冒烟读数（本席 2026-10-18 直跑·改动前）**：`openDatabase(":memory:")` + `createChat(db, { model:"deepseek-flash" })` + 假出口 + 上述 `coreCompact` 替身 ⇒ `runChatTurn` 返 `{ status:"succeeded", calls:0 }`，而 `compressIfNeeded` 收到 **100000**——腿在盘可跑，且现值确实落在缺省入参（改动后同腿必得 616000）。

**⑦ 边界（不做）**：不动 `requestBudget` / `resolveCompactThreshold` / `COMPACT_RATIO`；不改压缩产物形态（标记行形状 ∥ 原行保留 ∥ 3 连败降级）；不改成员面 UI ∥ 控制台面；不新增配置键；不改 EN 提示词 ∥ 中文提示词；不动 `chat-store.mjs` 回放解析。

**⑧ 界面 / 交互决策**：本批**零界面面**（阈值是服务端内部决策值，用户不可见、不可配）——无待定项，无 `open`。用户视角自检：阈值变化对用户的可感结果 = 上下文被压缩的时点变化（128K 档早约 4,000 tokens、1M 档晚数倍），压缩后模型看到的仍是标记行摘要 + 原文留存；**无新增按钮 / 无新增提示 / 无新增报错文案**——故无交互面需与用户确认。

### 四、父侧问的三件（回答）

**① `cfg` 从哪来**：本批**不引入**。`explicit` 恒 `undefined`（核 `resolveCompactThreshold` 显式优先支保持空置）。若日后要显式覆盖：先建控制台写面（配置项必须有界面写面），再在同一调用点传 `explicit`——一行改动，无需动本批结构。

**② 缺模型规格时的行为**：核落 `DEFAULT_SPEC`（128K/32K ⇒ 96,000）并打一行 `[config] model "…" not found in MODEL_SPECS — using default spec (128K context, 32K output)`（`model-specs.mjs:289-296`，按模型名每名一次，进程级）。**服务面不复述算式、不加第二条告警**（D3）：同一事实两条来源必漂移；服务面自己的告警只留「核件装载失败」（`chat_core_face_missing`，face=`config`）。

**③ 行为变更面与回滚面**：见五 / 六。

### 五、行为变更读数（父侧新进程直跑 + 本席复核）

| 上游模型 | 窗口 | 预留 | 旧阈值 | 新阈值 | 方向 |
|---|---|---|---|---|---|
| `kimi-k2.7-code` | 128,000 | 32,000 | 100,000 | **96,000** | 更早（−4%） |
| `gpt-4o` | 128,000 | 16,000 | 100,000 | **102,400** | 更晚（+2.4%） |
| `deepseek-flash` | 1,000,000 | 384,000 | 100,000 | **616,000** | 更晚（×6.16） |
| `kimi-k3` | 1,000,000 | 131,072 | 100,000 | **800,000** | 更晚（×8） |
| 未登记模型 | 128,000 | 32,000 | 100,000 | **96,000** | 更早（−4%） |

**「128K 一律更早」不成立**：128K 档落点由预留决定——预留 ≥ 20% 窗口（32K）⇒ 早于 100,000；预留 < 20%（如 `gpt-4o` 16K）⇒ 略晚于 100,000（102,400）。批档 §1 的「128K 更早压」对 32K 预留档成立，对 16K 预留档方向相反——如实记。

**影响面**：老会话下一回合起跑段即按新阈值判定；已落库原文 ∥ 既有标记行零动（回放按 `covers` 解析，与阈值无关）；已压缩过的会话不会再被「重压」，也不会被「回滚展开」。

### 六、回滚面

改回常量即可、零数据迁移：删除 `chat.mjs` 起跑段的 `threshold: compactThreshold` 一行 ⇒ `compactTurnHistory` 缺省入参（`:260`）回到 100,000。已写的标记行格式不变、回放不变；`compactThresholdOf` / `loadCoreConfig` 留着不调用即零副作用。**不可回滚项**：无（无库表 / 无配置键 / 无产物形态变化）。

### 七、上抛项

- **[上抛·知会]** D4 偏离父侧字面坐标（字面传 `modelExit.provider` ⇒ 别名配置按外标查规格，实测落 96,000）。已按「先解上游真名」定形；父侧若要字面形，回一句即改（改动 = `compactThresholdOf` 少一层反查）。
- **[知会] 依赖窗口**：阈值随核版本（D6）。仓内核工作树 = 0.10.8 + 2026-10-18 overflow 批算式（`CHANGELOG.md:12` 0.10.8 已发 2026-10-16）；**生产核版本须含该算式**，否则服务面拿到的仍是旧算式读数——属发布序约定（`docs/server/design/PROJECT.md` §2.3），本批不改。

## §3 设计评审（评审子代理）
**状态行**：评审完成



### 轮次 1（评审子代理）

**评审对象** = `docs/batches/2026-10-18-server-compact-threshold.md` §2（本批设计）∥ `docs/server/design/agent/ADMIN-AGENT.md`（§17.2 `:616` ∥ §17.3 A3 `:635`–`:638` 已落面）。

**方法学限制（记录）**：本轮无项目标准档、无文档地图 —— 文档归属按 Project Guide（AGENTS.md）判；代码档不在评审声明范围内，受影响文件表的「现行行数」未逐档实读核对（仅做两档间一致性核对）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Affected-file size annotations | 🟡 | 批档声称「两件代码档均远离 500 咨询线」（`docs/batches/2026-10-18-server-compact-threshold.md:121`），但同档受影响文件表自记 `chat.mjs` 746 ⇒ ≈749（同档 `:117`）—— 已越 500 咨询档，档内无拆分预案亦无「微触不拆」理由 | 把该行改成实际适用的判据：净变 +4 / −1（≤15 ⇒ 微触不拆），并引用既有裁决 `docs/server/design/agent/ADMIN-AGENT.md:158`（KD-SV-208④）/ `:164`（KD-SV-228）；删去「远离 500 咨询线」句 |
| 2 | Acceptance criteria | 🟡 | C1 判据写「128K 档阈值 < 100,000 且 1M 档 > 100,000（按在用模型）」（`docs/batches/2026-10-18-server-compact-threshold.md:230`），被本档自己的读数表推翻：`gpt-4o` 128K 窗 ⇒ 102,400（同档 `:268`），且同档 `:273` 已写明「「128K 一律更早」不成立」—— 判据按字面执行会把正确行为判成失败 | 把 C1 判据限定到预留比例（预留 ≥ 20% 窗 ⇒ < 100,000）或直接点名 T1/T2 所断言的模型 |
| 3 | Acceptance criteria | 🟡 | T1–T7 只单测 `compactThresholdOf` 取数器；C1 的真实生效点 = `chat.mjs` 起跑段把值传入 `compactTurnHistory`，无任何用例断言该接线，且临时测试档「**§5 收口即删**（单元测试档零留存）」（同档 `:119`）⇒ 收口后阈值面零机判留存 | 增一条以阈值捕捉替身（假 `coreCompact` 记录入参）驱动起跑段的用例，或把该腿并入既有 admin-agent chat 单测档；临时档文件名沿本域 `*.test.mjs` 形 |
| 4 | Clarity | 🟡 | 设计称别名解析「与 A1 规格同一解析面」（同档 `:86` / `:152` 用 `providerAliasIndex(db).lookup`），而它引为单源的档面写作「`createAliasIndex().lookup(外标)`」（`docs/server/design/agent/ADMIN-AGENT.md:236`）—— 该符号名在 `ADMIN-AGENT.md` 全档零出现（grep 实证），实现者按两处任一名找不到件时有自造第二解析器的面 | 在 §2 三·①-2 钉死实际存在件的导出名与 `file:line`；若档面 `:236` 已过期则同批随正该句 |
| 5 | Feasibility / doc-state | 🟡 | 核版本地板两处相抵：批档 D6 写「依赖地板 = `@thincoder/core ^0.10.7`」（同档 `:223`），而所改档面声明「`@thincoder/core` 版本声明依赖——实读 `^0.10.4`」（`docs/server/design/agent/ADMIN-AGENT.md:43`）并断言取核件「全部为 `@thincoder/core@0.10.4` 既有导出」（同档 `:655`）；`package.json` 未入受影响文件表 ⇒ 地板是否随批抬升无从判。若在地板版本里导出在位、算式为旧版，`assertCoreFace` 会通过而阈值读数静默为旧算式（C1 在产线静默失效） | 把地板陈述落成对声明依赖的事实：或把 `thincoder-server/package.json` 抬版并入受影响文件表 + 一条 §13 披露行，或用实测证明地板版本已携现行算式；同时收正 `ADMIN-AGENT.md:43` / `:655` |
| 6 | Scope（coordination） | 🟡 | D4 偏离父侧字面坐标 `resolveCompactThreshold(undefined, modelExit.provider)`（同档 `:37`），停在上抛待裁（同档 `:283`）—— 属协调项，非缺陷（偏离已附实测理由：别名外标直传落 96,000） | 保持其为开放协调项：施工前确认「先解上游真名」为受采形；若改取字面形，删 `compactThresholdOf` 内一层反查即可 |
| 7 | Doc hygiene | 🔵 | 所改档面 §6 行数预算表将随之过期：`chat.mjs` 记「实读 **736**」（`ADMIN-AGENT.md:33`）而本批算出 ≈749，且 `chat-compact.mjs`（335 ⇒ ≈382，同档 `:116`）在该表无行；受影响文件表未列此随正 | 在 §5 收口随正件里补一行：`ADMIN-AGENT.md` §6 表 `chat.mjs` 新行 + `chat-compact.mjs` 入表 |
| 8 | Clarity（证据） | 🔵 | 批档实测块把读数写成裸数字（「→ 700,000 explicit」，同档 `:30`），而拟定代码是解构 `const { value } = config.resolveCompactThreshold(undefined, { model: name })`（同档 `:173`）—— 返回形在记录里无实证（核件不在本轮评审范围，`unverified`）；解构错则会静默落兜底 | 在 §2 三·①-2 的实测块里记下观察到的返回形（是否 `{ value, source }`），使解构有据 |
| 9 | Clarity | 🔵 | §2 三 的编号相撞：「先例行（③）」（同档 `:97`）与「勘察证据行（④）」（同档 `:99`）插在 ① 之后，却复用 ③ 受影响文件表（同档 `:112`）/ ④ 关键决策（同档 `:214`）的号 ⇒ 「§2 三·③」式指代两义 | 把先例/勘察两块编号改为 ①-1 / ①-2（或字母），②–⑧ 保持现序列 |

**计数**：🔴 0 · 🟡 6 · 🔵 3

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
