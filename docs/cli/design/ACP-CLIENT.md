# ACP 客户端接入 · 设计

> 需求 = `docs/cli/requirements/ACP-CLIENT.md`。
> 最近先例：`SESSION.md` 的持久槽与 `TOOLS.md` 的写路径。对齐 = core 单实现、stdio 薄协议壳。
> 勘察证据：已读 transport、client-caps、session/slot/ext/read-data handlers、bridge 与 resource-link 当前实现。外部公共文档：未使用；本文只描述当前代码，不作公共协议合规裁决。

## 1. 模块

`acp.mjs` 装配 handlers、clientCapabilities 快照和会话容器。`transport.mjs` 处理 NDJSON、FIFO、错误与反向 RPC；`session.mjs` 串行 prompt/cancel；`client-caps.mjs` 处理 initialize/authenticate；`handlers-session.mjs` 与 `handlers-slots.mjs` 处理会话。

`bridge.mjs` 映射 agent 回调和编辑桥，`resource-link.mjs` 处理文件引用，`ext.mjs` 承载 checkpoint/memory，`read-data.mjs` 承载 ledger/batch 拉取和变更观察器。

## 2. 协议与生命周期

### 2.1 传输与错误

stdout 每行一个 JSON 对象，日志只写 stderr。普通入站请求按 FIFO await；带 id 且无 method 的客户端响应直接 resolve/reject pending waiter，不进入 FIFO，避免 prompt 等权限或 fs 响应时死锁。畸形反向响应会立即 reject 对应 waiter。

| 错误 | code | 默认 message |
|---|---:|---|
| parse | -32600 | `Parse error` |
| method not found | -32601 | `Method not found` |
| invalid params | -32602 | `Invalid params` |
| internal | -32603 | `Internal error` |
| auth required | -32000 | `authRequired` |

handler 返回 `{error}` 时按该对象回错；抛出异常映射 internal。反向 RPC 缺省 timeoutMs=60000，权限为 300000，fs 为 30000。stdin EOF 只停止接新输入，在飞请求结算后才关闭；SIGINT/SIGTERM drain 后退出，另有 2000ms 强制退出兜底。

### 2.2 入站方法支持集

除 initialize 外，业务方法都即时调用 `requireConfigured`。 authenticate 先检查 methodId 再检查同一配置门；无跨调用 authenticated 闩锁。

| 方法 | 参数 | 当前结果与失败面 |
|---|---|---|
| `initialize` | `{protocolVersion?,clientCapabilities?}` | `{protocolVersion,agentCapabilities,authMethods,agentInfo}`，agentInfo 为 `{name:"thincoder",version}`。 |
| `authenticate` | `{methodId}` | 已宣告 terminal 且已配置时 `{}`；未知方法 -32602，未配置 -32000。 |
| `session/new` | `{cwd?,mcpServers?}` | `{sessionId,configOptions}`；cwd 非串或不等于进程 cwd 为 -32602，mcpServers 只记忽略日志。装配失败回滚新槽。 |
| `session/prompt` | `{sessionId,prompt:ContentBlock[]}` | 正常 `{stopReason:"end_turn"}`，AbortError `{stopReason:"cancelled"}`；无可聚合内容为 -32602。 |
| `session/cancel` | `{sessionId}` | 取消当前回合并返回 `{}`；未知会话 -32602。 |
| `session/close` | `{sessionId}` | 取消、移除并释放认领后 `{}`；未知 id 也返回 `{}`。 |
| `session/list` | 无 | `{sessions:[{sessionId,cwd,updatedAt?,title}]}`；updatedAt 非法或超 TimeClip 域时缺席。 |
| `session/load` | `{sessionId}` | 恢复并 replay 后 `{configOptions}`；id 非正整数、槽不存在/损坏为 -32602。 |
| `session/resume` | `{sessionId}` | 恢复但不 replay，返回 `{configOptions}`；id/槽错误同 load。 |
| `session/delete` | `{sessionId}` | 删除持久槽并给在存同槽实例分配新槽，返回 `{}`；不存在为 -32602。 |
| `session/set_mode` | `{sessionId,mode:"plan"|"normal"}` | 只切换 ACP PLAN 状态；成功后 `{}` 和 current_mode_update；表外值或 engineering 下 plan 为 -32602。工作模式不使用此入口。 |
| `session/set_config_option` | `{sessionId,configId,value}` | 成功返回全量 configOptions 并发 config_option_update；缺字段/未知配置为 -32602。 |
| `checkpoint/create` | 无 | `{checkpoint:{id,time,files,git}}`；创建失败为 internal。 |
| `checkpoint/list` | 无 | `{checkpoints:[{id,time,files,trackedCount,untrackedCount}]}`。 |
| `checkpoint/restore` | `{checkpointId,path}` | 单文件恢复后 `{restored:path}`；缺参数或 rewind 失败为 -32602，不开放整目录恢复。 |
| `memory/list` | `{type?}` | `{entries:[{id,type,title,tags,updatedAt}]}`；store 不可达为 internal。 |
| `memory/remove` | `{id}` | 成功 `{removed:id}`；id 非正整数或不存在为 -32602，store 不可达为 internal。 |
| `ledger/list` | `{cwd?,family?,full?}` | 直传 `ledgerExport` 结果；cwd 非串、family/full 非 boolean 或核拒绝为 -32602。 |
| `ledger/count` | `{cwd?}` | 直传 `{count,overdue,evidenceTooLong}`；cwd 非串或核拒绝为 -32602。 |
| `batch/list` | `{cwd?}` | 直传 `listBatchRecords` 结果；cwd 非串或核拒绝为 -32602。 |

