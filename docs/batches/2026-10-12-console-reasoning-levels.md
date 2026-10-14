# 2026-10-12 · 控制台对话页思考档位选择器
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-12 · 来源 = 用户 2026-10-12 11:45 走查提出（原话：「界面上没有思考档位选择器」）；11:46 四条口径「行」核准 ⇒ 需求档功能点 42 / AC-42 已入册（`docs/server/requirements/PROJECT.md`）。
> 台账 = #1303（server · 归批）。前情 = docs/batches/2026-10-11-chat-shell-align.md（已收口 2026-10-12）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-12
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 1.1 来源与需求（逐字）

- **用户 2026-10-12 11:45（走查对话页后）**：「界面上没有思考档位选择器」。
- **现状实读**（父侧勘察）：核件输入区的档位钮**在件**（`thincoder-render-core/composer/model-menu.mjs` 档位菜单 + `selectReasoning` 消息面已造），但控制台侧被**无源收窄**隐藏（`style.css:283`：`#reasoning-btn` 等六钮 `display:none`——设计载「无源钮收窄：推理（会话级 reasoning 通道无）」）。三段缺口（父侧实读，2026-10-12）：
  - **源**：控制台模型行恒空 `reasoning: []`（`views-chat-composer.mjs:134`）——无档位数据源；核件侧单源 = `thincoder-core/model-specs.mjs` 逐模型 `reasoningEffortEnum`（VSC/桌面在用）。
  - **线**：服务端**零** reasoning 字段（`src/agent/**` grep `reasoningEffort|selectReasoning` 零命中）——选定档位今天无处可去。
  - **界面**：钮隐藏 + 适配器未接 `selectReasoning`。
- **需求档**：功能点 **42** + **AC-42** 已入册（`docs/server/requirements/PROJECT.md`——含三段与口径四条）。

### 1.2 口径四条（用户 2026-10-12 11:46「行」核准——**设计侧提议、用户核准**）

1. **值域 = 每模型各自枚举**（核件单源；不做统一清单；无档模型呈中性态）；
2. **默认 = 不设**（一个字段都不发——与今日行为同；换模型 ⇒ 回中性）；
3. **归属 = 会话级**（与模型同层存；切会话各自记住）；
4. **状态行 `✦reasoning` 段本批不做**（属状态行信息设计、另一条线——用户未点）。

### 1.3 范围与边界（本批 = 一块石头）

- **做** = 「选择器真的能用」的三段补齐（源 ⇒ 线 ⇒ 界面）；
- **不做** = 状态行显示面（口径④）∥ 档位/模型清单的编辑（只读消费核件单源）∥ 其余无源钮（四模式位 ∥ 设置）∥ 未点面（如附件与档位的关联）。
- **预判落点**（父侧初勘，设计轮定稿）：源 = 模型列表接口 + `views-chat-composer.mjs` 核行 ∥ 线 = `src/agent/chat*.mjs`（会话行字段 + 路由 + 装配）∥ 界面 = `style.css` 收窄行 + 适配器。载体设计档 = `webui/CHAT.md`（+ 视需要 `agent/ADMIN-AGENT.md`/`gateway/API.md`/`store/STORE.md` 段）。

### 1.4 待裁/待呈（设计轮交卷时）

- 会话行档位字段的存储形（新列 ∥ 既有列——随结构版本口径）；
- 无档模型「中性态」的控制台侧对齐说明；
- 装配面 `think-off` 语义的取值点（复用核件 `think-off.mjs` 语义）。

### 1.5 用户授权（自动跑 · 2026-10-12 12:11）

**用户原话**：「其他自动走的自动走。」⇒ 本批**设计评审点火权** ∥ **§4 用户批准权（代签）** ∥ **修正轮 / 实施轮派发** ∥ **收口核销与提交**——均委托父侧自动执行，直至本批收口。

**父侧自缚三条（本仓惯例 · 先例同形）**：① 代签仅当三条件齐备（评审 pass 0 🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发），每次代签在本档 §4 写明「父侧代签（用户 12:11 授权）+ 依据」；② 新范围 ∥ 用户口径裁决 ⇒ **停下、只摆那一条**；③ 破坏性/不可逆 ⇒ **先停**。

**射程** = 本批（#1303 功能点 42 / AC-42）；**不含** #1282（用户 12:0x「还在走测中」——保持开、零动作）∥ 其余挂账行（条件未到，不动）。

### 1.6 评审 #263 裁决表（父侧 · 2026-10-12 12:1x）

