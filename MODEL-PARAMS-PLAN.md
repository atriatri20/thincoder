# 模型参数能力——后续版本计划（2026-10-10 探查定稿）

> **实施结果（2026-10-10 当日 · 全档落地 + 真机验证通过，见文末 §7）**：L1/L2/L3 核 + L4 桌面（两轮改形：行内图标钮 + 弹窗）+ L5 CLI + L6 文档全部完成；
> 实测恢复 18/24 模型识别（真机 51 行模型 K 徽标逐条正确）；桌面「编辑模型配置」弹窗 + 三条 IPC + 渠道级上下文窗口就位；
> CLI `/model → Model parameters…` 就位；真机 Electron 验证含真实写盘往返与收敛测量（净零残留）。挂账两件见 §7。

> 层 = 计划档（`what to build`）。落点全部经真机/源码实测，坐标即当前 `codex-ui` 分支（HEAD `4be4335d`）。
> 参照系 = ZCode（`C:\Users\18749\AppData\Local\Temp\zcode-ref` v3.14.3 源码快照 + 本机 `~/.zcode/v2/` 实档）。

## 0. 结论速览

用户主诉「反代带前缀的模型识别不了 ⇒ 上下文 ∕ 思考强度只能吃默认，设置里也没得设」是**两个独立缺陷叠加**，不是一个：

1. **识别缺陷（核查表）**：`lookupSpec` 只剥「第一个 `/` 前的命名空间」一次，`cn:` ∕ `global:` ∕ 多段 `a/b/c` 前缀一律漏 ⇒ 落 `DEFAULT_SPEC`（128K ∕ 32K ∕ 无思考）。
   实测用户 24 个在册模型 ID：**1 命中 ∕ 23 未命中**（见 §1.2）。
2. **覆盖缺陷（无用户覆写面）**：`MODEL_SPECS` 是源码硬表，用户改不了；且表本身也有真实缺行（`gpt-5.4` ∕ `gemini-3.5-flash` ∕ 点号名 `doubao-seed-2.1-pro`）。核无任何 `modelOverrides` ∕ alias 机制——warn 文案说的 "add an alias" **不存在对应入口**（`model-specs.mjs:286`）。
3. **桌面缺设置面**：CLI 有 `/model → Set context window`（`provider-admin.mjs:140-185`），桌面**零对位**；`provider:save` 不收 `context`，渠道表单无该字段，模型段只有候选网格 + 自定义 ID 行。
4. **思考强度「只能默认」的真因**：render-core 的 `effortDefault` 钩子**早已就绪**（`model-menu.mjs:363-375` + 回写门注释明写「行集 ∕ effortDefault 变化后落槽」），但**核与桌面从不供值**——`model:list` ∕ `model:catalog` 只投影 `{ id, effortEnum, thinkOff }`（`settings.mjs:96-99`），`composer-sync.modelRowOf` 遂无 `effortDefault` 可传 ⇒ 有档位枚举时钮恒显中性「—」。

**修复 = 四层**：①核查表泛化（识别）→ ②核新增用户覆写表 `modelOverrides`（覆盖）→ ③`reasoningEffortDefault` 上提并接线（思考强度）→ ④桌面「模型参数」设置段 + CLI 对位（设置面）。

## 1. 现状盘点（实测）

### 1.1 查表链
- `MODEL_SPECS`（`thincoder-core/model-specs.mjs:27-242`）：前缀匹配、长名优先（`SORTED_SPECS` 按前缀长度降序 `:255`）。
- `lookupSpec`（`:262-276`）：全名前缀命中；未命中**且含 `/`** 时剥**第一个** `/` 前段重试一次；再无 ⇒ `null`。
- `DEFAULT_SPEC = { context: 128_000, maxOutput: 32_000 }`（`:243`）——无 `thinking` ∕ 无枚举 ⇒ 下游思考全关。
- `providerSpec(provider)`（`:323-328`）：支持渠道级 `providers[].context`（**K 单位**，×1024 只在此处）——核里**唯一**的既有覆写面。
- 消费方 23 处（agent ∕ provider core ∕ context ∕ auto-think ∕ TUI ∕ VSC ∕ bench）；`specForModel(model)` 是**无 config 入参的纯查表**——这决定了覆写必须走「模块级注册」而非改签名。

