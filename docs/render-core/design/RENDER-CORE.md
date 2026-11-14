# Render Core · 设计

> 需求 = `docs/render-core/requirements/RENDER-CORE.md`。
> 最近先例：`docs/server/design/gateway/API.md` 按对象、规则和验证组织契约；本档对齐字段、状态、异常与边界，只记录当前实现。
> 勘察证据：已读 `thincoder-render-core/package.json` 及全部运行模块的公开导出；外部公共文档未使用。

## 1. 模块职责

包 `@thincoder/render-core` 的 `exports` 为 `"./*": "./*"`，没有聚合入口；下列运行模块及其具名导出构成公共面。包为 ESM，运行文件包括根级 `.mjs`、`flow/`、`cards/`、`subblocks/`、`composer/` 和静态样式；`package.json` 声明 `publishConfig.access = "public"`。

核只提供浏览器原生 DOM 构件和纯函数。VSC 的 `acquireVsCodeApi`/`postMessage`、Desktop 的 preload/invoke、宿主主题、消息入站分发、会话存储与记录、历史分页、挂载顺序和业务副作用均留端。VSC 经静态相对路径加载，Desktop 经 `app://` 的 `/rc/` 同源路径加载。

## 2. 公共导出契约

### 2.1 文本、diff、工具结果与 i18n

| 模块与导出 | 参数 | 返回值与当前边界 |
|---|---|---|
| `md.mjs` `md(raw)` | 任意原始值 | Markdown HTML 字符串；空值返回 `""`。先抽块、转义再还原，支持围栏、表格、引用、列表、标题、行内构造和安全 URL。 |
| `md.mjs` `mdInline(s)` | 单条不可信文本 | 转义后的行内 HTML，不生成段落。 |
| `md.mjs` `esc(s)` | 任意值 | 转义 `& < > "` 后的字符串。 |
| `highlight.mjs` `tokenize(code, lang)` | 代码串、规范化语言键 | `{type,value}[]`；普通字符为 `plain`。 |
| `highlight.mjs` `highlight(code, lang)` | 代码串、语言键 | 转义并带 `tk-*` span 的 HTML；空代码返回 `""`，未知语言按 `js`。 |
| `highlight.mjs` `normalizeLang(lang)` | 围栏语言名 | 当前语言键；缺省或未登记值返回 `js`。 |
| `diff.mjs` `lineDiff(oldStr,newStr)` | 新旧文本 | `{type:"same"|"add"|"del",text}[]`，使用公共前后缀和中段匹配。 |
| `diff.mjs` `renderDiff(diffLines)` | 上行结果 | `div.diff-line` HTML；空数组返回一行省略号。 |
| `lib.mjs` `tailTruncate(text,max=2000)` | 文本、字符上限 | 尾部文本；优先向后对齐到仍有内容的换行。 |
| `lib.mjs` `capText(text,max=MAX_TOOL_OUTPUT,note="…(输出过长已截断)")` | 文本、上限、尾注 | 保头截断串；不超过上限时原文返回。 |
| `lib.mjs` `MAX_TOOL_OUTPUT` | — | `64 * 1024` 字符。 |
| `lib.mjs` `fmtK(n)` / `fmtTime(d)` | 数值 / `Date` | 紧凑 token 串 / 本地 `HH:MM`。 |
| `lib.mjs` `patchLineType(line)` | unified diff 行 | `same`、`add` 或 `del`；文件头保持 `same`。 |
| `lib.mjs` `toolStatusText(text)` | 工具结果 | 首个独立状态行原文，含 `(exit code 0)`；无则 `""`。 |
| `lib.mjs` `toolFailureStatus(text)` | 工具结果 | 首个非零退出、`killed` 或 `spawn failed` 状态行；成功或无状态行返回 `""`。 |
| `lib.mjs` `isToolFailure(text)` | 工具结果 | `Error:`/`Error：` 前缀或上行非空时为 `true`；行内提及状态文本不判失败。 |
| `tool-summary.mjs` `formatToolSummary(name,text)` | 工具名、结果 | 当前工具摘要字符串；无摘要时为 `null` 或 `""`。默认摘要取首个非空行前 100 字符。 |
| `i18n.mjs` `setStrings(strings)` | 词表对象 | 无返回值；替换模块词表，空值换成空表。 |
| `i18n.mjs` `t(key,vars={})` | 键、插值对象 | 翻译串；逐键做一次 `${name}` 替换，缺键返回键名。 |
| `toast.mjs` `showToast(text)` | 显示文本 | 无返回值；复用 `#paste-toast`，2600ms 后撤 visible。 |