| # | Action | Detail |
|---|--------|--------|
| 1 | Dispatched | 三处「六⇒五」随正（`webui/CHAT.md:138` ∥ `:139` ∥ `agent/ADMIN-AGENT.md:206` R60③）+ R60③ 推理项标注「已交付 = KD-SV-111」——修正轮 |
| 2 | Dispatched | `chat.mjs`（575 ⇒ ≈585）∥ `docs/batches/2026-10-11-admin-agent-chat.test.mjs`（716）越 500 档 ⇒ 各补拆分计划（沿 `webui/CHAT.md:109` 先例）——修正轮 |
| 3 | Dispatched | 删规范面旧态标记（`webui/CHAT.md:140` ∥ `:72`「恒 `[]` 面退役」括注）——修正轮 |
| 4 | Dispatched | `webui/CHAT.md:46` ∥ `:160`「无 reasoning 通道」⇒「无 reasoning **文本**通道」（与 `agent/ADMIN-AGENT.md:146` 同拍）——修正轮 |
| 5 | Dispatched | **父侧定形 = 明写解析径**（对外标识 → 上游真名，沿 `providers.mjs` 别名反查 = KD-SV-59；不取「退中性」——用户口径①「每模型各自枚举」要求别名所指上游有档即给）——修正轮 |
| 6 | Dispatched | 受改件行数注补「现读 ⇒ ≤±N」（`views-models.mjs` ∥ 11 件版本断言件 ∥ `style.css`）——修正轮 |
| 7 | Dispatched | 面小计复算收平（`webui/CHAT.md:114`「+≈22」⇄ 逐档 +20/+3）——修正轮 |

裁决 = 七条全采纳、全入修正轮（评审发现逐字转交，处置 = 设计档笔面 = eng-designer）；**无 Deferred / Not an issue**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（设计档五面在盘 + §2 落点表 8 主件/13 随正件逐行 file:line + AC-42 五条映射）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**本批任务与设计（eng-designer · 2026-10-12）**

**批次** console-reasoning-levels ｜ **台账** #1303 ｜ **轮次** 设计轮（初始）

### 2.0 覆盖口径

- **本批覆盖**：功能点 42（控制台对话页思考档位选择器）∥ **AC-42** 五条（`docs/server/requirements/PROJECT.md` §2）——口径四条 = 用户 2026-10-12 11:46「行」核准（① 值域按模型各自枚举 ② 默认不设 + 换模型回中性 ③ 会话级归属 ④ 状态行 ✦ 段不做）。
- **不在本批（边界）**：状态行 `✦reasoning` 段 ∥ 逐条覆写（VSC per-message `reasoning` 参）∥ 档位/模型清单的编辑面 ∥ 核面板其余无源钮（五枚：`#auto-btn`/`#advisor-btn`/`#eng-btn`/`#plan-btn`/`#settings-btn`）∥ 核件档位呈现改写（无档文案 = 核件哨兵逐字）∥ 既有不做面（图片文件面/会话删除等——`agent/ADMIN-AGENT.md` §10）。
- **设计档落点（已落盘）**：`webui/CHAT.md` §1 KD-SV-111 ∥ §2.1③④⑤ ∥ §3 ∥ §4 ∥ §5 ∥ §6 ∥ 变更记录；`agent/ADMIN-AGENT.md` §6 ∥ §7 ∥ §8 ∥ §9 KD-SV-110 ∥ §10 ∥ §11.1 ∥ **§11.4（新）** ∥ §13 R61 ∥ 变更记录；`gateway/API.md` §2.2 ∥ §2.8 ∥ §4 ∥ §8 ∥ 变更记录；`store/STORE.md` §1–§4 ∥ 变更记录；`design/PROJECT.md` §4 ∥ §6 ∥ §7 ∥ §9 ∥ 变更记录。**产品码零触（设计轮）。**

### 2.1 实施落点表（逐行 file:line——实施轮照表干活，不允许「实施时找」）

**服务端（5 件：1 新 + 4 改）**

