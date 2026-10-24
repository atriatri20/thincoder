# 2026-10-15 · server-console-closeout
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 22:45「都并并批，能开的都开起来」+ 台账合并扫描（#1235 ∥ #1259 ∥ #1266 ∥ #1312 ∥ #1316 ∥ #1382 ∥ #1400 ∥ #1483——server · 归批）。
> 台账 = #1235（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轮次开账（2026-10-15 22:4x · 主 agent）**：触发 = 用户 22:45「都并并批，能开的都开起来」。**并入（10）**：#1235 runner 加入三细节 ∥ #1259 删节点 confirm ∥ #1266「我的」页数口径 ∥ #1312 `onSelectModel` 会话卫 ∥ #1316 审计规则行详情 ∥ #1382「恢复标准」钮闩 ∥ #1400 回读工具卡参数 ∥ #1483 成员页反馈形/diff 单源 ∥ **#1306**（审计/日志窗族——条件「审计面下触碰批」本批自然满足：S1 触及 `views-audit.mjs`）∥ **#1418**（MCP 编辑窗 args 口径——设计缺口，console 面同轮裁）。**不并**：server 机制面 14 条 = 另批（server-mech-closeout 同点）。授权 = 22:45 令；设计轮点火。

**尾注裁定（主 agent · 2026-10-15 23:2x）**
- 尾注①（`webui/READINGS.md:43` 载 `views-audit.mjs` = 250 vs `:90` 载 246，±4）：**实施轮实读一并记平**——随正清单增补该项（两处同拍）。
- 尾注②（⑫ 归属判「在射程」——面档 = `webui/READINGS.md` §2.1④）：**认可**；号内一句维持（`webui/READINGS.md:29-30` 随正成立）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（十覆盖；#1235 裁 A 已闭环；需求档五处回笔 = 主 agent 笔）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**轮次开账（2026-10-15 · eng-designer · initial 轮）**：覆盖十条（#1235 ∥ #1259 ∥ #1266 ∥ #1312 ∥ #1316 ∥ #1382 ∥ #1400 ∥ #1483 ∥ #1306 ∥ #1418）。零实施——本段 = 逐条修法/裁定 ∥ 落点 `file:line` ∥ 面 ∥ 验收；全部坐标为落笔当刻实读。

### #1235 runner 加入三细节 —— 【上抛·待裁；裁前按方案 A 预备】
- **核读（前提已灭）**：加入令牌/托管接入机制随沙盒架构迭代退场——现形 = `sandbox/SANDBOX.md:50-59`（添加节点 = `{name, address}` + 连通自检；无令牌）；`:85`（任务式装机退场——弹窗/端点族/服务件删净）；`:318`（运行面同形）；`store/STORE.md:335`（v12 弃 `token_hash`）；`src/sandbox/` 全域零 join/token 路由。三条对象现状：② 令牌 TTL = 对象已亡；③ join 失败人话 ≈ 已由「自检失败逐句人话 + `runner_selfcheck_failed` 审计」承接（`views-sandbox.mjs:248-256` 自检中态/就地人话——在盘）；①「runner 机要跑的含 `--server` 命令」对象亦亡。
- **裁定（方案 A——待主 agent 裁）**：① 重挂 = 添加节点弹窗增「节点侧接线提示」块（一句说明 + 命令原文 `dockerd -H fd:// -H tcp://0.0.0.0:2375`（systemd override）——可选中呈现，**不设复制钮**（http 内网面 clipboard 恒哑 = 假控件——先例 `webui/CHAT.md:50` ⑪）；文本源 = `sandbox/SANDBOX.md:59`；TLS 档补「证书 = 用户自备」同款）；② 撤（对象已亡——销账）；③ 销（核读达成——零动作）。
- **落点**：`public/views-sandbox.mjs:227-231`（弹窗体）+ i18n 两表 +1~2 键（提示句 ∥ 命令行题）+ `webui/SANDBOX.md:42`（接入面句随正一句）。
- **面**：控制台 UI + 文案 + 设计档。
- **验收**：弹窗含命令文本逐字（可选中、零复制钮）；②③ 销账记录入 §5。若裁 B（整条撤）⇒ 本条零实施。

### #1259 删节点「承载工作区 ⇒ confirm」UI
- **核读**：`views-sandbox.mjs:262-295`（删节点弹窗——容器二选一/不可达单确认；**无承载工作区步**）；服务端 `src/sandbox/routes.mjs:203-217` + `registry.mjs:365-372`（承载 ∧ ¬confirm ⇒ 400「先重建到新机，或确认丢弃 ⇒ confirm: true」）；confirm 后 = 解绑 + 删行 + 续放置（`registry.mjs:415-417`）。设计句已在册 = `sandbox/SANDBOX.md:72`、`:318`（「有承载工作区 ⇒ 二次确认」）——**实现缺 = 缺陷**。
- **修法**：弹窗并行取 `GET /api/admin/sandbox/workspaces`（既有端点），按 `runnerId === runner.id` 过滤；非空 ⇒ 警告句（N + 名——沿服务器同款措辞）+「确认丢弃」勾选（缺省不勾；删除钮先禁、勾后启）；提交体 = `{ containers: choice, confirm: true }`（勾选时）；无承载/不可达 ⇒ 体不携 `confirm`（现行两径零回归）。
- **落点**：`views-sandbox.mjs:262-295`（openRemoveRunnerModal）+ i18n 两表 +2~3 键（警告句 ∥ 勾标）。
- **面**：控制台 UI。
- **验收**：承载面 ⇒ 未勾钮禁、勾 ⇒ 恰一 DELETE 携 `confirm:true`、成 ⇒ 关窗 + flash；无承载 ⇒ 单确认现行；不可达 ⇒ 仅 keep 现行；单测直测该窗。

### #1266 「我的」页数口径（先核后裁——已裁）
- **现读**：`public/nav.mjs:14-37` NAV_GROUPS = **我的 7 ∥ 管理 11**；现值一致处 = `nav.mjs:2` 头注 ∥ `webui/WEBUI.md:209`（AC-12）∥ `agent/MEMBER-AGENT.md:376`（我的 7）∥ `webui/I18N.md:28`（十八页 + 登录）∥ `webui/MCP.md:63`（管理 11）。
- **不一处（收正清单）**：需求档（**主 agent 笔**——回笔清单：`:65`「我的六页 ∥ 管理十页」⇒ 七/十一；`:70`「侧栏十六页」⇒ 十八；`:293`「管理组 10 项」⇒ 11 项；`:384` AC-12「我的 **6**」⇒ **7**（并注口径句「登录页不属侧栏、不计入」）；`:500`「（`#/me/*` 三页）」⇒ 七页或按现语义改写）；设计档（**本批落**——`webui/SANDBOX.md:113`（管理 8 ⇒ 11）∥ `:114`（我的 **5** ⇒ **7**）∥ `webui/CHAT.md:19`（「控制台第 13 页（管理组第 9 项）」⇒ 实读「管理组第 2 项（全侧栏第 9 项）」）∥ `:202`（管理 9 ⇒ 11）∥ `webui/SYSTEM.md:80/:81`（管理 7 项 ⇒ 11 项））；表述澄清 = `webui/WEBUI.md:10` ∥ `webui/ME.md:80`「我的三页」⇒「我的·key/用量/账户三页」（文件覆盖面——非组计数）；「成员沙盒页未落」销 = `app.mjs:29/:107` 在位（`views-me-sandbox.mjs` 已落）——`webui/WEBUI.md:16`「拟新增」⇒「已落」。
- **裁定（口径）**：计数 = `NAV_GROUPS` 数据实读（组项数）；**登录页不属侧栏、不计入**（登录页单列——「十八页 + 登录」式）；各式计数语句与此一致。加口径句落点 = `webui/WEBUI.md` §2（IA 单源）。
- **面**：设计档（本批）+ 需求档（回笔）。
- **验收**：脚本读 `nav.mjs` 组项数 = 7/11；上列各处 grep 现值逐一对读；「我的三页」零残留。

