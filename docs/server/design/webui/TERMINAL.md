# Thincoder Server · 终端核（webui/TERMINAL.md）

> 板块 = server ∥ 本档 = webui 域·终端核面（**可复用件**——自搓真终端三件）；本期唯一落地点 = 管理页容器行「终端」钮（消费面 = `webui/SANDBOX.md` §2.1①；服务端会话链/帧协议单源 = `sandbox/SANDBOX.md` §3「容器终端」块——本档不复制）。
> 用户判据：终端核按**可复用件**做（原话「可能不止这一处用，没准将来也会让用户能用终端方式连接他的工作区」）——复用边界 = §2.6；自搓 = 零外部前端件（控制台「零框架 · 零构建 · 零外部资源」惯例——KD-SV-9 同源）。

## 1. 关键决策（本面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-181 | **终端核 = 三件**（`terminal-core.mjs`＝解析器+字符网格 ∥ `terminal-render.mjs`＝DOM 渲染+输入捕获 ∥ `terminal-link.mjs`＝WebSocket 传输+心跳）；**三件零控制台依赖**（不 import `i18n.mjs`/`modal.mjs`/`dom.mjs`——文案与壳归消费件）；消费件一件（`views-sandbox-terminal.mjs`——本期唯一落地点） | 用户「可复用件」判据；零依赖 ⇒ 新宿主（成员面 ∥ 桌面 ∥ VSC 届时另裁）复制或 import 三件即可落地，宿主自备壳/文案/入口；文件账红线（≤500 软线 ∥ ≤800 硬线）下按职责三分——单件塞全量必越线 |
| KD-SV-182 | **渲染 = DOM 行渲染**（每行一 `div`，按 SGR 段切 `span`；**脏行重渲**）+ **等宽 cell 网格量宽**（cols/rows 由容器像素尺寸 ÷ 单字格实测尺寸换算）；光标 = 独立绝对定位元素；**终端调色板 = 18 枚变量**（bg/fg + ANSI 16，`:root` 唯一值源——`webui/STYLE.md` §2.1 底座登记）；**粗体例外**：终端面内 cell 允许 `font-weight`（终端语义按 pty 输出渲染——STYLE 零粗体规则的显式例外，登记在册） | 零框架下 DOM 行渲 = 最小可维护形（脏行重渲避免整屏重建）；宽字符与光标定位必须走实测 cell 尺寸（不然 vim/top 满屏错位）；调色板入 `:root` = 变量单源不破（`:root` 外零颜色字面量） |
| KD-SV-183 | **能力表 v1 = TUI 级**（§2.2——`vim`/`top`/`bash` 行编辑覆盖）：SGR 16/256/真彩 ∥ 光标系列 ∥ 擦除/插删系列 ∥ 滚动区+备用屏 ∥ 自动换行/制表位 ∥ DEC 线绘字符集 ∥ 键盘全套（含 IME 中文）；**不做**（登记）：鼠标协议 ∥ 图片协议 ∥ 文件传输 ∥ 会话持久化/重放 ∥ 组合字符（combining）∥ reflow | 验收 = 能跑 `vim`/`top` 一类全屏 TUI + 敲命令/行编辑 + 中文经 pty 正常（实测基线 = 本设计轮真机探针（`bash -i` 实测序列：`\r` ∥ `ESC[K` ∥ `ESC[?2004h` ∥ OSC 0 题头；`vim`/`top` 走 CUP/SGR/备用屏/滚动区）；不做面 = 用户禁项（鼠标/图片/文件传输）+ v1 不值项（reflow 在 TUI 下无实益——应用收 SIGWINCH 自绘） |

## 2. 机制

### 2.1 三件与职责

