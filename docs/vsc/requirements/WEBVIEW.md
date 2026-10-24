# WEBVIEW（webview 界面面）— 需求 · VSC 部分

> 部分 = **vsc**（`docs/vsc/`）；板块 = **webview 界面面**——本部分 UI 面（面板主界面：对话流 / 活动区 / 工具卡 / 输入面 / 状态面）。
> 对端 UI 面 = 终端 TUI（**异名对位**）——两端形态不镜像（端差逐条登记见 §4）。
> **设计侧 = 同层三档**——`design/WEBVIEW.md`（结构与活动区 · 块头形态）· `design/WEBVIEW-PROTOCOL.md`（消息协议 · 秩序/忙态 · 状态行）· `design/WEBVIEW-INPUT.md`（输入面 · 消息渲染契约）。
> 本档**不重述**的权威源（D2）：webview 族节（行内转义 / 活动区回归 / live 块 UX / 活动区收口）= `AGENT-LOOP（VSC 侧·需求）` §10 / §12 / §14 / §16；完整输出落盘 = `TOOL-OUTPUT-LIMITS（VSC 侧）`。

## 1. 总体需求

VSC 面板使用者在 webview 主界面完成全部交互：对话流、子代理活动、工具执行与历史回读必须**可见、可滚动、可回读**——
流式输出看着像活的（跟尾）、上滚阅读不被打断、历史能翻到底。
webview 只做 UI 渲染与用户交互；agent 循环与工具执行在 extension host（职责边界 = UI 适配层，经 `postMessage` 单向通信——`design/WEBVIEW.md` §1）。

## 2. 功能性需求

| # | 需求 | 判定句（验收语义） | 范围边界（不做） |
|---|---|---|---|
| F-W1 | **布局与活动区驻留**：垂直序 = 会话栏 → 消息区 → 活动区（子代理 / consult / advisor-async 活动块）→ 面板区 → 输入区；活动块**全程驻留**（live 固定可见，不随消息流滚动丢失）；终态消化回收后**归档落流**（消息区，形态不变）；**恢复后存续**：消化痕 ∥ 已归档块经**记录条目**（`digest` ∥ `subagent`——core `SESSION.md` §4.4 F-S7）在**面板重开 ∥ reload 后重建存续**（归档块 = 原形态原位；痕 = 按记录位次复列）。证据 = `design/WEBVIEW.md` §2 / §5（§5.7 = 写缝 ∥ 重建径）· `thincoder-vscode/webview/activity.js` · `thincoder-vscode/webview/activity-view.js` | 活动区为空 → 零高隐藏（CSS `:empty`，零 JS）；live 块在区内固定可见（消息区滚动不影响）；回收后块以同形落 `#messages`（归档块）；区居民 = live + awaitingDigest（有界）。 | 不改块头字段语义（字段表 = `design/WEBVIEW-PROTOCOL.md` §6.2）；不做浮动 / 弹窗形态；不复活旧 DOM-move 链（设计 = `design/WEBVIEW.md` §6 D-W4） |
| F-W2 | **流式跟随与滚动**：消息区默认钉底（流式跟随尾部）；上滚解钉（阅读历史不被打断）；回底复钉；悬浮回底钮；活动区块内容区独立跟滚；**活动区块停跟态可见出路**（↓ 新内容 ∕ 回到最新——可滚 ∧ 停跟 ⇒ 钮在场）。证据 = 核 `thincoder-render-core/scroll.mjs:18`（`NEAR_BOTTOM_PX`）∥ `:33-39`（`applyPin`）∥ `:78-126`（`createPinWatch`）+ 端 `thincoder-vscode/webview/ui.js:206-249`（四帧调用点） · `thincoder-vscode/webview/scroll.js:13-33` · `thincoder-vscode/webview/activity.js:65-69`（接线）+ 核 `thincoder-render-core/subblocks/block.mjs:91-103` ∥ `:105-114` · `thincoder-vscode/webview/streaming.js:27-65` | 钉底态下流式帧到达 → 视口保持贴底；上滚（距底 ≥24px——近底判据同源）→ 解钉（帧应用不再拉底）；回底 / 点回底钮 → 复钉；两层独立（消息区 / 活动区互不拉扯）；活动区块内容区停跟 ⇒ 出路钮在场、点击 ⇒ 回底 + 复跟 | 不做 `scrolled N` 状态串（端差——回底钮替代，本档 §4）；不逐 chunk 强制同步布局（见 §3 N-W3） |
| F-W3 | **历史懒加载**：打开会话只加载首窗（分页 200）；滚动近顶自动拉更早页；prepend 后视口锚定保持（正在读的行不跳）；无更早页不再请求。证据 = `thincoder-vscode/webview/history.js:49-91` · `thincoder-vscode/webview/state.js:63/94` · `thincoder-vscode/webview/ui.js:231-239` · 核 `thincoder-core/history-window.mjs:29`（`HISTORY_PAGE_SIZE` 单源；VSC 端转口 = `thincoder-vscode/src/extension/history-window.mjs:12`） | 首渲 = 200 条 + `hasOlder` 真值（`HISTORY_PAGE_SIZE === 200` 断言）；`scrollTop ≤ 40` → 发 `loadOlder`（before 锚 = 已渲染外层消息的最早 `data-idx`）；prepend 后 `scrollTop = 原值 + scrollHeight 增量`（视口顶保持）；`hasOlder=false` → 零请求。现行验收 = 场景级面 | 不做计数行「… N more …」（端差——加载指示器形态，本档 §4）；live 消息无 idx（永不污染窗口——锚只取外层消息） |
| F-W4 | **工具调用卡**：每次工具调用产出一张卡（头 = 工具名 + 参数摘要 + 状态词）；执行中输出**流式追加**进卡体（长命令可看）；完成 → 状态 + 耗时 + 末行摘要，成功折叠 / 错误展开；恢复会话的完成卡与活卡终态同形。证据 = `thincoder-vscode/webview/ui.js:137-167` · 核 `thincoder-render-core/flow/tool-card-restore.mjs`（端侧 `thincoder-vscode/webview/tool-card-restore.mjs` = 再导出 shim） · `thincoder-vscode/webview/chat-messages.js:67-78` · 核 `thincoder-render-core/lib.mjs:26-34` | `toolCall` → 卡（名 + args 前 80 字符 + 状态词）；`toolOutput` → 追加且卡展开（卡体超 64K 截断加注）；`toolResult` → 成功折叠（含耗时与末行摘要 ≤100）/ 错误保持展开；恢复卡折叠语义与活卡对齐。活卡面（`toolCall`/`toolOutput`/`toolResult` 接收）**现无专属用例**（缺口登记 = 本档 N-W5） | 卡体不保留全文（全文在会话记录——`TOOL-OUTPUT-LIMITS（VSC 侧）` 面）；不做 `│ ` 前缀行间区块形态（端差，本档 §4） |
| F-W5 | **输入面 Enter 语义**：Enter 发送；组合期（IME）Enter 归输入法；`@` 下拉打开时 Enter 只接受建议；运行中拒发可见提示；**忙态排队与满 8 拒收**：忙态提交 ⇒ 按会话键入队（容量 8——核单源常量）；满 8 ⇒ 拒发 + 提示（词键 `input.slotFull`）+ 文本保留；端门判据 = 宿主镜像计数如实直读（同 tick 空窗以宿主权威兜底）。证据 = 核 `thincoder-render-core/composer/panel.mjs:171-181`（Enter 三支：`:173` IME ∥ `:179` `@` 让位 ∥ `:180` `send()`）· 端壳 `thincoder-vscode/webview/input.js:68-77` ∥ `thincoder-vscode/webview/send.js:10-12` | 组合期 Enter → 零发送（不 preventDefault）；`@` 下拉打开 → Enter 归 autocomplete；busy 发送 → 拒发 + 可见提示；其余 Enter → 发送 | 不改 send 出口守卫的**既有**支路（拒发门禁保持——只改按钮可见性，设计 = `design/WEBVIEW-PROTOCOL.md` §4.4）；**守卫含第三态 = 无工作区**（拒发 + 提示 ✗ 承用户裁定「b + 提示」✗ 设计 = `design/PROJECT-SWITCHER.md` §4.1 · `design/WEBVIEW-INPUT.md` C-B2-5） |
| F-W6 | **输入历史与多行竖移**：↑↓ 判定五态（IME 组合期 → `@` 下拉让位 → 历史态恒历史 → 单行任意位置 → 多行边界门）；草稿 stash；不劫持原生竖移。证据 = 核 `thincoder-render-core/composer/panel.mjs:182-206`（五态判定）∥ `:231-250`（历史导航）（端侧 `thincoder-vscode/webview/input.js` = 装配壳） · `design/WEBVIEW-INPUT.md` §2 | 历史态（`_historyIdx ≠ -1`）↑↓ 恒历史（连续上溯与回落）；多行非边界位置零劫持（原生竖移保留）；边界门 = 首行行首 ↑ / 末行行末 ↓ 触发；草稿恢复 | 不引入列记忆状态；不跨出输入框（不滚动会话） |
| F-W7 | **忙态与消化轮可见指示**：忙态收敛（turnState）；停止钮常显；消化轮起跑可见（`.digest-status` 三态）；状态行段位（工具 / 耗时 / `turn N/M` / ✦reasoning / token——对位表 = `design/WEBVIEW-PROTOCOL.md` §6.1）。证据 = `thincoder-vscode/webview/chat-status.js:126-161`（`showDigestStatus`；五构形件 `:78-124`） · 忙态收敛 `thincoder-vscode/webview/panels.js:115` ∥ `webview/chat-messages.js:102` · 停止钮 = 核 `thincoder-render-core/composer/panel.mjs:437` · `thincoder-vscode/webview/status-bar.js` · `design/WEBVIEW-PROTOCOL.md` §5 | digest 起跑 / 收尾两态渲染幂等（ok 旗标时序）；Stop 期间常显；状态行对位表逐项落位；端差项（ctx 绝对数 / `scrolled N` / attention chip / 键位提示）保持登记态（本档 §4） | 不做 attention chip（端差登记）；不做 `scrolled N`；不改发送门禁 |

