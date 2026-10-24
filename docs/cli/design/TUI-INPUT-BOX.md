# TUI 输入框行为契约 · CLI 面 · 设计

> 板块 = **TUI 输入框**（主输入框 / question 自由文本态 / Ctrl+I 注入框的按键与状态契约）。
> 配对需求档 = `docs/cli/requirements/TUI.md`（F11 / N8 等输入面条目住该档——本板块不单起需求档）。
> 对位档 = `docs/vsc/design/WEBVIEW-INPUT.md`（VSC webview 输入面——语义同源、各端独立实现）。
> **本档是输入框的唯一行为契约：任何对输入框 / 键处理的修改，先读这里，改完更新这里。**
> 模块地图（各模块职责）= `docs/cli/design/TUI.md` §1；本档只落输入框行为与键处理语义。

## 1. 状态模型（不可破坏的不变量）

1. `state.input` 是字符数组（`string[]`）；`state.cursor` 是整数，恒满足 `0 <= cursor <= input.length`。
2. `state.history` 是已提交文本的字符串数组；`historyIndex === -1` 表示不在历史导航中。
3. `submit()`：清空 input/cursor → `history.push(text)` → `historyIndex = -1` → `scroll = 0`。
4. **模式栈互斥**，优先级从高到低：`permission → question → search → interruptPrompt → picker 栈 / wizard → 凭据窗（`secretPrompt`）→ 正常输入`。
   每个模式处理自己的键后必须 `return`。picker 打开期间 Ctrl+I 不受阻——processing 时照常打开注入框
   （Ctrl+I 创建与 interruptPrompt 模态分支先于 picker 分支——Esc 关框后 picker 原样保留），非 processing 时零动作；
   picker 其余按键由 picker 独占消费。
   **搜索面让位（显示面）**：掩码三面在场 ⇒ 输入框显示面归掩码面（框题 ∥ 内容）；其余搜索态照旧——规则本体（判据 ∥ 消费点 ∥ 先例坐标） = `docs/cli/design/TUI.md` §4「掩码守卫」（本档不重述——D2）。
5. `layoutInput(chars, cursor, width)` 是纯函数：`(chars, cursor, width) → { lines, cursorLine, cursorCol, lineStarts }`，
   遇 `\n` 强制换行；`lineStarts[k]` = 第 k 个可视行行首下标；行 k 区间 = `[lineStarts[k], lineStarts[k+1])`（含行尾 `\n`）；
   末项哨兵 = `chars.length`（上界、不指向行）——竖移定位用；cursor 落 `\n` 时属前行行尾。
6. 输入框渲染宽度 = `W - 4`；最多显示 `MAX_INPUT_LINES`（5）行，超出滚动（`inputOffset`）。
7. 渲染层是 `renderRows`（row-diff）：每帧全量计算屏幕行 → 与上一帧 diff → 只重写变化行；
   输入框内容变化靠「行内容不同则重写」，无独立缓存。
8. `state.question` **自由文本态**（无 options 或选中 `Custom answer…`）：`q.answer` 是 codepoint 数组
   （同 `state.input` 语义——emoji / 代理对不劈半），`q.cursor` 是整数且恒满足 `0 <= cursor <= answer.length`（§7.2）；
   options 态无 answer / cursor 字段（选择标记即反馈——不变量不适用）。提交时 `Array.join` 还原串。
9. `state.interruptPrompt`（Ctrl+I 注入框）为 `{ chars: string[], cursor: number }` 或 `null`——
   `chars` 同 `state.input` 的 codepoint 数组语义且**无 `\n`**（单行不变式）；`0 <= cursor <= chars.length`；
   空态 = `{ chars: [], cursor: 0 }`（契约见 §8）。

## 2. 正常输入模式按键表

