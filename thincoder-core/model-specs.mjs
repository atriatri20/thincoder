/**
 * model-specs.mjs — known model capability table + spec lookup (2026-08-31 extract).
 *
 * Split from config.mjs (which had grown to 358 lines, past the 300 advisory
 * line — TODO #1). config.mjs re-exports specForModel so the 23 existing
 * importers stay untouched. (PROVIDER_PRESETS has since moved out, to
 * config-presets.mjs — the core's single preset face, re-exported by config.mjs.)
 */

import { listedContextTokens, manualContextK, warnContextOnce } from "./model-context.mjs"

/**
 * Known model capability spec table (prefix match within the model's last "/"-segment, longer first).
 * Used for compaction threshold derivation, continuation protocol selection, and capability-aware optimization.
 *
 * context:           context window (tokens)
 * maxOutput:         max output tokens (defaults to context)
 * thinking:          whether thinking/reasoning mode is supported
 * partialMode:       Kimi/Qwen Partial Mode truncation continuation (assistant message with partial:true)
 * prefixMode:        DeepSeek Prefix Completion truncation continuation (uses /beta endpoint, with prefix:true)
 * multimodal:        whether multimodal (image/vision input supported)
 * thinkApi:          thinking API type: "type"=thinking.type field / "effort"=reasoning_effort field
 * thinkEnabledValue: when thinkApi is "type", the value used to enable thinking (default "enabled"; MiniMax uses "adaptive")
 * thinkAlwaysOn:     server-enforced thinking (true = always on — no off path; single source = MODEL-SPECS.md §16.3)
 * reasoningEcho:     reasoning_content cross-turn echo strategy: "required"=must echo (error if missing) / "optional"=echo optional (default: don't echo)
 * reasoningEffortEnum: valid reasoning_effort enum values (if undeclared, no validation — passed through as-is)
 * tempRange:         valid temperature range [min, max] (if undeclared, no clamping)
 */
const MODEL_SPECS = [
  // DeepSeek V4.1 series (2026-09-11). `deepseek-flash` = DeepSeek-V4.1-Flash (in service):
  // 1M ctx / 384K out, thinking on by default (effort low/high/max), Chat Prefix Completion
  // beta, automatic disk cache, vision. The two legacy names below are RETIRED — the server
  // still accepts them and serves them from V4.1-Flash today (no switch window), so their
  // rows carry the V4.1-Flash parameters (v4-flash gains multimodal).
  ["deepseek-flash",    { context: 1_000_000, maxOutput: 384_000, thinking: true,  prefixMode: true,  thinkApi: "type", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 2], multimodal: true }],
