# 2026-11-15 · 窗口预留与压缩后计量基线
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 报「deepseek-flash 上下文设 320K ⇒ context overflow: prompt ~193962 tokens · window 327680 (limit 163840)」，并令「一/二一起修」。
> 台账 = #2444（— · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：进行中
批起 sha = 100def4c0e7cd59956b595aca56b12f223c99d04
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 现场（本批实读，非转述）

**用户侧故障**（2026-11-15，`deepseek-flash`）：

```
context overflow: prompt ~193962 tokens · max_tokens not sent · window 327680 (limit 163840)
— forced compaction ran but the prompt still exceeds the window
```

`193,962 < 327,680`，报文却说「超过窗口」。真实卡点是不可见的 `limit 163,840`。

**三条链，逐条读出来的坐标：**

**一、`reserve` 不随 window 缩放**（`thincoder-core/window-policy.mjs`）

- `budgetOf` 里 `const reserve = maxTokens ?? spec?.maxOutput ?? 0`
- 下一行 `const usable = usableWindow(window, reserve)`
- `usableWindow` 的退化分支 `return usable > 0 ? usable : Math.floor(ctx / 2)`

`deepseek-flash` 的 spec（`model-specs.mjs` 表项）= `{ context: 1_000_000, maxOutput: 384_000 }`。用户把 `context` 设成 320K ⇒ `window = 327,680`，`reserve` 仍取 384,000：

| 量 | 算式 | 值 |
|---|---|---|
| `reserve` | `maxTokens ?? spec.maxOutput`（`absent` 档） | 384,000 |
| `usable` | `327680 − 384000 < 0` ⇒ `floor(327680/2)` | **163,840** |
| `threshold` | `min(163840, floor(327680×0.6)=196,608)` | 163,840 |
| `bare` | `327680 − 384000` | −56,320 |
| `limit` | `max(bare, threshold)`（`budgetOf` 的 absent 档地板） | **163,840** |

四个数与报错逐位吻合。「设 320K 得到 160K」不是配置错，是 `reserve` 与 `window` 脱钩。

**二、压缩后计量基线归零**（`token-window.mjs` 的 `contextUsage`）

`measured` 支 = `_lastPromptTokens + estimateTokens(增量) × ratio`。而 7 处置 `_lastPromptTokens = null`：

| 位置 | 场景 |
|---|---|
| `context-degrade.mjs` 的 `pruneStaleToolOutputs` | prune |
| `context-degrade.mjs` 的 `shrinkOversized` | 单条超限截断 |
| `context.mjs` 的 `applyCompression` | 压缩落盘 |
| `explore-distill.mjs` 的蒸馏收尾 | 勘察蒸馏 |
| `session-lifecycle.mjs` 的新会话点 | 新会话 |
| `agent/setup.mjs` 的装配起点 | 装配（**本条不动**） |

前五处是「历史被改动」⇒ 置零 ⇒ 下一步回落到**纯估算**（`ratio` 从 1 起、靠池化比慢慢校准）。而压缩后恰恰是最需要准确读数的时刻，且此时**没有真值可纠**。

**三、压缩链没有「先裁剪」**（`context.mjs` 的 `compressIfNeeded`）

| 步 | 动作 |
|---|---|
| ① | `if (!extras.force && tokens <= threshold) return false` |
| ② | `keepTailSize` / `splitHistory` |
| ③ | 可达性门 `postCompactionTotal(...) > threshold` |
| ④ | **直接发摘要请求** |

阈值越线到发摘要请求之间，**没有零成本步骤**。`pruneStaleToolOutputs` 已存在（`context-degrade.mjs`），但只由 `/prune` 工具手动触发（`agent-tools/context.mjs` 的 prune 分支），不在压缩链上。

对照 dsh 的次序（`packages/compaction/compaction-basic/README.md` 的 pruner 段）：pruner 在 range selection **之前**跑，重测，够则**跳过总结**。

### 已定决定

- **已定决定**：一 ∥ 二 ∥ 三 合成一批修，不拆批 · 用户原话：「一/二一起修。」「三也合进去」 · 时间：2026-11-15 13:52
- **已定决定**：本批属产品面（`thincoder-core/**` 代码），走工程四步，设计评审通过后实施 · 时间：2026-11-15

### 边界（设计席不得越）

- **`explicit` 档与 `spec` 档（anthropic）的 `reserve` 不可 cap**。`window-policy.mjs` 的 `outputReserve` 注记记着教训：「NOT capped: the old 25% cap reopened a residual band … (2026-10-18 overflow 400: budget counted 250_000, 393_216 actually sent)」。只有 `absent` 档（transport 不发 `max_tokens`）的 `reserve` 是「保守预留」而非「真实输出预算」。
- **`maxTokens` 的发送值不受本批影响**。它走 `budgetOf` 的 `maxTokens` 字段，与 `reserve` 是两个字段；四个 transport 面只读 `maxTokens`。
- **`usableWindow` 的半窗退化保留**。它防的是 `explicit`/`spec` 档真不物理的情形（`doubao-seed-2-1-turbo-260628`：256K 窗配 256K `maxOutput`）。
- **`agent/setup.mjs` 的置零不动**——那是装配起点，不是「历史被改动」。
- `PRUNE_MIN_TOKENS`（200）不动；`COMPACT_RATIO`（0.6）与 `TAIL_BUDGET_FRACTION`（0.15）已解绑，见本节末尾「已定决定」。 

### 设计席必须回答的

1. **一条**：`absent` 档 `reserve` 的约束式是什么？候选 A = `min(spec.maxOutput, window × (1 − COMPACT_RATIO))`（不引入新魔数，保证压缩线由 `COMPACT_RATIO` 决定而非被 `reserve` 顶掉）；候选 B = 改 `usableWindow` 退化分支；候选 C = `absent` 档改固定默认预留。**须说明选哪个、为什么，以及 1M 默认配置下读数是否逐位不变。**
2. **二条**：压缩/prune/shrink 后如何保 measured 支可用？难点是「替换非删除」——折叠量 = 被折叠区估算 − 摘要估算，只能用估算。**须给出精确算式、误差自纠路径（下一次服务端真值如何重置）、以及漂移的边界。**
3. **第三条与第二条咬合**：若 prune 后立即重测，而 prune 又把基线置零，重测就走纯估算。**须说明两条的先后与耦合，不能各修一半。**
4. **三条**：prune 插在 `compressIfNeeded` 的哪一处？`force` 面是否也 prune？可达性门 `postCompactionTotal` 是否要跟着改？
5. **单测面**：本批单测档落 `<docRoot.batches>` 同目录同名（`.test.mjs`），收口删除。**须列出覆盖哪几条失败面**，特别是「一条」必须能在失败侧复现（设小窗口 ⇒ 读数变红）。
6. **已知张力**：`#2432`（保留窗硬地板：小窗上压缩可能静默 no-op）与本批同面。**须判断本批是否收窄或加宽那个面**，并在 §6 给出处置（本批不修 `#2432`，但要说清两者的关系）。

- **自动推进**：本批一 ∥ 二 ∥ 三条的全部步骤（设计 → 评审点火 → 实施 → 收口）不逐步等放行 · 用户原话：「一/二一起修。」「三也合进去」 · 时间：2026-11-15 13:56

### 决定性事实（库外查证，2026-11-15）

**DeepSeek 官方 API 文档**（`https://api-docs.deepseek.com/zh-cn/api/create-chat-completion`）原文：

> 限制一次请求中模型生成 completion 的最大token 数。取值范围为1 到384K（393216）。**未设置时，非思考模式 默认 8K，思考模式 默认 64K**（reasoning_effort 为 ...）

**推论链**（每条都可核对）：

1. `outputReserve` 的注记定义 reserve = 「the value ACTUALLY sent as max_tokens」。
2. `budgetOf` 里 `absent` 档 `maxTokens === undefined` ⇒ transport **不发** `max_tokens`（`maxTokensSource === "absent"`）。
3. 不发 ⇒ 服务端用**默认值**。对 `deepseek-flash`（`spec.thinking === true`）= **65,536**。
4. 而代码取的是 `spec.maxOutput` = **384,000** —— 这是「模型最多能输出多少」，不是「不发时实际会输出多少」。

**结论：`absent` 档的 reserve 是一个永远不会发生的值。** 384,000 在absent 档没有任何一次真实调用会出现。这不是保守预留，是算式用错了变量。

`reasoning_effort` 侧证（`provider/core.mjs` 的 `reasoning_effort` 发送分支）：只有 `provider.reasoningEffort` 显式设置时才发，未设 ⇒ 不发 ⇒ 服务端的思考模式默认生效。`deepseek-flash` 的 `reasoningEffortEnum` 含 `low / high / max`，`max` 档官方口径可到 128K。

### 两个候选（设计席须二选一并论证）

**候选 A —— 只修退化行（保守补丁）**

```
rawReserve = maxTokens ?? spec.maxOutput ?? 0
reserve = (maxTokensSource === "absent" && rawReserve > window && window > 0)
  ? Math.floor(window * (1 - COMPACT_RATIO))
  : rawReserve
```

| 窗口 | reserve | usable | threshold | limit |
|---|---|---|---|---|
| 1,048,576（现状） | 384,000 | 664,576 | 629,145 | 664,576 | **逐位不变** |
| 327,680 | 131,072 | 196,608 | 196,608 | 196,608 |
| 262,144（tiny 封顶下） | 104,857 | 157,287 | 157,286 | 157,287 |

代价：320K 窗口仍然只能用 192K —— 窗口的四成被一个不会发生的预留吃掉。修的是「报错」，不是「预留算错了」。

**候选 B —— 按真实默认输出取（正解）**

```
defaultOutput = spec.thinking ? 65_536 : 8_192        // 官方默认口径
defaultOutput = provider.reasoningEffort === "max" ? 131_072 : defaultOutput
reserve = (maxTokensSource === "absent") ? Math.min(spec?.maxOutput ?? 0, defaultOutput) : rawReserve
```

| 窗口 | reserve | usable | threshold | limit |
|---|---|---|---|---|
| 1,048,576 | 65,536 | 983,040 | **629,145（不变）** | 664,576 → **983,040** |
| 327,680 | 65,536 | 262,144 | 196,608 | 262,144 |
| 262,144 | 65,536 | 196,608 | 157,286 | 196,608 |

注：`threshold` 在 1M 下**逐位不变**（`min(usable, 0.6W)` 里 0.6W 更小）。变的是 `limit`——硬上限守卫从 664,576 放宽到 983,040。

代价：**`limit` 放宽**。`enforceContextFit` 判 `usage.total > budget.limit`，放宽意味着 prompt 能长到 983K 才报错。若压缩线（629K）因故未生效，失败会来得更晚、单次浪费更大。`enforceContextFit` 的权衡注记提过「死锁现场估 491K < limit 606,784」——`limit` 是真实卡过东西的字段。

**两案的共同边界**（§1 已写死）：`explicit` ∥ `spec`（anthropic）档一律不动；`usableWindow` 半窗退化保留；`maxTokens` 发送值不受影响。

### 我给设计席的裁定请求

**候选 B 是正解，候选 A 是补丁。** 理由不是「更激进」，而是：reserve 的定义是「实际发出的 max_tokens」，absent 档实际发出的是「服务端默认」，而 384,000 从来不会发生。用一个恒不发生的值做预留，任何窗口下的读数都是虚假的——1M 下也虚假，只是没触发故障。

**但 `limit` 放宽的代价须由用户裁定**：这是「更正确地算」与「更早失败」之间的取舍，不是我能单方面决定的。设计席须把两案在 §2 并列写出，**不得只写 B 让实施席照做**。

### 主 agent 对上抛的答复（2026-11-15 14:02）

**一、候选 A 的裁定：退回重议。**

设计席选 A（`reserve = min(spec.maxOutput, floor(window × (1 − COMPACT_RATIO)))`），理由是「`usableWindow` 分不清保守预留与物理真值」。这个理由本身成立——但它回避了 A 在小窗口下的结构性缺陷：

**A 让压缩线与硬上限重合。**

| 窗口 | reserve | usable | `threshold` | `limit` | 两线差 |
|---|---|---|---|---|---|
| 1,048,576（现状） | 384,000 | 664,576 | 629,145 | 664,576 | **35,431**（健康） |
| 327,680（用户现场） | 131,072 | 196,608 | **196,608** | **196,608** | **0**（重合） |
| 262,144 | 104,857 | 157,287 | **157,286** | **157,287** | **1**（重合） |

`COMPACT_RATIO = 0.6` 与 `(1 − COMPACT_RATIO) = 0.4` 互补，所以 A 一旦收缩 reserve，`usable == 0.6W`，于是 `threshold = min(usable, 0.6W) = 0.6W = usable = bare = limit`。

**后果不是「勉强放行」，是「压缩触发的那一刻就已经在红线上」**：

- `compressIfNeeded` 在 `tokens >= threshold` 触发；
- `enforceContextFit` 在 `usage.total > limit` 抛错；
- 两者相等 ⇒ 压缩一触发，若压缩后仍 ≥ limit 就直接报 typed error，**中间没有留给压缩生效的缓冲**。

而设计席自己给的现场读数正是这一点的证据：用户 prompt `193,962`，A 后 `limit = 196,608`，余量 **2,646 token**（约 0.8%）。这不是「放行」，是「贴着红线放行」——用户再加一次工具调用就回到报错。

**B 的结构对照**（`reserve = min(spec.maxOutput, 服务端默认输出)`）：

| 窗口 | reserve | usable | `threshold` | `limit` | 两线差 |
|---|---|---|---|---|---|
| 1,048,576 | 65,536 | 983,040 | 629,145 | 983,040 | 353,895 |
| 327,680 | 65,536 | 262,144 | **196,608** | **262,144** | **65,536** |

B 在 1M 下 `threshold` 逐位不变（`min(usable, 0.6W)` 里 0.6W 更小），且两线保持分离——压缩线在前、红线在后，中间 64K 缓冲。

**设计席须重新论证，不得直接沿用 A**。若仍坚持 A，必须给出小窗口下恢复两线分离的办法（否则 `#2432`「保留窗硬地板导致压缩静默 no-op」与本设计叠加，小窗口会成为「压缩刚触发就报错」的死区）；若改选 B，须正面回应自己提出的那条反对理由（`usableWindow` 的语义边界），说明在 `budgetOf` 内按 `maxTokensSource` 分档算 `reserve` 为何不违反它。

**二、第二条知会（`advisor/compaction.mjs` 越出派单面）：同意扩围。** `outputReserve` 换签名后它是唯一另一个调用方，不补实参就被「缺参即拒」拦下——这不是越界，是本批改动的必要连带。**须在 §2 的受影响文件表与机读清单中列入该档**，并在验收面写明 advisor 预算的断言。

**三、第三条知会（advisor 预算涟漪）：不拆出。** 同一函数上的同一缺陷，本批顺带修掉是对的；拆出去等于放一条已知错误读数继续跑。

**四、需求档不一致（上抛·待裁）：由我本轮改。** 需求档 §2 现写「预留使用实发 maxTokens，未发时使用规格 maxOutput，不封顶」——「不封顶」正是本 bug 的表述。设计席不得改需求档，但**须在 §2 给出的最终算式与我写的需求句逐字一致**；我这边先按 A ∥ B 保留两个版本，等它重议结果出来再钉死（见下）。

**五、需求档的暂拟（待重议结果确定后钉死，不得提前落盘）**：

- 若选 B：`预留使用实发 maxTokens；未发时取规格 maxOutput 与服务端默认输出上限（思考模型 64K、非思考 8K，`max` 档 128K）的较小者。`
- 若选 A 且解决了两线重合：`预留使用实发 maxTokens；未发时取规格 maxOutput 与「有效窗口减压缩线」的较小者。`

