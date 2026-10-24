# 2026-10-15 · 成员面三端对齐
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 原话「成员面的要求应该是跟vsc和desktop差不多」（承 2026-10-13「界面跟vsc和桌面基本一致」——功能点 50①）；对表盘点（explore #39——9 轴 38 行带 file:line）⇒ 欠账 15 项；用户 00:42/00:43 裁「vsc/桌面有的缺的 = 欠账，直接补，不挂待裁」；**00:46 追加裁「哪有什么合理差异」——差异封条栏撤，再分类增补 3 项**；**00:50 再裁「对比会话面板按钮」——逐钮补录 4 项**；**00:59 纠正：并行门 = 设计侧自加（无用户裁据）⇒ 归欠账（放开/对齐——盒壳并发面待核）⇒ 欠账 23 项**。
> 台账 = #1455（server · 归批）。前情 = docs/batches/2026-10-13-member-face-chat.md §2（已收口 2026-10-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（欠账 15 项——对表 #39：9 轴 38 行逐项带坐标；判据 = 用户 2026-10-15「跟 vsc/desktop 差不多」＋ 00:42「vsc/桌面有的缺的 = 欠账，直接补」）**

**一、工具与审批族**（开发可用性；全族同根 = 盒壳零审批回调 `deploy/sandbox/member-shell/core-run.mjs:241-260`）：

| # | 欠账 | 现况坐标 |
|---|---|---|
| 1 | 写类工具全拒（bash ∥ git 写 ∥ write ∥ edit）⇒ 审批接线 | `Error: no permission handler configured`（核 `agent/dispatch.mjs:198-231`） |
| 2 | 单件审批卡（approve/deny 含 diff 预览） | 核卡在盘可消费：`render-core/cards/permission.mjs:24-49` |
| 3 | 批量审批卡（approve-all ∥ 逐一 ∥ deny） | 两壳先例：VSC `permission.js:34` ∥ 桌面 `agent-bridge.mjs:260` |
| 4 | 问询卡（agent 问 ⇒ 选项作答） | 两壳先例：`chat-messages.js:191` ∥ `mount-cards.mjs:113` |
| 5 | 秘密输入卡（值零入上下文） | 两壳先例：`secret-input.js` ∥ `secret-prompt.mjs` |
| 6 | diff 呈现（审批卡预览 ∥ 大 diff 处置） | 随审批族 |
| 7 | 工具结果全文（现仅 ≤300 字摘要；帧已携 `content` 全文） | `member-relay.mjs:88-93` ∥ 页面 `views-me-chat-messages.mjs:91` 未用 |
| 8 | 工具实时输出（bash 流式） | 帧表无 `toolOutput`：`member-shell/protocol.mjs:20-27` |
| 9 | 子代理块 ∥ 活动面 ∥ 单个停止 ∥ 等待审批态 | 核侧事件被剥离：`core-run.mjs:14-15` |
| 10 | 思考/推理块 | 盒壳未接 `onReasoning`——推理文本零帧 |
| 11 | **模式旗四枚（auto ∥ advisor ∥ eng ∥ plan）**——核控件行七钮之四（`render-core/composer/controls.mjs:46-52`：`#auto-btn` ∥ `#advisor-btn` ∥ `#eng-btn` ∥ `#plan-btn`；AUTO 内联确认 ∥ ENG×PLAN 互斥 ∥ advisor 守卫） | 成员面四比特恒假且**无源**：`views-me-chat-composer.mjs:168`「`flags: () => ({ autoApprove: false, advisorGuard: false, engineering: false, planMode: false })` // 无源（模式位面无）」（VSC/桌面靠面板推送三 handler 回填——盒壳未接；连带同步改帧协议扩展刀） |
| 12 | 资源工具清单落定（R77——建/启/停 + 拉仓） | 盒壳零工具注入：`core-run.mjs:233`；KD-SV-159 归属已裁 |
| 13 | 状态行 计划/注意力/挂起 段 | 计划∥注意力随 11/2；挂起句无源——设计评估 |

**二、页面小件**（低优先随批）：

| # | 欠账 | 现况坐标 |
|---|---|---|
| 14 | 图片通道（禁静默丢——二择一：补 `run.images` ∥ 显式拒绝） | `views-me-chat-composer.mjs:184-194` |
| 15 | `@` 文件引用菜单 | 适配层缺 `atComplete`/`atResults` 桥 |
| 补 | 自动标题（现 excerpt ≤40 字）∥ 压缩/摘要读数面 | 随批低项——设计评估归落点 |

**差异再分类（用户 2026-10-15 00:46 裁「哪有什么合理差异？」——原「合理差异」封条栏撤，逐项重判）**：

| 原列项 | 重判 | 处置 |
|---|---|---|
| 重命名（VSC/桌面皆有：`session-bar.js:56-68` ∥ `session-control.mjs:204-214`） | **欠账（增补）** | 随批补（核 `deleteSlot` 邻域同族） |
| 会话内搜索（VSC `webview/search.js` ∥ 桌面 `renderer/search.mjs`） | **欠账（增补）** | 随批补（低优先随件） |
| 复制钮（http 无安全上下文——真端面约束） | **欠账（条件 = TLS）** | 随 TLS（#1243 在册）补；之前如要现摆 = 点了给「不可用」提示——请裁一句 |
| 状态行部分段（timer/团队/标题等——帧面无通道） | **欠账（增补——并入第 13 项：状态行全段对齐）** | 随批设计（段表全对齐） |
| 会话新建/列表/切换（成员面已具备——选择器形态） | 非差异（同具备，形态不同） | 不列；要同形请说一声 |
| 历史回读（成员面全量重读——能力在）∥ 工具卡（核件同款）∥ notice 六值（成员面独有）∥ 中断（语义折法不同，能力在）∥ 空态引导（成员面更细） | 非差异（能力具备 ∥ 成员面更优） | 不列 |
| 主机凭据钮 | **非差异**（VSC ∥ 桌面 ∥ 成员面**三面皆无**——盘点误列） | 不列 |
| 并行门（工作区级在途——`MEMBER-AGENT.md:122-126`） | **设计侧自加项**（原文理由「盒 = 共享资源——一会话跑着改文件时另一会话再跑 = 惊喜源」＋「管理面跨会话并发不设限不沿」——**无用户裁据**；父侧先前误标「在册先例」——已纠正，来源如实标设计侧） | **欠账（放开/对齐）**：两壳零门可并行 ⇒ 对齐；盒壳并发执行面设计席核读——若有真约束 ⇒ 显式呈报（why + 代价）待裁，不默认留门 |

**口径**：此后**不设「合理差异」栏**——凡两面有、成员面缺 = 欠账直补；真端面约束项单独呈报（带「为什么 + 代价」）并给默认补法，不封条。

**另册**：#1454 凭据就地绑（在途 #38）——本批不重开；KD-SV-158 记忆面压后（用户裁）——不在本批。

**授权口径**：全链自动（用户 00:08「都自动跑到交付吧」＋ 00:43「报备后按在册授权直接走」）：设计 → 评审（自动）→ 批准（父侧代签）→ 实施（分刀）→ 交付。**欠账不挂待裁**——凡本表在册项直接走；超出「基本一致」的增强才允许提请。

**会话面板逐钮对表补录（2026-10-15 · 用户 00:50 裁「对比会话面板上的按钮就能一眼看出」——父侧实读三面件逐钮对出，补 4 项）：**

| # | 补录项 | 两面实况（坐标） | 成员面 |
|---|---|---|---|
| 19 | 会话行内位标（运行中 ∥ 待审批） | 桌面 `session-control.mjs:189-194`（`badgeNode`——`deriveTabBadge` 切片） | 无（选择器 = 原生 option，无从承载） |
| 20 | 会话行 meta 补全（provider · N msgs · 日期） | VSC `session-bar.js:53-55` ∥ 桌面 `session-control.mjs:178-187` | 仅「工作区 · 模型 · 摘要 · 时间」——无 msgs 数 ∥ 无 provider |
| 21 | 项目/工作区钮 | VSC `session-bar.js:148-168`（📁 多根切换）∥ 桌面 `session-control.mjs:110-118`（📁 打开目录） | 无对应钮——工作区仅在新建会话弹窗内选择 |
| 22 | 账本警示注记（下拉首行） | VSC `session-bar.js:36-44` ∥ 桌面 `session-control.mjs:218-225`（LEDGER-RELIABILITY §6.25） | 无——**需判定成员面有无对应账本源**（如实标注待核） |

**连带定形**：会话选择器现为原生 `<select>`（option 文本单行）——第 12（删除）∥ 增补 2（重命名）∥ 19 ∥ 20 项要求重建为可承载行内控件的自绘下拉（形制对齐 VSC 下拉 `session-bar.js:31-86`；成员条自有钮「重读 ∥ 启动工作区 ∥ 拉取项目 ∥ 工作区读数行」保留不动）。

**计数随正**：欠账 18 ⇒ **22 项**（再随正 **23 项**——计数口径单源 = §2:79）。

**控件行余钮对表（补记——承第 11 项改正）**：核控件行七钮 = 模型 ∥ 推理 ∥ **AUTO** ∥ **ADVISOR** ∥ **ENG** ∥ **PLAN** ∥ ⚙——其中模型 ∥ 推理 = 成员面已有（自绘钮同权）；四模式钮 = 第 11 项（四比特无源）；**⚙ 设置钮 = 成员面对应面待核**（VSC 出口 = 工具/agent 设置面板；审计原归「provider key 管理面差异」——不封条，设计席对表时判归属与形态）。

**父侧定序（R87 合并序——2026-10-15 01:2x）**：`views-me-chat.mjs` 同触兄弟批 = `member-pull-inline-cred`（#1454，`docs/batches/2026-10-15-member-pull-inline-cred.md`）**先落**——其评审 #44 ＋ 修正轮 #46 已完成、修正经父侧复核通过；幅面小（拆出 `views-me-chat-pull.mjs` ＋ 3 键）且沿其 D7「拆档先于增行」。**本批实施随其后**：实施轮任务书以「凭据批已落」为已知事实；三拆在两批合并后的现盘上重排（两批拆分计划合一 = 实施轮首步；拆分边界以合并后现盘实读为准）。

**父侧直接执行（收正 5 条 · 可 revert · 2026-10-15 02:1x）**：承评审 #67（轮次 2 = changes-required ∥ 🔴1+🟡1+🔵3）新发现逐条收正——① `gateway/API.md:184`「写面零端点（成员对工作区的动作随 #1216 ② 权限模型——`sandbox/SANDBOX.md` §8 成员面）。」⇒「写面已随 KD-SV-156 开（成员对工作区的动作：创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓；端点 = §2.11 表（`:286`–`:289`——建 ∥ 启停/销毁 ∥ 拉仓 ∥ 拉取状态）；判权 = 工作区 key 第三门（上注）；机制 = `sandbox/SANDBOX.md` §8 成员面）。」；② `gateway/API.md:387` 判据范围 N71–N78 ∥ B69–B72 ∥ E54–E57 ⇒ **N71–N87 ∥ B69–B76 ∥ E54–E61**；③ `webui/CHAT.md:215` 括注「（判定项 = 差异条⑩ 不做句）」⇒「（判定 = 差异④ ∥ 机制档 §3.11(6)）」；④ `agent/MEMBER-AGENT.md:364` 首处「现读 358」⇒「前读 358」（与同段「现读 378」分列）；⑤ `agent/MEMBER-AGENT.md:46` 空行删除（§2 决策表 KD-SV-205–213 并体）。轮次 2 核验结论 = 轮 1 十七条修正 17/17 已落盘（含形式连带）。

