# 飞刀（ESCALATE）· 会诊与评审板块

> 板块 = **飞刀**——把实现任务交给更强模型**亲自操刀**（`subagent` 工具动作 `action:"escalate"`）。
> 本档 = 飞刀机制设计面的**唯一权威**（术语 / 需求定位 / 候选池 / 工具契约 / async 机制 / 双端接线）。
> 相邻权威 = `docs/core/design/CONSULTATION.md`（会诊与评审·**共用候选池与后台池机制**——本档不复制其机制正文）·
> `docs/core/design/AGENT-LOOP.md`（异步化 / 子代理结算 / 消化轮档位）· `docs/core/design/ENGINEERING-MODE-V2.md`（工程模式禁飞刀——v1 设计档已归档）·
> `docs/core/design/TURN-CAP-CONTINUE.md`（撞轮数墙续跑）。
> 需求侧 = `docs/core/requirements/ESCALATE.md`（F-E1–F-E5 / N-E1–N-E4）。

## 1. 术语表

| 名字 | 是什么 |
|---|---|
| **`escalate`** | **唯一技术名**——`subagent` 工具的动作名；召唤的子代理走 `role: "coder"`（写路径复用） |
| **飞刀** | escalate 的中文别名（用户面向） |

**红线**：`escalate` 是主 agent 工具表里的**动作**，直接调用（`subagent` 的 `action:"escalate"`）——看到相关源码不等于「要写脚本调它」。
历史角色名 **surgeon 已从代码移除**，不留别名。

## 2. 需求定位

### 2.1 一句话

主模型遇到**自己干不动**的复杂实现任务时，请能力更强的模型**亲自操刀**——像医院请外院专家飞刀：专家到场、亲自手术、术后交回病历、离场。

### 2.2 与会诊的分工（互补，不重叠）

| | 会诊 consult | 飞刀 escalate |
|---|---|---|
| 本质 | 多模型**并行给意见** | 一个强模型**亲自执行** |
| 权限 | 只读 | **可写**（走正常权限门——ask 弹卡带归属 / AUTO 直通） |
| 场景 | 判断不清，要多视角 | 确认干不动，要人代干 |
| 候选 | `agent.consultModels` 全体 | `agent.consultModels` 全体（**同一列表**） |
| 形态 | 两工具（start / stop），后台 digest | 单动作，**缺省 async**（`async:false` 显式同步） |
| 产物 | 各家分析意见 | 改动清单 + 理由 + 验证结果（术后报告） |

### 2.3 边界哲学（用户拍板：不设硬边界）

飞刀成本 ≈ 主 agent 自跑一轮，硬边界只会让模型该出手时不出手。条款只描述「什么样的任务适合」与「与会诊的区别」，
**何时出手交给模型判断**——机制化挂钩（verify 耗尽 / stall）不用于飞刀。

### 2.4 不做清单

- ❌ 飞刀再飞刀（depth 封顶——拒绝 `depth > 0`）
- ❌ 多模型并行操刀（一个手术台只站一位主刀）
- ❌ 飞刀专用独立模型配置（候选池就是会诊列表）
- ❌ 全自动升级（触发权 = 主 agent 判断 + 用户）

## 3. 配置与候选池

候选池 = `agent.consultModels` 的**全部条目**，无额外字段（不新增配置章节）。池**空**时 escalate 动作运行时返回既有错误语义——
**空池不注册 / 不可用**：模型看不到不存在的功能就不会误调。

## 4. 工具契约

`escalate` 是 `subagent` 工具的动作（`action:"escalate"`）：

```
subagent(action:"escalate")
  - task (required): 交给飞刀模型的任务描述——目标、约束、入口文件、验收标准
  - model (optional): 指定候选池中的模型（provider:model 格式）；缺省 = 候选池第一个
  - 可写子 agent（role "coder" + 候选 effort）——走正常权限门（ask 弹卡带归属；AUTO 直通）
  - 子 agent 活动流经 relay 前缀进面板——**双端异形**：CLI = `escalate#<id>/` → TUI 子代理活动区块；VSC = `sub:escalate <label> #N` → 面板
  → 术后报告：改动清单 / 理由 / 验证结果 + Touched files
