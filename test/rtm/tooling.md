# RTM 分册 · tooling

> 本册护的机制 = 工具实现面（fetch ∥ browser ∥ ssh ∥ grep ∥ subagent ∥ timer ∥ 工具结果回路）；族表与归属判据 = docs/core/design/TESTING.md §11.18.3。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 1. 对话里用工具，结果必须回到模型

> 目的：工具结果原样回到模型，对话能接着走。
> 节注：回指 = docs/core/requirements/PROVIDER.md §4.9（R33 工具历史回放）；三态（行序）= 1-1 正常 · 1-2 边界 · 1-3 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 1-1 | 在 CLI 里让助手调用一次工具，然后继续同一段对话 | 会话流里有这次调用与它的结果，助手回复引用了结果，没有 400 | 无 | `test/integration/anthropic-tool-roundtrip.test.mjs` |
| 1-2 | 同一轮里让助手连续调用两个工具，再继续对话 | 两个结果都回到模型，回复正常，没有 400 | 无 | `test/integration/anthropic-tool-roundtrip.test.mjs` |
| 1-3 | 关掉进程，重开同一会话，历史回放后继续对话 | 回复引用了上一程的工具结果，没有 400 | 无 | `test/integration/anthropic-tool-roundtrip.test.mjs` |

## CLI 3. 网页抓取的后端故障不外溢

> 目的：单个后端故障不影响其它通路，无渠道时零变化。
> 节注：回指 = docs/core/requirements/TOOLS.md 条目 W3 ∥ W4 ∥ NW1；三态（行序）= 3-1 错误 · 3-2 错误 · 3-3 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 3-1 | 让 fetch 收到 404 后，在同一会话里再搜一次 | 404 不熔断，搜索仍然打到 DeepSeek | 无 | `test/integration/web-backend-404.test.mjs` |
| 3-2 | 让后端返回 401 | 只停该后端：fetch 回落到本地直取并成功，随后 websearch 零上游命中且正常结算 | 无 | `test/integration/web-backend-404.test.mjs` |
| 3-3 | 在没有 DeepSeek 渠道的配置下跑一次 | 回执逐字不变、零 (deepseek …) 提示行、替身零命中 | 无 | `test/integration/web-backend-404.test.mjs` |

## CLI 4. 浏览器起不来的等待窗口可调

> 目的：默认 25s、可调，失败后会话仍可用。
> 节注：回指 = docs/core/requirements/BROWSER-TOOL.md 条目 F-BT16b；三态（行序）= 4-1 正常 · 4-2 正常 · 4-3 边界。
> 池隔离前提：该档把 `HOME` ∥ `USERPROFILE` 指到临时目录——共享浏览器在场时 `navigate` 走接入而不拉起，不隔离即假绿（同前提见故事 34）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 4-1 | 设 `BROWSER_START_TIMEOUT_MS=2000` 后启动浏览器 | 失败句含 within 2s，失败后会话仍可用 | 无 | `test/integration/browser-start-window.test.mjs` |
| 4-2 | 不设该变量启动浏览器 | 失败句含 within 25s（默认窗口），不再出现 12s 时代的句子 | 无 | `test/integration/browser-start-window.test.mjs` |
| 4-3 | 真机上首个动作是 navigate | 自启段不吃动作预算；宿主无 Chromium 则该例 skip 并打印 | 无 | `test/integration/browser-start-window.test.mjs` |

★ 4-3：该例仅在宿主有 Chromium 时实跑，无则 skip——skip 不算验过（skip 也计入 tests 数，不据「15/15 绿」推定）；该行不标运行状态，某轮「已验」与否由 `node test/run.mjs` 那一次跑的输出体现（未跑不算通过 = docs/core/design/TESTING.md §11.3），故实跑之后本行无需改动。

## CLI 22. SSH 接网络设备：读得清、拿得全、判得准

