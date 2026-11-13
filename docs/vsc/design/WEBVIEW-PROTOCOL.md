# VSC 消息协议与忙态 · 设计

> 需求 = `docs/vsc/requirements/WEBVIEW.md` 与 `docs/vsc/requirements/PROJECT.md`。
> 最近先例：`docs/server/design/gateway/API.md` 的对象、规则和验证组织方式。对齐 = 消息方向、字段、错误形状与消费职责均可独立验收。
> 勘察证据：已读 `webview/chat-messages.js` 的完整 switch、`src/extension/panel-messages.mjs` 的上行路由、回调装配、权限门、会话与设置推送；未使用外部公共文档。

## 1. 消息族

以下 `ext → wv` 表示 extension host 到 webview，`wv → ext` 表示 webview 到 extension host。`?` 表示可缺席；未标 `?` 的字段是当前生产者实际携带的字段，调用方不得把缺省值当业务拒绝。

### 1.1 基础会话、流式与状态（ext → wv）

| type | 载荷 | 消费与错误形状 |
|---|---|---|
| `i18n` | `{strings}` | 替换词表并重派生控件文案。 |
| `userMessage` | `{text,timestamp?,idx?}` | 命令回显或历史用户块。 |
| `token` / `reasoning` | `{text}` | 正文/推理增量，清状态文本并续写。 |
| `turnBreak` | 无 | 重置当前流式块指针。 |
| `toolCall` | `{name,args,id,round?,model?}` | 建工具卡；round/model 仅 advisor 可携。 |
| `toolOutput` | `{name,text,kind,id}` | 追加到 `id || name` 对应卡体；无 ref 时不动作。 |
| `toolResult` | `{name,text,id,links,truncated}` | 结算卡；links 为 `{raw,path,line?}[]`，truncated 表示宿主切片。 |
| `loading` | `{loading:boolean}` | 设置 phase；Stop 可见性由 turnState 而非本消息决定。 |
| `turnState` | `{state:"idle"|"running"|"susp",counts?}` | counts 为 `{running,queued,pending,done}`，是忙态权威。 |
| `workspaceGuard` | `{active:boolean}` | active=true 时拒发并显示工作区提示。 |
| `busyQueued` | `{pending,count,items,merged?}` | items 为剩余 string[]；merged 仅真实消费时携带并恰好产生一个用户块。 |
| `complete` / `aborted` | 无 | 正常或中止收尾。 |
| `error` | `{text,techInfo?,needsSetup?}` | 显示错误；needsSetup=true 时重开首启配置。 |
| `clearMessages` | 无 | 清消息、活动、面板、待发送带和分页游标。 |
| `historyPage` | `{messages,hasOlder,older}` | older=false 为尾页，true 为 prepend；assistant 项可含 `reasoning,turnStart,tools[{id,name,args,result,resultTruncated?}]`，外层项携全局 idx。 |
| `sessions` | `{sessions,active,ledger?}` | 行含 `slot,title,count,updated,provider,active`；ledger 异常时才携 `{refused,reason,scene}`。 |
| `project` | `{folders,current,multi,followActive,chosen}` | folders 项为 `{name,path}`。 |
| `models` | `{models,prefs,unavailable?,rollback?}` | models 项含 `id,label,provider,group,reasoning,effortDefault?`；prefs 为 `{provider,model,reasoning?}`；unavailable 为 `{provider,reason}[]`。 |
| `providerStatus` | `{keyOk,status}` | status.providerState 为 `{state,channel,model,reason,invalidReason}`；keyOk 仅在非 invalid 类时为 true。 |
| `providerError` | `{scope,reason}` | 设置写入/连接失败；scope 为设置段名或 `panel`，reason 为错误码或原样串。 |
| `providerKeySaved` | `{name}` | 仅保存成功的受理回执；拒绝径只发 providerError。 |
| `providerContextSaved` | `{name,model,k,kText}` | k 为 K 数或 null，kText 为宿主格式化读数。 |
| `autoApprove` | `{value:boolean}` | 会话 AUTO 活值镜像。 |
| `planMode` | `{active:boolean}` | PLAN 活值镜像，ENG 开启时 active=false。 |
| `agentSettings` | `{settings}` | agent 参数快照，含当前会话 mode，并同步 ADVISOR/MODE 控件。 |
| `uiPrefs` | `{autoFollow,activityMaxHeight,activityTailLines}` | 缺键或坏值由 webview 归一为 true/32/3。 |
| `usage` | `{usage,ctxPct,ctxTokens,timers}` | usage 含五个 token 计数键；timers 为 `{count,expired}`。 |
| `statusText` | `{kind:"rateWait"|"rateLimited"|"overloaded"|"quota"|"index",seconds?,message?,phase?,done?,total?}` | index done 时清段，活动输出到达也清段。 |
| `turnFrame` | `{turn,maxTurns}` | 顶层轮次读数。 |
| `taskProgress` | `{done,inProgress,pending,total,items}` | items 为 task 条目数组。 |
| `goal` | `{status,objective,criteria}` | goal 工具快照。 |
| `timer` | `{status:"fired",text}` | 到期提醒落流，显示最多 3 行加省略号。 |
| `inbox` | `{text}` | 跨实例取件失败或受阻行，空串不动作。 |

