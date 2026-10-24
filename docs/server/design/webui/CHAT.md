# Thincoder Server · 对话页（管理面 §2.1 ∥ 成员面 §2.2——webui/CHAT.md）

> 域总览与壳面 = `webui/WEBUI.md`。
> 成员面机制全文 = `agent/MEMBER-AGENT.md`。

## 1. 关键决策（本面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-101 | **管理面 chat 呈现面 = 复用 `thincoder-render-core`**（同源第二根 `/rc/*` 取件 ∥ **registry 区间依赖 `^0.1.0`**（#1353） ∥ 镜像显式双装打包径）+ **「先查再造」纪律句**：渲染单源 = 核 `md`/`highlight`/`tool-card`/`stream+live-md`/`scroll`；**做/不做 = 本档 §2.1 对齐集**（按运维用途裁——不照搬开发壳全量）；转义 = 核内单源（`webui/WEBUI.md` §3 收窄）；核 = 只读消费（不 fork ∥ 不改名 ∥ 端侧不覆写核件语义） | 用户 18:23 原话（「会话这件事做过无数遍……为什么每次再做都会别出心裁做一套新的」）；资产就绪（`@thincoder/render-core` host-agnostic ∥ VSC+桌面两宿主在用）；「先查再造」= 第五套 chat 的防复发句（仓级「复用优先」同向） |
| KD-SV-106 | **对话页壳面 = VSC 式四轴对齐**：① 布局（顶会话条 ∥ 文档流平铺消息流 ∥ 状态行 ∥ 输入区——sticky 段定位；原三卡去卡片化）∥ ② 消息形态（核 `thincoder-render-core/flow/block.mjs` 装配——标签行体系；工具卡嵌助手块内）∥ ③ 输入区 = 核 `thincoder-render-core/composer/panel.mjs` **全件消费**（适配层四面 + 四件控件后端：换模型 ∥ 附件 ∥ 中止 ∥ 斜杠——KD-SV-107/108/109）∥ ④ 状态行（输入区上方——读数项 ⊆ 有源；帧面加性扩展：`turn` ∥ `usage` ∥ `end` 补 `durationMs`/`calls`）；**基准 = VSC**（同形处取两壳公共形）；**端差异逐条实证**（差异表 = 本档 §2.1 ①③）；核件单源（composer ∥ block ∥ attach ∥ slash 全件消费——不自持第二套） | 用户 21:55 原话三句（全套 ∥ 补后端一件不藏 ∥ VSC 式）；复用优先 = KD-SV-101 纪律句的续（「先查再造」落在消息装配与输入区两处）；「不藏」= 四件控件不做空壳——后端逐件补齐 |
| KD-SV-111 | **控制台思考档位选择器 = 三段补齐（源 ∥ 线 ∥ 界面）——核件单源 ∥ 会话级归属**（功能点 42 ∥ AC-42）：① **源** = 服务端模型面随行下发（`GET /api/admin/providers` 每 provider 行增 `modelReasoning`——键 = 上游真名 ∥ 值 = 核 `specForModel(上游).reasoningEffortEnum`；稀疏：空档不登键）⇒ `deriveModels` 行携 `reasoning` ⇒ 核模型菜单行；② **线** = 会话设置面 `PATCH …/chats/:id { reasoning }`（值域 = 核同一枚举，表外 400）+ 回合装配携 `reasoningEffort`（未设 ∥ 表外 ⇒ 零字段）；③ **界面** = `#reasoning-btn` 解隐藏（收窄五钮）+ 核菜单 `selectReasoning` ⇒ PATCH + 切会话推送回读；钮字/选中态/下拉全归核件（控制台零二次改写）；④ 无档模型 = 核无档面中性（「中性」= 载荷中性：零字段发出） | 用户 2026-10-12 11:45 走查（原话「界面上没有思考档位选择器」）+ 11:46 口径核准；核件（菜单 ∥ 词面 ∥ 载荷门 ∥ off 语义）早已造好——缺的只是控制台三段；单源 = 核 `model-specs.mjs` 运行期直读 ⇒ 零第二清单、零漂移 |
| KD-SV-132 | **活流面 = 按步开合（`turn` 帧为步界）——与终态同形**（AC-41 ② 消息形态收正）：① **一步 = 一块**（每模型调用一块——该步文本气泡 + 该步工具卡组；`turn` 帧到达 ⇒ 上一步收束、新步起）② 一回合一个助手标签（只画回合首块——块数 = 步数）③ **活流与终态同形**（同一回合两径**标签/类名序**——**剔除在案登记差异位后逐字相等**；判据表述单源 = §2.1②〔形态签名比对·单元测试档机检〕；失败卡状态色差异沿 D2 口径在案）④ **服务端零改**（步界帧既有——`thincoder-server/src/agent/chat.mjs:499`；零新帧 ∥ 零新字段）⑤ `end` ⇒ 重读保留（读时单源——重读与活流同形 ⇒ 置换零位差；notice 行唯一呈现径） | 用户实走判（活流单块 + 卡挂块尾 = 症状根因）∥ VSC 同规（子回合边界起新块——`thincoder-vscode/webview/streaming.js:44-47`）∥ 终态回读本就按步分块（核 `buildAssistantRestore` 逐 assistant 行）——活流取齐 = 零口径改 |

## 2. 机制

### 2.1 管理面对话（`#/admin/chat`；机制全文 = `agent/ADMIN-AGENT.md` §11）

- **定位**：管理面 agent 的对话入口（运维/管理——机队 ∥ 成员与 provider ∥ 审查排障；**非开发用途**）；控制台第 9 页（侧栏序 = 我的 7 + 管理组第 2 项——置于「总览」之后；计数口径 = `webui/WEBUI.md` §2）；**非壳页**（对话流无上界——`SHELL_PAGES` 五路径不动）。
- **呈现面 = 复用既有会话渲染核**（「先查再造」）：基准 = `thincoder-render-core/`（`@thincoder/render-core`——自述 host-agnostic，VSC webview ∥ 桌面 renderer 两在用宿主）；**本页不自持第四套渲染实现**——渲染单源 = 核件；控制台自持面 = 壳 ∥ 文案 ∥ 取数 ∥ 布局。
  **核件词面注册 = 装配期 + 每次语言切换重注册**（`setStrings(当前语言核件词面)`——核 `_strings` 为模块级态（`thincoder-render-core/i18n.mjs:12-20`）：不重注册 ⇒ 切换后核件发射仍取旧表）。
- **复用形（取件 ∥ 声明 ∥ 打包，逐处对照两先例）**：
  - **取件 = 同源第二根**：静态面增 **`/rc/*` 供给根**（→ 核包目录；前缀序 `/rc/` 先于 `/` 兜底根；**各根各留逃逸门**——沿现单根判据逐式施加）；
   页面以同源绝对路径 import（`import { md } from "/rc/md.mjs"`）——与桌面 `app://` 双根逐式同形（先例 = `thincoder-desktop/src/main/protocol.mjs:21` 包名解析 + 双根登记）；VSC 相对路径形（`webview/streaming.js:19` `../node_modules/...`）不可用——控制台单 HTTP 根，越根不可达。
  - **node 侧同缝（单元测试档/门禁取件——平 node 无该 origin）**：**`thincoder-server/test/rc-resolve.mjs` 解析钩子**（`/rc/<子路径>` ⇒ `@thincoder/render-core` 包根——包名解析单源 = `package.json`；沿桌面 `thincoder-desktop/test/rc-resolve.mjs` 先例：`createRequire` 包名解析 + `registerHooks`）；
    **预载入口 = 运行式内 `--import` 预载**；单元测试档与既有件运行同式（自仓根 `thincoder/`）：`node --import ./thincoder-server/test/rc-resolve.mjs --test <单元测试档>`。
   缝件非单元测试档（不入链 ∥ 不入 `files` 白名单——不打包）；**既有件随正 = 管理面 chat 单元测试档**（链内——`load()` 页面档 ⇒ 缝承零改；其静态面用例上量随正 = 档目 `[38, 37]` ⇒ **[40, 39]** ∥ 类名/键闭两用例按核件消费实读收正——实施轮同拍）。
  - **包声明 = registry 区间依赖**：`thincoder-server/package.json` 增 `"@thincoder/render-core": "^0.1.0"`（#1353——`file:` 形使 `npm i -g <tgz>` 失败且包不可发布）；仓内开发面 = `npm install` 落 node_modules（本地 tgz ∥ registry 两径皆满足区间）。
  - **打包/部署径（镜像 = ECS 部署形）**：核包 = **可发布 registry 包**（`private` 已撤 + `publishConfig.access=public`——#1353；首发入 registry = 发布轮），发布前 ∥ 离线场景下 **range 依赖由本地 tgz 就地满足**（实测：双 tgz 同装 exit 0 「added 3 packages」——渲染核 tgz 即满足 `^0.1.0`）
    ⇒ 镜像侧**显式双装**——构建上下文改仓根 + 一次装两包（`npm i -g ./thincoder-server-*.tgz ./thincoder-render-core-*.tgz`——同前缀扁平装 ⇒ 包名解析可达 ∥ range 依赖就地满足）；`thincoder-server/Dockerfile` 随正（双包 COPY/pack——**实读 41/42**；受影响档在册）；
   部署随正（父侧笔面——已上抛）= `docs/TEST-ENV-ECS.md` §3 一行（build 上下文 ⇒ 仓根） ∥ `thincoder-server/README.md` 两处构建上下文行（`:16`/`:93`——上下文迁仓根后失真） ∥ **仓根 `.dockerignore`（新建——上下文迁仓根后 `thincoder-server/.dockerignore` 不再生效；清单按仓根重定）** ∥ `ops/OPS.md` §5.1（构建上下文句 ⇒ 仓根 ∥ 门禁链 42 ⇒ 52——沿批漂移同拍）。
   **npm 装机径**（`npm i -g @thincoder/server`——README §1/§3 两路之一）：核包投递 = **registry range 依赖自动解析**（`^0.1.0`——**发布前置 = 核包首发 registry**，发布轮执行）；**装机判据 = 缺包 fail-loud**（下条——装机后 `/rc/*` 无根不再静默白屏）。
   **缺包处置**（沿桌面 `thincoder-desktop/src/main/protocol.mjs:20` fail-loud 先例）：静态面根解析（`static.mjs` 装载期——包名解析与桌面 `CORE_ROOT` 同法）缺 `@thincoder/render-core` ⇒ **启动 fail-loud**（显式报错拒起）；运行期 `/rc/*` 无档 ⇒ 404（不吞）。与 `design/PROJECT.md` §9 R58② 同拍。
  - **转义/CSP 逐处对照**（VSC ∥ 桌面 ∥ 控制台）：

    | 面 | VSC webview | 桌面 renderer | 控制台 |
    |---|---|---|---|
    | HTML 注入形 | `innerHTML = md(raw)`（`webview/streaming.js:143`） | 描述符树 `props.html` 单点（`thincoder-desktop/renderer/dom.mjs:12-14`） | `innerHTML` = 核 `md()` 输出（页面唯一注入点 = 助手/用户/工具文本面） |
    | 转义责任 | 核 `md()`（输入先全量转义——`md.mjs` 档头 SECURITY 口径） | 同核 | 同核（控制台**零手拼 HTML 串**；非文本面续走 `h`/`textContent`） |
    | CSP | 占位符由扩展填（含 `'unsafe-inline'`） | `default-src 'self'`（零 `unsafe-inline`） | 现零 CSP 头（不改）；如后加 ⇒ `default-src 'self'` 即足（**控制台自有档**零内联样式/脚本；核件含内联状态色——CSSOM（`thincoder-render-core/flow/tool-card.mjs:111`/`:114`）∥ 回读径 `style=` 属性（`:162` ∥ `thincoder-render-core/flow/tool-card-restore.mjs:44`）⇒ 后加 CSP 而无 `style` 内联豁免则回读卡状态色落空——桌面 `style-src 'self'` 同态：`thincoder-desktop/renderer/index.html:7`） |