### 2.2 会话流、工具卡与面板

| 模块与导出 | 参数 | 返回值与当前边界 |
|---|---|---|
| `flow/block.mjs` `buildAdvisorBlock(roundLabel)` | 头文本 | 展开的 `details.advisor-block`，含 summary 与 `.advisor-content`。 |
| `flow/block.mjs` `appendAdvisorChunk(block,kind,text,sub,meta)` | 块、内容类型、文本、嵌套标、面元数据 | 无返回值；冻结块和空文本不写。工具输出按同工具同 sub 合并，text/think 按同 kind 同 sub 合并。 |
| `flow/block.mjs` `buildUserMessage(text,timestamp,idx)` | 原文、可选时间戳、全局 idx | 用户消息元素；只有真实 timestamp 才显示时间，idx 存在才写 `data-idx`。 |
| `flow/block.mjs` `buildAssistantRestore(msg)` | `{idx?,turnStart?,reasoning?,text?,tools?}` | 恢复助手帧；推理默认展开，工具卡嵌在帧内且不成为分页锚。 |
| `flow/block.mjs` `renderBlock({idx,withLabel=false}={})` | 可选 idx、回合标签位 | 空助手消息元素。 |
| `flow/block.mjs` `buildHistoryMessage(msg)` | 历史项 | user/assistant/tool 对应元素；其他 kind 或空输入返回 `null`。 |
| `flow/block.mjs` `renderErrorBanner(text,techInfo,deps={})` | 主因、技术详情、`{t?,emit?}` | 错误横幅元素；重试经 `emit("retry",{})`。 |
| `flow/reasoning.mjs` `renderReasoning(model={},deps={})` | `{text?}`、`{t?}` | `{el,content}`；`details` 默认展开，text 存在时经 `md` 渲染。 |
| `flow/tool-card.mjs` `linkifyPaths(bodyEl,links)` | 容器、`{raw,path,line?}[]` | 无返回值；每个文本节点最多包裹最早命中的一条链接。 |
| `flow/tool-card.mjs` `renderToolCard({name,args,id,roundTag,t,now}={})` | 工具头字段、词函数、时钟 | `{el,ref}`；ref 为 `{h,b,name,id,startTime,done:false}`，参数显示前 80 字符。 |
| `flow/tool-card.mjs` `finishToolCard(ref,name,text,links,truncated,deps={})` | 上行 ref、结果、链接、切片旗标、`{t?,now?}` | 无返回值；置 `done=true`，成功折叠、失败展开并显示耗时和摘要。 |
| `flow/tool-card.mjs` `renderToolHistory(name,text,idx)` | 工具名、结果、可选 idx | 折叠历史工具卡元素。 |
| `flow/tool-card-restore.mjs` `buildFinishedToolCard(tc)` | `{id?,name?,args?,result?,resultTruncated?}` | 恢复卡元素；非对象返回 `null`，args 可解析时 pretty JSON 入 body。 |
| `cards/permission.mjs` `renderApprovalCard(m={},deps={})` | `{tool,args?,diff?,owner?,promptId?}`、`{t?,emit?}` | 审批卡元素；回复为 `permissionResponse`，`approved` 为 `true`、`false` 或 `"approveAll"`。 |
| `cards/permission.mjs` `renderBatchApprovalCard(m={},deps={})` | `{count?,tools?,promptId?}`、`{t?,emit?}` | 批审批卡元素；`choice` 闭集为 `approveAll`、`oneByOne`、`deny`。 |
| `cards/question.mjs` `renderQuestionCard(model={},deps={})` | `{question,options?,promptId?}`、`{t?,emit?,onAnswered?}` | 提问卡元素；选项、自由文本和取消均发 `questionResponse`，取消 `answer=null`，核不自行摘卡。 |
| `cards/panel.mjs` `taskPanelVisible(progress,shown=false)` | `{items?}`、当前显示位 | 空 items 为 false；全 done 且未显示为 false，其余为 true。 |
| `cards/panel.mjs` `goalPanelVisible(goal)` | goal 或空值 | goal 真值即 true。 |
| `cards/panel.mjs` `renderTaskPanel(progress,deps={})` / `renderGoalPanel(goal,deps={})` | 面板模型、`{shown?,t?}` | `{el:DocumentFragment|null,visible}`；不可见时 `el=null`，宿主只隐藏、不清旧内容。 |
| `search.mjs` `createSearch(deps={})` | 必填 `root`、可选 `reveal(el)` | `{openSearch,closeSearch,performSearch,jumpSearch}`；root 缺失抛错。搜索防抖 150ms，高亮上限 500，超限计数加 `+`，仅跳转时滚动。 |

