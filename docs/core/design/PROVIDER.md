# 供应商与模型（PROVIDER）· 核心统一子系统档

> 板块归属 = **核心统一**（phase 2——「一个核 + 两个薄壳」）；本档 = 该板块的**子系统设计档**。
> 工作流档 = `docs/core/design/CORE-UNIFICATION.md`（事实基线 / 核形态与消费契约 / 方案选型 / S0 方法 / 分段执行 S0a–S3 / 关键决策 / 受影响文件总表 / 验收回指 / 裁定 A1–A8 / 契约兼容策略 / 测试用例）——**本档不复制**。
> 需求层 = `docs/core/requirements/CORE-UNIFICATION.md`（F1–F13 / N1–N8）。
> **列定义**（裁决行各列含义）→ `CORE-UNIFICATION.md` §2.5；**须裁条目的分组口径与四要素提交形式** → 该档 §2.5.1。
> **机制面**：机制 / 契约的实质描述 · 关键决策——**本档 = 该板块的完整设计面**（裁决行 + 机制 + 决策）。

## 1. 归属与范围（自本档行内容的路径归纳）

| 面 | CLI 档 | VSC 档 |
|---|---|---|
| 调用核心 | `thincoder-cli/src/provider/core.mjs` + `src/provider/index.mjs` | 经 `@thincoder/core/provider/core.mjs` 引用 |
| 传输 | `src/provider/{anthropic,google,responses}.mjs` | 经核 `provider/{anthropic,google,sse,responses}.mjs` 引用 |
| 基础件 | `src/provider/{sse,retry,normalize,errors,abort-provenance}.mjs` | 经核同列引用 |
| 限流 | `src/provider/rate.mjs` | 经 `@thincoder/core/provider/rate.mjs` 引用 |
| 模型清单 | `src/provider/list-models.mjs` | 经 `@thincoder/core/provider/list-models.mjs` 引用 |
| 模型规格 | `src/model-specs.mjs` | `src/config.mjs`（模型规格段）+ `specs.mjs` |

## 2. 核模块裁决行

### 2.1 同路径对

| # | 相对路径 / 对位 | 面 | 相似度 · 逐字节 | 分类 | 目标 | 端差处置 | 前提校验 | 须用户裁 | 归属段 |
|---|---|---|---|---|---|---|---|---|---|
| 114 | `provider/rate.mjs` | 同路径 | 0.1646 · 异 | ③ | 进核 | 取并集：等待取 VSC 的可中断实现（`abortableSleep`）+ 默认限流口径取 VSC 的 spec 回退 + token 估算取并集（图片 part / `max_tokens`） | 分叉 ＝ 等待可中断性（CLI 睡到窗口结束 `src/provider/rate.mjs:89-90` / VSC 10s 段可中断 `:26-34,135-137`）+ 默认 tpm/rpm 回退 + token 估算口径；前提（同职责）仍成立 | **①** | S1（建核补齐） |
| 115 | `provider/list-models.mjs` | 同路径 | 0.0601 · 异 | ③ | 进核 | 取并集：保留 VSC 的排序与明确报错 + CLI 的 `provider.headers` 随请求发出 | 分叉 ＝ 排序 / 自定义 header 是否随 `/models` 发出 / 失败形态（CLI 静默空清单 `src/provider/list-models.mjs:88-93` / VSC 抛错并显示不可用 `:38,63-74`）；前提（同职责）仍成立 | **①②** | S1（建核补齐） |

### 2.2 语义对位遍行（同职责但相对路径不同）

| # | 对位（CLI ↔ VSC） | 分类 | 端差处置 | 前提校验 | 须用户裁 | 归属段 |
|---|---|---|---|---|---|---|
| 138 | `src/provider/core.mjs` + `src/provider/index.mjs` ↔ `src/provider.mjs` | ② | 融合：以 CLI 调用核心为准 + VSC 的传输分派面归位 | 分叉 ＝ 组织（VSC 单档 / CLI 拆 core + sse + normalize）；两端同 API 语义（`chat` / `createProvider`——VSC `thincoder-vscode/src/provider.mjs:123` 自述「CLI core.mjs 同构」）⇒ 前提成立 | — | S1（建核补齐） |
| 139 | `src/provider/anthropic.mjs` ↔ `src/provider/transports/anthropic.mjs` | ② | 融合：取一侧 + 核内 `transports/` 目录归位 | 分叉 ＝ 目录（CLI 平铺 / VSC `transports/`）；同源自述 ⇒ 前提成立 | — | S1（建核补齐） |
| 140 | `src/provider/google.mjs` ↔ `src/provider/transports/google.mjs` | ② | 融合：同 #139 | 同 #139（VSC 头注自述「与 CLI 同修」）⇒ 前提成立 | — | S1（建核补齐） |
| 141 | `src/provider/responses.mjs` ↔ `src/provider/transports/responses.mjs` | ② | 融合：同 #139 | 同 #139（VSC `:376` 自述「与 CLI/core 同构」）⇒ 前提成立 | — | S1（建核补齐） |
| 142 | `src/provider/sse.mjs` · `retry.mjs` · `normalize.mjs` · `errors.mjs` · `abort-provenance.mjs` ↔ 核内（VSC 侧内联 / 无独立档） | ② | 融合：按核内结构归位（重试链 / 预发归一 / 错误分类 / abort 溯源） | 分叉 ＝ 拆档粒度（VSC 未拆）；VSC 多处自述「与 CLI 对齐」（`thincoder-vscode/src/provider.mjs:250` 等）⇒ 前提成立 | — | S1（建核补齐） |
| 143 | `src/model-specs.mjs` ↔ `src/config.mjs`（模型规格段）+ `specs.mjs` | ② | 融合：核内单一 `MODEL_SPECS` + 端侧派生面（面板下拉 / 默认档）按端注入 | 分叉 ＝ 档名与拆分（VSC `config.mjs` 实为规格表、`specs.mjs` 仅转发）；VSC 头注自述「与 CLI src/model-specs.mjs 的查找语义对齐，但非逐行等价」（`:103`）⇒ 前提成立；字段差（`reasoningEffortDefault`）按端差登记 | — | S1（建核补齐） |

## 3. 须用户裁条目

### 3.1 甲组（真选择）

| # | 条目（路径 / 对位） | 命中 | 左端行为（CLI） | 右端行为（VSC） | 建议归一形态 | 影响面 | 裁定状态 |
|---|---|---|---|---|---|---|---|
| A19 | `provider/rate.mjs`（#114） | ① | 等待期间按 Stop **要拖到窗口结束**（`:89-90`）；只按 provider 配置的 tpm/rpm 限流 | 10s 段可中断睡眠（`:26-34,135-137`）；只配一个维度时**补默认另一维度**；token 估算含图片 part 与 `max_tokens` | 取并集：等待取 VSC 的可中断实现 + 默认限流口径取 VSC + token 估算取并集 | ① 被限流时按 Stop 的响应速度（CLI 侧变快）；② 只配 rpm 的场景会多一层 TPM 闸（限流更早触发） | **已裁 · 按建议** |
| A20 | `provider/list-models.mjs`（#115） | ①② | 按接口返回序；**带 `provider.headers`**；解析失败静默返回空清单 | 结果 **sort() 排序**；openai / anthropic 分支**不带** `provider.headers`；失败抛错并在配置面板显示「该渠道不提供模型列表」 | 取并集：保留 VSC 的排序与明确报错 + CLI 的 `provider.headers` 随请求发出 | ① 走自建网关 / 需额外鉴权 header 的用户：VSC 现会 401 拉不到 ⇒ 归一后能拉到；② 清单顺序变化（排序 vs 接口序）；③ 拉不到时的提示形态变化 | **已裁 · 按建议** |

## 4. 对外契约影响

| # | 条目（契约点） | 类 | 归一变更 | 兼容形态（§2.12.1 模板） | 落地物（档:行 / 用例名 / CHANGELOG 条目） | 裁定状态 |
|---|---|---|---|---|---|---|
| 8 | `provider/list-models` 失败形态（空清单 → 明确报错） | 输出 | 取并集 | 登记 + CHANGELOG | `PROVIDER.md` 同步 + 用例 | 已裁 · 按建议（§2.5.1 A20） |

## 5. 受影响文件（该子系统）

指针（不复制）→ `CORE-UNIFICATION.md` §2.8 下列行：**产品运行期（S2 改）** · **产品测试（S1 / S2 改）**。

## 6. 机制面

> **本节内容**：(a) 机制 / 契约的实质描述 · (b) 实现细节与坐标 · (c) 关键决策依据（§7）。
> **坐标口径**：本节一律按**现状路径**落笔（`thincoder-core/provider/**`；`thincoder-cli/src/tui/**` = CLI 壳体面）。符号名与档路径为契约面。

### 6.1 模块地图与总览

Provider 层把模型能力差异收敛到一张**规格表**（`MODEL_SPECS`），其余代码按 spec 全自动适配；把各厂商协议差异收敛到 transport 分派（`provider.format`），核心 `chat()` 对调用方暴露统一结果形态。

| 模块 | 职责 |
|---|---|
| `thincoder-core/provider/index.mjs` | re-export：`chat` / `listModels` / `estimateText` / `createProvider` / `stripImagesForTextModel` |
| `thincoder-core/provider/core.mjs` | chat 入口（transport 分派）、OpenAI 格式 body 组装、`requestWithRetry`、载荷净化、截断续写循环、`buildContinuationMessages`、overload 重试、`effectiveFetchTimeoutMs`、`createProvider` |
| `thincoder-core/provider/list-models.mjs` | `/models` 拉取按 `format` 分派（openai / anthropic / google） |
| `thincoder-core/provider/sse.mjs` | `readSSE`：OpenAI 格式 SSE 解析、畸形 tool_calls 防御归并、usage 缓存归一、流规则触发、中断 / partial、读侧 idle 超时 |
| `thincoder-core/provider/rate.mjs` | TPM/RPM 滑动窗口闸门、token 估算、重试常量、`_rateHooks` 测试钩子 |
| `thincoder-core/provider/errors.mjs` | 错误分类族：`parseRetryAfter` / `isNonRetryableError` / `betaBaseURL` / `compileStreamRules` |
| `thincoder-core/provider/retry.mjs` | anthropic / google / responses 共用的通用退避重试链 |
| `thincoder-core/provider/normalize.mjs` | 发送前净化纯函数：`stripImagesForTextModel` / `normalizeToolPairing` |
| `thincoder-core/provider/anthropic.mjs` · `google.mjs` · `responses.mjs` | 原生 transport |
| `thincoder-core/model-specs.mjs` | `MODEL_SPECS` 规格表 + `specForModel` + `providerSpec` + `specMatch` |

**统一结果形态**（`chat()` 返回）：`{ content, reasoning, toolCalls, usage, finishReason, _warnings?, interrupted?, partial?, droppedToolCalls?, ruleTriggered? }`。

### 6.2 chat() 主流程

按序：① **净化（分派前）**——`providerSpec(provider)` 取带 provider 级 context 覆盖的 spec；`stripImagesForTextModel` 防图片毒化；`stripLocalMessageFields` 剥离仅本地消息字段（ts / transient）；② **format 分派**——`anthropic` / `google` / `responses` 各走原生 transport，缺省 OpenAI 兼容（body 组装内联）；③ **OpenAI body 组装**——
`model` / `messages` / `stream: true`；`stream_options`（非 `noUsageStream` 模型）；`max_tokens` 按 `provider.maxTokens`；
`temperature` 按 `spec.tempRange` 钳位；`thinking` 按 `spec.thinkApi` 注入；`reasoning_effort` 校验进 enum 后注入（router 模型 ID 含 `/` 时不发）；
+ **off 补发支**（`thinking:null` ∧ effort 族 ∧ 枚举行含 `"none"` ∧ 无显式档 ⇒ 发 `"none"`，同受 `!isRouter` 门——机制单源 = §6.12）；`enable_thinking`（Qwen）；
`tools` / `tool_choice` / `parallel_tool_calls`；④ **token 估算与闸门**（`rateGate`）；⑤ **请求**（`requestWithRetry` → `readSSE` → 用实测 usage 修正记账）；⑥ **结果短路**——`ruleTriggered` / `interrupted` / `partial` **立即返回**；⑦ **overload 重试**（`insufficient_system_resource` → 最多 1 次）；⑧ **截断续写**；
⑨ 返回结果（续写失败注入 `_warnings`，不整轮飞出）。

### 6.3 重试、超时与错误分类

- 重试常量：`MAX_RETRIES = 3`；`RATE_LIMIT_BACKOFF_MS = [15_000, 30_000, 60_000]`；`RETRYABLE_STATUS = {408, 409, 425, 429, 500, 502, 503, 504}`。
- **429**：尊重 `Retry-After` 头（上限 300s），无头 / 非法则退避表取档；**5xx / 408 / 409 / 425**：指数退避；**不重试**（`isNonRetryableError`）：401 / 403 认证、400 级非 429、429 但 body 含余额 / 配额特征（中文「余额不足」类 + `insufficient_quota` 类 + GLM billing code `1113` / `1114`）。耗尽后按 lastStatus 分类报错，cause 解包拼进文案。
- **去重（单一实现）**：`parseRetryAfter` 唯一实现住 errors.mjs（retry.mjs 导入）；`sleepInterruptible` 唯一实现住 core.mjs；429 配额判定统一为 errors.mjs 双判版（删 retry.mjs 纯正则版——规则漂移消）。依赖单向（errors / retry 均独立、均 import rate；core 依赖 errors）。
- **401 / 403 诊断**：Kimi 双平台提示（`sk-kimi-` 前缀 key 或 `api.kimi.com` 端点 → 说明 Moonshot 与 Kimi For Coding 两平台 key 不互通）+ 通用诊断回显 `[auth diag: baseURL=… key=… status=…]`（key 前 6 位掩码）。
- **413 可操作化（D-PR32）**：请求体超限（HTTP 413——长会话图片累积的高频形态）⇒ 错误文本携带处置提示（`/compact` 压缩历史 ∥ 移除历史图片；图片累计预算机制见 §6.7）——从裸 HTTP 码变为可执行指引。
- **400 图像语义 = 剥除自愈（非「立抛」）**：HTTP 400 ∧ 错误文本命中图像语义词表 ∧ 历史含 image part ⇒ 不就此收束——剥除历史图像 + 机读注记 + **重发一次**（触发 / 处置全文 = §6.26——本行不重述）；既有 `isNonRetryableError` 判据零改（自愈发生在错误已抛至 agent 层之后，由 agent 层承接）。
- **超时语义（废弃绝对墙钟）**：**响应头阶段**用 `fetchTimeoutMs`（默认 600s，`agent.fetchTimeoutMs` 可配，`effectiveFetchTimeoutMs(provider)` 计算；四 transport 经 opts `_headerTimeoutMs` 携带）——**消费面 = 代理分支**（`proxyFetch` 两分支：https 目标 `tunnelHttps` ∥ http 目标 `tcpConnectProxy`+`streamHttpResponse`）；
  **直连面（无 `proxyUri`）无本仓头阶段超时**（纳入 = 设计轮面——在册）；**body 阶段**用读侧**空闲**超时 `READ_IDLE_MS = 120s`（有数据流动就永不超时，连续无新 chunk 才判死）；`AbortError` 透传（用户 Ctrl+I 取消，不吞）。
