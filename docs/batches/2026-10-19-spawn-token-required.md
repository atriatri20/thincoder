# 2026-10-19 · spawn-token-required
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令（2026-10-19 22:10「开批修」）：eng-coder spawn 漏传 designToken 时门报「Invalid or missing」不可诊断，实例反复误判（TTL / batchDoc 路径 / 槽位损坏 / 参数过长）；修必填清单、工具说明、报错三态。
> 台账 = #1712（ENGINEERING-MODE · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**现象（用户报告 · 2026-10-19 21:55–22:10）**：`D:\repos` slot 4 会话（desktop · deepseek-flash · 工程模式 · 仓库现行版核）在评审通过、令牌已签发的情况下，eng-coder 派工反复被门拒：`Invalid or missing design token`。实例先后把原因判成「令牌 TTL 极短」「batchDoc 绝对路径不匹配」「槽位注册损坏」「designPoints 过长/转义损坏」——四轮假设全部被数据推翻，每轮白耗一次往返。

**实读证据（会话档 `...sessions\4711d71cb4b63e98e72f806b20aaab345339091e.json.4`）**：

- 19 次 spawn：**2 次成功均携带 `designToken`**（22:04:36 `1198769b` → #12；22:07:01 `47117e5f` → #14）；**12 次失败均无该键**（只有 `designId`），最短失败调用仅 942 字符、`designPoints` 170 字符零换行 ⇒ 与长度/转义无关。
- 令牌槽 7 枚全 live，到期 2026-10-26（TTL 7 天）；`design-slots` 输出与槽值逐字一致 ⇒ 令牌本身完好。
- 模型的推理原文多次声称「我传了令牌」，实际参数里没有该键 ⇒ 自述与实发参数矛盾。
- 用户明确提示后成功一次 ⇒ 模型有能力填该参数，缺的是「每次必须填」的触发。

**根因（文本面，现行版核心）**：

1. `thincoder-core/prompts/persona-engineering.md:161-171` 的「Every dispatch carries a task book」清单只列 `goal` / `round` / `knownFacts` / `designPoints` / `acceptance` / `reportFormat` + `batchDoc`；**`designToken` 不在清单内**，只出现在示例行 `:157` 与条件句 `:149`（令牌丢失时的恢复路径）。
2. `thincoder-core/tool-docs/subagent.md:23` 的「Task book (every spawn role)」同样只列五参 + `round`；令牌只在角色行 `:20` 与示例 `:26` 出现。
3. 后果措辞不对称：`batchDoc` = "omitted = refused"、`round` = "missing = refused"，而 `designToken`（`agent-tools/subagent.mjs:146`）= "without it, eng-coder cannot modify files"——读起来像子代理写权限问题，不像整次 spawn 被拒。
4. `agent-tools/subagent-spawn.mjs:254-256` 把「未传 / 值不符 / 已过期」三种原因写成同一句，模型看到 "invalid" 即猜过期，掩盖「没传」这一事实。

**本批范围（三项）**：
1. 提示词必填清单补 `designToken`：eng-coder spawn 必带；**omitted = refused**；值从 `design-slots` 行的 `designToken=` 逐字取。
2. 工具说明与 schema 描述把后果改成「missing or mismatched = the spawn is refused」，与 `batchDoc` / `round` 同形。
3. 门报错拆三态：未传（点名 `designToken` + 取值路径）/ 值不符 / 已过期；不回显令牌值。

**不做**：自动补全（缺参且有活槽时工具层代取）——机制取舍，需用户单独裁定，不进本批 · 不改令牌签发 / TTL / 消费 · 不改 depth>0 子通道的 schema 裁剪 · 不改普通模式 · 不改评审链。

**已确认**：用户 2026-10-19 22:10 逐字「开批修！」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖 · 回指 `ENGINEERING-MODE-V2.md` §13.11 FR33）**：

| # | 条目 | 设计落点 |
|---|---|---|
| 1 | 必填清单显性化：eng-coder spawn 的任务书清单写 `designToken`，`omitted = refused` 同形 + `design-slots` 取值路径 | `PROMPT-SYSTEM.md` §6.35 · 逐字块 A → `persona-engineering.md:163` 后 +1 行 |
| 2 | 工具说明与 schema 同形：后果句统一为 `missing or mismatched = the spawn is refused` | `TOOLS.md` §6.25 ①② → `tool-docs/subagent.md:20` / `:23` · `agent-tools/subagent.mjs:146` |
| 3 | 门报错三态：未传 / 值不等 / 已过期，三条互异、不回显令牌值 | `TOOLS.md` §6.25 ③④ → `agent-tools/subagent-spawn.mjs:131` / `:240-258` |

**明确不在本批**：自动补全（缺参且有活槽时工具层代取）——需用户单独裁定 · 令牌签发 / TTL / 消费 · depth>0 子通道 schema 裁剪（`agent/family-tools.mjs:90-110`）· 普通模式 · 评审链 · `batch` / 台账 / 批次档机制。

**设计档落点与分工**：

