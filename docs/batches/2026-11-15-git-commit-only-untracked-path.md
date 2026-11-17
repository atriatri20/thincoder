# 2026-11-15 · git-commit-only-untracked-path
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 台账 #2450；用户 2026-11-15 16:38 令「可以」（同意现在就开批）。
> 台账 = #2450（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = 8600e19f360e451f598ebee87c0b3748a0801c0e
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论：要解决什么

`git` 工具的 `commit` 在携 `path` 时走 `git commit --only`。若其中任一路径**未被 git 跟踪**，工具把 git 的原始报错原样抛出：`pathspec '<path>' did not match any file(s) known to git`。

这句说的是「这条路径没匹配上」，真实原因只有一个——**这个档从没进过索引**。两者对读的人不是一回事：前者听起来像路径打错了。

**实测代价**（2026-11-15，本会话）：12 档 path-limited 提交因其中一个新档未被跟踪而失败一轮；`git add` 同一批路径后第二次成功。

## 已定决定

- **已定决定**：登记并单独开批修，用户原话：「要不要登记成一条债？这个你打算怎么修改？」→ 主 agent 给出改法 → 用户「可以」（同意现在开批）· 时间：2026-11-15 16:38
- **已定决定**：判定方式是**提交前预检**，不解析 git 的报错文本 · 用户未反对主 agent 给的改法 · 时间：2026-11-15 16:38

## 改法（设计席可推翻，但推翻须给比它更好的判据）

提交前用一次 `git ls-files -z -- <paths>` 取「请求集里已被跟踪的那部分」，与请求集比对；未命中的一次性拒，拒文点名哪几个档没被跟踪，并给两条出路（先 `git add` 它们，或改用不带 `path` 的 commit）。

**为什么不 catch `pathspec ... did not match` 再翻译**：那是拿英文句式做分支，git 换措辞或换语言环境即失效——与「不拿散文做判据」同一条纪律。

**比对必须处理的两件事**（当前实现已允许它们，改成预检不能把它们拒掉）：

1. **目录路径**——`ls-files -- dir/` 返回 dir 下的文件而不是 `dir/` 这个字符串；请求集含目录时按前缀判，不能要求逐字相等。
2. **已 staged 的新档**——`git add` 过的未跟踪档在索引里，`ls-files` 会返回它，须放行。这正是实测得出的行为。

## 边界（设计席不得越）

- **不改 `--only` 的提交语义**：只加一条「注定失败时提前拒并说准原因」，已跟踪档的提交路径维持现状。
- **不动不带 `path` 的分支**（`add -A` + 全量 commit）。
- **不在 `add` / `rm` 分支上加同类预检**：它们的多路径拆分与语义不同，本批只修 commit。
- **拒文必须给可执行出路**，不能只说「无效输入」。

## 验收面（本批怎么算做完）

1. 请求集含一个未跟踪档 ⇒ 拒，拒文点名该档，且不产生任何提交
2. 同一请求集里其余档都已被跟踪 ⇒ 同样拒（全有或全无，不做部分提交）
3. 请求集全为已跟踪档 ⇒ 提交成功，行为与改前逐字一致
4. 请求集含已 `git add` 的新档 ⇒ 放行并提交成功（不能把这条路堵死）
5. 请求集含目录路径 ⇒ 按前缀判，目录下有已跟踪文件即放行
6. 红侧：改前同一输入抛的是 git 原始 `pathspec` 报错，拒文里没有「未跟踪」这类可读原因

## 勘察与先例

- **最近先例**：`thincoder-core/tools/git.mjs` 的 `commit` 分支对「path 为空/全空白」已经做了前置拒并给出路（`Error: commit path is empty/whitespace — give at least one file path (space-separated)`）。本批沿用同一形态：**能提前判出的无效输入，在调用 git 之前拒，并说清出路**。
- 无外部源码档可查：git 自身的 `--only` 行为以实测为准（本批已记录两次实跑）。

## 与其它批的关系

- 台账 `#2444`（窗口预留与基线）与本批无交集；本批只动 git 工具面。
- 本批不是 micro-batch：它**新增一条拒绝分支**，破 micro 第 ④ 条「无语义面」。

## 设计席推翻与主 agent 裁定（2026-11-15 16:47）

- **已定决定**：接受设计席对判定形态的推翻——由「一次批量 `ls-files -z -- <paths>` 取回再与请求集比对」改为「逐条 `git ls-files -z -- <path>`，空输出即未跟踪」· 用户原话（本批授权）：「可以」· 时间：2026-11-15 16:47

**接受的理由**：批量取回后做字面比较，会把通配（`*.mjs`）与带尾斜杠的目录误判成未跟踪，因而拒掉一次本可成功的提交——比现状更坏。逐条问由 git 自己的 pathspec 引擎判，目录、通配、已 `git add` 的新档三种形都不需要额外分支。§1 原定「判定方式 = 提交前预检、不解析 git 报错文本」未变，变的只是取索引的形态。

**另一项设计自裁保留**：预检自身失败（`ls-files` 非零退出）不构成拒，落回原提交路径。业务结果不变——同样不产生提交，只是诊断退回改前形态；把技术故障读成「未跟踪」会拒掉一次本可成功的提交。

## 自动推进（用户令，2026-11-15 17:00）

- **已定决定**：本批剩余全程自动推进，不在每站等确认 · 用户原话：「自动跑完吧」 · 时间：2026-11-15 16:59
- **范围**：评审结论裁定、修面轮、实施、验收、收口、提交，全部由主 agent 连跑。
- **仍然停下找用户的四类**：评审出 🔴 且改不了 · 实施发现设计缺口 · 用户叫停 · 范围变更。