| F-W8 | **设置面快照打开必达**：打开设置页（`openSettings` / `initSettings`）时，除 agentSettings / providerStatus / mcpStatus / models 外，全部已配快照——**proxySettings · websearchSettings · indexStatus**——必须在该拍到达（推送或拉取）；不得等「保存某设置 / 跑一回合 / 外部改 config」才补。证据 = 消费面 = `settings-env.js:192-195` ∥ `settings-tools.js:150-153` ∥ `:155-158`；打开拍 = `webview/settings.js:127-143` ∥ `:148-157` ∥ `:185-199`；宿主 = `panel-messages-settings.mjs:193-196`〔序契约注 `:185-188`〕 | 新窗口 / Reload 后**直接**打开设置页 ⇒ 三个快照到达且渲染真值（已配置项不回显为空 / 不假阴性）；拟新增 `settings-open-snapshots.test.mjs`（**修复前必红**） | 不改「build 只在 openSettings 调用」既有语义（SETTINGS-REORG P3）；不新增协议形态（沿用既有 type 与 `_pushSettings` / `_pushSettingsLight`） |
| F-W9 | **控件级回填（收到即刷活控件，不重建整卡）**：四处「只存 SS」面必须回填活控件——三处消费函数 `settings-env.js:186-190`（`updateShellCandidates`）· `:192-195`（`updateProxySettings`）· `settings-tools.js:150-153`（`updateWebsearchSettings`）+ **一处扩面** `updateIndexStatus`（`settings-tools.js:155-158`——`renderIndexStatus` 同拍重绘 `#row-embed`——**D-W5 已落**）；对照正例 = `settings-providers.js:179-192`（`updateProviderStatus` → 同拍 `renderProvidersCard`） / `settings-tools.js:191-212`。**另登记不修**：`updateAgentSettings`（`settings-agent.js:194-196`）同属「只存 SS」——其回填缺口随 P2-3 同族处置（消解路径 = 差异提交 / 到期 = agent 卡下次触碰） | 面板打开时触发 light/full 推送 ⇒ 控件显示新值；随后改动任一控件 ⇒ 发回值 = 屏幕新值（旧值回写零发生）；拟新增 `settings-refill.test.mjs` | 不恢复整卡重建（丢半填输入——P2-6 登记）；不改推送时机（只补回填与打开到达） |
| F-W10 | **空值不得静默清除既有配置**：change-to-save 只在**用户实际编辑过**该控件后发值——「快照未达 / 从未编辑」的控件不得以默认或空渲染值回写；「URI 清空 = 清除代理」语义保留，但必须由**显式用户动作**触发。证据 = `settings-env.js:112-114`（改动门——`_pxBaseline` 比对）+ `thincoder-vscode/src/extension/settings.mjs:250-259`（`:253` 空 uri ⇒ `delete raw.proxy`） | ① 快照未达时 blur/Enter 任一代理控件 ⇒ **零写盘**（`config.json` 逐字不变）；② 显式清空 ⇒ 才删除；③ 每条「空 / null ⇒ delete」路径逐条列册 + 判据（proxy 整块 · agent 卡 `null` · poolLimits 逐键 · 元素缺席形态 = P2-4）；拟新增 `settings-empty-no-write.test.mjs`（**修复前必红**） | 不改 extension 侧删除语义（设计档明载）；不改单击即删（设计意图——文末登记） |
| F-W11 | **Shell 控件接线或移除（已接线）**：`#sh-select` / `#sh-custom`（`settings-env.js:60-63` 渲染 ∥ `:76-77` 基线）——**已落**：change 绑定 `:90-91` ∥ 发值 `:121-131`／`:135-146`；extension 侧 `saveShellSettings`（`panel-messages.mjs:375` ∥ `panel-messages-settings.mjs:227-231` ∥ `settings-panel-write.mjs:179-186`）已接线 | 选择 / 输入 shell ⇒ 写盘 + 回填；或 webview 全树 `grep sh-select` 零命中且 `saveShellSettings` 已按 F-W12 处置 | 不改 `config.shell` 语义与既有校验（`config-io` 面） |
| F-W12 | **收发面对表零未处置（新清算）**：新增 **4 个**反向死 handler（`panel-messages.mjs:320` `settings` · `:322` `saveCustomProvider` · `:372` `saveEmbeddingConfig` · `:460` `saveShellSettings`）+ 1 个无消费者推送（`panel-mcp.mjs:137` `mcpReconnected`）逐条处置（删 / 补消费者 / 登记）——口径同 N-W7。**（已处置：三 case 真退场（`settings` ∕ `saveCustomProvider` ∕ `saveEmbeddingConfig` 全树零命中）∥ `saveShellSettings` **已接线**（`panel-messages.mjs:375` + `panel-messages-settings.mjs:227-231`）；`mcpReconnected` 已删（`panel-mcp.mjs:137` 留痕注释）；§13 表登记面已核：表齐）** | 逐条进 `design/WEBVIEW-PROTOCOL.md` §13 表（**父侧裁定：§13 独立节——避免改红既有 §12 协议机检 + `userMessage` 双同名**）；删除项按**实质**零残留（`grep` 命中按实质判——**留痕注释 / 同族同名不计**）；结构机检零未处置 | 不新增协议语义；`settings` case 若为备用入口 ⇒ 登记（不删）并写明触发条件 |

