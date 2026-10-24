# 2026-10-19 · tech-sweep-code-judgment
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28「技术待办现在就开始处理」+ 08:29「为什么不现在就开？」——批 C+D = 结构拆分（`#1612` `#1674`）∥ 判据面（`#1677` `#1679`），四笔同属产品代码面。。
> 台账 = #1612 ∥ #1674 ∥ #1677 ∥ #1679（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（C1/C2 结构拆分 + D1/D2 判据面，四笔逐条设计已落；一项判据改口上抛待裁）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-19）

### ① 覆盖条目（4 笔，全部产品代码面）

| # | 台账 | 内容 | 面 |
|---|---|---|---|
| C1 | `#1612` | `thincoder-core/config.mjs` 越 500 软线 ⇒ 拆分 | 结构拆分 |
| C2 | `#1674` | `thincoder-cli/src/tui/cmd-config.mjs` 越 500 软线 ⇒ 拆分 | 结构拆分 |
| D1 | `#1677` | 设计轮注入的 `wrote` 判据看不见 `batch` 写面 | 判据 |
| D2 | `#1679` | 回 auto 的提示只在「已 auto」时出现 | 提示条件 |

**不含**：其它任何越线档、`config.mjs` 的行为语义变更、`file_ops` 入 `FILE_MUTATORS`、VSC 设置面板改动、`#1673`/`#1675`/`#1676`/`#1678`。

### ② 现状实测（本设计自测；命令 = `node -e` 计 `\n`，同 `wc -l` 口径）

| 档 | 台账读数 | 实测 | 差值 |
|---|---|---|---|
| `thincoder-core/config.mjs` | 520（`CORE-UNIFICATION.md:575` 记 523） | **570** | +47 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 521 | **543** | +22 |

两档在记账后继续生长 ⇒ **C1 的「实施后 ≤528」判据自起点就不成立**（见 ⑧ D-S1）。

### ③ C1 设计：`config.mjs` 拆分

**现状六块**：① `DEFAULTS`（`:33-110`）② 请求预算算式族（`:126-195`）③ 百炼 thinking 解析（`:201-231`）④ 加载期归一 helpers（`:240-351`）⑤ `loadConfig` 编排（`:355-489`）⑥ MCP 重载面（`:509-570`）。

| 新档 | 职责一句话 | 迁入 | 预测行数 |
|---|---|---|---|
| `thincoder-core/config-defaults.mjs`（新） | 配置默认值表本身（纯数据 + 每键注释） | `DEFAULTS` 整段 | ≈90 |
| `thincoder-core/config-normalize.mjs`（新） | 加载期把脏盘面洗成规范形态的纯函数族 | `sanitizeProviderHeaders` · `sanitizeConsultModels`+`warnConsultModelsFiltered` · `sanitizeSubagentModel(s)`+`warnSubagentModelsFiltered` · `normalizeProxy` · `normalizeTeamSection`（`thincoder-core/config.mjs:240-351`） | ≈100 |
| `thincoder-core/config.mjs`（留） | 公共面 re-export + `loadConfig` 编排 + 预算算式族 + 百炼 thinking + MCP 重载 | 余下全部 | ≈418 |

**为什么拆两块**：单拆归一 helpers ⇒ ≈486（余量 14 行）；`DEFAULTS` 每加一键 +1 行、`loadConfig` 每加一归一分支 +3~5 行 ⇒ 下一批再越线。两块各拆后 ≈418（余量 82 行）。两块职责都可一句话说清，不是把逻辑切成无意义包装。