| 按键 | 行为 |
|---|---|
| 可打印字符 | 插入光标位置（`\r\n` 剥离、`\t` → 两空格） |
| Backspace / Delete | 删光标前 / 处字符 |
| ← → Home End | 光标移动 |
| Ctrl+U | 清空输入框 |
| Enter（`return` / `\r`） | 提交（busy 期 = §4.1 入队受理——队列容量 8） |
| **Shift+Enter** | **插入换行（多行输入）**——需终端键盘增强协议（§5）；不支持时退化为提交 |
| Alt+Enter（`meta+return`） | 插入换行（后备多行键，所有终端可用） |
| Tab | 斜杠命令补全循环 |
| ↑ ↓ | 多行（可视行——折行与 `\n` 同权）时框内竖直移动（显示列保持 + 短行端钳制）；不可移时 ↑ 回落历史、↓ 无动作；翻历史中恒历史导航（三规则见 §3） |
| Ctrl+V | 粘贴剪贴板文本（保留 `\n`，支持多行粘贴） |
| Alt+V / Ctrl+Alt+V | 粘贴剪贴板图片 → 插入 `read_image <path>` 命令 |
| Ctrl+F | 进入搜索模式 |
| Ctrl+I / Tab（处理中） | 中断注入模式 |
| PgUp / PgDn | 会话区滚动 |

## 3. 输入历史导航语义（↑↓ 三规则 + 草稿保护）

**↑↓ 三规则**：

1. **翻历史中恒历史**：`historyIndex !== -1` 时 ↑/↓ 恒为历史导航（即便当前条目为多行——不竖移）。
2. **竖移优先**：`historyIndex === -1` 且光标所在可视行在对应方向存在邻行 → 光标竖移——目标行显示列 =
   当前光标显示列（**显示列保持**），目标行更短则钳制到行尾；折行与 `\n` 同口径（按可视行）。
3. **边界回落**：无可移邻行时——↑ 回落历史导航（草稿保护见下）；↓ 无动作。

**草稿保护**：

- ↑：`historyIndex` 回退，加载历史条目；**首次进入导航前，未提交的输入存入 `state._draft`**。
- ↓：`historyIndex` 前进；走到头时**从 `_draft` 恢复原来在打的字**（无草稿则回空白），恢复后清 `_draft`。
- 空输入进入导航不存草稿；`submit()` 清 `_draft`。
- 竖移不改草稿（仅发生在 `historyIndex === -1`——草稿面零涉，不变量 2 / 3 零改）。
- **处理中**（`processing`，含 digest）：**竖移放行**（纯编辑——与字符 / 退格 / ←→ 同权）、**历史导航禁**
  （第 1 / 3 条的历史分支吞——不进入、不切换；Tab 吞等其余 busy 门禁不变；提交面 busy 期分流 = §4.1）。

## 4. 挂起态输入契约（AGENT-LOOP-ASYNC-POOL §6.8）

> 挂起会话期间（`state.suspended`）输入框放开。挂起决策 / 队列机制权威 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.8；
> 本节只落输入框侧行为。

- **不变量**：`state.input` **永不被后台事件读写**——settle / 消化轮 / 注入全部经独立通道（token / `state.pendingInput`），
  后台代码零接触输入框；框内文本在后台事件前后逐字不变。
- **Enter（非 slash 文本）**：不入 `state.queue`、不打断后台——消息入 **`state.pendingInput` 队列**
  （**容量 8——见 §4.1**；`key-handler-edit.mjs` 分流 + 清框，与 submit 同款清理；history 照常收录），经 `state._suspWake?.()` 唤醒挂起会话循环；
  driver 消费清槽即以该消息开新回合（输入优先——不触发新 digest；见 §4.1 送达链路）。
  **busy 期（`state.processing` 含 digest）提交走 busy 门禁入槽——本分支不触达**（本分支只接挂起空闲 / 释放窗口；两分支同槽同款清理——§4.1）。
