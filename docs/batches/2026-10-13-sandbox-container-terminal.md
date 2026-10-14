# 2026-10-13 · 沙盒容器终端 v1
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 21:11「我们能不能做一个虚拟终端连接到容器的控制台啊？」+ 21:13「真终端自己搓一个如何？」+ 21:17「可以啊，搓，可能不止这一处用，没准将来也会让用户能用终端方式连接他的工作区。」；立案 + 设计派发授权。
> 台账 = #1374（server · 归批）。前情 = 无（独立批；与 #1373 执行面重做无依赖——终端走既有容器族 Docker 直连）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · 沙盒容器终端 v1（自搓真终端——管理页容器行「终端」钮）**

- **来源**：用户 2026-10-13 21:11 想法（「我们能不能做一个虚拟终端连接到容器的控制台啊？」）→ 21:13（「真终端自己搓一个如何？」）→ 21:17「可以啊，搓，可能不止这一处用，没准将来也会让用户能用终端方式连接他的工作区。」= **立案 + 设计派发授权**。台账 **#1374**（server）。
- **形态（父侧提案获准）**：**自搓真终端 v1**——三块全自持：① 前端终端核（自搓：字符网格/SGR 颜色 ∥ 光标定位/擦除 ∥ 滚动区 ∥ 备用屏 ∥ 键盘全套编码——零外部前端件，控制台「零框架 · 零外部资源」惯例保）；② 双向通道（浏览器 WebSocket〔原生〕↔ 服务端最小握手/帧实现——纯 node）；③ 容器侧**真 pty**（既有 Docker 直连加「开会话 + TTY」调用；窗口缩放同步）。
- **范围（一块石头）**：管理页容器行「终端」钮——弹出输入/输出窗；验收面 = 能跑 `vim`/`top` 一类全屏 TUI + 敲命令/行编辑（中文经 pty 正常）。落点 = 设计轮定——终端核按**可复用件**做（用户 21:17 语：不止这一处用；本期一处落地）。
- **关键判据**：① 零外部前端件（自搓——不引终端组件库）∥ ② 真 pty（非伪终端）∥ ③ 终端核 = 可复用件（不绑死单页）∥ ④ 判权 = `requireAdmin`（管理面——沿容器族）∥ ⑤ 上行/下行双向流（敲键上行 ∥ 字节下行 ∥ resize）。
- **本期不做（边界）**：成员工作区终端（用户预告方向——**登记不实施**）∥ 桌面/VSC 端接入（核件复用面届时另裁）∥ 鼠标事件/图片协议/文件传输 ∥ 伪终端降级形态。
- **已核/未核**：已核 = 容器面无既有 exec/TTY 管线（全域 "exec" 均为 SSH 主机面）∥ 容器族经 `container-routes.mjs` 直调节点 Docker API（KD-SV-79 引擎即真源）∥ 日志面输出侧先例（tail 有界 + 解复用——KD-SV-93）。**未核（设计轮实证，勿预支）**：`docker.mjs` 的 exec 升级/hijack 流式支持成色 ∥ 浏览器⇄服务端双向流（仓库内无成型先例——须定形握手/帧/心跳/断线语义）。
- **授权口径**：用户 21:17「可以啊，搓」= **立案 + 设计派发**授权；**其余链节（设计评审点火 ∥ §4 批准 ∥ 实施派发 ∥ 收口提交）未授权——逐节呈报待点**。
- **排期**：设计派发排 #86（重做批设计）之后——同档交叠（`sandbox/SANDBOX.md` ∥ `webui/SANDBOX.md` 设计面），调度器按文件域自动排队；不插队。

**2026-10-13 · 用户授权（自动跑）**：用户原话「自动跑」（21:19）——承父侧口径备忘（前条「其余链节未授权」句所指）。⇒ 本批**设计评审点火权 ∥ §4 用户批准权（代签）∥ 修正/实施轮派发 ∥ 收口核销与提交（双推）∥ 令牌终消费**——均委托父侧自动执行，直至本批收口。**父侧自缚三条（本仓惯例·先例同形）**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发），每次代签在 §4 写明「父侧代签（用户 21:19 授权）+ 依据」；② 新范围/口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。默认全自动，用户随时可打断。

**2026-10-13 23:2x · 实施上抛两裁（父侧裁定——#97 服务端舱交付前提问；均维持其实现，零代码改动）**

- **① 建 exec 409 归属**：§3 in-band 四码行「`exec_failed`（引擎拒 exec——409 ∥ 非 2xx）」与 §12 E61「建 exec 409（窗口期容器被停）⇒ `container_not_running`」相抵——**裁 = E61 为准**（运行态判据 :252 同向）；#97 实现（建 exec 409 ⇒ `container_not_running` ∥ 余非 2xx ⇒ `exec_failed` 携引擎原文）= 正确，保持。
- **② `session_closed` 发射面**：§3 四码之四服务端零发射点（§3 同块「断开只由 WS close 表达（零 bye 帧）」为准）——**裁 = 维持不发射**（1000/1001 已表达收口语义；不加 `server_stop` 前帧补丁——与零 bye 帧原则相抵）；该码标「零发射——前端兜底词汇」。
- **落法**：设计档两处收正 = **父侧直接执行**（单行 ∥ 零新语义 ∥ 可 revert——`SANDBOX.md:271` 四码行 + 变更记录一行）；#97 零触设计档 ✓；裁定已回 #97（send 已送达）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮已落地——评审 #92 十条全采纳；AC-51 入册回流已落；父侧核读即入 §4）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 批任务与设计（eng-designer）——2026-10-13 · sandbox-container-terminal 批 · 设计轮

**交付物①：新档 `docs/server/design/webui/TERMINAL.md`（终端核单源——核三件 + 消费件 ∥ 文本域解析与调色板 ∥ 键盘编码表 ∥ 能力表 v1 ∥ 复用边界 ∥ KD-SV-181/182/183 ∥ 文件账 ∥ AC 判据 ∥ 边界）。**
**交付物②：同源随动档八件（`sandbox/SANDBOX.md` §3/§8①/§9/§11/§12/§13/§14/§15/§16 ∥ `webui/SANDBOX.md` §2.1①/§3/§4/§6 ∥ `gateway/API.md` §2.5/§4 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `webui/STYLE.md` §2.1/§3/§4 ∥ `webui/WEBUI.md` §1/§5/§7 ∥ `design/PROJECT.md` §1/§2.1/§3/§4 ∥ `docs/README.md` §1——各档变更记录在册）。产品码零触（设计轮）。**

**2.1 本批覆盖的需求条目**

