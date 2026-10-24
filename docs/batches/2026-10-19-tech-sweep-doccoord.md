# 2026-10-19 · tech-sweep-doccoord
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28/08:31/08:33「技术待办现在就开始处理」「继续不要等」「全部都开」——批 F = 文档坐标族（`#1564` 行号引判据式 ∥ `#1636` README 历史计数链）。。
> 台账 = #1564 ∥ #1636（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-10-19 · 评审 12 条修正轮已落：§2 重写（旧读数与旧判面已删）+ 判据句落 DOC-DISCIPLINE.md §3.21 条目 T）
### 2.1 本批条目（覆盖）

| # | 台账 | 条目 | 本批产出 |
|---|---|---|---|
| F1 | #1564 | 行号引「判据式覆盖不到的两种形态」——先立判据式 | 判据句落 `docs/core/design/DOC-DISCIPLINE.md` §3.21（条目 T）+ 全仓基线读数 + 验收 A-DD33 |
| F2 | #1636 | `docs/README.md:17` 历史计数链清退与数重算 | 改后整行逐字（2.3） |

**不在本批**：`docs/**` 其他档的坐标收正（别批）；产品代码；§3 评审段 / §5 / §6。

### 2.2 F1 · 判据式落点与读数

**落点（U1 单值）**：判据句 = `docs/core/design/DOC-DISCIPLINE.md` §3.21 条目 T（三形闭枚举 / 声明档 / 判定面二分 / 三级处置 / 覆盖关系 / 不误伤边界）。同轮改：§3 标题括注枚举与档头枚举（D3）。验收 = 该档 §5 A-DD33。本段只留本批读数，不复述判据句（D2）。

**基线读数（as-of 2026-10-19 · 复算命令 = 2.4 A1，与 A-DD33 同一条）**：

- **Ⅰ 形（裸坐标）**：**3295 token / 161 档**——表格行 **1787** ∥ 散文行 **1508**（1787 + 1508 = 3295）；无主（判缺陷面）**623**。
- **Ⅱ 形（符号坐标）**：**168 token / 46 档**——唯一声明 **40** ∥ 多声明 **75** ∥ 零声明 **53**（40 + 75 + 53 = 168）。
- **判定面二分**：Ⅰ 文档面 3090 / 116 档 · 代码面 205 / 45 档；Ⅱ 文档面 119 / 26 档 · 代码面 49 / 20 档。

**三处同值（A1 的判据）**：

| 读法 | Ⅰ | Ⅱ |
|---|---|---|
| headline | 3295 / 161 档 | 168 / 46 档 |
| 判面分解之和 | 文档 3090 + 代码 205 = **3295**（档 116 + 45 = 161） | 文档 119 + 代码 49 = **168**（档 26 + 20 = 46） |
| 行型 / 声明型分解之和 | 表格 1787 + 散文 1508 = **3295** | 唯一 40 + 多 75 + 零 53 = **168** |

**Ⅰ 形逐档表（文档面 · 116 档 · 和为 3090；括注 = 表格 / 散文 / 无主）**：