> 目的：接真网络设备时输出干净、长配置取得全、慢操作不误判就绪。
> 节注：回指 = `docs/core/requirements/TOOLS.md` §4.8（S3 ∥ S4 ∥ NS2 ∥ S10 ∥ S11 ∥ NS8）；交互组件 = `ssh` 工具面 ⟷ 会话池 ⟷ 传输面（剥离 ∥ 帽窗 ∥ 四门）；进入口 = CLI 会话里让助手调 `ssh` 工具，用户看的是那一格工具结果回执；五态（行序）= 22-1 正常 · 22-2 正常 · 22-3 边界 · 22-4 正常 · 22-5 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 22-1 | CLI 会话里让助手 `ssh connect` 到脚本化假设备（`_setSshBinaryForTest` 替掉 ssh），再 `send("show run")`：设备吐 20 000 字符、夹 CSI/OSC/退格、末行 `--More--` | 工具结果回执零 `\x1b` 残留、首行与末行俱在、注记点名中段可取回；随后 `read` 取回中段，三段拼合与设备原文逐字一致；`--More--` 字面出现 1 次 | — | `test/integration/ssh-device-readability.test.mjs` |
| 22-2 | 同一会话 `send("write memory")`：设备回显后静默 3 s 再出 `[OK]` 与提示符 | 结论 = 提示符命中 ∧ 未在静默窗交出（首屏从未在 800 ms 静默处返回）；`[OK]` 与提示符俱在返回文本里。用时只作旁证，不作断言 | — | `test/integration/ssh-device-readability.test.mjs` |
| 22-3 | 同一会话 `send`：替身按脚本在第 N 字节后停吐（同一会话内从「会吐」切到「不再吐」，`timeoutMs: 1500`） | 硬超时内返回可读句并点名未过的门（无提示符 ∥ 仍在输出 ∥ 一个字节都没回）；会话仍在 `list` 里（不静默挂起、不崩） | — | `test/integration/ssh-device-readability.test.mjs` |
| 22-4 | 会话连上只实现经典 SCP 协议的替身（收不到 `-O` 即失败），让助手 `put` 一个 1 MiB 二进制文件到 `/flash/firmware.img` | 远端副本 `sha256` 与本地相等；工具回执 = 会话冠行 + 一行状态句（含 `bytes` 与 `exit 0`）；对话里不出现文件内容（本地前 64 字节零命中） | — | `test/integration/ssh-file-transfer.test.mjs` |
| 22-5 | 同一会话 `get` 一份远端配置到项目内路径（工程模式 depth-0）：无在途号 ∥ 带在途号各一笔，再对已存在的目标补一笔不给 `overwrite` | 无在途号 ⇒ 写门拒（拒文 = 门本体）且本地档不存在；带在途号 ⇒ 落盘、`sha256` 与远端相等；目标已存在且不给 `overwrite` ⇒ 拒、原档字节零改 | — | `test/integration/ssh-file-transfer.test.mjs` |

## CLI 28. 拿行号改文档不会静默改错行

> 目的：同一会话里先写过一笔、再从旧快照拿行号去改 ⇒ 当场拒（点名路径 / 上次写入行 / 漂移量 / 两条下一步），文件字节零改。改前那里是「静默改到隔壁几行、回执还写成成功」。
> 节注：回指 = `docs/core/design/EDIT-HELPERS.md` §7（行号锚护栏，判据单源）；机制单源 = `docs/core/design/EDIT-HELPERS.md` §7.1 ∥ §7.2 ∥ §7.3；交互组件 = 编辑族行号形（`edit` 的 `line` / `startLine`+`endLine`）⟷ 写入记账面（`lastWriteOf` / `isDirty`，`thincoder-core/tools/write-path.mjs`）⟷ 会话工具结果面；进入口 = 同一会话内两次编辑工具调用（子代理与主 agent 共用一张记账表）；一态（行序）= 28-1 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 28-1 | 同一会话内先一笔 `edit`（或 `insert_after`）改到第 N 行附近，再用**旧快照的行号**调 `edit` 的 `line` / `startLine`+`endLine`，目标行落在受影响区内 | 当场拒：拒文逐字含路径、上次写入行、漂移量、两条下一步（重 `read` 与改走内容锚）；**文件字节零改**（改前后内容哈希相同）；回执不出现 `Edited …` 成功句 | 修前红 = 旧行号照旧应用、改到相邻行而回执报成功——本行断言的就是那条已退场的旧行为 | `test/integration/edit-line-anchor.test.mjs` |

## CLI 30. 读数子代理：派一个 tester 跑验证

> 目的：父侧派一个只跑不改的子代理去跑验证，拿回来的是读数（命令原文、跑者计数、失败用例名、摘要）——父侧据它自己重新判断，子代理不改任何东西。
> 节注：回指 = 需求 `docs/core/requirements/AGENT-LOOP.md` §4.20（F-TT1 ∥ F-TT2 ∥ F-TT3）；机制单源 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.59（工具面 §6.59.2 · 报告形态 §6.59.10）· 工具面一侧 = `docs/core/design/TOOLS.md` §6.27；交互组件 = 角色白名单（`thincoder-core/agent-tools/subagent.mjs`）⟷ 工具面过滤（核 `thincoder-core/agent-tools/subagent-spawn.mjs` ⟷ 端 `thincoder-vscode/src/agent/tool-table.mjs`）⟷ 提示词装配（`thincoder-core/prompt-overlays.mjs`）⟷ 子代理报告；进入口 = 父侧派单跑验证（核入口 + VS Code 端入口，同一用例内各取一次）；两态（行序）= 30-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 30-1 | 父侧在工程模式经 `subagent` 派 `role:"tester"`（任务书五项），两条断言各一跑：必败 `node --test test/failing.test.mjs` ∥ 必过 `node --test test/passing.test.mjs`；同用例内再取一次两端工具面（同一份输入表 = 核内置表 + `verify` + `advisor`：核侧 = 真派单请求体减家族段，端侧 = 真跑 VS Code 端 `buildToolTable`，`vscode` 宿主模块桩掉） | 受理：回来的是一份子代理报告，无任何门的拒句；tester 请求体里的工具表无写面（无 `write` / `edit` / `apply_patch` / `git` / `verify` / `advisor`）且含 `bash` ∥ `execute`；必败跑报告带命令原文 + 跑者 `fail 1` + 失败用例名 + `exit code 1`，必过跑报告带 `pass 1` + `exit code 0`；核 ∥ 端基础集逐名相等，且核侧实得名集 = 公式快照（只读集 ∪ `{execute, bash}` − `{verify, advisor}`，再经 `SUBAGENT_TOOL_EXCLUSIONS`） | 无 | `test/integration/tester-role.test.mjs` |