**父侧受理（承 mcp 批 #66 上抛 · 2026-10-15 02:2x）**：㈠**防撞基线并线要求**——盒桩件防撞 `taken` 名集须并入**注入件名集（member-tools/pull）**，由本批 ⑤（合并点）收口（对齐设计 §6.5）；风险 = 同名 MCP 件在核 `toolByName`「后到者胜」下静默顶掉注入件；**本批实施面须带此腿**。㈡**评审轮次记**：轮 3（内容核验 = 5/5 Fixed 正判）主机引证机检未通过（引证多为表格行片段/含省略号）⇒ **token 未签发**；**轮 4 已点火**（重核轮 3 表 + 单行原文引证复检）——token 签发后本批实施轮才发。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（23 项 + 补两件 + ⚙ 判定逐项受理；三档已落（MEMBER-AGENT §3.11 等 / CHAT / API）；上抛 R83–R90；设计评审轮 1 修正毕（17 条逐条对位——修正轮记录见段末））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目与逐项受理（承 §1 两表——**23 项 + 补两件 + ⚙ 判定**）**

**计数口径（如实）**：父侧交代称 18 项；§1 :67「计数随正：18 ⇒ 22 项」（00:50 补录后）；§1 :3 编制行 00:59 纠正（并行门 = 设计侧自加、无用户裁据 ⇒ 归欠账）⇒ **23 项**。本设计按 §1 现况逐项受理：**15（编号项）+ 3（差异增补：重命名/搜索/复制钮）+ 4（补录 19–22）+ 1（并行门）= 23**；另「补」行两件（自动标题 ∥ 压缩/摘要读数面）+ ⚙ 设置钮判定（§1 :69）。18/22 两个旧数不再引用。

**A. 欠账 23 项（逐项：机制 ∥ 落点 ∥ 判据——判据全机检形）**

| # | 欠账 | 机制 ∥ 落点 | 判据 |
|---|---|---|---|
| 1 | 写类工具全拒 ⇒ 审批接线 | 盒壳接核 `onPermissionRequest`/`onBatchPermissionRequest`（`core-run.mjs` 五回调 ⇒ 十一）；上行 `ask` 帧；下行 `answer` ⇒ 核承诺结算。机制 = 机制档 §3.11(2) | 假盒桩：allow 后写类工具执行成（`end.succeeded`）；零应答 ⇒ 拒 |
| 2 | 单件审批卡（diff 预览） | 核 `renderApprovalCard`（只读消费）+ 卡挂载/摘除；落点 = 新档 `views-me-chat-cards.mjs` | 卡类名/三钮在场；diff 预览在场；应答恰一 `POST` |
| 3 | 批量审批卡 | 核 `renderBatchApprovalCard` + 桌面词表三值直传 | 批量触发 ⇒ 卡；`oneByOne` ⇒ 逐件卡续；`approveAll` ⇒ 批内零再问 |
| 4 | 问询卡 | 核 `renderQuestionCard`；应答 `{ answer }` | 选项点击 ⇒ 应答恰一；取消 ⇒ `null`（核未答径） |
| 5 | 秘密输入卡 | 页内件（七键白名单载荷）+ `{ values }` 应答；值只经应答体 | masked/prefill/required 三面；消息面与帧面零值 |
| 6 | diff 呈现（预览 ∥ 大 diff） | 卡内预览（核件内建）+ `view-diff` ⇒ 页内弹窗全量 patch（核 `renderDiff` 单源） | 弹窗在场；patch 全文渲染；关闭回焦输入区 |
| 7 | 工具结果全文 | 活流 `result.content` 全文入卡；回读 tool 行携 `content`（核 `capText` 64 KiB） | >300 字结果卡内全文；回读同形 |
| 8 | 工具实时输出 | `toolOutput` 帧（`onToolOutput`——chunk 取 `.text`）+ 核 `appendToolOutput` | 多段 chunk 卡内尾追；截断标记随核件 |
| 9 | 子代理块 ∥ 活动面 ∥ 停单个 ∥ 等待审批态 | `sub` 帧（relay token **停止剥离**）+ 核 `subblocks/*` 链；停单件 = `abort { key }`；审批态 = `owner` 归属 | 归约/效果表断言；`abort{key}` 恰一；块头审批写点 |
| 10 | 思考/推理块 | `reasoning` 帧（`onReasoning`）+ 核 `renderReasoning`/流渲染器 | 推理块在场（默认折叠）；无推理 ⇒ 零块 |
| 11 | 模式旗四枚 | 行 `flags`（槽四字段）+ `PATCH` 四旗键 + 页四钮启用；生效 = 核 `applySession`；落点 = composer 适配层 | 四旗写读往返；ENG×PLAN 互斥；下回合生效 |
| 12 | 资源工具清单（R77） | 核家族全件随装配 + server 域四件经 `extraTools` 注入（新档 `member-tools.mjs`——本批新件）；拉仓 = 既有能力登记（盒内 `git` 工具 + 凭据助手——不另立工具） | 工具表含四件（拉仓 = 既有 `git` 工具——零新工具）；`destroy` 确认门；四件调 `/api/me/sandbox/*`（工作区 key 第三门——键 → 工作区 → 负责人） |
| 13 | 状态行全段（计划/注意力/挂起 + timer/标题/团队等） | 段表 19 段（机制档 §3.11(4)）；源 = 帧面七型 + `usage` 扩字段 + 行字段 | 段集 ⊆ 表；缺源 ⇒ 零段；两判定段 = 呈报在册 |
| 14 | 图片通道 | `messages` 体 + `run` 事件扩 `images`；服务端核 `parseDataUrl` + 视觉门（400 人话）；零静默丢 | 有图 ⇒ 入回合；非视觉模型 ⇒ 400 人话 + 草稿保留 |
| 15 | `@` 文件引用 | `atComplete` 桥 + `GET /api/me/chat/files`（盒 `cmd files.list`）+ 核 `atmenu` | 键入 @ ⇒ 候选（≤50）；拾取入输入区；盒离线 ⇒ 409 人话 |
| 增补·重命名 | ✎ ⇒ 行内输入 ⇒ `PATCH { title }` ⇒ `session.rename` ⇒ 核 `renameSlot` | 往返成；失败 ⇒ 400 人话零改 |
| 增补·会话内搜索 | 核 `createSearch({ root: .chat-thread })` + 核 `search.css` + 键族 | Ctrl+F ⇒ 搜索条；命中计数；关闭清高亮 |
| 增补·复制钮（条件 = TLS） | 核 `attachCopyButtons` + 降级 toast（`navigator.clipboard` 缺 ⇒ 点击给「不可用（需 HTTPS）」）；TLS（#1243）后零改 | 点击 ⇒ toast；无异常抛出 |
| 19 | 会话行位标（运行中 ∥ 待审批） | 自绘下拉行首——源 = 行 `status` + `awaitingApproval`（relay 在途 ask 读数） | 两态位标在场（假桩两腿） |
| 20 | 行 meta 补全 | 行 `count`（槽 history 长——`rowOf`/`slotFacts` 读面扩）+ provider 页派生 + 日期 | 行含 `provider · N msgs · 日期` |
| 21 | 项目/工作区钮 | 📁 ⇒ 工作区选择弹层 ⇒ 过滤选择器 + 新会话预选；落点 = `views-me-chat-sessions.mjs` | 切换 ⇒ 列表范围随；零残留选择 |
| 22 | 账本警示注记 | **判定项**（§1 标「待核」）：成员面零本地账本 ⇒ 无同物；呈报 R85 + 默认补法在案（服务端台账未决计数） | 判定在册；未裁前不造 |
| 并行门（00:59 纠正·第 23） | 门粒度 = **会话级**；跨会话放开（relay `turns` 表键 + 盒 `state.running` ⇒ 会话键表）；呈报 R90 | 同会话二发 ⇒ 400；同工作区两会话并行可达 |

**B. 补行两件 + ⚙ 判定**

| 项 | 处置 ∥ 判据 |
|---|---|
| 自动标题（现 excerpt ≤40 字） | **展示面落**：行 `title`（槽字段）非空用 `title`、空 ⇒ excerpt 顶行；**生成器不做**（核零生成件——另批；§1 标「低优先随批——设计评估归落点」= 归落点已定） |
| 压缩/摘要读数面 | **落**：`compress` 帧（`onCompressStart`/`onCompress`/`onCompressFail`）+ 状态行段 15（压缩中…/已压缩） |
| ⚙ 设置钮（§1 :69 待判定） | **判定 = 成员面可配面 = 我的·账户页**（Git 凭据卡 ∥ 改密——`#/me/account`）；钮 ⇒ 路由该页（零新弹层、零第二份表单）；VSC 出口 = 端侧 agent/工具设置面板——成员面无端侧配置面（服务端形态）⇒ 不造同物；就地弹层 = 另裁（成本在册） |

**C. 非差异项（§1 :46 列，不动作）**：会话新建/列表/切换（形态不同，能力具备）· 历史回读 · 工具卡（核件同款）· notice 六值（成员面独有）· 中断折法 · 空态引导（更细）· 主机凭据钮（三面皆无，盘点误列）。

**设计档落点（同源三档——机制单源 + 两处指针）**

| 档 | 落点 | 内容 |
|---|---|---|
| `docs/server/design/agent/MEMBER-AGENT.md`（机制单源） | §2（KD-SV-203 收正 + 新增 **KD-SV-206–213**）∥ §3.2（会话管理面句）∥ §3.3（下行增 `answer` 行 + 帧词表增补集句）∥ §3.4（在途门 = 会话级 ∥ 中止扩 `{key}` ∥ `busy` 值语义）∥ **新增 §3.11 三端对齐面**（7 小节：帧表七型 ∥ ask 回路与卡族表 ∥ 四旗 ∥ 状态行 19 段表 ∥ 子代理面 ∥ 会话条与页面小件逐项表 ∥ 工具面清单）∥ §4（端点摘要）∥ §5（行账）∥ §6（验收两行 + 边界行）∥ §7（用例 N80–**N87** ∥ B74–B76 ∥ E59–E61；N75 随正）∥ §8（边界收正）∥ §9（R83–R90） | 帧面/ask 回路/四旗/段表/子代理/会话条/工具清单全文 |
| `docs/server/design/webui/CHAT.md`（页面面） | §2.2 差异④（四钮解隐藏 + ⚙ 路由）∥ 新增⑨（三端对齐面）⑩（页件拆档）∥ ⑦ 尾句收正 ∥ 「不做」行重定 ∥ §3 行账 ∥ §4 验收行 ∥ §5 不做面 ∥ §6 ⑨ 交付项与披露 | 页面逐项与判据 |
| `docs/server/design/gateway/API.md`（端点面） | §2.11（+`POST …/asks/:promptId` ∥ `POST …/:id/delete` ∥ `GET /api/me/chat/files`；`abort` 体扩 `{key?}`；`PATCH` 扩四旗/标题；会话行形扩四键；**在途门收正 = 会话级**；工作区 key 第三门判权句）∥ §2.12（`events` 增 `answer`/`abort.key`/`cmd` 族三 kind；`turns` 帧集增补）∥ §1 会话行数/§5 行计数随正 | 端点形与错误门 |

