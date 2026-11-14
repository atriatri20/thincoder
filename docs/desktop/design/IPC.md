# Desktop IPC · 设计

> 宿主边界 = `SHELL.md`；需求 = `docs/desktop/requirements/PROJECT.md`。
> 最近先例：`docs/vsc/design/WEBVIEW-PROTOCOL.md` 的双向消息表。对齐 = 白名单、显式载荷、显式回执；只记录当前实现。
> 勘察证据：已读 `src/preload/preload.cjs` 的 CHANNELS/EVENT_CHANNELS、`src/main/ipc-registry.mjs` 的 HANDLERS、回调桥与 `suspensions.mjs` 门表。

## 1. 主到渲染

preload 的 `EVENT_CHANNELS` 是实际可订阅闭集。除 `ev:config` 与 `ev:menu` 外，会话事件都携 `key=String(slot)`；载荷由 core 回调或宿主真实状态映射，渲染侧不得猜测补齐。

| 通道 | 载荷与变体 |
|---|---|
| `ev:token` / `ev:reasoning` | `{ key, text }`，正文或推理增量。 |
| `ev:activity` | `{ key, event, ... }`。`turn` 可携 `turn,maxTurns`；内联 core 事件携 `event,fields`；`turnBreak` 无 fields；回合尾为 `done` 或 `stopped`。 |
| `ev:subagent` | `{ key,role,id,status,... }`。status 闭集为 `started/queued/turn/approval/done/settled/cancelled`；可携 `model,pool,turn,maxTurns,kind,position,waiting,reason,startedAt,syncLive,note,tool`。approval 的 tool=null 清态。 |
| `ev:subchunk` | `{ key,role,id,kind,text,sub?,tool?,face?,cmd? }`；kind 为 `text/think/tool`，face 为 `text/think/toolCall/toolOutput`，sub 为嵌套 relay 链。 |
| `ev:tool-call` | `{ key,id,name,argsSummary,round?,model? }`；round/model 仅 advisor 可携。 |
| `ev:tool-output` | `{ key,id,text }`，执行期增量。 |
| `ev:tool-result` | `{ key,id,ok,result,links?,subKey? }`；ok 由 `isToolFailure` 判定，links 为 `{raw,path,line?}[]`，subKey 为 sync 完成锚。 |
| `ev:approval` | `{ key,promptId,shape,owner?,diff? }` 加 single 的 `tool,argsSummary` 或 batch 的 `batch:{count,tools}`。diff 为 `{patch}` 或 `{old,new,path}`。 |
| `ev:question` | `{ key,promptId,question,options }`；options 缺省为空数组。 |
| `ev:secret` | `{ key,promptId,kind,sessionId,host,user,port,fields,keys }`；fields 只含 `{name,masked,required,prefill}` 描述面，秘密值只走 `secret:respond`。 |
| `ev:task` | `{ key,items,total,... }`，任务面板快照。 |
| `ev:susp` | `{ key,active,running,queued,pending,done }`，active=false 表示窗口退出。 |
| `ev:digest` | start：`{ key,status:"start",n,tier,from?,msg? }`；cap：`{ key,status:"cap",mode,turns }`；end：`{ key,status:"end",ok,ms,unsettled? }`。unsettled 仅在非上行轮且大于 0 时携带。 |
| `ev:queue` | 状态形 `{ key,items:string[] }`；消费形另携 `delivered:{text,ts?,degraded?}`。degraded 为 `non-vision` 或 `partial`，图片 dataURL 不进入快照。 |
| `ev:usage` | `{ key,ctxPct,ctxTokens,usage,timers? }`；usage 含 `prompt_tokens/completion_tokens/reasoning_tokens/prompt_cache_hit_tokens/prompt_cache_miss_tokens`，timers 为 `{count,expired}`。 |
| `ev:error` | `{ key,text,techInfo? }`，回合错误结算；工具失败由 `ev:tool-result.ok=false` 承载，不混入本通道。 |
| `ev:ledger` | `{ key,detailLines,marker? }`；marker 为 `{text,warn}` 或 null，首拍可显式清空。 |
| `ev:timer` | `{ key,status:"fired",text }`，text 为到期提醒原文。 |
| `ev:inbox` | `{ key,kind,text }`；kind 为 `lost` 或 `blocked`，text 为核生成的整行。 |
| `ev:flags` | `{ key,flags:{planMode,autoApprove,advisorGuard,mode} }`，写回执后的活值投影；mode 为 tiny/normal/engineering。 |
| `ev:statusText` | `{ key,kind,... }`；kind 为 `rateWait/rateLimited/overloaded/quota/index`，可携 `seconds,message,phase,done,total`。 |
| `ev:compress` | start `{ key,status:"start",messages? }`；done `{ status:"done",tokensFreed?,elapsedMs? }`；fallback `{ status:"fallback",tailMessages? }`；failed `{ status:"failed",error? }`，均携 key。 |
| `ev:goal` | `{ key,status,objective,criteria }`，goal 缺席时为 `{ key,status:"cancelled" }`。 |
| `ev:config` | `{ at }`，配置外写信号，不携 key；自写经监视基线抑制。 |
| `ev:menu` | `{ action,path?,value? }`，不携 key。action 为 `newSession/openProject/find/theme/help/openSettings`；theme 值为 `system/light/dark`，openSettings 的 value 为设置组名。 |

