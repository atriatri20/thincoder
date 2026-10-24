# 2026-10-18 · 压缩线 completion 预留与溢出守卫
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 17:19「这个上下文压缩的问题要分析一下，处理一下」——缺陷 1（压缩摘要 thinking/effort 互斥 400）已由轻通道轮 `2026-10-18-compression-thinking-fix` 修复核销（#1659）；本批 = 缺陷 2（压缩线不含 completion 预留 ⇒ messages 66% 即实际满窗、溢出 400 无事前守卫），台账 #1660，机制级 ⇒ 走设计链。
> 台账 = #1660（core · 归批）。前情 = `docs/batches/2026-10-18-compression-thinking-fix.md`（已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**用户授权（2026-10-18 17:19 逐字）**：「这个上下文压缩的问题要分析一下，处理一下。」——缺陷 1（压缩 400）已轻通道修复；**本批 = 缺陷 2，机制级，走设计链**。

**症状（本会话实证 17:06）**：回合请求 400 = `This model's maximum context length is 1048576 tokens. However, you requested 1052188 tokens (658972 in the messages, 393216 in the completion)`。

**根因链（父侧实读，全坐标在案）**：

| # | 事实 | 坐标 |
|---|---|---|
| 1 | 压缩线 = **80% × window**，只按 messages 计、不含 completion 预留 | `context stats` 实报：window 1000000 · compaction line 800000 |
| 2 | completion 预留 = **3 × maxOutput**（qwen3.8-max maxOutput = 131,072 ⇒ 393,216 ≈ 37% window；partialMode 续跑预留） | 400 报文实数 |
| 3 | 请求前**无守卫**：`estimateRequestTokens` 只喂 `rateGate`，没有「estimated + 预留 ≤ context」检查 | `provider/core.mjs:240-243` |
| 4 | 事后才有分类：`context_overflow`（retryable:false，hint=/compact） | `provider/errors.mjs:123` |

⇒ **messages 到 66% 窗口即实际满窗**（66% + 37% > 100%），但压缩线 80% 未触发 ⇒ 溢出 400 ⇒ 回合失败。本会话 messages 658,972（66%）时炸，压缩线 800,000 还差 14 万 token 才到。

**影响面**：一切 `maxOutput × 3 > 20% window` 的模型（qwen3.8-max 37%；凡大输出窗模型）+ 长会话 ⇒ 必炸。

**父侧候选三案（待设计裁）**：

| 案 | 形 | 初判 |
|---|---|---|
| A | 压缩线改按 `window − completion 预留` 计（80% × 可用消息预算） | 改一处阈值语义；压缩更早触发 |
| B | 请求前守卫：`estimated + 预留 > context` ⇒ 先压缩再发（同步压缩插队） | 拦截最彻底；但把压缩变成请求路径上的同步步骤 |
| C | `max_tokens` 按剩余窗动态收（发请求时 clamp） | 不炸但输出被截（partialMode 续跑兜底）；治标 |

**边界**：不动压缩摘要本体（缺陷 1 已修）· 不动 `estimateRequestTokens` 口径（除非设计判定要改）· 三案可组合，取舍归设计。

### 用户裁定（2026-10-18 17:54）

> 「我当然希望彻底修好。」

**「彻底」= 四条同时成立（父侧分解，已下达设计；少一条即半修）**：

| # | 指标 | 今天的病 |
|---|---|---|
| ① | **「算预算的数」与「发出去的数」同源** | `outputReserve` 封顶 25% ⇒ 250,000 算预算；`core.mjs:192` 原样发 393,216 ⇒ 死区 **143,216** |
| ② | **压缩线只能有一条** | `config.mjs:158` = 750,000 ∥ 会话 stats 报 800,000 —— 两处各算一条，修一处另一处照炸 |
| ③ | **窗口口径用服务端真值** | `spec.context` = 1,000,000 ∥ API 报 1,048,576 —— 必须给判据 + 理由，不许两边各一套 |
| ④ | **可观测面能看出死区** | stats 报 800,000（错线），看不出真限 655,360——父侧查了多轮才定位 |

**附加硬约束**：不许静默改用户配置（`maxTokens: 393216` 是用户显式写的值；要么按它算预算，要么在状态面明示「被削至 N」——静默削 = 与今天的 bug 同类病）。

**拒绝的形态**：「预算用 A、发送用 B，加个守卫兜着」——守卫是兜底不是主修。

### 父侧实测（2026-10-18 17:5x · 本批根因定案）

| 量 | 值 | 来源 |
|---|---|---|
| `provider.maxTokens`（在用 provider） | **393,216** | `~/.thincoder/config.json` 首条 |
| `outputReserve()` 封顶 25% | **250,000** | `config.mjs:130-134` |
| 实际发送 `max_tokens` | **393,216** | `provider/core.mjs:192` |
| 服务端可用消息窗（1,048,576 − 393,216） | **655,360** | 400 报文反算 |
| 压缩线 ①`config.mjs:158` | **750,000** | `min(1,000,000−250,000, 0.8×1,000,000)` |
| 压缩线 ②会话 `context stats` | **800,000** | 实报 |
| 本会话炸点 messages | **658,972**（超 3,612） | 400 报文 |
| 死区 | **143,216**（393,216 − 250,000） | 派生 |

**关键发现**：`config.mjs:127-129` 注释明写「the residual band between the cap and the real output budget is **accepted**（见 §6.2 overflow argument）」——**这条「接受」就是今天炸的原因**，设计必须正面处理，不许继续「接受」。

### 事实更正（父侧自纠 · 2026-10-18 18:28）

用户原话：「我就是因为出了这个bug才切换到qwen8-max的」——**炸的是 deepseek 侧**，不是 qwen。父侧此前两版任务书把这组数挂在 qwen3.8-max 上，**属误记，以此条为准**。

| 项 | 值（deepseek 侧） | 坐标 |
|---|---|---|
| `spec.context` | **1,000,000** | `model-specs.mjs:33` |
| `spec.maxOutput` | **384,000** | 同上 |
| 配置 `provider.maxTokens`（explicit） | **393,216** | `~/.thincoder/config.json` |
| API 报的硬限 | **1,048,576** | 400 报文 |

**两个推论**：

1. `3 × maxOutput` = 1,152,000（**超窗**）⇒ 从来不是预留来源——**唯一来源就是 `provider.maxTokens` 原样发送**，第 ① 条定性更干净。
2. 第 ③ 条（窗口口径）更硬：**同模型两窗**（`spec` 写 1,000,000 ∥ API 报 1,048,576，差 48,576）——设计须表态按哪个算 + 状态面标出来源。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮② N1–N3 已落（逐条处置见 §2.12；设计档 §6.2 / §6.16.4 / §6.17 / D-CC32 同步改定）；上抛 3 条继续有效）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目（覆盖四条硬指标 + 一条附加约束）

| # | 条目 | 判据形（可机检） |
|---|---|---|
| ① | **预算面与发送面同源**：新增 `requestBudget(provider, spec, transport)`（单源，`config.mjs`）= `{window, windowSource, maxTokens, reserve, usable, threshold}`；`maxTokens` = 该 transport 实际写进请求体的那个值；四个发送面改读它；`outputReserve` 去掉 25% 封顶（死区 143,216 归零） | 单测：四 transport × {显式 393,216 / 未设} 各一例，断言 `body 的 max_tokens/maxOutputTokens/max_output_tokens === requestBudget(...).maxTokens`；断言 `outputReserve({maxTokens:393216}, deepseekSpec) === 393216`（旧值 250,000） |
| ② | **压缩线只有一条**：`resolveCompactThreshold` 改为 `min(window − reserve, ⌊window × 0.8⌋)`（reserve 不封顶）；`compactThresholdAuto === true ⇒ 数值忽略、按在用 provider 现算`；`prepareRun` 每 run 现算（`agent/setup.mjs:54`）；四处「auto 值回写显式键」删净（`cmd-config.mjs:97-100` · `model-picker.mjs:241-243` · `provider-admin.mjs:212-214` · `session-lifecycle.mjs:187-191`） | 单测：deepseek-flash+393,216 ⇒ **606,784**；qwen3.8-max ⇒ **800,000**；kimi-k3 ⇒ **800,000**；`auto:false` + 显式 500,000 ⇒ 500,000（用户显式不被覆盖）；grep 断言四回写点已无 |
| ③ | **窗口口径**：一律按 `providerSpec(provider).context`（规格表 / `providers[].context` K 覆盖）算；理由 = 全 transport 唯一可知的窗口，且对 deepseek 是 {1,000,000, 1,048,576} 中**较小**者（保守）；状态面标来源 `(spec)`；服务端广告值 1,048,576 只作注记、不参与计算 | 单测：`contextUsage().window === 1_000_000`（deepseek-flash）；stats 报面正则 `window 1000000 \(spec\)` |
| ④ | **可观测面**：stats 新增一行 `Request budget:`——窗口 + 来源 ∥ 实发 max_tokens + 来源（explicit / spec / 未发）∥ messages 实数 ∥ 距压缩线 ∥ 距真限（`window − reserve`），负数 = 已越 | 单测：固定 fixture 断言整行逐字；断言首行仍恰一个 `%`（§6.16.4 既有不变量不破） |
| ⑤ | **不许静默改用户配置**：`maxTokens: 393216` 原样按它算预算；auto 值不再写回显式键；发生削峰（退化守卫）时状态面明示 `clamped` | 同 ② 的 grep 断言 + ④ 的报面断言 |

**本批不做**：压缩摘要本体（`context.mjs:203` thinking/effort 面，已另批）· `estimateRequestTokens` 口径 · `spec.context` 表值改数 · 服务端广告窗学习机制（未解 1）。

### 2.2 「800,000 那处计算」定位结论（已定位，非未解）

**同函数、两输入，不是第二处计算。** `config.mjs:153-160 resolveCompactThreshold` 的 auto 支 `min(usable, ⌊context × 0.8⌋)`：

| 在用模型 | `maxOutput` | `reserve = min(maxOutput, 25%窗口)` | `usable` | 阈值 |
|---|---|---|---|---|
| qwen3.8-max | 131,072 | 131,072 | 868,928 | **800,000**（0.8 项胜出） |
| deepseek-flash | 384,000 | 250,000（封顶） | 750,000 | **750,000**（usable 项胜出） |

实测（本批 `execute` 调 `config.mjs` 导出复算，非推演）：`resolveCompactThreshold(null,{model:"qwen3.8-max"}) === 800000`；`(null,{model:"deepseek-flash",maxTokens:393216}) === 750000`。⇒ 会话 stats 报的 800,000 = 当时在用的 131,072-输出窗模型（qwen3.8-max）跑同一函数的结果；父侧「疑似 `spec.context × 0.8`」= **命中一半**：正是该函数的 0.8 项，只在 `reserve < 20%窗口` 时胜出。

**真正的「两条线」不是两个公式，是同一个值被固化进两个存储**：`config.mjs:433-437` 把解析值写进 `merged.agent.compactThreshold`，四处 CLI 回写点再把 auto 值写进活配置 ⇒ 用户配置文件里躺着一个**看起来是显式、实为某模型某时刻派生**的数（今天的 750,000），换模型后它不跟着变，而 `agent/setup.mjs:54` 把它当显式读。判据 ② 的修法（`auto=true ⇒ 数值忽略、每 run 现算`）正是切断这条固化路径。