两条都删掉「不封顶」，这是本批的需求面改动，属 D11 同轮扫（代码、设计档、需求档三处同步）。

### 用户裁定：候选 B（2026-11-15 14:00）

- **已定决定**：`absent` 档的 `reserve` 改为「规格 maxOutput」与「服务端默认输出上限」取较小者 · 用户原话：「B」 · 时间：2026-11-15 14:00

**设计席按 B 收 §2，A 不再作为候选。**

#### 钉死的算式

```js
// window-policy.mjs 的 budgetOf 内，仅 absent 档
const DEFAULT_OUTPUT = spec?.thinking ? 65_536 : 8_192
const defaultOutput  = provider?.reasoningEffort === "max" ? 131_072 : DEFAULT_OUTPUT
const reserve = maxTokensSource === "absent"
  ? Math.min(spec?.maxOutput ?? 0, defaultOutput)
  : rawReserve
```

形参口径与签名设计由设计席定，但**三件事不得偏离**：

1. **只对 `absent` 档生效**。`explicit` 档（用户设了 `maxTokens`）与 `spec` 档（anthropic 真发 `max_tokens`）一律走原 `rawReserve`，不得 cap——这是 2026-10-18 overflow 400 的教训（`budget counted 250_000, 393_216 actually sent`）。
2. **`65_536` / `8_192` / `131_072` 三个数须各有出处注释**：DeepSeek 官方 API 文档「未设置时，非思考模式默认 8K，思考模式默认 64K」，`max` 档 128K。不许写成无注释魔数。
3. **`usableWindow` 的半窗退化保留原样**。B 之后它仍然要能接住「`explicit` 档 reserve ≥ window」的物理不成立（`doubao-seed-2-1-turbo-260628` 那类配置）。

#### 设计席须正面回应的两点

**其一**，你否掉 B 的理由是「`usableWindow` 分不清保守预留与物理真值」。B 把分档放在 `budgetOf` 内、`usableWindow` 的入参语义（「实际输出预留」）不变——请说明这为何不构成对该语义的破坏，或者指出我这条理解不到位的地方。**若你认为 B 确实违反 `usableWindow` 的契约，停下来上抛，不要闷头实现。**

**其二**，`limit` 放宽的治理。1M 下 `limit` 从 664,576 到 983,040。`enforceContextFit` 判 `usage.total > budget.limit`，放宽意味着压缩线失效时失败来得更晚。**须在 §2 写明：这是否可接受、若不可接受给出约束（例如 `limit` 仍取 `min(新 limit, 旧 limit)` 之类的折中），以及为什么。** 不得默认「放宽没问题」。

#### 验收面要求

单测必须能在这条上红：

- **320K 现场**：`assert(budget.limit >= 262144)`，且 `assert(budget.threshold === 196608)` —— 两线分离，A 下会红（A 的 `limit === threshold === 196608`）。
- **1M 基线**：`assert(budget.threshold === 629145 && budget.limit === 983040)` —— `threshold` 与改前逐位相同。
- **`explicit` 不回归**：设 `maxTokens = 393216` 时 `reserve` 必须仍是 `393216`，不受 cap 影响。
- **用户现场复现**：`prompt = 193962` 在 320K 下必须放行（`193962 <= budget.limit`），且距 `limit` 有余量（不是贴在 2,646 边上）。

#### 需求档已同步改（D11 同轮扫，主 agent 的笔）

需求档 §2 原句「预留使用实发 maxTokens，未发时使用规格 maxOutput，不封顶」已改为 B 的口径。设计档 §2.2 的公式、§2.2.1 的说明、§7.2 的基线口径须与需求档逐字一致，**不一致即设计席本轮未完成**。

#### 本轮不做

- 不动 `PRUNE_MIN_TOKENS`（200）；`COMPACT_RATIO`（0.6）与 `TAIL_BUDGET_FRACTION`（0.15）已解绑，见 §1 末尾「已定决定」。
- 不动 `agent/setup.mjs` 的置零。
- 不修 `#2432`（保留窗硬地板），只在 §6 写关系。
- 不动 `explicit` ∥ `spec` 档的任何行为。

### 用户裁定：统一基准（2026-11-15 14:30–14:46）

本批设计首次落盘后，用户提出压缩与窗口基准不得分开处理，要求一个整体方案。以下裁定**取代 §1 早先「三条窄修复」的范围声明**，构成本批的新任务书。

- **已定决定**：上下文窗口长度是用户唯一设定的量，其余参数全部由它派生 · 用户原话：「我的观点是用户设置上下文窗口长度，其他参数以这个为基准算出来。」 · 时间：2026-11-15 14:30

- **已定决定**：用户设窗口后系统退化为半窗是不可接受的结果 · 用户原话：「缩小上下文空间以后会退化为半窗。」 · 时间：2026-11-15 14:33

- **已定决定**：压缩与窗口预算必须同批处理，不得拆分 · 用户原话：「我认为不能把压缩的事儿和这个分开处理，我认为我们需要一个整体的方案。」 · 时间：2026-11-15 14:35

- **已定决定**：保留线按可用上下文的实际容量推算保留条数；保留线以上压缩，由新到旧；超过模型承受力的部分直接丢弃 · 用户原话：「我设想中的压缩方式是：现根据可用上下文长度推算出我可以保留多少条最新的消息，这一段保留不压缩，这个为止就是保留线，从这个位置再往前就要压缩，策略是由新到旧，能压缩多少压缩多少，超过模型上下文承受力的部分就不要了，太早的历史意义也不大，用户的工作早就转向了。以前我们保留会话头部丢中间做法其实不太符合用户的行为习惯。」 · 时间：2026-11-15 14:38

- **已定决定**：可用上下文 = 模型实际能处理的数据能力（物理窗口），不是压缩后的剩余额度 · 用户原话：「我说的可用上下文是指模型实际能处理的数据的能力。」 · 时间：2026-11-15 14:44

- **已定决定**：切换模型或调整参数时，存量历史可能超过新窗口，系统必须能处理这种场景 · 用户原话：「调整参数或者切换模型的时候存量上下文长度大于压缩线甚至模型支持长度可能是存在的，比如我从一个1M的模型，切换成256M模型时，原有长度超过模型能接受的最大长度是很可能发生的。」（「256M」按上下文应为 256K 之笔误，指小窗口模型） · 时间：2026-11-15 14:40

### 本批目标态（七条，设计席逐条落地）

1. **派生链单向**：`window` 是唯一输入；`reserve` 取服务端默认输出（已裁 B）；`limit = window − reserve`；`threshold` 从 `limit` 派生，不再乘 `window`。
2. **单调性**：窗口增大时，`limit` 与 `threshold` 都不得减小。任何窗口坐标上的回落都是外部常量参与的证据，判为不通过。
3. **废除静默兜底**：半窗退化、`absent` 档地板 `max(bare, threshold)` 不得作为正常运行路径。派生不成立（`reserve ≥ window`）在装载期报错并指出矛盾。
4. **保留线由可用容量倒推**：保留窗预算不再取 `window × 0.15`，改由 `window − reserve − 固定开销 − 摘要预留` 一类的减法链得出；压完之后应落在 `threshold` 以下，不得贴着 `limit`。
5. **处置链串联**：裁 → 摘要 → 丢弃，每步之后重测，够则停；现在摘要失败一次即抛。丢弃优先用零网络的 `compressFallback`。
6. **切换预判**：模型或参数变更那一刻比较「存量 vs 新 `limit`」，超了就主动处置，不等下一次请求撞上。
7. **显示与判定同基准**：状态栏百分比的分母换成用户实际可填的量，压缩线与硬上限在界面可分辨。

### 待用户裁定的三点（设计席须给方案，不得自行选定）

一、`threshold` 的基准取 `limit − 注入余量`（绝对量）还是保留比例式上限作为第二支 `min`。
二、状态栏分母是否更换；换则涉及四个端侧消费点的同改。
三、第 4 条会显著改变现网行为（1M 窗口下逐字保留量从约 15.6 万 token 升至 58 万以上），是否需要灰度或回退开关。

### 已核实的事实（供设计席直接引用，不必重查）

- `contextUsage` 的 `systemPrompt` 与 `history` 是两套输入，压缩只作用于 `history`。
- `KEEP_HEAD = 0`：头部一条不保留，`splitHistory` 已按「保留线以上全压」切分。
- `compressFallback` 已实现「丢弃中段、不调模型、零网络」，但只在摘要连败 `COMPRESS_FAILURE_LIMIT` 次后触发。
- `enforceContextFit` 只调一次 `compressIfNeeded`，压后仍超即抛，无重试链。
- `fixedFloor > limit` 时压缩被跳过并直接抛 `overheadOverflowError`，因为历史归零后总量仍等于固定开销。
- 全仓无模型切换钩子；切换后靠下一次请求的 `enforceContextFit` 兜。

- **已定决定**：`COMPACT_RATIO`（0.6）与 `TAIL_BUDGET_FRACTION`（0.15）解绑，不再是本批的边界；压缩线算式由设计席按目标态重判，保留任何比例须给出优于绝对量的理由 · 用户原话：「0.6那个线不是铁律，不要被他绑住手脚。」 · 时间：2026-11-15 14:48

**这条裁定的含义（写给设计席与下一轮读者）**

1. `threshold` 不要求保留 `min(usable, floor(window × COMPACT_RATIO))` 的形状。
2. 「那是既有语义、不是本档新增的形状」这一辩护作废——用户已把「乘 window」判为缺陷。
3. 保留比例本身不是错；**无理由地保留**是错。要留就必须说明它为何优于绝对量。
4. 候选方向（非命令）：`threshold = limit − headroomAbsolute`，headroom 取注入上下文实测体量（源码注释称 30–50K）。比例若保留，只能作为 `min` 里的上限项。

**仍然绑定的三条**（目标态第 3、4、7 条，未变）：显示同基准 · 配置矛盾装载期报错不静默兜底 · 单调性（窗口增大时 `limit` 与 `threshold` 不得减小）。

**已同步本轮下发的设计席指令**：`subagent send` 至 `#5` 已投递（`delivered, queued:1`），它在下一个轮次边界按普通用户指令消费。

### 评审 #9 结论与逐条裁定 + 修面派单（主 agent · 2026-11-15 15:05）

评审 id `16ca1c3f` · `VERDICT: changes-required` · 2 🔴 / 13 🟡 / 4 🔵（共 19 条）。**未签发 token ⇒ 设计档未冻结，修面轮直接改。**

两条 🔴 本席已独立复核，属实：

- **第 1 条（签名三分裂）**：设计 §2.3 同时给出六参版 `collectStaleToolOutputs(history, provider, workMode, protectFrom, fixedOverhead, ratio)`（并称 `fixedOverhead` ∥ `ratio` 都没有缺省）与四参版 `collectStaleToolOutputs(history, provider, workMode, protectFrom)`，§7.2 用后一种。实施第一步就会被两个契约卡住。
- **第 2 条（槽里有什么）**：§1.1「人读线 slim、机读线逐字」与 §1.2「`toolProcess` 按原文落盘」一致，但 §1.2 折叠段与 §7.2 另有绝对句「落盘的工具结果只留 slim 后的前段」「落盘的只有人读线那一份」。两者相反，而这条直接决定 `read_history` 的如实说明、`folded:` 行与 prune 回执的文案。

**第 5 条我核出评审的方向反了**：评审只说「两处不一致」，没说不一致在哪一边。

实况是设计档错、需求档对。`thincoder-core/session-segments.mjs` 的 `slimForDisplay` 对 tool 内容在 500 字符后拼 `\n… (truncated for storage)`；`thincoder-core/session-lifecycle.mjs` 的注记写明被截断的 `arguments` 以 U+2026 结尾。截断标记存在且按角色分支——需求 §10 那一项是真的，设计 §1.1「读的人却无从知道那是残片」是事实错误。修法在设计档，不在需求档。

| # | Action | Detail |
|---|---|---|
| 1 | Dispatched | 定一个签名三处同形；若定六参，在 §2.3 写出四个消费点各自的 `fixedOverhead` ∥ `ratio` 来处，删掉另一版 |
| 2 | Dispatched | 写成带射程的一句：保留窗内两轮的工具过程在槽里逐字（挂在轮记录上、经 `turns` 投影），窗口外只剩人读线的 slim 前段 |
| 3 | Dispatched | §2.1 补：有效窗口只在读数时由 `effectiveWindow(provider, workMode)` 现推、不进槽、不跨会话；档位是槽里的事实、有效窗口是推导值，不可互代 |
| 4 | Dispatched | §9 降级行与 §5.1 第 ⑥ 步写明载荷字段（丢弃条数 ∥ 被丢轮次），使需求 §2「交代丢了多少条」可验收 |
| 5 | Dispatched | 按上条已核事实改 §1.1 与 §6：回读面带按角色区分的截断标记；保留逐字的理由改成「标记说明了它是残片，但残片就是残片」 |
| 6 | Dispatched | §2.2.1 写明 `defaultOutput` 覆盖哪些 provider；默认值不同的 provider 按什么取，或显式声明只覆盖已核过的族 |
| 7 | Dispatched | §2.4 点名每处 `usableWindow` 调用喂的是模型窗口还是有效窗口，并说明 tiny 档判据随 `effectiveWindow` 走 |
| 8 | Dispatched | 删 `budgetOf` 或说明它是哪一支的旧名；校准比的名字收敛到一个读取面，并写明 ≥1 下界落在该读取面上 |
| 9 | Dispatched | 给 `requestBudget` ∥ `policyBudget` ∥ `preflightWindowFit` 补同形三问答案 |
| 10 | Dispatched | §5.1 第 ③ 步补射程：合格集非空的只有 §7.2 列的两类状态，其余状态 ③ 是 no-op，常见路径成本落在 ⑤ |
| 11 | Dispatched | 修订式与「今天」式表述改成单一目标态陈述；被否方案的持久理由按 F7-2 保留但写成「为什么不取 X」 |
| 12 | Dispatched | 删除清单与「本批新增面」验收行搬进本批 §2；设计档只留结构决定与持久理由 |
| 13 | Dispatched | 本批 §2 补齐：受影响代码文件清单 ∥ 批起快照行数 ∥ 超 500 拆分方案 ∥ 以 `test/RTM.md` 为起点的集成增量（具名用例 + 交互面 + 业务可观察结果 + 服务的需求） |
| 14 | Dispatched | 删「（目标态第 2 条单调性）」括注，改指需求 §2 那一条或只留斜率推导 |
| 15 | Dispatched | 核实 `docs/core/design/TOOL-OUTPUT-LIMITS.md` §2 是否已写带 `budget` 的构造器；没写则同一改动内改它，两边措辞对齐 |
| 16 | Dispatched | §2.4 补 `threshold ≤ 0` 的来处（构造判据，非观测分支） |
| 17 | Dispatched | §2.5 的「四个消费面」改成实际个数，或把 stats ∥ 打开态读数并入同一句列举 |
| 18 | Dispatched | §1.2 边界段承认「保留窗内一条特大用户请求」这条来路，并写明处置（如实报错 ∥ 另设上限） |
| 19 | Fixed | 需求档措辞（我的笔），设计档不动 |

**修面轮范围（三条纪律）**

1. 上表 `Suggestion` 列的修法就是本轮的活，执行者是设计席；`Dispatched` 的 18 条已逐条裁定接受，不必再论证要不要改。
2. 按编号报：`编号 → 改了什么 → 档路径 + 逐字原文`（第 19 条不归本席）。
3. **本轮不做**：不改需求档（我的笔）；不动 `advisorContextBudget` 的既有语义；不引入回退开关；不重新引入比例项；不动 `prefetchWindowFit` 的机制方向；不碰 `thincoder-core/config-presets.mjs`（另案）；不动 §10 已通过的验收判据（只收窄位置，不改要验的面）。