| 文件 | 实读 → 目标 | 落点（本设计轮实读） | 干活（逐处） |
|---|---|---|---|
| `thincoder-server/src/gateway/reasoning-levels.mjs` | 无 → ≈45（拟新增） | 全档新建 | 值域桥：懒载 `@thincoder/core/model-specs.mjs`（`specForModel`——缓存单例）∥ `levelsOf(model)` → `string[]`（枚举 ∥ `[]`）∥ `modelReasoningMap(models)` → 稀疏图（空档零键）∥ 缺包 ⇒ 抛（**调用侧退化 + 一条警告**——模块级旗，一进程一条） |
| `thincoder-server/src/gateway/provider-admin.mjs` | 349 → ≈362 | `:26-33`（import 区）；`:290`（`registerProviderAdminRoutes` 签名——+ `specLookup = null`）；`:294`（GET handler——改 `async`）；`:303`（行装配——邻 `modelMeta` 增 `modelReasoning`） | ① import 桥件；② 注入缝（缺省 = null ⇒ 懒载真核）；③ GET 行携 `modelReasoning`（稀疏 map——键 = 上游真名）；④ 缺核 ⇒ `{}` + 警告（不 5xx） |
| `thincoder-server/src/agent/chat-routes.mjs` | 158 → ≈178 | `:61-80`（建会话——`:80` 行形 + `reasoning`）；`:83`（列表）；`:88`（详情——走 `chatView` 同源，零改）；`:130`（注释块）；`:132-146`（PATCH——体分派 + 清档 + 校验） | ① 行形补 `reasoning`（建会话/列表两面）；② PATCH 扩**会话设置面**：`{ model }` ⇒ `UPDATE … SET model = ?, reasoning = NULL …`（换模型清档）；`{ reasoning }` ⇒ `null` 清 ∥ 表内落值 ∥ 表外/非串 ⇒ 400；两键同携 ⇒ 400；③ 值域 = 桥件（缺核 ⇒ 400 人话） |
| `thincoder-server/src/agent/chat.mjs` | 575 → ≈585 | `:125`（`chatView`——就近 `:130` 行形增 `reasoning`）；`:383`（`buildChatExit` 签名）；`:411`（`runChatTurn`——起跑读行**零改**：`:119` 邻读 = `SELECT *` 已含新列）；`:479`（出口装配调用点） | ① `chatView` 行形携 `reasoning`；② `buildChatExit({ …, reasoning })` 增参；③ 出口装配：值 ∈ 当刻模型枚举 ⇒ provider 配置对象携 `reasoningEffort`；未设 ∥ 表外 ⇒ **零字段**（缺核 ⇒ 同零字段） |
| `thincoder-server/src/store/db.mjs` | 476 → ≈485 | `:346-363`（v14 段注释——注句随 v16 收正）；`:411`（`MIGRATIONS` 数组——末段后追加）；`:430`（`SCHEMA_VERSION` 派生——**零改**） | v16 段：`ALTER TABLE agent_chats ADD COLUMN reasoning TEXT;`（列级——表不重建；**无回填**） |

**控制台（3 件）**

| 文件 | 实读 → 目标 | 落点（本设计轮实读） | 干活（逐处） |
|---|---|---|---|
| `thincoder-server/public/style.css` | 344 → ±0 | `:281`（注释块——去「推理」项）；`:283`（六 id 行） | 收窄名单 **六 ⇒ 五**：删 `#reasoning-btn`（余五不动）；注释随正（行数零变） |
| `thincoder-server/public/views-chat-composer.mjs` | 308 → ≈318 | `:134`（`coreRowOf`——`reasoning: []` 恒空面退役）；`:137-154`（`pushModels`——`:143` `prefs`）；`:179-184`（`post` 映射——`:184` 邻 `selectModel`）；`:288-292`（`selectModel` 先例 ⇒ 同形新函数） | ① 核行携真档位（`row.reasoning ?? []`）；② `prefs` 携当刻会话档位；③ `post` 映射加 `selectReasoning` ⇒ `PATCH …/:id { reasoning }`；④ 失败 ⇒ 显示面重派生（沿 `selectModel` 同形） |
| `thincoder-server/public/views-chat.mjs` | 488 → ≈498 | `:214`（deps 传参区——邻 `onSelectModel`）；`:243`（`currentChat()`——行形零改，`reasoning` 随行）；`:420`（`onSelectModel` 先例 ⇒ 同形加 `onSelectReasoning`） | ① 注入 `onSelectReasoning` 到输入区适配层；② 写失败 ⇒ `ctx.fail` 就地人话；③ 发送前 await 在飞档位写（选中即改 ⇒ 下回合生效——单变量串行） |
| `thincoder-server/public/views-models.mjs` | 267 → ≈270 | `:32`（`deriveModels`——行装配） | 行形补 `reasoning`（= `provider.modelReasoning?.[上游名] ?? []`——无档 ⇒ `[]`，控制台零二次改写） |

**测试链随正（13 件 + 1 新批内件）**

| 件 | 断点 | 改法 |
|---|---|---|
| `docs/batches/2026-10-06-server-gateway.test.mjs` | `:167` | `SCHEMA_VERSION === 15` ⇒ `16` |
| `docs/batches/2026-10-06-console-completeness-2.test.mjs` | `:152` | 同上 |
| `docs/batches/2026-10-07-me-keys-redo.test.mjs` | `:120` | 同上 |
| `docs/batches/2026-10-07-provider-model-metadata.test.mjs` | `:151` | 同上 |
| `docs/batches/2026-10-07-quota-per-model.test.mjs` | `:150` | 同上 |
| `docs/batches/2026-10-07-quota-v2-member-models.test.mjs` | `:167` | 同上 |
| `docs/batches/2026-10-09-server-console-config.test.mjs` | `:383` | 同上 |
| `docs/batches/2026-10-09-server-gemini-openai-preset.test.mjs` | `:263` | 同上 |
| `docs/batches/2026-10-10-team-login-client-access.test.mjs` | `:284` | 同上 |
| `docs/batches/2026-10-11-admin-agent-chat.test.mjs` | `:638`（版本）+ `:640`（列面） | 版本同上 ∥ 列面 `[id, model, status, created_by, created_at, updated_at]` ⇒ 尾插 `reasoning` |
| `docs/batches/2026-10-11-sandbox-image-sources.test.mjs` | `:599` | 版本同上 |
| `docs/batches/2026-10-11-chat-shell-align.test.mjs` | `:791`（隐藏腿）+ `:807`（悬停扫描名单） | 六 id ⇒ 五 id（去 `#reasoning-btn`——两处） |
| `thincoder-server/package.json` | `prepublishOnly` 链 | 56 ⇒ **57**（本批批内件入链） |
| `docs/batches/2026-10-12-console-reasoning-levels.test.mjs`（新） | —— | 批内件（六腿——见 §2.3 判据） |

