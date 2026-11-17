# 工具系统（TOOLS）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`。

## 1. 装配

tools/index.mjs 与 agent-tools.mjs 提供核注册；family-tools.mjs 按 depth/mode/role 组合；宿主 extraTools 提供 ide 等结构差异。

DESC(name) 从 tool-docs 加载唯一描述。schema 与描述按当前只读变体收窄。

DESC 读的是母版原文，不清包含锚；分档展开在 schema 装配处发生：`toOpenAISchema(tool, mode)` 按 mode 拼接描述，完整档把锚替换成展开面，极简档移除锚。

装配顺序是先在 schema 装配处展开锚、再跑 `applyPromptInjections`：注入值由端侧提供，顺序倒过来会把注入值当主题锚再展开一次。

mode 是必填参数：缺它或取值不在 tiny / normal / engineering 之内即抛错并点名该参数。不给缺省值——缺省会让一次运行悄悄用上另一档的文本，而错处要到模型按错文本行事时才显形。

因此 `tools.map(toOpenAISchema)` 这种直接把函数交给 `map` 的写法不成立：`map` 的第二手参（下标）会被当成 mode，首个元素即因取值非法而抛。

档位一律写在第二实参位，逐点的真形见下表：主链那一行的档位值是会话 mode 与 consult 的合取，`toolMode` 在 prepareRun 里先绑出；其余面的作用域里没有会话档位，直接填 `"normal"`。

各调用表达式传哪一档（`thincoder-vscode/src/tools/index.mjs` 只 re-export，不是调用点）：

| 调用点 | 表达式 | 传哪一档 | 依据 |
|---|---|---|---|
| `thincoder-core/agent/setup.mjs` 的 prepareRun | `tools.map((tool) => toOpenAISchema(tool, toolMode))` | 会话现读 mode（`resolveWorkMode(agent.config?.agent)`）；`agent._role === "consult"` 时取完整档 | 主链按档装配（PROMPT-SYSTEM 设计档 §5） |
| `thincoder-core/advisor/loop.mjs` 的 `advisorToolsFor` | `tools.map((tool) => toOpenAISchema(tool, "normal"))` | 完整档 `normal`，不读会话 mode | `requirements/PROMPT-SYSTEM.md` §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」；与 PROMPT-SYSTEM 设计档 §4 同一口径 |
| `thincoder-server/src/agent/chat-env-tools.mjs` 的 `createEnvTools` | `ENV_TOOL_NAMES.map((name) => core.toOpenAISchema(toolOf[name], "normal"))` | `normal` | 环境工具面不经极简装配，可见文本与改造前一致 |
| `bench/check/toolcall.check.mjs` | `builtinTools.map((tool) => toOpenAISchema(tool, "normal"))` ∥ `toOpenAISchema(readImageTool, "normal")` | `normal` | 对照面 = 产品面实面逐字，对照文本 = 改造前全文 = 完整档装配 |
| `bench/toolcall/variants.mjs` | `builtinTools.map((tool) => toOpenAISchema(tool, "normal"))` ∥ `tools.push(toOpenAISchema(readImageTool, "normal"))` | `normal` | 同上 |
| `prompt-fixture/tools.mjs` | `.map((name) => toOpenAISchema(DECLARED_TOOLS[name], "normal"))` | `normal` | 同上 |

consult 子代理与主链共用 prepareRun（`thincoder-core/agent-tools/consult.mjs` 以 `role: "consult"` 建子代理，再由 `thincoder-core/agent/run-start.mjs` 进同一条装配链），所以它的工具描述档位在 prepareRun 里按 `agent._role === "consult"` 取完整档，与系统提示词用的会话 mode 分开取——否则极简会话内的 consult 被极简档改写，就与 `requirements/PROMPT-SYSTEM.md` §9.1 当场矛盾。

分档装配只覆盖主链工具面：consult 虽在主链装配，取的是完整档、不随会话档位变化；advisor、server 环境工具面、bench 与 prompt-fixture 的对照面同样不随会话档位变化。

角色与模式收窄在 `thincoder-core/agent/family-tools.mjs` 组合。`tester` 的工具表 = 只读集 ∪ `{execute, bash}` 减 `{verify, advisor}`，表内无写工具（该档注释「tester's tool table (read-only set ∪ execute/bash − {verify, advisor}) holds no write tool」）。

