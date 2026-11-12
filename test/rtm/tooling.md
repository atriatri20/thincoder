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
> 节注：回指 = 需求 `docs/core/requirements/AGENT-LOOP.md` §4.20（F-TT1 ∥ F-TT2 ∥ F-TT3）· 需求 `docs/core/requirements/DOC-GRAPH.md` §4 AC-10（两件文档工具面在每个子代理角色的表里）；机制单源 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.59（工具面 §6.59.2 · 报告形态 §6.59.10）∥ §6.60（文档工具面装配 · 集成行 §6.60.9）· 工具面一侧 = `docs/core/design/TOOLS.md` §6.27 ∥ `docs/core/design/DOC-GRAPH.md` §2.5.5（两变体契约）；交互组件 = 角色白名单（`thincoder-core/agent-tools/subagent.mjs`）⟷ 工具面过滤（核 `thincoder-core/agent-tools/subagent-spawn.mjs` ⟷ 端 `thincoder-vscode/src/agent/tool-table.mjs`）⟷ 家族段装配（核 `thincoder-core/agent/family-tools.mjs`）⟷ 提示词装配（`thincoder-core/prompt-overlays.mjs`）⟷ 子代理报告；进入口 = 父侧派单跑验证（核入口 + VS Code 端入口，同一用例内各取一次）∥ 父侧派单取子代理工具表；三态（行序）= 30-1 正常 · 30-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 30-1 | 父侧在工程模式经 `subagent` 派 `role:"tester"`（任务书五项），两条断言各一跑：必败 `node --test failing.test.mjs` ∥ 必过 `node --test passing.test.mjs`（两份夹具档造在临时项目根下）；同用例内再取一次两端工具面（同一份输入表 = 核内置表 + `verify` + `advisor`：核侧 = 真派单请求体减家族段，端侧 = 真跑 VS Code 端 `buildToolTable`，`vscode` 宿主模块桩掉） | 受理：回来的是一份子代理报告，无任何门的拒句；tester 请求体里的工具表无写面（无 `write` / `edit` / `apply_patch` / `git` / `verify` / `advisor`）且含 `bash` ∥ `execute`；必败跑报告带命令原文 + 跑者 `fail 1` + 失败用例名 + `exit code 1`，必过跑报告带 `pass 1` + `exit code 0`；核 ∥ 端基础集逐名相等，且核侧实得名集 = 公式快照（只读集 ∪ `{execute, bash}` − `{verify, advisor}`，再经 `SUBAGENT_TOOL_EXCLUSIONS`） | 无 | `test/integration/tester-role.test.mjs` |
| 30-2 | 父侧在工程模式经同一个 `subagent` 入口派 `role:"tester"`（真门 + 真装配），抓子代理那一发的请求体工具表；同一次派单所在父进程再取一次 depth-0 家族段（核 `assembleFamilyTools({ depth: 0, … })` 的真输出——夹具父表只喂基础集，家族段由核按 depth 在同一处追加） | 子代理的工具表里有 `doc_check` 与 `doc_graph` 两件；`doc_graph` 的 `action` 枚举逐字三值（`forward` ∥ `reverse` ∥ `chain`）、不含 `scan`（读请求体里的 schema 即得）；父侧 depth-0 的 `doc_graph` 仍四值（含 `scan`）且 `readonly` 仍为 false | — | `test/integration/tester-role.test.mjs` |

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

## CLI 41. 批量改多档：一条失败只废那一条，成了的不返工，回执逐条说清

