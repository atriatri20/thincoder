# 可移植性（PORTABILITY）· 需求

> 板块 = **可移植性**——工程模式机制在**任意用户项目**上的可用性（不假定项目形如本产品自研仓）。
> 本档 = 该机制的**需求层权威**（F1–F11 / N1–N4——编号承旧档，不改号）。
> 设计侧 = `docs/core/design/PORTABILITY.md`（分类权威 / 评审注入 / 端差）。
## 1. 总体定位

本仓（VS Code 扩展面）承载与对端同一套工程模式机制。用户在**任意项目**（任意语言 / 目录布局 / 文档约定 / 有无 git）里使用时，机制不得静默失效：

- 不得假定项目约定（文档布局 / 命名 / 构建 / 测试方式）；
- 凡需要项目约定处，由**项目自述 / 声明**提供；
- 缺失时**降级可见**——写进评审消息 / 工具反馈 / 索引提示，不得静默跳过。

范围边界：本档 §2–§3 承载本仓（VSC 面）需求；**需求组 FR10–FR15 的正文**随 v1 需求档 `docs/core/requirements/_archive/ENGINEERING-MODE.md` 归档入 `_archive/`（搬迁归位属父侧裁决项，见 §5.3）；其**接受方向与 FR14 落实文本** = 本档 §5（CLI 侧同名档并入面）。

## 2. 功能性需求