「只跑不改」是角色纪律，不是文件系统隔离——`bash` 仍能写，这是有意的。

工程模式下 `task` 与 `plan` 都不入表（`engineering ? [timerTool, knowledgeTool, …] : [taskTool, planTool, …]`），模型看不见、零 token 税；追踪由批次记录与台账承担。

### 1.1 宿主侧对描述母版的行级改写

宿主对某端不存在的动作做的行级剔除跑在装配之后、对拼好的描述生效：`thincoder-vscode/src/agent/tool-table.mjs` 的 `stripPanelActionLines`（`description.split("\n").filter((l) => !l.startsWith("- action:'panel'")).join("\n")`）经 `toOpenAISchema` 的 `descriptionPostProcess` 钩子作用在装配完的那份描述上。

顺序不可倒：锚展开先发生，剔除在它之后；倒过来，展开面里的端面行原样回到 VSC 描述，带上端面没有的动作。

`thincoder-core/prompts/knowledge/tool-subagent.md` 的 `- action:'panel'` 一行按内容归属属动作细则，落在展开面，不进常驻面；剔除点因此落在装配之后。

展开文法与失败语义单点在 prompt-files.mjs（PROMPT-SYSTEM 设计档 §2）：锚独占一行、重复标识失败、未解析失败，与提示词母版同一套。

### 1.2 写门参数的说明面

写门挂在十一个入口工具上（`write` / `edit` / `insert_after` / `apply_patch` / `delete` / `hashline_edit` / `file_ops` / `bash` / `execute` / `memory` / `ssh`）：十一把的 schema 都带 `ledger`，除 `ssh` 外的十把另带 `project`；`required` 不因档位或工具变化。

`ssh` 不带 `project` 是因为它写的是远端主机，本机项目根对这笔写入没有语义——它的写门只按 action 判（`get` 往本机落盘）。缺键不是待补的缺口：补上它就动了参数 schema 的键集。

参数说明只写这一笔要传什么：`ledger` = 本笔调用服务的在途台账号（`"#N"` 或 `"N"`），`project` = 带 `PROJECT-MANIFEST.json` 的项目根。三处每工具差异留在参数行内，因为它们改的是「这一笔该传什么」：`memory` 只有落 project 层的写型 action 要号、`ssh` 只有 `get` 要号、`project` 是纯声明不改执行目录。

这两行身份句的文本单点在 `thincoder-core/tools/write-gate-params.mjs`；`thincoder-core/tools/shared.mjs` 只转出同一常量，八处导入档的导入面不动——文本单点与导入面分开，改口径只改一处，消费面不跟着改名。

完整口径只在工程纪律段讲一次（`thincoder-core/prompts/discipline-engineering.md` 的写门参数一节）：哪一档生效、哪些工具必带、缺什么怎么被拒。参数行不重述它——每个入口工具各带一份近乎逐字的副本，改一处口径就要改每一处，漏一处就是两套规则在跑。

口径不进公共段：tiny 档不加载工程纪律、写门也不生效，公共段会为一条用不上的规则付常驻开销；反过来参数行必须自带身份，极简档里没有工程纪律段可看。

## 2. 调度

dispatch 依次做参数、plan、工程写门、批次、权限、hooks 与执行。action 级分类覆盖 subagent/batch 等。

这里的 `hooks` 是配置里的用户自定义生命周期命令（`thincoder-core/hooks.mjs` 的 `runHooks(event, ctx)`，事件取自 `config.hooks`），不是「写完跑 lint」那道工序——后者落在提示词面（`thincoder-core/prompts/discipline-normal.md`「After every write/edit: `lint`.」）。`verify` 只读调用者的声明、不代跑测试（VERIFY-REDESIGN 设计档 §1「command 只是声明，不由 verify 执行」）。

只读可并行，副作用保序；undo 快照在写前。结果经当前 offload，console 捕获有界。

## 3. 写工具

edit/apply_patch/write 等以当前项目写门授权。批量编辑逐条应用与报告，同档一次写；档级失败不抹掉其他档成果。

失败回执使用 `<定位> — failed: <原因>` 与真实汇总。路径和 touchedPaths 使用同一当前提取规则。