| F-W17 | **密钥 / 令牌类删除须二次确认（用户裁定「最好确认一下」）**：界面上密钥/令牌只显 `****` ⇒ 删除**不可逆**（原文不可复得，只能回服务商重取）——不满足既有 P5「可逆才单击即删」的前提。**实测入口册**：live 密钥类 **2** = `settings-tools.js:103` 渲染 × `:125` 动作 × `:147` 绑定（websearch ✕）· `:116` 渲染 × `:129` 动作 × `:147` 绑定（嵌入 ✕）；死 handler **1** = `settings-providers.js` `_delKey`（零 UI 调用 ⇒ 一并过门；**已清**）；**provider 行 ✕ = 须确认类**（用户裁定 A——删行连带删其 `apiKey` 原文 ⇒ 不可复得；载体 `settings-providers.js:137`（卡 HTML **`data-name` 承载**）+ `:157-166`（卡级装配位绑定）+ `:22-23`（取消重建位）· 动作 `:50-52` · 消息 `removeProvider`）；**MCP server 行 ✕ = 须确认类**（用户改判——载体 `settings-tools.js:190` 生成 / `:194-200` 绑定）；**模型菜单 footer「Remove provider」= 须确认类（入口册 #6/6）**（载体实件 = 核 `thincoder-render-core/composer/model-menu.mjs:307-313`（footer 项 `:309` 直发 `removeProvider`——无 name ⇒ 宿 QuickPick 选）；与 settings 面同判据）；**MCP token/headers 无删除钮**（唯一路径 = 表单清空保存 `config-mcp.mjs:53-61` ⇒ 维持登记）；掩码位 = `settings-tools.js:100` / `:113`。**判据句**：所有**密钥 / 令牌 / 凭证类**删除入口（**以上述实测册为准，不以枚举字面为准**——新增入口 fail-closed 入册）⇒ 点击后**必须有一次显式确认**；**所有删除入口**（密钥 / 令牌 / MCP 行 / provider 行 / 模型菜单入口）均须过一次显式确认——「单击即删」类**已空域**（用户裁定 A；provider 行与模型菜单入口均因删除后 `apiKey` 原文不可复得而同类） | 点击密钥类 ✕ ⇒ 出现确认（形式由设计裁：行内二次点击 / 弹确认框），确认后才发删除消息；取消 ⇒ 零发值。非密钥类入口**亦全入确认门** | 不改宿主删除语义（§2.8 路径册）；**不新增「撤销机制」**（用户口径：属加机器，不取）；i18n 双语文案在册 |
| F-W18 | **面板初始化零同步阻塞（用户裁定「修吧」）**：面板初始化推送链（`webviewReady` → `_pushStatus` / `_pushSettingsLight` / `openSessionContent`，含 `getAgentSettings` 打开拍）路径上不得有同步子进程冻结事件循环——第一实害点 = `shellCandidates()` 的 `spawnSync("where", …)` 三连（缓存每次宿主重启必冷；本机实测 0.51 / 0.48 / 0.81 s 每发）；会话认领链的探测形态面归核（= `MULTI-INSTANCE-COLLAB（核）` **F-MI7**）。证据 = 22:56 重载窗口：扩展宿主 14.4 s 日志静默（`exthost.log` 22:56:21.6→35.98），同期 10 渠道 `/models` 探针全数 15 s 超时 ⇒ 设置页全红；独立子进程采样同窗 100+ 轮网络全绿。坐标 = `thincoder-vscode/src/extension/settings.mjs:57`（薄壳 re-export——真身 = 核 `thincoder-core/shell-candidates.mjs:69-78` 候选 ∥ `:41-51` `commandExists`（异步））· `panel-messages-settings.mjs:223-224`（`handleGetShellCandidates` 现役）· `panel-messages.mjs:374`（分派）· `chat-panel.mjs:361` / `:362`（推送函数） | 初始化窗口（webview 创建 → 推送链完成）内宿主事件循环无可观测 ≥2 s 静默（机判 = exthost 日志静默窗 / 探针存活读数）；`shellCandidates` 路径零 `spawnSync` / `execSync`（代码机检——**已核销**：实件迁核并改异步）；shell 候选列表行为等价（既有用例全绿） | 不改推送协议与推送序契约（`SETTINGS.md` §2.8「序 = 契约」保持）；不改 shell 候选语义；不改 UI 版式 |
| F-W19 | **渠道探针失败不固化 + 可自愈（同裁）**：宿主繁忙窗口（初始化 / 重载）内的 `/models` 探针失败不得固化为行内「不可用」展示态——准入展示态（`thincoder-core/provider/list-models.mjs:122` `_admission` Map ∕ `:135` `recordAdmission`）现无自愈路径：一经 `recordAdmission` 写入即残留至下次重探（设置页开关只读快照、不重探），并把「宿主被冻」误报为「渠道不可用」。证据 = 22:23 / 22:47 / 22:56 三轮重载窗口全部全红（`aborted due to timeout` ×10）+ 模型下拉退化为 fallback 面；同期独立采样网络全绿 | ① 网络正常 + 重载 ⇒ 设置页全绿（或短暂失败后自愈恢复）；② 初始化窗口内失败渠道在重探成功后可清除（重探触发 = 设计裁定：窗口内延迟重试 / 面板获焦重探 / 设置页再开重探——择一或并，须给判据）；③ 失败原因可区分（探针超时 / 体坏 / 宿主忙——展示面可分辨） | 不改 15 s 探针预算与 M9 准入语义；不改「失败不缓存」既有语义（本条 = 补自愈触发与窗口抑制）；不改 UI 版式 |

