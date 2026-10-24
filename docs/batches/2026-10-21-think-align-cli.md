# 2026-10-21 · think-align-cli
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-21 · 来源 = 用户令（2026-10-21 10:39「你对比一下同样在eng-coder里调用explore/advisor时cli端的显示方式」+ 10:41「你做错了就要改啊！…赶紧改！」）：think 态不得改写块头状态词，对齐 CLI。
> 台账 = #1723（VSC · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-21
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录 · 轻通道轮

**用户令（2026-10-21 10:39 / 10:41 / 10:43）**：「你对比一下同样在 eng-coder 里调用 explore/advisor 时 cli 端的显示方式」→「你做错了就要改啊！……赶紧改！」→「桌面也要同样改，别忘了。」

**披露（轻通道 · 缺陷修）**：change = `noteChunk` think 支不再改写状态词（对齐 CLI：`currentTool` 只由工具 call 写，think/text 不碰）；reach = 共用核件一处（桌面 + VSC 同源）＋四例测试改期望；rollback = 可回退（单档两处 edit）。

**判定依据（父侧实读）**

| 端 | think 到达时 | 出处 |
|---|---|---|
| CLI | **不改**状态区——仍挂 `explore#1/read`（无工具时 `thinking...`） | `subagent-blocks.mjs:308` / `:323`（think/text 不碰 `currentTool`）· `subagent-panel.mjs:110` |
| 桌面 / VSC（改前） | 覆盖为 `思考中…`（丢工具路径，也丢身份） | `activity-view.mjs:210-215`（F-W23 的 think 覆盖） |

**改动**

| 档 | 改了什么 |
|---|---|
| `thincoder-render-core/subblocks/activity-view.mjs:210-215` | think 支 → `return`（零改写）；注释写明 CLI 对齐依据 |
| `thincoder-vscode/test/2026-10-20-vsc-subagent-think-label.test.mjs` | T-A33 / T-A34 / T-A37 / T-A38 改期望：think 后状态词 = 上一工具行；无工具 ⇒ 字段零写入 + 头行裸 think 词 |
| `docs/vsc/requirements/WEBVIEW.md` F-W23（L43）∥ §4 对位行（L141） | 需求改写为「think 不改写」；端差判定由「实证例外」改为 **等价**（无端差） |
| `thincoder-desktop/node_modules/@thincoder/render-core` | 由**旧拷贝（0.1.0）**换成指向仓库的目录联接（旧拷贝留 `render-core.installed-0.1.0`；回退 = 删联接改回名）——桌面此前跑的是与仓库脱钩的快照 |

**走查读数**：`cd thincoder-vscode && node test/run.mjs` ⇒ **19 pass / 0 fail**（父侧实跑）。

**待办（收尾链）**：设计档 `WEBVIEW.md` §5.2（D-W42/D-W43 · T-A33/T-A37/T-A38 用例行 · §10 行 20）仍写着「think 覆盖」——须由设计席收正；收尾链 = 设计形式化 → 独立评审 → 修正 → 批准 → 收口。

> 不适用：§3 —— 本批为轻通道缺陷修（无设计评审段）：独立评审 = 代码评审 `#47`（changes-required）+ 轮次 2 `#49`（pass），两者不带 §3 写通道，结论与裁决逐条记于 §6。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-21
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖 · 需求档 F-W23，设计侧收正）

| # | 条目 | 需求锚 |
|---|---|---|
| 1 | §5.2 规则句收正：think / text / toolOutput 均不改写状态词；无前置工具 ⇒ 裸 think 词（读侧缺省支、零 `<sub>/` 前缀） | `requirements/WEBVIEW.md:43` F-W23 AC①② |
| 2 | `D-W42` 保留（嵌套身份前缀，作用于工具行）∥ `D-W43` 由「think 覆盖前一状态词」改为「think 零改写」 | F-W23 AC① |
| 3 | 用例表 T-A33 / T-A37 / T-A38 期望改「零改写」；T-A34 / T-A35 / T-A39 / T-A40 保持 | F-W23 AC①③ |
| 4 | §10 行 20 ∥ §8 U-W21 同步为「think 零改写」 | F-W23 AC① |

**不在本批**：产品代码（父侧轻通道已落 `thincoder-render-core/subblocks/activity-view.mjs:210-215`，think 支 = `return`）· 需求档（主 agent 已改 `requirements/WEBVIEW.md:43` / `:141`）· 设计档其余段 · 批次档其它段。

### 设计档落点（已落 · `docs/vsc/design/WEBVIEW.md`）

| 落点 | 改后要点 |
|---|---|
| `:315-320` | 写点恰一处 = 结构化工具行；think / text / toolOutput 不改写；载体 `block._subMeta.stateWord` 唯一写点 = 工具行（核 `:207`），think 支不写（核 `:210-215`） |
| `:319` | 缺省支 = 出生至首个工具行；think 不写字段 ⇒ 无前置工具时恒裸 think 词、零前缀 |
| `:322-323` | 嵌套身份前缀作用于工具行（`advisor#1/read`）；think 不参与前缀 |
| `:324-326` | 先例与**对齐**（原「偏离」删除）：CLI `currentTool` 只由工具 call 写（`subagent-blocks.mjs:308` / `:323`），两端都停在上一工具名；口径依据 = 用户 2026-10-21 10:41 + 2026-09-07 裁定 |
| `:328` | 落点 = 核 `noteChunk`（think 支 = `return`）∥ CLI 零改 |
| `:310` · `:329` | 勘察源写点坐标改 `:204-208` / `:210-215`；受影响面读数 `activity-view.mjs` = **218** 行，本轮零增行 |
| `:482` · `:486` · `:487` | T-A33 / T-A37 / T-A38 期望改零改写 |
| `:636` · `:637` | D-W42 / D-W43 |
| `:663` · `:688` | U-W21 / §10 行 20 |