| 件 | 职责 | 依赖 |
|---|---|---|
| `thincoder-server/public/terminal-core.mjs` | **解析器 + 字符网格模型**：VT 序列解析（CSI/ESC/OSC 子集——§2.2 能力表）∥ 网格（单元格 = 码点 + SGR 属性）∥ 宽字符占位（`wcwidth` 简表——东亚宽/全角 = 2 列）∥ 备用屏 ∥ 滚动区（DECSTBM）∥ 卷回环（1000 行）∥ 光标态与模式位（`?1`/`?6`/`?7`/`?25`/`?47`/`?1047`/`?1049`/`?2004`）∥ 增量 UTF-8 解码 ∥ 键盘编码（`encodeKey` 纯函数） | 零（纯件——Node 可 import 直测：喂字节 ⇒ 网格快照） |
| `thincoder-server/public/terminal-render.mjs` | **DOM 渲染 + 输入捕获**：脏行重渲（行节点 + SGR 段 `span`）∥ 光标元素（形状随模式；闪烁 = CSS 固定）∥ 卷回视口映射（滚轮 ∥ Shift+PageUp/PageDown ∥ 输入即回底）∥ 尺寸观测（`ResizeObserver` ⇒ cell 量宽 ⇒ cols/rows ⇒ `onResize`）∥ 隐藏输入区（`keydown` 特殊键码 + IME 组合 + `paste` 事件 ∥ 选区非空时 Ctrl+Shift+C 复制不发给 pty） | 仅 `terminal-core.mjs` |
| `thincoder-server/public/terminal-link.mjs` | **传输客户端**：WebSocket 建链 ∥ 二进制帧 = pty 字节（双向）∥ 文本帧 = JSON 控制（收 `ready`/`exit`/`error`/`pong`；发 `resize`/`ping`）∥ 心跳（30s 文本 ping；60s 无下行 ⇒ 本地判死）∥ 断开态上抛（回调——文案归宿主） | 仅 `terminal-core.mjs`（增量 UTF-8 复用） |
| `thincoder-server/public/views-sandbox-terminal.mjs` | **控制台消费件（本期唯一落地点）**：终端窗（`modal.mjs` 壳——大窗类）∥ 状态行（连接中/已连接 `cols×rows`/已断开/退出码）∥ 重连钮（新会话）∥ i18n 文案 ∥ 关窗收口 | `modal.mjs` ∥ `i18n.mjs` ∥ 核三件 |

### 2.2 能力表 v1（真终端声明 = `TERM=xterm-256color`；覆盖判据 = `vim`/`top`/`bash` 行编辑实走）

