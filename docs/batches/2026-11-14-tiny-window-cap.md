# 2026-11-14 · tiny 档上下文上限 256K
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 指示：tiny 模式下把上下文长度限定到不超过 256K token。
> 台账 = #2411（core · 归批）。前情 = docs/batches/2026-11-14-tiny-mode-rename.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = eb4870e4ba9b4cae53ae9c20c20e9bddf304881e（建批时刻的 HEAD 是 24ba68de，但当时工作树压着已收口的上两批 209 档未提交改动，按它取行数基线会与设计实际面对的树不符；已在派设计前提交为 eb4870e4，所有行数读数一律取该 sha）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

tiny 档下把有效上下文窗口压到 **256K token** 上限（`min(262144, 模型自身窗口)`），进入 tiny 生效、离开 tiny 解除。压缩线、尾部预算、用量百分比、发送前守卫一律从「有效窗口」推导，不新增检查、不新增拒绝路径。

### 为什么

有些模型很贵，且对缓存命中没有多大优惠，上下文越长单轮越贵（如 kimi-k3）。token-plan 按点数计费，工程模式下三下两下就用光。tiny 档要一个**确定的上界**，而不是让模型窗口决定行为。

这条决定了取舍方向：1M 窗口模型上用 tiny 会在 256K 就触发压缩，中段细节会丢——**在省钱的语境下这是想要的**，不是缺陷。

### 已定决定

- **已定决定**：只对 tiny 生效；进入 tiny 上限生效，切出即解除；模型自身窗口更小时取较小的那个。 · 用户原话：「**长度限制不覆盖其他模式，只涉及 tiny 模式，进 tiny 模式限制，进别的模式解除限制。如果模型本身上下文更小，那就去小的。**」 · 时间：2026-11-14
- **已定决定**：256K 是覆盖模型默认窗口的设置，其余规则仍走既有上下文压缩机制（不新造裁剪路径）。 · 用户原话：「**256k 那个我的意思是覆盖模型的默认设置，其他的规则还是依赖原有的上下文压缩机制。**」 · 时间：2026-11-14
- **已定决定**：上限数值 = 256K token。 · 用户原话：「**我还希望把极简模式的上下文长度限定倒不超过 256k token。**」 · 时间：2026-11-14

### 现状机制（主 agent 实读）

- `thincoder-core/config.mjs`：`COMPACT_RATIO = 0.6`；`threshold = Math.min(usable, Math.floor(window * COMPACT_RATIO))`；`window` 来自 `providerSpec(provider).context`。
- `thincoder-core/token-window.mjs`：`keepTailSize` ∥ `tailBudgetTokens` 都按 `providerSpec(provider).context` 算；`contextUsage(agent, extras)` 返回 `window` ∥ `threshold` ∥ `overhead` ∥ `fixedFloor`。
- 消费面：`enforceContextFit` 抛 typed error ∥ `compressIfNeeded` 的 `force` 支 ∥ `context` 工具的四项读数 ∥ `/compact` 回执 ∥ 状态栏百分比。
- 结论：**「窗口」是单值、单一来源**，覆盖只需在它被读取处插一层，不必逐处改消费方。

### 边界（不做）

- 不改 `providerSpec` 本身——它回答「模型真实窗口多大」，是事实，不是策略。
- 不给 normal ∥ engineering 加任何上限。
- 不新增裁剪算法；压缩仍走既有 `compressIfNeeded` ∥ `controllable` 切分。
- 不改 `#2398` 的固定开销守卫逻辑（它读 `limit`，跟着有效窗口走即可）。

### 勘察

- **库内 = 已查**：`token-window.mjs` 的窗口三消费（`keepTailSize` ∥ `tailBudgetTokens` ∥ `contextUsage`）、`config.mjs` 的 `COMPACT_RATIO` 与 `threshold` 算式、`agent/setup.mjs` 的 mode 取值。→ 相关 = 窗口确实是单值来源。
- **库外 = B 类**：改动面 = 本仓 `thincoder-core` 的窗口解析与三处消费；外部断言 = 零（不引入新依赖、不涉第三方 API 行为）。

### 授权

用户 2026-11-14 定：本批与 `#2410` 一样按顺序自动跑完（「都自动跑完吧，可以按顺序跑」）。

### 上抛

无。

- **自动推进**：本批全链（设计修订 → 设计评审 → 实施 → 验证 → 收口）不需逐步确认 · 自 2026-11-14 · 用户原话：「**都自动跑完吧，可以按顺序跑**」

### 设计稿核对（主 agent，内容级）

- E1 ∥ §2.1 算式与三条已定决定逐条相符：只对 tiny、切出即解除、模型更小取小。
- §2.3 缺参即拒与工程纪律「参数缺省是替调用方做决定」同向；`workMode` 无默认值。
- 机读清单读数复核：`config.mjs` @eb4870e4 = **505** 内容行（`countContentLines` 实跑），越 500 线，分拆方案（预算族迁 `window-policy.mjs`、本档 re-export）成立；`COMPACT_RATIO` ∥ `outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥ `resolveCompactThreshold` 五符号在该 sha 上均实存。
- 集成 delta 已由第 1 轮评审裁定：原「新增 0」不成立（tiny 上限是新业务事实，既有集成用例一条也不读窗口与压缩线），改为新增 `CLI 50-6`。

### 第 1 轮评审裁决（主 agent）

| # | 严重度 | 处置 | 说明 |
|---|---|---|---|
| 1 | 🔴 | Dispatched | §2 集成 delta 的「改写 0」与「夹具改窗口取值即覆盖」互斥。修：改夹具就算改写，须按 RTM 用例名逐条列出；不改夹具就删掉那半句 |
| 2 | 🔴 | Dispatched | 0/0/0 不落在唯一成立的理由上。我独立复核：`test/RTM.md` 有 `CLI 16 | 状态行百分比与压缩判据同尺` 与 `CLI 50 | 三档模式切换、极简提示词与知识查询`；`tiny-mode.test.mjs` 断言全在提示词内容面，无一条读窗口或压缩线。修：在 CLI 50 故事下新增一条具名用例，走 CLI 入口切档，断言统计/百分比与压缩线分母在 tiny 下为 262144、切出后回模型窗口 |
| 3 | 🟡 | Dispatched | E1 后半「切出即解除」无验收行；A1–A5 未点可跑命令。修：补一条切档后派生的验收，并给出批内单测档 + `node --test` |
| 4 | 🟡 | Dispatched | §2.3 拒绝支只有设想。修：点名只握 provider 的透传面，或把 A5 的输入声明为复现路径 |
| 5 | 🟡 | Dispatched | §2 缺最近先例行。修：补三坐标（实现坐标 ∥ 对应设计节 ∥ 先例批次）+ 对齐或偏离理由 |
| 6 | 🟡 | Dispatched | §2 勘察只覆盖仓内。修：把 §1 的「库外 = B 类 · 外部断言 = 零」写进 §2，含「无相关」结论 |
| 7 | 🟡 | **Fixed（我这侧）+ Dispatched（设计席侧）** | 需求层缺这条规则。我已在 `docs/core/requirements/CONTEXT-COMPACTION.md` §2 补三行（有效窗口定义 ∥ 切换即生效解除 ∥ 分母同一来源）。设计席修：§2「设计档落点」加该需求节，设计档引用它 |
| 8 | 🟡 | Dispatched | §1.1「不靠丢用户与模型的原文」与 §4 `shrinkOversized` 边界未定。修：写明该兜底适用面，使两句不能同时读真 |
| 9 | 🟡 | Dispatched | §2.2「四个 provider 发送面」未点名，且「四个」在 E3 指另一组。修：点名或改用「每一处读 maxTokens 的发送面」 |
| 10 | 🔵 | Not an issue | 档位抽测通过，档位结论与读数在 §2 均已成立 |
| 11 | 🔵 | Dispatched | §2 补一句函数档位检查与其结果 |
| 12 | 🔵 | Not an issue | 复用三问以「已查无」形给全，无未用现成件 |
| 13 | 🔵 | Dispatched | `PROMPT-SYSTEM.md` §4 的「256K」与 §2.1 的 262144 是同一政策值的两份。修：§4 只引 §2.1 不写数字，或声明 §2.1 为唯一出处 |

### 修面边界

- 本轮只改上面点名的项，不夹带新语义、不扩范围。
- 台账仍为 `#2411` 在途，凭证未签发，修完重送第 2 轮评审。

### 设计评审第 2 轮裁决（VERDICT: pass · 🔴 0 · 🟡 7 · 🔵 3）

| # | 处置 | 说明 |
|---|---|---|
| 1 | Deferred | 需求 §1 把「会话标题」列入本机制范围，设计档无对应句。归属待核（可能属 SESSION 设计档）⇒ 实施后改设计档或改需求句，二选一 |
| 2 | Deferred | 需求 §6「子代理没有全史回查面时不提供这组主动操作」在设计 §7 无落点。实施后由设计席补一句准入规则 |
| 3 | Deferred | 需求 §3「比例不得低于当前安全下界」∥ §4「摘要有当前长度目标」无设计对应句。实施后补 |
| 4 | Deferred | 设计 §1.1「该轮三条记录消息」与同节「简单问答允许 taskState 为空」互斥（`turnRecordMessages` 条件 push）。实施后改写为「该轮登记的全部记录消息」 |
| 5 | Fixed（并入实施） | §2.3 必填清单未含 `historyPercent`；`collectStaleToolOutputs(history, provider)` 写成无 workMode 可透传。判为**不阻断**：设计 §2.3 已写「只握有 provider 的面把它当参数透传」，且 §2 受影响文件含 `token-window.mjs`，实施席打开该档即见调用；签名一致性列入 §6 收口核对 |
| 6 | Fixed（本笔，主 agent 笔域） | 需求 §2 补「固定开销单独越过 limit」一格，与设计 §5 对齐 |
| 7 | Deferred | 设计 §9 只列三个回调，需求 §8 要求五态 + headless no-op。实施后由设计席补 |
| 8 | Deferred | §1.1「上限只留在摘要面」与 `turn-task-state.mjs` 的计数上限并存，实施后补一句区分长度上限与条数上限 |
| 9 | 记录 | 本评审范围无 §2 在上下文，代码档位 ∥ 先例 ∥ 勘察 ∥ RTM 增量未由评审核；主 agent 已在设计稿核对段自核档位与读数 |
| 10 | Deferred | 设计 §2.1「端侧不另立算式」未裁定 `advisor/compaction.mjs` 是否在单源范围内。实施后补一句 |

**处置理由**：评审已签发凭证，设计档字节即凭证字节——任何编辑都会让实施 spawn 被拒。故 1 ∥ 2 ∥ 3 ∥ 4 ∥ 7 ∥ 8 ∥ 10 七项一律**实施交付后**落地（设计席修一轮），不在本轮改设计档。

第 5 项不阻断的判据：它缺的是设计档**枚举完整度**，不是指令本身——「只握有 provider 的面把它当参数透传」已在设计档，且 `token-window.mjs` 在 §2 受影响文件表内。

**§6 收口核对项（新增）**：实施后核 `historyPercent` ∥ `collectStaleToolOutputs` 签名与 §2.3 的必填规则一致。

### 实施后裁决（第 1 轮 · 收口前）

**一、要补的一处（已裁，设计席落进 §2，实施席照做）**