| F-W13 | **批权限卡必须可释放**：**已落（D-W15）**——`permission-gate.mjs:102-118` 批卡同携 `promptId`（`:114`，与逐项卡共用单调计数器）；Stop/Ctrl+I 经 `releasePermission` 同通道释放 + `permissionWithdrawn`（`:115-118`）；渲染侧 = `webview/permission.js:30-39`（`showBatchPermissionRequest`——三按钮载荷同携 `promptId`） | 同响应 ≥2 非只读工具（§16 D-B1 合并询问）⇒ 卡在屏 ⇒ Stop/Ctrl+I ⇒ **卡消失**（或转已拒绝态）；剩余按钮点击**零静默无效**（现盘 = `panel-messages-turn.mjs:201-213` id 精确匹配 + 孤儿 `permissionWithdrawn` 回写）；拟新增用例 | 不改合并询问语义（§16 D-B1）；不改逐项卡路径 |
| F-W14 | **回合中改模型须落盘（不得静默覆盖）**：`panel-messages.mjs:250` 立即写槽，而回合尾两处落盘（`panel-callbacks.mjs:238` · `:253`）掷回合起点 `slotStamp`（`panel-turn-stages.mjs:87-89`）⇒ `turn-model.mjs:19-26` stamp 优先 ⇒ **回合内选择被静默覆盖**；UI 仍显新值直到下次 `models` 推送才静默回退；下一回合仍按 echo 跑（`turn-model.mjs:22` 试运行 = 能跑不粘）；模型/推理按钮**零忙态门** | 触发：`_turnState==="running"`（含 digest/susp）时点模型/推理按钮 ⇒ **无静默覆盖**（选择持久，或按钮显式忙态禁用——二选一） | **与在飞配置页批同域（`panel-messages.mjs`）⇒ 须其让位后实施**；不改 `turn-model.mjs` 试运行语义；不改槽原语 |
| F-W15 | **`@file` 展开不得污染人读线（口径已裁 = A · 已落）**：`panel-chat.mjs:187 injectAtRefs` 的展开文本（`thincoder-core/file-refs.mjs:30-68`）随 `pushReal` **同进人读线** ⇒ 恢复回读（`thincoder-core/history-window.mjs:141` 原样透传）显示**文件正文**，与活面 `@路径` 不一致；人读线 = CLI 共文件 | 发含 `@路径` 的消息 ⇒ Reload / 切回 ⇒ 恢复面与活面同形；**口径先裁 = A：恢复剥离展开**——已落（VSC 同址剥离 + 桌面 `thincoder-desktop/src/main/session-slots.mjs:203` 随缺面族批并入剥离侧 ∥ CLI = N-W6 登记端差） | 不改 `injectAtRefs` 展开本体（模型输入语义）；不改人读线存储本体 |
| F-W16 | **工具非零退出可见性（CLI 对位）**：`thincoder-core/tools/bash.mjs:224-226` 失败结果非 `Error:` 前缀 ⇒ 判据单源 = `thincoder-render-core/lib.mjs:113` `isToolFailure`（活卡 `thincoder-render-core/flow/tool-card.mjs:106` ∕ 恢复卡 `thincoder-render-core/flow/tool-card-restore.mjs:29` 同读）；摘要 = `thincoder-render-core/tool-summary.mjs:31-85`（`BASH_MARKER` `:32`）；**CLI 对位**（`thincoder-cli/src/tui/tool-summaries.mjs:60-68`）把退出状态拼进摘要；**spawn 失败（无退出码）同族入册**；产者两处 = 核 `thincoder-core/tools/bash.mjs:187-191` · 宿主 `thincoder-vscode/src/tools/shell.mjs:242-281` | 非零退出 ⇒ 可见面有失败信号（卡色 / 展开 / 摘要含退出码——至少一）；与 CLI 口径一致或按端差登记（二选一） | 不改核 `thincoder-core/agent/dispatch-run.mjs:85` 的 `ok:true` 上游语义（设计意图 I-8）；卡色判据可另定（§16） |
| F-W20 | **首启板增「登录团队服务器」入口（三端同批）**：首启板（`webview/onboarding.js`）提供两路——① 本地配置 provider（现路径；`addProvider` 交棒位 `:63`）；② **登录团队服务器**（地址 ∥ 账号 ∥ 密码 ⇒ 登录成即用——模型面由 server 派生，免自配；能力单源 = `docs/server/requirements/PROJECT.md` AC-31） | 首启板含该选项；登录成 ⇒ 直接可用（零 provider 手配）；失败 ⇒ 就地出原因（四句逐字沿用 B1）并可改选本地路 | 不改 `addProvider` 交棒语义 ∥ 不改设置面团队卡（B1 已落）；不做免密 / SSO |
| F-W21 | **登录态常显 + 直达登/退（三端同批）**：本端主界面常显团队登录态（**已登录** ⇒ 成员 + 服务器；落点候选 = 面板头 ∥ 状态栏 item（台账 item 为同族先例）——**设计轮定**），**且登/退 = 主界面直达**（用户裁：不得要求先钻设置；形随设计轮——状态位点击/命令面板项两候选） | 已登录 ⇒ 常显面可见成员与服务器；未登录 ⇒ 零注入或直达登入口（设计轮定）；**登/退不经设置面完成** | 设置面第 6 卡降为**管理面**（label ∥ 详情；**轮换 = 已落**——管理面就地动作，服务端 `POST /api/client/rotate`；零客户端专用页）；不做团队面板（状态 = 本行）；与设置面卡不重复呈现 |
| F-W22 | **忙态排队面 = 输入区上方待发送带（非流内 · 对齐桌面端）**：忙态提交的排队项**不得**在会话流内先出气泡；队列可见面 = 输入区上沿一条待发送带（标签行单条 ∥ 多条；逐条原文 ≤3 行 + 超限尾标记；数据源 = 宿主 `busyQueued` 快照 `items` / `count`）；**消费前流内零块**——消费时刻（步边界 / 回合尾 / 卸载直发 / 窗内消费）= 带项退场 + 流内**恰一枚** user 块（单条 = 原文；多条 = 合并文本）。对位 = `docs/desktop/design/COMPOSER.md` KD-31 ∥ KD-40 ②（用户 2026-10-20 12:03 裁定「这是缺陷，要对齐桌面端」）。 | ① 忙态提交后 DOM：流内 user 气泡数不变（`data-blocks` 零新增）；待发送带条数 = 队列条数。② 消费后：带项归零 + 流内恰新增一枚 user 块（合并批 = 合并文本）。③ 带面贴输入区上沿（非流内、不进 `data-blocks`）；短会话不得浮在会话区上方。④ 满队（第 9 条）行为零变（不出泡 + toast + 文本保留）。⑤ 单条 ∕ 多条两形 + 逐条 ≤3 行 + 尾标记与桌面端同形。 | 不改队列机制本体（容量 8 / 合并常量 / 五个消费点 / 满队拒收 / 步边界 pickup）· 不改附件留队语义 · 不改 CLI 面 · 桌面端零改 · 不改会话流其余形态。 |
| F-W23 | **子代理块头状态词：think 不改写（对齐 CLI · 共用核件）**：think chunk 到达**不得改写**状态词——标题保留上一个结构化工具行（如 `advisor#1/read — src/x.mjs`）；**无前置工具**时状态区 = 裸 think 词（`思考中…`，读侧缺省支）。子代理身份**不进块头状态词**（父子两实体不同行——用户 2026-09-07 裁定「explore#1/ 这样的字样」+ 2026-10-21 10:41「做错了就要改」）。 | ① 工具行后接 think chunk ⇒ 状态词**零改写**（仍 = 上一工具行，子串机判）；② 无前置工具的 think chunk ⇒ 状态词字段**零写入**、头行 = 裸 think 词；③ 结构化工具行支零变（`<sub>/<tool> — <cmd ≤60>`）∥ `toolOutput` 与旧载荷零改写；④ 桌面 + VSC 同源生效（共用 `thincoder-render-core/subblocks/activity-view.mjs`），CLI 零改。 | 不改块头括号段 · 不改正文默认展开 · 不改 CLI · 不改状态词固定三态（审批 ∥ 待消化 ∥ 排队）优先级 · 不改工具行支形态 · 不做嵌套子代理的块体外置（另议）。 |