### 2.3 今日实数在新机制下的结果（验收锚）

deepseek-flash + 显式 393,216，窗口按 spec 1,000,000：`reserve = 393,216` ⇒ `usable = 606,784` ⇒ **压缩线 = min(606,784, 800,000) = 606,784**。

- 旧机制：线 750,000，messages 658,972 < 750,000 ⇒ 不压 ⇒ 发 658,972 + 393,216 = 1,052,188 > 1,048,576 ⇒ **今日的 400**。
- 新机制：线 **606,784**，messages 658,972 已越线 **52,188** ⇒ 压缩在**请求前**的安全点触发（`run-stages.mjs:81-97`）⇒ 该请求根本不会以 658,972 发出 ⇒ 400 不可达。
- 线处的余量：606,784 + 393,216 = 1,000,000（spec 窗，恰满）∥ 1,048,576（服务端广告值，余 **48,576 = 4.6%**，即估算漂移的容差）。
- 对照 qwen3.8-max：线 800,000 · reserve 131,072 · 真限 868,928 · 线处余量 68,928（6.6%）——本来就没炸，机制不变、只是补上可观测面。

### 2.4 三案取舍

| 案 | 处置 | 理由 |
|---|---|---|
| A 压缩线按 `窗口 − 预留` 重算 | **采纳（主修）** | 唯一能「事前不炸」的修法；预留改不封顶 ⇒ 残余带 143,216 归零；单函数单源 |
| B 请求前守卫 | **采纳（兜底，非主修）** | 落点 = `run-stages.mjs` 压缩阶段之后、发请求之前：`估算 + 实发 max_tokens > 窗口` ⇒ 先**强制压缩**再发；压缩后仍超 ⇒ 抛 `context_overflow` 型错误（带三个实数）不发请求。**不做截断**。用户拒绝的形态是「预算用 A、发送用 B、加个守卫兜着」——本批 A 已让两者同源，B 只兜估算漂移与规格/服务端窗不一致 |
| C 逐请求钳 `max_tokens` | **不采纳** | ① 静默削输出 = 违反「不许把守卫做成静默截断」；② 须动 4 个 transport 装配面；③ prompt 本身越窗时钳 `max_tokens` 无效；④ B 已覆盖残余风险。登记为将来选项（若出现「prompt 已贴窗但单条消息不可压」的真实案例） |

### 2.5 受影响文件（现行行数 + 预计 Δ）

| 文件 | 现行行 | 改点 | Δ |
|---|---|---|---|
| `thincoder-core/config.mjs` | 529 | 新增 `requestBudget`；`outputReserve`（`:130-134`）去封顶；`resolveCompactThreshold`（`:153-160`）新式；`:433-437` 合并段按 auto 旗分离（另出 `compactThresholdResolved` 供显示） | +45 / −12 ⇒ ≈562 |
| `thincoder-core/agent/setup.mjs` | 306 | `:54` 每 run 现算阈值（auto 旗判） | +4 / −1 |
| `thincoder-core/agent/run-stages.mjs` | 297 | `:81-97` 段尾加 B 守卫（强制压缩 + 仍超则抛） | +14 |
| `thincoder-core/provider/core.mjs` | 467 | `:192` 改读 `requestBudget().maxTokens` | +2 / −1 |
| `thincoder-core/provider/anthropic.mjs` | 238 | `:56` 同上（该 transport 恒发） | +2 / −1 |
| `thincoder-core/provider/google.mjs` | 289 | `:86` 同上 | +2 / −1 |
| `thincoder-core/provider/responses-request.mjs` | 240 | `:201` 同上 | +2 / −1 |
| `thincoder-core/token-window.mjs` | 189 | `contextUsage` 返预算面字段（`windowSource` / `maxTokens` / `limit`） | +18 |
| `thincoder-core/agent-tools/context.mjs` | 170 | `statsReport` 新增 `Request budget:` 行 | +9 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 512 | 删 `:97-100` auto 回写 | −4 |
| `thincoder-cli/src/tui/model-picker.mjs` | 325 | 删 `:241-243` auto 回写 | −3 |
| `thincoder-cli/src/tui/provider-admin.mjs` | 249 | 删 `:212-214` auto 回写 | −3 |
| `thincoder-core/session-lifecycle.mjs` | 404 | 删 `:187-191` auto 回写 | −5 |
| `docs/batches/2026-10-18-context-overflow-guard.test.mjs` | 新 | 本批单测（收口删除） | +≈140 |

**无需改**（已核）：`thincoder-vscode/src/agent/setup.mjs:141,180` 只透传 `cfgCompactThreshold`（null = auto，由核解析）——VSC 无 auto 回写点。**拆分预案**：`config.mjs` 若过 650 行，把 `outputReserve / usableWindow / resolveCompactThreshold / requestBudget` 四件迁入新档 `thincoder-core/context-budget.mjs`（`config.mjs` 再导出，23 个 importer 零改）。

### 2.6 验收对照（逐条回指需求条目）

① ⇒ §2.1① 判据；② ⇒ §2.1② + §2.3；③ ⇒ §2.1③；④ ⇒ §2.1④；⑤ ⇒ §2.1⑤；「今天这个会话不再炸」⇒ §2.3（658,972 > 606,784 线，压缩先触发）。设计档落点 = `docs/core/design/CONTEXT-COMPACTION.md` §6.2（阈值链与溢出论证改写）+ 新增 §6.17（请求预算单源）+ §7 D-CC32 + §5 受影响文件。

### 2.7 事实与一致性发现（逐条报，含不改项）

1. **设计档自相矛盾（既有）**：`CONTEXT-COMPACTION.md:112` 的示例行写「deepseek 显式 393,216 ⇒ 新阈值 750,000」——750,000 + 393,216 = 1,143,216 > 窗口 1,000,000，该行本身就是今天 400 的算式。§6.2 亦称残余带「带内请求照发」，`:127-129` 代码注释称残余带「accepted」。本批按新式改写 §6.2，删掉「接受残余带」的全部表述。
2. **静默改用户配置（既有）**：四处 CLI 回写点把 auto 派生值写进 `agent.config.agent.compactThreshold`，可随下一次持久化落盘成「显式值」——违反本批附加约束；已在 ② 中删净。
3. **需求档需主 agent 改写（语义面，不自行改）**：`docs/core/requirements/CONTEXT-COMPACTION.md:41` 的阈值链式含 `⌊窗口 × 0.25⌋` 封顶；`:43` 判定句①要求全档落 [75%,80%]。新式下「显式预留 > 25% 窗口」的档（deepseek 族）落 **60.7%**，与旧判定句冲突 ⇒ 需求档条文与判定句须由主 agent 更新（见「上抛」）。
4. **未改项登记**：`estimateRequestTokens` 口径零改（B 守卫复用现值）；`usableWindow` 退化守卫零改（封顶取消后仅 `maxOutput ≥ 窗口` 档仍触发）。

### 2.8 未解清单

1. **服务端广告窗学习面**：400 报文里的 `1,048,576` 现只人工可见；是否采集为 provider 级事实并与 spec 取 `min`（可彻底消除「规格窗偏大」的漂移风险）——本期不实施，口径按 spec（保守）。
2. **`_lastPromptTokens` 实测与 `estimateRequestTokens` 估算的漂移分布**：决定 B 守卫的真实触发率与线处 4.6% 余量够不够；未测。
3. **VS Code 端 `checkAndCompact` 是否另持阈值暂存**（`token-window.mjs:130` 注释提及「各一处暂存」）：实施轮核对，本批不改。
4. **其它 transport 的窗口/`max_tokens` 耦合差异**：anthropic 恒发、google/responses 可选发——本轮按表达式对齐，未逐渠道实测 400 行为。
5. **C 案（钳 `max_tokens`）的将来适用性**：无实测案例，暂不立。

### 2.9 上抛项

- **上抛·待裁**：需求档 `CONTEXT-COMPACTION.md:41 / :43` 的阈值链式与判定句需随新式改写（语义面 = 主 agent 的笔）；另请确认「显式预留 > 25% 窗口的档压缩线将低于 60.7%」是否作为新目标口径被接受（旧目标 75–80% 在这些档不可达——保持 393,216 的发送预算与 75% 压缩线二者数学上互斥）。

### 2.10 落盘后的两处更正（读回核对所得）

1. 设计档 §5 是**指针**（→ `CORE-UNIFICATION.md` §2.8），不存逐档行数表 ⇒ 受影响文件表的事实源 = 本 §2.5 + 实施轮，§2.6 里「+ §5 受影响文件」一句按此更正。
2. 设计档最终落点（已读回确认）= §6.2 阈值链 / 目标口径 / 逐档表 / 溢出论证改写 · 新增 §6.17「请求预算单源」 · §6.16.4 stats 报面新增 `Request budget:` 行（状态行由第 5 行变为第 6 行，S3 / S5 / D-CC29 的行号引用已同步） · §7 新增 D-CC32，D-CC30 改写为现行式。

### 2.11 修轮①（§3 轮次 1 的 14 条处置 · 2026-10-18）

**本节 = 修正行**（下列原行被替换，不再具约束力）：§2.1 ①（判据字段 6 → 8）· §2.1 ②（四处刷新点：删 → 改写目标字段）· §2.1 ④（`maxTokens` 来源三态）· §2.1 ⑤（删「削峰 clamped」第三款）· §2.2 末段（「固化进两个存储」→ 内存面）· §2.5（整表 → 见 2.11.1）· §2.6 末句（「不再炸」加条件）· §2.9（上抛 +2）。设计档已按同一结论落定（`docs/core/design/CONTEXT-COMPACTION.md` §6.2 / §6.13 / §6.16.4 / §6.16.9 / §6.17 / §7 D-CC30 · D-CC32）。

#### 2.11.1 逐条处置（号 → 落点 → 改后形）