- 现状：`thincoder-desktop/src/main/session-slots.mjs` 的 `openingSeed(data)` 写 `workMode: resolveWorkMode(config.agent)`——取全局默认档。
- 改为：`resolveSessionWorkMode(data, config.agent)`。`data` 就是该会话自己的槽，槽里的档才是这个会话的权威档（设计 `docs/core/design/SESSION.md`「mode 是会话级 tiny/normal/engineering 权威值」）。
- 先例：`session-lifecycle.mjs` 的 `setConfigWorkMode(agent.config, resolveSessionWorkMode(data, agent.config.agent))` 已是这个用法，本处是唯一漏掉的一面。
- 为什么是缺陷不是风格：槽 tiny ∥ 配置 normal 时，打开会话看到 13%，实跑看到 51%——同一会话一屏两个分母，正是 E3 要消灭的现象。
- 验收：批内单测加 A6c（槽 tiny ∥ 配置 normal ⇒ 按 262144；反向 ⇒ 按模型窗口），跑该档与 `test/integration/tiny-mode.test.mjs`，计数写 §5。
- 禁止面：不动 `session-lifecycle.mjs`、不动核、不加窗口逻辑、发现同类只记 Leads。

**二、三条上抛的裁定**

1. `assertPromptFits` 取哪一边的 limit ⇒ **保持现状，不改**。设计 §2.2 把 `requestBudget` 给四个发送面读 `max_tokens`（输出合同），策略面 limit 给 `enforceContextFit`；实读后者确实用 `policyBudget(...).limit` 并在发请求前抛 `context_overflow`。tiny 的 262144 在代理层就拦住了，运输层那道是物理兜底。两个语义不同的守卫各读各的预算，是对的。
2. `advisor/compaction.mjs` 是否在单源射程 ⇒ **不在，本批不碰**。advisor 有自己一套预算（`ADVISOR-GUARDS.md`），且是设计档点名的「最近先例」。记 Leads，不进本批。
3. 打开态读数用哪个档 ⇒ **用会话自己的档**，即上面第一条。

**三、我自己犯的一处，记在这里**

- 评审通过后我又改了 `docs/core/requirements/CONTEXT-COMPACTION.md`（补「固定开销单独越 limit」那一格）。
- 这违反「评审通过后到实施开始前不动被审档」，令牌封印当场失效（spawn 被拒并点名该档）。
- 处置：撤回那一行恢复被审字节；待本链收口、令牌消费之后，再作为独立一轮落回去。撤回的不是内容，是时序。

**四、收口前沿用**

全量集成 215 例 / 213 绿 / 2 红，两红同属 `test/integration/doc-anchor-graph.test.mjs`（`CLI 43-1` ∥ `CLI 43-2`），与本批无 import 面交集，台账 `#2404` 记着。

**五、本轮派单：设计席只写 §2**

- 落上面第一条（§2 加一条实施后裁决项，含验收 A6c 与禁止面）。
- 对齐 §2 机读清单：实施实际改了 `thincoder-core/window-policy.mjs`（新）、六处端侧调用面、`provider/errors.mjs` ∥ 四个 transport、`context-degrade.mjs`、批内单测档——清单现在缺这些行，逐行补上并按 `eb4870e4` 取行数。
- **本轮禁止动设计档**：`docs/core/design/*` 与 `docs/core/requirements/*` 一律不碰。评审第 2 轮判 Deferred 的 7 条 🟡（1 ∥ 2 ∥ 3 ∥ 4 ∥ 7 ∥ 8 ∥ 10）的设计档修改，等本链收口、令牌消费后再单独一轮做——现在改，实施席的 spawn 会被封印拒掉。

### 交付后第 4 轮裁决（上抛两项）

- **裁决 A · `session-lifecycle.mjs` 的 `sessionReading` 头注**：注里那两句分两层，只判后半。
  函数契约那层成立、保留：`sessionReading` 自己不读槽里的 `mode`，档位由调用方传入——这是纯投影面，该如此。
  它推出的结论不成立：「照旧槽算打开态窗口，一个旧会话就带着 256K 上界进来；读面只认调用方当前手上的模式」。
  理由：槽里的 `mode` 是会话级权威档（设计 `SESSION.md` §8「mode 是会话级 tiny/normal/engineering 权威值」），
  该会话实跑就是 tiny；打开态若按配置档显示 13%、实跑按槽档得 51%，同一会话在同一屏出现两个分母。
  注里引的需求 §2「不落盘、不跨会话带走」说的是**有效窗口本身不是持久状态、每次按档位现算**，
  不是「槽里的档不作数」。这句歧义是我写的，收口后单独修一次（本批内不动，避免再破凭证封印）。
- **裁决 B · A6c 是零永久覆盖**：判为**要补**，不是接受。
  它落在本批的两条入口之一——「产品真需要的业务场景」：桌面打开会话时显示的用量百分比，
  必须与该会话实跑所用档位同一条分母。既有集成用例 `test/integration/desktop-work-mode.test.mjs`
  只断言 `flags.mode` 回读，不读 `seed.usage`，因此这条修复在收口删档后无任何永久看守。
  判据 = 在既有用例内补 `seed.usage` 断言两方向（槽 tiny ⇒ 分母 262144；槽 normal ⇒ 模型窗口），
  集成 delta 由「改写 0」改为「改写 1」，用例按其 RTM 标题点名。
- **一处记录更正要实施席一并做**：§5 原写「不取槽模式，避免跨会话带走」，与本节裁决 A 相反；
  同一机制在档里不能留两份互相矛盾的说明。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 本批条目（覆盖）

- **E1（台账 #2411）**：tiny 档的有效窗口 = `min(模型窗口, 262144)`；进 tiny 生效，切出即回到模型窗口；模型自身更小取小的；normal ∥ engineering 不设上限。
- **E2**：262144 是覆盖模型默认窗口的策略值，其余仍走既有上下文压缩机制——不新造裁剪路径、不新拒绝路径。
- **E3**：压缩线、尾部预算、用量百分比、发送前守卫四个派生面一律从有效窗口推导，不从模型窗口各自现算。

### 设计档落点

- `docs/core/design/CONTEXT-COMPACTION.md` §2.1（有效窗口）∥ §2.2（两个预算出口）∥ §2.3（缺参即拒）∥ §4（尾部两式同取有效窗口）——本机制的单源说明。
- `docs/core/requirements/CONTEXT-COMPACTION.md` §2：有效窗口定义 ∥ 切换即生效解除 ∥ 分母同一来源三条——需求面来处，两份设计档引用它，不复述原文。
- `docs/core/design/PROMPT-SYSTEM.md` §4：一句话引用 §2.1，裁定 tiny 用这条预算；上限数值只在 §2.1 一处出现，§4 不写数字。
- `docs/core/design/CONFIG.md`：不动——有效窗口是策略常量，不新增配置键，`agent.mode` 值域与归一无变化。

### 机制设计

窗口只有一个事实来源（`providerSpec` 的五级链）和一个策略出口（`effectiveWindow`）。策略值只从 `workMode` 现算，不落在 provider ∥ config 对象上。

两个预算出口的区别只在窗口取哪一边：运输面读 `requestBudget`（模型窗口——`max_tokens` 是输出合同），压缩 ∥ 策略守卫 ∥ stats 读 `policyBudget`（有效窗口）。

越窗仍由既有两道守卫拦，且各读各的预算：代理层 `enforceContextFit` 读 `policyBudget(...).limit`（有效窗口），在发请求前抛 `context_overflow`——这是策略上限。运输层 `assertPromptFits` 读 `requestBudget(...).limit`（模型真实窗口），是物理兜底，不随档位变。

压缩仍由既有 `compressIfNeeded` 触发——本批只换输入，不换判据。

状态行读数的缓存在切档后必须失效：`thincoder-cli/src/tui/render-loop.mjs` 的 `ctxCacheOf` 失效键取 `effectiveWindow(...)`，不取 `providerSpec().context`——模型窗口在切档时不变（1M 模型进 tiny 仍是 1M），键取模型窗口就永远命中旧帧，`pct` 沿用旧分母。

缺参即拒（设计档 §2.3）：`workMode` 无默认值，值不在 `WORK_MODES` 里就在入口拒绝并点名参数。握有 agent 的面用 `resolveWorkMode(agent.config?.agent)` 自取，只握有 provider 的面透传。

已查无（新落点 `effectiveWindow` ∥ `policyBudget`）：本批以 `grep` 扫全仓 `**/*.mjs` 的 `providerSpec` ∥ `requestBudget` ∥ `usableWindow` ∥ `resolveCompactThreshold`，并读了 `config.mjs` 的预算族与 `model-context.mjs` 的取值校验——现有一片全回答「模型窗口多大」，没有一处回答「本档允许用多大」。策略面确为空缺，故新建而非复用。

**最近先例**：实现坐标 = `thincoder-core/config.mjs` 的 `requestBudget`（预算对象单一出口，档内注记「One formula, four consumer faces」）；对应设计节 = `CONTEXT-COMPACTION.md` §2.2；先例批次 = context-tool 批 2026-09-21（`token-window.mjs` 文件头「自 `context.mjs` **逐字迁出**」）。

- 对齐面：族迁出、原档保名、消费面零改——本批迁预算族到 `window-policy.mjs`、`config.mjs` re-export，与先例同形。
- 偏离面：先例迁出是语义零改，本批在迁出的预算族上新增必填 `workMode` 入参。理由 = 策略值只能从模式现算，落在 provider ∥ config 对象上就带不走「切出即解除」（关键决策第 2 条）。
- 偏离不是因为「新写法更顺手」：`requestBudget` 原地加参会让模型窗口出口也握一个它不用的模式，两个出口分不开。

**库外 = B 类**：改动面 = 本仓核的窗口解析与全部派生读数面（新建 `window-policy.mjs`，以及压缩线 ∥ 尾部两式 ∥ 百分比分母 ∥ 策略守卫 ∥ 固定开销判据）与三端读数面（CLI ∥ VSC ∥ desktop）；外部断言 = 零——不引入新依赖、不改协议载荷、不依赖第三方 API 行为。结论 = 无相关外部来源需查。

**函数档位**：新落点 `effectiveWindow` ∥ `policyBudget` 各为短函数；迁出的预算族里最长者 `requestBudget` 的函数体在 `window-policy.mjs` 上约 23 行（含注记），`outputReserve` ∥ `usableWindow` ∥ `resolveCompactThreshold` 各更短。五符号无一函数达 300 行，函数档位先于文件档位，两者本批均合规。

**发送面点名**：E3 的四个派生面 = 压缩线 ∥ 尾部预算 ∥ 用量百分比 ∥ 发送前守卫；读 maxTokens 的四个发送面是另一组：

- `provider/core.mjs`（OpenAI 兼容面）∥ `provider/anthropic.mjs`（Messages）。
- `provider/google.mjs`（generateContent）∥ Responses 面横跨两档：请求体在 `provider/responses-request.mjs` 的 `buildBody` 读 `maxTokens`（本批不动），净判落在 `provider/responses.mjs`（本批补传预算对象）。

同档不再有两组「四个」。

**缺参即拒的透传面（实证）**：只握 provider 的面把它当参数透传，本仓有三处：

- `thincoder-vscode/src/specs.mjs` 的 `ctxUsageForHistory` ∥ `ctxPercentForHistory`——宿主只给 history ∥ provider ∥ ratio。
- `thincoder-core/session-lifecycle.mjs` 的 `sessionReading` 打开态读数：本面握槽数据与 provider、不握 agent，档位由调用方作 `opts.workMode` 传入；桌面播种面 `thincoder-desktop/src/main/session-slots.mjs` 的 `openingSeed` 传 `resolveSessionWorkMode(data, config.agent)`——会话自己的档（实施后裁决一）。
- `thincoder-core/token-window.mjs` 的 `collectStaleToolOutputs(history, provider, workMode)` 向 `keepTailSize` ∥ `tailBudgetTokens` 透传——本档四个窗口入口与外层这一处透传同取必填 `workMode`。

