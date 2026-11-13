# 供应商与模型（PROVIDER）· 设计

> 需求 = `docs/core/requirements/PROVIDER.md`。
> 最近先例：`CONTEXT-COMPACTION.md` 的请求预算与 `TIMEOUT-DIGEST.md` 的分窗。对齐 = 单点装配、同源规格。
> 勘察证据：已读 chat、retry、模型清单、窗口链、请求头、wait 与凭证守卫。相关 = 当前统一 core 面。

## 1. 模块

provider/core.mjs 编排；sse.mjs 读 OpenAI 流；anthropic/google/responses 是原生 transport；errors/retry/rate/normalize 负责共享规则；model-specs/model-context 负责规格；list-models 拉取候选。

统一返回 content、reasoning、toolCalls、usage、finishReason 与当前警告/中断/partial 字段。

## 2. chat 流程

1. providerSpec 取预算与能力。
2. 净化本地字段、图像与工具配对。
3. 校验密钥并分派 format。
4. 组请求体、rateGate、requestWithRetry。
5. 读流并修正 usage。
6. 处理中断/partial、过载与当前续写。
7. 返回统一结果。

压缩、越窗与图像自愈按各自显式路径，不进入普通 400 重试。

## 3. 重试与超时

`provider/retry.mjs` 的 `requestWithRetry` 与 OpenAI 主链共用状态集、次数、退避和 Retry-After 语义。流已经产出后的续写与过载处理不属于这里的 HTTP 建连重试。

### 3.1 可重试输入与停止条件

- 可重试 HTTP 状态固定为 408、409、425、429、500、502、503、504。
- `request()` 抛出的非 AbortError 异常进入重试；AbortError 立即透传，不消耗后续尝试。
- 401、403 立即失败。其他 4xx 除 429 和上述可重试状态外立即失败，未列入的其余响应状态也直接抛错。
- 429 先经 `isNonRetryableError` 判断余额、计费或配额语义；命中后立即失败并发出 quota 等待相，不按限流重试。
- `response.ok` 立即返回。达到尝试上限后抛出带 attempts、最近状态与可用 cause 的错误，不再等待。

### 3.2 次数与普通退避

`MAX_RETRIES=3`，缺省 `maxAttempts=MAX_RETRIES+1`，因此总计 4 次尝试，即首次请求加 3 次重试。调用方可用 maxAttempts 覆盖次数。

前一次不是 429 时，第 2、3、4 次尝试前分别等待 1、2、4 秒，公式为 `2 ** (attempt - 1) * 1000`。429 已在当次响应后按 Retry-After 规则等待，下一次循环不叠加这组指数等待。

### 3.3 Retry-After

`parseRetryAfter` 接受非负秒数或 HTTP-date。合法正等待时间以 300 秒为上界；日期按当前时间换算，负等待截为 0。

头缺失、无法解析或换算后不大于 0 时，按本次请求内 rateLimitHits 依次回退到 15、30、60 秒；超过三档后仍用 60 秒。只有还有后续尝试时才等待并发出 retry 相，秒数向上取整。

### 3.4 中断与超时

`sleepInterruptible` 在 signal 已 aborted 时立即抛出 provider/sleep 来源的中断；等待期间 abort 也立即拒绝并移除监听器。无 signal 时使用共享 sleep hook。

头阶段使用 fetchTimeoutMs；body 首 chunk 与流中途按 TIMEOUT-DIGEST 分窗。abortInfo 保留真实来源。

## 4. 流与适配

readSSE 处理增量、完整快照、usage、畸形 tool calls 和中断。snapshot 内容按前缀补差，tool call 槽不重复追加。

Anthropic 转换 system、tool_use/tool_result；Google 映射 role、inlineData、thought 与 functionCall；Responses 处理 error 帧和当前 max_output_tokens 规则。

normalizeToolPairing 修 owner 顺序与孤儿；escapeMessages 清孤立代理。净化只改线上载荷，不改人读史。

## 5. 规格

MODEL_SPECS 声明 context/maxOutput/thinking/续写/multimodal/reasoningEcho/effort 等当前能力。

lookupSpec 取末段、小写并按当前前缀匹配；specMatch 暴露是否命中。未知模型使用 DEFAULT_SPEC 并告警。

## 6. 上下文五层

providerSpecResolution 依次读取：

1. modelContext 的模型级 K 值。
2. 旧 provider.context 的 K 值。
3. listModels 缓存的 token 值。
4. 静态表 token 值。
5. DEFAULT_SPEC。

listModels 在既有成功拉取后按归一 baseURL 整条替换缓存；失败不清旧缓存。providerSpec 保持同步，未命中落下一层。

formatDeclaredContextK 统一 K/M 展示。异常值用当前阈值告警但照用。

## 7. 模型选择

resolveProviderPlan({providers,defaultModel,slot}) 返回 state/source/channel/model/provider/reason。

渠道顺序：有 key 的槽渠道 → defaultModel 渠道 → 首个有 key 渠道。模型顺序：槽模型 → 同渠 defaultModel → null。

state=ok/fallback/invalid。fallback 必须明示，invalid 给配置引导。无 name 的条目在装载时过滤并记录 providersDropped，不改写原配置。

/model 打开时 reloadProviders 重读盘面，按 name 保留会话态；读失败明确报错，不拿旧表冒充现况。

## 8. 请求头

withUserAgent 先移除任何大小写 user-agent，再写 ThinCoder/<surface>/<version>。setClientIdentity 由端启动调用。

最终头 = withUserAgent(provider.headers) 后叠内置协议头。${sessionId} 在每次请求时由 getSessionId 替换。

该装配覆盖当前 chat、Responses、Anthropic、Google、标题和模型清单等通路。

## 9. onWait 与凭证

waitStatusOf/waitStatusText 把 gate/retry/overloaded/quota 映射到核 i18n。warn、未知或缺秒返回 null。

addProviderEntry 在一次 persistRaw 中同时写条目与 key。chatImpl 在 resolve secrets 后、分派前拒绝空 key。

## 10. 图像与签名

stripImagesForTextModel 与 capHistoryImages 只处理请求副本。图像拒绝自愈用 stripRejectedImages、机读注记、llm:image-heal 和一次重发。

Google `convertMessages` 在保留文本和图像投影的同时，将 assistant `tool_calls` 转为 `functionCall`，将 tool 消息转为 `functionResponse`。工具结果不再经过普通文本 part；`functionResponse.response` 使用 `{ result: <工具文本> }`。结果名优先取消息 `name`，旧记录缺失时从调用 id 移除当前 Google 生成的序号后缀；两者都无法提供合法名称时明确报错。连续同角色内容仍由同一出口合并。

`parseGeminiStream` 把响应 part 的 `thoughtSignature` 保存到 `extra_content.google.thought_signature`；`convertMessages` 在对应调用 part 回带 `thoughtSignature`，无签名时不新增字段。

## 11. 验证

使用本地假端点验证四种 format、流与工具配对、重试负例、窗口五层、配置重读、请求头、缺钥零请求、wait 映射和图像一次自愈。