| # | 需求条目（原始口径 = 用户 2026-10-13 21:11/21:13/21:17 三句；需求档**尚无**终端条目 ⇒ 拟入册） | 设计判据（判据全文所在） | 验收判据（机检向） |
|---|---|---|---|
| 1 | 21:11「容器里想要个终端」——容器行给入口 | `sandbox/SANDBOX.md` §3 容器终端块 ∥ §8①（第七钮）∥ `webui/SANDBOX.md` §2.1① | 容器行第七钮「终端」在册（门 = 运行中；非运行禁用）；点钮 ⇒ 终端窗（题含容器名）——前端腿 = 批内 UI 件用例 |
| 2 | 21:13「真终端」——非伪终端仿真，能跑全屏 TUI | `webui/TERMINAL.md` §2（核三件）∥ §3 能力表 v1 ∥ `sandbox/SANDBOX.md` §3（`Tty: true` + `TERM`/`LANG` 注入） | 会话链 = Docker exec（`Tty: true`）——建 exec 体逐值断言（N83）；真机：`vim`/`top` 可用（收口轮） |
| 3 | 21:17「终端核按可复用件做」——零控制台依赖、可复用 | `webui/TERMINAL.md` §1 KD-SV-181（三件/边界）∥ §2.6 复用边界 ∥ `webui/WEBUI.md` §1（档目）+§5（件行） | 核三件纯件（零 DOM/网络/控制台依赖——单元测试档：`terminal-core.mjs` 直测）；`webui/TERMINAL.md` 入档目 |
| 4 | （承 3）可复用件的测试面 | `webui/TERMINAL.md` §4（AC 判据） | 批内件两档直测（核件纯函数 + 窗件渲染/收口）——`docs/batches/2026-10-13-sandbox-container-terminal{,-ui}.test.mjs`（实施轮落盘；§5 记） |

**2.2 明确不在本批（边界）**

鼠标协议 ∥ 图片协议 ∥ 文件传输 ∥ 会话持久化/重放（tmux 语义）∥ 自选命令（命令 = 服务端常量）∥ 会话数上限 ∥ 前台进程追捕（Docker exec 无 kill 面——如实披露）∥ 终端内搜索/字号缩放 ∥ **主机 `exec`（SSH）交互式 PTY**（属主机凭据余项，与本批容器面无关——勿混记）。全文 = `sandbox/SANDBOX.md` §15 终端余项行 ∥ `webui/TERMINAL.md` §5。

**2.3 受影响文件表（以实施当刻盘面实读为准；行数 = 设计估）**

服务端（`thincoder-server/`）：

| 档 | 方向 | 行数 | 职责 |
|---|---|---|---|
| `src/gateway/ws.mjs` | 新增 | ≈260 | 最小 WebSocket 服务端（握手/帧编解码/ping-pong/close/上界；零依赖） |
| `src/sandbox/docker-exec.mjs` | 新增 | ≈230 | Docker exec 升级传输（建 exec／升级 start（`node:http` 劫持）／resize／inspect／收口） |
| `src/sandbox/terminal-routes.mjs` | 新增 | ≈300 | 升级路一枚（101 前判权/同源门；会话桥/帧协议/心跳/收口幂等/会话表/审计两 kind） |
| `src/gateway/server.mjs` | 改（现读 243） | +≈12 | `upgrade` 挂点（未匹配 ⇒ 404 后断开） |
| `bin/thincoder-server.mjs` | 改 | +≈9 | hub 装配／upgrade 传参／停机收口 |
| `src/accounts/audit.mjs` · `src/gateway/errors.mjs` | 不改 | ±0 | 两 kind 走 `sandbox_event`（kind 非枚举）；in-band 四码 = 帧内码（非错误形） |

前端（`thincoder-server/public/`）：

| 档 | 方向 | 行数 | 职责 |
|---|---|---|---|
| `terminal-core.mjs` | 新增 | ≈520 | 终端核·纯件（VT 解析／字符网格（宽字符/卷回 1000/备用屏）／键盘编码／增量 UTF-8） |
| `terminal-render.mjs` | 新增 | ≈300 | DOM 渲染 + 输入捕获（脏行重渲／光标／卷回视口／量宽／隐藏输入区） |
| `terminal-link.mjs` | 新增 | ≈210 | WS 传输客户端（建链／帧分派／心跳／断开上抛） |
| `views-sandbox-terminal.mjs` | 新增 | ≈200 | 终端窗（消费件：`modal.mjs` 壳／状态行／重连／i18n／关窗收口） |
| `views-sandbox-containers.mjs` | 改（实读 419） | +≈13 | 第七钮「终端」+ 窗挂载 |
| `style.css` | 改（实读 358） | +≈40 | 终端调色板 18 变量入 `:root` + 终端面类族五枚（零动画／零新悬停规则） |
| `i18n-{zh,en}-sandbox.mjs` | 改（实读 233 ∥ 233 行） | +12 键/表 | `admin.sandbox.terminal*` 键族 |
| `i18n-{zh,en}-system.mjs` | 改 | +2 键/表 | `audit.sandboxKind.terminal_open` ∥ `terminal_close` |
| `views-audit.mjs` | 改 | +2 | `SANDBOX_KIND_KEYS` 映射两行 |

判据/记录面：批内件两档 ≈420 ∥ ≈380（实施轮落盘；入链随正 = 父侧件，见 2.5）。

**2.4 验收判据（指向需求条目；每条机检可验）**

- 条目 1 ⇒ 钮/门/窗在册（门 = 运行中；非运行禁用）——前端腿用例 + 真机
- 条目 2 ⇒ **会话链三步逐值**（读容器 ⇒ 建 exec（`Attach*` 三旗 ∥ `Tty` ∥ `Env` 两键 ∥ `Cmd` 常量）⇒ 升级 start（`101`））+ 双向字节环回 + `resize` 施加上下文（**N83**）
- 条目 2（真终端达效）⇒ **真机收口（ESC `.6`）**：`vim`／`top` 全屏 TUI ∥ 中文输入（行编辑不呈八进制转义）∥ 关窗收口（`docker exec` 进程零残留）
- 条目 3 ⇒ 核三件纯件直测（零 DOM/网络依赖）+ 档目/件行在册（`webui/WEBUI.md` §1/§5；档目断言件随正 +4 名）
- 收口语义 ⇒ 收口三件逐呼（`\x04` ∥ 关 Docker 流 ∥ 关 WS）+ 幂等 + 审计两行（**N83｜B80｜B81**）
- 判权/门 ⇒ 401/403/404 皆在 101 之前（**E62**）；in-band 四码（**B79｜E61**）；协议错收口 1002（**E63**）
- 尺寸 ⇒ 就绪前挂起 ∥ 就绪后一次施加 ∥ 越界忽略（**N84｜B79**）
- 停机 ⇒ 在飞会话全收口（`reason='server_stop'`）（**N85**）
- 心跳 ⇒ 30s ping / 60s 判死两向（**B80**）
- 零回归 ⇒ 既有 400/404/502 族映射不变；错误形零新码（in-band 码 = 帧内语义）
- 预算 ⇒ 四档 ≤ 500 软线；核件 `terminal-core.mjs` ≈520 **越 500 软线——拆案触发点在册**（渲染/网格可再拆）

**2.5 上抛/披露（子段全形 = `sandbox/SANDBOX.md` §16 R85；本处列要）**