| # | 处置 | 落点（设计档 = `CONTEXT-COMPACTION.md`） |
|---|---|---|
| 1 🔴 | `/config` 四处改读派生值 + 编辑提示行标来源；设计档写死 auto 档落值 | 设计档 §6.17「三档落值」「显示面」；本档 2.11.2 的 `cmd-config.mjs` 行 |
| 2 🟡 | 判据③ 偏离显式认领（规格窗 vs 服务端真值；代价 = deepseek 线前移 48,576 token = 4.6%） | §6.17「偏离认领」；§2.9 第 2 条 |
| 3 🟡 | ⑤ 第三款判为**空集**并删承诺（封顶取消后无削峰——实发恒等于用户写值）；理由入新行 | 本档 §2.1⑤ 修订行；§6.17「装配面不留第二算式」 |
| 4 🟡 | 链式补 `usableWindow`；边界改「线 ≥ 75% ⇔ 预留 ≤ 25%」；T07/T08 加 `*`；合计行两切法并列；D-CC30 的 6 档 → 8 档 27 行 | §6.2 `:57` `:60` `:61` `:63` `:73` `:74` `:90`；§7 D-CC30 |
| 5 🟡 | `Request budget:` 冻结一份字面（五格 · `prompt {total}` · 未发 = `not sent (absent)`）；字段表 8 项；`messages` → `prompt` | §6.16.4 `:479` + 新增「行读法」；§6.17 字段表 |
| 6 🟡 | §6.17 补 `先例行（③）`（实现坐标 `config.mjs:130-160` ∥ §6.2 / §6.13 / D-CC30 ∥ 对齐 / 偏离） | §6.17「先例行（③）」 |
| 7 🟡 | `config.mjs:125-129` 头注改写进改点（删「accepted」表述） | 设计档 D-CC32；本档 2.11.2 `config.mjs` 行 |
| 8 🟡 | 拆分立场留一条：**过 650 行触发**（改后 ≈565 < 650 ⇒ 不拆） | §6.16.9 `:571` |
| 9 🟡 | 迁移判据：**数值在场 = 显式**、不在场 = auto；`compactThresholdAuto` = 加载期派生旗、不落盘；在用配置实测两键皆无 ⇒ 走 auto；实施验证清单 +1（读回两键） | §6.17「迁移判据」 |
| 10 🟡 | 守卫落点改 `run-stages.mjs:124`（`catch` 闭合后、返回前）；再估 = `contextUsage(agent, compactionOverhead)`；窗口 / 上限 = `requestBudget` | §6.17「守卫」；2.11.2 `run-stages.mjs` 行 |
| 11 🔵 | 读数按 `wc -l` 刷新：`config.mjs` **528** · `agent-tools/context.mjs` **169**（`token-window.mjs` 188 / `run-stages.mjs` 296 原本正确——评审的 529 / 189 / 297 / 170 是 `read` 面计数，含末尾空段） | §6.16.9 `:570` / `:561` |
| 12 🔵 | §6.13 阈值档位补 `requestBudget` 单源指针 | §6.13 `:255` |
| 13 🔵 | anthropic `\|\| 8192` 第三级**不可达**（`specForModel` 恒返 `DEFAULT_SPEC`，`maxOutput` 恒 32,000）⇒ 随装配面改读 `maxTokens` 一并删净，不入 `requestBudget` 口径 | §6.17 字段表 + 「装配面不留第二算式」 |
| 14 🔵 | 批档 §1 状态行 = **主 agent 笔**（本角色工具面只写 §2）⇒ 未改，上抛 | 报告 |

#### 2.11.2 受影响文件（替换 §2.5；现行行 = `wc -l` 口径）

| 文件 | 现行行 | 改点 | Δ |
|---|---|---|---|
| `thincoder-core/config.mjs` | 528 | 新增 `requestBudget`；`outputReserve`（`:130-134`）去封顶；`resolveCompactThreshold`（`:153-160`）改取 `requestBudget().threshold`；`:434-437` 合并段改为「显式键原样 ∥ 派生值入 `compactThresholdResolved`」；`DEFAULTS.agent.compactThreshold`（`:41`）退场；`:125-129` 头注改写（删「residual band … accepted」） | +46 / −9 ⇒ ≈565 |
| `thincoder-core/agent/setup.mjs` | 305 | `:54` 每 run 现算（`resolveCompactThreshold(cfg.agent?.compactThreshold, agent.provider)`）；局部常量 `DEFAULT_COMPACT_THRESHOLD`（`:26`）随之退场 | +4 / −3 |
| `thincoder-core/agent/run-stages.mjs` | 296 | `:124`（`catch` 块闭合后、返回前）加 B 守卫（`requestBudget` 判 + 一次强制压缩 + 仍超则抛三实数）；成功记账段 `:99-107` 抽为局部函数供两面共用 | +14 |
| `thincoder-core/provider/core.mjs` | 466 | `:192` 改读 `requestBudget().maxTokens` | +2 / −1 |
| `thincoder-core/provider/anthropic.mjs` | 237 | `:56` 改读 `requestBudget().maxTokens`（`\|\| 8192` 不可达分支删净） | +2 / −1 |
| `thincoder-core/provider/google.mjs` | 288 | `:86` 同上 | +2 / −1 |
| `thincoder-core/provider/responses-request.mjs` | 239 | `:201` 同上 | +2 / −1 |
| `thincoder-core/token-window.mjs` | 188 | `contextUsage` 返预算面字段（`windowSource` / `maxTokens` / `maxTokensSource` / `limit`） | +18 |
| `thincoder-core/agent-tools/context.mjs` | 169 | `statsReport` 新增 `Request budget:` 行（字面 = 设计档 §6.16.4） | +9 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 511 | **`/config` 报面四处改读 `compactThresholdResolved`**：`:352`（header 行）· `:356`（主菜单项）· `:384`（View full config）· `:488`（数值项编辑初值）；`:493` 编辑提示行在 auto 档缀「输入数值即固定为显式阈值」；`:497-507` 保存回显对 `agent.compactThreshold` 加一行「显式阈值——auto 派生线不再生效」。显示值 = `agent.config?.agent?.compactThresholdResolved ?? ac.compactThreshold ?? 100000`（一处助手，四处共用） | +8 / −4 |
| `thincoder-cli/src/tui/model-picker.mjs` | 324 | `:241-243` 刷新目标字段改 `compactThresholdResolved`（阈值随模型跟手） | ±2 |
| `thincoder-cli/src/tui/provider-admin.mjs` | 248 | `:212-214` 同上 | ±2 |
| `thincoder-core/session-lifecycle.mjs` | 403 | `:190-192` 同上 | ±2 |
| `docs/batches/2026-10-18-context-overflow-guard.test.mjs` | 新 | 本批单测（设计档 §6.17 用例表 R1–R10；收口删除） | +≈150 |

**无需改**（已核）：`thincoder-vscode/src/agent/setup.mjs:141,180` 只透传原始盘面值（null = auto，由核解析）；`thincoder-vscode/src/extension/settings.mjs:42` 读原始盘面（面板空串 = 清键 = auto）——VSC 无 auto 回写点。**拆分预案**：`config.mjs` 过 650 行才拆（四件迁入 `thincoder-core/` 新档 context-budget）。

#### 2.11.3 上抛项（追加于 §2.9）

- **上抛·待裁（新增）**：判据③ 字面 = 「服务端真值」，设计取**规格窗**（较小者、全 transport 唯一可知）⇒ deepseek 档压缩线比按服务端窗推的低 **48,576 token（4.6%）**，即每次提前这么多压缩。请确认接受该偏离（理由与代价见设计档 §6.17「偏离认领」）。
- **上抛·待裁（新增）**：CLI `/config` 无「回到 auto」写面（VSC 面板清空即 auto）——现状 = 手改配置文件；本批不开新配置键、不加菜单，标 `open`。若要与 VSC 对齐（清空 = auto），请裁给哪一轮。
- 原 §2.9 一条继续有效（需求档阈值链式与判定句 = 主 agent 笔）。

#### 2.11.4 实施轮验证清单（新增一条）

1. 读回在用配置的 `agent.compactThreshold` / `agent.compactThresholdAuto` 两键是否在场（在场 ⇒ 该档走显式，`§2.6` 的「本会话不再炸」只对 auto 档成立）；本机实测（2026-10-18）：两键皆无 ⇒ auto。

#### 2.11.5 三条被替换行的现行文本（替换 §2.1⑤ / §2.2 末段 / §2.6 末句）

- **§2.1⑤（现行）**：不许静默改用户配置——`maxTokens: 393216` 原样按它算预算（`requestBudget().maxTokens` 即实发值，四面只读它）；auto 派生值不写显式键（四处刷新点改写目标字段 = `compactThresholdResolved`）；**「削峰明示 clamped」款为空集**：预留去封顶后没有任何环节削减实发输出 ⇒ 该承诺删除，判据形改 = ② 的 grep 断言（四刷新点不再写 `agent.compactThreshold`）+ ④ 的报面断言（`max_tokens` 恒等于 `requestBudget().maxTokens`）。理由：用户附加硬约束是析取「按它算预算 ∥ 明示被削至 N」，设计取前者 ⇒ 后者无对象。
- **§2.2 末段（现行）**：「两条线」= 同一个派生值被塞进**两个存储**：加载期派生值写进内存 `merged.agent.compactThreshold`（`config.mjs:436`）⇒ `/config` 报面 / 编辑初值 / 会话阈值三处各读它一次；磁盘面（`~/.thincoder/config.json` 的 `agent` 段）**今天并无该键**（本机实测 2026-10-18：无 `compactThreshold`、无 `compactThresholdAuto`）。修法 = 派生值只入 `compactThresholdResolved`，显式键永不被改写（用户 750,000 那类「固化值」在本机不存在；若他机存在，按 #9 迁移判据走显式）。
- **§2.6 末句（现行）**：「今天这个会话不再炸」的成立条件 = 在用配置**未写** `agent.compactThreshold`（本机实测：无该键 ⇒ auto ⇒ 线 606,784 < messages 658,972 ⇒ 压缩先触发）。写了显式值的档按显式值算（不享受新线），其「线 + 实发 > 窗口」由守卫带三实数报错——不静默发。

### 2.12 修轮②（§3 轮次 2 的 N1–N3 处置 · 2026-10-18）

**本节 = 修正行**（下列原行被替换，不再具约束力）：§2.1 ① 的签名形（`requestBudget(provider, spec, transport)` 3 参）· §2.11.2 的 `cmd-config.mjs` 行（显示助手链尾）。设计档已按同一结论落定（`docs/core/design/CONTEXT-COMPACTION.md` §6.2 `:117` `:123` ∥ §6.16.4 `:490` ∥ §6.17 字段表 `:634-639` · 守卫 `:667-670` · 迁移判据 `:652` · 显示面 `:655` · 用例表 `:685-692` ∥ §7 D-CC32 `:731`）。

| # | 处置 | 落点（设计档 = `CONTEXT-COMPACTION.md`） |
|---|---|---|
| N1 🔴 | 守卫判据改 **`budget.maxTokensSource !== "absent" && usage.total > budget.limit`**（`limit = window − reserve`，`reserve` 恒为数 ⇒ 无 `undefined` / 无 NaN；等价于「prompt 估算 + 实发 max_tokens > 窗口」）；`absent` 档守卫不覆盖 + 射程句 + 反向代价（T01 三行必抛）写明；字段表消费面改正（`limit` = 守卫唯一判据字段 · `reserve` 只标阈值 · `maxTokensSource` = 守卫启用条件 · `maxTokens` 不进判据） | §6.17 字段表 `:634-639` · 守卫 `:667-670` · 用例表 R4 `:685` · R5 `:686` · R9 `:690` · R10 `:691` · 新增 R11 `:692`；§6.2 `:117` `:123`；§6.16.4 `:490`；§6.17 迁移判据 `:652`；D-CC32 `:731` |
| N2 🔵 | 显示助手链尾不产数：显示值 = `agent.config?.agent?.compactThresholdResolved`，缺场 ⇒ 显示 `(unavailable)`、编辑初值留空，**不回落 `100000`**；该支不可达（加载期合并段与每 run 现算都必产 `resolved`）= 纯护栏；机判用例扩一条「`/config` 全屏不含 `100000`」 | 本 §2.12.1 的 `cmd-config.mjs` 行；设计档 §6.17 显示面 `:655`；R7 `:688` |
| N3 🔵 | 签名采用设计档形并列入替换项：**`requestBudget(provider, spec = providerSpec(provider))`**（2 参；transport 由 `provider.format` 定——`"anthropic"` / `"google"` / `"responses"` / 缺省 = OpenAI 兼容） | 本节替换声明；§2.12.1 的 `config.mjs` 行；设计档 §6.17 `:628`（已为此形，零改） |

#### 2.12.1 两条被替换行的现行文本（替换 §2.1① 签名段 / §2.11.2 的 `cmd-config.mjs` 行）