## 2. 渲染到主

`CHANNELS` 与 HANDLERS 一一对应，表外通道在 preload 直接 reject；主进程白名单缺处理体时注册失败。`config:read`、`project:open`、`project:recent` 不使用 `{ok}` 信封；其他通道按下列回执验收。

### 2.1 项目、会话与回合

| 通道 | 请求载荷 | 回执与 reason |
|---|---|---|
| `config:read` | 无 | `{config,locale,dict,configured}`；读配置失败直接 reject。 |
| `project:open` | `{fsPath?}`；缺省弹主进程目录选择 | `{cwd,recent}`；取消或无效路径不伪造 cwd 变化。 |
| `project:recent` | 无 | `{cwd,recent}`，recent 按会话组最新 mtime 降序，最多 10 项。 |
| `sessions:list` | 无 | `{cwd,sessions,ledger?}`；行含 `slot,title,createdBy,updatedAt,messageCount,isActive`，ledger 异常时才携 `{refused,reason,scene}`。 |
| `session:create` | 无 | 统一 `{ok,reason,cwd,slot}`；失败 reason 仅 `no-project`。 |
| `session:switch` | `{slot}` | 同信封；受占切换成功可另携 `occupied:true`，失败 `slot-missing`。 |
| `session:rename` | `{slot,title}` | 同信封；reason 闭集为 `no-project/invalid-slot/file-missing/parse-failure/mtime-conflict`。 |
| `session:delete` | `{slot}` | 同信封；末项拒 `last-session`，其他失败 `slot-missing`。 |
| `session:resume` | 无 | 同信封；失败 reason 仅 `no-project`，核兜底总会选择一个槽。 |
| `history:page` | `{key,before}`；before=null 为尾页 | 成功 `{ok:true,messages,hasOlder,next,meta,flags,queue,providerState,seed?}`；失败 `{ok:false,reason:"bad-key"|"slot-missing"}`。next 为下一游标或 null，queue 恒为 string[]，seed 仅尾页可携。 |
| `session:prefs` | `{key,patch}`；patch 仅 `provider/model/effort` | 统一信封加成功时的 `meta`；reason 为 `invalid-patch/model-required/bad-key/slot-missing`。provider 变更必须同送 model；仅 effort 可为 null。选定写回可另携 `providerState` 或 `carryover:{ok:false,reason}`。 |
| `session:flags` | `{key,patch}`；patch 仅 `planMode/autoApprove/advisorGuard` 的布尔项或 `mode` 三档枚举 | `{ok,flags?}`；成功时 flags 为活值，agent 不在场可缺席。失败 reason 闭集为 `bad-key/invalid-patch/slot-missing/apply-failed`。 |
| `msg:send` | `{key,text,images?}`；images 为 dataURL string[] | 立即成功 `{ok:true,providerState}`，可叠加 `queued:true` 或 `degraded:"non-vision"|"partial"`；失败 `{ok:false,reason,started:false}`。reason 为 `bad-key/provider-invalid/queue-full/busy/aborted`；provider-invalid 另携 `providerKind:"defaultModel"|"provider"`。 |
| `msg:interrupt` | `{key,message?}` | `{ok:true}` 或 `{ok:false,reason:"idle"|"bad-key"|"queue-full"}`；携文 queue-full 时不中止也不入队。 |
| `subagent:stop` | `{key,id,role?}` | `{ok,reason}`；reason 为 `unknown-sub` 或 `bad-key`，终态由后续 subagent 事件确认。 |
| `record:append` | `{key,record}`；record 为 subagent 的 `{meta,rows}` | `{ok,reason}`；reason 为 `bad-key` 或 `unknown-key`。digest 记录由宿主同点双写，不经本通道。 |
| `file:open` | `{path,line?}`；path 必须绝对路径 | `{ok,reason}`；非法路径为 `bad-path`，CLI 与 `shell.openPath` 均失败时 reason 为宿主错误串。 |
| `at:complete` | `{query,seq}` | `{ok,matches,seq}`，seq 原样回显供迟到丢弃。 |
| `panel:state` | `{key,blocks}`；块含 `key,status,frozen,awaitingDigest,region,dom,role,id` | `{ok:true}` 或 `{ok:false,reason:"invalid-key"|"invalid-blocks"}`。 |
| `theme:state` | `{theme:"system"|"light"|"dark"}` | `{ok:true}` 或 `{ok:false,reason:"invalid-theme"}`。 |