- **abort / 超时来源标注**：超时 / 中止产生点的错误对象自带结构化 `abortInfo`（trigger / layer / detail）——词汇表与判定归 AGENT-LOOP 板（本档只指针）。
- **body 终止守卫（崩溃族）**：读侧空闲断流（`readSSE` ∥ `parseGeminiStream`）经单点 `terminateBody` 以错误终止 body——可 destroy 形态走 `destroyBody`（先挂永久兜底 `'error'` 监听者，防未处理 `'error'` 杀进程）；
  **web `ReadableStream`（直连 fetch）走内部 abort 通道**（`IDLE_ABORT`——建设点 = `proxyFetch` 直连分支单点〔两条流式直连链同经〕；看门狗不再 no-op）。机制单源 = `doc:PROXY.md:§2`。消费面语义零变（含 google 的 partial 保留径）。

### 6.4 SSE 流式解析（`readSSE`）

- **分帧**：TextDecoder 分块解码，按行缓冲 `\n\n` 分帧（支持多行 `data:`）；`data: [DONE]` 结束；UTF-8 BOM 剥除。
- **非 SSE 兜底**：content-type 非 `event-stream` → 尝试单 chunk JSON 解析（网关把 `stream: true` 降级为完整 completion）；HTTP ≥400 解析各厂商 error 字段抛错。
- **delta 累加**：`content` / `reasoning_content`（方言同时认 `reasoning`——DeepSeek/Kimi/GLM 用 `reasoning_content`，OpenAI o 系 / 部分路由器用 `reasoning`）/ `tool_calls`（按 index 增量拼装）。
- **帧形状守卫（D-PR31）**：`choice.delta == null && choice.message != null`（MiniMax v2 类端点的完整快照帧）⇒ content / reasoning 按**前缀关系补差**（`text === 已收` 跳过；`text.startsWith(已收)` 只追加差量；无前缀关系按增量追加——不吞真实内容）；`tool_calls` 对已有 slot **覆盖**（非累加）——修「message 形状重复帧二次追加」。
- **usage 帧**：`choices: []` 的 data 帧捕获 usage（prompt/completion/cache hit/miss tokens）；缓存字段归一为 DeepSeek 风格（OpenAI 报 `prompt_tokens_details.cached_tokens`，少数在 usage 顶层）。
- **中断 / partial**：`signal.abort` → 抛 AbortError；`signal.reason.interrupt`（Ctrl+I）→ 提交已生成部分并标 `interrupted: true`；网络级失败已解析出内容 → 标 `partial: true` + `networkError`，注入 `_warnings`（`network-partial`）。
- **流规则**（`compileStreamRules` 编译 `{pattern, message, action: "abort"|"warn", flags?, repeat?}`）：`abort` 立即中断并标 `ruleTriggered` + `ruleMessage`（agent 注入规则消息后重试）；`warn` 不中断，去重收集 `_warnings` 在回合后注入；`repeat: "once"` 用 `firedPatterns` 跨调用去重。**responses 格式不接 streamRules**。

### 6.5 截断续写（两协议）

`finishReason === "length"`（输出 token 截断）时按 spec 声明协议续写：

| 协议 | spec 字段 | 机制 | 适用 |
|---|---|---|---|
| **prefix** | `prefixMode: true` | `/beta` 端点续写，请求体附 `prefix: true` + 上次 usage；`reasoningEcho=required` 时回传 `reasoning_content` | DeepSeek 系列 |
| **partial** | `partialMode: true` | 同一次响应内直接续写：`MAX_CONTINUATIONS = 3` 次追加请求；usage 跨续写累计 | Kimi / Qwen / MiniMax |

- **prefix 历史约束**：prefix 续写请求**只带精简历史**——过滤全部 `tool` / `assistant(tool_calls)` 消息（DeepSeek 网关对含工具链历史的 prefix 续写**必 400**），保留 system + 最近 8 条非工具文本（`PREFIX_CONTINUATION_KEEP = 8`）；构造逻辑见 `buildContinuationMessages`。partial 续写不受影响。
- **失败可见性**：续写 400 不再静默吞——`chat()` 续写循环 catch 非重试错误时注入 `_warnings`（`continuation-failed`）+ 错误文本进结果；Retry 语义不变（400 非重试）；AbortError 用户中断透传。
- **异常 finish reason 提醒**（agent 层）：`injectResponseReminders` 人类化描述注入（`length` / `insufficient_system_resource` / `content_filter`）。

### 6.6 TPM/RPM 闸门（`rate.mjs`）

- provider 配置 `tpm` / `rpm` 后启用：**发送前**记账（60s 滑动窗口，`estimateRequestTokens` 估算——ASCII ≈ 4 chars/token、CJK ≈ 1 char/token），超预算 sleep 到窗口腾出空间（onWait 通知 UI）；未配置则闸门关闭（429 退避仍生效）。
- `recordRate(provider, estimated, usage)` 在响应后以**实测 usage** 修正记账；单请求估算已超 tpm 时放行（交重试层）+ onWait 告警。
- 窗口按 `baseURL`（`/beta` → `/v1` 归一）+ apiKey 键控；`_rateHooks` 可注入；窗口空时删除条目（防长驻 Map 无界增长）。
- **onWait 相位值域（五相）**：`gate` / `retry` / `overloaded`（带 `seconds`）· `warn` / `quota`（带 `message`——**无 `seconds`**）；发射面 = `rate.mjs`（`gate:144` · `warn:96,110`）· `thincoder-core/provider/core.mjs:235,454` · `provider/retry.mjs:60,68`。相位 → 状态文案的**核内单源映射**见 §6.20。

### 6.7 发送前载荷净化（纵深防御）

- **`stripImagesForTextModel(messages, spec)`**：非视觉模型发送前把残留 `image_url` 替换为文本占位符（防「视觉会话切到文本 provider 恢复」的存量毒化与非 raster 图 400）；历史本身不改。
- **历史图片字节预算（D-PR32）**：发送前对消息副本做**累计驱逐**——全部 image part 字节和超 `IMAGE_HISTORY_BYTES_BUDGET` 时从**最老**图起替换为占位文本（`[image omitted — dropped to keep the request under the history image budget]`）；`read_image` 注入面（`agent/record-results.mjs`）对 `history` 本体同函数同预算（防历史无界膨胀——单图 15MB 上限不约束累积）。
- **拒绝剥除（§6.26 消费面）**：`stripRejectedImages(messages)` 把全部 image part 换 `IMAGE_REJECTED_PLACEHOLDER`；与 `capHistoryImages` 共用同一替换核（后者增 `placeholder` 参——缺省 = 原占位**逐字零变**）。触发 / 处置 = §6.26。
- **`normalizeToolPairing(messages)`**：严格 provider 要求 tool 消息紧跟其 owner assistant——发送前重排 tool 消息到 owner 之后、孤儿 tool 丢弃、缺失结果合成占位。与压缩的配对保护同语义（一个管源头一个管兜底）。
- **`escapeMessages`（escape v5）**：`sanitizeLoneSurrogates`——孤立 UTF-16 高 / 低代理 → U+FFFD（全字段）；`escapeLiteralEscapes` 回归 v1 double 语义 + 奇数 run 修复；`sanitizeText` 总入口。**源头截断点** `safeSliceUTF16`（截断点落高代理时向前收一个码元）。
- 净化只作用于**线上载荷**（历史不动，可逆）。

### 6.8 原生 transport（anthropic / google）

- **Anthropic**（`format: "anthropic"`）：POST `/v1/messages`，头 `anthropic-version: 2023-06-01`，key 走 `x-api-key`；system 消息抽离到顶层 `system`；tool 用 `tool_use` / `tool_result` block；
事件流解析（`message_start` / `content_block_start` / `content_block_delta`（`text_delta` / `thinking_delta` / `input_json_delta`）/ `message_delta` / `message_stop`）；usage `cache_read` / `cache_creation_input_tokens` → 内部 cache 字段；`tool_choice` 映射；接入 rateGate / recordRate + 通用退避链。
- **Gemini**（`format: "google"`）：`generateContent` / `streamGenerateContent?alt=sse`（key 走 query 参数）；role 映射 `assistant → model`（system 抽到顶层 `systemInstruction`）；相邻同 role 合并；图像 data URL → `inlineData`；`generationConfig`；safetySettings 全 BLOCK_NONE；
事件流解析（`usageMetadata` / `part.thought` → reasoning / `part.functionCall` → toolCalls，同名去重合并、id 合成 `name_N`）；接入闸门 + 退避链。

### 6.9 规格表（MODEL_SPECS）与能力位

规格表中枢 = `thincoder-core/model-specs.mjs`：所有模型能力差异在此声明——`context` / `maxOutput` / `thinking` / `partialMode` / `prefixMode` / `multimodal` / `thinkApi`（`type` = thinking.type 字段 / `effort` = reasoning_effort）/ `thinkEnabledValue` / `reasoningEcho`（required = 必须回传）
/ `thinkAlwaysOn`（服务端强制思考标记——语义单源 = `doc:MODEL-SPECS.md:§16.3`）/ `reasoningEffortEnum` / `tempRange` / `noUsageStream`；VSC 侧每行多 `reasoningEffortDefault`。

- 新模型只加一行 spec，transport / 续写 / thinking 全自动适配；未知模型保守 `DEFAULT_SPEC`（128K 上下文 / 32K 输出）+ warn once。
- **厂商前缀剥离**：完整名未命中且含 `/` 时取**最后一个** `/` 之后的段再匹配一次（`qwen/ZHIPU/GLM-5.3 → glm-5.3`；单段名同判——`ZHIPU/GLM-5.3 → glm-5.3`）。末段形 = 用户裁定「只取最后一段」（测试服务器外标 `provider/上游名` 链式叠加所致；VSC 端差面同判——详 `doc:MODEL-SPECS.md:§17`）；显式 alias 行保留；只影响 spec 查询，不改 `provider.model`。
- **规格来源可判定**：`specMatch(model) → { spec, matched }`（与 `specForModel` 共享同一查表实现——单次查表）；`matched: false` = `DEFAULT_SPEC` 兜底。
- **退役 / 路由名是否保留成行按服务端状态判**：服务端**仍受理**旧名时删行 → 旧配置降 `DEFAULT_SPEC`（压缩阈值 / 窗口显示错）——故默认**保留为独立行**；
  仅当服务端**已 404**（名真退役）或用户明令退役时删行，且**须逐名认账退化后果**（不得静默）。参数与能力位**是否随新模型按「当下合同」判**
  （当下即由新模型服务 → 随行；限期路由 → 不预支能力位）。逐名表 = `doc:MODEL-SPECS.md:§2.4`。
- **qwen 族无泛前缀托底行**（裁定 · 待落）：`qwen` 行删除后，任何 `qwen*` 未命中名退 `DEFAULT_SPEC` + 一次性告警；不建「保守族底行」
  （理由与逐名后果 = `docs/core/design/MODEL-SPECS.md` §2.4，本档不重述）。**约束：以后不得以蹭泛前缀的方式给新 qwen 档配能力**——
  音/视频能力在 schema 上**未表达且未接入**（`multimodal` 仅承载「可收图像 part」），新档声明只写实测到的字段。
- **re-export 契约**：`config.mjs` re-export `specForModel` / `providerSpec` / `specMatch`；`providerSpec` = spec + provider 级 context 覆盖。
- **`noUsageStream` 语义 = 「核不主动发 `stream_options.include_usage`」（保守抑制，**非**服务端能力断言）**：唯一消费点 = 载荷组装段的 OpenAI 兼容支（`thincoder-core/provider/core.mjs:179`；`format:"google"` 行走原生 transport ⇒ 对 gemini 行为**惰性声明**）。逐族裁据与保留裁定 = `doc:MODEL-SPECS.md:§15.2`（本档不复述数值/名单）。

### 6.10 畸形 tool_calls 防御解析

OpenAI 兼容 SSE 流中畸形 `tool_calls`（数组含 null 元素、缺 `function` / `name` / `id` / `index`）不再崩溃或静默丢工具——槽选择优先级：① `index` 有效 → 按 index 取槽；② 缺 index 但有 `id` → 按 id 在既有槽中查找归并；③ 缺 index 无 id 但有 `function.name` → 新建尾部槽；④ 其余（纯 arguments 增量）→ 延续最后一个槽，无槽可延续则丢弃并计数。流结束收尾（`finalizeToolCalls`）：稀疏 hole 剔除、
name 空槽丢弃并计数、缺 id 合成 `call_N`。告警（`droppedToolCalls > 0`）进**机读线** `_warnings`（`malformed-tool-calls`）——模型需知道其工具调用未执行；agent 层零改动。只防御与降级，不替模型修复语义。**槽附加字段**（`extra_content`——Gemini 思考签名透传）机制单源 = §6.24。

### 6.11 模型支持与预设（PROVIDER_PRESETS）

- **预设** `PROVIDER_PRESETS`（住 `thincoder-core/config-presets.mjs`，25 家）：按需从预设创建 provider，各预设声明 `baseURL` / thinking / reasoningEffort / maxTokens / desc。**预置不携带候选清单**；**亦不携带单值默认模型**（渠道不是模型选择单位，§7 D-PR12）。
- **渠道新增**（`tokenhub` 入表 + `volcengine` 收录）：`tokenhub` = 腾讯 TokenHub 聚合网关
  （baseURL `https://tokenhub.tencentmaas.com/v1`，**不带** thinking / reasoningEffort / maxTokens 字段 =
  该载荷面未实测，不设即不发）；`volcengine` = 火山方舟（实测在册）。
  既有 `hunyuan` 预设 = 另一主机，本轮未实测 ⇒ **不动**。
  行集与逐字段取值 = `doc:MODEL-SPECS.md:§9`；护栏用例 = 预置表**不携 `model` 键**（逐条断言）——**现形 = 单元测试档（G-3）**。
- **华为云 MaaS 入表**：`huawei` = 华为云 ModelArts Studio（MaaS）——baseURL
  `https://api.modelarts-maas.com/openai/v1`（OpenAI 兼容；区域端点变体走自定义渠道自助路径——§6.21）；`thinking` / `reasoningEffort` / `maxTokens`
  **不带**（载荷面未测——「不设 = 不发」）。
