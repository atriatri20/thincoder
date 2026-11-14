# RTM 分册 · ends

> 本册护的机制 = 主题即端差异的故事（呈现 ∥ 端能力；行带端名）；族表与归属判据 = docs/core/design/TESTING.md。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 33. timer 到期行在终端里读得出来（不是几个空框）

> 目的：终端缺图标字形时，timer 到期行在会话流里读到的是文字——用户不必猜那几个空框是什么。
> 节注：回指 = `docs/cli/design/TUI.md`（定形：触发落流行逐字 + 前缀段不携非 ASCII 字符）∥ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`（投递形态的约束面）；缺口来源 = 用户 2026-11-04 报「linux终端界面显示不了 timer 的那个图标」的残留面（会话流镜像那一行）；交互组件 = 核注入单点（`thincoder-core/agent/timers.mjs` 的 `injectTimerReminders`）⟷ CLI 会话流镜像（`thincoder-cli/src/tui/tool-events.mjs` 的回合尾镜像分支）；进入口 = CLI 会话里挂一个 timer 等它到期；一态 = 33-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 33-1 | CLI 会话里挂一个 timer 等它到期（模块直驱：假 `state` + 真核注入串 + 真镜像分支 + 真 `timer` 工具出缺省消息） | 会话流读到那行 timer 到期行：前缀段至 `timer —` 之前全落在 `/^[\x20-\x7E]+$/`，缺字形字符零命中；缺省消息（`Time's up (…)`）随行可见 | 修前红：注入行带 U+23F0 ⇒ 前缀段判红（Linux 终端渲成豆腐块） | `test/integration/timer-reminder-glyph.test.mjs` |

## CLI 39. 无名渠道条目不进使用面（/model 列表照常列出其余渠道）

> 目的：盘上漏进一条无 `name` 的渠道条目时，`/model` 照常打开——那条不进列表，其余渠道照常可选，且列表首行说出「有条目被跳过、要改 `providers[]`」。
> 节注：回指 = `docs/core/design/PROVIDER.md`（准入判据 ∥ 丢弃可见面）；机制单源 = 核装载点的准入过滤（`thincoder-core/config-normalize.mjs` 的 `isUsableProviderEntry`，装载 ∥ 重读共用一个谓词），端侧只读过滤后的渠表；交互组件 = 核装载过滤 ⟷ CLI L1 列表构建（`thincoder-cli/src/tui/provider-entries.mjs` 的 `buildProviderEntries`）；进入口 = CLI 里打开 `/model`；一态 = 39-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 39-1 | 临时 config 写一条 `null` 渠道 + 一条具名渠道，打开 `/model`（模块直驱 `createModelPicker(ctx).openModelPicker()`，ctx 注入 `showPicker` ∥ `pushLine` 捕获那一屏） | 那一屏首行是告警行且指向 `providers[]`；具名渠道行照常出现；全程无 `padEnd` 崩溃、会话流无崩错行 | 修前红：那一条空条目让列表构建在 `${p.name.padEnd(12)}` 抛 `Cannot read properties of undefined (reading 'padEnd')`——用户 2026-11-08 21:55 报的正是这一句 | `test/integration/model-picker-provider-freshness.test.mjs` |

## CLI 40. 盘上改完不用重启，切渠道那一刻就是现况

> 目的：手改 config.json 之后不必重启——重开 `/model` 看到的就是盘上现况：新渠道在表里，坏条目改好后首行表头消失；盘面读不出来时出一行错误、不打开列表。
> 节注：回指 = `docs/core/design/PROVIDER.md`（重读四步 ∥ 读失败拒开）；机制单源 = 核的 `reloadProviders`（本体住 `thincoder-core/config-reload.mjs`，经 `thincoder-core/config.mjs` 再出口）；交互组件 = 核重读 ⟷ CLI `/model` 打开边界（`thincoder-cli/src/tui/model-picker.mjs` 的 `openModelPicker`）；进入口 = CLI 里开一次 `/model`、盘上改完再开一次；三态 = 40-1 一个用例覆盖三态（新渠道出现 ∥ 表头消失 ∥ 读失败拒开）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 40-1 | 启动时盘上一条具名渠道 + 一条坏条目，开 `/model`；不重启把坏条目改成一条真渠道再开；再把盘上写成一段非法 JSON 第三次开 | 第二次那一屏出现刚改的渠道、首行表头消失；第三次一屏都不开（`showPicker` 零调用）且会话流收到一行以 `[model] cannot re-read config:` 起头的错误 | 修前红：列表只认启动时那份渠表（盘上改完仍要重启），盘面读不出时列表照开——看不出盘面已坏 | `test/integration/model-picker-provider-freshness.test.mjs` |