### #1312 onSelectModel 回执会话卫
- **核读**：`public/views-chat.mjs:363-371`（回执直写 `detail.chat` + `renderSelector()`——无卫）；B70 先例 = `:374-379`（onSelectReasoning：入口捕 `chatId`，回执 `activeId === chatId` 卫）。
- **修法**：同 B70 一行式——入口 `const chatId = activeId`；回执 `if (activeId === chatId && detail !== null && data?.chat) { detail.chat = data.chat; renderSelector() }`。
- **落点**：`views-chat.mjs:363-371`。
- **面**：控制台 UI。
- **验收**：假 api 挂起期切会话 ⇒ 回执零写他会话（selector 零换）；成/败返回语义不变。

### #1316 审计 `sandbox_rule` 行详情（先核后裁——已裁）
- **核读**：`views-audit.mjs:84` 分派（`startsWith("sandbox_")` ⇒ `sandboxDetailText:231-245`——无 `action`/`rule` 支 ⇒ 恒「—」）；字段形 = `{ action, rule }`（`ACCOUNTS.md:69`——写入面退场、历史行原值可读；`SANDBOX.md:36`）；判据 = `webui/READINGS.md:30`（字段表含 `action`/`rule`）。
- **裁定（显示形）**：动作词 = 新增/删除（枚举外 ⇒ 原值兜底——本档通例）；rule = `allow`/`deny` 中文词 + `target`（`port` 在场 ⇒ `:port` 接尾）；`kind` 不入（target 形自明）。
- **修法**：新增导出 `sandboxRuleDetailText(detail)`（纯函数——单测直测，沿 `agentDetailText` 先例）；`eventsTable` 分派前置 `event.type === "sandbox_rule"` 支；i18n 两表 +4 键（`audit.sandboxRuleAdd` ∥ `.Remove` ∥ `.Allow` ∥ `.Deny`）。
- **落点**：`views-audit.mjs:84`/`:231-245` + 文案表（audit 键族部件）。
- **面**：控制台 UI + 文案。
- **验收**：夹具 rule 行（add/remove × allow/deny）⇒ 详情逐词、非「—」；未知 action/缺 rule ⇒ 原值/「—」兜底；既有型零回归。

### #1382 「恢复标准」钮入在飞闩
- **核读**：`views-sandbox-base.mjs:147`（恢复标准钮——onclick 直调 `save({baseImage:null})`）；`save(:159-171)` 仅闩 `submitBtn` ⇒ 在飞连点 = 双 PATCH。
- **修法**：恢复钮提为件级引用（`restoreBtn`）并入 `save` 闩集——在飞 ⇒ 双钮禁；败 ⇒ 双复。
- **落点**：`views-sandbox-base.mjs:147`/`:159-171`。
- **面**：控制台 UI。
- **验收**：在飞（假 api 挂起）连点恢复 ⇒ 恰一 PATCH `{baseImage:null}`；败 ⇒ 双钮恢复可重试。

### #1400 回读工具卡参数恒空
- **核读**：`views-chat-messages.mjs:91` 读 `row.data?.args` ⇄ `src/agent/chat.mjs:672` tool 行 data = `{ toolCallId, name, ok, summary }`（无 `args` 键）⇒ 恒空串；活流 = `views-chat.mjs:261`（帧 `args` = `argsTextOf` ≤500——`chat.mjs:660`）。
- **修法**：tool 行 data 增 `args: argsTextOf(call.arguments)`（`chat.mjs:672`——与帧同点同值 = 展示单源；沿 parity 批「tool 行携 content」先例；弃客户端 join 假 assistant `toolCalls.arguments`——两处整形 = 漂移面）；存量旧行零 `args` ⇒ 空串兜底（现行为、明示）。
- **落点**：`chat.mjs:672` + 文档随正：`gateway/API.md:195`（tool data 键集 +`args`）∥ `store/STORE.md:373` 注释 ∥ `agent/ADMIN-AGENT.md:123`（KD-SV-89 行）。
- **面**：服务端落库 + 文档。
- **验收**：新生成一条工具调用 ⇒ 回读卡参数 = 活流同字（同值断言）；「预算超限——未执行」行零变；旧会话回读零回归。

### #1483 成员页反馈形 ∥ diff 单源相抵（先核后裁——已裁）
- **① 反馈形**：核读 `views-me-chat.mjs:114`（复制降级 = `ctx.flash` + `showToast` **双发**）；设计单源 = `agent/MEMBER-AGENT.md:317`（「降级形 ⇒ toast」）。裁 = **删 `ctx.flash` 一侧**（页面级 flash 他点 `:323`/`:350` 零动；注释随正）。
- **② diff**：核读现实现 = `public/views-me-chat-cards.mjs:112-126`（节点自组：判类/差分取核 `patchLineType`/`lineDiff`；头注 `:9-10` 已载「页 canon 零 `innerHTML`」）；设计句缺口 = `MEMBER-AGENT.md:254`（`permission` 行只写「页内弹窗全量 patch」）。裁 = **设计句收正、核件零改**——行内补「（节点自组——判类/差分取核 `patchLineType`/`lineDiff`；`renderDiff`（HTML 串）不入页消费）」；理由 = `renderDiff` 为核内件（`thincoder-render-core/cards/permission.mjs:35` 桌面在用），页 canon 零 `innerHTML` 保。
- **落点**：`views-me-chat.mjs:114`；`agent/MEMBER-AGENT.md:254`。
- **面**：控制台 UI + 设计档。
- **验收**：复制降级（http 无安全上下文）⇒ 恰一 toast、零 flash；diff 弹窗两形（`{patch}` ∥ `{old,new,path}`）行为零变。