### 1.2 用户模型实测（`specMatch` 逐名）
```
MISS cn:auto / cn:deepseek-v4-flash / cn:deepseek-v4-pro / cn:deepseek-v4.1-flash
MISS cn:glm-5.1 / cn:glm-5.2 / cn:glm-5.3 / cn:glm-5.3-flash / cn:hy3
MISS cn:kimi-k2.6 / cn:kimi-k3-1 / cn:minimax-m3 / cn:space-bunny / cn:hy4-preview
MISS global:deepseek-v4.1-flash / global:gpt-5.4 / global:glm-5.3 / global:kimi-k2.6
MISS global:gpt-5.6-sol / global:hy3 / global:gemini-3.5-flash
MISS qdcn/qfmodel / qd/qfmodel / cl/cline-free/deepseek-v4.1-flash
MISS doubao-seed-2.1-pro / step-5-preview / work
HIT  cbcn/glm-5.3   ← 唯一命中（单斜杠剥离恰好救回）
```
全部落 `128K / 32K / thinking=false`。CLI 启动刷屏的 `[config] model "..." not found in MODEL_SPECS`（用户第二张截图）即此。

### 1.3 泛化后能救回多少（原型验证）
把「剥第一个 `/` 一次」换成「**对每个 `:` ∕ `/` 边界切出的后缀逐一重试，取最长命中前缀**」后重测同一批：
**19 ∕ 27 恢复**（`cn:deepseek-v4.1-flash` → 1M ∕ 384K ∕ 档位 low,high,max；`global:glm-5.3` → 1M ∕ 128K；`cl/cline-free/deepseek-v4.1-flash` → 多段剥离命中）。
仍缺的 8 名 = **表真缺行**（`gpt-5.4` ∕ `gemini-3.5-flash` ∕ 点号名 `doubao-seed-2.1-pro`（表内是 `-2-1-`） ∕ `step-5-preview` ∕ `qfmodel` ∕ `space-bunny` ∕ `work` ∕ `auto`）——这部分只能靠用户覆写表兜（L2）。

### 1.4 桌面现状
- 设置段闭集 `SECTIONS` 八段 + 伪段两（`views/settings.mjs:36-53`）；模型段体 `settings-sections.mjs:98-128` = 当前读数 + 候选网格（`采用`）+ 自定义 ID 行。**无任何 context ∕ maxOutput ∕ effort 控件**。
- `modelEntry` 投影三键 `{ id, effortEnum, thinkOff }`（`src/main/settings.mjs:96-99`）——`effortEnum` 来自 `specForModel(id).reasoningEffortEnum`，未命中 ⇒ `[]` ⇒ 下拉无档可选。
- `composer-sync.mjs:102-122`：`modelRowOf` 组 `reasoning` = `"none"`（仅 `thinkOff`）+ `effortEnum`；注释自认「`effortDefault` 端无读数 ⇒ 键缺席」。
- `providers[].context` 在核里活着，**桌面完全不可见**（`provider:list` 投影无该键 ∕ `provider:save` 不收 ∕ 表单无字段 ∕ 状态行只显百分比不显窗口绝对值）。
- VSC 端有 `EFFORT_DEFAULT_PREFIXES` 端差表（`thincoder-vscode/src/specs.mjs:22-42`，含 `vendor/` 剥离同法）——**CLI ∕ 桌面无**，三端不同源。

## 2. ZCode 参考设计（怎么抄）

ZCode 的方案是**两层规则 + 一张兜底**，与 thincoder 的「硬表 + 前缀查」是同一问题的成熟形态：