- **对齐集（逐项「做/不做 ＋ 理由」——按运维用途裁，不照搬开发壳全量）**：
  - **做**：① **markdown**＝核 `md.mjs`（助手 ∥ 用户气泡同径——KD-RC-4 口径）；② **代码块高亮**＝随 `md()`（核 `highlight.mjs`）；③ **工具卡**＝核 `flow/tool-card.mjs`（流式 = `renderToolCard` + `finishToolCard`；回读 = `renderToolHistory`；失败判定 = 核 `isToolFailure`）；
   ④ **流式拼接手感**＝核 `flow/stream.mjs` `createStreamRenderer` + `flow/live-md.mjs`（增量重绘——禁每帧全量重渲；节拍 = 核帧纪律 KD-RC-9/10）；
    ⑤ **滚动行为**＝核 `scroll.mjs`（近底 24px 判据单源；**用户上滚不夺阅读位**——`applyPin`/`createPinWatch`；`end` ⇒ 重读径照旧）；
      作用元素 ⇒ `document.scrollingElement`（文档流——判据不变）；
    ⑨ **输入区全件**＝核 `thincoder-render-core/composer/panel.mjs`（**翻做**；适配层四面 + 四件控件后端 = 本档 §2.1 ③）；⑩ **审批卡（单件 ∥ 批）**——本批落（源 = 管理面写类门挡 + ask 回路——机制 = `agent/ADMIN-AGENT.md` §11.5；卡面 = 核 `renderApprovalCard`/`renderBatchApprovalCard`）。
  - **不做（逐项理由）**：⑥ **思考块**——服务端帧面/落库面无 reasoning 文本通道（帧七型 ∥ 消息 role 四值）⇒ 无源；加字段 = 后端面（零推翻）⇒ 余项；⑦ **diff 块**——管理面工具八件无文件编辑族 ⇒ 无 diff 源；⑧ **会话内搜索**——**面别限定**：管理面不做（宿主 = 浏览器原生 Ctrl+F 恒在 ⇒ 运维面零增益）；成员面按三端对齐补（核 `createSearch`——`agent/MEMBER-AGENT.md` §3.11(6)）；
   ⑩ **问询/计划/subagent 卡**——面无源（管理面无 `question` 件 ∥ 计划模式 ∥ 子代理族裁剪——§11.5 收窄条；审批卡两件 = 已落——见「做」列表）；
   ⑪ **代码块复制钮**——核钮经 `navigator.clipboard`（安全上下文）——http 内网面即装即哑（假控件）⇒ 余项（TLS/公网化批后可接）。
  - **壳面归属（chat-shell-align 批收正）**：**消息块 = 核 `thincoder-render-core/flow/block.mjs`** ∥ **输入区 = 核 `thincoder-render-core/composer/panel.mjs`**（核文档口径「shell = 宿主面」——`docs/render-core/design/RENDER-CORE.md` §5 样式契约——把两处宿主面从自持翻为核件消费）；
    **控制台仍自持** = 会话条 ∥ notice 行 ∥ 状态行（核无状态行族）；核件发射类名族样式 = 控制台补（`webui/STYLE.md` §2.1 新面登记 + §3；类名闭合域随正 = 本档 §4 行）。