**导出面不变（硬约束）**：`config.mjs` 被 34 档 import。新档经 `import` + `export {…} from` 原样维持全部自有导出（`DEFAULTS` ∥ `outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥ `resolveCompactThreshold` ∥ `isBailianHost` ∥ `resolveEnableThinking` ∥ `sanitizeSubagentModel` ∥ `sanitizeSubagentModels` ∥ `findProvider` ∥ `normalizeProxy` ∥ `normalizeTeamSection` ∥ `loadConfig` ∥ `reloadMcpFromDisk`）与四族既有 re-export（model-ref / config-migrate / config-io / model-specs）。**任何导入点零改**。

无环：`config-defaults.mjs` → `config-io.mjs`（`configDir`）+ `node:path`；`config-normalize.mjs` 零核内 import；`config.mjs` → 两者。实施轮以 `grep "from \"./config.mjs\"" thincoder-core` 复核，期望零命中。

### ④ C2 设计：`cmd-config.mjs` 拆分

**台账两步路径（501/477）按 521 行算；实测 543 ⇒ 一步到位，不分两批**（两步各自无独立验收；两批 = 同一档读两遍 + 两轮评审）。

| 目标档 | 职责一句话 | 迁入 | 预测行数 |
|---|---|---|---|
| `thincoder-cli/src/tui/config-helpers.mjs`（已存在 80 行） | 配置值读写 + 显示值辅助（纯函数、零 ctx） | `embeddingPatch` · `poolCur` · `effortMenuLevels` · `compactThresholdSuffix` + 新增 `compactThresholdHint`（D2） | 80 → ≈120 |
| `thincoder-cli/src/tui/cmd-config-menus.mjs`（新） | `/config` 四个子菜单（代理 ∥ 会诊池 ∥ 并发池 ∥ 默认模型），工厂形接收 ctx 袋 | `proxyMenu` · `pickEffort` · `consultMenu` · `poolMenu` · `defaultModelMenu` | ≈233 |
| `thincoder-cli/src/tui/cmd-config.mjs`（留） | 命令入口 + 保存/重载脊柱（`setEmbedKey`/`reloadConfig`/`saveProxy`）+ 主菜单循环 + 数值项分支 | 余下全部 | ≈312 |

**工厂签名（写死）**：`createProxyMenu(ctx)` · `createConsultMenu(ctx)` · `createPoolMenu(ctx)` · `createDefaultModelMenu(ctx)`；`ctx = { agent, DEFAULTS, showPicker, askQuestion, pushLine, pushLabel, saveProxy, pickModelForSlot }`。`cmd-config.mjs` 在建好 `saveProxy` 后构造四个菜单并复用，行为零变。

**命名约定**：`tui/` 既有 = `cmd-<命令>.mjs`（入口）· `<领域>-helpers.mjs`（辅助纯函数）· `<领域>-admin.mjs`/`<领域>-catalog.mjs`（子域）⇒ 新档 `cmd-config-menus.mjs` 合约定；纯函数落已存在的 `config-helpers.mjs`（该档已拥有「配置辅助」主题），不新建第三个档。

### ⑤ D1 设计：`wrote` 判据并入 `batch` 写面

**取①「并入判据」，但不并入 `_touchedFiles`**：新增每 run 计数器 `agent._batchWrites`，判据改为 `wrote = _touchedFiles.length > 0 || _batchWrites > 0`（`thincoder-core/agent/post-turn.mjs:99`）。

**为什么不用 `_touchedFiles` 承载**：它有五个下游消费者——`agent-tools/verify.mjs:137` · `advisor/messages.mjs:295` · `agent-tools/doc-check.mjs:68` · `recent-changes.mjs:18` · `subagent-async.mjs:463`；塞进去同时改这五处语义，且 `advisor/repos.mjs:118 hasCodeMutations` 会把「只写了批档」判成「代码有变更」⇒ 推翻 advisor/verify 的 stale 判据。计数器只动 `wrote` 一处。

**「批档是一次性载体，算不算已落盘」**：对**本轮判据**算——该注入句自己逐字要求「write the skeleton (design doc + batch record §2)」，§2 落了却报「nothing written」是自相矛盾；对**持久面**不算——不进 `_touchedFiles`，不进 verify/advisor/doc-check 范围。

**落点（单点记账）**：五处写盘成功后均调 `onWritten?.(agent, abs)`（`agent-tools/batch.mjs:242` ∥ `batch-lifecycle.mjs:181`/`:459`/`:472`/`:503`）。把 `batch.mjs` 传给 lifecycle 的 `onWritten` 统一换成组合函数：先 `agent._batchWrites = (agent._batchWrites ?? 0) + 1`，再调端侧 `injectedOnWrite?.(agent, abs)`（VSC 的 `_touchedFiles` 记账零改）。

**配套三处（同 `_touchedFiles` 生命周期）**：`agent/helpers.mjs:249` `INHERITED_GUARD_KEYS` 加 `"_batchWrites"` · `agent.mjs:67` 初值 `_batchWrites: 0` · `agent/run-start.mjs:124` 与 `_touchedFiles = []` 同点复位。

**行为差异**：eng-designer 已 `batch append` §2 后继续 ⇒ 改前第 8 轮注入「nothing has been written to disk yet」（假）；改后「something has been written to disk」。只写代码档 ⇒ 两版同为 true；零落笔 ⇒ 两版同为 false；其余角色零变化。

### ⑥ D2 设计：回 auto 提示改为「条件恒进、文案按档分流」

判据从 `isCompact && ac.compactThresholdAuto` 改为 `isCompact`；文案按 `compactThresholdAuto` 二选一：

| 当前档 | 改前提问行后缀（`cmd-config.mjs:510`） | 改后 |
|---|---|---|
| auto | `— 输入数值即固定为显式阈值；输入 auto 回到自动派生（删键）` | `— 输入数值即固定为显式阈值` |
| 显式 | 无 | `— 输入 auto 回到自动派生（删键）` |

**为什么不取②`!compactThresholdAuto`**：那会把「输入数值即固定为显式阈值」从 auto 用户眼前拿走——而这句正是「配置项必须有可写回的界面」在 auto 档的唯一提示；最需要它的人恰是 auto 用户。**为什么不逐字恒发原句**：对 auto 用户「输入 auto」是空操作，降低提示的可信度。
**逐字实现**：`config-helpers.mjs` 新增 `compactThresholdHint(auto)` → `auto ? " — 输入数值即固定为显式阈值" : " — 输入 auto 回到自动派生（删键）"`；非 compact 项由调用点传 `null` ⇒ 返回 `""`。

### ⑦ 受影响文件（现况实测 → 预测后）

| 档 | 现况 | Δ | 说明 |
|---|---|---|---|
| `thincoder-core/config.mjs` | 570 | **≈418** | 两块迁出 + 两条 import/re-export |
| `thincoder-core/config-defaults.mjs` | 新 | ≈90 | `DEFAULTS` |
| `thincoder-core/config-normalize.mjs` | 新 | ≈100 | 归一/清洗 helpers + 两枚警告旗 |
| `thincoder-core/agent-tools/batch.mjs` | 345 | +4 | `onWritten` 组合函数（核心计数） |
| `thincoder-core/agent/post-turn.mjs` | 105 | +1 | `wrote` 判据 |
| `thincoder-core/agent/helpers.mjs` | 493 | +1 | `INHERITED_GUARD_KEYS` 增键 |
| `thincoder-core/agent.mjs` | — | +1 | `_batchWrites` 初值 |
| `thincoder-core/agent/run-start.mjs` | — | +1 | 每 run 复位 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 543 | **≈312** | 子菜单迁出 + 数值分支收拢 |
| `thincoder-cli/src/tui/cmd-config-menus.mjs` | 新 | ≈233 | 四个子菜单工厂 |
| `thincoder-cli/src/tui/config-helpers.mjs` | 80 | ≈120 | 四纯函数 + `compactThresholdHint` |
| `docs/core/design/CORE-UNIFICATION.md` | — | 改 1 行 | `:575` 行数 + 拆分终态 |
| `docs/core/design/CONFIG.md` | — | 改 1 行 | `:73` 拆分计划指针 |
| `docs/core/design/TOOLS.md` | — | 改 1 行 | `:1427` config.mjs 现况读数 |
| `docs/core/design/CONTEXT-COMPACTION.md` | — | 改 §6.17 | D2 提示判据 |
| `docs/core/design/AGENT-LOOP.md` | — | 改 §6.6 | D1 判据句 |
| `docs/batches/2026-10-19-tech-sweep-code-judgment.test.mjs` | 新 | ≈150（收口删） | T1–T13 |

### ⑧ 关键决策记录（含被否方案）

| # | 决策 | 被否方案与理由 |
|---|---|---|
| D-S1 | C1 判据改为「实施后 ≤500（软线）」；「≤528」按实测 570 作废（源自 523 旧读数） | 保留 ≤528——起点就不成立；且与软线两个门只会有一个被看 |
| D-S2 | C1 拆两块（defaults ∥ normalize） | 只拆 normalize（≈486，余量 14 行）；只拆 DEFAULTS（≈492）——下一批再越线 |
| D-S3 | 导出名一个不变，靠 `config.mjs` re-export 维持公共面 | 让 34 个导入点改指向——机械改动跨 34 档，收益零、风险高 |
| D-S4 | C2 一步到位 | 分两批 = 同一档读两遍 + 两轮评审，第二步无独立验收 |
| D-S5 | 子菜单走工厂 + ctx 袋 | 顶层函数逐个传 8 参——签名易漂、调用点难读；工厂形同 `createConfigHelpers(agent)` |
| D-S6 | D1 独立计数器，不并入 `_touchedFiles` | 见 ⑤：五个下游消费者 + `hasCodeMutations` 误判 |
| D-S7 | D2 按状态分流文案、条件恒进 | 见 ⑥：`!auto` 拿走最该给 auto 用户的那半句；逐字恒发是空操作 |
| D-S8 | 数值项分支留主循环内，不迁出 | 迁出需把 `ac/tc/ctResolved/saveProxy/pushLine` 全打成参数——为 45 行分支新造 ctx 协议 = 无意义包装 |

### ⑨ 用例表（正常 / 边界 / 错误）

| # | 情形 | 输入 | 期望（机判） |
|---|---|---|---|
| T1 | D1 正常 | `batch append` 写临时批档 ×2 | `agent._batchWrites` 1 → 2 |
| T2 | D1 判据 | `_touchedFiles=[]`, `_batchWrites=1`, turn 8 | 注入串含 `something has been written` ∧ 不含 `nothing has been written` |
| T3 | D1 边界 | `_touchedFiles=[]`, `_batchWrites=0`, turn 8 | 含 `nothing has been written`（既有行为不变） |
| T4 | D1 边界 | `role:"eng-coder"`, `_batchWrites=3` | `designTurnReminder` 返回 `null` |
| T5 | D1 错误 | `batch append` 被拒（空文本 ∥ 段白名单外） | `_batchWrites` 不增（只在写盘成功后计） |
| T6 | D2 正常 | `compactThresholdHint(false)` | `" — 输入 auto 回到自动派生（删键）"` |
| T7 | D2 正常 | `compactThresholdHint(true)` | `" — 输入数值即固定为显式阈值"` |
| T8 | D2 边界 | 非 compact 数值项（`agent.maxTurns`） | 后缀 `""` |
| T9 | D2 端到端 | 驱动 `handleConfigCommand` 于显式阈值档 | 提问串含「输入 auto」 |
| T10 | C1 零回归 | `import * as m from config.mjs` | 导出键集与改前基线逐一相等 |
| T11 | C1 零回归 | `loadConfig()` 读含脏 `proxy`/`team`/`consultModels` 的 fixture | 归一结果逐字段与改前相等 |
| T12 | C2 零回归 | 四个纯函数从新落点 import | 返回值与改前相等（既有用例逐条搬） |
| T13 | C2 源锁 | `grep` 两档 | `cmd-config.mjs` 零子菜单定义残留；`cmd-config-menus.mjs` 零写面工具 |

### ⑩ 验收命令与期望读数（仓根 `thincoder/`）

| # | 命令 | 期望 |
|---|---|---|
| A1 | `node -e "for (const f of ['thincoder-core/config.mjs','thincoder-core/config-defaults.mjs','thincoder-core/config-normalize.mjs','thincoder-cli/src/tui/cmd-config.mjs','thincoder-cli/src/tui/cmd-config-menus.mjs','thincoder-cli/src/tui/config-helpers.mjs']) console.log(f, require('fs').readFileSync(f,'utf8').split('\n').length-1)"` | 两主档 ≤500（预测 418 / 312）· 新档 ≈90/100/233 · helpers ≈120 |
| A2 | `cd thincoder-cli && npm test` | 全绿 |
| A3 | `node --test docs/batches/2026-10-19-tech-sweep-code-judgment.test.mjs` | T1–T13 全绿 |
| A4 | 改前跑一次 `node -e "import('@thincoder/core/config.mjs').then(m=>console.log(Object.keys(m).sort().join(',')))"` 存基线 | 改后逐字相等 |
| A5 | `grep -rc "@thincoder/core/config.mjs" thincoder-cli thincoder-vscode thincoder-desktop thincoder-core` | 与改前相等（零导入点改动） |

### ⑪ 机械改 ∥ 需设计裁

- **机械改**（照单执行）：C1 两块迁出 + re-export；C2 四子菜单工厂化 + 纯函数迁出；D1 五处 `onWritten` 组合 + 三处生命周期配套；D2 `compactThresholdHint` + 调用点条件。
- **需设计裁**（本 §2 已裁死、评审可推翻）：D-S1（≤528 → ≤500）· D-S2（拆几块）· D-S6（不并入 `_touchedFiles`）· D-S7（文案分流）。

### ⑫ 上抛

1. `[上抛·待裁]` **C1 判据改口**：`CORE-UNIFICATION.md:575` 与 `TOOLS.md:1427` 的「≤528」源自 523 旧读数，实测已 570 ⇒ 本设计改为「≤500」。要保留 ≤528 作附加门，请回一句。
2. `[上抛·知会]` 台账读数漂移（520 ∥ 523 ∥ 实测 570；521 ∥ 实测 543）已在 ② 记明，登记面修正在 ⑦ 两行。

### ⑬ 补记（设计落盘后追加，同一轮内）

**A. C2 的真正回归面 = 设计档里的行号坐标**（⑦ 表只写了「受影响文件」，实际量大且必须同批改完，否则拆完即产生十份指针漂移）。下列设计档含 `thincoder-cli/src/tui/cmd-config.mjs:<行号>` 坐标，拆分后行号必移——实施轮逐条重指（改成 `config-helpers.mjs` / `cmd-config-menus.mjs` / 新行号）：

| 档 | grep 命中坐标 | 备注 |
|---|---|---|
| `docs/core/design/PROXY.md` | `:71` `:149` `:121` `:136-137` `:143` `:163` `:114` `:42` `:349` `:363` `:388` `:104`–`:114`（12 点） | 代理子菜单整块迁入 `cmd-config-menus.mjs`，全部重指 |
| `docs/core/design/MODEL-SPECS.md` | `:172-184` `:205` `:232` `:180` `:182`（5 点）；另 `:1208` 记「463 行」 | 会诊/effort 面；行数读数同批收正 |
| `docs/core/design/PROMPT-SYSTEM.md` | `:362` `:363` `:388-389` `:462` `:465`（5 点）；`:698` 行数；`:708`「509 行 ⇒ 无需拆分」 | 最后一句被本批推翻 ⇒ 改成拆分后读数与档名 |
| `docs/core/design/AGENT-PARAMS.md` | `:340` `:341` `:366` `:438`（4 点） | `maxTurns` 显示兜底四处 |
| `docs/core/design/API-CONTRACT.md` | `:9` `:22` `:30` `:35`（4 行） | 前三个函数迁入 `config-helpers.mjs`，条目路径随之改 |
| `docs/core/design/TEAM.md` | `:297` `:307`（2 点） | 派生条目过滤面（默认模型子菜单） |
| `docs/core/design/CONFIG.md` | `:245`–`:273`（2 点） | 并发池子菜单 |
| `docs/core/design/ESCALATE.md` | `:198`（1 点） | 候选池上限 5 |
| `docs/core/design/CONTEXT-COMPACTION.md` | 已改（本轮把四处读点行号改为「header ∥ 主菜单项 ∥ View full config ∥ 数值项编辑初值」） | 不再持行号 |
| `docs/core/design/CONSULTATION.md` | 0（只引档名） | 零改 |

判据：实施后 `grep -rn "tui/cmd-config.mjs:" docs/core/design` **零命中**。

**B. 本轮已落盘的设计档改动（状态档，当前态）**

| 档 | 改了什么 |
|---|---|
| `docs/core/design/CORE-UNIFICATION.md:575` | `config.mjs` 现况 523 → **570**；拆分计划写明两块外提 + 导出名不变 + 判据 ≤500（预测 ≈418） |
| `docs/core/design/CONFIG.md:73` | 本子系统行数指针补入 `config-defaults.mjs` ∥ `config-normalize.mjs` |
| `docs/core/design/TOOLS.md:1427` | `config.mjs` 现况 523 → **570**；「≤528 判据成立」句删除；拆分改为指向 §2.8.1 第 1 行 |
| `docs/core/design/AGENT-LOOP.md` §6.6 | `wrote` 判据改为 `_touchedFiles ∪ _batchWrites`；边界句改为「看得见写过文件与批次档，看不见内容对不对」；新增一条 `batch` 写面机判 |
| `docs/core/design/CONTEXT-COMPACTION.md` §6.17 | 提问行改两档分流文案 + 理由 + 实现落点；四处读点去行号；删去两处「本批零改」过程语（规范面不带批次语） |

**C. 设计侧自检读数（三条交叉核对）**

1. 坐标 ↔ 标题：本 §2 引用的档/节全部存在（`CORE-UNIFICATION.md` §2.8.1 · `CONFIG.md` §5 · `TOOLS.md` §6.23 ⑧ · `AGENT-LOOP.md` §6.6 · `CONTEXT-COMPACTION.md` §6.17）。
2. 表行 ↔ 汇总数：⑬-A 每行「grep 命中坐标」数 = 该行列出的坐标数（12/5/5/4/4/2/2/1/0/0）；共 10 档，9 有坐标 + 1 零改。
3. 断言 ↔ 实测：两档行数 570 / 543 为 `node -e` 计 `\n` 实测；其余「≈」为设计预测，实施轮以 ⑩-A1 复测。

### ⑭ 修正轮（评审 8 条 · 父侧全部接受 · 2026-10-19）

**载体声明（供下次评审一次装齐）**：本批设计载荷 = **本档 §2**（C1/C2/D1/D2 四笔设计正文）∪ **`docs/core/design/AGENT-LOOP.md` §6.6**（D1 `wrote` 判据）∪ **`docs/core/design/CONTEXT-COMPACTION.md` §6.17**（D2 提示条件与文案）∪ **`docs/core/design/CONTEXT-COMPACTION.md` §6.16.9**（C1 拆分立场的单源）。只声明 §6.17 的评审只覆盖 D2；C1/C2/D1 必须以本节＋上述两节同时在场才算评过。

**改动档清单（现行 = 盘上实读 2026-10-19 · `wc -l` 口径 ∥ Δ = 设计预期）**

| 档 | 现行 | Δ | 说明 |
|---|---|---|---|
| `thincoder-core/config.mjs` | 570 | ≈418 | 两块迁出 + 两条 import/re-export |
| `thincoder-core/config-defaults.mjs` | 新 | ≈90 | `DEFAULTS` |
| `thincoder-core/config-normalize.mjs` | 新 | ≈100 | 归一/清洗 helpers + 两枚警告旗 |
| `thincoder-core/agent-tools/batch.mjs` | 344 | +4 | `onWritten` 组合函数 |
| `thincoder-core/agent/post-turn.mjs` | 104 | +1 | `wrote` 判据 |
| `thincoder-core/agent/helpers.mjs` | 492 | +1 | `INHERITED_GUARD_KEYS` 增键 |
| `thincoder-core/agent.mjs` | 105 | +1 | `_batchWrites` 初值 |
| `thincoder-core/agent/run-start.mjs` | 158 | +1 | 每 run 复位 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 543 | ≈312 | 子菜单迁出 + 数值分支收拢 |
| `thincoder-cli/src/tui/cmd-config-menus.mjs` | 新 | ≈233 | 四个子菜单工厂 |
| `thincoder-cli/src/tui/config-helpers.mjs` | 79 | ≈120 | 四纯函数 + `compactThresholdHint` |
| `docs/core/design/CORE-UNIFICATION.md` | 1001 | ±1 行 | §2.8.1 第 1 行（570 / 两块外提 / ≤500） |
| `docs/core/design/CONFIG.md` | 201 | ±1 行 | `:73` 子系统行数指针补两新档 |
| `docs/core/design/TOOLS.md` | 1551 | ±1 行 | `:1427` 现况 570 + 拆分计划指针 |
| `docs/core/design/CONTEXT-COMPACTION.md` | 762 | §6.16.9 + §6.17 | 拆分立场改实形（C1 单源）· 提示文案与用例（D2） |
| `docs/core/design/AGENT-LOOP.md` | 520 | +2 行 | §6.6 `wrote` 判据 |
| `docs/batches/2026-10-19-tech-sweep-code-judgment.test.mjs` | 新 | ≈150（收口删） | T1–T13 |

口径说明：本表取代 ⑬-B 的「本轮已落盘的设计档改动」表——`CONTEXT-COMPACTION.md` 的那一行**补入 §6.16.9**（⑬-B 只列了 §6.17，这正是评审 🔴1 指出的缺口）。⑬-B 表里 `CONTEXT-COMPACTION.md` 的行按本表读。

**8 条逐条处置**

| # | 级 | 处置 | 改动 `file:line` |
|---|---|---|---|
| 1 | 🔴 | `§6.16.9` 拆分立场重写为 C1 实际形态（两新档 + re-export 保导出面 + 拆后 ≈418 + ≤500 判据）；「过 650 行」触发与 `context-budget` 预案删除；`:572` 读数改 570 | `docs/core/design/CONTEXT-COMPACTION.md:572`–`:577` |
| 2 | 🟡 | 载体声明（本段开头）——设计载荷三处一次装齐 | `docs/batches/2026-10-19-tech-sweep-code-judgment.md` §2 ⑭ 开头 |
| 3 | 🟡 | 逐档读数按盘面实读重写（config 570 · agent-tools/context 181 · run-stages 330）；同拍纠正 `§6.16.8` 的 169 → 181；每档「现行 + Δ」表见上 | `docs/core/design/CONTEXT-COMPACTION.md:567` · `:572`–`:574` |
| 4 | 🟡 | 用例表补 R14（auto 档句子在 ∧ 另一句不在）· R15（显式档同式）· R16（端到端装配行逐字） | `docs/core/design/CONTEXT-COMPACTION.md:720`–`:722` |
| 5 | 🟡 | 先例行补入：先例 `cmd-config.mjs:283` 并发池提问后缀 ∥ `compactThresholdSuffix`（同 `auto` 旗驱动文案分支）+ 对齐/偏离各一句 | `docs/core/design/CONTEXT-COMPACTION.md:675`–`:676` |
| 6 | 🔵 | 删除「本批不拆」（随 🔴1 重写）；「CLI 侧零代码改动（核装配面自动生效）」改为常驻陈述「CLI 侧无独立实现面」 | `docs/core/design/CONTEXT-COMPACTION.md:575`（旧句已删）· `:580` |
| 7 | 🔵 | 装配形逐字：分隔符 = 空格 + `—` + 空格，挂点 = `current: <值>` 之后、闭括号之前；三档字面（auto ∥ 显式 ∥ 非 compact） | `docs/core/design/CONTEXT-COMPACTION.md:671`–`:674` |
| 8 | 🔵 | 四处读点拆后归属：**全部留在 `cmd-config.mjs` 主循环脊柱**（header 行 ∥ 主菜单项 ∥ View full config 分支 ∥ 数值项编辑初值）；四个子菜单内无一处读 `compactThresholdResolved` | `docs/core/design/CONTEXT-COMPACTION.md:664` |

**新增设计内容（随修正落盘的当前态）**

- 提问行两档互斥文案 + 装配字面（`:668`–`:674`）——此前只给句子不给挂点，验收无法钉字符串。
- 用例 R14–R16（`:720`–`:722`）——D2 的机判形。
- 四处读点在 `cmd-config.mjs` 拆分后的归属句（`:664`）——拆完不再漂一次。

**本轮未做**：不改代码 · 不动 §3 评审段 · 不动其它批次档。

### ⑮ 修正轮 2（评审 11 条 · 🔴1 / 🟡7 / 🔵3 · 父侧全部接受 · 2026-10-19）

**载体声明（本轮修订）**：本批设计载荷 = 本档 §2 ∪ **`docs/core/design/CONTEXT-COMPACTION.md` 全文**（本轮 11 条全部落在该档，且 §6.14 / §6.16.8 / §6.16.9 / §6.16.10 / §6.17 / §7 六处互指）。只声明 §6.17 的评审只覆盖 D2；只看 §6.16.9 的评审只覆盖尺寸面。

**11 条逐条处置**（编号 → 改动 `file:line`；行号为改后读回值）

| # | 级 | 处置 | 改动 `file:line` |
|---|---|---|---|
| 1 | 🔴 | `tool_choice` 两条活处方去一：删净「随带 `toolChoice:"none"`」处方与四 transport 能力核，改立「不抑制 tool call」一条（理由 = 该参数致服务端丢弃 tools 区）；`:287` 退化面去掉「不发 `tool_choice`」形 | `docs/core/design/CONTEXT-COMPACTION.md:281`–`:284`（原 `:281`–`:287`） |
| 2 | 🟡 | D-CC20 否决清单末项移出，单列「已采纳（实施轮 S3 实测翻转）」；被否决面改写为「带 tools **且随** `tool_choice`（抑制形）」 | `docs/core/design/CONTEXT-COMPACTION.md:769` |
| 3 | 🟡 | 用例 ID 加命名空间：§6.16.10 → `RG1`–`RG4`（+ 新增 `S6`）；§6.17 → `RB1`–`RB16`，表内互指同步（`RB4 同档` / `同 RB9` / `对照 RB12`）；`:325` 悬空指称改为可解析坐标（§6.16.10 ∥ §6.17 ∥ 需求档 F-CC1–F-CC5） | `:633`–`:637` · `:727`–`:742` · `:325` |
| 4 | 🟡 | 补 `S6`：钉 `Request budget:` 行逐字（`explicit` / `spec` / `absent` 三支）+ 两距离带符号 + 复算等值 | `docs/core/design/CONTEXT-COMPACTION.md:633` |
| 5 | 🟡 | 取父侧方案①：§6.16.9 改「现况 + Δ + 改动要点」表（18 行，补齐 `cmd-config.mjs` / `config-helpers.mjs` / 四 transport / `model-specs.mjs` / `explore-distill.mjs` / `compress-form.mjs` / `ide.mjs` / 测试档） | `docs/core/design/CONTEXT-COMPACTION.md:567`–`:590` |
| 6 | 🟡 | 尺寸论证以一个基线重算：拆前 ≈328（回推）→ 迁出 110 → 新增 43 → 拆后实读 261（`wc -l`，本机实读）；「不分拆」= **449（推算，基线 261，2026-10-19）**，未越 500 软线；**549/495 旧链退场**，拆分依据改为「职责边界 + 余量」 | `docs/core/design/CONTEXT-COMPACTION.md:562`–`:563` · `:579`–`:580` |
| 7 | 🟡 | 删「软线 300 之上 = 既有事实」整句；「500 咨询线」改「500 软线」——全档「软线」唯一定义 = 500 | `docs/core/design/CONTEXT-COMPACTION.md:554` · `:562` · `:577` |
| 8 | 🟡 | 读数单源 = §6.16.9：§6.14 去 24 / 261、§6.16.8 去 188 / 181、§6.16.6 去 144，改指针 | `:305`–`:307` · `:529` · `:556` · `:565` |
| 9 | 🔵 | 索引区间改写 `split.headEnd ≤ i < tailStart`，并注明 KEEP_HEAD = 0 ⇒ `headEnd = 0` | `docs/core/design/CONTEXT-COMPACTION.md:466` |
| 10 | 🔵 | 标题「三档落值」→「两档落值」（表只两行） | `docs/core/design/CONTEXT-COMPACTION.md:669` |
| 11 | 🔵 | 评审局限登记：需求档 / `CORE-UNIFICATION.md` §2.8 / 源码行数不在上轮评审范围 ⇒ 需求覆盖与准则 8 盘上核对两处 `unverified` | 本行（登记面） |

**四 transport `tool_choice` 能力核（自设计面移出的历史面 · 只作记录，不作处方）**：OpenAI 通路 `thincoder-core/provider/core.mjs:214`（`body.tool_choice`）· Anthropic `thincoder-core/provider/anthropic.mjs:62`（`{type:"none"}`，`:20`）· Gemini `thincoder-core/provider/google.mjs:101-102`（`{mode:"NONE"}`，`:16`）· Responses `thincoder-core/provider/responses.mjs:221`——能力在，但**不采用**（实测致服务端丢弃 tools 区）。

**重算后的尺寸基线串（`thincoder-core/context.mjs`，`wc -l` 口径）**

- 拆前 **≈328**（回推：拆后实读 − 新增 43 + 迁出 110）→ 迁出 **110**（三区间 20 + 22 + 68）→ 新增 **43**（context.mjs 侧）→ 拆后实读 **261**（本机实读 2026-10-19）。
- 若不分拆（**推算值**，基线 = 拆后实读 261，2026-10-19）= 261 + 110 + 78 = **449**，未越 500 软线（余量 51）。
- 结论：**拆分不以越线为据**；依据 = 职责边界（`token-window.mjs` 计量 / 窗口 / 边界单族）+ 余量（不分拆 51 vs 拆后 239）。

**本轮新增设计内容（随修正落盘的当前态）**

- `S6`（`:633`）——`Request budget:` 行的机判形，此前字面有、断言无。
- §6.16.9 的 Δ 列与 18 行档表（`:567`–`:590`）——此前只有 6 条现况读数、无 Δ。
- 拆分立账与「不分拆」推算值（`:579`–`:580`）——此前 `495 / 616` 与实读 261 互斥。

**本轮未做**：不改代码 · 不动 §3 评审段（两轮已写）· 不动其它批次档。

**上一轮坐标漂移登记**：⑭ 处置表第 4 行写的 `R14–R16`（`:720`–`:722`）本轮改名为 `RB14`–`RB16`（现 `:740`–`:742`）；⑭ 行内其余 `file:line` 为当轮读数，本轮改动后位置已移，以本 ⑮ 表为准。

**⑮ 更正（同轮 · 手误）**：处置表第 6 行「549/495 旧链退场」应为「**495 旧链退场**」——`549` 为手误，档内无此读数。另：本批 `doc_check(mode:"gate")` 在本会话返回 `ERROR（引擎已更新：tool-docs/doc_check.md mtime 晚于进程启动）`，**未取得 PASS 首行**；已按同一两项判据手工复核交付档（非表格行超 300 字 = 0 条；`*.md` 指针与 `§N` 节号 = 16 个引用全部解析）——**正式 gate 需重启会话后由主 agent 复跑**。

### ⑯ 修正轮 3（坐标重指 · 拆分后行号漂移全量收口 · 2026-10-19）

**任务面**：C1/C2 拆分落盘后，设计档里的行号坐标全漂。本段只做重指——不改语义、不改行数读数、不碰 §5。

**判据**：`grep -rn "tui/cmd-config.mjs:" docs/core/design` 的每条命中，逐条给出「旧形 → 新形」并核对新坐标确实指向原语句（落盘后实读，非整批替换）。

#### ① 九档逐条（旧形 → 新形；新坐标均对源码实读核对过）

| 档 | 旧形 | 新形 |
|---|---|---|
| `API-CONTRACT.md:144` | `cmd-config.mjs:9`（`embeddingPatch`） | `config-helpers.mjs:20` |
| `API-CONTRACT.md:145` | `cmd-config.mjs:22`（`poolCur`） | `config-helpers.mjs:33` |
| `API-CONTRACT.md:146` | `cmd-config.mjs:30`（`effortMenuLevels`） | `config-helpers.mjs:40` |
| `API-CONTRACT.md:147` | `cmd-config.mjs:35`（`handleConfigCommand`） | `cmd-config.mjs:7` |
| `PROXY.md:18` | `config.mjs:261` / `config.mjs:385` | `config-normalize.mjs:78` / `config.mjs:287` |
| `PROXY.md:83` | `cmd-config.mjs:71`（`injectProxy` 调用） | `cmd-config.mjs:45` |
| `PROXY.md:84` | `cmd-config.mjs:149`（Test connection 探针） | `cmd-config-menus.mjs:58` |
| `PROXY.md:87` | `cmd-config.mjs:121`（`web` 切换） | `cmd-config-menus.mjs:50` |
| `PROXY.md:96` | `:136-137` / `:143` / `:163` | `cmd-config-menus.mjs:45-47` / `:52` / `:72` |
| `PROXY.md:108` | `:114`（`proxyMenu`）· `:118`–`:124` | `cmd-config-menus.mjs:22`（`createProxyMenu`）· `:28`–`:34` |
| `PROXY.md:109` | `:67`–`:98` · `:106`–`:111` | `cmd-config.mjs:41`–`:75`（`reloadConfig`）· `:83`–`:88`（`saveProxy`） |
| `PROXY.md:111` | `cmd-config.mjs:42`；消费 `:349` ∥ `:363` ∥ `:388` | `cmd-config.mjs:16`；消费 `:125` ∥ `:142` ∥ `:170` |
| `PROXY.md:126` | `config.mjs:261` · 调用 `:385` | `config-normalize.mjs:78` · `config.mjs:287` |
| `PROXY.md:138` | `cmd-config.mjs:104`–`:114` | `cmd-config-menus.mjs:22`–`:79` |
| `AGENT-PARAMS.md:32` · `:63` | `:340` / `:341` / `:366` / `:438`（四处 `?? 200`） | `cmd-config.mjs:125`（状态头）/ `:126`（菜单项）/ `:155`（详情行）/ `:260`（编辑初值） |
| `CONFIG.md:92` | `cmd-config.mjs:245`–`:273`（并发池子菜单） | `cmd-config-menus.mjs:160`–`:191` |
| `CONTEXT-COMPACTION.md:695` | `cmd-config.mjs:283`（并发池提问后缀） | `cmd-config-menus.mjs:178` |
| `MODEL-SPECS.md:151` | `cmd-config.mjs:172-184`（`:180` / `:205`） | `cmd-config-menus.mjs:84-93`（读点 `:87`）；`none` 去重形 = `config-helpers.mjs:40-42` |
| `MODEL-SPECS.md:1186` | `cmd-config.mjs:205/:232`（只认 `=== "none"`） | `cmd-config-menus.mjs:117/:144` |
| `MODEL-SPECS.md:1190` | `cmd-config.mjs:180`（抽纯函数） | `config-helpers.mjs:40` |
| `MODEL-SPECS.md:1803` | `cmd-config.mjs:182`（`reasoningEffortEnum` 读点） | `cmd-config-menus.mjs:87` |
| `TEAM.md:54` | `cmd-config.mjs:297/:307`（provider 列表过滤） | `cmd-config-menus.mjs:204/:214` |
| `ESCALATE.md:106` | `cmd-config.mjs`（上限 5 条 `:198`） | `cmd-config-menus.mjs`（上限 5 条 `:110`） |
| `PROMPT-SYSTEM.md` | ⑬-A 预估 5 点 | **实读 0 命中**——该档无 `tui/cmd-config.mjs:` 坐标 |

#### ② 改后 `grep -rn "tui/cmd-config.mjs:" docs/core/design` 命中清单（5 条，全为真坐标）

| 档:行 | 坐标 | 指向 |
|---|---|---|
| `AGENT-PARAMS.md:32` | `cmd-config.mjs:125` · `:126` · `:155` · `:260` | 四处 `?? 200`（状态头 / 菜单项 / 详情行 / 编辑初值）✓ |
| `AGENT-PARAMS.md:63` | 同上表行 | 同上 ✓ |
| `API-CONTRACT.md:147` | `cmd-config.mjs:7` | `handleConfigCommand` ✓ |
| `PROXY.md:83` | `cmd-config.mjs:45` | `reloadConfig` 内 `injectProxy(cfg.providersList, cfg)` ✓ |
| `PROXY.md:109` | `cmd-config.mjs:41`–`:75` · `:83`–`:88` | `reloadConfig` ∥ `saveProxy` ✓ |

`cmd-config.mjs` 作**模块名**出现的处（`CONSULTATION.md` · `MULTI-INSTANCE-COLLAB.md:266` 的写点枚举 · `MODEL-SPECS.md` 两处无行号名）零改。

#### ③ `config.mjs:` 同族漂移（`thincoder-core/config.mjs` 570 → 407）——已一并重指

| 档:行 | 旧形 | 新形 |
|---|---|---|
| `ADVISOR-GUARDS.md:345` | `config.mjs:122-129` | `config.mjs:116-120` |
| `AGENT-PARAMS.md:18` · `:59` | `config.mjs:335`（advisor promote） | `config.mjs:323` |
| `AGENT-PARAMS.md:19` · `:60` | `config.mjs:49`（advisor 默认块） | `config-defaults.mjs:32` |
| `AGENT-PARAMS.md:24` · `:46` · `:61` | `config.mjs:36`（`maxTurns`） | `config-defaults.mjs:18` |
| `AGENT-PARAMS.md:33` · `:47` | `config.mjs:40`（`goalTurns`） | `config-defaults.mjs:22` |
| `API-CONTRACT.md:1093` | `config.mjs:26`（model-ref 导出） | `config.mjs:25` |
| `API-CONTRACT.md:1094` | `config.mjs:27`（config-io 导出） | `config.mjs:26` |
| `API-CONTRACT.md:1095` | `config.mjs:29`（`writeConfigAtomic`） | `config.mjs:28` |
| `API-CONTRACT.md:1096` | `config.mjs:33`（`DEFAULTS`） | `config-defaults.mjs:15` |
| `API-CONTRACT.md:1097` | `config.mjs:115`（model-specs 导出） | `config.mjs:41` |
| `API-CONTRACT.md:1098`–`:1102` | `:130` `:142` `:153` `:166` `:183` | `:59` `:70` `:116` `:126` `:143` |
| `API-CONTRACT.md:1103`–`:1104` | `:235` `:240`（两清洗函数） | `config-normalize.mjs:53` `:58` |
| `API-CONTRACT.md:1105` | `:264`（`findProvider`） | `config.mjs:175` |
| `API-CONTRACT.md:1106`–`:1107` | `:275` `:286`（`normalizeProxy` ∥ `normalizeTeamSection`） | `config-normalize.mjs:78` `:89` |
| `API-CONTRACT.md:1108`–`:1109` | `:315` `:462` | `config.mjs:192` `:346` |
| `CONFIG.md:90` | `config.mjs:63`（`poolLimits` 三键） | `config-defaults.mjs:46` |
| `CONTEXT-COMPACTION.md:300` | `config.mjs:183-196` | `config.mjs:143-156` |
| `CONTEXT-COMPACTION.md:720` | `:130-134` · `:142-146` · `:153-160` | `:59-62` · `:70-74` · `:116-120` |
| `CONTEXT-COMPACTION.md:781` | `config.mjs:125-129`（已删注释） | 死指针删除，改常态陈述「注释曾把该带记为 accepted……已删净」 |
| `CORE-UNIFICATION.md:657` | `:24-25` / `:66-74` / `:493` / `:266-273` · `:470-496` | `:17` / `config-defaults.mjs:23-24` / `config-io.mjs:75` / `config.mjs:203-211` · `config-io.mjs:78` |
| `DOC-MIGRATION.md:29` | `config.mjs:36` | `config-defaults.mjs:18` |
| `DOC-MIGRATION.md:50` | `config.mjs:63` | `config-defaults.mjs:46` |
| `MEMORY.md:464` | `config.mjs:66`（`memory.dbPath`） | `config-defaults.mjs:59` |
| `MODEL-SPECS.md:84` `:115` `:158` | `:135` / `:133`（qwen 门） | `:146` |
| `MODEL-SPECS.md:465` | `:136`（主机门控） | `:147` |
| `MODEL-SPECS.md` 六处 | `:133-140` | `:143-156` |
| `MODEL-SPECS.md` 三处 | `:183-196` | `:143-156` |
| `MODEL-SPECS.md:922` `:1793` | `:153-159`；`COMPACT_RATIO` `:123` | `:116-120`；`:51` |
| `MODEL-SPECS.md:1794` | `:130-134`（`outputReserve`） | `:59-62` |
| `MULTI-INSTANCE-COLLAB.md:266` | `config.mjs:29`（export） | `config.mjs:28` |
| `PROMPT-SYSTEM.md:562` | `config.mjs:329`（合并面） | `config.mjs:220` |
| `PROMPT-SYSTEM.md:686` | `config.mjs:69-70`（`injectProjectRules` 邻位） | `config-defaults.mjs:54-55` |
| `PROVIDER.md:209` | `:183-196` | `:143-156` |
| `PROVIDER.md:374` | `:167` / `:150` | `:143` / `:126` |
| `PROVIDER.md:441` | `:328-335` | `:296-303` |
| `PROVIDER.md:470` · `:473` | `:337`（`providerInvalidReason`） | `:301-303` |
| `PROVIDER.md:460` | `:11`（apiKey 判据注释） | **不变**（同文件同注释，`:11` 实读一致） |
| `SESSION.md:730` | `config.mjs:332`（`resolveProviderPlan`） | `config.mjs:296` |
| `SETTINGS-TOOL.md:127` | `writeConfigAtomic` `:29`；「DEFAULTS / configPath 同档」 | `:28`；`DEFAULTS` 改指 `config-defaults.mjs:15` |
| `SETTINGS-TOOL.md:129` | `:257`（defaultModel 非串→null） | `:216` |
| `TOOLS.md:1305` | `:434`（`providersList`） | `:322` |
| `TOOLS.md:1317` | `:90-93`（`websearch.backend`） | `config-defaults.mjs:73-78` |

`thincoder-server/src/ops/config.mjs:*` · `thincoder-cli/src/config.mjs` · `thincoder-vscode/src/config.mjs` · `embed-config.mjs` 系同名异档，**不受拆分影响，零改**。

#### ④ 行数

本轮 18 档为**坐标替换**，净增 0 行（两处为同长替换 + 一处死亡指针改写为常态陈述）。涉及源档行数无改动。

#### ⑤ 遗留（非坐标面 · 待父侧裁）

- 行数**读数**（非坐标）仍是拆前值：`CORE-UNIFICATION.md:575`（config.mjs 570）、`TOOLS.md:1427`（570）、`CONTEXT-COMPACTION.md` §6.16.9 表的拆后预测（418 / 312 / 233 / 120）与实读（407 / 304 / 245 / 129）不符。属「现况读数收正」面，本段未动。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审（批 C+D · 设计面）

评审对象（机械声明）：类型 = design ∥ 目标 = 批 C+D · `#1612` config.mjs 拆两块（导出面零变）∥ `#1674` cmd-config 一步拆 ⌘ `#1677` `wrote` 判据新增 `_batchWrites` ⌘ `#1679` 提示条件改 isCompact + 文案分流 ∥ 状态 = 待评审。
评审档（声明面）= `docs/core/design/CONTEXT-COMPACTION.md`（全文实读，751 行）。源文件未读（声明面外）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | `CONTEXT-COMPACTION.md:575` 仍把 config.mjs 拆分立场的单源写成「拆分立场 = 不拆」（>650 触发 · 预案 = 四件迁 `context-budget.mjs`），与本轮 C1（`#1612` config.mjs 拆两块：`config-defaults.mjs` + `config-normalize.mjs`，留档 ≈418）相反；:577 又声明「档位与拆分立场以本档内口径为单源」⇒ 设计层给实现者的指令与批次相反，且该行不在本轮改动档清单（`docs/batches/2026-10-19-tech-sweep-code-judgment.md:186-190`，声明面外仅指针）⇒ 拆完后矛盾行仍在 | 把 :575 改成 C1 实形（两块外提 + 经 re-export 维持导出面、拆后 ≈418、判据 ≤500），删「拆分触发 = 过 650 行」与 `context-budget` 预案；把 §6.16.9 补进本轮改动档清单；:572 reading 同批对齐盘面 |
| 2 | Requirements / scope | 🟡 | 声明面只有一档，而四笔中仅 D2（`#1679`）在该档有设计文本（:665-:670）；C1 只以与批次相反的 :575 出现，C2 只以坐标引用出现（:658/:661/:670），D1（`_batchWrites`）零出现。其设计文本在声明面外（仅指针、本实例未评审）：`docs/batches/2026-10-19-tech-sweep-code-judgment.md:18-21/66-88` · `docs/core/design/AGENT-LOOP.md:337-352` | 把批次设计档 + `AGENT-LOOP.md` §6.6 纳入评审面（或以它们重发评审）后再让写闸覆盖 C1/C2/D1；本实例的通过结论只覆盖 §6.17 |
| 3 | Size annotations (判据 8) | 🟡 | 声明面无 C1/C2 各档的现况行数 / Δ 行（:571 明示「本档不重复」把表推给批次档）；:572 记 config.mjs **528**（as of 2026-10-18 19:55）与盘面 570 不符，:575 的「改后 ≈565」继承同一基数。声明面外不可核（源文件未读） | 实施起轮按盘重读行数，把现况 + Δ 落到拥有该主题的档（含新档两行）；删掉 528 / ≈565 这条过期推算链 |
| 4 | Acceptance criteria | 🟡 | §6.17 用例表 R1–R13 无 `#1679` 的机判形：没有一条钉「哪一档出哪一句」、也没有一条钉条件已由 `ac.compactThresholdAuto` 改为项身份（两档都追加）。R12 只走写回、R13 只走报错行射程 | 补两档各一条（本档句子在场 ∧ 另一句不在场），加一条端到端断言钉装配后的提问串 |
| 5 | Closest-precedent (判据 9) | 🟡 | `#1679` 的提示文案分流无先例行、也无「无先例」显式声明，而本档其余机制都带（:62 先例行② · :509 先例行① · :691 先例行③） | 为该提示补先例行（实现坐标 ∥ 对应设计节 ∥ 对齐/偏离理由），或显式声明无先例 |
| 6 | Doc hygiene | 🔵 | :575「本批不拆」· :578「CLI 侧零代码改动」是批次语落在一档子系统设计档的规范面——正是本轮改动档清单要求从 §6.17 删掉的那一类 | 改写成常态陈述或删去；批次范围归批次档 |
| 7 | Clarity | 🔵 | :665 把两句提示称「逐字」，但未给装配形态（分隔符 / 相对 `current:` 的挂点），两处实现都能自称合规却产出不同串 | 给出装配后的提问行字面（或分隔符 + 挂点），使验收可钉一个字符串 |
| 8 | Clarity / coordination | 🔵 | :661 的四处读点与 :670 的共用报错句只按名指（去行号——合规），但未说明其中是否有落在 C2 将迁往 `cmd-config-menus.mjs` 的子菜单内；C2 拆后若有一处在菜单工厂里，本档坐标再漂一次（unverified：菜单归属未在声明面给） | 逐处补一句落点（`cmd-config.mjs` 数值分支 ∥ `cmd-config-menus.mjs` 某工厂），或明示「四处均在留下的主干」 |