- 提示词面 = `docs/core/design/PROMPT-SYSTEM.md` §6.35（新增，L1338 起）：逐字英文块 A + 落点表 + A1–A4 验收。
- 工具语义 / schema / 门三态 = `docs/core/design/TOOLS.md` §6.25（新增，L1539 起）：三处逐字文本 + 三态拒句 + 提取形态 + 测试计划 + 两舱拆分。
- 单一权威源：令牌签发 / 槽位 / 消费机制仍在 `AGENT-LOOP-SUBAGENT.md` §6.22 与 `DESIGN-TOKEN-SETTLEMENT.md`（本批零改、不重述）；拒句文本只在 `TOOLS.md` §6.25 成文，§6.35 只留提示词文本。

**机制设计（摘要）**：门拒绝集合不变（`missing ∨ mismatch ∨ invalid`，与旧三条件合取全等），只把同一句出口拆成三条互异拒句；判据顺序 = `resolveDesignSlot`（既有未知 designId / 多槽缺 designId 两条诊断零改）→ 参数在场 → 值相等 → 值有效。过期才删槽（`tokenExpired`；D-R16c ③），mismatch 不删（T-R16d）。抽 `designTokenRefusal(kind, designId)` + `gateDesignToken(parent, args)`，sync / async 双路同源、三态可单测。

**受影响文件（现行读数 2026-10-19 本席）**：

| 文件 | 现行 | Δ | 归属舱 |
|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 239 行 / 59,256 字符 | +1 行 / 约 +570 字符（≤ +3% = 61,033） | A · 文本面 |
| `thincoder-core/tool-docs/subagent.md` | 38 行 / 10,229 字符 | ±0 行（`:20` / `:23` 句内改写） | A |
| `thincoder-core/agent-tools/subagent.mjs` | 422 行 / 31,340 字符 | ±0 行（`:146` 描述改写） | A |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 419 行 / 23,685 字符 | 约 +30 行 / 约 +1,800 字符 | B · 代码 + 测试 |
| `thincoder-core/test/subagent-design-token-gate.test.mjs` | 新增 | 约 100 行（T1–T7） | B |

**测试覆盖**：新档落 `thincoder-core/test/subagent-design-token-gate.test.mjs`（项目约定 = `test/*.test.mjs` 单层，runner = `thincoder-core/test/run.mjs`）。目标用例跑法 `cd thincoder-core && node --test test/subagent-design-token-gate.test.mjs`；收口门 `cd thincoder-core && node test/run.mjs`。用例 T1 missing（参数缺）· T2 missing（无槽，`:131` 并入同态）· T3 mismatch（不含令牌值、活槽不删）· T4 expired（含 `expired`、槽已删）· T5 正常放行 · T6 三句两两互异 · T7 既有两条 designId 诊断零改。

**验收对照（回指 §13.11 ①–⑤）**：

| §13.11 | 验收 | 判法 |
|---|---|---|
| ① | 提示词清单含 `designToken` + `omitted = refused` + 取值路径 | 子串比对：块 A 1 次；`omitted = refused` ≥2；`designToken=` / `design-slots` ≥1 |
| ② | 工具说明 + schema 含 `missing or mismatched = the spawn is refused` | 子串计数：`subagent.md` ≥2、`subagent.mjs` ≥1 |
| ③ | 三态互异、missing 点名、expired 含 `expired`、mismatch 不含令牌值 | 单测 T1–T6 |
| ④ | `node scripts/prompt-refs-check.mjs` 命中 0；提示词体量 ≤ +3% | 命令读数 |
| ⑤ | 普通模式 / depth>0 零回归 | `cd thincoder-core && node test/run.mjs` 全绿；`family-tools.mjs:90-110` 零改 |

**实施拆分（两舱 · 按面）**：舱 A = 提示词 + 工具说明 + schema 描述（三个文件，纯文本面，验收 = 子串）；舱 B = 门代码 + 单测（两个文件，验收 = 单测分支）。两舱文件不重叠，可并行派工。不合并理由 = 两变更面各有独立验收面，按派单尺寸纪律「跨面 ⇒ 按面拆」。

**关键决策**：

| # | 决策 | 理由 |
|---|---|---|
| K1 | 三态是同一判定的三个出口，准入集合零改 | 需求明令不改三条件判定语义；改的是可诊断性 |
| K2 | `:131` 无槽并入 missing 态 | 需求点 3 明示「未传 / 无槽」同态；无槽时读者需要的是取值路径与评审入口 |
| K3 | 抽 `gateDesignToken` + `designTokenRefusal` | 三态可单测、双路同源；不装配子代理即可覆盖 |
| K4 | 三句零令牌值；mismatch 可带 designId | 凭证不回显是既有纪律；designId 非凭证 |
| K5 | 设计分两档（提示词 / 工具面）而非合并一节 | 两档各自回答「提示词怎么写」「工具怎么拒」，合并会把两问混进一节（D2 单源仍然成立） |

**上抛项**：无。

**读数补正（2026-10-19 本席 · 实测）**：逐字块 A 实测 517 字符，加换行 = +518 字符（§2 上表「约 +570 字符」以本条为准）；提示词改后 59,774 字符 ≤ +3% 上限 61,033。设计档 `P` §6.35 落点表与受影响文件表已同步为实测值。

**缩写更正**：上条「`P` §6.35」= `PROMPT-SYSTEM.md` §6.35。