### 修面轮 #12 的裁定（主 agent，2026-11-15 15:10）

- **上抛 1（需求档三句矛盾）是过期读数，不成立。** 实读 `docs/core/requirements/CONTEXT-COMPACTION.md`：`0.6` ∥ `半窗退化` ∥ `usableWindow` 三个词在该档全零命中；§2 现文已写「自动压缩线 = 输入上限 − 注入余量」「输出预留不小于有效窗口是配置矛盾：装载期报错」「压缩线、尾部预算、用量百分比和发送前守卫一律从输入上限派生」。设计席读到的是本席 14:48 与 15:0x 改前的旧字节。**本轮不重复改需求档**，只由设计席删掉 §2 里那条过期上抛。
- **仍有残留：设计 §2.4 的「半窗退化分支删除。它原本接的是……」。** 这是同一条修订式表述（§1 修面清单第 11 条要求单一目标态），且带了删除动作（第 12 条要求把删除清单搬进过程记录）。派 #12 一并修掉。

### 用户裁定：压缩线加 256K 上限（2026-11-15 16:12，16:15 定值）

- **已定决定**：压缩线加绝对值上限 `RETAIN_CAP_TOKENS = 262_144`（256K），算式 `threshold = min(limit − INJECT_HEADROOM_TOKENS, 262_144)` · 用户原话：「对，1M上下文的模型我只用到256K就是我的要求。」 · 时间：2026-11-15 16:15

- 前一条口径（2026-11-15 16:12）：用户原话：「上下文压缩基线里我要加一个上限，不管基线计算出来是什么，都限定不要要超过255k，因为我发现一些模型在上下文长度太大的时候会出现注意力问题。」定值以 262,144 为准。

- 理由是用户的观测事实：大上下文下部分模型注意力衰减。不是估算，不是设计推断，不要求再补测量。

- 与 tiny 档的 262,144 同值但不同物：那个封的是**窗口**（`TINY_WINDOW_CAP`），这条封的是**压缩线**；两者不可互相代入，改一个不动另一个。

- **不封 `limit`**：`limit` 是物理线（窗口 − 预留）。封它等于重造 193,962 那次越窗——守卫线压在物理线之下，会制造本来不存在的溢出。本条只封压缩线，以及由它派生的保留线。

- **单调性仍成立**：`limit − INJECT_HEADROOM` 随窗口不减，与常数取 `min` 之后仍不减，只是大窗口段饱和（斜率由 1 变 0）。那条「窗口增大时两个量不得减小」的验收照旧可判。

- **小窗口不受影响**：320K 窗下 `threshold = 212,144 < 262,144`，本条不生效；生效面只在 `limit > 312,144` 之后；absent 思考档（预留 65,536）换算成 `window > 377,680`。

- 后果读数（当前 1024K 配置）：压缩线由 933,040 降到 262,144；保留线 ≈ 262,144 − 固定开销(≈45K) − 摘要预留(1K) ≈ 216K。

- 这个后果要认：旧式尾部是 156,286，改后 216K 只有 1.38 倍，不是设计原先算的 3.7 倍。大窗口上的收益被这条上限吸收大半——换取的是模型不在超大上下文里丢注意力。

- 落点：设计档 §2.2 的算式块与单调性证明、需求档 §2 的压缩线一句与验收、代码 `window-policy.mjs` 的常量与算式、单测一条饱和段断言（1M 窗下 `threshold === 262144`）。实施顺序见下条。

### 设计修面轮（2026-11-15 16:40）：256K 上限入设计 + 两条落地核对

实施席 §5 报了两条「设计句与落地不符」，我核过都成立；连同 256K 上限一并交设计席一轮改完。**需求档我已改**（§2 第 19 行加上限、第 25 行尾部改由压缩线倒推），设计档是设计席的笔。

六项，逐条：

1. **§2.2 算式块加封顶**：`threshold = min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)`，`RETAIN_CAP_TOKENS = 262_144`。夹 `threshold`，**不许夹 `limit`** —— 夹 `limit` 会重造本批刚修掉的越窗 bug（守卫线低于物理线，制造假溢出）。
2. **§2.2 单调性论证跟着改**：窗口大到 `limit − 50000 > 262144` 后 `threshold` 恒为 262,144。要求「不减小」仍成立（恒定不算减小），但论证要从「斜率 0 ∥ 1 ∥ 1」改成「0 ∥ 1 ∥ 1 后在封顶处转 0」。写清封顶生效的窗口门槛。
3. **§4 尾预算**：尾部保留量由**封顶后的压缩线**倒推。1M 窗下从约 887K 落到约 216K（= `threshold` 262,144 − 固定开销 ≈45K − 摘要预留 1K；固定开销取的是实测带的中值，取值变化时这两个数一起变）—— 这是本条的目的，不是副作用，写出这个数并说明「拿大窗口的余量换注意力质量」。
4. **§2.4 的 doubao 句是错的，改**：现写「256K 窗配 256K `maxOutput` 的配置在这一格被拒：`reserve ≥ window`」。新算式下 absent 档 `reserve = min(256000, 65536) = 65536`，该配置**不被拒**（跑在 `limit` 190,464 上）；落进拒绝格的只有显式 `maxTokens: 256000` 那种。实施席已在 §5 实测，我核过。
5. **§4 的 `NOTE_ESTIMATE` 位置写错**：设计说住 `context.mjs`，落地后住 `token-window.mjs`（减法链要用它，反向 import 会成环），`context.mjs` 改为 import。按落地写。
6. **两个 262,144 不是一回事，写一句**：`RETAIN_CAP_TOKENS` 封的是**压缩线**，`TINY_WINDOW_CAP`（tiny 档）封的是**窗口**，同值不同物，改一个不动另一个。

**边界**：只改 `docs/core/design/CONTEXT-COMPACTION.md`。不碰代码、不碰需求档、不碰 §2 已通过的任何一条。修订式表述仍按 D8 写目标态。

## 复评 #19 裁定（主 agent，2026-11-15 16:50）

复评结论 `pass`，token 已签发。八条逐条裁定，**全部 Deferred**，理由同一句：两份受评档字节已冻结，改一个字即令 token 失效，且实施席会建一个评审席没读过的版本。

| # | 级别 | 裁定 | 交付后落点 |
|---|---|---|---|
| 1 | 🟡 | Deferred | 设计 §2.2「只有一种合法的进入方式」这句过绝对——注入余量本身就是常数减法项。算式块是权威，实施不受影响。修面轮窄化该句 |
| 2 | 🟡 | Deferred | 设计 §2.1 给 tiny 的 262,144 命名 `TINY_WINDOW_CAP`，使 §2.2 的指向落到真有其名处 |
| 3 | 🟡 | Deferred | 需求 §10 补「压缩线在封顶段饱和」一项。需求档同属受评档，本轮不动 |
| 4 | 🟡 | Deferred | 设计 §2.4 的 doubao 两个数补出处（providerSpec 或 `MODEL-SPECS.md` 行），照 §2.2.1 引 DeepSeek 文档的形态 |
| 5–8 | 🔵 | Deferred | §4 示例写明假设 `reserve` = 65,536 · §4 减法链净额写法与「反向 import 成环」理由 · §1.2 三问清单补 `RETAIN_CAP_TOKENS` 行 · 「封顶」一词在 §2.2 与 §2.2.1 指两个不同对象 |

**下一步（本轮执行）**：设计席 fix 轮只在 §2 补一条实施条目与验收断言——封顶目前仅以「代码面待下一轮实施」的口吻记在本档，没有条目、没有验收，而 §2 是实施席唯一的任务通道。设计档零字节改动。

## 自动推进（用户令，2026-11-15 17:00）

- **已定决定**：本批剩余全程自动推进，不在每站等确认 · 用户原话：「自动跑完吧」 · 时间：2026-11-15 16:59
- **范围**：评审点火、修面轮、实施、验收、收口、提交，全部由主 agent 连跑。
- **仍然停下找用户的四类**：评审出 🔴 且改不了 · 实施发现设计缺口 · 用户叫停 · 范围变更。

## 收口门受阻：跨批重叠补登记（主 agent，2026-11-15 17:25）

**已定决定**：收口前置门（tier-reading gate）要求 §2 机读清单为「本批窗口内改动过的代码档」各有一行读数。本批窗口内混进了相邻批 `#2443` 的提交 `52eeeab1`，七个代码档因此被判为「本批改动」而清单里没有它们。处置 = 由设计席在 §2 机读清单末尾补登记，**并如实注明它们不是本批改动**。 · 用户原话：「自动跑完」 · 时间：2026-11-15 17:00

**要补的七行 + 一行**（第三列写该档在**批起快照**上的 `countContentLines` 读数；快照取法见本档 §8；快照里没有的写 `新`）：

- `bench/check/probe.check.mjs` — 338
- `bench/probe/data.mjs` — 237
- `bench/probe/driver.mjs` — 274
- `thincoder-core/agent-tools/audit-block.mjs` — 62
- `thincoder-core/agent-tools/spawn-gates.mjs` — 203
- `thincoder-core/agent-tools/subagent-spawn.mjs` — 430
- `thincoder-core/agent-tools/subagent.mjs` — 425
- `thincoder-core/agent-tools/taskbook-block.mjs` — `新`

七个数是收口门自己报的基线读数；仍须按量法在批起快照上复核一次，不符就以你实量的为准，并在表下写明差异。

**必须写的一句**（表下，紧邻机读清单）：这八档由相邻批 `#2443` 在本窗口内改动，本批对它们零改动；登记它们只为满足收口门的取材口径（跨批重叠，另见台账 `#2439`）。

**不做**：不改任何代码；不动 §2 的条目 1–10、验收对照、集成增量；不重新设计任何内容。这一轮只为让记录如实承载收口门的取材口径。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（本轮 = 修面轮 #26 的落地核对：八处全部在盘（第 3 条由主 agent 落）、机检 PASS、回执见本段末；待裁仍是灰度开关（本席建议 B））







### 本批条目（覆盖）

台账 `#2444`（归批）。§1 后期（14:30–14:46）的「统一基准」裁定取代早先「三条窄修复」的范围声明，七条目标态同批落、不拆批。设计档 = `docs/core/design/CONTEXT-COMPACTION.md`。

| # | 条目 | 现场坐标 | 设计落点 |
|---|---|---|---|
| 1 | 派生链单向：`window` 唯一输入，`limit = window − reserve`，`threshold` 从 `limit` 派生 | §1 目标态 1 ∥ 用户 14:48 裁定 | 设计 §2.2 |
| 2 | 单调性：窗口增大时 `limit` 与 `threshold` 都不减小 | §1 目标态 2 | 设计 §2.2 |
| 3 | 废除静默兜底：半窗退化与 absent 地板退场，派生矛盾在装载期报错 | §1 目标态 3 | 设计 §2.4 |
| 4 | 保留线由可用容量倒推（尾预算不再取 `window × 0.15`） | §1 目标态 4 | 设计 §4 |
| 5 | 处置链串联：裁 → 摘要 → 丢弃，每步重测，够则停 | §1 目标态 5 ∥ §1「三」 | 设计 §5.1 |
| 6 | 模型与参数变更的预判 | §1 目标态 6 | 设计 §5.2 |
| 7 | 显示与判定同基准（分母 = `limit`，两线可分辨） | §1 目标态 7 | 设计 §2.5 ∥ §7.1 |
| 8 | absent 档预留取服务端默认输出 | §1「一」∥ 用户 14:00 裁定 B | 设计 §2.2.1 |
| 9 | 结构编辑后实测基线重定（不归零） | §1「二」 | 设计 §3.1 |
| 10 | 压缩线加绝对值上限 `RETAIN_CAP_TOKENS = 262_144`（只夹压缩线，不夹 `limit`） | §1 用户 2026-11-15 16:12／16:15 裁定 | 设计 §2.2 ∥ §4 |

### 逐条答复

**1 · 派生链（目标态 1）。**

`limit = window − reserve`；`threshold = limit − INJECT_HEADROOM_TOKENS`（50000）。算式与依据见设计 §2.2。

比例项退场，理由：它与绝对余量算的是同一个量（压缩线上方留多少注入空间），而在大窗口上把线压回 `0.6 × window`——用户设的 1M 窗口只用得到 629K。

`INJECT_HEADROOM_TOKENS` 的来处 = `window-policy.mjs` 的注记（`30–50K` 实测带），取上界。理由不对称：估小一档是压缩线失效、守卫报错，估大一档只多付一次早压。

算式投影（量法 = 本席按设计 §2.2 的算式手算，输入 = `model-specs.mjs` 的表项；实施轮由单测逐位复读，手算数不入验收）：

| 档 | 改前 threshold ∥ limit | 改后 threshold ∥ limit |
|---|---|---|
| `deepseek-flash`，`context: 320`（用户现场） | 163,840 ∥ 163,840 | 212,144 ∥ 262,144 |
| 同上 + `reasoningEffort: "max"` | 163,840 ∥ 163,840 | 146,608 ∥ 196,608 |
| `deepseek-flash` 默认（窗 1,000,000） | 600,000 ∥ 616,000 | 262,144 ∥ 934,464 |
| `context: 1024`（= 1,048,576） | 629,145 ∥ 664,576 | 262,144 ∥ 983,040 |
| `gpt-5.6`（非思考，`maxOutput` 128,000） | 630,000 ∥ 922,000 | 262,144 ∥ 1,041,808 |
| `context: 320` + `maxTokens: 200000`（explicit） | 127,680 ∥ 127,680 | 77,680 ∥ 127,680 |

上表后三行的 `threshold` 落在 `RETAIN_CAP_TOKENS`（262,144）上：1M 级窗口全部封顶，`limit` 不受封顶影响。封顶门槛 = `limit > 312,144`（absent 档思考模型换算成 `window > 377,680`），320K 两行仍由 `limit` 派生。

用户现场：`193,962 ≤ 262,144`，余量 68,182，压缩线在 212,144——两线间距 50,000（该档在封顶门槛以下）。

**2 · 单调性（目标态 2）。**

`limit` 对窗口斜率 1（`reserve` 斜率 0），`threshold` = `min(limit − 注入余量, RETAIN_CAP_TOKENS)`：门槛以下斜率 1，越过后转 0。两个臂都不随窗口减小，`min` 也不减小——恒定不算减小。

窗口坐标上出现回落，只可能是有常量以 `min` 上界之外的方式参与了算式。封顶只把斜率截成 0，压不回曲线。

**3 · 废除兜底（目标态 3）。**

删两处：`usableWindow` 的 `floor(window / 2)` 退化分支、`budgetOf` 的 absent 地板 `max(bare, threshold)`。

`reserve ≥ window` 与 `threshold ≤ 0` 都是派生不成立，在装载期抛并点三个数（设计 §2.4）。装载判据点 = `agent/setup.mjs` 的装配段。

受影响配置已知一例：`doubao-seed-2-1-turbo-260628`（256K 窗 / 256K `maxOutput`）从「跑在半窗」变成装载期拒绝。这是有意的行为变更，列入 §6 交代。

**4 · 保留线（目标态 4）。**

`tailBudgetTokens(provider, workMode, fixedOverhead, ratio) = max(0, floor(threshold / ratio) − fixedOverhead − SUMMARY_TOKEN_ESTIMATE − 注记估算)`，算式见设计 §4。

`keepTailSize` 退为条数上界与地板，不再是预算：一条消息的体量跨三个数量级，条数推不出容量。

两个新参数必填无缺省（设计 §2.3）。`collectStaleToolOutputs` 同步多两参，四个消费点各自传值。

