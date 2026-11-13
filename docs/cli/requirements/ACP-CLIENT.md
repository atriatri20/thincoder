# ACP 客户端接入 · 需求

> 设计 = `docs/cli/design/ACP-CLIENT.md`。本文记录当前实现的支持集与可验收边界，不额外裁决公共协议合规性。

## 1. 通道与支持集

`thincoder acp` 在 stdio 以 NDJSON/JSON-RPC 2.0 提供当前 ACP v1 agent。入站方法闭集如下：

- 基础：`initialize`、`authenticate`。
- 会话：`session/new`、`session/prompt`、`session/cancel`、`session/close`、`session/list`、`session/load`、`session/resume`、`session/delete`、`session/set_mode`、`session/set_config_option`。
- checkpoint：`checkpoint/create`、`checkpoint/list`、`checkpoint/restore`。
- memory：`memory/list`、`memory/remove`。
- 只读数据：`ledger/list`、`ledger/count`、`batch/list`。

agent 可发 `session/update`、`ledger/changed`、`batch/changed` 通知，并可反向请求 `session/request_permission`、`fs/read_text_file`、`fs/write_text_file`。未注册请求方法返回 method-not-found；通知不伪造响应。

`thincoder acp --login` 走终端设置向导，不进入 stdio 服务；非交互或失败给非零退出。logout、terminal 反向 RPC、audio、elicitation 和 unstable 扩展不在当前支持集。

## 2. 会话与编辑

- session/new 返回持久槽位号字符串，list/load/resume/delete/prompt/cancel/close/set_mode/set_config_option 使用同一身份。
- load 重放历史，resume 不重放；占用槽按当前 fork/认领规则避免双写，同 id 替换先取消旧实例。
- initialize 保存客户端能力快照；未声明能力一律视为不支持。
- write 在声明 fs.writeTextFile 时走 IDE buffer；edit 需要 read/write 双能力，未声明或表外工具回本地。
- 工具审批经 session/request_permission；取消、未知选项或反向 RPC 失败均拒绝。
- question 不在 ACP 工具集，onToolOutput 流式增量当前不转发，SSH 密码凭据窗给可读拒绝而不挂起。

## 3. 输出与扩展事件

- token/reasoning 分别映射 agent_message_chunk/agent_thought_chunk；工具开始和最终结果映射 tool_call/tool_call_update。
- relay 前缀与形态完整的 `⟦ev⟧…\x1e` token 不进入可见文本；内部工具配对键不被改写。
- 子代理事件经 `session_info_update` 的 `_meta["thincoder.dev/subagent"]` 发送，客户端可忽略该扩展。
- usage_update 含 used/size；list.updatedAt 为合法 ISO 字符串或缺席，不用 epoch 0 伪造。
- configOptions 每项含 id/name/type 与当前值；set_config_option 响应和通知均给全量数组，模式通知字段为 currentModeId。

## 4. prompt 内容块

prompt 聚合首个合法 text 块与全部 resource_link 块；文本段在前，资源段按原数组序随后，段间空一行。单个资源块失败只产生该块的可见降级标记，不丢其他资源或文本。

resource_link 必须覆盖以下边界：缺失 URI、非 file scheme、非法百分号编码、相对/绝对路径、file URI、UNC 主机、Windows 盘符、普通锚点与行选区、非法/越界选区、不可读、非普通文件、文件字节上限、NUL、行数与字符上限。

成功内联带文件路径头和无语言标记围栏；选区头带实际起止行。所有失败原因使用设计列出的固定词表和单行标记，不静默改判为空文件或成功。

## 5. schema 形状与认证

- 支持协议版本集为 `{1}`；请求版本受支持则原样返回，否则返回最新支持版。
- agentCapabilities 如实给出 loadSession、promptCapabilities 与 sessionCapabilities；image/audio/embeddedContext 均为 false。
- authMethods 是对象数组，terminal 项仅在 clientCapabilities.auth.terminal=true 时宣告。
- authenticate 只接受已宣告 methodId，是可选确认，不是无 TTY 客户端的强制前置；各业务方法即时检查 provider 配置，不跨调用锁存认证态。
- prompt 正常结束返回 end_turn，取消返回 cancelled；未知会话、非法参数、未配置和内部错误使用对应 JSON-RPC 错误形状。

## 6. 非功能与扩展边界

stdout 只写 JSON，日志走 stderr。入站请求 FIFO await，反向 RPC 响应绕过该队列直接结算 pending waiter；stdin EOF 后在飞请求仍可交付响应。

checkpoint/restore 只恢复指定 checkpoint 中的单文件，不开放整目录 rewind。ledger/changed 与 batch/changed 是 cwd 信号，数据仍由对应拉取方法读取；观察器首查静默，周期与错误留痕由设计给定。