**机制设计摘要（一族一次接线——逐项细节 = 三档）**：① **帧面**：上行增补七型（`reasoning`/`toolOutput`/`sub`/`ask`/`tasks`/`compress`/`wait`）+ `usage` 扩两字段（`reasoning`/`timers`）+ 下行 `answer` + `abort` 扩 `key`——单点 = 盒壳 `protocol.mjs` 构造器 + server `member-relay.mjs` 转发点（掩蔽口径同源）；② **ask 回路** = 上帧 `ask`（kind 四值）⇒ relay 在途表 ⇒ 页卡（核件三卡 + 页内秘密卡）⇒ `POST …/asks/:promptId` ⇒ 下行 `answer` ⇒ 盒壳结算；收尾三径全量兜底（拒/deny/取消）、后到应答 400 零副作用、值零入上下文；③ **四旗** = 核槽四字段（核写面四件直用，零核改）；写 = PATCH 一次一件、读 = 行 `flags`、生效 = 核 `applySession`；④ **状态行 19 段**（段集 ⊆ 表；两判定段在册不造）；⑤ **子代理面** = 核 `subblocks/*` 栈直用 + 停单件 + 审批归属；⑥ **会话条** = 自绘下拉承载位标/meta/✎/✕/📁；⑦ **工具面** = 核家族全件 + server 域四件经核 `extraTools` 缝注入；⑧ **在途门** = 会话级（跨会话放开）。

**分刀（五刀——≤15 文件/刀；顺序与依赖在册；刀内可并行）**

| 刀 | 内容 | 文件（本刀） | 依赖 |
|---|---|---|---|
| ① 机制刀（**先**） | 帧面七型 + ask 回路（relay/shell/端点）+ 四旗读写 + 在途门会话级 + 行字段（`count`/`title`/`flags`/`awaitingApproval`） | `member-shell/{protocol,core-run,index}.mjs` ∥ `src/agent/{member-relay,member-routes}.mjs`（+ 若越 500 软线 ⇒ 外迁 `member-asks.mjs`——ask/delete/files 三端点）∥ 单元测试档 | 无（其余刀基座） |
| ② 卡族与消息面刀 | 四卡 + diff 弹窗 + 工具输出流/全文 + 推理块 + 复制钮降级 | `public/views-me-chat-cards.mjs`（新）∥ `views-me-chat{messages}.mjs` ∥ `style.css` ∥ i18n 两表 | ① |
| ③ 子代理与状态行刀 | `sub` 帧消费（核栈）+ 停单件 + 段表 19 段 + `compress`/`wait`/`tasks` 段 | `public/views-me-chat-subs.mjs`（新）∥ `views-me-chat-composer.mjs` ∥ `style.css` ∥ i18n | ① |
| ④ 会话条与页面小件刀 | 自绘下拉（位标/meta/✎/✕/📁）+ 搜索 + `@` 菜单 + 图片 + ⚙ + 拆档收口 | `public/views-me-chat-sessions.mjs`（新）∥ `views-me-chat.mjs`（拆后收口）∥ `views-me-chat-composer.mjs` ∥ `src/agent/member-routes.mjs`（files 端点若未入①）∥ i18n | ①（②③ 同页——串行） |
| ⑤ 工具面刀 | server 域四件 + `extraTools` 注入 | `member-shell/member-tools.mjs`（新）∥ `member-shell/core-run.mjs` ∥ 测试 | ① |

**受影响文件（实读行数——以实施当刻实读为准）**：`deploy/sandbox/member-shell/{protocol,index,core-run}.mjs`（167 ∥ 323 ∥ 321 ⇒ ≈290/≈360/≈440）∥ 新 `member-tools.mjs`（≈180）∥ `src/agent/member-relay.mjs`（310 ⇒ ≈400）∥ `src/agent/member-routes.mjs`（485 ⇒ ≈530 ⇒ 拆：三端点外迁）∥ `public/views-me-chat.mjs`（500 ⇒ 拆后 ≈380–430）∥ 新 `views-me-chat-{sessions,cards,subs}.mjs`（≈220/≈190/≈200）∥ `views-me-chat-composer.mjs`（325 ⇒ ≈390）∥ `views-me-chat-messages.mjs`（106 ⇒ ≈130）∥ `public/style.css`（378 ⇒ ≈440——卡族/下拉/搜索/子代理块类名 + 钮可见性作用域覆写）∥ `i18n-{zh,en}-me.mjs`（158/159 ⇒ ≈200）∥ 部署 = 盒镜像重建（R88）。**测试链（本批——逐件现读 + 增量注；清单单源 = 机制档 §9 R89）**：`2026-10-13-member-face-chat-ui.test.mjs` **640** ⇒ ≤±20 ∥ `2026-10-13-member-face-chat.test.mjs` **787**〔修复轮在途〕⇒ ≤±60 ∥ `2026-10-08-server-public-structure.test.mjs` **170** ⇒ ±0（键数/指纹就地收正）∥ `2026-10-11-console-tabs-component.test.mjs` **497** ⇒ ±0（档目 +3）∥ `2026-10-10-runner-admin-console-ui.test.mjs` **390** ⇒ ±0 ∥ `2026-10-12-team-projects-permissions-ui.test.mjs` **554** ⇒ ±0 ∥ 本批单元测试档（新）`2026-10-15-member-face-parity.test.mjs`（≈1500）。**产品码零触（设计轮）**。

**设计自检（送审前四问）**：① 需求五元素可设计？＝是（§1 两表逐项带现况坐标；功能点 50① 在册）；② 受影响文件全 + 行数？＝是（上表实读——测试链六件 + 本批新档（修正轮 #4 补列））；③ 验收指回逐项？＝是（§6 本批两行 + §7 用例 N80–N87/B74–B76/E59–E61；逐项对位 = 上表 A）；④ UI/交互决策全落？＝是（段表 19 段/卡族四件/会话条行形/降级形全落）；未决 = 仅判定项两枚（R85/R86——在册不造）。

**上抛/呈报（父侧看这里）**：**R83** 跨回合池/计时态 = 端面约束（盒每回合新装配 agent ⇒ 回合间态不可达；默认补法 = 常驻 agent 重构，成本在册——未裁前不做）∥ **R84** 模式旗 mid-turn 追改（真端面约束——下回合生效；要 live ⇒ +1 下行帧）∥ **R85** 台账警示注记 = 无同物（成员面零本地账本；默认补法 = 行注服务端台账未决计数）∥ **R86** 团队登录态段 = 无参照物（如要显示成员名 ⇒ 一行取数）∥ **R87** 拆档合并序（兄弟批 member-pull-inline-cred 在途——`views-me-chat.mjs` 两批同拆，**父侧定序**）∥ **R88** 盒镜像随动 ∥ **R89** 测试链随正（清单单源——六件 + 本批新档；与 R82 交叉四件已同拍）∥ **R90** 盒内并发数无上限（呈报·知会——如要限流 = 另裁）。**R79 收口**（删除/重命名落钮）。**需求档回笔建议**（主 agent 笔）：功能点 50① 尾可补「成员面三端对齐面（卡族/模式旗/状态行全段/会话管理面）＝本批落」——不阻拦本批。


**修正轮记录（设计评审轮 1——17 条逐条处置 · eng-designer · 2026-10-15）**