| 面 | v1 支持 | 不做（登记） |
|---|---|---|
| 字符网格 | 单双宽字符（东亚宽/全角 = 2 列；边界列折行）∥ 自动换行（DECAWM `?7`）∥ 制表位（HT 每 8 列 + HTS/TBC） | 组合字符（combining marks——原样按单列落格）∥ emoji 变体序列（按 `wcwidth` 表值） |
| SGR | `0/1/2/3/4/5/7/8/9` 与对应复位（`22–29`）∥ `30–37/40–47/90–97/100–107` ∥ `38;5;n`/`48;5;n`（256 色） ∥ `38;2;r;g;b`/`48;2;r;g;b`（真彩） ∥ `39/49` | 闪烁（`5`——静态呈现）∥ 下划线样式（`4:2` 类子参数）∥ 超链接（OSC 8）|
| 光标 | CUP（`H`/`f`）∥ 上下左右（`A/B/C/D`）∥ 列定位（`G`）/行定位（`d`）∥ 下/上移行（`E/F`）∥ 保存/恢复（`ESC 7`/`ESC 8` ∥ `s`/`u`）∥ 显示/隐藏（`?25`）∥ 形状（DECSCUSR 块/条——渲染取块形即止） | 光标 blink 由 CSS 固定（不随 `?12` 切换） |
| 擦除/插删 | ED（`J 0/1/2`）∥ EL（`K 0/1/2`）∥ ECH（`X`）∥ ICH/DCH（`@`/`P`）∥ IL/DL（`L`/`M`）∥ SU/SD（`S`/`T`）∥ 插入模式（IRM `4`） | 多字符重复（`b`——按逐个处理） |
| 屏与滚动 | 滚动区（DECSTBM `r` + 区内滚）∥ 备用屏（`?1049`/`?47`/`?1047`——进出清屏语义）∥ 卷回 1000 行（环） | reflow（缩放不回流——TUI 收 SIGWINCH 自绘；普通输出硬裁/补空） |
| 模式位 | `?1`（应用光标键）∥ `?6`（origin mode）∥ `?7`（换行）∥ `?25`（光标）∥ `?2004`（bracketed paste——开则粘贴包 `ESC[200~`…`ESC[201~`） | `?3`（80/132 列切换）∥ `?1000/1002/1006`（鼠标——用户明令不做） |
| 字符集 | G0/G1 设计（`ESC ( )`）∥ DEC 特殊图形（线绘 → `┌─┐│└┘` 映射） | 其余国家字符集（按 ASCII 落） |
| OSC | 吞掉到 `BEL`/`ST`（题头 `0/2` 不消费——控制台标题不随终端换） | OSC 52（剪贴板——安全面不加戏）；其余 OSC 面上层不解释 |
| 键盘 | 可打印字符（含 IME 组合提交）∥ Enter（`\r`）∥ Backspace（`\x7f`）∥ Tab（`\t`）∥ Shift+Tab（`ESC[Z`）∥ Esc ∥ 方向键/Ctrl+方向键/Home/End/PageUp/PageDown/Insert/Delete（普通/应用两态——随 `?1`；xterm 修饰形 `ESC[1;<m>X`）∥ F1–F12 ∥ Ctrl+字母（控制码 `0x01–0x1a`）∥ Alt+键（`ESC` 前缀） | 鼠标事件 ∥ 粘贴以外的剪贴板读取（读剪贴板面零触） |
| 传输 | 二进制帧 = pty 字节双向 ∥ 文本帧 JSON 控制（`resize`/`ping` 上行；`ready`/`exit`/`error`/`pong` 下行——帧协议单源 = `sandbox/SANDBOX.md` §3） | 压缩/多路复用/断点续传 |

### 2.3 键盘编码表（v1——`encodeKey(event, modes)` 纯函数；`modes` = `{ applicationCursorKeys, bracketedPaste }`）