- **斜杠命令**：挂起分流不拦截——走 submit 正常路径（纯挂起期直接执行）；busy 期（`state.processing` 含 digest）经 busy 门禁同吞——不直行 / 不排队 / 不入槽，文本保留在输入框（斜杠 busy 禁发不变——§4.1 条件 3）。
- **Ctrl+C**（挂起 / 消化中 = 武装窗口两级中止）：
  - **未武装首次按下**：digest / 会话内回合处理中仅中止当前回合（`state.controller.abort()`，会话与后台子代理不受影响，回挂起等待）；
    纯挂起等待期仅提示武装（含运行中数量，不清池）。
  - **3s 窗口内再次按下**（`state.suspAbortArmed` + `ctx.suspArmTimer`）才彻底中止：abort 集合 = 链条内全部 controller
    + `_suspAborted` + 唤醒 driver → 清池 → idle。
  - 中止后会话退出复位 `_suspAborted`（池再 live 可重新进入挂起态）；digest 期间排队的 pendingInput 残余转回 `state.queue`
    由普通回合续发 + 提示行（不静默丢）。
  - **Ctrl+I**：仅 digest 处理中有效（`processing && controller`）——立即打断（interruptPrompt，插话语义保留）；
    纯挂起等待期 Ctrl+I 无动作（Enter 即插话通道）。
- 消化轮输出照常流式显示；状态行显示「后台 N 子代理运行中 · M 待消化」（processing 期由工具事件接管）。

### 4.1 busy 期输入注入（F16）

> 需求锚 = `docs/cli/requirements/TUI.md` **F16**（多槽 / 合并消费）；语义对位 = 子代理 `send`（回合边界注入，非打断）。
> **形态 = 多槽（容量 8 条）+ 合并消费**（用户裁定——机制 / 常量单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.8）。
> Ctrl+I 中断注入**保留并存**（打断 vs 排队两语义——用户裁定，零触碰 Ctrl+I）。
> **扩面覆盖面**：池 live 会话期 `state.suspended` 恒 true（`thincoder-cli/src/tui/suspension-drive.mjs:226/:290`），池 live 的用户回合（`:246-250`，只翻 `agent._suspended`）与 digest 均属「挂起会话内」⇒ 工程模式（子代理常年在飞）的日常面同入 busy 门禁——吞面 = `state.suspended || state._suspPending`，两面同判据、同队列、同反馈。
> 送达链路 = **步边界 pickup（主）** + 既有回合尾 drain（`thincoder-cli/src/tui/agent-turn.mjs:333-350` 队列续发 + `thincoder-cli/src/tui/suspension-drive.mjs:246-257`
> driver 消费）——**取数同按合并计划**（见「送达链路」段）；消费回执 = 每批一行 dim 行；反馈面与三时机 = `docs/cli/design/TUI.md` §7.5（机制侧步边界定义 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.8）。

**放行判据（busy Enter → 入队，全部满足）**：

| # | 条件 | 理由 |
|---|---|---|
| 1 | `state.processing === true`（含 digest——单一判据既有） | 本面开的面——非 busy 期走既有 submit / 挂起分流，零改 |
| 2 | `state.permission == null && state.question == null` | 审批 / 提问卡挂起期**仍吞**——模态卡是回合阻塞面（等用户裁决），Enter 的用户意图 = 回应卡；排队文本会串进裁决流。F16「回合运行中」的排除项 |
| 3 | 非 slash（`text.startsWith("/")` 为假） | 斜杠 busy 禁发不变（INPUT-LOCK 斜杠面） |
| 4 | `text` 非空 | 空 Enter 静默（既有） |
| 5 | `state.pendingInput.length < QUEUED_MAX_ITEMS`（容量 8） | 队容量（多槽——用户裁定）；普通 / 挂起两面共用同一队列 |

**吞面收敛四**（判据表否面——放行面之外的全部吞形）：**模态**（条件 2）· **斜杠**（条件 3）· **空**（条件 4）· **队满**（条件 5——第 9 条）。
挂起两态（`state.suspended` / `state._suspPending`）**同入队判据**——挂起内 busy 与普通 busy 统一。