### 2.3 帧与增量 Markdown

| 导出 | 参数 | 返回值与异常契约 |
|---|---|---|
| `flow/frame.mjs` `FRAME_MIN_MS` / `flow/stream.mjs` `STREAM_RENDER_MIN_MS` | — | 均为 50ms。 |
| `createFrameMerge(deps={})` | `{apply(keys),raf?,now?,minMs?}` | `{mark(keys),flush()}`；mark 合并 Set 且单飞，flush 同步消费。调用 apply 前快照并清脏；异常直抛，apply 内新标记进入后帧。 |
| `createStreamRenderer(deps={})` | `{reasoning?,token?,subScroll?,frameEnd?,raf?,now?,minMs?}` | `{markReasoning,markToken,markSubScroll,flush}`；目标读取返回 `{el,raw}|null`，目标缺席保留对应脏位。flush 只同步画 reasoning 与 token。 |
| `paintStreamTarget(el,raw)` / `paintReasoningTarget(el,raw)` | 目标元素、原始文本 | 无返回值；均委托 `paintLiveMd`，推理版本随后把内容区滚到底。 |
| `appendToolOutput(el,text,deps={})` | 卡体、chunk、`{initial?}` | 返回 el；空串或 `_capped` 不写，超过 `MAX_TOOL_OUTPUT` 后截断并停收。 |
| `attachCopyButtons(container,deps={})` | 容器、`{t?}` | 无返回值；每个 `.code-block` 至多一钮，复制后 2000ms 复位；剪贴板异常不阻断复位。 |
| `flow/live-scan.mjs` `liveCut(raw,from=0)` | 文本、前一切点 | `{cut,blockStart,inline}`；from 归一到 `[0,text.length]`，只返回可证明闭合的最近切点。 |
| `flow/live-scan.mjs` `tailHeadEnd(text,cut)` | 文本、切点 | 热区行内有效前缀的结束位置。 |
| `flow/live-md.mjs` `liveInline(text)` | 文本 | `mdInline` 后将单换行转为 `<br>` 的 HTML。 |
| `flow/live-md.mjs` `paintLiveMd(el,raw)` | 目标元素、文本 | 无返回值；同文零写，前缀扩展增量提交，非前缀/失连/切点倒退全绘；异常写 `textContent=raw` 且 `_liveMd=null`。 |

## 3. 滚动与窗口

| 导出 | 参数 | 返回值与数值契约 |
|---|---|---|
| `NEAR_BOTTOM_RATIO` / `NEAR_BOTTOM_MIN_PX` / `PIN_GRACE_MS` | — | `0.5`、`24px`、`600ms`。 |
| `nearBottomThreshold(clientHeight)` | 视口高 | `max(24, clientHeight × 0.5)`；非有限输入按 0，返回值有限且至少 24。 |
| `nearBottom(el)` | 含三滚动读数的元素 | `scrollHeight-scrollTop-clientHeight < 阈值`；非数读数按 0，恰等于阈值返回 false。 |
| `applyPin(el,gate)` | 元素、pin 旗标 | gate 为 false 或元素无效返回 `null`；否则写 `scrollTop=Number.MAX_SAFE_INTEGER` 并返回该值。 |
| `createUnreadCounter(el,{countKey}={})` | 计数宿主、字段名 | `{read,bump,clear}`；计数存于 `el[countKey]`，非整数按 0，缺元素时不抛。 |
| `createPinWatch(el,opts,deps={})` | 元素；`{holder=el,flagKey,gestureGateMs=0,unpinOnUpScroll=false,onNearBottom,onGesture}`；可注入时钟 | `{read,set,attach,detach}`。attach/detach 幂等，detach 先取消宽限 timer。 |
| `subblocks/block.mjs` `GESTURE_GATE_MS` | — | `PIN_GRACE_MS` 的再导出，值 600ms。 |
| `initBlockFollow(block)` / `maybeScrollBlock(block)` | 子块元素 | 初始化无返回值；应用时折叠或离连块不写。让位期显示回底钮，点击回底并复跟。 |