## CLI 31. 过程档内容在工具输出的命中处就标出不可作依据

> 目的：助手查一个词把批档旧话捞出来时，读输出的人当场看见「这行不能作为设计依据」——不靠模型记得去核状态档。
> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.19 3-补（判据 = `docs/core/design/TOOLS.md` §6.28 验收 1–14）；交互组件 = `grep` ∥ `bash` ∥ `execute` 的输出渲染 ⟷ `isExcludedRelPath` 声明谓词 ⟷ 盘上路径解析；进入口 = 用户在会话里让助手查一个词；两态（行序）= 31-1 正常 · 31-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 31-1 | 会话里对一个词跑 `grep`、`bash`（脚本印同一批行：相对形 ∥ 驱动绝对形 ∥ MSYS 形）、`execute`（`code` 里 `readFileSync` 打印同两份档）、后台径再起一条 `async` 后台任务读其结算文本，VSC 端再以 `terminal` 缺省与 `"visible"` 各跑一次 `bash`；该词同时出现在一份批档、一份 `_archive` 档与一份状态档里 | 各面分别：过程档行以 `[process doc: not a design basis]` 开头且行其余部分逐字不变；状态档行逐字等于 `<file>:<line>: <text>`（无前缀）；命令面（`bash` ∥ 后台摘要 ∥ `execute` ∥ VSC 两出口）输出末尾多一行汇总且 N = 实标行数；`grep` 面零汇总行；`filter` 按原始行命中（前缀不参与过滤） | — | `test/integration/grep-process-doc-mark.test.mjs` |
| 31-2 | 同一次命令面输出里只用「长得像路径、盘上不存在」的日志行；另在一个祖先链无 manifest 的目录里跑同一件事 | 该行零打标、不进汇总计数（N = 0 ⇒ 无汇总行，输出逐字节不变）；出辖目录的命中行同样零打标 | — | `test/integration/grep-process-doc-mark.test.mjs` |

## CLI 34. 多实例共用一个浏览器（首开末关 · 用者计数）

> 目的：两个（或更多）会话同时要用浏览器时——全机一台共享浏览器、各开自己的标签页；后到者被告知沿用的是哪个模式；关掉一个不带走别人在用的那台。
> 节注：回指 = docs/core/requirements/BROWSER-TOOL.md 条目 F-BT6b（全机一个共享浏览器）∥ F-BT6（登录态）∥ F-BT2（模式由首实例定、后到沿用）；判据 = docs/core/design/BROWSER-TOOL.md §12 ∥ §12.1；交互组件 = `thincoder-core/browser/pool.mjs`（四形判定 ∥ 用者登记 ∥ 末关）⟷ `thincoder-core/browser/session.mjs`（接线）⟷ 真工具面；进入口 = 同一临时 `HOME` 下两个真 node 进程各发一条 `browser{navigate}`；三态（行序）= 34-1 正常 · 34-2 边界 · 34-3 正常。
> 池隔离前提：该档把 `HOME` ∥ `USERPROFILE` 指到临时家目录（`browserPaths()` 落在其中）——开发机上真跑着的共享浏览器不得被用例接入。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 34-1 | 同一临时 `HOME` 下同时起两个实例，各自 `browser{action:navigate}` 一个本地页 | 命令行含 `--user-data-dir=<profile>` 且不是 helper（不含 `--type=`）的进程数 = 1；两实例都拿到 `[navigate]` + 页摘 | — | `test/integration/browser-shared-pool.test.mjs` |
| 34-2 | 首实例已在无头跑，第二实例以 `headless:false` 跑 `navigate` | 第二实例不报错、拿到 `[navigate]`；回执尾行含 `the shared browser is running headless=true (started by pid <N>)`；不含 `session is already running` | 取「无头为生效值」那一向：另一向（有头为生效值）需显示环境，判的是同一机制（模式不可热切） | `test/integration/browser-shared-pool.test.mjs` |
| 34-3 | A、B 都用过，先后 `close` | A 回执含 `1 other instance(s) still using it` 且浏览器进程仍在；B 回执含 `shared browser closed (last user)` 且进程消失、`session.lock` 不在盘 | — | `test/integration/browser-shared-pool.test.mjs` |