**执行序（`key-handler-busy.mjs` busy 门禁）**：
斜杠 → 吞 + busy 提示（文本保留，既有）；空 → 静默（既有）；条件 2 不满足 → 吞 + busy 提示（文本保留，既有）；
**队满（条件 5）→ 拒 + 提示 + 文本保留**（先例 = 挂起态队满分支 `key-handler-edit.mjs:60-64` 同构——拒 + 提示 + 文本保留；**满队提示形态 = 端内字面** `[主会话处理中 —— 已排队 8 条消息，请等其处理完成后再发送]`（`C.warn`）；
**其余（1∧2∧3∧4∧5）→ 入队**：清框 + `history.push` + `historyIndex = -1` + `_draft = null` + `pendingInput.push(text)`
+ `state.scroll = 0` + `state._followTail = true`（F4「新提交消息 → 恢复跟随」——排队提交同列；与 `thincoder-cli/src/tui/turn-face.mjs:32-33` submit 同款两行，两条入槽路径同款：本档 busy 门禁 / `key-handler-edit.mjs:65-70` 挂起态）
（与挂起态入队分支同款清理——`state.input` 永不被后台事件读写的不变量（§4）保持：入队是**前台**按键路径写自己的队列）。
**挂起面入队后同款唤醒**：`state.suspended || state._suspPending` ⇒ `state._suspWake?.()`（§4 既有挂起分支同款）；
busy 期该槽恒 null ⇒ 零动作——证据 = `thincoder-cli/src/tui/suspension-drive.mjs:122`（等待结束清理即置 null）· `:137`（仅在 `waitForSettleOrWake` 等待窗口注入；唯一调用点 `:279`）
⇒ 轮末 driver 步骤 1 恒接走；普通 busy 面零唤醒（现状零改）。用例「挂起内入槽」格断言 `wakes` 计数（= 呼叫点执行——桩注入 spy；生产 busy 期零副作用）。

**再提交与满队（容量 8）= 拒 + 提示 + 文本保留**：容量内再提交 ⇒ 连续入队（多槽——每条各占一项）；满队再提交 ⇒ 拒 + 提示 + 文本保留
（不覆盖、不丢——违「不静默丢」纪律的反面；先例 `thincoder-cli/src/tui/suspension-drive.mjs:308-311` 中止残余转正注释）；拒 + 提示与既有队列满语义同构零新机制。

**submit 双保险同步**（`turn-face.mjs` submit busy 拒分支——`:21-25`）：防御语义 = 「busy 期拒绝 + 不清框」；
正常流量的 Enter 在 key-handler 族（`key-handler-busy.mjs` 门禁 · `key-handler-edit.mjs` 入槽）分流，submit busy 分支只服务直呼防御。

**消费回执（送达链路侧——每批一行 dim 行）**：`[sending queued message]` 在**消费时**按批推送（批 = 合并计划取数单位）——
① **步边界 pickup**（`queued-pickup.mjs`——核循环头回调取批后）；② 回合尾兜底转正点（`agent-turn.mjs` 队列 while 取批后）；③ 挂起 driver 消费点（`suspension-drive.mjs` pendingInput 取批后）。
形态对位既有 `[continuing…]`（`agent-turn.mjs:255`，`C.tool`）——消费事实的可见锚，回执在则顺序自然
（queued dim 行 → 回合尾 → `❯ You:` 标签 + 消息行）。

**排队期呈现与消费转正（呈现面）**：入队后队列以会话流尾**待发送块**呈现（派生行——
逐条原文 + 条数标签；形态 / 上限 / 缓存键 / 边界 = `docs/cli/design/TUI.md` §7.5；本档不重述——D2）；消费按合并计划取批（步边界 pickup（主——`queued-pickup.mjs`）/ `agent-turn.mjs` 回合尾兜底 + 队列续发 /
`suspension-drive.mjs` driver 输入优先）⇒ 回执 + `❯ You:` + **合并文本**落 `state.lines`（`agent-turn.mjs:84-87`）在同一同步段
⇒ 渲染帧合并调度下**单帧切换**（N 条待发送块 → 回执行 + 一条合并用户消息：零空窗 / 零重复——并解同处 §7.5 消费转正条）。
中止残余（按合并计划转 `state.queue` + 既有提示行）不渲染待发送块（同 §7.5 边界）。