| 维度 | ZCode 做法 | 出处 |
|---|---|---|
| 内置层 | 出厂规则集 `zcode-builtin.json`：`modelMatch` 正则 + 渠道模板，**首条 `".*"` 即兜底**（200K ∕ 32K ∕ `["disabled","enabled"]`） | `resources/config/provider/zcode-builtin.json:866-898` |
| 用户层 | 稀疏覆写档 `~/.zcode/v2/provider_config.json`，`modelConfigRules.providerModelRules` 按 `(providerId, modelId)` **精确键**；另有 `manualProviderModelRules`（手动固定，全叶物化） | `provider-config-file-codec.ts:112-124` ∕ `model-config.ts:392` |
| 前缀容忍 | **不剥前缀、不改真实 ID**——正则双侧宽松 `.*name(?:[.\-:/\[].*)?`，`global:gpt-5.4` 与 `vendor/gpt-5.4` 同命中 | `zcode-builtin.json:1446`（`gpt-5.4` 行） |
| 可编辑叶（白名单） | `contextWindow` ∕ `maxOutputTokens.max` ∕ `reasoningLevel.values`(+CEL 映射) ∕ 能力布尔若干 ∕ 图片·视频·PDF 输入 | `manual-model-config.ts:6-27` |
| 推理档位 | **有序自由字符串数组**（低→高），**无默认档**；CEL 表达式把档位映射成请求体字段 | `model-config.ts:21-34` ∕ `ProviderModelMetadata.ts:239` |
| 设置 UI | 「模型设置」页 → 每模型对话框：基本信息 → Token（上下文窗口 ∕ 最大输出）→ 高级（模态 ∕ 能力 ∕ 推理档位 chips 可拖排序 + 映射）；「智能配置 ↔ 手动固定」开关 | `ProviderModelMetadataDialog.tsx:175-364` ∕ `ProviderModelReasoningLevelEditor.tsx` |
| 文案 | `上下文窗口` ∕ `最大输出 Token` ∕ `推理等级（从低到高）`；帮助语明写「**请勿超过模型的实际上限**」 | `zh-CN.ts:3130-3143` |

**可直接移植的三条**：①兜底 + 覆写两层（不必做 regex 规则引擎，前缀匹配够用）；②覆写键 = 模型 ID（thincoder 的渠道级差异已由 `providers[].context` 承载，无需 ZCode 的 `(providerId, modelId)` 双键）；③「当前生效值 + 来源」可见 + 「重置为默认」——这是 ZCode 对话框「已匹配到智能配置」徽标的等价物，**比参数本身更重要**（用户现在完全看不见自己吃的是兜底值）。

**不必移植的**：CEL 映射编辑器（thincoder 的 `thinkApi` ∕ `reasoningEffortEnum` 已把机制编码成枚举，用户只需填档位名）；拖拽排序 chips（用简单增删即可，档位序由 `reasoningEffortEnum` 数组序表达）。

## 3. 方案（四层）

### L1 核查表泛化 —— 识别（`thincoder-core/model-specs.mjs` `lookupSpec`）
把「剥第一个 `/` 重试一次」泛化为**后缀扫描**：对全名内每个 `:` ∕ `/` 边界生成候选后缀，逐候选按前缀匹配，**取命中最长者（最具体）**。
- 纯函数、单点、**签名零变** ⇒ 23 个导入方零改；`specForModel(42)` 等既有断言不破。
- 保留 `kimi/kimi-k3` 显式行（发送径 `provider.core` 的 `isRouter` 依赖模型名含 `/` 判定——行注已说明，勿删）。
- **误命中防线**：候选后缀须**以在册名前缀开头**才算命中（前缀语义不变）；用 §1.2 真实 ID 表 + 反例（`cn:auto` ∕ `work` 必须仍 MISS）锁成回归测试。
- 同时改 `warnUnknownModel` 文案（`:286`）：不再说 "add an alias"，改指「`modelOverrides`（config.json）或桌面『模型参数』段」。

### L2 核新增用户覆写表 —— 覆盖（新 config 顶层键 `modelOverrides`）
```jsonc
"modelOverrides": {
  "global:gpt-5.4":   { "context": 1000000, "maxOutput": 128000, "thinking": false },
  "cn:auto":          { "context": 1000000, "maxOutput": 65536, "thinking": true,
                        "thinkApi": "effort", "reasoningEffortEnum": ["low","high","max"],
                        "reasoningEffortDefault": "high" }
}
```
- **生效序（低→高）**：`DEFAULT_SPEC` < `MODEL_SPECS` 命中 < **`modelOverrides`** < `providers[].context`（渠道级最具体，维持现状语义）。
- **装配方式（关键约束）**：`specForModel(model)` 无 config 入参 ⇒ 走**模块级单写者**注册：新导出 `setModelOverrides(table)`，由 `loadConfig()` 装配时调用（先例 = `model-specs.mjs` 的 `warnedModels` Set ∕ `theme.mjs` 单写者）。测试路径需配套 reset 出口（同 `_setConfigPathForTest` 族）。
- **加载期清洗**（先例 = `providers[].context` 清洗，`config.mjs:316-326`）：逐键逐叶类型校验，非法叶丢弃 + 一次性 warn，绝不 throw（D-S1 软失败范式）。
- **键匹配**：精确命中 > 前缀命中（长键优先）> 无；候选亦经 L1 的后缀扫描（`cn:deepseek-v4.1-flash` 可被 `deepseek-v4.1-flash` 键命中）。
- **可覆写叶**（对齐 ZCode 白名单，按 thincoder 字段名）：`context` ∕ `maxOutput` ∕ `thinking` ∕ `thinkApi` ∕ `thinkEnabledValue` ∕ `thinkAlwaysOn` ∕ `reasoningEffortEnum` ∕ `reasoningEffortDefault`（L3 新增） ∕ `multimodal` ∕ `tempRange` ∕ `partialMode` ∕ `prefixMode` ∕ `reasoningEcho` ∕ `format` ∕ `noUsageStream`。机制位（`partialMode` ∕ `prefixMode`）建议**首版只读展示不可编辑**（改错会静默坏续写）。
- `settings` 工具（`agent-tools/settings.mjs`）自动获得 `modelOverrides.*` 的可写路径（其类型表派生自 `DEFAULTS`，新增 `DEFAULTS.modelOverrides = {}` 即入表）。