- **§2.1① 签名（现行）**：新增 `requestBudget(provider, spec = providerSpec(provider))`（单源，`config.mjs`）= `{window, windowSource, maxTokens, maxTokensSource, reserve, usable, threshold, limit}` 8 字段；`maxTokens` = 该 transport 实际写进请求体的那个值；四个发送面改读它；`outputReserve` 去掉 25% 封顶（死区 143,216 归零）。判据形不变（§2.1① 后段原文有效）。
- **`cmd-config.mjs` 行（现行）**：**`/config` 报面四处改读 `compactThresholdResolved`**：`:352`（header 行）· `:356`（主菜单项）· `:384`（View full config）· `:488`（数值项编辑初值）；`:493` 编辑提示行在 auto 档缀「输入数值即固定为显式阈值」；`:497-507` 保存回显对 `agent.compactThreshold` 加一行「显式阈值——auto 派生线不再生效」。显示值 = `agent.config?.agent?.compactThresholdResolved`（一处助手，四处共用；**缺场 ⇒ `(unavailable)`、编辑初值留空——链尾不产数，不回落 `100000`**）。

#### 2.12.2 守卫判据（现行逐字 · 与设计档 §6.17「守卫」同文）

- 判据 = `budget.maxTokensSource !== "absent" && usage.total > budget.limit`；真 ⇒ 以 `{ ...compactionOverhead, force: true }` 强制压缩一次 → 再估 → 仍超 ⇒ 抛 `context_overflow`（prompt / max_tokens / 窗口 三实数）、回合请求零发。
- **`absent` 档（T01 三行 = doubao-seed-2-1-pro / turbo / lite，未设显式 `maxTokens`，窗口 256,000 / 规格输出 524,288）**：守卫不覆盖 ⇒ **不抛、请求照发**（不带 `max_tokens`，服务端按其默认输出办）；状态面 `to window limit` 照常显示（R4 = −268,288，可为负）。越窗风险由服务端 400 路径兜（`context_overflow` · `retryable: false`）+ 阈值线按规格 `maxOutput` 保守预留（半窗退化 128,000）——**该三行工作正常，不变成永久发不出去**。
- **同一三行设显式 `maxTokens: 300_000`（R5）**：`limit` −44,000、判据恒真 ⇒ 压缩一次后仍超 ⇒ 抛（期望不变）。**反向错形**（拿规格 `maxOutput` 当实发判、不加 `absent` 门）⇒ 三行未设显式时每请求必抛、永久发不出去——把「客户端没预留」判成「客户端预留爆了」。

#### 2.12.3 上抛项（无新增）

无新增上抛；§2.9（1 条）与 §2.11.3（2 条）继续有效。

#### 2.12.4 坐标收正（读回核对 · 写后行号漂移）

§2.12 表内的设计档行号为落笔时读数；本批同轮又按行宽判据拆行了三处（§6.2 守卫 `:123-125` ∥ 迁移判据 `:654-655` ∥ 射程 `:676-677`），行号后移。**现行坐标**：§6.17 = `:628`（节）· 字段表 `:634-641`（`limit` 行 `:641`）· 守卫 `:670-673`（判据句 `:672`；「判据为什么不用 `maxTokens`」`:675` · 射程 `:676-677`）· 迁移判据 `:654-655` · 显示面 `:658` · 用例表 `:684-696`（R4 `:689` · R5 `:690` · R7 `:692` · R9 `:694` · R10 `:695` · R11 `:696`）∥ §6.2 守卫 `:123-125` · 未发口径注 `:117` ∥ §6.16.4 行读法 `:492` ∥ D-CC32 `:735`。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审（第 1 轮）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Coverage | 🔴 | 压缩线的**第二处用户可见面未归批**：`thincoder-cli/src/tui/cmd-config.mjs` 的 `/config` 报面与编辑初值读的是 `agent.config.agent.compactThreshold`（`cmd-config.mjs:356` `agent.compactThreshold = ${ac.compactThreshold ?? 100000}`、`:352` `compactThreshold=${ac.compactThreshold ?? 100000}`、`:384`、编辑初值 `:488` `label === "agent.compactThreshold" ? (ac.compactThreshold ?? 100000)`），而今天该键恒由 `config.mjs:436` `merged.agent.compactThreshold = value` 填入解析值。本批 `docs/batches/2026-10-18-context-overflow-guard.md:134`（`:433-437` 合并段「按 auto 旗分离，另出 `compactThresholdResolved` 供显示」）+ `docs/core/design/CONTEXT-COMPACTION.md:637` `auto 派生值只进显示面（`compactThresholdResolved`）、永不回写 `agent.compactThreshold`、不落盘` ⇒ auto 档下该键无值 ⇒ `/config` 将把 `100000 (auto)` 当成当前压缩线显示（默认值 `config.mjs:41`），且编辑初值预填 `100000`、用户回车即**静默写入显式 100000**（10% 线）——正好是本批判据 ②（只有一条线）与 ⑤（不许静默改用户配置）要治的病。受影响文件表里 `cmd-config.mjs` 只登记了「删 `:97-100` auto 回写 −4」，这些展示/初值点零登记 ⇒ 实施的 Δ 也不实。 | 把 `cmd-config.mjs:352 / :356 / :384 / :488` 列入 §2.5 受影响文件表（给出行数与 Δ），展示值与编辑初值改读 `compactThresholdResolved`；并在设计里写明 auto 档下 `merged.agent.compactThreshold` 的落值（undefined？原样 explicit？），使「压缩线只有一条」在用户可见面成立。 |
| 2 | Requirements | 🟡 | 判据 ③ 的字面要求是「窗口口径用**服务端真值**」（批次档 `:46`），设计落到**规格窗**（`CONTEXT-COMPACTION.md:639`「一律按规格窗」）——理由与判据都给了（保守、全 transport 唯一可知），但**字面偏离未被显式认领**：deepseek 档因此线落 606,784 而非服务端窗推出的 655,360（批次档 `:60`「父侧实测」自列的真限），即每请求提前 ~48,576 token 压缩；且 §2.9 上抛清单只列了需求档链式与 75–80% 目标，未列本条。 | 在 §2.9 上抛项里显式列「窗口口径取规格窗（较小者）而非服务端广告值，代价 = deepseek 档线前移 48,576 token」请用户认；或在 §6.17 写明这是对 ③ 字面的偏离 + 理由，使「彻底」的四条与落点一一对得上。 |
| 3 | Acceptance criteria | 🟡 | 判据 ⑤ 的第三款「发生削峰（退化守卫）时状态面明示 `clamped`」（批次档 `:96`）在设计里**无落点**：`CONTEXT-COMPACTION.md:631` 的 `maxTokensSource` 闭集 = `explicit` ∥ `spec` ∥ `absent`，`:642`–`:643` 的报面格式化串也没有削峰/半窗标记；而 §2.1⑤ 声称其判据形 = 「同 ② 的 grep 断言 + ④ 的报面断言」——④ 的报面里没有这个字段 ⇒ 该 AC 按现文不可机判。 | 二选一并写死：① 在 `maxTokensSource` 闭集或报面串里加一个半窗/削峰标记（如 `usable halved`）；② 明确声明该款在「封顶取消后不存在削峰」下为**空集**，并给出理由（现在发出去的就是用户写的值），删掉「明示 clamped」的承诺。 |
| 4 | Clarity / 数值自洽 | 🟡 | §6.2 的逐档链式与自家表格两处对不上：① 链式写作 `阈值 = `min(窗口 − maxOutput, ⌊窗口 × 0.8⌋)``（`CONTEXT-COMPACTION.md:63`），**漏了 `usableWindow` 退化守卫**——T01 档按字面 = 256,000 − 524,288 = **−268,288**，而表里报 `128_000（50.0%） * 半窗退化`（`:67`），只有走 `usableWindow` 才得 128,000；② 可达性边界写「**仅在预留 ≤ 20% 窗口时可达**」（`:60`），但 T07/T08 预留 = 25.0% 却落 `96_000（75.0%）`（`:73`）——仍在 [75,80]；真正边界是预留 ≤ 25% 窗口（0.8 项在 ≤20% 时胜出）。连带 D-CC30「预留 > 20% 窗口的 6 档落「窗口 − 预留」」（`:680`）把 8 档（预留 >20%）说成 6 档。 | 链式改为 `min(usableWindow(window, reserve), ⌊window × 0.8⌋)`（与 §6.17 表同式）；可达性判据改「预留 ≤ 25% 窗口 ⇒ 线 ≥ 75%」（并说明 0.8 项在 ≤20% 时胜出）；按此重算 6/16 档与 `*` 标记（T07/T08 也应带标记）。 |
| 5 | Clarity / 契约单源 | 🟡 | `Request budget:` 行有**三份写法**：`CONTEXT-COMPACTION.md:479` 写 `max_tokens {maxTokens|not sent} ({explicit|spec|absent})`，`:642`–`:643` 写 `(<explicit|spec|not sent>)` 并追加「未发时写 `not sent (reserve <spec.maxOutput>)`」，批次档 `:95` 写「explicit / spec / 未发」——而 §2.1④ 的判据是**逐字**断言整行 ⇒ 实施者无唯一目标。同处 `messages {total}`（`:479`）与 `total` 的定义（`:488`「= `contextUsage` 全量上下文占用，含 system + tools」）冲突：`limit` = `window − reserve` 是整 prompt 上限，分子必须取 total 而非 history ⇒ 标签「messages」误导（而真限读数正靠这一格）。另：`requestBudget` 返回字段批次档 `:92` 列 6 个、`:624` 列 8 个（缺 `maxTokensSource` / `limit`）。 | 冻结一份字面（含未发时的形状与削峰标记），把签名字段表统一为 8 项，并把 `messages` 改名为 `prompt`（或注明 K ≡ `total`，含 system + tools）。 |
| 6 | Closest-precedent | 🟡 | 新增 §6.17（请求预算单源）与 D-CC32 **没有先例行**：本档既有惯例是 §6.2「先例行（②）」（`:62`）与 §6.16.4「先例行（①）」（`:502`），而本批的主修面（单源算式 + 守卫）既无先例坐标（实现坐标 ∥ 对应设计节 ∥ 先例批次），也无对齐/偏离说明 ⇒ 与「未勘察」不可区分。最近先例客观存在（`config.mjs` 的 `outputReserve` / `usableWindow` / `resolveCompactThreshold` 三件同算式族）。 | 给 §6.17 补一行 `先例行（③）`：实现坐标（`thincoder-core/config.mjs:130-160`）∥ 对应设计节（§6.2 / §6.13）∥ 先例批次；对齐 = 单一算式族、随 provider 随动；偏离 = 由「预算/发送两条路」并成一条 `requestBudget`、预留去封顶。 |
| 7 | Requirements | 🟡 | §1 把 `config.mjs` 的「接受残余带」注释点名为「今天炸的原因」（批次档 `:66`「设计必须正面处理，不许继续『接受』」），D-CC32 也引它作故障因（`CONTEXT-COMPACTION.md:682`），但 §2.5 的 `config.mjs` 改点清单（批次档 `:134`）只列「新增 `requestBudget` / `outputReserve` 去封顶 / `resolveCompactThreshold` 新式 / `:433-437` 分离」——**没有改写该头注**。改完后文件里仍留着 `output budget is accepted`（`thincoder/thincoder-core/config.mjs:129`）这句与新规范面正相反的话。 | 在 `config.mjs` 改点里加一条「改写 `:125-129` 头注：删『residual band … accepted』表述，改为实发预留不封顶 + 残余带 = 0」，并把 Δ 计入。 |
| 8 | Affected-file size | 🟡 | `config.mjs` 过 500 咨询线（529 → ≈562，实读 529 与批次档 `:134` 一致）的**拆分立场两处相反**：批次档 `:149` 给拆分预案（过 650 行迁四件到 `context-budget.mjs`），设计档 `:566` 写「拆分立场 = 不因本批拆（Δ 非结构性）；消解触发 = 该档下次实质改动 ∥ 越 800 硬限前」——本批正是该档的实质改动（+45/−12、新增导出）。判据 8 的「>500 ⇒ 设计内带拆分预案」由 §2.5 满足，但两条触发条件并存会让实施轮无从判。 | 留一条口径：明确「≈562 < 650 ⇒ 本批不拆，预案保留，650 触发」，删掉「下次实质改动」这句与之冲突的表述。 |
| 9 | Feasibility / 迁移面 | 🟡 | 已固化值的分类规则缺失：§2.2 断言用户配置里躺着一个「看起来是显式、实为派生」的 750,000（批次档 `:111`），而 §6.17 的门是 `compactThresholdAuto === true` ⇒ 忽略数值（`CONTEXT-COMPACTION.md:637`）。设计没有说：该配置（数值在、旗标可能不在）在改后首次加载时算**显式**还是 **auto**。若算显式，`resolveCompactThreshold` 返 `auto:false` 原样用 750,000 ⇒ §2.6 的验收锚「今天这个会话不再炸」对**正是那条配置**不成立（且 `token-window.mjs:151` 同样以 `agent?.config?.agent?.compactThreshold` 作显式入口）。 | 补一条迁移判据（如「数值在场且 `compactThresholdAuto` 在场/为真 ⇒ 按 auto 现算；仅数值在场 ⇒ 仍需用户确认」），并在实施轮的验证清单里加「读回在用配置的 `compactThresholdAuto` 是否在场」一步。 |
| 10 | Clarity / 落点 | 🟡 | 守卫落点不精确：§6.2 说「`agent/run-stages.mjs` 压缩阶段之后、发请求之前」（`CONTEXT-COMPACTION.md:121`），批次档 `:136` 写「`:81-97` 段尾加 B 守卫」，但 `runCompactionCheck` 实读跨 `:80`–`:125`，`:81-97` 是解构 + 首个 `compressIfNeeded` 调用，不是阶段尾；且「压缩后仍超」需要**再估一次**（调 `contextUsage`？用哪个 window 源？`_lastPromptTokens` 已被压缩置 null）——设计未指定。 | 写明插入缝（`runCompactionCheck` 返回前 ∥ turn-loop 调用点之后）与再估函数/窗口源，并把批次档的行号改成该缝的实读行号。 |
| 11 | Doc hygiene（数值漂移） | 🔵 | 设计档 §6.16.9「本批三笔逐档」的读数已被现状超过：`config.mjs` 523（实读 **529**）· `token-window.mjs` 188（实读 **189**）· `run-stages.mjs` 296（实读 **297**）· `agent-tools/context.mjs` 158（实读 **170**）——批次档 `:134`–`:146` 的读数与实读一致，设计档是旧批残留。 | 下次动 §6.16.9 时按实读刷新，或改成「读数单源 = 批次档受影响文件表」（与本档 D2 立场一致）。 |
| 12 | Doc hygiene | 🔵 | §6.13 仍用改前措辞描述 auto 链（`CONTEXT-COMPACTION.md:255`「auto = 阈值链（§6.2——`min(可用窗口, ⌊窗口 × 0.8⌋)`）——可用窗口 = `usableWindow(context, outputReserve(provider, spec))`」），通篇不提 `requestBudget`；只读 §6.13 的读者看不到本批新增的单源。 | §6.13 该句补一句指向 `requestBudget`（或改为「§6.17 单源」指针）。 |
| 13 | Feasibility / 契约 | 🔵 | anthropic 的第三级兜底未进 §6.17 口径：`:630` 写「anthropic = 显式否则规格 `maxOutput`」，而实读 `thincoder/thincoder-core/provider/anthropic.mjs:56` 是 `max_tokens: provider.maxTokens || (spec.maxOutput || 8192)`——若该面改成「只读 `requestBudget().maxTokens`」，缺规格档的下限 8192 会消失（判据 ① 的「body === requestBudget.maxTokens」在缺规格模型上也会红）。 | 把各 transport 的兜底规则（此处 `|| 8192`）写进 `requestBudget` 的 `maxTokens` 定义，或在 §6.17 注明该兜底留在装配面。 |
| 14 | Doc hygiene（状态面） | 🔵 | 批次档 §1 状态行仍是「🔄 进行中（…）」（`:6`，括号内为空占位），而 §2 已「设计完成」、本批已进 §3 评审——状态面滞后于实际阶段。 | 状态行随阶段更新（讨论已交设计 ⇒ 可标已收口至设计/评审），空括号占位清掉。 |