**送达链路（合并消费）**：四支入口共用**同一合并计划** `planQueuedInput`（纯函数——
核单源 `thincoder-core/queued.mjs`（CLI 经转口档 `thincoder-cli/src/tui/queued-merge.mjs`）；常量 `MAX_MERGE_ITEMS`（8）/ `MAX_MERGE_CHARS`（2000）与形态文案同源）：
⓪ **用户回合在飞（`autoTurn === false`）⇒ 步边界 pickup（主）**：核 loop 循环头投递回调（`consumeQueuedInput`）按计划取批（首动作 = merged 批；`/cmd` 首动作 = 入队门禁不可达的防御面——留给既有消费点）
⇒ `pushReal` 一条 user 消息入历史（下一步生效——不中断）+ 呈现（回执行 + `❯ You:` + 合并文本）。系统轮（digest / 上行唤醒轮）不传回调（域 / 门禁降格理由 = `docs/cli/design/TUI.md` §7.5「分流」）；
① 普通回合 busy 入队 → 回合自然结束：顶层兜底（`agent-turn.mjs:334-336`：`!poolLive` 时按计划取批 → `state.queue` → 队列 while 续发新回合）；
② 挂起会话内 busy 入队 → 池 live ⇒ driver 步骤 1 输入优先，按计划取批（`thincoder-cli/src/tui/suspension-drive.mjs:246-257`——以合并消息开新回合，先于 digest 合并）；
③ 池空 + 会话退出 ⇒ 退出前残余按计划兜底（`suspension-drive.mjs` 退出段——零丢失）。超过一批者（>8 条 / 合并 > 2000 字符）截批先行——余下循环接取（多回合，不丢）。

**VSC 对位**：`webview/send.js` 出口守卫 **busy 即排队面 = `S._turnState === "running"`**
（`_suspended` 不再参与分流）；队列载体两态（无会话 = `panel._busyQueued`；会话在飞 = 会话队列 `susp.pendingInput`，
既有 `_chat` 分流——driver 步骤 1 优先按合并计划取批）。契约单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 **C-B2-6**（分流 / 容量 8 /
镜像判据源 / 送达 / 贴图降级 / **待发送标记**细则 = 同处 ①–⑦——D2 不重述）；webview 排队期标记（逐条气泡 `pending` 标记 + 标签行；多条批消费时就地合并为一条气泡）
与 CLI 待发送块**语义同源（形态各端自落）**。

**边界**：**攒批 = 合并消费**：单批 ≤ 8 条 ∧ 合并 ≤ 2000 字符；超限截批 / 单条超长直发；队容量 8（第 9 条拒）；`/cmd` 逐条保序（不进合并）；不触碰 Ctrl+I 代码与文档条目（`key-handler.mjs:81-88` /
`key-modes.mjs handleInterruptMode` / 本档 §2 表 Ctrl+I 行 / §8——两语义并存）；`_pasting` 锁零触；
非 busy 期（空闲 / 挂起空闲 / 释放窗口）Enter 语义零改（§4 分流原样）；斜杠 busy 禁发零改；
F13 attention 判据不破（queued 反馈零注意力色对——`docs/cli/design/TUI.md` §7.5）。

## 5. 多行输入（能力 + 键实现）

### 5.1 真实能力

| 途径 | 状态 | 说明 |
|---|---|---|
| **粘贴多行文本** | ✅ 正常 | bracketed paste → `insertPastedText` 保留 `\n` |
| **Shift+Enter 插换行** | ✅ 现代终端可用 | 需终端键盘增强协议（§5.2）；旧版控制台物理上不可能 |
| **Ctrl+J 插换行** | ✅ **所有终端可用（主后备）** | Ctrl+J 发 `\n`（0x0A）、Enter 发 `\r`（0x0D），字节天然不同，不依赖任何协议；readline 解析为 `name:"enter"` |
| Alt+Enter 插换行 | ✅ 保留 | readline 对 `\x1b\r` 稳定解析为 `name:"return", meta:true`；Windows 旧版控制台把 Alt+Enter 截走切全屏（不可用） |