其余面握有 agent，用 `resolveWorkMode` 自取；复现路径 = A5 的输入。

**设计档 §1.1 与 §4 的适用面**：`shrinkOversized` 只在无中段时改机读线里单条消息的副本（`context-degrade.mjs` 的 copy-on-write 重建），轮记录与人读线保留原文。两条不互斥——记录逐字，机读线副本可兜底。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/window-policy.mjs | — | 新 |
| thincoder-core/config.mjs | 越设计时线：`thincoder-core/config.mjs` 的预算族（`COMPACT_RATIO` ∥ `outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥ `resolveCompactThreshold`）整族迁入 `thincoder-core/window-policy.mjs`，本档只 re-export 保住既有导入面（与 `model-specs.mjs` 的 re-export 同形）；落本批 `实施轮` + §5 | 505 |
| thincoder-core/token-window.mjs | — | 289 |
| thincoder-core/context.mjs | — | 314 |
| thincoder-core/context-degrade.mjs | — | 81 |
| thincoder-core/agent/setup.mjs | — | 310 |
| thincoder-core/agent/run-stages.mjs | — | 370 |
| thincoder-core/agent-tools/context.mjs | — | 193 |
| thincoder-core/session-lifecycle.mjs | — | 473 |
| thincoder-core/provider/errors.mjs | — | 195 |
| thincoder-core/provider/core.mjs | — | 494 |
| thincoder-core/provider/anthropic.mjs | — | 367 |
| thincoder-core/provider/google.mjs | — | 325 |
| thincoder-core/provider/responses.mjs | — | 317 |
| thincoder-cli/src/tui/render-loop.mjs | — | 149 |
| thincoder-cli/src/tui/cmd-config.mjs | — | 327 |
| thincoder-cli/src/tui/model-picker.mjs | — | 311 |
| thincoder-cli/src/tui/provider-admin.mjs | — | 400 |
| thincoder-vscode/src/specs.mjs | — | 89 |
| thincoder-vscode/src/extension/panel-callbacks.mjs | — | 362 |
| thincoder-desktop/src/main/agent-host.mjs | — | 340 |
| thincoder-desktop/src/main/session-slots.mjs | — | 276 |
| docs/core/design/CONTEXT-COMPACTION.md | — | — |
| docs/batches/2026-11-14-tiny-window-cap.test.mjs | — | 新 |
| test/integration/tiny-mode.test.mjs | 既有集成档：加 `CLI 50-6` 一条用例 | 174 |
| test/integration/desktop-work-mode.test.mjs | 既有集成档：`Desktop 12-1` 内补 `seed.usage` 两方向断言 | 184 |
| test/integration/context-percent-calibrated.test.mjs | — | 106 |
| test/rtm/tooling.md | 既有集成索引：CLI 50 节加 50-6 行、五态注记补成六态 | — |
| test/rtm/ends.md | 既有集成索引：`Desktop 12-1` 行「怎么算通过」补打开态分母判据一句 | — |
```

行数读数：`git show eb4870e4:<档>` 过 `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`），本批只此一把尺。

`test/integration/context-percent-calibrated.test.mjs` 改的是 `CLI 16-1` 的调用面（`historyPercent` 补第四参），用例名 ∥ 断言 ∥ 通过判据不动 ⇒ 该档不计为改写；本批唯一的改写用例是 `Desktop 12-1`（见「集成 delta」）。

`thincoder-core/provider/errors.mjs` 不新增模式参数：越窗报文改读调用方已算好的预算对象（§2.2「stats、守卫和压缩使用同一预算对象」），不再自己重算一次预算。

### 验收对照

- **A1 ← E1**：用 1M 窗模型喂 `effectiveWindow(provider, "tiny")` 得 262144，喂 `"normal"` ∥ `"engineering"` 得 1048576，喂 128K 窗模型 + `"tiny"` 得 131072。读者读单测文件即判。
- **A2 ← E3**：同一 tiny 会话里 `policyBudget().threshold` ∥ `.limit`、`keepTailSize` ∥ `tailBudgetTokens`、`historyReading().pct` 的分母同取 262144——五个读数同尺，一处分歧即不合。
- **A3 ← E2**：`compressIfNeeded` ∥ `enforceContextFit` 的判据与分支零改，只换输入窗口；小窗模型在 tiny 下行为与改前逐位一致。
- **A4**：`providerSpec` 的输出逐位不变——模型信息显示、ACP 会话信息、五级链来源全部说事实。
- **A5 ← §2.3**：`workMode` 缺省或非法值 ⇒ 函数入口拒绝并点名 `workMode`；单测喂 `undefined` ∥ `"minimal-typo"` 读该报文。
- **A6 ← E1 后半（切出即解除）**：同一 agent 先按 `tiny` 取一套派生读数（`policyBudget().threshold` ∥ `.limit` ∥ `keepTailSize` ∥ `tailBudgetTokens` ∥ `historyReading().pct` 的分母），把模式切回 `normal` 后重取同一组——五个读数全部回到模型窗口一侧，不残留 262144。读者读单测文件即判。
- **A6c ← 实施后裁决一（打开态播种面）+ 第 4 轮裁决 B（永久看守）**：桌面 `openingSeed` 按会话自己的槽档取打开态分母——槽 `tiny` ∥ 配置 `normal` ⇒ 262144；槽 `normal` ∥ 配置 `tiny` ⇒ 模型窗口。同两条读数落两处：批内单测档的 A6c（收口随本批删除）与既有集成用例 `Desktop 12-1` 内的同两条（收口后仍在；集成面读的是 `seed.usage` 百分比，判据见「实施后裁决（第 4 轮 · 交付后）」一）。
- **跑法**：`node --test docs/batches/2026-11-14-tiny-window-cap.test.mjs`。批内单测档与批档同名同目录、收口随本批删除，A1–A6 与 A6c 全在这一档；集成面由 `CLI 50-6` ∥ `Desktop 12-1` 读，收口在父侧跑一次。

### 集成 delta（对 `test/RTM.md`）

**新增 1 · 改写 1 · 删除 0**

- **新增**：故事 `CLI 50`（三档模式切换、极简提示词与知识查询）下新增用例 **`CLI 50-6 tiny 档切进切出，窗口分母随档变化`**，落在 `test/integration/tiny-mode.test.mjs`。怎么做：真 CLI 用 1M 窗模型起会话，`/tiny` 后发一轮本地脚本化请求，读 `context` 工具 stats 的 window ∥ 压缩线 ∥ 请求预算与状态行百分比分母；再 `/normal` 后重读同一组。
- **怎么算通过**：tiny 下 window 与一切分母 = 262144，切出后全部等于模型窗口；两档工具面与提示词面不变。
- **改写**：故事 `Desktop 12`（三档模式贯穿 slash、控件、IPC 与槽，索引 `test/rtm/ends.md`）下的既有用例 **`12-1`**，证据档 `test/integration/desktop-work-mode.test.mjs`。怎么做 ∥ 怎么算通过 各增一句：读 `pageHistory(cwd, { key, before: null }).seed.usage`（百分比数值，键的有效门 = 数字 ∧ `> 0`），分母取该会话槽里的档——槽 `tiny` ∥ 配置 `normal` ⇒ 262144，槽 `normal` ∥ 配置 `tiny` ⇒ 模型窗口；判据 = 与同一槽数据经核 `sessionReading` 显式传槽档算出的候选值对拍，并先立「两方向读数不同」。用例名与既有 `flags.mode` 断言不动。
- **其余用例不改写**：既有越窗与强制压缩用例的夹具不动——它们的断言面是本链的端到端结果，与本批的窗口取值无关。
- **删除 0**。
- **RTM 落点**：`test/rtm/tooling.md` 的 CLI 50 节新增 50-6 行（怎么做 ∥ 怎么算通过 ∥ 证据列写 `test/integration/tiny-mode.test.mjs`），该节五态注记随之补成六态；`test/rtm/ends.md` 的 `12-1` 行「怎么算通过」补打开态分母判据一句，证据列不动。两行都由实施轮落盘，不在本批设计档内。
- **为什么不是 0/0/0**：tiny 上限是用户已定决定且成本可观察；`tiny-mode.test.mjs` 现有三条（50-1 ∥ 50-2 ∥ 50-3）的断言在提示词面与模块装载面，一条也不读窗口与压缩线，靠既有用例覆盖是假设不是覆盖。既有 `desktop-work-mode.test.mjs` 同理只断言 `flags.mode` 回读、不读 `seed.usage`，故 A6c 的永久看守须落进 `Desktop 12-1`。

### 关键决策

- **不改 `providerSpec`（用户 2026-11-14 口径）**：它回答模型真实窗口多大，是事实不是策略；让它返策略值，模型信息显示 ∥ ACP 会话信息 ∥ 五级链来源全部跟着说谎。
- **策略值不挂在 provider ∥ config 对象上**（少改调用面的那条路）：派生字段会被落盘 ∥ 跨会话带走，「切出 tiny 即解除」要靠下一次装配才成立。留下理由：策略只从 `workMode` 现算。
- **压缩线与 limit 一起收敛**：只降阈值不动 limit，等于「早压缩但仍放行到模型窗口」，与「上界」相反。
- **`workMode` 无默认值**：默认会把忘传静默成一条不下上限的窗口，错在账单上才发现。
- **`agent._ctxBasis` 不新增窗口位**：阈值已按有效窗口算好，`contextUsage` 握有 agent 可现取模式，多存一份就是第二个来源。

### 实施后裁决（第 3 轮 · 交付后）

**一、打开态播种面取会话自己的档（实施席照此改，验收 A6c）**

- 改动点：`thincoder-desktop/src/main/session-slots.mjs` 的 `openingSeed(data)` 现取 `workMode: resolveWorkMode(config.agent)`（全局默认档），改为 `resolveSessionWorkMode(data, config.agent)`——`data` 是该会话自己的槽，槽里的档才是这个会话的权威档。
- 依据 `docs/core/design/SESSION.md`「mode 是会话级 tiny/normal/engineering 权威值。」
- 先例：`thincoder-core/session-lifecycle.mjs` 的 `setConfigWorkMode(agent.config, resolveSessionWorkMode(data, agent.config.agent))` 已是这个用法，本处是唯一漏掉的一面。
- 为什么是缺陷不是风格：槽 `tiny` ∥ 配置 `normal` 时，打开会话看到 13%、实跑看到 51%——同一会话一屏两个分母，正是 E3 要消灭的现象。
- 验收：A6c（两个方向各一条读数）。
- 禁止面：不动 `thincoder-core/session-lifecycle.mjs`、不动核、不加窗口逻辑；发现同类只记 Leads。

**二、三条上抛的裁定**

1. 运输层 `assertPromptFits` 的 limit 保持 `requestBudget`（模型窗口）：它判的是输出合同 `max_tokens`，是物理兜底；策略上限在代理层由 `enforceContextFit` 读 `policyBudget(...).limit` 抛 `context_overflow`。两个守卫语义不同，各读各的预算，不合并、不改。
2. `thincoder-core/advisor/compaction.mjs` 不在本批单源射程：advisor 有自己一套预算（`docs/core/design/ADVISOR-GUARDS.md`），本批不碰、不改，记 Leads。
3. 打开态读数取会话自己的档，即上面第一条。