- #1（🔴 在途门两处相抵）⇒ API 两处收正**会话级**（`gateway/API.md` §2.11 前注 ∥ §5 AC-50 行——单源 = KD-SV-213；§1 行数/§5 计数同拍）+ 本表落点表 API 行补列该项。
- #2（🟡 KD-SV-212 句与 §3.11(7) 相抵）⇒ `agent/MEMBER-AGENT.md` §2 KD-SV-212 收正：server 域四件入 `member-tools.mjs`；拉仓 = 既有能力登记（不另立工具）；第 12 项判据内部一致已核（四件构成 ∥ `destroy` 确认门——判据补「工作区 key 第三门」注）。
- #3（🔴 判权面两择一）⇒ 择定 **① 工作区 key 第三门**（取向 = 保持盒权限工作区域 ⇒ 被否项「成员登录 token」不变；`create` 权源可推导 = 键 → 工作区 → 负责人）：KD-SV-154 射程句扩 + §3.7 判权单源 + §3.11(7) 行 + §4 端点摘要判权格 + API §2.7/§2.11 判权句 + 第 12 项判据。
- #4（🟡 测试链未入受影响表 + 清单两处半重叠）⇒ 本表受影响表补**测试链六件 + 本批新档**（逐件现读 + ≤±N 增量注，清单单源 = §9 R89）；R89 收为单源（含 `…-chat.test.mjs` **787** 越 500 软线的「不拆 + 理由」处置句）；R82 尾句改指 R89；自检 ② 补注。
- #5（🟡 截断口径与实现相抵）⇒ `agent/MEMBER-AGENT.md` §3.3/§3.4 两句收正：`args` ≤500 ∥ `summary` ≤300 沿用 ∥ `content` = 核 `capText` 64 KiB 单源（活流/回读同径——§3.11(6) 已在册）。
- #6（🟡 `images` 体随动缺）⇒ §3.3 `run` 行补 `images?` ∥ API §2.11 messages 行体扩 `{ content, images? }`（视觉门同 §3.11(6)）。
- #7（🔵 六帧句/kind 残留）⇒ §3.3 `cmd` 行 kind 补三（`session.delete`/`session.rename`/`files.list`——全表单源 = API §2.12）∥ `turns` 行「六帧 + 本批增补七型」句 ∥ API §5 行同句；档头先例① 同 residue 连带收正。
- #8（🔵 计数三处残留）⇒ API 收正：§1 会话**十**行 + 三端点名（ask 应答/删除/`@` 候选）∥ §2.11 表**十七**行 ∥ 会话行形「扩**四**键」。
- #9（🔵 旧数残留）⇒ `agent/MEMBER-AGENT.md` §3.11 口径句 + 变更记录 22 ⇒ 23；CHAT 变更记录同 residue 连带；§1:67 为记录面（主 agent 段——未触，呈报）。
- #10（🔴 四钮解隐藏落法未点名）⇒ 择定 **适配层开关**：成员 composer 容器挂 `data-flags="live"`（`views-me-chat-composer.mjs:104` 自建点）+ `style.css` 作用域覆写 `#toolbar[data-flags="live"]` 下四模式钮 + 设置钮（`display: inline-flex`——核 `.ctrl-btn` 同值）；全局收窄五 id 规则零动（管理面五枚仍隐、AC-19 canon 不破）；`style.css` 增量列入（§5 两行 + 受影响表 + CHAT §6⑨）；**钮可见性机检 = N83 两侧同测** + §6③ 行补句 + CHAT §4 行补句。
- #11（🟡 在册项无对位用例号）⇒ 补 **N87**（推理块默认折叠/空态 ∥ 工具面四件 + 拉仓登记 ∥ 📁 切换零残留 ∥ ⚙ 路由 ∥ 标题/excerpt 顶行）；范围句 N80–N86 ⇒ **N80–N87** 三处随正（机制档 §7/§5 ∥ API §2.11 用例行 ∥ 本表落点表 + 自检③）。
- #12（🔵 `index.mjs` 缺行账）⇒ §5 本批壳件行补 `index.mjs` **323** ⇒ ≈360（读指令族 kind 扩三 ∥ `answer` 分发 ∥ `abort{key}` ∥ `run.images` ∥ 在途单飞 ⇒ 会话键表）；「盒壳两件 ⇒ 三件」。
- #13（🔵 先例列缺⑤）⇒ 档头先例列增 **⑤ 两壳**（对齐 = 核件直用 + 行形；偏离 = 盒壳 ask 回路（盒在进程外、帧即转发即弃）——含实现坐标与理由）。
- #14（🔵 排除理由面别未限定）⇒ CHAT §2.1⑧ 会话内搜索改**面别限定**（管理面不做 ∥ 成员面按三端对齐补）。
- #15（🔵 ask 体/kind 匹配判定缺）⇒ API ask 行补判定句（**体与 kind 不符 ⇒ 400 零副作用**——服务端按 kind 校验值表）+ N80 补腿。
- #16（🟡 §5 基表旧估数顶实读）⇒ 五件行收正实读（relay **310** ∥ routes **485** ∥ box-routes **166** ∥ cred **118** ∥ pull **104**）；relay/routes 两行注「行账 = 本批行」。
- #17（🔵 R84 呈报口径）⇒ R84 补明示「**属真端面约束**（why = 审批门在盒内——页面旗值到门须下行帧新通道；两壳门在进程内可 live）——非增强」；本表上抛行同拍。
- **连带（机检闸面——形式面零新语义）**：六悬空收正（`protocol.mjs` ∥ `subblocks/block.mjs` 补仓根前缀；`member-tools.mjs` ×2 ∥ `member-asks.mjs` 补「（拟新增」标）∥ `agent/setup.mjs:218` 补核前缀）+ 四超宽行折行（机制档 :122/:259/:383/:388）。
- 三档变更记录各一行（机制档/CHAT/API——含 22 ⇒ 23 与折行连带）；机检读数 = `node scripts/doc-check.mjs`（读数入 eng-designer 报告）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**member-face-parity 设计评审 · 首轮发现表**

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 在途门粒度两处相抵：`d:/teamcode/thincoder/docs/server/design/gateway/API.md:268`「在途门 = **工作区级**（同工作区任一会话在跑 ⇒ 发消息 400 人话——`agent/MEMBER-AGENT.md` §3.4）」∥ `API.md:385`「在途门 = 工作区级（并发二发 ⇒ 400 零副作用）」未随 00:59 纠正收正；机制档 `d:/teamcode/thincoder/docs/server/design/agent/MEMBER-AGENT.md:51`「门粒度 = **会话**（同会话二回合 ⇒ 400 零副作用）」∥ `MEMBER-AGENT.md:130`「在途门粒度 = **会话**（member-face-parity 批——KD-SV-213」∥ `d:/teamcode/thincoder/docs/server/design/webui/CHAT.md:139`「在途门 = 会话级（跨会话放开——KD-SV-213；同会话二发 ⇒ 400）」——同机制两面并存（会话级 ∥ 工作区级） | 以 KD-SV-213/§3.4 为单源统一：API §2.11 前注与 §5 AC-50 行改会话级（同会话二发 400 ∥ 跨会话并行可达）；批档 §2 设计档落点表（:125）补列该项 |
| 2 | Document ownership | 🔴 | 拉仓工具归属两处相抵：`MEMBER-AGENT.md:50` KD-SV-212 述「+ `pull` 工具 = 盒壳注入件（`deploy/sandbox/member-shell/member-tools.mjs` 新档）」；同档 `MEMBER-AGENT.md:320` 述「既有能力登记（盒内 `git` 工具 + 凭据助手）——**不另立工具**」、批档 §2 第 12 项述「拉仓 = 既有能力登记」（`docs/batches/2026-10-15-member-face-parity.md:96`）、分刀⑤述「server 域四件 + `extraTools` 注入」（`:137`）——拉仓是否另立工具不可两存 | 收正 KD-SV-212 句：四件 server 域工具入 `member-tools.mjs`、拉仓沿既有 git 工具（或反向改 §3.11(7) 与批档 §2 表）——两存取一 |
| 3 | Feasibility | 🔴 | 四件工具的动作面与工作区 key 判权面不相交：`MEMBER-AGENT.md:319`「动作 = `POST /api/me/sandbox/*`（工作区 key——`Authorization: Bearer <OPENAI_API_KEY>` 同值）」∥ `MEMBER-AGENT.md:184`「server 域成员件经工作区 key 调 `/api/me/*`」；而 `MEMBER-AGENT.md:34` KD-SV-154「`OPENAI_API_KEY` 同值——第二门 `/api/box/*`」∥ `API.md:266`「**双鉴权**：控制台 cookie ∥ 登录 token `Authorization: Bearer`——双门同判权」∥ `MEMBER-AGENT.md:185`「cookie/Bearer ⇒ 成员身份」——判权面未列工作区 key（现设计下 401；且触 KD-SV-154 被否项「成员登录 token（盒可代成员全权——面过宽）」的收窄取向） | 二择一落形：或明列工作区 key 为 `/api/me/sandbox/*` 第三门（键 → 工作区 → 负责人，作用域 = 本工作区）并同步 API §2.7/§2.11 判权句与 KD-SV-154 射程句；或改走盒面端点（`/api/box/*`）——并在受影响件与判据中落形 |
| 4 | Affected-file annotations | 🔴 | 测试链无现读/增量注且清单互不一致：批档 §2 受影响文件表（`docs/batches/2026-10-15-member-face-parity.md:139`）未含测试链（唯 `MEMBER-AGENT.md:357` 以「测试链四件（§9 R89）」指针带过）；`MEMBER-AGENT.md:418` R89 仅列四件、无一件带现读行数与 ≤±N（四件 = `2026-10-13-member-face-chat-ui.test.mjs` ∥ `2026-10-13-member-face-chat.test.mjs` ∥ `2026-10-08-server-public-structure.test.mjs` ∥ `2026-10-11-console-tabs-component.test.mjs`）；`MEMBER-AGENT.md:411` R82 已载「**同窗他批并计**：member-face-parity 批同触键数指纹/档目链——实施当刻以盘面实读为准」并逐件给出键数/档目断言（含 `2026-10-10-runner-admin-console-ui.test.mjs` ∥ `2026-10-12-team-projects-permissions-ui.test.mjs`）——本批 +≈40 键/表同触该件，R89 缺其中两件；`MEMBER-AGENT.md:358` 载 `…test.mjs` **758**〔修复轮在途〕（越 500 软线）无本批拆档审查句；批档 §2 自检「② 受影响文件全 + 行数？＝是」（`:141`）与此相抵 | 受影响文件表补列测试链（R89 四件 + R82 另列两件）并各带现读与 ≤±N 增量注；补 758 行件软线处置句（拆/不拆 + 理由）；R89 与 R82 清单收为单源 |
| 5 | Clarity | 🟡 | 工具结果截断口径两述：`MEMBER-AGENT.md:122`「（**`call.args` ≤500 ∥ 结果摘要 ≤300**——管理面同源常量；`ask.args` 同源同口径；**服务器零落库**——帧即转发即弃）」∥ `MEMBER-AGENT.md:138`「展示形截断沿管理面同款（`args` ≤500 ∥ 结果摘要 ≤300）」与 `MEMBER-AGENT.md:310`「活流：`result.content`（全文）入卡（`finishToolCard` 文本 = `content` ∥ 摘要）」及批档 §2 第 7 项判据「>300 字结果卡内全文；回读同形」相抵——`content` 与 `summary` 两字段各自截断/掩蔽口径（含活流 ∥ 回读、64 KiB 单源射程）未收正 | §3.3/§3.4 两句补收正：明写两字段及各自上限（`content` = 核 `capText` 64 KiB 单源；`summary` ≤300 沿用）；活流与回读同径 |
| 6 | Document ownership | 🟡 | 图片通道（第 14 项）契约/帧形行未随正：批档 §2 第 14 项「`messages` 体 + `run` 事件扩 `images`」（`docs/batches/2026-10-15-member-face-parity.md:98`）∥ `MEMBER-AGENT.md:308` 同旨；但 `API.md:277` 仍述「体 `{ content }` ⇒ **NDJSON 流**（帧词表 = §2.8 同源）」、`MEMBER-AGENT.md:104` 述「`{ cmdId, sessionId, content }`」——端点/帧面单源未含 `images`（批档 §2 落点表 :125 亦未列） | 两处随正：API §2.11 messages 行体扩 `images?`（dataURL 列）；MEMBER-AGENT §3.3 `run` 行体扩 `images`（与 §3.11(6) 同口径） |
| 7 | Clarity | 🟡 | `cmd` 族 kind 清单与词表句未随正：`MEMBER-AGENT.md:107` 仍述「kind = `sessions.list` ∥ `session.read` ∥ `session.create` ∥ `session.update`」（缺 `session.delete`/`session.rename`/`files.list`——同档 `:94` 已述两 kind、`API.md:303` 已列七 kind）；`MEMBER-AGENT.md:117` 仍述「`begin { cmdId }` ⇒ 六帧词表 ⇒ `end`」；`API.md:385` 行内「回合流帧形（`begin` + 六帧 + `end`；纯转发零落库）」同 residue——本批增补七型后帧面已非六帧 | §3.3 两行收正（kind 清单补三 kind、指向单源；`turns` 行句改「六帧词表 + 本批增补集——帧表 = §3.11(1)」）；API §5 行同句随正 |
| 8 | Document consistency | 🟡 | API 计数未随本批收正：`API.md:291`「member-face-parity 批扩六键」与 `API.md:486`「会话行形扩四键（`title`/`count`/`flags`/`awaitingApproval`）」相抵（实为四键）；`API.md:385`「表 = §2.11 **十四行** ∥ §2.12 **五行**」（含三新端点后表实为十七行）；`API.md:25`「`/api/me/chat/*`（会话七行——列表/建/详情/模型清单/发消息 NDJSON 流/中止/换模型设档）」（同族已十行） | 三处就地收正：行形句改四键；§5 行改十七行；§1 行改十行并列三端点名（asks/delete/files） |
| 9 | Document consistency | 🟡 | 旧数残留：批档 §1:67「**计数随正**：欠账 18 ⇒ **22 项**。」∥ `MEMBER-AGENT.md:211`「（批档 §1 两表 **22 项** + 低优先两件 + 控件行余钮判定——逐项对位表 = 批档 §2）」仍按 22 项（`MEMBER-AGENT.md:425` 变更记录同 residue）；批档 §2:79 已声明「18/22 两个旧数不再引用。」（现况 = 23 项） | 两处改 23 项（或去具体数、指 §2 计数口径单源） |
| 10 | Scope | 🟡 | 四钮解隐藏落法未点名（coordination item）：现收窄 = 全局「④ **无源钮收窄**（CSS 隐藏——无源实证逐条）」（`CHAT.md:80`，五枚）；本批述「核控件行四钮解隐藏（适配层 `state.flags()` 由恒假改读当刻会话行）」（`MEMBER-AGENT.md:260`）——页级作用域改法未定，误改即牵动管理面收窄 canon（AC-19）/用例；`MEMBER-AGENT.md:357` style.css 增量行（「卡族/下拉/搜索/子代理块类名」）未列此项；§7 无钮可见性判据 | 点名落法（页级作用域选择器 ∥ 适配层开关）并列入 style.css 增量与受影响件；补一条钮可见性机检（成员面四钮可见 ∥ 管理面五枚仍隐，两侧同测） |
| 11 | Acceptance criteria | 🟡 | 在册项无对位用例号（机检落点缺）：reasoning 块（第 10 项——判据「推理块在场（默认折叠）；无推理 ⇒ 零块」）；工具面四件（第 12 项——判据「工具表含四件」）；📁 工作区切换（第 21 项）；⚙ 路由（§3.11(6)）；自动标题展示（`title` 非空 ∥ excerpt 顶行）——`MEMBER-AGENT.md:388` N85 含位标/meta/✎/✕、N86 含搜索/复制/`@`/图片，均未含上述项（自检 ③ 与此相抵） | 补 N87（或扩 N77）：推理块折叠/空态 ∥ 工具面四件与拉仓登记 ∥ 📁 切换与零残留 ∥ ⚙ 路由 ∥ 标题/excerpt 顶行——使逐项判据均有编号落点 |
| 12 | Affected-file annotations | 🟡 | 受影响文件两表不一：批档 §2（`docs/batches/2026-10-15-member-face-parity.md:139`）列 `deploy/sandbox/member-shell/{protocol,index,core-run}.mjs`（167 ∥ 323 ∥ 321 ⇒ ≈290/≈360/≈440）——含 `index.mjs`（323 ⇒ ≈360，增量内容无注）；`MEMBER-AGENT.md:347` 本批壳件行只列 `protocol.mjs`（167 ⇒ ≈290）∥ `core-run.mjs`（321 ⇒ ≈440）∥ 新档 `member-tools.mjs`（≈180）——未含 `index.mjs` | 两表取齐：`index.mjs` 列入本批壳件行并补增量注（改动内容点名） |
| 13 | Closest-precedent | 🔵 | 本批未随档头先例列补坐标（同规先例 = 同档变更记录 `MEMBER-AGENT.md:427`「③ 档头先例列增第 ④ 条（账户页凭据卡——对齐/偏离——KD-SV-205 最近先例）」）：`MEMBER-AGENT.md:5`「> **最近先例（四坐标）**：」未含三端对齐面（两壳 VSC/桌面——卡族 ∥ 子代理栈 ∥ 会话条行形 ∥ 四旗）的对齐/偏离汇总句，依据散见 §3.11 逐项表 | 档头先例列增一坐标（两壳：对齐 = 核件直用/行形对齐；偏离 = 盒壳 ask 回路——盒在进程外、卡状态零服务端落） |
| 14 | Clarity | 🔵 | 会话内搜索排除理由与成员面新增未收正射程：`CHAT.md:48`「⑧ **会话内搜索**——宿主 = 浏览器（原生 Ctrl+F 恒在）⇒ 核 `createSearch`（为无查找面的两壳而建）零增益」；成员面（同宿主类）本批落「核 `createSearch({ root: .chat-thread })`（Ctrl+F 注册随核件工厂——零端侧副本）」（`MEMBER-AGENT.md:306`） | 收正 §2.1⑧ 理由句为面别限定（管理面不做不受影响 ∥ 成员面按三端对齐补），消同档两面对同一理由的相冲读法 |
| 15 | Acceptance criteria | 🔵 | ask 应答体与 kind 匹配判定缺：`API.md:279` 只列「未知/已了结 promptId ∥ 回合已收尾 ⇒ 400 人话（零副作用）」——未定「kind 与体不符 ∥ 裁决值表外」的判定（服务端校验 ∥ 直传盒壳） | 补一句判定（kind 不匹配 ∥ 值表外 ⇒ 400 零副作用——或明示直传口径），并入 N80/E 族用例 |
| 16 | Doc hygiene | 🔵 | §5 基表与实读行并存致读法不定：`MEMBER-AGENT.md:339`「`src/agent/member-relay.mjs`（拟新增）」行（新 ≈220）与 `MEMBER-AGENT.md:340`「`src/agent/member-routes.mjs`（拟新增）」（新 ≈250）未随落地收正——同档 `MEMBER-AGENT.md:349` 已载「`member-relay.mjs` **310** ⇒ ≈400」（member-routes 485 ⇒ ≈530） | 基表已落件行收正为实读（或标「行账 = 本批行」） |
| 17 | Scope | 🔵 | R84 呈报理由与 §1 口径的张力：批档:`54`「**欠账不挂待裁**——凡本表在册项直接走；超出「基本一致」的增强才允许提请。」而 `MEMBER-AGENT.md:413` R84 所述差异 = VSC `_autoApprove` mid-turn live ∥ 成员面下回合生效、默认补法代价「成本小——未裁前不做」——非「增强」类差异的处置口径宜明示 | 维持呈报则补一句明示其属真端面约束（审批门在盒内、mid-turn 须新帧）；或按口径直补 |

