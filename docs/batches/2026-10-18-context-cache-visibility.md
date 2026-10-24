# 2026-10-18 · 上下文缓存读数外露
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 18:42「改一下，先把上下文数据传出来」——承 18:41「每一轮重发？缓存有作用吗？」：`prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` 已由服务端返回并经 `provider/sse.mjs:9-20` 归一化，但**核内无累计载体**（`turn-loop.mjs:182` 只外发 `onUsage`，`contextUsage` 无缓存字段）——上下文效率对模型与用户均不可见。台账 #1662。
> 台账 = #1662（core · 归批）。前情 = `docs/batches/2026-10-18-context-overflow-guard.md`（在飞，同属上下文子系统）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本轮性质 = 轻通道轮**（命中第 **①** 项「细节 / 既有交互细节」——在既有 `context` stats 报面加一行读数 + 一个累计字段；不改判定、不改口径、不动任何门）。

**披露（落笔前）**：本笔 = 轻通道 | 改动 = 3 档（`agent/setup.mjs` 初始化 / `agent/turn-loop.mjs` 累计 / `agent-tools/context.mjs` 报面一行）| 波及 = 仅读数面（`prompt_cache_hit/miss` 本来就是服务端返回值，本次只是让核内记住并报出来）| rollback = 单批可 revert。

**用户授权（2026-10-18 18:42 逐字）**：「改一下，先把上下文数据传出来。」（承 18:41「每一轮重发？缓存有作用吗？」）

**缺口（父侧实读）**：`prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` 由服务端返回 → `provider/sse.mjs:9-20` 归一化 → `provider/core.mjs:310-311` 汇总，但 **核内 agent 无累计字段**：`turn-loop.mjs:182` 只 `callbacks.onUsage?.(...)` 外发，端侧各自存（CLI `tool-events.mjs:416` · VSC `panel-callbacks.mjs:226` · desktop `events-slices.mjs:35`），`token-window.mjs:134-154` 的 `contextUsage` 不含缓存字段 ⇒ **`context` 报不出命中率、子代理侧完全不可见**。

**落点**

| 档 | 行 | 内容 |
|---|---|---|
| `agent/setup.mjs` | `:63-70` | 新 agent 初始化 `_cacheHitTokens` / `_cacheMissTokens` / `_usageTurns` = 0 |
| `agent/turn-loop.mjs` | `:181-190` | 在既有 `if (response.usage)` 块内累计三项（与 `_lastPromptTokens` 同点同源） |
| `agent-tools/context.mjs` | `:77-95` | statsReport 新增 `Cache:` 行（有读数给 hit/miss/命中率/响应数；无读数给明示占位） |

**父侧验证（新进程直驱）**

```
有读数 hit 900k/miss 100k → Cache: hit 900000 · miss 100000 tokens (90% hit) across 28 response(s)
无读数（会话首轮）        → Cache: no provider usage readings yet (hit/miss arrive with the first response)
```

`node --check` × 3 = exit 0 · `bench/check` = **118 passed / 0 failed**。

**生效时点（如实）**：本会话进程持旧模块（ESM 缓存）⇒ **新读数在重启后的会话出现**；本会话的 `context stats` 仍是旧五行面。

**边界**：只加读数，不改任何判据（锚 / 行宽 / 压缩线都不动）；子代理 `status` 条目带缓存读数**本轮不做**（需在 settle 面抓子代理 agent，属结构性改动，另计）。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 一、交付

`context` 工具（`action:"stats"`）新增一行缓存读数；核内 agent 自带累计（父 / 子同一套字段，子代理侧留给后续批次外露）。

### 二、验证（父侧实跑 · 新进程直驱工具本体）

| 场景 | 输出行 |
|---|---|
| 有读数（hit 900k / miss 100k / 28 次响应） | `Cache: hit 900000 · miss 100000 tokens (90% hit) across 28 response(s)` |
| 无读数（会话首轮，尚无 usage） | `Cache: no provider usage readings yet (hit/miss arrive with the first response)` |

`node --check` × 3 = exit 0；`bench/check` = **118 passed / 0 failed**；既有五行报面逐字未动（新行插在 History 与 Status 之间）。

### 三、生效时点

**本会话不生效**（ESM 模块缓存）——重启后的会话首次 `context stats` 即可看到真实命中率，届时可回答「每轮 2~3 分钟里有多少是输入编码」。

### 四、遗留

| 项 | 状态 |
|---|---|
| 子代理 `status` 条目带缓存读数 | **不在本轮**（需在 settle 面抓子代理 agent 对象 ⇒ 结构性改动，另开批 ∥ 并入后续） |
| 压缩线两条（750,000 ∥ 800,000）与真限 655,360 | 属 `2026-10-18-context-overflow-guard`（`#1660` · `#14` 设计在飞） |

### 五、结论

**上下文效率从「猜」变成「读数」**：核内第一次能回答「前缀缓存到底命中多少」。改动三档、零判据变更、bench 全绿。**状态行** → 已收口 2026-10-18