**三、集成 delta**：`test/integration/context-percent-calibrated.test.mjs` 是调用面适配，不是用例改写（用例名 ∥ 断言 ∥ 通过判据不动）。本批 delta 的取值与理由只在「集成 delta（对 `test/RTM.md`）」一处。

### 实施后裁决（第 4 轮 · 交付后上抛两项）

**一、A6c 的永久看守：补进既有集成用例 `Desktop 12-1`（§1 第 4 轮裁决 B）**

- **判据（实施轮照此落）**：在 `Desktop 12-1` 内补 `seed.usage` 两方向断言，读数点 = `pageHistory(cwd, { key, before: null }).seed.usage`。该键是**百分比数值**（`openingSeed` 的有效门 = 数字 ∧ `> 0`，否则键缺席），分母不随回执带出，故判据不是读分母，而是与同一槽数据经核 `sessionReading` 显式传「该会话槽档」算出的候选值对拍：方向 A（槽 `tiny` ∥ 配置 `normal`）等于按 262144 分母算出的那一值；方向 B（槽 `normal` ∥ 配置 `tiny`）等于按模型窗口算出的那一值。判定前先立「两方向读数不同」，否则取槽档与取配置档读同一值，检查证明不了走的是哪一路。
- 为什么不接受「零永久覆盖」：打开会话显示的用量百分比必须与该会话实跑所用档位同一条分母（E3）；A6c 落在批内单测档、收口随本批删除，这条回归收口后就再没有看守。
- 禁止面：不新增用例 ∥ 不新建测试档 ∥ 不改既有两问的断言；夹具只用本用例自己的槽与配置写入。
- RTM 行随落：`test/rtm/ends.md` 的 `12-1` 行「怎么算通过」补该分母判据，证据列不动。

**二、`sessionReading` 头注的口径（§1 第 4 轮裁决 A）**

- 权威口径 = `docs/core/design/SESSION.md` 的 mode 句（本节「实施后裁决（第 3 轮 · 交付后）」一已引）：打开态读数取该会话槽里的档，`openingSeed` 现取 `resolveSessionWorkMode(data, config.agent)` 即此口径，不改回。
- 保留的一层：`sessionReading` 自己不读槽里的 `mode`，档位由调用方传入——纯投影面，该如此。
- 口径：槽里的 `mode` 就是该会话的权威档，不是从别的会话带过来的。头注不承载「读面只认调用方当前手上的模式」这类结论——档位取哪一档由调用方按 `SESSION.md` §8 的权威句定。
- 修窗口 = 本批内已落（§5「本轮交付」）：该注现在只留契约半句 + 档位来源（`openingSeed` 取 `resolveSessionWorkMode(data, config.agent)`），依据 = `SESSION.md` §8。判据 = 令牌封印覆盖被评审的设计档 ∥ 需求档字节，产品代码不在封印内；本批不留第二份相反说明——§5 已在其「取代上文两处旧记录」把「不取槽模式」旧口径标为被推翻。

**三、设计档 Deferred 项不在本轮**：`docs/core/design/*` ∥ `docs/core/requirements/*` 本轮一律不碰。§3 第 2 轮判为 Deferred 的那些项里，落在设计档的面待收口、令牌消费后单独一轮落。

**四、机读清单与改动面对齐**：命令 = `git diff --name-only eb4870e4`；改动面里的码档与集成索引档逐档在「受影响文件（机读清单）」内有行，本轮按第 4 轮裁决 B 新增 `test/integration/desktop-work-mode.test.mjs` ∥ `test/rtm/ends.md` 两行（读数尺同清单下的行数读数一句）。

**五、本轮写域**：只写 §2；不碰设计档 ∥ 需求档 ∥ 产品代码 ∥ 任何测试档。

### 上抛

无（§1 第 4 轮那两条上抛已由主 agent 裁定，落点就是本节一 ∥ 二）。

### 设计档对齐轮（§3 轮次 5 第 1 项 + §5「落地核对」两处）

本轮写域 = 设计档 `docs/core/design/CONTEXT-COMPACTION.md` 与本节；产品代码 ∥ 测试档 ∥ 需求档零触碰。

- **必填清单补 `historyPercent`**（设计档 §2.3）：清单漏了它——它是 `historyReading` 的 provider-only 薄转口，同样没有默认值；拒绝由 `historyReading` 那一层抛，`historyPercent` 自身不带入口校验。补后七名齐全，与落地签名逐名相符。
- **打开态读数示例改四参**（同节）：原例是三参，落地为四参——第四参 `workMode` 由桌面播种面 `openingSeed` 以该会话自己的槽档传入（本节「实施后裁决（第 4 轮 · 交付后）· 一」）。
- **`collectStaleToolOutputs` 示例改三参**（同节）：原例 `(history, provider)`，落地为 `(history, provider, workMode)`——同一条必填规则在同一节的第二处实例，随本轮一并改，不留半截。
- **本节「实施后裁决（第 4 轮 · 交付后）· 二」的修窗口口径**：按 §1 第 4 轮裁决 A 记为「本批内已落」，并写明令牌封印的覆盖面只到被评审的设计档 ∥ 需求档字节。

依据（实读本仓）：`thincoder-core/token-window.mjs` 的 `historyPercent(history, provider, ratio, workMode)` ∥ `collectStaleToolOutputs(history, provider, workMode)`；`thincoder-core/session-lifecycle.mjs` 的 `historyPercent(line, provider, sampleRatio(data.estimateSample, provider), workMode)`。

**不在本轮**：§3 轮次 2 判 Deferred 的七项 🟡（会话标题归属、子代理准入、安全下界与摘要长度目标、「三条记录消息」与 taskState 可空互斥、五态回调、advisor 是否在单源射程）是设计档措辞与覆盖缺口，按 §1「交付后第 4 轮裁决」三不在本批；由父侧记台账行，收口后单独一轮落。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 设计评审结论（第 1 轮）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | §2「集成 delta」判「新增 0 ∥ 改写 0 ∥ 删除 0」；同段理由「夹具改窗口取值即覆盖」与「改写 0」互斥（改夹具即改写，须按用例名列出） |
| 2 | 🔴 | 未决 | 该 delta 的不写用例理由不是唯一成立的那一条：tiny 上限是用户已定决定（§1「进 tiny 模式限制，进别的模式解除限制」）+ 成本可观察，`test/integration/tiny-mode.test.mjs` 的断言面（项目规则保留、知识工具、注入收窄、模式恢复）不读窗口与压缩线 |
| 3 | 🟡 | 未决 | E1 后半「切出即回到模型窗口」只有 A1 的纯函数读数，运行中切档后的下一次派生面（stats ∥ 守卫 ∥ 尾部）无验收行；A1–A5 也未给改动面单测文件的可跑命令 |
| 4 | 🟡 | 未决 | 设计档 §2.3 的拒绝支来由是设想（「默认值把「忘传」静默成一条不下上限的窗口」），真实透传面（§2.3「只握有 provider 的面把它当参数透传」）未点名 |
| 5 | 🟡 | 未决 | §2 无「最近先例」一行（实现坐标 ∥ 设计档章节 ∥ 先例批次 + 对齐 ∥ 偏离理由）；`model-specs.mjs` re-export 只出现在受影响文件表的一格 |
| 6 | 🟡 | 未决 | §2 勘察证据只覆盖仓内 grep 与两处读档；§1「库外 = B 类」未进 §2 |
| 7 | 🟡 | 未决 | §2「设计档落点」只列两份设计档并明示 CONFIG.md 不动，需求层落点缺位 |
| 8 | 🟡 | 未决 | CONTEXT-COMPACTION 设计档 §1.1「不靠丢用户与模型的原文」与 §4「无中段时 shrinkOversized 截断单条超大内容」的适用面未定 |
| 9 | 🟡 | 未决 | 设计档 §2.2「四个 provider 发送面」未点名；E3 的「四个派生面」是另一组四值，同一档内两个「四个」 |
| 10 | 🔵 | 备注 | 档位读数复测：`config.mjs` 内容行 = 505（与表内读数同）、`session-lifecycle.mjs` = 473、`token-window.mjs` = 289 同；分拆方案与量法命令均在 §2 |
| 11 | 🔵 | 备注 | §2 无函数档位一句（CODE-TIER §3 先函数后文件）；抽测 `loadConfig` ∥ `applySession` ∥ `finalizeAgentTurn` ∥ `compressIfNeeded` 均未达 300 行 |
| 12 | 🔵 | 备注 | 已有件核查成立：§2「已查无（新落点 `effectiveWindow` ∥ `policyBudget`）」给出 grep 面与「故新建而非复用」 |

VERDICT: changes-required

计数：🔴 2 · 🟡 7 · 🔵 3

### 轮次 2（评审子代理）

## 设计评审（CONTEXT-COMPACTION ∥ PROMPT-SYSTEM 需求档 + 设计档）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 报告 | 需求 `requirements/CONTEXT-COMPACTION.md` §1「…恢复回声、会话标题和文本截断由 core 提供同一语义」；设计档全文无「标题」∥「title」落点 |
| 2 | 🟡 | 报告 | 需求 §6 末句「子代理没有全史回查面时，不提供这组主动操作；阈值兜底仍有效」；设计 §7 三小节无准入面（全文无「子代理」∥「depth」） |
| 3 | 🟡 | 报告 | 需求 §3「比例不得低于当前安全下界」与 §4「摘要有当前长度目标」；设计 §3 ∥ §6 无对应句 |
| 4 | 🟡 | 报告 | 设计 §1.1「该轮三条记录消息全部落在切割点之前才算覆盖」与同节「没有工具活动的简单问答允许 taskState 为空」互斥；`turn-projection.mjs` 的 `turnRecordMessages` 三条皆条件 push |
| 5 | 🟡 | 报告 | 设计 §2.3 必填清单六项未含 `historyPercent`（`token-window.mjs` 里它是 `historyReading` 的 provider-only 薄转口）；同节把 `collectStaleToolOutputs(history, provider)` 列为透传面，而其函数体调 `keepTailSize(provider, h.length)` |
| 6 | 🟡 | 报告 | 需求 §2 只有「仍失败则 typed error，不静默截断」；设计 §5 已把「固定开销单独越 limit」写成 norm（`reason` = `overhead_exceeds_limit`、`force` 也拦、`/compact` 回执 no-op） |
| 7 | 🟡 | 报告 | 需求 §8 五态「压缩开始、进行中、成功、失败和降级」+「headless 没有回调时安全 no-op」；设计 §9 只写 `onCompressStart/onCompress/onCompressFail` 并称「只呈现生命周期」 |
| 8 | 🔵 | 记录 | 设计 §1.1「上限只留在摘要面」；`turn-task-state.mjs` 另有 `MAX_VERIFICATION` ∥ `MAX_CHANGED_FILES` ∥ `MAX_EVIDENCE` ∥ `MAX_REMAINING` 计数上限（`ledger.verification.shift()` 静默丢最旧） |
| 9 | 🔵 | 记录 | 本轮评审范围不含批次 §2：代码档位结论、先例行、勘察行、RTM 集成增量在 §2 面不可核；设计档未携带受影响文件表 ∥ 行数 ∥ 验收行 ∥ 用例表（符合 F-R24a，第 14 条不成立） |
| 10 | 🔵 | 记录 | 设计 §2.1「窗口派生的一切读数…全从它取，端侧不另立算式」；`advisor/compaction.mjs` 仍有 `usableWindow(spec.context, outputReserve(provider, spec))` 自算式，设计档未裁定该面是否在单源范围内 |