## 设计评审 #22 裁定与修面派单（2026-11-15 17:05）

- **已定决定**：评审 1 🔴 + 8 🟡 + 1 🔵 全数接受，派设计席一轮修面；设计未通过评审故未冻结，八条一轮改净 · 用户原话：「自动跑完吧」 · 时间：2026-11-15 16:59
- **第 1 条的处置不是删分支**：`ls-files` 非零退出时空输出会被读成「未跟踪」，删掉分支会造出一次假拒。保留分支、去掉不可达的「仓外」（设计 §4「发现规则复用 manifest/discoverRepos」+ 需求 §2「零/多候选不猜」⇒ 仓外走不到 commit）、补一条可复现路径（畸形 pathspec，实施席实跑后写下那条命令）。
- **第 9 条由主 agent 处置**：设计 §5.3 已如实声明为待修技术债，缺的是主人不是坦白 —— 已落台账 `#2451`（IPv6 字面形绕过私网与元数据地址门，含 `redirect:"manual"` 一项）。
- **第 10 条不成立**：本批 §2「集成增量」节已写明新增 `CLI 55`，评审未见 §2 属范围问题。

## 设计评审 #24 裁定与实施派单（2026-11-15 17:12）

- **已定决定**：评审 pass（0 🔴 · 7 新 🟡 · 4 新 🔵），上一轮 11 条核为 10 Fixed / 1 Accepted；11 条新发现一律 Deferred —— 设计档字节随评审通过冻结，改动即令 token 失效，实施交付后由设计席一轮落 · 用户原话：「自动跑完吧」 · 时间：2026-11-15 16:59
- **交付后修面清单（设计席 fix 轮，逐条已带落点）**：§1.1 的 `tool-docs/subagent.md` 指向改为 `prompts/knowledge/tool-subagent.md`（该行实体在那儿）· §4.1「仓外走不到这里」改为「仓外由 `ls-files` 非零退出那条覆盖」（`git.mjs` 仓发现注释写着「零 ⇒ 原值 落 §6.12 fail-closed」）· §8 改为指向 §1.2 而不重抄三句 · §1.2 的 `ledger` 说明改用常量原文「在途台账号」· §5.1 的 `fc/fd` 改 `fc00::/7` · §4.1 末条的 `tool-git.md` 陈述改成「要求其承载」的措辞（该句实施后才在盘上）· 需求 `PROMPT-SYSTEM.md` §9.2 补 consult/advisor 排除（主 agent 的笔，同轮改）
- **需求覆盖四条待补落点**：需求 §1「配置键必须有消费点和设置 UI」· §2「execute 是真实 Node ESM 子进程，不是伪沙箱」· §3「工程模式 task 不使用」「tester 获得只读工具与 execute/bash」——设计档既无落点也无指针，随修面轮补一句或加进 §7 指针表
- **集成增量补件**：`CLI 55` 除 `test/RTM.md` 一行外，按 RTM 惯例还需 `test/rtm/tooling.md` 的用例小节；实施席只落 §2 写的行，收口时本席核对差量并补齐

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审 #22 修面一轮与交付后修面一轮均已落：设计档就地改，条目与验收面不动）





## 一、覆盖的条目（台账 #2450，六条验收面逐条落条目）

| # | 条目 | 来源 |
|---|---|---|
| E1 | `commit` 携 `path` 且任一路径未被跟踪 ⇒ 拒，拒文点名该档，且不产生任何提交 | §1 验收面 1 |
| E2 | 同一请求集里其余档都已被跟踪 ⇒ 同样整次拒（全有或全无，不做部分提交） | §1 验收面 2 |
| E3 | 请求集全为已跟踪档 ⇒ 提交成功，行为与改前逐字一致 | §1 验收面 3 |
| E4 | 请求集含已 `git add` 的新档 ⇒ 放行并提交成功 | §1 验收面 4 |
| E5 | 请求集含目录路径 ⇒ 目录下有已跟踪文件即放行 | §1 验收面 5 |
| E6 | 红侧：改前同一输入抛的是 git 原始 `pathspec` 报错，拒文里没有可读原因 | §1 验收面 6 |

## 二、设计档落点

`docs/core/design/TOOLS.md` §4.1（`## 4. git 与进程` 下新增小节，本席本批已落盘）。规则、合同与边界的唯一住所是该节；本段只报落点、受影响面与验收对照，不复述机制。

## 三、实施方向（符号级；规则本体见设计 §4.1）

改面 = `thincoder-core/tools/git.mjs` 的 `gitActionCore.dispatch` 里 `case "commit":` 分支。

- **插在哪**：现有「`path` 为空/全空白即拒」那句之后，`git commit --only` 之前。
- **怎么判**：对 `trimmed.split(/\s+/)` 的每条路径各问一次 `runGitStrict(ctx.cwd, ["ls-files", "-z", "--with-tree=HEAD", "--", path])`（逐条互不依赖、只读索引，故并行 `Promise.all`）；输出为空者进 `untracked` 列表。
- **怎么拒**：`untracked` 非空 ⇒ `return truncate(<设计 §4.1 的拒文>)`，不进提交。
- **谁不判**：`ls-files` 非零退出的那条路径不进 `untracked`（设计 §4.1「预检自身失败不构成拒」条）。
- **零副作用**：预检只读索引，不建快照、不写索引；`commit` 分支本就不调 `snapshotBefore`，故拒时工作树与 `git log` 都不动。

## 四、受影响文件与档位结论

**档位结论**（量法 = `countContentLines`，取数 = `git show 8600e19f:<档>`）：代码档最大读数 = `thincoder-core/tools/git.mjs` 的 425，未越设计时线 500 ⇒ **无拆分方案**；`commit` 分支体约 25 行，远低于 300 行函数档。