已核通过面：勘察证据行在场（:42-:43——查过需求档 / 设计树 ∥ 独立公共文档仓 = 无 `PROJECT-MANIFEST.json:54`）；`#1679` 目标态（:665 两档追加 + 按 `compactThresholdAuto` 分流、:666 实现落 `config-helpers.mjs`、:667 理由、:669/:670 报错行与射程、R13）与批次 D2 一致；`TUI-COMMANDS.md:135` 以「三档落值 = CONTEXT-COMPACTION.md §6.17，本档不重述」让权 ⇒ 该主题单源成立、无重复描述。

限制：未声明项目标准档、无文档地图 ⇒ 方法论合规按 AGENTS.md + 评审判据判；源文件行数未抽核（声明面外）。

**计数**：🔴 1 · 🟡 4 · 🔵 3

VERDICT: changes-required

### 轮次 2（评审子代理）

## 轮次 2 复核（批 C+D）· 设计评审

评审对象 = `CONTEXT-COMPACTION.md`（design，待评审）。范围外未读（源码行数读数、`CORE-UNIFICATION.md` §2.8 受影响文件总表、需求档 F-CC1–F-CC5）⇒ 本轮所有盘上读数在报告中记 `unverified`。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership（机制级矛盾） | 🔴 | §6.14 对「压缩请求是否随带 `tool_choice`」并存两条活处方：`:281`「同调用随带 `toolChoice: "none"`」（`:287` 退化面同款「不发 `tool_choice`」同源）vs `:300`「带 tools、**不随** `tool_choice`」，且 D-CC20（`:749`）把「不抑制 tool_call」记为已采纳。按 `:281` 实现即触发本档自述的「服务端丢弃 tools 区」⇒ `:301` 的命中率结论（92.86%/93.65%）反向失效；读者无法判断哪一份是权威。 | 删净 `:281`–`:287` 的 tool_choice 处方（四 transport 能力核留批记录历史面），本档只保留 `:296`/`:300` 的落定形；§6.15 表（`:349`）与 D-CC20 ⑤ 同步对齐为「不发 tool_choice」。 |
| 2 | Document ownership | 🟡 | D-CC20（`:749`）的**否决**清单末项为「⑤ 带 tools 但不抑制 tool_call（**已采纳**」——已采纳项列在否决清单内，⑤ 到底被否还是被采无从判定。 | 把 ⑤ 从否决清单移出单列「已采纳（实施轮 S3 实测翻转）」；被否决面改写为「带 tools 且随 `tool_choice`」。 |
| 3 | Acceptance / Clarity | 🟡 | 用例 ID 在本档内撞名：§6.16.10 用 `R1`–`R4`（注册单源 / 双端表 / 三操作可达 / 零回归），§6.17 用例表又用 `R1`–`R16`（`requestBudget` 各档）——同一 `R1` 指两组不同断言；另 `:328` 引用「用例 1–8 · AC1–AC7」，本档无此编号（悬空指称）。 | 给两套编号加命名空间（如 §6.16.10 → `RG1`–`RG4`，§6.17 → `RB1`–`RB16`）；`:328` 的「用例 1–8 · AC1–AC7」要么内联，要么给可解析的档+节坐标。 |
| 4 | Acceptance | 🟡 | §6.16.4（`:484`）新增用户可见字面 `Request budget: …`（`not sent` / `absent` / 带符号两距离），`:689` 声明其字面单源即该块——但 §6.16.10 `S1`–`S5` 与 §6.17 `R1`–`R16` 无一条断言该行（含 `absent` 支与负距离）。 | 补一条用例：钉 `Request budget:` 行逐字（`explicit` / `spec` / `absent` 三支各一形）+ `to compaction line` / `to window limit` 两距离的符号与复算等值。 |
| 5 | Affected-file annotations（准则 8） | 🟡 | §6.16.9（`:572`-`:574`）只给 6 档现况读数、**无 Δ 列**、也未说每档改什么；本批确要动的多处不在表内：`cmd-config.mjs`（`:664` 要**拆两档**，但无现况行数、无拆后预估——拆分子计划只有「四子菜单迁出」）、`config-helpers.mjs`、`provider/core.mjs` / `anthropic.mjs` / `google.mjs` / `responses-request.mjs`（`:640`/`:647` 四装配面改读 `maxTokens`）、`model-specs.mjs`、`explore-distill.mjs`、`compress-form.mjs`（`:308` 有 24 行但不在表内）、`thincoder-vscode/src/tools/ide.mjs`（`:532` 有 144 行但不在表内）、测试档。`:571` 又把 Δ 与「零改动逐处核实」声明为「本档不重复」并外指 `CORE-UNIFICATION.md` §2.8（本轮不可读 ⇒ `unverified`）。 | 二选一：① 本档补齐 Δ（`≤±N` / 结构不变）与每档改动要点，含 `cmd-config.mjs` 的现况行数 + 拆后两档预估；② 本档只留指针、删掉这 6 条读数以免第 8 条的分叉（权威表在 §2.8 时须在批记录可核）。 |
| 6 | Clarity / 数值漂移 | 🟡 | §6.16.8 的尺寸论证自相矛盾：`:565` 同一行既写「不拆则 ≈495 + 121（= 43 + 78）≈ 616 > 500」，又写「现盘实读 = 261 行」。按本档自述的迁移/新增量反推（495 − 110 迁出 + 43 新增）应为 ≈428，与 261 差 167 行；若 261 为准，则「不拆则 ≈616」应为 ≈449（未越 500）⇒「拆分决策即由此触发」失去依据。 | 以一个基线读数重算该段：给出「拆前实读 X → 迁出 110 → 新增 43 → 拆后 Y」，并把「若不分拆」的推算标为推算值（注明基线与日期）；`495` 或 `261` 之一必须退场。 |
| 7 | Doc hygiene | 🟡 | `:565` 括注「≤500 ✓；软线 300 之上 = 既有事实，非新增面」——261 行未越 300，该断言为假；且本档其它处（`:577` / `:579`）把 **500** 称「软线」，同一档两个「软线」定义。属拆前状态的残留表达式。 | 删除「软线 300 之上 = 既有事实，非新增面」整句；若确有 300 行咨询线，另立一处定义并在 `:577`/`:579` 统一措辞。 |
| 8 | Document ownership | 🟡 | `:571` 声明「逐文件现况行数 / Δ / 尺寸档状态注 … 本档不重复（§6.15 曾因两处逐行重复出现读数分叉，本面取同一纪律）」，但同一组读数仍在本档三处并存：§6.14（`:309` `261` 行）/ §6.16.8（`:557`、`:559`、`:565`、`:567`）/ §6.16.9（`:572`-`:574`）——正是该句自称要避免的分叉面。 | 选一处为唯一读数源（建议 §6.16.9），其余处改为「读数 = §6.16.9 单源」指针；`compress-form.mjs` 24 行、`ide.mjs` 144 行同法归并。 |
| 9 | Clarity | 🔵 | §6.16.3（`:469`）合格集条件②写作「`i < split.headEnd…tailStart` 边界内」，索引区间写法不可读（本意应为 `headEnd ≤ i < tailStart`）。 | 改写为 `headEnd ≤ i < tailStart`（并注明 KEEP_HEAD = 0 时 `headEnd = 0`）。 |
| 10 | Clarity | 🔵 | §6.17（`:649`）标题「**三档落值（`agent` 段）**」下的表只有两行数据（无该键 / 有该键）。 | 标题改「两档」或补第三档（若指 `compactThreshold` / `Resolved` / `Auto` 三列，标题按列说）。 |
| 11 | 评审局限（登记） | 🔵 | 本轮无项目标准档、无文档地图 ⇒ Document ownership 只按 Project Guide 降级判定；需求档（F-CC1–F-CC5 / N1–N8）与源码行数不在评审范围 ⇒ 需求覆盖与准则 8 的读数核对两处均为 `unverified`（读数一律按档内文字审，未对盘）。 | 下一轮若需硬核对准则 8，请把 `CORE-UNIFICATION.md` §2.8 与相关源文件一并列入评审范围。 |