**计数**：🔴 1 · 🟡 9 · 🔵 4（共 14 条）。

**已核（判据 8 spot-check）**：`config.mjs` 529 行 · `token-window.mjs` 189 · `run-stages.mjs` 297 · `agent-tools/context.mjs` 170（`read` 报告总行数）——批次档 §2.5 的现行行数全部**准确**；`outputReserve` 25% 封顶（`config.mjs:130-134`）、`resolveCompactThreshold` 现式（`:153-160`）、`provider/core.mjs:192` 显式才发、`anthropic.mjs:56` 恒发，均与设计所述一致。§6.2 逐档表 22 行 / 76 档 / 16+6 分组算术全部复算无误（T01 的 −268,288 与 `*` 边界两处例外见 #4）。

**判据 10（勘察证据行）**：满足——`CONTEXT-COMPACTION.md:42-43` 已载「查过 = 需求档 ∥ PROMPT-SYSTEM 两档——相关；独立公共文档仓 = 无（`PROJECT-MANIFEST.json:54` 实读）；外部一手源 = api-docs.deepseek.com」，且 §6.2:123 逐字给出该一手源的溢出口径。**判据 9（先例行）**：见 #6。

**范围外注（无严重度，不入判决面）**：需求档 `docs/core/requirements/CONTEXT-COMPACTION.md:41 / :43` 的阈值链（含 `⌊窗口 × 0.25⌋` 封顶）与判定句①（全档落 75–80%）与新式互斥——设计档 §2.7③ / §2.9 已正确识别并上抛（需求档 = 主 agent 笔），本评审不改该档；该上抛须与 §4 批准同批收口，否则规范面两处并存。

**判定**：VERDICT: changes-required（1 条 🔴 = #1，压缩线第二处用户可见面未归批）。

### 轮次 2（评审子代理）

### 设计评审（第 2 轮 · 复审判据面 = 批次档 + CONTEXT-COMPACTION.md）

**说明**：本轮委托里指向的「Agent Response」只有一句「未提供处置表，请复审判 `docs/core/requirements/DOC-CHECK.md`」——该档（已读，54 行）= DOC-CHECK 机制需求档，与本批 14 条**无关**。故复审判据面 = 批次档 §2.11（修轮①逐条处置）+ 设计档现行文本，实测路径 = 重读两档全文。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | design §6.17:655-656 · 三档落值表 :645-648 · 批次档 :215 | 🔴 | Fixed | 四处读点已逐一登记（`:352` / `:356` / `:384` / `:488`）+ 编辑初值 + 保存回显，Δ = +8/−4；「数值 = `agent.config.agent.compactThresholdResolved`；`compactThresholdAuto === true` ⇒ 缀 ` (auto)`；编辑初值 = 同一数值（不预填 100_000）」；auto 档 `agent.compactThreshold` = `undefined` 已写死（三档表）；R7 用例机判 `/config` 含 `606784 (auto)`、初值 `606784`。判据②/④/⑤ 的用户可见面闭合。 |
| 2 | 2 | design §6.17:663 · 批次档 :225 | 🟡 | Fixed | 「偏离认领（判据③ 字面 = 服务端真值）」逐字给出代价（48,576 token = 4.6%，deepseek 线低）+ 收益，且随 §2.9/§2.11.3 上抛待裁。 |
| 3 | 3 | 批次档 :235（§2.11.5 现行文本） · :181（替换声明） · design :641 | 🟡 | Fixed | ⑤ 第三款按「空集 + 理由」关闭：预留去封顶后无削减环节（「削峰明示 clamped」款为空集，判据形改 = ② grep + ④ 报面），且 §2.1⑤ 原行在 :181 被显式声明「不再具约束力」——append-only 档的正当替换形。 |
| 4 | 4 | design §6.2:60 / :61 / :63 / :73 / :74 / :90 · D-CC30:725 | 🟡 | Fixed | 链式补 `usableWindow`（`:63`）；边界改「线 ≥ 75% ⇔ 预留 ≤ 25% 窗口」并分出 0.8 项胜出面（`:60`）；T07/T08 补 `*`（`:73`/`:74`）；复算通过：`*` = 8 档 27 行、无标记 14 档 49 行、16 档 56 行（14 档 49 行恰 80.0% ∥ T07/T08 共 7 行恰 75.0%）、6 档 20 行 ∈[48.8,74.4]（预留均 > 25%）、合计 22 档 76 行——与 D-CC30「8 档 27 行」一致。 |
| 5 | 5 | design §6.16.4:482 / :490-491 / §6.17:628 / :665 | 🟡 | Fixed | 报面字面单源（§6.17 明写「本处不复制字面」）；`prompt {total}` 替代 `messages`（含 system+tools 已注明）；未发 = `not sent` + 来源 `absent`；两距离带符号；字段表 8 项。 |
| 6 | 6 | design §6.17:672-673 | 🟡 | Fixed | `先例行（③）`：实现坐标（`config.mjs:130-134` / `:142-146` / `:153-160`）∥ 设计节（§6.2 ∥ §6.13 ∥ D-CC30）∥ 对齐 / 偏离三句俱在。 |
| 7 | 7 | 批次档 :206 · design D-CC32:727 | 🟡 | Fixed | `config.mjs` 改点新增「`:125-129` 头注改写（删「residual band … accepted」）」并计入 Δ；D-CC32 理由栏点名该注释为故障因。 |
| 8 | 8 | design §6.16.9:571 · 批次档 :221 | 🟡 | Fixed | 单条触发：「改后 ≈565 < 650 ⇒ 本批不拆；拆分触发 = 过 650 行」；「下次实质改动」表述已删。 |
| 9 | 9 | design §6.17:643-652 · 批次档 :231 | 🟡 | Fixed | 三档落值表 + 迁移判据（数值在场 = 显式、不在场 = auto、无改写）+ 在用配置实测两键皆无 + 实施验证清单读回两键；§2.6 末句已加条件（:237）。 |
| 10 | 10 | design §6.17:667-670 | 🟡 | Fixed | 落点写死 `run-stages.mjs:124`（catch 闭合后、返回前）并显式纠正旧坐标（`runCompactionCheck` 跨 `:80`–`:125`、`:81-97` 非阶段尾）+ 再估函数（`contextUsage(agent, ctx.compactionOverhead)`）+ 窗口源（`requestBudget`）。 |
| 11 | 11 | design §6.16.9:570 · §6.16.8:530 | 🔵 | Accepted | 有理反驳成立：读数口径已统一标注 `wc -l`，且同档已解释「`read` 面 = wc-l +1（含末尾空段）」（`ide.mjs` 144/145 先例）；本评审 round-1 的 529/189/297/170 即 read 面读数 ⇒ 差异属口径而非漂移。 |
| 12 | 12 | design §6.13:258 | 🔵 | Fixed | 该句已加「窗口 / 预留 / 阈值 / 上限的单源 = `requestBudget`（§6.17），本函数只取它的 `threshold`」。 |
| 13 | 13 | design §6.17:641 | 🔵 | Accepted | 反驳有据：`anthropic.mjs:51` `const spec = specForModel(provider.model)` + `:56` `max_tokens: provider.maxTokens \|\| (spec.maxOutput \|\| 8192)`；`specForModel` 恒返含 `maxOutput` 的 spec（R3 用例把 DEFAULT_SPEC 钉为 128,000/32,000）⇒ `\|\| 8192` 不可达，删净不改变发送值。 |
| 14 | 14 | 批次档 :6 | 🔵 | Accepted | §1 = 主 agent 笔（本角色只写 §2），空括号占位已被实文替代；「进行中」在 §4 未批前属实。 |
| N1 | (new) | design §6.17:669 ∥ :634 ∥ :639 ∥ R4:682 · §6.2:123 | 🔴 | New | **守卫判据用的字段会让守卫静默失效（或反向打穿 3 档）**：`:669` 写 `usage.total + budget.maxTokens > budget.window`，而 `maxTokens` 的定义（`:634`）是「其余三面仅显式时发 `provider.maxTokens`，未发 ⇒ `undefined`」⇒ openai/google/responses **未设显式 max_tokens 的全部常规配置**下 `total + undefined` = `NaN`，`NaN > window` 恒 false ⇒ 守卫永不开火，「兜估算漂移」这条承诺静默落空（§6.2:123 的「估算 + 实发 max_tokens > 窗口」同病）。改按 `reserve`/`limit` 则有反向后果：`:639` 明写 `limit` 的消费面含「守卫」，R4（doubao-seed-2-1-pro，**无显式 maxTokens**，spec maxOutput 524,288）`limit` = −268,288 ⇒ 该档每请求必抛，T01 三行模型（doubao-seed-2-1-pro/turbo/lite）变成永久发不出去，而 R4 只列数值、未给守卫期望。 | 在 §6.17「守卫」写死一条口径，三选一并说明后果：① 判 `budget.limit`（= window − reserve）且**未发 max_tokens 的档按 `maxTokensSource === "absent"` 另行取值**（如以 prompt 是否 ≤ window 判，不至于永久拒绝）；② 仅在 `maxTokens !== undefined` 时启用数值判、else 明确登记「该档守卫不覆盖」；③ 承认 T01 三行在无显式 maxTokens 下永久拒绝并给出用户面提示。同时补 R4 的守卫期望（抛 ∥ 不抛）。 |
| N2 | (new) | 批次档 :215 ∥ design :655 / :650 | 🔵 | New | 显示助手链尾仍留已退场的默认常量：`:215` 写 `显示值 = agent.config?.agent?.compactThresholdResolved ?? ac.compactThreshold ?? 100000`（一处助手，四处共用），与设计「编辑初值 = 同一数值（不预填 100_000）」（`:655`）+`DEFAULTS.agent.compactThreshold` 退场（`:650`）不一致；一旦 resolved 缺场，用户面又出现一条 10% 的假线。 | 链尾改为不产数（如显示 `(unavailable)` / 直接取 resolved），或注明该支不可达并给机判用例。 |
| N3 | (new) | 批次档 :92 ∥ :181 ∥ design :628 | 🔵 | New | 签名漂移未进替换声明：§2.1① 仍写 `requestBudget(provider, spec, transport)`（3 参），设计档 = `requestBudget(provider, spec = providerSpec(provider))`（2 参，transport 由 `provider.format` 定）；`:181` 的替换清单只覆盖「判据字段 6 → 8」，未含签名。 | 把签名一并列入 `:181` 的替换项，或在 §2.5 显式采用设计档 2 参形。 |

