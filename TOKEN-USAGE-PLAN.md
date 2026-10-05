# Token 使用统计——后续版本计划（2026-10-05 探查定稿）

> 状态：**未开工**。本文档为调研结论 + 分档实施计划，供后续版本直接照做。
> 探查时点：codex-ui 分支 0.10.2；ZCode 参考源码为本地只读 checkout（路径见文末）。

## 0. 结论速览

- **值得做，且成本低**：数据采集管道已存在，缺的只是持久化、聚合、展示三件。
- **必须先解决的坑**：五键里的 `prompt_cache_hit_tokens / prompt_cache_miss_tokens` 是智谱系专有字段，
  OpenAI 系（`prompt_tokens_details.cached_tokens`）与 Anthropic（`cache_creation_input_tokens /
  cache_read_input_tokens`）命名不同，现 bridge 原样累加 ⇒ 跨渠道统计前要做一层归一化（照抄 ZCode
  `normalizeUsage` 思路），否则 OpenAI 渠道缓存列恒 0。
- **建议节奏**：先做档位一（半天），用几天看粒度够不够，再决定档位二 ∕ 三。

## 1. 现状盘点（已有什么）

数据链路已打通大半，**不动 agent 循环**：

| 环节 | 位置 | 说明 |
|---|---|---|
| 采集点 | `thincoder-core/agent/turn-loop.mjs:156` | 每次模型响应回调 `callbacks.onUsage(response.usage)` |
| 会话累计表 | `thincoder-desktop/src/main/agent-host.mjs:115`（`usageTally`） | key → 五键：`prompt_tokens` ∕ `completion_tokens` ∕ `reasoning_tokens` ∕ `prompt_cache_hit_tokens` ∕ `prompt_cache_miss_tokens`（VSC 键面同源）。**纯内存，`dispose` ∕ `forgetKey` ∕ `forgetAll` 随清** |
| 回合尾广播 | `agent-host.mjs` `postUsage()` → `ev:usage` | 载荷 `{ key, ctxPct, ctxTokens, usage, timers }`；发门 = `usageFrameWanted` |
| 渲染层切片 | `thincoder-desktop/renderer/events-slices.mjs` `onUsage` | 四槽：`usage`（ctxPct）∕ `usageTokens`（ctx 令牌）∕ `tokens`（五键累计）∕ `timers` |
| 状态行显示 | `renderer/views/statusline-segments.mjs:148`（`tokensSegment`）+ `statusline.mjs:81` | 已显示会话累计 ↑↓ ∕ 思考 ∕ 缓存命中率；`contextSegment` 显示上下文 tokens + 百分比 |

**缺口**：① 令牌表内存态——切会话 ∕ 重启清零；② sessions manifest ∕ segment 无 usage 字段（零持久化）；
③ 无跨会话 ∕ 按天 ∕ 按模型聚合；④ 无统计 UI。

## 2. ZCode 参考设计（怎么抄）

ZCode 双管道：实时流（`usage_update` → composer 上下文仪表；thincoder 已有等价物）+ **离线台账**（要补的）。

- **存储**：SQLite 三表（`node:sqlite`）——
  `model_usage`（每模型请求一行：六 token 数 + TTFT ∕ 耗时 ∕ 重试 ∕ 错误 ∕ query_source ∕ raw_usage_json）、
  `turn_usage`（按用户回合汇总）、`tool_usage`（按工具调用）；30 天保留自动清理。
  参考：`apps/zcode-cli/packages/adapters/src/storage/session-store/repositories/usage.ts`（schema 迁移 `0010_usage_observability`）。
- **归一化**：`normalizeUsage`（`apps/zcode-cli/packages/adapters/src/model/runner-normalization.ts:16`）——
  AI SDK usage → 统一 `ModelUsage`（cacheRead ∕ cacheWrite ∕ reasoningTokens）。**这是档位二的前置件**。