- **OpenCode Go 入表**：`opencode-go` = OpenCode Go 订阅网关（baseURL `https://opencode.ai/zen/go/v1`；
  key 制——`opencode.ai/zen` 取 `sk-` key，**无 OAuth 模式**；收录 = §6.21 三判据齐）。**协议混装 ⇒ 拆双预设**（单体
  `format` 架构内零机制改解）：`opencode-go`（OpenAI 兼容 `/chat/completions` 侧）+ `opencode-go-anthropic`
  （Anthropic `/messages` 侧，`format: "anthropic"`；同 key）。字段集 = 最小面：`thinking` ∕ `reasoningEffort`
  **不设 = 不发**（D-13 同口径）；`maxTokens` 仅 anthropic 侧设 `65536`（该 transport 必发 `max_tokens`——不设即落规格行值 `131072`，
  超渠道口径）；**待验（无 key——未实拉 `/models` ∕ 载荷未实测；接入后复核）**；`x-opencode-session` 头 = 可选遥测——**不发**（§6.17 域外与端面）。
  逐模型协议分侧表（官方档快照）。
- **Gemini OpenAI 兼容侧入表**：`gemini-openai` = Google 官方 OpenAI 兼容端点
  （`baseURL` `https://generativelanguage.googleapis.com/v1beta/openai`；与 `gemini`（原生 `format:"google"`）**同 key、两形态并存**——本键 = OpenAI `/chat/completions` 侧）；
  `thinking` / `reasoningEffort` / `maxTokens` **不带**（载荷面未测——「不设 = 不发」）；**待验（无 key——未实拉 `/models`；接入后按实拉复核）**。收录依据 = §6.21 三判据
  （① 官方文档载明 OpenAI 兼容端点与鉴权形；② 可自助实测；③ 用户点名）；server 面同拍（`thincoder-server/src/ops/presets.mjs`）。
- **预置 `maxTokens` ⇄ 规格行对齐**：六对超限已逐对对齐（真行三对降行值 / 无行三对降生效基准——对齐对象 = 各预置当时的默认模型），`OVER_LIMIT` 白名单 → **空名单**。逐对表与覆盖缺口（挂 `#11`） = `doc:MODEL-SPECS.md:§15.3`。
- 能力差异全走规格表；`kimi/kimi-k3`（router 前缀）与 `k3` 保留显式 alias 行；未知模型保守 `DEFAULT_SPEC`。
- **DeepSeek V4.1-Flash 行集**：新行 `deepseek-flash`（1M 上下文 / 384K 输出 / thinking 默认开 / 前缀补全 Beta / 磁盘缓存默认开 / `multimodal: true`）；
qwen-plan 渠道同名模型以 `deepseek-v4.1-flash` 提供（`token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`——实测 GET /models 含该名 · chat 200）——独立行、字段逐字对齐 `deepseek-flash`（`.1` ≠ `-` ⇒ 纯前缀查表不命中既有行）；
两退役名 `deepseek-v4-flash` / `deepseek-v4-flash-vision-exp` 保留独立行、参数与能力位随新行（旧配置钉旧名仍查得真规格）；`deepseek-v4-pro` 保留 + 行注释（限期路由——**不预支视觉**：预支的硬失败风险不排除）。

### 6.12 Qwen 思考关闭（`enable_thinking`）

qwen 系列（百炼**混合思考**模式，默认开启）需能**真正关闭**思考（缺陷：reasoning off 时原请求体不含任何思考控制字段 → 服务端按默认开启 → off 静默失效）。纯函数 `resolveEnableThinking(provider, spec)`（`config.mjs`，两端同构造）：白名单双条件 = 模型名 `qwen` 开头（排除 `qwen3-coder` 前缀）**且** provider 指向百炼 host（`isBailianHost`）；
`provider.thinking === null` 是两端统一的**显式 off 唯一标记**（唯一例外 = effort 档位在场且非 `"none"`——见下条一致性分支）。**不受 router 门控**（白名单键控模型前缀 + host，非模型 ID 斜杠）。**选档位 / 开 auto = 隐含 thinking on**：清 `thinking: null` off 标记；
on 分支默认 effort 契约 = 取 `spec.reasoningEffortEnum` 的**首个非 `"none"` 档**——枚举首项为 `none` 的族（qwen 全族）不得拿首项当 on 默认，否则 = 「开了个关着的思考」；
`none` 不在枚举时两者等价 ⇒ 对其余族零回归。（`/think on` 取档实现 = `doc:MODEL-SPECS.md:§2.8`，A-16 / T-14。）

**一致性分支（百炼互斥约束——`thincoder-core/config.mjs:143-156`）**：服务端约束 = `enable_thinking:false` 时 `reasoning_effort` 必须为 `"none"`，互斥即 400；
⇒ `provider.reasoningEffort` 有值且非 `"none"` ⇒ `resolveEnableThinking` 返 `true`（effort 赢），该判**先于** `thinking === null` 的显式 off 判。
压缩下行（`{...agent.provider, thinking:null}` + 继承 effort——v3 同源，`doc:CONTEXT-COMPACTION.md:§6.14`）因此发 `{enable_thinking:true, reasoning_effort:<档>}` = 合法对（无 effort 档位时仍落 `false`）。

**两机制并存（不混同）**：关思考有两条独立路径——本节的名字 + 主机白名单（管**请求体字段**）
与 spec 的 `reasoningEffortEnum` 含 `"none"`（管**端侧下拉能选哪些档 + 发送前校验**）。
**不新增** `thinkToggleApi` 类 spec 字段：同一语义两处真源违 D2，枚举含 `"none"` 已是「可关」的唯一枚举表达
（裁定与链路逐条 = `doc:MODEL-SPECS.md:§2.6`）。

**effort 族渠道的 off 补发（AC-9——本节 = 谓词单源）**：host 白名单只覆盖百炼（`resolveEnableThinking`）；
**effort 族**（`spec.thinkApi === "effort"`——spec 行自携该位，如 hy3 / doubao-seed / qwen3.7-flash）的 `thinking: null` 不能靠
`enable_thinking` 生效，需在载荷组装层补发 `reasoning_effort: "none"`（实测唯一有效 off 路径：tok=0、`reasoning_content` 消失）。
**谓词（单源，其余面引用本节）**：`provider.thinking === null` ∧ `spec.thinkApi === "effort"` ∧ `spec.reasoningEffortEnum?.includes("none")` ∧
`provider.reasoningEffort == null` ∧ `!provider.model.includes("/")`（末款复用 §6.2 router 门）。
**零变面五 guard**：无枚举名 / 显式档在场（档位优先）/ 枚举不含 `none` / 百炼 qwen（`enable_thinking:false` 照发 + 同义多携该字段）/ 
路由形态名（含 `/`）；后台调用路径（`context.mjs` / `explore-distill.mjs` 的 `{...provider, thinking:null}`）同命 = 有意认账
（不再空想，与 qwen 侧同方向）。判据 = `doc:MODEL-SPECS.md:§9.6`（D-14）+ 用例 B-5；落点 = `thincoder-core/provider/core.mjs` 载荷组装段（+~5 行）。

**off 形不得在解析链上被抹（本节谓词的前置条件单源）**：谓词首款 `provider.thinking === null` 要求 **off 标记活着到达载荷层**——
advisor 径的 provider 解析（`thincoder-core/advisor/run.mjs` `resolveAdvisorProvider`）**须保形**（`cfg.thinking === null` ⇒ 结果对象 `thinking` 保持 `null`，不得归一为 `undefined`）
**且**显式 off 时不得携继承档（渠条目 / 主 provider 的 `reasoningEffort` 一律清出）。两分支（自定义渠道 / 主 provider 兜底）同判据；
`cfg.thinking === false`（非法原值）仍归一为 `undefined`（零变）。载荷层谓词本体**零改**（只补解析链前置）；用例 = `doc:MODEL-SPECS.md:§15.7` AD-1..AD-4。
无 off 路径的族（effort 型枚举不含 `none` / 服务端强制思考族）不受本条影响——谓词 guard ④ 照旧不命中（无该字段、不抛错）。
**生产者面**（off 形的族别取形——effort 族须落 `thinking: null`；CLI `/advisor` 与 VSC 面板写面两处同式）单源 = `doc:MODEL-SPECS.md:§15.4-2`。
**「有效 off 路径」判据与回执可宣称性**（生产者全表 · 单源实现 `thincoder-core/think-off.mjs`）= `doc:MODEL-SPECS.md:§16`——谓词本体（本节）零改。

### 6.13 Responses API transport

`format: "responses"`。`provider.stateful` 默认 `true`，但**链仅在白名单 host 生效**（host 驱动——不能只靠服务端报错兜底：DeepSeek 静默忽略 `previous_response_id` = 无声丢上下文，比 404 危险）。

- **双轨**：本地会话 / 历史仍是**唯一事实源**；`previous_response_id` 链只是**发送层优化**。**链生命周期 = 单次 turn**（turn 内工具往返用链增量，跨 turn 无条件重建）；链失效（404 / 过期）→ 自动重置链 + 本地全量重发一次。
- **工具调用**：内部 `{id, name, arguments}` ↔ responses `function_call` / `function_call_output` item（call_id 配对）。
- **请求体**：system → 顶层 `instructions`；messages → input items；`reasoning: {effort}`；`max_output_tokens`（**显式才发**）；流以 `response.completed` / `response.incomplete` / `response.failed` 结束（**无 `data: [DONE]`**）。
- **关键决策**：D1 双轨（本地事实源 + 链仅发送层）· D2 链 = 单 turn · D3 默认无状态（stateful 默认 true 但仅白名单生效）· **D8 host 白名单驱动链**（openai 官方 + 百炼 compatible-mode + 智谱；灰名单（deepseek.com）→ 全量 + 一次性 warning；provider 显式 `stateful` 覆盖）· D4 工具 item 双向适配 · D5 不依赖流式 usage 帧 · D6 链失效自动回退 · D7 不探测不降级 · 
**D10 store 硬规则**（百炼 / GLM 链**必须 `store:true`**——`store:false` 时 `previous_response_id` 一律 400；开链时 store:true + 首次 warning 知悉）· **D11 `event:error` 帧**（百炼 SSE）与 **D9 内置工具**（服务端执行——绕过本地权限门 / 审计，产品决策，`provider.builtinTools` 可关）。
- **错误出口**：
  - **流内 error 帧显式处置**——SSE 帧两形同处置：百炼 `event:error` 无 type 变体（建面即抛）+
    标准 `type:"error"` 帧（`handleEvent` 专案——**不得静默 default 跳过**）。
    分界判据 = 是否已有流出：无流出 ⇒ 抛错（消息含服务端 `error.message` + 码级标注——同 `response.failed` 形）；
    已有流出 ⇒ `partial: true` + `_warnings`（`responses-error-frame`）+ `errorDetail`（服务端 message 截 300）——
    同构 `sse.mjs:262-271` ∥ `google.mjs:248-255` 网络部分出口；`partial` 消费 = `thincoder-core/provider/core.mjs:242-247` 出口表既有面，agent 层零改。
    partial 返回 ⇒ seal 无 responseId ⇒ 链重置（下轮全量——正确性优先）。
  - **错误码级映射（最小集）**——单源 = `errors.mjs`
    `classifyResponsesErrorCode(code) → { kind, retryable, hint } | null`：
    `context_length_exceeded` → context_overflow / false / 「/compact」指引（D-PR32 同语义）·
    `insufficient_quota` → quota / false · `invalid_prompt` → invalid_request / false ·
    `server_is_overloaded` ∥ `server_error` → server / **true**。
    未列码 → `null`（服务端消息原样透传，不发明分类）；`usage_not_included` 不收（ChatGPT 订阅语境特有）。
    消费点 = `onFailed` + 流内 error 帧抛错支——错误消息拼 hint、`e.errorKind` / `e.retryable` 结构化挂载、`e.status` 仅数值时赋值。
    **HTTP 级分类零改**（`isNonRetryableError` 照旧——码级映射只服务流内错误面）。
  - **`max_output_tokens` 显式才发**——仅 `provider.maxTokens` 显式设定时发送；
    `spec.maxOutput` 退出**发送面**（内部用途保留：§6.11 预设对齐不变式 ∥ 压缩预算）。
    判据 = 参考面双例（opencode `openai-responses.ts:493` 显式才发 + codex 强制不发）+
    本仓同病实锤（opencode-go-anthropic `max_tokens` 未设落规格行值超渠道口径——§6.11 在案）+ 规格值非渠道合同值。
    认账：无显式值时输出上限 = 服务端默认；responses 面无续写循环，截断面零变。
    **回退形态预置**：真机读数推翻（不发即 400 ∥ 无限输出实锤）⇒ 回退恒发 `provider.maxTokens ?? spec.maxOutput` + 渠道级覆盖。
    **真机验证项在册**（不阻塞实施、阻塞核销）。
- **已知边界**：responses 格式**不接 `agent.streamRules`**（配置了 abort/warn 规则的 responses 用户该保护不生效）；`response.failed` 中途到达时已流出内容被丢弃（onFailed 无条件抛——与 D9 partial 抢救**不对称**，观察登记另批裁定）。

### 6.14 截断续写 400 止损与根治

**止损** = §6.5 的 prefix 精简历史；
修复两层 = **防御**（`escape.mjs` v5 `sanitizeLoneSurrogates`）+ **源头**（`safeSliceUTF16` 截断点前收一个码元）。`escapeMessages = stripLocalMessageFields(messages).map(escapeMessageContent)`。

### 6.15 模型上下文可配置（`providerSpec` context）

问题：`MODEL_SPECS` 的 `context` 写死；私有端点真实上下文与 spec 不符时压缩阈值偏高 → 溢出风险。
机制：**config 字段** `providers[].context`（**K 单位**正整数；非法值忽略 + 警告一次）+ **解析覆盖**（`providerSpec(provider)` = spec 的**拷贝覆盖** `{...spec, context: provider.context * 1024}`，**不污染共享 spec 对象**——跨 provider 串扰防护）+ **调用方改造**（需要 provider 感知处用 `providerSpec`；纯模型查表处保持 `specForModel`）+ 配置界面 + 显示跟随覆盖值。
**关键决策**：provider 级而非模型级；K 单位整数；拷贝覆盖不污染。

### 6.16 模型清单 provider 化与放行语义