**计数**：🔴 1 · 🟡 7 · 🔵 3（共 11 条）。

**已见修正落点（本轮核对通过，非发现）**：R14–R16 三例与逐字文案（`:668`/`:671`-`:674`/`:720`-`:722`）互相对齐；四处读点归属（`:664`）与 `/config` 拆分（`cmd-config-menus.mjs`）口径自洽；先例行在 `:62`/`:509`/`:675`/`:700` 四处各带对齐 ∥ 偏离理由；勘察证据行（`:42`-`:43`，含 `publicRepos = []` 实读与「其余渠道未逐族取证」登记）在位；装配字面三支（`:672`-`:674`）与 R16 逐字一致。

VERDICT: changes-required

### 轮次 3（评审子代理）

**复核对象** = `docs/core/design/CONTEXT-COMPACTION.md`（本轮实读 783 行，全档覆盖 1–783）。范围局限：需求档 / `CORE-UNIFICATION.md` §2.8 / 源码不在评审范围 ⇒ 盘上读数一律 `unverified`；无文档地图 ⇒ ownership 降级判定。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | docs/core/design/CONTEXT-COMPACTION.md | 🔴 | Fixed | 原「§6.14 同时存在 `toolChoice: "none"` 处方与「不随 tool_choice」落定形」已消：`:281: - **不抑制 tool call**：压缩请求**不随** `tool_choice`——实施轮受控实测：该参数致服务端**丢弃 tools 区**（前缀复用归零）。`；`:293` / `:297` / D-CC20 三处同向，全档无残留处方。 |
| 2 | 2 | 同上 | 🟡 | Fixed | D-CC20 否决清单末项已改写为「⑤ 带 tools **且随** `tool_choice`（抑制形——该参数自身破坏命中）」，采纳形另列 `**已采纳（实施轮 S3 实测翻转）**：带 tools 且**不抑制** tool_call`（`:769`）——否决×已采纳的互斥矛盾消除。 |
| 3 | 3 | 同上 | 🟡 | Fixed | 用例 ID 撞名消除：`:325: 工具面 = §6.16.10（`S` / `P` / `C` / `N` / `RG` 各族）；形态与预算面 = 本节退化面 + §6.17 用例表（`RB` 族）`；§6.16.10 实表为 S1–S6 / P1–P5 / C1–C13 / N1–N4 / RG1–RG4，§6.17 为 RB1–RB16；原悬空「用例 1–8 · AC1–AC7」已无。 |
| 4 | 4 | 同上 | 🟡 | Fixed | 新增 `S6`（`:633`）钉 `Request budget:` 行逐字 + `not sent`/`absent` 三支 + 两距离带符号复算等值。 |
| 5 | 5 | 同上 | 🟡 | Fixed | §6.16.9 已为三列表（现况 / Δ / 改动要点，`:571`-`:590`）：cmd-config.mjs 543→≈312（menus ≈233）、config.mjs 570→≈418、四 transport ±3、model-specs +≈10、批内单测 新≈150 收口删。 |
| 6 | 6 | 同上 | 🟡 | Fixed | 尺寸账自洽：`:562: **尺寸账**：拆前 ≈328（回推：拆后实读 − 43 + 110）` ✓；`:593: **若不分拆（推算值，基线 = 拆后实读 261，2026-10-19）= 261 + 110 + 78 = 449**——未越 500 软线（余量 51）。⇒ 拆分依据 = 职责边界 + 余量` —— 原 495↔261 不可调和项消失，拆分依据改职责边界（自报两条均成立）。 |
| 7 | 7 | 同上 | 🟡 | Fixed | 原「软线 300 之上 = 既有事实」假断言已删；全档「软线」仅余 500 口径（`:554` / `:563` / `:579` / `:596`）。 |
| 8 | 8 | 同上 | 🟡 | Unfixed（部分修正） | 声明单源但读数仍重复：`:569: **本表是本档唯一读数源**（D2：§6.14 / §6.16.8 只留指针` 与 §6.16.8 实际内容不符——`:562` 仍写 `**若不分拆（推算，基线 = 拆后实读 261，2026-10-19）= 449**`，且 §6.16.9 `:592`-`:593` 与 §6.16.8 `:562`-`:563` 逐句重复「拆分立账」。§6.14 侧已改指针（`:307` ✓）。 |
| 9 | 9 | 同上 | 🔵 | Fixed | `:466: ② **保护尾之外**（`split.headEnd ≤ i < tailStart`——KEEP_HEAD = 0 ⇒ `headEnd = 0`` —— 索引区间写法已可读。 |
| 10 | 10 | 同上 | 🔵 | Fixed | §6.17 标题已改 `:669: **两档落值（`agent` 段）**`，与两行表一致。 |
| 11 | 11 | — | 🔵 | Accepted | 评审局限登记项（非文档缺陷）：需求档 / CORE-UNIFICATION §2.8 / 源码不在范围，准则 8 的盘上读数硬核对仍 `unverified`。 |
| N1 | (new) | docs/core/design/CONTEXT-COMPACTION.md | 🟡 | New: 同一「空白摘要守卫」两处坐标互斥且一处越界 | `:282` 写 `既有空白摘要守卫（`thincoder-core/context.mjs:414`）抛错进失败链`，而 `:306` 写 `空白摘要守卫 `:219``；本档自持读数 `:573: | `thincoder-core/context.mjs` | 261 |` ⇒ `:414` 不可能存在。同段 `:318` 的 `（`thincoder-core/context.mjs:327-331`）` 亦越 261。 |
| N2 | (new) | 同上 | 🟡 | New: 受影响文件表漏掉本档自述要改的端侧档 | §6.15 `:375: VSC 适配器（`thincoder-vscode/src/explore-distill.mjs`——**端形向后兼容**，增形参 `extras`）` 与 D-CC22 三站点（`:233`/`:234`：`thincoder-core/advisor/loop.mjs:207-217`、`thincoder-vscode/src/agent.mjs:387-397`）均不在 §6.16.9 表内；而该表自身惯例含已落档 ±0 行（`:579` turn-loop）。若这些面属他批，表内应登记排除。 |
| N3 | (new) | 同上 | 🟡 | New: 修正只改了 §6.17 标题，§6.2 指针仍写「三档」 | `:57: （**数值在场 = 显式**；数值不在场 = auto，按在用 provider 现算——三档落值与迁移判据 = §6.17）` vs `:669: **两档落值（`agent` 段）**`——同一张表两处不同档数。 |
| N4 | (new) | 同上 | 🔵 | New: 体量档结论句覆盖面与同表读数冲突 | `:598: 上述各档与 `thincoder-core/agent/run-stages.mjs`（VSC 侧同构件已并入核，端侧引用同指本档）均落 ≤500 软线内`——但同表现况列含 570 / 543（两档均越线、载于拆分行）；宜限定「上述各档」所指或补一句「越线两档按拆分后值计」。 |