## 4. git 与进程

runGit 在单点设置非交互环境、pager 抑制、超时和错误。发现规则复用 manifest/discoverRepos。

bash async 使用当前后台池、日志与统一 digest。process kill 定向杀树；会话中止与单轮中断按当前不同生命周期。

`execute` 起的是真实 `node` 子进程（`thincoder-core/tools/execute.mjs` 的 `spawn(process.execPath, childArgs, …)`），与 `bash` 同一权限边界，不是伪沙箱。

### 4.1 commit 携 path 的未跟踪预检

`commit` 带 `path` 时走 `git commit --only`，只认已进索引的路径。请求里任一路径未被跟踪，git 抛 `pathspec '<path>' did not match any file(s) known to git`——句子只说「没匹配上」，真实原因却只有一个：该档从未进过索引。工具因此在调用 git 之前逐条预检，一次拒并点名未跟踪的档。

- **判据取索引视图，不拿 git 的报错文案做分支**：逐条 `git ls-files -z --with-tree=HEAD -- <path>`，输出为空即该路径未被跟踪。`--with-tree=HEAD` 不能省：`git rm <档>` 之后该档已不在索引里，纯索引视图读到空，而 `--only` 提交它是成功的——只查索引就会把一次可成功的提交拒掉，正好是本条预检的反面。预检问的对象与提交面是同一条路径规格——依据 `thincoder-core/tools/git.mjs`「commit = await runGitStrict(ctx.cwd, ["commit", "--only", "-m", args.message, "--", ...trimmed.split(/\s+/)])」。
  为什么不 catch 到 `pathspec ... did not match` 再翻译：那是拿英文句式做分支，git 换措辞或换语言环境即失效，与「不拿散文做判据」同一条纪律。
- **逐条问，不批量取回再比字符串**：目录、通配（`*.mjs`）、已 `git add` 的新档三种形由 git 自己的 pathspec 引擎判。批量取回再字面比较，会把通配与带尾斜杠的目录误判成未跟踪，拒掉一次本可成功的提交。逐条之间互不依赖、只读索引，因此并行问，不为一串路径排 N 次往返。
- **全有或全无**：任一请求路径未跟踪 ⇒ 整次拒，不做部分提交——`--only` 本就是原子语义，放行一半会让「提交了哪些档」与请求集对不上。
- **拒文点名并给两条出路**：`Error: commit path not tracked by git — untracked: <paths> — run git add on them first, or omit path to commit all changes (add -A + full commit)`。形态沿用同分支已有的前置拒（空路径那条：`Error: commit path is empty/whitespace — give at least one file path (space-separated)`）。
- **预检自身失败不构成拒**：`ls-files` 非零退出（路径规格语法错、HEAD 尚未出生）⇒ 该路径不判，落回原提交路径，由 git 报它自己的错。可复现路径：`git ls-files -z -- ':(bad)'` 退出 128 并打印 `fatal: Invalid pathspec magic 'bad' in ':(bad)'`。业务结果不变（同样不产生提交），只是诊断退回改前形态；把技术故障读成「未跟踪」，会拒掉一次本可成功的提交。仓外由这一条覆盖：仓发现在零候选时按原值继续（`thincoder-core/tools/git.mjs` 仓发现注释「零 ⇒ 原值 落 §6.12 fail-closed（零行为变）」），`ls-files` 在那里非零退出 ⇒ 不判、由 git 报它自己的错。
- **工具描述面须承载这一条**：未 `git add` 的新档会被拒且拒文点名，出路是先 `git add` 或不带 `path`。落点 = `thincoder-core/prompts/knowledge/tool-git.md` 的 commit 一条。

**边界**：只加这一条预检。`--only` 的提交语义与已跟踪档的提交路径不动；不带 `path` 的分支（`add -A` + 全量 commit）不动；`add` / `rm` 的多路径拆分语义不同，不加同类预检。

## 5. 网络

websearch/fetch 在请求前执行 SSRF 规则。DeepSeek 后端资格、超时、重试、熔断和回落由核统一；本地后端不依赖第三方。工具描述不宣称未配置后端可用。