| 档 | 本批改什么 | 批起读数 |
|---|---|---|
| `thincoder-core/tools/git.mjs` | `commit` 分支新增预检与拒文（约 12 行，单一函数体内） | 425 |
| `thincoder-core/prompts/knowledge/tool-git.md` | commit 一条补「未跟踪会被拒并点名 + 两条出路」（产品档，由实施席落） | `.md` 不带读数 |
| `docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs` | 本批单测 A1–A10（收口即删） | `新` |
| `test/integration/git-commit-untracked-path.test.mjs` | 集成用例 `CLI 55-1`（见第七节） | `新` |
| `docs/core/design/TOOLS.md` | §4.1 新增小节（本席已落） | `.md` 不带读数 |
| `test/RTM.md` | 新增 `CLI 55` 一行 | `.md` 不带读数 |

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/git.mjs | — | 425 |
| docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs | — | 新 |
| test/integration/git-commit-untracked-path.test.mjs | — | 新 |
```

## 五、验收对照

单测档 = `docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs`；夹具 = `mkdtemp` 下的真仓（`git init` + 一次初始提交），入口 = 真工具 `gitTool.execute({action:"commit", …}, {cwd: 夹具})`。判法统一为「跑 `node --test <单测档>`，逐例读断言」。

| 验收面 | 判据（读者可判） | 例名 |
|---|---|---|
| E1 | 返回串以 `Error: commit path not tracked by git` 开头并含该未跟踪档的相对路径；`git log --oneline` 条数不变、该档与其余档都没进提交 | A1 |
| E2 | 同一请求集（一未跟踪 + 一已改的已跟踪档）返回同一拒文；已跟踪档的改动仍在工作树，未被提交 | A2 |
| E3 | 返回串与改前逐字同形（含 `(checkpoints cleared — commit is a new safety baseline)`），`git log` 新增一条且只含请求集内的档 | A3 |
| E4 | `git add` 过的新档不触发拒文，提交成功且该档在提交里 | A4 |
| E5 | 请求集含目录路径 ⇒ 不拒，目录下已跟踪档进同一提交 | A5 |
| E6 | 同一输入（含一未跟踪档）的返回串**不含** `pathspec`、含 `not tracked by git`；红侧读数（批起 `git.mjs` 上跑同一输入得 git 原始 `pathspec` 报错）由实施轮实跑记 §5 | A6 |
| 设计 §4.1「预检自身失败不构成拒」 | 畸形 pathspec 不构成拒，落回原提交路径由 git 报它自己的错 | A7 |
| 放行面·暂存删除（`--with-tree=HEAD` 的理由） | `git rm` 后该档不在索引但仍在 HEAD ⇒ 预检放行、提交成功 | A8 |
| 放行面·通配 | `*.mjs` 交给 pathspec 引擎判，不误拒 | A9 |
| 放行面·HEAD 尚未出生 | 探针非零退出 ⇒ 该路径不判、落回 | A10 |

## 六、关键决策

- **预检逐条问，不批量取回再比字符串**：目录、通配、已 `git add` 的新档三种形由 git 自己的 pathspec 引擎判。
  批量取回再字面比较会把 `*.mjs` 这类通配与带尾斜杠的目录误判成未跟踪，**拒掉一次本可成功的提交**——那比现状更坏。
  判定方式（提交前预检、不解析 git 报错文本）与 §1 已定决定一致，只有比对法换了。
- **探针取 `--with-tree=HEAD` 视图，不取纯索引**：`git rm <档>` 之后该档已不在索引里，纯索引视图读到空输出，而 `git commit --only` 提交它是成功的（§5 三 实测 `1 file changed, 1 deletion(-)`）——纯索引会把一次可成功的提交拒掉，正是本条预检的反面。判据本体不变（空输出即未跟踪），变的是被问的那个索引视图。
- **全有或全无**：凭 `--only` 的原子语义，放行一半会让「提交了哪些档」与请求集对不上。
- **唯一的回落，及其依据**：`ls-files` 非零退出（路径规格语法错、HEAD 尚未出生）⇒ 那条路径不判、落回原提交路径。
  条件 = 预检自己失败；业务结果不变 = 无论预检跑没跑成，这条命令都不会产出一次本不该有的提交，只是诊断退回改前形态。
  反过来把技术故障读成「未跟踪」才会改变业务结果（拒掉合法提交），故不取。
- **拒文定稿**：`Error: commit path not tracked by git — untracked: <paths> — run git add on them first, or omit path to commit all changes (add -A + full commit)`。可执行出路两条（§1 边界第四条）。
- **工具描述面同步落地句**（`thincoder-core/prompts/knowledge/tool-git.md` 的 commit 一条里末句替换，逐字）：``New (untracked) files: `git add` them first — the tool refuses a path list with any untracked entry and names them (staging extra is safe — `--only` commits only the listed files).``
- **本批不是 micro-batch**：新增一条拒绝分支，破 micro 第 ④ 条。

## 七、集成增量（`test/RTM.md`）

- **新增一例**：`CLI 55`（用例编号 `CLI 55-1`，「git commit 携未跟踪路径 ⇒ 当场拒并点名，不给原始 pathspec 报错」，族 = tooling，档 = `test/integration/git-commit-untracked-path.test.mjs`）。
  入口 = 真工具调用；业务可观测结果 = 拒文点名 + `git log` 无新提交。
  它凭什么长出：本条是「生产真出过的问题」（12 档提交失败一轮）。
- **改写**：无。**删除**：无。窗口读数由实施轮收口复量（本段不报数）。
- **分册同落**：`test/rtm/tooling.md` 的 `## CLI 55.` 小节已在盘（该档写明单态 `55-1` 正常、其余放行面尚无永久用例）。