```

**工具描述语义**：把实现任务交给更强的模型，它**可写并亲自干活**（读 / 改 / 跑测试），返回术后报告。
**early escalate，别烧完尝试才出手**。**工程模式不可用**（实现走 eng-coder spawn——fail-closed）。

## 5. async 现行机制（缺省后台飞刀）

**发起**：返回 ack（`{ id, role: "escalate", status: "running" | "queued" }`）→ 后台 **other 池**飞行（与 explore / plan 共享槽位——池满公平排队、补位自动、cancel / ⏹ / status 共享池机制）。

**settle 三分类**：

| 类 | 处置 |
|---|---|
| **done** | mutations **merge-all** 回父；与父侧并发写重叠 ⇒ **报告级警告**（不 gate） |
| **error**（child 失败 / 撞轮数墙——async 永不弹继续面板） | 已产出的 partial mutations 视**父侧重叠判定**决定 merge（父 launch 后无重叠则 merge；有重叠则不 merge + 报告列差异） |
| **cancelled**（⏹ / 定向 cancel） | **不入 pending**——什么都不 merge |

**aborted**（会话全停 / controller 链中止）→ 出池丢弃（中止清池不注入）。

- **术后报告经 pending 单容器 digest 自动注入**（done = 已 merge 报告可继续；error = 错误报告）——动作域仍按**消费回合档位**（手动档 digest 禁写禁 spawn，无族例外）。
- **条目 settle 即出池**（status 查询在 settle 后为 unknown——报告经 digest 自动到达）。
- **顶层一律异步**（depth-0 escalate 本就 depth-0 only ⇒ 顶层缺省 = async）；`async:false` 仅**机制参数**——depth>0 子代理内同步（平台规则）。
- **撞墙继续（CLI 同步路径）**：撞轮数墙（`ContinueError`）经权限请求 `onPermissionRequest("continue")` 弹主 agent 同款 y/n Continue 面板；
  用户选继续则以 `resume: true` 续跑（不重注入任务文本、history 与 mutation 簿记保留、预算重置为一轮完整 `maxTurns`）——**续跑次数不设上限**（见 `docs/core/design/TURN-CAP-CONTINUE.md`）。
- **用户 Stop 传播**：`AbortError` 向上 rethrow，不吞掉。

## 6. 端级实现接线（双端）

| 环节 | 核 / CLI | VSC |
|---|---|---|
| 工具面 | `thincoder-core/agent-tools/subagent.mjs:2`（ONE tool, EIGHT actions）· `:94-102`（动作清单含 escalate） | `thincoder-vscode/src/agent-tools/subagent.mjs`（同形动作面） |
| 动作执行器 | `thincoder-core/agent-tools/subagent-actions.mjs:23`（`launchEscalateAsync`）· `:6`（`executeEscalateAction` §19） | |
| async runner | `thincoder-core/agent-tools/escalate-async.mjs:2-8`（缺省 async / other 池 / 共享 4 槽）· `:142-149`（入池） | |
| 池域 | `thincoder-core/agent-tools/subagent-async.mjs:55`（`ASYNC_POOL_LIMITS = { engCoder: 4, other: 4 }`）· `:62-65`（`poolDomainOf`——escalate 以 role coder 落 other 池） | 同源（池域机制见 `AGENT-LOOP.md`） |
| 结算 helper | `thincoder-core/agent-tools/async-settle.mjs`（`settleAsyncEntry` / `buildChildSignal`） | |
| 深度护栏 | `thincoder-core/agent-tools/subagent-actions.mjs:47`（`(ctx.depth ?? 0) > 0` → 明确错误） | |
| 工程模式禁用 | fail-closed（实现走 eng-coder spawn） | 同位 |
| 撞墙继续（同步路径） | `thincoder-core/agent-tools/subagent-actions.mjs:194`（`runWithContinue` + `onPermissionRequest("continue")` y/n 面板——主会话同款） | |
| 子代理构建 | `createAgent({ provider, tools, config, cwd, memory, role: "coder" })`（async `thincoder-core/agent-tools/escalate-async.mjs:195` · 同步 `subagent-actions.mjs:165`）——人格槽由 `assemblePrompt` 场景表承载 | 同形 |
| provider 解析 / 改动合并 | `resolveChildProvider`（`thincoder-core/agent-tools/subagent-async.mjs:138`）· `mergeChildMutations`（`:430`） | 同形机制 |
| 活动流上屏 | relay 前缀 `escalate#<id>/`（`thincoder-core/agent-tools/escalate-async.mjs:158`）→ TUI 子代理活动区块（no-preview legacy 面——`thincoder-cli/src/tui/tool-events.mjs:227-238`） | |
| 配置入口 / 提示词条款 | `/config` 候选池管理（`thincoder-cli/src/tui/cmd-config-menus.mjs`——上限 5 条 `:110`）· 飞刀条款 = `thincoder-core/prompts/discipline-normal.md` | Settings 面板（VSC 专有面——见 VSC 迁移台账） |

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-E1 | **候选池复用会诊列表**（零额外字段） | 减少心智负担——所有会诊模型自动是飞刀候选 |
| D-E2 | escalate **并入 `subagent` 动作面** | 工具面收敛——一个工具多动作，模型不会为找飞刀而混淆 |
| D-E3 | **缺省 async** | 长飞刀不再锁死交互——发起 ack → 回合收尾 → 完成报告 digest 自动注入 + mutations 自动 merge；`async:false` 显式同步零回归 |
| D-E4 | **复用 coder role** | 写权限 / 权限门（ask 弹卡带归属）/ 追踪全部现成，零新机制 |
| D-E5 | **空池不注册** | 模型看不到不存在的功能就不会误调 |
| D-E6 | **改动并入父级守卫**（`mergeChildMutations` 重置父级 verify / advisor 收敛预算） | 飞刀不能绕过父级门 |
| D-E7 | **无墙钟看门狗**（飞刀专属；consult 保留） | 固定墙钟会误杀正常但慢的手术（实测 max-effort 顾问读文件即撞 10min 墙）——改为 turn 上限 + 单次 LLM 调用超时 + 用户 Stop 直传 |
| D-E8 | **术语归并** 统一为 escalate | surgeon 曾作角色名与工具名并存导致模型混淆（role 语义 = `coder`，动作名 = escalate） |
| D-E9 | **depth-0 only** | 飞刀不能再飞刀 |
| D-E10 | **effort 越界钳制**（池 effort 越出该模型枚举 → 整字段丢弃） | 此前候选每次调用必抛错（「起飞即死」） |
| D-E11 | **深度护栏**（`(ctx.depth ?? 0) > 0` 拒绝——`thincoder-core/agent-tools/subagent-actions.mjs:341`） | 飞刀不能再飞刀——错误文案明示「an escalate's work cannot be delegated again」 |
| D-E12 | **无墙钟看门狗的挂死防护** = turn 上限（`subagentTurns` ?? 100）+ 单次 LLM 调用超时 + 用户 Stop 直传 | 与 subagent 写路径对齐——固定墙钟会误杀正常但慢的手术（D-E7 的 CLI 侧出处） |