**异步任务可见性（VSC 面板 live 块出生可靠性 · 编号承旧档）**

> **复发实据（2026-09-18 23:1x）**：异步 `eng-designer` 跑 20 分钟面板 live 区零块（用户实见；调度层正常 ⇒ 丢失在投递 / 呈现链）。

| # | 需求 | 说明 | 范围边界（不做） |
|---|---|---|---|
| F-A1 | 出生必达（自愈） | 任何后台任务在面板上必然出现其 live 块——扩展侧投递链对「webview 未就绪窗口」的消息零丢失（队列入链），webview 就绪 / 清屏后以**状态再断言**（存活任务逐条重发出生事件）自愈 | 不做**未归档**（live ∥ 在飞）块的跨 reload 恢复；**已归档块经记录重建存续**（F-W1）；不做存量历史回填 |
| F-A2 | 终态必现 | 任何后台任务的终态（done/settled/error/cancelled/terminated/failed）必然呈现在其块上：块缺失时先补块再折叠（never-born 终态防御），不得静默 no-op | 不建重复块（同身份幂等）；不复活已折叠块；answered 例外：无块 no-op（回复走 digest 呈现） |
| F-A3 | 块身份唯一 | 同一 webview 生命周期内块身份键与任务实例一一对应：出生事件遇**已冻结的同名条目**必须建立新一代块（接管键），不得让新任务永久不可见；重名发生必须可留痕 | 不改频道命名法（`sub:<role>#<id>`）；不引入 id 之外的实例序号 |
| F-A4 | 控制面不降级 | 任何「重建 / 补发」路径产生的块必须保留完整控制面与首见元数据：⏹ 取消（`pool:true` 语义）、async/sync 标记、model、startedAt | 不改 ⏹ 的可见性判据（`running +（pool 或 syncLive）+ family` 角色；`syncLive` 产者侧序缺陷在册） |
| F-A5 | 清屏可恢复 | 会话清屏（`clearMessages`——boot / loadSession 必经）后仍存活的后台任务必须重新出现为 live 块，且满足 F-A4 | 不重推已消化历史块——**已归档块经记录重建存续**（非重推；F-W1） |

| # | 维度 | 标准 | 度量方式 |
|---|---|---|---|
| NFR-A1 | 零回归 | live→frozen 两态机 / 冻结幂等守卫 / 150 窗裁剪 / tombstone 丢弃语义零变化；不重做池快照重推 | 既有 `activity-flow` / `webview-turnstate` / `chat-panel` 测试全绿 |
| NFR-A2 | 可诊断 | 每一次「出生事件被守卫丢弃 / 同名接管 / 补块」留一条可断言痕迹（webview 侧结构化日志 + 主侧投递日志）——复发可凭痕迹定位，不再不可诊断 | 用例断言痕迹发生；`grep` 断言痕迹调用点在位 |
| NFR-A3 | 可机器验证 | 每条验收由 happy-dom 驱动**真 webview 模块**或桩面板驱动**真 extension 模块**机判 | 新增用例全绿 + 反例（修前红）可复现 |

**明确不做**：不改 CLI TUI 块机制**本体**（CLI 无 webview；记录承接 = 增量）；不改核侧发射面（E1 已证无缺陷）；不做「已 settle 且已 digest」任务的**重推式**回填——**已归档块经记录条目重建存续**（F-W1）。