### L3 `reasoningEffortDefault` 上提 + 接线 —— 思考强度
- 把 VSC 端差表 `EFFORT_DEFAULT_PREFIXES`（`thincoder-vscode/src/specs.mjs:22-42`）**上提进核**为 spec 字段 `reasoningEffortDefault`（三端同源）；VSC 端差表退场或保留为兼容壳（择一，勿双源）。
- `modelOverrides` 可覆写该字段。
- 桌面 `modelEntry` 投影扩键：`{ id, effortEnum, thinkOff, effortDefault, context, maxOutput, thinking, source }`（**纯增键**，渲染面零破坏）；`source` = `"builtin" | "override" | "default"`（L4 的「来源」徽标数据源）。
- `composer-sync.modelRowOf` 透传 `effortDefault` ⇒ render-core `effortSelection(levels, current, registeredDefault)` **现成生效**，钮显真档而非「—」。**render-core 零改**——钩子本就是为它留的。
- **落槽语义**：`applyModels` 的 drift-only 回写门会在首次显示默认档时落槽一次（注释已明写「行集 ∕ effortDefault 变化后落槽」——符合既有设计）；用户显式选 `off`（槽值 `"off"` → 读回 `"none"`）时因 `"none" ∈ levels` 被保留，**不会被默认档压过**。须复跑 fbc38896 的收敛验证（切会话 12 次静置 6s 零变异）防档位震荡回归。

### L4 桌面设置面（用户主诉的「设置项」）
新增**数据段 `modelParams`**（词面「模型参数」，进 `SECTIONS`；同步补 `NAV_SECTIONS` 词键），段体：
- **上：模型清单**（`model:catalog` 全渠扇出，含未命中模型），支持过滤；每行显 `渠道 · 模型 ID` + **来源徽标**（`内置` ∕ `已覆写` ∕ `默认兜底`）+ 生效 `ctx ∕ out` 摘要。
- **下：选中模型参数表单**——上下文窗口（token 全量，副标 `= N K`）、最大输出 Token、思考（`不支持` ∕ `可关` ∕ `始终开`）、推理档位列表（增删 + 顺序 = 强度低→高）、默认档（下拉，选项 = 档位列表）；**「重置为默认」钮**（删 `modelOverrides` 键）。
- **校验**：正整数门（ZCode 同款文案「必须是正整数」）；档位非空 ∕ 不重复；超上限仅警告不拦（ZCode 帮助语口径「请勿超过模型实际上限」）。
- **渠道表单补「上下文窗口（K 单位）」**（`settings-controls.mjs` 渠道自定义表单 + `provider:save` 载荷 + `provider:list` 投影）——CLI `setContextFlow` 的桌面对位。
- **新 IPC**（preload `CHANNELS` ∕ `ipc-registry` ∕ 渲染出口三处同拍）：`model:spec`（读解析值 + `source`）、`model:specSave`（写覆写，`writeConfigAtomic`）、`model:specReset`。
- **坑（在册）**：`views/settings.mjs` 的 `model` 切片是**显式字典**——新数据段必须同步补 `model` 初始化键，否则构树抛 TypeError 且**异常被静默吞**（点击零反应零报错）；`SETTINGS_KEYS` 需含新切片键以触发段体重绘。
- i18n 词表 zh ∕ en 两语同拍（新段名 ∕ 字段名 ∕ 来源徽标 ∕ 校验语）。