- **页形（四轴；基准 = VSC `index.html` 三段 + 内核两件）**：

  **① 布局（三段纵列——sticky 段定位）**：顶**会话条**（sticky 顶；会话选择器（当刻会话 + ▼；展开 = 会话列表下拉——行 = 模型 ∥ `excerpt` ∥ 时间，当刻项高亮）∥「新会话」钮 ∥「重读」钮（既有取数动作））；
  中**消息流**（文档流平铺——无卡无框；原三卡（会话卡/对话卡/输入卡）去卡片化——AC-19 ⑦ 卡片族在本页不落）∥ 底**输入区**（sticky 底）＝ `#toolbar` 容器：**状态行** + 输入行 + 附件/粘贴条 + 控件行（核 `thincoder-render-core/composer/panel.mjs` 全件——见 ③）。
  滚动 = **文档流**（核 `scroll.mjs` 作用元素随正 ⇒ `document.scrollingElement`；近底 24px 判据 ∥ 上滚不夺阅读位两判据不变）；`SHELL_PAGES` 五路径不动（非壳页）；**宿主差异实证**：VSC = `#messages` 固定视口内滚；控制台 = 文档流 + sticky 段（宿主页形差异——滚动判据同源，零口径改）。

  **最少一屏**：页纵列最少一屏（`main:has(.chat-thread) > section`——`min-height: calc(100vh - var(--sp-7))`）∥ 消息区吃余高（`.chat-thread`——`flex: 1 1 auto`）⇒ 短会话输入区亦落视口底；页底沿让位（`main:has(.chat-thread)` 撤 `padding-bottom`）；
  作用域 = `:has(.chat-thread)` 仅对话页 ∥ 零新变量（坐标 = `style.css:264`/`:266-267`——2026-10-13 实读）；长会话 sticky 照旧。

  **② 消息形态（核 `thincoder-render-core/flow/block.mjs` 装配——平铺标签行体系）**：用户块 = `buildUserMessage(text, ts, idx)`（`.message.user` + 标签行 `❯ {msg.user}:` + 时间 + `.bubble`）∥ 助手块 = `renderBlock({ idx, withLabel })`（活流）∥ `buildAssistantRestore(msg)`（回读——`{ text, tools, turnStart }`）；
  工具卡 = 核 `renderToolCard`/`finishToolCard`（活）∥ `buildFinishedToolCard`（回读——**嵌助手块内**，不挂顶层）。
  **一回合一个助手标签**（`withLabel`/`turnStart` 恰一次——`thincoder-render-core/flow/block.mjs:124` 口径）；**无气泡底**（VSC 平铺形——`.message`/`.msg-label`/`.msg-time` 类名单源；样式 = `webui/STYLE.md` §2.1 新面登记）。
  **活流按步交错（与终态同形——console-chat-live-step 批；KD-SV-132）**：**块 = 步**（每模型调用一块——活流按 `turn` 帧开合〔到达 ⇒ 上一步收束、新步起〕；回读按 assistant 行同构）；一步 = 该步文本气泡（有文本才建）+ 该步工具卡组（`call`/`result` 随到随嵌——归当步块）；
  工具-only 步 = 零气泡仅卡组；`turn` 后零内容 ⇒ 零空块；**块内子序 = 气泡恒为块首子 ＋ 卡组随到随附**（结构插入——**与到达序无关**：同一步 `call` 先于 `delta` 到达，泡仍落卡前）；
  **判据 = 形态签名**（同一回合：活流径 DOM 与 `messageNodes` 回读径 DOM 的**标签/类名序**——**剔除在案登记差异位后逐字相等**；
  在案登记差异位白名单**唯一项** = `span.tool-call-summary`（活流卡有 ∥ 回读卡无；核坐标 = `thincoder-render-core/flow/tool-card.mjs:119-127` ∥ `thincoder-render-core/flow/tool-card-restore.mjs:40-44`）——白名单唯一项、非容差；其余位零剔除——判据表述单源 = 本句，§1 KD-SV-132③ ∥ 本档 §4 验收行 ∥ 用例 N74 回指）；
  失败卡状态色差异 = 在案（**悬挂卡**回读恒绿；附着卡两径一致 = 皆红 + 展开——D2 口径，不动）；
  同规先例 = VSC（子回合边界起新块——`thincoder-vscode/webview/streaming.js:44-47`）；**核侧结构契约坐标**（两径对位前提——2026-10-12 本设计轮实读）：
  活流径 = `thincoder-render-core/flow/block.mjs:120-127`（`renderBlock`——`withLabel` = 回合首块）逐块 ∥ 回读径 = `thincoder-render-core/flow/block.mjs:102-116`（`buildAssistantRestore`——label 判据 = `turnStart`）逐 assistant 行；
  卡 = `thincoder-render-core/flow/tool-card.mjs:56`（`renderToolCard`）∥ `:95`（`finishToolCard`）∥ `thincoder-render-core/flow/tool-card-restore.mjs:24-82`（`buildFinishedToolCard`——嵌助手块内）；标签纪律单源 = `thincoder-render-core/flow/block.mjs:124`。
  回读装配（库行 ⇒ 块模型）：`user` 行 ⇒ 用户块 ∥ `assistant` 行 + 其 `data.toolCalls` 对应 `tool` 行 ⇒ 助手块（`turnStart` = 本回合首个 assistant 行）+ 嵌套工具卡 ∥ `notice` 行 ⇒ 控制台 notice 行（自持面——VSC 无对应；灰条形态沿用）。词表 +2 键：`msg.user` ∥ `msg.assistant`（核件原名——值逐字同 VSC locales：你 ∥ ThinCoder）。

  **③ 输入区 = 核 `thincoder-render-core/composer/panel.mjs` 全件消费（适配层四面）**：
  - ① **容器自建**：控制台建 `#toolbar`（核 css 锚名——沿桌面 `thincoder-desktop/renderer/mount-composer.mjs:250`「槽赋 `id=toolbar`」先例）；**装配期注 `<link>` 两静态档**（`/rc/composer/composer.css` ∥ `/rc/composer/model-menu.css`——桌面 `:216-234` 同式；幂等 `data-rc-css`）。
  - ② **变量别名桥**：核壳族变量名 ⇒ 控制台既有变量（`:root` 别名块——零新值；逐键映射 = `webui/STYLE.md` §2.1①）。
  - ③ **注入口桥**：`post(type, payload)` ⇒ 控制台动作映射表（`userMessage` ⇒ 发一条 ∥ `queuedUserMessage` ⇒ 入队 ∥ `interrupt` ⇒ 折法（见下）∥ `abort` ⇒ `POST …/abort` ∥ `selectModel` ⇒ `PATCH …/:id` ∥ `selectReasoning` ⇒ `PATCH …/:id { reasoning }`（KD-SV-111——档位面））；
    `state` 读面（`turnState` ⇒ 在途 ∥ `queue` ⇒ 队列计数 ∥ `models` ⇒ `deriveModels` 行 ∥ `flags` ⇒ 全假 ∥ `workspaceRequired` ⇒ `false`（浏览器面恒有工作区语义——不入会话） ∥ `subscribe` ⇒ 推送口）∥ `hooks`（`onUserEcho` ∥ `onTurnStart` ∥ `onStatusRefresh` ⇒ 状态行重绘 ∥ `confirmRemoveProvider`/`openSettings` ⇒ 无源（钮隐藏——不达））。
  - ④ **无源钮收窄**（CSS 隐藏——无源实证逐条）：`#auto-btn`/`#advisor-btn`/`#eng-btn`/`#plan-btn`（模式位面无源——审批 = 卡内机制（`always` ⇒ 行 `auto_approve`；钮位三段未落——留隐待裁）∥ 计划/工程族裁剪——§11.5 机制档）∥ `#settings-btn`（设置面板面 = 开发壳面）——**五枚**（`#reasoning-btn` 经 KD-SV-111 出列：档位通道三段补齐，钮面启用；钮字/选中态/下拉全归核件——`style.css` 零钮面逻辑）。
    **「不藏」射程读法**（用户 21:55 裁「输入区无后端支撑的控件 = 补后端，一件不藏」）：闭合集 = 会话内换模型 ∥ 附件 ∥ 回合中止 ∥ 斜杠命令表 ∥ **思考档位**（KD-SV-111——后端三段补齐）；核面板其余无源钮（**五枚**）= 收窄（CSS 隐藏）+ 逐条无源实证——非「不藏」对象。
  - **四件控件后端**（逐件形——机制全文 = `agent/ADMIN-AGENT.md` §11.2）：**① 换模型** = 核模型菜单 ⇒ `PATCH …/chats/:id { model }`（会话内可换——**KD-SV-87 收正** = KD-SV-108；下回合生效 ∥ 在途回合零触；斜径 `/model` 同钮同门）；
    **② 附件** = 文本档（核 `attach.mjs` 三限 + `withAttachedFiles` 内联进文本——**零后端**）∥ 图片（核件随 POST 携 `images` 列 ⇒ 服务端核 `parseDataUrl` 校验 + `isNonVisionModel` 视觉门 ⇒ 400 人话；库 = user 行 `data_json.imageParts`；详情响应仅 `imageCount`——KD-SV-109）；
    **③ 中止** = Stop 钮/Ctrl+C ⇒ `POST …/chats/:id/abort`（AbortSignal 透传核 + 环内检查点；notice 第五值 `"aborted"`——KD-SV-107）∥ **④ 斜杠** = 控制台命令表（`/model` ⇒ 开模型菜单 ∥ `/new` ⇒ 新会话弹窗 ∥ `/help` ⇒ 行集就地打印；别名 `/m` `/n` `/h`；表纪律 = 名 ⊆ CLI 名集 ∥ 不得自创；未知 ⇒ 核 `slash.unknown` toast + 文本保留）。
  - **⑤ 思考档位（KD-SV-111）**：**源** = 服务端模型面 `modelReasoning` ⇒ `deriveModels` 行携 `reasoning` ⇒ 核模型菜单行；**线** = 核菜单 `selectReasoning` ⇒ `PATCH …/chats/:id { reasoning }`（值域 = 核同一枚举——别名模型解上游真名后同判；表外 400）
    + 回合起跑读行 ⇒ provider 配置携 `reasoningEffort`（未设 ∥ 表外 ⇒ **零字段**——与今日同形）；**界面** = 钮解隐藏 + 点选即改 + 切会话推送回读（`prefs.reasoning` = 当刻会话档位）；
    **口径四条** = ① 值域按模型各自枚举（不做统一清单 ∥ 无兜底枚举）∥ ② 默认不设（零字段）+ 换模型 ⇒ 回中性（服务端随写清）∥ ③ 会话级归属（与 `model` 同层存）∥ ④ 状态行 `✦reasoning` 段不做。
    **无档模型（枚举缺省）** = 核无档面逐字：钮可见、文案 = `—`（中性档——核单式 `visible === "" ? "—" : reasoningLabel(visible)`）、菜单「不支持推理／关闭（不支持）」、零可选 ⇒ 零写出；控制台不造第三态（核件零改）。机制全文 = `agent/ADMIN-AGENT.md` §11.4。
  - **排队面**（核面板忙态行为——控制台承接）：在途提交 ⇒ 待发泡（核 `markPending`——`queued.pending` 标）+ 队列（容量 = 核 `QUEUED_MAX_ITEMS` 8；满 ⇒ 核 `input.slotFull` toast）；`end` ⇒ 重读 ⇒ 队首发起（新回合）；**`interrupt`（Ctrl+I）= 折法**：无「在途注入」通道（`runChatTurn` 环无中途中止/注入点）⇒ 中止当前回合 + 该文本入队首（端差异实证条）。

  **④ 状态行（输入区上方——`#toolbar` 首子；VSC 同构）**：控制台自持渲染（核无状态行族）+ 读数项 ⊆ 有源：

  | 段 | 源 | 缺省 |
  |---|---|---|
  | 运行中… | 客户端回合态（本页发起） | 非在途 ⇒ 零段 |
  | 工具: <名> | `call`/`result` 帧对（最近未结算 call） | 零段 |
  | ↑N ↓N | `usage` 帧累加（核 `fmtK`——`/rc/lib.mjs`） | 零 usage ⇒ 零段 |
  | hit N% | `cacheHit/(cacheHit+cacheMiss)`（usage 帧累加） | 分母零 ⇒ 零段 |
  | context N% | 末次 `usage.prompt` ÷ `specForDisplay(model).context`（快照件——`model-specs-snapshot.mjs`） | 未收录 ⇒ 零段；≥80% 警示色 |
  | 轮次 n | `turn` 帧（n = 本回合第 n 次模型调用——**帧另职 = 活流分步界**，见 §2.1 取数） | 零段 |
  | 耗时 Ns | 客户端时钟 ⇒ `end.durationMs` 冻结 | 终态后保留至下一回合/重读 |
  | 已静默 Ns | 客户端时钟（最近可见输出 ≥10s——VSC 同阈） | 零段 |
  | ✦reasoning 计数 | —— | **不做**（核 `usage` 聚合面无 reasoning 计数——无源） |
  | 模型名段 | —— | 不做（VSC 无——钮面已示） |

  - **帧面加性扩展**（`gateway/API.md` §2.8 ∥ `agent/ADMIN-AGENT.md` §11.3）：`{ type: "turn", n }`（每次模型调用前——**双职：状态行轮次 ＋ 活流分步界**——§2.1②）∥ `{ type: "usage", prompt, completion, cacheHit, cacheMiss }`（每次模型调用后、有源才发）∥ `end` 帧增 `durationMs`/`calls`（可字段——既有消费零破）。**零落库**（帧面 = 视图面——刷新后状态行清空重算）。

  - **端差异表（逐条实证——宿主差异保留；无实证即改）**：① 文档流页（VSC = 固定视口）⇒ sticky 段定位（宿主页形）∥ ② 核件样式自带过渡/动画（核 `composer.css`——单源零触；控制台自有档零动画不变）∥ ③ `interrupt` 折法（无注入通道——上述）∥ ④ 无源钮隐藏五枚（钮面无源——档位面经 KD-SV-111 出列；审批面经审批卡批落为卡内机制、钮位三段未落）∥ ⑤ 控制台零 CSP 头（沿现盘——核件内联状态色同 console-chat-align 在案）∥ ⑥ notice 行 = 控制台自持灰条（VSC 无对应件）。
- **新建会话**：弹窗（沿用 `modal.mjs`）——模型下拉（源 = `/api/admin/providers` 展平——`deriveModels` 同源；缺省 = 最近一次成功所用（KD-SV-87 同口径——机械读法 = `GET /api/admin/agent/chats` 倒序首行 `model`；该模型不在下拉源 ⇒ 空选；「成功」位 = 数据面无（题设近似——如实登记，不引入新位））∥ 无 ⇒ 空选（提交门））；提交 ⇒ `POST /api/admin/agent/chats` ⇒ 选中新会话。
- **取数**：列表/详情 = `GET /api/admin/agent/chats` ∥ `.../:id`（读时读——进页取列表 + 选中会话取详情）；发送 = `POST .../:id/messages`（体 = `{ content, images? }`）——**流式读取不走 `ctx.api`**（页面自持 `fetch` + `ReadableStream` 逐行读）；
  NDJSON 帧 = `agent/ADMIN-AGENT.md` §11.3：`turn` ⇒ **活流分步界**（每到达 ⇒ 上一步收束、新步起——一步一块）＋ 状态行轮次 ∥ `delta` ⇒ 核 `createStreamRenderer` 增量（落当步块气泡）∥ `usage` ⇒ 状态行读数 ∥ `call`/`result` ⇒ 核工具卡（**嵌当步块**——归该模型调用步）∥ `ask` ⇒ 审批卡（挂消息流尾——§2.1 审批卡面条）∥ `end` ⇒ 状态行耗时冻结 + 重读详情（读时单源——重读与活流同形 ⇒ 置换零位差，notice 行经此呈现）；
  中止 = `POST .../:id/abort`；换模型 = `PATCH .../:id`；ask 应答 = `POST .../:id/asks/:promptId`（体 `{ verdict }`——§2.1 审批卡面条）；
  **断连/离页**：读流中止（回合照跑——落库单源；回来重读即全量）；发送失败/流前错误 ⇒ 就地人话（`mapError`）。
- **审批卡面（admin-approval-cards 批——机制 = `agent/ADMIN-AGENT.md` §11.5）**：`ask` 帧（`permission`/`batch`）⇒ 卡挂消息流尾（核 `renderApprovalCard`/`renderBatchApprovalCard`——`views-chat-cards.mjs`）；应答 ⇒ `POST …/asks/:promptId`（体 `{ verdict }`——`once`/`always`/`reject` ∥ `approveAll`/`deny`/`oneByOne`）；
  应答失败 ⇒ 人话 + 卡面重挂（remount——非乐观，桌面同规）；回合 `end`/切会话 ⇒ 残留卡全摘（服务端同拍拒值结算）；重读装配 ⇒ 在决卡重挂（remount）区尾（表不变——旧卡不失答）。
  收窄：`question`/`secret` 帧不落本面（源不在管理面——机制档收窄条）；键族零增（核卡面键 = core 两表已册）。