### 2.3 版本、能力与认证

支持版本常量 `SUPPORTED_PROTOCOL_VERSIONS=[1]`。protocolVersion 为整数 1 时回 1，其他输入也回最新支持版 1。

initialize 返回：

```text
agentCapabilities = {
  loadSession: true,
  promptCapabilities: { image:false, audio:false, embeddedContext:false },
  sessionCapabilities: { list:{}, resume:{}, delete:{}, close:{} }
}
```

clientCapabilities 缺省为 `{}`，之后只读。auth.terminal=true 时 authMethods 含 `{id:"terminal",type:"terminal",name:"Terminal login",description,args:["--login"]}`，否则为空数组。description 指引运行 `thincoder acp --login`。

无 provider key 时认证门要求配置 `providers[].apiKey` 或运行 login；有 key 但 defaultModel/provider 仍不可装配时错误串携带当前 providerInvalidReason。session/new 装配后再次检查 `_providerInvalid`，失败不保留半死会话。

## 3. 会话身份与配置

session id 是持久槽号字符串。new 先认领槽再构造 agent；load/resume 用 `Number(sessionId)` 校验槽，但 Map 键保留客户端原文字符串。list 输出可直喂全族方法。

load/resume 同 id 已存在时先 cancel/delete/release，再创建新实例；前置槽或工程档校验失败发生在替换前。槽被其他进程或同进程其他会话占用时分配新槽 fork，空闲时钉回原槽。delete 后，在存同槽实例立即分配新槽，防止删后复活或双写。

`sessionConfigOptions` 的顺序为 model（仅 provider.model 可解析时）→ thinking → mode（PLAN）→ workMode：

- model：select，currentValue 为 `provider:model` 或裸 model，options 只含当前值。
- thinking：boolean，currentValue 为 `thinking != null && thinking.type !== "disabled"`。
- mode：select，currentValue 为 plan/normal，options 为 normal、plan。
- workMode：select，currentValue 为 minimal/normal/engineering，options 为这三个固定值；new/load/resume 均返回同一活值。

set_config_option 的 model 在首个冒号分割 provider/model；thinking 按 providerSpec 选择 enabled/disabled 或 effort 族的 null，关闭时删除 reasoningEffort；mode 只接受 plan/normal，只改 PLAN 内存态。workMode 严格校验三档，写当前 agent 与会话槽并重推全量配置；只有进入 engineering 时执行既有 PLAN 互斥和 manifest 规则。非法 workMode 零状态变、零通知。

