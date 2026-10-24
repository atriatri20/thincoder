# designToken 硬化与生命周期（ENG-TOKEN-BINDING）· 工程模式凭证链板块

> 板块 = **工程模式凭证链（token 生命周期 + 写权门禁）**——token 是什么 · TTL 与格式 · 跨模式存活 · 清理时机 · **写权机械门（token 门 + D5 冻结窗口 + docRoot 声明面）**。
> **v2 就地更新**：M4 模块设计语义融入（写权门禁；原旁路档 `_archive/modules/ENGINEERING-MODE-V2-MODULE-WRITE-GATE.md` 已归档 `_archive/modules/`）。
> 相邻权威 = `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`（结算的持久化 / 回读 / 消费面——结算**判定**语义〔echo 即裁决 / 回显链判定〕= 本档 §5 辖域；两辖域互不重述，D2）· `docs/core/design/CONSULTATION.md`（评审引擎）。
> 需求侧 = `docs/core/requirements/ENG-TOKEN-BINDING.md`。

## 1. designToken 是什么

**流程凭证**——「你评审过了吗？评过才给 token，才能 spawn eng-coder」。它是**防 agent 跳过评审步骤**的机制，**不是防人 / 防仿冒的密码学安全边界**。

**三条铁律（现行）**：

1. **语义 = 流程凭证，非安全边界**。HMAC / 加密因子 / 签名是 **security theater**——agent 只要看到因子就能仿冒生成，但那**无所谓**（机制目标是流程门，不是密码学安全）。token 格式 = `uuid:expiresAt`，**只有格式校验 + TTL，无签名**。
2. **生命周期 = 会话级流程凭证，跨模式存活**。token 绑定会话、随模式存活：**ON→OFF 不清、OFF→ON 不重评**（TTL 内上次评审 token 继续有效）。**仅 TTL 过期清**（三个时机见 §4）。会话切换（`/new`）仍清——会话切换不是模式切换。
3. **单一数据源 = 会话槽权威持久源 + 内存运行态**。slot 持久化是**跨重启 / 跨模式恢复的有意载体**，不是 bug；内存是运行态。一致性经恢复 TTL 过滤 + 清空语义保证——不得造成内存 / 文件双源不一致（结算面细节归 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`）。

**防误用纪律（违反即 bug）**：不加 HMAC / 内容绑定；spawn 时**从内存 Map 定位**而非自行签发。

## 2. 明确不做

- **内容绑定全套**（`normalizeForHash` / 头部簿记剥离 / `hashDocuments` / `docKey` 映射 / 交集作废 / 路径归一化）——用户实况否决：批次间文档必然变更，内容绑定会把「偶尔重评」变成「每批必重评」（收益反转）。
- `TOKEN_SECRET` 随机化、`eng(enter)` 用户同意门——仍留 TODO。

## 3. TTL 与 token 格式

- 默认 TTL **7 天**：`TOKEN_TTL_DEFAULT_MS = 7 * 24 * 3600 * 1000`（`thincoder-core/agent-tools/design-token.mjs:36`）。
- 配置覆盖：`agent.engTokenTtlMs`——运行期校验（`Number.isFinite(cfg) && cfg > 0`，**非法回退默认**），照抄 advisor `timeoutMs` 口径：`thincoder-core/agent-tools/design-token.mjs:39`（`effectiveTokenTtlMs`）。
- 格式：`${uuid}:${expiresAt}`——uuid 为 `[0-9a-f]{8}-…-{12}`，`expiresAt` 为数字毫秒时间戳。
- **格式 + 过期判定的单一权威** = `thincoder-core/token-ttl.mjs:42`（`tokenExpiryMs`）/ `:55`（`tokenExpired`）——由恢复过滤、开模式清理、spawn 门禁过期拒删槽共引（`thincoder-core/token-ttl.mjs:5`–`:8` 注释即此登记）。
- **过期判定只对格式合法的 token**判过期：格式 / 畸形串不在此清理（恢复时读回由门禁格式拒、门禁拒时也不删槽——防误删有效槽）。
- `validateDesignToken`（`thincoder-core/agent-tools/design-token.mjs:55`）= `tokenExpiryMs(token) !== null && expiry >= Date.now()`——**fail-closed**。

## 4. 生命周期（现行）

| 事件 | 行为 |
|---|---|
| 评审通过 | token 签发入槽（settle）——advisor 回包含 token ∧ 裁定行 pass（§5.2）即结算，pass 分支后签发 |
| ON→OFF | **不清**——有效 token 跨模式存活 |
| OFF→ON | **不重评**——上次评审 token 继续有效（TTL 内） |
| 重启 / 恢复 | **TTL 过滤**——过期不读回内存（丢弃，下次 save 自然清字段）；有效跨重启存活 |
| 开工程模式 | 清**过期** token（有效保留）——`eng` enter 真转换路径（`thincoder-core/agent-tools/eng.mjs:92`）· `/eng` ON 路径（`thincoder-cli/src/tui/cmd-eng.mjs:69`） |
| spawn 门禁 | 过期拒 + **顺手删该 designId 槽**（`thincoder-core/agent-tools/subagent-spawn.mjs:237`——**仅过期拒删**；mismatch / 格式拒**不删**） |
| 会话切换（`/new`） | 清 token（`resetSessionState`）——会话切换不是模式切换 |
| TTL | 7 天默认（可配），fail-closed 不变 |

**清理时机三处**（铁律 2）：① 恢复过滤（重启 / 恢复读回前逐槽校验，过期丢弃）；② 开工程模式清过期（遍历 Map 删过期，有效保留）；③ spawn 门禁过期拒时顺手删该 designId 槽（长跑不重启也清）。

## 5. 结算语义（echo 即裁决 · 签发 = 回显 ∧ 裁定行——§5.2）

- **token echo 即裁决**——advisor **仅在通过时**回显 token。
  - echo（全串 ∥ 截断形——§5.1）∧ 裁定行（§5.2）→ 入槽（designId 键）；非 echo → 剥离 token 文本 + **恒定未签发标记**（§5.1 ②）返回 findings，**槽不动**（失败的重评不作废任何既有槽）。
  - 实现：`thincoder-core/agent-tools/design-token.mjs:128`（`settleDesignReview`）。
- **未完成即不签发**：结算方收到「评审未完成」kind（`opts.incomplete`）⇒ 一律不签发（无论文本是否回显 token）——剥除回显 + 追加未签发提示，**不写槽、不关实例**（可重评）。
- 错误回包 / abort / 轮次耗尽**不作废**既有槽；`result === null` 守卫保留。
- 签发 / 校验 / 结算三函数的**宿主模块** = `thincoder-core/agent-tools/design-token.mjs`；`advisor-async.mjs` 仍 re-export（既有 import 面不变）。

### 5.1 回显链判定（截断容忍 / 恒定标记 / 剥离单源）

三条语义：

**① 截断回显 = 容忍（认 pass）**：回显判定 = 全串匹配（既有 `makeDesignTokenRegex`）**∨ 截断形**（原始评审文本含**本 token 的 uuid 值**——`uuid:expiresAt` 冒号前段；36 位随机值专属本 token 值，任何出现 = 部分回显）。截断形 ⇒ **认 pass**（回显仅通过时发生——批准意图已表达）：**槽存储恒全串**（引擎侧常量，不取回显值）；追加**截断标记**（②）；`[DESIGN-TOKEN:<uuid>]` 形与裸 uuid 残片**一并剥净**（③）。（签发仍以 §5.2 裁定行为必要合取。）

**② 恒定标记（逐字——机器可 grep；不得只在正文为空时出现）**：

- 非回显（全串与 uuid 均未见）——恒定追加：

```text
未回显有效 token——未签发 (no valid token echo — no design token was issued)
```

- 截断容忍（认 pass）——在 Approved 后缀**之前**追加：

```text
注：回显被截断（uuid 之后缺失或不符）——已按批准结算；全串 token 已签发 (note: truncated echo — the part after the uuid was missing or inexact; settled as approved; the full token was issued)
```

**标记位置不变式**：标记恒居 `approvedSuffix` **之前**——`stripApprovedSuffix`（`thincoder-core/agent-tools/design-token.mjs:31`）以「文本以 suffix 结尾」为精确截断判据（prior 清洗依赖此形）；任何在结算输出**尾部**追加文本的改动都不得破坏「suffix 恒居文末」。

**③ 剥离单源**：`stripDesignTokenEcho`（新增）——全串回显 + 截断形（`makeDesignTokenPrefixRegex` 前缀形）+ 裸 uuid 三剥（uuid = token 专属随机值 ⇒ 零附带）；
结算三分支 + 未完成径（`thincoder-core/agent-tools/design-token.mjs:133-140`）+ stale 径（`thincoder-core/agent-tools/advisor-settle.mjs:212-213`）+ D1 落盘失败径（`thincoder-core/agent-tools/advisor-settle.mjs:179-180`——pass 后落盘失败按原文重建，残片同须剥净）的剥离统一走该单源。

**D1 落盘失败径标记注记（有意策略）**：该径只剥净、**不追加截断标记 M2**——落盘失败 ⇒ 结算未成立、自带 D1 失败通知（非静默）；FR8① 截断标记语义（「按批准结算」）在该径不成立——免对盘误判。

**④ 回显指令加固（逐字——三档）**：

**a. Approval Signal 构建面**（`thincoder-core/advisor/messages.mjs` 句尾）：

```text
（:51——designId 在场形句尾）Copy BOTH values verbatim — every character, including the colon and the digits after the uuid inside the token brackets; a shortened echo is flagged as truncated.
（:52——token-only 降级形句尾）Copy it verbatim — every character, including the colon and the digits after the uuid; a shortened echo is flagged as truncated.
```

**b. 评审员系统提示**（`thincoder-core/prompts/`，单源）：

```text
（EN——`thincoder-core/prompts/advisor-design.md:24` 句内加固）Copy BOTH values verbatim — every character, including the colon and the digits after the uuid inside the token brackets; a shortened echo is flagged as truncated. The designId must be the LAST thing you output.
（EN——`thincoder-core/prompts/advisor-design.md`）两个值逐字复制——每个字符都在内，包括冒号与 token 方括号内 uuid 之后的数字位；截断回显会被标记。designId 必须是你输出的**最后**一样东西。
```

条件句面（凭证回显条件）= `docs/core/design/ADVISOR-CONVERGENCE.md` §2.5（本档不重述）。

**依据**：需求 `docs/core/requirements/ENG-TOKEN-BINDING.md:30`（FR6——「回显匹配……以代码判定为准」）+ `docs/core/requirements/ENG-TOKEN-BINDING.md:32`（FR8——回显异常零静默 × 复制纪律）+ `docs/core/requirements/ADVISOR-CONVERGENCE.md:86`（N7 零静默）。
**边界**：不改 token 格式 ∥ TTL ∥ 门禁恒等比对语义 ∥ 「非回显 ≠ 通过」本体。

### 5.2 裁定闸（VERDICT 机械闸）

**形** = 签发前过裁定闸——回显之外**追加必要合取**：

- **判据（机械——纯函数 `verdictGateFailure(rawResult)`；宿主 `thincoder-core/agent-tools/design-token.mjs`）**：回执文本**含 pass 裁定行 ∧ 不含 changes-required 裁定行**；两式逐字：

```text
VERDICT_PASS_LINE    = /^[ \t]*[*_`]*[ \t]*VERDICT:[ \t]*pass[ \t]*[*_`]*[ \t]*$/m
VERDICT_CHANGES_LINE = /^[ \t]*[*_`]*[ \t]*VERDICT:[ \t]*changes-required[ \t]*[*_`]*[ \t]*$/m
```

- **裁定行来源（提示词面既有逐字约定；本闸零新造提示词面要求）**：`VERDICT: pass` / `VERDICT: changes-required` = 评审员提示词既有的收尾裁决行——EN 运行期 `thincoder-core/prompts/advisor-design.md:20-22`；
  补充轮族三档同形（`thincoder-core/prompts/advisor-round1.md` 等——「`## Verdict Line`」节）。
  EN 逐字锚（`:20`）= 「Close your findings with a single verdict line — `VERDICT: pass` or `VERDICT: changes-required` — as the line immediately before the token echo」。