**计数**：🔴 1（新） · 🟡 0 · 🔵 2（新）；上一轮 14 条 = 12 Fixed + 2 Accepted，零 Unfixed。
**新 🔴 性质**：修轮①把守卫判据写成可执行式时引入的**逻辑错**（`undefined` ⇒ NaN ⇒ 静默不判），落在「兜底面」，属修轮产物，不入旧条目。

**判定**：VERDICT: changes-required（1 条新 🔴 = N1，守卫判据字段会让守卫静默失效 ∥ 反向永久拒绝 T01 三档）。

### 轮次 3（评审子代理）

### 设计评审（第 3 轮 · 严格复核 N1–N3 处置 + 全列重验）

判据面 = 批次档（含 §2.12 修轮②）+ `docs/core/design/CONTEXT-COMPACTION.md` 现行全文（本轮全文重读；委托指向的 DOC-CHECK.md 已读，与本批无关，维持轮次 2 的范围认定）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | R2-N1 🔴 | design §6.17:674 / :677 / :678-679 / R4-R11 · 批次档 §2.12.2 :256-258 | 🔴 | Fixed | 守卫判据已改 `budget.maxTokensSource !== "absent" && usage.total > budget.limit`（limit = window − reserve，恒为数）；`:677` 逐字写明「不用 maxTokens」的 NaN 成因；`:678-679` absent 射程（守卫不覆盖、400 兜）+ 反向错形否决（T01 永久发不出去）；R4 补守卫期望（零压缩、零抛、请求照发）、R11 补 absent 不误伤；批次档 §2.12.2 同文镜像。轮次 2 指出的两种失效形（NaN 静默 ∥ 永久拒绝）均以单一口径关闭。 |
| 2 | R2-N2 🔵 | 批次档 :241 / :252 · design :660 · R7 :694 | 🔵 | Fixed | 替换声明补入「cmd-config.mjs 行（显示助手链尾）」；现行文本链尾不产数（缺场 ⇒ `(unavailable)`、初值留空、不回落 100000）；设计显示面同口径；R7 加机判「全屏不含 100000」。 |
| 3 | R2-N3 🔵 | 批次档 :241 / :251 · design :632 · D-CC32 :737 | 🔵 | Fixed | 签名列入替换项；§2.1① 现行 = `requestBudget(provider, spec = providerSpec(provider))`（2 参），与设计档、D-CC32 一致。 |
| 4 | R1 #1 🔴 | design §6.17:660-661 · 批次档 §2.12.1 :252 | 🔴 | Fixed（维持） | /config 四处读点 + 编辑初值 + 保存回显在案；三档落值表 :649-652；R7 机判 auto 显示。轮次 2 已判 Fixed，本轮重读无回归。 |
| 5 | R1 #2 🟡 | design :668 · 批次档 :225 | 🟡 | Fixed（维持） | 判据③ 偏离认领（48,576 token = 4.6%）+ 上抛待裁在案。 |
| 6 | R1 #3 🟡 | 批次档 :181 / :235 · design :645 | 🟡 | Fixed（维持） | ⑤ 第三款空集关闭 + 原行显式替换声明。 |
| 7 | R1 #4 🟡 | design §6.2:57-63 / :73-74 / :90 · D-CC30 :735 | 🟡 | Fixed（维持） | 本轮复算：`*` = 8 档 27 行 · 无标记 14 档 49 行 · 16 档 56 行（49+7）· 6 档 20 行预留均 > 25% · 合计 22 档 76 行——与 D-CC30 一致。 |
| 8 | R1 #5 🟡 | design §6.16.4:482-493 · §6.17:636-643 / :670 | 🟡 | Fixed（维持） | `Request budget:` 字面单源（:492「唯一字面，§6.17 不复制」）；prompt 标签；带符号距离；字段表 8 项。 |
| 9 | R1 #6 🟡 | design :681-682 | 🟡 | Fixed（维持） | 先例行（③）三件先例坐标 ∥ 设计节 ∥ 对齐/偏离俱在。 |
| 10 | R1 #7 🟡 | 批次档 :206 · D-CC32 :737 | 🟡 | Fixed（维持） | `config.mjs:125-129` 头注改写已入改点与 D-CC32。 |
| 11 | R1 #8 🟡 | design :575 · 批次档 :221 | 🟡 | Fixed（维持） | 拆分触发单条 = 过 650 行；「下次实质改动」已删。 |
| 12 | R1 #9 🟡 | design :656-657 · 批次档 :231 / :237 | 🟡 | Fixed（维持） | 迁移判据（数值在场 = 显式）+ 实测两键皆无 + 实施验证清单。 |
| 13 | R1 #10 🟡 | design :672 | 🟡 | Fixed（维持） | 守卫落点 `run-stages.mjs:124`（catch 闭合后、返回前）+ 再估函数 + 窗口源。 |
| 14 | R1 #11 🔵 | design :572-574 | 🔵 | Accepted（维持） | 读数口径统一 `wc -l` 标注；read 面 +1 差异已在档内解释。 |
| 15 | R1 #12 🔵 | design :260 | 🔵 | Fixed（维持） | §6.13 已加 `requestBudget` 单源指针。 |
| 16 | R1 #13 🔵 | design :645 | 🔵 | Accepted（维持） | `\|\| 8192` 不可达论证在案，随装配面删净。 |
| 17 | R1 #14 🔵 | 批次档 :6 / :85 | 🔵 | Accepted（维持） | §1 = 主 agent 笔；§2 状态行已随修轮②更新。 |
| N4 | (new) | 批次档 :266 ∥ design :643 / :672 / :674 / :691 | 🔵 | New | §2.12.4「坐标收正」后的坐标仍与现行档差 1–2 行：该行称「字段表 `:634-641`（`limit` 行 `:641`）· 守卫 `:670-673`（判据句 `:672`」且 R4 标 `:689`；现行实读 = `limit` 行 `:643`、守卫标题 `:672`、判据句 `:674`、R4 `:691`、迁移判据 `:656`。内容全部可经节锚定位，属纯读数漂移（R7c）。 |

**计数**：🔴 0 · 🟡 0 · 🔵 1（新，纯坐标漂移）。前两轮 17 条 = 14 Fixed + 3 Accepted，零 Unfixed；修轮② N1–N3 全部 Fixed，无新 🔴/🟡。

**判定**：VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（收口轮已把四处刷新点改回「写 compactThresholdResolved」并按评审修正；终读数 = 单测 19/19 · bench 118/0 · doc_check 0 命中 · 今日实数 606,784 达成 · 独立偏离审计 clean · 独立代码评审 pass（无 🔴））



### 5.1 实施记录（eng-coder · 2026-10-18）

**落码顺序**：config.mjs 单源六件 → 四发送面 → 阈值接线 + 删四回写点 → run-stages 守卫 → stats 行 → /config 四处 → 删陈旧单测 → 单测件 R1–R11。

#### 5.1.1 逐档改动表（改后整行——与 §2.11.2 受影响文件表对照）