每回合 finally 保存会话。close、load/resume 替换与 new 的同 id 置换使用同一认领释放逻辑，保留同进程其余会话槽。

## 4. 事件与反向 RPC

### 4.1 session/update

所有更新外Envelope为 `{sessionId,update:{sessionUpdate,...}}`。

| sessionUpdate | 载荷与来源 |
|---|---|
| `agent_message_chunk` | `{content:{type:"text",text}}`，普通 token；relay 前缀剥离，事件 token 不进入正文。 |
| `agent_thought_chunk` | 同 content 形，来源 reasoning。 |
| `user_message_chunk` | `{content:{type:"text",text}}`，仅 load 历史重放。 |
| `tool_call` | `{toolCallId,title,kind,status:"in_progress",rawInput,content}`；content 为 text 的 content block 数组。 |
| `tool_call_update` | `{toolCallId,status:"completed",content}`；当前 onToolResult 恒发 completed，onToolOutput 不转发。 |
| `usage_update` | `{used,size}`；used=prompt_tokens+completion_tokens，size=providerSpec(agent.provider).context。 |
| `session_info_update` | `{_meta:{"thincoder.dev/subagent":{role,id,state,progress?,detail?}}}`；role/id 取 relay 最内段，state 为事件名。 |
| `config_option_update` | `{configOptions}`，全量数组。 |
| `current_mode_update` | `{currentModeId:"plan"|"normal"}`。 |

toolCallId 每会话按 `t1,t2,…` 生成。配对先按原样 name+模型 toolId 精确取 FIFO 条目，无 id 或未命中再按 name FIFO；relay 前缀只从 title/kind 剥离，不改配对键。

relay 事件只有在带 relay 前缀且 `parseSubagentEvent` 识别完整形态时才发 session_info_update；无前缀只剥离。`[model]` 元数据不进入正文，剥后空 chunk 不发送。

load 重放 user/assistant/tool 行；图片块跳过并记日志。带 tool_calls 的 assistant 逐调用发 tool_call，后续 tool 行按序发 tool_call_update，结果文本截到 2000 字符。

### 4.2 权限与 fs

权限请求为：

```text
session/request_permission {
  sessionId,
  options: [
    { optionId:"approve_once", name:"Approve once", kind:"allow_once" },
    { optionId:"approve_always", name:"Approve for this session", kind:"allow_always" },
    { optionId:"reject", name:"Reject", kind:"reject_once" }
  ],
  toolCall:{ toolCallId,title,content }
}
```

`approve_once/approve/approve_always/approve_for_session` 映射 true；cancelled、缺失和其他 optionId 映射 false。反向 RPC 抛错也返回 false。

write 仅在 `fs.writeTextFile=true` 且 path 存在时路由；content 非 string 返回 handled=true 的 Error，不静默本地写。edit 需要 read/write 双能力，支持 `edits` 真值批形，或 path+new_string 且带 old_string/行号参数的单形；读、判定、写回和 recordWrite 经 IDE buffer 完成。

apply_patch、delete、只读工具和能力未声明的 write/edit 回本地。fs/read_text_file 返回读取对象的 `text ?? content ?? ""`，fs/write_text_file 请求 `{sessionId,path,content}`。

## 5. 配置与引用

### 5.1 聚合

`buildPromptText(blocks,{cwd})` 选择第一个 `type="text"` 且 text 为 string 的块，text 非空才加入。随后按原数组顺序逐个 await 处理所有 `type="resource_link"` 块，段间用 `\n\n` 连接。

聚合结果为空时 session/prompt 返回 -32602：`prompt requires a text or resource_link content block`。image/audio/embeddedContext 不进入本聚合面。

### 5.2 resource_link 判定树

