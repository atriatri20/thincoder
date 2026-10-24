# Design Token 硬化（ENG-TOKEN-BINDING）· 需求

> 板块 = **design token 硬化**（流程凭证语义 / TTL 生命周期 / slot 持久化载体）。
> 本档 = 该机制的**需求层权威**（FR1–FR8 / N1–N4——编号承旧档，不改号）。
> 设计侧 = `docs/core/design/ENG-TOKEN-BINDING.md`（实现坐标 / 落地状态——本档不重述，D2）。
> 关联面 = `DESIGN-TOKEN-SETTLEMENT.md`（结算机制——同层）。

> **设计语义（用户裁定，权威见设计档）**：designToken 是**流程凭证**（防 agent 跳过评审步骤），
> **非密码学安全边界**——**token 无签名**（格式 = `uuid:expiresAt`，只有格式校验 + TTL）；
> token **跨模式存活**（ON→OFF 不清 / OFF→ON 不重评），**仅 TTL 过期清**（三时机：恢复过滤 / 开模式清过期 / spawn 门禁拒删槽）；
> slot 持久化 = **跨重启 / 跨模式恢复的有意载体**（不得造成内存 / 文件双源不一致）。

## 1. 总体定位

修复 design token 的真 bug / 安全漏洞，并把 TTL 从 1h 放宽到 7 天（可配置）——分批落地不再被时间窗打断。
**不做内容绑定**（token 有效性绑定设计文档 hash 的方案——用户实况否决：批次间文档必然变更，内容绑定会把「偶尔重评」变成「每批必重评」）。

## 2. 功能性需求（用户故事）

| # | 用户故事 | 验收语义 |
|---|---|---|
| **FR1** | 分批落地不被 1h TTL 打断 | TTL 默认 7 天；`agent.engTokenTtlMs` 可配（`Number.isFinite` 且 `>0`，非法回退默认） |
| **FR2** | 畸形 / 伪造 token 一律拒绝 | fail-closed：格式校验（`uuid:expiresAt`，段数 ≠2 / uuid 非法 / expiresAt 非数值）或过期 → 拒 |
| **FR3** | 有效 token 跨模式存活，评审贵产物不因开关 / 重启重复烧（R16） | ON→OFF 不清；OFF→ON 不重评（TTL 内）；仅过期清 |
| **FR4** | 过期 token 有明确清理时机（R16） | 三时机：恢复过滤 / eng enter 清过期 / spawn 门禁拒时删该 designId 槽 |
| **FR5** | slot 持久化不造成双源不一致 | 会话 slot = 权威持久源；内存 = 运行态；重启 / 恢复按 TTL 过滤读回（单一数据源语义） |
| **FR6** | token 在评审通过后才签发（入槽） | token 于评审前生成并注入评审 prompt（供 advisor 回显）；advisor 仅通过时回显（echo）——回显匹配才入槽签发，以代码判定为准；非 echo → 剥离返回 findings，不占槽；**裁定闸**：签发还须回执含裁定行 `VERDICT: pass` 且无 `VERDICT: changes-required`——缺行 ∥ 并现 ⇒ 拒签（fail-closed；剥净回显、不占槽、修后重评） |
| **FR7** | 评审错误 / 中断不连坐作废 | 作废仅在「完整评审结束且未通过」触发（error 回包 / abort / 轮次耗尽豁免；`result===null` 守卫保留） |
| **FR8** | 回显异常零静默 × 复制纪律 | ① 截断回显（本 token uuid 值在场、全串未见）⇒ 按批准结算（槽存全串）+ 截断标记；② 无回显 ⇒ **恒定**未签发标记（不得只在正文为空时出现）；③ 回显指令须言明**逐字复制**（含冒号与 uuid 后数字位；截断被标记） |

## 3. 非功能性需求

| # | 标准 |
|---|---|
| **N1** | 签名是一致性保障非密码学边界——**无签名**（token 格式 = `uuid:expiresAt`，只有格式校验 + TTL）——格式校验是防伪造层 |
| **N2** | 两端 lockstep，逻辑同构（VSC 端 slot 持久化经 session-io / `setSlotEngDesignTokens` 多槽写，不照抄 CLI persistState 单源面） |
| **N3** | 存量兼容：现有合法格式 token（`uuid:expiresAt`）行为不变，仅 TTL 语义变化 |
| **N4** | 防误用纪律：不加 HMAC / 内容绑定（明确不做，勿重试） |

## 4. 范围边界（不做）

- 不做内容绑定（v1 方案——用户实况否决，勿重试）。
- 不加 HMAC / 加密因子（N4——token 无签名为裁定语义）。