| 档 | 改点（改后形） |
|---|---|
| `thincoder-core/config.mjs` | `:41` `compactThreshold: 100000` 删（改注释两行「键缺省 = auto」）；`:119-126` 头注改写（删「reservation capped」句）；`:128-137` `outputReserve` 去 `Math.min(reserve, ⌊context × 0.25⌋)` 封顶（现 `return Number.isFinite(explicit) && explicit > 0 ? explicit : spec?.maxOutput ?? 0`）；`:151-183` 新增 `requestBudget(provider, spec = providerSpec(provider))` 8 字段；`:185-194` `resolveCompactThreshold` auto 支改取 `requestBudget(provider).threshold`；`:467-478` 合并段三键分离（显式 = 数值原样 + resolved 同值 + auto false；auto = `compactThreshold` 键不写 + resolved 派生 + auto true） |
| `thincoder-core/provider/core.mjs` | `:7` import 增 `requestBudget`；`:192-194` `body.max_tokens` 改 `requestBudget(provider, spec).maxTokens`（显式才发——undefined 不落字段） |
| `thincoder-core/provider/anthropic.mjs` | `:7` import 增 `requestBudget`；`:56-58` `max_tokens: requestBudget(provider, spec).maxTokens`（`\|\| 8192` 不可达支删净——正文与注释均无残留） |
| `thincoder-core/provider/google.mjs` | `:12` import 增 `requestBudget`；`:87-89` `maxOutputTokens` 改 `requestBudget(provider).maxTokens`（未发 ⇒ 字段不落） |
| `thincoder-core/provider/responses-request.mjs` | `:12` import 增 `requestBudget`；`:199-202` `max_output_tokens` 改 `requestBudget(provider).maxTokens`（未发 ⇒ 字段不落） |
| `thincoder-core/agent/setup.mjs` | `:26` `DEFAULT_COMPACT_THRESHOLD` 删；`:25` import 增 `resolveCompactThreshold`；`:56` `threshold = resolveCompactThreshold(agent.config?.agent?.compactThreshold, agent.provider).value`（每 run 现算） |
| `thincoder-core/agent/run-stages.mjs` | `:11-13` import 增 `requestBudget` ∥ `contextUsage`；`:90-99` 成功记账段抽局部 `bookkeepCompaction`（阈值面与守卫面共用）；`:131-156` 守卫落 `:124` 缝（catch 闭合后、返回前）：判据 `budget.maxTokensSource !== "absent" && usage.total > budget.limit` ⇒ force 强压一次 → 再估 → 仍超 ⇒ 抛 `context_overflow`（`retryable:false` · message 带 prompt / max_tokens / window / limit 四实数）零发请求 |
| `thincoder-core/agent-tools/context.mjs` | `:9` import 增 `requestBudget`；`:94-104` stats 第 2 行新增 `Request budget:`（字面 = §6.16.4:484 逐字：`window {window} ({spec|provider-override}) · max_tokens {maxTokens|not sent} ({explicit|spec|absent}) · prompt {total} · to compaction line {threshold − total} · to window limit {limit − total}`；两距离带符号） |
| `thincoder-core/session-lifecycle.mjs` | `:21` import `resolveCompactThreshold` 删（换一行 §6.17 注记）；`:185-187` auto 回写块删 |
| `thincoder-cli/src/tui/cmd-config.mjs` | `:95-97` auto 回写块删；`:348-353` 显示助手（`ctResolved` / `ctDisplay` / `ctSuffix`——缺场 `(unavailable)`，不回落 100000）；`:355` header · `:359` 主菜单 · `:387` View full 三处改读 resolved；`:491-492` 编辑初值改 `ctResolved ?? ""`（留空）；`:497` 编辑提示行 auto 档缀「输入数值即固定为显式阈值」；`:511` 保存回显加「显式阈值——auto 派生线不再生效」 |
| `thincoder-cli/src/tui/model-picker.mjs` | `:239-241` auto 回写块删（注记一行） |
| `thincoder-cli/src/tui/provider-admin.mjs` | `:210-212` auto 回写块删（注记一行） |
| `docs/batches/2026-10-16-context-perception.test.mjs` | **删除**（陈旧单测——断言旧 25% 封顶 250,000/750,000 ⇒ 本批后必红；零留存纪律，台账 #1667） |
| `docs/batches/2026-10-18-context-overflow-guard.test.mjs` | **新增** 本批单测 15 用例（R1–R3d 预算面 / R4–R5 守卫射程 / R6 四 transport 同源 / R7–R8 三档落值 / R9–R11 守卫行为 / S1 stats 行）——收口删除 |

#### 5.1.2 八字段实跑读数（`node` 直跑 `requestBudget`，非推演）

```
deepseek-flash + maxTokens 393,216 ⇒ {window:1000000, windowSource:"spec", maxTokens:393216,
  maxTokensSource:"explicit", reserve:393216, usable:606784, threshold:606784, limit:606784}
```

**今日实数复算**：threshold **606,784**（= min(606,784, 800,000)，usable 项胜出）✅；limit（spec 窗）**606,784** ✅；线 + 实发 = 1,000,000 恰满 spec 窗；服务端窗 1,048,576 余 48,576（4.6%）。今日炸点 messages 658,972 > 606,784 ⇒ **压缩先触发**（旧线 750,000 不触发 ⇒ 400）——400 不可达。守卫双保险：658,972 > limit 606,784 ⇒ 即便估算漂移越线，守卫先强压、仍超带实数报错零发请求。对照档：kimi-k3 / qwen3.8-max ⇒ threshold 800,000 · limit 868,928；doubao-pro ⇒ 128,000 / −268,288（R4 射程）；未登记 ⇒ 96,000（DEFAULT_SPEC）。

#### 5.1.3 守卫用例读数（AC③）

R4 absent 零抛（prompt 100,000 > limit −268,288 若无数值门必抛 ⇒ absent 门机判成立）：零 fetch、历史零改 ✅ · R5 explicit 必抛（`limit −44,000` 恒真 ⇒ 强压一次仍超 ⇒ `kind:"context_overflow"` · `retryable:false` · message 含 `max_tokens 300000 > window 256000` + `limit -44000`）✅ · R9 触发强压再抛（reserve 970,000 ⇒ limit 30,000：阈值面强压后受保护尾仍超 ⇒ 守卫再压 ⇒ 抛三实数；fetch 全部 = 压缩摘要，回合请求零发）✅ · R10 不误伤（prompt 500,000 ≤ 606,784 ⇒ 零压缩零抛）✅ · R11 absent 阈值面压缩后守卫零追加 ✅。R6 四 transport 同源：openai `max_tokens` ∥ anthropic `max_tokens`（恒发 spec 131,072）∥ google `generationConfig.maxOutputTokens` ∥ responses `max_output_tokens`（buildBody 直测）——请求体值 === `requestBudget().maxTokens` 全绿 ✅。

#### 5.1.4 验证读数（AC④⑤⑥）

- **本批单测**：`node --test docs/batches/2026-10-18-context-overflow-guard.test.mjs` ⇒ **15 passed / 0 failed**。
- **bench/check**：`node bench/check/run.mjs` ⇒ **118 passed / 0 failed**（基线 118 持平）。
- **core / cli / vscode / desktop / render-core**：`npm test` 全绿（test manifest empty——零用例即绿，2026-09-28 全清重置口径）；server 无 test 脚本，唯一测试件 `test/rc-resolve.mjs` 直跑绿。
- **doc_check**（新引擎新进程 `thincoder-core/doc-check/index.mjs`，读数纪律 #1666）：报告态全域 **命中 0**（锚 0 · 行宽 0 · 212 档）——与任务书基线一致；本批写入声明域的文档改动为零（批次档在排除域 batches）⇒ gate 零命中成立。
- **grep 断言**（判据②机判面）：四处 auto 回写点 / `ac.compactThreshold ?? 100000` / `compactThreshold: 100000` / `DEFAULT_COMPACT_THRESHOLD`（core 侧）/ 头注 `accepted` / `\|\| 8192` 全部零命中 ✅。
- **陈旧单测处置**（#1667）：`docs/batches/2026-10-16-context-perception.test.mjs` 已删除（其 T3/T5/T6 断言旧封顶值——本批后必红；零留存）。本批单测收口时同批删除。

#### 5.1.5 实施轮验证清单（§2.11.4）

读回在用配置 `agent.compactThreshold` / `compactThresholdAuto` 两键：实测无该键 ⇒ auto 档成立（§2.6「不再炸」条件满足）。三档落值机判：auto 加载后 `compactThreshold === undefined`（键不写）、`resolved === 606784`、`auto === true` ✅；显式 700,000 ⇒ 三键各就位 ✅。

#### 5.1.6 决策透明表

| 决策 | 理由 |
|---|---|
| stats 行用 IIFE 内联（非顶部预算常量） | stats 每次调用现取——与「每 run 现算」同纪律；无状态滞留 |
| 守卫抛错带四个实数（prompt/max_tokens/window/limit） | 设计判据「三实数」之 window 与 limit 同源同算——四数都给定位更快；字面超集零冲突 |
| google/responses 面各调两次 `requestBudget(provider)`（条件 + 取值） | 展开式字面（spread 内三元）限制下最短形；纯函数两次调用零副作用 |
| 桌面设置面板零改 | 面板读盘面（空 = auto）——`agentFields` 读 `loadConfig()` 产物，auto 档 `compactThreshold` 键不写 ⇒ 显示空 = auto 语义自洽（实测核验）；无需感知 resolved |
| 上抛（§2.9/2.11.3 三条）维持待裁 | 需求档改写 = 主 agent 笔；「回到 auto」写面 = open——本批不开 |

**范围外发现（不上手，报父代理路由）**：`thincoder-server/src/agent/chat-compact.mjs:23` 镜像常量 `DEFAULT_COMPACT_THRESHOLD = 100_000`（自持阈值、从不接核 auto 链——本批前后行为零变，100K 极保守不触溢出；若将来要接 `requestBudget` 单源，属 server 侧独立批）。

### 5.2 收口轮（独立审计 + 独立代码评审之后的修正 · 2026-10-18）

**本轮的起点**：§5.1 的落码已在盘上且单测全绿；本轮做三件事——① 逐档复核实施对 §6.17 的忠实度（发现并修正一处真偏离）；② 跑协议内的独立偏离审计（explore）与独立代码评审（advisor，type=code）；③ 按评审结论修正并复跑全部读数。

#### 5.2.1 修正一：四处刷新点被删掉，改为设计要求的目标字段

- **偏离事实**：§5.1 记「四处 auto 回写点删净」，而设计 §6.17 冻结句是「模型切换后的刷新职责不变——四处刷新点**改写目标字段 = `compactThresholdResolved`**」（`docs/core/design/CONTEXT-COMPACTION.md:658`），批次档 §2.11.2 三行也写「刷新目标字段改 `compactThresholdResolved`（阈值随模型跟手）」。整块删除的后果：切模型 / 改 `providers[].context` 后 `/config` 显示的是**旧模型的派生线**（直到重新加载配置）——正是本批要消灭的「用户面看见一条不是当前生效值的线」。
- **修正**（四处同一形：门 = `compactThresholdAuto`，写 `agent.config.agent.compactThresholdResolved`）：`thincoder-cli/src/tui/cmd-config.mjs:97-101` · `thincoder-cli/src/tui/model-picker.mjs:241-244` · `thincoder-cli/src/tui/provider-admin.mjs:212-215` · `thincoder-core/session-lifecycle.mjs:188-191`（保留原 `switched` 门）。显式键 `agent.compactThreshold` 仍零改写。
- **机判**：单测 R12（四处刷新点只写 `compactThresholdResolved`、派生值不得写显式键）· R13（`/config` 四处读点 + 编辑初值 + 不回落 100000）。