| 键 | 编码（普通态 ∥ 应用态） |
|---|---|
| 方向键 ↑↓→← | `ESC[A`…`ESC[D` ∥ 应用态 `ESCOA`…`ESCOD` |
| Home ∥ End | `ESC[H`/`ESC[F` ∥ 应用态 `ESCOH`/`ESCOF` |
| PageUp ∥ PageDown ∥ Insert ∥ Delete | `ESC[5~` ∥ `ESC[6~` ∥ `ESC[2~` ∥ `ESC[3~` |
| Ctrl+方向键（例 Ctrl+←） | `ESC[1;5D`（修饰码 = 1 + Shift(1) + Alt(2) + Ctrl(4)） |
| F1–F4 ∥ F5–F12 | `ESCOP`…`ESCOS` ∥ `ESC[15~`…`ESC[24~` |
| Tab ∥ Shift+Tab ∥ Enter ∥ Backspace ∥ Esc | `\t` ∥ `ESC[Z` ∥ `\r` ∥ `\x7f` ∥ `\x1b` |
| Ctrl+字母（A–Z）∥ Ctrl+Space ∥ Ctrl+`[`/`\`/`]`/`^`/`_` | `0x01–0x1a` ∥ `\x00` ∥ `0x1b–0x1f` |
| Alt+键（例 Alt+f） | `ESC` + 该键原码（`\x1bf`） |
| 可打印字符（含 IME 提交 ∥ 粘贴文本） | UTF-8 字节（`TextEncoder`——粘贴面 bracketed paste 包裹见 §2.2 模式位行） |

### 2.4 渲染与尺寸

- **量宽**：隐藏量尺（`"M"×N` 文本节点）实测 cell 宽高 ⇒ `cols = floor(面宽 / cell宽)` ∥ `rows = floor(面高 / cell高)`；窗尺寸变化（`ResizeObserver` + 150ms 去抖）⇒ 重算 ⇒ `onResize(cols, rows)`（消费件转 `resize` 帧）。
- **脏行重渲**：解析写入标记脏行（含光标行）；每帧（`requestAnimationFrame`）只重建脏行节点；SGR 段 = 同行相邻同属性单元格合一段。
- **卷回视口**：视口行 = 卷回尾部 + 屏内容；滚轮/Shift+PageUp 上滚（输入/新输出 ⇒ 回底并显示最新）。
- **调色板**：18 枚变量（`--term-bg` ∥ `--term-fg` ∥ `--term-c0..c7` ∥ `--term-c8..c15`）——`:root` 唯一值源（`webui/STYLE.md` §2.1 底座登记；面内零颜色字面量）。
- **粗体例外**：面内 cell 允许 `font-weight`（登记例外——STYLE 「零粗体」口径的终端面除外）；其余面零粗体不变。

### 2.5 传输客户端（`terminal-link.mjs`）

- **建链**：`new WebSocket(url)`（同源；cookie 随握手）⇒ `onopen` ⇒ 首帧即发 `resize`（当期尺寸）⇒ 就绪帧 `ready` ⇒ 消费件置「已连接」态。
- **数据**：`onmessage` 分派——`ArrayBuffer` ⇒ 增量 UTF-8 解码 ⇒ 交网格写；文本 ⇒ JSON 控制（`ready`/`exit`/`error`/`pong`）。
- **上行**：键入/粘贴 ⇒ `send(字节)`（二进制帧）；尺寸变化 ⇒ `{"t":"resize","cols","rows"}`。
- **心跳**：30s 发 `{"t":"ping"}`；60s 内无任何下行（字节/控制帧）⇒ 本地判死（回调 `onClose("stale")`）；收到 `pong` 或任意下行 ⇒ 重置计时。
- **断开态**：`close`/`error`/判死 ⇒ 回调（`{ reason }`）——文案与「重新连接」钮归消费件；**重连 = 新会话**（无重放/无恢复——服务端语义单源 = `sandbox/SANDBOX.md` §3）。
- **零控制台依赖**（KD-SV-181）：错误只上抛码（`container_not_running`/`engine_unreachable`/`exec_failed`/`session_closed`）——文案由消费件 `t()` 渲染。

### 2.6 复用边界（本件 = 可复用；本期一处落地）

- **复用面 = 三件**（`terminal-core.mjs`〔落地实拆三档——+ `terminal-vt.mjs` ∥ `terminal-codec.mjs`，逻辑一件〕 ∥ `terminal-render.mjs` ∥ `terminal-link.mjs`）：零控制台依赖、零外部资源、零构建（ESM 直载）；宿主契约 = ① 一个尺寸可测的挂载元素 ② `onData(bytes)` ③ `url`（WS 端点）④ 自备壳与文案。
- **本期唯一落地点** = 管理页容器行「终端」钮（`views-sandbox-terminal.mjs` + `views-sandbox-containers.mjs` 第七钮接线；消费面 = `webui/SANDBOX.md` §2.1①）。
- **将来面（登记，不实施）**：成员工作区终端（用户预告方向）∥ 桌面/VSC 端接入（各端自建宿主壳——核三件届时按端侧装配面另裁）∥ 多终端并置/多标签。
- **不做的复用形态**：不做 npm 包化 ∥ 不做跨端共享包（`@thincoder/render-core` 式抽取）——v1 不值（核族合计 **1195** 行，复制成本低于包化机械）。

### 2.7 最近先例

- **窗与组件先例**：弹窗族 `modal.mjs`（控制台公共弹窗件——KD-SV-31：原生 `<dialog>` 基座 ∥ 单例；`webui/ADMIN.md` §2.1①）——终端窗（`views-sandbox-terminal.mjs`）沿同壳同单例 ∥ **两挂载件先例** = `host-credential.mjs`（一件两页挂载——沙盒页 ∥ 对话页；`webui/SANDBOX.md` §2.1①）；对齐 = 独立 `.mjs` 件 + 挂载点接线；**偏离 = Esc 不关窗**（终端要用 Esc——唯一偏离点，理由在册）。
- **无先例两件（显式声明）**：自搓 WS 服务端（`gateway/ws.mjs`——仓库内无 WS 服务端先例；服务端会话链单源 = `sandbox/SANDBOX.md` §3）∥ VT 解析/字符网格（`terminal-core.mjs`——无终端核先例）；两件设计判据 = 本档 §2 ∥ `sandbox/SANDBOX.md` §3（无先例坐标可沿用）。

## 3. 文件账（本面文件行）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/public/terminal-core.mjs` | **495** | 网格模型 + 装配（§2.1） |
| `thincoder-server/public/terminal-vt.mjs` | **117** | VT 解析面（§2.1） |
| `thincoder-server/public/terminal-codec.mjs` | **89** | 编解码面（§2.1） |
| `thincoder-server/public/terminal-render.mjs` | **361** | DOM 渲染 + 输入捕获（§2.1） |
| `thincoder-server/public/terminal-link.mjs` | **133** | WS 传输 + 心跳（§2.1/§2.5） |
| `thincoder-server/public/views-sandbox-terminal.mjs` | **125** | 控制台消费件（终端窗——本期唯一落地点） |
| **面小计** | **1320**（六档：495 ∥ 117 ∥ 89 ∥ 361 ∥ 133 ∥ 125） | —— |

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| 容器终端 v1（功能点 51 ∥ AC-51；判据落点 = 本行） | **终端核三件在册且零控制台依赖**（三件 import 面无 `i18n.mjs`/`modal.mjs`/`dom.mjs`——机检 import 行）∥ 能力表 v1 逐面在册（§2.2：SGR 16/256/真彩 ∥ 光标系列 ∥ 擦除/插删 ∥ 滚动区+备用屏 ∥ 模式位 ∥ 线绘字符集 ∥ 键盘全套）；**`vim`/`top` 全屏 TUI + `bash` 行编辑 + 中文（IME 提交）实走通过** ∥ 键盘编码表逐键断言（§2.3——含应用光标键两态）∥ 宽字符占两列 + 边界折行断言 ∥ 卷回 1000 行 ∥ 调色板 18 变量 `:root` 单源（面内零颜色字面量）+ 粗体例外登记 ∥ 尺寸链路（`ResizeObserver` ⇒ 量宽 ⇒ `resize` 帧）∥ 断开态 = 文案 + 重连钮（新会话语义）∥ 复用边界句在册（§2.6）；判据全文 = 本档 §2 ∥ `sandbox/SANDBOX.md` §3 容器终端块 ∥ `webui/SANDBOX.md` §2.1①/§4 | 单元测试档（终端核纯件直测）+ 收口轮（浏览器实走） |

## 5. 边界（本面不做）

- **鼠标/图片/文件传输**（用户明令——不做）∥ 组合字符渲染 ∥ reflow（重排）∥ 会话持久化/重放（tmux 语义）∥ 多标签 ∥ OSC 52 剪贴板读写 ∥ 终端内搜索 ∥ 字号缩放控件。
- **跨端共享包化**（核三件 npm 化/抽取——§2.6）∥ 桌面/VSC/成员面接入（登记——届时另裁）。

## 6. 上抛/余项

- 无独立上抛项。
