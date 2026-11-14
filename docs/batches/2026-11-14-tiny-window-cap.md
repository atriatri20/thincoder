# 2026-11-14 · tiny 档上下文上限 256K
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 指示：tiny 模式下把上下文长度限定到不超过 256K token。
> 台账 = #2411（core · 归批）。前情 = docs/batches/2026-11-14-tiny-mode-rename.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = 24ba68dedbd3a3c8823c2f55ccfe89da827b372b
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

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