- **判定三值（机器序 = 先 changes、后 pass）**：含 changes-required（与 pass 并存亦然——fail-closed 方向）⇒ `"changes-required"`；否则缺 pass 行 ⇒ `"no-pass-line"`（**缺行 = 拒签**——fail-closed：提示词面既有「以单行裁决收尾」义务，缺行 = 不合规回执，不得铸）；含 pass ∧ 无 changes ⇒ `null`（过闸）。实现形（新导出；逐字——供直连单元测试，同 `stripDesignTokenEcho` 先例）：

```js
export function verdictGateFailure(rawResult) {
  if (typeof rawResult !== "string") return "no-pass-line"
  if (VERDICT_CHANGES_LINE.test(rawResult)) return "changes-required"
  return VERDICT_PASS_LINE.test(rawResult) ? null : "no-pass-line"
}
```
- **拒签效果**（合取不成立时）= 与「未完成」径同形：剥净回显（`stripDesignTokenEcho` 单源）+ 恒定标记（下）；**不写槽 ∥ 不关实例 ∥ 零 `_engDesignReviewed`**（修后重评）。
  输出构造 = `[stripDesignTokenEcho(rawResult, designToken).trim(), 标记].filter(Boolean).join("\n\n")`（M1 径同形——现体 `thincoder-core/agent-tools/design-token.mjs:148`）。
  恒定标记逐字（机器可 grep；`reason` = 上列二值之一；实现 = 常量 `VERDICT_GATE_MARK`，`NO_VALID_ECHO_MARK` 族邻位）：