### #1306 日志窗族（先核后裁——已裁）
- **① 操作记录取数**：核读 `views-sandbox-containers.mjs:310-314`（全局 latest 200 + 客户端 `containerId` 过滤 ⇒ 密集活动挤掉本容器较早行、无提示）；`accounts/audit.mjs:68-108`（参数面 = type/member/from/to/limit；上限 500）；`accounts/routes-admin.mjs:29-40/:91-94`。**裁 = 取②（`/api/audit` 增 `containerId` 过滤）+ cap 诚实提示**（`events.length >= limit` ⇒ 提示行）——弃①（人话-only 留错误数据面）。
- **① 落点**：`accounts/audit.mjs:68-108`（+参——等值 `detail.containerId`）+ `routes-admin.mjs:29-40`（读参）+ `views-sandbox-containers.mjs:310-314`（URL 携参 + 提示行）+ i18n 两表 +1 键（`admin.sandbox.logsOpsTruncated`）+ 文档随正 `gateway/API.md`（审计端点行）∥ `accounts/ACCOUNTS.md` §2.1（注）。
- **② 并流退化口径**：核读 `views-sandbox-containers.mjs:277-285`（`ts:null` 原位呈、不带时间列）∥ `:290-307`（比较式）；设计面 = `sandbox/SANDBOX.md:91`（「排序单源 = timestamps=1」）。**裁 = 档内写死口径、代码零改**——`:91` 处补句：「无时标输出行（首 token 非时标）= 次序未知 ⇒ 不作时间参照物——比较仅在操作行与**可解析时标行**间进行；无时标行原位先呈、操作行顺延（时间序在可解析元素间保持）」。附论：改判「仅对可解析行比较」与现行为**等价**（任一可解析行比较先行消化全部 ≤ 其时点的操作行）；改判为「无时标行放行操作行」则破操作行 × 可解析行序 ⇒ 不取。代码注释随正（可选一行）。
- **② 落点**：`sandbox/SANDBOX.md:91`（+注释可选 `views-sandbox-containers.mjs:290`）。
- **面**：服务端 API + 控制台 UI + 设计档。
- **验收**：假数全局密集 ⇒ 本容器操作行取数 = 本容器（不再被挤）；达 200 ⇒ 提示行在场；无时标行仍原位、无时间列；审计页/过滤零回归；单测直测 `queryAudit` 过滤。

### #1418 MCP 编辑窗 args（设计缺口——裁）
- **核读**：`src/mcp/store.mjs:145-158`（`mcpServerView`——`target` 单列、零 `args`）；`views-mcp.mjs:139`（argsArea 无回填）∥ `:156-157`（空 ⇒ 不携键）；服务端清空可表达（`store.mjs:51-53`——`[]` ⇒ null）；文档缺口 = `webui/MCP.md:10/:32`（回填面只写 target/秘密零回填）∥ `mcp/MCP.md:52`（args 明文披露在案）。
- **裁定**：**回填**——args = 明文列（与 `command`/`url` 同类；披露在案）⇒ 清单行下发 `args`（stdio 行；http/ws 恒 null 零涉）；编辑窗回填 argsArea；提交语义 = 与原值相同 ⇒ 不携键；不同（含清空）⇒ 携 `args`（空 ⇒ `[]` = 服务端清）；**秘密三键（token/headers/env）恒定零回填**（零改）。
- **落点**：`src/mcp/store.mjs:146-158`（view +`args: parseArgsJson(row.args_json)`）+ `views-mcp.mjs:139/:156-157`（回填 + 差异提交）+ `webui/MCP.md:10/:32/:67`（边界句限定为秘密三键）+ `gateway/API.md` §2.13（GET 行形 +`args`）+ `mcp/MCP.md:49`（行形注）。
- **面**：服务端 API + 控制台 UI + 文档。
- **验收**：编辑 stdio 行 ⇒ args 逐值在窗；不改动保存 ⇒ 体无 `args` 键（库零变）；清空保存 ⇒ `args: []` ⇒ 真源 NULL；清单响应零秘密（`hasSecrets` 唯一信号不变——键面扫描）。

### 横切一：受影响文件与测试覆盖
- **源代码面（行数 = 落笔实读，Δ 预估）**：`public/views-sandbox.mjs`（296 ⇒ +≈20）∥ `public/views-sandbox-base.mjs`（237 ⇒ +≈4）∥ `public/views-sandbox-containers.mjs`（426 ⇒ +≈4）∥ `public/views-audit.mjs`（246 ⇒ +≈14）∥ `public/views-chat.mjs`（440 ⇒ +≈2）∥ `public/views-me-chat.mjs`（500 ⇒ 0——行内改）∥ `public/views-mcp.mjs`（258 ⇒ +≈6）∥ `src/agent/chat.mjs`（737 ⇒ +1）∥ `src/mcp/store.mjs`（339 ⇒ +1）∥ `src/accounts/audit.mjs`（127 ⇒ +≈4）∥ `src/accounts/routes-admin.mjs`（+1）；i18n：sandbox 两表 +3 键/表（#1235 ∥ #1306）∥ admin 两表 +4 键/表（#1316）。全部在 500 软线内。
- **设计档随正**：`webui/SANDBOX.md`（:42 ∥ :113 ∥ :114）∥ `webui/CHAT.md`（:19 ∥ :202）∥ `webui/SYSTEM.md`（:80/:81）∥ `webui/WEBUI.md`（§2 口径句 ∥ :10 ∥ :16）∥ `webui/ME.md`（:80）∥ `sandbox/SANDBOX.md`（:91）∥ `agent/MEMBER-AGENT.md`（:254）∥ `webui/MCP.md`（:10/:32/:67）∥ `mcp/MCP.md`（:49）∥ `gateway/API.md`（:195 + 审计端点行 + §2.13）∥ `store/STORE.md`（:373）∥ `agent/ADMIN-AGENT.md`（:123）∥ `accounts/ACCOUNTS.md`（§2.1 注）。
- **测试覆盖（批内单元测试档——用后即删，沿政策）**：① `views-sandbox` 删节点窗承载门（#1259）② nav 组项数 7/11（#1266）③ `views-chat` onSelectModel 卫（#1312）④ `sandboxRuleDetailText`（#1316）⑤ 恢复钮单请求（#1382）⑥ `queryAudit` containerId 过滤（#1306）⑦ MCP args 回填/差异提交（#1418）⑧ 复制降级单 toast + diff 弹窗回归（#1483）⑨ tool 行 args 落库（#1400）。集成面 = 不适用（控制台面——收口轮浏览器实走）。

### 横切二：关键决策（含弃案）
- K1 #1306 取服务端过滤（②）+ cap 提示；并流取「档内写死」（改码等价/退化——反例在案）。
- K2 #1316 显示形 = 动作词 + 允许/拒绝 + target（+port）；`kind` 不入。
- K3 #1418 args 回填，明文列/秘密三键分界沿 `mcp/MCP.md:52` 披露。
- K4 #1483② 设计句收正（核件零改）——页 canon 零 `innerHTML` 保；`renderDiff` 留核内件。
- K5 #1266 计数口径 = `NAV_GROUPS` 实读、登录页不计入。
- K6 #1235 方案 A（上抛待裁——见下）。

### 横切三：上抛项
- **[上抛·待裁] #1235**——前提已灭（ask 已发）；答复到前按方案 A 预备；若裁 B ⇒ 整条撤（零实施）。
- **[上抛·知会] 需求档回笔**——`requirements/PROJECT.md` 五处（#1266） = 主 agent 笔（清单见上）。
- **[上抛·知会] 范围外注记**：① R 表内旧计数注记（`project/PROJECTS.md:230` R70 ∥ `design/PROJECT.md:272` R49 等）= 文档残留收正族（#1491 在途——不并）；② `nav.mjs:2` 头注 = 历史批注累积（批名 ≈8 处）——代码注释面随正族，非本批；③ `docs/TEST-ENV-ECS.md` §7 残留（`thincoder-runner.service` 已不存在——R52② 在册）——#1235① 引用前须随正（或按 `sandbox/SANDBOX.md:59` 文本源直接落）。