- **[上抛·待裁] 需求档回笔（主 agent 笔）**：需求档沙盒块/验收表**无终端条目** ⇒ 请入册功能点 + AC（编号建议 = 功能点 51 ∥ AC-51——承 AC-50 顺序）；判据全文 = `sandbox/SANDBOX.md` §11 终端行 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63）。写法/计数 = 主 agent 定。
- **[上抛·知会] 随正件（父侧/实施轮，以当刻盘面实读为准）**：档目断言件 `docs/batches/2026-10-08-server-public-structure.test.mjs`（+4 名 + 指纹/键数）∥ i18n 键数指纹件 ∥ 批内件两档入链（若门禁链仍在册）。
- **[上抛·知会] 披露（不阻塞）**：前台进程不追捕（断开时在跑的程序可能续存至自身退出）∥ pty 内容零落库零日志 ∥ 会话无持久化（重连 = 新会话）∥ 会话数无上限 ∥ `LANG` 条件注入（容器自带 locale 时零覆盖）。
- **[上抛·知会] 机检读数（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`）**：**FAIL——两门皆红，均为存量**。① 锚：35 条悬空（全部在 `docs/core/**` 等**非本批域**——本批八档零悬空）；② 行宽：64 行超 300 字符（存量：sandbox/SANDBOX.md §16 R 行、STYLE.md:256/271、WEBUI.md:19/70、PROJECT.md:722/745/748 等先于本批；**本批新引入 ≈8 行**——初稿 ≈11 行、设计轮已就地拆行降至 ≈8；余者为「表行/密集枚举行」形态（R85 行 ∥ §11/§12/§4 行），与既有 R51–R74 行同形；如需收口 = 单列拆行轮）。

**2.6 设计轮自检（pre-review）**

① 需求五元素：**不适用**——需求档尚无本条；本批以用户三句 + 设计判据行为输入（回笔项 = 2.5）。② 受影响文件全量 + 行数：见 2.3（新增/改向/±0 三类齐）。③ 验收判据逐条回指：见 2.4（每条对应需求条目 + 用例号/真机项）。④ UI/交互决定全部落纸：钮/门/窗/状态行/重连/Esc 语义/单例/尺寸联动/i18n 键族——全在 `webui/SANDBOX.md` §2.1① 与 `webui/TERMINAL.md`；**未决项 = 0**（无 `open` 标记）。多实现面一致性：本批单面（控制台）——`webui/TERMINAL.md` = 核单源 ∥ `sandbox/SANDBOX.md` §3 = 服务端单源，两条链各自闭环。

### 修正轮（设计评审轮 1 修复——fix 轮）——2026-10-13 · eng-designer

**承批档 §3 轮次 1（评审 #92：🔴0 ∥ 🟡7 ∥ 🔵3——十条全采纳，零驳回）；修正轮零新范围（评审发现直接导出）；评审已 pass——修正后父侧核读即入 §4，无需复评。**

| 号 | 级 | 处置 | 落点（修正后现读 file:line） |
|---|---|---|---|
| 1 | 🟡 | §11 补**容器终端判据行**（需求块行 → 判据 ①–⑨ → 载体 = §3 ∥ §12 ∥ §14）；三处指涉随之可解析 | `docs/server/design/sandbox/SANDBOX.md:472` |
| 2 | 🟡 | §2.1 `sandbox_event` 行**写入点列补 `terminal-routes.mjs`（拟新增——容器终端升级路）** | `docs/server/design/accounts/ACCOUNTS.md:71` |
| 3 | 🟡 | AC-51 入册回流 = 三处翻「已入册（2026-10-13）」+ R85① 翻「已落」；同族扫面补漏第 4 处（STYLE 行） | `sandbox/SANDBOX.md:757` ∥ `webui/TERMINAL.md:98` ∥ `webui/SANDBOX.md:152` ∥ 补漏 `webui/STYLE.md:292` |
| 4 | 🟡 | §7 验收索引：webui 行补 AC-49 + AC-51 ∥ sandbox 行补 AC-51 | `docs/server/design/PROJECT.md:171` ∥ `:174` |
| 5 | 🟡 | 核件 ≈520 补「实读为准 + 越线拆案触发点在册」显式处置（候选 = VT 解析 ∥ 网格模型两档） | `webui/TERMINAL.md:88` |
| 6 | 🟡 | 补 §2.7「最近先例」（弹窗族 `modal.mjs` ∥ 两挂载件 `host-credential.mjs` ∥ 窗单例 KD-SV-31；Esc 偏离在册；WS/VT 两件 = 显式「无先例」） | `webui/TERMINAL.md:79–82` |
| 7 | 🟡 | 终端钮**入**行闩口径补 +「六钮」措辞同拍（`:21` ⇒ 七钮 ∥ `:22` 闩覆盖面 ⇒ 七钮 ∥ `:25` 钮句补入闩） | `webui/SANDBOX.md:21` ∥ `:22` ∥ `:25` |
| 8 | 🔵 | AC-19 续机检行补「终端面除外」限定 | `webui/STYLE.md:288` |
| 9 | 🔵 | 三处读数收平：+≈1240 ⇒ **+≈1243**（链 ≈3637 ⇒ **≈3640** ∥ ≈3979 ⇒ **≈3982**）∥ 键 ≈221 ⇒ **≈220 ∥ 220**（底座条随链 **≈220 ⇒ ≈246**）∥ `bin` 行补本批 +≈9 ⇒ **≈238** | `webui/SANDBOX.md:98` ∥ `:99` ∥ `:132` ∥ `:136` ∥ `sandbox/SANDBOX.md:626` |
| 10 | 🔵 | 光标措辞收窄（形状随模式；闪烁 = CSS 固定） | `webui/TERMINAL.md:22` |

**关键决策（修正轮）**：① 号 7 = **入闩**（第七钮「终端」随拍收进行闩——窗类入口在飞期一律不可开，沿「详情」口径；完成回门矩阵态）；② 号 4 = AC-49 只入 webui 行（判据行在 `webui/SANDBOX.md` §4——沙盒域无判据行）；③ 号 9 的两处连带（底座条 ∥ 面小计链）= 机械分项和随正，非新语义。

**同拍（六档变更记录在册）**：`sandbox/SANDBOX.md` ∥ `webui/TERMINAL.md` ∥ `webui/SANDBOX.md` ∥ `webui/STYLE.md` ∥ `accounts/ACCOUNTS.md` ∥ `design/PROJECT.md`。

**机检读数（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——修正轮后）**：锚 = 悬空 **35**（与修正前逐值同——本批域零新增；新增两枚皆「拟新增——列报 · 不入闸」；中途曾现 `webui/TERMINAL.md:82` 一枚未标「拟新增」⇒ 悬空 36，当场补标回落）∥ 行宽 = **25** 行超 300（与修正前同集——本批域零新增；新写/改行全部 ≤300 字符或表格行豁免，六档非表格行零新增）。

**披露（不阻塞）**：派发给的需求档坐标与现读有漂移（AC-51 = `docs/server/requirements/PROJECT.md:409` ∥ 变更记录 `:726`；派发值 = `:398` ∥ `:714`，±11 行）——文档行不引线号，修正不受影响。

**产品码零触（修正轮）。**

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

设计评审（sandbox-container-terminal 批 · 设计轮）——评审范围 = `webui/TERMINAL.md` ∥ `sandbox/SANDBOX.md` ∥ `gateway/API.md` ∥ `webui/SANDBOX.md` ∥ `webui/STYLE.md` ∥ `webui/WEBUI.md` ∥ `accounts/ACCOUNTS.md` ∥ `design/PROJECT.md` ∥ `requirements/PROJECT.md`（九档全读）；本轮计数：**🔴 0 ∥ 🟡 7 ∥ 🔵 3**。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 验收判据 / 文档状态 | 🟡 | `sandbox/SANDBOX.md` §11 无容器终端判据行（表止于卷族行 `sandbox/SANDBOX.md:471`；全档「终端」字面在 §11 区零命中），而本批变更记录称「§11 增终端判据行」（`sandbox/SANDBOX.md:760`）、§16 R85 指「判据全文 = `sandbox/SANDBOX.md` §11 终端行」（`sandbox/SANDBOX.md:756`）、`webui/SANDBOX.md:150` 同指「`sandbox/SANDBOX.md` §11 终端行」——文档状态不一致 + 悬空指涉（非机制相抵）：需求（功能点 51/AC-51）→ 设计判据映射缺行 | 按 §11 既有行形补容器终端判据行（需求块行 → 设计级判据 → 载体 = §3 容器终端块 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63） ∥ §14 KD-SV-175–180）；或同拍收正三处指涉 |
| 2 | 文档状态（同源随正） | 🟡 | `accounts/ACCOUNTS.md:269` 记「写入点增 `terminal-routes.mjs`（拟新增）」，但 §2.1 `sandbox_event` 行写入点列（`accounts/ACCOUNTS.md:71`）未列该档（全档仅 :269 一处命中 `terminal-routes`） | §2.1 写入点列补 `terminal-routes.mjs`（拟新增——容器终端升级路） |
| 3 | 文档状态（入册回流） | 🟡 | AC-51 已入册（`requirements/PROJECT.md:398` + 变更记录 `:714`），但三处仍留「尚无／拟入册」：`sandbox/SANDBOX.md:756` R85①「尚无容器终端条目」、`webui/TERMINAL.md:93`「AC-51——拟入册」、`webui/SANDBOX.md:150`「功能点 51 ∥ AC-51——**拟入册**」 | 三处翻「已入册（2026-10-13）」；R85① 翻「已落」收口 |
| 4 | 验收索引（板档） | 🟡 | `design/PROJECT.md` §7 验收索引未列 AC-51——sandbox 行（`design/PROJECT.md:173`，列「AC-36 ∥ AC-38 ∥ AC-40」等）与 webui 行（`:170`，列「AC-11–AC-30（控制台面）」等）皆无，而判据行在盘（`webui/TERMINAL.md:93` ∥ `webui/SANDBOX.md:150`）；同族 AC-49 亦缺（前批在案） | §7 两行补 AC-51（并同拍 AC-49）；写法照既有体例 |
| 5 | 文件账（层级） | 🟡 | `terminal-core.mjs`（拟新增）估 ≈520（`webui/TERMINAL.md:83`）越 500 软线，无拆分预案／拆分评审在案——KD-SV-181 自以「文件账红线（≤500 软线 ∥ ≤800 硬线）下按职责三分——单件塞全量必越线」（`webui/TERMINAL.md:11`）为拆分理由，核件单体仍越线（硬线 800 无险） | 补核件拆分边界／预案（如解析器 ∥ 网格模型两档），或「实施实读为准 + 越线拆案」显式处置（沿 `registry.mjs` 拆分预案先例） |
| 6 | 最近先例检查 | 🟡 | 本批设计面（`webui/TERMINAL.md` 全档 ∥ `sandbox/SANDBOX.md:246` 起终端块 ∥ `webui/SANDBOX.md:25-27` 终端块）无最近先例行（先例坐标 ∥ 对齐 ∥ 偏离），亦无「无先例」显式声明——两件新机制（自搓 WS 服务端 ∥ VT 解析/网格）缺先例坐标；同族批皆有（`webui/SANDBOX.md:23`「最近先例」 ∥ `webui/LEDGER.md:5`） | 补最近先例行（弹窗族 `modal.mjs` ∥ 两挂载件 `host-credential.mjs` ∥ 窗单例 KD-SV-31；Esc 不关窗 = 已记偏离点），WS／VT 两件显式声明「无先例」 |
| 7 | 清晰性（交互口径） | 🟡 | 容器行新增第七钮（`webui/SANDBOX.md:25`「容器行第七钮「终端」（门 = **运行中**——非运行禁用」），但动作族忙态闩覆盖面仍写「闩覆盖面 = 该行六钮（含「详情」——在飞期窗不可开）」（`webui/SANDBOX.md:22`）——终端钮入不入行闩／忙态未写 | 补一句终端钮与行闩／忙态的关系（入或不入），并同拍「六钮」措辞 |
| 8 | 机检口径一致性 | 🔵 | `webui/STYLE.md:288` AC-19 续机检仍写「`font-weight` 全 ≤400」，与同批例外（`webui/STYLE.md:26` 终端面例外 ∥ `:292`「全局 `font-weight ≤400` 判据在本面留白、余面不破」）并存——按现文机检会误红 | AC-19 续行补例外限定（终端面除外） |
| 9 | 读数账（估算链） | 🔵 | 三处小差：`webui/SANDBOX.md:130`「键 208 ∥ 208 ⇒ ≈221 ∥ 221 键」（+12 键 ⇒ 220）∥ `:98`「+≈1240 = 核三件 ≈1030 ∥ `views-sandbox-terminal.mjs` ≈200 ∥ `views-sandbox-containers.mjs` +≈13」（和 = 1243）∥ `sandbox/SANDBOX.md:633`「`bin` +≈9 入其行」而 bin 行（`:625`）未载本批 delta | 复算收平；bin 行补本批 +≈9（或在行内明写归属） |
| 10 | 措辞一致性 | 🔵 | `webui/TERMINAL.md:22`「光标元素（形状/闪烁随模式）」与 `:32`「光标 blink 由 CSS 固定（不随 `?12` 切换）」相抵（闪烁不随模式） | `:22` 收窄为「形状随模式；闪烁 = CSS 固定」 |

VERDICT: pass

## §4 用户批准（主 agent）

**2026-10-13 · 父侧代签（用户 2026-10-13 21:19「自动跑」授权——本批 §1 末条）**

依据三条齐备：① **设计评审 pass 0🔴**（§3 轮次 1——🔴0 ∥ 🟡7 ∥ 🔵3；评审 #92）；② **修正轮已落地并逐条核验**（#94——十项全落：`sandbox/SANDBOX.md:472` §11 判据行 ∥ `accounts/ACCOUNTS.md:71` 写入点 ∥ AC-51 回流四处 ∥ `design/PROJECT.md:171/:174` §7 双行 ∥ `webui/TERMINAL.md:88` 核件拆案触发点 ∥ `:79–82` 最近先例 ∥ `webui/SANDBOX.md:21/:22/:25` 七钮入闩 ∥ `webui/STYLE.md:288` 例外限定 ∥ 读数收平；父侧抽查 §11 行 ∥ 先例块 ∥ 批档 §2 修正轮块——在册）；③ **token 已签发**（在槽——运行态不落档）。

⇒ **批准实施**。**派发 = 两舱并行**（受影响表 16 档按面拆分——各舱 ≤15 档 ∥ 文件域不交叠）：**服务端舱 8 档**（`gateway/ws.mjs` ∥ `sandbox/docker-exec.mjs` ∥ `sandbox/terminal-routes.mjs` ∥ `gateway/server.mjs` ∥ `bin/thincoder-server.mjs` ∥ `i18n-{zh,en}-system.mjs` ∥ `views-audit.mjs` + 批内件服务端档）∥ **前端舱 8 档**（核三件 ∥ `views-sandbox-terminal.mjs` ∥ `views-sandbox-containers.mjs` ∥ `style.css` ∥ `i18n-{zh,en}-sandbox.mjs` + 批内件 UI 档）。收口轮（真机 `vim`/`top`/中文/关窗零残留——ECS `.6`）= 父侧。零新语义（实施 = 设计面直译）。

## §5 实施记录（eng-coder）

### 实施记录 · 前端舱（eng-coder）

**状态行**：实施完成（2026-10-13）

#### 5.1 交付摘要

前端舱（任务书 §2 + §4 派发；设计单源 = `docs/server/design/webui/TERMINAL.md`）全部落盘：

| 件 | 行数 | 内容 |
|---|---|---|
| `thincoder-server/public/terminal-core.mjs` | 494 | 网格模型 + SGR + 光标/擦除插删/滚屏/卷回环 + 模式位 + 核出口（转出 `terminal-vt`/`terminal-codec`） |
| `thincoder-server/public/terminal-vt.mjs` | 116 | 解析面（ground/esc/csi/osc/charset 状态机——拆案其二） |
| `thincoder-server/public/terminal-codec.mjs` | 88 | 编解码面（增量 UTF-8 ∥ 键盘编码 ∥ 粘贴包裹——拆案其三） |
| `thincoder-server/public/terminal-render.mjs` | 360 | DOM 渲染（脏行重渲 ∥ 光标元素 ∥ 卷回视口 ∥ 量宽 ⇒ cols/rows）∥ 输入捕获 |
| `thincoder-server/public/terminal-link.mjs` | 132 | WS 客户端（帧分派 ∥ 上行 ∥ 30s ping ∥ 60s 判死 ∥ 收口） |
| `thincoder-server/public/views-sandbox-terminal.mjs` | 124 | 终端窗消费件（状态行四态 ∥ 重连钮 ∥ Esc 不关窗 ∥ 同容器单例） |
| `thincoder-server/public/views-sandbox-containers.mjs` | 425（改） | 容器行第七钮（末位）+ 门（运行中）+ 入行闩 |
| `thincoder-server/public/style.css` | 379（改） | `:root` 终端 18 变量（16 色 + `--term-bg`/`--term-fg`）+ 面类族五枚 |
| `thincoder-server/public/i18n-{zh,en}-sandbox.mjs` | 247 ∥ 247（改） | +12 键/表（220 键/表） |

**批内件（开发期反馈环，随批留存、不入仓套件）**：`docs/batches/2026-10-13-sandbox-container-terminal-ui.test.mjs`（701 行，10 用例覆盖 ①–⑩）。定向读数：`node --test docs/batches/2026-10-13-sandbox-container-terminal-ui.test.mjs` ⇒ **10/10 pass**（本轮复跑 3 次同读）。

**其它实读**：`node --check` 十一档全绿；静态面逐档 200（`terminal-core/vt/codec/render/link` ∥ `views-sandbox-terminal` ∥ `style.css`）且字节同盘；**浏览器实走**（无头 Blink，`--dump-dom` 取值）：光标 `left:115.21px;top:125px` ⇒ `col = 15.000`、`row = 9.000`（整数落格）、`dyCursorVsRowTop = 0`——光标与行文本同基（内距补偿有效）；题头/状态行/关闭钮/重连钮/中文宽字符/256 色/真彩/反显/下划线/粗体/折行皆逐值在场。

#### 5.2 决策透明表

| # | 决策 | 理由 | 落点 |
|---|---|---|---|
| 1 | 核件实施实读越 500 软线 ⇒ 按设计 §3 预授权拆案，拆出 `terminal-vt.mjs`（解析面）+ `terminal-codec.mjs`（编解码面） | 设计明写「实施实读 >500 ⇒ 按职责界线拆」；核入口 494 行 ≤ 软线 | `webui/TERMINAL.md` §3（设计侧随正待落） |
| 2 | 面内几何（量尺/隐藏输入区/光标尺寸位置）走**内联样式**；颜色一律走 CSS 变量 | 几何随实测（cell 宽高）变，静态类不可承载；类名只用面类族五枚（颜色/类名面零扩散） | `terminal-render.mjs` |
| 3 | 终端面 `line-height: 1` ∥ `font-family: var(--mono)` | cell 网格对齐必需（量尺与行盒同高） | `style.css:376`；例外登记归 STYLE 侧（见 5.5 披露 ③） |
| 4 | 冒号子参组整组忽略（`4:2` ⇒ 落基础属性 `4`；`38:5:n` 冒号形同族不做） | 设计 §2.2 登记「下划线样式（`4:2` 类子参数）不做」；整组忽略避免子参串入属性流造成误复位 | `terminal-vt.mjs:90-96` |
| 5 | 尺寸上报加 `force` 形参（建链期强制上报，其余按「变更才报」去重） | 设计 §2.5 要求「`onopen` 首帧即发 `resize`」；纯去重会让重连链零帧（服务端退 80×24 初值） | `terminal-render.mjs:118-135` ∥ `views-sandbox-terminal.mjs:101` |
| 6 | 重复数夹取（ICH/DCH = 行宽；IL/DL/SU/SD = 区高） | pty 字节不可信，无界 `splice` 会冻结页 | `terminal-core.mjs:119-173` |
| 7 | 判死路 `finish()` 内补 `socket.close()` | 断开只由 WS close 表达；不收则服务端会话/`docker exec` 悬挂，且此后 `close()` 被 `closed` 卫短路成空操作 | `terminal-link.mjs:42-53` |
| 8 | 光标坐标补面内距（`padLeft`/`padTop`） | 绝对定位包含块 = padding box，行文本在 content box——不补则差一格（`--sp-4` 8px ≈ 一格宽） | `terminal-render.mjs:99-116/:228` |
| 9 | F1–F4 恒 SS3 形（`ESCOP`…`ESCOS`）；方向键/Home/End 两态（普通 `ESC[A` ∥ 应用态 `ESCOA`） | 设计 §2.3 键表逐键对齐 | `terminal-codec.mjs:31-34/:65-70` |

#### 5.3 审计与代码评审轮次与终态

| 轮次 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 内审 1 | 只读审计（对照设计单源 + AC 行逐条） | `pass`；零 🔴 ∥ 零静默简化 ∥ 零部分实现；🟡3/🔵5 全为记录面/随正面/记法面 | 无代码返工项；记录面项转 5.5 披露 |
| 代码评审 1 | advisor（code，全量） | `changes-required`：🔴1（重连链零首帧 resize）+ 🟡3（光标错格 ∥ 判死不收口 ∥ 无界重复数）+ 🟡2 记录面 + 🔵2 | 四条代码项全修（fix round 1） |
| 代码评审 2 | advisor（code，只核修复主张） | `pass`：四条主张逐条落档，未引入新问题 | 收敛 |
| 内审附带 | 弱断言复查 | 批内件两处期望值写错 + 一处恒真断言 | 已随 fix round 1 一并修正 |

**终态 = `clean`**（审计/评审共 3 轮；fix round 1 轮）

#### 5.4 fix round 1（代码评审 1 四条）

1. **重连首帧 `resize`**（🔴）：`layout(force)` + 消费件 `view.layout(true)`；批内件 ⑦ 补「重连 ⇒ 新链 `onopen` 首帧 = 当期尺寸 `resize`」断言，⑥ 补「`force` = 每链首报 ∥ 同链同尺寸不重发」断言。
2. **光标错格**（🟡）：量和并补面内距；批内件 ⑥ 补内距 8px 桩下 `left:8px`/`top:8px` 断言；浏览器实读 `col = 15.000 ∥ row = 9.000 ∥ dyCursorVsRowTop = 0`。
3. **判死不收口**（🟡）：`finish()` 补 `socket.close()`；批内件 ⑤ 补「判死 ⇒ socket 收口」断言。
4. **无界重复数**（🟡）：六处 `Math.min` 夹取；批内件 ① 补超大 `IL`/`ICH` 用例（区高/行宽夹取、零无界插入）。

#### 5.5 披露与上抛（不动本舱文件表外档）

- ① **随正件（父侧/文档层）**：`docs/batches/2026-10-08-server-public-structure.test.mjs`（`ANCHOR` 双指纹 + `:70` 键数基线 970∥975——本批 i18n 两表 +12 ⇒ 门面 ZH/EN 键集漂移，须随正；server 舱另有 system 部件 kind 两键同拍）。
- ② **同族跨批件**：`docs/batches/2026-10-13-sandbox-container-actions.test.mjs`（六钮序 + `:root` 58 变量计数——被本批第七钮与 18 变量打破；该件自注「他批改 `style.css` 时本件随之重核」）——**本舱未改他批件**，交父侧随正。
- ③ **设计档漂移（只报不改）**：实拆两件未入名册/账——`webui/TERMINAL.md:92`（面小计「四新档」）∥ `webui/WEBUI.md:32`（「+4」）∥ `webui/SANDBOX.md` §3 件表 ∥ `sandbox/SANDBOX.md:779`（R85②「档目断言 +4 名」）；读数行（`style.css` 379 ∥ i18n 247∥247 ∥ containers 425）待文档层按实读随正。`line-height: 1`/等宽字族例外句、`{ reason }` 记号（`TERMINAL.md:69` 与 `:68`∥B80 三处不一致，实现取字符串形）亦归文档层。
- ④ **未做的验证面**：真机 `vim`/`top`/中文输入/关窗零残留（ECS `.6` 收口轮）归父侧；本舱只到无头 Blink 级。
- ⑤ **临时件**：`.thincoder/tmp/term-harness/`（探针壳 + 服务 + Edge profile）与 `term-test.log` 用毕即净——现盘零残留。
- ⑥ **回写范围**：本舱只写本仓档（六新件 + 四改件 + 批内件 + 本 §5）；`.thincoder/tmp/**` 探针属零链路诊断面，用毕清除。

### 实施记录 · 服务端舱（eng-coder）

**状态行**：实施完成（2026-10-13）

> 状态行以正文行随 append 落（未调 `status` 动作——§5 内已有前端舱的状态行，避免工具按段定位时误覆同段他舱行）。落档人 = 服务端舱 eng-coder，落档时点 = 交付前（fix round 1 收口后）。

#### 交付摘要

服务端舱（任务书 §2.3 服务端表八档 + 批内件）全部落盘；批内件定向读数（本轮复跑多次同读）：`node --test docs/batches/2026-10-13-sandbox-container-terminal.test.mjs` ⇒ **12/12 pass ∥ 0 fail**（逐条读数见下）；`node --check` 十档全绿；全档 ≤500 软线（实测最大值 = 批内件主档 469）。

| 档 → 落点（file:line 键坐标） | 行数（设计估 → 实读） |
|---|---|
| `src/gateway/ws.mjs`（新） | `wsAcceptKey:33` ∥ `isWsUpgradeRequest:38` ∥ `writeUpgradeResponse:47` ∥ `refuseUpgrade:57` ∥ `encodeFrame:72` ∥ `encodeCloseFrame:98` ∥ `declaredFrameLength:107` ∥ `decodeFrame:116` ∥ `shutSocket:153` ∥ `createWsConnection:168–311` | ≈260 → 311 |
| `src/sandbox/docker-exec.mjs`（新） | `EXEC_EOF:17` ∥ `EXEC_CMD:20` ∥ `terminalEnv:33` ∥ `buildExecBody:40` ∥ `buildStartBody:52` ∥ `containerRunning:57` ∥ `startExecTransport:78` ∥ `closeExecSocket:149` ∥ `createExecOps:168` | ≈230 → 185 |
| `src/sandbox/terminal-routes.mjs`（新） | `matchTerminalPath:28` ∥ `isSameOrigin:41` ∥ `parseResizeControl:54` ∥ `execFailureInfo:62` ∥ `createTerminalHub:78` ∥ `finishSession:87` ∥ `failSession:100` ∥ `handleControl:114` ∥ `startHeartbeat:142` ∥ `sendResize:155` ∥ `applyInitialResize:161` ∥ `onEngineEnd:186` ∥ `attachEngine:207` ∥ `runChain:217` ∥ `handleUpgrade:248` ∥ `closeAll:335` | ≈300 → 342 |
| `src/gateway/server.mjs`（改） | `import { refuseUpgrade }:13` ∥ `createGatewayServer` 签名 +`upgrade = null`:54 ∥ 升级挂点:94–108 | 243 → 260（+17；设计估 +≈12） |
| `bin/thincoder-server.mjs`（改） | `import { createTerminalHub }:28` ∥ `let terminalHub:92` ∥ 停机收口:104 ∥ hub 装配 + `upgrade:` 传参:187–188 | 214 → 218（+4；设计估 +≈9） |
| `public/i18n-zh-system.mjs`（改） | `audit.sandboxKind.terminal_open:206` ∥ `terminal_close:207` | +2 键 |
| `public/i18n-en-system.mjs`（改） | 同上:206–207 | +2 键 |
| `public/views-audit.mjs`（改） | `SANDBOX_KIND_KEYS` 两映射:215–216 | +2 行 |
| 批内件主档（新） | `docs/batches/2026-10-13-sandbox-container-terminal.test.mjs` | ≈420 → 469 |
| 批内件夹具（新——拆案件） | `docs/batches/2026-10-13-sandbox-container-terminal.harness.mjs` | —— → 401 |

**批内件逐条读数**（`node --test docs/batches/2026-10-13-sandbox-container-terminal.test.mjs`；12/12 pass）：纯函数（4.3ms）∥ N83 全链（354ms）∥ N83 残字节腿（267ms）∥ N84 ready 协作（331ms）∥ B79 非运行容器（626ms）∥ B79 就绪前挂起（407ms）∥ B80 心跳（2051ms）∥ B81 收口幂等 + 中途断链（726ms）∥ E61 引擎失败三码 + 超时子形（4.1s——读类预算 3s 计）∥ E62 升级前门（603ms）∥ E63 协议错四形（335ms）∥ N85 两会话 + 停机（311ms）；总 14.5s。

#### 判据 ↔ 设计坐标（逐项对照）

| 判据（任务书 §2.4） | 实现坐标 | 用例 |
|---|---|---|
| 会话链三步逐值（读容器 ⇒ 建 exec ⇒ 升级 start）+ 字节双向 | `terminal-routes.mjs:217–239` ∥ `docker-exec.mjs:33–54` ∥ `:78–148` | N83 |
| 帧协议（二进制 = pty 字节 ∥ 文本 = JSON 控制四下行三上行；断开只由 WS close） | `terminal-routes.mjs:114–139` ∥ `:319–325` ∥ `ws.mjs:168–311` | N83 ∥ N84 ∥ E63 |
| 心跳两向（30s ping / 60s 判死；客户端 ping ⇒ pong） | `terminal-routes.mjs:142–153` | B80 |
| 收口三件 + 幂等 + reason 四值（`client_close`/`exec_exit`/`error`/`server_stop`） | `terminal-routes.mjs:87–97` ∥ `docker-exec.mjs:149–166` | B81 ∥ N85 ∥ B79 ∥ E61 |
| 门在 101 前（401/403/403/404/404）+ 未匹配 404 | `terminal-routes.mjs:248–293` ∥ `ws.mjs:47–70` | E62 |
| in-band 四码（三码有发射点；`session_closed` 零发射 = 设计裁定） | `terminal-routes.mjs:62–74` ∥ `:100–104` | B79 ∥ E61 |
| 协议错收口 1002（未掩码/非法 opcode/超 1 MiB/非 UTF-8） | `ws.mjs:116–151` ∥ `:191–196` | E63 |
| 尺寸（就绪前挂起零调用 ∥ 就绪后施加一次 ∥ 逐帧直发 ∥ 缺省 80×24 ∥ 域 cols 1–500 rows 1–300） | `terminal-routes.mjs:54–59` ∥ `:127–139` ∥ `:155–184` | N84 ∥ B79 |
| 审计两 kind（open 五键 = 就绪时值 ∥ close 五键 + `durationMs`；pty 内容零落库零日志） | `terminal-routes.mjs:87–97` ∥ `:165–171` | N83 ∥ B81 ∥ N85 |
| 停机全收口 `server_stop` + 表清空 | `terminal-routes.mjs:335–338` ∥ `bin/thincoder-server.mjs:104` | N85 |

#### 决策透明表

| # | 决策 | 理由 | 落点 |
|---|---|---|---|
| 1 | 就绪施加实现为「按 250ms 重试至成功」 | 设计只写「就绪后施加一次」；引擎 500 窗（`timeout waiting for exec session ready`）实测存在 ⇒ 重试是实现成形（常量 `TERMINAL_RESIZE_RETRY_MS`） | `terminal-routes.mjs:21` ∥ `:175–184` |
| 2 | 批内件 >500 软线 ⇒ 夹具外提（主档 + 夹具两件） | 判据④「越软线即拆并报」预授权；主档保用例全量（12 用例无减） | `docs/batches/…test.mjs` ∥ `…harness.mjs` |
| 3 | 未接线网关 ⇒ 升级一律 404（`refuseUpgrade`） | `server.mjs` 挂点缺省 `upgrade = null`；错误形与路由面统一（`errors.mjs` ±0） | `server.mjs:94–108` |
| 4 | `durationMs` 起算 = 会话入表时刻（`startedAt`） | 设计未定基准；入表 = 会话生命周期起点（握手通过后首行） | `terminal-routes.mjs:300` |
| 5 | 上行文本帧非法 JSON / 非对象 ⇒ close 1002（归 `error`） | 协议错同形（E63 口径）；未知 `t` 值则忽略（前向兼容） | `terminal-routes.mjs:114–122` |
| 6 | 409 归属取 §12 E61（`container_not_running`），非 §3 旧括注 | 父侧裁定（§1「实施上抛两裁」）——与设计收正取齐 | `terminal-routes.mjs:65` |
| 7 | `session_closed` 不发射 | 父侧裁定 + 设计收正「零发射——前端兜底词汇」 | ——（不落码） |

#### 审计与代码评审轮次与终态

| 轮次 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 内审 1 | 只读审计（对照设计单源 + 判据逐条） | 代码语义面零偏差（PARTIAL=0 ∥ 静默简化=0 ∥ 越域=0）；5 条分歧（1 记录面 + 2 设计待裁 + 1 瞬态 + 1 覆盖缝隙） | 覆盖缝隙（E61 超时子形）已补用例；两设计待裁上抛父侧 |
| 代码评审 1 | advisor（code，全量） | `changes-required`：🔴1（引擎侧 `head` 无消费者 ⇒ 静默丢字节）+ 🟡1（resize 在飞窗内新值被吞）+ 🟡1（`session_closed` 留痕项）+ 🔵3 | 🔴 与 🟡（resize）修（fix round 1）；🟡（`session_closed`）转父侧裁定 |
| 代码评审 2 | advisor（code，只核修复主张） | `pass`：两条修复 + 用例面轮询化逐条落盘，未引入新问题（残余 🔵 项：`applied` 零读点 ∥ 该窗无用例腿 ∥ 三处定值睡） | 收敛（残余项非阻断，留档） |

**终态 = `clean`**（审计/评审共 3 轮；fix round 1 一轮）

#### fix round 1

1. **引擎侧 `head` 补投**（🔴）：`attachEngine` 接线后先喂首块——`if (transport.head?.length) session.conn?.binary(transport.head)`（`terminal-routes.mjs:214`）。**红绿对**：夹具加 `initialOutput`（101 与首块并一次 `socket.write`，`harness.mjs:295–298`）+ 新用例「N83 残字节腿」（断言首块原样下行 + 后续环回照常）；**断掉该行 ⇒ 该腿红**（超时 3000ms：帧——已实测），恢复 ⇒ 绿。
2. **resize 在飞窗内新值补发**（🟡）：抽出 `sendResize`（就绪后直发 + 记 `applied`），就绪成功回调内读回 `pendingResize`，与已施加值不等才补发一次（`terminal-routes.mjs:155–173`）——消除「在飞窗内新尺寸被吞、此后无施加点」。
3. **用例面轮询化**（🔵）：夹具加 `waitUntil`（`harness.mjs:45`），7 处正等待由定值睡改轮询（N84 ∥ B80 ∥ B81 两腿 ∥ E63 ∥ N85）。

#### 披露与上抛

- ① **随正件（父侧/文档层）**：`docs/batches/2026-10-08-server-public-structure.test.mjs` 的 i18n 键数基线（`970 ∥ 975`）因本舱两新键（zh/en system 表各 +1 键/表）已不实——本舱未改他批件，随正归父侧（与前端舱同类披露同族）。
- ② **既有件实读（只报不改）**：`src/sandbox/docker.mjs` 的 `createDockerClient({ readTimeoutMs })` 选项为空转——全档 `readTimeoutMs` 仅构造参数与 `clientForRunner` 转发（`:224` ∥ `:386–401`），`request()` 的读类默认取模块常量 `READ_TIMEOUT_MS`（`:233`）⇒ 传值不生效（读类预算恒 3s）。本舱 hub 的 `readTimeoutMs` 传递面随之空转（零功能影响）；E61 超时子形用例按设计 3s 预算断言（detail 携 `超时（3000ms）` 读数）。归父侧裁（既有件 ±0 未触）。
- ③ **设计档漂移（只报不改）**：本批服务端舱实施实读与 §2.3 估差见上表（`ws.mjs` 311 ∥ `terminal-routes.mjs` 342 等）；实拆一件（夹具）未入 §2.3 件表。均随正归文档层。
- ④ **临时件**：`_tmp-term-probe.mjs`（`server.closeAllConnections` 不覆盖升级 socket 的实测探针）与 `_tmp-e61-probe.mjs`（E61 读类预算实测探针）用毕即净——现盘零残留。
- ⑤ **未做的验证面**：真机 `vim`/`top`/中文输入/真容器收口（ECS `.6`）+ 前端舱面归父侧收口轮；本舱只到「批内件 + `node --check`」级。
- ⑥ **回写范围**：本舱只写本仓档（三新件 + 三改件 + 批内件两件 + 本 §5 段）；前端舱八档与设计档零触（设计档两处收正 = 父侧直接执行）。

**坐标随正块（fix round 1 后复读，逐值现盘实读——覆盖上行同表少数行号）**：`terminal-routes.mjs`——`startHeartbeat:141`（上行表写 142）∥ `sendResize:155` ∥ `applyInitialResize:162`（写 161）∥ 重试 `setTimeout:178` ∥ `terminal_open` 审计 `:171` ∥ `onEngineEnd:188`（写 186）∥ `attachEngine:207` ∥ `runChain:220`（写 217）∥ `handleUpgrade:251`（写 248）∥ `closeAll:335`；判据表同源随正——会话链 `:220–242` ∥ 帧/尺寸装配 `:312–325`（`createWsConnection:312` ∥ `conn.feed(head):325`）∥ 心跳 `:141–152` ∥ 尺寸 `:155–185`（重试 `:178`）∥ 停 `:335–338`；批内件残字节腿 = `…test.mjs:127–141`（断言 `:132`/`:135`）。其余坐标（`ws.mjs`/`docker-exec.mjs`/`server.mjs`/`bin`/i18n/视图/夹具）逐条复读与上行表一致。

## §6 验证与收口（父代理）

**2026-10-13 23:5x · 收口进行中（父侧）**

- **双舱交付核读完成**：#98（批内件 10/10）∥ #97（批内件 12/12——父侧复跑确认，含夹具外拆披露已核）。
- **随正件已落**（父侧直接执行 · 可 revert）：① `docs/batches/2026-10-08-server-public-structure.test.mjs`——i18n 指纹/键数按当刻实读 **1033 ∥ 1038**（composition 注明：本批 sandbox +12 ∥ system +2 ⊕ 同窗他批已落键；重做批在途 ⇒ 收口轮终随正）⇒ 复跑 **6/6 绿**；② `docs/batches/2026-10-13-sandbox-container-actions.test.mjs`——七钮序（末位终端）∥ 行闩七钮 ∥ `:root` 58 ⇒ 76 ⇒ 复跑 **5/5 绿**。
- **记账**：`docker.mjs` `readTimeoutMs` 空转（#97 实读上抛）⇒ 台账 **#1381**（技术待办——条件：重做批 docker.mjs 落定后核）。
- **未落（序）**：设计档漂移随正（`webui/TERMINAL.md` 面小计/实拆六件 ∥ `webui/WEBUI.md`「+4」∥ `webui/SANDBOX.md` §3 件表 ∥ `sandbox/SANDBOX.md` R85② ∥ 读数行——机械项，本收口轮办）→ 提交双推（等重做批在飞三档落笔——`bin`/`i18n-system`〔#108〕∥ `i18n-sandbox`〔#107〕冲突面避开）→ 部署收尾 + 真机腿（`.6`：vim/top/中文/关窗零残留）→ §6 终稿 + 结算（台账 #1374）。

**收口（父侧 · 2026-10-14 01:3x）**

## 一、复验读数（父侧亲跑）

- **批内件**：`-container-terminal.test.mjs`（会话面 12 腿）+ `-container-terminal-ui.test.mjs`（UI 面 10 腿）——父侧复跑 **34/34 全绿**（零 fail；含 N83 全链 ∥ N84 ready 协作 ∥ B79/B80/B81 边界 ∥ E61–E63 错误面 ∥ 核件十腿）。
- **键数/样式**：i18n-sandbox 键数腿 220 ✓ ∥ 调色板 18 变量入 `:root` ∥ 面类族/零动画/零悬停腿 ✓ ∥ 档行数 ≤500 ✓。
- 与重做批同窗的守卫件复跑（键数 [1041, 1046] ∥ 指纹重锚）已在重做批 §6 记——两批键面互不相抵（terminal +12/表已在 1043∥1048 链内）。

## 二、部署（.5 真机 · 实跑）

- 提交 `ef747efc`（18 档 +4348/−2）→ 与重做批同镜像上箱（**`f7dc78014a1f`**——构建含两批全量）⇒ `/views-sandbox-terminal.mjs` **200**（此前 404——本批前未部署面已消）∥ `ready` 行 `routes: 121` ∥ `src/gateway/ws.mjs`（升级桥）在容器包内（npm pack 白名单）。
- **真机实走（待用户）**：管理页任一行容器「终端」钮 ⇒ 终端窗（一容器一会话 ∥ 断线重连 = 新会话 ∥ `Esc` 不关窗）——留用户实看（人机走查腿）。

## 三、遗留（在册 · 不静默）

- 实走腿（浏览器真机）＝用户面（上表）——读数回来前本批不记「真机全验」。
- `#1248/#1249`（P2/P3 ∥ P1/P8 真机复证）＝出站面探针行（重做批 §6 承接——非本批）。

## 四、结算

- **#1374** 沙盒容器终端 v1（本批）→ 已核销——依据 = 本 §6 ∥ 提交 `ef747efc` ∥ 部署读数（terminal 档 200 ∥ routes:121）∥ 批内件 34/34 绿。
- 修复轮次 = 无（设计评审 pass 后实施直落；内审 + 代码评审收敛在舱内完成——§5 在册）。