```text
裁定非通过——token 未签发 (review verdict is not pass — no design token was issued; reason: <no-pass-line|changes-required>; the echoed token was stripped)
```

- **与回显链的并存关系（显式声明）**：回显链判定（§5.1——全串 ∥ 截断容忍 ∥ 恒定标记 ∥ 剥离单源）**本体零改**；签发判定式 = **回显 ∧ 裁定 pass**——本闸 = 回显路内追加的**必要合取**；非回显径（M1）与未完成径（§5）不达本闸、原样。
- **行形容忍边界**：行首 / 行尾空白与行两侧 markdown 强调符（`*` `_` 反引号）容忍；大小写按逐字面（不折叠——`VERDICT` 大写 ∥ `pass` / `changes-required` 小写 = 提示词面既有逐字形）；行序与「裁定行紧邻回显」不校验；不区分正文 ∥ 代码块（同形行即命中——误引同形行按方向拆分：误引 `changes-required` 同形行 ⇒ 拒（fail-closed、重评可解）∥ 误引独立 `pass` 同形行（无 changes 行）⇒ 可能放行（回显在场即签发））。
- **提示面随动（产品码——`thincoder-core/advisor/messages.mjs` `buildDesignApprovalBlock`（`:49-59`））**：`echo` 串之后新增独立数组项（现体 `:53-58` 返回数组内、`echo` 与 `🟡` 段之间——designId 在场形 ∥ token-only 降级形两分支同载，单点实现；净 +1 行）；逐字：