### L5 CLI 对位
- `/model` 菜单加「Model parameters」流：选模型 → 显「生效值 + 来源」→ 逐项编辑（context ∕ maxOutput ∕ 思考 ∕ 档位 ∕ 默认档）→ 写 `modelOverrides`（先例 = `provider-admin.mjs` 的 `setContextFlow` 形态，同一 `persistRaw` + 内存镜像双写）。
- 保留渠道级 `setContextFlow`，文案指向新增的模型级入口（两者分工：渠道级 = 端点差异，模型级 = 模型能力）。

### L6 文档 + 测试
- `docs/core/design/MODEL-SPECS.md`：新增查表泛化 + `modelOverrides` 表 + 生效序 + 字段档级标注。
- `docs/core/design/CONFIG.md`：登记新顶层键。
- `docs/desktop/design/PROJECT.md` + `IPC.md`：新设置段 ∕ 三条新通道 ∕ 段体切片键。
- 测试：`thincoder-core/test/` 新增（a）后缀扫描真值表（含 §1.2 全表 + 反例）（b）覆写清洗 ∕ 生效序（c）`providerSpec` 优先级不回归；复跑 `docs/batches/2026-09-29-core-carryover.test.mjs`（`specForModel(42) = DEFAULT_SPEC` 等）与 `2026-09-29-provider-config-family.test.mjs`（`specMatch` 漂移白名单「只减不增」——泛化只会让命中变多 ⇒ 白名单收缩 = 合规方向）；桌面 `tools/web-quickcheck`；CLI 端同款。

## 4. 分档实施

| 档 | 内容 | 交付面 | 量 |
|---|---|---|---|
| 一 | L1 查表泛化 + warn 文案 + 真值表测试 | 核 | ~1–2h |
| 二 | L2 `modelOverrides` + L3 `reasoningEffortDefault` 上提 + `loadConfig` 装配 + 清洗 + 测试 | 核（三端自动受益：CLI ∕ VSC 立刻吃到正确 ctx ∕ 档位） | ~半天 |
| 三 | L4 桌面「模型参数」段 + 渠道 ctx 字段 + 三条 IPC + i18n + quickcheck | 桌面 | 1–2 天 |
| 四 | L5 CLI 流 + L6 文档 | CLI ∕ docs | ~半天 |

**档一 + 档二就能消掉用户主诉的「上下文 ∕ 思考强度只能吃默认」**（识别 + 覆盖 + 默认档接线全在核里，桌面只需档三的 UI 才能「设」，但改 config.json 已立即生效）。建议档一档二先合一个包（x.12），档三档四随后。

## 5. 待裁定

1. **覆写键粒度**：模型 ID 级（本档推荐——前缀本就在 ID 里，跨渠道差异归 `providers[].context`）vs `(渠道, 模型)` 双键（ZCode 形，更精确但新表结构更重）。
2. **上下文窗口单位**：token 全量（ZCode 形，表单主输入）vs K 单位（CLI `providers[].context` 形）。本档推荐**表单用 token 全量 + 副标 K**，渠道级字段沿用 K 不变（避免两套语义打架，但两处输入单位不一致需在文案里点明）。
3. **表缺行是否补**：`gpt-5.4` ∕ `gemini-3.5-flash` ∕ 点号名 `doubao-seed-2.1-*` ∕ `step-5-*` 等。本档推荐**先靠覆写表兜、按需再补行**（补行需逐条取证分档，成本高；覆写表已能让用户自救）。
4. **机制位是否开放编辑**：`partialMode` ∕ `prefixMode` ∕ `reasoningEcho` 改错会静默坏续写 ∕ 回话。本档推荐**首版只读展示**。

## 6. 参考