### 1.2 活动、权限与设置（ext → wv）

| type | 载荷 | 消费与错误形状 |
|---|---|---|
| `toolPanel` | `{name,kind,text,round,model,sub,tool,cmd,face}` | name=`sub:<role>#<id>` 时进入子块；kind 为 `start/think/text/tool`，face 为 `text/think/toolCall/toolOutput`。 |
| `subagent` | `{role,id,status,...}` | status 可为 `started/queued/turn/done/settled/cancelled/error/terminated/failed/answered`；可携 `model,pool,turn,maxTurns,kind,position,waiting,reason,startedAt,note,syncLive`。 |
| `subagentApproval` | `{id,role,model?,tool}` | tool 非空为等待审批，null 清态，不建块。 |
| `suspension` | `{active,freeze?,interrupted?,running?,queued?,pending?,done?}` | active=true 可携 backgroundCounts；active=false 可携 freeze 与 interrupted。 |
| `digest` | `{status:"start"|"end"|"cap",...}` | start 携 `n,tier,from?,msg?`；end 携 `ok,ms,unsettled?`；cap 携 `mode,turns`。 |
| `compress` | start `{status:"start",messages?}`；done/fallback `{status,tokensFreed?,elapsedMs?,tailMessages?}`；failed `{status:"failed",error}` | 压缩状态行。 |
| `permissionRequest` | `{tool,args,diff,owner,promptId}` | 单项审批卡；diff 为 `{patch}` 或 `{old,new,path}`。 |
| `batchPermissionRequest` | `{tools,count,promptId}` | 合并审批卡，与单项共用 id 序列。 |
| `permissionWithdrawn` | `{promptId}` | 按 id 移除单项或合并卡；孤儿批响应也回此消息。 |
| `question` | `{question,options,promptId}` | options 可为 null；内联提问卡。 |
| `questionCancelled` | `{promptId}` | 按 id 移除提问卡；旧 host 缺 id 时移除全部。 |
| `secretInput` | `{payload,promptId}` | payload 为 `{kind,sessionId,host,user,port,fields,keys}`；fields 为 `{name,masked,required,prefill}[]`，秘密值不进入本消息。 |
| `secretInputCancelled` | `{promptId}` | 按 id 移除凭据卡；旧 host 缺 id 时移除全部。 |
| `atResults` | `{matches,seq}` | 只接受最新 seq；matches 项含 `name,path`。 |
| `mcpStatus` | `{servers}` | MCP 状态快照。 |
| `mcpTools` | `{name,tools? ,error?}` | 成功给工具数组，失败给 error 串。 |
| `mcpTestResult` | `{name,ok,reason?}` | MCP 探活回执。 |
| `indexStatus` | `{status,hasEmbedder}` | 索引读数与 embedder 能力。 |
| `websearchSettings` | `{settings}` | websearch 配置快照。 |
| `proxySettings` | `{settings}` | proxy 配置快照。 |
| `shellCandidates` | `{candidates,current}` | shell 候选与当前值。 |
| `testProviderResult` | `{...result,id?}` | provider 探针结果，id 原样回显供请求归属。 |
| `proxyTestResult` | `{result}` | proxy 探针结果。 |
| `teamStatus` | `{loggedIn,server,member,label}` | 团队状态快照。 |
| `teamLoginResult` | `{ok,reason?,notice?}` | reason 为 `network/credentials/rate_limited/write_failed`，notice 可为 `manual-name-conflict`。 |
| `teamLogoutResult` | `{ok,revokeDelivered?}` | revokeDelivered=false 表示服务端吊销未达。 |
| `teamRotateResult` | `{ok,reason?}` | reason 为 `network/invalid/write_failed`。 |

### 1.3 用户与会话动作（wv → ext）