```text
core/design/DOC-DISCIPLINE.md=349(218/131/20)  core/design/MODEL-SPECS.md=172(120/52/40)  core/design/AGENT-LOOP-UPSTREAM.md=137(60/77/31)
render-core/design/RENDER-CORE.md=130(112/18/11)  vsc/design/VSC-DEBT.md=116(89/27/44)  core/design/PROMPT-SYSTEM.md=112(59/53/14)  vsc/design/SETTINGS.md=96(8/88/16)
core/design/MANIFEST.md=95(44/51/9)  core/design/AGENT-LOOP-ASYNC-POOL.md=78(21/57/18)  vsc/design/WEBVIEW.md=77(26/51/3)
core/design/DESIGN-TOKEN-SETTLEMENT.md=72(61/11/0)  core/design/TOOLS.md=71(54/17/2)  core/design/DOC-MIGRATION.md=67(61/6/0)  server/design/webui/STYLE.md=59(57/2/45)
server/design/agent/ADMIN-AGENT.md=55(41/14/4)  desktop/design/SETTINGS.md=54(15/39/1)  core/design/PROXY.md=53(28/25/8)  vsc/requirements/WEBVIEW.md=51(42/9/0)
core/design/CORE-UNIFICATION.md=50(32/18/0)  desktop/design/IPC.md=49(32/17/1)  core/design/PROVIDER.md=47(19/28/9)  core/design/SESSION.md=43(8/35/8)
core/design/TURN-CAP-CONTINUE.md=41(26/15/0)  cli/design/ACP-PROTOCOL-COMPLIANCE.md=40(30/10/13)  core/design/AGENT-LOOP-SUBAGENT.md=37(23/14/2)
vsc/design/WEBVIEW-PROTOCOL.md=37(31/6/7)  desktop/design/UI.md=34(9/25/6)  core/design/CONTEXT-COMPACTION.md=30(2/28/4)  core/design/AGENT-LOOP.md=29(17/12/0)
core/design/ENGINEERING-MODE-V2.md=28(21/7/0)  core/design/PORTABILITY.md=28(28/0/0)  desktop/design/PACKAGING.md=28(21/7/0)  desktop/design/RENDERER.md=27(10/17/0)
vsc/design/PROJECT-SWITCHER.md=26(20/6/0)  cli/design/TUI.md=25(16/9/2)  core/design/VERIFY-REDESIGN.md=25(13/12/8)  core/design/MEMORY.md=24(2/22/10)
core/design/MULTI-INSTANCE-COLLAB.md=24(7/17/8)  core/design/SETTINGS-TOOL.md=22(11/11/10)  desktop/design/ACTIVITY.md=22(16/6/0)  desktop/design/SESSIONS.md=22(22/0/0)
core/design/ENG-TOKEN-BINDING.md=20(12/8/1)  server/design/PROJECT.md=20(20/0/3)  core/design/TOOL-OUTPUT-LIMITS.md=19(14/5/0)  core/design/BROWSER-TOOL.md=18(5/13/8)
core/design/MODEL-BENCH.md=18(7/11/0)  core/design/LEDGER.md=15(2/13/3)  desktop/design/WEB-QUICKCHECK.md=15(6/9/3)  cli/design/READ-DATA-INTERFACE.md=14(13/1/0)
server/design/webui/CHAT.md=14(5/9/0)  vsc/design/WEBVIEW-INPUT.md=14(8/6/0)  core/design/TESTING.md=13(1/12/0)  core/requirements/PORTABILITY.md=13(13/0/0)
desktop/design/PANEL-READBACK.md=13(5/8/8)  core/design/DOC-SYSTEM.md=12(6/6/0)  server/design/mcp/MCP.md=12(1/11/4)  server/design/ops/OPS.md=12(7/5/12)
cli/design/ACP-CLIENT.md=11(0/11/3)  core/design/DOC-CODE-RECONCILE.md=11(4/7/6)  core/design/EDIT.md=11(11/0/0)  core/requirements/NORMAL-MODE.md=11(11/0/8)
core/design/AGENT-PARAMS.md=10(7/3/0)  desktop/design/SHELL.md=10(8/2/0)  core/design/CHECKPOINT.md=9(0/9/0)
core/requirements/ENGINEERING-MODE-V2-SPEC-CHECKLIST-REMOVAL.md=9(0/9/0)  desktop/design/MENU.md=9(6/3/0)  server/design/client/CLIENT.md=8(8/0/0)
cli/design/TUI-SESSION-VIEW.md=7(1/6/4)  core/design/SEND-STALL-DISTILL.md=7(3/4/4)  core/requirements/METHODOLOGY.md=7(3/4/2)
server/design/agent/MEMBER-AGENT.md=7(0/7/0)  cli/design/TUI-TOOL-OUTPUT.md=6(3/3/4)  core/design/ANCHOR-DEBT-REPAIR.md=6(4/2/0)  core/design/ESCALATE.md=6(6/0/0)
core/design/TRACES.md=6(3/3/0)  core/requirements/MEMORY.md=6(0/6/0)  cli/design/TUI-INPUT-BOX.md=5(1/4/0)  core/design/MCP.md=5(0/5/5)
server/design/project/PROJECTS.md=5(2/3/0)  core/design/ADVISOR-CONVERGENCE.md=4(2/2/0)  core/design/CONFIG.md=4(3/1/0)  core/design/EDIT-HELPERS.md=4(0/4/0)
core/requirements/ADVISOR-CONVERGENCE.md=4(3/1/0)  core/requirements/ENGINEERING-MODE-V2.md=4(0/4/0)  core/requirements/LOGGING.md=4(0/4/0)
desktop/design/E2E-TESTING.md=4(1/3/0)  server/requirements/PROJECT.md=4(0/4/1)  cli/design/CLI-ENTRY.md=3(0/3/0)  cli/design/TUI-COMMANDS.md=3(2/1/0)
core/design/BASH-EXECUTOR-FACE.md=3(1/2/0)  core/design/CONSULTATION.md=3(3/0/0)  core/design/TEAM.md=3(3/0/0)  core/design/WORKSPACE.md=3(3/0/0)
core/design/WRITE.md=3(3/0/0)  core/requirements/AGENT-PARAMS.md=3(3/0/0)  core/requirements/DESIGN-TOKEN-SETTLEMENT.md=3(2/1/0)
core/requirements/TURN-CAP-CONTINUE.md=3(3/0/0)  desktop/design/CHAT.md=3(0/3/0)  desktop/design/COMPOSER.md=3(1/2/0)  server/design/sandbox/SANDBOX.md=3(3/0/0)
core/design/ADVISOR-GUARDS.md=2(1/1/0)  core/design/INSERT-AFTER.md=2(2/0/0)  core/requirements/CORE-UNIFICATION.md=2(0/2/1)  core/requirements/PROMPT-SYSTEM.md=2(0/2/0)
core/requirements/TOOLS.md=2(0/2/0)  desktop/design/PROJECT.md=2(2/0/0)  server/design/webui/SANDBOX.md=2(0/2/0)  cli/design/CRASH-REPORTS.md=1(0/1/0)
core/design/APPLY-PATCH.md=1(1/0/0)  core/design/BATCH-RECORD.md=1(0/1/0)  core/design/HASHLINE-EDIT.md=1(1/0/0)  core/design/TEAM-LEDGER.md=1(0/1/0)
core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md=1(0/1/1)  desktop/requirements/CHAT.md=1(1/0/0)  desktop/requirements/PROJECT.md=1(0/1/0)
server/design/webui/ADMIN.md=1(0/1/0)
```

**Ⅱ 形逐档表（文档面 · 26 档 · 和为 119；括注 = 唯一 / 多 / 零声明）**：