- 核：`thincoder-core/model-specs.mjs` ∕ `model-ref.mjs`（首冒号分割，多冒号模型名合法——`a:b:c` ⇒ model=`b:c`，与 `cn:` 前缀不冲突） ∕ `config.mjs:316-326`（渠道 ctx 清洗先例） ∕ `think-off.mjs`
- 桌面：`src/main/settings.mjs:96-99`（modelEntry 投影） ∕ `src/main/providers.mjs:76-106,137-166` ∕ `renderer/views/settings.mjs:36-53` ∕ `renderer/views/settings-sections.mjs:98-128` ∕ `renderer/composer-sync.mjs:102-122`
- render-core：`composer/model-menu.mjs:363-375`（`effortSelection` 三态） ∕ `:395-442`（`applyModels` drift-only 回写门）
- CLI：`src/tui/provider-admin.mjs:140-185`（`setContextFlow` 形态） ∕ `src/tui/model-picker.mjs:141,258`
- VSC 端差表：`thincoder-vscode/src/specs.mjs:22-58`（`EFFORT_DEFAULT_PREFIXES` + `vendor/` 剥离）
- ZCode：`packages/shared/src/model-config.ts:21-115` ∕ `packages/provider/src/config/model-config.ts:346-457` ∕ `packages/provider/src/config/manual-model-config.ts:6-27` ∕ `packages/ui/src/settings/model-provider-section/*` ∕ `resources/config/provider/zcode-builtin.json:866-898,1446` ∕ 本机 `~/.zcode/v2/provider_config.json`
- 在册坑：fbc38896（推理档位震荡死循环——回写门 drift-only ∕ 并发回执值等门）；`views/settings.mjs` 显式字典缺键 ⇒ 静默 TypeError

## 7. 实施结果（2026-10-10）

### 已落地（档一 ~ 档四）

| 层 | 落点 | 验证 |
|---|---|---|
| L1 查表泛化 | `thincoder-core/model-specs.mjs` `prefixCandidates` / `lookupSpec`（边界后缀扫描，命中前缀最长者胜）；`warnUnknownModel` 文案改指 `modelOverrides` | 真值表 8 用例；用户 24 名 **1 → 18 命中** |
| L2 覆写表 | 同档 `setModelOverrides` / `getModelOverrides` / `overrideKeyFor` / `sanitizeOverride`；`thincoder-core/config.mjs` `DEFAULTS.modelOverrides` + `loadConfig` 装载期注册 | 核测试 + `loadConfig` 端到端（覆写驱动 `compactThreshold` = 600000 实测） |
| L3 默认档上提 | 同档 `EFFORT_DEFAULT_PREFIXES` + `effortDefaultFor`（用户覆写优先） | 核测试；桌面 `modelEntry` 投影 `effortDefault` |
| L4a 投影 + 接线 | `thincoder-desktop/src/main/settings.mjs` `modelEntry` **扩五键**（`effortDefault` ∕ `context` ∕ `maxOutput` ∕ `thinking` ∕ `source`）；`renderer/composer-sync.mjs` `modelRowOf` 透传 `effortDefault`（**render-core 零改**） | 桌面快筛 9/9 |
| L4b 设置面 | **用户裁定改形（2026-10-10 二轮）：不作独立段** —— 模型段每行加「编辑」图标钮 + 「采用」同拍改图标钮（原文字胶囊占宽）+ 上下文 K 徽标；弹窗体 = `renderer/views/settings-sections-modelparams.mjs`（宿主 = 既有 `settings-modal.mjs` 单例，与设置组弹窗同宿主不同源、按 `settings.modelParams.open` 二选一）；`mount-settings-reads.mjs` `loadModelParams`（切片 `{open,id,spec}`，读成就地改写行六键）；`mount-settings-exits.mjs` 四出口（开 ∕ 关 ∕ 保存 ∕ 重置）+ Esc 闸；`beauty.css` 图标钮 ∕ 徽标 ∕ 弹窗体样式；`i18n-settings.mjs` 24 键 × 两语 | 视图树探针；**真机浏览器驱动**（playwright-core + 既有 web 快筛 serve 端）：行徽标 `1M ∕ 256K ∕ 128K`、图标钮 26×26 且 glyph 出自 CSS `content`、已覆写行编辑钮染主题色、弹窗 `role=dialog` ∕ 字段 ∕ 草稿键 ∕ 出口锚全对、保存载荷 `{id,patch}` 逐叶正确（`thinking:always` ⇒ `thinkAlwaysOn:true`）、重置载荷 `{key}`、三关关窗、保存钮 accent 实底 ∕ 读数行去盒 |
| L4c IPC | `model:spec` ∕ `model:specSave` ∕ `model:specReset`（preload `CHANNELS` + `ipc-registry` `HANDLERS` + `ipc-relays` 转口）；写后 `refreshOverrides` 重注册核表 | 通道三处同拍；handler 实测 |
| L5 CLI | `thincoder-cli/src/tui/provider-admin.mjs` `setModelParamsFlow` + `promptModelParamPatch` + 纯 helper `setOverrideFields` / `removeOverrideKey`；`model-picker.mjs` 菜单项 + 分派 + 导出面 | `check-syntax` 121 档 OK；纯 helper 六径探针（建 ∕ 并 ∕ 清叶 ∕ 删键收口 ∕ 前缀键 ∕ 畸形表归一） |
| L6 文档 | `docs/core/design/MODEL-SPECS.md` §17；`docs/core/design/CONFIG.md` §6.4 | doc-check EXIT 0（悬空 0 ∕ 行宽 0） |