`createPinWatch` 在直写模式下由 wheel/touchmove/scroll 按几何更新；门控模式还登记 pointerdown，远离底时只在手势窗内解 pin。

开启 `unpinOnUpScroll` 后，`deltaY<0` 立即解 pin 并起 600ms 窗。窗内上滚续期且不读几何，窗到期再判一次。

消息窗、历史页大小、prepend 补偿、消息块裁剪和回底按钮的 DOM 形式由宿主管理；核不保存会话或分页游标。

## 4. Composer 与活动块

### 4.1 Composer 公开面

| 模块与导出 | 参数 | 返回值与边界 |
|---|---|---|
| `composer/panel.mjs` `createComposerPanel(deps={})` | `{root,post,state,hooks,slash?}`；root 与 post 必填 | `{inputEl,setLoading,applyBusyLock,applyWords,isRunning,models}`；缺 root/post 抛错。忙时 running 才排队，Send 隐藏、Stop 显示；susp 不显示 Stop。 |
| `composer/atmenu.mjs` `createAtMenu({post,inputEl}={})` | 出站函数、输入元素 | `{el,applyWords,showAtDropdown,closeAtDropdown,isOpen,handleAtInput}`；请求 `{query,cwd:"",seq}`，防抖 150ms。 |
| `composer/controls.mjs` `createControlsRow({post,state,hooks,inputRow,inputEl}={})` | 出站、flags 读面、hooks、宿主元素 | `{el,modelBtn,reasoningBtn,modeBtn,applyWords,applyModeButtons,applyAutoApprove,applyAgentSettings,applyPlanMode,syncModeState,toggleAuto,togglePlan,toggleEng,setMode}`；AUTO 开启有确认，MODE 固定 tiny/normal/engineering，只有 engineering 时 PLAN 拒绝。 |
| `composer/model-menu.mjs` `effortSelection(levels,current,registeredDefault)` | 档位枚举、已存值、注册默认 | 已存有效值 > 有效默认值 > `null`；`current="none"` 且枚举无 none 时直接为 null。 |
| 同档 `openModelMenu({anchorEl,models,value,onPick,footer=[],up=false})` | 锚、候选、现值、拾取与页脚回调 | 无返回值；`onPick({provider,model,row})`。null/非数组为 loading，空数组为 empty；provider 行只开合，模型条目 click 才拾取。 |
| 同档 `closeModelMenu()` | — | 无返回值；摘 overlay 并移除监听，幂等。 |
| 同档 `createModelMenu(deps)` | `{post,state,hooks,modelBtn,reasoningBtn,controlsRow,blocked?}` | `{open,applyWords,close,closeReasoning,applyModels,models,selection,modelDropdown,reasoningDropdown}`；blocked 或 rollback 时禁止自动写回。 |
| `model-menu-state.mjs` `menuStateOf(models)` | 候选值 | 非数组为 `loading`，空数组为 `empty`，其余为 `list`。 |
| `model-menu-place.mjs` `computePlacement({anchorRect,viewport,panelHeight,panelWidth=270,up=false})` | 矩形、视口、面板尺寸、方向 | `{left,top}` 像素值；零矩形时视口居中，下方不足或 up 时向上。 |
| `model-menu-labels.mjs` `PROVIDER_SHORT` / `shortName(provider,group)` | provider、group | 常量短名表 / 显示短名；未登记时按当前 group 长度规则回退。 |
| `composer/slash.mjs` `parseSlash(text)` | 提交文本 | 非 `/` 起头返回 null；否则 `{name,args}`，name 含 `/` 并小写。 |
| 同档 `routeSlash(text,commands)` | 文本、端侧命令表 | null、`{kind:"unknown",name}` 或 `{kind:"command",cmd,args}`；名称先于别名。 |
| 同档 `formatHelp(commands,t)` | 命令表、词函数 | `{kind:"label"|"group"|"cmd",text}[]`；组序 Agent/Session/Project/System，无组条目不显示。 |
| `flow/queued-mark.mjs` `QUEUED_MAX_ITEMS` | — | 8。 |
| 同档 `paintLabel(el)` / `markPending(el)` / `clearPending(el)` | 用户消息元素 | 无返回值；分别重建普通标签、标记 pending、清除并重建普通标签。 |