**#1235 裁定回填（2026-10-15 · 主 agent 裁 A——上抛闭环）**：本条由「待裁」转定稿（横切三「[上抛·待裁] #1235」项随之闭环）；三条依据逐条落定（收口时入台账 evidence）：**② 撤回依据** = `sandbox/SANDBOX.md:50-59`（添加节点现形 = 直填地址 + 连通自检，无令牌）∥ `:85`（托管接入退场）∥ `:318`（运行面同形）∥ `store/STORE.md:335`（v12 弃 `token_hash`）∥ `src/sandbox/` 零 join/token 路由——令牌对象亡；**③ 承接依据** = 自检失败逐句人话（`views-sandbox.mjs:248-256`）+ `runner_selfcheck_failed` 审计（设计 = `sandbox/SANDBOX.md:58`——失败 ⇒ 502 + 逐句人话 + 零落库 + 审计行；在盘）——零动作核读销；**① 定稿件形** = 说明句 + 命令文本（`<pre class="snippet">` 可选中）+ **复制钮按可用性门**（`navigator.clipboard` 在场 ⇒ 钮在场；缺 ⇒ 钮不渲染——零假控件、零新机制；判式沿 `views-me-chat.mjs:108` `clipboardReady` 先例）——「可复制件形」在 http 内网下由可选中文本承接。① 落点/验收不变（`views-sandbox.mjs:227-231` + i18n 两表 **+2 键**（提示句 ∥ 命令行题）+ `webui/SANDBOX.md:42` 随正一句）。横切一行账随定稿：sandbox 两表 +3 键/表 = #1235 计 2 键 + #1306 计 1 键。实施如发现提示块与自检流冲突（布局/在飞态）⇒ 报告不扩（沿裁令边界）。

**§2 修正轮（fix · 2026-10-15 · eng-designer）——§3 轮次 1 逐号落点（①–⑫）**

依据 = §3 轮次 1（VERDICT pass；🟡6 ∥ 🔵5 + 表外注记——父侧逐条裁受理）。机制 = **append-only**（旧行不动；与旧行冲突处以本块为准）。范围 = 本块：不触产品码 ∥ 不触设计档正文 ∥ 不改 §1/§3；「随正清单」所列为实施轮同拍项。本块数字 = 落笔当刻实读（内容行口径——与表内他行同）。

①（审#1）**#1235 验收行终稿形 + 旧表述显式失效**：`:22` 验收行终稿形 =「弹窗含命令文本逐字可选中 ∥ `navigator.clipboard` 在场 ⇒ 复制钮、缺 ⇒ 零钮（零假控件）；②③ 销账记录入 §5」——本项即 `:22` 现行口径（append-only 不改旧行）。**显式失效**（裁 A 已闭环；以 `:107` + 本追加为准）：`:19`「不设复制钮」∥ `:22`「（可选中、零复制钮）」∥ `:22`/`:103`「若裁 B（整条撤）⇒ 本条零实施」——三处不再有效，实施按终稿形走。

②（审#2）**`views-sandbox.mjs` 实读钉定（落笔当刻）**：**296** 行——与 `:90` 记数一致（两档记平：本档侧达成；`webui/SANDBOX.md:82` 载「502 ⇒ −≈190……实读待实施轮回填」= 过期读数）。296 ≤ 500 软线 ⇒ **拆案不触发**（`:101` 触发句「越线再现」未成立——本批零拆案、增量零前置）。**随正清单收** `webui/SANDBOX.md:82/:101/:23`：`:82` 行数记平 296（越线随解——托管接入件删净已达成；「实读待实施轮回填」注销）；`:101` 同拍记平（502/越线前提消解）；`:23` 坐标校正——添加节点自检实现 `views-sandbox.mjs:368-376` ⇒ **`:248-256`**（自检中态/就地人话现行位）。

③（审#3）**随正清单扩容——五族（照单全收，不再扩）**：⑴ `webui/WEBUI.md:171`（`views-me-sandbox.mjs`「拟新增」）vs `webui/SANDBOX.md:96`（已落——与 `:33` 已修 `:16` 同类漏列）；⑵ 终端族 `webui/WEBUI.md:21`/`:174-177`（「拟新增」∥「终端核三件」未含拆出的 vt/codec）vs `webui/SANDBOX.md:90-95`（已落：125/495/117/89/361/133）；⑶ `views-sandbox-base.mjs` 两处落态 = `webui/SANDBOX.md:86`/`webui/WEBUI.md:169`（拟新增 ≈260）vs `:90`（237 ⇒ +≈4）；⑷ `views-mcp.mjs`＋两 i18n 部件三档对读 = `webui/WEBUI.md:22`/`:199-201`（已落；248/55）vs `webui/MCP.md:50-52`（拟新增 ≈320/≈75）vs `:90`（258）；⑸ `webui/SANDBOX.md:112`（`views-sandbox-volumes.mjs`「拟新增」）vs 同档 `:88`（已落 ≈130）。落地口径 = 实施轮同文件行数/落态一次实读记平。

④（审#4）**随正清单增补（面档 = 改动后行为单源）**：`webui/SANDBOX.md:16`（添加节点弹窗内容——收录 #1235 提示块）∥ `:17`（删节点弹窗正文——收录 #1259 承载工作区步）∥ `webui/MCP.md:32`（编辑态行为——收录 #1418 args 回填 + 差异提交；秘密三键零回填限定不变）∥ `:63`（AC-54 ⑥ 行同拍收正）。

⑤（审#5）**补「最近先例（对齐 ∥ 偏离）」线**（线形在册 = `webui/SANDBOX.md:23`/`webui/MCP.md:38`）：
- #1235 = `views-me-chat.mjs:108` `clipboardReady`（可用性门）——对齐（同判式：`navigator.clipboard` 在场 ⇒ 控件在场）；偏离 = 零。
- #1259 = **无直系先例——设计拍**（窗形沿同档弹窗体例；警告措辞沿服务器 400 原句）。
- #1266 = **无直系先例——设计拍**（计数口径 = `NAV_GROUPS` 数据实读；登录页单列不计）。
- #1312 = B70 先例（`views-chat.mjs:374-379`）——对齐（一行式会话卫）；偏离 = 零。
- #1316 = `agentDetailText` 先例（`views-audit.mjs:231-245`——纯函数直测）；偏离 = i18n 取件入参（见⑧）。
- #1382 = 件内闩集先例（`views-sandbox-base.mjs:159-171`）——对齐（恢复钮并入同集）；偏离 = 零。
- #1400 = parity 批「tool 行携 content」先例——对齐（`chat.mjs:672` 与活流帧同点同值 = 展示单源）；偏离 = 零。
- #1483① = 设计单源先例（`agent/MEMBER-AGENT.md:317`——降级形 ⇒ toast）——对齐（删 `ctx.flash` 一侧）；偏离 = 零。
- #1483② = 页 canon 先例（`views-me-chat-cards.mjs:112-126`——节点自组、零 `innerHTML`）——对齐（设计句收正、核件零改）；偏离 = 零。
- #1418 = 披露先例（`mcp/MCP.md:52`——明文列/秘密三键分界）——对齐（args 归明文列 ⇒ 回填）；偏离 = 零。
- #1306① = 参数面先例（`accounts/audit.mjs:68-108`——type/member/from/to）——对齐（等值参扩入）；偏离 = 零。
- #1306② = **无直系先例——设计拍**（档内写死口径、码零改；改判等价核读在案）。