### 2.2 数据流（四步）

① **源**：`GET /api/admin/providers` ⇒ 每 provider 行 `modelReasoning`（稀疏 map：键 = 上游真名 ∥ 值 = 核 `specForModel(上游).reasoningEffortEnum`）⇒ `deriveModels` 行携 `reasoning` ⇒ 核模型菜单行（`coreRowOf`）。**无档模型 = 零键 ⇒ `[]` ⇒ 核无档面**（钮显 `reasoning.off`、菜单「不支持推理／关闭（不支持）」、零写出）。
② **写**：核菜单拾取 ⇒ `post("selectReasoning")` ⇒ `PATCH /api/admin/agent/chats/:id { reasoning }`（值 ∈ 当刻模型枚举；`null` = 清）⇒ 落库 `agent_chats.reasoning` ⇒ 回执行形 ⇒ 推送 `prefs.reasoning` 回钮面。
③ **换模型**：同一 PATCH `{ model }` ⇒ `model` 更新 + **`reasoning = NULL`**（口径②——回中性）⇒ 推送 ⇒ 钮回 `—`。
④ **装配**：发送 ⇒ `runChatTurn`（`:411`——起跑读行 `SELECT *` 已含 `reasoning`）⇒ 出口装配（`:479`）⇒ 值 ∈ 当刻模型枚举 ⇒ provider 配置对象携 `reasoningEffort`（核 `thincoder-core/provider/core.mjs` 载荷门/枚举门/路由形守门单源消费）；未设 ∥ 表外 ⇒ **零字段**（与批前行为逐字同）。

### 2.3 验收判据（AC-42 五条 → 机检载点）

| AC-42 | 判据（机检） | 载点 |
|---|---|---|
| ① 档位源在册 | `modelReasoning` 稀疏 map（假 specLookup 注入：有档登键 ∥ 无档零键 ∥ 键 = 上游真名）∥ `deriveModels` 行携 `reasoning` ⇒ 核行非恒空 | 批内件（服务端腿 + 前端腿） |
| ② 选择生效 + 非法拒 | `PATCH { reasoning }` 枚举内 ⇒ 200 落库 + 回执携值；表外/非串/同携 `model` ⇒ 400 库零变 ∥ 装配：出口 provider 入参携 `reasoningEffort`（假出口断言）；未设 ∥ 表外 ⇒ 零键 | 批内件（服务端腿） |
| ③ 界面可用 | `style.css` 五钮收窄（`#reasoning-btn` 不在收窄行）∥ 点选 ⇒ `PATCH` 恰一条 ∥ 切会话 ⇒ 推送回读（`prefs.reasoning`） | 批内件（前端腿）+ 收口轮（浏览器实走） |
| ④ 默认静默 | 未动 ⇒ 零字段（装配断言）∥ 存量行 NULL 零变（v16 零迁移：空库直落 16 ∥ 列面六列 ∥ 存量行 NULL） | 批内件（服务端腿） |
| ⑤ 状态行不做 | `statusSegments` 零改（`✦` 零引用——既有腿续） | 既有腿（`…-chat-shell-align.test.mjs`） |

### 2.4 用例（本批六条——机制面 = `agent/ADMIN-AGENT.md` §8 ∥ 壳面 = `webui/CHAT.md` §4）

N71（PATCH 设档 + 装配携值 + 三面行形）∥ B69（未设/表外/换模型清档/v15 存量库）∥ E54（表外值/非串/同携/缺核 ⇒ 400 库零变）∥ N72（钮解隐藏 + 点选 ⇒ PATCH + 推送回读）∥ B70（切会话各自记住 ∥ 换模型回中性 ∥ 无档模型中性能辨）∥ E55（档位写失败 ⇒ 就地人话 + 钮面重派生）。

### 2.5 上抛/披露（判据 = `agent/ADMIN-AGENT.md` §13 R61）

① **开发机缺核**：`thincoder-server/node_modules` 无 `@thincoder/core` ⇒ 开发/测试态档位面退中性（`modelReasoning = {}` + 一条警告）；生产镜像内核为声明依赖（`^0.10.4`）。② **路由形模型名**（含 `/`）：核载荷门静默不发 `reasoning_effort`（VSC/桌面同态）——控制台不另立过滤。③ **件数与预算**：主件 8（服务端 5 + 控制台 3——`≤15` 口径内）＋ 随正 13 + 新批内件 1；版本随正涟漪（11 件·各一行）为机械项。④ **部署收尾**（父侧）：镜像重建 + 浏览器实走（选档/换模型/切会话三径）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