**会话界面审计登记（不修——消解路径 + 到期条件在册）**

- **P2-1** `ctx.activeSession` 死写（`chat-messages.js:136` 写 / 全树零读）⇒ 消解 = 下次触碰该档时清；到期 = 相应档下次修改。
- **P2-3** idle 状态行残留 `turn N/M`（`streaming.js:118` `finish()` 只清 `_turnStart`（`:149`）；`_turnFrame` 清点 = `chat-messages.js:125` ∕ 置点 `:205`）⇒ 消解 = `finish()` 同清；到期 = 状态行面下次触碰。
- **P2-4** `@` 下拉 Escape 后迟到结果重开（核 `thincoder-render-core/composer/atmenu.mjs:62-64` 自行 `display:block` + `_atActive=true`——另 `:139` 一处）⇒ 消解 = 请求失效标记；到期 = autocomplete 面下次触碰。
- **P2-5** 恢复路径嵌套工具卡缺 `→ 摘要` 表头段（`thincoder-render-core/flow/tool-card-restore.mjs:39-43` vs 活卡 `thincoder-render-core/flow/tool-card.mjs:95`（`finishToolCard`））⇒ 登记（F-W4 只约束折叠语义）。
- **P2-6** 裁剪窗不含 `.digest-*` / `.error-banner` / `#compress-status`（`ui.js:231-239`）⇒ 消解 = 扩裁剪族；到期 = N-W2 面下次触碰。
- **P2-7** 索引进度 statusText 无失败清除路径（三相位投递 = `panel-index.mjs:174-184`（含 `done` 支）；弹窗不补发 `done`）⇒ 消解 = 失败补发清除；到期 = 索引面下次触碰。
- **P2-8** webview 重载撞在飞回合（`panel-session.mjs:124` 置 `_agent=null` + `:133-136` abort 蒸馏）⇒ 登记（跨 reload 恢复 = 既定不做 I-7）。

**设计意图（勿误修）**：I-1 Send running 隐藏 / Stop 只显 running · I-2 会话族忙态拒收（warning 明示）· I-3 `_chat` 释放窗拒收（AC-S2）· I-4 digest 每轮独立元素（D-P7）· I-5 恢复卡 pretty JSON args 块
· I-6 归档块随消息窗出入（§14 T-CL9）· I-7 **未归档**（live ∕ 在飞）子代理块不做跨 reload 恢复——**已归档块经记录重建存续** · I-8 非零退出上游 `ok:true`（`thincoder-core/agent/dispatch-run.mjs:85`）· I-9 单击即删 / 空值清代理（属配置页面）· I-10 台账行 / 压缩行落流不落状态区。

**登记（不修——消解路径 + 到期条件在册）**

- **P2-3 默认值物化**：`settings-agent.js:16-23` / `:66-67` / `:78-130` 用硬编码回退渲染且一次提交全部字段 ⇒ 首次改动即把默认值钉进 `config.json`（与核 `DEFAULTS` 现同值，故今天无行为差）。**已消（已落——差异提交（只发被编辑字段））**。
- **P2-4 元素缺席 ≡ 显式清空**：`settings-agent.js:128-129`（`|| null`）+ `settings-panel-write.mjs:155-158`（显式 null ⇒ delete）⇒ 改动 agent 卡任一控件会删掉手写 `agent.advisor.effort`。消解路径 = 缺席字段发 `undefined`。
  **advisor-effort 半（已消）** = select 未渲染 ⇒ 不发字段（已落）；余项（advisor `provider` / `model` 等字段）在册。
  **裁定（主 agent）**：`advisor.provider` ∕ `advisor.model` **缺席 ⇒ 保持现值（不改动）**——缺席不得解释为清空；消解 = 面板写面缺席字段不发；到期 = 面板写面下次触碰（`settings-panel-write.mjs` 族）。
- **P2-5 保存面零校验（已处置）**：`thincoder-vscode/src/extension/settings.mjs:241-248`——`:246-247` 缺 scheme ∥ 非 http(s) 各一拒（零写盘）。**已落**。
- **P2-6 providers 卡重建清空半填表单（已处置）**：`settings-providers.js:170-171`（处置注——添加表单迁出本卡（弹窗挂 body）⇒ 卡重建不再触碰在编输入）。**已处置**。
- **P2-7 面板关闭时 `providerError` 不可见**：`chat-messages.js:156-158`（`providerError`）→ `settings.js:91-125`（单槽：`_lastFailure` `:93` ∕ `showSettingsError` `:122-125`） ⇒ 配置写入失败在 UI 无痕。**已结清（已落——单槽待显）**。

**明属设计意图（勿误修）**：单击即删（`webview/settings.js:48-50`——**限可重填类**；不可复得类按 F-W17 过一次显式确认）· 「URI 清空 = 清除代理」（设计明载——VSC 归档档 `SETTINGS-PANEL-2`）· 面板推送不重建卡（SETTINGS-REORG P3）。

**语义边界**：上述清单的用途 = **防止把 A 改坏去修 B**，**不得用于驳回用户报的症状**——**登记现状 ≠ 冻结决定**（用户「怎么会按设计意图不修」）。

**已结清（用户裁定 → F-W17）**：key / token 在 UI 中只显 `****` ⇒ 删除后原文不可复得 ⇒ **入确认门**（详见 §2 F-W17）——本项不再待裁。

## 3. 非功能性需求