搜索工具的先手顺序不在这条工具里：MCP 搜索工具优先，`websearch` 只在没有 MCP 工具时兜底（`thincoder-core/prompts/knowledge/tool-operations.md`「MCP search tools (`*_web_search*` / `*_search_prime` etc.) are PRIMARY for technical verification and general search」）。

凭据熔断只认 401 / 402 / 403：404 是目标页面的状态，不是凭据失效，不触发熔断（`thincoder-core/tools/web-deepseek.mjs` 的 `TRIP_STATUS`，注释「404 = 目标页面的状态，不是凭据失效（D-WB3）」）。

### 5.1 初始 URL 与主机分类

fetch 的初始 URL 必须以字面 `http://` 或 `https://` 开头，并能由 `new URL` 解析；解析失败或命中私网门时直接报错，不进入 DeepSeek 或本地抓取。通过初检的公网 URL 才进入后续后端链。

主机小写后应覆盖以下拒绝分类：

| 类 | 地址或名称 |
|---|---|
| 本地与元数据名称 | `localhost` 及其子域、`metadata.google.internal` |
| IPv4 | `0.0.0.0`、`0/8`、`127/8`、`10/8`、`172.16/12`、`192.168/16`、`169.254/16`、`169.254.169.254` |
| IPv6 | `::1`、`fc00::/7`、`fe80::/10` |

当前门只检查 URL 中的主机字面，不做 DNS 解析。域名解析后落到私网或元数据地址不在现有覆盖内，不得写成已防护。

### 5.2 DeepSeek 复查与本地抓取

DeepSeek 抓取在把 URL 交给第三方前，再用 `new URL` 和同一 `isPrivateHost` 检查主机。非法 URL 或私网命中返回失败；DeepSeek 失败或正文为空时回本地抓取。该复查同样受下节 IPv6 方括号缺口影响。

本地重定向的目标契约是：只对 301、302、307、308 且带 Location 的响应跟进一次；相对地址先经 `new URL(location, baseUrl)` 归一，目标必须仍为 http/https 并重新过私网门。第二响应仍重定向时不再跟进。初拒、非法重定向、私网重定向和 HTTP 失败均显式报错，不返回空成功。

### 5.3 当前实现缺口（技术债）

- **IPv6 字面形未命中**：Node 的 `new URL` 对 IPv6 URL 返回带方括号的 hostname，例如 `[::1]`、`[fc00::1]`、`[fe80::1]`；`thincoder-core/tools/shared.mjs` 的 `isPrivateHost` 未去方括号，却直接与 `::1` 比较并检查 fc、fd、fe80 前缀。当前这些 URL 经该门返回 false，上表 IPv6 分类是应覆盖边界，不是已生效拦截。
- **直连自动重定向绕过复查**：`thincoder-core/proxy.mjs` 的 `proxyFetch` 直连支调用原生 fetch 时未传 `redirect:"manual"`，原生 fetch 会自动跟重定向，`thincoder-core/tools/web.mjs` 的 Location 私网复查因此不一定执行。显式代理支返回原始响应时才具有一次手动跟进并重新过门的保证；直连尚未覆盖该目标契约。

两项均为待修技术债，不得当成当前已生效的防护。

## 6. SSH

ssh.mjs 管理 connect/send/read/secret_input/close/list/credentials/forget/put/get。

密钥、agent、保存凭据和交互窗按当前顺序。密码经子进程安全输入面，绝不入模型历史。输出为清理后的有界文本窗。

SCP/SFTP 是单文件二进制通道；传输复用会话主机与凭据，get 经当前写门。

## 7. 专门工具

VERIFY-REDESIGN、CONTEXT-COMPACTION、BATCH-RECORD、LEDGER、DOC-CHECK、DOC-GRAPH、BROWSER-TOOL 和各编辑专题文档负责其详细契约，本档不复制。

配置键的消费点落在各自的工具面上，写入口是 `settings` 工具：`set` 把值写进 `config.json` 并对当前会话热应用，`list` ∥ `get` 只读。一个键没有消费点时它不该存在——配置项与消费它的那段代码同批落地。

## 8. 验证

验证角色工具表、描述与执行一致、权限与业务负例、批量部分写、git 零/多仓、后台退出、网络失败、SSH 凭据和输出回查。

写门参数面：键集、说明面与拒的行为见 §1.2，本处不复述。