**5 · 处置链（目标态 5）。**

设计 §5.1 的 ①–⑦：阈值早退 → 固定开销门 → prune 并重测 → 够则停 → 摘要并重测 → 失败或不够则丢弃并重测 → 仍超则守卫抛。

摘要失败一次即走 `compressFallback`。`COMPRESS_FAILURE_LIMIT` 与 `degradeIfCompressExhausted` 随之退场，`compactFailureNote` 的「attempt N of 3」文案同改。

代价写明：端点持续不可用时，每个安全点白付一次失败的摘要请求。换来的是任务不因摘要面故障中止。

**6 · 切换预判（目标态 6）。**

`preflightWindowFit(agent, ctx)`（`agent/run-stages.mjs`）在 run 装配之后、第一个回合之前，比 `contextUsage.total` 与 `policyBudget(...).limit`；超了就跑与 §5.1 同一条处置链。

落点理由：参数按 run 现算，「变更那一刻」就是下一次装配。一处覆盖模型切换 ∥ `context` 调小 ∥ `reasoningEffort` 变更三条来路，不必为每条各立钩子。

**7 · 显示同基准（目标态 7）。**

分母 = `limit`（用户实际可填的量）；`historyReading` 返回 `{ tokens, pct, window, limit, threshold }`；告警判据从魔数 `ctxPct >= 80` 改成 `tokens >= threshold`。

四个消费面点名：CLI 状态行 ∥ VSC `specs.mjs` ∥ Desktop 的 `ev:usage` 载荷 ∥ stats 第 6 行。打开态读数走 `historyPercent`，随同一函数取值。

**8 · 基线重定（原「二条」）。**

`_lastPromptTokens' = _lastPromptTokens − round((estBefore − estAfter) × ratio)`；`_usageAtLen'` 取剪切后仍属旧前缀的消息之后的第一个下标。

误差 ∥ 自纠 ∥ 边界 ∥ 形态四条性质见设计 §3.1。自纠路径 = 下一次服务端响应整体覆写两个字段，漂移活不过这一回合。

**9 · 与 `#2432` 的关系。**

本批**收窄**那个面、不修它。320K 档 `limit` 从 163,840 抬到 262,144，固定开销与上限的间距因此变宽；prune 在保留窗不动的前提下把 prompt 带到线下，可达性门更少恒假。

保留窗硬地板本身留在设计 §1.2 的已知边界。`#2432` 的处置见 §6，本批不动它。

### 待用户裁定的三点

**一 · `threshold` 的基准** → 已由 14:48 裁定解决（可自由重定，取绝对余量）。本席据此选 `limit − INJECT_HEADROOM_TOKENS`，比例项退场，理由见上第 1 条。

**二 · 状态行分母** → 目标态 7 已定「换成用户实际可填的量」，本设计按 `limit` 落，四个消费面同改。要换回 `window` 是一行的事，但那会与目标态 7 相反。

**三 · 灰度或回退开关** → **OPEN，本席不选定。** 选项与代价：

- **A · 直接落，无开关**：1M 窗口的逐字保留量升到预算允许的上限。代价 = 一次性行为跳变，用户无回退手段。
- **B · 配置项 `agent.tailBudgetMode`（`derived` ∥ `ratio`，默认 `derived`）**：给一个可退的档。代价 = 多一个配置项，且过渡期「一个量两套刻度」仍同时在场。
- **C · 环境变量保险丝**：不入配置面，只在发版期用。代价 = 隐藏开关，读配置的人看不出来。

本席建议 B——§1 里用户问的就是「是否需要灰度或回退开关」，问这句本身说明在意可退。

开关与算式正交：尾预算的算式本身不受影响。未裁前实施按 A 落，裁定若选 B 由同一批补，不进下一批。

### 需求档口径（D11 同轮扫，本轮实读核对结果）

本席本轮直读 `docs/core/requirements/CONTEXT-COMPACTION.md` §2，三处都与设计同口径：

- 预留：依据 `docs/core/requirements/CONTEXT-COMPACTION.md`「预留使用实发 maxTokens；未发时使用服务端默认输出上限，并与规格 maxOutput 取较小者（思考模型 64K、非思考 8K，`reasoning_effort: max` 档 128K）」。
- 压缩线：依据同档「自动压缩线 = 输入上限 − 注入余量。余量是绝对量，不随窗口缩放；取值与依据在设计档」。
- 分母：依据同档「压缩线、尾部预算、用量百分比和发送前守卫一律从输入上限派生，不以窗口为分母各算一套」。

比例项与半窗退化在需求档已无残留句：本轮用 `min(usableWindow` ∥ `floor(window × 0.6)` ∥ `半窗` 三个串扫该档，零命中。

三处因此停在同一个口径上，代码、设计档、需求档不需要再有人补笔。

名词对应（读的人不必自己猜）：需求档的「输入上限」= 设计档的 `limit`、「注入余量」= `INJECT_HEADROOM_TOKENS`、「自动压缩线」= `threshold`。

### 受影响文件