- **notice 行文案映射**：`data.reason` 五值各一键——`"restart"` ⇒ `admin.chat.noticeInterrupted` ∥ `"budget"` ⇒ `admin.chat.noticeBudget` ∥ `"model_error"` ⇒ `admin.chat.noticeModelError` ∥ `"empty_turn"` ⇒ `admin.chat.noticeEmpty` ∥ `"aborted"` ⇒ `admin.chat.noticeAborted`（+1）；
  枚举外/缺位 ⇒ 服务端原文兜底（`content`——零信息丢）。en 面零 CJK 判据 = 枚举命中前提（收口端到端核）。
- **主机凭据钮**：会话条「主机凭据」钮 ⇒ 选主机（`runners.list` 行——名 ∥ 地址 ∥ `ssh` 元数据）⇒ **主机凭据弹窗**
  （与沙盒页**同一弹窗件** `host-credential.mjs`——SSH 端口/用户/认证/秘密输入/sudo 口令；已有凭据 ⇒ 只显元数据、密文零回填；撤销（二次确认）——件行账 = `webui/SANDBOX.md` §3）⇒ 提交 `PUT /api/admin/sandbox/runners/:id/credential`（成功闭窗；失败 ⇒ 窗内就地人话）；
  `exec` 缺凭据时 agent 的回应句指向本钮；机制 = `sandbox/SANDBOX.md` §3 主机凭据块；**聊天文本不是凭据通道**（秘密零入消息行/模型上下文）。
- **不做**：会话删除/重命名 ∥ SSH 凭据经**聊天文本**输入（凭据入口 = 主机凭据钮 ∥ 沙盒页弹窗——同一件）——全文 = `agent/ADMIN-AGENT.md` §10。
- **文案**：键族 `admin.chat.*`（+9 = 状态行七（`status{Running,Tool,Context,Cache,Turn,Elapsed,Quiet}`——`↑N ↓N` 段零键：纯符号 + 核 `fmtK`）+ `selectChat` + `noticeAborted`）+ `nav.page.admin.chat`（**既有键**——admin-agent-chat 批在册，非新增）；两表逐键同步——en 零 CJK（`webui/I18N.md` §2.1）；
  **核件词面部件扩登**（消费面翻入 composer/attach/slash——本档 §3 键族登记）；审计型键 `audit.type.agent_event`（`views-audit.mjs` 详情模板补 `summary` 支——`webui/READINGS.md` §2.1④）。

### 2.2 成员面对话（`#/me/chat`——member-face-chat 批建档；机制全文 = `agent/MEMBER-AGENT.md`；2026-10-13）

- **定位**：成员面 agent（盒内）的对话入口——**开发用途**（第四消费面）；控制台 **`#/me/chat`**（我的组首位）；**非壳页**（`SHELL_PAGES` 五路径不动）。移动端 = 同一端点族（Bearer 成员 key + cookie 双门，NDJSON 流，零页面依赖——`agent/MEMBER-AGENT.md` §3.8）。
- **四轴 = 沿 §2.1 管理面口径**（同款核件消费：`md`/`highlight`/工具卡/流式/滚动/composer 全件 ∥ 同款帧读取（NDJSON 逐行）∥ 同款状态行段表与 notice 映射）——**本面差异清单**：
  ① **取数面** = `/api/me/chat/*`（`gateway/API.md` §2.11——双鉴权同判权；恒本人）；工作区写面 = `/api/me/sandbox/*` 扩四行（建/启停/销毁/拉仓）。
  ② **工作区维度**：新会话 ⇒ 选工作区（一枚 ⇒ 零选择；无 ⇒ 建引导）；会话条示工作区名 + 盒态读数（运行中 ∥ 已停 + 回收原因 ∥ 启动中）+ **在线态**（`agentOnline`）；**列表 = 盒内清单**（按本人工作区扇出——离线盒的会话不列，如实——KD-SV-152/203）。
  ③ **盒态动作**：盒未运行/未连接 ⇒ 就地形「启动工作区」（`POST …/workspaces/:id/start`）+「拉取项目」（可见项目清单 ⇒ 提交前凭据预检 ⇒ 缺时窗内就地录 ⇒ `POST …/pulls` ⇒ 四态人话）。
     **拉取凭据就地绑（KD-SV-215——机制全文 = `agent/MEMBER-AGENT.md` §3.6）**：预检 = `GET /api/me/git-credentials` 对 host（= 项目 address 首段小写）；缺 ⇒ 窗内表单（主机只读 ∥ 用户名 ∥ 令牌——零回显沿族）⇒ 保存（`PUT`）成功 ⇒ **自动续拉**；
     公开仓 ⇒ 跳过（不录直拉）；预检失败 ⇒ 降级直 POST；失败 `kind:"auth"` ⇒ 同窗更新（用户名预填）⇒ 重拉；表单件 = `thincoder-server/public/views-me-chat-pull.mjs`（本批新档——§3 行账）；项目选择变更 ⇒ 复位态 A + 清用户/密字段（防密文绑错 host）。
  ④ **钮面 = 四模式钮解隐藏（KD-SV-218）**：`#auto-btn`/`#advisor-btn`/`#eng-btn`/`#plan-btn` 启用（适配层 `state.flags()` 读当刻会话行 `flags`——槽四字段；出站 ⇒ `PATCH …/:id` 一次一件；三态行为 = 核件 `composer/controls.mjs` 逐字）；`#settings-btn` ⇒ 路由 `#/me/account`（成员可配面 = 账户页）；
     **主机凭据钮不设**（管理面件——本面零凭据入口）；`workspaceRequired` ⇒ `false`（工作区 = 会话级已绑，非逐消息概念）；**钮可见性落法 = 适配层开关**（成员 composer 容器挂 `data-flags="live"` + `style.css` 作用域覆写——机制 = `agent/MEMBER-AGENT.md` §3.11(3)；管理面收窄五 id 规则零动）。
  ⑤ **notice 映射** = `end.reason` 六值面（管理面五值 + `"box_lost"`——本面 +1——「工作区已断开…」）；盒自产扩展四值（`save_failed`/`busy`/`not_found`/`internal`）= 枚举外 ⇒ 服务端原文兜底（单源 = `agent/MEMBER-AGENT.md` §3.4）。
  ⑥ **思考档位面 = 开机**（核菜单 `selectReasoning` ⇒ `PATCH …/:id { reasoning }`；源 = `GET /api/me/chat/models` 行 `reasoning` 枚举 ∥ 未设 ⇒ 零字段——KD-SV-111 同口径会话级）。
  ⑦ **会话源 = 盒内**（题一裁定）：读史/列表/新建/改 = **向盒取指令**——盒未运行 ⇒ 不可达（就启动引导——非静默）；停盒 ⇒ 会话在场（卷恒留）；销毁 ⇒ 随卷去（确认门）；换机 ⇒ 随快照回（截至快照时点）。会话删除/重命名 = **本批落**（行内控件 + 确认门——KD-SV-203 收正；§3.11(6)）。
  ⑧ **模型菜单行形 = 自 id 派生归属**：候选源 `/api/me/chat/models` 行 = `{ id, reasoning }`（零 provider 内部细节——`thincoder-server/src/agent/member-routes.mjs:144-155`）⇒
  适配层 `providerOf(id)`（id 首段——首斜杠口径；无斜杠 ⇒ 全串）供给核菜单行 `provider`/`group` 与 `prefs.provider`（分组行标题 = `shortName(provider, group)`；选中 ✓ = `{model, provider}` 复合匹配——`thincoder-render-core/composer/model-menu.mjs:101/:215`）；
  管理面对照 = `deriveModels` 真名（`thincoder-server/public/views-models.mjs:39`）。
  ⑨ **三端对齐面（机制 = `agent/MEMBER-AGENT.md` §3.11）**：帧面七型（`reasoning` ∥ `toolOutput` ∥ `sub` ∥ `ask` ∥ `tasks` ∥ `compress` ∥ `wait` + `usage` 两扩字段）；子代理块/活动区（核 `subblocks/*` 栈——`sub` 帧 ⇒ 归约/效果表；停单件 = `abort { key }`）；
    卡族四件（审批单/批 ∥ 问询 = 核卡件直用；秘密卡 = 页内件；应答 = `POST …/asks/:promptId`——ask 回路）；状态行段表全段（19 段——§2.1④ 同律）；会话条 = 自绘下拉（位标/标题/meta/✎ 重命名/✕ 删除/📁 工作区钮）；
    页面小件 = 会话内搜索（核 `createSearch`）∥ 复制钮（TLS 前降级 toast）∥ 图片通道（`images`——零静默丢）∥ `@` 文件引用（`GET /api/me/chat/files`）∥ 工具输出流（`toolOutput`）与结果全文（`content`）∥ 在途门 = 会话级（跨会话放开——KD-SV-223；同会话二发 ⇒ 400）。
  ⑩ **页件拆档（同一批）**：`views-me-chat.mjs` 500 越线 ⇒ 外拆三新档（`views-me-chat-sessions.mjs` ∥ `views-me-chat-cards.mjs` ∥ `views-me-chat-subs.mjs`——`agent/MEMBER-AGENT.md` §5 行账）。
- **首次进入四相**（空态/引导——机制 = `agent/MEMBER-AGENT.md` §3.6）：无工作区 ⇒ 建 ∥ 盒未运行 ⇒ 启 ∥ 盒运行 + 零会话 ⇒ 建会话引导（「新会话」主钮 +「拉取」次钮）∥ 有事可做 ⇒ 直聊。
- **零会话发送 = 非静默**：无会话发送 ⇒ 就地提示行（`me.chat.needSession`——`thincoder-server/public/views-me-chat.mjs:300-303`；草稿还原链不变）。
- **呈现面 = 复用 `thincoder-render-core`**（§2.1 同件集 + `/rc/*` 第二根同源——「先查再造」纪律句续）；**公共适配层抽取 = 登记不做**（成员页自持同构件——抽取动管理面已对齐件，另轮；两页单源 = 核件）。
- **不做**：跨工作区会话迁移（功能点 35 另批）∥ 管理面专属件（主机凭据/模型配置）∥ 零本地记忆（压后——§3.9）∥ 移动壳（声明在册——§3.8）∥ 公共适配层抽取（登记）∥ 台账标记段/团队登录态段（判定项在册——`agent/MEMBER-AGENT.md` §9 R85/R86——同物无参照物，未裁前不造）∥ 自动标题生成器（展示面落、生成器另批——§3.11(6) 同拍）。