**验证总账**：核测试 8/8 · 桌面快筛 9/9 段（0 页错 0 控制台错）· CLI syntax 121 OK · doc-check 悬空 0 ·
三个相关批次测试（`core-carryover` ∕ `provider-config-family` ∕ `parity-b10-ui-w3`）通过数**与基线逐字同值**
（其既有红为上游存量，非本批）。

**真机 Electron 验证（2026-10-10 · CDP `--remote-debugging-port=9333` + `playwright-core connectOverCDP` · 用户真实 config）**：
① 推理档下拉（原空）—— `global:deepseek-v4.1-flash` 现出 **关闭 ∕ 低 ∕ 高 ∕ 最大** 四档（当前值 `最大` 打勾）；
另一项目会话 `cbcn/deepseek-v4.1-flash` 显示 `低` —— 前缀模型档位真的通了。
② 设置页模型段 **51 行**，K 徽标分布 `128K×24 ∕ 1M×16 ∕ 256K×7 ∕ 1.1M×3 ∕ 500K×1`（`cn:deepseek-v4.1-flash` 1M、
`cn:glm-5.3` 1M、`cn:hy3` 256K、`global:gpt-5.6-sol` 1.1M —— 改动前一律 128K）。
③ 「编辑模型配置」弹窗读数为真值：`内置` 徽标 + **当前生效 上下文窗口 1000000 · 最大输出 Token 384000** +
档位 `low, high, max` + 默认档 `high`。
④ **真实写盘往返**：弹窗存 `context=524288` ⇒ 盘上 `modelOverrides["global:deepseek-v4.1-flash"]` 落键、弹窗徽标翻「已覆写」、
生效值随动 ⇒ 点「重置为默认」⇒ 盘上该键**已删**（净零）。
⑤ **收敛**：静置 7s 推理钮变异 **0**；项目切换往返（跨两项目 14 次点按）后稳态段变异 **0**，无 fbc38896 类震荡。
⑥ 全程 `pageerror` **0**；应用主进程日志除既有 `not found in MODEL_SPECS` 警告外零异常。
⑦ **零残留**：测试后 `~/.thincoder/config.json` 与测试前备份**逐键全等**（`modelOverrides` 仍 `null`、`defaultModel` 未动）。

### 七轮：VSC 端差表退场（2026-10-10 · 挂账清零）

`thincoder-vscode/src/specs.mjs` 的本地 `EFFORT_DEFAULT_PREFIXES` 表 + `effortDefaultFor` **已删**，改为
**转口核 `effortDefaultFor`**（`specForModel` 保留「核表 + `reasoningEffortDefault`」附加形 ⇒ 导出面零改，
消费链 `provider-probe-window.mjs:67` → `webview/settings-state.js` `effortSelectView` 不变）。
**原先的顾虑（「VSC 的 `@thincoder/core` 是 registry 版 ⇒ 导核新导出会断链」）经查证不成立**：
`LOCAL-NOTES.md`「core 源码联接（关键）」明写 `node_modules/@thincoder/core` 必须指向本地源码
（验证例 `assistantRealFrame` 即 fork 专属导出），`scripts/dev-link.mjs` 亦按 `package.json` 声明自动建三链
（cli:core ∕ vscode:core+render-core ∕ desktop:core+render-core）⇒ 端侧导核新导出与既有 `specForModel` ∕
`providerSpec` **同径、零新增前提**。
**退场顺带修掉一处真实分叉**：本轮给核表补的 `deepseek-v4.1-flash` 行当时只进了核 ⇒ VSC 仍缺该行（该模型 VSC
下拉显占位）；转口后两端一致。实测（`node -e import('./src/specs.mjs')`）：`deepseek-v4.1-flash` ∕
`global:deepseek-v4.1-flash` → `high`；`cn:glm-5.3` ∕ `cbcn/glm-5.3` → `max`（核的后缀扫描同时覆盖 VSC 原
「剥第一个 `/`」法）；`cn:auto` ∕ `gpt-4o` → 无默认（正确）；`providerSpec` ∕ `effortEnumForModel` 导出不变。