⑥（审#6）**补「调研证据」线**：① 工作树内公开源/独立文档仓 = 零——`PROJECT-MANIFEST.json` `index.publicRepos: []`（零声明源）⇒ 记「无相关」；② 平台公开语义核读 1 条（相关）：`navigator.clipboard` 仅安全上下文（HTTPS）——源 = MDN（`Clipboard API` ∥ `Navigator.clipboard`——「Secure context: This feature is available only in secure contexts (HTTPS)」）⇒ 支撑 `:19`/`:107`「http 内网面 clipboard 恒哑」判定（承载 = `views-me-chat.mjs:108`；先例在册 = `webui/CHAT.md:50` ⑪）；③ 参考系 `D:\ref\`（AGENTS.md 在册——工作树外、未入声明源）本批未查——无涉（本批全数为项目内部件）。

⑦（审#7）**i18n 账收正**：sandbox 两表合计 delta = #1235 计 2 + **#1259 计 2~3** + #1306 计 1 = **+5~6 键/表**（`:90`/`:107`「sandbox 两表 +3 键/表 = #1235 2 + #1306 1」漏 #1259——以本行为准）；admin 两表 = #1316 +4 键/表（不变）。四表现行行数（落笔实读）：`i18n-zh-sandbox.mjs` **278** ∥ `i18n-en-sandbox.mjs` **278** ∥ `i18n-zh-admin.mjs` **177** ∥ `i18n-en-admin.mjs` **181**——注：`webui/SANDBOX.md:97` 载「233 行 · 键 208」（并列在途 ≈259/≈275）= 撰写时数、现已落至 278 ⇒ 随正记平。

⑧（审#8）**#1316 签名注明 i18n 取件**：`sandboxRuleDetailText(detail, t)`——i18n 取件显式入参（保纯函数可直测；视图面 `t` 经 ctx 注入——`webui/WEBUI.md:286`）。

⑨（审#9）**#1306① 补过滤位置句**：`containerId` 过滤在**查询/截取前**施加——cap 提示对过滤后集合生效（落点 = `accounts/audit.mjs:68-108` ∥ `routes-admin.mjs:29-40`）。

⑩（审#10）**`webui/SANDBOX.md:100` 小计口径注**：面小计 ≈4279 vs 逐行合计 4077 差 ≈202 ⇒ 实施轮实读时记平面小计与逐行和（或注明小计口径）；随正清单收 `:100`。

⑪（审#11）**#1235 TLS 档前置句**：连接段在位 ⇒ 同窗（添加节点弹窗）补「证书 = 用户自备」；未在位 ⇒ 随连接面批补（避静默省件）。核读（落笔当刻）：`views-sandbox-connection.mjs` 在盘 ∥ `views-sandbox.mjs:21`（import）/`:224`（添加节点弹窗挂载）在位 ⇒ **同窗径成立**。

⑫（表外注记 · 核实）**`webui/READINGS.md` 应收录——在射程**：审计页面档 = `webui/READINGS.md` §2.1④，其详情句（`:29-30`——「…`action`/`rule`（沙盒规则）…」）即 #1316 改动面；显示形需设计档居所（本档为过程档、可弃）⇒ **随正清单增补 `webui/READINGS.md:29-30`**（收正 = sandbox_rule 行详情形：动作词（新增/删除——枚举外原值兜底）+ 允许/拒绝 + target（`port` 在场 ⇒ `:port`）；`kind` 不入）。核读 = 本次落笔实读（非「零涉」）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象 = 本档 §2（十条；设计完成、零实施）；评审范围 = 本档 ∥ `webui/SANDBOX.md` / `ME.md` / `WEBUI.md` / `MCP.md`（全读）。范围外坐标（`views-*.mjs`、`src/**`、`sandbox/SANDBOX.md`、`agent/*`、`gateway/*`、`store/*`、`accounts/*`、`requirements/*`）未核——不据此断言。无项目标准档/文档地图在案：方法学按 AGENTS.md + 档内在册惯例判。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|------|--------|------|------|
| 1 | 文档卫生 | 🟡 | #1235 复制钮口径三形并存：`batch:19`「不设复制钮」被 `batch:107`「复制钮按可用性门」取代；`batch:22` 验收仍作「（可选中、零复制钮）」且被 `batch:107` 声明「① 落点/验收不变」——安全上下文下钮在场 ⇒ 该验收字面失败；`batch:22`/`batch:103`「若裁 B（整条撤）⇒ 本条零实施」未随裁 A 闭环退场。 | 验收行改写成终稿形（命令文本逐字可选中 ∥ `navigator.clipboard` 在场 ⇒ 复制钮、缺 ⇒ 零钮）；作废表述与 B 条件句以追加更正显式失效（append-only 不改旧行）。 |
| 2 | 受影响文件行数标注 | 🟡 | `views-sandbox.mjs` 两读不能同真：`batch:90`（296 ⇒ +≈20）vs `webui/SANDBOX.md:82`（**502** ⇒ **−≈190**、「实读待实施轮回填」）；`webui/SANDBOX.md:101` 定「触发 = 下一触碰该档的批（越线再现 ⇒ 该批增量前先落拆案）」——本批即该批；`webui/SANDBOX.md:23` 又把添加节点自检实现标在 `views-sandbox.mjs:368-376`（与 296 行文件不相容；`batch:18` 读作 248-256）。 | 实施前钉定现行实读并记平两档；`webui/SANDBOX.md:82/:101` 收入随正清单；实读 >500 ⇒ 先落拆案再计增量；`:23` 坐标同拍校正。 |
| 3 | 文档归属（落态残留） | 🟡 | 「拟新增/已落」残留未随 #1266 清册扫净：⑴ `webui/WEBUI.md:171`（`views-me-sandbox.mjs` 拟新增）vs `webui/SANDBOX.md:96`（已落）——与 `batch:33` 已修的 `:16` 同类而漏列；⑵ 终端族 `webui/WEBUI.md:21`/`:174-177`（拟新增）vs `webui/SANDBOX.md:90-95`（已落，125/495/117/89/361/133；WEBUI.md 仍述「终端核三件」不含拆出的 vt/codec）；⑶ `views-sandbox-base.mjs`：`webui/SANDBOX.md:86`/`webui/WEBUI.md:169`（拟新增 ≈260）vs `batch:90`（237 ⇒ +≈4）；⑷ `views-mcp.mjs`＋两 i18n 部件：`webui/WEBUI.md:22`/`:199-201`（已落；248/55）vs `webui/MCP.md:50-52`（拟新增 ≈320/≈75）vs `batch:90`（258）；⑸ `webui/SANDBOX.md:112` 行内（`views-sandbox-volumes.mjs`——拟新增）vs 同档 `:88`（已落 ≈130）——同档自相矛盾。 | 随正清单扩容至上述各行（或归口文档残留收正族并注明）；同文件行数/落态一次实读记平。 |
| 4 | 文档归属 | 🟡 | 机制改动未收进 owning section：`webui/SANDBOX.md:17`（删节点弹窗正文）未含 #1259 的承载工作区步（`batch:26` 只落代码＋i18n）；`webui/SANDBOX.md:16`（添加节点弹窗内容）未含 #1235 提示块（`batch:20` 只计划 `:42` 一句）；`webui/MCP.md:32`（「编辑态秘密字段：零回填」）/`:63`（AC-54 ⑥）未收录 #1418 的 args 回填与差异提交（`batch:85` 只「边界句限定为秘密三键」）。 | 将 `webui/SANDBOX.md:16/:17` 与 `webui/MCP.md:32/:63`（编辑态行为 + AC 行）收入随正，保面档为改动后行为的单源。 |
| 5 | 方法学 | 🟡 | 设计档无「最近先例」线（三坐标 = 实现坐标 ∥ 对应设计档节 ∥ 先例批 + 对齐/偏离理由）：`batch:39`（B70）、`batch:48`（`agentDetailText`）、`batch:62`（parity 批）、`batch:107`（`clipboardReady`）散见引用；#1259/#1382/#1266/#1306② 等条无先例坐标、亦无「无直系先例」显式声明（面档线形在册 = `webui/SANDBOX.md:23`、`webui/MCP.md:38`）。 | 补「最近先例（对齐 ∥ 偏离）」线（逐条或横切）：给坐标与对齐/偏离理由；无先例者显式声明「无直系先例——设计拍」。 |
| 6 | 方法学 | 🟡 | 无「公开文档源核查」线（查了哪些公开源/独立文档仓 ∥ 是否有相关——「无相关」亦须记）；`batch:107` 的 clipboard 可用性门等公开语义主张无来源记录。 | 补核查线并列源与结论；未查 ⇒ 显式记「未查」，不留空白。 |
| 7 | 受影响文件行数标注 | 🔵 | i18n 记账不全：`batch:90`/`batch:107`（「sandbox 两表 +3 键/表 = #1235 计 2 键 + #1306 计 1 键」）漏 `batch:27` 的 #1259「i18n 两表 +2~3 键（警告句 ∥ 勾标）」——两表 delta 应为 +5~6 键；四张 i18n 表未标现行行数（sandbox 两表 233 = `webui/SANDBOX.md:97`）。 | 行账补 #1259 键数；i18n 四表按「现行行数 ⇒ Δ」补注（sandbox 两表 233 ⇒ +5~6 键/表）。 |
| 8 | 清晰度 | 🔵 | #1316 新函数签名 `sandboxRuleDetailText(detail)`（`batch:48`）未含 i18n 取件，而输出依赖 +4 键；视图面 `t` 经 ctx 注入（`webui/WEBUI.md:286`）。 | 注明 i18n 取件（如 `(detail, t)` 或经 ctx 传入），保纯函数可直测。 |
| 9 | 清晰度 | 🔵 | #1306① 未写明 `containerId` 过滤的施加位置：`batch:76` 仅「+参——等值 `detail.containerId`」；「不再被挤」（`batch:80` 验收）取决于过滤先于 limit 截取。 | 落点补一句：过滤在查询/截取前施加（cap 提示对过滤后集合生效）。 |
| 10 | 受影响文件行数标注 | 🔵 | 抽检：`webui/SANDBOX.md:100`「面小计 ≈4279」与该表逐行合计 4077 差 ≈202（档内自注「以实施当刻盘面实读为准」）。 | 实施轮实读时记平面小计与逐行和（或注明小计口径）。 |
| 11 | 清晰度 | 🔵 | #1235「TLS 档补『证书 = 用户自备』同款」（`batch:19`）依赖连接面落态；在册档显示连接件拟新增（`webui/SANDBOX.md:87`/`:48`/`:119`/`:97`）——未核（源码超范围）。 | 落点写明前置：连接段在位 ⇒ 同窗补句；未在位 ⇒ 随连接面批补——避静默省件。 |