## 八、上抛项

- **[上抛·知会]** 比对法按 §1「设计席可推翻，但推翻须给比它更好的判据」推翻为逐条 `ls-files`，理由见第六节第 1 条；判定方式与 §1 已定决定一致。
  若主 agent 认为必须保留「一次批量取回」的形态，请回退，本席不自行改回。

## 九、评审 #22 修面一轮（2026-11-15）

逐条对号；设计档 `docs/core/design/TOOLS.md` 就地改九处，机制本体（设计 §4.1）不动，无新增语义。

| # | 落点 | 处置 |
|---|---|---|
| 1 | 设计 §4.1「预检自身失败不构成拒」 | 保留分支——删掉它会造出假拒：`ls-files` 非零退出时空输出会被读成「未跟踪」；删去不可达的「仓外」（提交 cwd 由发现规则定在当前项目仓：设计 §4「发现规则复用 manifest/discoverRepos」+ 需求 §2「git 缺省发现当前项目仓，零/多候选不猜」）；补可复现路径 `git ls-files -z -- ':(bad)'`，本席实跑读到：退出 128 · `fatal: Invalid pathspec magic 'bad' in ':(bad)'` |
| 2 | 设计 §1 调用点表「表达式」列 | 六格逐格换成实参面真形（如 `tools.map((tool) => toOpenAISchema(tool, toolMode))`），逐格取自 `thincoder-core/agent/setup.mjs`、`thincoder-core/advisor/loop.mjs`、`thincoder-server/src/agent/chat-env-tools.mjs`、`bench/check/toolcall.check.mjs`、`bench/toolcall/variants.mjs`、`prompt-fixture/tools.mjs` 六处源码；同节那段旧形列举收成一句，列举只留在表里 |
| 3 | 设计 §1 表 advisor 行 + §1 末段 | `requirements §9.1` 实际在 `docs/core/requirements/PROMPT-SYSTEM.md` §9.1（原文「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」在盘）；两处都补档名——裸「requirements §9.1」在 `docs/core/requirements/TOOLS.md` 里是空指向（该档只有 §1–§7） |
| 4 | 设计 §5 | 补两条需求 §4 规则的现状落点：MCP 优先的顺序在提示词面（`thincoder-core/prompts/knowledge/tool-operations.md`「MCP search tools … are PRIMARY for technical verification and general search」）；凭据熔断只认 401/402/403，404 是目标页面的状态（`thincoder-core/tools/web-deepseek.mjs` 的 `TRIP_STATUS`，注释「404 = 目标页面的状态，不是凭据失效（D-WB3）」） |
| 5 | 设计 §2 | 写明 dispatch 的 `hooks` 是配置里的生命周期命令（`thincoder-core/hooks.mjs` 的 `runHooks(event, ctx)`），不是「写完跑 lint」那道工序——后者在提示词面（`thincoder-core/prompts/discipline-normal.md`「After every write/edit: `lint`.」）；`verify` 不代跑测试（VERIFY-REDESIGN 设计档 §1「command 只是声明，不由 verify 执行」） |
| 6 | 设计档首部两行 | 删「最近先例」「勘察证据」——过程面不留在常驻设计档，原文移入本段第十节 |
| 7 | 设计 §8 写门段 | 删计数「另验三条」与检查方法指令「（逐份遍历，不抽样）」，改写成现状陈述 |
| 8 | 设计 §1.2 | 删错因「带本地定位参数的十把」——`memory` 无本地定位参数却带 `project`，该因果不成立；改为直述「十一把都带 `ledger`，除 `ssh` 外的十把另带 `project`」 |
| 9 | —— | 主 agent 已处置为台账 `#2451`，本席不动 |
| 10 | —— | §1 认定不成立（本段第七节已写 `CLI 55`），本席不动 |
| 11 | —— | 不适用：设计档不载行读数。读数按 D12 只在段第四节受影响文件表与命令输出里（量法 `countContentLines`），设计档写的是关系 |

## 十、先例与勘察（由设计档首部移入；常驻设计档只留现状）

- **最近先例**：`AGENT-LOOP.md` 的 dispatch 与 `PORTABILITY.md` 的项目归属。对齐 = 统一调度、真实副作用、宿主注入。
- **勘察证据**：已读注册、权限、编辑、git、后台、SSH、网络与角色收窄。相关 = 当前工具面。

## 十一、修面轮未动的项

- 条目 E1–E6、验收对照 A1–A6、集成增量（新增 `CLI 55`，无改写、无删除）、受影响文件与档位结论均不动：本轮改的是设计档的叙述与一处指向，机制本体未变。
- 档位结论复述不变：代码档最大读数仍是 `thincoder-core/tools/git.mjs` 的 425（量法 `countContentLines`，批起快照取数），未越设计时线 500 ⇒ 无拆分方案。

## 十二、上抛项

- **[上抛·知会]** 本轮只在设计 §5 记下网络两条规则的现状落点，本批不碰网络门；台账 `#2451`（IPv6 字面形绕过私网门 + `redirect:"manual"` 未落）仍是独立批。
- **[上抛·知会]** Lead（不在本批改动面、本席只报不改）：`thincoder-core/tools/linter.mjs` 三处注释引「TOOLS.md §10.2」，而设计档 `docs/core/design/TOOLS.md` 只有 §1–§8——代码面指向一个不存在的节号；且该档现状对 lint 工具无独立小节。

## 十三、交付后修面轮（2026-11-15，设计席）

本轮的笔只在设计档 `docs/core/design/TOOLS.md`：§1 装配、§1.1、§1.2、§4、§4.1、§5.1、§7、§8 共十一处就地改；机制本体（§4.1）未新增语义，条目与验收面未动。