### 5.2 多行键实现方案（三层）

> 判定：Shift+Enter（现代终端）+ Ctrl+J（所有终端后备）+ Alt+Enter（第三后备）。多数终端默认对 Shift+Enter 发送裸 `\r`，
> 与 Enter 字节级不可区分——监听 `key.shift` 是死路。

1. **Shift+Enter（现代终端）**：启动时同时启用两种协议（不支持的终端直接忽略）：
   - `\x1b[>1u`——kitty keyboard protocol push（Windows Terminal 1.19+ / VS Code 终端 / kitty / iTerm2）：Shift+Enter → `\x1b[13;2u`；
   - `\x1b[>4;2m`——xterm modifyOtherKeys level 2（mintty / Git Bash）：Shift+Enter → `\x1b[27;2;13~`；
   - stdin 层 `translateShiftEnter` 把两种序列翻译为 `\x1b\r` → readline 解析为 meta+return → 多行分支；
   - 退出时 `\x1b[<u` + `\x1b[>4m` 复位。
2. **Ctrl+J（所有终端，含旧版控制台）**：`key-handler-edit.mjs` 的提交分支把 `name === "enter"`（即 `\n`）改为插换行。
   唯一风险：终端被配置成 Enter 发送 LF（极罕见——那样 Enter 与 Ctrl+J 同为 `\n`，无换行键）。
3. **Alt+Enter（第三后备）**：保持 meta+return 分支不动；旧版控制台上被系统截走（切全屏），现代终端可用。

**为什么走 stdin 翻译而不是在 `key-handler-edit.mjs` 里处理 CSI-u**：Node readline 不认识 CSI-u 序列（实测解析为 `name:"undefined"`
或拆成垃圾字符），必须在进 readline 之前拦截。

**诊断工具**：`node thincoder-cli/scripts/key-probe.mjs`——按键看终端实际发的字节。

## 6. 相关模块（输入框相关职责）

