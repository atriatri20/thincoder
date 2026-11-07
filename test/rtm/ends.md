# RTM 分册 · ends

> 本册护的机制 = 主题即端差异的故事（呈现 ∥ 端能力；行带端名）；族表与归属判据 = docs/core/design/TESTING.md §11.18.3。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 33. timer 到期行在终端里读得出来（不是几个空框）

> 目的：终端缺图标字形时，timer 到期行在会话流里读到的是文字——用户不必猜那几个空框是什么。
> 节注：回指 = `docs/cli/design/TUI.md` §7.6（定形：触发落流行逐字 + 前缀段不携非 ASCII 字符）∥ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3（投递形态的约束面）；缺口来源 = 用户 2026-11-04 报「linux终端界面显示不了 timer 的那个图标」的残留面（会话流镜像那一行）；交互组件 = 核注入单点（`thincoder-core/agent/timers.mjs` 的 `injectTimerReminders`）⟷ CLI 会话流镜像（`thincoder-cli/src/tui/tool-events.mjs` 的回合尾镜像分支）；进入口 = CLI 会话里挂一个 timer 等它到期；一态 = 33-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 33-1 | CLI 会话里挂一个 timer 等它到期（模块直驱：假 `state` + 真核注入串 + 真镜像分支 + 真 `timer` 工具出缺省消息） | 会话流读到那行 timer 到期行：前缀段至 `timer —` 之前全落在 `/^[\x20-\x7E]+$/`，缺字形字符零命中；缺省消息（`Time's up (…)`）随行可见 | 修前红：注入行带 U+23F0 ⇒ 前缀段判红（Linux 终端渲成豆腐块） | `test/integration/timer-reminder-glyph.test.mjs` |

## VSC 1. 归档块重开 ∥ reload 后，子代理行还是子代理行

> 目的：会话重开 / 面板重载后，归档块里嵌套子代理那几行的行首子标仍在，不退化成正文；父自己的行照旧无子标。
> 节注：回指 = 需求 F-W1（恢复后存续）∥ I-7（收窄负控）；机制单源 = 设计档 §5.7 行形条 ∥ D-W46；交互组件 = webview 归档派生点（`rowsOf` → `recordAppend`）⟷ 槽 JSON 记录 ⟷ 页级重建（`thincoder-vscode/webview/record-restore.js` + 核 `renderSubagentChunk`）；进入口 = VSC 里跑一个带嵌套子代理的回合 → 重开面板 ∥ `reload` 窗口 → 展开归档块读行首。三态（行序）= 1-1 正常 · 1-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 1-1 | VSC 里跑一个 `advisor` → `explore` 嵌套回合，等块归档落流；重开面板 ∥ `reload` 窗口，展开该归档块 | 每条子代行的行首有 dim 子标 `explore#1 · `（正文里不重复出现）；父自己的行零子标；行正文与重开前逐字一致 | 无 | `test/integration/vsc-record-sublabel.test.mjs` |
| 1-2 | 同一会话在 VSC 里跑完嵌套子代理回合（新形记录落流），再于 CLI 端恢复同一会话 | 存量记录（子标字面在 `text` 内）两端行文逐字一致；新形记录在 CLI 恢复面同样以 `explore#1 · ` 起头，行全文与 VSC 端逐字一致 | 无 | `test/integration/vsc-record-sublabel.test.mjs` |

## VSC 2. 流式输出中视口贴底

> 目的：流式回合进行中，用户只上滚了一点点（不足半视口）时，输出继续到达不把跟随停掉——视口仍跟着新内容走；真要看历史时才解钉。
> 节注：回指 = 需求 F-W2（流式跟随与滚动）∥ `docs/vsc/design/WEBVIEW.md` §5.5 集成面行；机制单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16（近底阈 = 视口比例，半视口为下限）；交互组件 = 流式帧应用（核 `thincoder-render-core/flow/stream.mjs` 的帧尾）× pin 观察（核 `thincoder-render-core/scroll.mjs` 的 `createPinWatch` 更新点）× 近底判据（核 `nearBottom`）；进入口 = VSC 聊天面板消息区，一次流式回合进行中上滚。三态（离底）= 2-1 一个用例覆盖三种离底量（不足 ∥ 恰等于 ∥ 超过半视口）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 2-1 | VSC 聊天面板消息区跑一次流式回合（800px 视口；驱动真 webview 装配 `thincoder-vscode/webview/ui.js` 的 `initScrollFollow` + 核帧尾，滚动宿主自带 `scrollHeight` ∥ `scrollTop` ∥ `clientHeight` 读数），回合中依次上滚 300px（不足半视口）· 500px（超过）· 400px（恰等于），每次之后继续出帧；最后滚回底部 | 上滚 300px ⇒ 钉仍真，下一帧输出后视口仍贴底（离底归 0）；上滚 500px ∥ 恰 400px ⇒ 解钉，后续帧零写视口；滚回底部 ⇒ 复钉，下一帧重新贴底 | 无 | `test/integration/vsc-scroll-follow.test.mjs` |