| # | 落点 | 处置 |
|---|---|---|
| 1 | 设计 §1.1 | 指向改为 `thincoder-core/prompts/knowledge/tool-subagent.md`——`- action:'panel'` 那一行的实体在该档（依据 `thincoder-core/prompts/knowledge/tool-subagent.md`「- action:'panel': DIAGNOSE and fix the subagent panel」） |
| 2 | 设计 §4.1「预检自身失败不构成拒」 | 删「仓外走不到这里」，改为「仓外由这一条覆盖」：仓发现零候选按原值继续（`thincoder-core/tools/git.mjs` 仓发现注释「零 ⇒ 原值 落 §6.12 fail-closed（零行为变）」）；非零退出的条件补「HEAD 尚未出生」 |
| 3 | 设计 §8 | 写门参数面改为指向 §1.2，不再重抄键集三句 |
| 4 | 设计 §1.2 | `ledger` 说明改用常量原文「本笔调用服务的在途台账号」（`thincoder-core/tools/write-gate-params.mjs` 的 `LEDGER_PARAM_DESC`） |
| 5 | 设计 §5.1 | `fc/fd` → `fc00::/7` |
| 6 | 设计 §4.1「工具描述面」 | 改成「须承载这一条」的要求形，落点写明 `tool-git.md` 的 commit 一条 |
| 7 | 设计 §4.1「判据取索引」 | 探针命令改为 `git ls-files -z --with-tree=HEAD -- <path>`，理由按 §5 三 的 `git rm` 实测写进该条；「逐条问」补一句并行。本段第三节的实施方向同步 |
| 8 | 设计 §1 装配 · §4 · §7 | 需求覆盖四条中本席能落的三处补上落点：需求 §3 的 `tester` 工具表 ∥ 工程模式 `task` 不入表（`thincoder-core/agent/family-tools.mjs`）· 需求 §2 的 `execute` 真子进程（`thincoder-core/tools/execute.mjs` 的 `spawn(process.execPath, childArgs, …)`）· 需求 §1 的配置键消费点与设置 UI（`settings` 工具）。第四条（需求 §3「工程模式 task 不使用」的提示词面）与 §1 派给主 agent 的 `PROMPT-SYSTEM.md` §9.2 不属本席的笔 |
| 9 | 本段第五节 | 验收对照补 A7–A10 四行，记的是 §5 二 已实施并已验的回落面与放行面；E1–E6 与 A1–A6 未动 |
| 10 | 本段第七节 | 用例按 RTM 编号写成 `CLI 55-1`，并注明分册 `test/rtm/tooling.md` 的 `## CLI 55.` 小节已在盘 |

**未动**：条目 E1–E6、受影响文件与档位结论。档位结论复述不变：代码档最大读数仍是 `thincoder-core/tools/git.mjs` 的 425（量法 `countContentLines`，批起快照取数），未越设计时线 500 ⇒ 无拆分方案。

## 十四、上抛项