**计数**：🔴×4 ∥ 🟡×8 ∥ 🔵×5 = 17

VERDICT: changes-required

### 轮次 2（评审子代理）

核验：轮次 1 十七条修正逐条对位核读——17/17 已落盘（含形式连带：六悬空收正 + 四超宽行折行）。除既有表外，本轮显见新问题 5 条：

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | `gateway/API.md:184`「写面零端点（成员对工作区的动作随 #1216 ② 权限模型——`sandbox/SANDBOX.md` §8 成员面）。」与同节 `gateway/API.md:178`「**工作区 key 第三门**（member-face-parity 批——盒内工具面：写面建/启停/销毁；键 → 工作区 → 负责人；作用域 = 本工作区）」及 `gateway/API.md:266`「成员面工作区写面扩（`/api/me/sandbox/*`——建/启停/销毁/拉仓）」相抵——同一机制（成员对工作区写面）两处描述不同（零端点 ∥ 已开四端点）；`agent/MEMBER-AGENT.md:186`「**成员动作集（写面——本批开）**：创建 ∥ 启动 ∥ 停止 ∥ 销毁」同拍（KD-SV-156） | 收正 `gateway/API.md:184` 尾句为已开写面之指针（四动作 + 拉仓，端点列于 §2.11 扩行）；删「写面零端点」与「随 #1216 ② 权限模型」两处失效表述 |
| 2 | Acceptance criteria | 🟡 | `gateway/API.md:387`「判据全文 = `agent/MEMBER-AGENT.md` §6/§7（**成员面** N71–N78 ∥ B69–B72 ∥ E54–E57）」为旧范围——与同档 `gateway/API.md:296`「用例 = 该档 §7（**成员面** N71–N87 ∥ B69–B76 ∥ E54–E61）」及 `agent/MEMBER-AGENT.md:365`「用例 = §7（成员面 N71–**N87** ∥ B69–**B76** ∥ E54–**E61**）」不一致（N79–N87 ∥ B73–B76 ∥ E58–E61 漏列） | 收正为 N71–N87 ∥ B69–B76 ∥ E54–E61（或补范围限定句——若有意仅指 member-face-chat 子集） |
| 3 | Clarity | 🔵 | `webui/CHAT.md:215` 本批验收行括注「（判定项 = 差异条⑩ 不做句）」指向不可解——差异条⑩ = 页件拆档（与「判定项」无涉）；「不做」句 = §2.2 末条（无编号）；⚙ 判定本体在差异④/机制档 §3.11(6) | 改指消歧（如「⚙ 判定 = 差异④ ∥ §3.11(6)；判定项两枚 = §2.2 末「不做」句」） |
| 4 | Affected-file annotations | 🔵 | `agent/MEMBER-AGENT.md:364` 同一行两处「现读」并立——「`style.css`（现读 358 ⇒ ≤±30——本面行账 = `webui/STYLE.md` §3）」与「`style.css`（现读 **378** ⇒ ≈440」——读法不定 | 前者补日期或改「旧读」，或按 378 收正基数（同轮 1 #16 处置口径） |
| 5 | Doc hygiene | 🔵 | `agent/MEMBER-AGENT.md:46` 空行使 §2 决策表断开——`:47`「| KD-SV-206 | **帧面统一扩展 = 一族一次接线**」至 `:54`（KD-SV-213）八行脱离表头/分隔行；GFM 语义下不成表（渲染为普通段落） | 删 `:46` 空行或以表头/分隔行续表——KD-SV-206–213 八行纳入同一表体 |

**计数**：🔴×1 ∥ 🟡×1 ∥ 🔵×3 = 5

VERDICT: changes-required

### 轮次 3（评审子代理）

核验：轮次 2 五条修正逐条对位核读——5/5 已落盘（🔴×1 ∥ 🟡×1 ∥ 🔵×3 全收口）；新发现 = 0（轮 3 仅核验轮 2 表——不回猎新问题）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 轮2#1 | `gateway/API.md:184` | 🔴 | Fixed | 「写面零端点（成员对工作区的动作随 #1216 ② 权限模型…）」句已换为「写面已随 KD-SV-156 开（成员对工作区的动作：创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓；端点 = §2.11 表（`:286`–`:289`——建 ∥ 启停/销毁 ∥ 拉仓 ∥ 拉取状态）；判权 = 工作区 key 第三门（上注）；机制 = `sandbox/SANDBOX.md` §8 成员面）。」——与 §2.7 前注 `:178` ∥ §2.11 `:266` 写面扩 ∥ `:286`–`:289` 四行 ∥ `MEMBER-AGENT.md:185` 成员动作集同拍；引用行号实读核对无误 |
| 2 | 轮2#2 | `gateway/API.md:387` | 🟡 | Fixed | 判据范围已收正：「判据全文 = `agent/MEMBER-AGENT.md` §6/§7（**成员面** N71–N87 ∥ B69–B76 ∥ E54–E61）」——与 `API.md:296` ∥ `MEMBER-AGENT.md:365` 一致 |
| 3 | 轮2#3 | `webui/CHAT.md:215` | 🔵 | Fixed | 括注「（判定项 = 差异条⑩ 不做句）」⇒「（判定 = 差异④ ∥ 机制档 §3.11(6)）」——指向可解（差异④ `#settings-btn` 路由句 ∥ §3.11(6) ⚙ 行） |
| 4 | 轮2#4 | `agent/MEMBER-AGENT.md:363` | 🔵 | Fixed | 首处「现读 358」⇒「前读 358 ⇒ ≤±30」（次处「现读 **378** ⇒ ≈440」保持）——两读数分列不再并立 |
| 5 | 轮2#5 | `agent/MEMBER-AGENT.md:46` | 🔵 | Fixed | 空行已删——§2 决策表 KD-SV-205（`:45`）–KD-SV-213（`:53`）并体（KD-SV-206 现居 `:46`） |

**计数**：Fixed×5 ∥ Unfixed×0 ∥ New×0（🔴×1 ∥ 🟡×1 ∥ 🔵×3——全收口）

VERDICT: pass

### 轮次 4（评审子代理）