### 4.2 附件公开面与预算

| 导出 | 参数或值 | 返回值与拒绝规则 |
|---|---|---|
| `RASTER_MIME` | `image/(png|jpeg|jpg|gif|webp)` | 只受理这五个栅格 MIME 字面。 |
| `TEXT_EXTS` | 公开扩展名数组 | 与 `text/*` 共同构成文本受纳面；无扩展名文件不能仅凭名称受纳。 |
| `TEXT_MAX_BYTES` / `TEXT_TURN_MAX_FILES` / `TEXT_TURN_MAX_BYTES` | `256000` / `4` / `512000` | 单档、每回合档数、每回合合计字节上限；在飞读取也计入。 |
| `BINARY_SCAN_BYTES` | `8000` | 前 8000B 含 NUL 即按二进制拒绝。 |
| `isTextFile(file)` | `{type,name}` | MIME 以 `text/` 起头或扩展名在表中时 true。 |
| `createAttachBar(deps={})` | `{images?}` | `{fileInput,attachBtn,pasteBar,pasteBadge,images,files,renderPasteBar,clear,applyWords}`；files 项为 `{name,size,text}`。 |
| `formatFileBlock({name,text})` | 文件名、正文 | `[Attached file: name]` 加 fenced 段；围栏为 `max(3,最长反引号串+1)`，info 为小写扩展名去点。 |
| `withAttachedFiles(text,files)` | 输入文本、文件列 | 空列原文返回；否则以两个换行连接各文件块。 |

### 4.3 relay 与块状态机

`RELAY_PREFIX_RE` 为 `/^([\w-]+)#(\d+)\//`。`relayPathOf(text)` 返回 `{head,inner,label,rest}`，无前缀返回 null。

`createRelayScope()` 返回 `{pendingAsync:Set,queued:Map}`；`queuedInfoOf(scope,key)` 返回缓存或 null；`isRelayToken(token)` 只快筛含 `⟦ev⟧` 或 `[model]` 且有合法前缀的文本。

| 导出 | 参数与返回值 |
|---|---|
| `relayEventToSubPatch(token,scope,deps={})` | scope 必填，缺失抛错；deps 为 `{syncLiveOf?,now?,onStripped?}`。返回下表 patch 或 null。 |
| `relaySubContentChunk(face,a,b)` | face 仅 `text/think/toolCall/toolOutput`；无前缀或其他 face 返回 null。成功返回 `{role,id,kind,text,sub?,tool?,face,cmd?}`，不含 `ch`。 |

| 输入 token | 产出 |
|---|---|
| `⟦ev⟧async` | 只登记 pendingAsync，返回 null。 |
| `[model]<model>` | `{status:"started",role,id,pool,model,startedAt,syncLive}`；pool 来自 pendingAsync，syncLive 仅在非池且宿主命中时 true。 |
| `⟦ev⟧queued` | `{status:"queued",role,id,kind,position,waiting,reason}`；slot 无 waiting/reason，depc 为 dependency-cancelled，其余为 waiting-deps。 |
| `⟦ev⟧turn` | `{status:"turn",role,id,turn,maxTurns}`，非法数值归 0。 |
| `⟦ev⟧cancelled` | `{status:"cancelled",was:"queued",role,id}`。 |
| `⟦ev⟧stopped` | `{status:"cancelled",role,id}`，不产 stopped 状态。 |
| `⟦ev⟧settled` / `⟦ev⟧done` | 对应 `{status,role,id}`，并清 queued 缓存。 |
| 嵌套事件、其他 `⟦ev⟧`、普通文本 | null；是否已消费由 `isRelayToken` 另行判定。 |

