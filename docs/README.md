# 项目文档（Project docs — thincoder 合并仓）

> 本目录 = **基准层**（项目级唯一权威层——跨两产品的文档：台账 · 板块档 · 批次档；**提示词 = `thincoder-core/prompts/`**（产品代码面 · 唯一副本；本目录下无提示词档））。
> 产品 `docs/**` = **v1 参照历史**（**保留 ≠ 维护**——不参与内容同步；其中属项目级的旧档按 §2 政策**被触碰时随批迁**——D-C14）——
> **VSC 树**（`thincoder-vscode/docs/**`）**已归档**（`_archive/`——2026-09-18 **轮 A** 已落）；**CLI 树**（`thincoder-cli/docs/**`）**已归档**（`_archive/`——同批**轮 B** 已落；**phase-1 三档按父侧裁定暂留原地**——§3）——**两树退役至此闭合**（状态见 §2）。
> 建档：2026-09-13（用户裁定：「逐步在根仓建立起全套的文档体系，项目目录里的先保留做参照，不要一下子全改掉，免得没法回顾」）。

## 1. 本层内容

| 类 | 位置 | 形态 |
|---|---|---|
| 发布流程 · 需求（统一面） | `docs/RELEASE.md` | 2026-09-20 用户裁定迁根（原 `core/requirements/`）+ **三端合一**（23:23「把各端的 release.md 整合成一个」⇒ CLI 链设计档并回 ✗ 单档承载）——**总发布计划**（**四发布单元**：核 / CLI / VSC / 桌面〔阶段一：Windows 安装包 ∥ 官网托管——2026-10-01 入主线；**阶段二：自动更新 feed ∥ 官网桌面面——2026-10-02**〕· 顺序 = 核 → CLI → VSC → 桌面〔桌面按需〕） |
| 测试环境运维（内部机器） | `TEST-ENV-ECS.md` | 2026-10-10 建（用户令「每次这么盲人摸象摸一遍不是个办法」）——ECS 测试箱（ha-proxy · `10.0.0.5`）的访问 ∥ 布局 ∥ 更新部署 ∥ 自检探针 ∥ 回滚 ∥ 坑；与产品侧部署档的分工见该档头 |
| 台账（项目级唯一真相） | SQLite——用户数据目录键控库 `~/.thincoder/ledger/<sha1(项目根)>.db`（2026-09-17 落点裁定：不在项目目录） | ✅ 唯一台账面 = SQLite（`/ledger` 查询）；`TODO.md` · `TODO-archive.md` = 退役历史（md 形态；**已排除在锚检查之外**——`PROJECT-MANIFEST.json` 的 `checkConfig.anchors.exclude`） |
| 板块档（需求 / 设计） | `core/requirements/` · `core/design/` | ✅ 核心统一已迁入（2026-09-13）；后续新板块档直接落此。**子系统档（设计 / 需求各 15 档）见 §4** |
| 批次档 | `batches/` | ✅ 核心统一已迁入（2026-09-13） |
| 部分档（各端面） | `cli/requirements/` · `cli/design/` · `vsc/requirements/` · `vsc/design/` · `desktop/requirements/` · `desktop/design/` · `render-core/design/` · `server/requirements/` · `server/design/` | ✅ **六部分**落点齐（`core/` · `cli/` · `vsc/` · `desktop/` · `render-core/` · `server/`）——**部分档 194**（`core/` 110 = 设计 61 + 需求 49 · `cli/` 17 = 设计 11 + 需求 6 · `vsc/` 10 = 设计 7 + 需求 3 · `desktop/` 25 = 设计 15 + 需求 10 · `render-core/` 1 = 设计 1 · `server/` 31 = 设计 30 + 需求 1）；desktop 设计**十五档** = `PROJECT.md` · `SHELL.md` · `IPC.md` · `UI.md` · `RENDERER.md` · `E2E-TESTING.md` · `WEB-QUICKCHECK.md` · `MENU.md` · `PACKAGING.md` · `CHAT.md` · `COMPOSER.md` · `ACTIVITY.md` · `SESSIONS.md` · `SETTINGS.md` · `PANEL-READBACK.md`；desktop 需求**十档** = `PROJECT.md` + 九域卷（`SESSIONS` · `CHAT` · `COMPOSER` · `ACTIVITY` · `SETTINGS` · `MENU` · `PACKAGING` · `UI` · `SHELL`）；render-core 设计**一档** = `RENDER-CORE.md`；server 设计**三十档** = 顶层 2（`PROJECT.md` · `EVOLUTION.md`）+ 十二域（`accounts` · `agent`（2 档）· `client` · `gateway`（2 档）· `ledger` · `mcp` · `metering` · `ops` · `project` · `sandbox`（2 档）· `store` · `webui`（14 档）） |