核验：轮 3 表五条逐条对位核读——5/5 仍为 Fixed；引证面复检 = 5/5 单行连续原文（逐条 file:line + 所在行内连续引文；无省略号、无跨行拼接）。无新增猎（新发现 = 0）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 【重核 = Fixed】轮 3 #1（原轮 2 #1）——`d:/teamcode/thincoder/docs/server/design/gateway/API.md:184` 单行连续原文：「写面已随 KD-SV-156 开（成员对工作区的动作：创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓；端点 = §2.11 表（`:286`–`:289`——建 ∥ 启停/销毁 ∥ 拉仓 ∥ 拉取状态）；判权 = 工作区 key 第三门（上注）；机制 = `sandbox/SANDBOX.md` §8 成员面）。」——旧句「写面零端点」全档零残留（grep 零命中）；与 :178 第三门句 ∥ :266 写面扩 ∥ :286–:289 四行同拍 | 无（条目已收口；维持现状） |
| 2 | Acceptance criteria | 🟡 | 【重核 = Fixed】轮 3 #2（原轮 2 #2）——`d:/teamcode/thincoder/docs/server/design/gateway/API.md:387` 单行连续原文：「判据全文 = `agent/MEMBER-AGENT.md` §6/§7（**成员面** N71–N87 ∥ B69–B76 ∥ E54–E61）」——旧范围「N71–N78」零残留；与 :296 同范围句 ∥ `d:/teamcode/thincoder/docs/server/design/agent/MEMBER-AGENT.md:364` 同拍 | 无（条目已收口；维持现状） |
| 3 | Clarity | 🔵 | 【重核 = Fixed】轮 3 #3（原轮 2 #3）——`d:/teamcode/thincoder/docs/server/design/webui/CHAT.md:215` 单行连续原文：「⚙ 判定（判定 = 差异④ ∥ 机制档 §3.11(6)）」——旧指针「差异条⑩」零残留；指向两处均可解（差异④ = CHAT.md:132 含 `#settings-btn` 路由句；§3.11(6) = 机制档同题行） | 无（条目已收口；维持现状） |
| 4 | Affected-file annotations | 🔵 | 【重核 = Fixed】轮 3 #4（原轮 2 #4）——`d:/teamcode/thincoder/docs/server/design/agent/MEMBER-AGENT.md:363` 单行连续原文：「`style.css`（前读 358 ⇒ ≤±30——本面行账 = `webui/STYLE.md` §3）」——两读数分列（同段次处「现读 **378** ⇒ ≈440」在册）；「前读 358」全档恰一处 | 无（条目已收口；维持现状） |
| 5 | Doc hygiene | 🔵 | 【重核 = Fixed】轮 3 #5（原轮 2 #5）——`d:/teamcode/thincoder/docs/server/design/agent/MEMBER-AGENT.md:46` 单行连续原文：「| KD-SV-206 | **帧面统一扩展 = 一族一次接线**（member-face-parity 批——用户「跟 vsc/desktop 差不多」+ 00:42/00:46 裁）」——空行已删（该行现为 KD-SV-206 表行；:45 KD-SV-205 与 :53 KD-SV-213 并体） | 无（条目已收口；维持现状） |

**计数**：Fixed×5 ∥ Unfixed×0 ∥ New×0（🔴×1 ∥ 🟡×1 ∥ 🔵×3——全收口）；引证面 = 5/5 单行连续原文（逐条 file:line + 行内连续引文）。

VERDICT: pass

## §4 用户批准（主 agent）

**父侧代签（承用户「自动跑 = 全链自动授权」令 · 2026-10-15 02:3x）**：设计评审四轮（轮 1 十七条全受理 → 修正 → 轮 2/3 内容核验 → **轮 4 = 重核 5/5 Fixed + 引证面复检通过**，主机已签发设计令牌）⇒ **批准**。
**实施面三分（拆面派单）**：① 盒面 + 服务器核面——盒壳件（`protocol` ∥ `index` ∥ `core-run` ∥ 新 `member-tools`）∥ `member-relay.mjs` ∥ `member-routes.mjs`（含三端点外迁）＝席位 A；② 成员面 UI 面——`views-me-chat*`（拆分 + 三新档）∥ `composer` ∥ `messages` ∥ `style.css`（作用域覆写）∥ `i18n-{zh,en}-me.mjs` ＝席位 B；③ 测试链七件（六既有随正 + 新批内件）＝席位 C（dependsOn A/B）。
**承上抛**：防撞并线腿（盒桩件 `taken` 名集并入注入件名集）入席位 A。
**部署腿（R88 盒镜像重建）＝ 收口披露项**（本机无 docker——同 R81 口径，入台账条件）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（席位 B · UI 面：全件落地 + 内审/代码评审两轮 + fix R1（🔴 与两条 🟡 已闭）——定向单元档 10/10 绿）



### 席位 A 实施记录（盒面 + 服务器核面 · 2026-10-15）

**交付摘要**：§2 分刀 ①（机制刀）与 ⑤（工具面刀）在本席位域内落齐 = 七件（盒壳三件 + 新 `member-tools.mjs` + `member-relay.mjs` + `member-routes.mjs` + 新 `member-asks.mjs`）。逐项 = 帧面七型 + `usage` 两扩字段 + 下行 `answer` + `abort{key}` ∥ ask 回路（上帧登记 ⇒ 在途表 ⇒ 下行应答 ⇒ 盒壳结算，收尾三径兜底 + 后到 400 零副作用）∥ 四旗/标题读写（PATCH 一次一件 ⇒ `session.update`/`session.rename` 指令）∥ 在途门会话级 ∥ 行扩四键（`title`/`count`/`flags`/`awaitingApproval`）∥ 图片通道（携图才取模型 + 核件三门/视觉门）∥ `@` 候选（`files.list` + `GET /api/me/chat/files`）∥ 工具面（核家族全件 + server 域四件经 `extraTools` 注入 + 防撞 `taken` 并成员件名集）。UI 面（⑨ 页卡/段表/会话条）、测试档、设计档 = 非本席位笔，未触。

**落点与实读行数**（`node --check` 七件全绿）：

| 件 | 行数 | 主落点 |
|---|---|---|
| `deploy/sandbox/member-shell/protocol.mjs` | 167 ⇒ **318**（设计 ≈290） | `:25` 帧表七型 ∥ `:31` ask 四值 ∥ `:36` 裁决两表 ∥ `:157` `usageFrame` 两扩字段 ∥ `:204` `subFrame` ∥ `:217` `askFrame` ∥ `:291` `answerSettlementOf` |
| `deploy/sandbox/member-shell/core-run.mjs` | 321 ⇒ **655**（设计 ≈440） | `:228` `createCoreRun` ∥ `:282` `createTurnHost` ∥ `:302` `settleAnswer` ∥ `:320` `cancelKey` ∥ `:387` `updateSession`（四旗）∥ `:415` `renameSession` ∥ `:428` `deleteSession` ∥ `:436` `listFiles` ∥ `:447` `runTurn` ∥ `:468` `taken` 并成员件名集 ∥ `:470` `extraTools` ∥ `:510` 十一回调 |
| `deploy/sandbox/member-shell/index.mjs` | 323 ⇒ **361**（设计 ≈360） | `:59` `runningSlots`（会话键表）∥ `:164` `state.running.set` ∥ `:188` `handleAbort`（`key` 停单件）∥ `:208` `handleAnswer` ∥ `:243`/`:251` 三条新 kind |
| `deploy/sandbox/member-shell/member-tools.mjs`（新） | **125**（设计 ≈180） | `:19` 四件名 ∥ `:22` `self` 自指 ∥ `:80` `createMemberTools`（第三门 + `destroy` 确认） |
| `src/agent/member-relay.mjs` | 310 ⇒ **419**（设计 ≈400） | `:26` `SESSION_BUSY_MESSAGE` ∥ `:45` `askAnswerBodyOf`（词表校验）∥ `:132` 帧面掩蔽/截断单点 ∥ `:158` 键活性投影 ∥ `:219` `busy(ws, session)` ∥ `:224` `pendingAskOf` ∥ `:348` `feedTurn`（ask 登记）∥ `:378` `answerAsk` ∥ `:398` `abortTurn` |
| `src/agent/member-routes.mjs` | 485 ⇒ **557**（设计 ≈530 ⇒ 拆后 ≈470） | `:41` PATCH 字段集七 ∥ `:49` `requireMemberScope`（第三门）∥ `:87` `sessionRowOf` 扩四键 ∥ `:136` `workspaceOr404`（`self` + 作用域）∥ `:212` 列表注入 `awaitingApproval` ∥ `:321` 会话级门 ∥ `:336` 图片门 ∥ `:531` 三端点拆档接线 |
| `src/agent/member-asks.mjs`（新） | **69**（设计 ≈90） | `:21` `registerMemberAskRoutes`（asks ∥ `:id/delete` ∥ `chat/files` 三端点） |

**决策透明表（设计未定处 = 最小合理形，逐项披露）**：

| # | 设计缺口 | 落地形 | 理由 ∥ 影响面 |
|---|---|---|---|
| 1 | ask 帧秘密面 `kind` 同名两义（帧判别位四值 ∥ 核 `onSecretInput` 的凭据类 `ssh-credential`） | 凭据类落 **`secretKind`**（`protocol.mjs:217` 起；白名单七键 = `secretKind`/`sessionId`/`host`/`user`/`port`/`fields`/`keys`） | 一个平铺对象容不下同名两键；取「帧判别位不动、载荷改名」最小形。**页面秘密卡（刀 ④）读 `frame.secretKind`** |
| 2 | 盒内工具四件不知「本工作区 id」（盒 env 四键无工作区号） | 自指 id = **`self`**：`POST /api/me/sandbox/workspaces/self/:action`；server 第三门解析 ⇒ 本工作区；他区 id ⇒ 404 不辨 | 沿用既有 `:id/:action` 路由形（零新路由）；cookie/成员 key 侧 `self` 非数 ⇒ 404（判权零放松） |
| 3 | `always` 的「行 `flags` 回推」无帧可用（帧表七型闭合） | 落 **行读面**：盒 `setSlotAutoApprove` 置槽 ⇒ 下次 list/detail/PATCH 行携 `flags.autoApprove=true` | 不新增帧（帧表为单源闭集）；页面在应答后重取行即见（刀 ③/④ 消费面） |
| 4 | 「非在跑 key ⇒ 400」的活性判据（服务端） | relay 逐 `sub` 事件帧调核件 **`relayEventToSubPatch`** 归约（`member-relay.mjs:158`）：`started`/`queued`/`turn` ⇒ 在跑，`done`/`settled`/`cancelled` ⇒ 出表 | 文法/终态词单源 = 核件（零第二表达式）；server 已声明 `@thincoder/render-core` 依赖（零新依赖） |
| 5 | 本席位单测档归属 | 自验走**临时区探针**（`.thincoder/tmp/probe-parity-a{,2}.mjs`，**非交付件**）；批内单测档 = 席位 C 笔 | 不越测试档域（任务书边界） |

**跨批影响（须父侧收口统一随正）**：
- `docs/batches/2026-10-15-member-face-mcp.test.mjs`（mcp 批）**T7 N6 并面旧期望** ⇒ 本批 `taken` 并成员件名集后转红（父侧已知会，未触）。
- `docs/batches/2026-10-13-member-face-chat.test.mjs` T7（B71「工作区级在途门」）∥ T14b（同句）见会话级门转红；`…-box-core.test.mjs:181` `listSessions({ runningSlot: 4 })` 见 `runningSlots`（Set）转红 —— 三处归席位 C 随正。
- 常量更名：`WORKSPACE_BUSY_MESSAGE` ⇒ `SESSION_BUSY_MESSAGE`（全文 = 「该会话正在执行另一回合」——旧名零残留，`grep` 空）。