| # | 维度 | 标准 | 度量方式 |
|---|---|---|---|
| N-W1 | 零依赖零构建 | webview 侧纯浏览器标准 API——无 npm 运行时依赖、无打包器（约束面 = `design/WEBVIEW.md` 头注） | `package.json` 零运行时依赖 + `npm run lint` 全绿；webview 目录零构建产物 |
| N-W2 | DOM / 内存有界 | 消息窗上限 150 块（含归档块——`thincoder-vscode/webview/ui.js:231-239`）；卡体上限 64K（核 `thincoder-render-core/lib.mjs:26-34`）；离屏消息 / 工具卡跳过 layout/paint（`thincoder-vscode/webview/chat.css:474-475`）；活动区居民有界（live + awaitingDigest——设计 = `design/WEBVIEW.md` §5.1） | 常量在位（逐处源码锚）；长会话回归：裁剪后 `data-idx` 锚可将历史拉回 |
| N-W3 | 流式渲染性能 | 帧应用走 rAF 脏集路径——不逐 chunk 强制同步布局（`thincoder-vscode/webview/ui.js:207` ∥ `:209` 抄「写超值不读 scrollHeight」——单源 = 核 `thincoder-render-core/scroll.mjs:33-39`；`thincoder-vscode/webview/streaming.js:27` 注释） | 源码锚 + `thincoder-vscode/test/activity-live-ux.test.mjs`（帧应用不丢 / 节流重排） |
| N-W4 | 分页与恢复对位 | `HISTORY_PAGE_SIZE === 200`（核 `thincoder-core/history-window.mjs:29`——跨端首窗对齐；VSC 端转口档 `thincoder-vscode/src/extension/history-window.mjs:12`）；恢复保真（帧序 / 工具卡 / 时间戳形态） | 常量断言 = `history-window`；`history-restore` 全绿 |
| N-W5 | 可机判 | 每条功能需求有既有用例（活动族 / 输入族 / 历史族 / 状态族）；**登记在案的例外 1 条**：F-W4 活卡面现无专属用例——**消解路径** = 活卡面（`toolCall`/`toolOutput`/`toolResult` 接收）补测；**到期条件** = WEBVIEW 面下次被触碰时 / 收口前（依据 = `ENGINEERING-MODE（VSC 侧·需求）` §1.3 F14 第三子条）；测试文件登记入 `thincoder-vscode/test/files.mjs`（清单制） | `node test/run.mjs` 全绿（单入口）+ 档名在册；登记在案的例外 1 条（消解路径 + 到期条件在位） |
| N-W6 | 端差显式 | 各端独立实现、语义同源；端差逐条登记（本档 §4），不静默（同规 = `AGENT-LOOP（VSC 侧·需求）` §16 N-CL4） | §4 表逐行在位；无未登记放行通道（`ENGINEERING-MODE（VSC 侧·需求）` §1.3 F14） |
| N-W7 | 收发面对表零未处置 | host → webview 全部**顶级**消息判别式（`type` / `name`）逐条登记：发射点 `file:line` / 分发或消费位 `file:line` / 处置（`活`·`删`·`补`）——**无未处置项**；无生产者族（死码）当批删除且零悬空引用；`补` 行（host 缺发射）登记 + 转技术待办（带消解期），不新增协议语义 | 表在 `design/WEBVIEW-PROTOCOL.md` §12；结构机检 = `thincoder-vscode/test/protocol-coverage.test.mjs`（已落）；被删标识符全树 `grep` 零命中；`npm test` 绿 |

| N-W8 | 配置面防数据丢失可机判 | 三条**先红后绿**用例在案且修复前必红：① 打开路径快照到达（F-W8）② 未编辑控件的空值零写盘（F-W10）③ 推送后旧值不回写（F-W9）。既有 `test/smoke-settings.mjs:70-78` 在 `openSettings()` 前手工灌 SS 的手法 = 掩盖源 ⇒ **不得沿用**；`saveProxySettingsFromPanel` / `proxySettings` / `handleSetProviderProxy` 现零测试命中 ⇒ 补测并登记入 `thincoder-vscode/test/files.mjs` | 三条新用例 `node --test` 全绿（修复前必红）+ `npm test` 绿 + `files.mjs` 含新档 |

## 4. 对位与端差登记（对位 = `TUI（CLI 侧·需求）` + `TUI-TOOL-OUTPUT（CLI 侧·需求）`）

> 读法：逐行对位 CLI 需求行 → 本端对位 → 端差；「等价」= 语义同源且形态对位；端差 = 各端形态差异（登记不静默）。
> 端差判据以本端实测与 `design/WEBVIEW-PROTOCOL.md` §6.1 · §6.2 对位表为准；对端行号以其文档为准（本档不代述对端正文）。TTO = `TUI-TOOL-OUTPUT（CLI 侧·需求）`（下文行标简写）。
> **端差口径**：端差默认 = **消**（对齐）；保留例外的唯一凭据 = **宿主能力面证据 ∥ 行为证据**——逐条落行，不设类级判据（机制单源 = `design/WEBVIEW-PROTOCOL.md` §6.1 首句）。行结论词表 = **实证例外**（附证据）· **消（已落）** · **等价 ∕ 对齐 ∕ 采用**（无端差）· **非端差**（无对位物 ∕ 范围决定）。