### 修订 · 设计评审 #6 九条发现（2026-10-19 · 状态行保持「设计完成」）

**来源**：批次档 §3 轮次 1（🔴1 · 🟡6 · 🔵2，VERDICT changes-required）。执行者 = eng-designer；逐条落点（改后坐标）：

| # | 严重度 | 修什么 | 落点 |
|---|---|---|---|
| 1 | 🔴 | 第三态拆两句：TTL 与删槽只在 `tokenExpired(given)` 句出现；格式非法另句，不称 TTL、不称删槽（明写槽留在原地）。③ 判据列加合取项，④ 代码按 `expired ? "expired" : "invalid"` 分支；补两句互斥且穷尽的机判证明，补「畸形槽值可达」证据（`token-ttl.mjs:133-137`） | `TOOLS.md` ③ L1573 · L1577–1580 · 判据段 L1582–1590 · ④ L1597–1609 |
| 2 | 🟡 | 补「最近先例 ∥ 偏离」：先例 = §6.24 文本面形 ∥ §6.32 携 why 形；对齐 / 偏离各一句 | `TOOLS.md` L1550–1552 |
| 3 | 🟡 | 补勘察证据行：`ENG-TOKEN-BINDING.md` §3/§4/§6.1 与 `DESIGN-TOKEN-SETTLEMENT.md` §9 F-SL1 逐档「零改」结论；§6.35 的「已查无」改为逐档结论 | `TOOLS.md` L1554–1556 · `PROMPT-SYSTEM.md` L1356–1358 |
| 4 | 🟡 | 加机制本体指针（本档不重述）；边界写该档 `:43` / `:170` 坐标处置：L7 helper 落模块尾 ⇒ `:237` / `:131` 不漂移、本批零改；若漂移则父侧按 `grep -n "validateRoundParam(args)"` 实测行号同步（到期条件 = L5 落地） | `TOOLS.md` L1548 · L1621–1622 · L1666 |
| 5 | 🟡 | K3 删误引（§13.11 点 3 不含「无槽」），改成本句自身理由：missing 句的 `if that list is empty…` 已覆盖空清单 | `TOOLS.md` K3 L1674 |
| 6 | 🟡 | 补 T8（畸形槽值 == 传入值 ⇒ 不删槽、不称 TTL）∥ T9（非字符串 ⇒ missing，本意写明）；T6 改四条拒句两两互异；夹具补畸形值 | `TOOLS.md` L1651–1652 · T6 L1649 · 夹具 L1638 |
| 7 | 🔵 | L5 写 `issuedToken = gateDesignToken(parent, args)`，点名 `:345-347` 的 `_engDesignId` 依赖返回值；新增 L7 点名两枚导出的模块与测试 import 路径 | `TOOLS.md` L1631 · L1632 · L1619–1621 |
| 8 | 🔵 | `:1342` 改为「任务书节（`:158` `batchDoc` ∥ `:161-171` 参数清单）」 | `PROMPT-SYSTEM.md` L1342 |
| 9 | 🟡 | ⑥ 补分类：该档 = 常驻回归套（收集面 `thincoder-core/test/run.mjs:48` 单层 `test/*.test.mjs`），§6.10 / §6.33 的批次单测规则不适用；边界标注 `TOOLS.md:395` 旧读数陈旧，交父侧收口处置 | `TOOLS.md` L1640 · L1666 |

**读数（本席实测 2026-10-19）**：第三态分区实跑 `validateDesignToken` ∥ `tokenExpired`——`not-a-token` / `uuid-without-colon` / `""` ⇒ `!validate ∧ !expired` 且 `tokenExpiryMs === null`；过期串 ⇒ `!validate ∧ expired`；活串 ⇒ `validate` ⇒ 两句互斥且穷尽成立。删槽条件与旧式 `expiredReject` 同一条。`doc_check(mode:"gate")` = PASS（2 档 0 命中）。

**档体量（实测）**：`TOOLS.md` 1,714 行 / 150,361 字符，§6.25 = 160 行（L1539–1698）；`PROMPT-SYSTEM.md` 1,490 行 / 124,725 字符，§6.35 = 68 行（L1338–1405）。受影响文件表两行已按此读数改写。

**零改确认**：产品文本 / 产品代码 / 需求档 / 其余设计档（含 `ENG-TOKEN-BINDING.md` / `DESIGN-TOKEN-SETTLEMENT.md`）零触；§6.35 逐字块 A 与 §6.25 的缺参 / 不匹配文案逐字不变。

**上抛项**：`TOOLS.md:395`（§6.13 面）「`thincoder-core/test/` 现盘 = `run.mjs` / `slow.mjs`」已与现盘不符——本批只标注、不改写，父侧收口处置。