**验证读数**（命令 + 结果）：① `node --check` × 7 件 = **全绿**；② 自验探针二档 = **18/18 + 13/13 绿**（`node .thincoder/tmp/probe-parity-a{,2}.mjs`——覆盖面：七帧构造/SSE 分块往返/`answerSettlementOf` 四 kind 逐形/秘密白名单/行扩四键/读史 `content`/四旗写面/`files.list` 忽略目录/宿主结算与兜底/停单件键文法/member-tools 四件端形 + `self`/`runTurn` 十一回调帧型齐在 + 图片 parts + 兜底收口；relay 侧：会话级门/跨会话并行/键活性/掩蔽截断/应答回程四拒档/收尾三径/掉线补帧/装配冒烟 21 端点）；③ `node scripts/doc-check.mjs` = **OK（错 0 悬挂）+ OK（行宽）**，本批域（member-* ∥ MEMBER-AGENT ∥ gateway/API）**零新增红**（行数差异清单零本批文件）。

**行数越线披露**：`core-run.mjs` 655（代码 ≈506 ∥ 注/空 150）与 `member-routes.mjs` 557（代码 ≈467 ∥ 注/空 91）越 500 软线（未越 800 硬限）。拆案已按设计落（member-routes 三端点外迁已执行）；复拆（盒壳读投射面 ∥ 工作区写面四端点各出档）= 结构决策，留父侧裁定——沿本仓先例（`registry.mjs` 535 行同式披露）。

**审计与代码评审轮次与终态**：**轮次 = 0**（本会话未跑内部 explore 分歧审计 ∥ 内部 advisor 代码评审——任务书验收集为 §2 A 表判据 ∥ 逐件 `node --check` ∥ 行数 ∥ doc-check 四项，已逐项交卷；跨臂评审 = 父侧/评审席流程）。**终态 = `clean`（自验面）**：七件语法绿 ∥ 探针 31/31 绿 ∥ doc-check 本批域零新红 ∥ 无静默降级（五处设计未定全部披露在案）。**fix round = 0**（探针首轮 3 处断言与假件错误自查收正，非代码回退）。

**行数收正（收笔复读终值）**：`core-run.mjs` = **654**（上表写 655——末次注疏修剪一行；其余六件逐值不变：318 ∥ 361 ∥ 125 ∥ 419 ∥ 557 ∥ 69）。`node --check` 七件与探针 31/31 于收笔后复跑，仍全绿。

### 席位 B · UI 面 · 实施记录（2026-10-15）

**交付摘要**：成员面对话页 UI 面全件落地（拆档 + 三端对齐面）。落件与行数实读（末行口径）：
`views-me-chat.mjs` 499（壳件——门限 ≤500，恰贴线，零余量）∥ `views-me-chat-composer.mjs` 451（四旗读面/写径 ∥ 状态行 19 段 ∥ images 放行 ∥ `atComplete` 桥 ∥ `pushMessage` ∥ `data-flags` 容器开关）∥ `views-me-chat-sessions.mjs` 280（标题/位标/meta/✎ 行内重命名/✕ 删除确认/📁 工作区）∥ `views-me-chat-cards.mjs` 181（核三卡 + 页内秘密卡 + diff 弹窗 + 块头审批态桥）∥ `views-me-chat-subs.mjs` 158（核 subblocks 链 + 效果表 + `abort {key}` + `approvalHead`）∥ `views-me-chat-messages.mjs` 124（帧纯件/notice 六值/`content` 全文取读/`coreText` 核方言插值）∥ `style.css` 445（作用域覆写 + 卡族/下拉/子代理块/`diff-*` 类）∥ `i18n-{zh,en}-core.mjs` +48 键/表 ∥ `i18n-{zh,en}-me.mjs` +21 键/表。

**决策透明表**（设计未名或与设计文句有出入之处——逐条带理由）：
| # | 落点 | 与设计文句的关系 | 理由 |
|---|---|---|---|
| 1 | 核件词面键（`perm/question/sub/search/secret/ssh/status/compress`）落 **core 两表**（+48/表）；页键 `me.chat.*` 落 me 两表（+21/表） | §5 键族估「me 表 +≈40 键」 | 两表声明域界（me = `usage.*/me.*`）∥ 跨批历史机检（`2026-10-11-chat-shell-align-ui.test.mjs` 词面腿：核件消费件 `t()` 字面 ⊆ core 表 + VSC locales 逐字相等）——核件发射键入 me 表会使该腿红；本批 69 键 = 核 48 + 页 21 |
| 2 | `wait` 段两形兼容：`{kind,…}`（设计本形）∪ `{phase,…}`（盒壳 `waitFrame` 原样透传 `onWait` 载荷） | §3.11(1) 帧表写 `{kind}` | 盒壳实读 = `deploy/sandbox/member-shell/protocol.mjs` `waitFrame(info)` 透传；页面按 `phase` 反查核单源产物键（四相表）；建议后续由盒壳载核 `waitStatusOf(ev)` 产物以消页面第二份相位表 |
| 3 | 配额回显前缀剥离在页侧（`QUOTA_ECHO_PREFIX` 由 en 表 `status.quota` 去占位符派生） | §3.11(1)「相位词单源 = 核」 | 发射侧恒为 en 字面（`provider/retry.mjs`），核单源同式派生；页面不能 import 核单源（只服务 `/rc/*`） |
| 4 | 复制降级 = 捕获拦截 + `ctx.flash`（页提示条） | §3.11(6) 写 toast | 页内无核 toast 依赖时为最小形；composer 侧同一动作已用 `showToast`（待父侧裁定统一） |
| 5 | diff 弹窗节点自组（判类/差分取核 `patchLineType`/`lineDiff`） | §3.11(2) 写「核 `renderDiff` 单源」 | 核 `renderDiff` 出 HTML 串 ⇒ 消费需 `innerHTML`，与页 canon（零 `innerHTML` 写口）相抵 |
| 6 | 段 18 仅「队列 N」不带 Enter 提示 | §3.11(4) 段表 | 段表未列 Enter 提示面（零假造） |
| 7 | 子代理块活动区无回读恢复（刷新后活动区空） | 设计未定此点 | 活动区 = 活流面；历史在流内归档块（设计未要求回读重挂） |
| 8 | `relayEventToSubPatch` 的 `syncLiveOf: () => false` | §3.11(5) 停单件面 | 成员面无核 registry 只读面（sync 子代理 ⏹ 门控不可得）；async `pool:true` 正常可停 |
| 9 | 跨代静音闸定形（**设计未名——本批新收口**） | 无对应设计句 | 核 `createSearch` 无 dispose（Ctrl+F 监注册不可撤）⇒ 旧代实例抢当刻 `#search-bar`（跨实例共用单条 id）。首版「document 捕获相全档 `stopPropagation`」被内审判为 🔴（全档键盘被压：Enter 发送/各页键面/Ctrl+F 自身），已改为**模块级单例闸**：只认 Ctrl+F ∥ 只在本页 `mount.isConnected` 时动作 ∥ 拦后由当刻代 `openSearch()` 显式开面 |

**审计与代码评审轮次 · 终态**：
1. **内审 explore 分歧审计（1 轮）**：5 条分歧——F1 子代理块头审批态未接线（设计 §3.11(5)）∥ F2 配额前缀未剥（核 `waitStatusOf` 同判据）∥ F3 diff 单源文句未落（件头已披露）∥ F4 行账漂移（五档超设计估 ∥ 核两表 +48 未入账）∥ F5 清单外测试档（本席定向单元档，设计未登记）。八项逐条核过无分歧（帧十四型消费 ∥ 段序 1–18 = 表序 ∥ 四 ask kind 全落地 ∥ 子代理链/状态表/停单件 ∥ 下拉六项 ∥ 开关零冲突 ∥ 零自持渲染 ∥ 三处披露真伪）。
2. **advisor 代码评审（1 轮）**：`changes-required`——🔴 1（跨代静音闸全档压键盘：旧代闸恒真后 Ctrl+F/Enter 全灭、SPA 跨页永久驻留）∥ 🟡 4（ask 卡生命周期未绑会话/回合 · `wait` 相位表第二份 · 壳件行数未达设计估 · 设计档引证随拆档失效）∥ 🔵 4（flash vs toast · 非 permission kind 审批词 · diff 呈现单源 · 测试档源码子串断言脆弱）。
3. **fix round R1（自修，1 轮）**：🔴 修毕（单例窄闸）∥ F1 修毕（`approvalHead` 置词/应答清态 + 终态核件自清）∥ F2 修毕（前缀剥 + `coreText` 核方言插值，消 `$` 残字）∥ 🟡「ask 卡生命周期」(i)(ii) 修毕（`cards.remount()` 重读重挂 + `end` 会话卫）∥ 余项按「登记待父侧」处理（行账/设计档引证/呈现单源/flash vs toast/测试断言形）。
4. **复跑读数**：定向单元档 `docs/batches/2026-10-15-member-face-parity-ui.test.mjs` **10/10 绿**（段 10–18 序/警示 ∥ 段 4/15/16 + 前缀剥 ∥ 跨代静音闸 ∥ 开关 ∥ 行形纯件 ∥ 卡族 verdict ∥ 全文取读 ∥ 块头审批态 ∥ 键族 21+48 ∥ 结构腿六档）；六档 + 档件逐件 `node --check` 绿。
**终态：clean**（🔴 与两条实修 🟡 已闭；残留 🟡 行账/设计档引证 = 父侧收口随正面，非本面缺陷）。

**随正件提示（父侧收口轮 · 本席未执行——禁跑/禁改历史档纪律）**：① `docs/server/design/webui/CHAT.md:145` 行号引证（现居 `views-me-chat.mjs:300-303`）+ §3 文件账三新档「（拟新增——本批）」档态 + 五档行账实读；② `docs/batches/2026-10-08-server-public-structure.test.mjs`：键数 `1129 ∥ 1134` 收正 + 指纹 sha256 重算 + **`DOMAINS.core` 补七段**（`compress`/`perm`/`question`/`sub`/`search`/`secret`/`ssh`——否则「域界不符」腿红）。
**披露（读数留存）**：本轮早期（父侧「只跑自己改动面」令到达前）曾跑过同批历史档四件，读数：`2026-10-13-member-face-chat-ui.test.mjs` 5✔/6�’（红项 = 自绘下拉替换 `chat-select`、bar 钮序号位移、search.css 第三档、键数 46→72、相③引导句 = HEAD 既有行为 ⇒ 均为本批设计所致的预期随正项）∥ `2026-10-11-chat-shell-align-ui.test.mjs` 7/7 ✔（词面腿含本批 +48 核键）∥ `2026-10-15-member-pull-detail-render.test.mjs` 4/4 ✔ ∥ `2026-10-08-server-public-structure.test.mjs` 4✔/2✘（指纹 + 域界——即上述随正项）∥ `2026-10-13-member-face-chat.test.mjs`（服务面集成档）T1–T6 ✔ 后 T7 超时未终（非本面：该档不加载 public 页件）。令到达后未再跑任何历史档。

### 席位 C · 测试链 · 实施记录（2026-10-15）

**交付摘要**：本批单元测试档（新）`docs/batches/2026-10-15-member-face-parity.test.mjs` —— 用例面 = 设计 §7 全部（N80–N87 ∥ B74–B76 ∥ E59–E61），13 组真跑（假核 + 假 DOM + 假 SSE 盒桩，单件自含）。链径：`member-routes` 路由 ⇒ `member-asks` 三端点 ⇒ `member-relay`（在途表/掩蔽/截断）⇒ 盒壳 `index`/`core-run`/`protocol` 结算 ⇒ 核件 ∥ `public/views-*` 消费面。
**生命周期（父侧裁定）**：跑绿 → 报读数 → **当场删档**（批内单测档用后即删）——**档已删，本席净 diff = 0**。六既有测试件 = 正面撤销（非本席笔，见下表 #4）。