// deepseek-v4.1-flash = qwen-plan channel name for DeepSeek V4.1-Flash (token-plan GET /models verified 2026-09-15) — same fields as the row above; ".1" ≠ "-" so plain prefix lookup misses the existing rows (D-PR25)
  ["deepseek-v4.1-flash", { context: 1_000_000, maxOutput: 384_000, thinking: true,  prefixMode: true,  thinkApi: "type", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 2], multimodal: true }],
  // deepseek-v4-pro (V4-Pro-0813): fields unchanged — 视觉面 **未探**（不声明 multimodal——保守）.
  // From 2026-09-14 12:00 Beijing all requests route to V4.1-Flash.
  ["deepseek-v4-pro",   { context: 1_000_000, maxOutput: 384_000, thinking: true,  prefixMode: true,  thinkApi: "type", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 2] }],
  // deepseek-v4-flash: RETIRED name — still accepted, served by V4.1-Flash today → aligned row
  ["deepseek-v4-flash", { context: 1_000_000, maxOutput: 384_000, thinking: true,  prefixMode: true,  thinkApi: "type", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 2], multimodal: true }],
  // deepseek-v4-flash-vision-exp: retired experimental vision name — still accepted (V4.1-Flash)
  ["deepseek-v4-flash-vision-exp", { context: 1_000_000, maxOutput: 384_000, thinking: true,  prefixMode: true,  thinkApi: "type", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 2], multimodal: true }],
  // Kimi series
  ["kimi-k3",           { context: 1_000_000, maxOutput: 131_072, thinking: true,  partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  // kimi-k3.1-pro / kimi-k3.1-pro-highspeed（2026-10-23 发布；官方 quickstart 实读 2026-10-25）：
  // context = 1_048_576（官方 1M）；maxOutput = 131_072（官方 max_completion_tokens 默认档，上限 1_048_576 不取）；
  // **思考始终开启**（官方原文「K3.1 Pro 始终开启思考模式」· FAQ「目前关不了」）⇒ thinkAlwaysOn；推理强度走顶层
  // reasoning_effort low/high/max（默认 max）⇒ thinkApi "effort"；多轮 / 工具调用须原样回传完整 assistant message
  // ⇒ reasoningEcho "required"；partialMode ✓；视觉 ✓（content 必须是对象数组，图走 base64 ∥ ms://，**不接受公网 URL**）。
  // Highspeed = 同规格、输出约 2~3 倍速（官方「同等智能」）—— 分值分行，靠前缀长度降序先命中。
  ["kimi-k3.1-pro",           { context: 1_048_576, maxOutput: 131_072, thinking: true, thinkAlwaysOn: true, partialMode: true, multimodal: true, thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  ["kimi-k3.1-pro-highspeed", { context: 1_048_576, maxOutput: 131_072, thinking: true, thinkAlwaysOn: true, partialMode: true, multimodal: true, thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  // Kimi For Coding endpoint uses the short model ID "k3" (same specs as kimi-k3) — IK5VGJ
  ["k3",                { context: 1_000_000, maxOutput: 131_072, thinking: true,  partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  // kimi-for-coding / k3-256k / kimi-for-coding-highspeed（Kimi For Coding 端点三名 · 2026-09-25 批 §14.2 #7-9 · 活测 = §1.4 服务端 200 /models）：
  // context = **活测**逐行；maxOutput = **族沿用 k3 行**（点名来源行——本注即标级）；effort 枚举 ["low","high","max"] = **活测**，
  // 默认档 max（kimi-for-coding）/ high（k3-256k）落端差表；机制位（partialMode / thinkApi / reasoningEcho）**族沿用 k3 行**
  // （有则沿、无则不声明）；能力位按 §1.4 现盘口径（image ✓ ⇒ multimodal ✓）。highspeed = 尺寸行 + image ✓（§1.4）——
  // 活测**无 effort 块** ⇒ thinking / 枚举 / 默认档均不声明；与 kimi-k2.7-code-highspeed（128_000）分值分行（防合并）。
  ["kimi-for-coding-highspeed", { context: 262_144,   maxOutput: 131_072, multimodal: true }],
  ["kimi-for-coding",           { context: 1_048_576, maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true, thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  ["k3-256k",                   { context: 262_144,   maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true, thinkApi: "effort", reasoningEcho: "required", reasoningEffortEnum: ["low", "high", "max"] }],
  // kimi-k2.6 / kimi-k2.7-code / kimi-k2.7-code-highspeed（三行同形 · 2026-09-24 bench 名单批）：temperature **仅受理 1** = **校验级**
  // （400 原文「invalid temperature: only 1 is allowed for this model」· roster-expand §2.2）；尺寸位 = **未取证**
  // （沿现盘兜底值——建行不改变生效值）；**不得声明 tempRange**（KD-31 例外档不变量：入档值 = 实发值）；枚举 / 视觉面 = **未探**。
  ["kimi-k2.6",                { context: 128_000, maxOutput: 32_000 }],
  ["kimi-k2.7-code",           { context: 128_000, maxOutput: 32_000 }],
  ["kimi-k2.7-code-highspeed", { context: 128_000, maxOutput: 32_000 }],
  // GLM series
  // GLM-5.3: thinking always-on (no "disabled"); effort converges to low/high/max — NOT the
  //          7-level glm-5.2 enum (verified vs docs.bigmodel.cn GLM-5.3 page, 2026-08).
  //          视觉面 **未探**（不声明 multimodal——保守）。
  //          该事实 = 机制位 `thinkAlwaysOn`（单源 = `docs/core/design/MODEL-SPECS.md` §16.3）——**官方口径**
  //          （智谱 GLM-5.3 文档：thinking always-on、无 `disabled`）。
  ["glm-5.3",           { context: 1_000_000, maxOutput: 128_000, thinking: true,  thinkAlwaysOn: true, thinkApi: "type", reasoningEcho: "optional", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 1], noUsageStream: true }],
  // glm-5.3-flash：始终思考——该事实 = 机制位 `thinkAlwaysOn`（单源 = `docs/core/design/MODEL-SPECS.md` §16.3）
  //          ——**族沿用**（族据 = `glm-5.3` 行）；其余字段见其下行注与规格面。
  ["glm-5.3-flash",     { context: 1_000_000, maxOutput: 131_072, thinking: true,  thinkAlwaysOn: true, multimodal: true,  thinkApi: "type", reasoningEcho: "optional", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 1], noUsageStream: true }],
  // glm-5.3-flashx（GLM-5.3-FlashX，2026-09 上线）——独立行（不再蹭 flash 前缀行）：maxOutput 131_072 =
  // **校验级**（400「max_tokens…限制数值范围[1,131072]」）；effort 枚举 ["low","high","max"] = **校验级**
  // （400 原文点名：low/high/max 受理，其余拒绝）。multimodal = **实测**（8×8 纯红 PNG → 答「红色」）。
  // thinking = **实测**且**始终思考**（`thinking:{type:"disabled"}` → 400；裸请求默认开）——off 动作在
  // UI 侧为 no-op（服务端无关闭路径）。该事实 = 机制位 `thinkAlwaysOn`（单源 = `docs/core/design/MODEL-SPECS.md`
  // §16.3）——**实测**（`thinking:{type:"disabled"}` → 400；裸请求默认开）。其余 = **族沿用** flash 行（context 网络口径未探边；
  // thinkApi / reasoningEcho / tempRange / noUsageStream = 前缀命中路径日常在用）。
  // flash 行 maxOutput 131_072 = **校验级**（#20 批 §1.2 同源 · 2026-09-25 批 §14.2 #1 收正）——两行独立（改一行不动另一行）。
  ["glm-5.3-flashx",    { context: 1_000_000, maxOutput: 131_072, thinking: true,  thinkAlwaysOn: true, multimodal: true,  thinkApi: "type", reasoningEcho: "optional", reasoningEffortEnum: ["low", "high", "max"], tempRange: [0, 1], noUsageStream: true }],
  ["glm-5.2",           { context: 1_000_000, maxOutput: 128_000, thinking: true,  thinkApi: "type", reasoningEcho: "optional", reasoningEffortEnum: ["max", "xhigh", "high", "medium", "low", "minimal", "none"], tempRange: [0, 1], noUsageStream: true }],
  ["glm-5",             { context: 1_000_000, maxOutput: 128_000, thinking: true,  thinkApi: "type", reasoningEcho: "optional", reasoningEffortEnum: ["max", "xhigh", "high", "medium", "low", "minimal", "none"], tempRange: [0, 1], noUsageStream: true }],
  // glm-4.5-air（智谱轻档 · 2026-09-24 bench 名单批）：temperature 0 受理 = **实测**（roster-expand §2.2）；取值以本行**显式声明**为准
  // （逐名官方口径未取证）；枚举 / 视觉面 = **未探**（不声明）。medium 直发实测受理（batch-params-judge §1.5）。
  ["glm-4.5-air", { context: 128_000, maxOutput: 32_000, thinking: true, thinkApi: "type", reasoningEcho: "optional", tempRange: [0, 1], noUsageStream: true }],
  // GPT series
  ["gpt-5.6-sol",       { context: 1_050_000, maxOutput: 128_000, thinking: false, multimodal: true }],
  ["gpt-5.6",           { context: 1_050_000, maxOutput: 128_000, thinking: false, multimodal: true }],
  ["gpt-4.1",           { context: 1_000_000, maxOutput: 128_000, thinking: false }],
  ["gpt-4o",            { context: 128_000,   maxOutput: 16_000,  thinking: false, multimodal: true }],
  // Qwen series
  // qwen-flash（2026-09-25 批 §14.2 #2-6 · §1.7.1 父侧实测）：**尺寸行**——maxOutput 32_768 = **实测**
  // （服务端直报「Range of max_tokens should be [1, 32768]」；131072 / 262144 均 400）。context 未取到 ⇒ 零口径——取兜底值
  // 128_000（与建行前生效值同值，§14.3 兜底语义续效）；thinking / 视觉有读数（默认关可开 / 不支持）但不落字段（§14.3 五名口径）。
  ["qwen-flash",        { context: 128_000, maxOutput: 32_768 }],
  // qwen3.7-max：**实测拒图像**（DashScope 400 "Unexpected item type in content"——真值彩图探针，2026-09-20）
  // ⇒ 无视觉 = **不声明**（T-7 语义单一：multimodal 仅 true / undefined；补探已毕，无需再探）
  ["qwen3.7-max",       { context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true,  thinkApi: "effort", reasoningEffortEnum: ["xhigh", "high"], tempRange: [0, 2] }],
  // qwen3.7-flash / qwen3.8-flash (2026-09-20): thinking + effort enum + maxOutput + image intake
  // are server-MEASURED (batch 2026-09-20-qwen-flash-specs §1.2 — bare request carries reasoning_tokens
  // 166/27; 400 literal lists the enum; max_tokens range [1, 131072]). 3.7-flash enum has NO "max"
  // (6 levels), 3.8-flash adds it (7); enum order = the server's literal order, first member "none"
  // (D-5) — never re-sort by strength. context = doc/web statement (1M class, not API-measured);
  // partialMode / thinkApi / tempRange = same-family carry-over (not independently
  // measured on these rows); reasoningEcho stays undeclared (cross-turn echo unverified — R-4).
  ["qwen3.7-flash",     { context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh"], tempRange: [0, 2] }],
  // qwen3.7-plus（2026-09-24 bench 名单批）：context = **官方口径（网络转述）**（2026-09-20 qwen-flash-specs 批 AC-6 已裁允许入表——「100 万长文档」族点名）；
  // maxOutput / partialMode / thinkApi / tempRange / thinking = **族沿用 qwen3.7-flash 行**；枚举 / 视觉面 = **未探**（不声明）。
  ["qwen3.7-plus",      { context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true,  thinkApi: "effort", tempRange: [0, 2] }],
  ["qwen3.8-flash",     { context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], tempRange: [0, 2] }],
  ["qwen3.8-max",       { context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["xhigh", "medium", "low"], tempRange: [0, 2] }],
  // qwen3.8-omni-flash / qwen3.8-27b — parent 80-token probe (batch §1.8-①): reasoning_content
  // present, reasoning_tokens 49, `effort:"none"` removes it ⇒ thinking MEASURED; enum / maxOutput
  // / image intake measured the same way. omni-flash: context = doc/web statement (1M class, not
  // API-measured); partialMode / thinkApi / tempRange = same-family carry-over;
  // reasoningEcho undeclared (cross-turn echo unverified — R-4). The server also takes audio, this
  // repo's call path sends images only ⇒ multimodal below = image intake (no `modalities` field, §2.7).
  ["qwen3.8-omni-flash",{ context: 1_000_000, maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], tempRange: [0, 2] }],
  // 27b: context 262_144 = doc/web statement, the native value (1M is YaRN extrapolation, local
  // deploy only); partialMode / thinkApi / tempRange same-family carry-over; reasoningEcho
  // undeclared (cross-turn echo unverified — R-4).
  ["qwen3.8-27b",       { context: 262_144,   maxOutput: 131_072, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], tempRange: [0, 2] }],
  // No generic "qwen" fallback row: unlisted qwen names deliberately resolve to DEFAULT_SPEC
  // (128K / 32K, no vision) — per-name disposition in docs/core/design/MODEL-SPECS.md §2.4.
  // Do not re-add a blanket prefix row (silent inheritance is how missing rows stayed invisible).

  // qwen3.6 系五行（批 2026-09-20-qwen36-family-rows · 五名同形，取证叙述落此一处全量）：
  // effort 枚举六档 = **校验级**（`max` → 400 原文点名 none/minimal/low/medium/high/xhigh——无 max，
  // ≠ 3.8 系七档）；maxOutput 65_536 = **校验级**（400「Range of max_tokens should be [1, 65536]」；
  // 65536 → 200）。thinking / multimodal = **实测**（裸请求 rc=143–239 默认开、none/minimal rc=0 可关；
  // 64×64 纯红 PNG 五名受理）。context = **官方口径**（未探边，文档口径非 API 实测）；partialMode /
  // thinkApi / tempRange = **族沿用**（qwen3.7/3.8 行先例）；reasoningEcho 不声明
  // （跨轮回声未验——R-4）。日期戳快照名不登——前缀命中母名行（有意继承）。
  ["qwen3.6-flash",     { context: 1_000_000, maxOutput: 65_536, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh"], tempRange: [0, 2] }],
  // qwen3.6-plus：同形行（共享证据块见 flash 行上）——校验级 maxOutput / 六档枚举、官方口径 context、族沿用机制位。
  ["qwen3.6-plus",      { context: 1_000_000, maxOutput: 65_536, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh"], tempRange: [0, 2] }],
  // qwen3.6-27b：同形行——校验级 maxOutput / 六档枚举、官方口径 context（未探边）、族沿用机制位。
  ["qwen3.6-27b",        { context: 1_000_000, maxOutput: 65_536, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh"], tempRange: [0, 2] }],
  // qwen3.5-27b（2026-09-24 bench 名单批）：context 262_144 = **官方口径（定价页分档佐证——[128K, 256K) 档在售；规格页未逐名核）**；
  // maxOutput / 机制位 = **族沿用 qwen3.6-27b 行**；枚举 / 视觉面 = **未探**（不声明）。
  ["qwen3.5-27b",        { context: 262_144, maxOutput: 65_536, thinking: true, partialMode: true,  thinkApi: "effort", tempRange: [0, 2] }],
  // qwen3.6-35b-a3b：MoE 后缀（a3b = 激活参数量级）——校验级 maxOutput / 六档枚举、官方口径 context、族沿用机制位。
  ["qwen3.6-35b-a3b",    { context: 1_000_000, maxOutput: 65_536, thinking: true, partialMode: true, multimodal: true,  thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh"], tempRange: [0, 2] }],
  // MiniMax series
  // effort（`reasoning_effort`）在 MiniMax 族 = **无生效面**（**实测**：effort 被忽略——`none` / `medium` 均 rc 在场；
  // off 路径 = `thinking:{type:"disabled"}` ✓ rc=0）——medium 照发仅口径统一（batch-params-judge §1.2 / KD-32④）。
  ["MiniMax-M3",        { context: 1_000_000, maxOutput: 128_000, thinking: true,  multimodal: true,  thinkApi: "type", thinkEnabledValue: "adaptive", tempRange: [0, 2], noUsageStream: true }],
  // MiMo series (Xiaomi — OpenAI-compatible https://api.xiaomimimo.com/v1; deep thinking via
  // thinking.type, default ON). Family echo policy stays conservative ("required" — tool rounds
  // always echo); 2026-09-22 re-probe: value / missing field / empty string all 200 — the
  // 2026-09-20 "must be passed back" 400 was NOT reproduced. v2.5 rows aligned 2026-09-22:
  // maxOutput 131_072 = **校验级**.
  // MiMo V2.6 series (2026-09-22 launch — three independent rows, each probed individually).
  // maxOutput 131_072 / tempRange [0, 1.5] = **校验级** (400 "at most 131072 completion tokens" /
  // "temperature must be within [0, 1.5]", per model); thinking = **实测** (bare request carries
  // reasoning_content; thinking.type disabled → rc gone ⇒ thinkApi "type" = measured face) and
  // multimodal = **实测** (8×8 pure-red PNG, pro / flash answered "Red"); context 1_000_000 = **官方口径**
  // (docs); reasoningEcho = **族沿用**.
  // effort（`reasoning_effort`）在三款 V2.6 = **无生效面**（**实测**：effort 被忽略——`none` / `medium` 均 rc 在场；
  // off 路径 = `thinking:{type:"disabled"}` ✓ rc=0）——medium 照发仅口径统一（batch-params-judge §1.2 / KD-32④）。
  ["mimo-v2.6-pro",     { context: 1_000_000, maxOutput: 131_072, thinking: true,  multimodal: true,  thinkApi: "type", reasoningEcho: "required", tempRange: [0, 1.5] }],
  // mimo-v2.6-flash: same row shape as pro — maxOutput 131_072 / tempRange [0, 1.5] = **校验级**,
  // thinking / multimodal = **实测**, context = **官方口径**, reasoningEcho = **族沿用**.
  ["mimo-v2.6-flash",   { context: 1_000_000, maxOutput: 131_072, thinking: true,  multimodal: true,  thinkApi: "type", reasoningEcho: "required", tempRange: [0, 1.5] }],
  // mimo-v2.6-pro-ultraspeed: same row shape — same grades as flash (**校验级** / **实测** /
  // **官方口径** / **族沿用**); image answer at a 64-token budget was truncated — "Red" at 512.
  ["mimo-v2.6-pro-ultraspeed", { context: 1_000_000, maxOutput: 131_072, thinking: true,  multimodal: true,  thinkApi: "type", reasoningEcho: "required", tempRange: [0, 1.5] }],
  // minimax-m3（小写前缀行——与上方 MiniMax-M3 行同值，同族两写法）：effort 同按**无生效面**处置
  // （**实测**：effort 被忽略；off 路径 = `thinking:{type:"disabled"}` ✓ rc=0——batch-params-judge §1.2 / KD-32④）。
  ["minimax-m3",        { context: 1_000_000, maxOutput: 128_000, thinking: true,  multimodal: true,  thinkApi: "type", thinkEnabledValue: "adaptive", tempRange: [0, 2], noUsageStream: true }],
  // MiniMax-M2.7（前缀行——覆盖标准档与 -highspeed · 2026-09-24 bench 名单批）：thinking = **实测**（裸请求 rc 在场）；off 路径 **未找到**
  // （`thinking:{type:"disabled"}` 不生效——如实，不声明 thinkApi）；effort 被忽略 ⇒ **无生效面**（枚举不声明；medium 照发仅口径统一）；
  // 尺寸 / noUsageStream = 本行**显式声明**（逐名官方口径未取证）；视觉面 = **未探**（不声明）。
  ["MiniMax-M2.7", { context: 256_000, maxOutput: 128_000, thinking: true, noUsageStream: true }],
  // Grok series (xAI — OpenAI-compatible)
  // grok-4.x: 500K context per xAI Grok 4.6 spec (corrected 2026-08; earlier entries said 1M)
  ["grok-4.6",          { context: 500_000,   maxOutput: 64_000,  thinking: false, multimodal: true, tempRange: [0, 2] }],
  ["grok-4.5",          { context: 500_000,   maxOutput: 64_000,  thinking: false, multimodal: true, tempRange: [0, 2] }],
  ["grok-4",            { context: 500_000,   maxOutput: 64_000,  thinking: false, multimodal: true, tempRange: [0, 2] }],
  ["grok-4-mini",       { context: 128_000,   maxOutput: 16_000,  thinking: false, tempRange: [0, 2] }],
  // Mistral series (OpenAI-compatible)
  ["mistral-large",     { context: 128_000,   maxOutput: 32_000,  thinking: false, multimodal: true, tempRange: [0, 2] }],
  ["codestral",         { context: 256_000,   maxOutput: 32_000,  thinking: false, tempRange: [0, 2] }],
  // Claude series (Anthropic)
  ["claude-opus-5",     { context: 1_000_000, maxOutput: 128_000, thinking: false, multimodal: true, format: "anthropic" }],
  ["claude-sonnet-5",   { context: 1_000_000, maxOutput: 128_000, thinking: false, multimodal: true, format: "anthropic" }],
  ["claude-opus-4",     { context: 200_000,   maxOutput: 32_000,  thinking: false, multimodal: true, format: "anthropic" }],
  ["claude-sonnet-4",   { context: 200_000,   maxOutput: 32_000,  thinking: false, multimodal: true, format: "anthropic" }],
  ["claude-3.5-haiku",  { context: 200_000,   maxOutput: 8_192,   thinking: false, format: "anthropic" }],
  // claude-fable-5.1（2026-09-25 批 §14.2 #2-6 · §1.7.1 父侧交付）：**尺寸行**——context 1_000_000 / maxOutput 128_000
  // （多源网络转述级，本机无该渠道——行值 + 行注即标级）；thinking「always-on adaptive」= 弱源读数 ⇒ 零口径不落字段（§14.3）。
  ["claude-fable-5.1",  { context: 1_000_000, maxOutput: 128_000 }],
  // Gemini series (Google)
  ["gemini-3-pro",      { context: 1_000_000, maxOutput: 64_000,  thinking: true, multimodal: true, format: "google", noUsageStream: true }],
  ["gemini-2.5-pro",    { context: 2_000_000, maxOutput: 64_000,  thinking: true, multimodal: true, format: "google", noUsageStream: true }],
  ["gemini-2.5-flash",  { context: 1_000_000, maxOutput: 64_000,  thinking: true, multimodal: true, format: "google", noUsageStream: true }],
  // gemini-3.1-pro（2026-09-25 批 §14.2 #2-6 · §1.7.1 父侧交付）：**尺寸行**——context 1_048_576 / maxOutput 65_536（多源
  // 网络转述级，本机无该渠道——行值 + 行注即标级）；thinking「有·计入输出预算」= 弱源读数 ⇒ 零口径不落字段（§14.3）。
  ["gemini-3.1-pro",    { context: 1_048_576, maxOutput: 65_536 }],
  // gemini-3.8-flash ∥ gemini-3.7-flash（2026-10-10 批 §18 · 台账 #1198）：官方逐档规格页实核（as-of 2026-10-10）——
  // 尺寸位（官方口径）：context 1_048_576 ∥ maxOutput 65_536；入 = 文/图/音/视、出 = 文（本表 multimodal = 图像面，§2.7——
  // 音/视仅行注承载）；思考恒开（thinking_level 受理 LOW/MEDIUM/HIGH、无关闭档；显式 MINIMAL ⇒ API 校验错——官方逐档页注）
  // ⇒ thinking + thinkAlwaysOn = 官方口径（§16.3 机制位）；机制位其余不声明（google 传输面实读——§18.3）。
  // GA 2026-09-02（3.8）∥ 2026-08-13（3.7）；3.7 退役 2027-01-28（日程注）。
  ["gemini-3.8-flash",  { context: 1_048_576, maxOutput: 65_536, thinking: true, thinkAlwaysOn: true, multimodal: true }],
  ["gemini-3.7-flash",  { context: 1_048_576, maxOutput: 65_536, thinking: true, thinkAlwaysOn: true, multimodal: true }],
  // Tencent Hunyuan (TokenHub — 聚合网关 `https://tokenhub.tencentmaas.com/v1`；批 2026-09-20-channel-onboarding)
  // hy3：thinking / thinkApi / effort 枚举 = **本渠道实测**——裸请求 reasoning_content 在场（tok=16），
  // `reasoning_effort:"none"` 即消失（实测唯一有效 off 路径）。枚举 = 七值**受理级探针**（七值全 200 受理；
  // 乱值 400 泛化拒收、服务端不列枚举——等级低于 seed 的「服务端真校验」，两族同值集但等级不混）；
  // 序 = 服务端原文序、首项 "none"，**禁按强度重排**（D-5）。multimodal：**不声明**——真值 32×32 纯红图
  // 答 "Unknown"（对照组明说不识图）⇒ 实测无视觉。尺寸位两级逐条标（AC-2）：maxOutput 128_000 =
  // **参考实配**（网关对 max_tokens 不硬拒 ⇒ 上限未证）；context 256_000 = **网络口径**（他仓/文档 256K，未本渠道实测）。
  ["hy3",               { context: 256_000, maxOutput: 128_000, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"] }],
  // hy4-preview（在场实测：/models + 401；能力位**未探针**）——尺寸行：取值 = hy3 族**同族沿用**
  // （maxOutput 参考实配级取值 / context 网络口径；批次档 §1.2 未给该名尺寸行 ⇒ 上报清单 2，行注即标级）。
  ["hy4-preview",       { context: 256_000, maxOutput: 128_000 }],
  // Doubao Seed (Volcano Ark — `https://ark.cn-beijing.volces.com/api/v3`；批 2026-09-20-channel-onboarding)
  // 两档全针实测：裸请求 reasoning_content 在场（code tok=219 / lite tok=161）、`effort:"none"` 即消失 ⇒
  // thinking / thinkApi = 实测；枚举 = **服务端真校验级**（乱值 400 明列 invalid + 七档全 200）⇒ 七值即服务端值域；
  // maxOutput 131_072 = **实测**（262 144 → 400 "above maximum"）；context 256_000 = **官方口径**（官方 256K）
  // + **实测**下界 210K 输入受理（探至账号 429 停手）；multimodal = 实测（纯红图答 "Red"）。
  ["doubao-seed-2-0-code-preview-260215", { context: 256_000, maxOutput: 131_072, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], multimodal: true }],
  // seed-lite = 同族全针（批次档 §1.2 lite 行：思考 tok=161 / 视觉 "Red" / 上限 131 072 / echo 真名）——
  // context 同按 **官方口径** + **实测**下界标注；行独立（同值集 ≠ 同行：改一行不动另一行）。
  ["doubao-seed-2-0-lite-260428", { context: 256_000, maxOutput: 131_072, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"], multimodal: true }],
  // doubao-seed-2-1 三档（火山方舟 · 2026-09-24 bench 名单批 · 三行同形）：thinking / thinkApi / 枚举 = **实测**
  // （裸请求 rc 在场；`reasoning_effort:"none"` → rc=0；七值全 200、乱值 400 泛化 ⇒ **受理级**——等级低于 2.0 行的
  // 「真校验」，同值集不混级）；maxOutput 524_288 = **受理级**（262 144 / 524 288 均受理；**上限未证**）；
  // context = **族沿用 2.0 行**（官方口径未逐名取证）；**视觉面未探**（不声明——如实标级，不冒充实测）。
  ["doubao-seed-2-1-pro-260915",   { context: 256_000, maxOutput: 524_288, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"] }],
  ["doubao-seed-2-1-turbo-260628", { context: 256_000, maxOutput: 524_288, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"] }],
  ["doubao-seed-2-1-lite-260915",  { context: 256_000, maxOutput: 524_288, thinking: true, thinkApi: "effort", reasoningEffortEnum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"] }],
  // step-3.7-flash（StepFun · 2026-09-25 批 §14.2 #2-6 · §1.7.1 父侧交付）：**尺寸行**——context 262_144（多源 256K =
  // 网络转述级；渠道未激活——400 "product is not activated"）；maxOutput 未取到 ⇒ 零口径——取兜底值 32_000（与建行前
  // 生效值同值）；行键 = 裸名（渠道名录形 stepfun/step-3.7-flash——命名空间剥离同命中）。
  ["step-3.7-flash",    { context: 262_144, maxOutput: 32_000 }],
]
const DEFAULT_SPEC = { context: 128_000, maxOutput: 32_000 }

/** 查表规则（单源 = PROVIDER.md §6.9 · 用户 2026-10-23 17:34 裁定「匹配 / 拆分以后的最后一段」）：
 *
 * 模型名匹配 = **末段唯一**：按 "/" 拆开只拿最后一段查表（单段名末段 = 自身），段内仍按前缀匹配
 * （`glm-5.3-flashx` 命中 `glm-5.3` 行）。完整名**不再先扫**——旧法把 `glm-5.3/zzz` 误判成
 * `glm-5.3`（1M 上下文 ⇒ 压缩永不触发 ⇒ 溢出）；新法取末段 `zzz` ⇒ 未命中 ⇒ DEFAULT_SPEC + 告警。
 * 聚合网关惯例 `vendor/model`（roapi/new-api/one-api/aiproxy）因此天然命中：`zhipu/glm-5.3` /
 * 链式 `qwen/ZHIPU/GLM-5.3` ⇒ `glm-5.3`。末段为空（`foo/`）⇒ 未命中（空串不做匹配）。 */
const warnedModels = new Set() // warn once per model name — spec lookup runs on every request (hot path)
// Pre-sorted once at module scope — spec lookup runs on every request (agent, provider core,
// context, auto-think, TUI rendering); re-sorting per call was wasteful.
const SORTED_SPECS = [...MODEL_SPECS].sort((a, b) => b[0].length - a[0].length)

/** Single table lookup shared by specForModel / specMatch — prefix match (case-insensitive) on the
 *  model's LAST "/"-segment only (末段唯一 · PROVIDER.md §6.9). The full name is NOT scanned first:
 *  `glm-5.3/zzz` takes `zzz` and misses (the old full-name-first scan mis-hit `glm-5.3`).
 * 模型名匹配 = **末段唯一** ∪ **冒号边界**（fork 并集 · 2026-10-24）：末段切分的边界集 = "/" ∪ ":"——
 * realm 前缀（`cn:` ∕ `global:` ∕ `workbuddy:`）是命名空间非模型名段（`cn:deepseek-v4-flash` ⇒ `deepseek-v4-flash`
 * 命中内置行）；上游「末段唯一」的误命中守卫（`glm-5.3/zzz` ⇒ `zzz` 未命中）语义保持。
 *  下游无类型门——`.toLowerCase` 只认串，非串归一后本函数恒 total，同 providerSpec 文档句）。 */
function lookupSpec(model) {
  const m = (typeof model === "string" ? model : "").toLowerCase()
  const cut = Math.max(m.lastIndexOf("/"), m.lastIndexOf(":"))
  const bare = cut >= 0 ? m.slice(cut + 1) : m   // 末段唯一；单段名 = 自身
  if (!bare) return null                             // 末段为空 ⇒ 未命中（空串不做前缀匹配）
  for (const [prefix, spec] of SORTED_SPECS) {
    if (bare.startsWith(prefix.toLowerCase())) return spec
  }
  return null
}

/** Unknown model: warn ONCE (not per request) so a typo'd ID or a missing alias surfaces

/** 命名空间前缀剥离的**边界候选**（2026-10-10 泛化——原「剥第一个 `/` 一次」）。
 *
 * 第三方 token 市场 / 反代聚合网关在模型名前加**路由前缀**，分隔符不止 `/`：
 *   - 斜杠族（roapi/new-api/one-api/aiproxy）：`zhipu/glm-5.3`、`openai/gpt-4o`
 *   - 冒号族（渠道聚合）：`cn:deepseek-v4-flash`、`global:glm-5.3`、`workbuddy:global:deepseek-v4.1-flash`
 *   - 多段混合：`cl/cline-free/deepseek-v4.1-flash`、`qdcn/qfmodel`
 * 剥离**只在 `:` ∕ `/` 边界**进行（不做任意位置的子串匹配——那样误命中面过大）：返回全名 +
 * 每个边界之后的剩余串，长者在先。kimi/kimi-k3 的显式 alias 行保留为文档锚（发送路径
 * provider.core isRouter 依赖含 "/" 判定），通用机制已覆盖同类。 */
function prefixCandidates(m) {
  const out = [m]
  for (let i = 0; i < m.length; i++) {
    if (m[i] === ":" || m[i] === "/") {
      const rest = m.slice(i + 1)
      if (rest) out.push(rest)
    }
  }
  return out
}

// ─── 用户覆写表（modelOverrides · 2026-10-10）───────────────────────────────────────────────
// 内置 MODEL_SPECS 是源码硬表，用户改不了；反代 ∕ 聚合网关还会带来表内没有的模型名（`cn:auto`、
// `global:gpt-5.4`、`qdcn/qfmodel`…）⇒ 一律落 DEFAULT_SPEC（128K ∕ 32K ∕ 无思考）。覆写表给用户
// 一条**不改源码**的自救路径（ZCode `manualProviderModelRules` 同义）。
//
// 装配方式 = 模块级单写者：`specForModel(model)` 是**无 config 入参的纯查表**（23 个消费方按此
// 调用），不能改签名 ⇒ 由 `loadConfig()` 在装载期 `setModelOverrides(...)` 注入（先例 =
// 本档 `warnedModels` Set ∕ `theme.mjs` 单写者）。键 = 模型 ID；亦按**前缀**命中（键 `cn:` 即
// 覆盖该渠道全部模型，键 `deepseek-v4.1-flash` 覆盖任何前缀包裹的同名模型）。
const OVERRIDE_INT_FIELDS = ["context", "maxOutput"]
const OVERRIDE_BOOL_FIELDS = ["thinking", "thinkAlwaysOn", "multimodal", "partialMode", "prefixMode", "noUsageStream"]
const OVERRIDE_STR_FIELDS = ["thinkApi", "thinkEnabledValue", "reasoningEcho", "format", "reasoningEffortDefault"]

/** 单条覆写清洗（纯函数）：可覆写叶白名单 + 逐叶类型判据；非法叶丢弃（不 throw——D-S1 软失败范式，
 *  同 `providers[].context` 清洗先例）。返回清洗后对象，零有效叶 ⇒ null（调用侧计一次警告）。 */
function sanitizeOverride(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    if (OVERRIDE_INT_FIELDS.includes(k)) { if (Number.isInteger(v) && v > 0) out[k] = v; continue }
    if (OVERRIDE_BOOL_FIELDS.includes(k)) { if (typeof v === "boolean") out[k] = v; continue }
    if (OVERRIDE_STR_FIELDS.includes(k)) { if (typeof v === "string" && v.trim()) out[k] = v.trim(); continue }
    if (k === "reasoningEffortEnum") {
      if (Array.isArray(v)) {
        const vals = [...new Set(v.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
        if (vals.length) out[k] = vals
      }
      continue
    }
    if (k === "tempRange") {
      if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === "number" && Number.isFinite(x))) out[k] = [v[0], v[1]]
      continue
    }
  }
  return Object.keys(out).length ? out : null
}

let MODEL_OVERRIDES = Object.freeze({})
let warnedOverrides = false

/** 装配用户覆写表（`loadConfig` 单调用点）。键归一小写；非法条目整条丢弃 + 一次性警告。 */
export function setModelOverrides(table) {
  const clean = {}
  const dropped = []
  if (table && typeof table === "object" && !Array.isArray(table)) {
    for (const [key, val] of Object.entries(table)) {
      const k = typeof key === "string" ? key.trim().toLowerCase() : ""
      if (!k) continue
      const ov = sanitizeOverride(val)
      if (!ov) { dropped.push(key); continue }
      clean[k] = Object.freeze(ov)
    }
  }
  MODEL_OVERRIDES = Object.freeze(clean)
  if (dropped.length && !warnedOverrides) {
    warnedOverrides = true
    console.warn(`[config] modelOverrides: ${dropped.length} entr${dropped.length === 1 ? "y" : "ies"} ignored (no usable field — expected e.g. { "context": 1000000, "maxOutput": 384000, "thinking": true, "reasoningEffortEnum": ["low","high","max"] }): ${dropped.join(", ")}`)
  }
  return MODEL_OVERRIDES
}

/** 读面（端侧只读消费 ∕ 测试断言）。 */
export function getModelOverrides() { return MODEL_OVERRIDES }

/** 覆写命中：精确键 > 前缀键（长键优先）；候选亦逐边界剥离（`cn:glm-5.3` 可被 `glm-5.3` 键命中）。 */
function overrideFor(model) {
  const key = overrideKeyFor(model)
  return key === null ? null : MODEL_OVERRIDES[key]
}

/** 命中的覆写键（端侧「重置为默认」需知道该删哪个键；无覆写 ⇒ null）。与 `overrideFor` 同判据单源。 */
export function overrideKeyFor(model) {
  const m = (typeof model === "string" ? model : "").toLowerCase()
  if (!m) return null
  const keys = Object.keys(MODEL_OVERRIDES)
  if (keys.length === 0) return null
  if (MODEL_OVERRIDES[m]) return m
  const scan = (s) => {
    let best = null
    for (const k of keys) {
      if (s.startsWith(k) && (best === null || k.length > best.length)) best = k
    }
    return best
  }
  for (const cand of prefixCandidates(m)) {
    const k = scan(cand)
    if (k) return k
  }
  return null
}

/** 合成：内置表命中 ∕ 用户覆写命中（任一）⇒ 生效 spec + 来源；两者皆无 ⇒ null（调用侧落 DEFAULT_SPEC）。
 *  覆写与内置表合并 = 浅合并（覆写只写要改的叶——未写叶沿用内置值；内置未命中则沿用 DEFAULT_SPEC）。 */
function composeSpec(model) {
  const hit = lookupSpec(model)
  const ov = overrideFor(model)
  if (!hit && !ov) return null
  const base = hit ?? DEFAULT_SPEC
  return { spec: ov ? { ...base, ...ov } : base, source: ov ? "override" : "builtin" }
}

/** Unknown model: warn ONCE (not per request) so a typo'd ID or a missing row surfaces
 *  instead of silently degrading to the 128K default (IK5VGJ). The dedupe set is shared by
 *  specForModel / specMatch (PROVIDER.md §16 M5). 已有覆写 ⇒ 不算未知（composeSpec 命中，不警告）。 */
function warnUnknownModel(model) {
  // 非串 model（脏载）归一空串 ⇒ 不警告（未登记 ≠ 拼错——不刷屏；#638 与 lookupSpec 同归一）
  const m = (typeof model === "string" ? model : "").toLowerCase()
  if (m && !warnedModels.has(m)) {
    warnedModels.add(m)
    console.warn(`[config] model "${model}" not found in MODEL_SPECS — using default spec (128K context, 32K output). Add a "modelOverrides" entry to ~/.thincoder/config.json (desktop: 设置 → 模型参数; CLI: /model → Model parameters) to set the real context window and reasoning levels.`)
  }
}

export function specForModel(model) {
  const r = composeSpec(model)
  if (r) return r.spec
  warnUnknownModel(model)
  return DEFAULT_SPEC
}

/** specMatch(model) → { spec, matched, source }（PROVIDER.md §16 M5——切换回显的来源判定）。
 *  `matched:false` = DEFAULT_SPEC 兜底（未知模型）；`source` = `"builtin"`（内置表命中）∕
 *  `"override"`（用户覆写命中）∕ `"default"`（兜底）——桌面「来源」徽标的判据。
 *  与 specForModel 共享同一合成实现（单次），specForModel 的返回形状与共享对象契约零改（热路径零变）。 */
export function specMatch(model) {
  const r = composeSpec(model)
  if (r) return { spec: r.spec, matched: true, source: r.source }
  warnUnknownModel(model)
  return { spec: DEFAULT_SPEC, matched: false, source: "default" }
}

export function formatContextK(tokens) {
  if (tokens >= 1_000_000) return `${Math.round(tokens / 1_048_576)}M`
  return `${Math.round(tokens / 1024)}K`
}

/** 人工声明上下文的展示串，**收 K**（`modelContext` ∥ 旧键 `context` 的存储单位）：`128` ⇒ `128K`、
 *  `1024` ⇒ `1M`。K→token 的展示换算**只此一处**（内部转 token 再交给 `formatContextK`）——三端读面
 *  把已声明原值直接交进来，不自己换算、不自己拼 K 串（PROVIDER.md §6.15「读面回显」· R31④）。
 *  前提：`k` 是先过 `positiveInt` 的正整数（与读链同一谓词）——非法值本函数不复判。 */
export function formatDeclaredContextK(k) {
  return formatContextK(k * 1024)
}

// ─── 推理强度注册默认档（端差面上提 · 2026-10-10）────────────────────────────────────────────
// 原 = VSC 端差表 `thincoder-vscode/src/specs.mjs` `EFFORT_DEFAULT_PREFIXES`（CORE-UNIFICATION
// §2.13.4 #143「端侧自有」裁定）。桌面与 CLI 无此表 ⇒ 有档位枚举但无默认档时，思考强度钮恒显中性
// `"—"`（render-core `effortSelection` 的 `registeredDefault` 恒 undefined）——本表上提进核后三端
// 同源，VSC 端差表退场改为转口本函数。
const EFFORT_DEFAULT_PREFIXES = [
  ["deepseek-v4-flash-vision-exp", "high"],
  ["deepseek-v4-flash", "high"],
  // deepseek-v4.1-flash：与 `deepseek-v4-flash` 同物（`MODEL_SPECS` 行注明 —— V4.1-Flash 的 qwen-plan
  // 渠道名），`.1` ≠ `-` ⇒ 原表前缀不覆盖 ⇒ 单独立行（族默认档同 `high`）。2026-10-10 补。
  ["deepseek-v4.1-flash", "high"],
  ["deepseek-flash", "high"],
  ["deepseek-v4-pro", "high"],
  ["kimi", "max"],
  ["k3-256k", "high"],
  ["k3", "max"],
  ["glm-5", "max"],
  ["qwen3.7-max", "xhigh"],
  ["qwen3.8-max", "xhigh"],
  ["qwen3.7-flash", "high"],
  ["qwen3.8-flash", "high"],
  ["qwen3.8-omni-flash", "high"],
  ["qwen3.8-27b", "high"],
  ["qwen3.6-flash", "high"],
  ["qwen3.6-plus", "high"],
  ["qwen3.6-max-preview", "high"],
  ["qwen3.6-27b", "high"],
  ["qwen3.6-35b-a3b", "high"],
]

/** 注册默认档（最长前缀优先；用户覆写 `reasoningEffortDefault` 优先于内置表）。未命中 ⇒ undefined
 *  （端侧落占位「—」——不取枚举首项回落：effort 型族首项 = `none` ⇒ 换模型即静默关思考）。 */
export function effortDefaultFor(model) {
  const m = (typeof model === "string" ? model : "").toLowerCase()
  if (!m) return undefined
  const ov = overrideFor(model)?.reasoningEffortDefault
  if (ov !== undefined) return ov
  const scan = (s) => {
    let best = null
    for (const [prefix, value] of EFFORT_DEFAULT_PREFIXES) {
      if (s.startsWith(prefix) && (best === null || prefix.length > best[0].length)) best = [prefix, value]
    }
    return best ? best[1] : undefined
  }
  for (const cand of prefixCandidates(m)) {
    const hit = scan(cand)
    if (hit !== undefined) return hit
  }
  return undefined
}

/**
 * providerSpec(provider) — spec with a provider-level context override (PROVIDER.md §15, 2026-09-02).
 *
 * providers[].context is configured in K units (128 = 128K = 131072 tokens) and overrides the
 * MODEL_SPECS value for THIS provider only — the same model can have different real context
 * windows on different endpoints (official vs local deployment). The ×1024 conversion happens
 * HERE and nowhere else.
 *
 * Returns a COPY ({ ...spec, context }) — the shared spec object from the SORTED_SPECS lookup
 * must never be mutated, or the override would leak across providers (T-C1).
 *
 * Validation is defensive (pure function): absent/invalid context falls back to the plain spec
 * (config.mjs loadConfig already warns + strips invalid values; this guard covers direct callers
 * and keeps the function total). specForModel stays a config-free lookup (table + registered
 * modelOverrides) — callers without a provider keep using it.
 *
 * 生效序（低 → 高）：DEFAULT_SPEC < MODEL_SPECS 命中 < `modelOverrides`（模型级）< `providers[].context`
 * （渠道级最具体——本函数）。同一模型在不同端点的真实窗口差异由渠道级承载。
 */

/**
 * providerSpec(provider) — spec with the context resolution chain (PROVIDER.md §6.15, 2026-10-23
 * 五级链). `providerSpecResolution` = the single traversal; `providerSpec` = `resolution.spec`.
 *
 * Chain (first available wins) — 单位差只在这里乘一次，且**解析乘点**全仓唯一（本函数内 L1 ∥ L2 共用；
 * 展示面的另一次在 `formatDeclaredContextK`，不回写解析值）：
 *   L1 `providers[].modelContext[模型]`（人工声明，K）       → ×1024
 *   L2 `providers[].context`（旧键，K；仅未被 L1 点名的模型） → ×1024（同一乘点）
 *   L3 `/models` 自报（三字段任一，token）                   → 不乘
 *   L4 `MODEL_SPECS` 静态表（token）                          → 不乘
 *   L5 `DEFAULT_SPEC`（128K，token）                          → 不乘
 *
 * L2 位于 L3 之上：旧键也是人工声明（2026-10-23 17:30 裁定「人工声明 > 列表」），只是粒度不对、
 * 单位事故出过两次；`modelContext` 点名的模型一律走 L1，L2 不参与。L2 实际被用到时告警一次
 * （provider 名去重——装载期告警会在 L1 已完全覆盖时误报）。
 *
 * 量级守卫（R32）：L1 ∥ L2 的 K 值换算后 > 静态表 ×4（表无行时 = 4 × 128K）⇒ 照用 + 告警一次，
 * 不截断、不拒写——与 L3 的 4× 守卫对称。守卫住在核里：值可能来自手改 JSON（不经任何界面），
 * 端上守不到；手改 ∥ CLI ∥ VSC ∥ 桌面四条来源在这里同判。
 *
 * 同步纯函数、零 IO：L3 读 `model-context.mjs` 的模块级只读缓存（写面在 listModels 成功拉取时），
 * 未命中即落下一层——providerSpec 在请求热路径上（每请求算预算），async 等于把 IO 塞进请求路径。
 *
 * Returns a COPY ({ ...spec, context }) when L1 / L2 / L3 supplies the window — the shared spec
 * object from SORTED_SPECS ∥ DEFAULT_SPEC must never be mutated, or the override would leak across
 * providers (T-C1). No L1-L3 value ⇒ the shared spec object itself (zero-copy hot path). `maxOutput`
 * 与其余能力位仍取静态表 ∥ DEFAULT_SPEC（需求边界：不改 maxOutput 来源）。
 *
 * `source` 闭集五值（`windowSource` 的唯一来源，不并类）：`modelContext` ∥ `provider-override` ∥
 * `list` ∥ `spec` ∥ `default` ∥ `override`（fork 模型级覆写）。`warnUnknownModel` 只在链落到 L4/L5 时触发（L1-L3 供值时 128K 告警为假）。
 */
export function providerSpecResolution(provider) {
  const model = provider?.model ?? ""
  const hit = lookupSpec(model)
  const base = hit ?? DEFAULT_SPEC
  // L1 — 人工声明（按模型，K 单位）；L2 — 旧键（渠道级，K 单位）。两种「人工声明」粒度在这里合流：
  // **解析面的 ×1024 只出现在合流后的那一次换算上**（L3 起是 token，不乘）——加第二个解析乘点 = 下一次单位事故。
  // （展示面的 K→token 换算另在 `formatDeclaredContextK`，只出词、不回写解析值。）
  const manualK = manualContextK(provider)
  const legacyRaw = Number(provider?.context) // Number() 接受数字字符串（"128"）——旧键既有口径（code review #1）
  const legacyK = Number.isInteger(legacyRaw) && legacyRaw > 0 ? legacyRaw : null
  const kUnit = manualK ?? legacyK
  if (kUnit !== null) {
    if (manualK === null) {
      warnContextOnce(
        `legacy-context\0${provider?.name ?? ""}`,
        `[config] provider "${provider?.name}" uses the legacy context override (K units) for models not listed in modelContext — migrate to modelContext: { "${model}": ${legacyK} } (K units, same as this key)`,
      )
    }
    // R32 — 人工声明的量级守卫（L1 ∥ L2，与 L3 的守卫对称）：换算后 > 静态表 ×4 ⇒ 照用 + 告警一次，
    // **不截断、不拒写**（异常值也可能为真；截断 = 静默改写真事实）。守卫住核——值可能来自手改 JSON
    // （不经任何界面），端上守不到；四条来源（手改 / CLI / VSC / 桌面）在这里同判。去重键 = 渠道 + 模型 + K 值。
    const declaredTokens = kUnit * 1024
    if (declaredTokens > base.context * 4) {
      warnContextOnce(
        `declared-over-4x\0${provider?.name ?? ""}\0${model}\0${kUnit}`,
        `[config] model "${model}" on provider "${provider?.name ?? ""}" declares context ${kUnit}K (= ${declaredTokens} tokens), over 4x the spec value ${base.context} — using the declared value as-is (not truncated)`,
      )
    }
    return { spec: { ...base, context: declaredTokens }, source: manualK !== null ? "modelContext" : "provider-override" }
  }
  // L1.5 — fork 模型级覆写（全局 modelOverrides · 2026-10-24 重植）：context 叶在场 ⇒ 用之（源 = "override"）。
  // 层序 = L1（provider+model 最具体）> L2（渠道级旧键）> 本层（model 全局）。composeSpec 的浅合并管 spec 其余叶，
  // context 的层级仲裁在此（谁更具体谁赢——与 L1 ∕ L2 的合流判据同式）。
  const ovEntry = overrideFor(model)
  if (ovEntry && Number.isInteger(ovEntry.context) && ovEntry.context > 0) {
    const declaredTokens = ovEntry.context
    if (declaredTokens > base.context * 4) {
      warnContextOnce(
        `override-over-4x ${provider?.name ?? ""} ${model} ${declaredTokens}`,
        `[config] model "${model}" (modelOverrides key "${overrideKeyFor(model)}") declares context ${declaredTokens}, over 4x the spec value ${base.context} — using the declared value as-is (not truncated)`,
      )
    }
    return { spec: { ...base, context: declaredTokens }, source: "override" }
  }
  // L3 — 列表自报（token，不乘）；异常大值照用 + 告警一次（R27——截断 = 静默改写真事实）
  const listedTokens = listedContextTokens(provider)
  if (listedTokens !== null) {
    const staticValue = base.context
    if (listedTokens > staticValue * 4) {
      const endpoint = String(provider?.baseURL ?? "").replace(/\/+$/, "")
      warnContextOnce(
        `listed-over-4x\0${endpoint}\0${model}\0${listedTokens}`,
        `[config] model "${model}" on ${endpoint} reports context ${listedTokens}, over 4x the spec value ${staticValue} — using the reported value as-is (not truncated)`,
      )
    }
    return { spec: { ...base, context: listedTokens }, source: "list" }
  }
  // L4 — 静态表命中；L5 — DEFAULT_SPEC 兜底（未知模型告警只在这里）
  if (hit) return { spec: hit, source: "spec" }
  warnUnknownModel(model)
  return { spec: DEFAULT_SPEC, source: "default" }
}

export function providerSpec(provider) {
  return providerSpecResolution(provider).spec
}

/**
 * assistantToolCallMessage(response, spec) — the tool-round assistant message pushed onto the
 * machine line (D-CC22, #109 — live-push face of the echo-safety family; single construction
 * point, CONTEXT-COMPACTION.md §6.10 #9).
 *
 * `reasoningEcho:"required"` families (deepseek / kimi / mimo) MUST carry the reasoning echo on
 * every tool-call assistant message: the field is NEVER omitted — an absent/non-string
 * `response.reasoning` is echoed as `""` (2026-09-22 re-probe: value / missing field / empty
 * string all 200 — the 2026-09-20 "must be passed back" 400 was NOT reproduced). `optional` /
 * undeclared families (incl. DEFAULT_SPEC) never get the field (behavior byte-identical).
 *
 * 思考签名（PROVIDER.md §6.24）：`tool_calls[].extra_content` 在场才带（缺 ⇒ 键不存在——无签名上游键集逐字不变）。
 *
 * Callers (as-of 2026-10-10): thincoder-core/agent/turn-loop.mjs (main loop) · thincoder-core/advisor/loop.mjs
 * (review mirror) · bench/lib/client.mjs (bench client) — each passes its own spec face; VSC 转口
 * (`thincoder-vscode/src/specs.mjs` 的 `providerSpec` ∕ `assistantToolCallMessage` 再导出) 零调用点（父侧收口机械笔 · 可 revert）。
 */
export function assistantToolCallMessage(response, spec) {
  const msg = {
    role: "assistant",
    content: response.content || null,
    tool_calls: response.toolCalls.map((tc) => ({
      id: tc.id, type: "function",
      function: { name: tc.name, arguments: tc.arguments },
      ...(tc.extra_content ? { extra_content: tc.extra_content } : {}),
    })),
  }
  if (spec?.reasoningEcho === "required") {
    msg.reasoning_content = typeof response.reasoning === "string" ? response.reasoning : ""
  }
  return msg
}