## VSC 1. 归档块重开 ∥ reload 后，子代理行还是子代理行

> 目的：会话重开 / 面板重载后，归档块里嵌套子代理那几行的行首子标仍在，不退化成正文；父自己的行照旧无子标。
> 节注：回指 = `docs/vsc/requirements/WEBVIEW.md` F-W1（归档记录可重建）；机制单源 = `docs/vsc/design/WEBVIEW.md`「活动与工具」∥「模型与恢复」；交互组件 = webview 归档派生点（`rowsOf` → `recordAppend`）⟷ 槽 JSON 记录 ⟷ 页级重建（`thincoder-vscode/webview/record-restore.js` + 核 `renderSubagentChunk`）；进入口 = VSC 里跑一个带嵌套子代理的回合 → 重开面板 ∥ `reload` 窗口 → 展开归档块读行首。两态（行序）= 1-1 正常 · 1-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 1-1 | VSC 里跑一个 `advisor` → `explore` 嵌套回合，等块归档落流；重开面板 ∥ `reload` 窗口，展开该归档块 | 每条子代行的行首有 dim 子标 `explore#1 · `（正文里不重复出现）；父自己的行零子标；行正文与重开前逐字一致 | 无 | `test/integration/vsc-record-sublabel.test.mjs` |
| 1-2 | 同一会话在 VSC 里跑完嵌套子代理回合（新形记录落流），再于 CLI 端恢复同一会话 | 存量记录（子标字面在 `text` 内）两端行文逐字一致；新形记录在 CLI 恢复面同样以 `explore#1 · ` 起头，行全文与 VSC 端逐字一致 | 无 | `test/integration/vsc-record-sublabel.test.mjs` |

## VSC 2. 流式输出中视口贴底

> 目的：流式回合进行中，用户用滑轮上滚**一下**就把跟随停下——不必先滚够半视口；停下后有 600ms 宽限窗（窗内不被帧拽回、再上滚续期），窗过后真看历史（仍离底）就维持停跟，回到底部则恢复跟随。
> 节注：回指 = `docs/vsc/requirements/WEBVIEW.md` F-W2（流式跟随与滚动）∥ `docs/vsc/design/WEBVIEW.md`「布局与滚动」；机制单源 = `docs/render-core/design/RENDER-CORE.md`「滚动与窗口」；交互组件 = 流式帧应用（核 `thincoder-render-core/flow/stream.mjs` 的帧尾）× pin 观察（核 `thincoder-render-core/scroll.mjs` 的 `createPinWatch` 的 `wheel` ∥ `scroll` 两个入口）× 宽限窗（核 `PIN_GRACE_MS` 定时器）；进入口 = VSC 聊天面板消息区，一次流式回合进行中上滚。三态（上滚量）= 2-1 一个用例覆盖三种上滚量（不足 ∥ 恰等于 ∥ 超过半视口）——_三者同判解钉_。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 2-1 | VSC 聊天面板消息区跑一次流式回合（800px 视口；驱动真 webview 装配 `thincoder-vscode/webview/ui.js` 的 `initScrollFollow` + 核帧尾，滚动宿主自带 `scrollHeight` ∥ `scrollTop` ∥ `clientHeight` 读数），回合中依次**用滑轮**上滚 300px（不足半视口）· 400px（恰等于）· 500px（超过），每次之后继续出帧；另两回合：① 上滚后滚回底部 ② 上滚 500px 不滚回，两回合均等宽限窗到期（`PIN_GRACE_MS` + 50ms）再出帧 | 上滚任一量（300 ∥ 400 ∥ 500）⇒ 解钉，后续帧零写视口、离底随内容增高（不再按距离分判）；上滚后滚回底部 ⇒ 窗内不即时复钉（近底自愈挂起），窗到期后复钉、下一帧重新贴底；窗到期仍离底超半视口 ⇒ 维持解钉、帧零写视口 | 修前红：上滚 300px（不足半视口）仍贴底——正是用户报的症状 | `test/integration/vsc-scroll-follow.test.mjs` |