- **[上抛·知会]** 台账 `#2452`（git commit 放行面无永久集成用例）落点在本批第七节那条用例的放行面上，非本席处置；本批不新增债。
- **[上抛·知会]** Lead（不在本批改动面、只报不改）：`thincoder-core/tools/linter.mjs` 三处注释引「TOOLS.md §10.2」，而本档只有 §1–§8——代码面指向一个不存在的节号，且本档现状对 lint 工具无独立小节。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | §4.1 bullet `预检自身失败不构成拒` — "`ls-files` 非零退出（仓外、路径规格语法错）⇒ 该路径不判" |
    | 2 | 🟡 | New | §1 call-site table column `表达式` + "`tools.map(toOpenAISchema)` 这种直接把函数交给 `map` 的写法不成立" |
    | 3 | 🟡 | New | "requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」" vs requirements `## 7. 验收` |
    | 4 | 🟡 | New | requirements §4 "MCP 优先、DeepSeek/Tavily/Bing/local 后端规则" / "404 不触发凭据熔断" vs design §5 + §7 |
    | 5 | 🟡 | New | requirements §6 "write 后运行当前 lint；verify 不代跑测试。" vs design §2 "hooks" + §7 pointer list |
    | 6 | 🟡 | New | design header lines "> 最近先例：…" and "> 勘察证据：…" |
    | 7 | 🟡 | New | §8 "写门参数面另验三条：…（逐份遍历，不抽样）" |
    | 8 | 🟡 | New | §1.2 "其中带本地定位参数的十把另带 `project`" vs "`project` 是纯声明不改执行目录" |
    | 9 | 🟡 | New | requirements §4 "私网与元数据地址拒绝" vs §5.3 "不是已生效拦截" |
    | 10 | 🟡 | New | §4.1 "Error: commit path not tracked by git — untracked: <paths> — run git add on them first, or omit path to commit all changes"; record §2 not in scope (`unverified`) |
    | 11 | 🔵 | New | design carries no line readings; §2 conclusion line out of scope (`unverified`) |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 9 · 🔵 1 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | Fixed | §4.1 "可复现路径：`git ls-files -z -- ':(bad)'` 退出 128" |
    | 2 | 🟡 | Fixed | §1 call-site table cells vs `thincoder-core/agent/setup.mjs` `tools.map((tool) => toOpenAISchema(tool, toolMode))` |
    | 3 | 🟡 | Fixed | §1 row "`requirements/PROMPT-SYSTEM.md` §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」" |
    | 4 | 🟡 | Fixed | §5 "凭据熔断只认 401 / 402 / 403" + `tool-operations.md` MCP-priority quote |
    | 5 | 🟡 | Fixed | §2 "这里的 `hooks` 是配置里的用户自定义生命周期命令" |
    | 6 | 🟡 | Fixed | design header = "> 需求 = `docs/core/requirements/TOOLS.md`。" only |
    | 7 | 🟡 | Fixed | §8 "写门参数面：十一把的 schema 都带 `ledger`…" (no "另验三条") |
    | 8 | 🟡 | Fixed | §1.2 "除 `ssh` 外的十把另带 `project`" |
    | 9 | 🟡 | Accepted | §5.3 "两项均为待修技术债" + batch §1 "已落台账 `#2451`" |
    | 10 | 🟡 | Fixed | §4.1 "Error: commit path not tracked by git — untracked: <paths>" = §2 六 定稿 |
    | 11 | 🔵 | Fixed | design carries no reading; §2 四 "425" reproduced by my own read of `thincoder-core/tools/git.mjs` |
    | 12 | 🟡 | New | §1.1 "`thincoder-core/tool-docs/subagent.md` 的 `- action:'panel'` 一行" vs `thincoder-core/prompts/knowledge/tool-subagent.md` "- action:'panel': DIAGNOSE and fix the subagent panel" |
    | 13 | 🟡 | New | §4.1 "仓外走不到这里" vs `thincoder-core/tools/git.mjs` "零 ⇒ 原值 落 §6.12 fail-closed（零行为变）" |
    | 14 | 🟡 | New | §8 "十一把的 schema 都带 `ledger`，除 `ssh` 外的十把另带 `project`，`required` 不随档位或工具变化" = §1.2 same clauses |
    | 15 | 🟡 | New | PROMPT-SYSTEM §9.2 "tiny 主会话与各类子代理使用极简槽" vs §3 "consult 与 advisor 使用各自独立基底" |
    | 16 | 🟡 | New | requirements/TOOLS.md §1 "配置键必须有消费点和设置 UI。" · §2 "execute 是真实 Node ESM 子进程" · §3 "工程模式 task 不使用" |
    | 17 | 🟡 | New | batch §2 十 "最近先例：`AGENT-LOOP.md` 的 dispatch 与 `PORTABILITY.md` 的项目归属" (no implementation coordinate) |
    | 18 | 🔵 | New | §1.2 "在途行号" vs `write-gate-params.mjs` "本笔调用服务的在途台账号" |
    | 19 | 🔵 | New | §5.1 "`::1`、`fc/fd`、`fe80::/10`" |
    | 20 | 🔵 | New | batch §2 七 "`CLI 55 | git commit 携未跟踪路径 ⇒ 当场拒并点名…`" (row only) |
    | 21 | 🔵 | New | §4.1 "的 commit 一条写明——未 `git add` 的新档会被拒且拒文点名" vs `tool-git.md` "New (untracked) files: `git add` them first" |
    VERDICT: pass
    计数：🔴 0 · 🟡 16 · 🔵 5 · 未标 0

### 轮次 3（评审子代理）

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | `git.mjs` `case "commit"` — "`--with-tree=HEAD` 不能省" vs 设计 §4.1 "逐条 `git ls-files -z -- <path>`，输出为空即该路径未被跟踪" |
    | 2 | 🟡 | New | `git.mjs` "`ls-files` 非零退出：路径规格语法错、HEAD 尚未出生" + 单测 A10 "HEAD 还没出生时预检读不到东西 ⇒ 不构成拒" vs `tool-git.md` "the tool refuses a path list with any untracked entry and names them" |
    | 3 | 🟡 | New | `test/RTM.md` "| CLI 55 | git commit 携未跟踪路径 ⇒ 当场拒并点名，不给原始 pathspec 报错 | tooling | 有 | 缺 | 缺 |" vs 同档 "故事和用例住 `test/rtm/<族>.md`"（`test/rtm/tooling.md` 无 `## CLI 55.` 小节） |
    | 4 | 🔵 | New | 单测档 "A6 红侧：同一输入的返回串不含原始 pathspec 文案、含可读原因"（断言的是改后形，红侧读数不在档） |
    | 5 | 🔵 | New | 单测档 "try { rmSync(r, { recursive: true, force: true }) } catch { /* 尽力收尾" vs `TESTING.md` §4.6 "清理失败必须可见，不能静默吞掉" |
    | 6 | 🔵 | New | `git.mjs` "for (const p of paths) { const probe = await runGitStrict(ctx.cwd, ["ls-files", "-z", "--with-tree=HEAD", "--", p]) }"（逐条串行） |
    VERDICT: pass
    计数：🔴 0 · 🟡 3 · 🔵 3 · 未标 0

## §4 用户批准（主 agent）

批准依据：用户 2026-11-15 17:00 令「自动跑完」——该令覆盖本批全链（评审点火、修面、实施、收口），此后本批的评审（`2a57150f`）与实施（`#25`）均在该放行下派出，未另等逐站确认。

用户对交付面的两条现场裁定，均已落进实施：`--with-tree=HEAD` 采纳（纯索引视图会把 `git rm` 后的暂存删除读成未跟踪，造出本批要消灭的那类误拒）；回落分支保持原样（`ls-files` 非零退出 ⇒ 该路径不判 ⇒ 由 git 报它自己的错）。

评审 11 条裁定：7 条 🟡 Deferred（设计档字节随评审通过冻结，交付后由设计席 `#27` 一轮改净，已落）、4 条 🔵 中 3 条已改净、1 条为复核项。需求 `PROMPT-SYSTEM.md` §9.2 的例外补句由主 agent 同轮落。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 一、交付面（改了哪些档，为什么）