**坐标校读（前表两格）**：④ 提取形态 = `TOOLS.md:1592`（代码块 L1594–1610，前表写 L1597–1609 = 代码块内层，以本行为准）；⑥ 夹具行 = `TOOLS.md:1639`（前表写 L1638，差一行，以本行为准）。其余坐标已按末次 `grep -n` 复核。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审（PROMPT-SYSTEM.md §6.35 ∥ TOOLS.md §6.25 · FR33）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership / Acceptance | 🔴 | TOOLS.md:1570「expired」拒句写死「…is past its TTL. The expired slot has been removed」，而其触发判据（同表「值相等 ∧ `!validateDesignToken`」）同时覆盖格式/畸形值：`validateDesignToken` = 格式 ∧ TTL（`thincoder-core/agent-tools/design-token.mjs:55-58`），`tokenExpired` 对畸形串返回 false（`thincoder-core/token-ttl.mjs:55-58`），而畸形槽值会被恢复读回内存 Map（`token-ttl.mjs:133-137`）。该态下新句会把原因说成 TTL 过期、并声称槽已删除（实际未删——TOOLS.md:1572 自述「槽删除只在 `tokenExpired(given)` 成立时发生」；`ENG-TOKEN-BINDING.md:31` / `:205` D-E5 亦明「格式/畸形拒不删槽」）。T1–T7 无此用例。 | 第三态只陈述判据已证之事（TTL 过期句仅在 `tokenExpired(given)` 时给出），畸形/格式拒另出第四句且不含「已删除」断言（mismatch 不删槽规则不变）；补 T8 用例（畸形槽值与传入值相等 ⇒ 不删槽、不称 TTL）。 |
| 2 | Methodology（最近先例） | 🟡 | TOOLS.md §6.25 无「最近先例 ∥ 偏离」行（§6.35 有，:1352；同档 §6.23 有，:1277–1287）——对齐/偏离是否做过无痕。 | 补该行：先例 = 本档 §6.24 文本面形 ∥ §6.32 携 why 形；给实现坐标与偏离理由（如有）。 |
| 3 | Methodology（勘察证据） | 🟡 | TOOLS.md §6.25 无勘察证据行；§6.35 的勘察行（:1356）记「无其他相关公共源——已查无」，但令牌面在册权威档即在文档地图（`docs/README.md:78`）：`ENG-TOKEN-BINDING.md`（写权机械门 / D-E5）与 `DESIGN-TOKEN-SETTLEMENT.md`（design-slots 行契约）。 | §6.25 补勘察证据行并逐档记「零触 / 需同步」，勿以「已查无」收口。 |
| 4 | Document ownership / duplication | 🟡 | §6.25 复述 `ENG-TOKEN-BINDING.md` 拥有的槽删除规则（:1572「D-R16c ③ … T-R16d」、K4），却全节不指向该档；helper 提取后该档坐标（`ENG-TOKEN-BINDING.md:43` / `:170` 均指 `subagent-spawn.mjs:237`）将失真，§6.25 边界未列。 | 加一句指针（机制本体 = `ENG-TOKEN-BINDING.md` §4 / §6.1——本档不重述），并把该档坐标随正（或明列「不进本批」）写进边界。 |
| 5 | Requirements coverage / evidence | 🟡 | K3（:1643）以「需求点 3 明示『未传 / 无槽』同态」支撑「无槽并入 missing」，但 §13.11 第 3 点（`docs/core/requirements/ENGINEERING-MODE-V2.md:742`）只列未传 / 值不等 / 已过期，未提无槽。 | 改引据：missing 句自带的「if that list is empty, no design review has been approved…」已覆盖无槽态；或保留原诊断，不并态。 |
| 6 | Acceptance criteria（边界/错误覆盖） | 🟡 | T1–T7 覆盖 missing/mismatch/expired，缺「格式不合法但值相等」态（代码可达，见 #1）与「`designToken` 非字符串」态——后者在 §6.25 ④ 的 `typeof` 守卫下由 mismatch 改判 missing，拒绝集合虽不变但状态标签变了，无用例锁定。 | 补两格用例（或明写「非字符串 ⇒ missing 为本意」），使「拒绝集合不变」由机判而非断言承担。 |
| 7 | Clarity / feasibility | 🔵 | §6.25 ⑤ L5 只写「改为调用 `gateDesignToken(parent, args)`」，未写返回值须落回 `issuedToken`——该变量在后文 `thincoder-core/agent-tools/subagent-spawn.mjs:345-347` 被读（`child._engDesignId = args.designId ?? null`）；两枚新导出所在模块与测试 import 路径亦未点名（T1–T7 需要）。 | 落笔行写成 `issuedToken = gateDesignToken(parent, args)`，并点名两枚导出的落档与测试 import 面。 |
| 8 | Clarity / evidence | 🔵 | §6.35 :1342 称「`:161-171` 的任务书参数清单列 … + `batchDoc`」，但 `batchDoc` 在 `thincoder-core/prompts/persona-engineering.md:158`，不在该区间（本节两行后自己也按 `:158` 引它）。 | 改述为「任务书节（`:158` `batchDoc` ∥ `:161-171` 参数清单）」。 |
| 9 | Test lifecycle / 文档一致 | 🟡 | §6.25 ⑥ 落一枚常驻单测档 `thincoder-core/test/subagent-design-token-gate.test.mjs`，而与本次同批在册的提示词纪律写「单元测试用例随批次档存（不占项目 `test/` 树）」（`PROMPT-SYSTEM.md:286` §6.10②）且「批次档的单元测试档收口即删」（`:1156` §6.33）；§6.25 未对 T1–T7 分类（另：`TOOLS.md:395`「`thincoder-core/test/` 现盘 = `run.mjs` / `slow.mjs`」已与现盘不符）。 | 加一句分类：该档 = 常驻回归套（收集面 = `thincoder-core/test/run.mjs:48` 的 `test/*.test.mjs` 单层），§6.10 / §6.33 的批次单测规则不适用；并把 §6.13 的陈旧读数交父侧处置。 |