设计评审（console-reasoning-levels 批——功能点 42 ∥ AC-42；六档全文审读：webui/CHAT.md ∥ agent/ADMIN-AGENT.md ∥ gateway/API.md ∥ store/STORE.md ∥ design/PROJECT.md ∥ requirements/PROJECT.md）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 文档状态一致性 | 🟡 | 六⇒五未随正三处：`webui/CHAT.md:138` AC-41 行仍载「无源钮收窄——六钮 CSS 隐藏」、`:139` 机检行仍载「（`style.css` 六 id）」、`agent/ADMIN-AGENT.md:206` R60③ 仍载「无源钮隐藏六枚（推理/模式位/设置——无源实证）」——与本批五枚口径（`webui/CHAT.md:67` ∥ `:93` ∥ `:141` ∥ `:170`）相抵；R60③ 且与同档 KD-SV-110（`:119`）∥ §11.4（`:173-179`）相抵（六⇒五 的测试腿随正已在 `webui/CHAT.md:173` 在册——AC 行未同拍） | 三处随正为五枚/五 id；R60③ 推理项改标「已交付 = KD-SV-111」（沿同档 R60③「R54 ③ 两项交付失效」先例） |
| 2 | 受影响档行数·拆分计划（判据 8） | 🟡 | `agent/chat.mjs`（`agent/ADMIN-AGENT.md:60`：实读 575 ⇒ ≈585）与 `docs/batches/2026-10-11-admin-agent-chat.test.mjs`（`agent/ADMIN-AGENT.md:78`：现读 716 行；本批两点改 `:638` ∥ `:640`——`agent/ADMIN-AGENT.md:207` R61①）均越 500 档，设计未携拆分计划（对照 `webui/CHAT.md:109`：`views-chat.mjs` ≈498 携「预案 = 档位小段随拆档审查」） | 两处各补拆分计划/拆分审查预案（硬限 800 未越） |
| 3 | 文档卫生（2026-09-18 裁定） | 🟡 | 规范面残旧态/退役标记：`webui/CHAT.md:140`（AC 行）「核行 `reasoning` 非恒空（恒 `[]` 面退役）」∥ `:72`（机制行）「（本项③核行造面——恒 `[]` 面退役）」——失效态已由变更记录（`:181`）承载 | 删括注，保留正向现态句（核行携 `reasoning`） |
| 4 | 跨档措辞滞后 | 🟡 | 「无 reasoning 通道」未随正为「无 reasoning 文本通道」：`webui/CHAT.md:46`「服务端帧面/落库面无 reasoning 通道（帧四形 ∥ 消息 role 四值）」∥ `:160`「思考块（帧/落库面无 reasoning 通道——加字段 = 后端面另轮）」vs `agent/ADMIN-AGENT.md:146`「帧面/落库面无 reasoning 文本通道」；本批已引入档位列（`store/STORE.md:407` v16 段）⇒ CHAT 侧字面失真 | 两处补「文本」限定词（与 `agent/ADMIN-AGENT.md:146` 同拍） |
| 5 | 清晰度·别名维度 | 🟡 | 值域解析径未写明：会话 `model` = 对外标识（`gateway/API.md:80`「（别名 ∥ `provider/model`）」、`:179`「`model` 不在开放清单 ⇒ 400」），而值域源 = `agent/ADMIN-AGENT.md:176`「`specForModel(上游真名).reasoningEffortEnum`」；`:177`/`:178` 校验「当刻模型枚举」未指明别名反查 ⇒ 配别名模型可能三段自相抵（源面行显示档位 ∧ PATCH 表外 400 ∧ 装配零字段） | 明写对外标识→上游真名解析径（沿 `thincoder-server/src/gateway/providers.mjs` 别名反查 = KD-SV-59），或声明别名模型档位面退中性并同披露（沿 `webui/CHAT.md:174②` 先例） |
| 6 | 受影响档行数·注释完整性（判据 8） | 🔵 | 受改件行数注不全：`views-models.mjs` 仅「≈+3（行携档）」（`design/PROJECT.md:670`，无现读）；11 件结构版本断言件仅给改点行号（`webui/CHAT.md:173` ∥ `agent/ADMIN-AGENT.md:207` R61①，无 ≤±N）；`style.css` 仅「±0」（`design/PROJECT.md:670`；行账 = `webui/STYLE.md` §3——本审范围外不可核） | 逐件补「现读 ⇒ ≤±N」（沿注⑲/⑳「逐件行数 ⇒ ≤±2」同式） |
| 7 | 数值漂移（R7c） | 🔵 | 面小计与逐档增量不合：`webui/CHAT.md:114`「本批：+≈22 = 档位写面/造面 ≡ i18n core 零增」（≈933 ⇒ ≈955）vs 同档 `:109`（明写 +≈10）与 `:110`（308 ⇒ ≈318，隐含 +10）——和 +20 ⇒ 953；跨档 `design/PROJECT.md:670` webui ≈+23（= +20 + `views-models.mjs` ≈+3） | 复算收平（分项闭式） |