| 模块 | 职责 |
|---|---|
| `thincoder-cli/src/tui/key-handler.mjs` | 按键分发**分派器**：attention 清位 + 三模态前置委派 + F1 表 + Ctrl+I 入口（§8）+ interrupt 模态 + 五族顺序委派（守卫 = 原块入口条件） |
| `thincoder-cli/src/tui/key-handler-edit.mjs` | 编辑族：输入编辑（退格 / 删除 / Ctrl+U / Tab 补全）+ Enter（多行 / 挂起态入槽——§4）+ 剪贴板文本 / 图片粘贴 |
| `thincoder-cli/src/tui/key-handler-busy.mjs` | busy 期入队门禁（§4.1——`pendingInput` 队列（容量 8）可达化；吞面四 / 入队五条件） |
| `thincoder-cli/src/tui/key-handler-scroll.mjs` | ↑↓ 分流（竖移 / 历史——§3）+ ←→ · Home · End + PgUp / PgDn |
| `thincoder-cli/src/tui/key-handler-modals.mjs` | picker / wizard 键处理（模态面，输入框让位） |
| `thincoder-cli/src/tui/key-handler-ctrlc.mjs` | Ctrl+C 五分支族（含挂起态两级中止——§4） |
| `thincoder-cli/src/tui/key-modes.mjs` | 模态层：permission / question / interruptPrompt 独占模态——激活即消费全部按键；question 自由文本态编辑键（§7）；Inject 框编辑键（§8） |
| `thincoder-cli/src/tui/render.mjs` | `layoutInput`（折行 / 光标行列 + `lineStarts`）/ `charWidth` 纯函数；`moveCursorVertical`（竖移定位——§3 规则 2） |
| `thincoder-cli/src/tui/layout.mjs` | `computeLayout` 面板布局（输入框 boxLines / cap / offset / 光标行列；question 自由文本态 `layoutAnswer` = `layoutInput` 复用）；`inputContentWidth`（输入框内容宽度单源——布局与竖移共用） |
| `thincoder-cli/src/tui/clipboard.mjs` | `translateShiftEnter`（CSI-u / modifyOtherKeys → `\x1b\r`）；`insertPastedText` 目标路由（主输入落 cursor / question 落 cursor + 单行守卫 / options 忽略 / 注入框落 cursor + 去换行——§8） |
| `thincoder-cli/src/tui/interaction.mjs` | `askQuestion` 装配：`q.answer` codepoint 数组 + `q.cursor`（options 态无） |
| `thincoder-cli/src/tui/render-frame.mjs` · `render-loop.mjs` | question 自由文本态光标例外（`hasOverlay` 细化 / `cursorSuffix` 正常发）；Inject 框标题提示与空态占位符（§8.3） |
| `thincoder-cli/src/tui/ansi.mjs` | `keyboardPush` / `keyboardPop` 序列常量 |
| `thincoder-cli/src/tui/tui-state.mjs` | state 初始化单源（`createTuiState`——含 `_draft` / `interruptPrompt` 空态） |
| `thincoder-cli/src/tui/input-face.mjs` | stdin 层 `translateShiftEnter` 接线（`:151`）+ 键盘 / 鼠标后置挂载入口（`mountKeys` / `mountMouse`） |
| `thincoder-cli/src/tui/index.mjs` | `startTUI` 装配序列（命令层 / 启动屏 / resize / render loop）；启动 `keyboardPush` / 退出 `keyboardPop`（序列体 = `tui-lifecycle.mjs`——启动调用点 = `input-face.mjs:39`） |
| `thincoder-cli/test/busy-injection.test.mjs`（留守）· `busy-injection-render.test.mjs` · `busy-injection-consume.test.mjs` | F16 用例宿主——按族三档：留守 T-F16-1 / 3 / 4 / 8 / 13 · 渲染族 6 / 10 / 11 / 12 / 14 / 17 · 消费族 2 / 5 / 9 / 15 / 16 / 18 / 19 |

## 7. question 自由文本输入态：光标与编辑键

> 主输入框与 question 自由文本框均有光标（视觉反显 + 硬件定位双机制）；question 其余文本面无缺口
> （wizard 复用 `state.input`、picker filter 行内输入已有光标）。
> **Inject 框（Ctrl+I）为另一独立面——键集 = 本节最小集 + 四方向键，见 §8。**

### 7.1 渲染

- **渲染数据源**：`layout.mjs` question boxLines 分支——question 存在时 boxLines 为 options 列表或自由文本态的光标行；
  自由文本态 `boxLines = layoutAnswer(q.answer, q.cursor, width)`——**与 `layoutInput` 同实现**
  （多行换行展开——`▸ ` 首行 + 续行 2 空格缩进——返回 `{ lines, cursorLine, cursorCol }`）。
- **行数上限**：复用主输入 cap（`MAX_INPUT_LINES` 5 + `inputOffset` 滚动）——光标随行滚动。
- **渲染例外（`hasOverlay` 细化）**：permission / picker / wizard-provider / options 态维持无光标；
  **question 自由文本态保留视觉反显 + 硬件定位**（与主输入框同路径——`cursorSuffix` 正常发）。options 态无光标（`▸` 标记即反馈）。

### 7.2 契约（状态模型扩展 + 编辑键）

**状态模型扩展**（§1 不变量 8）：`state.question.cursor` 整数——处于**自由文本态**（无 options 或选中 `Custom answer…`）时
恒满足 `0 <= cursor <= answer.length`——answer 存 codepoint 数组；options 态无 cursor 字段。进入自由文本态时初始化
`answer = []`、`cursor = answer.length`；options → Custom 转换时同步初始化。提交时 `Array.join` 还原串。

**自由文本态按键表**（与主输入框对齐的最小集）：

| 键 | 行为 |
|---|---|
| ← / → | cursor 移动（0 边界停） |
| Home / End | 跳首 / 尾 |
| Ctrl+U | 清空 answer 与 cursor（同主输入框语义） |
| Backspace | 删 cursor 前字符（cursor 位置感知） |
| 可打印字符 | 插入 cursor 位置 |