| type | 载荷 | host 处置与错误形状 |
|---|---|---|
| `userMessage` / `queuedUserMessage` | `{text,model,reasoning,provider,images}` | 同走 routeUserTurn；running 时排队，满 8 拒绝并提示，图片为 dataURL 数组。 |
| `retry` | 无 | 取最后一条 user 内容，走同一 routeUserTurn，忙时不另开并发回合。 |
| `abort` | 无 | 仅 running 时中止当前主会话 controller。 |
| `interrupt` | `{message}` | 以 interrupt reason 中止并续跑，不进入普通队列。 |
| `selectModel` | `{model,provider?}` | 写 workspaceState 与会话槽；显式实变可写 defaultModel。 |
| `selectReasoning` | `{reasoning}` | 写 workspaceState 推理偏好。 |
| `newSession` | 无 | busy 时警告并拒绝。 |
| `switchSession` / `deleteSession` | `{slot}` | busy 时警告并拒绝；delete 保留至少一个会话。 |
| `renameSession` | `{slot,title}` | 写槽标题并同步活动 agent。 |
| `setProject` | `{fsPath}` | 非 workspace folder 返回 `{ok:false,error}`。 |
| `loadOlder` | `{before}` | before 为最早渲染全局 idx，返回 historyPage。 |
| `cancelSubagent` | `{id,role}` | role 交叉校验后定向取消；未知条目 no-op。 |
| `openFile` | `{path,line?}` | 打开编辑器并可选定位；失败记 console.error。 |
| `openDiff` | `{diff}` | 打开原生 diff 预览。 |
| `permissionResponse` | `{approved:true|false|"approveAll",promptId}` | 按 id 精确匹配；approveAll 释放其余逐项并开启 AUTO。 |
| `batchPermissionResponse` | `{choice:"approveAll"|"oneByOne"|"deny",promptId}` | 按 id 匹配；未知 id 回 `permissionWithdrawn`，不 resolve 其他条目。 |
| `questionResponse` | `{answer:string|null,promptId}` | 按 id 匹配；未知 id no-op，null 结算用户取消。 |
| `secretInputResponse` | `{values:object|null,promptId}` | 按 id 匹配；未知 id no-op，值不写日志。 |
| `recordAppend` | `{record:{kind:"subagent",meta,rows}}` | 追加到当前会话活行载体；无载体只记日志。 |
| `panelDiag` | `{kind:"subTrace",entries:[{kind,channel,at}]}` | 汇总写主侧日志，不进入对话。 |
| `webviewReady` | 无 | 推 turnState/i18n/agentSettings/uiPrefs/providerStatus，再打开会话、推 busyQueued、flush outbox 并重 assert live。 |
| `setAutoApprove` | `{value:boolean}` | 更新 live AUTO 并写会话槽；写槽失败时 live 旗仍管当前回合。 |
| `setPlanMode` / `setAdvisorGuard` | `{value:boolean}` | 写会话槽并推设置；只有当前 mode=engineering 时允许 PLAN 互斥分支。 |
| `setMode` | `{value:"minimal"\|"normal"\|"engineering"}` | 写同一会话槽 mode 并推设置；非法值零写，进入 engineering 时先清 PLAN。 |
| `atComplete` | `{query,cwd,seq}` | 返回 atResults，迟到 seq 不覆盖新结果。 |

### 1.4 设置、provider、MCP 与团队动作（wv → ext）