## 2. 迁移政策（2026-09-13 用户裁定——「逐步建立 · 旧档留参照 · 不一刀切」；2026-09-14 层级裁定——根仓 `docs/` = 基准层，产品 `docs/**` = 迁移期保留的参照历史）

1. **新项目级档一律落本层**——此后新板块的需求 / 设计 / 批次档直接建在 `docs/` 下，不再落产品树。
2. **旧档不批量搬**——保留原地作**参照**；**被触碰时随批迁**（一次一档或一批）；迁移 = `git mv` + 改引用 + 机检 + 与触发批同提交。
3. **不复制**——同一档同一时间只有一份实体（迁移是**移动**不是拷贝），避免双权威源。
4. **产品级档留各产品树**；**哪些旧档属项目级随触碰逐个判定**（判定依据：是否跨两产品被引用）。
5. 迁移动作的验收 = **源面核**（逐处：引用可解析——目标档 + 节在盘；行宽无 >300 字符单行；受影响档清单逐档比对）——**读数器禁调**（用户 2026-10-15 12:10 令「不再跑、不再引其读数、不再以其红 / 绿作任何判据」），机检读数不作判据。
6. **五部分落点规划**（core / CLI / VSC / desktop / render-core）——目标结构 / 命名规则 / 归属判据 / 交叉引用形态 = `core/design/DOC-SYSTEM.md`（2026-09-14 建档；2026-09-25 桌面端设计轮收正为四部分；2026-09-27 布局收正轮收正为五部分——模块镜像裁定）；
   本节政策（逐档随批迁 / 不复制 / 旧档留参照）不变，迁入时的**落点与档名**按该档 §4–§6 判定。

> **退役状态（2026-09-18 · v1 文档退役（台账 #22）· 轮 A 已落）**：`thincoder-vscode/docs/**` 136 活档已 `git mv` 入 `thincoder-vscode/docs/_archive/<原相对路径>`（恒等映射 · 正文一字未改）——VSC 树自本政策第 4 / 5 条的「随批迁」路径转为**归档形退役**（保留语义不变；执行记录 = 该批记录）；
> `thincoder-cli/docs/**`（**轮 B · 已落 2026-09-18**）——**139 活档**同法 `git mv` 入 `thincoder-cli/docs/_archive/<原相对路径>`（恒等映射 · 正文一字未改 · `R` 对 139 / 错配 0）；
> **三档暂留原地**（`batches/` · `design/` · `requirements/` 各 1 档——父侧裁定，见 §3 与 `core/design/DOC-MIGRATION.md` §10.3 已结清块）；执行记录 = 该批记录。**两树退役闭合**（VSC 轮 A 136 + CLI 轮 B 139）。

## 3. 待迁清单（现状）

| 档 | 现址 | 状态 |
|---|---|---|
| 核心统一（phase 2）· 需求 / 设计 / 批次 | 原 `thincoder-cli/docs/{requirements,design,batches}/` → 现 **`docs/core/{requirements,design}/` · `docs/batches/`** | ✅ **已迁入**（2026-09-13——`git mv` 三档 + 17 处引用改写；源面核过；2026-09-14 板块档再迁入 `docs/core/`） |
| 两仓合并（phase 1）· 需求 / 设计 / 批次 | `thincoder-cli/docs/{requirements,design,batches}/TWO-REPO-MERGE*` | **参照**——已闭环；引用面大（约 40 处，含两产品文档树与脚本头注），**暂留原地**，被触碰时再议 |

## 4. 子系统设计档（核心统一拆分——2026-09-13）

**依据** = 用户 2026-09-13 裁定（「不是，我们不是让它拆开的吗？！怎么还是写在一个文件里？！」「以后维护怎么办？」）。
**命名与落点** = 板块镜像形态（`core/requirements/<板块>.md` ↔ `core/design/<板块>.md`，**同板块名**）：本节各档 = `core/design/` 侧；`core/requirements/` 侧（同名）**已建齐**（15 档——2026-09-13 需求侧拆分轮，与本节各档**逐一同名成对**；登记表见 `core/requirements/CORE-UNIFICATION.md` §5）。