`history:page` 使用 core 的 `HISTORY_PAGE_SIZE=200`。`next = max(0,end-200)`，`end` 为 before 或历史条数；`hasOlder=false` 时 next=null。记录也占页条目，零可视消息页仍按游标推进。

### 2.2 审批、提问与凭据

| 通道 | 请求载荷 | 回执与失败语义 |
|---|---|---|
| `approval:respond` | `{promptId,verdict}`；single 为 `once/always/reject`，batch 为 `approveAll/deny/oneByOne` | 成功 `{ok:true}`，审批门可另携 `{key,flags}`。失败 reason 仅 `unknown-prompt/bad-kind/bad-verdict`，挂起保留且不 resolve。 |
| `question:respond` | `{promptId,answer}`；answer 为 string 或 null | 成功 `{ok:true}`；null 结算为 `(user cancelled)`。失败 reason 仅 `unknown-prompt/bad-kind/bad-answer`，挂起保留且不 resolve。 |
| `secret:respond` | `{promptId,values}`；values 为对象或 null | 成功 `{ok:true}`；失败 reason 仅 `unknown-prompt/bad-kind/bad-values`，挂起保留且不 resolve。 |

提问重试复用同一 promptId 和同一挂起门。回执失败、拒绝或 invoke 抛错时卡与输入草稿保留，用户再次调用 `question:respond`；不得改走末条用户消息重发路径。错误横幅的“重试末条用户消息”是另一独立路径。

### 2.3 provider、模型与设置

| 通道 | 请求载荷 | 回执与 reason |
|---|---|---|
| `provider:list` | 无 | `{ok,providers,active,presets,defaultModel}`；providers 行含 `name,shape,baseURL,hasKey,maskedKey,active,proxy,modelContext,modelContextText,context,available?,unavailableReason?,failure?`，presets 为 `{name,desc,baseURL}[]`。 |
| `provider:save` | `{name,shape,baseURL?,key?,format?,proxy?}` | `{ok,reason}`；reason 为 `invalid-shape` 或核错误开放串，成功可携 `providerState`。 |
| `provider:remove` | `{name}` | `{ok,reason}`；空名为 `invalid-shape`，激活渠道保护等失败为核原文开放串。 |
| `provider:verify` | `{name}` | `{ok,reason?,models?,failure?}`；reason 为 `timeout/malformed/unavailable`，探不通不禁止保存。 |
| `provider:setKey` | `{name,key}` | `{ok,reason}`；reason 为 `invalid-shape/unavailable` 或核串，成功写后探测。 |
| `provider:delKey` | `{name}` | `{ok,reason}`；reason 为 `invalid-shape/unavailable` 或核写错误开放串。只删 key、保留条目，不做写后探测。 |
| `provider:models` | `{baseURL,apiKey?,format?,proxy?}`，表单暂存值不落盘 | `{ok,models}` 或 `{ok:false,models:[],reason}`；空 baseURL 为 `invalid-shape`，探针失败为核错误开放串。 |
| `provider:setProxy` | `{name,proxy:boolean}` | `{ok,reason}`；reason 为 `invalid-shape/unavailable` 或核写错误开放串。true 写 proxy，false 删 proxy 键。 |
| `provider:setModelContext` | `{name,model,k}` | `{ok,reason}`；k 为 K 单位正整数，缺席/null/空白删除该模型声明。reason 为 `invalid-shape/invalid-value/unavailable` 或核写错误开放串。 |
| `model:list` | `{provider}` | 成功 `{ok,models}`，失败 `{ok:false,models:[],reason}`；models 项含 `id,effortEnum,thinkOff`，reason 为核错误开放串。 |
| `model:catalog` | 无 | `{ok,models,unavailable}`；models 项含 `provider,id,effortEnum,thinkOff`，失败渠只进入 unavailable。 |
| `settings:agent` | 读 `{}`；写 `{patch:{"<点分路径>":value}}` | 读写均含 `{ok,fields,models}`，写另含 reason 并可携 `providerState`。reason 为 `invalid-patch/slot-authority/mtime-conflict` 或核校验开放串；patch 值 null 为显式清除。 |
| `settings:env` | 读 `{}`；写 `{patch:{proxy?,shell?}}`；测 `{testProxy:{uri}}` | 读写含 `{ok,reason,proxy,shell:{current,candidates}}`；reason 为 `invalid-patch/mtime-conflict` 或校验开放串。测试返回 `{ok,status}` 或 `{ok:false,status|error}`，patch 与 testProxy 同在拒 `invalid-patch`。 |
| `settings:tools` | 读 `{}`；写 `{patch:{embedding?:{apiKey},websearch?:{apiKey}}}` | 读写同回 `{ok,reason,embedding:{hasKey},websearch:{hasKey}}`；reason 为 `invalid-patch` 或核写错误开放串，空串删除键。 |
| `config:write` | `{patch:{locale}}`；locale 仅 en/zh | `{ok,reason}`，成功同回 `{locale,dict,configured}`；reason 为 `invalid-key/invalid-value/mtime-conflict`。 |
| `mcp:list` | 无 | `{ok,servers}`；项含 `name,kind,summary,config`，config 以七键 `command,args,env,url,wsUrl,headers,token` 供编辑预填。 |
| `mcp:save` | `{name,config}` | 成功 `{ok,tools}`；失败 reason 为 `invalid-shape/probe-failed` 或核写错误开放串，probe-failed 另携 detail 且零写盘。 |
| `mcp:update` | `{name,config}` | 成功 `{ok,tools}`；reason 为 `invalid-shape/unknown-server` 或核写错误开放串。原位替换且不探活。 |
| `mcp:remove` | `{name}` | 成功 `{ok:true}`；reason 为 `invalid-shape` 或核写错误开放串，移除工具与配置。 |
| `mcp:reconnect` | `{name}` | `{ok,tools}` 或 `{ok:false,reason}`；reason 为 `invalid-shape/unknown-server` 或核连接开放串。 |
| `mcp:tools` | `{name}` 或 `{name,test:true}` | 列举 `{ok,tools:[{name,description,params}]}`；探活 `{ok,toolCount,latencyMs}`。失败 reason 为 `invalid-shape/unknown-server/probe-failed` 或核连接开放串，probe-failed 另携 detail。 |