> 目的：一次批量改多档时，某一条改不成只反馈那一条——已经改成的档留在盘上、不需要重做整批；某档最终内容被写前门拒只连坐该档；回执按调用序逐条说清哪条成、哪条败，末行给计数。改前那里是「任一条失败 ⇒ 整批抛错、盘上零字节」，用户为此改成一档一调 + 逐次回读。
> 节注：回指 = `docs/core/requirements/TOOLS.md` F16 ∥ F17；机制单源 = `docs/core/design/EDIT.md` §5「`edits` 数组（逐条成败）」∥「批量回执（逐条 + 末行计数）」∥「桥面同口径」· §8 D-5 ∥ D-9 ∥ D-10 ∥ D-14 ∥ D-15 ∥ D-16；交互组件 = `edit` 工具的 `edits` 形 ⟷ 逐档就地写 ⟷ 写前文档门（41-1）∥ ACP 桥的批量编辑 ⟷ IDE 缓冲读写（`fs/read_text_file` ∥ `fs/write_text_file`）⟷ 帧排 ∥ `onEntryError:"collect"`（41-2）；进入口 = 真 `edit` 工具调用 ∥ ACP 客户端（IDE）发起一次批量编辑；态数（行序）= 41-1 错误 · 41-2 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 41-1 | 临时项目里调 `edit` 的 `edits` 形，两段各一批：① 两档各一条 + 同档再补一条，其中一条给匹配不到的 `old_string`；② 带 `PROJECT-MANIFEST.json` 的项目里一份 `docRoot` 内的 `.md`，两条编辑让该档最终内容触发写前门（段落超长），同批另给一份 `.txt` 一条合法编辑 | ① 成了的条目都在盘上（同档两条合成一次写）、败的那档字节逐字不变（改前改后哈希相同）；回执按调用序逐条一行（`edits[1] — failed: old_string not found in beta.txt`），末行逐字 `edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: alpha.txt`，全文零 `nothing written` ∥ `no files written`；② `.txt` 档照落、`.md` 档字节逐字不变，该档两条都是失败行且原因含门拒文那句，末行逐字 `edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: notes.txt` | 修前红 = 任一条失败整批抛错、前面各档零字节（用户为此改成一档一调 + 逐次回读）——本行断言的就是那条已退场的旧行为 | `test/integration/edit-batch-entry-outcome.test.mjs` |
| 41-2 | 以 ACP 会话入口（`buildAcpCallbacks`）的 `toolRouter("edit", { edits })` 发起一次批量编辑，读写两侧都打到桩 IDE 对端（反向 `fs/read_text_file` ∥ `fs/write_text_file`）：IDE 里开着三档，其中第 2 条给匹配不到的 `old_string`；再跑一批全成的（同档两条 + 另一档一条） | ① 第 2 条以 `edits[1] — failed: ` 起头、另两条是桥面成功形（`OK: edited … via IDE`）；IDE 缓冲只含成功条（败的那档逐字未动）；末行逐字 `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: alpha.txt, gamma.txt`，全文零 `nothing written` ∥ `no files written`；② 全成批末行 `edit batch: 3/3 entries applied, 0 failed — 2 file(s) written: a.txt, b.txt`，同档两条只写回一次；另：盘面无新增档（桥写的是 IDE 缓冲） | 修前红 = 桥面「全过才写」：任一条失败整批抛错（前缀 `edit aborted (atomic — no files written): `）、缓冲一条都不写 | `test/integration/acp-bridge-batch-outcome.test.mjs` |

## CLI 42. 补丁改多档：写盘段中途失败，回执说清哪几档已落盘