已实读、不构成缺陷的点：

- 设计 §6 三处代码引文逐字在场：`dispatch-run.mjs`「User interrupt (Ctrl+C / Ctrl+I) must propagate, not become a tool error」· `agent-turn.mjs`「Save session after every turn (survives crashes)」· `turn-task-state.mjs`「槽是盘上用户数据，本函数不抛」。
- 设计 §5 固定开销格的来由实读：`test/integration/turn-history-projection.test.mjs`「本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限」。
- `capText` 现为 `str(v)`（无截断），支持 §1.1「用户请求与最终回复…没有长度上限」。
- `requestBudget(provider, spec)` ∥ `usableWindow` ∥ `resolveWorkMode` ∥ `ctxUsageForHistory` ∥ `ctxPercentForHistory` 与四个发送面，均与设计 §2.2 ∥ §2.3 所述坐标一致。
- 两档四份文档均无行号锚、无修订残迹；`window-policy.mjs` ∥ `effectiveWindow` ∥ `policyBudget` 在盘上零命中（属本批待建，设计以目标态表述）。

VERDICT: pass

计数：🔴 0 · 🟡 7 · 🔵 3

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-14

### 代码评审（第 1 轮 · 交付前）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | 调用面迁移未落地：`render-loop.mjs` `ctxCacheOf` 三参调 `historyReading` · `specs.mjs` `ctxUsageForHistory` 同形（设计 §2.3 点名的透传面）· `agent-host.mjs` `ev:usage` 同形 · `cmd-config.mjs` ∥ `model-picker.mjs` ∥ `provider-admin.mjs` 两参调 `resolveCompactThreshold`；在盘 `context-percent-calibrated.test.mjs` 经 `ctxCacheOf` 走该路径 ⇒ §5 自记 `fail 3` |
| 2 | 🟡 | 未决 | `ctxCacheOf` 失效键仍取 `providerSpec(agent?.provider).context`：补上档位参数后切档仍不刷状态行百分比（E1「切出即解除」在该面无读数） |
| 3 | 🟡 | 未决 | 四个发送面把 `requestBudget`（模型窗口）同时交给发送面净判 ⇒ tiny 档在 262144 < estPrompt ≤ 模型 limit 带内无运输面兜底；设计 §2.2 把「发送前守卫」派给 `policyBudget`，§5 又指 `enforceContextFit`，两读并存待裁定 |
| 4 | 🟡 | 未决 | `advisorContextBudget` 仍 `usableWindow(spec.context, outputReserve(provider, spec))` 自算；设计 §2.1「端侧不另立算式」未裁定该面（§3 第 2 轮第 10 项 Deferred 未落） |
| 5 | 🟡 | 未决 | 打开态读数取 `resolveWorkMode(config.agent)`，会话实跑取槽模式 ⇒ 槽 mode ≠ config mode 时分母两值；`sessionReading` 自述「同源同式」需一句裁定 |
| 6 | 🔵 | 记录 | `token-window.mjs` 头注「四个函数入口」与设计 §2.3 六名清单不同数 |
| 7 | 🔵 | 记录 | tiny 档 `windowSource` 照抄模型来源名（stats 读成 `window 262144 (spec)`）——§2.2 裁定，登记备查 |

VERDICT: changes-required

计数：🔴 1 · 🟡 4 · 🔵 2

### 轮次 4（评审子代理）

