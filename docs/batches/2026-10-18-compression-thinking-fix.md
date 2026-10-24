# 2026-10-18 · 压缩摘要 thinking/effort 互斥 400 修复
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 17:19「这个上下文压缩的问题要分析一下，处理一下」——本会话实证：自动压缩 400 = `'reasoning_effort' must be 'none' when 'enable_thinking' is false`（百炼 qwen3.8-max）；根因 = `context.mjs:203` 压缩下行 `thinking:null` + 继承 effort，`config.mjs:188` 发 `enable_thinking:false`，`core.mjs:212` 发 effort 档位 ⇒ 互斥 400。台账 #1659。
> 台账 = #1659（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本轮性质 = 轻通道轮**（判据命中第 **②** 项「缺陷修复」）——实现与来源相抵：`config.mjs:177` 注释自证「effort tier implies thinking on」，而 `:188` 的 `thinking === null` 分支无条件返回 `false`，无 reasoningEffort 一致性检查 ⇒ 思考关 + effort 有值时发出互斥对（`enable_thinking:false` + `reasoning_effort:"medium"`），百炼 400。

**用户授权（2026-10-18 17:19 逐字）**：「这个上下文压缩的问题要分析一下，处理一下。」

**根因链（父侧实读，全坐标在案）**：

```
context.mjs:203   压缩下行 = chat({ ...agent.provider, thinking: null }, …)
                  ← v3 裁定（context.mjs:187）「随带同源 reasoningEffort」⇒ effort 继承
config.mjs:188    thinking === null ⇒ return false（无 effort 一致性分支）
core.mjs:205-212  reasoningEffort 有值 ⇒ body.reasoning_effort = "medium"
core.mjs:232-233  resolveEnableThinking ⇒ body.enable_thinking = false
百炼               400: reasoning_effort must be 'none' when enable_thinking is false
```

**回合请求不 400 的原因**：回合不关思考（thinking 有值 ⇒ `enable_thinking:true` ⇒ effort 合法）。**只有压缩下行触发**（它显式 `thinking:null`）。

**注释自证已知**：`config.mjs:188` 登记过「百炼 qwen 另有 `enable_thinking` 派生差」——已知缺口，从未修。

**修法（最小 · 纯函数面）**：`resolveEnableThinking` 增一致性分支——`thinking === null && provider.reasoningEffort && effort !== "none"` ⇒ 返回 `true`（effort 赢，与注释「effort tier implies thinking on」同向）。**被否**：压缩下行置 `reasoningEffort:null`（改 `context.mjs` 下行面 = 动 v3 裁定的载体，且 effort 族 off 形另有载荷门补发 `reasoning_effort:"none"` 的机制（`think-off.mjs:19`），两机制交叠风险大）。

**影响面**：qwen3.x 百炼 + 思考关（/think off ∥ autoThink off ∥ 压缩下行）+ effort 档位有值 ⇒ 压缩 400 ⇒ 三连败 ⇒ 确定性截断兜底 ⇒ 长会话质量降级。

**rollback**：单函数单分支，可 revert。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 一、修复落地（父侧直接执行 · 可 revert）

`thincoder-core/config.mjs` 的 `resolveEnableThinking`（`:183`）增一致性分支（4 行注释 + 1 行判据，函数 9 → 15 行）：

```js
if (provider.reasoningEffort && provider.reasoningEffort !== "none") return true   // effort 赢（新增）
if (provider.thinking === null) return false                                       // 原分支后移
```

**语义**：effort 档位有值且非 `"none"` ⇒ thinking on（与注释 `:177`「effort tier implies thinking on」同向）⇒ 压缩下行不再发 `enable_thinking:false`，互斥对消失。

### 二、验证读数（父侧实跑 · 新进程）

- `node --check config.mjs` = **exit 0**
- **行为矩阵八格全绿**：压缩形（`thinking:null` + `effort:"medium"`）`false → true`（修复面）；显式关（无 effort）仍 `false`（`/think off` 真关不变）；`effort:"none"` 仍 `false`（off 路径保持）；回合形 / 非百炼 / 非 qwen / qwen3-coder / 无参 四格逐字不变。
- 修复后压缩请求体 = `{enable_thinking:true, reasoning_effort:"medium"}`——**合法对**（思考开 + effort 档位）。摘要质量不降（v3「同源 effort」语义保留：摘要模型仍在思考）。

### 三、生效时点（如实交代）

**本会话不生效**——ESM 模块缓存：会话进程 16:05 启动时已加载旧 `config.mjs`，修复只对**新进程 / 重启后的会话**生效。本会话后续自动压缩若再触发，仍会 400（旧代码），三连败后落确定性截断兜底（`compressFallback`，不烧会话）。**桌面版重启后彻底生效。**

### 四、遗留（登记 · 不在本轮）

| # | 项 | 台账 |
|---|---|---|
| 1 | 压缩线不含 completion 预留（messages 66% 即实际满窗 → 溢出 400，无事前守卫）——**缺陷 2，属设计级**（压缩线语义 / 请求前守卫 / max_tokens 动态收，三案待裁） | **#1660** |

### 五、结论

缺陷 1（压缩 400）已修：单函数单分支、纯函数面、八格行为矩阵全绿、零连带。缺陷 2（溢出）已登记待设计。**状态行** → 已收口 2026-10-18