- **聚合**：`queryAppUsage`（本地时区按天分桶 GROUP BY，per-day ∕ per-day-model ∕ per-model ∕ per-tool）+
  `buildAppUsageSnapshot`（~250 行自包含：缓存命中率 ∕ 连续天数 ∕ 热力图等级 ∕ 模型份额）。
  参考：`repositories/usage.ts:386` ∕ `apps/zcode-cli/packages/bootstrap/src/zcode-protocol/usage-stats-builder.ts:83`。
- **UI 面**（设置 App Usage 面板）：终身摘要条 + GitHub 风格热力图（`UsageHeatmap.tsx`）+ 按天×模型堆叠趋势
  （`AppUsageDailyModelTrendChart.tsx`）+ 模型份额饼图；组件只消费 `AppUsageSnapshot` schema
  （`packages/shared/src/usage-stats.ts:165-262`）。另有开发者工具逐轮 token 表（`DeveloperToolsPane.tsx`）。
- **注意**：无 `∕cost` 命令；Coding Plan 远端配额走独立数据源（`dataSource: "local" | "monitor"` 隔离），不与本地台账混算。

## 3. 分档实施计划

### 档位一：会话级持久化（MVP，~半天）

- **做什么**：回合尾把五键累计写进会话 manifest 元数据（每次 `pushReal` 落盘同点顺写）；
  会话列表项悬停显示「本会话用量」（↑输入 ↓输出 ∕ 思考 ∕ 缓存命中%——复用 `tokensSegment` 的文案口径）。
- **动哪里**：`thincoder-desktop/src/main/sessions.mjs`（manifest 写点 + `ROW_FIELDS` 轻投影加 usage）；
  `renderer/mount-sidebar.mjs`（悬停显示）。**零新 IPC**——catalog 已带会话元数据。
- **验收**：产生用量 → 切会话回来 ∕ 重启应用，悬停仍能看到本会话累计；旧会话（无字段）悬停零节点。

### 档位二：全局台账 + 设置页用量段（1–2 天）

- **做什么**：
  1. **归一化层**（前置）：bridge `onUsage` 累加前按 provider 家族归一到统一六键
     （input ∕ output ∕ reasoning ∕ cacheRead ∕ cacheWrite ∕ total）。
  2. **台账存储**：二选一——JSONL 追加（沿用现有 segment 文件模式，零新依赖，推荐起步）或
     `node:sqlite`（Electron 44 自带，对位 ZCode）。行形 ≈ `model_usage` 减列（session ∕ turn ∕ provider ∕ model ∕
     时间 ∕ 六 token 数 ∕ status）。
  3. **IPC 通道**：`usage:stats`（三件套：ipc-registry + preload CHANNELS + ipc 转口），载荷 = 范围参数 →
     聚合结果（总数 ∕ 近 7 天按天 ∕ 按模型）。
  4. **设置页「用量」段**：摘要条（今日 ∕ 7 天 ∕ 30 天 ∕ 累计）+ 近 7 天按天×模型表格；导航式设置加一段即可。
- **验收**：跨会话 ∕ 跨项目 ∕ 跨重启统计准确；OpenAI 渠道缓存列非恒 0；30 天外数据自动清理（若 SQLite）
  或按月分文件（若 JSONL）。

### 档位三：ZCode 全对位（2–3 天，可选）

- 热力图 ∕ 按天×模型堆叠趋势图 ∕ 模型份额 ∕ 逐轮明细表（`model_usage` 全列 + `tool_usage` 表）。
- UI 抄 ZCode 组件形态（消费 snapshot schema），图表库按桌面端现有依赖选型（零依赖优先）。

## 4. 参考

- ZCode 只读 checkout：`∕tmp∕zcode-ref`（Git Bash；Windows 实际
  `C:\Users\18749\AppData\Local\Temp\zcode-ref`）——若已清理，重新 clone
  ZCode 官方仓库即可，本文引用的文件路径均相对其仓库根。
- 关键文件速查：`messageTelemetry.ts`（实时遥测，可跳过）· `usage.ts`（三表 schema + 查询）·
  `usage-stats-builder.ts`（snapshot 聚合）· `usage-stats.ts`（共享类型）·
  `AppUsagePanel.tsx`（面板组装）。
