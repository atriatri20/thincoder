# 供应商与模型（PROVIDER）· 需求

> 设计 = `docs/core/design/PROVIDER.md`；预算 = `CONTEXT-COMPACTION.md`；超时 = `TIMEOUT-DIGEST.md`。

## 1. 统一调用

chat/createProvider 对 OpenAI 兼容、Anthropic、Google、Responses 提供统一结果与错误语义。模型能力由核规格与运行时信息决定，不由端壳复制。

## 2. 请求与错误

- 支持流式内容、reasoning、tool_calls、usage、finishReason、中断和 partial。
- 重试、退避、超时、限流和 AbortError 语义统一且可中断。
- 400 等业务拒绝不能静默改成成功；仅当前图像与越窗自愈有显式一次重发。
- list-models 网络/HTTP/解析失败明确报错，不返回伪空清单。
- 缺 API key 在发送前失败，零请求。
- onWait 的 gate/retry/overloaded/warn/quota 由核映射，未知或缺值不显示伪文案。

## 3. 模型选择

- 候选来自运行期 /models；providers[].models 与 providers[].model 不是当前选择源。
- defaultModel 使用 provider:model；显式合法复合值不要求出现在候选里。
- 会话槽选择优先于默认；无有效默认时可运行回退必须明示。
- 候选未命中不静默改变当前选择。
- 配置迁移保留凭据与 defaultModel，清理旧模型字段。

## 4. 规格与窗口

- 静态查表按模型名最后一个 `/` 段、大小写不敏感和当前前缀规则。
- modelContext 与列表 id 按末段相等，不向同族长名发散。
- 上下文优先级：modelContext[K] → 旧 provider.context[K] → 列表自报 token → 静态表 → DEFAULT_SPEC。
- 列表字段兼容 context_window/context_length/max_model_len。
- 非法值落下一层；异常大值照用并告警，不静默截断。
- modelContext 的写、清、显示在各端设置 UI 可用，单位统一 K。

## 5. 请求头

- providers[].headers 铺到当前聊天、模型清单和标题等相关通路，内置协议头优先。
- User-Agent = ThinCoder/<surface>/<version>，由宿主启动注入，渠道不可覆盖。
- ${sessionId} 在请求装配时替换为进程会话实例 id；未声明该模板不新增头。
- 凭据和敏感配置不进入日志。

## 6. 图像与工具回放

非视觉模型发送前按当前规则处理图像。图像语义拒绝可全剥、注记并重发一次；人读记录不改。

Anthropic 等原生适配保持 tool_use/tool_result 配对，重开会话后能继续工具对话。Gemini thought signature 在当前支持路径捕获并回带。

Google 原生回放将 assistant `tool_calls` 转为 model 角色的 `functionCall`，将 tool 消息转为 user 角色的 `functionResponse`；结果名优先取工具消息 `name`，旧记录缺失时按当前调用 id 约定恢复。两者都无法提供合法名称时明确报错。每个调用的 `extra_content.google.thought_signature` 回带为对应 part 的 `thoughtSignature`，连续同角色内容沿用既有合并规则。

## 7. 验收

验证各 transport、流帧、配对、错误分类、无 key、窗口五层、模型放行、列表失败、请求头、图像自愈和跨端一致性。具体模型能力以当前一手来源与实测为准。