**挂账：零**（本轮清空）。

### 六轮：档位钮显示层收正（2026-10-10 · 原「未知模型显示 —」挂账，参照 ZCode 定案）

原挂账写法（「未知模型档位钮显示 `—` 而非 `关闭`」）**经复查是伪命题**：把 `off` 写进会话槽会经
`session-lifecycle.mjs` ⇒ `provider.thinking = thinkOffShape(spec)` ⇒ `provider/core.mjs` 的
`if (provider.thinking) body.thinking = …` **真的进请求体** —— 对未知模型等于替服务端把思考关掉（且严格网关
可能 400）。故「显示 `关闭`」不是修而是退步。**ZCode 的答案**（`packages/ui/src/chat-input-toolbar/`）：
`thoughtLevelOptions.ts` 的 `THOUGHT_LEVEL_LABEL_IDS` 把 `disabled/false/no/none/nothink/off…` 归一到同一个
「关闭」词条（**别名归一在显示层**，不动内部 token）；`ThoughtLevelCycleControl.tsx` 对未选态用
`chat.toolbar.thoughtLevel.placeholder`（「选择思考档位」），并注「未选／失效及关闭值始终为零进度，
不能把缺失选择投影成首档」；`resolveModelThoughtOption` 在模型未声明档位时返回 `null`（**整个控件不渲染**）。
**本轮落地**（纯显示、零回写）：三处显示径收敛为单点 `reasoningBtnText` —— `off` 归一 `none` 后经
`reasoningLabel` 出词（原为硬编码英文 `"off"` 字面，zh 界面露英文）、中性档 ⇒ 新键 `reasoning.unset`
（「未设置」/ "Not set"，桌面 ∥ VSC 两语同增）；并收正 `active` 高亮判据（`visible !== "off"` ⇒ `"none"`，
原判据对「关闭」恒真）。真机实测：选「关闭」⇒ 钮「关闭」且不亮；换 `cn:minimax-m3` ⇒ 钮「未设置」且不亮。

### 四 ∕ 五轮增补：常见档位下拉（2026-10-10 · 用户「还得看多少位数」+「下拉框要和别的统一样式」）

上下文窗口 ∕ 最大输出 Token 两输入挂档位 `select`。**形态 = 快填 `select` + 值持有 `input` 两件**
（四轮原用 `datalist`，五轮打回改形）：`datalist` 弹层由浏览器原生绘制、**CSS 无法着色** ⇒ 与全站 `select`
（`beauty.css` `select { appearance: base-select }` + `::picker(select)` 卡形）不同族；改 `select` 自动吃全站
统一样式（零本档样式），而 `select` 不能承载任意值 —— 上下文有大量非整档实值（`1_050_000` ∕ `1_048_576` ∕
`524_288`）⇒ **`select` 只当快填菜单（选完自复位、不持有值）、`input` 仍是唯一值持有者**。
**邻接不变量**：档位 `select` 恒为其值输入框的紧邻后继兄弟（出口族 `onPickTier` 按 `previousElementSibling`
解析 —— 三处布局各异，且渠道表单两形的 `id="context"` 重复 ⇒ 不能按 id ∕ name 定位）。档位项文本 =
`友好名 · 精确值`。单源 = `thincoder-desktop/renderer/context-tiers.mjs`；三消费面 = 弹窗 token 两字段
（32K…2M ∕ 8K…384K）· 渠道表单 K 字段 · 渠行内 ctx 编辑态（32…1024）。CLI 端差 = 档位写进提示行。
**浏览器驱动已验证**：三处 `select` 均 `appearance: base-select`（与 agent 参数下拉同族）、邻接不变量成立、
选档位后输入框得精确值且 `select` 自复位、渠行窄档（7rem）生效、零页错；picker 弹层截图确认为卡形 + 选中项
accent 底 + ✓。

### 环境改动（可回退）

- `thincoder-desktop/node_modules/@thincoder/{core,render-core}`：`materialize-deps.mjs` 重物化（核改动对运行端生效）；
  恢复 = `node ../scripts/dev-link.mjs --force`。
- `thincoder-cli` ∕ `thincoder-vscode` 的 `@thincoder/*` **dev 链（junction）已建**（`scripts/dev-link.mjs`）——
  此前 CLI 依赖缺失 ⇒ CLI 无法运行（本批为验证 CLI 改动而建；VSC 两条同批创建，非必需）。