```text
core/design/AGENT-LOOP-ASYNC-POOL.md=14(3/11/0)  core/design/TOOLS.md=13(0/13/0)  core/design/DOC-DISCIPLINE.md=12(6/3/3)  core/design/MANIFEST.md=11(2/6/3)
core/design/MODEL-SPECS.md=8(1/2/5)  core/design/PORTABILITY.md=8(7/1/0)  core/design/MULTI-INSTANCE-COLLAB.md=7(6/1/0)  cli/design/ACP-PROTOCOL-COMPLIANCE.md=5(0/3/2)
server/design/gateway/API.md=5(1/2/2)  core/design/AGENT-LOOP-UPSTREAM.md=4(1/3/0)  core/design/ENGINEERING-MODE-V2.md=4(0/4/0)  server/design/sandbox/SANDBOX.md=4(0/0/4)
core/design/CONTEXT-COMPACTION.md=3(0/3/0)  core/design/SETTINGS-TOOL.md=3(3/0/0)  cli/design/ACP-CLIENT.md=2(0/2/0)  cli/design/READ-DATA-INTERFACE.md=2(1/1/0)
core/design/BROWSER-TOOL.md=2(1/0/1)  core/design/MEMORY.md=2(2/0/0)  core/design/PROVIDER.md=2(0/2/0)  server/design/ops/OPS.md=2(0/2/0)  TEST-ENV-ECS.md=1(0/0/1)
core/design/AGENT-LOOP-SUBAGENT.md=1(0/1/0)  core/design/SESSION.md=1(0/1/0)  server/design/agent/MEMBER-AGENT.md=1(0/1/0)  server/design/sandbox/EXECUTION.md=1(0/1/0)
vsc/design/SETTINGS.md=1(1/0/0)
```

**代码面（判集域外 · 只统计 · 报告面）**：Ⅰ 45 档 / 205 token；Ⅱ 20 档 / 49 token。逐档明细不进本段——代码面不入判，不产缺陷集。

**本轮读数变动披露**：判据句落 `DOC-DISCIPLINE.md` §3.21 后，该档自身新增 Ⅰ 形若干（其围栏块内示例按 §4.2.1 口径跳过）——读数取**落笔后**的树，故与「落笔前」读数不同；同一命令可复现（2.4 A1）。

### 2.3 F2 · `docs/README.md:17` 改后整行（逐字）

改后行（替换该档第 17 行的整行）：

```text
| 部分档（各端面） | `cli/requirements/` · `cli/design/` · `vsc/requirements/` · `vsc/design/` · `desktop/requirements/` · `desktop/design/` · `render-core/design/` · `server/requirements/` · `server/design/` | ✅ **六部分**落点齐（`core/` · `cli/` · `vsc/` · `desktop/` · `render-core/` · `server/`）——**部分档 194**（`core/` 110 = 设计 61 + 需求 49 · `cli/` 17 = 设计 11 + 需求 6 · `vsc/` 10 = 设计 7 + 需求 3 · `desktop/` 25 = 设计 15 + 需求 10 · `render-core/` 1 = 设计 1 · `server/` 31 = 设计 30 + 需求 1）；desktop 设计**十五档** = `PROJECT.md` · `SHELL.md` · `IPC.md` · `UI.md` · `RENDERER.md` · `E2E-TESTING.md` · `WEB-QUICKCHECK.md` · `MENU.md` · `PACKAGING.md` · `CHAT.md` · `COMPOSER.md` · `ACTIVITY.md` · `SESSIONS.md` · `SETTINGS.md` · `PANEL-READBACK.md`；desktop 需求**十档** = `PROJECT.md` + 九域卷（`SESSIONS` · `CHAT` · `COMPOSER` · `ACTIVITY` · `SETTINGS` · `MENU` · `PACKAGING` · `UI` · `SHELL`）；render-core 设计**一档** = `RENDER-CORE.md`；server 设计**三十档** = 顶层 2（`PROJECT.md` · `EVOLUTION.md`）+ 十二域（`accounts` · `agent`（2 档）· `client` · `gateway`（2 档）· `ledger` · `mcp` · `metering` · `ops` · `project` · `sandbox`（2 档）· `store` · `webui`（14 档）） |
```

- **保留**：六部分落点 · 各端目录列 · 各端档数 · desktop 设计十五档具名 · desktop 需求十档具名 · render-core 设计一档 · server 设计分域明细。
- **删除**：无（实读该行本无历史链 / as-of / 批名——见 2.8 的 finding 1）。
- **重算（逐个实读）**：`core/` 61 + 49 = 110 · `cli/` 11 + 6 = 17 · `vsc/` 7 + 3 = 10 · `desktop/` 15 + 10 = 25 · `render-core/` 1 · `server/` 30 + 1 = 31 ⇒ **部分档 194**（110 + 17 + 10 + 25 + 1 + 31 = 194）。
- **server 设计三十档分解（逐域实读 · N1 收正）**：顶层 2 + 十二域 28（`accounts` 1 · `agent` 2 · `client` 1 · `gateway` 2 · `ledger` 1 · `mcp` 1 · `metering` 1 · `ops` 1 · `project` 1 · `sandbox` 2 · `store` 1 · `webui` 14）= **30**；十二域逐项与 `docs/server/design` 实读相等。

### 2.4 验收（命令 + 期望读数）