- **M1 清单拉取（按 format 分派）**：`openai` → `GET {baseURL}/models`（`Authorization: Bearer`，解析 `data[].id`）；`anthropic` → `GET {baseURL}/models?limit=1000`（`x-api-key` + `anthropic-version`，`has_more` / `after_id` 翻页）；
`google` → `GET {baseURL}/models?key=…&pageSize=1000`（`models[].name` 剥 `models/` 前缀，`nextPageToken` 翻页）。URL 组合 = `{baseURL}` + 相对路径（与 chat 各 transport 同构）；**翻页上限 10 页**（任一分页失败即整体抛出——不部分返回）；HTTP 非 2xx / 网络失败**抛出**。候选**不做对话能力过滤**（embedding 等一并返回——不造第二个人工清单）。
- **M1 错误面**：载荷读取失败（断流 ∥ idle 超时 ∥ 网络）⇒ **原错误直抛**（根因可辨——`response.text().catch(() => "")` 吞口已去）；真非 JSON（HTML 等）⇒ `GET /models failed: non-JSON response`（文案逐字零改）；非 2xx 径照旧（读失败含在文案面）。落点 `thincoder-core/provider/list-models.mjs` `fetchJson`。
- **M2 候选面 = 拉取**（CLI）：`/model` L2 与 `/config → 默认模型` L2 同源；**会话级缓存 + TTL 60s（失败不缓存）**（`thincoder-cli/src/tui/model-catalog.mjs`，缓存时钟可注入）。
- **M3 渠道默认模型面（单值 `providers[].model` 退场）**：原三用途 ⇒ ①新装种子 = **零播种**（`presetToEntry` / 添加表单不产 `model` 键）②会话槽位空兜底 =
  收为「槽模型 → `defaultModel` 属渠段 → **明示未设置**」（模型面单源 = §6.22；缺 ⇒ 沿既有「model 缺失」处置，**绝不静默回落**）③显示回退 = 渠道行显 `baseURL`。
  消费者：advisor 无 `cfg.model` ⇒ 父解析模型单档（两皆无 ⇒ 既有 `assertProviderModel` fail-fast 不变）；subagent **裸渠名一律拒**（可读错误——渠道无默认模型，请用 `provider:model`）。
- **M4 放行语义（`parseModelRef` v2）**：仅三类无效——空串 / 纯空白、裸值（无冒号）、未知 provider（及 `provider:` 模型段空）；**候选外放行**、**多冒号首分割放行**（`ollama:llama3:70b` 式模型名可用）。
- **M5/M6 切换回显**：`specMatch` 判来源；正常形态 `Model: kimi:kimi-k3 — spec found (ctx 1M / out 128K)`；`DEFAULT_SPEC` 兜底 → 警示色 + `set context in /config to override`。
- **M7 配置迁移（形态 A/B → C）**：**`delete p.model` + `delete p.models`**（渠道单值模型退场）；幂等；写回失败不阻断启动；VSC 同规则**独立实现**。
- **M8/M9 渠道准入**：`/models` 不可用 → **该渠道模型候选面视为不可用**（不列候选 / 不可选 / 无静态兜底 / 无手输绕过）；失败文案逐字 = `该渠道不提供模型列表（GET /models {状态}）——无法选择模型，请改用其他渠道`（消息本体）+ 行内状态标签 `不可用`；
**添加表单不设 model 输入件**（渠道条目不携模型——单值模型退场；模型选择 = `/models` 候选 ∥ 命令面 `provider:model`；探不通 ⇒ 渠道标 `不可用`）；**执行层 = 配置阶段**（加渠道 / 设 API key / 设默认模型的配置路径探一次）；**运行期不加闸**（启动 / 每请求零 `/models` 探测——不引入启动期网络依赖）。
- **M8/M9 补（VSC 探针落账与有界重试）**：探针失败落账增 `failure ∈ {timeout, malformed, hostBusy}` + `ts`；
`hostBusy` = 宿主事件循环繁忙（**非渠道故障**——分类可辨）；**运行期零探测语义零改**——本补只动配置阶段；**文案逐字零改**（`channelUnavailableMessage`）。
端侧详面（采样器落点 / 重试窗口起止与计数 / 展示面分档 / 机检）= `docs/vsc/design/SETTINGS.md` §2.12（**不重述**）。
- **M10 候选未命中 = 保持当前选择**：候选清单未命中「偏好 / 当前选择」时**不得静默写会话槽**——该场景写槽仅来自显式用户动作（候选行点击 / `/model` 选择）；未命中分支显示与状态同步回落会话槽复合、零 `selectModel` / `selectReasoning` post；**命中分支维持现状**（同值幂等回写 / 无槽复合时沿用 workspaceState 播种 / reasoning 归一改写）。
  CLI 对位 = 会话值优先链（`sessionModel ?? dm.model`；缺 ⇒ 明示未设置，**绝不静默回落**）。
- **UI / 交互决策（已定）**：候选列表行**直接可选**（不再区分「候选 / 建议」两组）；**渠道行显示回退 = `baseURL`**（单值模型退场）；**模型选择面不加手输行**（命令面 `provider:model` 仍放行任意串）；**添加表单不设 model 输入件**（渠道条目不携模型——单值模型退场；「拉取模型」钮收为渠道校验）；**不加** VSC 面板 spec 来源回显。**open 项：无**。
- **模型菜单行语义（核件 `thincoder-render-core/composer/model-menu.mjs`）**：provider 行 = **分组/展开控件**（零选中语义——`role="button"` + `aria-expanded` 随本行组体开合同拍，无 `aria-selected`；「当前模型归属」由组体内条目 ✓ 勾选承载）；
  行点击 = **展开⇄收起**，且**组体开合与菜单层开合解耦**（行点击不关菜单；点外 ∥ Esc ∥ 条目拾取照旧关）；行径**恒零 `post` 零槽写**（零 `selectModel` / `selectReasoning`）。
  **选中 ⇒ 生效仅在模型条目**（拾取单点 = `click`；`onPick` 携 `row` 直传——菜单在场期候选换行集零丢点）；**写失败可见**（会话槽写失败 ∥ `defaultModel` 写回失败 ⇒ 渲染面失败行 + 零乐观写回滚——单源 = `docs/desktop/design/COMPOSER.md` §2 注）。

### 6.17 请求头装配（`provider.headers`）

- **两类来源**：**内置头** = transport 协议要求（`Content-Type` / `Authorization` / `x-api-key` / `anthropic-version`），各 transport 就地声明；**定制头** = 渠道级 `providers[].headers` 静态键值。
- **装配契约** = `{ ...(provider.headers ?? {}), ...内置头 }`——定制头在前、内置头在后：**同名键内置头胜出**（定制头不得覆盖 `Content-Type` 与认证头）。`Authorization` 另有装载面防线：`config.mjs` 净化器在 loadConfig 时剥离该键（大小写不敏感）+ 非字符串值。
- **消费点全表**（5 通路 + 1 对照面）：① 主聊天（OpenAI 兼容）`core.mjs`（参照面）· ② responses（`responses.mjs` 三处 fetch 改引用提升后的单个 `const headers`）· ③ anthropic（`anthropic.mjs` 既有 `const headers` 首行加展开）· ④ google（`google.mjs` 内联展开）· ⑤ 会话标题生成（`generate-title.mjs` `opts.headers` 内联展开）· ⑥ 模型清单拉取 `list-models.mjs`（对照面——零改）。
- **域外与端面**：会话动态头（`x-opencode-session` 类）不做（证据未立）；embedding 独立渠道无定制头字段；**VS Code 端无 `providers[].headers` 概念**（配置面与展开面均无——对位引入属新需求）。
- **已知边界**：大小写变体同名定制头交给 fetch 归并（不做大小写归一）；未经装载面净化而直达 `chat()` 的定制 `Authorization` 在 anthropic 通路（无内置 `Authorization`）原样透传——不在本项加第二道防线。**open 项：无**。
- **值引用**：定制头值与 `apiKey` 可携 `${env:VAR}` 引用（落盘不落明文）——解析 = 消费侧单源 `doc:CONFIG.md:§6.3`；装配契约与装载面净化零改。

### 6.18 图片输入与贴图降级链（VSC 端 · 终收批并入）

> 本节 = 图片输入链与贴图降级链（VSC 端）。

**图片输入链（VSC）**：粘贴 / 拖拽 / 附加按钮 → webview 传 dataURL → `thincoder-vscode/src/extension/panel-messages.mjs` `routeUserTurn`（`:59`）内
`savePastedImages`（`:82`）落盘 `<cwd>/.thincoder/tmp/paste-<id>-<i>.<ext>`（`src/extension/image-handler.mjs`；raster png / jpg / gif / webp 白名单 + >15MB 跳过）→
`thincoder-vscode/src/agent/setup-reminders.mjs:22` `appendImagePointer` 给真实 user 消息追加 `[Attached images: …] — use the read_image tool to view them before answering.`（**非多模态模型直接 throw**——可见错误不静默丢）→
模型调 `read_image` 带图进载荷。历史内容保持字符串（不回放 images）；贴图临时件清理 = 端侧时序面（核件零回收）：桌面 = 回合尾 `cleanupTurn` ∥ CLI ∥ VSC = 贴图落盘写时 mtime 扫除（3 天窗——核 `thincoder-core/agent/helpers.mjs` `cleanupOldToolResults` 单源）。

**贴图降级链（非视觉模型自动降级）**：非视觉模型贴图不再硬报错——自动降级为视觉模型子代理读图、文本描述注入主会话——用户无感换模型（VSC 主；CLI 镜像软引导）。触发点 = `routeUserTurn`（savePastedImages 后、主回合 LLM 请求前）：
非视觉模型（`specForModel(provider.model).multimodal` 假）+ images 非空 + depth-0 → ① 视觉渠道查找（核 `thincoder-core/vision-reader.mjs` `findVisionChannel`——**判定源（渠道单值模型）退场 ⇒ 恒 `null` ⇒ 走 F-IDG-2 可读报错径（不静默丢图）——本态 = `#1125` 落 B（**明书不恢复**：无替代载体，零网络约束下无逐渠模型源可扫——父裁）：「非视觉模型 + 贴图 ⇒ 可读报错」即常规态**）：
② extension 内直跑一次性视觉子代理读图（`runVisionReader`——`thincoder-core/vision-reader.mjs:47`，复用 runAgent / runChild 换渠道模式；**超时 60s**（`VISION_READ_TIMEOUT_MS` `:30`）；seam = `visionReader ?? runVisionReader` 参数注入 `panel-messages.mjs:128`）
③ 描述注入：text 改 `[图片 <路径> 描述: <视觉子代理描述>]`、images 清空（appendImagePointer throw 路径不达）④ fallback：
无视觉渠道 / spawn 失败 / 超时 / 空返回 → 保留现可读报错（不静默丢图）。

**降级窗 Stop 契约**：窗内 await 期间 ⏹ 必须有效（原两路皆静默无效：僵尸 controller 交付无效 / 闩被无条件清）。契约 =
① 窗前建 `AbortController` 挂 `panel._visionAbort`（`:90` · `finally` 幂等清理 `:93`）② 取消缝——`runVisionReader({ …, signal })` 内 `signal?.addEventListener("abort", () => ac.abort(), { once: true })` 桥接内部超时 controller（既有 catch → `null` 语义复用——零新返回形态）
③ abort 定向——面板 abort case 的 running 分支**优先**判 `panel._visionAbort`（`:236-237` → `abort()` 后跳出，不再落僵尸交付路径）
④ 停后语义 = **启动即中止**——
await 快速返 `null` → 照常 `_chat`（用户消息入 history——at-most-half-a-turn）→ `_chat` 调用后置 `panel._abortRequested = true`（`:104`）——`newTurnController`（`panel-chat.mjs:44` / `:224`）消费 → 回合建立即 abort ⑤ **零新增布尔状态**（stopped 判定 = `signal.aborted`；唯一新字段 = `panel._visionAbort`——窗生命周期）⑥ 边界：
Ctrl+I（interrupt）面与视觉模型 / 无图路径零动；`maxTurns` 不改。

**关键决策与边界**：① **返回形态 = 文本描述替换 images**（与现机制完全兼容——无图污染）② **引擎级新 spawn 通道不建**（勘察确认不存在——降级 = extension 内 runAgent 一次性直跑，不走 agent-tools 池）③ CLI 镜像 = 软引导（read_image 工具错误文案追加「可 spawn 视觉模型子代理读图」；硬自动 CLI 不做）④ UI 前置（模型下拉 vision 标记）= UX 增强**移出面**（后批）⑤ 边界：
视觉模型路径零动 · 非 raster（svg / heic）现 toast 不变 · **depth>0 子代理回合非视觉贴图沿用现报错（不降级）** · retry 不回带 images（另行登记）⑥ `maxTurns` 固定 10——大贴图 / 多图可能超限落 fallback——**观察登记不改**（按图数伸缩候选在 TODO 在案）。

### 6.19 VS Code 端接线（面板 / 预设 / 配置存储 / transport 端差 · 终收批并入）

> 机制正文（chat 主流程 / 重试超时 / SSE / 续写 / 闸门 / 净化 / 规格表 / 预设 / enable_thinking / Responses / providerSpec / 模型清单 / 请求头装配）已住 §6.1–§6.17——本节只收 **VSC 端接线与端差**（同一事实不重述，D2）。

**配置存储端差**（`thincoder-vscode/src/config-io.mjs`）：与 CLI 共享 `~/.thincoder/config.json`（`resolveProviders` `:167`）——差异点 = ① `resolveKey` **只读 config.json `entry.apiKey`**（env 不是密钥源——与 CLI env 回退语义不同）；空 → provider 不可用（`providerFromConfig` 返回 null；模型选择走 onboarding）
② 代理 = provider 级 `proxy: true` **且** 代理 `uri` 在案（`injectProxy` 语义——**逐渠独立、无全局闸**：裁「2b」；VSC 第二注入点 = `presets.mjs` `providerFromConfig`）→ 请求经代理；
**写面**：添加表单勾选 ∥ 渠道管理入口写同一键（`providers[].proxy`——`true` 写 ∕ `false` 删键）；
**探针 ∥ 拉取同判定单源 = `probeTargetOf`（`thincoder-core/provider-flows.mjs:79-90`）**——表单拉取携勾选也走同式（勾 ⇒ 逐渠判定；未勾 ∥ 未落盘 ⇒ 直连缺省；`headers` 字段面随行）；
**口径单源 = `docs/core/design/PROXY.md` §4**（端侧落点 = `docs/vsc/design/SETTINGS.md` §2.16 ∥ `docs/desktop/design/SETTINGS.md` §2.16）。
③ **并发写防冲突（F5b）**：`loadRaw` 记 mtimeMs + size 基线、`saveRaw` 写前重 stat 不符 → 放弃 `{reason: "mtime-conflict"}` + `.bak-{ts}` 轮转（副本不自动合并）+ `CONFIG_CONFLICT_HINT` 提示重试 ④ 旧版迁移：
VS Code settings 的 `thincoder.providers` + SecretStorage 一次性迁入 config.json（`thincoder-vscode/src/config-migrate.mjs` `migrateCore`——不覆盖已有 apiKey、preset 名自动重建）后清 legacy 存储；嵌入 key 一并迁移 ⑤ `resolveDefaultModel`（`thincoder-vscode/src/extension/presets.mjs:106`）回退链 =
① defaultModel 复合属本渠道 ② `null`——**不回退渠道单值 / `models[0]`**（渠道单值模型退场；§6.16 M7 同源 · **核转口**）；v2 迁移 `delete p.models` / `delete p.model`。