表外注记（不计严重度）：范围外核实项——`webui/READINGS.md`（审计面 §2.1④）是否应收录 `sandbox_rule` 行详情形（#1316）；全部范围外坐标的核读均未复验。

VERDICT: pass

计数：🔴 0 ∥ 🟡 6 ∥ 🔵 5（共 11；均不阻塞）

## §4 用户批准（主 agent）

**用户批准**：2026-10-15 23:54「**批**」（11 批队列放行——本批实施轮 eng-coder#50 在其列）。
**评审记录**：§3 设计评审 = 通过；实施侧 advisor code 评审 = **pass**（🔴 0 ∥ 🟡 4——3 认账不修 + 1 协调项，逐条见 §6⑥ ∥ 🔵 5——3 已修 2 认账）。
**面判**：本批实施 = 五条代码缺陷 + 五条文档随正（10 项）；需求档回笔非本席面（主 agent 笔，已入册）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-16（终态 clean——十项落地、审计 0 未披露改动、评审 pass（🔴 0）；2 条上抛待裁/知会）



### 实施记录（eng-coder · 首轮）

**§5.1 逐项落地（§2 十项）**

| # | 项 | 落点 | 证据（file:line / 实读） |
|---|---|---|---|
| 1 | #1259 删节点承载确认 | `views-sandbox.mjs`（`openRemoveRunnerModal` 重写）∥ i18n sandbox 两表 +2 键 | 并行取容器 + `/api/admin/sandbox/workspaces` ⇒ 过滤 `String(workspace.runnerId) === String(runner.id)`；有承载 ⇒ 警告 + 「确认丢弃」勾（未勾 ⇒ 删除钮禁）；体 `boundCount > 0 ? { containers, confirm: true } : { containers }` |
| 2 | #1266 计数口径 | `webui/WEBUI.md` §2 增口径句 ∥ `webui/CHAT.md:19`、`:202` ∥ `webui/SYSTEM.md:80/:81` ∥ `webui/READINGS.md:55` ∥ `webui/SANDBOX.md:113/:114` | 口径 = `nav.mjs` `NAV_GROUPS` 数据实读；登录页不属侧栏、不计入 ⇒ 我的 7 ∥ 管理 11（全侧栏 18 页）；单元测试 `#1266` 直测通过 |
| 3 | #1312 换模型回执会话卫 | `views-chat.mjs` `onSelectModel` | 取 `const chatId = activeId`；回执门 `activeId === chatId && detail !== null && data?.chat`；单元测试 `#1312` 走真实模型菜单拾取径，红/绿两径对照通过 |
| 4 | #1316 沙盒规则行详情 | `views-audit.mjs` 新导出 `sandboxRuleDetailText` + 分派支序前置（`event.type === "sandbox_rule"`）∥ i18n system 两表 +4 键 | 枚举外原值兜底；`null`/`{}` ⇒ `—`；单元测试 `#1316` 直测通过 |
| 5 | #1382 「恢复标准」入在飞闩 | `views-sandbox-base.mjs`（`restoreBtn` 提到件作用域 + 入 `save()` 闩集） | 在飞双钮禁、连点恰一 PATCH、败后双钮复；单元测试 `#1382` 通过 |
| 6 | #1306 审计按容器过滤 | `src/accounts/audit.mjs`（`queryAudit` +`containerId`）∥ `src/accounts/routes-admin.mjs`（读参）∥ `views-sandbox-containers.mjs`（`OPS_LIMIT` + 服务端过滤 + 截断提示） | WHERE `(json_valid(detail) AND json_extract(detail,'$.containerId') = ?)`——`json_valid` 卫必要（裸 `json_extract` 对坏行抛 "malformed JSON"）；单元测试 `#1306` 证「过滤先于截断」：旧径命中 0 ∥ 新径命中 1 |
| 7 | #1418 MCP args 回填/差异提交 | `views-mcp.mjs`（`argsArea` 编辑态回填 + `draftBody` 差异提交） | 未改 ⇒ 体不携 `args`（库零变）；清空 ⇒ `args: []`；单元测试 `#1418` 通过 |
| 8 | #1483① 复制降级单 toast | `views-me-chat.mjs:114` | 删 `ctx.flash(...)` 支、留 `showToast(...)`；单元测试 `#1483①` 通过 |
| 9 | #1400 tool 行 data 携 args | `src/agent/chat.mjs:672`（`args: argsTextOf(call.arguments)`） | 与活流帧 `:660` 同值（展示单源）；budget 未执行行（`:650`）零动；单元测试 `#1400` 断言 `toolRows[0].data.args === callFrame.args` |
| 10 | #1235 节点侧接线提示 | `views-sandbox.mjs`（`clipboardReady()` + `nodeWiringBlock(h)`）∥ i18n sandbox 两表 +2 键 | 说明句 + 命令文本 `<pre class="snippet">` 可选中；复制钮按 `navigator.clipboard` 可用性门（缺 ⇒ 零钮）；单元测试 `#1235` 两径通过 |