计数：🔴 1 · 🟡 6 · 🔵 2 · 合计 9。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 修正轮后复审（round 2 · FR33 · PROMPT-SYSTEM §6.35 ∥ TOOLS §6.25）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | TOOLS.md:1579-1586 | 🔴 | Fixed | expired 句只在 `tokenExpired` 分支出口（:1579 判据 = 值相等 ∧ `!validateDesignToken` ∧ `tokenExpired`），新增 invalid 句（:1580）不称 TTL、不称删槽；1584-1586 的互斥穷尽推导经 `design-token.mjs:55-58` / `token-ttl.mjs:55-58` 实读成立（`¬validate ∧ ¬expired ⟺ tokenExpiryMs === null`）；T8（:1651）锁死该态（消息含 invalid、零 `expired`/`TTL`/`removed`、槽不删）。 |
| 2 | 2 | TOOLS.md:1550-1552 | 🟡 | Fixed | 取法行到场（先例 = §6.24 ∥ §6.32；对齐 ∥ 偏离各有理由）。 |
| 3 | 3 | TOOLS.md:1554-1556 · PROMPT-SYSTEM.md:1356-1358 | 🟡 | Fixed | 勘察证据行登记 `ENG-TOKEN-BINDING.md` §3/:31、§4/:43、§6.1/:170 与 `DESIGN-TOKEN-SETTLEMENT.md` §9/:158，结论 = 零改；`docs/README.md:78` 同核；§6.35 的「已查无」已替换为两档逐条结论。 |
| 4 | 4 | TOOLS.md:1548 · 1666 | 🟡 | Fixed | 「机制本体 = `ENG-TOKEN-BINDING.md` §4/§6.1——本档不重述」到场；`:237` 坐标有「L7 落模块尾 ⇒ 不漂移」论证 + 漂移兜底 grep 与到期条件，不再留无人认领。 |
| 5 | 5 | TOOLS.md:1674 | 🟡 | Fixed | K3 的「需求点 3 明示未传/无槽同态」误引已删，改以 missing 句自带内容立论。 |
| 6 | 6 | TOOLS.md:1651-1652 · 1659 | 🟡 | Fixed | T8（格式非法但值相等）与 T9（非字符串 ⇒ missing）到场，A2 同步 T1–T9；④ 内注释把非字符串归 missing 标为本意。 |
| 7 | 7 | TOOLS.md:1617 · 1619 · 1621 | 🔵 | Fixed | 落点写成 `issuedToken = gateDesignToken(parent, args)` 并点名 `:345-347` 的依赖；导出模块 = `subagent-spawn.mjs`、测试 import 逐字给出。 |
| 8 | 8 | PROMPT-SYSTEM.md:1342 | 🔵 | Fixed | 改为「任务书节（`:158` batchDoc ∥ `:161-171` 参数清单）」；`persona-engineering.md` 实读（batchDoc :158、清单 :161-171）核对成立。 |
| 9 | 9 | TOOLS.md:1640 · 1666 | 🟡 | Fixed | 测试分类 = 常驻回归套，理由成立（`test/run.mjs:48` 实读 = `--test test/*.test.mjs`；`test/` 现盘有 `doc-check-3b|scope.test.mjs`），§6.10/:286 与 §6.33/:1156 判定不适用并给理由；`TOOLS.md:395` 陈旧读数（实读仍在）已标注并挂父侧收口。 |
| 10 | (new) | TOOLS.md:1631 ∥ 1686 | 🔵 | New: Δ 估算自相矛盾 | `提取 + 分支（约 +30 行）` + L7 `约 +20 行` ⇒ 表列 `约 +50 行 / 约 +2,600 字符`；但 L5 是以一行 `issuedToken = gateDesignToken(parent, args)` 替换 `subagent-spawn.mjs:245-258` 十四行（`let issuedToken` 起、门块 `}` 止）⇒ −13 行，L7 追加约 +22 行 ⇒ 净值 ≈ +9 行。不越 500 行级（419 → ~428），属簿记不准，建议按 L5/L7 净值改正表与两处行数。 |
| 11 | (new) | TOOLS.md:1664 | 🔵 | New: 边界枚举夹一条不成立项 | `invalid 句不细分畸形形态（非字符串槽值 / 段数 ≠ 2 / uuid 不合形同句）`——非字符串**槽值**到不了 invalid 分支：`given` 恒为字符串，`given !== issuedToken` ⇒ mismatch；槽值 falsy ⇒ `!issuedToken` ⇒ missing。只有「非字符串**参数**」由 T9 归 missing。建议把该项移出 invalid 枚举或改述为「槽值非字符串 ⇒ mismatch/missing（T9 只锁参数侧）」。 |