## 3. 文件账（本面文件行 ∥ 键族登记）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/public/views-chat.mjs` | **440** ⇒ ≈**465**（本批 +ask 帧分发/清卡/重挂钩 ≈+25） | 管理面对话页（本档 §2.1）：页四段装配 ∥ 会话条 ∥ 消息装配（核 `flow/block.mjs`——回读/活流）∥ NDJSON 帧分发（`delta`/`call`/`result`/`turn`/`usage`/`end`/`ask`）∥ 队列 ∥ 新会话弹窗 ∥ 取数 ∥ 审批卡接线（`views-chat-cards.mjs`） |
| `thincoder-server/public/views-chat-cards.mjs` | ≈**110** | 审批卡族（本档 §2.1 审批卡面条；机制 = `agent/ADMIN-AGENT.md` §11.5）：`createAskCards`（`append`/`clear`/`remount`）+ 核两卡件适配 + 应答单点（非乐观——失败重挂）；键族零增（核卡面键 = core 两表已册） |
| `thincoder-server/public/views-chat-messages.mjs` | ≈**105** | 消息面（本档 §2.1②）：NDJSON 行/帧纯函数（`splitLines`/`parseFrame`/`argsText`）∥ notice 行文案映射（五值）∥ 工具结果文案（失败判据 = 核 `isToolFailure`）∥ 回读装配（库行 ⇒ 核 `buildUserMessage`/`buildAssistantRestore`/`renderToolHistory`——`messageNodes`）；`views-chat.mjs` 面 `export … from` 兼容重导出（**用例级**：既有纯函数/键消费两用例经重导出零改——文件级改动清单 = 本 § 末段 ∥ §6⑥）；拆档缘由 = `views-chat.mjs` 500 软线已贴满（增行前必须先外拆） |
| `thincoder-server/public/views-chat-composer.mjs` | ≈**318** | 输入区与状态行（本档 §2.1③④——核件全件消费适配层；拆档缘由 = `views-chat.mjs` 并入后 ≈630——越 500 软线（拆档审查；800 硬限未越）） |
| `thincoder-server/public/i18n-zh-core.mjs` | ≈**62** | 文案表·zh·核件词面（键 = 核件原名；值逐字同 VSC locales——slash 族源 = 桌面 `thincoder-desktop/renderer/i18n-views.mjs` 同键） |
| `thincoder-server/public/i18n-en-core.mjs` | ≈**62** | 文案表·en·核件词面 |
| `thincoder-server/public/views-me-chat.mjs` | **499** | 成员面对话页（本档 §2.2） |
| `thincoder-server/public/views-me-chat-messages.mjs` | **124** | 消息面（帧面纯函数 ∥ 回读装配——沿管理面同形） |
| `thincoder-server/public/views-me-chat-composer.mjs` | **456** | 输入区与状态行（核件全件消费适配层——沿管理面同构） |
| `thincoder-server/public/views-me-chat-sessions.mjs` | **280** | 会话条（标题/位标/meta ∥ 行内重命名 ∥ 删除确认 ∥ 工作区切换） |
| `thincoder-server/public/views-me-chat-cards.mjs` | **180** | 卡族（核卡适配 + 页内秘密卡 + diff 弹窗 + 块头审批态） |
| `thincoder-server/public/views-me-chat-subs.mjs` | **162** | 子代理块链（核 subblocks 消费 ∥ 效果表 ∥ 停单件） |
| `thincoder-server/public/views-me-chat-pull.mjs` | **218** | 拉取弹窗（四态轮询）+ 凭据就地绑 + 四纯函数（`pullDetailText` 等） |

**面小计**：≈**754**（设计估）⇒ 实读和 ≈**958**（2026-10-12 盘面实读：`views-chat.mjs` **500** + `views-chat-composer.mjs` **321** + 两 i18n core **70**/**67**——含 console-reasoning-levels 批已落步进，不重计）
  ⇒ ≈**994**（console-chat-live-step 批：≈**+36** = 分项和〔`views-chat.mjs` 净 ≈−69（活流分步 +≈25 ∥ 帧面/回读装配外拆 −≈94） + 新档 ≈105〕）
  ⇒ ≈**1004**（admin-chat-creds-merge 批：`views-chat.mjs` +≈10——两批在途；**实施次序 = live-step 先 ∥ creds-merge 后**〔先降基数，免 `views-chat.mjs` 先越 500 软线机检〕；以实施当刻实读为准）；域合计 = 各面之和——不单列）
  ⇒ ≈**1139**（admin-approval-cards 批：+≈135 = `views-chat.mjs` ≈+25（ask 帧分发 + 清卡/重挂钩） + 新档 `views-chat-cards.mjs` ≈110——以实施当刻实读为准）。

**面小计（成员面）**：**1,919**（2026-10-15 实读——七档：`views-me-chat.mjs` 499 ∥ `views-me-chat-composer.mjs` 456 ∥ `views-me-chat-sessions.mjs` 280 ∥ `views-me-chat-pull.mjs` 218 ∥ `views-me-chat-cards.mjs` 180 ∥ `views-me-chat-subs.mjs` 162 ∥ `views-me-chat-messages.mjs` 124）；
两 i18n me 表就表扩键 `me.chat.*`（零新档——行账 = `webui/ME.md` §3）；shell 两表 +1 键/表。

**随正件**：`i18n-{zh,en}-admin.mjs`（`admin.chat.*` +9 键/表——文件行账 = `webui/ADMIN.md` §3）∥ `style.css`（本面新面登记——行账 = `webui/STYLE.md` §3）∥ `views-chat.mjs` 拆档另见上行。
**随正件**：服务端五档（`thincoder-server/src/gateway/reasoning-levels.mjs`（已落） ∥ `thincoder-server/src/gateway/provider-admin.mjs` ∥ `thincoder-server/src/agent/chat-routes.mjs`；
  `thincoder-server/src/agent/chat.mjs` ∥ `thincoder-server/src/store/db.mjs`——行账 = `agent/ADMIN-AGENT.md` §6 ∥ `store/STORE.md` §4）∥ `style.css`（收窄五钮——行账 = `webui/STYLE.md` §3）∥ 测试链随正（结构版本断言 11 件 + 隐藏用例 1 件 + 列面用例 1 件——见本档 §6⑤）。
**随正件**：既有件随正 = 档目用例数字就地收正 `[48, 47] ⇒ [49, 48]`（纯函数/键消费两用例经重导出零改）∥ 壳面单元测试档**越 800 硬限 ⇒ 拆档**（机制面留存 ≈335；拆档新档已落——壳面 N68–N70/B67/B68/E53 ＋ 结构用例 ＋ 词面用例 ＋ 假 DOM 装置；≈550——越 500 软线 ≈50：预案 = 结构/词面两用例再外拆，触发 = 实读 >650）；
结构用例核件接线扫面 += 新档源（落点 = 本拆档新档）——`/rc/lib.mjs` 导入随外拆迁移
∥ 对话页对齐单元测试档（现读 **389** ⇒ +≈3——取件面白名单用例 += `views-chat-messages.mjs`）
∥ 单元测试档（已落——≈**420** 行：按步用例 N73 ∥ 同形签名用例 N74 ∥ 同一步逆序用例（`call` 先于 `delta`）∥ 边界 B71 ∥ 错误 E56 ＋ 结构用例〔零 CJK 代码段 ∥ 行宽 ≤300 ∥ 零 `innerHTML` 写口〕）
∥ `webui/WEBUI.md` §1/§5（JS 链/档目链/文件行 += 新档——数值以实施当刻实读为准）。

**键族登记**（自 `webui/WEBUI.md` §2.2 归位——逐字）：

- **键族登记（两表逐键同步）**：新增 **≈33 键**——`nav.page.admin.chat`（shell 部件——侧栏项）∥ `admin.chat.*` ≈32（admin 部件：页题/新会话/模型选择/会话列表（空态/加载/失败）/对话区（空态/运行中/重读）/工具行（调用/结果/失败）/输入区（占位/发送/必填）/notice 行四形（中断/预算超限/模型错误/空回合））∥ `audit.type.agent_event`（+1/表——与 `audit.type.sandbox_*` 同部件）；
- **键族登记（两表逐键同步）**：新建 **2 档**——`i18n-{zh,en}-core.mjs`（**核件词面部件**——键 = 核件原名（域界 = 键首段 ∈ 核件发射面），值逐字同 VSC locales——单元测试档断言：与 `thincoder-vscode/locales/{zh,en}.json` 逐键相等）；
  实填 **5 键**：`tool.running` ∥ `tool.initial` ∥ `tool.truncated` ∥ `tool.error` ∥ `tool.done`（工具卡词面）；**四键退役**（`admin.chat.tool{Call,Result,Calling,Failed}`——§2.7-1 裁决，2026-10-11 收正删净）；`admin.chat.*` **27 键**留 admin 部件（不迁）。
- **键族登记（两表逐键同步）**：**核件词面部件扩登**（消费面翻入：`composer/{panel,controls,model-menu,attach,slash}.mjs` ∥ `flow/{block,queued-mark,tool-card,tool-card-restore,stream}.mjs`）——键 = **核件 `t()` 字面量全集**（机检 = 扫消费件取集 ⊆ 注册表——超集安全）；实填 **124 键**（2026-10-15 实读）；
  - 族目（一）：`msg.{user,assistant}` ∥ `input.{placeholder,busyPlaceholder,interruptPlaceholder,slotFull}` ∥ `queued.pending` ∥ `paste.unsupportedFormat` ∥ `composer.attach.{unsupported,tooMany,tooLarge,totalLimit,readFailed,binary}`；
  - 族目（二）：`slash.{unknown,args,help.label}` ∥ `slash.desc.{model,new,help}` ∥ `model.{loading,filterPlaceholder,noMatch,addProvider,removeProvider,setKey,noReasoning,noReasoningDesc,reasoning}` ∥ `reasoning.*`；
  - 族目（三）：`msg.{copy,copied}` ∥ `toolbar.{autoApprove,planDisabled}` ∥ `auto.{confirmText,enable,cancel}` ∥ `status.thinking` ∥ `error.retry` ∥ `workspace.{required,requiredPlaceholder}`；
  - **值源逐族**：VSC locales（`thincoder-vscode/locales/{zh,en}.json` 逐键相等断言）——**slash 族**（`slash.unknown`/`args`/`help.label`/`desc.*`）+ `model.*`/`reasoning.*`/`toolbar.*`/`auto.*` 随桌面表（`thincoder-desktop/renderer/i18n-views.mjs` 同键逐字——VSC 无该族；两壳同词）；
  - **唯一新撰键 = `slash.desc.new`**（en `start a new chat` ∥ zh `新建会话`——CLI 同名 desc 含「旧档入槽」语义（控制台无槽面）⇒ 不逐字）。
- **键族登记**：`admin.chat.*` **+9 键**/表——状态行七（`status{Running,Tool,Context,Cache,Turn,Elapsed,Quiet}`）∥ `selectChat` ∥ `noticeAborted`（notice 第五值人话）；`admin.chat.*` **28 键**（原载「27 ⇒ 36」计基不可复算（含未减退役项）；以现读为准；文件行账 = `webui/ADMIN.md` §3）。
- **键族登记（两表逐键同步）**：`admin.chat.*` **+3 键**/表——`hostCred`（会话条钮）∥ `hostCredPick`（选主机题）∥ `hostCredNone`（无主机空态）；
  **弹窗本件键 = `admin.sandbox.*`**（`webui/SANDBOX.md` §3 登记——键名以该件为准）；`admin.chat.*` 28 ⇒ **31 键**（= 实读 28 ＋ +3——落盘后以盘面实读为准；原载「36 ⇒ 39」随前链计基不可复算已收正；文件行账 = `webui/ADMIN.md` §3；两 i18n admin 表现读 **171 ∥ 175** 行 ⇒ 净变 ≤±10——2026-10-12 现读）。