> 目的：一次补丁改多档、写到一半失败时，回执要说清「哪几档已经在盘上、哪一档败了、哪几档没动」——已经落盘的不回滚、不假装没发生。改前那里抛的是一句裸 `rename` 错误：没有清单、不说哪一档失败，用户只能自己一档一档去猜。
> 节注：回指 = `docs/core/requirements/TOOLS.md` F17；机制单源 = `docs/core/design/APPLY-PATCH.md` §4「返回值（未全成）」∥「两个失败段」· §7 D-P2 ∥ D-P4 · 回执骨架单源 = `docs/core/design/EDIT-HELPERS.md` §7.6；交互组件 = `apply_patch` 提交段 ⟷ 注入径即时提交（编辑器已打开的档在暂存段就落盘）⟷ 批级记账；进入口 = 真 `apply_patch` 调用（三档补丁，其中一档的提交段必失败）；态数（行序）= 42-1 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 42-1 | 临时项目里调真 `apply_patch`：三档补丁（`alpha.txt` / `beta.txt` / `gamma.txt` 各一行替换），第 1 档的目标档在 IDE 里打开着（注入径 ⇒ 暂存段即提交）；桩宿主在它落盘之后把第 2 档的目标档换成一个目录 ⇒ 第 2 档的提交段 `rename` 必失败 | 抛错正文按补丁序逐档一行（`  modified alpha.txt` ∥ `beta.txt — failed: <原因原文>` ∥ `  not committed gamma.txt`）+ 末行逐字 `apply_patch: 1/3 file(s) applied, 2 failed: alpha.txt`（报单位 = 写单位 = 档 ⇒ 末段省）；盘上 `alpha.txt` 已是新内容、`gamma.txt` 逐字未动 ⇒ 已落盘的不回滚 | 修前红 = 抛一句裸 `rename` 错误：无清单、不说哪一档失败（用户不知道哪些档已经在盘上） | `test/integration/apply-patch-write-phase.test.mjs` |

## CLI 43. 文档锚点图：一条链从一个需求走到用例入口符号