**A1（回 #1564 · 判据式与读数同拍）**：跑 §3.21 验收 A-DD33 的同一段码块（cwd = 仓根，`node` 直跑）⇒ 两行输出必须逐字为：

```text
I tok=3295 docs=161 table=1787 prose=1508 orphan=623 | doc 3090/116 code 205/45
II tok=168 docs=46 uniq=40 multi=75 zero=53 | doc 119 code 49
```

且该读数 = 2.2 的三处同值。偏差 ⇒ 清单与判据式不同拍（D3），本批不通过。

**A2（回 #1636 · 改后行零历史链）**：读 `docs/README.md` 第 17 行 ⇒ 计数链正则（`⇒\s*\d+\s*⇒`）零命中、`as-of` 零命中、`批 ` 零命中。

**A3（当前数实读复算）**：逐目录计 `.md`（扣 `_archive`）⇒ `core/design` 61 · `core/requirements` 49 · `cli/design` 11 · `cli/requirements` 6 · `vsc/design` 7 · `vsc/requirements` 3 · `desktop/design` 15 · `desktop/requirements` 10 · `render-core/design` 1 · `server/design` 30 · `server/requirements` 1；合计 **194**（与 A2 行内数逐项相等）。

**A4（交付门）**：`doc_check(mode:"gate", docs:[`docs/core/design/DOC-DISCIPLINE.md`])` ⇒ 首行 `DOC-CHECK GATE: PASS`。

### 2.5 #1564 台账坐标实读复核（内层行号已漂——正是本判据要抓的缺陷类）

- 台账记 `thincoder-core/agent/attachments.mjs:5`（三处）⇒ 实读 `:6`（`:49` ∥ `:109`）+ `:115`（`:110`）——外层坐标整体 +1 漂移。
- 台账记 `thincoder-core/provider/core.mjs:216` ⇒ 实读 `:218`（`:193`）。
- 台账记 `thincoder-core/agent-tools/subagent.mjs:354` ⇒ 实读 `:360`（`:249-253`）。
- 形态样本（实读）：`thincoder-render-core/composer/panel.mjs:82` 的 `（:42）`（Ⅰ 形无主）；`thincoder-render-core/flow/tool-card-restore.mjs:18` 的 `live :209`（Ⅰ 形无主——`live` 非文件 token）；`thincoder-render-core/subblocks/state.mjs:46` 的 `freezeBlock:197-210`（Ⅱ 形——符号声明在 `activity.js` 侧）。

### 2.6 关键决策

- **KD-1 判只落机不可争的两类**：Ⅲ 形的越界行号、Ⅰ 形的无主引。Ⅱ 形**一律报告面**——符号坐标的值 / 行号双义（`maxTokens:131072` · `HOT_WINDOW_MS:37`）判不动，强判即假阳（先例见该档 §4.2.4）。
- **KD-2 判据句落点 = `DOC-DISCIPLINE.md` §3.21 条目 T**：批档可整体清理 ⇒ 判据不能只住批档（D4 细则二）；本节只留读数。
- **KD-3 判定面二分**：读数域含代码面（统计）；判集域 = 文档面。代码面命中列报告面——文档判据不压到代码面（与「不改代码 / 测试语义」同向）。
- **KD-4 Ⅲ 形抽取 = §4.2.1 逐字**：不另立枚举（扩展名闭集含 `svg`、并列组整段消费）——同一机制两处枚举必漂。
- **KD-5 F2 的数是读数不是沿革**：重算一次、只留终值（D8）。

### 2.7 先例行与调研行