限制披露（不阻塞）：文档地图/项目标准档未声明（Document ownership 与方法学按 AGENTS.md + 档内规范判定）；被引批档（§1/§2 落点表）与源件在审读范围外——其实读值仅做跨档互核（488 ∥ 308 ∥ 349 ∥ 158 ∥ 575 ∥ 476 ∥ 45 四档互洽），盘面符否 unverified。

计数：🔴×0 ∥ 🟡×5 ∥ 🔵×2
VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（父侧代签——用户 2026-10-12 12:11 授权「其他自动走的自动走」，批档 §1.5 在册）**

**三条件齐备**：① **设计评审 #263 pass**（0 🔴 ∥ 5 🟡 ∥ 2 🔵——发现表 = §3；裁决表 = §1.6，七条全采纳）；② **修正轮 #264 已落地并逐条核验**（父侧实测读数：规范面「六钮/六 id/六枚」grep 清零——余 3 处 = 变更记录/变更指令行；「面退役」括注规范面清零；「无 reasoning 文本通道」3 处在场；别名解析径 3 档在场；拆分计划 2 处到场；复算闭 = CHAT 面小计 953 ∥ PROJECT webui +23；`git status` = 仅文档改动、产品码零触）；③ **token 已签发**（评审 #263 回执，值不落档——凭据只活在运行态）。
**依据** = §1.5 授权 + §1.6 裁决表 + §3 发现表 + 上列核验读数。
**批准范围** = 本批设计面（功能点 42 ∥ AC-42 五条）；实施轮 = eng-coder（设计 token + 本档 §2 落点表）。

## §5 实施记录（eng-coder）

### 实施记录（eng-coder · console-reasoning-levels）

**状态行**：实施完成（1 轮 fix · 内审 CLEAN · 代码评审 2 轮 pass）

#### ① 交付摘要（实落 11 件）

| 文件 | 落点 |
|---|---|
| `thincoder-server/src/gateway/reasoning-levels.mjs`（新 88 行） | 值域桥：懒载核 `specForModel` + 缓存（失败同缓存）∥ `setReasoningLevelsDeps({ specLookup })` 注入缝 ∥ `levelsOf`／`modelReasoningMap`（稀疏图）／`levelsOfRef`（别名反解 KD-SV-59）／`noteDegraded`（一进程一条 + `cause` 真因）∥ 缺核抛（调用侧退化） |
| `src/gateway/provider-admin.mjs` | 注册签名 + `specLookup = null`；**GET 改 async**，逐 provider 取 `modelReasoning`（缺核 ⇒ `{}` + 一条警告，**不 5xx**）；头注补档位段 |
| `src/agent/chat-routes.mjs` | PATCH 重写为**会话设置面**：`{ model }` ∥ `{ reasoning }` 一次一件（同携 ⇒ 400）；`{ reasoning }` 值域 = 当刻模型核枚举（表外/非串 ⇒ 400 库零变；`null` = 清）；建会话/回执行形补 `reasoning` |
| `src/agent/chat.mjs` | `chatView` 行形补 `reasoning`；`buildChatExit({ …, reasoning, log })` 装配（值 ∈ 枚举才携 `reasoningEffort`；未设/表外/缺核 ⇒ 零字段，回合不阻断）；`:502` 调用点传 `chat.reasoning`；头注补档位面 |
| `src/store/db.mjs` | v16 段：`DDL_V16`（`ALTER TABLE agent_chats ADD COLUMN reasoning TEXT;` + 审计 CHECK 零动）+ `MIGRATIONS` 尾追 `{ v: 16 }`（`SCHEMA_VERSION` 派生零改）；v14 段注句随正括注 |
| `public/views-models.mjs` | `deriveModels` 行携 `reasoning: provider.modelReasoning?.[upstream] ?? []`（核行非恒空） |
| `public/views-chat-composer.mjs` | `coreRowOf` 携真档位 ∥ `prefs.reasoning` = 当刻会话档位 ∥ `post` 映射 + `selectReasoning`（失败 ⇒ 显示面重派生）；四面注随正（收窄 **五** id） |
| `public/views-chat.mjs`（**500 行**——贴 500 软线） | deps 注入 `onSelectReasoning`；档位写 = 单变量串行链（会话 id 随拾取捕获）+ 回执卫（`activeId === chatId` 才落详）；`onSend` 发送前 `await reasoningWrite`；失败 ⇒ `ctx.fail` + 假 |
| `public/style.css` | 无源钮收窄六 ⇒ 五 id（`#reasoning-btn` 出列 = 解隐藏）+ 注释随正 |
| `docs/batches/2026-10-12-console-reasoning-levels.test.mjs`（新 620 行） | 批内件九腿：①源在册/缺核退化 ∥ N71/E54/B69 ∥ ④v16 结构 ∥ ③界面结构腿 ∥ B70 壳面 ∥ N72/E55/B70 页级实驱动（含连写串行 + 回执卫） |
| `thincoder-server/package.json` | `prepublishOnly` 链尾插本批件（56 ⇒ 57） |