> 目的：文档各层之间的引用关系能反查——「这条决定是怎么来的」「这一节还被哪几处说着」从人工核对变成一条查询。图的边与台账行住同一个库（`doc_edges` 表），边的抽取复用 `doc_check` 那一次逐行遍历（同一份文档只有一套解析器），查询面 = 一个工具四种问法（`scan` ∥ `forward` ∥ `reverse` ∥ `chain`）。
> 节注：回指 = 需求 `docs/core/requirements/DOC-GRAPH.md`（F1–F5 ∥ F7 ∥ 边界七条 ∥ AC-1–AC-9）；机制单源 = `docs/core/design/DOC-GRAPH.md` §2.2（边的形状与来源）∥ §2.3（表结构与出处形）∥ §2.5.0（按类计数）∥ §2.5.2（走查规则）∥ §2.5.4（时效格）；交互组件 = `thincoder-core/doc-graph/anchors.mjs` 的逐行遍历（回调 `onEdge`）⟷ `thincoder-core/doc-graph.mjs`（扫描 ∥ 落库 ∥ 查询）⟷ `thincoder-core/ledger-db.mjs` 的同一库同一句柄 ⟷ 真工具面 `doc_graph`；进入口 = CLI 会话里让助手调 `doc_graph`（`scan` 一次、再按四种问法查）；五态（行序）= 43-1 正常 · 43-2 正常 · 43-3 边界 · 43-4 边界 · 43-5 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 43-1 | 真工具调用 `doc_graph`：`scan` 扫本仓 → `chain` 以 `req:F16` 起、`depth` 取 6 → 五跳的每条边再用 `forward` ∥ `reverse` 逐条直查 | `scan` 回执首行 = `全仓 · 扫 N 档`（**不带任何混合边总数**），紧跟按类计数行（每类后跟「已验存在 ∥ 目标不在盘 ∥ 判不了存在性」三格，`cites` 与 `cites-symbol` 各占一格），末行是时效格（`图建于 … · 此后 N 档变更 · D 档已不在盘`）；`chain` 首行印走查口径（起点 / 深度 / 命中边数 / 节点数 / 生效 kind 集合）；第 1 跳（小层）含设计档与批档；每条宽度截断自述行按层印出且该层确实只印 200 条（M = 该层真实条数、须大于印出条数；点名的 `kind` 在闭集内；「M 与库内该层条数逐字相等」由单测夹具对库内行数核，常驻面押的是这三条关系）；五跳的每条边逐条断言（设计档 `--cites-req-->` `req:F16` ∥ 批档 `--cites-->` 设计档 ∥ 批档 `--mentions-case-->` `case:CLI 41-1` ∥ `--case-file-->` 用例档 ∥ 用例档 `--imports-->` `symbol:editTool`），每边带出处 | 修前红 = 这类关系只能靠人一处一处读出来（需求档 §1 三个实证）；本行断言的就是「一条命令复原那条链」+ 回执说清「验过几条、抽出来几条、这张图多旧」 | `test/integration/doc-anchor-graph.test.mjs` |
| 43-2 | 真工具调用 `doc_graph(reverse)`：查 `doc:docs/core/design/EDIT.md#5` | 首行断到 `kind = 全部十类：` 为止（**不带入边条数**），紧跟按类计数行且 `cites` 自占一格、带三格；需求档与批档两条引用方都在，各带出处（需求档那条的出处原句带 `F16`）；整档引用与按节引用逐条按真实身份打印（按档折叠、身份不归一） | 修前红 = 「谁引用了这一节」今天完全答不了（反向查是 F3 ② 的原话） | `test/integration/doc-anchor-graph.test.mjs` |
| 43-3 | 真工具调用 `doc_graph`：带声明档的夹具项目里先 `scan`，把被引的目标档移走 → 再 `scan` → `forward` 查引用方 | 该边仍列出且状态为「目标不在盘」；目标不被换成盘上另一份同名档（不猜替代目标） | 修前红 = 文档改了或删了，引用处悄悄过期，收口面照着过期的那份判（需求档 §1 第二个实证） | `test/integration/doc-anchor-graph.test.mjs` |
| 43-4 | 构造一份引用自身的夹具档（一行引自身整档、一行引自身 `§5`）→ `scan` 后 `forward` 查它 | 自指那一行不成边（自环 = `src` 与 `dst` 逐字相同，设计 §2.2）：`forward` 里没有 `src` ∥ `dst` 逐字相同的那一行，按类行只记一条 `cites`；引自身 `§5` 那一行照常落边、`dst` 落 `#5`、照常印出（两个节点） | 修前红 = 自指那一行进表，`forward` 里「这档引了谁」的第一行就是它自己 | `test/integration/doc-anchor-graph.test.mjs` |
| 43-5 | 夹具仓 `scan` → 改一档（改后 `mtime` 晚于该档时刻）→ 再读任一回执 | 首份回执末行写「图建于 …」与「此后 0 档变更」；改后回执末行写「此后 ≥1 档变更」；两读的「K 档」非空（`K` = 库里 `scope` 的去重数，逐字相等判在单测档） | 修前红 = 回执不报图建于何时，读者无从判断这份图还能不能信（AC-9 的失效面：写着「此后 0 档变更」而盘上确有变） | `test/integration/doc-anchor-graph.test.mjs` |

## CLI 46. 跨实例发消息：一条消息送进另一实例并起一轮，回程带请求号