计数：🔴 0（上轮 1 已闭合）· 🟡 0 未闭（上轮 6 全 Fixed）· 🔵 2 New（不阻批准）· 合计 11 行。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**2026-10-19 22:27:39 · 用户逐字：「批准」**

- **批准对象** = 设计档 `PROMPT-SYSTEM.md` §6.35（块 A）+ `TOOLS.md` §6.25（① 工具说明 ∥ ② schema 描述 ∥ ③ 四条拒句 ∥ ④ 提取形态 ∥ ⑥ T1–T9）。
- **口径**：按本批确立的「批准 = 实施启动」——批准即实施发起；两舱同轮派工（舱 A 文本面 / 舱 B 代码 + 测试面，文件不重叠、可并行）。
- **评审链**：轮 1 changes-required（🔴1 / 🟡6 / 🔵2）→ 修正轮 eng-designer #7 → 轮 2 pass（九条全 Fixed；新增两条 🔵 已由父侧机械更正）。
- **父侧机械更正披露（父侧直接执行 · 可回退 · 无新语义）**：① §6.25 受影响文件 `subagent-spawn.mjs` 的 Δ 估算由「约 +50 行」改为「约 +10 行（245-258 换一行 −13；模块尾两函数 ≈ +23；实施轮以实测为准）」；② §6.25 边界措辞改为「槽值非字符串落 mismatch 或 missing，不入 invalid」。改后 `DOC-CHECK GATE: PASS`。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-19



**实施席**：eng-coder · 2026-10-19

**改动清单（舱 B = 代码 + 测试面 · 两档）**：

| # | 文件 | 动作 | 落点（改后） |
|---|---|---|---|
| B1 | `thincoder-core/agent-tools/subagent-spawn.mjs` | `resolveDesignSlot` 无槽拒句 → `throw designTokenRefusal("missing")` | `:131`（行号不漂移） |
| B2 | `thincoder-core/agent-tools/subagent-spawn.mjs` | token 门块（旧三条件合取 + 同一句）→ `issuedToken = gateDesignToken(parent, args)` | `:240-244` |
| B3 | `thincoder-core/agent-tools/subagent-spawn.mjs` | 模块尾新增 `export function designTokenRefusal(kind, designId)` + `export function gateDesignToken(parent, args)` | `:407-434` |
| B4 | `thincoder-core/test/subagent-design-token-gate.test.mjs`（新增） | T1–T9 常驻回归套（9 test 块） | 全档 |

**语义口径（照 `docs/core/design/TOOLS.md` §6.25 ③④⑤⑥ 落，零自改判据）**：拒绝集合 = missing ∨ mismatch ∨ expired ∨ invalid（与旧三条件合取全等）；删槽只在 `tokenExpired(given)` 成立时发生，mismatch / invalid 不删槽；`gateDesignToken` 返回值落回 `issuedToken`（`child._engDesignId` 回写依赖）；非字符串参数 ⇒ missing（T9 锁定，属本意）。既有两条 designId 诊断、令牌签发 / TTL / 消费、depth>0 通道、普通模式、提示词 / 工具说明零改。`:237`（`validateRoundParam`）与 `:131` 行号未漂移（`ENG-TOKEN-BINDING.md:43` / `:170` 坐标继续有效）。

**验证读数（本席实跑）**：

| # | 验收 | 命令 / 判法 | 读数 |
|---|---|---|---|
| ① | T1–T9 全绿 | `cd thincoder-core && node --test test/subagent-design-token-gate.test.mjs` | tests 9 · pass 9 · fail 0 |
| ② | 既有套件零回归 | `cd thincoder-core && node test/run.mjs` | tests 24 · pass 24 · fail 0 |
| ③ | 四条拒句逐字 = §6.25 ③ | 程序比对设计档表格四句（逐字符） | 4/4 相等（missing 412 字符 / mismatch 260 / expired 312 / invalid 363）；四个标签各 1 次命中；`removed` 仅 expired 句（1 次，invalid 0）；四句零令牌值 |
| ④ | 拒绝集合与删槽集合等价 | 18 例差分矩阵（旧式谓词 vs 新 gate：判定 + 删槽后槽集合） | 0/18 差异；T5 返回槽值；T4 删槽；T3 / T8 不删槽 |
| ⑤ | 改动面 | `git status --porcelain`（工作树另有先存脏项） | 本席 = `subagent-spawn.mjs` + 新测试档；先存脏项（10 M / 3 ??）非本席改动（舱 A 与其它批） |

**内部审计（explore divergence audit）· 轮 1（2026-10-19）**：VERDICT = divergences-found（2 行；代码与设计面零偏离）。

| # | 严重度 | 发现 | 处置 |
|---|---|---|---|
| 1 | 🟡 | §5 实施记录为空 | 本段即补（读数见上表）——closed |
| 2 | 🔵 | T7 只以 `startsWith` 锁前缀，未达「原两条消息逐字命中」 | 改为 `assert.equal` 全句（含 size / heldIds 尾部）；改后目标档 9/9 仍绿——closed |

**审计后修正轮**：1 轮（发现 #2 修复）；无代码语义改动，仅测试断言强度。

**实施记录（舱 A · 文本面 · eng-coder · 2026-10-19）**

**交付表**：