## VSC 9. 三档模式从控件落到会话，重开后仍一致

> 目的：MODE 的 tiny/normal/engineering 三选项是同一槽内 mode 的投影，非法输入不改状态，engineering 与 PLAN 保持互斥。
> 节注：回指 = `docs/vsc/requirements/WEBVIEW.md` F-W24；机制 = `docs/vsc/design/WEBVIEW.md`「AUTO 与会话模式」∥ `WEBVIEW-PROTOCOL.md`；组件 = webview MODE ⟷ host setMode ⟷ 会话槽 ⟷ agentSettings 快照；进入口 = VSC MODE 控件与设置页；两态 = 9-1 正常 · 9-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 9-1 | 在真实 webview/host 适配链依次切换三档，写非法值，再切槽并 reload | 三档均发 setMode 并落槽；非法值零写；切槽与 reload 后控件恢复目标 mode；engineering 清 PLAN | 无 | `test/integration/vsc-work-mode.test.mjs` |
| 9-2 | 用旧 engineering 槽恢复，并在设置页写全局默认 mode | 旧槽只读迁移；合法 mode 优先；全局默认只写配置，不覆盖当前槽；非法整载荷零写 | 无 | `test/integration/vsc-work-mode.test.mjs` |

## Desktop 12. 三档模式贯穿 slash、控件、IPC 与槽

> 目的：Desktop 的三档切换在命令、按钮、事件投影和恢复面同值，非法补丁不部分落盘。
> 节注：回指 = `docs/desktop/requirements/COMPOSER.md` D34 ∥ `CHAT.md` D5；机制 = `docs/desktop/design/IPC.md` ∥ `SETTINGS.md`；组件 = slash/MODE 控件 ⟷ session:flags ⟷ 活代理/槽 ⟷ ev:flags；进入口 = Desktop slash 与 MODE 控件；两态 = 12-1 正常 · 12-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 12-1 | 经 session:flags 写三档与非法补丁，读取 history:page 和 ev:flags，并恢复旧槽 | 三档在页读/回执/事件一致；非法整笔零写；旧 engineering 只读迁移；engineering 清 PLAN | 无 | `test/integration/desktop-work-mode.test.mjs` |
| 12-2 | 在渲染进程分别执行 /tiny、/eng、/normal 和 MODE 控件动作，再读设置与状态行 | 命令与控件共用 setMode；切换矩阵正确；状态显示当前 MODE；设置页全局默认不覆盖当前槽 | 无 | `test/integration/desktop-work-mode.test.mjs` |

## Server 2. Web 三档模式通过真实 PATCH 与盒内槽生效

> 目的：Server Web 的共享 MODE 控件、斜杠命令、Server PATCH 和盒内槽使用同一 mode。
> 节注：回指 = `docs/server/design/webui/CHAT.md`「输入与状态」；组件 = 共享 composer ⟷ Server composer 适配器 ⟷ member PATCH ⟷ 盒内 core 会话；进入口 = Server Web MODE 控件与 slash；两态 = 2-1 正常 · 2-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 2-1 | 在 Server composer 依次选择三档并执行对应 slash，观察真实适配器出站 | 控件与 slash 都发 setMode；tiny/eng 切换矩阵正确；中英文词表和 CSS 均有三档 | 无 | `test/integration/server-work-mode.test.mjs` |
| 2-2 | 经 member PATCH 写合法/非法 mode，并在盒内保存、恢复；再用旧 engineering 槽读取 | 合法值写盒内槽并恢复；非法和旧布尔不到达盒；旧槽只读迁移；合法 mode 优先 | 无 | `test/integration/server-work-mode.test.mjs` |