**验证读数**（仓根 `d:\teamcode\thincoder`）：
`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-15-member-face-parity.test.mjs`
⇒ **tests 13 · pass 13 · fail 0 · skipped 0**（cancelled 0 · todo 0 · duration_ms ≈2378 · exit 0）。

**覆盖明细（13 组 —— 逐条对设计 §7）**：N80 ask 回路四形注册 ⇒ 应答帧 ⇒ `POST …/asks/:promptId` ⇒ `answer` 下行 ⇒ 盒壳结算（体与 kind 不符 ⇒ 400 零副作用）∥ N80b 盒壳 `answerSettlementOf` 逐 kind 逐形 + `always` ⇒ `setSlotAutoApprove` 置真 + 行 `flags` 回推 + 行形四键 ∥ N81 卡族三类（核 `renderQuestionCard` 类名序 ∥ 工具卡 ∥ 页内秘密卡三面 + `view-diff` 弹窗全量 patch + 表外 kind 零投）∥ N82 子代理面（`sub` 帧 ⇒ `subBlocksReduce` 归约：born/takeover/fold/remove/archive/refresh 逐型 ∥ 块头审批态（冻结块不收 ⇒ 幂等守卫）∥ 键活性投影 ⇒ 停单件）∥ N83 四旗写读往返（PATCH 一次一件 ⇒ `session.update` ⇒ 槽四字段 ⇒ 行 `flags`）+ ENG×PLAN 互斥 + 钮可见性两侧 ∥ N84 状态行全段（段集 ⊆ 机制档 §3.11(4) 表序 1–18 ∥ 缺源 ⇒ 零段）∥ N85 会话条（位标/meta/count 行形 ∥ 行内重命名 ⇒ `session.rename` ∥ ✕ 确认 ⇒ `session.delete` ∥ 📁 选择）∥ N86 页面小件（`@` 候选 ⇒ `atResults` 回推 ∥ 图片三门 + 体形 ∥ 搜索挂载 ∥ 复制降级 TLS 条件）∥ N87 推理块（默认折叠 / 空态零块）+ 工具面四件 + 拉合登记 + 防撞 ∥ 📁 切换 ∥ ⚙ 路由 ∥ 标题/excerpt ∥ B74 ask 兜底三径清表（拒/deny/取消 ⇒ 后到应答 400 零副作用 ∥ 页残留卡清 ∥ 盒壳兜底值三径）∥ B75 池态边界（停整回合 ⇒ 体零 `key` ∥ 停单件 ⇒ 非在跑 `key` ⇒ 400 零副作用）∥ B76 工具输出边界（核 `appendToolOutput` 截断 ⇒ `_capped` 停收 ∥ `result.content` 全文 ∥ 回读 64 KiB 口径）∥ E59–E61（审批拒/秘密取消结算值 ∥ 删除确认问 400 ∥ 重命名失败 ⇒ 400 人话零改）。
**N87 帧型齐在腿**含 `sub`（`eng-coder#2`/`⟦ev⟧done` 触发）；**零豁免**——八 + 三 + 三件全在，无降级替代。

**决策透明表（设计未定处 = 最小合理形，逐项披露）**：
| # | 设计缺口/未定 | 落地形 | 理由 ∥ 影响面 |
|---|---|---|---|
| 1 | `capText` 两形（核 `thincoder-render-core/lib.mjs:30` = `slice(0,max)+note` ⇒ 终长 = max + note；盒壳 `deploy/sandbox/member-shell/protocol.mjs:315` = `capText(text, max)`，调用侧传 64 KiB） | 断言取**值口径**（`_capped` 停收 + 明确截断标尾），不锁长度等式 | 两件同为截断单源 `MAX_TOOL_OUTPUT`（64 KiB 值一致）；文句形态差异 = 呈报（见下） |
| 2 | 假件装具面（假 DOM / 假核 / 假 SSE）设计未定 | 档内自建三桩：`makeNode`（`classList.toggle(name, force)` 遵 force ∥ `innerHTML` 片段解析 ∥ `type` 反射同浏览器）+ `fakeCore`（四旗真读写槽数据 + `loadManifest`）+ `attachBox`（SSE 解析） | 单测档 = 目标件自含最小形；桩只服务断言，不入产品面 |
| 3 | 会话 cookie 时效（桩侧时刻） | `createSession(db, uid, { now: Date.now() })`（首版 `now: 1` ⇒ 行过期 ⇒ 401 假红） | 会话判据 = `expiresAt` 对墙钟，桩须给真时刻 |
| 4 | 席位 A 移交三处跨批红 + 设计 §2 测试链六件 | **随正面撤销**——设计 §2 六件盘上零存、git 面六件 staged `D`；本席不随正 | 新法「批内单测档用后即删」⇒ 旧件不再续命；父侧裁定：六件非本席笔 |
| 5 | 本席自验临时区日志 | `.thincoder/tmp/{parity-run,doccheck}.log`（非交付件，跑毕即删） | 不越交付面；产品码 / 设计档 / 批档正文 = 零触 |

**呈报（父侧路由 —— 非缺陷，知会）**：
1. **截断文句两面形态差（知会）**：核 `lib.mjs:30`（`slice(0,max) + "…(输出过长已截断)"`）对盒壳 `protocol.mjs:315`（`capText(text, max)` 传 64 KiB）。**值口径一致**；文句 / 终长形态两面不同——本批设计「截断单源」句未定形，留父侧裁。
2. **盒桩 stdout 两行**（跑绿时）：`MCP 取表失败——跳过 MCP 面（回合不阻断）` ∥ `MCP 件与既有工具名相撞——该件不挂（先者留存）workspace_create` —— 既有装配面行为，非本席断言面，备查。
3. **旁档在场（非本席笔，未触）**：`docs/batches/2026-10-15-member-face-parity-ui.test.mjs`（席位 B 定向档 · 14.9 KB · untracked）仍在盘；其去留 = 父侧。

**审计与代码评审轮次 · 终态**：**轮次 = 0**（本席面 = 批内单测档，产品码零改 ⇒ 无分歧审计 / advisor 代码评审对象）。**终态 = `clean`**（跑绿 + 档按裁定撤、净 diff = 0）。**fix round = 3**（三次「跑—修」循环 · 8 处档内收正：桩 3 = `classList.toggle` force ∥ `req.url` 缺 ⇒ `/chat/files` 404 ∥ `type` 反射；断言/用例 5 = 会话 `now` 过期 ∥ `matchRoute` 未剥查询串 ∥ `capText` 长度等式误刻 ∥ 冻结块审批态用例面 ∥ busy 文案正则 ∥ 重命名失败核件分体）——皆**桩 / 断言收正，非产品码回退**；另首版全量重写 1 次（装具定形，交接前）。
**本席写入清单**：唯一交付件 = 上述测试档（**已删**）∥ 临时日志两件（**已删**）。产品码 0 ∥ 设计档 0 ∥ 批档正文 0（本段除外）。
**`node scripts/doc-check.mjs` 读数**：退出 1 = 行数面差异 82 条 + 悬空 1 条（`docs/server/design/webui/PROJECTS.md:80 → docs/batches/2026-10-08-server-public-structure.test.mjs`「盘无档」——前批撤销遗留）；**本批域零新增红**（报告全文对 `member-face` ∥ `parity` ∥ `2026-10-15` 三串命中 = 0）。
**测试档线**：① 本批单元档 = 已删（按裁定，无处置遗留）；② 集成场景 = 未触（本席面无集成面，父侧收口跑为唯一集成跑）。

## §6 验证与收口（父代理）

**验证（父侧实读 · 2026-10-15 18:2x）**
- 实施面抽读（现盘实读——`split("\n").length − 1` 口径）：`core-run.mjs` 654 ∥ `protocol.mjs` 318 ∥ `index.mjs` 361 ∥ `member-tools.mjs` 125 ∥ `member-relay.mjs` 419 ∥ `member-routes.mjs` 557 ∥ `member-asks.mjs` 69（七件与 §5-A 交卷逐值一致，`core-run` 654 = §5-A 收笔终值 ✓）；UI 面：`views-me-chat.mjs` 499 ∥ `views-me-chat-composer.mjs` 456 ∥ `views-me-chat-sessions.mjs` 280 ∥ `views-me-chat-cards.mjs` 180 ∥ `views-me-chat-subs.mjs` 162 ∥ `views-me-chat-messages.mjs` 124（与 §5-B 摘要微差 = 收笔后 fix 轮增行——以盘为准）。
- 批内件（`2026-10-15-member-face-parity.test.mjs` 13/13 ∥ 定向 UI 档 10/10）= 跑绿读数存档 §5；两档已按「用后即删」口径删除（现盘零存 ✓）。
- 测试链六件（跨批红三处 + 归并随正）= 对象随「用后即删」政策删除（`git status` staged `D` 在案）；台账 #1413 测试档份随销。
- 集成面 = 本仓无集成套件（清单空）；真机实走腿 = 用户对照 VSC/桌面实走（挂台账 #1424 条件行）。

**父侧直接执行（随正件——§5-B 交办 · 可 revert）**
- `webui/CHAT.md` 五处：① `:138` 行号引证 `views-me-chat.mjs:235-237` ⇒ `:300-303`（needSession 现居实证）；② §3 表三行实数（`views-me-chat.mjs` 499 ∥ `-messages` 124 ∥ `-composer` 456）+ 四新档行（sessions 280 ∥ cards 180 ∥ subs 162 ∥ pull 218）；③ 面小计 ⇒ **1,919**（七档实读）；④ `me.chat.*` 键族 ⇒ **72 键/表**（实读）；⑤ 核件词面部件实填 ⇒ **124 键**（实读）。撤销 = 单 commit revert。

**越线受理**：`core-run.mjs` 654 ∥ `member-routes.mjs` 557 越 500 软线（硬限 800 未越；`member-routes` 三端点外迁已落）——沿 `registry.mjs` 先例披露受理；复拆 = 结构决策，随下触碰批审（#1405 族 evidence 已回填）。

**披露/登记受理（非阻塞）**：① 截断文句两面形态差（核 `lib.mjs:30` ∥ 盒 `protocol.mjs:315`——值口径一致）= 呈报受理（设计未定形处，留后续设计轮）；② 盒桩 stdout 两行 = 既有装配面行为（备查）；③ `flash` vs `toast` 反馈形与 diff 呈现单源 = 已入台账（合一行，归批）；④ `syncLiveOf: () => false`（成员面无核 registry 只读面）= 披露受理。

**未执行项（诚实披露）**：R88 盒镜像重建 = 本机无 docker ⇒ 已入台账 **#1482**（条件 = 服务器侧 docker 窗口；与 R81 合一行）。

**结算**：本批台账 = **#1455**（在途 ⇒ 待核销 ⇒ 已核销——核销依据本段）；#1413 设计档份（行账）+ #1456（MEMBER-AGENT.md §5 计数份）→ 随「成员面随正重落」（设计席）收——指针在册。**暂缓批复核**：本批（成员面三批）零「暂缓」标记。**本批单测档**：两档已删除（用后即删）；集成面 = 本仓无集成套件（清单空）——真机面 = #1424（用户实走）+ #1482（盒镜像）条件行。