| # | 状态 | 落点（改后 file:line） |
|---|---|---|
| A1 | ✅ Done | `thincoder-core/prompts/persona-engineering.md:164`（`round` 行后新增逐字块 A，同列表两空格缩进、单行不折） |
| A2 | ✅ Done | `thincoder-core/tool-docs/subagent.md:20`（句内替换，旧形 `review (its reply …` → 设计逐字句，`(its reply also echoes a designId …)` 尾句不动） |
| A3 | ✅ Done | `thincoder-core/tool-docs/subagent.md:23` 段末（`round (initial|fix) is mandatory…` 之后追加设计逐字句） |
| A4 | ✅ Done | `thincoder-core/agent-tools/subagent.mjs:146`（description 整句替换为 `TOOLS.md:1570` 围栏块逐字） |

**逐字比对读数（node 读档，交付文本 vs 设计档；同一字面两档各命中 1 次）**：

- A1：`persona-engineering.md:164` === `PROMPT-SYSTEM.md:1365`，517 字符逐字相等；全档命中 1 次。
- A2：`:20` 从 `REQUIRES a valid designToken` 到 `echo it back in the delivery report).` 的子串 === `TOOLS.md:1562` 表格单元（442 字符），命中 1 次；旧形 `review (its reply also echoes a designId` 0 命中。
- A3：`:23` 段末句 === `TOOLS.md:1563`（231 字符），命中 1 次。
- A4：`:146` description === `TOOLS.md:1570`（356 字符），命中 1 次；旧句 `Required when role='eng-coder': … cannot modify files.` 0 命中。
- `missing or mismatched = the spawn is refused`：`subagent.md` 2 次（`:20` / `:23`）· `subagent.mjs` 1 次（`:146`）。
- `omitted = refused`：`persona-engineering.md` 2 次（`:158` batchDoc ∥ `:164` designToken）。

**行数 / 字符数实测**：`persona-engineering.md` 239 行 / 59,256 字符 → **240 行 / 59,774 字符**（+1 行 / +518 字符，≤ 上限 61,033）；`subagent.md` 38 行 → **38 行**（±0）；`subagent.mjs` 422 行 → **422 行**（±0）。

**机检读数**：`node scripts/prompt-refs-check.mjs`（仓库根 D:\teamcode\thincoder）= 「提示词面 69 档 · 代码面 463 档 · 命中 **0**」+ `OK(prompt-refs): J1/J2/J3 三式零命中`；`lint subagent.mjs` = Syntax OK；模块加载 `import('./thincoder-core/agent-tools/subagent.mjs')` 成功，description 已取新文。

**零改核对（diff 逐行）**：`persona-engineering.md` 的 `@@ -159,6 +161,7 @@` 块 = 纯 `+` 一行、零 `-` 行 ⇒ `:158` 与 `:161-171` 其余行零改（改后行号整体后移 1 系本次新增所致）；`subagent.md` 仅 `:20` / `:23` 两行句内改写（`@@ -17,10 +17,10 @@`，两条 `-` 对应两条 `+`）；`subagent.mjs` 仅 `:146` 一行（`@@ -143,7 +143,7 @@`）。工作树另有前序/邻舱未提交改动（本批设计档 `PROMPT-SYSTEM.md` / `TOOLS.md` / 需求档 §13.11 = 设计阶段；`subagent-spawn.mjs` = 舱 B；其余批次档 = 他批），非本舱所写。

**审计 / 评审轮次与终止态**：

1. 内部 explore 发散审计（对照 `PROMPT-SYSTEM.md` §6.35 / `TOOLS.md` §6.25）：VERDICT = CLEAN，四落点逐字一致、位置正确、清单外改动零；旁注一条（`PROMPT-SYSTEM.md:1342` 勘察行称 `designToken` 只在 `:149` / `:157` 出现，实盘另见 `:147` / `:223` / `:236`）— 设计档表述精确度问题，非本舱落点，交父侧处置。
2. 内部 advisor 代码评审（`type=code`）：VERDICT = pass，🔴 0 / 🟡 0 / 🔵 1（本档 §5/§6 无命令读数 — 由本条记录闭合）。行为真实性经现盘核对成立：`subagent-spawn.mjs:244` = `if (role === "eng-coder") issuedToken = gateDesignToken(parent, args)`、`:131` = `throw designTokenRefusal("missing")`、`:414` = `designToken expired — the eng-coder spawn is refused`；取值路径 `design-slots.mjs:111` 行末 = `designToken=${e.expiresAt === null ? "—" : e.token}`。
3. `doc_check(mode:"gate")` = **PASS**（本会话写过的声明域文档 0 档；提示词 / 工具说明档明示不在 `scanDirs=["docs"]` 检域，工具侧 skipped 2 档）。
4. 终止态 = **clean**（自修轮 0 次；审计 1 轮 clean、顾问评审 1 轮 pass）。

**未做 / 边界**：舱 B（`subagent-spawn.mjs` 门代码 + 单测）不在本席；设计档 / 需求档 / 其余提示词档 / `discipline-engineering.md` / 普通模式 / depth>0 通道零触；`files` 声明面 = 上述三档。