- **键族登记（两表逐键同步）**：`me.chat.*` **72 键/表**（2026-10-15 实读）（成员对话页：页题/空态四相/工作区绑定/盒态三读数/启动/拉仓选窗与四态/notice 六值面（管理面五值 + `box_lost`；四扩展值枚举外兜底）——落两 i18n me 表）∥ `nav.page.me.chat`（shell 部件 +1/表）∥ `audit.type.member_event`（+1/表——落点随既有 `audit.type.*` 族所在表）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| 管理面 agent 会话页 | 页在册（`#/admin/chat`——单页直测）：会话列表（空态/加载/失败三态）∥ 新会话弹窗（模型下拉 = `deriveModels` 同源 ∥ 空模型 ⇒ 提交门）∥ 对话区（用户/助手/工具行/notice 四形渲染）∥ 输入区（空值不提交 ∥ 在途禁用）∥ 流读取（`fetch` + `ReadableStream`——假流桩：`delta` 追加 ∥ `call`/`result` 工具行 ∥ `end` ⇒ 重读详情——取数序列逐条）∥ 断连（读流中止——零未押异常）∥ i18n 键族（≈33 键两表同步——en 零 CJK）∥ 审计型键 `audit.type.agent_event` 入册（`views-audit` 详情 `summary` 支）∥ `nav.mjs` 管理 11（直测）∥ 非壳页（`SHELL_PAGES` 五路径不动）∥ AC-19 canon 不破（零新变量/零新悬停规则）∥ 档目随正——单源 = `webui/WEBUI.md` §1 | 单元测试档 + 收口轮（浏览器实走） |
| 管理面 chat 对齐（KD-SV-101） | 呈现面 = 复用 `thincoder-render-core`：静态面第二根 `/rc/*` 在册（`static.mjs` 根表——前缀序/逃逸门逐根 ∥ 桌面双根同形）+ 页面以同源绝对路径取核（`/rc/md.mjs` 等——档面零 `../node_modules` 相对径 ∥ 零拷贝副本 ∥ `package.json` `file:` 声明在册）∥ 对齐集机检：① `md()` 渲助手/用户文本（注入点唯一）② 代码块高亮（`pre.code-block`/`.tk-*`）③ 工具卡三件（`renderToolCard`/`finishToolCard`/`renderToolHistory`——失败判定 `isToolFailure`）④ 流式 = `createStreamRenderer` + `paintLiveMd`（增量——禁每帧全量 `md`/整面 `innerHTML`）⑤ 滚动 = `scroll.*`（24px 判据单源；上滚不夺位）∥ **不做项机检**：档面零 diff/search/问询/计划/subagent 卡引用（本档 §2.1 ⑥⑦⑧⑩⑪）∥ 转义：核 `md()` 单源（页面零手拼 HTML 串——`webui/WEBUI.md` §3 收窄；非文本面 `h`/`textContent`）∥ i18n：`i18n-{zh,en}-core.mjs` 在盘（键 = 核件原名；键首段 ⊆ 核件 `t()` 发射段集——单元测试档扫核件字面量取集（机器可判）；值逐字同 VSC locales——单元测试档断言与 `thincoder-vscode/locales/{zh,en}.json` 逐键相等）+ `setStrings` 注册（装配期 + 每次语言切换重注册——核 `_strings` 模块级态） ∥ 类名闭合域随正（`style.css` 选择器 ⊆ 档面字面类 ∪ **核件发射类清单**——AC-19 canon 随正）∥ 零新 `:root` 变量 ∥ 零新悬停规则 ∥ 单元测试档用例可执行口径 = 自仓根 `node --import ./thincoder-server/test/rc-resolve.mjs --test <对话页对齐单元测试档>`（`--import` 缝——缺则 `/rc/*` 不可解析） ∥ 镜像内双包装（`docker build` 上下文 = 仓根——核包解析可达：容器内 `node -e "import('@thincoder/render-core/md.mjs')"` 冒烟） | 单元测试档 + 收口轮（**ECS 浏览器实走**——走查清单在册） |
| 对话页壳面对齐（功能点 41 ∥ AC-41；KD-SV-106/107/108/109） | 四轴逐项在册（本档 §2.1）：**① 布局** = 页四段（会话条 sticky 顶 ∥ 消息流文档流 ∥ 状态行 ∥ 输入区 sticky 底——`#toolbar`）∥ 三卡去卡片化 ∥ `SHELL_PAGES` 五路径不动 ∥ 滚动 = `document.scrollingElement`（核 `scroll.mjs` 两判据不变）∥ **② 消息形态** = 核 `thincoder-render-core/flow/block.mjs` 装配（`buildUserMessage`/`renderBlock`/`buildAssistantRestore`/`buildFinishedToolCard`——工具卡嵌助手块内 ∥ 一回合一个助手标签（`turnStart` 恰一次）∥ 无气泡底（`.message`/`.msg-label`/`.msg-time`）∥ 回读块模型：user ⇒ 块 ∥ assistant+tool ⇒ 助手块+嵌套卡 ∥ notice ⇒ 自持灰条）∥ **③ 输入区** = 核 `thincoder-render-core/composer/panel.mjs` 全件（适配层四面：容器自建 + 两 css `<link>`（幂等）∥ 变量别名桥 ∥ 注入口桥（post 映射表/state/hooks）∥ 无源钮收窄——五钮 CSS 隐藏）+ **四件控件后端**（换模型 = `PATCH …/:id`（KD-SV-108）∥ 附件 = 文本档零后端 + 图片随行存（KD-SV-109）∥ 中止 = `POST …/abort`（KD-SV-107）∥ 斜杠 = 三命令表（`/model`/`/new`/`/help`——名 ⊆ CLI 名集））+ 排队面（核容量 8/待发泡/`end` ⇒ 队首）∥ **④ 状态行** = 输入区上方 + 段表 ⊆ 有源（本档 §2.1④；`✦reasoning` 不做 = 无源实证）+ 帧面加性扩展（`turn`/`usage`/`end` 补两字段——`gateway/API.md` §2.8）∥ **端差异表六条**（逐条实证——本档 §2.1）∥ 用例 = 本档 §4 壳面行（N68–N70 ∥ B67/B68 ∥ E52/E53）+ 机制面 = `agent/ADMIN-AGENT.md` §8（N64–N67 ∥ B65/B66 ∥ E50/E51）∥ 收口轮 = 浏览器实走（四轴清单在册） | 单元测试档 + 收口轮（浏览器实走；ECS 走查） |
| 对话页壳面对齐（续·机检口径） | 单元测试档用例（自仓根 `node --import ./thincoder-server/test/rc-resolve.mjs --test <对话页壳面单元测试档>`）：① 档面零自持渲染（核件调用面在册——零手写 markdown/工具行拼装）② 核件调用面逐件（`block.mjs` 四件 ∥ `thincoder-render-core/composer/panel.mjs` ∥ `scroll.*` ∥ `createStreamRenderer`）③ 状态行段表机检（段 ⊆ §2.1④ 表；`✦` 零引用）④ 无源钮隐藏规则在盘（`style.css` 五 id）∥ 核件词面扫描用例（消费件 `t()` 字面量全集 ⊆ `i18n-{zh,en}-core.mjs` 注册表；与 VSC locales 逐键相等——slash/桌面族按值源表断言）∥ 页面档结构用例：会话条/状态行/输入区在册（`#toolbar`/`#status-line` 各恰一——幂等：两次装配零重注）∥ AC-19 canon 不破（`:root` 别名块 = 零新值（逐键 `var(--既有)`） ∥ 零新悬停规则 ∥ 类名闭合域随正）∥ 档目随正——单源 = `webui/WEBUI.md` §1（+1 档）∥ 服务端用例 = `agent/ADMIN-AGENT.md` §7 本档行（前后端同拍） | 单元测试档 + 收口轮（浏览器实走） |
| 对话页思考档位选择器（功能点 42 ∥ AC-42；KD-SV-111） | **① 档位源** = `GET /api/admin/providers` 每 provider 行 `modelReasoning`（键 = 上游真名 ∥ 值 = 核 `reasoningEffortEnum`；稀疏——空档零键）⇒ `deriveModels` 行携 `reasoning` ⇒ 核行 `reasoning` 非恒空 ∥ **② 选择生效** = `PATCH …/:id { reasoning }`（值域 = 核同一枚举——表外 ⇒ 400 库零变）⇒ 回合出口 provider 携 `reasoningEffort`（假出口入参断言；未设 ⇒ **零字段**）∥ **③ 界面可用** = `#reasoning-btn` 解隐藏（收窄五钮）+ 点选 ⇒ PATCH 恰一条 + 切会话推送回读（`prefs.reasoning`——各自记住）∥ **④ 默认静默** = 未动 ⇒ 零字段 ∥ 存量行 NULL 零变（v16 零迁移）∥ **⑤ 状态行不做** = `statusSegments` 零改（`✦` 零引用——既有用例续）∥ 机制面 = `agent/ADMIN-AGENT.md` §7 本档行（前后端同拍） | 单元测试档 + 收口轮（浏览器实走——切模型/切会话/选档各一） |
| 对话页主机凭据钮 | 会话条「主机凭据」钮在册（选主机 ⇒ **同弹窗件**（与沙盒页同一件——零第二份表单；密文零回填 ∥ 提交 `PUT` ∥ 成功闭窗/失败就地两态））∥ **聊天文本非通道**（发送面零凭据字段——机检 = 消息体/帧面扫描）∥ `exec` 缺凭据 ⇒ agent 回应句指向本钮（提示词级纪律在册——`agent/ADMIN-AGENT.md` §11）∥ i18n `admin.chat.*` +3 键/表（两表同步——en 零 CJK）∥ AC-19 canon 不破（零新变量 ∥ 零新悬停规则）∥ 档目随正——单源 = `webui/WEBUI.md` §1（+`host-credential.mjs` 入列表）；机制面 = `agent/ADMIN-AGENT.md` §7 本档行（前后端同拍） | 单元测试档 + 收口轮（浏览器实走——钮 ⇒ 录凭据 ⇒ chat `exec` 一条） |
| 思考档位（续·机检口径） | 单元测试档用例（自仓根 `node --import ./thincoder-server/test/rc-resolve.mjs --test <思考档位单元测试档>`）：① `modelReasoning` 稀疏 map（假 specLookup 注入——有档登键 ∥ 无档零键 ∥ 键 = 上游真名）② 档位行造面（`deriveModels` 行携 `reasoning` ∥ 核行非恒空）③ `selectReasoning` ⇒ PATCH 恰一条（假 api 桩；表外值 ⇒ 400 就地人话）④ 装配（假模型出口入参：值 ∈ 枚举 ⇒ 携 `reasoningEffort`；未设/表外 ⇒ 零键）⑤ 存储（空库直落 16 ∥ `agent_chats.reasoning` 列在场 ∥ 存量行 NULL）⑥ 界面用例（`style.css` 五钮收窄 ∥ `#reasoning-btn` 不在收窄行）∥ 结构用例 = 核件取件面零新增（`/rc/composer/panel.mjs` 已在册）∥ 键面零新键（核件词面 `reasoning.*`/`model.{noReasoning,noReasoningDesc,reasoning}` 已在册） | 单元测试档 + 收口轮（浏览器实走） |

