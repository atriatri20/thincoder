# Function Spec · M5 委派与 spawn 门

> 模块划分权威源 = `docs/core/design/ENGINEERING-MODE-V2.md` §2.2（M5）

## ① 模块目标

委派治理的**结构承载**：任务书必须带齐**四项核心 + 第五项按角色**（工程角色 = `designPoints` ∥ 其它 = `scope`），`round` 仅 eng-coder / eng-designer 必带——瞎下的指令被门拒，而不是被自觉忽略。

## ② 功能点

1. **`batchDoc` 参数门**：缺参 / 路径不可解析（不可读文件）→ 机械拒。
2. **任务书参数校验**（`TASK_BOOK_PARAMS` 单源 · **四项核心所有 spawn 角色 + 第五项按角色命名**）：
   - `goal`（目标与理由）
   - **`round`（初始 / 修复）**——**eng-coder / eng-designer 必带**；explore / plan / coder 不带轮次语义
   - `knownFacts`（父侧已探路径——不重复勘察）
   - **第五项按角色**：工程角色 = `designPoints`（设计要点与禁止范围）∥ explore / plan / coder = `scope`（范围与禁止范围：只读哪些 / 不碰什么）
   - `acceptance`（验收标准——可机判）
   - `reportFormat`（交付报告格式）
   **为什么分两个名字**：五项里四项名字中性（`goal` / `knownFacts` / `acceptance` / `reportFormat`），**只有第五项是工程专用词**——`explore` 不做设计，让它填「设计要点」是名不副实。分五套（每角色一套独立参数集）则 explore / plan / coder 三套完全同形 = 重复；取「四项核心 + 第五项按角色」= **只切一刀，切在唯一那个工程专用词上**。

3. **角色 enum 校验**：explore / eng-designer / eng-coder（**advisor 不入 spawn enum**——评审走 advisor 工具通道；plan 不入——工程模式无 plan 角色。主 agent 裁定）。
4. **files 声明语义**：`files` = 预期触碰面（内容产物：源 / 测试 / 设计档）——**不列工程工具面（`scripts/*`——层级锚定：仅仓根与直接子层；深层目录名不携带 face 信息）**、不列过程档（台账 / CHANGELOG）。

## ③ 边界（不做什么）

- 不做实现（eng-coder 职责）；不做 token 签发（M6）。
- 不重写调度器本体（继承 v1）；不做并发池（继承）。
- 不判断「任务大小」（零裁量——工程模式下所有请求走全流程）。

## ④ 验收（逐条可机判）

| # | 判据 | 方式 |
|---|---|---|
| AC-M5-1 | 缺 `batchDoc` 或路径不可读 → 拒 | 缺参 spawn → 期望拒 |
| AC-M5-2 | 任务书五项参数缺任一 → 拒并点名该参数（派单缺陷）——**所有 spawn 角色同受检** | 任一角色缺 `goal` → 期望拒 |
| AC-M5-5 | `files` 声明目录 / 过程档 → 拒 | 传目录 → 期望拒 |
| AC-M5-6 | 角色 enum 非法 → 拒（工程模式 enum = explore/eng-designer/eng-coder） | 传未知角色 → 期望拒 |

## ⑤ 依赖

- **上游**：M4（活 token 门）。
- **下游**：无（终端门）。

## 需求依据

v2 §8.1（交接契约）· §8.2（委派治理）· §9.3（轮次）· 架构设计 §2.3 E4 / E5。