| 顺序 | 判定 | 结果 |
|---:|---|---|
| 1 | `block.uri` 不是 string | `missing uri`，路径位取 `block.name ?? "unknown"`。 |
| 2 | `new URL(raw)` 成功且 protocol 非 file | `unsupported scheme`，路径位为 raw。 |
| 3 | file URI 的 pathname 或纯路径 decodeURIComponent 失败 | `invalid percent-encoding`，路径位为 raw。 |
| 4 | file URI 归一 | 非空且非 localhost hostname 形成 `//host/path` UNC；`/C:/…` 去掉盘符前导 `/`。 |
| 5 | 非 URL 纯路径 | 解码后按 cwd resolve；绝对路径不归 cwd 限制，允许读 cwd 外显式引用。 |
| 6 | hash 匹配选区文法 | 解析 1 基闭区间；`#L<a>`、`#L<a>-<b>`、`#L<a>:<b>`，b 可带 L。非选区 hash 当普通锚点，读整文。 |
| 7 | 选区 a<1、b<1 或 b<a | `invalid selection`，路径位为归一后的 path。 |
| 8 | stat 或 readFile 失败 | `unreadable`。 |
| 9 | stat 非普通文件 | `not a regular file`。 |
| 10 | `stat.size > MAX_INLINE_BYTES` | `too large (>10MB)`，先于此后的读取。 |
| 11 | 读取 Buffer 含任意 NUL | `binary (NUL byte)`；在选区切片前判定。 |
| 12 | 选区 a 超过总行数 | `lines out of range`；b 超尾时截到总行数。 |
| 13 | 当前整文或选区切片行数超上限 | `too many lines (>2000)`。 |
| 14 | 当前整文或选区切片字符数超上限 | `too long (>100000 chars)`。 |
| 15 | 以上均通过 | 输出路径头、无语言标记围栏和内容。 |

行模型按 `\n` 分割，末尾换行是终止符，不额外计一行。选区为闭区间，header 使用实际截断后的 b。

### 5.3 数值与固定形状

| 常量 | 当前值 | 作用面 |
|---|---:|---|
| `MAX_INLINE_BYTES` | `10 * 1024 * 1024` | 整文件 stat 字节门，严格大于才拒绝。 |
| `MAX_INLINE_LINES` | `MAX_READ_LINES=2000` | 当前内联切片行数门。 |
| `MAX_INLINE_CHARS` | `100000` | 当前内联切片 JS 字符数门。 |

失败统一为单行、无围栏：

```text
[File reference: <path> — <reason>]
```

reason 闭集逐字为：`missing uri`、`unsupported scheme`、`invalid percent-encoding`、`invalid selection`、`unreadable`、`not a regular file`、`too large (>10MB)`、`binary (NUL byte)`、`lines out of range`、`too many lines (>2000)`、`too long (>100000 chars)`。

成功整文形状如下，选区仅把头行改为 `[File: <path> lines <a>–<b>]`：

````text
[File: <path>]
```
<content>
```
````

正文缺尾换行时补一个，围栏不粘连正文；内容原样保留。

resource_link 不依赖 fs.readTextFile 能力位，也不经 IDE buffer；它直接按上述本地只读树解析，不使用 question/elicitation。

## 6. 只读数据观察器

ledger/list、ledger/count、batch/list 的 params.cwd 缺省为进程 cwd，显式 cwd 只作调用边界。`WATCH_INTERVAL_MS=5000`，观察器启动立即首查立基线且静默，此后比较台账库与批档的 `exists:mtimeMs:size` 指纹。

指纹变化发 `ledger/changed` 或 `batch/changed`，载荷仅 `{cwd}`。上一拍未结束则跳过；失败写 stderr，同因不重复，成功拍复位错误键。通知不携带台账或批档正文。

## 7. 验证

用脚本化 stdio 客户端验证支持集、无 TTY 流程、版本/能力、FIFO、反向 RPC 响应不被饿死、会话身份和 config 全量形状。逐方法验证未知会话、错误参数、未配置和内部失败。

resource_link 逐项覆盖判定树：file/非 file、UNC、Windows 盘符、相对/绝对、非法编码、普通锚点、三种选区、逆序/越界、目录、不可读、10MB 边界、NUL、2000 行与 100000 字符边界，以及单块失败不影响其他块。

另验证 relay 零正文泄漏、工具 FIFO 配对、load/resume replay 差异、权限未知响应拒绝、fs 双能力、checkpoint 单文件恢复和观察器首查静默。代码阅读只用于核对当前契约，不作为产品测试通过证明。