**Preset 预设表（核单源）**：`PROVIDER_PRESETS` 表 = **核单源**（`thincoder-core/config-presets.mjs`），
VSC 侧取一侧复用（`thincoder-vscode/src/extension/presets.mjs:9` 注 + `:21` re-export；端壳无镜像文件）——**25 preset**（deepseek / kimi / kimi-code /
glm / glm-code / qwen / qwenplan / mimo / mimoplan / minimax / openai / claude / gemini / gemini-openai / grok / mistral / volcengine / hunyuan / siliconflow /
openrouter / groq / **tokenhub** / **huawei** / **opencode-go** / **opencode-go-anthropic**）；
claude / gemini 携 `format: "anthropic" / "google"`；`opencode-go-anthropic` 携 `format: "anthropic"`（§6.11 同源）；
minimax 携 `chatPath: "/text/chatcompletion_v2"`；`presetToEntry`（核单源 = `thincoder-core/config-presets.mjs:57`）剥离 `desc` 余下发成 provider 条目
（**不产 `model` 键**——单值默认模型退场，§6.11 同源）。

**模型选择 UI（面板接线）**：主下拉列 provider 行（名 + `›`——行 = 分组/展开控件，零选中语义；渠道行显示回退 = `baseURL`；§6.16 行）+ hover ∕ 点击 flyout 子菜单（组体 = 该渠模型候选；webview 无键盘导航）；条目拾取 = 写当前会话槽（拾取单点 = `click`；写失败 ⇒ 失败行 + 钮回滚槽现值）；设置面板「默认模型」项 = provider →
运行期拉取候选两级（写 `raw.defaultModel`）。Add / Remove / Key 流 = 核单源 `thincoder-core/provider-flows.mjs`（`addProviderFlow` `:137`——QuickPick preset 过滤已添加或 Custom 手输 name / baseURL + format → `addProviderEntry` → 问 key → `setProviderKey`）；
  VSC 薄壳 `thincoder-vscode/src/extension/provider-flows.mjs` 住 Remove ∥ Key 两流程 + 探针转口）；
`settings.mjs` `fullStatus`（`:308`）单源拉取
（逐已配置渠道各探一次——探通 → 候选行直接可选；探不通 → 不可选 + 失败消息随载荷）。**M9 准入探针（配置阶段）** = 收敛于核 `@thincoder/core/provider/list-models.mjs`（消费面 = `thincoder-vscode/src/extension/{provider-flows,settings,settings-panel-write}.mjs` 经核面引用）
（探针目标由核 `thincoder-core/provider-flows.mjs` `probeTargetOf` 组装——三端同源；桌面 ∕ VSC 写面同取该件）；探通 / 探不通两态 + **不阻断保存**；`defaultModel` 写面探针 fire-and-forget（写面为同步契约——探针绝不 reject）；**运行期零探测**（启动 / 发请求 / 面板打开不做 `/models` 探测）。候选未命中 = 保持当前选择显示与状态
（回落会话槽复合）+ 零 `selectModel` / `selectReasoning` post（§6.16 M10 语义同源 · 独立实现）。
**探针落账与有界重试（F-W19）**：端侧详面 = `docs/vsc/design/SETTINGS.md` §2.12（采样器 / 重试窗口 / 展示面分档 / 机检）；核语义 = §6.16 M8/M9 补行（载荷与分类）——双向指，**不重述**。

**transport 端差**：VSC 经 `@thincoder/core/provider/core.mjs` 引用——调用链 = 核单实现（§6.2 不重述）；下列端差登记：
① **超时相位**——现体 = 核 §6.3 超时制度（sse / google 读侧 idle + `effectiveFetchTimeoutMs`）；
VSC 调用面无相位传参点——相位参数由核 chat 装配（核 `thincoder-core/provider/core.mjs:414-415`）；端侧用例 `provider-timeout-semantics` 锁该跨端契约（相位参数在位）；
② **Responses 实现差异注**（链元数据 / usage 归一 / `responseId` / `builtinToolResults`）——现体 = 核 §6.13；
本地接线不变 = responses provider 经 config.json 手写 `format: "responses"` 或预设扩展启用（custom 表单 format 下拉未加 responses 项——显式 opt-in，CLI parity）；
finishReason 区分（`response.incomplete` 非长度原因不得报成 `length`）**保留为端侧验收**。

**能力适配端差**（语义同源不重并——坐标即指）：`specForModel` / `providerSpec` / `resolveEnableThinking` / `isBailianHost`（`thincoder-core/model-specs.mjs:290` / `:323` ∥ `thincoder-core/config.mjs:143` / `:126`）·
reasoning 档位落 patch（`src/extension/reasoning-mode.mjs`——`"off"` ⇒ 真 off；**载荷形随 `doc:MODEL-SPECS.md:§16.2` 按族取形**）· escape v5 与 UTF-16 安全截断（核 `escape.mjs` + 端 `src/agent/run-helpers.mjs` `safeSliceUTF16`——§6.7 同构）·
畸形 tool_calls 防御（现体 = 核 `provider/sse.mjs`；§6.10 同构）· 前缀剥离与 `DEFAULT_SPEC` 兜底（§6.9 同构）；
规格表每行多 `reasoningEffortDefault`（§6.9 已登记端差）。**`provider.headers`：VS Code 端无 `providers[].headers` 概念**（§6.17 域外与端面已登记——对位引入属新需求）。

**LLM 标题生成**（`thincoder-vscode/src/extension/generate-title.mjs:15`；`panel-chat.mjs:334` 触发）：会话第一条 user 消息后 agent 完成回复——取首条文本（多模态 part 数组取 text）→ 用该 provider 发简短 prompt（"Generate a concise title (max 40 chars…)"），**非流式** + `max_tokens: 100` + **逐 format 禁 thinking**
（openai `thinking:{type: "disabled"}` / anthropic 同 / google `thinkingConfig: {thinkingLevel: "none"}`——`:57`——否则 reasoning_content 吃光输出预算内容空 IK9UZ8）。失败静默降级返回 null（首条消息截断作标题兜底）；10s 超时；标题 trim 截 40 字符。headers 展开消费点已列 §6.17（⑤ 会话标题生成）。

### 6.20 onWait 相位 → 状态文案（核内单源映射）

**问题（实核）**：`onWait` 载荷的**相位值域**只在发射侧收敛（五相），消费侧各自枚举 ⇒ 未列相位落兜底分支，渲染 `undefined`：

| 消费点 | 现状（相位分支） | 缺支后果 |
|---|---|---|
| CLI TUI 状态行 `thincoder-cli/src/tui/tool-events.mjs:406-411` | `gate` / `overloaded` / `else` | `else` 读 `seconds`（`:409`）⇒ `Rate-limited 429, retry in undefineds`；`warn` / `quota` 均被误标 429 |
| CLI headless `thincoder-cli/bin/thincoder.mjs:189-191` | `gate` / `else` 两支 | `retry in undefineds`（`overloaded` 同样被误标 `Rate-limited 429`） |
| ACP 日志 `thincoder-cli/src/acp/bridge.mjs:196` | 无相位分支（原样 log） | 无渲染契约（不产生 `undefined`，但相位语义随载荷） |

**触发可达性**：`warn` 发射点 = `thincoder-core/provider/rate.mjs:96` / `:110`——**`estimated > tpm`（或 `effectiveTpm`）即发**（配了 `tpm` 且单请求估算超预算）⇒ 两消费点的 `undefined` 文案在真实使用中可达。
`quota` 相：值域与渲染契约已由核 i18n（`thincoder-core/i18n.mjs:44`）与 VSC 映射面（下文）双面声明，**发射点已定位** = `thincoder-core/provider/retry.mjs:60`（`:68` 同 onWait 家族——`retry` 相）。

**映射表（单源实现 = `thincoder-core/provider/wait-status.mjs`，新增）**：

| 相位 | 载荷字段 | `kind` | 文案（= `thincoder-core/i18n.mjs` 键，逐字） | 消费端 |
|---|---|---|---|---|
| `gate` | `seconds` | `rateWait` | `status.rateWait`：`TPM throttle wait ~${s}s` | 显示 |
| `retry` | `seconds` | `rateLimited` | `status.rateLimited`：`Rate-limited 429, retry in ${s}s` | 显示 |
| `overloaded` | `seconds` | `overloaded` | `status.overloaded`：`Server overloaded, retrying in ${s}s` | 显示 |
| `quota` | `message` | `quota` | `status.quota`：`quota exhausted: ${msg}` | 显示（`message` 剥发射前缀后经模板插值——`retry.mjs:60` 前缀不双前缀） |
| `warn` | `message` | — | — | **不显示**（前置告警——与 VSC 面 `statusTextPayload` 同判据） |
| 未知相位 / 秒缺失 | — | — | — | **不显示**（不虚构数值、不落兜底误标） |

- **`kind` 词表与 i18n 键**：`kind` = `rateWait` / `rateLimited` / `overloaded` / `quota`——**与 VSC 面 `statusTextPayload` 的 kind 同名**（两端同一词表）；渲染 = `t("status." + kind, { s, msg }, locale)`（`t` = `thincoder-core/i18n.mjs:89`——同表同占位符，**核内零第二套字面**）。
- **API**：`waitStatusOf(ev) → { kind, seconds?, message? } | null`（纯映射）· `waitStatusText(ev, locale?) → string | null`（`null` = 不显示）；`quota` 相剥发射前缀（`retry.mjs:60` `quota exhausted: `——首现即剥，一次）后插值。
- **消费点收敛**：三处相位枚举 / 兜底分支退役 → `const s = waitStatusText(ev); if (s) …`（TUI 状态行 / headless stderr `[rate-limit]` 前缀 / ACP stderr 日志）。
- **VSC 面（多实现面）**：`thincoder-vscode/src/extension/panel-callbacks.mjs:72` `statusTextPayload()` 五相已完备（`warn` / 未知 → `null` = 不发射；用例 `thincoder-vscode/test/status-line.test.mjs:62-70`）——**语义同源、各面独立实现**（不以任一面产物回改另一面）。
- **复现与判据（测试层 · 需求档 F-PV1）**：
  ① 单元测试直驱三消费点回调：`{ phase: "warn", message: "estimated 5000 tokens > tpm 1000 — request proceeds and may hit a server 429" }` ⇒ TUI 状态行 / headless stderr **不出现** `undefined`（现态必现）；
  ② `{ phase: "quota", message: "quota exhausted: x" }` ⇒ 显示 `quota exhausted: x`（**不双前缀**——剥前缀后插值）；`{ phase: "quota", message: "x" }` ⇒ 显示 `quota exhausted: x`；
  ③ `{ phase: "overloaded", seconds: 3 }` ⇒ 显示 `Server overloaded, retrying in 3s`（**不得**落 429 文案）；
  ④ 未知相位（`{ phase: "zzz" }`）/ 秒缺失（`{ phase: "retry" }`）⇒ 不显示（旧文案不得残留）；
  ⑤ 单源不变量：逐相 `waitStatusText(ev)` 与 `t("status." + kind, …)` deepEqual。

### 6.21 预设收录判据与长尾渠道自助路径

**判据（预设表收录门槛——「预设表 ≠ 厂商名录」）**：新渠道入 `PROVIDER_PRESETS` 须同时满足三条：

| # | 判据 | 判据义 |
|---|---|---|
| ① | 公开 OpenAI 兼容端点文档实锤 | 厂商公开文档载明 OpenAI 兼容端点（仅「平台侧接入标准 ∕ 兼容声明」不算——须有可照抄的端点形与鉴权形） |
| ② | 可自助开通 ∕ 可实测 | 可自助开通并实测（与 M8/M9 准入相容——`GET /models` 拉不到清单 = 该渠道不可选） |
| ③ | 非纯等价重复或有明确用户需求 | 纯转售等价重复低边际价值；有明确用户需求者不受此限 |

入表项的字段面纪律不变：未测载荷字段**不设 = 不发**（§6.11 先例 · D-13）；**预置不携 `model` 键**（渠道单值模型退场）。

**运营商三家首测结论**：电信天翼云（息壤 ∕ 慧聚）= **可收 · 低优先**
（判据① 实锤 + 免费体验；**本轮不入表**——低优先 = 无排期；入表条件 = 用户点名或需求出现）；移动九天 ∕ MoMA = **暂不收**
（判据① 未实锤——公开面无 OpenAI 兼容端点文档）；联通元景 = **暂不收**（判据① 未实锤——「深度适配 OpenAI API 标准」= 平台侧接入标准，非提供兼容端点）。

**长尾渠道自助路径（判据外的兜底）**：任意 OpenAI 兼容端点（含区域端点变体，如华为云区域形 `https://api-ap-southeast-1.modelarts-maas.com/openai/v1`）
无需预设即可接入——CLI `/model` 菜单「add provider → custom」或 VSC `Add provider… → Custom`（name + baseURL + model [+ format]），或手写 `providers[]` 自由字段；
用户指引条 = `thincoder-cli/README.md`（自定义渠道一条；VSC README 已有「+ custom OpenAI-compatible endpoint」覆盖）。

### 6.22 运行时渠道/模型统一解析（三端同源 · U3「宽松 + 明示」）

> **来源**：用户原则裁定「三端界面可以不一样，但是逻辑应该是一样的」+ 取 **U3 档**（宽松 + 明示）。本节 = 该机制**长期单源**；三端消费面只留各自落点细节（D2）。

**问题（实读）**：「缺 ∥ 无效 `defaultModel`」这一态的**判定与处置**三端不等——核 ∥ CLI ∥ 桌面 = 严格（解析未过即无效态：`thincoder-core/config.mjs:296-303`）；VSC = 接入面**自建回退链**绕过核判据（`panel-turn-stages.mjs:57-74` + `thincoder-vscode/src/extension/presets.mjs:107-117`）——既是偏离、也是事实标准。⇒ 同一配置态，一端能发、两端不能发。

**统一判据（核单源）**：核 `thincoder-core/model-ref.mjs` 导出 `resolveProviderPlan({ providers, defaultModel, slot })`（**纯函数 · 零 I/O**）——三端消费同一函数；`loadConfig` 的运行时 `provider` 取值切换至该函数（CLI ∥ 桌面经装配自动同源；VSC 回合面直调）。返回面：

```
{ state: "ok" | "fallback" | "invalid",
  source: "slot" | "defaultModel" | "registry" | null,   // 入选来源
  channel: string | null, model: string | null,           // 解析出的运行渠道/模型
  provider: object,                                       // {...entry, model}；不可运行 ⇒ {}
  reason: string | null }                                 // state≠ok 的原因（语义源；非契约，禁串嗅探——KD-2 同源）
```

**回退序（渠道面 · 逐步）**：

1. **会话槽渠道**：`slot.provider` 在场 ∧ 在册 ∧ **持 key** ⇒ 入选（`source="slot"`）；
2. **defaultModel 渠道**：`parseModelRef` 通过 ∧ 该渠道持 key ⇒ 入选（`source="defaultModel"`）；
3. **首个持 key 渠道**：按 `providers` 表序首个持 key 者 ⇒ 入选（`source="registry"`）；
4. 无 ⇒ `state="invalid"`（渠表空 ∥ 全表无 key）。