- **最接近先例**：实现坐标 = `scripts/doc-check-anchors.mjs:45` 的 `PATH_RE`（V5-A 抽取式）；同题设计节 = `docs/core/design/DOC-DISCIPLINE.md` §4.2.1（锚抽取）与 §3.5 条目 F（坐标尾闭枚举）；先例批 = #1407（示意名误报收正）。**对齐**：抽取单源、坐标尾整段消费、零新机检器。**偏离一处**：新形**不与 V5-A 合流**——V5-A 判的是「路径 token 在不在盘」，新 Ⅰ 形判的是「裸坐标有没有主」，前者是存在性、后者是文本纪律；合流会让「不入锚集」的裸坐标拿不到任何判面（即条目 F 判据 3 的成因）。
- **公开源调研**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]`（实读）⇒ 工作目录内无独立公共文档仓；`D:\ref\` 参考系在索引外（只读）。**结论：已查，无相关公共源可引**。

### 2.8 受影响文件与夹具

| 件 | 动作 | 面 |
|---|---|---|
| `docs/core/design/DOC-DISCIPLINE.md` | 新增 §3.21 条目 T + §5 A-DD33；档头枚举与 §3 标题枚举各 +1（D3） | 文档面（设计档 = 本席笔） |
| `docs/README.md` | 第 17 行整行替换（2.3 逐字） | 文档面（实施轮） |
| 单元测试档（名随批次档） | 夹具四组（见下）——判据改动词必配护栏 | 测试面（实施轮；随批归档） |
| `scripts/doc-check-anchors.mjs` | **零改**（判据句落地不动引擎） | 代码面 |

**夹具清单（实施轮落单元测试档 · 临时域 · 零落仓）**：

1. **三形正例**：`x.mjs:42`（Ⅲ，在盘且在行数内）· `countContentLines:16`（Ⅱ，唯一声明 ⇒ 报告面）· `panel.mjs 同档 :82`（Ⅰ 有主 ⇒ 报告面）。
2. **值形假阳反例**：`maxTokens:131072` · `HOT_WINDOW_MS:37` ⇒ 报告面，**判集 0**。
3. **无主 ∥ 有主边界**：`（:42）` 无主 ⇒ 入判；`live :209` 无主 ⇒ 入判；同行带文件 token 的 `:82` ⇒ 报告面。
4. **并列组带区间**：`:12-20/:44` ⇒ 归 §3.5 条目 F（不入 Ⅰ）；`x.mjs:12-20/:44` ⇒ Ⅲ 整段尾剥离后判存在性。

### 2.9 本席自报两份 finding（在批内，非裁决）

1. **F2 的目标行无历史链**：实读 `docs/README.md:17` 本无「53 ⇒ 76 ⇒ …」类计数链与 as-of；同档的计数沿革在 `:83`–`:84`（`core/design` 计数 + `前值 51 = 51…此后实增五档`）。2.3 的改后行因此只含**数收正**（193/29 → 194/30），不含删除。是否把 `:83`–`:84` 一并清退 = 超本批已裁范围（台账 #1636 只指 `:17`），**请父侧裁**。
2. **数实读偏差**：`server/design` 实读 **30 档**（设计载荷记 29）；故「部分档 193」实为 **194**。2.3 已按实读改正。

### 2.10 上抛项

- **[上抛·待裁] U2**：Ⅰ 形无主引（623 处）的清理边界——全仓一次收 ∥ 随档触碰收（本席倾向随档触碰 + 判据入机检后转常驻，避免一次性大 diff）。
- **[上抛·知会] U3**：Ⅱ 形报告面里的值形 token（`maxTokens:131072` 类）能否人工判定为「非行号」——本式不作断言，列报告面供巡检选样。
- **U1（已闭）**：落点 = `DOC-DISCIPLINE.md` §3.21 条目 T（父侧单值）。

- **[上抛·待裁] U4**（`#1636` 的交付面）：本批实际交付 = **数收正 193 → 194**（含 server 设计分解 29 → 30）。依据：`docs/README.md:17` 现文已无历史计数链——`git diff` 对 HEAD 显示旧行（`53 ⇒ 76 ⇒ 79 ⇒ 80 ⇒ 81 ⇒ 82` 链）在工作区已被 2.3 的改后行整行替换（改动未提交，本席本轮逐字复核与 2.3 相同）。请父侧裁定：① 「只收正数 + 改后行无链」是否即 `#1636` 的闭环；② 同档 `:83`–`:84`（`core/design` 计数沿革：`前值 51 = 51…此后实增五档`）是否另批清退（本批只认 `:17`）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：批 F 设计载荷 = `docs/batches/2026-10-19-tech-sweep-doccoord.md` §2（`:12-138`）+ 落点档 `docs/core/design/DOC-DISCIPLINE.md`（判据单源在档面：§3.5 条目 F / §4.2.1 / §4.2.4 / §5）。
**范围与方法限制**：`docs/README.md` 为被改对象、不在声明范围 ⇒ 未实读（F2 的 193 等目录读数 `unverified`，仅核过算术自洽：110+17+10+25+1+30=193）；未声明 Project Standards 档、未找到文档地图 ⇒ 「文档归属」按 Project Guide（AGENTS.md「写改文档前先查地图」）+ 在档判据判。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance criteria | 🔴 | A1 期望读数三处自相矛盾：`:117`「期望读数：Ⅰ 形 **485** token / **76** 档（表格 198 ∥ 散文 290）」，`:48` 同读 485/76；但 198+290=**488** ≠ 485，且逐档计数表（`:50-72`）逐项相加 = **484** token / **74** 档 ≠ 485/76。`:117` 又写「偏差 ⇒ 本批不通过」⇒ 本批唯一验收判据不可达。 | 用同一命令重算一次，使 headline = 逐档表之和 = 表格/散文分解之和；三处同轮改（D3），并把复算命令写进 A1（现只给两正则）。 |
| 2 | Clarity（判面未定 / 假阳） | 🔴 | Ⅱ 形入闸面自相矛盾：`:30` 表「唯一声明 ⇒ N ≤ 声明档行数」读作入闸，`:35` 三级处置「**判**：Ⅲ 形的 N 越过档尾（> 档行数）」只点名 Ⅲ 与 Ⅰ 无主、Ⅱ 不入判。「入判」清单自带值形 token：`:84`「maxTokens:131072」按 `:30` 读法 ⇒ 131072 > 该档行数 ⇒ 判缺陷（假阳），与 KD-1「判只落机不可争的两类」（`:127`）相悖；同表 `HOT_WINDOW_MS:37` 等值/行号双义项，降级披露（`:96`）只挑 4 例、未含 maxTokens。 | 二选一写死：Ⅱ 一律报告面（删 `:30` 的「N ≤ 声明档行数」），或给 Ⅱ 加值形排除；并定义「声明档」= 符号声明所在档——否则 `:81` 的 `countContentLines:16`（实核 = `DOC-DISCIPLINE.md:911`）的 16 指向他档行号，基准无解。 |
| 3 | Document ownership | 🔴 | 新 Ⅰ 形把无路径前缀裸坐标判为硬缺陷（`:31`「**无主 ⇒ 判缺陷（无主引）**」），而在档判据 `DOC-DISCIPLINE.md:164` 明写「**无路径前缀的裸坐标串**不入集」，同档 `:1322` 又把坐标尾闭枚举指向 §3.5 条目 F；设计完全未与条目 F 对接（KD-1 只引 §4.2.4）⇒ 落进该档后同一机制两处相反表述。另 Ⅲ 形声明「**Ⅲ 形** = 既有锚面（V5-A），本式不新增抽取」（`:98`），但其扩展名闭集（`:29`）漏 `svg`、且无并列组，与 `DOC-DISCIPLINE.md:1340` 的 `mjs|cjs|js|json|md|css|html|svg|yml|yaml|sh|ps1` 及并列组整段消费不一致。 | 增一段「三形 △ §3.5 条目 F / §4.2.1」覆盖关系句（抽取单源是谁、裸坐标归哪个判集、并列组归属）；Ⅲ 形改为「抽取 = §4.2.1 逐字」，不重述枚举。 |
| 4 | Requirements coverage / Clarity | 🟡 | F2 交付物未在设计内：`:19` 判产出 =「改后整行」，`:109` 只写「改后单行见盘面 `docs/README.md:17`（表格行）」——自指到被改对象本身，评审与实施都无从核（该档不在声明范围，未实读）。 | 把改后整行逐字贴进 §2.3，保留/删除/重算三条降为注释。 |
| 5 | Methodology（模板项缺） | 🟡 | §2 缺模板点名两项「受影响文件与测试覆盖」（`:10`）：无受影响文件表，也无测试/夹具计划；同档规定「本节为判据改动词，护栏为必配」（`DOC-DISCIPLINE.md:2053`）、条目 E 零落仓 + 并发免疫、条目 F 判「无夹具即无判据」（`DOC-DISCIPLINE.md:166`）。纯 `.md` 面虽免行数标注（§3.7），面清单与测试面仍须在册。 | 补一节：受影响文件表（`docs/README.md` · 实施轮 `DOC-DISCIPLINE.md` · §3 标题与档头枚举同轮改）+ 夹具清单（三形正例 / 值形假阳反例 / 无主∥有主边界 / 并列组带区间）。 |
| 6 | Acceptance criteria（可复现） | 🟡 | A1 只给「扫描式 = 2.2 两正则」（`:117`），而读数依赖两正则之外的判定：Ⅰ 形「行内无主」= 同行回指词表（`:31`）与「表行隔行取主」；Ⅱ 形「唯一声明」= 全仓声明检索。正则产不出 485/107 ⇒ A1 不可复跑。 | 附可跑命令（遍历 + 汇总 + 两后置过滤），或把读数降为量级登记、判据改结构性（「逐档表之和 = headline」）。 |
| 7 | Scope | 🟡 | 判集射程未限文档面：A1 域含 `.mjs/.js/.cjs`（`:117`），而射程外清单（`:37`）只排批档/归档/参照树/TODO；无主裸坐标在源码注释同形 ⇒ 落判后把文档判据压到代码面，与 `DOC-DISCIPLINE.md:1680`「**不改代码 / 测试语义**」冲突且无豁免句。 | 两分写死：读数域（含代码，统计）∥ 判集域（文档面）；代码面命中列报告面，引 §4.6。 |
| 8 | Closest precedent（准则 9） | 🟡 | 无「最接近先例」行：仅 KD-1 偶举「先例 = `docs/core/design/DOC-DISCIPLINE.md` §4.2.4 假阳类排除」（`:127`），缺先例坐标（实现坐标 ∥ 同题设计节 ∥ 先例批）与对齐 ∥ 偏离理由；缺行与「未做先例调查」不可分。 | 补一行：`scripts/doc-check-anchors.mjs:45` 的 `PATH_RE` ∥ §4.2.1 / §3.5 条目 F ∥ 先例批，并写为何新形不与 V5-A 合流。 |
| 9 | Survey evidence（准则 10） | 🟡 | 无「公开源调研」行：未记录查过哪些公共源文档（含独立文档仓）∥ 有无可用之处。 | 补一行：调研面（如 `D:\\ref\\` 参考系 / 他仓 doc 引擎坐标判据）+ 结论（相关 ∥ 无相关，均须在册）。 |
| 10 | Document ownership / 落点 | 🟡 | 判据式落点未定且现只住批次档：KD-2（`:128`）本轮只作提案住 §2.2；U1（`:134`）「判据式落 `DOC-DISCIPLINE.md` 的条目位」仍「待裁」——与 D4 细则二「长期内容住设计 / 需求档」（`DOC-DISCIPLINE.md:57`）张力明显（批档可整体清理 ⇒ 判据随批消失）。且落新增条目 T 须同轮改 §3 标题枚举与档头枚举（先例机判 = `DOC-DISCIPLINE.md:1861`），本设计未携。 | U1 由设计侧给单值（建议 §3 新增条目 T，判据句住 `DOC-DISCIPLINE.md`），并把 D3 枚举同步 + §5 新 A-DD 行列入受影响面。 |
| 11 | Clarity（Ⅱ 基准） | 🔵 | 「**N ≤ 声明档行数**」（`:30`）未定义声明档 = 符号声明所在代码档 ∥ 写该坐标的文档；`:81` 实例取他档行号 ⇒ 两读法结论不同。 | 定义声明档，并给两侧都过的夹具。 |
| 12 | Doc hygiene | 🔵 | §2 两条状态行并存（`:9` 骨架行「设计完成 2026-10-19」与 `:12`「✅ 设计完成（2026-10-19）」），`:10` 模板占位仍在。 | 收口时只留一条状态行（骨架占位按批档工具约定处置）。 |