★ 34-1–34-3：三例都需宿主有 Chromium，无则 skip 并打印（skip 不算绿）；进程计数口径 = 「几台浏览器」而非「几个进程」——helper 进程会带着父进程的 `--user-data-dir`，按裸开关数会把一台数成十几台（实测读数见本批批次档 §5）。

## CLI 35. 会话态的读写在浏览器工具里（cookie 含 httpOnly · storage 两域自分 · 六形免审）

> 目的：调用方手里已有的会话态能原样搬进搬出——`cookies get` 读得到 httpOnly 的登录令牌（`document.cookie` 读不到那一类），`cookies set` 给什么域写什么域；`storage` 两域各写各读、值逐字往返。
> 节注：回指 = docs/core/requirements/BROWSER-TOOL.md 条目 F-BT20（cookie 三形、含 httpOnly、跨域直写）∥ F-BT21（storage 三形 × 两域、自分不串档）∥ N-BT7（六形免审）；判据 = docs/core/design/BROWSER-TOOL.md §14（AC-BT1 ∥ AC-BT2 ∥ AC-BT3 ∥ AC-BT4 ∥ AC-BT5 ∥ AC-BT6 ∥ AC-BT7）；交互组件 = `thincoder-core/browser/session-state.mjs`（六形）⟷ `thincoder-core/browser/session.mjs`（分发表）⟷ 真工具面；进入口 = 本地夹具页回一条 `Set-Cookie: …; HttpOnly` 后逐个调 `browser`；三态（行序）= 35-1 正常 · 35-2 正常 · 35-3 正常。
> 池隔离前提：该档把 `HOME` ∥ `USERPROFILE` 指到临时家目录（`browserPaths()` 落在其中）——开发机上真跑着的共享浏览器不得被用例接入。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 35-1 | 本地 `http://localhost:<port>` 夹具页回 `Set-Cookie: <name>=<v>; HttpOnly`；同一会话先 `browser{cookies get}`，再 `browser{evaluate}` 读 `document.cookie`；随后 `browser{cookies set}` 一条 `domain:"127.0.0.1"` 的条目（当前页仍在 `localhost`），再 `browser{cookies get}` 带 `domain:"127.0.0.1"`；最后 `browser{cookies clear}` 带 `domain:"127.0.0.1"`，再带该域 `get` 一回、带 `domain:"localhost"` `get` 一回 | ① `cookies get` 的行集含该 httpOnly 名且带 `; httpOnly`，`evaluate` 回的串不含该名 ⇒ 真 cookie 面，不是 `document.cookie` 的壳；② `set` 回执点名 `127.0.0.1`、该域 `get` 读得到 ⇒ 给什么域写什么域、无开关；③ 带域 `clear` 后该域 `get` 回 `0 cookie(s)`、而 `localhost` 那条仍在 ⇒ 写 → 清 → 读回空，且清的是该域不是全清；④ 四段回执零 `****` ∥ `••••`、httpOnly 那条的值逐字相等 ⇒ 值照出 | — | `test/integration/browser-session-state.test.mjs` |
| 35-2 | 同页对 localStorage 与 sessionStorage 各写同名键（值含换行 ∥ 引号 ∥ 中文 ∥ ≥2KB 串），再各自 `storage get`；再只往 localStorage 写一个键、到 sessionStorage 取同名键 | 两域各回自己的值、互不串档；值逐字相等（JSON 转义面比对）；未写过的那域回 `not set` | — | `test/integration/browser-session-state.test.mjs` |
| 35-3 | 同一夹具页逐个调 `browser{cookies get ∥ set ∥ clear}` 与 `browser{storage get ∥ set ∥ clear}`；门面读数取 dispatch 的公共输入 `readonlyActionOf(browserTool, "browser", args)` | 六形逐条为真（门闭态走免审短路 ⇒ 零审批请求），且六形真跑成功（`cookies set` ∥ `storage set` 回读得到）⇒ 用户逐字裁掉的「不要搞鸡毛审核」有一条常驻判据 | — | `test/integration/browser-session-state.test.mjs` |

★ 35-1–35-3：三例都需宿主有 Chromium，无则 skip 并打印（skip 不算绿）；「切到该源」在 35-1 里由 `domain` 过滤面承担——`localhost` 与 `127.0.0.1` 同端口即两个源，不另起第二次启动。35-3 的免审判的是「门面按动作分类」这一交互（`browserTool.execute` 直调面绕得过门禁，所以「零审批」只能在门面读数上验）。