```text
The verdict line is checked mechanically: without a `VERDICT: pass` line, or with a `VERDICT: changes-required` line, no token is issued even when the token is echoed.
```

  提示词档（`advisor-design.md` EN）既有「pass ⇒ 才回显」句已言明耦合——**零改**（如需同句加固 ⇒ 内容依据 = 机制文档）。
- **实现坐标（钉死——实施者零开放结构决定）**：`settleDesignReview`（`thincoder-core/agent-tools/design-token.mjs:128`）回显分支内——现体 `:146-149` 非回显径 return 之后 ∥ `:158` `agent._engDesignTokens ??= new Map()` 之前（闸不过 ⇒ 原地 early return 拒签）。
  两常量 + `verdictGateFailure` + 标记常量同宿主（`NO_VALID_ECHO_MARK` 族邻位——现体 `:95-96`；函数导出——直连单元测试，同 `stripDesignTokenEcho` 先例）。
  同步径（`thincoder-core/agent-tools/advisor.mjs:261`）∥ 异步径（`thincoder-core/agent-tools/advisor-settle.mjs:155`）共用本单点——**零第二签发点 ∥ 零调用点改**（re-export 面 `advisor-async.mjs:45` 零触）。
- **依据**：需求 = `docs/core/requirements/ENG-TOKEN-BINDING.md` FR6 / FR8（回显以代码判定为准 + 回显异常零静默）。
- **验收**：红 = `VERDICT: changes-required` + 回显（pass 并现亦然）⇒ 拒签（槽零写 ∥ 实例保持 ∥ 标记逐字）∥ 无裁定行 + 回显 ⇒ 拒签；绿 = 裁定 pass + 回显（全串 ∥ 截断）⇒ 照旧签发（回显链回归零改）。
- **边界**：不改 token 格式 ∥ TTL ∥ 回显链本体 ∥ 槽 / 实例语义；行形判据以「行形容忍边界」为限（无更多宽容面）。**残余声明**：红项计数不入机械判据（表形浮动不可机判）；「列着红项」的机检覆盖经裁定行代理；误引独立 `pass` 同形行（无 changes 行）⇒ 放行方向残余（回显在场即签发——行形判据不辨引用语境）。