**计数**：🔴 0 · 🟡 3（含 1 条部分未修）· 🔵 2（新）+ 7 条已修 · 1 条 Accepted（局限登记）。共 15 行。

**自报核验**：① 处方删净成立（全档 6 处提及均为「不随」落定形）；② 尺寸论证重算成立（拆前 ≈328 / 拆后 261 / 不分拆 449，余量 51 vs 239，拆分依据 = 职责边界）。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过评审（§3 = pass，🔴0）⇒ 实施获准。

**批准范围**：§2 全部实施面（`config.mjs` 570→407 拆两档 ∥ `cmd-config.mjs` 543→304 拆一档 ∥ `config-helpers.mjs` 79→129 ∥ 四 transport 零改 ∥ 9 档设计文档坐标重指）。

## §5 实施记录（eng-coder）

### 实施记录（批 C+D 之 C1 / C2 · 2026-10-19 · eng-coder）

**任务面**：本段只做 C1（`config.mjs` 拆分）、C2（`cmd-config.mjs` 拆分）、`config-helpers.mjs` 扩容（含 §6.17 `compactThresholdHint`）与四 transport 核对；D1（`_batchWrites`）不在本轮任务书内，未动。

#### ① 逐档行数（`node` 计 `\n`，与 `wc -l` 同口径；改前 ∥ 改后 ∥ 设计预测）