#### ② 判据与读数（我跑的）

- 批内件：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-12-console-reasoning-levels.test.mjs`（自 `thincoder/` 仓根）⇒ **9/9 pass**（含页级实驱动：真核件 + 假 DOM，点选 ⇒ PATCH 恰一条 ∥ 切会话回读 ∥ 失败人话 + 重派生 ∥ 串行链 ∥ 回执卫）。
- `2026-10-11-admin-agent-chat-ui.test.mjs` ⇒ **7/7 pass**（`views-chat.mjs` 500 行 ≤ 软线腿绿）。
- 全链读数（`npm run prepublishOnly`）⇒ 20 处红 = **13 件他批测试件的版本涟漪/门禁件数/行形随正**（写闸禁跨批 ⇒ 父侧代做，逐行清单见交付报告）。
- 未跑：集成套件（本批非前端集成面）；仓套件 = 父侧收口门（本批不内跑）。

#### ③ 决策透明表

| # | 决策 | 依据/代价 |
|---|---|---|
| D1 | 值域桥单源直读核枚举 + 注入缝（开发机无 `@thincoder/core`） | 口径①；注入缝 = 批内件替身，缺省懒载真核 ⇒ 生产行为不变 |
| D2 | 缺核 ⇒ 抛，调用侧退化（GET `{}` ∥ PATCH 400 ∥ 装配零字段） | 口径②；回合不阻断 |
| D3 | 换模型 PATCH 随写 `reasoning = NULL`（同一写） | 口径②（换模型回中性） |
| D4 | PATCH = 一次一件（同携 ⇒ 400）——不为模型换档位连带清档 | §2.8 字面；库零变可判 |
| D5 | `views-chat.mjs` 收正为**恰 500 行**（dense `.then` 一行式，本档既有风格） | 设计预算 ≈498 实需 +19 ⇒ 越线；按"≤500 软线"收面（详交付报告偏离节） |
| D6 | 档位写**串行链 + 回执卫**（会话 id 随拾取捕获；`activeId === chatId` 才落详） | 设计"单变量串行"；回执卫 = 评审 🟡 收正（免跨会话套写） |
| D7 | `noteDegraded(log, where, error)` 第三参携带真因 | 评审 🔵 收正（免「核未装载」与「核 API 漂移」同形不可辨） |
| D8 | 批内件 `tick` = 微任务排空（零墙钟）+ 缺核腿模块级注入 | 评审 🔵 收正（确定性 + 免依赖环境） |

#### ④ 内审 / 代码评审轮次与终态

- **内审（explore · 只读偏离审计）1 轮**：结论 `CLEAN`——四类偏离（半实现 ∥ 越界改动 ∥ 注释不符 ∥ 档面越界）均无；五条 AC 逐点落位；事实备注 2 条（行数读数；`views-chat.mjs:438` 跨会话回执窗口）。
- **代码评审（advisor）2 轮**：①轮 `pass`（0 🔴 ∥ 3 🟡 ∥ 4 🔵——竞态窗口、两处行数 advisory、测试确定性/可观测项）；②轮收正复核 `pass`（4 项收正实读证实：回执卫 ∥ `noteDegraded` 真因 ∥ 测试免依赖注入 ∥ 零墙钟；新增回归腿；未引入新 🔴）。
- **fix round = 1 轮**（4 项收正 + 1 条回归腿）；余项 = 3 条 advisory/🔵（`chat.mjs` 599 行 ∥ 批内件 620 行 ∥ 设计档行数注回填）+ 1 条既有同形残余（`onSelectModel` 回执卫）——均非 must-fix，父侧可裁。
- **终态 = `clean`**（内审 CLEAN + 评审两轮 pass；无未决 🔴）。

**更正（同段追加 · 写后读回发现）**：上「判据与读数」第二段末句笔误——全链红面实读 = **28 处测试 / 20 件文件**（非「20 处红 = 13 件」）；另 + 1 件 `2026-10-11-chat-shell-align.test.mjs`「绿但义陈旧」（六 id 收窄腿 + hover 名单待收正，id 字面仍在 CSS 注释内故 `includes` 判据仍真）。逐行随正清单（file:line → 原值 → 新值）见交付报告「待父侧机械随正」节，共 25 处缝（版本 21 缝 ∥ 门禁件数 7 缝 ∥ 行形 5 缝，其中 3 件为「一行多缝」）。

## §6 验证与收口（父代理）

### 收口（父代理 · 2026-10-12 13:0x–13:2x）

**链读数**：全链 `npm run prepublishOnly` ⇒ **510/510 pass · fail 0**（≈30.4s；基线 501 + 本批 9 腿 ⇒ 510 ✓）。定向件（实施面）：`…-console-reasoning-levels.test.mjs` **9/9** ✓ ∥ `…-admin-agent-chat-ui.test.mjs` **7/7** ✓（§5 自报 —— 父侧抽核：行数逐件复读 + 桥件导出 + v16 段 + 门禁链 57 + CSS 真规则五 id + `onSelectReasoning` 串行/回执卫/发送前 await，与交付一致 ✓）。

**机械随正（父侧代做——跨批闸只放父侧）**：A 版本断言 15⇒16（14 件 + probe 段 v16⇒v17）+ B 门禁件数 56⇒57（7 件）+ C `deriveModels` 行形 +`reasoning: []`（3 件）+ D 旧腿六 id⇒五 id（1 件）= **25 处 / 21 件**，逐行照 §5 ④ 清单落（含标题/消息同源数随正）；实施自报的红面 **28 处 / 20 件全清** ⇒ 全链转绿。

**AC-42 五条核**：① 源在册 —— `GET providers` 行携 `modelReasoning` 稀疏图 + `deriveModels` 行携 `reasoning`（链内断言 ✓；实走佐证 A 见下）∥ ② 选择生效 —— `PATCH { reasoning }` ⇒ 落库 + 装配携 `reasoningEffort`（链内 N71 ✓；实走 ① ✓）∥ ③ 界面可用 —— 钮解隐藏 ⇒ 选中即改 ⇒ 切会话各自记住（实走 ①② ✓）∥ ④ 默认静默 —— 未设 ⇒ 出口零 `reasoningEffort` 字段、换模型清 NULL（链内 B69 ✓ + 实走 ③ ✓）∥ ⑤ 状态行段不做 —— `statusSegments` 零改（既有腿 ✓）。

**设计档收正（父侧直接执行 · 机械 · 可 revert）**：四档行账实读回填（`API.md` 桥件 45 ⇒ **88** ∥ `ADMIN-AGENT.md` `chat.mjs` **599** / `chat-routes.mjs` **190** ∥ `CHAT.md` `views-chat.mjs` **500**（恰贴软线）∥ `PROJECT.md` 服务端 **+172** / webui **+28**）+ `ADMIN-AGENT.md` §13 R61① 枚举实盘收正（11 件 ⇒ **20 件**）+ 四档变更记录行。提交 `fc7d2c08`（双推）。

**部署**：`.5` 快进 ⇒ 镜像重建 **`a1c7540946f1`**（回滚锚 = `prebuilt` tag `pre-2026-10-12`）⇒ 容器重起 **Up (healthy)** ⇒ healthz 200 ✓。

**浏览器实走（`.5` · 三径 + 两佐证）**：
- **① 选档**：会话 2 选「高」⇒ 落库 `high` + 钮面「高」（active）✓
- **② 切会话**：切到会话 1 ⇒ 钮「—」（`null`）∥ 切回会话 2 ⇒ 「高」+ API 同读 `high` ✓（各自记住）
- **③ 换模型**：会话 1 选「低」（落库 `low`）⇒ 换模型 `qwen/qwen3.8-max` ⇒ 落库 **`null`** + 钮回「—」✓（换模型清档）
- **佐证 A（值域按模型各自枚举 · 实盘立证）**：qwen3.7-flash 档位面 = 关闭/最小/低/中/高/很高（**六档**）∥ deepseek-flash = 低/高/最大（**三档**）——两枚举不同 ⇒ 核件单源成立 ✓
- **佐证 B（解隐藏）**：`#reasoning-btn` 在视口内可点 ✓；五枚无源钮（auto/advisor/eng/plan/settings）仍收窄 ✓
- **佐证 C（核在场）**：生产镜像档位面有真档 ⇒ 实盘反证「缺核退中性」为开发机专有（R61② 披露 ✓）