频道判据导出：`parseChannel(name)` 返回 `{channel,label,role,id,model}`；`findBlockNames(list,role,id,model,sessionId)` 返回匹配键数组。

`terminalKindOf(status)` 将 done/settled/answered 映射 done，cancelled/terminated 映射 stopped，error/failed 映射 error，其余 null。`terminalStubKind(m)` 对 answered 与 queued 取消返回 null；`stubAllowed(m)` 要求 role/id 存在、role 符合 `[\w-]+` 且回读一致。

`subBlocksReduce(list,patch,deps={})` 原地修改 list 并返回 `{list,effects}`；deps 支持 `{connectedOf?,regionOf?,now?,trace?,onChannelReset?}`。

`subBlocksFreezeAll(list,deps={})` 返回同形并冻结、归档活动区条目；`ensureSubBlock(list,key,deps={})` 返回 `{block,effects}`，冻结或墓碑时 block=null。

| patch 或调用 | 状态迁移与效果 |
|---|---|
| queued / started | 无块则 born；冻结块则 takeover；live 块复用；墓碑丢弃。started 只在 queued→running 时清状态词与 queueInfo。 |
| turn | 仅存活块更新 turn/maxTurns 并 refresh；冻结或墓碑留丢弃痕。 |
| approval | 仅既有存活块写 approval，tool=null 清态，不建块。 |
| cancelled + was=queued | 仍处 queued 的块 remove，不冻结。 |
| done / error / cancelled / terminated / failed / answered | 存活块 fold 后 archive；重复终态不复活。缺块时按 `terminalStubKind` 与 `stubAllowed` 决定 born→fold→archive。 |
| settled | fold + awaiting，驻留 awaitingDigest；后续 done 在轮边界 archive。 |
| freezeAll | 未冻结块 fold，活动区块 archive；interrupted 只给尚未冻结块补 note。 |

effects 闭集为 `born`、`takeover`、`fold`、`awaiting`、`archive`、`remove`、`refresh`，宿主必须按序执行并在每条执行时解析 key→DOM。

### 4.4 活动块 DOM 构件

| 导出 | 参数与返回值 |
|---|---|
| `renderSubBlock(model)` | 返回展开的子块 details，元素持 `_subMeta=model`；model 至少含 key/label/role/id。 |
| `renderSubDesc()` | 返回 `.sub-desc` 说明行；是否显示及插入位置由宿主决定。 |
| `renderSubagentChunk(block,m)` | 无返回值；m.kind 缺省 text，调用 appendAdvisorChunk 与 noteChunk，让位期有新行时置标记。 |
| `FAMILY_ROLES` / `CANCELABLE_ROLES` | 前者为 explore、plan、coder、eng-coder、eng-designer、advisor；后者再加 consult、escalate。 |
| `configureActivityView({tailLines}={})` | 无返回值；非负整数生效，允许 0，非法值回默认 3。 |
| `refreshBlock(block)` | 无返回值；重建头与折叠 tail，单行 tail 超 200 字符时截为 199 字符加省略号。 |
| `noteChunk(block,kind,text,m)` | 无返回值；工具调用写 `<sub>/<tool> — <cmd≤60>`，toolOutput 不写状态，advisor 输出例外只写 advisor 名，think 例外见需求 RC-A4。 |

## 5. 发行、会话恢复与验证

当前包元数据提供通配子路径导出与 public publish access；本档不据此宣称独立发布状态。VSC/Desktop 的随包和产物校验归各自发行文档。

核不持有宿主会话存储。live 子块只存在当前内存模型；归档后由宿主记录保存 meta/rows 并重建。增量 Markdown 的缓存只在目标元素 `_liveMd` 上，外部覆写或换文触发全绘，不跨会话复用。

验证应覆盖每个公开模块的参数和返回形状，并包含以下负例：近底等阈、非法几何、pin=false、apply 抛错后续帧、非前缀换文、热区失连、满队与三类附件拒绝、缺 scope、冻结/墓碑迟到内容、非法终态身份、queued 取消不补桩。

纯函数与状态机可直接在 Node 验证；DOM 构件在真 DOM 对拍增量与全量结果；VSC/Desktop/Server 的资源加载、分页、记录和协议验收由宿主真实入口承担。代码阅读只用于核对本契约，不等同于产品测试通过。