### 2.4 索引、维护、团队与台账

| 通道 | 请求载荷 | 回执与 reason |
|---|---|---|
| `index:build` | 无 | `{ok,files,chunks}` 或 `{ok:false,reason}`；无项目为 `no-project`。 |
| `index:status` | 无 | `{ok,status:{built,files,chunks,dbBytes,origins,hasEmbedder}}`。 |
| `session:gc` | 无 | `{ok,candidates,confirmed,deleted,files,skipped,skippedFiles}`；驳回零删除。 |
| `session:index` | 无 | `{ok,sessions,changed,messages,toolCalls,bytes}` 或 `{ok:false,error}`。 |
| `ledger:read` | `{cwd?}` | 成功 `{ok,counts:{pool,tech,aged},thresholdReached}`；无项目 `{ok:false,reason:"no-project"}`，无台账库是三计数为 0 的合法读数。 |
| `batch:status` | `{cwd?}` | `{ok,phase,reason?}`；reason 为 `missing/invalid`，其他读错直接 reject。 |
| `team:status` | 无 | `{ok,loggedIn,server,member,label}`。 |
| `team:login` | `{server,username,password}` | `{ok,notice?}` 或 `{ok:false,reason}`；reason 为 `network/credentials/rate_limited/write_failed`，notice 可为 `manual-name-conflict`。 |
| `team:logout` | 无 | `{ok,revokeDelivered?}`；revokeDelivered 缺席表示 true，false 表示吊销未达但本地已清。 |
| `team:verify` | 无 | `{ok,state:"valid"|"invalid"|"unreachable"}`；未登录 `{ok:false}` 且不调用核。 |
| `team:rotate` | 无 | `{ok}` 或 `{ok:false,reason}`；reason 为 `network/invalid/write_failed`。 |

## 3. 回执与队列

写通道失败不得伪造成功。会话事件中的 `ev:queue.items` 与 `history:page.queue` 来自同一 `queueView` 快照；`delivered` 只在真实消费时携带，消费前忙态排队不进入对话流，消费时恰好形成一个用户块。

`msg:send` 长回合立即返回 queued/degraded/错误，终局通过事件到达。非视觉带图降级窗口可在读图后返回；附件弃项、降级、装配中止和 carryover 失败必须在回执或可见事件中呈现。

审批、提问和 secret 的 promptId 精确匹配。未知 id、跨 kind、错误 verdict/answer/values 不 resolve 挂起，调用方可在同一卡重试；always 只在审批成功后更新 AUTO 与 flags。

## 4. 验证

逐通道核对 preload 白名单、HANDLERS、请求载荷、成功回执和失败 reason。负例至少包括未知通道、未知 promptId、跨 kind、非法 verdict/answer/values、queue-full、last-session、bad-key、无项目和配置冲突。

队列验证冷启快照、真实消费出块、图片不入快照和提问同 id 重试。配置验证自写抑制，附件验证 degraded/aborted，未知 channel 必须在 preload 拒绝。代码阅读用于核对契约，不作为产品测试通过证明。