| 档 | 改前 | 改后 | 设计预测 | 判据 |
|---|---|---|---|---|
| `thincoder-core/config.mjs` | 570 | **407** | ≈418 | ≤500 ✓（余量 93） |
| `thincoder-core/config-defaults.mjs`（新） | — | **92** | ≈90 | ✓ |
| `thincoder-core/config-normalize.mjs`（新） | — | **109** | ≈100 | ✓ |
| `thincoder-cli/src/tui/cmd-config.mjs` | 543 | **304** | ≈312 | ≤500 ✓（余量 196） |
| `thincoder-cli/src/tui/cmd-config-menus.mjs`（新） | — | **245** | ≈233 | ✓ |
| `thincoder-cli/src/tui/config-helpers.mjs` | 79 | **129** | ≈120 | ✓ |
| `thincoder-cli/src/tui/index.mjs` | 275 | 276 | 表外 | 模块图注释（见 ④） |
| 四 transport（`provider/core.mjs` 468 · `anthropic.mjs` 239 · `google.mjs` 292 · `responses-request.mjs` 240） | 同左 | **零改** | ±3 | 已读 `requestBudget().maxTokens`，`|| 8192` 已删净（`anthropic.mjs:56-58`） |

#### ② 拆分形态（按 §6.16.9 表执行，未另立清单）