**§5.2 验证读数（一行）**

命令：`cd thincoder && node --test docs/batches/2026-10-15-server-console-closeout.test.mjs`
结果：**10 tests / 10 pass / 0 fail**（`#1266` ∥ `#1316` ∥ `#1306` ∥ `#1418` ∥ `#1382` ∥ `#1259` ∥ `#1235` ∥ `#1483①` ∥ `#1312` ∥ `#1400`）。

桩面 ∥ 缝合说明（本档自持，非生产面）：
- DOM 桩 = 自持最小集（元素/文本/属性/类名/事件**冒泡**/模态壳/`closest`；`className` 与 `classList` 同源）；沿 `.thincoder/tmp/` 探查件先例。
- `/rc/*` = 浏览器绝对径（运行期由 `static.mjs` 映射 render-core）⇒ 本档以 `node:module` `register()` 注册 data-URL resolve 钩（钩内 `file:///` URL）；缝件不入仓、不入 `files` 白名单。
- 集成测试：**本批未跑**——父侧收口轮为唯一集成测试执行面。

**§5.3 决策透明表（与设计档的偏离 · 逐条理由）**

| # | 设计档所述 | 实际落地 | 理由 ∥ 性质 |
|---|---|---|---|
| D1 | §2 ①「admin 两表 +4 键/表」（#1316） | 落在 **system 两表**（`i18n-{zh,en}-system.mjs`） | 全仓 74 个 `audit.*` 键皆在 system 部件（实读：admin 两表 `audit.*` 键数 = 0）。键族登记单源 = `webui/SYSTEM.md` §3；落 admin 表会破「一域一部件」且与既有族分叉。**属设计档笔误**，非实现降级 |
| D2 | §2 ①「+2 键（提示句 ∥ 命令行题）」（#1235） | 恰 **2 键**；⑪ 要求的「证书 = 用户自备」句**并入 `nodeWiringHint` 同一键** | 避免第三键（同句同段）；文案语义不丢——设计档两处要求彼此收口 |
| D3 | §2 横切一随正清单（行号） | `webui/SANDBOX.md:23` 坐标落为 **`:251-259`**（设计档载 `:248-256`） | 该坐标指向「添加节点自检中态」实现位；本批在 `views-sandbox.mjs` 上方插入键面块 ⇒ 实现位下移。**录实施当刻实读坐标**（记 stale 坐标 = 制造新漂移） |
| D4 | §2 横切一「`webui/MCP.md:32`（args）」 | args 语义落在 **`:28`**（stdio 字段定义行） | `:32` 是「编辑态秘密字段」行；`args` 是明文列、归 stdio 字段定义处更直读。内容按设计档要求（回填 + 差异提交）逐条落 |
| D5 | §2 ⑩「`gateway/API.md` … 审计端点行」 | 审计端点行**不在 API.md**（全文件零 `audit` 字面）——实际落点为 `accounts/ACCOUNTS.md:89`（§2.1 列表）∥ `:122`（§3 端点表） | 坐标纠偏（实读）；两处皆已加 `containerId` 过滤语义 |
| D6 | 随正清单「照单全收，不再扩」 | **另修 6 处**：`webui/SANDBOX.md:83`（容器件行数，本批 +7 所致）∥ `:87`（connection「拟新增」⇒ 已落 + 实读 148）∥ `webui/CHAT.md:153`（`views-chat.mjs` 441 ⇒ 440）∥ `webui/SYSTEM.md:55/:56`（i18n system 219 ⇒ 221，本批 +4 键所致）∥ `webui/PROJECTS.md:75`（`views-audit.mjs` 206 ⇒ 271）∥ `accounts/ACCOUNTS.md:141`（`src/accounts/audit.mjs` ≈120 ⇒ 133）∥ `agent/ADMIN-AGENT.md:32`（`src/agent/chat.mjs` 737 ⇒ 736）∥ `sandbox/SANDBOX.md:525`（audit.mjs 109 ⇒ 133） | 皆为**本批改动文件的行数行 / 落态行**：改文件而留旧读数 = 本批制造新漂移。非本批所致的存量漂移（终端族 ±1 ∥ `views-usage.mjs` 139 ⇒ 136 ∥ `views-sandbox-volumes.mjs` ≈130 ⇒ 76 ∥ `image-sources` 361 ⇒ 360 等）**未动**——归文档残留收正族（#1491） |

**§5.4 设计档随正（本批实落）**

`webui/WEBUI.md`（§2 口径句 + :10 ∥ :15/:16 ∥ :21/:22 ∥ :169-172 ∥ :174-179 ∥ :202-204）∥ `webui/SANDBOX.md`（:16 ∥ :17 ∥ :23 ∥ :42 ∥ :82/:83/:86/:87 ∥ :97/:98 ∥ :100/:101/:102 ∥ :112 ∥ :113/:114）∥ `webui/READINGS.md`（:30 ∥ :43 ∥ :45 ∥ :55）∥ `webui/CHAT.md`（:19 ∥ :153 ∥ :202）∥ `webui/SYSTEM.md`（:55/:56 ∥ :58 ∥ :80/:81）∥ `webui/ME.md:80` ∥ `webui/MCP.md`（:10 ∥ :28 ∥ :50-52）∥ `webui/PROJECTS.md:75` ∥ `sandbox/SANDBOX.md`（:91 ∥ :525）∥ `mcp/MCP.md:49` ∥ `gateway/API.md`（:195 ∥ :323）∥ `store/STORE.md:373` ∥ `agent/ADMIN-AGENT.md`（:32 ∥ :123）∥ `accounts/ACCOUNTS.md`（:89 ∥ :122 ∥ :141/:142）。

需求档回筆（`docs/server/requirements/PROJECT.md`）= 主 agent 笔面，**本席未触**（§2 明载）。

**§5.5 审计与代码评审轮次与终态**

- **内部偏离审计（explore 子代理 · 只读 · 1 轮）**：逐项核 §2 十项 + 未披露改动面。
  结论 = 十项行为全落地（逐项给 `file:line` 证据）；未披露改动 = **0**；发现偏差 **1 项**（DOC-DRIFT）：`gateway/API.md:321`（`GET /api/admin/mcp` 响应行形未列 `args`，而 `src/mcp/store.mjs:154` 已实际下发）——**已修**（见 §5.6 F2）。