| 档 | 改什么 |
|---|---|
| `thincoder-core/window-policy.mjs` | `outputReserve` 第三段取服务端默认输出；`budgetOf` 删 `usable` 与 absent 地板、`threshold` 改派生并夹 `RETAIN_CAP_TOKENS` 上界；新增 `INJECT_HEADROOM_TOKENS` 与 `RETAIN_CAP_TOKENS`；删 `COMPACT_RATIO`；`usableWindow` 删半窗退化改抛 |
| `thincoder-core/token-window.mjs` | `tailBudgetTokens` 改四参减法链；`collectStaleToolOutputs` 加两参；`historyReading` 分母改 `limit` 并带出 `threshold`；新增 `rebaseMeasured`；删 `TAIL_BUDGET_FRACTION` |
| `thincoder-core/context.mjs` | `applyCompression` 两处置零改重定；`compressIfNeeded` 落 ①–⑦；摘要失败即 `compressFallback`；删 `COMPRESS_FAILURE_LIMIT` |
| `thincoder-core/context-degrade.mjs` | `pruneStaleToolOutputs` 收 `fixedOverhead` ∥ 改重定；`shrinkOversized` 改重定 |
| `thincoder-core/explore-distill.mjs` | `summarizeRunExplorations` 改重定 |
| `thincoder-core/agent/run-stages.mjs` | 新增 `preflightWindowFit`；`degradeIfCompressExhausted` 退场 |
| `thincoder-core/agent/setup.mjs` | 装配后调一次 `usableWindow` 作装载期判据 |
| `thincoder-core/agent-tools/context.mjs` | stats 分母与 prunable 读数传新参；`compactFailureNote` 文案收正 |
| `thincoder-core/config.mjs` | 预算族转口随 `COMPACT_RATIO` 退场收正 |
| `thincoder-core/advisor/compaction.mjs` | 零代码改动：`outputReserve` 签名不变，读数随同一算式移动；`usableWindow` 的拒绝同源生效 |
| `thincoder-cli/src/tui/status-line.mjs` | 告警判据 `ctxPct >= 80` → `tokens >= threshold` |
| `thincoder-cli/src/tui/render-loop.mjs` | `ctxCacheOf` 带出 `threshold` 供状态行用 |
| `thincoder-vscode/src/specs.mjs` | 随 `historyReading` 新分母（端侧零自算式） |
| `thincoder-desktop/src/main/agent-host.mjs` | 同上 |
| `docs/core/design/TOOL-OUTPUT-LIMITS.md` | 零改动（已核）：§2 已承载 `buildDualEndPreview(text, budget)` 的构造器契约——`budget` 必填无默认、两个调用点传 `TOOL_RESULT_PREVIEW`、切点只用导出面这两个；设计档 §1.2 的引用改按母版原话写 |

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/window-policy.mjs | — | 160 |
| thincoder-core/token-window.mjs | — | 323 |
| thincoder-core/context.mjs | — | 319 |
| thincoder-core/context-degrade.mjs | — | 85 |
| thincoder-core/explore-distill.mjs | — | 151 |
| thincoder-core/advisor/compaction.mjs | — | 199 |
| thincoder-core/agent/run-stages.mjs | — | 372 |
| thincoder-core/agent/setup.mjs | — | 310 |
| thincoder-core/agent-tools/context.mjs | — | 202 |
| thincoder-core/config.mjs | — | 426 |
| thincoder-cli/src/tui/status-line.mjs | — | 210 |
| thincoder-cli/src/tui/render-loop.mjs | — | 153 |
| thincoder-vscode/src/specs.mjs | — | 92 |
| thincoder-desktop/src/main/agent-host.mjs | — | 344 |
| docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs | — | 新 |
| docs/core/design/TOOL-OUTPUT-LIMITS.md | — | — |
```

**档位结论**：机读清单里的十四档代码档逐档在批起快照 `100def4c` 上用 `countContentLines` 量（`git show <sha>:<档>` 的输出过该尺），最大 426（`thincoder-core/config.mjs`），全部 ≤ 500 ⇒ 第二列全写 `—`。剩下两行不带行数读数：单测档为本批新建、快照里没有，记 `新`；母版设计档是 `.md`，记 `—`。

### 集成增量（对 `test/RTM.md`）

**新增一例，编号 `CLI 16-2`，挂在故事 `CLI 16`「状态行百分比与压缩判据同尺」下**，标题 =「把小窗口设小后，压缩线由硬上限派生、状态行百分比以可填量为分母」。

- **交互面**：用户在 TUI 把 `providers[].context` 从 1024 改成 320，再发一条消息。

- **业务可观察结果**：不出现 `context overflow`；状态行百分比的分母是 262,144 而不是 327,680，越过 212,144 时告警亮起，而请求仍发得出去（硬上限还剩 50,000）。

断言：`deepseek-flash` 在 `providers[].context` 取 `320`（K 单位 ⇒ 327,680）时 `policyBudget` 得 `limit === 262144 ∥ threshold === 212144`；`historyReading` 的 `pct` 分母为 `limit`。

- **服务的需求**：需求 §2 的派生链与有效窗口条目、以及需求 §2 的「显示与判定同基准」条目。

**编号先于标题定，且落在索引上**：故事 `CLI 16` 现有一例 = `16-1`（`test/rtm/loop.md` 故事 `CLI 16` 表内，档 = `test/integration/context-percent-calibrated.test.mjs`），本批新增的一例取 `16-2`；实施轮在 `test/rtm/loop.md` 该故事表内补一行 `16-2`，测试档里逐字写作 `test('CLI 16-2 …')`。

**不改写、不删除既有用例**：`CLI 16` 的既有判据（同尺）不变，本批只补小窗那一格。

### 单测面

档 = `docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs`，与批档同目录同名，收口删除。

| 面 | 红侧（改前形态） | 绿侧（改后形态） |
|---|---|---|
| 派生链 · 320K | `limit 163840 ∥ threshold 163840` ⇒ `limit >= 262144` 当场红 | `262144 ∥ 212144` |
| 派生链 · 用户现场 | `193962 <= limit` 为假 | 放行，余量 ≥ 65000 |
| 派生链 · 1M 基线（封顶饱和） | 改前 `threshold` 933040 | `context: 1024` 档 `262144 ∥ 983040`；窗口再大 `threshold` 不动、`limit` 照涨 |
| 封顶只夹压缩线 | 把 `min` 写在 `limit` 上的实现下 `limit < 983040` 当场红 | `context: 1024` 档 `limit === 983040`；窗 2,000,000 上 `threshold` 仍 262144、`limit` 继续变大 |
| 封顶 · 显式档同夹 | 落地前 `threshold === 556784` | `maxTokens: 393216`、窗 1,000,000 ⇒ `limit === 606784 ∥ threshold === 262144` |
| 派生链 · 单调性 | — | 窗口序列 128K→1M 上两值均不回落 |
| 预留档 · explicit ∥ spec | — | `maxTokens: 393216` 仍 393216；anthropic 档 = `spec.maxOutput` |
| 装载期拒绝 | — | `usableWindow(256000, 256000)` 抛并点三数 |
| 尾预算 | 改前 `window × 0.15` 不随固定开销变 | 固定开销加倍 ⇒ 尾预算减小 |
| 基线重定 | 改前 `basis === "estimated"` | 四处（prune ∥ shrink ∥ 压缩 ∥ 蒸馏）`basis === "measured"` |
| 基线 · 减到非正 | — | 退 `null` |
| 处置链 · prune 够 | 改前必发摘要请求（`chat` 桩被调用） | 返回 false 且桩零调用 |
| 处置链 · 摘要失败 | 改前抛 | `compressFallback` 被调用，任务不中止 |
| 处置链 · 幂等 | — | 同一历史连跑两次 prune，第二次 `pruned === 0` |
| 切换预判 | 改前无此判据 | `preflightWindowFit` 在超限时跑处置链 |
| 显示同基准 | — | `historyReading(...).pct` 分母为 `limit` |

标「—」的行是不变量与新增面，改前形态不存在；其余各行在改前代码上按左列红。

### 关键决策

- **比例项退场，不保留作第二支上限。** 它与绝对余量算同一个量；留两套刻度，必然在某个窗口上互相打架。
- **半窗退化删除，改装载期拒绝。** 半窗把不成立的配置渲染成「能用一半」，故障推到发送期且报文指错方向。
- **`outputReserve` 签名不变（两参）。** `reserve` 与窗口无关，收窗口会让调用方以为存在按窗分尺。
- **尾预算改减法链、`keepTailSize` 降为条数上界。** 容量只有一个刻度 = token。
- **摘要失败一次即丢弃。** 零网络的 `compressFallback` 比「等三次失败」更早把会话救回来。
- **切换预判放在装配点，不立模型切换钩子。** 参数按 run 现算，装配点就是变更生效点，一处覆盖三条来路。
- **`agent/setup.mjs` 与 `session-lifecycle.mjs` 的置零不动**：那是「还没有历史」，不是「历史被改动」。

### 上抛项

1. **[上抛·待裁] 待裁三点中的第三点（灰度 / 回退开关）**。本席建议 B，未裁前按 A 落。
2. **[上抛·待裁] 同面不同档的一处活缺陷（本批按边界不修）。** `config-presets.mjs` 的 `deepseek` 预置带 `maxTokens: 384_000`，走 explicit 档；窗口设到 320K 时该配置派生不出输入窗口。本轮实跑 `policyBudget({ format: "openai", model: "deepseek-flash", context: 320, maxTokens: 384000 }, undefined, "normal")` ⇒ 抛 `usableWindow: the output reservation 384000 leaves no input window — window 327680 − reserve 384000 = -56320`；装载期拒绝已取代原先的负 `limit` 读数。待裁的因此只剩「该预置要不要改」，不再是「要不要给 `limit` 一条与档无关的不为负下限」。
3. **[上抛·知会] 未文档化渠道的默认输出是假设。** 非 DeepSeek 的 absent 档按 8,192 ∥ 65,536 预留；真实默认更大时 `limit` 高于物理线，代价是一次 400 加一次强压重试。

### Leads（不在本批范围，未验证为本批缺陷，不登记台账）

- **默认输出按模型能力判，不按请求的思考模式判。** `thinking.type === "disabled"` 或 `reasoningEffort === "none"` 的 absent 请求仍拿 `spec.thinking` 的 64K 预留，`limit` 比该请求的物理线低 56K。方向是提前判（安全方向），代价是白压一次。
- **`providers[].context` 的单位是 K，且没有一处文档写明。** 本轮实测：`context: 320` ⇒ 窗 327,680，`context: 262144` ⇒ 窗 268,435,456。配置面把一个绝对值误写成 K 值会静默放大一千倍。

### 修面轮（§3 评审 #9 的 18 条，逐条落点）

评审 id `16ca1c3f`，🔴 2 · 🟡 13 · 🔵 4。第 19 条归主 agent（需求档措辞），本席不动。

本席本轮把 18 条逐条对着设计档复核：15 条已落；3 条有残留、已在本轮改净——第 11 条的「今天」式（§5.2 切换预判段）与「从 600,000 抬到 884,464」的前后对比（§2.2.1 四条推论）；第 12 条的「本批」三处（§1.2 的 `TOOL_PROCESS_MSG_CHARS` ∥ `retentionWindowStart` 两条、§4 的 `keepTailSize` 段）；第 15 条的母版引文（§1.2 引母版时写了母版没有的两句话）。

第 15 条的另一半结论：母版 §2 已承载带 `budget` 的构造器（`budget` 必填无默认、两个调用点传 `TOOL_RESULT_PREVIEW`、切点只用导出面这两个），本批对它零改动——受影响清单那一行因此改成「零改动（已核）」，设计档 §1.2 的引用改按母版原话写。

下表「落点」的设计档 = `docs/core/design/CONTEXT-COMPACTION.md`，母版 = `docs/core/design/TOOL-OUTPUT-LIMITS.md`。

| # | 改了什么 | 落点 |
|---|---|---|
| 1 | 签名统一为六参 `collectStaleToolOutputs(history, provider, workMode, protectFrom, fixedOverhead, ratio)`，删掉「不属于那一面」的四参说法；补四个消费点的 `fixedOverhead` ∥ `ratio` ∥ `protectFrom` 来处表 | §2.3 ∥ §7.2 |
| 2 | 槽里有什么改成带射程的一句：保留窗内两轮工具过程逐字（挂轮记录、经 `turns` 投影），窗外只剩 slim 前段；三处绝对句全改 | §1.1 ∥ §1.2 ∥ §7.2 |
| 3 | 补「有效窗口是读数时现推的推导值」：不落盘、不进 provider ∥ config、不跨会话；档位是槽里的事实，两者不可互代 | §2.1 |
| 4 | 降级载荷点名 `discardedMessages`（丢弃条数）∥ `discardedTurns`（被丢轮次数）∥ `tailMessages` | §5.1 ∥ §9 |
| 5 | 回查面改成按角色分支的截断标记（依据 `session-segments.mjs` 的 `slimForDisplay` 与 `session-lifecycle.mjs` 的 U+2026 注记）；保留逐字的理由改成「残片就是残片」 | §1.1 |
| 6 | `defaultOutput` 的覆盖范围按 `provider.format` 判；已核族只有 DeepSeek，其余渠道的假设连同方向与代价写明 | §2.2.1 |
| 7 | 点名三处 `usableWindow` 各喂什么窗口（模型窗口 ∥ 有效窗口 ∥ advisor 自身模型窗口），tiny 判据随 `capWindow` 走 | §2.2.1 |
| 8 | `budgetOf` 说清是 `window-policy.mjs` 的私有算式、两个出口共用；校准比收敛到读取面 `tokenRatioOf(agent)`，≥1 下界落在该面上 | §2.2.1 ∥ §3 |
| 9 | `requestBudget` ∥ `policyBudget` 答 `existing:`，`preflightWindowFit` 答 `none found:`（查过 run-stages ∥ session-lifecycle） | §1.2 三问块 |
| 10 | 第 ③ 步补射程：合格集非空的只有 §7.2 的两类状态，其余状态是 no-op，常见路径成本落在 ⑤ | §5.1 |
| 11 | 修订式与「今天」式改成单一目标态陈述；被否候选的持久理由留成「为什么不取 X」 | §2.2 ∥ §2.2.1 ∥ §5.1 |
| 12 | 设计档删删除清单与「本批新增面」验收行，搬进本段下面两块 | 本档 §2 |
| 13 | 本段补集成增量的交互面、业务可观察结果、所服务的需求 | 本档 §2 |
| 14 | 删「（目标态第 2 条单调性）」括注，只留斜率推导 | §2.2 |
| 15 | 母版 §2 补 `buildDualEndPreview(text, budget)` 的构造器契约与 `budget` 必填无默认，两边措辞对齐 | 母版 §2 |
| 16 | `threshold ≤ 0` 写成构造判据（减法链多一项），并说清与 `reserve ≥ window` 的报文差别 | §2.4 |
| 17 | 「四个消费面」改成五个并逐个点名（端侧三面 + 核内两面） | §2.5 |
| 18 | §1.2 已知边界承认「保留窗内一条特大用户请求」这条来路，处置 = 如实报错 | §1.2 |

**删除清单**（自设计档 §2.2 ∥ §10 搬入，实施轮执行）

- `COMPACT_RATIO`（`window-policy.mjs`）与 `TAIL_BUDGET_FRACTION`（`token-window.mjs`）：定义、注记与消费一并删净。
- `usableWindow` 的半窗退化分支、`budgetOf` 的 absent 地板 `max(bare, threshold)`、预算对象的 `usable` 字段。
- `COMPRESS_FAILURE_LIMIT` 的连续失败计数与 `degradeIfCompressExhausted`。

**验收行**（自设计档 §10 搬入；逐行断言见本段「单测面」表）

- absent 档预留取默认输出（小窗两线间距恒为注入余量）、派生链单调、派生不成立在装载期报错并点三个数。
- 尾预算随固定开销移动、基线重定且下一次响应自纠、prune 够则不发摘要请求、摘要失败一次即丢弃并报出条数。
- 切换预判在首回合前处置存量历史、状态行百分比与压缩线同取 `limit` 为分母。
- 压缩线在封顶处饱和：窗口再大 `threshold` 也不超过 `RETAIN_CAP_TOKENS`，`limit` 仍随窗口增长；封顶只作用于 `threshold`。

**修面轮新增的两条红侧断言**：`defaultOutput` 按 `provider.format` 分支（anthropic 档仍 = `spec.maxOutput`）；降级载荷带 `discardedMessages > 0`。其余行不变。

### 修面轮 #12（2026-11-15）

**1 · 上抛 1（需求档三句矛盾）→ 盘上无此条，本项零改动。**

主 agent 令删「§2 里那条过期上抛」。本轮两遍扫 §2 全段（模式 `上抛|需求档`、`三句|矛盾|过期`）。

命中的是条目表第 3 行的「派生矛盾在装载期报错」（指 `reserve ≥ window` 的配置矛盾）、`config-presets` 那条活缺陷上抛、与「需求档口径」段，没有一条断言需求档三句互相矛盾。

「上抛项」只有三条（灰度开关 ∥ `config-presets` 活缺陷 ∥ 未文档化渠道默认值）。盘上无从删起——它若只走过 `notify_parent`，则从未落过盘；本席不猜它当初写在哪。

需求档侧本轮实读，主 agent 的判读成立。依据 `docs/core/requirements/CONTEXT-COMPACTION.md`：

- 「预留使用实发 maxTokens；未发时使用服务端默认输出上限，并与规格 maxOutput 取较小者（思考模型 64K、非思考 8K，`reasoning_effort: max` 档 128K）」
- 「自动压缩线 = 输入上限 − 注入余量。余量是绝对量，不随窗口缩放；取值与依据在设计档」
- 「压缩线、尾部预算、用量百分比和发送前守卫一律从输入上限派生，不以窗口为分母各算一套」

五串扫该档（`0.6` ∥ `半窗` ∥ `usableWindow` ∥ `COMPACT_RATIO` ∥ `TAIL_BUDGET_FRACTION`）零命中。「需求档口径」段的三处引文与这一读逐字相符，不需要补笔。

**2 · 残留（§2.4 修订式）→ 改净，并扫净同一规则的四条副本。**

设计档 = `docs/core/design/CONTEXT-COMPACTION.md`。改后逐字：

| 位置 | 改后逐字 |
|---|---|
| §2.4 第 2 段 | 这一格不静默兜底：配置不成立就在装载期抛。留到发送期才报的后果是报文说 `context_overflow`、指向会话内容，而真实原因是配置矛盾。 |
| §2.4 第 4 段 | `doubao-seed-2-1-turbo-260628` 那类「256K 窗配 256K `maxOutput`」的配置在这一格被拒：`reserve ≥ window`，装载期就报错。 |
| §2.2.1 的 `usableWindow` 段 | `usableWindow` 接的是「占掉输出的预留」，喂进那个位置的是每次请求的真实预留——`explicit` 档的实发 `maxTokens`，或 absent 档的服务端默认输出，不是模型能力上限。`reserve ≥ window` 时它拒绝并点三个数（§2.4）。 |
| §1.2 两条预算关系 | 两条预算关系只是「为什么通常装得下」的理由，不承担正确性：…… |
| §4 `keepTailSize` 两段 | `keepTailSize(provider, historyLen, workMode)` 是**条数上限**，不是预算：……；它的算式（`min(max(10, floor(有效窗口 / 100000 × 30)), floor(historyLen × 0.4))`）就是上界与地板，不是容量。 |
| §5.1 `COMPRESS_FAILURE_LIMIT` 一句 | 删除（该常量的删除动作由本段「删除清单」承载） |

后四条是本轮按第 11 条的服务面扫出来的同族副本：一条规则往往不止写在一处。

三处保留段的改动只换陈述形态，算式、常量值与要验的面一个字未动。删掉的那一句是「随该格退场」的死亡记录，其删除动作已在「删除清单」里具名。

**同轮复核（本机实跑）**

- `grep '半窗|floor(window / 2)'` 于设计档零命中。
- `grep '删除|退场|原本|不再'` 的剩余命中没有一条是本批改动的死亡记录：`原本如此` 指消息内容、`替换非删除` 指编辑形态，其余是运行时行为与目标态陈述（「切出 tiny 也不再解除」「机读线不再装它们」）。

### 设计修面轮（2026-11-15 16:40 的六项）

派单见 §1 末段。设计档 = `docs/core/design/CONTEXT-COMPACTION.md`。六项逐条（引文 = 改后逐字，均在该档）：

**1 · 算式块加封顶。** §2.2 算式块「`threshold = min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)`」。夹 `threshold`、不夹 `limit`：「封顶只夹压缩线，不夹 `limit`：`limit` 是物理线（窗口减预留），把守卫线压到它之下会在真实越窗之前就报错，制造本来不存在的溢出。」

**2 · 单调性论证。** §2.2「`limit` 对窗口的斜率是 1，`reserve` 是 0……这一支取上界 `RETAIN_CAP_TOKENS` 之后，封顶段上的斜率转 0。两个臂都不随窗口减小，`min` 的结果因此也不减小」。门槛同段写清：「`limit > 312,144`……absent 档思考模型是 65,536，因此 `window > 377,680` 起封顶生效」。四条推论里两条同改：间距改为「未封顶的窗口段上是常数……封顶段上 `threshold` 不动而 `limit` 继续长」，抬升改为「一次抬升到封顶为止」。

**3 · 尾预算由封顶后的压缩线倒推。** §4「1M 窗口上封顶后是 `262,144 − 固定开销 − 注记估算`，不封顶是 `933,040 − 固定开销 − 注记估算`——两者之差恒为 670,896，与固定开销无关」＋「这是本条的目的，不是副作用：拿大窗口的余量换注意力质量。窗口再大，逐字保留量也不再跟着涨。」

**4 · `doubao` 句改。** §2.4 原句「这类配置在这一格被拒」不成立，改为「落进这一格的是 `reserve` 不小于窗口的配置：显式把 `maxTokens` 设到窗口或窗口以上的……」「规格上的输出能力与窗口相等不算：`doubao-seed-2-1-turbo-260628`……它走 absent 档，`reserve = min(256000, 65536) = 65,536`，跑在 `limit` 190,464 上，不被拒。」

**5 · `NOTE_ESTIMATE` 按落地写。** §4「注记与占位估算 = `thincoder-core/token-window.mjs` 的 `NOTE_ESTIMATE` 减 `SUMMARY_TOKEN_ESTIMATE`——`NOTE_ESTIMATE` 住 `token-window.mjs`，`context.mjs` 从它 import（减法链在本档，反向 import 成环）。」

**6 · 两个 262144。** §2.2「两个 262144 不是一回事：本常量封的是**压缩线**，`TINY_WINDOW_CAP`（§2.1）封的是**窗口**……本常量不动窗口，只削压缩线。改一个不动另一个。」

**同族连带三项**（封顶在同一档的其余副本，第 11 条纪律的扫面）：

**7 ·** §2.4 的 `threshold ≤ 0` 构造判据按夹取后的算式重写：`RETAIN_CAP_TOKENS` 是正数 ⇒ 非正只能来自第一个臂。
**8 ·** §10 验证常态补「压缩线在封顶处饱和（窗口再大也不超过 `RETAIN_CAP_TOKENS`，`limit` 仍随窗口增长）」。
**9 ·** §2.2「算式只有上面四行」收成「算式只有上面那个块」——封顶加进来后那个计数对不上了。

**本轮实跑读数**（`execute` 于 `D:\teamcode\thincoder` 跑 `policyBudget` 现读数，封顶按 `min(…, 262_144)` 手加，`ratio` = 1）：

| 档 | window | reserve | limit | 未封顶 threshold | 封顶后 | 尾预算（固定开销 45,000） |
|---|---|---|---|---|---|---|
| `deepseek-flash` `context: 1024` | 1,048,576 | 65,536 | 983,040 | 933,040 | 262,144 | 886,928 → 216,032 |
| 同上 `context: 320` | 327,680 | 65,536 | 262,144 | 212,144 | 212,144 | 166,032（不变） |
| `doubao-seed-2-1-turbo-260628`（absent） | 256,000 | 65,536 | 190,464 | 140,464 | 不改 | 该配置不被拒 |
| `gpt-5.6`（absent） | 1,050,000 | 8,192 | 1,041,808 | 991,808 | 262,144 | — |

`NOTE_ESTIMATE` = 1112（同次实读）。封顶门槛 = `limit > 312,144`；absent 思考档 `window > 377,680`。

**需求档口径（D11，本轮实读）**：依据 `docs/core/requirements/CONTEXT-COMPACTION.md`「自动压缩线 = 输入上限 − 注入余量，并封顶不超过 262,144。余量与上限都是绝对量，不随窗口缩放；取值与依据在设计档。」设计档 §2.2 的上限句与之同口径，需求档不需要再有人补笔。

**§2 本段的两处连带更正**（封顶使原值失效，按 §2 ↔ 设计核对）：

- 「算式投影」表后三行：`threshold` 由 884,464 ∥ 933,040 ∥ 991,808 改为 262,144（`limit` 各行不变），并补一句写清封顶门槛。
- 「单测面」的 1M 基线行：改为 `262144 ∥ 983040`，面名加「封顶饱和」。

**封顶的落地状态**：设计 §2.2 与需求 §2 已写封顶（`threshold = min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)`）；`thincoder-core/window-policy.mjs` 里既无 `RETAIN_CAP_TOKENS`、`budgetOf` 的 `threshold` 也还是无夹取的一行——规格与代码在这一处不一致，由「实施条目 10」在下一轮实施跟上。

### 实施条目 10（256K 压缩线上限）：落点与验收

**为什么单立一条。** §1 的 16:12／16:15 裁定把压缩线的绝对上限定在 `RETAIN_CAP_TOKENS = 262_144`，设计 §2.2 已承载算式与理由；代码面尚未落地（§5 的实施记录成于该裁定之前）。§2 是实施席唯一的任务通道，这一条在这里有编号、有落点、有红侧断言。

**算式**（逐字同设计 §2.2）

```js
export const RETAIN_CAP_TOKENS = 262144
const threshold = Math.min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)
```

**代码落点。**

- `thincoder-core/window-policy.mjs`：常量与 `INJECT_HEADROOM_TOKENS` 同处；`budgetOf` 里现读作 `const threshold = limit - INJECT_HEADROOM_TOKENS` 的那一行改成夹取式。理由（用户的现场观测：大上下文下部分模型注意力衰减）照设计 §2.2 的注释口径写，不重造论证。
- 只夹 `threshold`：`usableWindow` 与 `limit` 两行一字不动。夹 `limit` 会把守卫线压到物理线之下，在真实越窗之前就报错，制造本来不存在的溢出。
- `threshold ≤ 0` 的抛点与报文不变：`RETAIN_CAP_TOKENS` 是正数 ⇒ 非正只出自第一臂。
- `thincoder-core/config.mjs` 的 re-export 行补 `RETAIN_CAP_TOKENS`（与 `INJECT_HEADROOM_TOKENS` 同列）：预算族常量的导入面只此一处，两个常量各留一半会让人以为其中一个不是策略值。
- `thincoder-core/token-window.mjs` 的 `tailBudgetTokens` 不改：它读 `policyBudget(...).threshold`，封顶自动落到尾预算上（设计 §4）。

**验收断言**见「单测面」表的封顶三行：饱和段 `threshold` 恒 262,144、`limit` 不被夹、显式档同夹。

**集成增量（对 `test/RTM.md`）：改写一例，零新增，零删除。**

改写「CLI 11-5 恢复带样本的长会话：首请求走估算支先压一次，不吃 400」。

- 非改不可的算术：该例的前提是「未校准估算 < 压缩线，校准后 > `limit`」。1M 窗封顶后 `threshold` 262,144、`limit` 606,784，样本比 1.473 ⇒ `raw < 262144` 与 `raw × 1.473 > 606784` 无解（下限 411,939 已高于上限）。前提在封顶下不可达，不是判据放宽。
- 改法：窗档落到封顶门槛以下（`limit ≤ 312,144`），那一带 `limit − threshold` 恒为 50,000，原不变量照旧成立。可行坐标 = `providers[].modelContext: 320`（窗 327,680，absent 档预留 65,536）⇒ `262,144 ∥ 212,144`；巨型历史缩到约 195,000（`raw ≈ 195,000 < 212,144`，`× 1.473 ≈ 287,272 > 262,144`）。逐位读数由实施轮实跑给。
- 样本 `num / den`（723,272 / 491,000）不动：那是现场真读数，改它等于造一个测量；缩放的是历史体量。
- 断言随之改：夹具前提三个数 `1,000,000 ∥ 606,784 ∥ 556,784` → `327,680 ∥ 262,144 ∥ 212,144`。行为断言（压缩恰一次、回合请求恰一次、无 400、压缩在回合请求之前）一条不改。

**两例不改写，实施轮实跑并登记读数。**

- 「CLI 11-6 正常：固定开销吃掉压缩线 ⇒ 零压缩、零摘要请求，用户照常拿到答复」与「CLI 11-7 边界：固定开销逼近压缩线、中段可摘够 ⇒ 压缩恰一次，回复仍引用尾部工具结果」的前提断言取显式 `compactThreshold`（76,800 ∥ 420,000），封顶不动那两个数；但尾预算读策略线（`tailBudgetTokens` 自 `policyBudget` 算），封顶会收窄这两例的尾。实跑绿则记读数收口；红则同样把窗档落到门槛以下，不新增用例。
- 「CLI 16-2」不动：320K 档在门槛以下，`212144 ∥ 262144` 逐位不变。

**边界。** 不夹 `limit`；不动 `spec` ∥ `explicit` 档的 `reserve`；不动 `TINY_WINDOW_CAP`（262,144 同值不同物：那个封窗口，这个封压缩线）；不动 `INJECT_HEADROOM_TOKENS`；不引入回退开关。

### 修面轮 #26（设计席 · 2026-11-15）：复评 #19 的 8 条 Deferred

§6 的收口轮把复评 #19 的 8 条 Deferred 交到设计席的交付后修面轮（`#26`）。7 条是设计档的笔，逐条落完；第 3 条是需求档 §10，主 agent 的笔，本席不写。