| 档 | 改了什么 |
|---|---|
| `thincoder-core/tools/git.mjs` | `gitActionCore.dispatch` 的 `case "commit":` 里，在「`path` 空/全空白即拒」之后、`git commit --only` 之前，加一条未跟踪预检：逐条 `git ls-files -z --with-tree=HEAD -- <path>`（并行），输出为空者进 `untracked`；非空即整次拒，拒文点名并给两条出路。可提交档的路径逐字未动 |
| `thincoder-core/prompts/knowledge/tool-git.md` | commit 一条的末句换成 §2 六 的定稿句（模型面描述由 `DESC("git")` 展开本档，改这里即改工具描述） |
| `docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs` | 本批单测 A1–A10（收口即删） |
| `test/integration/git-commit-untracked-path.test.mjs` | 集成用例 `CLI 55-1`（新增一例，无改写、无删除） |
| `test/RTM.md` | 故事索引表新增 `CLI 55` 一行 |

零副作用核对：预检只 spawn 只读的 `ls-files`，不建快照、不写索引；`commit` 分支本就不调 `snapshotBefore`，拒时工作树、索引与 `git log` 都不动（A1/A2 用 `git status --porcelain` 与 `rev-list --count` 真断言）。

### 二、验收逐条（A1–A6 对应 E1–E6；A7–A10 为同档补测）

| 条目 | 落地 | 例 |
|---|---|---|
| E1 | 拒文以 `Error: commit path not tracked by git` 开头、点名该档、零提交（条数不变，两档改动都还在工作树） | A1 |
| E2 | 同一请求集里已 staged 的已跟踪档照旧不提交，整次拒 | A2 |
| E3 | 全已跟踪 ⇒ 提交成功，成功形含 `(checkpoints cleared — commit is a new safety baseline)`，`--only` 语义不动（请求集外的档留在工作树） | A3 |
| E4 | `git add` 过的新档放行并真进提交 | A4 |
| E5 | 目录路径按 git 自己的 pathspec 引擎判，目录下有已跟踪档即放行 | A5 |
| E6 | 同一输入不再出现 `pathspec`，改成可读原因；红侧读数见第三节 | A6 |
| 设计 §4.1 末条（预检自身失败不构成拒） | 畸形 pathspec 落回原提交路径，由 git 报错 | A7 |
| 用户本轮追加的口径：新增未 `git add` 的档仍须被拒 | A1 里加了两行断言：该档不在 HEAD 里、也不在索引里 —— 两边都没有才落到「空输出 ⇒ 拒」 | A1 |
| 不误拒面（本轮实测发现） | `git rm` 的暂存删除放行并真提交；通配形放行；HEAD 未出生时落回 | A8 · A9 · A10 |

### 三、读数（命令与结果）

- **红侧（改前）**：批起 `git.mjs` 上跑 A1/A2/A6 的同一输入，工具返回逐字为
  `git commit failed: error: pathspec 'fresh.txt' did not match any file(s) known to git` —— A1/A2/A6 三例当时皆红，改后皆绿。
- **回落的可复现路径**：`git ls-files -z -- ':(bad)'` ⇒ 退出 128 · `fatal: Invalid pathspec magic 'bad' in ':(bad)'`。
- **误拒面（本轮实测，促成 `--with-tree` 这一笔）**：`git rm doomed.txt` 后 `ls-files -z -- doomed.txt` 输出为空，而 `git commit --only -m x -- doomed.txt` **成功**（`1 file changed, 1 deletion(-)`）；同一状态下 `ls-files -z --with-tree=HEAD -- doomed.txt` 返回 `doomed.txt\0`。纯索引视图会把这次可成功的提交拒掉。
- **拒文实测串**（三个未跟踪档的请求集）：`Error: commit path not tracked by git — untracked: fresh.txt new2.txt — run git add on them first, or omit path to commit all changes (add -A + full commit)`。
- **单测**：`node --test docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs` ⇒ 10 tests / 10 pass / 0 fail。
- **集成用例**：`node --test test/integration/git-commit-untracked-path.test.mjs` ⇒ 1 pass（`CLI 55-1`）。
- **回归（同面既有用例）**：`node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ 18 pass（含 `CLI 12-9` 的 `git add` + `commit path` 那条路）。
- **文档机检**：`doc_check(mode:"gate")` 判 `test/RTM.md` 与 `thincoder-core/prompts/knowledge/tool-git.md` ⇒ `DOC-CHECK GATE: PASS`（活性另核：临时目录里造一份 400 字一行的段落档，同一机检返回 `DOC-CHECK GATE: REFUSED` + `第 3 段 400 字，超过 300`，说明这次 PASS 不是空跑）。
- **工具描述面**：`DESC("git")` 展开后 commit 一条逐字含 §2 六 的定稿句（全量档展开走 `expandKnowledgeTopics`，已实读确认）。

### 四、决策披露（与设计原句不一致的两处，均已获裁）

1. **探针用 `git ls-files -z --with-tree=HEAD -- <path>`，设计 §4.1 与批档 §2 三 写的是纯索引形 `git ls-files -z -- <path>`。**
   原因 = 第三节那条实测：纯索引视图会把 `git rm` 之后的暂存删除读成未跟踪，而 `--only` 提交它是成功的——正好造出本批要消灭的那类误拒，也撞 §1 边界第一条。已上抛；用户原话：「接受你的收窄，`--with-tree=HEAD` 照用，不必回退。」
2. **探针并行问（`Promise.all`），不是逐条串行 await。** 条件与后果一字未变（`probe.ok && !probe.out` ⇒ 进 `untracked`），只改往返次数。

**回落分支按用户本轮裁定保持原样**：`ls-files` 非零退出（路径规格语法错、HEAD 尚未出生）⇒ 该路径不判 ⇒ 落回原提交路径，由 git 报它自己的错。中途曾试过「失败后退回纯索引再问一次」，与这条裁定冲突，已回退（A10 现断言的就是这条回落）。

### 五、落地核对（设计档句子的盘上偏差 —— 交设计席修面轮改字，本席未动设计档）

- **`docs/core/design/TOOLS.md` §4.1「判据取索引，不拿 git 的报错文案做分支」条**，原句逐字：
  「逐条 `git ls-files -z -- <path>`，输出为空即该路径未被跟踪」
  ⇒ 盘上代码问的是 `git ls-files -z --with-tree=HEAD -- <path>`；「输出为空即未跟踪」这条判据本身仍成立，变的是被问的索引视图。（同句在批档 §2 三 另有一处命令形：`runGitStrict(ctx.cwd, ["ls-files", "-z", "--", path])`。）
- 其余设计 §4.1 各条与盘上一致：判据不拿报错文案做分支、逐条问、全有或全无、拒文逐字、预检自身失败不构成拒、工具描述面已同步。

### 六、审计与评审轮次 · 终态

- **内部勘察审计 1 轮（只读子代理）**：2 项 worth-fixing + 3 项观察；其中「暂存删除可能被误拒」这条观察经实跑确认为真缺陷，进修复轮。
- **内部代码评审 1 轮**：`VERDICT: pass`（🔴 0 · 🟡 3 · 🔵 3），三条 🟡 全为可选：①探针与设计句不一（落第五节，设计席修面轮）②无 HEAD 的仓走回落（按用户裁定保留）③`test/rtm/tooling.md` 缺 `CLI 55` 小节（§1 已派主 agent 收口补齐）。🔵 三条：A6 例名、单测档收尾静默、探针串行——前两条已改，第三条已采纳。
- **修复轮 3 轮**：①误拒修复 + A8/A9/A10；②按用户裁定回退「重问」并加固 A1 断言、清掉两条 🔵；③收尾复跑（单测 10/10、`CLI 55-1`、`CLI 12-*` 18/18、`doc_check` PASS）。
- **终态**：converged · clean（无未决 🔴，🟡 均已有归属）。

### 七、未落项与账

- `test/rtm/tooling.md` 的 `CLI 55` 小节未落：§1「集成增量补件」把这一笔派给主 agent 收口补齐，本席只落 §2 写的 `test/RTM.md` 一行（分册那节暂缺，索引与分册在收口前不一致）。
- 设计档 §4.1 那句判据待设计席修面轮改字（第五节）。
- 本批新债：0 条（`#2451` 等为既有登记，本批不新增）。