> 目的：同一台机器上的两个实例（不同仓也算）能互相说话——把一段话直接送进对方会话，对方空闲就起一轮处理；对方正在跑一轮就等它跑完，绝不插进当前这一轮；对方回话靠请求号与首发对上。
> 节注：回指 = 需求 `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` F-MI10 ∥ N-MI8；机制单源 = `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5（§5.2 名册 ∥ §5.3 回执与请求号 ∥ §5.4 投递与取件 ∥ §5.5 可达性四态）；交互组件 = 名册（`thincoder-core/instance-registry.mjs`）⟷ inbox（`thincoder-core/instance-inbox.mjs`）⟷ 取件闩与消息形态（`thincoder-core/instance-inbox-watch.mjs`）⟷ 工具面 `instance_send`；进入口 = 两个真 node 进程共用同一临时 `~/.thincoder` 等价根，A 端调 `instance_send` 发给 B；一态（行序）= 46-1 正常（含在飞回合不插队与末段不可达报错）。
> 夹具前提：回合面与宿主定时器由 `test/integration/fixtures/cross-instance-harness.mjs` 驱动（真 CLI TUI 要 TTY、要真 provider）——`tick` = 跑掉夹具队里的定时器回调一拍（真宿主同形），`busy` = 在飞回合，`failTake` = 开轮面 reject，`advance` = 假钟推进（受阻跨阈不靠真实等待）。本行因此覆盖「名册 × inbox × 取件闩 × 消息形态 × 跨进程投递」这条链，不覆盖 TUI 渲染与真模型读法（人工走查）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 46-1 | 两个实例 A / B 共用同一临时根（名册目录 + inbox 目录各自缝到该根）：A 调 `instance_send` 发给 B，此时 B 的 `busy` 为真；B 取件一拍 → B 置空闲再取件一拍 → 回话时带 `re` = 首发回执的 `requestId` → A 取件一拍；最后 B 再置 `busy` 真，A 发第三条、B 两拍；**末段后增一步**：上一轮中止结束后来一条，且两个补位点（回合链尾 / 模态关闭）**一次都不调用**（由夹具直驱取件闩，不依赖 TUI 中止键） | ① B 会话出现一条 `role:"user"` 消息，首行逐字 `[cross-instance message · from cli pid=<N> session=<id> cwd=<p>]`（无 `re=`）、次行为空行、第三行 = 原文，并起一轮；② A 的回执带 `requestId`，其值 = B inbox 那枚 `msgId`（文件名即该号）；③ B 的回程消息落回 A 会话，标记行逐字带 ` · re=<requestId>`；④ B 在跑一轮时 A 再发 ⇒ B 该轮回合数不变、那条只在轮结束后才起新一轮（`turns` 由 1 变 2）；另：取件成功后目标 inbox 目录零残留；⑤ **自续补位**（同「怎么做」新步）：补位点一次都不调用 ∧ 在飞一拍之后仍有一拍待跑 ⇒ 中止结束那条下一拍仍取走并起新一轮（`turns` 再 +1）；⑥ **两条新可见面各恰好一行**——注入开轮 reject ⇒ 目标侧一行丢失行且 inbox 仍空（不重投）；`nowFn` 推过 `INBOX_BLOCKED_MS` 且 inbox 非空 ⇒ 一行受阻行，空则零行；⑦ **载体不就绪也出声**——假端 `ready() === false` ⇒ 零取件（inbox 仍有件）+ `nowFn` 推过 `INBOX_BLOCKED_MS` ⇒ 恰一行受阻行且日志 `reason === "carrier"`；`ready` 转真 ⇒ 下一拍取件恰一次、起轮恰一次 | 同档末段 = 目标不可达（无此会话：调 `instance_send` 指一个从未登记的 id）⇒ 发送面当场报错并点名该 id 与「无取件面的 headless 会话不入册」，该 id 的 inbox 目录在盘上不存在（不落待取队列），A 自己的名册条目不受影响 | `test/integration/cross-instance-message.test.mjs` |
## CLI 49. 子代理只拿得到角色允许的工具动作

> 目的：子代理读到的工具说明 = 它真能用的能力。只读角色（explore ∥ plan ∥ consult）不因整把工具不是只读而失去真正的只读动作（git 历史、记忆检索、配置读数、进程列表），写动作既不出现在它的描述与 schema 里，直接调进来也在原执行之前被拒；设计席的「每批最多六次勘察」从一句承诺变成会拒的计数；eng 两角色能读到父会话里本批那一段被限量的历史，其余角色仍靠任务书。
> 节注：回指 = 需求 `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` B3–B8；机制单源 = `docs/core/design/TOOLS.md` §6.29（① 共用 action 变体 ∥ ② 家族与角色 profile ∥ ③ doc_graph 未建图 ∥ ④ 受限父历史）；交互组件 = 只读变体构造器（`thincoder-core/agent/helpers.mjs`）⟷ 运行期动作判据（`thincoder-core/agent/dispatch-gates.mjs` 的 `readonlyActionOf`）⟷ 角色装配（核 `thincoder-core/agent/family-tools.mjs` ∥ `agent-tools/subagent-spawn.mjs` ∥ 端 `thincoder-vscode/src/agent/tool-table.mjs`）⟷ 工具面（`doc_graph` ∥ `ledger` ∥ `team_ledger` ∥ `batch` ∥ `read_history`）⟷ 子代理报告；进入口 = 主会话经 `subagent` 派单（子代理调用工具并把结果带回）∥ 设计席自己经内部通道派勘察；三态（行序）= 49-1 正常 · 49-2 边界 · 49-3 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 49-1 | 父侧在工程模式经 `subagent` 派 `role:"explore"`（任务书五项），本地脚本化假 Anthropic 端点在子代理首回合派三条真调用：`git log`（夹具仓有一条提交）∥ `settings list` ∥ `process`（不带 action）；同用例再从子代理请求体读它实际收到的四族 schema；随后以「原 execute 挂观察壳」的同一构造器造四族只读变体，逐个直接 execute 写动作（`git commit` ∥ `memory put` ∥ `settings set` ∥ `process kill`） | ① 三条只读调用真跑成功并回到父侧报告（提交原文 / 配置键 / `PID` 各自出现）；② 子代理 schema 面：`memory` = `search` ∥ `list`、`settings` = `list` ∥ `get`、`process` = `list`、`git` 含 `log` ∥ `show` ∥ `diff` 且不含 `commit` ∥ `push` ∥ `reset` ∥ `add`，四族均不出现写专用参数（`message` ∥ `name` ∥ `tags` ∥ `mode` ∥ `dest` ∥ `title` ∥ `content` ∥ `pid` 等）；③ 四次直接 execute 全拒，拒句点名动作并说清是只读面，**原 execute 一次都没跑**（观察壳零记录），仓内提交数仍为 1；④ tester 不顺扩：整把只读集不含 `git`，只读变体面才含 | 无 | `test/integration/tool-role-fitting.test.mjs` |
| 49-2 | 未建图的夹具仓：经同一入口派 explore 子代理去 `doc_graph forward`，读它那一发请求体与报告；再直接 execute 只读变体的 `scan`；最后往台账库路径写入坏档，重跑一次查询 | ① 子代理收到的 `doc_graph` 枚举逐字三值（`forward` ∥ `reverse` ∥ `chain`）、不带只服务 `scan` 的 `scope`；② 未建图返回可区分空态（逐字 `doc_graph: graph not built yet (read-only empty state) — …`），既不冒充「该节点没有边」，也不要求父代先扫（描述里零 `ask the parent`、零 `scan` 用什么用）；③ 直接 `scan` 仍拒且拒句给出可用取值集；④ 坏档 ⇒ 读取失败原样抛出，绝不落成空图或未建图；depth-0 面仍四动作（含 `scan`） | 无 | `test/integration/tool-role-fitting.test.mjs` |
| 49-3 | 建批走真入口（`batch create`），父会话摆两条消息（一条在本批起点之前、一条在之后）；派一发 eng-designer 取它的 `extraTools` 与窗口读数；再由**设计席自己的** `subagent` 变体连续派六次 explore，第七次同样的派单；随后换一个 designer child（`round:"fix"` 重派）再派一次；末段取一次 explore 的 `extraTools` 与家族段 | ① 第七次勘察拒且拒句点名「6 explore spawns per batch record」；② `round:"fix"` 的重派**不归零**（仍拒）——计数挂在 depth-0 根 agent 上；③ eng-designer 拿到的 `read_history` 只读本批窗口（起点之后那条读得到、起点之前那条读不到），`limit` 必传且 `51` 被拒（上限 50），`path` 直接拒；④ 未绑定角色（explore）既无 `extraTools` 里的历史工具，家族段里也不出现 `read_history` | 无 | `test/integration/tool-role-fitting.test.mjs` |