- **内部代码评审（advisor · type=code · 1 轮）**：裁决 **pass**（🔴 0 ∥ 🟡 4 ∥ 🔵 5）。
  十项「claim vs implementation」逐条对读通过（含服务端字段名/semantics 对读：`containers`+`confirm` ∥ `runnerId` ∥ `normalizeArgs` ∥ `parseUsageLimit`）。
- **fix round（2 轮）**：

  | # | 来源 | 问题 | 处置 |
  |---|---|---|---|
  | F1 | 自审（行数记平） | 本批改动文件在声明段内的旧读数（`views-sandbox-containers.mjs`/`views-chat.mjs`/i18n system 两表/`views-audit.mjs`/`src/accounts/audit.mjs`/`src/agent/chat.mjs`） | 已修（§5.3 D6 + §5.4） |
  | F2 | 审计 | `gateway/API.md:321` GET 行形缺 `args` | 已修：行形补 `args`（stdio 数组 ∥ http/ws 或空 ⇒ `null`——非秘密） |
  | F3 | 评审 🔵 | `views-chat.mjs:363` 注释悬空冒号 | 已修 |
  | F4 | 评审 🔵 | `views-mcp.mjs:158` args 往返非幂等（原值未过归一化 ⇒ `[" -y "]`/`["a",""]` 等「未改动」亦被判差异而静默改写） | 已修：`original` 同过 `trim`+过空行 ⇒ 比较在归一化域（窗面同域重算） |
  | F5 | 评审 🔵 | `views-me-chat.mjs:8` 头注「本件越 500 软线」（实读 499 内容行） | 已修：改「本件外拆至 500 软线内」 |
  | F6 | 评审 🟡②（设计缺口，非本席自裁） | `views-sandbox.mjs:317` 承载工作区取数失败被静默吞（`, () => [])`）——承载清单读败 ⇒ 二次确认门失效（服务端 400 兜底，零数据损风险）；设计档只覆盖「无承载/不可达」两径 | **不改代码**（守「不发明交互设计」）；上抛父侧裁（见 §5.7） |
  | F7 | 评审 🟡③/🟡④ | `README.md` §6 控制台清单陈旧；需求档回笔未落（主 agent 笔面） | 前者 = 域外/存量（不在本批随正清单）；后者 = §2 已明载主 agent 笔面。皆报告，不改 |

  🟡①（`src/agent/chat.mjs` 736 行 > 500 软线）与 🔵（`audit.mjs:86` `json_extract` 全扫；测试档缺 #1483② diff 回归式）= **认账不修**：前者存量（本批 +1 行；拆档由父侧裁）、后者规模可接受、末者 #1483② 核定「核件零改」故回归对象为非改动代码。
- **fix 后复核**：`cd thincoder && node --test docs/batches/2026-10-15-server-console-closeout.test.mjs` ⇒ **10 tests / 10 pass / 0 fail**（F2-F5 后重跑）。
- **终态 = `clean`**（无 🔴；🚩 余项 2 条上抛，见 §5.7）。

**§5.6 §5.3 D6 计数更正**：D6 标「另修 6 处」，实列 **8 个坐标 / 7 档**（`webui/SANDBOX.md:83`、`webui/SANDBOX.md:87`、`webui/CHAT.md:153`、`webui/SYSTEM.md:55-56`、`webui/PROJECTS.md:75`、`accounts/ACCOUNTS.md:141`、`agent/ADMIN-AGENT.md:32`、`sandbox/SANDBOX.md:525`）——审计已逐条实读为真。

**§5.7 上抛（2 条）**

- `[上抛·待裁]` **#1259 承载清单读败径无设计**：`views-sandbox.mjs:317` 工作区取数失败静默回落空表 ⇒ 「确认丢弃」勾选不渲、删除钮可用（服务端 `registry.mjs:367-370` 仍 400 拒 —— 零数据损）。请裁：补该径（读败 ⇒ 就地句 + 钮禁/可重试）或维持现状（设计档仅载「无承载/不可达」两径）。
- `[上抛·知会]` **需求档回笔未落**：`docs/server/requirements/PROJECT.md` 旧值（`:65` 我的六页/管理十页 ∥ `:70` 侧栏十六页 ∥ `:293` 管理组 10 项 ∥ `:500` 三页）——`#1266` 的「各式计数语句与此一致」在需求档面未闭合；该笔面 = 主 agent（§2 横切三 ∥ §5.4）。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：父侧抽核 —— `views-sandbox.mjs` 删节点承载确认门（勾选门 + 体键 `confirm: true`；无承载 ⇒ 零键）实读在盘 ✓（grep 读数）；批内件 `node --test` = **10 tests / 10 pass / 0 fail**（fix 后重跑，#50 读数）；残留扫描（`console.log`/`TODO`/`debugger`）全档零命中 ✓；集成测试 = **未跑**（本仓无集成档；按纪律父侧收口轮为唯一集成执行面——此处如实记为「未集成验」）。禁调令遵守（零调 `doc-check` 入口）✓。

**② 集成场景影响**：无 —— 控制台面行为 + 档面，无业务场景增删/修订。

**③ 核销结算**：台账 **#1483** → 已核销；同批件 **#1259 ∥ #1266 ∥ #1312 ∥ #1316 ∥ #1382 ∥ #1306 ∥ #1418 ∥ #1400 ∥ #1235** → 随本档 §5 落定，逐行核销。

**④ 暂缓批复核**：无。

**⑤ 结算同步清单**：角色表 ✓ ∥ 状态行（§5 实施完成 → 本档已收口）✓ ∥ 计数（10 项 = 五码 + 五档）✓ ∥ 指针（#1483 指本档）✓ ∥ 待办勾销（同批 9 件 + 本行）✓ ∥ 前批遗留交叉核（无）✓。

**⑥ 上抛与知会处置**（#50 报告）：① `views-sandbox.mjs:317` 承载清单读败静默回落 ⇒ 勾选门不渲、删除钮可用（服务端仍 400 拒 ⇒ **零数据损**）——**父侧裁：维持现状 + 入册**（台账新增行 = 读败径设计面，另轮）；② 需求档计数回笔（`requirements/PROJECT.md:65/:70/:293/:500` 旧计数）= 主 agent 笔 → **已入册**；③ 声明偏离 7 条（`:1316` 键落 system 两表 ∥ `:1235` 恰 2 键 ∥ SANDBOX 坐标 ∥ args 语义落点 ∥ 审计端点坐标纠偏 ∥ 另修 8 处行数行 ∥ `:525`「十三型」存量）→ 照录 §5.3；④ 存量与域外项：`src/agent/chat.mjs` 736 行（500 软线；**认账不修**——本批 +1）∥ `sandbox/SANDBOX.md:525`「十三型」vs 代码十七型 ∥ `README.md` §6 控制台清单陈旧（漏 9 页 ∥ 载已别名化路径）→ 并入台账 **#1510** 族（记录面）；⑤ 🔵 已修 3 条（`views-chat.mjs:363` 注释 ∥ `views-mcp.mjs:158` 幂等 ∥ `views-me-chat.mjs:8` 头注）照录。

**⑦ 结算行**：台账 #1483（+ 同批 9 件）→ 已核销；新增 2 行（读败径设计 ∥ 需求档计数回笔）。
