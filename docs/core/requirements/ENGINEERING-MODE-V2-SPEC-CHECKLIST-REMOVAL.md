# Function Spec · M7 checklist 废除

> 模块划分权威源 = `docs/core/design/ENGINEERING-MODE-V2.md` §2.2（M7）

## ① 模块目标

**废除 checklist**（工具 + 文件 + 同步脚本 + 上下文注入 + 门禁族），待办跟踪统一到台账六态。

## ② 功能点

1. **删代码**：checklist 工具档（300 行）+ 其同步档（182 行）。
2. **卸挂载（核 + VSC 两处工具表）**：
   - 核 `thincoder-core/tools/index.mjs`（import · builtinTools · re-export 三处）；
   - VSC `thincoder-vscode/src/tools/index.mjs`（import · re-export · builtinTools 三处）。
3. **移除上下文注入（核 + VSC）**：
   - 核 `thincoder-core/agent/setup.mjs`（动态 import + `pendingItems` + system reminder 注入）；
   - VSC 侧的上下文注入档（`pushChecklist` · 调用点 · `_deps.pendingItems` 三处）。
4. **删约定**：checklist 约定废除（项目内 md 清单档形态不再存在）。
5. **删门禁**：`thincoder-core/agent-tools/subagent-scheduler.mjs` 的两处 `checklist*` 前缀禁用路径族。
6. **死指针改指台账**：`thincoder-core/agent-tools/task.mjs`「use checklist」· `thincoder-vscode/src/memory-tool.mjs`「use checklist」→ 改指台账（`/ledger` 查询）。
7. **语义承接**：checklist 三态（pending / in_progress / done）由台账六态承接（待讨论 / 待设计 / 在途 / 待核销 / 已核销 / 已废弃）。

## ③ 边界（不做什么）

- 不做台账（M2 承接）；不做历史 checklist 数据迁移（存量归项目归档，不在本模块）。
- **注入面纯移除，不承接**：checklist 的「启动时注入待办提醒」是 v1 专属配套，v2 台账可见面 = 查询命令（`/ledger`）——agent 待办可见性改由**主动查台账**，不靠启动被动注入。
- 不删 `.thincoder/` 下其他文件（只管 checklist 一族）；不触碰无关英文用词（`thincoder-core/agent-tools/verify.mjs` self-review checklist、`thincoder-core/agent/helpers.mjs` prose、`thincoder-core/index-discover.mjs` 注释）。

## ④ 验收（逐条可机判）

| # | 判据 | 方式 |
|---|---|---|
| AC-M7-1 | checklist 工具档与同步档已删 | 文件不存在 |
| AC-M7-2 | 全仓无对 checklist 的 import / 引用残留（`checklistTool` / `pendingItems` / `pushChecklist`） | grep 无匹配 |
| AC-M7-3 | 核 + VSC 两处工具表均无 `checklistTool` | 检查 `thincoder-core/tools/index.mjs` / `thincoder-vscode/src/tools/index.mjs`（核 / VSC） |
| AC-M7-4 | 上下文注入移除（核 `thincoder-core/agent/setup.mjs` + VSC 侧注入档，均无 checklist 注入） | grep 无匹配 |
| AC-M7-5 | `checklist*` 前缀禁用族已删（`thincoder-core/agent-tools/subagent-scheduler.mjs` 无 `checklist` 前缀判断） | grep 无匹配 |
| AC-M7-6 | 死指针改指台账（`thincoder-core/agent-tools/task.mjs` / `thincoder-core/memory/memory-tool.mjs` 无「use checklist」） | grep 无匹配 |
| AC-M7-7 | 待办三态可由台账六态表达（映射成立） | 映射表可查 |

## ⑤ 依赖

- **上游**：M2（六态承接 + `/ledger` 查询承接待办可见性）。
- **下游**：无。

## 需求依据

v2 §5.2（台账六态）· §10.1（不做什么——废除 checklist）· 架构设计 §2.2 M7（**受影响文件清单以本 spec 为准**）。