## 6. 机制面

### 6.1 实现坐标

| 面 | 落点 | 实核 |
|---|---|---|
| TTL 默认 + 配置覆盖 | `thincoder-core/agent-tools/design-token.mjs:36` · `:39` | 在位 |
| 签发（无签名） | `thincoder-core/agent-tools/design-token.mjs:46` | 在位 |
| 格式 + 过期单一权威 | `thincoder-core/token-ttl.mjs:42` · `:55` | 在位 |
| fail-closed 校验 | `thincoder-core/agent-tools/design-token.mjs:55` | 在位 |
| 结算（echo 即裁决） | `thincoder-core/agent-tools/design-token.mjs:128` | 在位 |
| 回显链判定面（截断容忍 ∥ 恒定标记 ∥ 剥离单源——§5.1） | `thincoder-core/agent-tools/design-token.mjs`（`stripDesignTokenEcho` · `makeDesignTokenPrefixRegex`——结算三分支 + 未完成径消费）· `thincoder-core/agent-tools/advisor-settle.mjs:179-180`（D1 落盘失败径消费）· `:212-213`（stale 径消费） | 受理（已落） |
| 裁定闸（VERDICT 机械闸——§5.2） | `thincoder-core/agent-tools/design-token.mjs`（`verdictGateFailure`——结算回显分支消费）· `thincoder-core/advisor/messages.mjs`（`buildDesignApprovalBlock` 句尾追加） | 已落（#940） |
| 开模式清过期（工具面） | `thincoder-core/agent-tools/eng.mjs:92` | 在位 |
| 开模式清过期（TUI 面） | `thincoder-cli/src/tui/cmd-eng.mjs:69` | 在位 |
| 恢复过滤 | `thincoder-core/session-lifecycle.mjs:123`–`:124` | 在位 |
| `/new` 清 token | `thincoder-core/session-lifecycle.mjs:303`–`:304` | 在位 |
| 门禁过期拒删槽 | `thincoder-core/agent-tools/subagent-spawn.mjs:237` | 在位 |
| 槽清理原语 | `thincoder-core/token-ttl.mjs:65`（`removeDesignTokenSlot`）· `:90`（`purgeExpiredDesignTokens`） | 在位 |
| TUI OFF 不清 token | `thincoder-cli/src/tui/cmd-eng.mjs`（OFF 路径） | 在位 |

### 6.2 落地状态

R16 语义（跨模式存活 + 三清时机 + 单一权威）**已全部落地**，与本文一致——实核于上表各坐标。

### 6.3 VSC 端接线

> **语义两端 lockstep**（流程凭证 / 无签名 / 跨模式存活 / 仅 TTL 过期清 / slot 权威持久源）；VSC 模块落点与持久化面独立
> （slot 经 `session-io` / `setSlotEngDesignTokens` 多槽写——非 CLI 单源 persistState 布局）。结算 / 持久化细节归 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §6.3（本档不重述，D2）。