| 对话页活流按步交错（**AC-41 ② 消息形态收正**；KD-SV-132） | ① **按步开合** = 活流块数 = 步数（`turn` 帧分段；一步 = 气泡 + 该步卡组）∥ ② **同形** = 同一回合活流径 DOM 与回读径（`messageNodes`）DOM 形态签名逐字相等（**标签/类名序**——判据表述单源 = §2.1②；单元测试档机检）∥ ③ **标签** = 回合首块恰一枚（块数 ≠ 标签数）∥ ④ **零空块**（无内容步不建块）∥ ⑤ **服务端零改**（帧发射点未动——`thincoder-server/src/agent/chat.mjs:499`/`:530`/`:559`/`:565` 回归用例）∥ ⑥ **`end` 重读保留**（重读置换后块位与活流一致；notice 行在场）∥ ⑦ 失败卡归当步（红/展开 = 活流径既有语义；悬挂卡回读恒绿 = D2 在案） | 单元测试档 + 收口轮（浏览器实走——发一条多步工具回合：卡随步就位 ∥ 不堆尾） |
| 成员面对话页（功能点 50 ∥ AC-50①） | 页在册（`#/me/chat`——我的组首位；单页直测）：四轴沿 §2.1（同款核件消费 ∥ 同款帧读 ∥ 同款状态行/notice 映射 = `end.reason` 六值面（管理面五值 + `box_lost`；四扩展值枚举外兜底））∥ 成员差异面：工作区绑定（新会话选工作区——一枚 ⇒ 零选择）∥ 盒态三读数 + 「启动工作区」就地动作 ∥ 拉仓流（可见项目 ⇒ 拉取 ⇒ 四态人话）∥ 首次进入四相空态 ∥ 双鉴权取数（`/api/me/chat/*`——cookie ∥ Bearer）∥ 档位面（核菜单 ⇒ `PATCH`）∥ 无源钮收窄（五枚 + 主机凭据钮不设）∥ i18n `me.chat.*` 两表同步（en 零 CJK）∥ 非壳页（`SHELL_PAGES` 五路径不动）∥ AC-19 canon 不破；机制全链 = `agent/MEMBER-AGENT.md` §3/§6 | 单元测试档 + 收口轮（用户实走对照 VSC/桌面） |
| 成员面三端对齐（功能点 50①；KD-SV-216–223） | ⑦ 差异条⑨ 逐项在册：帧面七型 + 卡族四件（ask 回路）∥ 模式旗四钮启用（会话行 `flags`）∥ 状态行 19 段表 ∥ 子代理面（核栈）+ 停单件 ∥ 会话条自绘下拉（位标/meta/✎/✕/📁）∥ 搜索/复制降级/图片/`@`/工具输出/⚙ 判定（判定 = 差异④ ∥ 机制档 §3.11(6)）∥ **钮可见性两侧同测**（成员面四模式钮可见 ∥ 管理面五枚仍隐——适配层开关 + 作用域覆写）∥ 判据 = 机制档 §6 本批两行（三端对齐行 ∥ ask 回路行） | 单元测试档 + 收口轮（用户实走对照 VSC/桌面） |

**用例（壳面；机制面 = `agent/ADMIN-AGENT.md` §8）**：

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N68 | 正常 | 装配 `#/admin/chat`（两语言径） | 页四段在册（会话条/消息流/状态行/输入区）；零卡片包裹（本页无 `.card` 面）；`#toolbar`/`#status-line` 各恰一；两 css `<link>` 幂等（重复装配零重注） |
| N69 | 正常 | 回读装配（假详情：user 行 ∥ assistant 行 + toolCalls ∥ tool 行 ∥ notice 行） | 用户块 `buildUserMessage` 形（label + 时间）；助手块 + 嵌套工具卡（`.tool-call` 在 `.message.assistant` 内）；`❯ ThinCoder:` 恰一次/回合；notice = 灰条自持行 |
| N70 | 正常 | 活流含 `turn`/`usage` 帧（假流桩） | 状态行逐项落位（轮次 ∥ `↑N ↓N` ∥ `hit N%` ∥ `context N%`——快照件源；未收录 ⇒ 零段 ∥ 工具名（call→result 对）∥ 静默段（阈值））；`end` ⇒ `durationMs` 冻结 + 重读 |
| B67 | 边界 | 在途提交（队列）∥ 队满（8）∥ `end` 收口 ∥ Ctrl+I | 待发泡 + `queued.pending` 标；队满 ⇒ `input.slotFull` toast；`end` ⇒ 重读 + 队首发出（新回合）；Ctrl+I ⇒ 中止 + 入队首 |
| B68 | 边界 | 斜径三形（`/model` ∥ `/new` ∥ `/help`）∥ 未知 `/x` ∥ 带参 `/model x` | 前三条 = 零 POST（菜单/弹窗/行集）；未知 ⇒ `slash.unknown` toast + 文本保留；带参 ⇒ `slash.args` toast |
| E52 | 错误 | 附件拒形逐键（核件 toast）∥ 图片 + 非视觉模型（服务端 400） | 核件 toast 逐键（`composer.attach.*`/`paste.unsupportedFormat`——词表在场）；400 就地人话 + 草稿/附件保留 |
| E53 | 错误 | 发送失败（流前错误）∥ 换模型 400（模型不在册） | 就地人话（服务端报文直呈——不吞）；草稿零清；会话模型零变 |
| N72 | 正常 | 装配 `#/admin/chat`（模型行含档位——假 providers 载荷）∥ 点 `#reasoning-btn` ∥ 点档 `high` | 钮解隐藏（`display` 非 none）；下拉 = 该模型枚举逐档 + 当刻档 ✓（核件面）；点选 ⇒ `PATCH …/:id { reasoning: "high" }` 恰一条 + 钮字 = 核词面 `reasoning.high`；推送携 `prefs.reasoning` |
| B70 | 边界 | 切会话（两会话各持档位）∥ 换模型 ∥ 无档模型（枚举空） | 切会话 ⇒ 推送回读 ⇒ 钮字随会话档位（各自记住）；换模型 ⇒ PATCH 回执 `reasoning: null` + 钮回 `—`（中性）；无档模型 ⇒ 钮显 `—`（中性）+ 菜单「不支持推理／关闭（不支持）」+ 零 `selectReasoning` |
| E55 | 错误 | 档位写失败（400——表外值 ∥ 服务端拒） | 就地人话（`ctx.fail`——服务端报文直呈）；钮面显示面重派生（`pushModels` 回当刻会话档位——零假选中）；会话档位零变 |
| N73 | 正常 | 假流桩按步序（`turn`(1) ∥ `delta` A ∥ `call` c1 ∥ `result` c1 ∥ `turn`(2) ∥ `delta` B ∥ `call` c2 ∥ `result` c2 ∥ `turn`(3) ∥ `delta` C——无 `end`）＋逆序用例（同一步 `call` 先于 `delta`） | 活流：`message.assistant` 三块（块1 = 标签 + 气泡 A + 卡 c1；块2 = 气泡 B + 卡 c2；块3 = 气泡 C）；标签恰一枚；卡各归当步（不堆块尾 ∥ 不跨步）；逆序用例 ⇒ 泡恒为块首子（插入不随到达序——§2.1②） |
| N74 | 正常 | 同内容回读夹具（assistant 行 ×3 + tool 行 ×2 ⇒ `messageNodes`） | 回读径形态签名与 N73 活流径逐字相等（**标签/类名序**——判据表述单源 = §2.1②；「与终态同形」机检） |
| B71 | 边界 | 工具-only 步（`turn` ∥ `call` ∥ `result`——零 delta）∥ `turn` 后即 `end`（零内容步） | 工具-only 步 ⇒ 该块零气泡、卡组在场；零内容步 ⇒ 零空块（不建空 `.message.assistant`） |
| E56 | 错误 | 步内失败卡（`ok:false`）∥ 中止/失败 `end`（重读置换） | 失败卡红面 + 展开且归当步块；重读后块位与活流一致 + notice 行在场（悬挂卡回读恒绿 = D2 在案） |

| N75 | 正常 | 假流桩（`ask`（permission）⇒ 应答 ⇒ `call`/`result`）＋ 假 api 桩 | 卡挂消息流尾（核 `renderApprovalCard` 类族）；点「批准」⇒ `POST …/asks/:promptId { verdict:"once" }` 恰一条 + 卡摘除；`result` 卡照常结算 |
| B72 | 边界 | 批卡（`ask`（batch——count=2））三值 ∥ 应答失败（400）∥ `end` 时残留卡 | 三值 ⇒ 应答体逐值；应答失败 ⇒ 人话 + 卡面重挂（非乐观）；`end`/切会话 ⇒ 残留卡全摘 |
| E57 | 错误 | 应答 400（已了结/未知 promptId）∥ 重读装配时在决卡 | 400 人话（服务端报文直呈——零吞）；重读 ⇒ 在决卡重挂区尾（`remount`——表不变，旧卡不失答） |

## 5. 边界（本面不做面）

- （admin-approval-cards）已落面 = 审批卡（单件 ∥ 批；做/不做逐条 = 本档 §2.1⑩ + 审批卡面条 ∥ 机制 = `agent/ADMIN-AGENT.md` §11.5）；不做面 = 问询/计划/subagent 卡 ∥ `#auto-btn` 钮位面（留隐——模式位三段另批）∥ 在决 ask 读数段 ∥ 卡面 diff 预览。

- 管理面 chat 渲染面不做项（理由逐项 = 本档 §2.1 对齐集）：思考块（帧/落库面无 reasoning 文本通道——加字段 = 后端面另轮）∥ diff 块（工具面无文件编辑族）∥ 会话内搜索（浏览器原生 Ctrl+F 已覆盖）∥ 问询/计划/subagent 卡（面无源——无 `question` 件 ∥ 计划/子代理族裁剪）∥
  代码块复制钮（核件自带钮——安全上下文依赖，http 内网面点击无效＝在册余项，TLS/公网化后可接）；核件只读消费（不 fork/不改名/不覆写核件语义）；核包 = registry 可发布包（`private` 已撤——#1353；首发 registry = 发布轮）。