「**持 key**」判据 = `providers[].apiKey` trim 后非空（`thincoder-core/config.mjs:11`——env 变量不是密钥源）；槽渠道无 key ⇒ **跳过**（不把不可运行渠道钉进运行态——与 VSC 现行链同判）。

**模型面（逐步）**：① 入选来源 = 槽 ∧ 槽带模型 ⇒ 槽模型；② `defaultModel` 解析通过 ∧ 其渠道 == 入选渠道 ⇒ defaultModel 模型段；③ 无 ⇒ `null`（合法——模型由运行期 `/models` 候选 ∥ 用户选择决定；消费者沿既有「model 缺失」处置；**明示词形随缺**——见下表 `model` 缺档）。

**两类状态分界（明示口径 · 本节的判据核心）**：

- `ok` — `defaultModel` **独立成立**（解析通过 ∧ 该渠道持 key）⇒ 零明示；
- `fallback` —「**无有效 defaultModel**」类：`defaultModel` 缺 ∥ 不可解析 ∥ 所指渠道不在册 ∥ 所指渠道无 key；**且**全局存在可运行渠道 ⇒ **可运行 + 明示必达**；
- `invalid` —「**无 provider/key**」类：渠表空 ∥ 全表无 key ⇒ **真无效 + 引导配置**。

**端面「invalid 类」合成式（U-4 裁：两字段并存，不合并）**：`providerState`（key 面）∥ `providerInvalidReason`（**name 面**——`thincoder-core/config.mjs:301-303` 产出：入选渠道具名 ⇒ null ∕ 无入选渠道 ⇒ 非空；语义不变）为**两字段并存**；端面「invalid 类」（= 出导引节点的类）判据 = **`state === "invalid"` ∨ `providerInvalidReason` 非空**（三端同一合成式 · 单判据）。
「持 key 但结构不全」（缺 `baseURL` 等）**不在合成式内**——该角归**发送 ∕ 装配失败面**（装配标记 `_providerInvalid` 载体：桌面发送门〔`provider` 类词〕∥ ACP `session/new` 装配后检查；CLI ∥ VSC 落发送期失败面），非导引节点——与断言③负向锁互洽。

`loadConfig` 落三键：`provider` = `plan.provider`；`providerState`（三值：`ok` ∥ `fallback` ∥ `invalid`）+ `providerStateReason`（state≠ok 时非空）；`providerInvalidReason` 语义不变（无入选渠道时非空——`thincoder-core/config.mjs:301-303` 产出，装配校验 `validateProvider` 消费面照旧〔reason 优先源〕）。

**reason 文本（语义源 · 逐档）**：`fallback` = 沿用 `defaultModelReason` 现两档（缺 ∥ 无效）+ 新档「`defaultModel` 渠道 "<name>" 无 API 密钥——已回退到可用渠道」；`invalid` = 渠表空 ⇒ 现串「未配置任何 provider」∥ 有渠无 key ⇒ 新档「未配置 API 密钥（providers[].apiKey）——请先配置渠道密钥」。

**三端明示面对照表**（界面各自自定 ∥ 判据同源）：

| 端 | 明示面 | `fallback` | `invalid` | 动作 |
|---|---|---|---|---|
| CLI | 启动提示行（TUI）∥ stderr 一行（headless） | 新行两字面（按 `model` 在场分）：在场 ⇒ 「尚未设置默认模型：本次使用 `<渠道>:<模型>`——/config → 默认模型 设置一次（或 /model 选定即成为默认模型）」；`model` 缺 ⇒ 「尚未设置默认模型：渠道 `<渠道>` 已就绪、模型未定——/config → 默认模型 设置一次（或 /model 选定即成为默认模型）」 | invalid 类（合成式）⇒ D-S2 picker + 提示行（措辞 = 渠道/密钥）；headless = D-S4（stderr 一行 + exit 1） | 选择器（invalid 类）· `/model` ∥ `/config` 入口（fallback） |
| VSC | 横幅 `#provider-banner` | 新键 `banner.defaultModelFallback`（zh ∥ en 字面 = `doc:WEBVIEW.md:§4.8`；**含 `model` 缺档变体——同键两字面**）+ 动作钮「选择默认模型」→ 设置面 | 现词 `banner.notConfigured`（逐字不变——invalid 类合成式命中） | 钮 → 设置面默认模型段 |
| 桌面 | composer 提示带行 | 新键 `composer.send.noDefaultModelFallback`（澄清半句两字面按 `model` 在场分：在场「— 正在使用可用渠道」∥ 缺「— 渠道可用、模型未定」；词面-only；失败词 ∥ 态词分家——与 VSC `banner.defaultModelFallback` 同构） | 发送失败行现词 | —（零动作面） |

**VSC 端接线（可用性不得降）**：`resolveTurnStage` 的接入面自建链改调核函数（`slot` = 显式 `providerName` ∥ 槽复合——key 门在核内）；`presets.mjs` `resolveDefaultModel` 改核转口。「渠道 + key 已配」在三端仍**直接可发**——事实标准不回退。

**第四消费面（ACP）注（明写边界）**：`thincoder-cli/src/acp.mjs` 门判据（`defaultIsConfigured` = `loadConfig().provider?.apiKey?.trim()`）随核取值切换而变——「持 key ∧ 无有效 `defaultModel`」（`fallback` 类）由「拒（携 reason）」变「**放行**」，协议面**零提示行**（明示射程 = 三端 UI 面；ACP = 外部编排器协议面，无既有提示通道）。
此变 = U3 判据的**自然导出**（可运行 ⇒ 放行——**已认账行为变更，非缺陷**）；结构不全角仍由装配后检查兜底（`handlers-session.mjs` `session/new`：`_providerInvalid` ⇒ `-32000` + 真因）。协议面是否补提示通道 = **已定形：不立**（判由四条与备选支 = `doc:ACP-CLIENT.md:§13`；协议面零提示行 = 设计行为，非缺口）。

**可机检断言形**：① 解析一致（**运行面 + config 级两侧**）——夹具矩阵每行（临时配置路径缝 `_setConfigPathForTest`）：**运行面** = 三端同喂**同一假槽**（VSC `resolveTurnStage` 核读 ∥ 桌面核装配读 ∥ 核 `resolveProviderPlan` 直读）按 `{state, source, channel, model, provider.name, provider.model}` **逐字段相等**；
**config 级**（`loadConfig()` 无槽入参——KD-841-3 状态 = config 级）= **只比 `state`**；含槽行（S9）单列口径 = config 级 `state` 断言（`ok`）∥ 运行渠道断言归假槽用例（三端同喂）；② 单源——VSC 树零自建扫描链（源码判据）+ CLI ∥ 桌面取值点唯一 = `loadConfig().provider`；
③ 明示必达——`state === "fallback"` ⇒ 各端明示节点在场（`model` 在场 ⇒ 现行句；`model === null` ⇒ **未设置变体（禁「本次使用」句）**——各端同键两字面，按载荷 `model` 判）；
`state === "ok"` ∧ `providerInvalidReason` 空 ⇒ 零节点（负向锁）；invalid 类（合成式）⇒ 端面导引节点（CLI picker ∥ VSC 现词 ∥ 桌面发送失败面）。机检件 = 批档单元测试档（随批留存）。

**关键决策**：

- **KD-841-1 落点 = 核导出统一解析 + `loadConfig` 取值切换**（非「核内实现 + 端面缝」）：VSC 回合面要槽复合（config 级函数吃不下）——若只在核内实现，VSC 需端面复刻链（正是被归一对象）。
- **KD-841-2 槽渠道 key 门入核**（统一序第 1 步「槽渠道（有 key）」）⇒ `applySession` 槽应用面同收（CLI ∥ 桌面共享）。
- **KD-841-3 状态 = config 级**（slot 不参与三态判定——会话槽是会话选择，不是「默认模型缺失」的证据）：槽改写「谁在跑」，不改「默认模型是否有效」。
- **KD-841-4 结构要件（`baseURL` 等）不并入回退序**：仍归 `validateProvider` 单判据（防第二判据）；入选渠道结构不全 ⇒ 落既有标记（`_providerInvalid`）⇒ 归**发送 ∕ 装配失败面**（`provider` 类词面照旧——非启动导引面）。

**边界（不做）**：改用户既有非空 `defaultModel` 的语义；静默兜底（U3 必带明示）；`env` 变量作密钥源；运行期 `/models` 探测；渠条目结构校验改判；发布链。

### 6.23 provider 密钥链守卫（保存单写原子 ∥ 缺钥前置守卫）

> **来源**：用户「都修了吧」= 快车道全链点火（live 实例：用户 `gemini` 条目无 `apiKey`）。本节 = 该机制**长期单源**。

**判据（定形）**：

1. **保存 = 单写原子 + 错误透传**：落条与设钥合并为**一次** `persistRaw`——同一 mutate 回调内 `push(entry)` 后**直接对 `entry` 引用置 `apiKey = (key || "").trim()`**（非空才置；不再二次读改写、不再按名重查）；
返回值 = 该单写的 `conflictError(r)`。语义保留：空 ∥ 全空白 `key` ⇒ 不落 `apiKey` 键；F5b 冲突 ⇒ 返回提示串且**零落盘**（条目 ∥ 钥俱不落——半状态不可达）；成功 ⇒ `null`。
**persistRaw 失败契约（实读 `config-io.mjs:59-99`）**：非 ok 返回的 reason **唯一** = `mtime-conflict`（`:79`——`conflictError` 恰此非空，`:97-99`）；其余失败（配置不可解析 `:70` ∥ 读/建目录/写盘异常——`:64` ∥ `:81` ∥ `:83` 抛出）**不经返回值**，走**异常通道**向调用面抛（`addProviderEntry` 不捕——沿现行）。
即「错误透传」= **冲突 + 异常两通道**；`conflictError(r) === null` 即 `r.ok === true`（返回 `null` 恒意味着盘面已落——成功回执不虚）。
消费面返回值语义（`null`=ok ∥ 串=err）**零改**：VSC `panel-messages-settings.mjs:72` ∥ 桌面 `thincoder-desktop/src/main/providers.mjs:145` ∥ CLI 流程面——`err` 含义 = 「俱未落」。
2. **缺钥 = 前置守卫**：核 `thincoder-core/provider/core.mjs` `chatImpl` 在 `resolveProviderSecrets`（`:122`）之后、格式分派之前**单点前置校验**——`apiKey`（trim 后）空 ⇒ 抛可读错误（前缀锁定 `API key missing for provider "<name>"`；尾句 = 配置指引）；
**零请求**（先于 rateGate ∥ 全部 fetch）。单点覆盖四 transport（openai ∥ anthropic ∥ google ∥ responses）+ 续写 ∕ advisor ∕ 子代理 ∕ consult 全链（`chat()` = 单一入口——`:78-84` 文档记载）。四档凭据位不各自加守卫（避四份判据）——由本守卫关闭该径。

**可机检断言形**（单元测试档）：

- ① 原子共落——临时配置路径缝（`_setConfigPathForTest`）；订阅 `onConfigSelfWrite` 逐拍快照 ⇒ 快照数**恰 1** ∧ 该拍盘面**同时**含条目与 `apiKey`（旧实现：write1 快照无钥 ∥ 两拍——红）。
- ② 键语义回归——`" sk "` ⇒ 落 trim 值；空 ∥ 全空白 ⇒ 无 `apiKey` 键。
- ③ 零请求——四 format 各喂无钥 provider + `globalThis.fetch` 计数桩 ⇒ `chat()` 拒且含 `API key missing for provider` ∧ fetch 调用数 **0**；全空白钥同判；有钥负控 ⇒ fetch 被调（守卫放行）。
- ④ 冲突支（核级真径注入）——`registerHooks` 假 `node:fs` 视图（唯 `config-io.mjs` 的 `statSync`——目标路径二阶读抬升 mtime）⇒ 真实「写前重 stat ≠ t0」分支：`addProviderEntry` ⇒ 返回 = `CONFIG_CONFLICT_HINT`（非 null）∧ `onConfigSelfWrite` 快照数 **0** ∧ 盘面**逐字节不变**（条目 ∥ 钥俱不落——注入前后全文相等）。

**关键决策**：

- **KD-PK-1 保存 = 单写原子**：两写非原子在结构上留半状态窗（条目落而钥丢）。
- **KD-PK-2 缺钥守卫 = `chatImpl` 单点**（非四 transport 各自守卫）：`chat()` = 全链唯一入口（含直调面）⇒ 单点覆盖；四份守卫 = 判据增殖 + 漏一档即复发。
- **KD-PK-3 缺钥拒 = 前置校验（可读错误 + 零请求）**：需求口径 = 「可读错误、零请求」；`?? ""` 径仍外发一请求，且错误就近依赖对端转述。

**边界（不做）**：钥加密存储 ∥ 密钥库（大改——批外）；`list-models` 探针缺钥语义（空钥 ⇒ 准入失败读数 = 既有设计）；`createProvider` 面合并；VSC ∥ 桌面消费面返回契约改动（单写后零改）。

**认账（无钥渠道）**：无钥渠道不可运行 = 设计态——**已认账行为变更，非缺陷**（方向 = §6.22「持 key」单一判据的先行化——`createProvider` 必填守卫先例同向）；先前无守卫时该径不拦（请求实发、凭据字面 `undefined`；忽略鉴权头的端点类此前可通——对端应答与否取决于对端）——该径由本守卫关闭；无鉴权端点如需保留 = 配非空占位钥（守卫只判 trim 非空）。

### 6.24 Gemini 思考签名透传（thought signature）

> **来源**：用户转述另端排查 +「开批吧，也自动跑。」。本节 = 该机制**长期单源**。

**先例（closest-precedent）**：thinking 回传缺口批（同点加字段）：承载面同为单构造点 `assistantToolCallMessage`（实现坐标 = `thincoder-core/model-specs.mjs:352`）；其设计档节 = `docs/core/design/CONTEXT-COMPACTION.md` §6.10 #9 ∥ §7 D-CC22。
**对齐** = 单构造点穿过、调用点零改；**偏离** ① 白名单构造（理由 = §7 D-PR37）· ② 原生路回带缓（理由 = §7 D-PR38）。

**问题（实证）**：Gemini 3 工具调用随带**思考签名**（thought signature——加密推理态；官方要求多轮工具链回带，缺 ⇒ 4xx）；本仓修前整链零捕获零回带 ⇒ 「调工具 → 回传 → 再请求」第 2 次请求必 400（`Function call is missing a thought_signature in functionCall parts`）。

- 双证 trace = `61ca071934e3-3364.jsonl` ∥ `-3366.jsonl`（本机 `~/.thincoder/traces/2026-10-10/`，00:31 / 00:33；链路 = 渠道 → 网关（10.0.0.5:8787）→ Google `v1beta/openai`）。
- 修前全仓三词零命中：`thought_signature` ∥ `thoughtSignature` ∥ `extra_content`。