| 面 | VSC 落点 |
|---|---|
| TTL 默认 + 配置覆盖 | 现体 = 核 `thincoder-core/agent-tools/design-token.mjs:36`（`TOKEN_TTL_DEFAULT_MS` = 7 天）· `:39`（`effectiveTokenTtlMs`——`Number.isFinite(cfg) && cfg > 0`，非法回退默认） |
| 签发（无签名 uuid:expiresAt） | 核 `thincoder-core/agent-tools/design-token.mjs:46`（`generateDesignToken`） |
| 格式解析单一源 | 核 `thincoder-core/token-ttl.mjs:42`（`tokenExpiryMs`——fail-closed：段数≠2 / 空 uuid / isNaN 全返 null）· `:55` |
| 过期判定 + validate + 回显匹配 | 核 `thincoder-core/agent-tools/design-token.mjs:55`（`validateDesignToken`——fail-closed）· `:61`（`makeDesignTokenRegex`——转义整 token 回显匹配） |
| 恢复过滤（逐槽 TTL 校验） | 端壳 hydrate：`thincoder-vscode/src/agent/agent-state.mjs:57-75`（`reconcileEngDesignTokens`——逐槽 TTL 校验、过期丢弃、内存项保留）· `:70-71`（legacy 单值一次性迁移读） |
| 开工程模式清过期 | 现体 = 核 `thincoder-core/agent-tools/eng.mjs:92`（`purgeExpiredDesignTokens`——仅删过期、有效保留） |
| spawn 门禁族 | 现体 = 核 `thincoder-core/agent-tools/subagent-spawn.mjs:100`（`resolveDesignSlot`——精确槽 / 单槽 / 多槽拒；内存 miss 回读槽）· `:237`（仅过期拒才删槽——`removeDesignTokenSlot`）· `thincoder-core/agent-tools/design-slots.mjs:110`（`executeConsumeDesignAction`——链终消费 + 落盘对称） |
| 内存运行态 + 回合尾落盘 | 端壳 `thincoder-vscode/src/agent/setup.mjs:53`（`_engDesignTokens` 惰性 Map——每 run 重建 agent 后水合）· `:191`（`setSlotEngDesignTokens` 回合尾 flush） |
| 多槽持久化原语 | `setSlotEngDesignTokens` = 端侧定义（`thincoder-vscode/src/extension/session-slot-write.mjs`）；`mergeEngTokensForSave` = 端侧转口 re-export（别名 `engTokensMergeForSave`）→ 核 `thincoder-core/session-slot-write.mjs` 定义 |

**VSC 侧差异**（有意——源码注释逐字登记）：① slot 持久化 = **会话槽单点**（现体 = `thincoder-vscode/src/agent/setup-tooltable.mjs:85-94`）；② spawn 门禁 `resolveDesignSlot` 读当前 run 内存 Map、**miss 时回读槽文件权威台账**（结算面——`DESIGN-TOKEN-SETTLEMENT.md` §6.3）。

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-E1 | token = **无签名流程凭证**（`uuid:expiresAt`） | agent 能看到因子即可仿冒——签名只是 security theater |
| D-E2 | 内容绑定**整套否决** | 文档每批必变 ⇒ 内容绑定把「偶尔重评」变「每批必重评」（收益反转） |
| D-E3 | 生命周期 = **跨模式存活**（ON↔OFF 不清不重评） | 模式切换不是评审失效的理由 |
| D-E4 | slot 持久化 = **有意载体**（不是 bug） | 跨重启恢复是刚需 |
| D-E5 | 过期判定**只对格式合法 token**生效；门禁拒时**仅过期拒才删槽** | 畸形串无从判定——删了会误删有效槽 |
| D-E6 | 清过期只在**三个时机**（恢复 / 开模式 / 门禁过期拒） | 长跑不重启也要清 |
| D-E7 | 结算三函数**拆出独立模块**（design-token.mjs）+ re-export 保 import 面 | 独立模块 = 单一职责 |
| D-E8 | **截断回显 = 容忍**（uuid 形 ⇒ 认 pass + 截断标记；槽存全串） | 截断 = 机械噪音（回显仅通过时发生；uuid = token 专属随机值、零附带；凭证 = 流程门非安全边界） |
| D-E9 | 非回显结算**恒定标记**（逐字——含正文为空形） | N7 零静默（需求 `docs/core/requirements/ADVISOR-CONVERGENCE.md:86`） |