#### 5.2.2 修正二至五（评审 🟡/🔵 实修项）

| # | 档:行（改后） | 改动 | 理由 |
|---|---|---|---|
| 1 | `thincoder-core/agent/run-stages.mjs:146-152` | 溢出文案按 `limit < 0` 分叉 | 原句「reduce the conversation (/compact or prune)」对「显式 `maxTokens` ≥ 窗口」档（设计 R5 接受的常态档，limit −44,000）是**无效补救**——压缩对话无论如何救不回；该支改示「max_tokens N alone exceeds the window — lower provider.maxTokens or switch to a larger-window model」。单测 R15 机判该分叉。 |
| 2 | `thincoder-core/config.mjs:172-173` | `maxTokens` 归一改 `Number()` 后再判 | 原式 `Number.isFinite(provider.maxTokens)` 把数字串 `"393216"` 判为未设 ⇒ 四发送面都不发 `max_tokens`、`maxTokensSource` 报 `absent`、守卫整档不覆盖——静默改变实发值，与判据⑤同类病；同族 `providers[].context` 已显式接受数字串（`model-specs.mjs:333`）。单测 R14 机判 `"393216" ≡ 393216`。 |
| 3 | `thincoder-core/provider/anthropic.mjs:58` | `requestBudget(provider, spec)` → `requestBudget(provider)` | 原传 `specForModel(...)`，与其余三面/默认参数的 `providerSpec` 不同源（`providers[].context` 覆盖不进该 spec）；今日只消费 `maxTokens` 故无行为差，但「四面只读同一 `requestBudget`」应在字面成立。 |
| 4 | `thincoder-core/session-lifecycle.mjs:83-84` · `thincoder-cli/src/command-interactive.mjs:139-140` | 陈旧注释改写 | 两处仍称「重算 compactThreshold」，与现行「只刷 `compactThresholdResolved`，判定阈值每 run 现算」不符。 |
| 5 | `thincoder-core/config.mjs:188-189` | `resolveCompactThreshold` 第二参注释改「compat shape，现无调用者传字符串」 | 原注释称 legacy caller = first-run wizard，实测 7 处调用点无一传字符串（字符串分支成死码）；代码保留兼容形，只改注释口径。 |

#### 5.2.3 最终验证读数（本轮复跑，非沿用）

- **本批单测**：`node --test docs/batches/2026-10-18-context-overflow-guard.test.mjs` ⇒ **19 passed / 0 failed**（R1–R11 + R3b/R3c/R3d + S1 + R12–R15）。
- **bench**：`node bench/check/run.mjs` ⇒ **118 passed / 0 failed**（基线持平，exit 0）。
- **doc_check**：新进程直跑 `runDocCheck(process.cwd())`（`thincoder-core/doc-check/index.mjs`）⇒ 射程 212 档 · **命中 0（锚 0 · 行宽 0）**。
- **core / cli `npm test`**：两档均 exit 0（test manifest empty——零用例即绿，2026-09-28 全清重置口径）。
- **八字段实跑**（`node` 直跑 `requestBudget`，本轮复跑）：deepseek-flash + 393,216 ⇒ `{window:1000000, windowSource:"spec", maxTokens:393216, maxTokensSource:"explicit", reserve:393216, usable:606784, threshold:606784, limit:606784}`；脏载数字串同值。今日实数：messages 658,972 > threshold 606,784 ⇒ 压缩先触发；线 + 实发 = 1,000,000 恰满 spec 窗。
- **档行数（`wc -l` 口径，node 计 `\n`）**：`config.mjs` 570 · `run-stages.mjs` 330 · `agent-tools/context.mjs` 181 · `session-lifecycle.mjs` 403 · `cmd-config.mjs` 521。

#### 5.2.4 独立审计与代码评审（协议内两轮）

- **偏离审计（explore，只读）**：六条判据逐条 = 落实；清单外改动 / 静默简化 / 文档漂移 / 越界四类 = 未发现；终判 **clean**（审计另指出 `command-interactive.mjs:139` 陈旧注记与 R7/R8 显示面强度不足——前者已修，后者以 R13 补机判）。
- **代码评审（advisor，type=code）**：12 条发现 = 🟡 5（其中 3 条已实修，2 条为既成债务）+ 🔵 7（5 条已修/覆盖，2 条登记）；**🔴 0**，**VERDICT: pass**。

#### 5.2.5 未修项与上抛（设计档 = eng-designer 的笔，本段只报到）

1. **[上抛·待裁] 设计档自相矛盾（机制面）**：§6.16.2 写死「同一安全点至多发生**一次成功压缩**（重建后的 tail 不得当轮再摘要）」（`docs/core/design/CONTEXT-COMPACTION.md:441`），而 §6.17 守卫（`:674`）要求「真 ⇒ 强压一次」——阈值面已压成功、守卫再压 ⇒ 同一安全点两次成功压缩，本批单测 R9 的构造即为该路径。实施按 §6.17 落码（冻结判据），**不自行改行为**。请裁：① 设计档层把 §6.16.2 的「至多一次」重定为「阈值面 ∥ 模型主动面互斥，守卫紧急强压不计入」；或 ② 实施层加旗——同安全点已成功压缩过则守卫只判不压（未压仍超 ⇒ 直接带三实数抛）。
2. **[上抛·知会] 批次档 §2.11.2 的计划 vs 实落漂移**：该表登记 `token-window.mjs`「`contextUsage` 返预算面字段…+18」，实落 = `statsReport` 内直取 `requestBudget`（`agent-tools/context.mjs:98-104`），`token-window.mjs` **零改**。结果面与 §6.16.4「取自同一 `requestBudget`——stats 不自算第二套」一致（更单源），仅计划表未兑现。
3. **既成债务（本批不拆）**：`config.mjs` 570 行、`cmd-config.mjs` 521 行均过 500 咨询线（设计裁「改后 ≈565 < 650 ⇒ 本批不拆，拆分触发 = 过 650 行」，实读 570 仍 < 650）。
4. **测试强度（登记）**：R12/R13 是对源码文本的正则断言，`/config` 的真实渲染面未被行为化覆盖（TUI 无现成注入缝）；显示逻辑外提为可测纯函数 = 后续项。
5. **范围外（不改，报父代理路由）**：`thincoder-server/src/agent/chat-compact.mjs:13` / `:22` 的注释仍称镜像 `thincoder-core/agent/setup.mjs` 的 `DEFAULT_COMPACT_THRESHOLD`（该常量本批已从 setup.mjs 删除）⇒ 悬空指称；该档自持 `100_000` 的行为零变。

#### 5.2.6 本批 diff 波及的设计档漂移（设计档 = eng-designer 的笔，本段只登记不代改）

- **死指针**：本批按要求删除 `docs/batches/2026-10-16-context-perception.test.mjs`，而设计档两处仍指向它——`docs/core/design/CONTEXT-COMPACTION.md:310`「单测档 = `docs/batches/2026-10-16-context-perception.test.mjs`（284 行）」与 `:567`「**新单元测试档 = `docs/batches/2026-10-16-context-perception.test.mjs`**（…现盘 284 行）」。零留存纪律下该文件已不存在，两处已无解析对象；请设计席删句或改为「本档已随批收口删除，读数只在批次档 §5」。
- 口径说明：`DEFAULT_COMPACT_THRESHOLD` 在 `docs/core/design/API-CONTRACT.md:3241` 的条目不构成漂移（那里指向 server 自持常量，该常量本批零改）。

## §6 验证与收口（父代理）

### 收口结算（2026-10-18）

**验证读数（父侧亲验，非转述）**

| # | 判据 | 命令 | 结果 |
|---|---|---|---|
| 1 | 死区闭合（本批核心） | `requestBudget({model:"deepseek-flash",maxTokens:393216})` | `window 1,000,000(spec)` · `maxTokens 393,216(explicit)` · `reserve 393,216` · `usable 606,784` · **`threshold 606,784`** · **`limit 606,784`** |
| 2 | 今日炸点归零 | `658,972 > threshold` | **true ⇒ 压缩先触发**（旧机制 658,972 < 750,000 不触发 ⇒ 400）。**400 在新机制下不可达** |
| 3 | 未发档不误伤 | `requestBudget({model:"kimi-k3"})` ∥ `doubao-seed-2-1-pro-260915` | kimi-k3: `absent` · threshold 800,000 · limit 868,928；doubao: reserve 524,288 · limit −268,288（守卫不覆盖）——与设计 R2/R4/R11 逐数一致 |
| 4 | 守卫判据 | `run-stages.mjs:137-151` | `maxTokensSource !== "absent"` ∧ `usage.total > budget.limit` ⇒ force 强压 → 再估 → 仍超 ⇒ `context_overflow`（`retryable:false`，`limit < 0` 分支文案）——**不用 `maxTokens`**（避 NaN） |
| 5 | 显示面 | `cmd-config.mjs:353-357` | 读 `compactThresholdResolved` · 缺场 `(unavailable)` · **`100000` 回落零残留** |
| 6 | 状态面 | `context.mjs:101` | `Request budget: window … · max_tokens … (…)` 行在位 |
| 7 | 机检 | `runDocCheck`（新进程） | **212 档 · 锚 0 · 行宽 0** |
| 8 | 回归 | 批内单测 ∥ `bench/check/run.mjs` | **19 passed / 0 failed** ∥ **118 passed / 0 failed** |

**父侧直接执行（标记 · 可 revert）**

| # | 改动 | 依据 |
|---|---|---|
| 1 | `CONTEXT-COMPACTION.md` §6.16.2（`:441`）补一句：溢出守卫的紧急强压是「同点一次成功压缩」的**唯一例外**，且守卫不得同点连压第二次 | `#42` 上抛的设计面自相矛盾（§6.16.2 不变量 ∥ §6.17 守卫强压）；裁 ① 改措辞（② 加旗会让守卫失效，违背「不越窗优先」）——单句口径补述，零新语义 |
| 2 | `:310` / `:567` 两处死指针（指已删的 `2026-10-16-context-perception.test.mjs`）改为「单测档随批存放、收口随批删除」 | 本批按零留存删档；状态档不得指过程档（D4 方向规则） |

**任务书纠错（父侧笔误，已由实施轮纠正）**：`knownFacts` 里写的 `limit = 655,360` 是拿服务端广告窗（1,048,576）算的——**正是判据③ 否掉的算法**。`#42` 按冻结设计落 `limit = 606,784` 并明确上报，未按错数改实现。**该错数不进入任何设计面**。

**暂缓批复核**：无暂缓批。

**遗留与去向（全部已入台账）**

| 项 | 台账 |
|---|---|
| CLI `/config` 无「回到 auto」写面（两端不对称） | `#1668` |
| `thincoder-server/src/agent/chat-compact.mjs:13/:22` 注释仍指 `setup.mjs` 的 `DEFAULT_COMPACT_THRESHOLD`（已删） | 本段登记，交 server 批修（跨仓，本仓不改） |
| `/config` 显示逻辑未行为化覆盖（R12/R13 为源码正则断言） | 设计已记 open，后续项 |
| `config.mjs` 570 行 / `cmd-config.mjs` 521 行过 500 咨询线 | 设计 `:575` 裁「过 650 才拆」，单条触发 |

**集成影响**：无（压缩链自测 + bench 覆盖；`compress-form.test.mjs` 零回归）。