**两形态字段位**：

| 形态 | 响应字段位 / 回带位 | 证据级 |
|---|---|---|
| OpenAI 兼容路（含网关链） | `tool_calls[].extra_content.google.thought_signature`（响应与回带同形） | 官方兼容页（「Gemini 3 supports OpenAI compatibility for thought signatures in chat completion APIs」）+ 社区实样 `"extra_content":{"google":{"thought_signature":"Ctke…"}}` |
| 原生路（`format:"google"`） | `functionCall` part 级 `thoughtSignature`（回带位同此；缓做，见边界） | 官方口径；本机无原生流样本 ⇒ **unverified** |

（本机 wire 未直存——trace 记录 = 解析后 toolCalls；捕获面以「在场才建」兜底：字段位不符 ⇒ 零副作用。）

**机制（三面 · 单点各一）**：

1. **捕获**——槽附加字段 `extra_content`（白名单构造 `{google:{thought_signature}}`，在场才建；白名单理由 = 只认官方实样路径，回显未知子字段会改变他家上游线形）：
   - OpenAI 兼容路 = `thincoder-core/provider/sse.mjs` `mergeToolCalls` 槽落定单点（四条槽路径 + 非 SSE JSON 兜底帧同经）；
   - 原生路 = `thincoder-core/provider/google.mjs` `parseGeminiStream` 的 `part.functionCall` 支；
   - 重试 / 续写合并保真 = `thincoder-core/provider/core.mjs` `mergeRetryToolCalls`（合并时缺则搬，首见胜）。
2. **承载**——`thincoder-core/model-specs.mjs` `assistantToolCallMessage`（工具轮 assistant 消息**单构造点**）的 tool_calls 映射：`extra_content` **在场才带**（缺 ⇒ 键不存在；调用点零改——构造单点穿过）。
3. **回传**——OpenAI 兼容路请求体 = `messages` 原样（`thincoder-core/provider/core.mjs` body 组装；净化链 `normalizeToolPairing` ∥ `escapeMessages` ∥ `stripLocalMessageFields` 均保 tc 字段）⇒ **零新增回传构造点**；网关层 `thincoder-server` 请求体展开透传 + 响应字节零改中继（`src/gateway/forward.mjs`）⇒ **网关零改**。

**零回归判据**：捕获与携带**均以在场为条件**——无签名上游的槽 / 消息键集逐字不变（他家 provider 零变更）。

**认账（跨 provider 携带）**：签名随历史走——会话切到非 Gemini 渠道时该字段同行（同 `reasoning_content` 携带族）；**不做**发送面按 host / format 剥离（用户链过网关 → Google，host 判别不可靠，且剥离会杀掉要保的字段）。

**残余（修复前历史）**：修复前落盘、含无签名工具调用的会话——重发时其史形仍无签名（回传面零改），仍可能落同一 400（服务端对既有无签名史形的容忍度 = 无读数）；缓解径 = `/compact` ∥ 新会话。

**边界（不做）**：**原生路回带**不在射程——原生路 `convertMessages` 现不复建 functionCall parts（工具轮历史压平为文本）⇒ 触不到本 400；补建 = 另一机制（functionCall / functionResponse 史形 + 修复前历史无签名 ⇒ 直接补发反引新 400），另议。规格表 / 预设表 / 三端 UI / 服务器快照零涉。

**可机检断言**（单元测试档）：① 捕获——合成帧喂 `readSSE` ⇒ 槽含签名字段（原生路经 `google.mjs` `chat()` + fetch 桩同判）；② 承载——`assistantToolCallMessage` 直调：有 ⇒ 键在场逐字同值 ∥ 无 ⇒ 键不存在；③ 零回归——无签名字段帧 ⇒ 槽 / 消息键集与批前逐字同形。

### 6.25 派生渠道条目（团队登录——`derived` 标记）

> **来源**：需求 §2:31 + AC-31；机制全文（登录/退出流程 ∥ 配置形 ∥ 三端同构）= `docs/core/design/TEAM.md` §2（本档只收**条目面语义**）。

- **条目形**：`{ name:"team", baseURL:"<server>/v1", apiKey:"<token>", derived:true }`——固定名 `team` ∥ 字段 `derived: true` = 「派生」标记（登录写入 / 退出保留）。
- **写面**：唯一写者 = `thincoder-core/team.mjs`（登录 upsert（有则更新 ∥ 无则**追加表尾**——不劫持既有回退序）∥ 退出摘 `apiKey`）；端侧零自写盘；迁移面零改（`thincoder-core/config-migrate.mjs:48-51` 只删 `model`/`models`——未知字段不剥离）。
- **运行时语义**：无 `apiKey` ⇒ 不参与解析（`hasKey` 既有判据——持 key 判据单源 = §6.22；零新代码 ∥ 不触发「渠道无效」明示——回退序跳过）。
- **列表/候选面**：`derived === true` ∧ 无 key ⇒ 隐藏（四消费面各一处过滤——CLI 模型候选 ∥ CLI provider-admin ∥ VSC `providerStatus` ∥ 桌面 `providerList`；登录态下在场（key 掩码显示））。
- **边界**：不改 `defaultModel` ∥ 不切换会话模型 ∥ 不动手工条目；同名手工条目 ⇒ 登录不覆盖（提示——`TEAM.md` §2.2）。

### 6.26 图片拒绝自愈（data URL 入史 · 400 零自愈）

> **来源**：用户报障「发图后会话烧死——此后每回合 400、零自愈」+「都自动跑到交付吧」（全链自动授权）；需求锚 = `docs/core/requirements/PROVIDER.md` §4.7（`:164`）/ **R23**（`:172`——图像语义 400 ⇒ 全剥 + 机读注记 + 单次重发 + 落账）；支撑锚 = R11（`:81`——`read_image` 门放行，放行语义须含「不被图片反噬」）。

**四环终形（逐环处置句）**：① 注入 = **维持**（图进上下文 = 本功能本体；15MB 单图闸 ∥ 32MB 累计闸既有，零改）；② 发送面 = **维持 + 增设拒绝剥除原语**（不新增单图级预判——无错因先剥 = 正常图白丢；错因判定下移到 ③）；③ 400 = **图像语义 400 ⇒ 全剥 + 单次重发 + 注记 + 落账**（T1/T2 见下）；④ 兜底 = **不纳入**（压缩 / 降级两件零改——判由 = D-PR40）。

**机制（终形）——拒绝自愈（rejection heal）**：

1. **触发（两判据，一处判定）**——判定点 = agent 层单回合模型调用 `thincoder-core/agent/chat-call.mjs` `callModelTurn` 的 catch 支（全 depth 同径）：
   - **T1 图像语义**：`error.message` 提取状态码 = **HTTP 400**（技法同 T2——`/LLM API error 4\d\d:/` 族取码、届定 400；构造位 = `thincoder-core/provider/core.mjs:416`）∧ 命中图像语义词表（`looksLikeImageRejection`——机制单源 = `thincoder-core/provider/errors.mjs`）∧ `agent.history` 含 image part；
   - **T2 结构兜底**（防网关文案不在词表内）：本回合错误匹配 `/LLM API error 4\d\d:/`（429 除外——限速归 provider 重试族；构造位 = `thincoder-core/provider/core.mjs:416`）∧ 上一回合同类失败（streak ≥ 1——语义见下）∧ `agent.history` 含 image part。
   - **streak 语义（收口——`agent._imageFailStreak` 记账单源 = `image-heal.mjs`）**：自增 = 本回合失败 ∧ `error.message` 匹配 `/LLM API error 4\d\d:/`（429 除外）∧ 非 Abort；清零 = 任一次成功调用（调用点 = `chat-call.mjs` 成功路径 `clearImageFailStreak`）；Abort 类失败豁免（既不自增也不清零）；判定先后 = T2 读本回合自增前值（首撞 0 ⇒ 不触；连败 ≥ 1 ⇒ 触）。
   - **413 等非 400 图像词错误**：首撞 ⇒ 不触 T1（照抛——D-PR32 指引径原样保留）；复撞（streak ≥ 1）⇒ 走 T2 自愈。
2. **剥除（历史本体，一次全剥）**：`stripRejectedImages(agent.history)`（`thincoder-core/provider/normalize.mjs`）——全部 image part 原位换 `IMAGE_REJECTED_PLACEHOLDER`（逐字见下）；copy-on-write（两线共享消息对象——人读线 `_fullHistory` 内图**不动**，仅机读线剥除）。**全剥而非只剥最新**：单图归因信息不存在（错误文本不点图）；「模型声明多模态但实际拒图」一类只有全剥才愈（只剥最新 ⇒ 二连败）。
3. **注记（人话落账）**：机读线追加 `[System reminder: …]`（逐字见下）——模型知晓图已移除 + 复合指令（需图时降尺寸重读；向用户言明哪张被移除）；落账事件 `logEvent("llm:image-heal", { dropped, streak, model })`。
4. **重发（一次，非重试）**：重建 messages（`[system, ...agent.history]`）后 `chat()` 再发一次——成功 ⇒ 回合继续（会话已自愈：历史无图，后续回合不再重发毒图）；再败 ⇒ **新错照抛**（不循环、不二次剥除）。
5. **循环保护**：剥除后历史无图 ⇒ 两判据自熄（不需额外闩）；每失败回合至多一次剥除 + 一次重发。

**逐字文本（两件——实现照抄）**：

- `IMAGE_REJECTED_PLACEHOLDER`（占位，逐图替换）：
  `[image omitted — the provider rejected the image payload; dropped from history so the session can continue. Re-read a smaller copy if the image is still needed.]`
- 机读注记（history 追加，`{ role:"user", content: … }`；N = 剥除数）：
  `[System reminder: the provider rejected the image payload (HTTP 4xx) — N image(s) were dropped from the context so the session can continue; the request was re-sent. Re-read a downscaled copy with read_image if still needed, and tell the user which image(s) were dropped.]`

**先例对照（closest-precedent）**：

- **先例 A** = 同档 §6.24（Gemini 思考签名）——同族病症：「发送面 / 历史形态不合规 ⇒ 400 立抛 ⇒ 毒物留在历史里重发」。**对齐** = 处置落「历史本体的持久修正」；**偏离** = 签名批改构造点（单点加字段），本面改剥除 + agent 层单次重发（零新构造点）。
- **先例 B** = 同档 §6.7 D-PR32 历史图片字节预算（`capHistoryImages`——注入面 ∥ 发送面同函数）：**对齐** = 复用同一替换核、同函数族落点（`normalize.mjs`）；**偏离** = 触发面不同（字节剂量 vs 服务端拒绝）、处置面不同（最老先驱逐至阈值 vs 一次全剥）。
- **先例 C** = 同档 §6.3 D-PR8 续写 400 可见（`_warnings` 注入）：**对齐** = 失败可见、不静默吞；**偏离** = 该先例重试**同请求**，本条须**先修载荷再重发**（同请求重发对图像拒绝恒无效）。

**接口契约（核内符号——落点四档）**：

| 符号 | 落点 | 语义 |
|---|---|---|
| `IMAGE_REJECTION_RE` ∥ `looksLikeImageRejection(text)` | `thincoder-core/provider/errors.mjs`（分类族单源——与 `isNonRetryableError` / `classifyResponsesErrorCode` 同族） | 纯函数：文本命中 `/image|图片|图像|视觉|vision|multimodal/i` ⇒ true（词表可扩 = 常量，一处改） |
| `IMAGE_REJECTED_PLACEHOLDER` ∥ `stripRejectedImages(messages)` | `thincoder-core/provider/normalize.mjs`（与 `capHistoryImages` 同族） | 全图剥除；copy-on-write（无图 ⇒ 原引用返回）；与 `capHistoryImages` 共用同一替换核（后者增 `placeholder` 参——缺省 = 原占位逐字零变） |
| `healImageRejection(agent, error)` | `thincoder-core/agent/image-heal.mjs`（拟新增——新档：判定 ∥ 剥除 ∥ 注记 ∥ streak 记账单源 ∥ 清零接口 `clearImageFailStreak`） | 返回 `{ healed, dropped }`；零抛（失败面不阻断回合驱动） |
| catch 接线（判定 → 剥除 → 单次重发） | `thincoder-core/agent/chat-call.mjs` `callModelTurn` | AbortError 分支零改（先于本支）；成功路径调 `clearImageFailStreak`（清零调用点——记账单源 = heal 档） |

**受影响文件清单（行数口径 = `wc -l`）**：

| # | 文件 | 现量 | Δ | 动作 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/image-heal.mjs`（**已落**） | 0 | **+65** | 新档（判定 ∥ 剥除 ∥ 注记 ∥ 记账） |
| 2 | `thincoder-core/agent/chat-call.mjs` | 68 | **+13** | catch 自愈接线 + 单次重发 + streak 清账 |
| 3 | `thincoder-core/provider/normalize.mjs` | 138 | **+30** | 占位常量 + `stripRejectedImages` + `capHistoryImages` 占位参 |
| 4 | `thincoder-core/provider/errors.mjs` | 126 | **+8** | `IMAGE_REJECTION_RE` + `looksLikeImageRejection` |
| 5 | 批内单元测试档（**已落**） | 0 | **+288** | 批内单元档（用例见下） |

**零改面（显式）**：`record-results.mjs`（注入面——图必须进上下文；15MB 单图闸 ∥ 32MB 累计闸既有）· `context.mjs` / `context-degrade.mjs`（两兜底面——零改，见 D-PR40）· `thincoder-core/provider/core.mjs`（重试族零改）· 规格表 / 预设 / 三端 UI（零触）。

**用例表（批内档——正常 / 边界 / 错误）**：

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| T-1 | 正常 | `looksLikeImageRejection` 喂样本：`image exceeds 5 MB maximum` ∥ `unsupported image format` ∥ `Invalid 'messages[1].content[0].image_url'` ∥ `图片格式不支持` ∥ `图像过大` | 全 true；反样本（`context_length_exceeded` ∥ `invalid tool schema` ∥ `余额不足`）全 false |
| T-2 | 正常 | history 含 2 图 + T1 错 ⇒ `healImageRejection` | healed=true；image part 归零（全数换占位）；**原文本 part 逐字保留**；条数：剥除前后不变、注记另计 +1；注记在场；`dropped=2` |
| T-3 | 边界 | 文本无图像语义 ∧ 图在场 ∧ streak=0 | healed=false；history **逐条 deepEqual 不变**；原错照抛 |
| T-4 | 边界 | 图像语义文本 ∧ history 零图 | healed=false；零动作 |
| T-5 | 边界 | 重复兜底：streak=1 + `LLM API error 400: invalid request`（无图像词）∧ 图在场 | healed=true（T2 生效） |
| T-6 | 边界 | 剥除后同错二发（history 已无图） | healed=false（自熄——无重试风暴） |
| T-7 | 错误 | 剥除 + 重发再败 | 新错照抛；history 保持已剥除态；**不二次剥除** |
| T-8 | 错误 | 人读线零损：剥除后 `_fullHistory` 内 message 对象仍携 image（copy-on-write） | 真值断言 |
| W-1 | 接线 | 本地假服务端（`node:http`：首请求 400 + 图像语义；次请求 SSE 200）直驱 `callModelTurn` | 请求计数 = 2；第二次请求体无 image part；回合返回成功 |
| T-9 | 边界 | `capHistoryImages(messages)` 全缺省参（合成 > 32MB 图 part 触发驱逐） | 输出占位逐字 = 批前 `IMAGE_BUDGET_PLACEHOLDER` 字面（`[image omitted — dropped to keep the request under the history image budget]`）——新增参缺省零扰 |
| T-10 | 边界 | 413 图像词（`LLM API error 413: …remove historical images`）∧ 图在场——首撞（streak=0）∥ 复撞（streak=1） | 首撞：healed=false ∧ `_imageFailStreak` 自增 1（照抛——D-PR32 指引径原样）；复撞：healed=true（T2 生效） |