### 代码评审（交付后复核 · §2 实施后裁决第 3 轮 一）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 未决（收口前必修） | §5「验收读数」仍写「结果：`tests 7 · pass 7 · fail 0`」与「（A1–A6 + A6b 全在此档，收口随本批删除）」；交付的批内单测档现有 8 条顶层用例（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A6 ∥ A6b ∥ A6c）。§1 实施后裁决一的验收句「跑该档与 `test/integration/tiny-mode.test.mjs`，计数写 §5」未落地；同段「越单改动」表 session-slots.mjs 一行仍写「（`resolveWorkMode(config.agent)`——不取槽模式，避免「跨会话带走」）」，与交付代码相反 |
| 2 | 🟡 | 协调项（父侧/设计席） | 同一机制两处活描述相反：`sessionReading` 注「不从槽里的 `mode` 取」「一个旧会话就带着 256K 上界进来」「读面只认调用方当前手上的模式」 ⇔ `session-slots.mjs` 注「槽里的 `mode` 才是该会话的权威档」。实现席禁止面含 `session-lifecycle.mjs`，故非本席可改；与排除项「文档漂移」有重叠，只作协调项 |
| 3 | 🟡 | 协调项（父侧决定） | A6c 是该修复的唯一覆盖且在批内档（收口删除）；`desktop-work-mode.test.mjs`「页读从槽恢复 mode」只断言 `flags.mode`，不读 `seed.usage` ⇒ 收口后该回归零永久覆盖 |
| 4 | 🔵 | 记录 | `openingSeed` 内再 `loadConfig()` 一次，与 `pageHistory` 外层「同一次配置读同时供旧槽模式回退与 provider 投影」不同步；首屏读配置解析两次 |
| 5 | 🔵 | 记录 | `openingSeed` 的 `sessionReading(data, { … })` 单行 200+ 字符，与文件行长风格不一致 |
| 6 | 🔵 | 记录 | A6c 末条「assert.ok(tinyReceipt.seed.usage > normalReceipt.seed.usage * 2」对已四舍五入的整数百分比做比例断言，与其上两条精确候选等值断言重复，夹具一变即可能翻红 |

已核实、不构成缺陷的点：

- 改动点 `workMode: resolveSessionWorkMode(data, config.agent)` 与 §2 第 3 轮一逐字同向；无窗口逻辑、未动核、未动 `session-lifecycle.mjs`。
- `resolveSessionWorkMode` 回落链（槽合法 mode → 槽 `engineering` 布尔 → 配置档）使老槽无 `mode` 时行为与改前一致。
- `loadConfig` 无进程内缓存（每次 `JSON.parse(readFileSync(path, "utf8"))`），故 A6c 两方向都能辨伪。
- 测试引用的导出与参数位实数存在：`session.mjs` re-export `sessionReading` ∥ `historyPercent(history, provider, ratio, workMode)` ∥ `_setConfigPathForTest` ∥ `_setSessionsDirForTest`；`registerHooks` 有 `desktop-work-mode.test.mjs` 先例。

VERDICT: changes-required

计数：🔴 0 · 🟡 3 · 🔵 3

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 报告（parent/设计席补一句取代） | 批次档 §2「实施后裁决（第 4 轮 · 交付后）」二仍写「该注在产品代码里，本批内不动（改它要重开已封印的档）」，而 `session-lifecycle.mjs` 的 `sessionReading` 头注本轮已按裁决 A 改写（用户开窗口）——同一面两读并存，读者无法判哪份为真 |
| 2 | 🟡 | 协调项（非阻断） | §5「交付后实施轮」的「读数」段无本轮三项的实跑读数（12-1 `seed.usage` 两方向的绿 ∥ 红探针 ∥ 头注改写）；证据只在会话背景，收口面缺可复核指针 |
| 3 | 🔵 | 记录 | 批次档 §1 状态行「残：openingSeed 取槽档收尾」已由上一轮 §5 落完，状态行滞后 |
| 4 | 🔵 | 记录 | `desktop-work-mode.test.mjs` 的 `writeConfig` 改写模块级共享 `config.json` 且不还原，同档第二个用例随后跑在同一份带 provider 的配置上 |
| 5 | 🔵 | 记录 | `test/rtm/ends.md` 12-1「怎么做」未随判据补句，与 §2「集成 delta」的「怎么做 ∥ 怎么算通过 各增一句」不同 scope（第 4 轮一只要求「怎么算通过」） |
| 6 | 🔵 | 记录 | `session-lifecycle.mjs` 头注 ④ 写「核 `historyReading`」而函数体调 `historyPercent`；「（§2.3）」未点名文档；未写 `workMode` 必填（缺即由 `historyPercent` 抛） |

VERDICT: pass

计数：🔴 0 · 🟡 2 · 🔵 4

## §4 用户批准（主 agent）

**批准依据**：用户 2026-11-14 在本批开工前给的是**批级授权**——「**都自动跑完吧，可以按顺序跑**」（原文已记 §1「自动推进」行）。据此本批的设计评审起评、实施派单、修面派单一律自动推进，不逐步停等。

**设计评审**：第 1 轮判 changes-required（2 🔴 复合为一条、7 🟡、3 🔵），修面一轮后第 2 轮 **VERDICT: pass**（0 🔴、7 🟡、3 🔵）；凭证 `a2c5edc7…`、designId `208e323d…` 由评审签发。

**实施授权范围**：§2 条目 E1–E3 与验收 A1–A6c。实施期三次追加授权（六处端侧调用面、`openingSeed` 取槽档、`sessionReading` 头注与 `Desktop 12-1` 永久看守）均由我在 §1 记明理由后开窗，逐条可溯。

**未逐条确认的说明**：本批未对每一轮单独征求确认，依据是上述批级授权；本行写明这一点，免日后把「自动推进」误读成「逐条批准」。

## §5 实施记录（eng-coder）

### 实施摘要（eng-coder · 2026-11-14）

按 §2 落地：窗口事实（`providerSpec` 五级链）与窗口策略（`effectiveWindow`）分家，策略出口单出一档 `thincoder-core/window-policy.mjs`；一切以窗口为分母的读数（压缩线 ∥ limit ∥ 尾部两式 ∥ 百分比分母 ∥ prune 保护尾）改取有效窗口；发送面（max_tokens）仍只读模型窗口。

- 新档：`thincoder-core/window-policy.mjs`（160 内容行）——`TINY_WINDOW_CAP = 262144` ∥ `effectiveWindow(provider, workMode)` ∥ `policyBudget(provider, spec, workMode)`；迁入 `config.mjs` 的预算族（`COMPACT_RATIO` ∥ `outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥ `resolveCompactThreshold`），算式逐字。
- `config.mjs`：预算族 re-export（导入面零改）；装载期 auto 派生改调带档位的 `resolveCompactThreshold`（426 内容行，已回到 500 设计时线内）。
- `token-window.mjs`：`keepTailSize` ∥ `tailBudgetTokens` ∥ `historyReading` ∥ `historyPercent` ∥ `collectStaleToolOutputs` 增必填 `workMode`（末位参数，既有实参位置不前移）；`contextUsage` 自 `agent.config` 现取档位。
- `context.mjs` ∥ `agent/run-stages.mjs` ∥ `agent-tools/context.mjs` ∥ `agent/setup.mjs` ∥ `session-lifecycle.mjs`：压缩阈值 ∥ 守卫 ∥ stats ∥ prune ∥ 每 run 阈值 ∥ 打开态读数全部改取有效窗口。
- `provider/errors.mjs`：`assertPromptFits` 不再自算预算，改读调用方已算好的预算对象（缺参即拒，点名 `budget`）。

### 条目对照

| 条目 | 状态 | 落点 |
|---|---|---|
| E1 tiny 有效窗口 = min(模型窗口, 262144)，切出即解除，模型更小取小，normal ∥ engineering 不设上限 | ✅ | `window-policy.mjs` `capWindow` / `effectiveWindow`；读数见 A1 ∥ A6 |
| E2 262144 是覆盖策略值，其余仍走既有压缩机制（零新裁剪 ∥ 零新拒绝路径） | ✅ | 只换输入窗口：`compressIfNeeded` / `compressFallback` / `enforceContextFit` 判据与分支零改（A3 以「小窗模型两档逐位相等」为证） |
| E3 压缩线 ∥ 尾部预算 ∥ 用量百分比 ∥ 发送前守卫同取有效窗口 | ✅ | `policyBudget` 三消费（`context.mjs` 固定开销判据 ∥ `run-stages.mjs` 守卫 ∥ `agent-tools/context.mjs` stats）+ `effectiveWindow` 三消费（`keepTailSize` ∥ `tailBudgetTokens` ∥ `historyReading`） |

### 验收读数

批内单测档 `docs/batches/2026-11-14-tiny-window-cap.test.mjs`（A1–A6 + A6b 全在此档，收口随本批删除）：

- 命令：`node --test docs/batches/2026-11-14-tiny-window-cap.test.mjs`
- 结果：`tests 7 · pass 7 · fail 0`
- 失败面（同一命令）：把 `workMode` 去掉即红（A5 六处 `assert.throws(/workMode is required/)` 在缺省与非法值两支各跑一次）；A6 的「不残留」断言逐个读数与 tiny 档对照；A6b 切档后不得命中旧帧。

集成面：`node --test test/integration/tiny-mode.test.mjs` → `tests 4 · pass 4 · fail 0`（新增 `CLI 50-6`）。

### 越单改动（本席写域外 / §2 机读清单外，各带理由）

第 2 段父侧追授「六处端侧调用面由本席补齐」后，本节分两组：A 组 = 核心侧与测试侧（本席写域外的 7 档），B 组 = 端侧七档（见下节「端侧调用面补齐」逐行披露）。

| 档 | 理由 |
|---|---|
| `thincoder-core/provider/anthropic.mjs` | `assertPromptFits` 第四参：本档算好的 `budget` 下沉为变量并传入（§2「错误档读调用方已算好的预算对象」要求，改签名即改调用面） |
| `thincoder-core/provider/google.mjs` | 同上；顺带把 `requestBudget(provider)` 两次调用收成一处 |
| `thincoder-core/provider/responses.mjs` | 同上（本档无现成 budget，就地取一次） |
| `thincoder-core/context-degrade.mjs` | `collectStaleToolOutputs` 第三参：prune 保护尾跟着有效窗口走，档位自 `agent.config` 现取 |
| `thincoder-desktop/src/main/session-slots.mjs` | `sessionReading` 新增 `opts.workMode` 后，打开态播种面必须传当前档（`resolveWorkMode(config.agent)`——不取槽模式，避免「跨会话带走」） |
| `test/integration/context-percent-calibrated.test.mjs` | CLI 16-1 直接调 `historyPercent`，补第四参 `resolveWorkMode(agent.config?.agent)`（只改调用面，断言与用例意图一字未动） |
| `thincoder-core/provider/core.mjs` | 在本次 spawn 写域内，但 §2 机读清单缺这一行（登记补漏）：OpenAI 兼容发送面的 `assertPromptFits` 同样要传本档已算好的 `budget`，与另外三个发送面同形 |

分类如实记：`provider/core.mjs` 是 **spawn 写域内 · 清单缺行**（本条为登记补漏）；其余六档是 **清单外且 spawn 写域外**（不改则签名变更留下半截调用面）。

集成 delta 对账：RTM 索引面仍是 **新增 1 · 改写 0 · 删除 0**（50 节只添 50-6 一行、五态注记改六态）；`context-percent-calibrated.test.mjs` 的改动是既有用例的**调用面适配**，不改变例名 ∥ 断言 ∥ 通过判据，故不计为「改写用例」。`tiny-mode.test.mjs` 既有 50-1 ∥ 50-2 ∥ 50-3 三条与其它越窗 ∥ 强制压缩用例的夹具未动。

### 端侧调用面补齐（第 2 段 · 父侧裁定「由本席补齐，无第七处」后落）

父侧独立 grep 复核结论 = 六处，无第七处；本席逐处改，各一行：

| 档 | 为什么必须改 |
|---|---|
| `thincoder-cli/src/tui/render-loop.mjs` | `ctxCacheOf` 调 `historyReading(history, agent?.provider, ratio)`，新签名要求第四参；不改则 CLI 状态行每次取读数即抛 `workMode is required`（是端面直接抛错，不是少显示一位数） |
| `thincoder-vscode/src/specs.mjs` | 设计 §2.3 点名的三处透传面之一：`ctxUsageForHistory` ∥ `ctxPercentForHistory` 只握 history ∥ provider ∥ ratio，无档位可取；不改则 VSC 每次 `onUsage` 帧抛错。本席给它加必填 `workMode` 形参 |
| `thincoder-vscode/src/extension/panel-callbacks.mjs` | `specs.mjs` 的宿主面，握有 `panel._agent`：按 §2.3「握有 agent 的面自取」传 `resolveWorkMode(panel._agent?.config?.agent)`；不改则上一行的新形参永远拿不到值（这一环不补，链断在中间） |
| `thincoder-desktop/src/main/agent-host.mjs` | `postUsage` 调 `historyReading(agent.history, agent.provider, tokenRatioOf(agent))`；不改则桌面 `ev:usage` 帧抛错，且 tiny 档分母仍是模型窗口 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 动态 import 的 `resolveCompactThreshold(null, agent.provider)` 两参调用；入口校验档位，两参即抛——`/config` 改完渠道后刷新压缩线这一步会炸 |
| `thincoder-cli/src/tui/model-picker.mjs` | 同上，`/model` 选定模型后刷新 `compactThresholdResolved` 那一步会炸 |
| `thincoder-cli/src/tui/provider-admin.mjs` | 同上，`modelContext` 覆盖写入后刷新压缩线那一步会炸 |

外加一处随之而动的机制面（不是第七处调用点，是同一文件的缓存键）：`render-loop.mjs` 的 `ctxCacheOf` 失效键第三项由 `providerSpec(...).context` 改成 `effectiveWindow(...)`。理由 = E3 的正题：模型窗口在切档时不变（1M 模型进 tiny 仍是 1M），键取模型窗口就永远命中旧帧，`pct` 沿用旧分母，「切出即解除」在状态行这一格上不成立。

**读数（同一 history，两种档位）**：`{ modelWindow: 1048576, tinyWindow: 262144, tokens: 134000, pctTiny: 51, pctNormal: 13 }`——`historyPercent` 的 `pct` 在 tiny 档 51%、normal 档 13%。该读数已固化为批内单测 A6b（`ctxCacheOf` 三判：切档不命中旧帧 ∥ 两档 `pct` 不同 ∥ 未切档仍走原引用）。

补齐后的验证读数（逐档单跑）：

- `docs/batches/2026-11-14-tiny-window-cap.test.mjs` → tests 7 · pass 7 · fail 0（A1–A6 + A6b）
- `test/integration/tiny-mode.test.mjs` → tests 4 · pass 4 · fail 0
- `test/integration/tool-description-tiers.test.mjs` → tests 2 · pass 2 · fail 0
- `test/integration/context-overflow-guard.test.mjs` → tests 10 · pass 10 · fail 0
- `test/integration/context-percent-calibrated.test.mjs` → tests 1 · pass 1 · fail 0（**CLI 16-1 的级联红已消**）
- `node --check`：改动 ∥ 新增的 25 档全过
- 全量 `node --test test/integration/*.test.mjs` → tests 215 · pass 213 · fail 2，两条红都在 `doc-anchor-graph.test.mjs`（`CLI 43-1` 第一跳须含设计档 ∥ `CLI 43-2` `EDIT.md` §5 反向引用计数），属文档锚图内容面、与本批无 import 面交集（该批同期有别的席位在改设计 ∥ 需求档，图内容随文档动）。

### 读数为证（整仓集成面 · 补齐前）

- 命令：`node --test test/integration/*.test.mjs`
- 读数（**补齐六处调用面之前**）：`tests 215 · pass 212 · fail 3`；补齐后的读数在同节上方「端侧调用面补齐 → 补齐后的验证读数」：`tests 215 · pass 213 · fail 2`。
- 三条红与归属：
  - `CLI 16-1`（`context-percent-calibrated.test.mjs`）——本批级联：`ctxCacheOf` 当时未带档位，报错原文 `effectiveWindow: workMode is required and must be one of tiny / normal / engineering — got undefined`。**已随六处补齐转绿**（单跑 `tests 1 · pass 1 · fail 0`）。
  - `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph.test.mjs`）——文档锚图内容面（`req:F16` 第一跳、`EDIT.md` §5 引用计数），与本批改动无 import 面交集；同期有别的席位在改设计 ∥ 需求档，图内容随文档动，故按「非本批」记录。**补齐后仍是这两条**。
  - 附带一条：`CLI 46-1`（`cross-instance-message.test.mjs`）与 `CLI 34-1`（`browser-shared-pool.test.mjs`，临时目录 `session.lock` 的 `EEXIST`）在个别全量跑里红，单跑不复现；与本批无 import 面交集，按环境 ∥ 并发抖动记录。

### 落地核对

- **落地核对：无**（设计档 §2.1 / §2.2 / §2.3 / §4 的句子与本席落地逐条相符；`providerSpec` 输出、发送面 max_tokens 语义均逐位不变）。

### 线索（本批外，供父侧处置）

- `thincoder-core/advisor/compaction.mjs` 仍自算 `usableWindow(spec.context, outputReserve(provider, spec))`：tiny 档下 advisor 侧的预算线仍按模型窗口算。设计 §2.1「端侧不另立算式」是否覆盖该面，评审第 2 轮第 10 条已判「实施后补一句」，故本席未动。
- `policyBudget().windowSource` 在 tiny 档逐位照抄模型窗口的来源名（§2.2 裁定），故 stats 的 `Request budget: window 262144 (spec)` 会读成「模型窗口是 262144」。照设计执行，登记备查。
- `thincoder-desktop/node_modules/@thincoder/core` 是陈旧快照（无 `resolveWorkMode` 导出），桌面端对本仓核的读面走该副本——非本批引入，登记备查。

### 交付后实施轮（§2 第 3 轮「一」+ A6c）

**改动（两档，均在 §2 机读清单内）**

- `thincoder-desktop/src/main/session-slots.mjs`：`openingSeed` 的 `sessionReading` 第四参由 `resolveWorkMode(config.agent)`（全局配置档）改为 `resolveSessionWorkMode(data, config.agent)`（该会话自己的槽档）。导入面随之收成 `{ loadConfig, resolveSessionWorkMode }`——改后本档不再使用 `resolveWorkMode`。
- 同档注释两处改述：导入区改为「档位取本会话自己的槽…配置档只在槽未记档时兜底…与同回执 `slotFlags` 同源」；`openingSeed` 文档串增一句「档位 = 本会话自己的槽——打开态分母与该会话实跑同一档」。
- `docs/batches/2026-11-14-tiny-window-cap.test.mjs`：新增 A6c（两个方向各一条读数）。

**A6c 怎么做的**

- 解析面：`node:module` 的 `registerHooks` 把 `@thincoder/core/*` 指到源树（桌面开发目录 `node_modules/@thincoder/core` 是物化旧副本、无本批新符号；同式 = `test/integration/desktop-work-mode.test.mjs`）。
- 沙箱面：`_setConfigPathForTest` ∥ `_setSessionsDirForTest` 指到临时目录，写槽后从桌面真入口 `pageHistory(cwd, { key, before: null })` 读 `seed.usage`。
- 判据面：与同一槽数据经 `sessionReading` 显式传档算出的两条候选值对拍，并先立「两档读数不同」前提——否则两条路不可分辨。

**读数**

- `node --test docs/batches/2026-11-14-tiny-window-cap.test.mjs` → `tests 8 · pass 8 · fail 0`（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A6 ∥ A6b ∥ A6c）
- `node --test test/integration/tiny-mode.test.mjs` → `tests 4 · pass 4 · fail 0`
- `node --test test/integration/desktop-work-mode.test.mjs` → `tests 2 · pass 2 · fail 0`（该档走 `pageHistory` → `openingSeed`，是本改动的回归面）
- `node --check`：上面两档均过

**失败面读数（同一命令）**：把第四参临时退回「只取配置档」（`resolveSessionWorkMode({}, config.agent)`）⇒ `tests 8 · pass 7 · fail 1`，A6c 在「槽 tiny：打开的百分比按 262144 分母」处 `AssertionError`；随即还原并复跑转绿。

**取代上文两处旧记录（不改旧行，以本节为准）**

- 上文「验收读数」的 `tests 7 · pass 7 · fail 0` 与「A1–A6 + A6b 全在此档」：现读数为 `tests 8 · pass 8 · fail 0`，档内为 A1–A6 ∥ A6b ∥ A6c。
- 上文「越单改动」表 `thincoder-desktop/src/main/session-slots.mjs` 一行写的是「`resolveWorkMode(config.agent)`——不取槽模式」；该口径已被 §2 第 3 轮「一」推翻。
- 本档现取 `resolveSessionWorkMode(data, config.agent)`（槽档权威、配置档兜底），依据 = `docs/core/design/SESSION.md` §8「mode 是会话级 tiny/normal/engineering 权威值。」。

**越单改动**：本席写域 = 上面两档，两档都在 §2 机读清单内 ⇒ **无清单外改动**。

**内部审计（explore · 1 轮）**：`AUDIT: 2 findings (1 blocking)`。

- blocking 1 条：本段（§5）未落本轮记录、且旧行与交付相反 ⇒ 已由本节修（补读数 + 点名取代）。
- advisory 1 条：`openingSeed` 文档串的「`docs/desktop/design/IPC.md` §2『打开态播种注』」是死指针（IPC.md 现只有 §2.1–§2.4，无此注）⇒ 转「线索」，本轮未改（理由见该条）。

**代码评审（advisor · 1 轮 · changes-required · 🔴 0 ∥ 🟡 3 ∥ 🔵 3）**：明细在 §3 轮次 4。

- 🟡1 §5 缺 A6c 读数、旧行与交付相反 ⇒ **已修**（本节）。
- 🟡2 `sessionReading` 头注与本档注释对同一机制结论相反 ⇒ 非本席写域（禁止面含 `thincoder-core/session-lifecycle.mjs`），转父侧 ∥ 设计席落一句裁定。
- 🟡3 A6c 是该修复的唯一覆盖且随收口删除 ⇒ 父侧裁是否扩集成 delta（`desktop-work-mode.test.mjs` 补 `seed.usage` 断言，或明确接受零永久覆盖）。
- 🔵5 `openingSeed` 调用单行 200+ 字符 ⇒ **已修**（分行，档位来源单列一行）。
- 🔵4 首屏读两次 `loadConfig()` ⇒ **未改**：合成一次会把「配置不可读」从 `console.error` + `usage` 缺席改成静默零值，与本档文档串「零静默」冲突，属行为改动，不入本轮。
- 🔵6 A6c 末条比例断言与其上两条精确等值重复 ⇒ **未删**：它是唯一的跨方向量级交叉核对，夹具为常量、无抖动源，收口随档删除。

**终态：`clean`**（本席写域）——审计 1 blocking 已修、1 advisory 转线索；评审 3 条 🟡 中 1 条已修、2 条非本席可改（转父侧）；🔵 1 修、2 维持并给出理由。子修复轮次 = 1。

**落地核对：无**

- 设计档 §2.3 把打开态读数列为「只握有 provider 的透传面」并写「档位由调用方传入」，未规定调用方取哪一档 ⇒ 本轮改动不使任何设计档句子失真。
- `providerSpec` 输出与发送面 max_tokens 语义零动。

**线索（本批外，供父侧处置）**

- `docs/desktop/design/IPC.md` §2「打开态播种注」在 IPC.md 中已不存在（现结构 = §2.1–§2.4）；同指针共四处（本档两处、`renderer/page-read.mjs` 两处）。改指需知道该注内容迁去了哪一节，属桌面设计档笔域，故本轮只登记。
- `thincoder-core/session-lifecycle.mjs` 的 `sessionReading` 头注写「不从槽里的 `mode` 取…一个旧会话就带着 256K 上界进来；读面只认当前手上的模式」，与 §2 第 3 轮「一」及 SESSION.md 权威句相反；禁止面含该档 ⇒ 请设计席一句裁定（改注，或回退本处取法）。

### 内部审计与代码评审（轮次 · 终态 · 本批首交付轮）

> 时序：本节 = 首交付那一轮；紧接其上方的「交付后实施轮」是 §2 第 3 轮裁决后的第二轮，最新读数与终态以那一节为准。

**内部勘察审计（explore · 1 轮）**：`AUDIT: 7 findings (1 blocking)`。

- blocking 1 条：`thincoder-core/provider/core.mjs` 已改但越单表未登记（它在本次 spawn 写域内、§2 机读清单缺行）⇒ **已修**（补登记 + 写明该分类）。
- advisory 6 条：均已登记；另补一句集成 delta 对账（RTM 索引面仍 新增 1 · 改写 0 · 删除 0；测试档改动是调用面适配，非用例改写）⇒ **已修**。
- 该审计未发现部分实现 ∥ 静默简化 ∥ 设计档漂移；A1–A6 ∥ E1–E3 ∥ RTM 行与六态按静态读面判 verified（该席无 shell，未执行 `node --test`，已自述）。

**代码评审（advisor · 1 轮 · changes-required · 🔴 1 · 🟡 4 · 🔵 2）**：

| # | 严重度 | 处置 | 说明 |
|---|---|---|---|
| 1 | 🔴 | **已修（第 2 段）** | §2 清单内六处端侧调用面按旧实参调 `historyReading` ∥ `resolveCompactThreshold`（`render-loop.mjs` ∥ `specs.mjs` ∥ `agent-host.mjs` ∥ `cmd-config.mjs` ∥ `model-picker.mjs` ∥ `provider-admin.mjs`）。父侧第 2 段裁定「由本席补齐，无第七处」后逐处补齐，`CLI 16-1` 随之转绿；每处一行记在上方「端侧调用面补齐」表。 |
| 2 | 🟡 | **已修（第 2 段）** | `ctxCacheOf` 的失效键改为 `effectiveWindow(...)`：键取模型窗口时切档不刷新百分比。读数已固化为 A6b（tiny 51% ∥ normal 13%，同一 history）。 |
| 3 | 🟡 | 待裁 · 设计面 | 四个发送面的 `assertPromptFits` 共用 `requestBudget`（模型窗口），tiny 档 `262144 < estPrompt ≤ 模型 limit` 这一带无运输面兜底；设计 §2.2 把该职能写给 `policyBudget`，§5 又指 `enforceContextFit`，两读并存。改它要贯穿四个 transport（档位透传），超出本批设计给的面。 |
| 4 | 🟡 | 待裁 · 设计面 | `advisor/compaction.mjs` 仍自算 `usableWindow(spec.context, …)`；设计 §2.1「端侧不另立算式」是否覆盖该面，§3 第 2 轮第 10 条已 Deferred。 |
| 5 | 🟡 | 待裁 · 设计面 | `sessionReading` 的档位来源：桌面播种取全局配置档，会话实跑取槽模式 ⇒ 槽 tiny ∥ 配置 normal 时分母两值。两种取法都能自圆，要一句裁定。 |
| 6 | 🔵 | 已修 | `token-window.mjs` 头注「四个函数」与 §2.3 六名清单不同数 ⇒ 改为点名本档四个入口 + 一处透传，必填清单只指 §2.3。 |
| 7 | 🔵 | 维持（备查） | tiny 档 `windowSource` 照抄模型来源名，stats 读成 `window 262144 (spec)`——§2.2 裁定。 |

**终态：`clean`（本席写域 + 第 2 段追授域）**——评审 🔴 1 与 🟡 2 已修（含六处端侧调用面与缓存键），评审 🔵 1 已修、1 维持备查；审计 1 blocking 已修。剩 3 条 🟡 是**设计面裁定**（`assertPromptFits` 取哪一边的 limit ∥ `advisor/compaction.mjs` 是否在单源射程 ∥ 打开态读数的档位来源），不是本席能改的代码面，已登记在「线索」并请父侧转设计席。子修复轮次 = 3。

### 本轮交付（`Desktop 12-1` 永久看守 + `sessionReading` 头注改写）

**派单与窗口**

- 父侧本轮明确开窗口：`thincoder-core/session-lifecycle.mjs` 的 `sessionReading` 头注**本轮即改**。判据（父侧裁定）＝令牌封印覆盖的是被评审的**设计档 ∥ 需求档字节**，产品代码不在封印内 ⇒ §2「实施后裁决（第 4 轮）· 二」那句「本批内不动（改它要重开已封印的档）」按错误前提写；该句失效由父侧记 §1 ∥ §6，本席不改 §2。
- 其余两项照 §2「实施后裁决（第 4 轮）· 一」：既有用例 `Desktop 12-1` 内补 `seed.usage` 两方向断言、`test/rtm/ends.md` 的 `12-1` 行补分母判据。

**改动（三档，均在 §2 机读清单内）**

| 档 | 改了什么 |
|---|---|
| `thincoder-core/session-lifecycle.mjs` | `sessionReading` 头注 ④ 改写：保留「本函数自己不读槽里的 `mode`」契约半句；删掉它推出的结论半句（「照旧槽算打开态窗口…读面只认调用方当前手上的模式」）；换成 `openingSeed` 取 `resolveSessionWorkMode(data, config.agent)` ＋ `SESSION.md` §8 权威句作依据，并写明需求 §2「不落盘、不跨会话带走」＝ 有效窗口本身不是持久状态、每次按档位现算，不是「槽里的档不作数」。顺带把 ④ 的 `historyReading` 更正为 `historyPercent`（＝ 其 `pct` 薄转口），`§2.3` 补文档名，写明 `workMode` 必填。 |
| `test/integration/desktop-work-mode.test.mjs` | 既有用例 `12-1` 内补打开态分母两方向断言（不新增用例 ∥ 不新建测试档 ∥ 既有两问断言与用例名一字未动）：方向 A 槽 `tiny` ∥ 配置 `normal` ⇒ 等于按 262144 分母算出的候选值；方向 B 槽 `normal` ∥ 配置 `tiny` ⇒ 等于按模型窗口算出的候选值。判据 = 与同一槽数据经核 `sessionReading` **显式传槽档**的候选值对拍；判定前先立「两方向读数不同」。 |
| `test/rtm/ends.md` | `12-1` 行「怎么算通过」补打开态分母判据一句；「怎么做」补半句两方向夹具说明（评审 🔵5：§2「集成 delta」要求两格各一句，与「第 4 轮 · 一」只提「怎么算通过」并存，两格都补则两处读法都成立）。证据列不动。 |

**判据的可辨伪性（为什么这两条断言证明得了走的是槽档）**

- 候选值不是重写算式：入参与端面 `openingSeed` 逐项同源（`loadConfig()` 的 `providersList` ∥ `provider` ∥ `defaultModel`），只把档位由调用方点名。
- 前提句「夹具前提：同一槽数据两档读数不同」先立于两个方向——否则取槽档与取配置档读同一值，断言恒真却证明不了走哪一路。
- 夹具 = 1M 窗渠道（`modelContext` 的 K 单位）⇒ tiny 有效窗口 262144、normal = 模型窗口，两档分母 4 倍差；预取 400 条史的百分比两档都不为 0（`seed.usage` 的有效门 = 数字 ∧ `> 0`）。
- 夹具隔离：本块临时改写模块级共享配置档，**块尾还原**，不让残留配置漏到同档后一个用例（评审 🔵4）。

**读数**

- `node --test test/integration/desktop-work-mode.test.mjs` → `tests 2 · pass 2 · fail 0`
- 失败面（同一命令）：把 `openingSeed` 的第四参临时退回「只取配置档」（`resolveSessionWorkMode({}, config.agent)`）⇒ `tests 2 · pass 1 · fail 1`，红在 `槽 tiny：打开态百分比按 262144 分母`，报文 `5 !== 20`（实际 5 = 模型窗口分母那一路，期望 20 = 262144 分母）。随即还原并复跑转绿；`git diff` 复核该档只剩本轮之前已交付的改动，无探针行。
- `node --test test/integration/tiny-mode.test.mjs` → `tests 4 · pass 4 · fail 0`（含 `CLI 50-6`）
- `node --test docs/batches/2026-11-14-tiny-window-cap.test.mjs` → `tests 8 · pass 8 · fail 0`（A1–A6 ∥ A6b ∥ A6c）
- `node --check`：改动的三档全过
- `doc_check(mode:"gate")` → `DOC-CHECK GATE: PASS`（受检 1 档：`test/rtm/ends.md`）

**越单改动**

- 无：三档都在 §2 机读清单内，本轮无清单外留痕改动。
- 披露一处**临时探针**：为取失败面，`thincoder-desktop/src/main/session-slots.mjs` 的 `openingSeed` 第四参临时改为 `resolveSessionWorkMode({}, config.agent)` 跑一次，随即还原；`git diff` 复核该档无探针残留。

**内部审计（explore · 1 轮 · 只读）**：`AUDIT: 1 finding (0 blocking)`。

- 逐项已核、无分歧：两方向断言的方向↔分母对应、判别力（前提句在两方向都在）、既有断言与用例名一字未动、RTM 只改判据格、头注无相反残句（该档 grep `256K` ∥ `旧会话` ∥ `只认调用方` 零命中）、全仓无别处复述相反口径（只剩本轮保留的契约半句，同向）、生产调用点仅 `openingSeed` 一处。
- 唯一 finding（🟡 低 · 非交付偏差）：§2 自身两句落盘范围不同（「集成 delta」＝ 两格各一句 ∥「第 4 轮 · 一」＝ 只「怎么算通过」）。处置 = 两格各补一句，两处读法都成立。

**代码评审（advisor · 1 轮 · pass · 🔴 0 ∥ 🟡 2 ∥ 🔵 4）**：明细在 §3 轮次 5。

- 🟡1 §2「本批内不动」与交付相反 ⇒ 非本席笔域（§2 归设计席），转父侧取代该句。
- 🟡2 §5 缺本轮读数 ⇒ **已修**（本节）。
- 🔵3 §1 状态行「残：openingSeed 取槽档收尾」滞后（该项上一轮已落完）⇒ 父侧笔域。
- 🔵4 共享配置档改写后未还原 ⇒ **已修**（块尾还原 + 注释说清）。
- 🔵5 RTM `12-1`「怎么做」缺句 ⇒ **已修**（补半句）。
- 🔵6 头注 ④ 命名与必填未写 ⇒ **已修**（`historyPercent` ∥ `§2.3` 带文档名 ∥ `workMode` 必填）。

**终态：`clean`（本席写域）** —— 评审 4 条可改项全修、2 条属父侧／设计席笔域已转；审计 1 条按两处读法落。自修复轮次 = 1。

**落地核对**（设计档句子与本轮落地不符者，逐条记）

- 档 = `docs/core/design/CONTEXT-COMPACTION.md`；节 = §2.3「缺参即拒」；句（verbatim）「`thincoder-core/session-lifecycle.mjs` 的打开态读数：`historyPercent(line, provider, sampleRatio(data.estimateSample, provider))`。」——该句是三参调用，落地面现为四参（第四参 `opts.workMode`，正是同节要求的必填）。代码与 §2.3 的规则一致，是这句示例未随签名改；属设计席笔域（设计变更），本席不改，记此一行。
- 同节第二处：句（verbatim）「`workMode` 是必填参数，`effectiveWindow` ∥ `policyBudget` ∥ `resolveCompactThreshold` ∥ `keepTailSize` ∥ `tailBudgetTokens` ∥ `historyReading` 一个默认值都没有」——必填清单六名未含 `historyPercent`（实际的 provider-only 薄转口面正是它）。§3 第 2 轮第 5 项已判 Deferred、§2「第 4 轮 · 三」顺延设计档，本轮未动设计档。
- 其余设计档 ∥ 需求档本轮零触碰；`providerSpec` 输出与发送面 `max_tokens` 语义零动。

**线索（本批外）**

- 上述两处设计档不符点为同一节、同一机制，随收口后那一轮一并落，不单开台账条目（本轮不新增台账条目）。

## §6 验证与收口（父代理）

### 一、验证读数（父侧实跑，非转述）

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-tiny-window-cap.test.mjs` | tests 8 · pass 8 · fail 0（A1–A6 ∥ A6b ∥ A6c） |
| 桌面三档（本批改写） | `node --test test/integration/desktop-work-mode.test.mjs` | tests 2 · pass 2 · fail 0 |
| tiny 三档与调档 | `node --test test/integration/tiny-mode.test.mjs` | tests 4 · pass 4 · fail 0（含 `CLI 50-6`） |
| 越窗 ∥ 百分比 ∥ 描述档 | `context-overflow-guard` ∥ `context-percent-calibrated` ∥ `tool-description-tiers` | 10 ∥ 1 ∥ 2，全绿 |
| 全量集成 | `node --test test/integration/*.test.mjs` | tests 215 · pass 213 · fail 2 |
| 文档门 | `doc_check(mode:"gate")` | PASS |

### 二、两项红——都不是本批引入

- `CLI 43-1` ∥ `CLI 43-2`（`test/integration/doc-anchor-graph.test.mjs`）：文档锚图内容面，台账 `#2404`。单跑该档实测 5 例 / 3 绿 / 2 红；该档全文对窗口面的符号命中 **0 处**，与本批无 import 面交集。
- 一处偶发抖动（`CLI 34-1` 浏览器池）未在本批全量跑中复现。

**这两行不是「全绿」**：本批以 215 例 213 绿交付，两红另账。

### 三、A1 ∥ A2 ∥ A3 ∥ A6 的独立复核（父侧另跑，不采信交付报告）

`effectiveWindow` 三行读数，同一 1M 窗渠道 `glm-5.2`：

```text
tiny        = 262144
normal      = 1000000
engineering = 1000000
```

`context: 128` 覆盖（窗口 131072）下，`tiny` ∥ `normal` 两台都是 131072——模型更小取小，成立。

`context: 64` 覆盖（65536）同形。`policyBudget` 在同渠道：tiny `threshold = 134144`、normal `600000`，符合 `min(usable, floor(window × 0.6))`。

**缺参即拒**：`undefined` ∥ `"minimal"` ∥ `"MINIMAL"` ∥ `"bogus"` ∥ `null` 五个输入全部在函数入口抛错并点名 `workMode` 与合法值域。

`"minimal"` 亦被拒——改名批的旧值读兼容只做在工作模式入口，窗口策略不接受旧值，这是对的（策略面不背别名）。

### 四、缓存键与端侧六处

`ctxCacheOf` 的命中键含 `window`（取 `effectiveWindow`，不取 `providerSpec().context`）：切档即失效，百分比不会停在旧帧。

六个端侧文件全部带档：`render-loop` 4 处 · `specs` 6 处 · `panel-callbacks` 3 处 · `agent-host` 5 处 · `session-slots` 4 处 · `cmd-config` ∥ `model-picker` ∥ `provider-admin` 各 1 处以上。

`sessionReading` 头注已按裁决 A 改写：保留「本函数自己不读槽里的 `mode`」契约半句，删掉推出的结论半句，改引 `SESSION.md` §8「mode 是会话级 tiny/normal/engineering 权威值」。

### 四、落地核对（§5 提的两处设计档不符，已处置）

§5 记的两处，已于本批内由设计席改字（同一节、同一机制）：`CONTEXT-COMPACTION.md` §2.3 的 `historyPercent` 示例改四参、必填清单补上第七名；同节 `collectStaleToolOutputs` 示例改三参。父侧复核：设计档七名齐全，盘上七个函数签名逐一比对，全部无默认值、全部带 `workMode`。

**六处端侧调用面**（第 2 段追授）实测带档：`render-loop` 4 处 · `specs` 6 处 · `panel-callbacks` 3 处 · `agent-host` 5 处 · `session-slots` 4 处，另有 `cmd-config` ∥ `model-picker` ∥ `provider-admin` 三处。`ctxCacheOf` 的命中条件含 `prev.window`，切档不命中旧帧——A6b 守着这条。

### 五、三处上抛的裁定与落地

| # | 上抛 | 裁定 | 落地 |
|---|---|---|---|
| 1 | `assertPromptFits` 取哪边 limit | 保持 `requestBudget`（模型窗口）——运输层是物理兜底，策略面在 `enforceContextFit` 读 `policyBudget(...).limit` | 四个 transport 各传自己的 `budget`，实测 `anthropic` ∥ `core` ∥ `google` ∥ `responses` 四处一致 |
| 2 | `advisor/compaction.mjs` 是否在单源射程 | 不在，本批不碰 | 进 Leads，不记账（见七） |
| 3 | 打开态读数取哪一档 | 取会话自己的槽档 | `openingSeed` 改用 `resolveSessionWorkMode`；`Desktop 12-1` 补两方向断言作永久看守 |

### 六、台账与未做

- **台账**：`#2411` 随本笔结算（已核销）。前情指针 `2026-11-14-tiny-mode-rename.md` 已收口 2026-11-14。
- **本批无新增债务**：七项设计档 🟡（会话标题归属、子代理准入、安全下界、摘要长度目标、「三条记录消息」与 taskState 可空互斥、五态回调、advisor 射程）判 Deferred，处置方式为**收口后另起一轮设计档修订**，不是本批遗留；其中会话标题一项已有实据（`SESSION.md` §8 标题机制归 SESSION 设计档），下一轮据实改需求句即可。
- **未做**：`advisor/compaction.mjs` 的窗口单源（Leads）；`thincoder-desktop/node_modules/@thincoder/core` 陈旧快照（非本批引入）；`docs/desktop/design/IPC.md` §2 的「打开态播种注」指针失效四处（Leads）。

### 七、收口结论

本批交付 E1–E3 与 A1–A6c，三项需求点全部落地并有读数。窗口事实（`providerSpec` 五级链）与窗口策略（`effectiveWindow`）分家，策略值只此一处；一切以窗口为分母的读数同取有效窗口，`max_tokens` 仍只读模型窗口。

**两红另账**，不作为本批通过的证据，也不被本批修掉。设计档七项 🟡 另行一轮，本批不宣称那些缺口已消。