**偏离登记（设计 ⇒ 实盘）**：① 随正件 **11 ⇒ 20 件**（+9 件：六件全链才暴露 + 前报三件）——设计档侧已收正（上列）∥ ② `views-chat.mjs` **500** 恰贴软线（零余量；拆档预案在案）∥ ③ 桥件 **45 ⇒ 88**（懒载缓存 + 注入缝 + 三消费面 + 别名反解——同量级判据成立）∥ ④ `db.mjs` v14 段注句随 v16 括注（行数零变、SQL 零动——自报已披露）∥ ⑤ 门禁链 56 ⇒ 57（§5 自报）。

**挂账（当日入册）**：台账 **#1312**（`views-chat.mjs` `onSelectModel` 回执缺会话卫——B70 同类竞态 · 既有面；归批）∥ **#1313**（行数软线面：views-chat 500 贴线 ∥ chat.mjs 599；拆档预案在案；归批）。

**未验边界（如实）**：真模型回合内的 `reasoning_effort` 载荷 = 未跑真发（链内 = 装配断言 ✓）；设计档 R61② 的「路由形模型名静默不发」= 核策略单源（本批零改——未另验）。

**结算**：§6 落定 ⇒ §1 收口冻结 + 台账 #1303 核销（待核销 ⇒ 已核销）+ design 槽消费（链终态）。