## §6 验证与收口（父代理）

## 验证与收口

**落地形态**：`thincoder-core/tools/git.mjs` 的 `commit` 分支在调 git 之前逐条并行预检 `git ls-files -z --with-tree=HEAD -- <path>`；未命中即整次拒、点名未跟踪档、给两条出路（先 `git add`，或不带 `path` 全量提交）。已跟踪档的提交路径一字未动。

**验证读数**（父侧实跑，命令 + 结果）

- `node --test docs/batches/2026-11-15-git-commit-only-untracked-path.test.mjs test/integration/git-commit-untracked-path.test.mjs` ⇒ tests 11 / pass 11 / fail 0（单测 A1–A10 + 集成 `CLI 55-1`；单测档收口已删，读数在此之前取）。
- `node --test test/integration/*.test.mjs` ⇒ tests 220 / pass 218 / fail 2，两红为 `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph.test.mjs`）。既有性另证：在批起前的 `a42b136d` 工作树上跑同一档 ⇒ pass 3 / fail 2，与今日同集；已挂台账 `#2449`。
- 拒文实测串：`Error: commit path not tracked by git — untracked: fresh.txt new2.txt — run git add on them first, or omit path to commit all changes (add -A + full commit)`。
- `doc_check(mode:"gate")` ⇒ `DOC-CHECK GATE: PASS`；活性另核：临时档一段超 300 字被同一机检 `REFUSED`，说明这次 PASS 不是空跑。

**落地核对**：设计 §4.1 的判据句已与实现一致——探针形态 `--with-tree=HEAD` 与其理由（`git rm` 后纯索引读到空，而 `--only` 提交它是成功的）由设计席 `#27` 同轮写进设计档；工具描述面的要求形措辞同步。

**主 agent 的笔（同轮）**：`test/rtm/tooling.md` 的 `CLI 55` 分册小节（只含单态 `55-1`，节注如实写「其余放行面目前只在一次性单测里覆盖，尚无永久用例」）；需求 `PROMPT-SYSTEM.md` §9.2 补 `consult` ∥ `advisor` 例外，消掉与 §3、§9.1 的口径冲突。

**事故披露**：本轮首次补分册时用 PowerShell 的 `Get-Content` / `Set-Content` 往返，把 `test/rtm/tooling.md` 写成乱码并误删空行。已 `git restore` 回退、改用 `insert_after` 重写；读回复核 = 乱码 0 处、`55-2` 虚行 0 条、`55-1` 在位。根因是规则只写在提示词里、无机制拦 shell 写文件，已登记 `#2453`。

**本批新债 3 条**：`#2452`（`CLI 55` 放行面——已 `git add` 的新档、暂存删除、目录路径——无永久集成用例）· `#2453`（bash/execute 经 shell 写仓内档无机制拦截）· `#2454`（`linter.mjs` 三处注释引不存在的 `TOOLS.md` §10.2）。

**收口门提示**：本批窗口（`8600e19f` 起）覆盖相邻批 `#2443` ∥ `#2444` 的提交，tier-reading gate 可能把它们的代码档判成本批改动并要求读数列行；若拒，按「跨批重叠」登记并在表下注明归属，不改本批条目。