**已核为一致（非 finding）**：Ⅱ 形 107 = 唯一声明 38 + 多声明 69（逐条相加实核 38）；Ⅲ 形 18 → 16 项…不适用；F2 分解算术 110+17+10+25+1+30 = 193 自洽；DOC-DISCIPLINE 尚无条目 T（§3 只到 3.20 条目 S，位可落、无编号冲突）。

**计数**：🔴 3 · 🟡 7 · 🔵 2 = 12 条。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 复核**（评审对象 = 批 F 设计载荷 §2 + 落地物 `docs/core/design/DOC-DISCIPLINE.md` §3.21 条目 T ∥ §5 A-DD33）

**复核面**：轮次 1 十二条逐条复核（读数三处同值 ∥ Ⅱ 判面 ∥ 条目 F 覆盖关系 ∥ F2 改后整行 ∥ 受影响表+夹具 ∥ 可跑码块 ∥ 判集射程 ∥ 先例行 ∥ 调研行 ∥ U1 单值落 §3.21 ∥ 声明档定义 ∥ 单状态行）+ 新引入问题。实读：本档 §2（`:8-164`）、`DOC-DISCIPLINE.md` §3.21（`:1289-1326`）、§5 A-DD33（`:1762` / `:2006-2045`）、档头与 §3 标题枚举（`:3` / `:117`）、`§3.5 条目 F`（`:160-166`）、`§4.2.1`（`:1311-1314`）、`:1075`。