| 子系统 | 设计档（`core/design/`） | 覆盖裁决行 | 行数 |
|---|---|---|---|
| 记忆系统（记忆库 + 代码 / 文档索引 + 嵌入） | `MEMORY.md` | #75 · #82 · #133–#137 · #168 | 8 |
| 会话与历史 | `SESSION.md` | #89 · #123–#127 | 6 |
| 配置系统 | `CONFIG.md` | #74 · #77 · #79 · #80 · #87 · #128–#132 · #177 | 11 |
| 工具系统（实现面 + 描述面 + 注册表 + agent-tools） | `TOOLS.md` | #10–#29 · #52–#70 · #83–#86 · #88 · #90–#92 · #96 · #97 · #178 · #179 | 51 |
| 提示词系统（槽位 / 工具描述） | `PROMPT-SYSTEM.md` | #2–#9 · #30–#39 · #43–#47 · #50 · #51 · #117–#122 | 31 |
| agent 主循环与子代理 | `AGENT-LOOP.md` | #76 · #78 · #94 · #98–#103 · #111–#113 · #149–#158 · #165 · #166 · #169 · #175 · #176 · #184 | 28 |
| 评审 · 会诊 · 飞刀 | `CONSULTATION.md` | #1 · #40 · #41 · #93 · #95 · #104–#110 · #159–#161 | 15 |
| 供应商与模型 | `PROVIDER.md` | #114 · #115 · #138–#143 | 8 |
| MCP 客户端 | `MCP.md` | #81 · #144–#148 | 6 |
| 轨迹存储 | `TRACES.md` | #116 | 1 |
| 检查点与 git 面 | `CHECKPOINT.md` | #48 · #49 · #167 | 3 |
| 上下文压缩 · 标题 · 文本额度 | `CONTEXT-COMPACTION.md` | #162–#164 | 3 |
| 诊断日志 | `LOGGING.md` | #42 | 1 |
| 文案与本地化 | `I18N.md` | #185 | 1 |
| 工作区约定（技能 / 规则 / 同伴 / 台账） | `WORKSPACE.md` | #71–#73 · #170–#174 | 8 |
| **合计** | —— | —— | **181**（另 4 行 = 端特有桶 #180–#183，住工作流档 §2.5） |

**其它板块（非核心统一拆分）**：`core/design/DOC-SYSTEM.md` + `core/requirements/DOC-SYSTEM.md`——文档体系（`docs/` 的 core / CLI / VSC / desktop / render-core 五部分落点规划）；2026-09-14 建档，**只做规划、不执行迁移**。

**迁移迁入档（2026-09-15——非核心统一拆分）**：按 §2 政策「逐档随批迁」自产品树迁入（B 式重建——源档留原地作参照历史），落点按 `core/design/DOC-SYSTEM.md` §5.1 判据（P1 统一面 ⇒ `core/` · P2 产品面 ⇒ `cli/` ∥ `vsc/`）：
- `core/design/` **5 档**：`ARCHITECTURE.md` · `PORTABILITY.md` · `STRUCTURE-DEBT.md` · `TWO-REPO-MERGE.md` · `DOC-MIGRATION.md`（迁移台账——承 `core/design/DOC-SYSTEM.md` §11 拆分规划）；
- `core/requirements/` **2 档**：`PHILOSOPHY.md` · `TWO-REPO-MERGE.md`（`RELEASE.md` 同批迁入后 2026-09-20 再迁根 = `docs/RELEASE.md`——§1 首行）；
- `cli/` **14 档**——设计 9：`ACP-CLIENT.md` · `CRASH-REPORTS.md` · `TUI-COMMANDS.md` · `TUI-INPUT-BOX.md` · `TUI-SESSION-VIEW.md` · `TUI-TOOL-OUTPUT.md` · `TUI.md` · `CLI-DEBT.md`
  （**2026-09-25 新建**——非迁移档；台账 #340 CLI 档位登记载体收口）· `CLI-ENTRY.md`（**2026-09-25 新建**——非迁移档；同批 · 台账 #350 命令入口面载体收口）；
  需求 5：`ACP-CLIENT.md` · `CRASH-REPORTS.md` · `FEATURES.md` · `TUI-TOOL-OUTPUT.md` · `TUI.md`（P2——2026-09-15 首迁 2 档后历批续迁；`design/RELEASE.md` 已随三端合一迁根 = `docs/RELEASE.md`——2026-09-20）；