**语义（定稿）**：

- **Esc**：有 options 时自由文本态 Esc = **回 options 态**（非中止——误触 Custom 有逃生口）；无 options 时 Esc = 中止 question。
- Enter 提交；Ctrl+V 粘贴落 cursor 位置——**粘贴含 `\n` → 替换为空格**（保文本——单行不变式硬守卫）。
- **Ctrl+J = no-op 吞**（不插换行）；未列键一律消费 `return`，无 fall-through。
- **options 态**：↑↓ / Enter / Esc 不变；选中后自由文本态（`Custom answer…`）自动进入上述光标态；↑↓ 语义 = **环绕**（末项 down → 第 0 项；首项 up → 末项——三选择面契约见 `docs/cli/design/TUI-COMMANDS.md` §3）。
- Ctrl+V 与 bracketed paste 共用同一实现（`clipboard.mjs insertPastedText` question 分支）：落 cursor + `\n`/`\r` 折叠为空格 + `\t` → 2 空格。

## 8. Inject 框（Ctrl+I）：光标与编辑键

> 状态模型见 §1 不变量 9。渲染 = 复用主输入框面板：`layout.mjs` 把 `interruptPrompt.chars` 走 `layoutInput`
> （`MAX_INPUT_LINES` cap + `offset` 滚动同款）；光标反显 + 硬件定位与主输入框同路径（`hasOverlay` 不含 interruptPrompt）。

### 8.1 按键表

| 键 | 行为 |
|---|---|
| ← / → | cursor 移动（0 边界停） |
| ↑ / ↓ | 折行竖移（显示列保持 + 短行端钳制；无邻行时吞——**无历史回落**、零副作用） |
| Home / End | 跳首 / 尾 |
| Ctrl+U | 清空 chars 与 cursor |
| Backspace | 删 cursor 前字符（cursor 位置感知） |
| Delete | 吞（不引入——与 §7.2 最小集对齐） |
| 可打印字符 | 插入 cursor 位置（`\r\n` 剥离、`\t` → 两空格） |
| Ctrl+J（`enter`） | no-op 吞（不插换行——单行不变式） |
| Enter | 提交：`chars.join("").trim()` → `controller.abort({ interrupt: true, message })`（回合已结束 → 排队提示语义不变） |
| Esc | 取消（置 `null`） |
| Ctrl+V / 粘贴 | 落 cursor 位置；`\n`/`\r` 去除、`\t` → 两空格（单行不变式） |
| 未列键 | 一律 consume（模态独占——无 fall-through） |

### 8.2 与 §7.2（question 自由文本态）的关系

- **键集同源**：= §7.2 最小集 + **四方向键**（§7.2 面 ↑↓ 吞；本面 ↑↓ 折行竖移）。与 §7.2 的差异共两项：
  ① 四方向键 ↑↓；② 粘贴换行清洗——本面 `\n`/`\r` **去除**（§8.1 键表），§7.2 面 `\n`/`\r` **折叠为空格**（§7.2 语义）。
- 单行不变式同款（无换行键）；Esc / Enter 语义各自既有（取消注入 / 答问提交）。
- 注入框**无历史回落**：↑↓ 边界 = 吞（不牵动主输入框 `state.history`）。

### 8.3 渲染与提示

- 光标：与主输入框同路径（反显 + 硬件定位）；`chars` 为空时显示空态占位符
  （`Type message to inject (Enter send, Esc cancel)`）。
- **标题提示**（`render-frame.mjs`）：` Inject Message ` 面提示 = `" Enter send, Esc cancel │ ←→↑↓ Home/End move │ Ctrl+V paste "`；
  本面共用段不含 `Shift+Enter / Ctrl+J newline` 与 `Ctrl+I inject`（单行框无换行键；框内 Ctrl+I 被模态吞）。
  共用段条件 = `title === " Input " || title === " Processing... "`。