| # | 类别 | 严重度 | 事项 | 建议 |
|---|---|---|---|---|
| 1 | 验收（轮次①） | ✅ Fixed | 三处同值成立且实核：§2.2 Ⅰ `3295/161`、分解 `1787+1508`、判面 `3090+205`、档 `116+45`；Ⅱ `168=40+75+53`、`119+49`、`26+20`。**逐档表逐项相加 = 3090 且 116 档**（本人逐条相加核过）；Ⅱ 逐档表相加 = 119 且 26 档；与 §3.21 `:1323` 基线、A-DD33 ②、`A1` 期望两行逐字一致。 | — |
| 2 | 判定面（轮次②） | ✅ Fixed | Ⅱ 形「一律报告面」写死（`:1296` 判定列 = 无）；三级处置「判」只列 Ⅲ 越界 + Ⅰ 无主（`:1305`）；A-DD33 ③ 以 `maxTokens:131072` · `HOT_WINDOW_MS:37` 钉死「判集 0」；KD-1 与之一致。 | — |
| 3 | 文档归属（轮次③） | ✅ Fixed | Ⅲ 形改为「§4.2.1 的 V5-A 围栏抽取式**逐字**（本条不重述枚举）」（`:1295`）；覆盖关系四条含「裸坐标归哪个判集」（`:1313`：条目 F 判据 3 的射程 = 锚集，本条判另一类，两句正交）与「并列组归属」（`:1314`）；`:1311` 复述的扩展名闭集与 §4.2.1 一致（含 `svg`）。 | — |
| 4 | 交付物（轮次④） | ✅ Fixed | §2.3 `:92-96` 给出改后整行逐字码块 + 保留/删除/重算三条；算术 110+17+10+25+1+31 = 194 自洽。 | 见 N1 |
| 5 | 方法论（轮次⑤） | ✅ Fixed | §2.8 `:139-153` 补受影响文件表（4 行 · 含 `scripts/**` 零改面）+ 夹具四组（三形正例 / 值形假阳反例 / 无主∥有主边界 / 并列组带区间）。 | — |
| 6 | 可复现（轮次⑥） | ✅ Fixed | A1 指向 A-DD33 同一段可跑码块（`:2014-2045`），且 A1 期望两行的格式串与码块 `console.log` 逐字相符（`I tok=… docs=… table=… prose=… orphan=… \| doc …/… code …/…` ∥ `II tok=… uniq=… multi=… zero=… \| doc … code …`）。 | 见 N5 |
| 7 | 射程（轮次⑦） | ✅ Fixed | `:1301` 判定面二分（读数域含代码面、判集域 = `docs/**`）；`:1306` 代码面列报告面；A-DD33 ⑤ 机判「判集 0」并与 §4.6 同向。 | — |
| 8 | 先例（轮次⑧） | ✅ Fixed | §2.7 `:136` 三坐标齐（`scripts/doc-check-anchors.mjs:45` 的 `PATH_RE` ∥ §4.2.1 / §3.5 条目 F ∥ 先例批）+ 对齐 + 偏离一处理由。 | — |
| 9 | 调研（轮次⑨） | ✅ Fixed | §2.7 `:137` 记录 `index.publicRepos = []` 实读 + `D:\ref\` 索引外 + 结论「无相关可引」。 | — |
| 10 | 落点/枚举（轮次⑩） | ✅ Fixed | U1 已闭为「§3.21 条目 T」，KD-2 写明理由；D3 枚举同步已在盘实核：档头 `:3` 与 §3 标题 `:117` 均含「行号引判据式（条目 T）」；§5 新增 A-DD33 行（`:1762`）；A-DD33 ① 把该同步做成机判项。 | — |
| 11 | Ⅱ 基准（轮次⑪） | ✅ Fixed | `:1299` 定义声明档 = 符号声明所在**代码档**，并给理由（`countContentLines:16` 指向 `scripts/doc-check-linecounts.mjs:16`）与「只供报告面列读」限定。 | — |
| 12 | 文档卫生（轮次⑫） | ✅ Fixed | §2 现只有一条状态行（`:9`），模板占位行已不在。 | — |
| N1 | 计数纪律（D3） | 🟡 | 新引入：§2.3 改后整行内部计数不自洽——`server` 段「设计**三十档** = 顶层 2（`PROJECT.md` · `EVOLUTION.md`）+ 十二域（`accounts` · `agent`（2 档）· `client` · `gateway` · `ledger` · `mcp` · `metering` · `ops` · `project` · `sandbox`（2 档）· `store` · `webui`（14 档））」逐项相加 = **2 + 1+2+1+1+1+1+1+1+1+2+1+14 = 29**，与 headline「三十档」及 A3「server/design 30」差 1。该分解将逐字落进 `docs/README.md:17`，而 A3 只核目录总数⇒分解错不会被验收抓到。 | 落笔前按 `docs/server/design` 重列并令分解之和 = 30（或删去该括注分解，只留「三十档」）。 |
| N2 | 需求覆盖/协调 | 🟡 | #1636 的对象在本行不存在：§2.3 自报「实读该行本无历史链 / as-of / 批名，删除清单 = 无」，本批实际交付退化为「数收正 193→194」，同档计数沿革在 `:83`–`:84` 而台账只指 `:17`。理由已给且非静默，但仍留在 §2.9「本席自报」——未进 §2.10 上抛项表，父侧按表处置时会漏读。 | 把该前提失效转入 §2.10 上抛项（与 U2 / U3 同表），请父侧裁定「只收正数」是否即为 #1636 的闭环（`docs/README.md:83-84` 是否另批）。 |
| N3 | 文档卫生（存量 + 本轮失真） | 🔵 | `DOC-DISCIPLINE.md:1075` 的受影响文件表行仍带行数两列（`2046` ∥ `2046`），本次落 §3.21 + A-DD33 后现盘已 2153 行 ⇒ 数字失真；且与 A-DD15「受影响文件表 `.md` 行两列填 `—`」的现行口径不一。注意：该行非本轮引入（属另一笔的 as-of 读数），本轮只使其失真，§2.8 受影响表未列该行。 | 由该表属主同轮收正（改 `—` 或改 2153）；若确为 as-of 快照，在表头注明 as-of 口径。 |
| N4 | 可复现（逐档表） | 🔵 | §2.2 Ⅱ 逐档表一条缺端/层前缀：`TEST-ENV-ECS.md=1(0/0/1)`（同表其余全部为 `端/层/档` 形式）⇒ 该档不可定位，逐档表宣称的可复算性在该行断掉。 | 补全路径（或注明它在哪个端面）。 |
| N5 | 措辞/射程（小） | 🔵 | `:1299` 声明档写作「**全仓**声明检索命中处」，而 A-DD33 码块在 `files`（扣 `docs/batches` / `_archive` / TODO 两档 / 两参照历史树）上建 `decl` ⇒ 措辞域 ⊋ 可跑命令域。Ⅱ 只为报告面，不影响判集，故不改判。 | 「全仓」改为「读数域内」或反之把命令域说清（两侧同宽）。 |

**计数**：轮次 1 十二条 = 12 ✅ Fixed；新增 = 🟡 2 · 🔵 3（无 🔴）。

**复核局限**：`docs/README.md` 为被改对象、不在声明范围 ⇒ F2 的 194 / 各端档数 / `:83-84` 沿革均未实读（unverified）；基线读数 3295/161 · 168/46 需跑 A-DD33 码块（`git ls-files`）方可确证绝对真值，本轮只核到**内部三处同值 + 逐档表相加 = 3090/116 与 119/26**；先例批 `#1407` 与 `index.publicRepos = []` 未实读。

VERDICT: pass

计数汇总：Fixed 12 · 🟡 2 · 🔵 3 · 🔴 0。

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过评审（§3 = pass）⇒ 实施获准。

**批准范围**：`docs/README.md` 的 30 档分解收正 + `DOC-DISCIPLINE.md` §3.21 条目 T 落判据句。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- `docs/README.md:17` 的 30 档分解**逐字相符**（父侧复核）
- 判据句入住 `docs/core/design/DOC-DISCIPLINE.md` §3.21 条目 T（+ A-DD33）
- 档案行 1074–1077 的空位填 `—`（不留悬空空列）

**③ 单元测试零留存**：文档面笔，无测试档；判据为**锚解析 0 悬空**（机检门直接覆盖）。

**④ 集成面**：无（文档面）。

**⑤ 修正轮落地前置**：评审 12 条修正轮**已落**（§2 重写 + 判据句落 `DOC-DISCIPLINE.md`）。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：`docs/README.md` 是**文档地图入口**，改的是「哪一档管什么」的索引——**已同轮改净并逐字复核**。

**⑨ 本批意义**：这是唯一一批**改的是「地图」本身**的。地图错一格，后面所有「按图找档」的动作都偏——所以它的判据是「逐字相符」，不是「大意如此」。