| CLI 行（对位参照） | 本端对位 | 端差（登记） |
|---|---|---|
| TUI F1–F5（跟随 / 暂停 / 锚定补偿 / 恢复 / 滚动入口） | F-W2 | 入口 = 滚动容器 + 悬浮回底钮（对端 = PgUp/PgDn + 滚轮）；`scrolled N` 不做（钮替代）；锚定补偿面 = 历史 prepend（`thincoder-vscode/webview/history.js:73-77`）——追加不位移 DOM 视口——**实证例外（宿主 + 行为证据）**：滚动状态两端可见——CLI `scrolled N` 文本 ∥ 本端回底钮；锚定补偿 = 历史 prepend 不位移视口 |
| TUI F6（懒加载） | F-W3 | 触发 = 滚动近顶（`scrollTop ≤ 40`）；页大小 200（两端对齐——N-W4）；数据源 = 宿主会话记录（磁盘为准） |
| TUI F7（头部分页标记） | F-W3（加载指示器） | 本端 = `loadOlder` 加载指示（`thincoder-vscode/webview/history.js:29` `showLoadOlderIndicator`）+ `hasOlder` 门（`:97`）；无「N more」计数行——**实证例外（宿主证据）**：分页指示——CLI「N more」计数行 ∥ 本端加载指示器 + `hasOlder` 门 |
| TUI F8（子代理嵌套活动显示） | F-W1 | 块形态 = 活动区驻留 + 收口落流两态（设计 = `design/WEBVIEW.md` §5.1）；嵌套行随外层块（核 `thincoder-render-core/subblocks/block.mjs:52-58`（`renderSubagentChunk`）∥ `subblocks/relay.mjs:82-84`（内层 `⟦ev⟧`／`[model]` 剥除不路由））；不做嵌套独立小节——**实证例外（宿主证据）**：活动区承接——终端面板行 ∥ webview 活动区块 |
| TUI F9（picker 附注渲染） | 本端无全屏 picker——模型选择 = 下拉部件（`thincoder-vscode/webview/model-picker.js` / `model-menu.js`） | 形态端差：全屏列表 vs 下拉 / 面板；无 80 列渲染预算概念——**实证例外（宿主证据）**：选择面——全屏 picker ∥ 下拉部件 |
| TUI F10（选择面分工与契约） | question 卡（`thincoder-vscode/webview/question.js`）+ 模型下拉 + 设置对话框 | 各端组件面自持（不镜像）；交互契约差异登记于各端设计——**非端差（各端组件面自持——交互契约各自登记）** |
| TUI F11（输入框方向键编辑） | F-W6 | 语义同源（同款竖移规则——对端文档明载其口径引本端同款）；呈现载体各端自持 |
| TUI F12（`/advisor` 子菜单） | advisor 配置面 = 设置面板（`thincoder-vscode/webview/settings-models.js` advisor 区） | 命令子菜单（对端）vs 面板表单（本端）——入口形态端差——**实证例外（宿主证据）**：入口形态——TUI 子菜单 ∥ 面板表单 |
| TUI F13（attention 态） | 本端对位 = 工具条按钮 active + plan 徽标 + 权限 / 提问卡流内可见 | **端差（明确登记）：attention chip 不做**（设计 = `design/WEBVIEW-PROTOCOL.md` §6.1）；无系统级通知 / 闪烁——**非端差（范围决定——attention chip 不做）** + **不做项在册**（attention chip——归 U-P5） |
| TUI N1–N2（滚动 / 加载不卡） | N-W3 / N-W2 | 机制端差：终端渲染缓存 vs DOM 窗口化 + 离屏跳过——**实证例外（宿主证据）**：渲染载体——终端缓存 ∥ DOM 窗口化 + 离屏跳过 |
| TUI N3（跨端对齐） | N-W4 | 等价（分页常量两端对齐 200） |
| TUI N4（零依赖） | N-W1 | 等价（两端同政策） |
| TUI N5–N6（防刷屏 / 省略计数真值） | 块折叠形态（冻结头 + tail——设计 = `design/WEBVIEW-PROTOCOL.md` §6.2） | 冻结头 + tail-3 同形态保持（等价）；本端截断标记不含计数（核 `thincoder-render-core/lib.mjs:30` `capText` 注文本——端 `webview/lib.js` = 再导出 shim）——「省略 N 行」体系端差——**实证例外（宿主证据）**：截断标记——CLI「省略 N 行」体系 ∥ 本端无计数截断标记 |
| **本端 F-W15**（`@file` 展开面） | 人读线 = **两端共文件**（CLI 同读该线） | **端差**：本端取**端侧显示边界剥离**（`stripAtRefs`——恢复回读 + 标题面还原简洁形，`thincoder-vscode/src/extension/panel-session.mjs`）；**CLI 面渲染仍显 `[File: …]` 展开文**（同源人读线、未随本端剥离）——**消（已落——CLI 恢复渲染同款剥离；端面 = VSC + 桌面）** |
| **本端 F-W16**（工具失败可见面） | 对位 = `TTO`（工具输出上限系） | **端差**：① **卡态语义为本端独有**（红 / 保持展开 / 摘要含退出状态三信号——CLI 无卡态）——**实证例外（宿主 + 行为证据）**；② 成功面 `(exit code 0)` = **消（已落——本端随核 shim 归一）** |
| TUI N7（选择面行宽预算） | —（本端无 cols 固定宽面） | 不适用：面板自适应宽度；预算式不入本端——**非端差（无对位物——本端无 cols 固定宽面）** |
| TUI N8（方向键编辑约束） | F-W6 | 等价（零列记忆两端同）；载体 = 浏览器输入框原生编辑 + 判定五态 |
| TUI N9（attention 零侵入） | —（随 F13 行） | attention chip 不做（登记态）；无空闲重绘面——**非端差（随 F13——attention chip 不做）** + **不做项在册**（attention chip——归 U-P5） |
| TUI N10（显示层内存有界） | N-W2 | 口径端差：对端 = 各载体字符额度族；本端 = 块窗 150 + 卡体 64K + 离屏跳过（DOM 面）——**实证例外（宿主证据）**：载体——字符额度族 ∥ 块窗 150 + 卡体 64K + 离屏跳过 |
| TTO FR1–FR3（行间区块 / 滚动内容 / 完成行） | F-W4 | 形态端差：卡片（折叠 / 展开）vs 行间区块（`❯` / `│` 前缀）；完成语义同（done / 失败 + 耗时 + 摘要）——**实证例外（宿主证据）**：呈现载体——行间区块 ∥ 卡片 |
| TTO FR4（完整输出落盘） | `TOOL-OUTPUT-LIMITS（VSC 侧·需求）`（本档不重述——D2）；呈现面 = 卡体预览 | 无端差（同机制——本端已自持对位档） |
| TTO NFR1（区块渲染性能） | N-W3 | 等价（增量路径） |
| TTO NFR2（单一输出入口） | 消息族 `toolCall` / `toolOutput` / `toolResult`（`thincoder-vscode/webview/chat-messages.js:67-78`） | 接口形态端差：宿主回调 vs postMessage 消息族——**实证例外（宿主证据）**：接口形态——宿主回调 ∥ postMessage 消息族 |
| **本端 F-W23**（子代理块头状态区 think 支） | 对位 = CLI 状态区（`thincoder-cli/src/tui/subagent-panel.mjs:105-110` = `currentTool` + `command≤60`）∥ CLI 工具行前缀（`thincoder-cli/src/tui/subagent-blocks.mjs:341` 的 `${path.label}/${path.rest}`） | **等价**（无端差）：think / text **不碰** `currentTool`（`subagent-blocks.mjs:308` ∥ `:323`）⇒ 本端 think 同样零改写；工具行前缀逐字同构；无工具时两端各自兜底词（CLI `thinking...` ∥ 本端 `思考中…`——词面色差已在 §4.9 登记）。机制单源 = `design/WEBVIEW.md` §5.2 |


## 5. 迁移期状态登记（须随批收口）

| # | 事项 | 现状 | 收口点 |
|---|---|---|---|
| 1 | 设计侧三档（`design/WEBVIEW.md` · `WEBVIEW-PROTOCOL.md` · `WEBVIEW-INPUT.md`）**已迁入基准层** | 本档 §1 / §2 的设计节引用已翻转为**同层引用**（`design/<档>.md` §N——`docs/core/design/DOC-SYSTEM.md` §7 R2 层前缀形态） | 已收口 |
| 2 | `AGENT-LOOP（VSC 侧·需求）` §10 / §12 / §14 / §16 未迁入基准层 | 同上 | 统一面批次（`docs/core/requirements/AGENT-LOOP.md` 并入后翻转） |
| 3 | 测试文件路径按仓根写（`thincoder-vscode/test/...`） | 已按现状改写（产品树仍在） | 产品树降格后随批收口 |