- `vsc/` **10 档**：`design/` = `VSC-MIGRATION.md` · `SETTINGS.md` · `PROJECT-SWITCHER.md` · `WEBVIEW.md` · `WEBVIEW-PROTOCOL.md` · `WEBVIEW-INPUT.md` · `VSC-DEBT.md`；`requirements/` = `VSC-MIGRATION.md` · `WEBVIEW.md` · `PROJECT.md`。

**`core/design/` 其余 39 档（工具 · 机制 · 流程面——批 11 补登 · 2026-10-07 补登记一档 · 2026-10-10 补登记一档 · 2026-10-13 补登记一档（`TEAM-LEDGER.md`——团队客户端面） · 判据 = `core/design/DOC-MIGRATION.md` §9.3 A21 · 计数随批收正 2026-10-13）**：
- 文件 / 编辑 / 执行工具面 **8 档**：`APPLY-PATCH.md` · `EDIT.md` · `EDIT-HELPERS.md` · `HASHLINE-EDIT.md` · `INSERT-AFTER.md` · `TOOL-OUTPUT-LIMITS.md` · `WRITE.md` · `BASH-EXECUTOR-FACE.md`（bash 执行器语义面——运行时探测与声明单源；2026-10-04 建档，2026-10-07 补登记）；
- 浏览器工具面 **1 档**：`BROWSER-TOOL.md`（浏览器工具——自启浏览器驱动面：十六动作契约（基线八 + 输入域八：press/hover/wheel/mouse/drag/touch/insert/clipboard）∥ 引用 / 几何机制 ∥ 会话模型 ∥ 写闸 ∥ 剪贴板面；2026-10-07 建档）；
- 顾问 / 协作 / 子代理面 **9 档**：`ADVISOR-CONVERGENCE.md` · `ADVISOR-GUARDS.md` · `AGENT-LOOP-ASYNC-POOL.md` · `AGENT-LOOP-SUBAGENT.md` · `AGENT-LOOP-UPSTREAM.md` · `ESCALATE.md` · `MULTI-INSTANCE-COLLAB.md` · `PROXY.md` · `SEND-STALL-DISTILL.md`；
- 令牌 / 参数 / 设置面 **5 档**：`AGENT-PARAMS.md` · `DESIGN-TOKEN-SETTLEMENT.md` · `ENG-TOKEN-BINDING.md` · `SETTINGS-TOOL.md` · `VERIFY-REDESIGN.md`；
- 流程 / 文档机制面 **12 档**：`ANCHOR-DEBT-REPAIR.md` · `BATCH-RECORD.md` · `DOC-CODE-RECONCILE.md` · `DOC-DISCIPLINE.md` · `ENGINEERING-MODE-V2.md` · `LEDGER.md` · `LEDGER-SELF-CONTAINED.md` · `LIGHT-CHANNEL.md`（轻通道机制——细节面 ∥ 收敛面受控旁路设计；2026-09-30 建档 · 2026-10-02 扩容）·
  `MANIFEST.md` · `TESTING.md` · `TURN-CAP-CONTINUE.md` · `API-CONTRACT.md`（核接口按需索引——生成区 ∥ 语义区两区制；2026-09-29 建档）；
- 基准测试 **2 档**：`MODEL-BENCH.md`（模型基准测试套件——独立评估面的设计档：对外部 provider 做性能评估，产物 = `bench/results/` 评估报告 = 产品输出，不打包进三端；2026-09-23 建档）· `MODEL-SPECS.md`（模型规格表设计档——bench 名单面规格行承载；2026-09-24 建行）；
- 团队客户端面 **2 档**：`TEAM.md`（团队客户端——登录与接入：`team` 段 ∥ 派生 provider 条目 ∥ 三端同构 ∥ 决策 D-TM1–6；2026-10-10 B1 建档）· `TEAM-LEDGER.md`（团队台账客户端面——核工具 `team_ledger` 端侧面单源；2026-10-13 建档）；
- **计数核对（复跑 as-of 2026-10-13 · 按名对账）**：`core/design/` 实档 **61** = 本图登记 **61** + **待补登 0**（逐名相等；2026-10-10 基线 60 ⇒ + `TEAM-LEDGER.md`——2026-10-13 建档）。
  （前值 **51 = 51** 为 as-of 2026-09-17 读数；此后实增五档：`MODEL-SPECS.md`（他批）+ `AGENT-LOOP-ASYNC-POOL.md` · `AGENT-LOOP-UPSTREAM.md`（structure-debt 同批登记）+ `MODEL-BENCH.md`（model-bench 同批登记）+ `LIGHT-CHANNEL.md`（轻通道机制 · 2026-09-30）。）