### 机制（一句话）

状态词只由结构化工具行写；think 到达零改写 ⇒ 头行保留上一个工具行（无工具时读侧缺省支给裸 think 词）。与 CLI 同义，共性由共用核件 `activity-view.mjs` 一处提供（桌面 `/rc/` 直映射 ∥ VSC 2 行 shim），CLI 零改。

### 关键决策

- **`D-W42` 保留其内核、去「工具行 ∥ think 同一条规则」半句**：think 既不写状态词，也就不存在 think 前缀；保留该半句会让文档自相矛盾。前缀规则本身（`<sub>/` + 工具行、逐 chunk 重算）零变。
- **`think 词` 从「写点取值」降为「缺省支兜底词」**：词键 `status.thinking`（核 `:38`）与词面口径零变，只是不再由 think chunk 写入。
- **偏离理由整段删除而非改写**：原「偏离」段的唯一内容是论证 think 覆盖，随裁定失效（D8）。

### 验收对照（回指 F-W23 四条 AC）

| AC | 机判面 |
|---|---|
| ① 工具行后接 think ⇒ 状态词零改写 | T-A33（`advisor#1/read — src/x.mjs` 保持不变）· T-A37（两路径同值） |
| ② 无前置工具 ⇒ 字段零写入 + 头行裸 think 词 | T-A33 前半 · T-A34 · T-A38 前半 · T-A39 |
| ③ 工具行支零变 ∥ toolOutput 与旧载荷零改写 | T-A35 · T-A40 |
| ④ 桌面 + VSC 同源、CLI 零改 | T-A36 |

### 上抛项

无。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**批准原话（2026-10-21 10:41）**：逐字「**你做错了就要改啊！这有好说的，昨天我就让你对比cli了，你自己自作聪明啊！赶紧改！**」+ 10:43「桌面也要同样改，别忘了。」+ 16:10「这部分工作先收口吧。」

- 批准对象 = 对齐 CLI 的 think 零改写（撤销 `#1720` 的 think 覆盖）+ 桌面同源接线。
- 轻通道轮：代码由父侧直接编（已披露），收尾链两轮评审见 §6。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

## 验证与收口

**评审两轮**：`#47`（code · changes-required：🔴0 · 🟡2 must-fix · 🔵2）→ 四条全 Fixed → `#49`（轮次 2 复核）= **pass**（四条实读验过，新增仅 1 条 🟡 行锚滞后 = 报告放行）。

**父侧复跑**：`cd thincoder-vscode && node test/run.mjs` ⇒ **19 tests / 19 pass / 0 fail**；`doc_check` gate（本批 2 档）⇒ **PASS**。

**四条收正（#47 → #49 验证）**

| # | 改了什么 | 落点 |
|---|---|---|
| 1 🟡 | 核件函数契约注释改「写点恰一处 + think/text/toolOutput 均不写」 | `activity-view.mjs:193-199` |
| 2 🟡 | 用例件档头改「think 零改写（对齐 CLI）」+ 三条用例描述 | `2026-10-20-vsc-subagent-think-label.test.mjs:1-9` |
| 3 🔵 | 需求档两行 TAB 腐蚀修净（根因 = 父侧 PowerShell 反引号转义，非设计席） | `requirements/WEBVIEW.md:43` · `:141` |
| 4 🔵 | 设计档 T-A34 行补成实件场景集 | `design/WEBVIEW.md:483` |
| 5 🟡 | 注释增行致行锚漂移 → 本轮收正（`:200` `noteChunk` · `:206-209` 工具行写点 · `:212-218` think 支 · `:209` 唯一写点 · `219` 行 · `:53` 表行） | `design/WEBVIEW.md:53` · `:310` · `:315` · `:318` · `:320` · `:329` |

**验收（F-W23 ①–④）**

| # | 判据 | 读数 | 判定 |
|---|---|---|---|
| ① | 工具行后接 think ⇒ 零改写 | T-A33 / T-A37 / T-A38 + 设计 `:482`/`:486`/`:487` | ✅ |
| ② | 无前置工具 ⇒ 字段零写入 + 裸 think 词 | T-A34 / T-A39 + 设计 `:483` | ✅ |
| ③ | 工具行支零变 ∥ `toolOutput` 与旧载荷零改写 | T-A35（分支未触） | ✅ |
| ④ | 桌面 + VSC 同源 · CLI 零改 | T-A36 + 桌面依赖 `file:../thincoder-render-core`（`package.json:21`）+ `/rc/` 映射（`protocol.mjs:35`）+ CLI 实读 `:341`/`:308`/`:323` | ✅ |

**收口清单**：doc_check 交付门 PASS · 暂缓批复核无 · 前批遗留无 · 用户文档面同步无（行为面＝运行时，用户可见规则已入需求/设计两档）· 台账 `#1723` → 已核销 · 新债无（`#48` = 另一批，在飞）。