- （chat-shell-align）不做面：会话删除/重命名（全文 = `agent/ADMIN-AGENT.md` §10）∥ **模式位/设置钮的功能补齐**（无源 = 隐藏，不造机制——推理钮经 KD-SV-111 出列）∥ 图片文件面（缩略图/下载/文件存储——dataURL 随行存，零文件面）∥ 跨会话并发/多标签同步（未裁——不发明）。
- （console-reasoning-levels）不做面：状态行 `✦reasoning` 段（口径④——`agent/ADMIN-AGENT.md` §10 同拍）∥ 档位/模型清单的**编辑**（只读消费核件单源）∥ 逐条覆写（VSC per-message `reasoning` 参——控制台恒会话级）∥ 其余无源钮（五枚）∥ 核件档位呈现改写（无档面文案 = 核件哨兵逐字——要改属核面另裁）。
- （console-chat-live-step）不做面：**服务端零改**（零新帧/零新字段——步界帧既有）∥ 悬挂卡回读恒绿（D2 口径）∥ 一步内「逐段交错」不发明（一步内 = 泡在前、卡在后——与终态同构即止）∥ 其它端不改（VSC 为基准先例——只收控制台面）。
- （member-face-chat）不做面：会话删除/重命名（沿管理面）∥ 管理面专属件（主机凭据/模型配置/审批卡）∥ 零本地记忆（压后——`agent/MEMBER-AGENT.md` §3.9）∥ 移动壳（接口形声明在册——§3.8）∥ 公共适配层抽取（成员页自持同构件——不动管理面已对齐件；两页单源 = 核件；抽取 = 另轮）。
- **三端对齐不做面**：跨工作区会话迁移/分享（功能点 35 另批）∥ 台账标记段/团队登录态段（判定项——机制档 §9 R85/R86；无同物不造）∥ 自动标题生成器（展示面落、生成器另批）∥ mid-turn 旗追改（呈报 R84——下回合生效沿 PATCH）∥ 跨回合池/计时态（端面约束——R83）∥ 移动壳/公网化（沿前批）。

## 6. 上抛/余项

- **① 需求档回笔（主 agent 笔）——已闭合**（2026-10-11：功能点 41 ∥ AC-41 入册——`docs/server/requirements/PROJECT.md` :225/:230）。
- **② 随正件（父侧/实施轮——以当刻盘面实读为准）**：`views-chat.mjs` 拆档（新档入档目链——单源 = `webui/WEBUI.md` §1）∥ `2026-10-11-admin-agent-chat-ui.test.mjs` 静态面用例上量随正（见 `webui/WEBUI.md` §1 链）+ 类名闭合用例随正（新类名族）——现读 **397** 行（2026-10-13 父侧现读，内容行口径；净变预算 ≤±50）
  ∥ 对话页对齐单元测试档两用例收正——取件面白名单用例（新取件增列 `thincoder-render-core/flow/block.mjs` ∥ `thincoder-render-core/composer/panel.mjs`）
  ∥ 「零 composer/reasoning 引用」口径（现读 **395** 行——2026-10-13 父侧现读；净变预算 ≤±20；**本体零触**——用例收正随实施轮）∥ `style.css` 五钮隐藏规则 + 别名块（AC-19 canon 用例随正——见 `webui/STYLE.md`）；
  门禁件数断言（单元测试档入链——以实施当刻盘面实读为准）∥ `i18n-{zh,en}-admin` 行账（`webui/ADMIN.md` §3）。
- **③ 披露（不阻塞）**：图片随消息行存 dataURL（≤15MB/图 ∥ 30MB/回合——核阀单源；详情响应仅 `imageCount` 零下发）——库体量口径在册；核件样式自带过渡/动画（单源零触——控制台自有档零动画不变）∥ 无源钮隐藏五枚（逐条实证 = 本档 §2.1③④）∥ `interrupt` 折法（中止+入队首——无注入通道）∥ 控制台零 CSP 头（沿现盘）。
- **④ 部署收尾（父侧）**：镜像重建 + 浏览器实走（四轴走查清单）——ECS 断点。
- **⑤ （console-reasoning-levels）交付项与披露**（机制面行账/验收 = `agent/ADMIN-AGENT.md` §13；本档只登控制台面）：
  - **随正件（测试链）**：结构版本断言 **11 件**（各一行 `SCHEMA_VERSION === 15` ⇒ `16`——数字就地收正 ⇒ 行数 ±0；逐件现读 = `agent/ADMIN-AGENT.md` §13 R61①）+ `2026-10-11-chat-shell-align.test.mjs:791`（隐藏用例六 id ⇒ 五 id）∥ `:807`（零悬停规则扫描名单）+ `2026-10-11-admin-agent-chat.test.mjs:640`（`agent_chats` 列面五列 ⇒ 六列）。
    ——测试链件数 **56 ⇒ 57**（单元测试档入链）。
  - **披露（不阻塞）**：① `@thincoder/core` 在**本开发机未装**（`thincoder-server/node_modules` 无该包——vscode/desktop/cli 均为仓内 junction）⇒ 开发/测试态档位面退中性（`modelReasoning = {}` + 一条警告）；生产镜像内核为声明依赖（`^0.10.4`——装包径），档位面照常；若镜像真缺核 ⇒ admin chat 回合本就不可用（同源失败，非引入）。
    **② 路由形模型名**（含 `/`——router 形）：核载荷门静默不发 `reasoning_effort`（VSC/桌面同态）——控制台不另立过滤（只读消费核单源）。③ `views-chat.mjs` 后 ≈**498**（近 500 软线；硬限 800 未越）。
- **⑥ （console-chat-live-step）交付项与披露**：
  - **需求档回笔（主 agent 笔）——已闭合**（2026-10-12：AC-41 ② 补「流式按步交错（与终态同形）」措辞 ∥ 功能点 41「六钮 ⇒ 五钮」收正——`docs/server/requirements/PROJECT.md` :349 ∥ :227）。
  - **随正件**：见 §3 末段（测试四件——含拆档新档 `…-chat-shell-align-ui.test.mjs` ∥ `webui/WEBUI.md`）。
  - **实施首步 = 核侧对位探针**：活流径（`renderBlock` ∥ 卡两件）与回读径（`buildAssistantRestore` ∥ `buildFinishedToolCard`）两径 DOM 结构签名对位实跑——坐标 = §2.1②；失配 ⇒ 停并上抛（核面另裁）；机检落点 = **壳面**用例 N74（本档 §4）。
  - **披露（不阻塞）**：① 拆档缘由 = `views-chat.mjs` 恰贴 500 软线（机检 `≤500`——增行前必须先外拆）；② 新档同守代码段零 CJK ∥ 行宽 ≤300 ∥ 零外链 ∥ 零 `innerHTML` 写口（canon 不破）；③ `end` 重读保留 = 读时单源（notice 行唯一呈现径）；置换后活流与回读同形 ⇒ 零位差（用户实走终判）。
- **⑦ （member-face-chat）交付项与披露**：
  - **需求档回笔（主 agent 笔）**：AC-12 我的 **6 ⇒ 7**（`#/me/chat`）+ 静态档目链随正（+3 档）+ 角色默认页（出案——未裁前照现盘）；AC-50 ⑥ 五题判据回填（裁定后）。
  - **随正件（父侧/实施轮——以当刻盘面实读为准）**：`webui/WEBUI.md` §1 档目链 + 静态面清单（+3 名）∥ §2 IA 表（我的首位行）∥ §5（`app.mjs`/`nav.mjs` 行）∥ §6 AC-12 行；`webui/ME.md` §3（两 me 表键数）；档目断言件（+3 名——净变 ≤±20）；`style.css`（本面新面登记——行账 = `webui/STYLE.md` §3）。
  - **披露（不阻塞）**：成员页与管理页适配层同构自持（抽取 = 登记后续——两页单源 = 核件）；`end.reason` 六值面（管理面五值 + `box_lost`）为本面差异；盒自产扩展四值（`save_failed`/`busy`/`not_found`/`internal`）枚举外 ⇒ 原文兜底（单源 = `agent/MEMBER-AGENT.md` §3.4）；拉仓凭据经盒按次（`agent/MEMBER-AGENT.md` §3.6 披露句）。
- **⑨ （member-face-parity）交付项与披露**：
  - **随正件（父侧/实施轮——以当刻盘面实读为准）**：`webui/WEBUI.md` §1（+新档三件——JS 链/档目链随正）∥ 测试链（机制档 §9 R89——六件 + 本批新档；清单单源）∥ `style.css` 新面登记（卡族/下拉/搜索/子代理块类名 + **钮可见性作用域覆写**（成员面四模式钮 + 设置钮解锁）——行账 = `webui/STYLE.md` §3）∥ `i18n-{zh,en}-me` 键族（卡族/下拉/搜索/状态行段/ask 文案——核件词面段与 me 键分登）。
  - **披露（不阻塞）**：① 拆档两步序（拉取件外拆在先——本批三件后落）；② 判定项两枚（台账标记段 ∥ 团队登录态段——机制档 §9 R85/R86，默认补法在案、未裁前不造）；③ 跨回合池/计时态 = 端面约束（R83——回合内可达）；④ 帧面增补七型对旧盒向后兼容（未知帧零处理）。
- **⑩ （admin-approval-cards）交付项与披露**：
  - **需求档回笔（主 agent 笔）**：管理面审批卡面条目/AC（用户 2026-10-17 裁「必须上审批卡」——口径 = 现状「零审批卡面」欠账补）。
  - **随正件（父侧/实施轮——以当刻盘面实读为准）**：`webui/WEBUI.md` §1（+ `views-chat-cards.mjs` 入 JS 链/档目链）∥ 测试链（静态面档目断言件 +1 名 ∥ 键数/指纹就地收正——卡族键零增）∥ 批内定向单测（同下——档目链随正）∥
   结构版本断言 = **25** ∥ `agent_chats` 列面 = **8 列**（含 `auto_approve`；两件载体 = 批内定向单测 `test/2026-10-17-admin-approval-cards.test.mjs`——17 例，收口随批删）。
  - **披露（不阻塞）**：`#auto-btn` 留隐（钮位三段未落——出列候裁）；断线 ⇒ 拒值（无流断重挂面）；未决卡 ⇒ 回合挂起（中止可解）；拒执行亦可见（`call`/`result` 帧 + 工具行 + 审计 −1）。
  - **部署收尾（父侧）**：镜像重建 + 浏览器实走（写类一次弹卡 ⇒ 批 ⇒ 执行 ∥ `always` 一次 ∥ 拒一次）。