**工作流档** = `core/design/CORE-UNIFICATION.md`（注册表 · 事实基线 · 核形态 · 选型 · 分段执行 · 决策 · 验收 · 契约策略 · 测试——**计入上条实档计数**）——子系统档由它索引、**不复制**其内容（D2 单一权威源）；裁决行的**列定义**亦住该档 §2.5。

**两产品旧子系统档的处置（建议 · 未代裁）**：按本层 §2 迁移政策「**旧档不批量搬 · 保留原地作参照 · 被触碰时随批迁**」——各子系统于 **S2 迁移该子系统时**逐档 `git mv` 入本层（一次一档 + 引用改写 + 机检），并在产品地图撤登记行。

**`core/requirements/` 登记（逐档 · 49）**：与 design 侧同形，分五组逐档列名（全 49 档）：

- 子系统档（与 design 侧同名成对）**15**：`AGENT-LOOP.md` · `CHECKPOINT.md` · `CONFIG.md` · `CONSULTATION.md` · `CONTEXT-COMPACTION.md` · `I18N.md` · `LOGGING.md` · `MCP.md` · `MEMORY.md` · `PROMPT-SYSTEM.md` · `PROVIDER.md` · `SESSION.md` · `TOOLS.md` · `TRACES.md` · `WORKSPACE.md`；
- 其它板块 / 迁入档 **3**：`DOC-SYSTEM.md` · `PHILOSOPHY.md` · `TWO-REPO-MERGE.md`；
- 工作流档 **1**：`CORE-UNIFICATION.md`（登记表 · 事实基线 —— 计入实档计数）；
- 工程模式 V2 面 **11**：`ENGINEERING-MODE-V2.md` + `ENGINEERING-MODE-V2-SPEC-{BATCH-SEGMENT,CHECKLIST-REMOVAL,DELEGATION,LEDGER,MACHINE-CHECK,MANIFEST,PROMPT-PIPELINE,REVIEW-CREDENTIAL,TEST-DISCIPLINE,WRITE-GATE}.md`；
- 其余机制 / 流程 / 文档面 **19**：`ADVISOR-CONVERGENCE.md` · `AGENT-PARAMS.md` · `BROWSER-TOOL.md` · `DESIGN-TOKEN-SETTLEMENT.md` · `DOC-CHECK.md` · `ENG-TOKEN-BINDING.md` · `ESCALATE.md` · `LIGHT-CHANNEL.md` · `METHODOLOGY.md` · `MULTI-INSTANCE-COLLAB.md`
  · `NORMAL-MODE.md` · `PORTABILITY.md` · `PROJECT.md` · `SEND-STALL-DISTILL.md` · `SETTINGS-TOOL.md` · `STRUCTURE-DEBT.md` · `TESTING.md` · `TURN-CAP-CONTINUE.md` · `VERIFY-REDESIGN.md`。

**计数核对（复跑 as-of 2026-10-18 · 按名对账）**：`core/requirements/` 实档 **49** = 本图登记 **49** + **待补登 0**（逐名相等）。

## 5. 与产品文档地图的关系

- CLI 产品地图 = `thincoder-cli/docs/README.md`（**CLI 产品**的文档入口）——它此前登记了项目级板块（历史原因：合并前无项目级层）；板块迁入本层后，其登记行**撤除**（该板块不再属 CLI 产品树——本层为唯一登记处）。
- VSC 产品地图 = `thincoder-vscode/docs/README.md`（VSC 产品入口）。
- 本层**不进**两产品的文档域扫描；本层自带**源面核**面（扫描域 = `docs`；**读数器禁调**——用户 2026-10-15 12:10 令）；台账核销面 = `/ledger`（`thincoder-core/ledger.mjs`）。
- **五部分不各设地图**——本 README = 五部分（`core/` · `cli/` · `vsc/` · `desktop/` · `render-core/`）的唯一地图（目标结构 `core/design/DOC-SYSTEM.md` §4）；`cli/` · `vsc/` 两产品面档所对应的产品树旧档（`thincoder-cli/docs/**` · `thincoder-vscode/docs/**`）= 迁移期参照历史（§2 政策——保留 ≠ 维护）。