- **C1**：`DEFAULTS` 整段（78 行）逐字迁 `config-defaults.mjs`（`config-io.mjs:32` 的 `configDir` + `node:path`）；归一/清洗族迁 `config-normalize.mjs`（`sanitizeProviderHeaders` · `sanitizeConsultModels`+warn · `sanitizeSubagentModel(s)`+warn · `normalizeProxy` · `normalizeTeamSection`，零核内 import）；`config.mjs` 留公共面 re-export + `loadConfig` 编排 + 预算算式族 + 百炼 thinking + MCP 重载。导出面 31 名逐名 re-export（`config.mjs:25-41/:164`），34 档导入点零改。
- **C2**：四子菜单按**设计钉死**的工厂签名迁 `cmd-config-menus.mjs`——`createProxyMenu(ctx)` · `createConsultMenu(ctx)` · `createPoolMenu(ctx)` · `createDefaultModelMenu(ctx)`，`ctx = { agent, DEFAULTS, showPicker, askQuestion, pushLine, pushLabel, saveProxy, pickModelForSlot }`；`pickEffort` 同档 module 级（不导出，形参首加 `ctx`）。`cmd-config.mjs` 在建 `saveProxy` 之后一次性构造四个菜单（`:90-96`），主循环复用；命令入口 / 保存-重载脊柱 / `setEmbedKey` / 主菜单 / 数值项分支留脊柱（四处 `compactThresholdResolved` 读点全在脊柱，子菜单内零读）。
- **`config-helpers.mjs`**：迁入 `embeddingPatch` · `poolCur` · `effortMenuLevels` · `compactThresholdSuffix` + 新增 `compactThresholdHint(auto)`（`null` ⇒ `""`，两串逐字同 §6.17）。调用点 `cmd-config.mjs:270-271` 传 `isCompact ? ac.compactThresholdAuto === true : null`，装配位置 = `current: <值>` 之后、闭括号之前。