**内部代码评审（advisor · type=code）· 轮 1（2026-10-19）**：VERDICT = pass（🔴 0 · 🟡 0 · 🔵 3，均建议项，无必须修复项）。

| # | 严重度 | 发现（advisory） | 处置 |
|---|---|---|---|
| 1 | 🔵 | 测试档只 import `gateDesignToken`，设计档 §6.25 ④ 的 import 面写两枚 | 不采纳：四句逐字已由门径 T1/T3/T4/T8 全句锁死；补一条未用 import 无收益。在此披露「设计文本 ↔ 交付痕迹」差异（非覆盖缺口） |
| 2 | 🔵 | T2「无槽」经 `loadManifest(undefined)` 的吞异常路径得来，耦合实现细节 | 不采纳：夹具「空 map」为设计档 ⑥ T2 明文规定；任务书已核 `reconcileEngTokensFromSlot` 对空 Map / 无 session 的 fake parent fail-soft。改夹具反而偏离批准目标形 |
| 3 | 🔵 | 「拒绝集合 / 删槽集合等价」无机判守门（18 例差分为一次性读数、脚本未入库） | 不采纳：设计档 ⑥ 测试计划 = T1–T9，不扩用例；等价由改前快照逐条比对 + 18 例差分读数背书（见上表 ④） |

**终态：clean**。审计 2 轮（轮 1 divergences-found → 修正 → 轮 2 clean；修正 1 轮，仅测试断言强度）· 代码评审 1 轮 pass · 无必须修复项 · 零代码语义改动落在评审后。

## §6 验证与收口（父代理）

## 验证与收口

**交付核验（父侧实读 + 复跑 · 2026-10-19 22:34–22:38）**

- **舱 A（#9）**：`persona-engineering.md:164` 块 A 逐字在位（`omitted = refused` + design-slots 取值路径）；`tool-docs/subagent.md:20` / `:23` 两处 `missing or mismatched = the spawn is refused`（全文命中 2 次）；`agent-tools/subagent.mjs:146` 描述已换（命中 1 次）。父侧复跑 `node scripts/prompt-refs-check.mjs` ⇒ 提示词面 69 档 · 代码面 463 档 · **命中 0**。提示词体量 240 行 / 59,774 字符（上限 61,033）。
- **舱 B（#10）**：`subagent-spawn.mjs:131` → `throw designTokenRefusal("missing")`；门块 `:237-241` → `issuedToken = gateDesignToken(parent, args)`；模块尾 `:407-434` 两枚导出函数；新测试档 `thincoder-core/test/subagent-design-token-gate.test.mjs`（123 行）。父侧复跑：`node --test test/subagent-design-token-gate.test.mjs` ⇒ **9 pass / 0 fail**；`node test/run.mjs` ⇒ **24 pass / 0 fail**。
- **diff 实读**：`subagent-spawn.mjs` +34 / −19（净 +15 行，434 行 / 25,265 字符）；`:131` 与 `:237`（`ENG-TOKEN-BINDING.md:43` / `:170` 所引坐标）**未漂移**；其余为舱 A 三档与设计/需求/批次档。
- **四条拒句**：与 `TOOLS.md` §6.25 ③ 表格逐字符相等（missing / mismatch / expired / invalid 各 1 次命中；`removed` 只在 expired 句，invalid 句 0 次；四句零令牌值）。
- **拒绝 / 删槽集合**：18 例差分矩阵（旧式谓词 vs 新 gate）0/18 差异；T3 mismatch 不删槽 · T4 expired 删槽 · T8 invalid 不删槽 · T5 正常返回槽值。

**验收勾销（回指 §13.11 FR33）**

| 需求 | 落点 | 判定 |
|---|---|---|
| ① 必填清单显性化 | `persona-engineering.md:164` · `tool-docs/subagent.md:20/:23` · `subagent.mjs:146` | ✅ |
| ② 工具说明同形（spawn 被拒） | 同上三处，`missing or mismatched = the spawn is refused` 同形句 | ✅ |
| ③ 报错三态（+ 格式非法第四句） | `subagent-spawn.mjs` `designTokenRefusal` 四句；T1–T9 覆盖 | ✅ |
| ④ 提示词零文档引用 / 体量 ≤ +3% | `prompt-refs-check` 0；59,774 ≤ 61,033 | ✅ |
| ⑤ 普通模式 / depth>0 零回归 | `node test/run.mjs` 24/24；`agent/family-tools.mjs` 零改 | ✅ |

**设计档读数更正（父侧机械更正 · 可回退 · 无新语义）**：`TOOLS.md:1686` 受影响文件 Δ 由估算改为**实测 +15 行 / +1,580 字符**；§6.25 ④/⑤ 的 as-of 行号（`:245-258` / `:345-347`）与落地值（`:237-241` / `:331-333`）之差已在实施报告记录——行号只作参考读数，语义零改。

**收口清单**

- doc_check 交付门（close 触发）：PASS（close 回执确认）。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无用户文档面变更。
- 台账：`#1712` 在途 → 待核销 → **已核销**（证据 = 本节 + §5 + 上述坐标）。
- 设计令牌：链终消费。
- 后续债务：无新增；自动补全经用户 2026-10-19 22:19 裁定不做（`#1711` 已废弃）。