| # | 需求 | 判定句（可机器验证——证据均为本仓实测） |
|---|---|---|
| **F1** | 分类判据单一权威 | `thincoder-vscode/src/conventions.mjs`为唯一裁判实现（`classifyPath` `:76` / `isCodePath` `:85` / `isDocPath` `:91`）；全仓**零分散副本**（机判 = 组件式 / 锚定式正则副本、`docs/` 前缀判据副本 grep 零命中——判据式见 `PORTABILITY（VSC 侧）`） |
| **F2** | 项目约定可声明 | 声明面 = `PROJECT-MANIFEST.json` 三族键（`codePaths` / `index.*Extensions` / `advisor.*`，载体现行 = `thincoder-core/manifest.mjs`；读取单源 = `thincoder-core/conventions.mjs` `loadProjectDeclaration`）；`codePaths` 声明替换默认、`index.*Extensions` 追加入并集；档不可用 → 逐族回默认 + 警告 + 不崩（形态错 = 档非法——fail-closed） |
| **F3** | 嵌套布局不漏判 | 段匹配非锚定、大小写不敏感、`/` 与 `\` 通吃——`packages/<foo>/src/<x>.md` 判 code（分类优先级 = 代码段 > temp > 文档扩展名 > 辅助面（aux）> 兜底 code） |
| **F4** | 评审注入降级可见 | 降级句常量四句在位（`thincoder-vscode/src/advisor/project-context.mjs:35` · `:39` · `:40` · `:41`）；缺 AGENTS.md / 地图 / 标准文档 / git 时各注入对应句、从不静默——`injectProjectGuide` `:91` · `injectDocumentMap` `:138` · `injectProjectStandards` `:176` · `thincoder-vscode/src/advisor/messages.mjs:115` |
| **F5** | 索引面可声明、未列入可见 | 扩展名表 + 声明并集（`thincoder-vscode/src/index-discover.mjs:17` · `:24` · `:125` · `:132`；核面现体 `thincoder-core/memory/file-walk.mjs`）；构建返回 `unlistedExts`（`thincoder-vscode/src/indexer.mjs:113`；核面现体 `thincoder-core/memory/code-sync.mjs`）+ 面板提示行（`thincoder-vscode/src/extension/panel-index.mjs:171`） |
| **F6** | 非 git 项目行为有定义 | 索引：无 git → 全量 walk + per-file mtime 回退（`thincoder-vscode/src/indexer.mjs:185-186` · `:241`；核面现体 `thincoder-core/memory/code-sync.mjs`）；评审：`NO_GIT_NOTICE` 降级句、评审照常 |
| **F7** | 门禁面同源 | 工程写门禁按声明分类判定（`thincoder-vscode/src/agent/tool-gates.mjs:89-91`）——不以 `src/` 硬编码 / `docs/` 前缀放行 |
| **F8** | 提示词面不假定本仓形态 | 提示词内指令性引用零本仓指涉（「本产品自研仓 =」标注形态除外——判据式见 `PORTABILITY（VSC 侧）`） |
| **F9** | 父侧写域缺省 | 工程模式**父侧门**分类缺省：路径段 `test` / `tests` / `scripts`（**项目根相对面** · 根内任意深度——根外 / 根未知 ⇒ 面不可判 ⇒ 缺省不命中）与 `.thincoder/tmp/**` **判非代码面** ⇒ 父侧无令牌可写；**代码段优先级在前**（`src/test/**` 仍判 code）；范围 = **父侧门**（`thincoder-core/agent/dispatch.mjs:195-217` ∥ VSC `thincoder-vscode/src/agent/tool-gates.mjs`——VSC 随核单源）；**eng-coder 门不动**；项目可用 `codePaths` 声明（F2）收回该缺省。判据 = `classifyPath` 四例（`test/<x>.mjs` ≠ code · `scripts/<x>.mjs` ≠ code · `.thincoder/tmp/<a>.mjs` ≠ code · `src/test/<x>.mjs` = code） |

| **F10** | 项目状态档父侧可写 | 分类器新增第五值 `state`。判定：文件名是 `project-manifest.json`（不分大小写），或路径含 `.thincoder/conventions.json` 这一段，就算状态档，不算代码。效果：主 agent 在工程模式下可以直接写这两个文件，父侧门放行，不需要令牌；唯一作者不变。优先级在 aux 之后、兜底之前，所以 `src/state/<x>.json` 这类仍然算代码。只动父侧门：eng-coder 门不动，VSC 跟着核走。判定函数 `isStatePath`，在 `thincoder-core/conventions.mjs`。 |

| **F11** | 门禁辖域 = manifest 树以内 | 父侧门（CLI `dispatch.mjs`）辖域判定改按**目标祖先链**：任一级祖先带 `PROJECT-MANIFEST.json` ⇒ 在辖——判据声明面 = **目标所属项目**（最近祖先，nearest wins），不再取会话 cwd；**找不到 manifest ⇒ 一律放行**。项目内判定零改（code 段 / fail-closed / aux·temp·doc·state 豁免）；**不可解析目标保守拦截不变**；未声明 hint 改指名所属项目。 |

## 3. 非功能性需求

| # | 维度 | 标准（含度量） |
|---|---|---|
| **N1** | 零假阳 | 默认判据（`src` 为代码面）对既有项目行为与修复前一致——专项用例零误报 + 全量回归全绿 |
| **N2** | 降级不崩溃 | 声明损坏 / 不可读 → 默认 + `console.warn` + `logEvent`（不抛）；注入缺失 → 降级句（不抛） |
| **N3** | 全接线 | 消费点逐处换源（评审 / 门禁 / 索引 / 提示词四族）——「修一处漏三处」在用例上反证 |
| **N4** | 测试 | 专项用例在位且 `npm test` 全绿：`thincoder-vscode/test/portability-vsc-classification.test.mjs` · `portability-vsc-advisor-context.test.mjs`；索引面核用例承接入 `thincoder-vscode/test/memory-index-face.test.mjs` |

## 4. 范围边界（不做）

- 不重述 FR10–FR15 正文（随 v1 需求档归档 `_archive/`——搬迁归位属父侧裁决项，见 §5.3）。
- 不做对端 `/eng` TUI 门禁的同位物（本端无该命令；差异已登记在案）。
- 不做文件系统沙箱 / 目录白名单（安全模型 = 信任模型 + 审批 + 快照，见 TOOLS 板块）。
- 不建本仓自用声明三族键（默认判据对本仓即正确；本仓 `PROJECT-MANIFEST.json` 零改——开项留父侧酌定）。

## 5. CLI 侧补充需求面（FR10–FR15 接受方向 + FR14 落实文本）

> FR10–FR15 正文随 v1 需求档归档 `_archive/`（搬迁归位待裁决）：
> FR10 不得假定项目约定 · FR11 开启前提不得依赖已退役物 · FR12 代码 / 文档判据不得写死目录名 · FR13 纪律层不得强加产品形状 ·
> FR14 推进档位入需求 · FR15 非 git 项目行为有定义。实施台账 = `docs/TODO.md`「产品可移植性缺陷登记」节（父侧面）。

### 5.1 接受方向（每条一句）

| 需求 | 接受方向 |
|---|---|
| FR10 | 缺文档地图 / 标准文档时评审消息给**显式降级句**；索引对未列入的扩展名**可声明、可感知** |
| FR11 | `/eng` 开启**无前提**（不要求任何项目文件）；评审注入不再依赖已退役概念文件。**git 非前提**（项目 = 带 manifest 的目录 ✓ 仓根锚不再是入口前提）✗ **无项目 ⇒ 不拒翻**——走**建档流**（按用点协助建 manifest ✓ 不砖死）；**可拒面收窄 = 仅「档非法」（fail-closed）一格** ✓ —— **锚下并存多项目 = 工作区常态，不是错误态 ⇒ 不拒翻**（用户 2026-10-15 裁定；原「歧义可拒」一格作废）；「无前提」限定为「不要求已退役概念文件 / 产品流程文件」不变 |
| FR12 | 代码 / 文档判据 = **单一权威**（一个模块）+ 项目声明可诉 + 判据不漏判（嵌套布局不绕过门禁） |
| FR13 | 纪律层提示词不再要求建产品形状目录 / 维护产品流程文件 / 跑产品自带脚本；既有锚句保持 |
| FR14 | 推进档位契约**入需求**（落实文本见 §5.2） |
| FR15 | 非 git 行为逐面定义：索引走回退（可用）· 评审变更上下文给降级句 · 检查点明确报错（运行时文案 `Not a git repository — checkpoints unavailable`——`thincoder-core/tools/git-checkpoint.mjs:41`） |

### 5.2 FR14 落实文本（推进档位交互契约）

工程模式的推进档位（auto / manual）是**用户可感知的交互契约**：

- **两档**：**auto**（默认——每步完成即呈现、随即推进下一步）；**manual**（每步完成即呈现、**等待用户明确放行**再推进）；
- **切入 manual**：用户叫停 / 要亲自把关时切入——判据是**意图不是词表**（「停 / 先别 / 别急 / 等下 / 别自动」等表达均算）；
- **manual 下的行为**：继续回答与讨论、呈现当前结果；但**跨步动作停住**（spawn / 评审发起 / 推进落档 / digest 后动作都等用户点头）；
- **恢复 auto**：用户下一条明确指示（「可以 / 继续 / 开始」或具体下一步指令）即恢复；原状态不丢；
- **整批令 = 覆盖该批每一步发起的用户指令**：用户对一批任务下的一次性指令（「都处理掉 / 全部做完 / 开始吧」——一句话覆盖整批范围）= **该批每一步（评审发起 ∥ 实施启动）的发起授权**，步与步之间不再逐个等用户再发起一次；整批令到三者之一为止：**㈠ 范围变更 ㈡ 用户叫停 ㈢ 该批跑完**，批外工作仍等新令；**不豁免批准门**（评审照走、用户批准照要——「已授权发起」不等于「已批准」）；
- **性质**：档位是**步与步之间的闸**，不是新状态；WAIT 前的讨论与呈现照常。

### 5.3 边界

- 本节不重述 FR10–FR15 正文（D2）；FR 正文是否自 `docs/core/requirements/_archive/ENGINEERING-MODE.md` §2 **搬迁归位**入本档 = **父侧裁决项**——未裁决前以该档 §2 为权威正文。
- 缺陷条目按批次分批记录（不入现行需求面——历史批次材料）。