#### ③ 验收读数（全部实跑）

| # | 命令 | 结果 |
|---|---|---|
| 1 | `node --check` × 6 档 | 6/6 OK |
| 2 | `cd thincoder-cli && npm run lint` | `check-syntax: 124 file(s) OK` |
| 3 | 导出名快照（改前 `Object.keys(require('.../config.mjs'))` 存档 ∥ 改后同法） | 31 = 31，差集双向为空，`diff` 空 |
| 4 | 批内定向单测 12 条（`node --test`） | **12/12 绿**：导出面 · `loadConfig` 脏夹具逐字段等价（对 HEAD 基线，含脏 proxy/team/consultModels/headers/context）· `DEFAULTS` 深等 · 四纯函数 · RB14/RB15/RB16/RB8 提问行逐字（auto ∥ 显式 ∥ 非 compact 三形）· S6 `Request budget:` 行三支（`explicit`/`spec`/`absent`，两距离带符号复算等值）· 四菜单工厂运行期冒烟（Esc 即返、零写盘） |
| 5 | `node scripts/prompt-refs-check.mjs` | 提示词面 69 档 · 代码面 462 档 · **命中 0**（`OK(prompt-refs)`） |
| 6 | `cd thincoder-cli && npm test` | 清单空 = 零用例即绿（2026-09-28 全清口径） |
| 7 | `cd thincoder-core && npm test` | 19/19 绿 |

单测档位置 = `.thincoder/tmp/config-split.test.mjs`（**跑完即删，零留存**）；未落设计表的 `docs/batches/<batch>.test.mjs`，因父任务书「不要动 `docs/**`」优先。

#### ④ 决策与披露（含表外改动）

| # | 事项 | 处置与理由 |
|---|---|---|
| 1 | `thincoder-cli/src/tui/index.mjs:14-15` | **表外改动**：模块图注释补 `config-helpers.mjs` 新增职责 + `cmd-config-menus.mjs` 一行。理由：新档出现后旧图漏档即失真（D2 单一权威）。+1 行。 |
| 2 | `config.mjs` 无用 import 清理 | `node:fs` 收窄为 `existsSync, readFileSync`；删 `node:path`（`join`/`dirname` 随 `DEFAULTS` 迁出后无使用者）。零行为变，行数不变。 |
| 3 | 设计档行号坐标**未重指** | §2 ⑬-A 要求实施轮把 9 档设计档里的 `tui/cmd-config.mjs:<行号>` 逐条重指；父任务书令「不要动 `docs/**`（设计席的笔）」。**父令优先** ⇒ 全部未重指，`grep -rn "tui/cmd-config.mjs:" docs/core/design` 仍命中（`API-CONTRACT.md` · `PROXY.md` · `AGENT-PARAMS.md` · `MODEL-SPECS.md` · `PROMPT-SYSTEM.md` · `TEAM.md` · `CONFIG.md` · `ESCALATE.md` · `CONTEXT-COMPACTION.md`）。**待父侧裁**：由设计席重指，或明示降级到收口期统一重指。 |
| 4 | `cmd-config.mjs` 不再导出四个纯函数 | 设计 T12 钉「四个纯函数从新落点 import」⇒ 出口随之迁 `config-helpers.mjs`，本档只 import 不转发。后果：暂存档 `.thincoder/tmp/2026-10-18-mech-visibility-gaps-ct.test.mjs:11` 仍从 `cmd-config.mjs` 取 `compactThresholdSuffix`，若被重跑会在 import 期抛错（该档在 `.thincoder/tmp`、不进 `npm test` 收集面，非产品树）。要么其归属批收口时删除，要么加 1 行转发——本轮未擅改他人暂存档。 |
| 5 | `providers[].context` 归一仍内联在 `loadConfig` | 设计枚举的迁出集合不含此项（含 `warnedContextProviders` 旗）⇒ 照表执行、未扩大迁出面。代价：`config.mjs` 侧仍有一条「归一规则 + 一次性告警」与 `config-normalize.mjs` 同族不同址，登记备后续。 |
| 6 | 四 transport | 表内「装配面改读 `requestBudget().maxTokens`」**已是现盘状态**（读数与表内现况列逐档相符），本轮零改，非漏做。 |

#### ⑤ 审计与代码评审轮次（终态 `clean`）

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 偏离审计（对照 §6.16.9 表） | `changes-required`：🔴1（§5 空——当时尚未落笔，非实现偏离）· 🟡1（设计档行号未重指）· 🔵3（`index.mjs` 注释表外 · 临时校验档残留 · 单测档位置） | §5 本条即补；行号重指见 ④-3（父令）；临时档已删；🔵-注释已在 ④-1 披露 |
| 2 | 内部 advisor 代码评审（6 档 + §6.16.9/§6.17 为接受面） | **`pass`**，无 🔴 | 🟡2 登记不改（`cmd-config.mjs` helper 出口 · `providers[].context` 边界——后者与设计枚举一致，前者见 ④-4）· 🔵1 已改（`config-helpers.mjs` 头注「both pure / zero I/O」与 ① 组落盘事实相悖 ⇒ 改为分组陈述）· 🔵1 属设计档读数（父侧） |
| — | **修正轮** | 2 轮：① 审计第 6 条（`config.mjs:158-159` 注释「其余三个」应为四个，漏 `sanitizeProviderHeaders`）当场改；② 评审 🔵（`config-helpers.mjs` 头注）改。改后 `node --check` + `npm run lint` + 12/12 单测复跑全绿 | |

**终态：`clean`** —— 无未处置的实现级发现；两项 🟡 均为登记/归属事项（父令所致或设计枚举所致），不构成实现偏离。

**本轮未做**：D1（`_batchWrites`）· `docs/**` 任何写入（含 §6.16.9 读数收正与九档行号重指）· 提示词面 · 提交（commit 归父侧）。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- `config.mjs` **570 → 407**（余量 93）· `config-defaults.mjs` 92（新）· `config-normalize.mjs` 109（新）
- `cmd-config.mjs` **543 → 304**（余量 196）· `cmd-config-menus.mjs` 245（新）· `config-helpers.mjs` **79 → 129**
- **导出名 31 = 31，diff 为空**（34 档导入点零改）——外部契约未动
- 四 transport **零改**：实施起点即已读 `requestBudget().maxTokens`，且 `anthropic.mjs` 的 `|| 8192` 第三级兜底已不在盘上
- 定向单测 **12/12 绿**（含 **S6 的 `Request Budget:` 行三支逐字未走样**）· `npm run lint` 124 档 OK · `thincoder-core npm test` 19/19

**③ 单元测试零留存**：批内 12 例跑完即删，读数留在本节。

**④ 集成面**：`/config` 交互面由定向例覆盖；**无新增集成用例**。

**⑤ 修正轮落地前置**：修正轮 3（9 档坐标重指 + 15 档 `config.mjs:` 同族漂移）**已落**，18 档净增 0 行。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。**⑧ 用户文档面同拍**：本批拆分不改用户可见行为（导出名零变）⇒ 无同步项。

**⑨ 残留（已记账）**：`#1690`（`.thincoder/tmp` 暂存件指向已迁函数）· `#1691`（三档行数读数滞后——**读数错 ≠ 坐标错**，故记账不修）。

**⑩ 拆分依据留档**：**职责边界，不是越线**——设计早算过不分拆也就 449/486、不越 500。这条是本批最该被后来者读到的一句。