设计档 = `docs/core/design/CONTEXT-COMPACTION.md`。本轮只动下面七处：零代码、零需求档、零单测档、零新增条目。

| # | 改了什么 | 改后逐字（均在 `docs/core/design/CONTEXT-COMPACTION.md`） |
|---|---|---|
| 1 🟡 | §2.2「只有一种合法的进入方式」过绝对 ⇒ 窄化成两种形态 | 「与窗口无关的常量进入算式有两种形态：减法项与 `min` 的上界。减法项（`INJECT_HEADROOM_TOKENS`）把曲线整条平移，斜率仍是 1；上界（`RETAIN_CAP_TOKENS`）把斜率截成 0。两者都不反转方向，压不回曲线。」 |
| 2 🟡 | §2.1 给 tiny 的 262144 命名，使 §2.2 的 `TINY_WINDOW_CAP`（§2.1）落到真有其名处 | 算式块「有效窗口 = tiny 档 ? min(模型窗口, TINY_WINDOW_CAP) : 模型窗口」＋「TINY_WINDOW_CAP = 262144」；段末「`TINY_WINDOW_CAP` 是 `thincoder-core/window-policy.mjs` 的导出常量，`effectiveWindow` 与 `policyBudget` 同调 `capWindow` 时取它。」 |
| 3 🟡 | 需求 §10 补「压缩线在封顶段饱和」一项 | **未做**：需求档是主 agent 的笔（D1 派单表），本席不写。 |
| 4 🟡 | §2.4 的 doubao 两个数补出处，形态照 §2.2.1 引 DeepSeek 文档那一句 | 「依据 `thincoder-core/model-specs.mjs`「[\"doubao-seed-2-1-turbo-260628\", { context: 256_000,   maxOutput: 256_000, thinking: true」——窗口与 `maxOutput` 都是 256,000。」 |
| 5 🔵 | §4 示例写明假设 `reserve` = 65,536 | 「两者之差 = `window − reserve − 312,144`，与固定开销无关，与当档的 `reserve` 有关。」＋「按 `deepseek-flash`（`reserve` 65,536、窗 1,048,576）算，差是 670,896」 |
| 6 🔵 | §4 减法链的净额写法给出来由；「反向 import 成环」从断言改成可核的模块方向 | 「注记与占位估算 = `NOTE_ESTIMATE` 减 `SUMMARY_TOKEN_ESTIMATE`，因为 `NOTE_ESTIMATE` 本身含它」＋「两个常量都住 `token-window.mjs`。减法链在那里，而 `context.mjs` 已经 import `token-window.mjs`——`NOTE_ESTIMATE` 若留在 `context.mjs`，就得让 `token-window.mjs` 反向 import，成环。」 |
| 7 🔵 | §1.2 三问清单补 `RETAIN_CAP_TOKENS` 行；表头「三个新常量」与清单实际条目数不符，同处收正 | 「`RETAIN_CAP_TOKENS` = 262144 · `none found:` 查过 `thincoder-core/window-policy.mjs`（`TINY_WINDOW_CAP` 封的是窗口、`INJECT_HEADROOM_TOKENS` 是减法项，两个都不封压缩线）∥ `docs/core/requirements/CONTEXT-COMPACTION.md` 的压缩线条目（只有一条派生式，没有上限项）——无既有量可复用。」 |
| 8 🔵 | 「封顶」在 §2.2 指 `threshold`、在 §2.2.1 指 `reserve`，同词两义 ⇒ §2.2.1 两处改成本义 | 「explicit 档与 spec 档（anthropic 恒发 `max_tokens`）不取服务端默认输出的较小者」∥「absent 档按服务端默认输出取较小者这一支在那儿一并生效」 |

**依据核对（本轮实读，非转述）**

- 第 2 条的依据：`thincoder-core/window-policy.mjs`「export const TINY_WINDOW_CAP = 262144」，且 `capWindow` 是 `effectiveWindow` 与 `policyBudget` 共用的唯一实现——设计 §2.1 现文与代码同形。
- 第 4 条的依据：`thincoder-core/model-specs.mjs` 的 `doubao-seed-2-1-turbo-260628` 表项，`context` 与 `maxOutput` 都是 `256_000`；引文为该行逐字片段。
- 第 6 条的依据：`thincoder-core/token-window.mjs`「export const NOTE_ESTIMATE = SUMMARY_TOKEN_ESTIMATE + estimateTokens([[...]])」的前半形态与 `tailBudgetTokens` 的减法行「− SUMMARY_TOKEN_ESTIMATE − (NOTE_ESTIMATE - SUMMARY_TOKEN_ESTIMATE)」同形；`context.mjs` 的 import 面含 `from "./token-window.mjs"`，反向 import 即成环。
- 第 6 条的「净额」不是笔误：`NOTE_ESTIMATE` = 摘要目标 + 注记与占位估算，减法链已减过一次摘要目标，再减整额会重复计一次——这就是设计 §4 现在写出来的理由。

**同族扫面（D14：一条规则通常不止一处）**

- 「封顶」改前 12 行、改后 11 行（量法 = `grep` 于本档数命中行）。逐条核过：§2.2 的五处与 §4 的两处指 `threshold`；§2.2.1 改后零命中；§2.2.1「被否掉的候选」那条写「封顶 `reserve`」，宾语在句内点名，不歧义；§10 的「压缩线在封顶处饱和」指 `threshold`。改后含「不封顶」的只剩 §4 那句「不封顶是 `933,040 − …`」——它说的是没有上限时的读数，不是档位，保留。
- `TINY_WINDOW_CAP` 改后全档五行（§1.2 三问清单一行 ∥ §2.1 算式块 ∥ §2.1 常量行 ∥ §2.1 段末 ∥ §2.2 的两个 262144 段），五行指向同一常量。

**本轮读数**

- 段长：三次写门拒写都不是判据问题而是本席新增句并进了相邻长段（拒串点名段首行与字数）；改法是拆段，句式与证据一个字没减。改后 `paragraphHits` 全档零命中。
- 文档机检：`doc_check(mode:"gate")` 于本档 ⇒ 见本轮收口回执。
- 验收面 = 读者读这七处并说哪句不成立：§2.1 的两处、§2.2 的斜率段、§2.2.1 的两处、§2.4 的 doubao 段、§4 的两段、§1.2 的清单。判错 = 引文与盘上代码对不上，或一句仍能读成「常量只有一种进入方式」「封顶是同一件事」。

**未做 / 留给别人**

- 第 3 条（需求档 §10 补「压缩线在封顶段饱和」）：主 agent 的笔，本轮不动。
- 本轮不新增实施条目、不动 §2 已通过的条目 10：封顶已在代码与设计档两侧一致（§5 实施条目 10 的记录与设计 §2.2 算式块逐字相符）。

### 修面轮 #26 · 机检回执与逐处落盘核对（设计席，2026-11-15）

**机检**：`doc_check(mode:"gate", target: D:\teamcode\thincoder, docs:["docs/core/design/CONTEXT-COMPACTION.md"])` ⇒ 首行 `DOC-CHECK GATE: PASS`，无命中行。

**七处逐条落盘核对**（引文 = 本轮读盘所得，除第 3 条外均在该档）

| # | 位置 | 盘上读到的逐字（片段） |
|---|---|---|
| 1 | §2.2 | 「与窗口无关的常量进入算式有两种形态：减法项与 `min` 的上界。」 |
| 2 | §2.1 | 「有效窗口 = tiny 档 ? min(模型窗口, TINY_WINDOW_CAP) : 模型窗口」∥「TINY_WINDOW_CAP = 262144」∥「`TINY_WINDOW_CAP` 是 `thincoder-core/window-policy.mjs` 的导出常量」 |
| 3 | 需求档 §10 | **主 agent 的笔，已落，本席零改动**：依据 `docs/core/requirements/CONTEXT-COMPACTION.md`「压缩线在封顶段饱和：窗口再大也不超过 262,144，而输入上限仍随窗口增长。」 |
| 4 | §2.4 | 「依据 `thincoder-core/model-specs.mjs`「["doubao-seed-2-1-turbo-260628", { context: 256_000,   maxOutput: 256_000, thinking: true」」——与 `thincoder-core/model-specs.mjs` 该行逐字相符 |
| 5 | §4 | 「按 `deepseek-flash`（`reserve` 65,536、窗 1,048,576）算，差是 670,896」 |
| 6 | §4 | 「两个常量都住 `token-window.mjs`。减法链在那里，而 `context.mjs` 已经 import `token-window.mjs`」 |
| 7 | §1.2 | `RETAIN_CAP_TOKENS` 行的 `none found:` 三问答案已在清单内；表头已无条数（现读「本档条目用到的常量与函数名，按三问逐个回答：」） |
| 8 | §2.2.1 | 「explicit 档与 spec 档（anthropic 恒发 `max_tokens`）不取服务端默认输出的较小者」——本义用词，与 §2.2 的「封顶」不同指 |

**常量出处核对**（引文逐条在盘）：依据 `thincoder-core/window-policy.mjs`「export const TINY_WINDOW_CAP = 262144」∥ 同档「export const RETAIN_CAP_TOKENS = 262144」∥ 同档「export const INJECT_HEADROOM_TOKENS = 50000」；`thincoder-core/token-window.mjs`「export const NOTE_ESTIMATE = SUMMARY_TOKEN_ESTIMATE + estimateTokens([」。

**同族扫面重测（D14；量法 = `grep '封顶'` 于该档，本轮实跑）**：10 命中行——§2.2 段内七行（斜率 ∥ 只夹压缩线 ∥ 生效面 ∥ 与窗口脱钩 ∥ 四条推论里的「间距」与「抬升」各一行 ∥「被否掉的候选」一条），§4 两行，§10 一行；§2.2.1 零命中。上一轮记的是 11 行，本轮读 10：差异不影响逐行分类的结论（§2.2 的命中都指 `threshold`，§4 两行指由封顶后压缩线倒推的尾预算，§10 指饱和，§2.2.1 无），按重测值记。

**§2 ↔ 设计档核对**：本轮八处只换陈述形态，算式块（「threshold = min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)」）、常量值、验收判据一个字未动，因此「本批条目」「算式投影」「单测面」三张表不需要重对。

**边界**：本轮零代码、零需求档（第 3 条由主 agent 落）、零单测档、零新增条目。

**验收面（读者判错的方式）**：读 §1.2 的清单行 ∥ §2.1 的算式块与段末 ∥ §2.2 的斜率段 ∥ §2.2.1 的两处（取较小者的射程）∥ §2.4 的 doubao 段 ∥ §4 的两段。判错 = 引文与盘上代码对不上，或某句仍能读成「常量只有一种进入方式」「封顶是同一件事」。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | §2.3 "`collectStaleToolOutputs(history, provider, workMode, protectFrom, fixedOverhead, ratio)` 的 `fixedOverhead` ∥ `ratio` 都没有缺省" vs §2.3 "`collectStaleToolOutputs(history, provider, workMode, protectFrom)` 不属于那一面" vs §7.2 四参签名 |
    | 2 | 🔴 | New | §1.2 "机读线上的 `toolProcess` 按原文落盘" vs §1.2 "落盘的工具结果只留 slim 后的前段" / §7.2 "落盘的只有人读线那一份" |
    | 3 | 🟡 | New | 需求 §2 "**本身不落盘、不跨会话带走**"；设计 §2.1 无对应句 |
    | 4 | 🟡 | New | 需求 §2 "丢弃后要在宿主可见状态里交代丢了多少条"；设计 §9 降级行只写 `mode === "fallback"` |
    | 5 | 🟡 | New | 需求 §10 "回查面截断标记按角色分支" vs 设计 §1.1 "读的人却无从知道那是残片" |
    | 6 | 🟡 | New | §2.2.1 "它是服务端的事实，不是我们的旋钮"；算式 `min(spec.maxOutput, defaultOutput)` 无 provider 射程 |
    | 7 | 🟡 | New | 需求 §2 "输出预留不小于有效窗口是配置矛盾" vs §2.4 "判据单点 = `usableWindow(context, reserve)`" |
    | 8 | 🟡 | New | §2.2.1 "`budgetOf` 不另判一次"；§4 "`ratio` = 校准比（`tokenRatioOf`）"；§3 "两处同取 `Math.max(1, num / den)`" |
    | 9 | 🟡 | New | §1.2 三问块止于 8 个名字；§5.2 `preflightWindowFit` 无三问 |
    | 10 | 🟡 | New | §5.1 "越线之后先做一次零成本、确定性的 prune" vs §7.2 "保留窗起点取得出来时，合格集已空" |
    | 11 | 🟡 | New | §2.2.1 "今天它取的是 `spec.maxOutput`"；§5.1 "第 ⑥ 步是这条链上缺的一格"；§2.2 "`usable` 字段退场" |
    | 12 | 🟡 | New | §2.2 "实施时把它们在 `window-policy.mjs` ∥ `token-window.mjs` 的定义、注记与消费一并删净"；§10 "本批新增面" |
    | 13 | 🟡 | New | 设计 §10 只有"验证…"主题列表，无 `test/RTM.md` 具名用例；受影响代码文件无行数与档位结论 |
    | 14 | 🟡 | New | §2.2 括注 "（目标态第 2 条单调性）"；文档地图无"目标态"档 |
    | 15 | 🟡 | New | §1.2 "母版随之承载这一签名"（`TOOL-OUTPUT-LIMITS.md` §2 未核，`unverified`） |
    | 16 | 🔵 | New | §2.4 "`threshold ≤ 0`（窗口装得下输出与输入、装不下注入余量）同一处置" |
    | 17 | 🔵 | New | §2.5 "四个消费面照旧只渲染、端侧零自算式" 后列三个 |
    | 18 | 🔵 | New | §1.1 "用户请求与最终回复逐字入轮记录，没有长度上限" vs §1.2 "保留窗地板因此没有能发生的现场" |
    | 19 | 🔵 | New | 需求 §4 "落盘全史不因此丢失" vs 需求 §5 "只存前 500 字符" |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 2 · 🟡 13 · 🔵 4 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Fixed | §2.3 `collectStaleToolOutputs` |
    | 2 | 🔴 | Fixed | §1.2 "**保留窗内那两轮的工具过程在槽里逐字**" |
    | 3 | 🟡 | Fixed | §2.1 读数时现推的推导值 |
    | 4 | 🟡 | Fixed | `agent._lastCompressInfo` / §9 降级行 |
    | 5 | 🟡 | Fixed | §1.1 "标记按角色分支" |
    | 6 | 🟡 | Fixed | §2.2.1 "已核过默认值的族只有 DeepSeek" |
    | 7 | 🟡 | Fixed | §2.2.1 调用点表 |
    | 8 | 🟡 | Fixed | `budgetOf` / `tokenRatioOf(agent)` |
    | 9 | 🟡 | Fixed | §1.2 `requestBudget` ∥ `policyBudget` ∥ `preflightWindowFit` |
    | 10 | 🟡 | Fixed | §5.1 "第 ③ 步的射程" |
    | 11 | 🟡 | Fixed | 全档 grep 无 "退场/删净/目标态" |
    | 12 | 🟡 | Fixed | §2.2 "`COMPACT_RATIO` 与 `TAIL_BUDGET_FRACTION` 因此不在本档的算式里" |
    | 13 | 🟡 | Unfixed | §10 "也验证：压缩后的在途段边界重定…"（无 RTM 具名用例）— 协调项，非 must-fix |
    | 14 | 🟡 | Fixed | §2.2 斜率论证 |
    | 15 | 🟡 | Unfixed | §1.2 "母版承载同一契约"（`unverified`）— 非 must-fix |
    | 16 | 🔵 | Fixed | §2.4 "构造判据，不是观测来的分支" |
    | 17 | 🔵 | Fixed | §2.5 "五个读取面" |
    | 18 | 🔵 | Fixed | §1.2 "**一条特大用户请求**本身" |
    | 19 | 🔵 | Fixed | 需求 §4 "（落盘尺寸约定见 §5）" |
    | 20 | 🔵 | New | §7.2 "四个新增实参的来处见 §2.3" |
    VERDICT: pass
    计数：🔴 2 · 🟡 13 · 🔵 5 · 未标 0


### 轮次 3（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | design §2.2 "与窗口无关的常量因此只有一种合法的进入方式：作 `min` 的上界。" vs the §2.2 formula block `min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)` |
    | 2 | 🟡 | New | design §2.2 "`TINY_WINDOW_CAP`（§2.1）封的是**窗口**" — symbol absent from §2.1, which writes `min(模型窗口, 262144)` inline |
    | 3 | 🟡 | New | 需求档 §2 "自动压缩线 = 输入上限 − 注入余量，并封顶不超过 262,144。" has no §10 验收 item beside "输入上限与压缩线从有效窗口单向派生、随窗口单调不减" |
    | 4 | 🟡 | New | design §2.4 "`doubao-seed-2-1-turbo-260628` 是「256K 窗配 256K `maxOutput`」" carries no source, unlike §2.2.1 "取值范围为 1 到 384K（393216）" |
    | 5 | 🔵 | New | design §4 "两者之差恒为 670,896，与固定开销无关" assumes `reserve` = 65,536; §2.2 says "`reserve` 按档不同" |
    | 6 | 🔵 | New | design §4 "（减法链在本档，反向 import 成环）" vs §6 "`SUMMARY_TOKEN_ESTIMATE`（`token-window.mjs`）" |
    | 7 | 🔵 | New | design §1.2 "三个新常量的来处，按三问逐个回答" — no `RETAIN_CAP_TOKENS` row |
    | 8 | 🔵 | New | design §2.2.1 "explicit 档与 spec 档（anthropic 恒发 `max_tokens`）**不封顶**" — 封顶 meaning differs from §2.2 |
    VERDICT: pass
    计数：🔴 0 · 🟡 4 · 🔵 4 · 未标 0

### 轮次 4（评审子代理）

### 实施条目 10 代码评审

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | 批档 §5「上抛 1」`256K 压缩线上限本轮未实现` vs `window-policy.mjs` 的 `RETAIN_CAP_TOKENS`；档态滞后（R7a），父侧收口补读数 |
| 2 | 🔵 | New | 需求档 §10 验收 `输入上限与压缩线从有效窗口单向派生、随窗口单调不减` — 无「封顶段饱和」一项（已裁 Deferred，仅作指针） |
| 3 | 🔵 | New | 集成 `CLI 11-5` 夹具前提 `const budget = requestBudget(provider)` — 生产面读 `policyBudget`（有效窗口） |

VERDICT: pass
计数：🔴 0 · 🟡 1 · 🔵 2 · 未标 0

## §4 用户批准（主 agent）

### 用户批准

- **已定决定**：本批进入实施，范围 = 现盘上 §2 的任务书与评审通过的目标态；批名里的「reserve 与 baseline」是初始范围，实施面含处置链与切换预判，以 §2 为准。 · 用户原话：「自动跑完」 · 时间：2026-11-15 16:12
- 依据：设计评审 `#14` 结论 `pass`（0 未解 🔴 · 2 未解 🟡 均非 must-fix · 1 新增 🔵），token 已签发并经 `design-slots` 核为 live。
- 评审 🟡#13（集成增量与档位结论不在被审两档内）已由 §2 落实，不构成缺口：`**档位结论**` 段给出十四档在批起快照 `100def4c` 上的实量（最大 426、全部 ≤500、第二列全 `—`），`**集成增量（对 test/RTM.md）**` 段给出新增 `CLI 16-2`（挂故事 `CLI 16`）及交互面、业务可观察结果、服务的需求三行。这两处属过程记录面，本就不该进设计档。
- 评审 🟡#15（母版 `TOOL-OUTPUT-LIMITS.md` §2 契约）本轮由设计席实读核对：`buildDualEndPreview(text, budget)`、`budget` 必填无默认、两个调用点传 `TOOL_RESULT_PREVIEW` 均在母版盘上，故该档零改动。
- 「自动跑完」覆盖实施 → 验收 → 收口全链，中间不再逐站等字。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施记录（eng-coder · 2026-11-15）

**状态**：实施完成。§2 九条目标态全部落地；两处设计档句子被落地改成了另一句话（见「落地核对」）。

#### 1 · 改了什么档

**在派单面内（15 档）**

| 档 | 改了什么 |
|---|---|
| `thincoder-core/window-policy.mjs` | 删 `COMPACT_RATIO` 与两处静默兜底（半窗退化、absent 地板）；新增 `INJECT_HEADROOM_TOKENS` 与三个默认输出常量；`outputReserve` 按档取（explicit ∥ anthropic=spec.maxOutput ∥ absent=min(maxOutput, 服务端默认)）；`budgetOf` 派生 `limit = window − reserve`、`threshold = limit − INJECT_HEADROOM_TOKENS`，两处不成立即抛；预算对象去掉 `usable` 字段 |
| `thincoder-core/token-window.mjs` | `tailBudgetTokens(provider, workMode, fixedOverhead, ratio)` 减法链（删 `TAIL_BUDGET_FRACTION`）；`collectStaleToolOutputs` 六参；`historyReading` 分母改 `limit` 并带出 `threshold` / `limit`；新增 `NOTE_ESTIMATE` 与 `rebaseMeasured` |
| `thincoder-core/context.mjs` | `applyCompression` 两处置零改 §3.1 重定；`compressIfNeeded` 落 ①–⑦ 链；摘要失败一次即 `compressFallback`；`compressFallback` 载荷带 `discardedMessages ∥ discardedTurns ∥ tailMessages`；删 `COMPRESS_FAILURE_LIMIT` 与本档的 `NOTE_ESTIMATE` |
| `thincoder-core/context-degrade.mjs` | `pruneStaleToolOutputs` 传六参、改重定；`shrinkOversized` 改重定 |
| `thincoder-core/explore-distill.mjs` | 蒸馏收尾改重定（第四处基线） |
| `thincoder-core/agent/run-stages.mjs` | 新增 `preflightWindowFit`；删 `degradeIfCompressExhausted`；失败记账不再有连续计数门 |
| `thincoder-core/agent/setup.mjs` | 装配点调一次 `policyBudget` 作装载期判据（显式阈值档也走） |
| `thincoder-core/agent-tools/context.mjs` | stats 三处读数同源改口径（首行分母 `limit`、prunable 传六参、状态行行报 `limit` 与压缩线）；`compactFailureNote` / 压缩履历文案收正；删 `COMPRESS_FAILURE_LIMIT` |
| `thincoder-core/config.mjs` | 预算族转口清单与注记随常量退场收正（加 `INJECT_HEADROOM_TOKENS`） |
| `thincoder-core/context-echo.mjs` | `COMPACTION_PREFIX` 迁入（`NOTE_ESTIMATE` 要用它，反向 import 会成环） |
| `thincoder-cli/src/tui/status-line.mjs` | 告警判据 `ctxPct >= 80` → `tokens >= threshold` |
| `thincoder-cli/src/tui/render-loop.mjs` | `ctxCacheOf` 带出 `limit` ∥ `threshold` |
| `thincoder-core/advisor/compaction.mjs` | **零改动**（`outputReserve` 签名不变，`usableWindow` 的拒绝同源生效） |
| `thincoder-vscode/src/specs.mjs` · `thincoder-desktop/src/main/agent-host.mjs` | **零改动**（端侧零自算式，随 `historyReading` 新分母自动跟上） |
| `docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs` | 新建，单测档（收口删） |

**派单面外（4 档，均属「改签名就改调用点」，逐条报因）**

| 档 | 为什么必须改 |
|---|---|
| `thincoder-core/agent/turn-loop.mjs` | `preflightWindowFit` 的调用点：run 装配之后、第一回合之前，且 `compactionOverhead` / `_ctxBasis` 只在这里组装一次（另立一处就是第二个来源）。只加一行调用 + 注释 |
| `thincoder-server/src/agent/chat-compact.mjs` | 它读核的 `COMPRESS_FAILURE_LIMIT`（`loadCoreCompact` 里形校验非正整数否则按缺核处置）——常量一删，服务端压缩面**静默退化**。改为只校验 `compressIfNeeded ∥ compressFallback`；自持的 3 连败降级随之退场（核在摘要失败当次就丢弃），计数只留日志 |
| `test/integration/context-overflow-guard.test.mjs` | 用例断言的预算是旧派生值（`limit 616000` ∥ 压缩线 600,000），且 11-1/11-3 的夹具量（620,000）在新 `limit` 之下不再构成「越线」。逐条见下表 |
| `test/integration/tiny-mode.test.mjs` | 50-6 的正则锚在旧串 `of N window` / `… / N window` 上；分母改 `limit` 后解析成 `NaN`。期望值改从 `policyBudget` 取（不手算第二套） |

**新建一档（集成增量）**：`test/integration/context-window-derivation.test.mjs`（用例 `CLI 16-2`）· `test/rtm/loop.md` 补 `16-2` 行、改 `11-1/11-2/11-3` 行与两处节注（三态标签 11-2 错误→边界）。

#### 2 · 既有集成用例的改动与理由（逐条）

| 用例 | 改了什么 | 为什么（不是放宽判据） |
|---|---|---|
| 11-1 | 夹具加 `modelContext: {"deepseek-flash": 320}` | 620,039 在新 `limit` 934,464 之下，**场景不再发生**。压到 320K 窗后 `limit` 262,144，越线成立、压缩仍恰一次、仍不发 `max_tokens` |
| 11-2 | 同上；题名与断言改为「摘要超长 ⇒ 处置链丢弃后照发、压后 ≤ limit」 | ⑥ 落地后「超长摘要」不再能漏到守卫：丢弃会把它一并丢掉，链条自己救回来。原断言的「一条带三实数的错误」在该场景下已不可达——留着就是一条永远红的假判据 |
| 11-3 | 前半段加 320K 窗；后半段注释改新派生值（doubao absent 档 `reserve` 65,536 ⇒ `limit` 190,464、线 140,464） | 620,039 在 1M 窗下不越线；doubao 那一档在新算式下**不再是**退化档（`reserve` 取服务端默认，不是 256K） |
| 11-5 | `threshold` 断言 600,000 → 556,784 + 注释 | `threshold = limit − 50,000`，`limit` 606,784 未变（explicit 档不封顶） |
| 11-8 | `mode` 断言 summary → fallback，并加 `discardedMessages > 0` | 该夹具的**固定开销本身越过压缩线**（用例自己的前提就那么写），⑥ 必然补一次丢弃 |
| 50-6 | `windowReadings` 改读新串；期望值取 `policyBudget` | 分母改 `limit` 是本批的验收面本身；期望值改成核读数，不再手写派生数字 |

#### 3 · 关键决定（实施席的取舍，均照 §2/设计档判）

- **`NOTE_ESTIMATE` 迁到 `token-window.mjs`**：§4 的减法链要用它，而 `context.mjs` 反过来 import `token-window.mjs`——留在原档就得让 `token-window` 反向 import `context`，成环。`COMPACTION_PREFIX` 因此随 `COMPACTION_PLACEHOLDER` 一起住 `context-echo.mjs`（两条固定文本的单源）。
- **② 固定开销门对两档都判**（原实现对非 force 面不判、靠可达性门兜）：§5.1 把它写在①之后、标明「force 跳不过」，即两档都过这一格；非 force 面结果同为 false，只是少走几步。
- **⑥ 照字面判 `threshold`**：摘要成功但 `total` 仍在线上一档之上时也丢弃。代价是「固定开销独自越线」的会话每次压缩都会多一次丢弃——那正是 11-8 观察到的 `mode` 变化。
- **⑦ 留在 `enforceContextFit`**：§5.1 把守卫写在链尾，但它是独立原子（本链与自适应面共用），在链内再抛一次就变成两处守卫。`preflightWindowFit` 收尾也走同一个 `contextOverflowError`（报文点明「切换后的模型装不下存量历史」）。
- **`fixedOverhead` 取 §2.3 表逐字**：`pruneStaleToolOutputs` 与 `compressFallback` 用 `contextUsage(agent).overhead`（无 extras ⇒ 0）。方向上偏保守（尾变宽 ⇒ 少 prune），不改判据。
- **`rebaseMeasured` 的 `_usageAtLen`**：按身份找「旧前缀最后一个还在线上的消息」+1；原位替换（prune ∥ shrink）传 `inPlace` 保持原下标——被替换那条的新估算已经由减法折进基线，再进后缀就重复计一次。

#### 4 · 落地核对（设计档句子被落地改成另一句，逐条给档 + 段 + 原句）

1. **`docs/core/design/CONTEXT-COMPACTION.md` §4**：「注记与占位估算 = `context.mjs` 的 `NOTE_ESTIMATE` 减 `SUMMARY_TOKEN_ESTIMATE`」。落地后 `NOTE_ESTIMATE` 住 `token-window.mjs`（`context.mjs` import 它），因为减法链在本档而反向 import 会成环。
2. **同档 §2.4**：「`doubao-seed-2-1-turbo-260628` 那类「256K 窗配 256K `maxOutput`」的配置在这一格被拒：`reserve ≥ window`，装载期就报错」。落地后 absent 档 `reserve = min(maxOutput, 服务端默认 65,536)` ⇒ 该配置 `reserve` 65,536 < 256,000，**不被拒**，跑在 `limit` 190,464 上（只是显式 `maxTokens: 256000` 才落进拒绝格）。

要判的两件事留给收口：这两处是「代码错」还是「目标移动」。本席判读：第 1 条是构造必然（成环），第 2 条是 §2.2.1 换算式后的直接结果——两处都更像目标移动，但设计档是设计席的笔，本席不改。

#### 5 · 读数（命令 + 结果，2026-11-15 本轮实跑）

| 读什么 | 命令 | 结果 |
|---|---|---|
| 本批单测 | `node --test docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs` | `# pass 19 · # fail 0` |
| 集成全量 | `node --test test/integration/*.test.mjs` | `# tests 219 · # pass 217 · # fail 2` |
| 两个红的身份 | 同上 | `CLI 43-1` ∥ `CLI 43-2`（都在 `doc-anchor-graph.test.mjs`） |
| 本批动过的集成档单独跑 | `node --test test/integration/context-overflow-guard.test.mjs` | 10/10 绿 |
| 同上 · tiny | `node --test test/integration/tiny-mode.test.mjs` | 4/4 绿 |
| 同上 · 新用例 | `node --test test/integration/context-window-derivation.test.mjs` | 1/1 绿 |
| 语法 | 14 档逐档 `node --check` | 全过 |

**43-1 / 43-2 的归属**：两例断的是文档锚点图（`docs/core/design/EDIT.md <--cites-req-- req:F16` 等边）。本席的笔没有碰过 `docs/` 下任何一档（只写 `test/rtm/loop.md`，它不在图谱索引域内），而本批另两席改过需求档与设计档。`doc_graph` 直查回执为「本仓尚无落边的档：时效不可算（先跑 scan）」——图谱侧状态与用例断言对不上。判为**非本批代码改动引入**，交父侧处置。

#### 6 · 上抛（待父侧裁 / 已知未做）

1. **[上抛·知会] 256K 压缩线上限本轮未实现**（父侧 2026-11-15 明令）。它会触动的四处：`window-policy.mjs` 的 `budgetOf`（`threshold` 夹在 `limit − INJECT_HEADROOM_TOKENS` 之后）· §2.2 的单调性论证（夹取后大窗口上 `threshold` 恒定 ⇒ 「窗口增大两线不减小」仍成立但变弱化为「不增不减」）· `tailBudgetTokens`（尾预算从 `threshold` 倒推，1M 窗下尾会从 ≈930K 掉到 ≈254K，逐字保留量骤降）· 单测的 1M 基线行（933,040 → 255,000）与集成 16-2（320K 档 212,144 不受影响，1M 档受影响）。三处夹法效果相反，夹 `limit` 会重造本批修的越窗 bug。
2. **[上抛·知会] `config-presets.mjs` 的 `deepseek` 预置 `maxTokens: 384_000` 未动**（§2 明写批外）。该预置配 320K 窗 ⇒ `reserve` 384,000 ≥ 262,144 的窗 ⇒ 装载期拒绝（报文点三数）。这是 §2 已登记的那条活缺陷，本轮按边界不动。
3. **[上抛·待裁] §2.4 与 §2.2.1 对 doubao 那句互相打架**（见「落地核对」第 2 条）：设计档要不要改由父侧转设计席。

### 实施记录 · 实施条目 10（256K 压缩线上限）· eng-coder · 2026-11-15

**本轮范围**：只做 §2「实施条目 10」——`RETAIN_CAP_TOKENS = 262144` 封顶压缩线。上轮本段记的条目 1–9 不重开、一个字节未动。

#### 1 · 改了什么档

| 档 | 改了什么 |
|---|---|
| `thincoder-core/window-policy.mjs` | 新增 `export const RETAIN_CAP_TOKENS = 262144`，与 `INJECT_HEADROOM_TOKENS` 同处；注记写用户的现场观测（大上下文注意力衰减）与「两个 262144 不是一回事」。`budgetOf` 的 `threshold` 改成 `Math.min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)`。`usableWindow`、`const limit = usableWindow(window, reserve)` 两行未动；`threshold ≤ 0` 的抛点与报文未动。头注、`budgetOf` 注记、`resolveCompactThreshold` 注记同步写清夹取。 |
| `thincoder-core/config.mjs` | re-export 行补 `RETAIN_CAP_TOKENS`（与 `INJECT_HEADROOM_TOKENS` 同列），预算族注记同改。 |
| `docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs` | 1M 基线行改成封顶读数（262,144 ∥ 983,040，红侧照写 933,040）；单调性行的 `threshold` 判据由「严格增」改为「不减小」并加「末端在封顶段」断言；新增三行：封顶只夹压缩线（窗 2,000K）、显式档同夹（`maxTokens: 393216`）、门槛以下不生效（320K）。头注「16 行」与 TESTING 档路径收正。 |
| `test/integration/context-overflow-guard.test.mjs` | `CLI 11-5` 改写：窗档 `modelContext: 320`、absent 档、巨型历史 195,000、前提三数 327,680 ∥ 262,144 ∥ 212,144；样本 `723,272 / 491,000` 不动；四条行为断言（压缩恰一次 ∥ 回合请求恰一次 ∥ 零 400 ∥ 压缩在回合请求之前）一字未改；前提三数改读 `policyBudget`（生产面同一出口）。 |
| `test/rtm/loop.md`（**派单面外，1 档，报因**） | `11-5` 行随夹具改口径（320K 档 · limit 262,144 · 压缩线 212,144），并写明「压缩线封顶后 1M 窗上不可达」的理由。属「改签名就改调用点」的索引同步：§2 的集成增量要求改写这一例，而 RTM 行载的正是同一组前提数；不改则索引与用例互相打脸。 |

`thincoder-core/token-window.mjs` 零改动：`tailBudgetTokens` 读 `policyBudget(provider, undefined, workMode).threshold`，封顶经同一算式自动落到尾预算上（§2 条目 10 明写「不改」）。

#### 2 · 落地核对

**落地核对：无。** 本轮逐句核过设计档与需求档，没有一句被本轮实施改成另一句：

- 设计 §2.2 算式块 `threshold = min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)` 与 `budgetOf` 现文逐字一致；「封顶只夹压缩线，不夹 `limit`」与代码一致（`limit` 仍只由 `usableWindow` 给出）。
- 设计 §4「封顶直接落到尾预算上……按固定开销 4.5 万、`ratio` 取 1 计，分别是 216,032 与 886,928」与实读一致：`tailBudgetTokens(ctx(1024), "normal", 45_000, 1)` = 216,032，`NOTE_ESTIMATE` = 1,112。
- 设计 §2.4 的 doubao 句、§4 的 `NOTE_ESTIMATE` 位置句已是落地后的写法（设计席 16:40 轮改净）；本席未动设计档一个字节。
- 需求 §2「自动压缩线 = 输入上限 − 注入余量，并封顶不超过 262,144」现由代码支撑。

#### 3 · 读数（命令 + 结果，本机实跑）

| 读什么 | 命令 | 结果 |
|---|---|---|
| 本批单测 | `node --test docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs` | tests 22 · pass 22 · fail 0 |
| 本批动过的集成档 | `node --test test/integration/context-overflow-guard.test.mjs` | tests 10 · pass 10 · fail 0（含「不改写、实跑登记」的 11-6 ∥ 11-7） |
| 集成全量 | `node --test test/integration/*.test.mjs` | tests 220 · pass 218 · fail 2 |
| 两个红的身份 | 同上 | `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph.test.mjs`）——非本批改动引入，见第 6 节 |
| 语法 | 4 档逐档 `node --check` | 全过 |
| 内容行数（`countContentLines`） | 批起快照 `100def4c` vs 现盘 | `window-policy.mjs` 160→203 · `config.mjs` 426（未增行）· 集成档 497→513 · 单测档 `新` |

#### 4 · 红侧（失败侧实跑，2026-11-15）

把现盘 `window-policy.mjs` 抄进仓外临时目录，只把夹取那行还原成封顶前写法（并把 `RETAIN_CAP_TOKENS` 置 `Infinity`），依赖同源拷贝，实读：

| 坐标 | 封顶前 | 封顶后（现盘） |
|---|---|---|
| `ctx(1024)` | threshold 933,040 | 262,144 |
| `ctx(2000)` | threshold 1,932,464 | 262,144 |
| `maxTokens: 393216`（窗 1M） | threshold 556,784 | 262,144 |
| 单调序列 128K→2000K | 15,536 … 1,932,464（严格增） | 15,536 … 212,144，封顶段恒 262,144 |

⇒ 单测的封顶三行在封顶前实现上逐行翻红；临时目录已删，仓内零残留。

#### 5 · 自审 ∥ 内部审计 ∥ 代码评审：轮次与终态

- **内部发散审计**（只读 explore，对 §2 任务书逐条比对）：1 轮。结论 = 除「`test/rtm/loop.md` 属派单面外」一条（第 1 节已具名报因）外无分歧；设计档、需求档与本轮代码无漂移。
- **内部代码评审**（`advisor type=code`）：1 轮，`VERDICT: pass`（🔴 0 · 🟡 1 非 must-fix · 🔵 2）。三条处置：① 🟡 本段「上抛 1」的旧结论——本段第 6 条即时更正；② 🔵 需求 §10 验收缺「压缩线在封顶段饱和」一项——已裁 Deferred，父侧笔；③ 🔵 集成 11-5 前提读 `requestBudget`——已改读 `policyBudget`，三数逐位不变，改后实跑 10/10 绿。
- **修面轮**：1 轮（只改评审 🔵③ 与本席自查项），改后两档复跑全绿。
- **终态**：`clean`（0 未解 🔴 · 0 must-fix 🟡）。

#### 6 · 上抛与 Leads

1. **[上抛·知会] 上一轮本段「上抛 1」关于本条的结论已被本节取代。** 那句「256K 压缩线上限本轮未实现」与预算「933,040 → 255,000」不再是现盘事实：上限已落（`RETAIN_CAP_TOKENS = 262144`），1M 窗尾预算实读 216,032（设计 §4 已按 216,032 写），不是 254,000 量级。收口时请以本段为准。
2. **[上抛·知会] 43-1 ∥ 43-2 的归属（本轮复核到的新证据）。** 两例断 `doc:docs/core/design/EDIT.md <--cites-req-- req:F16` 与批档那一侧；实读两份被引档，`req:F16` 字面在两档里零命中，且两档 `git status` 干净（本批未动）。判为用例期望与盘上文档不一致的既有红，与本轮代码无因果。
3. **Leads（不在本批范围，未验证为本批缺陷，不登记台账）**：`test/rtm/loop.md` 的 `11-6` / `11-7` 行写的窗档与压缩线（128,000 窗档 · 76,800 · ≤76,800）与集成档现夹具（默认 1M 窗 + 显式 `compactThreshold` 76,800 ∥ 420,000）不一致——本批这两例「不改写」，该行未动。

## §6 验证与收口（父代理）

**收口轮（2026-11-15 17:20 · 主 agent）**

- **实施交付**：`#21`（实施条目 10 · 256K 压缩线上限）。写面 4 档；面外 1 档 `test/rtm/loop.md` 的 `11-5` 行同步（报因在 §5）。
- **本席实跑读数（本回合自己跑的，不是转述）**
  - `node --test docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs` → `pass 22 · fail 0`
  - `node --test test/integration/context-overflow-guard.test.mjs` → `pass 10 · fail 0`
  - 生产面复算：`policyBudget({format:'openai', model:'deepseek-flash', context:1024})` → `{window:1048576, reserve:65536, limit:983040, threshold:262144}`；`context:320` → `{limit:262144, threshold:212144}`；`RETAIN_CAP_TOKENS = 262144`。**`limit` 随窗口长、`threshold` 封在 262,144，两线不重合。**
- **落地核对**：§5 记「无」——设计 §2.2 算式块与 `budgetOf` 现文一致；§4 的 216,032 与实读尾预算逐位一致。
- **集成门**：`node --test test/integration/*.test.mjs` → `220 例 / 218 绿 / 2 红`；两红是 `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph`），与批起快照同集（开工前 worktree 实跑 `pass 3 / fail 2`），主人已挂台账 `#2449`。
- **单测档收口删除**：`docs/batches/2026-11-15-window-reserve-and-baseline.test.mjs`，读数留在本段。
- **交付后修面轮（`#26`，设计席 fix）**：评审 `#19` 的 8 条 Deferred 逐条落——§2.2「只有一种合法的进入方式」窄化 · `TINY_WINDOW_CAP` 在 §2.1 给名 · §2.4 doubao 两数补出处 · §4 示例写明 `reserve` 假设 · §4「反向 import 成环」理由或删 · §1.2 三问清单补 `RETAIN_CAP_TOKENS` ·「封顶」一词两义消歧
- **本批新债**：无新增行（`#2449` 先于本批存在）。

**收口轮补记（2026-11-15 17:45 · 主 agent）**

- **交付后核对轮（`#28`，设计席）**：复评 `#19` 的八条逐处在盘核对，七条在设计档、第 3 条（需求 §10 封顶饱和）已由主 agent 落；本轮零设计档改动，只更正 §2 里一条过期复现路径（`policyBudget(...).limit === -56320` 已不成立——现为装载期抛并点三数）。
- **文档闸**：`doc_check(mode:"gate")` 于设计档 ⇒ `DOC-CHECK GATE: PASS`（`#28` 本回合实跑，无命中行）。
- **本批新债 2 条**：`#2455`（`test/rtm/loop.md` 的 `11-6` ∥ `11-7` 行窗档与集成档现夹具不一致）· `#2456`（`config-presets.mjs` 的 `deepseek` 预置 `maxTokens: 384_000` 与 ≤384K 窗口冲突，现为装载期抛）。
- **两条未裁（记录在案，不阻塞收口）**：灰度/回退开关（设计席建议 B，批按 A 落——现状无回退手段）；`config-presets` 那条要不要改预置值（已转为 `#2456`）。