| type | 载荷 | host 处置与错误形状 |
|---|---|---|
| `addProvider` | `{preset?|custom?,key?,proxy?}` | preset/custom 至少一项；缺失为 malformed 并记错，写失败发 providerError。 |
| `removeProvider` | `{name?}` | 有 name 直接删除；无 name 打开选择流。 |
| `saveProviderKey` | `{name,key}` | 真写成功发 providerKeySaved；空 key 不写且无回执，冲突发 providerError。 |
| `deleteProviderKey` | `{name}` | 只删 key，失败发 providerError。 |
| `setProviderProxy` | `{name,proxy:boolean}` | true 写 proxy，false 删除；失败发 providerError。 |
| `saveProviderModelContext` | `{name,model,k}` | k 必须显式存在，null 为清除；缺 k 直接拒绝，成功发 providerContextSaved。 |
| `setKey` | 无 | 打开 provider key 设置流。 |
| `testProvider` | `{baseURL,apiKey,format,proxy?,id?}` | 返回 testProviderResult，id 原样回显。 |
| `saveAgentSettings` | `{settings}` | 写 agent 设置，失败发 providerError(scope=agent)。 |
| `getAgentSettings` | 无 | 依次推 indexStatus 与 light 快照族，agentSettings 末位。 |
| `getShellCandidates` | 无 | 返回 shellCandidates。 |
| `saveShellSettings` | `{value}` | 保存 shell，失败发 providerError(scope=env)。 |
| `saveProxySettings` | `{settings}` | 校验失败零写并发 providerError(scope=env)。 |
| `testProxy` | `{uri}` | 返回 proxyTestResult。 |
| `saveEmbedKey` / `deleteEmbedKey` | `{key}` / 无 | 设置或清空 embedding key，失败发 providerError(scope=tools)。 |
| `saveWebsearchKey` / `deleteWebsearchKey` | `{key}` / 无 | 设置或清空 websearch key，失败发 providerError(scope=tools)。 |
| `saveMcpServer` / `editMcp` | `{name,config}` | 保存或原位更新 MCP，失败发 providerError(scope=mcp) 并重推状态。 |
| `deleteMcpServer` | `{name}` | 删除 MCP，失败发 providerError(scope=mcp)。 |
| `reconnectMcp` | `{name}` | 先断后连。 |
| `testMcp` | `{name}` | 返回 mcpTestResult。 |
| `getMcpStatus` | 无 | 重推 mcpStatus。 |
| `mcpTools` | `{name}` | 返回 mcpTools 或同 type 的 error 串。 |
| `buildIndex` | 无 | 构建当前项目索引。 |
| `teamLogin` | `{server,username,password}` | 成功先推 teamStatus 和设置，再回 teamLoginResult。 |
| `teamLogout` / `teamRotate` | 无 | 分别返回 teamLogoutResult / teamRotateResult。 |

## 2. 回合秩序

`userMessage`、`queuedUserMessage`、`retry` 与 quick-input 命令共用 `routeUserTurn`。running 时普通文本进入 `_busyQueued` 或 `susp.pendingInput`，两载体合计容量为 8；abort/interrupt 等控制消息直通。

忙时不发本地用户气泡，待发送带只由 `busyQueued.items` 驱动。消费时 `busyQueued.merged` 携带单条原文或多条合并文本，webview 恰好追加一个用户块。满队守卫读宿主快照，宿主权威拒绝仍兜底。

turnState 是 Send/Stop、状态行和 digest 的忙态权威。running 显示 Stop、隐藏 Send；susp 不显示 Stop。`loading` 只维护 phase，不另写一套忙态。

`webviewReady` 是会话内容唯一发射起点：先推基础快照并执行 `openSessionContent`，再推队列快照、flush 子代理 outbox、重 assert live 并起心跳，避免 clearMessages 把早到内容抹掉。

## 3. 权限与提问

逐项和批审批共用 `_permissionSeq` 生成 promptId。`releasePermission` 统一完成出队、resolve、`permissionWithdrawn` 和状态刷新；Stop/Ctrl+I、child signal、approve-all 与孤儿批响应都走这一语义。

question 与 secretInput 使用各自单调 id 和队列。响应按 promptId 精确匹配，旧 webview 缺 id 时才回退队头；未知 id 不 resolve 任何条目。Stop 发对应 cancelled 消息并 resolve null，避免挂起。

AUTO 的当前实现见 `docs/vsc/design/WEBVIEW.md`「AUTO 与会话模式」。`continue` 即使 AUTO 开启也强制提问，不被 live AUTO 短路。

## 4. 设置与模式

`getAgentSettings` 的回批顺序为 indexStatus，其后 light 快照族，agentSettings 末位。light 快照包括 proxySettings、websearchSettings、shellCandidates、teamStatus 与 agentSettings；full 快照另含 mcpStatus 与 indexStatus。

工具改变 MODE 或设置后，经统一模式/设置通知调用 `_pushSettingsLight`，不新增平行消息。模型推送在忙时只更新显示，不自动回写会话选择；rollback 也不自动写回。

## 5. 验证

逐 type 对照当前 host 发射、webview switch 消费、webview 发射和 host switch 消费。重点负例包括满队、未知 promptId、孤儿批响应、旧 seq、缺 k 的上下文保存、缺 id 的旧卡和控制消息不排队。

设置验证快照顺序、未编辑空值不写回、推送不丢半填输入、AUTO 在运行中即时生效。协议覆盖核对不等于产品测试通过；真实面板验收仍需从 webviewReady、发送、审批、提问和重载入走查。