**验收标准（逐条回指——可机检；cwd = `D:\teamcode\thincoder`）**：

| # | 验收 | 回指 | 机检 |
|---|---|---|---|
| AC-1 | 图像语义 400 ⇒ 全图剥除 + 单次重发（会话自愈） | 本单环③ ∥ R23 ①（`:172`） | 批内单元档 T-2 ∥ W-1 绿 |
| AC-2 | 剥除只动机读线；人读线（`_fullHistory`）图零损 | 本单环① ∥ R23 本体（`:172`——copy-on-write） | T-8 绿 |
| AC-3 | 非图像错误零误伤（history 不变、原错照抛） | 本单环③ ∥ R23 ②（`:172`） | T-3 绿 + T-1 反样本绿 |
| AC-4 | 无重试风暴（每失败回合至多一次剥除 + 一次重发；剥除后自熄） | 本单环③ ∥ R23 ③（`:172`） | T-6 绿 ∥ W-1 请求计数 = 2 |
| AC-5 | R11 零回归：多模态放行 ∥ 32MB 累计驱逐 ∥ 15MB 单图闸判据逐字不变 | R23 ④（`:172`）∥ R11（`:81`——支撑锚） | T-9 绿（`capHistoryImages` 缺省参输出逐字断言）+ `git diff -U0 thincoder-core/provider/normalize.mjs` 检读：判据行零触及（`:14` 值 ∥ `:49` 驱逐 ∥ `:79` 多模态放行）∧ `git diff --stat` 无 `thincoder-core/tools/file.mjs`（15MB 闸 `:148`/`:173`） |
| AC-6 | 兜底面零改（compaction ∥ degrade 不触） | 本单环④ ∥ R23 ⑤（`:172`） | `git diff --stat` 无 `context.mjs` ∥ `context-degrade.mjs` |

**关键决策**：D-PR39 ∥ D-PR40（§7）。

**边界（不做）**：

- **用户侧主动知会**（端侧 live 提示 / 回调面）= 不立——知会形 = 机读注记（模型转述）+ `llm:image-heal` 落账；端侧若需主动提示，另立小节（新回调 = 三端面，超射程）。
- **压缩摘要调用携带中段图的场景**（阈值触达 ∧ 中段含图 ⇒ 摘要请求可能同拒）= 既有 3 连败降级兜底（丢中段）承接——零改。
- **图持久化体积**（session 落盘随图膨胀）∥ **请求体总量**（网络层）——不同问题域，不在射程。
- **引擎级图降尺寸**（自动 resize）= 未立（零第三方依赖约束下无图像处理管线；指引形 = 注记内「re-read a smaller copy」）。

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-PR1 | 能力差异全部走**规格表** | 新模型只加一行 spec，transport / 续写 / thinking 全自动适配；未知模型保守 `DEFAULT_SPEC` + warn once |
| D-PR2 | **实测 usage 优先于估算** | 估算对 CJK 低估 3–4x；实测值锚定压缩判定与 TPM 记账 |
| D-PR3 | **发送前净化而非改历史** | 历史是模型上下文真相；净化只作用于线上载荷、可逆 |
| D-PR4 | 429 **双通道**（闸门 + 退避） | 闸门防患于未然，退避兜底（未配置预算也安全） |
| D-PR5 | 流规则 abort 后**重试**（注入提醒让模型自修正） | 比事后清洗更可靠——内容合规是硬需求 |
| D-PR6 | 超时拆两段（响应头 `fetchTimeoutMs` + body 读侧空闲 `READ_IDLE_MS`） | 原绝对墙钟 600s 会把长上下文子代理腰斩；废弃绝对墙钟 |
| D-PR7 | prefix 续写**精简历史**（过滤工具链消息，保留最近 8 条非工具文本） | 网关约束的直接解法 |
| D-PR8 | 续写 400 **失败可见**（注入 `_warnings`，不静默吞） | 静默吞 = 长回合期间 deepseek 直接报错飞出的表象源 |
| D-PR9 | **escape v5 双层**（发送前 sanitize + 源头 safeSliceUTF16） | 孤立代理是 400 根因；只做一层会在其他截断点复发 |
| D-PR10 | provider 级 context 覆盖 = **拷贝覆盖**（不污染共享 spec） | 同一模型不同端点上下文不同 |
| D-PR11 | `models[]` 候选清单**整字段退场** | 人工清单与端点真实清单必然漂移——保留即留第二个来源 |
| D-PR12 | 渠道**单值默认模型退场**（`providers[].model` ∥ 预置 `model` 全删） | 渠道不是模型选择单位：单值 = 第二真源（与 `defaultModel` 并存必漂移）+ 自我复制口（保存径把单值写回全局）；三用途替代 = 零播种 ∕ 明示未设置 ∕ 显示 `baseURL` |
| D-PR13 | 显式 `p:m` **一律放行**（含候选外 / 多冒号） | 「候选外二次确认 / `--force`」是给白名单开后门；`ollama:llama3:70b` 式名可用 |
| D-PR14 | spec 来源走**新增 `specMatch`**（与 `specForModel` 共享实现） | 热路径零变 + 单次查表 + 信息完整 |
| D-PR15 | 清单拉取 = **会话缓存 + TTL 60s**（失败不缓存） | 连续操作不重复付网络 |
| D-PR16 | 渠道准入判据 = **`/models` 可用**（适用面 = **模型候选面**）；执行层 = **配置阶段**（运行期不加闸） | 不支持 / 拉不到的渠道 = 不可用渠道（候选面语义——探通 ⇒ 候选可选；探不通 ⇒ 不可选）；**添加表单不设 model 输入件**（渠道条目不携模型——单值模型退场；模型选择 = 候选面 ∥ 命令面 `provider:model`；探不通 ⇒ 渠道标 `不可用`）；运行期加闸引入启动期网络依赖与延迟（与「不阻塞会话切换」冲突） |
| D-PR17 | 候选列表**不过滤非对话模型** | 拉取面忠实呈现 provider 事实；跨 format 无统一能力字段；过滤规则会成第二个人工清单 |
| D-PR18 | 未命中处置 = **保持当前选择**（显示 = 会话槽复合 + 零写槽 post） | 与 CLI 会话值优先对位同源；零写槽 = 零静默改写 |
| D-PR19 | 退役 / 限期名**保留独立行**（不删、不做按日期切换规格的运行期机制） | 删行 → 旧配置降 `DEFAULT_SPEC`；静态表 + 行注释 = 零新机制 |
| D-PR20 | `deepseek-v4-pro` **不预支视觉**（字段零改 + 注释） | 视觉能力未核实——预支的硬失败风险不排除（400 中毒）；保守 = 无硬失败 |
| D-PR21 | 请求头展开形态 = **各点内联**（与既有形态同形） | 零新机制、可 grep 逐一核对 |
| D-PR22 | 覆盖语义 = **内置头胜出**（定制头在前） | 对齐既有语义 + 安全（认证 / 内容类型不可被 headers 劫持） |
| D-PR23 | `resolveEnableThinking` 白名单**双条件**（模型前缀 + 百炼 host） | `enable_thinking` 是百炼扩展参数——全局发送会污染 kimi / glm / 自定义端点 |
| D-PR24 | Responses 链 = **单 turn + host 白名单驱动** | DeepSeek 静默忽略 = 无声丢上下文（比 404 危险）；跨 turn 重建把边界划在最稳点 |
| D-PR25 | qwen-plan 渠道名 `deepseek-v4.1-flash` **加行对齐** `deepseek-flash`（不引入查表机制改造） | 该名可得（GET /models 含该名 · chat 200）；前缀不相交（第 12 位 `.` 与 `-` 互不为前缀）⇒ 互不 shadow：新行全名命中新行、`deepseek-v4-flash`(-0731) 仍命中退役行——单一 prefix 表零机制变更；排序交由既有 SORTED_SPECS 长度降序（与本条无关） |
| D-PR26 | 贴图降级返回形态 = **文本描述替换 images**（不动主模型载荷） | 与现机制完全兼容（无图污染） |
| D-PR27 | 降级窗 Stop = **启动即中止**（零新增布尔状态） | Stop 在窗内必须有效；stopped 判定 = signal.aborted；唯一新字段 = panel._visionAbort（窗生命周期） |
| D-PR28 | onWait 相位 → 状态文案 = **核内单源映射**（`provider/wait-status.mjs`；`kind` 词表与 VSC 面同名，渲染走 `t("status.*")`） | 相位值域在发射侧收敛而消费侧各自枚举 ⇒ 缺支落兜底：TUI `tool-events.mjs:409` / headless `bin/thincoder.mjs:189-191` 的兜底分支读 `seconds`，而 `warn`（`rate.mjs:96,110`——`estimated > tpm` 即发）与 `quota` **无 `seconds`** ⇒ 渲染 `retry in undefineds` 且 `warn` 被误标 429 |
| D-PR29 | 准入探针失败 = **落账分类**（`failure ∈ {timeout, malformed, hostBusy}` + `ts`），**渠道文案**（`channelUnavailableMessage`）零改 | 「探不通」单态无法区分渠道故障 vs 宿主繁忙——分类是重试闸的判据来源；**零改面 = `channelUnavailableMessage` 本体**（逐字不动 ⇒ 该文案面 UI 契约零变）；**展示面其余 = 状态词级分档**（`不可用` ⇔ timeout / malformed · `宿主繁忙` ⇔ hostBusy + 抑制渠道 hint）——端侧详面 = `docs/vsc/design/SETTINGS.md` §2.12（本档不重述） |
| D-PR30 | 重试驱动力 = **采样器闸**（窗口内单批 ≤ 2 次 + 在飞去重；loop 忙时不重试），非 UI 事件 | 探针不得由前台动作隐式触发（运行期零探测纪律）；获焦重探无消息面（`webview` 无 focus 上报）⇒ 引入 = 新事件依赖 |
| D-PR31 | SSE **帧形状守卫** = message 快照帧前缀补差 ∥ tool_calls 覆盖（只对 `delta == null` 帧生效） | MiniMax v2 端点二次追加（`choice.delta ?? choice.message` 把完整快照当增量 `+=`）——纯增量帧去重会误吞真实重复文本（连续标点）。 |
| D-PR32 | 历史图片 = **累计字节预算 + 最老先驱逐**（发送前副本面 + 注入时 history 本体面同函数）；413 错误文本带处置指引 | 固定 2000 token/图计账不约束字节；15MB 单图上限不约束累积 ⇒ 长会话 413 且卡死。 |
| D-PR33 | 直连 fetch 断流 = **内部 abort 通道**（`IDLE_ABORT`；`terminateBody` 分流） | 读侧 120s 看门狗对 web `ReadableStream` 静默失效（U-CG-1）；**建设点 = `proxyFetch` 直连分支单点**（provider 请求出口拓扑——覆盖 `readSSE` ∥ `parseGeminiStream` 两条流式直连链）；机制单源 = `doc:PROXY.md:§2` / D-PX8（本档只指针）。 |
| D-PR34 | responses 流内 error 帧 = **错误上抛 + partial 抢救双支**（分界判据 = 是否已有流出；帧两形同处置） | error 帧 = 本回合响应已死：`_warnings`-only 会让空内容当正常交付（恰是被修的静默形态）、`interrupted` 形挪用用户中断专用语义；已有流出 ⇒ partial 同构 `sse.mjs` ∥ `google.mjs` 网络部分出口，消费面 `thincoder-core/provider/core.mjs:242-247` 既有，agent 层零改。 |
| D-PR35 | `body.error.code` 映射 = **最小集五码**（宿主 errors.mjs 分类族单源）；未列码 `null` 透传 | 只映射 responses 面实际会出现的码（勿整抄 codex 全表——`usage_not_included` 为 ChatGPT 订阅语境特有）；未列码不发明分类（服务端消息原样透传）；HTTP 级分类零改（码级映射只服务流内错误面）。 |
| D-PR36 | `max_output_tokens` = **显式才发**（`spec.maxOutput` 退出发送面，内部用途保留） | 参考面双例均显式才发（opencode / codex）；本仓同病（opencode-go-anthropic 超渠道口径）；规格值非渠道合同值（`DEFAULT_SPEC` 类保守猜测）。回退形态预置 + 真机验证项在册。 |
| D-PR37 | 思考签名承载 = **白名单字段 `extra_content.google.thought_signature`** ∥ **单构造点穿过**（`assistantToolCallMessage`）∥ 发送面零新构造点 | 白名单（非原样透带整个 `extra_content`）：只认官方实样路径——回显未知子字段会改变他家上游线形；单点穿过 = 既有唯一构造点（先例 = 同点加字段）。 |
| D-PR38 | **原生路回带**（functionCall parts 复建）= 边界外（捕获在位 · 回带缓） | 原生路现不复建 functionCall parts（工具轮历史压平为文本）⇒ 不触本 400；补建 = 新机制（functionResponse 配对 + 修复前历史无签名 ⇒ 直接补发反引新 400）。 |
| D-PR39 | 图片拒绝自愈 = **agent 层全剥 + 单次重发**（T1 图像语义 ∥ T2 同态重复；copy-on-write 只动机读线） | 四环缺一即烧死（图进史 ⇒ 400 立抛 ⇒ 毒图留场 ⇒ 每回合重发、零自愈）；自愈须持久改史 ⇒ 不能住净化面（D-PR3 契约：净化只改副本、可逆；副本面改不了历史）。 |
| D-PR40 | 兜底面（压缩 ∥ 降级）**零改**；用户知会 = 机读注记（模型转述）+ `llm:image-heal` 落账；端侧主动提示不立 | 压缩只跟 token 阈值走（与「剂量无关的拒绝」不同域——阈值不触 ⇒ 不愈）；降级面只触 `role:"tool"` / string 内容（图消息不在判据内）。 |
