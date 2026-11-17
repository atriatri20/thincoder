# 2026-11-13 · google-tool-history
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13：「然后开始修google的那个问题」并在范围说明后确认。
> 台账 = #2391（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = 073b597f2614d600b2ddd2502fd3e1fef3a17dfd
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

目标 = 修复 Google/Gemini 原生 transport 的工具历史回传，使 assistant 工具调用与工具结果以 `functionCall` / `functionResponse` 进入后续请求，并按当前契约回带 thought signature。

证据 = `thincoder-core/provider/google.mjs` 的 `convertMessages` 当前只读 `content`；`parseGeminiStream` 已能捕获 `part.thoughtSignature` 到 `extra_content.google.thought_signature`，但转换侧没有对应回带。

授权 = 用户确认本批范围：先落专项评估，再修 Google；批内单测、Provider 文档、相关回归和独立评审；不做真实凭据调用。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（范围与转换契约已确认）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

本批只改 Google/Gemini 历史转换，不改其他 transport、公共历史或工具执行语义。

**设计落点** = `docs/core/requirements/PROVIDER.md` 的「图像与工具回放」与 `docs/core/design/PROVIDER.md` 的「图像与签名」。

**最近先例** = Anthropic `convertMessages` 将 assistant 工具调用与 tool 角色结果转为原生块；Google 按 Gemini `contents` 投影，不复用其线格式。对齐 = 调用与结果同轮配对、连续同角色内容合并；偏离 = Gemini 的角色与 part 名。

**勘察证据** = 已读 Google `convertMessages` / `parseGeminiStream`、需求「图像与工具回放」、设计「图像与签名」及 Anthropic 真实回放入口；外部事实以 Google 官方 Function Calling / REST 结构为准。

**机制**：
- assistant：既有文本/图像 part 保持，随后把每个 `tool_calls[]` 按实际出站的 `function.name` / `function.arguments` 转成 `{ functionCall: { name, args } }`；签名在场时在对应 part 回带 `thoughtSignature`。
- tool：转成 role `user` 的 `{ functionResponse: { name, response } }`；优先读取工具消息已有的 `name`，缺失时才从 `tool_call_id` 去掉当前 Google 响应生成的 `_index` 后缀。
- 连续工具结果合并进同一个 user content；连续 model 文本/调用继续合并。
- 既有文本、图像、system 和调用方传参零改。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/provider/google.mjs | — | 308 |
| docs/batches/2026-11-13-google-tool-history.test.mjs | — | 新 |
| test/integration/anthropic-tool-roundtrip.test.mjs | — | 291 |
| test/integration/fixtures/acp-cli.mjs | — | 新 |
| test/integration/google-tool-roundtrip.test.mjs | — | 新 |

**验收** = 批内用例先在旧实现红；修后覆盖单调用、连续多结果、文本与多调用共存、签名逐调用回带、普通文本/图像不变、消息 `name` 优先、旧记录按 id 恢复，以及名称与约定后缀都缺失时明确报错。批内单测随批收口清理。

**集成增量** = 从 `test/RTM.md` 的 CLI 1「对话里用工具，结果必须回到模型」新增 CLI 1-4：本地脚本化 Gemini 端点 + 真 CLI ACP `session/prompt`，组件 = `google.chat` ⟷ `convertMessages` ⟷ 工具执行 ⟷ 结果历史回填；断言 = 第二程请求含带原签名的 `functionCall` 与含读取正文的 `functionResponse`，用户回复引用正文且无协议错误。既有 CLI 1-1–1-3 不改断言。

**风险** = 工具结果名优先读消息 `name`，缺失时才使用当前 Google 调用 id 约定；两者都无法提供合法名称时明确报错，不把无法配对的结果伪装成成功回传。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2「验收」仅称「批内单测随批收口清理，不新增常驻集成场景。」；没有从 `test/RTM.md` 出发的集成增量，也未说明「不改变既有用例断言且无需新增场景」这一唯一豁免理由。 |
| 2 | 🔴 | 未解决 | 需求「图像与工具回放」要求「结果名优先取工具消息 `name`，旧记录缺失时按当前调用 id 约定恢复。」；§2「验收」未覆盖名称优先、旧记录回退及无约定后缀时的可观察行为。 |

VERDICT: changes-required
🔴 2 · 🟡 0 · 🔵 0

### 轮次 2（评审子代理）

VERDICT: pass
🔴 0 · 🟡 0 · 🔵 0

## §4 用户批准（主 agent）

用户于 2026-11-13 对修复范围、批内测试、Provider 文档、独立评审及“不做真实凭据调用”的验证边界明确回复「确认」。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（转换、批内测试与 CLI 1-4 已落地）



实现 = `google.mjs` 的 `convertMessages` 按实际出站 `function.name` / `function.arguments` 投影 `functionCall`，将 tool 消息投影为 `functionResponse`，逐调用回带 `thoughtSignature`。名称优先读消息 `name`，旧记录按当前 id 后缀恢复；无法恢复时明确报错。

测试 = 批内用例覆盖单调用、连续多结果、名称优先与回退、不可恢复名称报错、普通文本/图像和流签名回路。CLI 1-4 复用抽出的 `fixtures/acp-cli.mjs`，以本地假 Gemini + 真 CLI ACP + 真 read 验证后续请求与用户回复；Anthropic 用例的断言与数量未变。

红侧 = 批内测试在旧实现 4 失败、1 通过。集成用例初次运行还暴露实际出站使用嵌套 `function` 字段，已据请求实录修到名称、参数和签名完整回带。

绿侧 = 批内 6/6；CLI 1-4 1/1；相关文件 lint 与 Provider 文档 doc_check 通过。完整仓测试见 §6 的既有失败清单，不冒充全绿。

## §6 验证与收口（父代理）

验收 = 批内转换与签名用例 6/6 通过后按规则清理；CLI 1-4 本地假 Gemini + 真 ACP 回放 1/1 通过；Provider 与 RTM 文档 `doc_check(report)` PASS；相关源码/测试 `lint full` 通过。

独立评审 = 代码复核两轮通过；设计首轮两项发现已修复，第二轮 `VERDICT: pass`。

完整回归 = 仓根 `node test/run.mjs` 最终仍 exit 1；失败集为既有 11-3、15-1、39-1/2/4、49-1/2/3 和 Docs 三张表，与首轮相同。失败点不经过本批 Google 转换链，本批不以完整套件全绿作声明，也不把这些范围外问题记为本批新债。

边界 = 未使用真实 Google 凭据，未做线上实测。
