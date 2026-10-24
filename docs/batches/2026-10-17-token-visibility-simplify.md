# 2026-10-17 · token-visibility-simplify
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 19:26「简化逻辑，回归本质……没必要把 token 藏起来，agent 要就告诉他」（另 19:22「不希望让机制进一步复杂化」）；需求 = docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md F-SL3（已改写）。
> 台账 = #1608（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口（14/14 亲跑 ∥ 三处 reveal 零命中 ∥ design-slots 271→245（净减 26）∥ api-contract 已重生成 4328 条 ∥ CHANGELOG [Unreleased] Removed 已补；设计槽已 consume）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**讨论收口（2026-10-17 19:27 · 主 agent）**

**用户裁定**（19:26 逐字）：「我希望能够简化逻辑，回归本质，我其实觉得现有的机制已经是过度设计了，我不需要那么多的安全考虑，**没必要把token藏起来，agent要就告诉他**，反正现在你不告诉他，他最后也要，折腾去找回来，何必呢？」——另 19:22「不希望让机制进一步复杂化」。

**本批 = 减法（删机制，不建机制）**：

1. `design-slots` 清点**逐槽恒显 `designToken`**（live ∥ expired 同显；`status` 列已标态；记录畸形 ⇒ `—`）。
2. **删**：`reveal:true` 开关 ∥ 掩蔽（`designToken=—`）∥ 「一次一槽」约束 ∥ `reveal` 非 boolean 拒值分支。
3. **留**：`designId` 过滤（trim 精确 / 空串视同缺省 / 未知 ⇒ 拒并列在场 id）；`consume-design` 全族**零动**；签发链（mint / settle / TTL / persist）**零动**；槽文件 schema **零动**（`designId → token` 两元组不变）。
4. **文档面**：文档仍**不抄 token 值**（理由 = 文档是长期件、token 是一次性会话态；非安全考虑——用户可否）。

**落点**：需求 F-SL3 已改写（父侧 19:2x）→ 设计档 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §9 回收读口块（designer）→ 用户点评审 → coder 实现（`thincoder-core/agent-tools/design-slots.mjs` ∥ `tool-docs/subagent.md` 描述面 ∥ 单测）。

**预点火合并扫描**：同板近邻（`#1601` ∥ `#1603` 读数/坐标族 · `#1604` server 漂移族）不同面 ⇒ 零可并；`#1606`（恢复路径扩机制）已于 19:22 按用户裁定撤回 ⇒ 本批与其**同方向**（减法），不并（对象不同：1606 = 不扩：本批 = 删现存）。

**不做**：不加任何新存储 / 新降级层级 / 新开关（承 19:22 裁定）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审 #77 修轮：9 条逐条处置——删除面 ∥ 受影响清单 ∥ U-SL14 已落，待复审）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**：需求档 `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md` **F-SL3**（清点面直读）——逐槽恒显 `designToken` ∥ `designId` 过滤保留 ∥ 畸形 ⇒ `—` ∥ 零开关 / 零值形态取舍 / 零单槽限。
**不覆盖（零触）**：F-SL1 清点行以外的清点语义 ∥ F-SL2 批量消费 ∥ F-D1–F-D6 结算面 ∥ 签发链（mint / settle / TTL / persist）∥ 槽 schema ∥ `batchOf` 批列派生 ∥ 日志面剥离（`log.mjs` `SECRET_FORM`）。

**设计落点（`docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §9 = `:138-226`）**：

| 项 | 坐标 |
|---|---|
| §9 题名 / 背景 | `:138` / `:140` |
| F-SL1 清点面（列表面加 `designToken` 末位） | `:142-148`（列表面 `:146`） |
| 令牌直读块（决策 ∥ 先例 ∥ 公开源 ∥ 参数 ∥ 畸形 ∥ 日志互作 ∥ 边界 ∥ 边界注） | `:150-159` |
| 描述面 / 提示面建议文本表（六面） | `:161-170` |
| 取用程序（三步） | `:172-176` |
| 自动解析取舍（designId-only spawn 仍不做） | `:178-179` |
| F-SL2（语义不变，题面收正） | `:181-188` |
| 落点（现行坐标——旧行数读数收正） | `:190-201` |
| 用例（U-SL1–9 不变 ∥ 直读面 U-SL10–13） | `:203-214` |
| 关键决策（KD-SL1–7） | `:216-226` |

**机制设计（一句）**：清点面收为**单层**——槽行末位恒携 `designToken` 全串值（过期照列，`status` 自标态；不可解析 ⇒ `—`），唯一参数 `designId` 过滤；取用提示归描述面单点（D2），输出不复述。

**受影响文件（Δ 全 ≤ 0——现读行数 = node 实数，2026-10-17）**：

| # | 文件 | 现读 | 预期 Δ | 落笔 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent-tools/design-slots.mjs` | 271 | ≈ −26（→ ≈245） | eng-coder |
| 2 | `thincoder-core/agent-tools/subagent.mjs` | 416 | −1（→ 415） | eng-coder |
| 3 | `thincoder-core/tool-docs/subagent.md` | 44 | −1（→ 43） | eng-coder |
| 4 | `docs/core/design/prompts/persona-engineering.md` | 222 | ±0 | eng-designer（**[上抛·待裁]**） |
| 5 | `thincoder-core/prompts/persona-engineering.md` | 220 | ±0 | eng-coder（建议文本见 §9 表） |
| 6 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 673 | ±0 | eng-designer（**[上抛·待裁]**） |
| 7 | `docs/batches/2026-10-17-token-visibility-simplify.test.mjs` | 新建 | 净 ±0（批内建、收口删——零留存） | eng-coder |
| 8 | `docs/core/design/API-CONTRACT.md`（生成区） | 4373 | ±0（收口重跑生成器） | 收口 |

**删除清单（逐条）**：

1. `design-slots.mjs`：`reveal` 参数校验分支（`:111-121`）∥ `liveSlot`（`:86-88`）∥ 取用提示常量（`:90-91`）∥ 槽行三分支 flatMap（`:131-137`）→ 单行 map（`expiresAt === null ? "—" : token`）；档头 / 函数注的取用段（`:11-13` ∥ `:97-100`）收正。
2. `subagent.mjs`：`reveal` 参数键（`:152`）+ `designId` 描述末句（`:148`）——**派单已知事实未列，本轮实读发现**（工具 schema 仍广告已删参数）。
3. `tool-docs/subagent.md`：`:11-12` 并一；`:10` 行契约加 `designToken`。
4. 设计档 §9：`reveal` 扩展整块（原 `:150-170`）+ 编号注记（原 `:211-213`——按批分述 = 变更史 + 批次档引用，与本批改写同时失效，D8 删净）。
5. 用例：删 U-SL10（reveal 活槽）∥ U-SL11（reveal 缺 id / 非 boolean）∥ U-SL12（过期畸形值零出现）∥ U-SL14（缺省三态「零揭值」前提已死）；保 U-SL13 → 重编 **U-SL12**（未知 id 拒，内容不变）∥ U-SL15 → 重编 **U-SL13**（日志面，内容不变）；新增 **U-SL10**（三态逐行含 token 值）∥ **U-SL11**（畸形 ⇒ `—`）。

**验收对照**：

| # | 判据 | 落点 |
|---|---|---|
| ① | F-SL3 判定句四条 | 用例 U-SL10 / U-SL11 / U-SL12 / U-SL13（§9 `:211-214`） |
| ② | 需求五要素齐（设计前置） | F-SL3 行已具「需求 / 判定句 / 边界」——父侧笔，已核 |
| ③ | D8 复扫 = 0 | §9 内 `reveal` ∥ 掩蔽 ∥ 一次一槽 ∥ 揭值 ∥ 回收读口 命中 **0**（实读） |
| ④ | 受影响表 Δ 全 ≤ 0 | 上表 8 行，无正 Δ |
| ⑤ | 非表格新增行 ≤300 字符 | 实读 0 条超宽 |

**关键决策**：KD-SL5（恒携 token——三层取用删净）· KD-SL6（令牌列置行尾——日志 `head` 在值形处截断 ⇒ 其余列仍完整）· KD-SL7（提示不入槽行——用法归描述面，D2）。

**上抛项**：

- **[上抛·待裁]** 中文评审面 `docs/core/design/prompts/persona-engineering.md:141`（我的笔）∥ 动作表 `docs/core/design/AGENT-LOOP-SUBAGENT.md:50` ∥ 英文运行期 `thincoder-core/prompts/persona-engineering.md:141`（coder 笔）三处仍教 reveal 取用——不改则下一会话照 reveal 调用即被拒。已上抛请裁「纳本批 ∥ 另批」；未答 ⇒ 本轮不落，受影响表 4 / 5 / 6 行保持未执行。
- **[上抛·知会]** `subagent.mjs:152` 参数 schema = 派单已知事实漏列，已补入受影响表。
- **[上抛·知会]** `API-CONTRACT.md:653` 生成区行号坐标随删行漂移——收口重跑 `node scripts/api-contract.mjs --write`。
- **[上抛·知会]** 设计档 §5 `:42` 引 `thincoder-cli/test/design-token-settlement.test.mjs` = 磁盘无此档（既有悬空指针，非本批）。
- **[上抛·知会]** `AGENT-LOOP-UPSTREAM.md:876-879` 另用 `U-SL1–4` 编号（与本板 U-SL 撞前缀，既有，非本批）。

**修正轮落笔（fix · 2026-10-17 19:4x）**

**范围裁定**：用户 19:26「没必要把 token 藏起来，agent 要就告诉他」+ 父侧 2026-10-17 19:39 裁「②③ 纳本批」（同机制、纯删改，必须同轮清干净）⇒ 受影响表行 4 / 5 / 6 全部入本批。笔权切分：动作表 ∥ 中文评审面 = 本席直接改；英文运行期面 = 本席只出逐字建议文本、eng-coder 落笔；`subagent.mjs` 产品码照旧 coder 落。

**① 改动表（本席笔——两处，各恰 1 行；行数不变）**

| 面 | file:line | 前 → 后（一句话） |
|---|---|---|
| 动作表 `design-slots` 行 | `docs/core/design/AGENT-LOOP-SUBAGENT.md:50` | 参数列 `designId? ∥ reveal?（必携 designId）` → `designId?`；返回列「`reveal:true` 且槽活 ⇒ 槽行尾追加 `designToken=<全串>` + 回收行」→「`designToken` 恒列（过期照列——`status` 自标态；畸形 ⇒ `—`）；两值原样入 eng-coder spawn」；列表面加 `designToken` 末位 |
| 中文评审面「在飞令牌」条 | `docs/core/design/prompts/persona-engineering.md:141` | 「只读取回——先清点，再携 `designId=<id>` + `reveal:true` 取全串（一次一槽；过期 / 畸形槽不揭值）」→「只读清点——逐槽行直接含全串 `designToken`（过期照列，`status` 自标态；记录畸形 ⇒ `—`；可按 `designId` 过滤到单槽）」；条名「回收」→「取回」 |

两行与设计档 §9 建议文本表（`:168` ∥ `:170`）逐字同源——零改写、零新增语义。

**② 英文运行期面建议文本（逐字——整行替换 `thincoder-core/prompts/persona-engineering.md:141`，落笔归 eng-coder）**

> - **In-flight token recovery**: a token (or its designId) dropped from your context — compaction, restart — is not lost: the slot ledger keeps every issued token. `subagent` `action:'design-slots'` lists every slot with its full `designToken` on the row (expired slots included — status marks them; a malformed record shows `designToken=—`; pass designId to filter to one slot). Pass both values verbatim on the eng-coder spawn (the gate checks exact equality) — recovery changes no discipline: tokens stay short-lived runtime state, consumed at chain terminal.

（= 设计档 §9 `:169` 逐字，零改写。）

**③ 删净复扫读数（2026-10-17 19:4x · node 逐行扫）**：扫描词 = `reveal` ∥ 一次一槽 ∥ `one slot at a time` ∥ 掩蔽 ∥ 揭值 ∥ `never revealed` ∥ `masked`。

| 扫描面 | 命中 |
|---|---|
| `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`（§9 所在档，含六面建议文本表） | **0** |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | **0** |
| `docs/core/design/prompts/persona-engineering.md` | **0** |
| `thincoder-core/prompts/persona-engineering.md` | **3**（全在 `:141`——coder 笔待落；件即上式建议文本） |

面外命中（如实列，非本席面）：产品码 coder 待落 = `design-slots.mjs:12/86-87/90/99/111-120/130-137` ∥ `subagent.mjs:8/148/152` ∥ `tool-docs/subagent.md:11-12` ∥ `log.mjs:22`（注释）；历史/临时 = `thincoder-core/CHANGELOG.md:17`、各批档、`thincoder-cli/docs/_archive/**`、`.thincoder/tmp/**`（叙述「删了什么」——按裁定不计）；需求档 `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md:25`（主 agent 笔，本席零触——见⑥）。

**④ 回读（D6）+ git status 实读**

- 回读：`AGENT-LOOP-SUBAGENT.md:50` = 240 字符 4 列齐全；`persona-engineering.md:141` = 267 字符；非表格行 >300 = **0**（`AGENT-LOOP-SUBAGENT.md`）；中文面档内 `:78` ∥ `:92` 超 300 = **既有、非本批行**（见⑥）。
- `git diff` 两档 = 各恰一行增删（+1 / −1），零附带改动。
- `git status`：工作树 37 M + 10 ?? ——本席触 3 件（上式两档 + 本批档自身）；其余 M / ?? 为他批在途（ssh 凭据 ∥ 管理面审批卡 ∥ 沙盒配额等），非本批、零触。

**⑤ 三句必写**

- **来源** = 用户 2026-10-17 19:26 裁定 + 父侧 2026-10-17 19:39 裁「②③ 纳本批」。
- **执行人** = eng-designer（本席）；英文运行期面 ∥ `subagent.mjs` ∥ `tool-docs/subagent.md` ∥ `design-slots.mjs` 落笔 = eng-coder。
- **本轮不做** = 英文运行期面本体 ∥ 产品码 ∥ 需求档 ∥ `API-CONTRACT.md` 生成区（收口重跑）∥ `doc-check`。

**⑥ 未决与上抛**

- **[上抛·知会]** `thincoder-core/agent-tools/subagent.mjs:8` 档头注释仍述 reveal 取用（原删清单未列——本轮实读发现）⇒ 并入 coder 面，坐标在册。
- **[上抛·知会]** `thincoder-core/log.mjs:22` 注释句以 reveal 为主体（「reveal 结果经 `tool:done` head 落盘时不落值」）——主体删后成悬空句，宜随正（comment-only，Δ 0；`SECRET_FORM` 机制零动）。
- **[上抛·知会]** 需求档 `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md:25` 边界句仍列已删机制名（「零 reveal 开关 ∥ 零掩蔽 ∥ 零一次一槽约束」∥「不做 reveal 开关 / 掩蔽 / 批量读取限制」）——需求档 = 主 agent 笔，本席零触；请裁是否收正。
- **[上抛·知会]** 中文评审面档内 `:78` ∥ `:92` 两条非表格行 >300 字符（既有、非本批行、零触）。

**自检收正（三机械互核 · claims ↔ 实测）**：上式「逐字同源」句射程收准——中文评审面行 = §9 `:168` **逐字**；动作表行 = §9 `:170` 的字段序与内容，**补一括注**「`status` 自标态」（= §9 `:156`「过期槽照列值——`status=expired` 已标态」同句语义），故非逐字。语义零差；§9 本体零触。

**读数（收口面）**：`AGENT-LOOP-SUBAGENT.md` 非表格行 >300 = 0；`persona-engineering.md:141` = 267 字符（限内），该档既有 `:78` ∥ `:92` 超限 = 非本批行；本批档内 >300 仅 1 条 = English 建议文本引用行（逐字引文——换行即破逐字，故不折）。

**读数更正（D6 回读）**：本批档非表格行 >300 = **2** 条——`:106`（English 逐字引文，563 字符）∥ `:119`（面外命中清单，352 字符）；上一句「仅 1 条」为错读，以本句为准。两行不折：引文换行即破逐字；清单行属汇总行（append-only 不改写已落段）。

**设计评审修轮落笔（评审 #77 · changes-required：🔴1 · 🟡3 · 🔵5 = 9 条；2026-10-17 19:4x）**

**来源** = 设计评审 #77（§3 轮次 1 结论表）+ 父侧逐条裁定（9 条全采纳；#5 归父侧）。**执行人** = eng-designer（本席）。**本轮不做** = 需求档 ∥ 直读语义（已定稿）∥ §9 全文重写 ∥ `doc-check` ∥ 产品码 ∥ 英文运行期面本体。

**逐条处置表（条号 → file:line → 一句话；行号 = 改后行号）**

| # | 落点 | 一句话 |
|---|---|---|
| 1 🔴 | 设计 `:208-222`（新增「删除面」D1–D11）+ `:195-204` 落点表增「改后」列 + `:252` U-SL14 | 删面逐条给现行坐标：design-slots `:86-88` / `:90-91` / `:111-121` / `:130-137`；subagent `:8` / `:148` / `:152`；机检 = 两档 `grep -c reveal` = 0 ∧ schema 无 `reveal` 键 |
| 2 🟡 | `docs/core/design/AGENT-LOOP-SUBAGENT.md:50` ∥ 设计 `:173` | 返回列补 `expiresAt`——与 `:148` 列表面 ∥ tool-docs 建议文本三处字段集一致 |
| 3 🟡 | 设计 `:224-238`（新增「受影响文件清单」） | 9 行：每档 现行行数 ∥ 预计 Δ ∥ 500 软线 ∥ 拆分结论；测试宿主 = `docs/batches/2026-10-17-token-visibility-simplify.test.mjs`（新建 ≈280 行；U-SL1–U-SL14 同宿） |
| 4 🟡 | `AGENT-LOOP-SUBAGENT.md:350` ∥ `:400` | 「七动作」→「九动作」（与 `:36`「九动作」一致） |
| 5 🔵 | 需求 `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md:23` | **父侧已落**（本席零触） |
| 6 🔵 | 设计 `:152`（子节题）∥ `:244`（用例组题） | 子节题加「——需求 F-SL3」；用例组标「（需求 F-SL3 回指）」 |
| 7 🔵 | 设计 `:155`（先例行） | 补实现坐标（`design-slots.mjs:102` 清点核 ∥ `:131` 行拼装）；先例批号 = 未在档内可考（禁编造） |
| 8 🔵 | 设计 `:160`（新增「日志面已知代价」）∥ `:263` KD-SL6 | 多槽清单在日志 `head` 只余首行——如实登记为已知代价 |
| 9 🔵 | 设计 `:142`（新增「在位 / 增量分界」） | F-SL1 / F-SL2 = 在位零改；增量 = 行恒携 `designToken` + 删 reveal / 掩蔽 / 一次一槽 |

**§2 早前落笔的两处收正（D6 回读发现 · 一致性面，已随本轮改）**

- 受影响表行 1「≈ −26（→ ≈245）」→ 设计新清单 = ≈ −24（→ ≈247）：按实读删行重算 = 删净 19 行 + 注块 / 空行收束 ≈ 5。
- 验收对照 ③「§9 内 reveal / 掩蔽 / 一次一槽 命中 0」口径收正：删除面块必载被删对象名（评审 🔴#1 裁定）⇒ 复扫 0 的射程 = 规范面正文（删除面 ∥ 增量分界 ∥ 落点表以外）；产品码面落定后由 U-SL14 机检。

**行数读数约定（评审 #3 的 ±1 漂移）**：本仓口径 = 末行行号（文件末换行不计额外行）。实测：`design-slots.mjs` 271（评审 272 = `split("\n")` 多计末位空段）· `subagent.mjs` 416 · `dispatch-gates.mjs` 151 · `AGENT-LOOP-SUBAGENT.md` 673（评审 674 同理）· `tool-docs/subagent.md` 44 · `tool-table.mjs` 187 · `persona-engineering.md` 222 / 220。设计 `:206` 已写入口径句；设计档自身 264 行。

**回读（D6）+ git 实读**

- 回读：删除面 11 行（D1–D11）· 受影响清单 9 行 · 落点表 8 行 × 4 列 · 用例 U-SL10–U-SL14 5 行；§ 引用集（9 个）逐个可解析（§2.8 在 `LIGHT-CHANNEL.md:101`；§6.7.2 在 `AGENT-LOOP-SUBAGENT.md:36`）；非表格行 >300 = **0**（设计档 ∥ 动作表，node 逐行测）。
- `git diff`：动作表档 = 3 处单行（`:50` / `:350` / `:400`）；设计档 = §9 内两新表 + 落点表扩列 + U-SL14 + 8 处行级收正；§1–§8 零触。
- `git status`：本席本轮触 3 件 = 上述两档 + 本批档；父侧需求档 1（M，非本席笔）；其余 M / ?? = 他批在途，零触。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 需求覆盖 / 删除面 | 🔴 | F-SL3 要求「零 reveal 开关 ∥ 零掩蔽 ∥ 零一次一槽约束」，设计只有结果态（`DESIGN-TOKEN-SETTLEMENT.md:155`「唯一参数 `designId`（可选——过滤到单槽；trim 后精确匹配；空串视同缺省；未知 ⇒ 拒 + 列在场 id）」；KD-SL5 = `:224`「不设取用开关 ∥ 不按值形态取舍 ∥ 不限单槽」），全档 grep `reveal`/`掩蔽`/`一次一槽` 零命中（该词只在需求档 `:25`）。现行实现仍完整携带三样：`thincoder-core/agent-tools/design-slots.mjs:113`–`:121`（reveal 解析 + 「one slot at a time (no bulk dump)」拒）、`:130`–`:136`（reveal 分支 + 「masked; passes no gate」掩蔽注因）、`:88`/`:90`–`:91`（`liveSlot` 掩蔽判据 + `RECOVERY_LINE` 取用提示行）；schema 参数见 `thincoder-core/agent-tools/subagent.mjs:152`。§9 的落点表（`:194`–`:201`）只列 `:200` 分派 / `:148` designId 描述，描述面表（`:163`–`:170`）改 tool-docs `:10`/`:11-12` 与 `:148`，**无一处登记 `:152` 与上列代码块的删除**；用例 U-SL10–U-SL13（`:207`–`:214`）在 reveal 原样保留时同样全绿 ⇒ 验收抓不到残留（最坏形态：`base` 已含 token 列 + reveal 分支再附一次 ⇒ 同列重复；或 `reveal:true` 无 designId 仍抛「一次一槽」⇒ 与 F-SL3 边界直接冲突） | 在 §9 补「改前 → 改后逐字」删除清单：`design-slots.mjs` 的 reveal 解析/拒/分支 + `RECOVERY_LINE` + `liveSlot` 掩蔽判据、`subagent.mjs:152` 的 `reveal` schema 键（及头注 `:8`），落点表增列这些坐标；并加一条机检验收（两档 `grep -c reveal` = 0 / schema 无该键），让「零 reveal」可判 |
| 2 | 一致性 / Clarity | 🟡 | 同一行契约的字段集在档间不一致：§9 逐槽行 = designId ∥ 状态 ∥ ageDays ∥ `expiresAt`（精确）∥ 批 ∥ `designToken`（`:146`），且 `:148`「字段 / 序 / 降级标记 = 契约，行内措辞 = 实现面」；tool-docs 建议文本同含 `expiresAt`（`:165`）；而动作表行（`AGENT-LOOP-SUBAGENT.md:50`，= 设计 `:170` 的建议文本「返回列 = 槽位清单（designId ∥ live/expired ∥ 时龄 ∥ 批 ∥ `designToken`——龄升序）」）漏 `expiresAt` | 动作表返回列补 `expiresAt`；或显式声明动作表为摘要键面并在 §9 写明摘要与行契约的差集，使三处字段集可对齐 |
| 3 | 受影响文件行数标注 | 🟡 | §9 落点表（`:192`–`:201`）只有「落点 / 现行」，无「预计增量」，且无测试宿主行——U-SL1–U-SL13 的宿主档既无路径也无行数（需求 F-SL1/F-SL3 只称「单元测试档」）；同仓同档的既有格式含「当前行数 / 预计增量」（如 `AGENT-LOOP-SUBAGENT.md:198`–`:204`）。且抽查：`design-slots.mjs` 现 272 行（设计注 271）、`subagent.mjs` 注 416、`dispatch-gates.mjs` 注 151——±1 漂移 + 无增量估算，也未声明改后是否仍 <500 软线 / 是否需拆分 | 补「受影响文件清单」：当前行数 / 预计增量（或「结构不变」）/ 是否触线 + 拆分结论；并把 U-SL1–U-SL13 的测试宿主档路径与预计行数列入 |
| 4 | 方法论 / 文档状态 | 🟡 | 动作数在本档两处不同：§6.7.2 标题「### 6.7.2 单工具动作面（九动作）」（`AGENT-LOOP-SUBAGENT.md:36`）、动作表列九行（含 `:50` design-slots），而 §6.25 仍称「§6.7.2 = 七动作面」（`:350`）、验收里写「七动作族源码」（`:400`）。本批改的正是这张动作表 ⇒ 陈旧计数会误导后续锚核对（先于本批存在） | 把 §6.25 的计数与 §6.7.2 对齐，或改为不计数措辞（「动作面」），让动作计数单点 |
| 5 | 需求行漂移 | 🔵 | 需求 F-SL1 行的逐槽列枚举仍为「逐槽一行（designId ∥ live / expired ∥ 龄 ∥ 到期 ∥ 批列）」（`requirements/DESIGN-TOKEN-SETTLEMENT.md:23`），同档新增 F-SL3（`:25`）把 designToken 列加在同一行契约上 ⇒ 单看 F-SL1 的读者拿到不完整列集（无判定冲突，但契约分裂两行） | F-SL1 列枚举补 `∥ designToken`（或注「令牌列见 F-SL3」） |
| 6 | 可追溯性 | 🔵 | §9 直读子节题为「**F-SL1 令牌直读（token 不藏）**」（`:150`），全文未引 F-SL3；而需求 F-SL3 反向指「设计 §9 / F-SL1」⇒ 需求 id ↔ 设计节映射不留痕，验收回指难机判 | 直读子节标题或首句加「（F-SL3）」，用例组标 F-SL3 回指 |
| 7 | 最相近先例 | 🔵 | 先例行（`:153`）给出设计节（同节 F-SL1）+ 对齐三条 + 「对齐 = 令牌列 = 行契约的末位字段，不新立参数 / 动作 / 存储；偏差 = 无」，但缺实现坐标与先例批号（判定要求「实现坐标 ∥ 设计节 ∥ 先例批」三项）。公开源核查行（`:154`）合规：「`index.publicRepos` = 空 ⇒ 无公开源档可查」已明确记录 | 补先例实现坐标（如 `design-slots.mjs:102` 清点核 / `:131` 行拼装）与批号，使「对齐」可核 |
| 8 | 日志面代价 | 🔵 | `:157` 断言「令牌列置行尾 ⇒ 截断只吃掉值本身，其余列在日志里仍完整」——按该截断规则，多槽清单落日志时首行 token 之后的一切（后续槽行 + 计数尾行）都不进日志；直读化把「每行都带 token」变成常态 ⇒ 日志里从此只剩首行，该代价未登记（U-SL13 只判「日志零 token 值」） | 把「多槽清单在日志 head 只保留首行」如实登记为已知代价（或说明日志面不需清单完整性） |
| 9 | 增量边界 | 🔵 | `:140` 写「本节补**清点面**与**批量消费**」，而 F-SL1/F-SL2 实核已在位（`design-slots.mjs:102` 清点核 / `:149` 消费核；`subagent.mjs:200` 分派）⇒ 正文读起来像两者都是本批新增，实施者可能重复实现/误判增量面（落点表「现行」列间接暗示在位，但正文无「在位 / 本批增量」分界） | 背景句后加状态分界：F-SL1/F-SL2 = 在位零改，本批增量 = 行恒携 designToken + 删 reveal/掩蔽/一次一槽 |

已核通过项：设计档在册且为拥有该主题的档（§9 原位修订，未另建档）；需求 F-SL1/F-SL2/F-SL3 各点均有对应设计面（F-SL3 四类用例 = U-SL10–U-SL13）；中文评审面 `docs/core/design/prompts/persona-engineering.md:141` 与设计建议文本（`:168`）逐字一致；动作表参数列已为 `designId?`（无 reveal）；公开源核查行、最相近先例行的「偏差 = 无」声明均在册。
局限：本次未声明项目标准档、未见文档地图（Document ownership 判据按 AGENTS.md 的 docs 地图指针 + 档内归属形态降级判定）。

计数：🔴 1 · 🟡 3 · 🔵 5（共 9 条）

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 · 前表 9 项逐项复验 + 新发现（4）**

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | docs/core/design/DESIGN-TOKEN-SETTLEMENT.md | 🔴 | Fixed | 删除面 D1–D11 在册（`:208` `**删除面（改前 → 改后——删净为机制本体；落定后由 U-SL14 机检）**：`；D1 `const revealArg = args?.reveal` + 非 boolean 拒值分支；D9 `reveal` schema 键）+ 落点表 reveal 面坐标与「`:152` 删行 · `:8` 删行 · `:148` 删末句（删除面 D9–D11）」+ U-SL14「两档 `grep -c reveal` = **0**」机检 |
| 2 | 2 | docs/core/design/AGENT-LOOP-SUBAGENT.md:50 | 🟡 | Fixed | 动作表返回列已含「槽位清单（designId ∥ live/expired ∥ 时龄 ∥ `expiresAt` ∥ 批 ∥ `designToken`——龄升序）」；设计建议文本 `:173` 同步 |
| 3 | 3 | docs/core/design/DESIGN-TOKEN-SETTLEMENT.md | 🟡 | Fixed | 受影响文件清单在册（`| # | 文件 | 现行行数 | 预计 Δ | 500 软线 | 拆分结论 |`；行 1 = 「≈ −24（→ ≈247；删净 19 行 + 注块 / 空行收束 ≈ 5）」；行 9 = 「`docs/batches/2026-10-17-token-visibility-simplify.test.mjs`（U-SL1–U-SL14 宿主——批档同目录）」） |
| 4 | 4 | docs/core/design/AGENT-LOOP-SUBAGENT.md | 🟡 | Fixed | 计数已对齐：`:350` 「§6.7.2 = 九动作面」· `:400` 「九动作族源码 `only available at depth 0` 命中计数 **5 → 6**」· `:36` 「### 6.7.2 单工具动作面（九动作）」 |
| 5 | 5 | docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md:23 | 🔵 | Fixed | F-SL1 列枚举回填：「批列 ∥ `designToken`——令牌列判据见 F-SL3」 |
| 6 | 6 | DESIGN-TOKEN-SETTLEMENT.md:152 | 🔵 | Fixed | 「令牌直读（token 不藏）——需求 F-SL3」；`:244` 「**直读面 / 删除面用例（需求 F-SL3 回指）**：」 |
| 7 | 7 | DESIGN-TOKEN-SETTLEMENT.md:155 | 🔵 | Fixed | 先例句补实现坐标 + 批号显式记录：「实现坐标（现行）= `thincoder-core/agent-tools/design-slots.mjs:102`（清点核）∥ `:131`（行拼装）；先例批号 = 未在档内可考」 |
| 8 | 8 | DESIGN-TOKEN-SETTLEMENT.md:160 | 🔵 | Fixed | 「多槽清单在日志 `head` 只保留首行（token 之后内容被截断）」+ KD-SL6 同步 |
| 9 | 9 | DESIGN-TOKEN-SETTLEMENT.md:142 | 🔵 | Fixed | 「**在位 / 增量分界**：F-SL1 清点面 ∥ F-SL2 批量消费 = 在位零改（清点核 `design-slots.mjs:102` ∥ 消费核 `:149`）」 |
| N1 | (new) | 需求档 vs 设计档 | 🟡 | New | 测试宿主三名不一：req F-SL1「用例 = ledger-tool 单元测试档 U-SL 组」/ req F-SL3「用例 = design-slots 单元测试档（…）」/ 设计「`docs/batches/2026-10-17-token-visibility-simplify.test.mjs`（U-SL1–U-SL14 宿主——批档同目录）」。验收回指存在歧义（非阻断） |
| N2 | (new) | DESIGN-TOKEN-SETTLEMENT.md:238 | 🔵 | New | 「测试宿主口径：单元测试档随批档存放（`docs/batches/<batch>-<topic>.test.mjs`），收口删、零留存」——与同档常驻测试先例（`:71` 「`thincoder-cli/test/design-token-settlement.test.mjs`」9 例）不同；U-SL1–U-SL13 运行命令未写明（`docs/batches/**` 是否被 `npm test` 收集未在档内给出） |
| N3 | (new) | DESIGN-TOKEN-SETTLEMENT.md:252 | 🔵 | New | U-SL14 机检只覆盖两 .mjs；描述面（`:200` 「design-slots 条目 `:10-12`」→「`:11-12` 并一」）与提示面不在机检内 ⇒ 「零 reveal」不等于模型可见面全清 |
| N4 | (new) | DESIGN-TOKEN-SETTLEMENT.md | 🔵 | New | 「消费核」坐标两处不一致：`:142` 「消费核 `:149`」vs `:40` 「（消费核 `thincoder-core/agent-tools/design-slots.mjs:110`–`:135` 即此契约）」/ `:95` `executeConsumeDesignAction`；需一次点核区分标签或收正坐标 |

**计数**：前表 🔴 1 → 0（9/9 Fixed）；新增 🔴 0 · 🟡 1 · 🔵 3。**审批**：无未解 🔴 ⇒ 可签 token。

**VERDICT: pass**

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（U-SL1–U-SL14 全绿；三处 reveal=0；终态 clean）

**交付摘要**：F-SL3 清点面直读落定——`design-slots` 逐槽行恒携 `designToken`（末位；过期照列，`status` 自标态；畸形 ⇒ `—`），`designId` 过滤保留；reveal 开关 / 掩蔽 / 一次一槽约束删净（两 `.mjs` 与 `tool-docs/subagent.md` 的 `reveal` 命中均 = 0）。描述面 / 提示面按设计 §9 建议文本逐字落；`log.mjs` 注释收正（`SECRET_FORM` / 字段黑名单机制零改）。

**改动清单（file:line = 改后行号；行数口径 = 末行行号）**

| # | 文件 | 改后行数 | Δ | 内容 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent-tools/design-slots.mjs` | 245 | −26 | 删 reveal 解析 / 非 boolean 拒 / 一次一槽拒 / `liveSlot` / `RECOVERY_LINE` / 三分支 `flatMap`；行拼装 = 单行 `map` + 行尾 ` designToken`（`:111`）；档头 `:8` / 函数注 `:88-89` 收正 |
| 2 | `thincoder-core/agent-tools/subagent.mjs` | 414 | −2 | 删 `reveal` schema 键（原 `:152`）∥ 档头 reveal 句（原 `:8`）；`designId` 描述（现 `:147`）= 设计 `:170` 建议文本逐字（末句 `— REQUIRED with reveal:true` 已删） |
| 3 | `thincoder-core/tool-docs/subagent.md` | 43 | −1 | `:10-11` = 设计 `:168` / `:169` 建议文本逐字（原 `:11-12` 并一） |
| 4 | `thincoder-core/prompts/persona-engineering.md` | 220 | 0 | `:141` 整行 = 设计 `:172` 建议文本逐字 |
| 5 | `thincoder-core/log.mjs` | 214 | 0 | `:21-22` 注释去 reveal 主体句（改为「工具结果经 `tool:done` head 落盘时在形态前截断、不落值」） |
| 6 | `docs/batches/2026-10-17-token-visibility-simplify.test.mjs` | 274（新建） | +274 | U-SL1–U-SL14 同宿一档；按设计「收口删、零留存」 |

**三条回归读数（逐字）**

1. `node --test docs/batches/2026-10-17-token-visibility-simplify.test.mjs` ⇒ `tests 14` / `pass 14` / `fail 0`（U-SL1–U-SL14 全绿；`duration_ms 343.0473`）。
2. `grep -c reveal` ⇒ `thincoder-core/agent-tools/design-slots.mjs` **0** ∥ `thincoder-core/agent-tools/subagent.mjs` **0** ∥ `thincoder-core/tool-docs/subagent.md` **0**（node 逐行扫，等价 `grep -c`；三个文件同口径复扫）。
3. `node --check thincoder-core/agent-tools/design-slots.mjs` ⇒ 通过（exit 0、无输出）∥ `node --check thincoder-core/agent-tools/subagent.mjs` ⇒ 通过（exit 0、无输出）。

**既有常驻回归面**：既有常驻回归面 `thincoder-cli/test/design-token-settlement.test.mjs` 不在盘（悬空指针，既有缺陷）——回归读数由本批测试承担；0 例可跑。

**决策透明表**

| 决策 | 处置 | 依据 |
|---|---|---|
| 行拼装 | 单行 `map`，行末 ` designToken=${e.expiresAt === null ? "—" : e.token}` | 设计 §9 删除面 D4 |
| 畸形判据 | `expiresAt === null`（= `tokenExpiryMs` 判不出，含非串值） | 设计 §9 畸形口径 |
| 取用提示 | 不入槽行输出（`RECOVERY_LINE` 删净） | KD-SL7（用法归描述面单点） |
| `log.mjs` 注释 | 改写为通用「工具结果在形态前截断」；机制零改 | 父侧任务书第 5 点 |
| 常驻测试档 | 不补造、不创建 | 父侧 2026-10-17 裁定（悬空指针 = 既有缺陷） |
| 设计档 ∥ `API-CONTRACT.md` 生成区 | 零触，随交付上报 | 文件权属（设计席 / 收口步） |

**审计与代码评审轮次与终态**

- 内部 explore 审计：1 轮（对设计 §9 / D1–D11 / 验收逐条实读）⇒ 🔴 0 · 🟡 0 · 🔵 2（函数注段名残留 ∥ 设计受影响清单未列 `log.mjs`）。
- 自修：1 轮——函数注去「回收读口：」标签（comment-only，Δ0）。
- advisor 代码评审：1 轮，`VERDICT: pass`（🔴 0；🟡 2 均文档态：设计清单缺 `log.mjs` 行 ∥ `API-CONTRACT.md:653-654` 坐标待收口重跑；🔵 5）。
- 评审响应处置：🔵 注释措辞（`design-slots.mjs:88-89`）= 已修（「缺省 = 全量清点（不改变行契约——令牌列恒携）」）；🔵 U-SL6 破坏手法 = 已加耦合注（依赖非 tmpUnique 临时名）；其余 🟡/🔵 = 文档面 / 收口面，非本席笔 ⇒ 随交付上报。
- 终态 = `clean`（代码面 0 未处置 finding；测试 14/14 绿）。

**上抛**

- [上抛·待裁] 无。
- [上抛·知会] 设计遗留（非本批、本席零触）：设计档 §9 受影响清单缺 `thincoder-core/log.mjs` 一行；§9 `:155` / `:142` 实现坐标与「→ ≈247」读数随删行漂移（实际 245）；`API-CONTRACT.md:653-654` 生成区须收口重跑 `node scripts/api-contract.mjs --write`；`thincoder-core/CHANGELOG.md:17` 历史条目仍述 reveal（`[Unreleased]` 是否补 Removed 行 = 父侧裁）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-17 20:0x）**

**验证读数（父侧亲跑，非采信）**：

- `node --test docs/batches/2026-10-17-token-visibility-simplify.test.mjs` ⇒ **tests 14 · pass 14 · fail 0**（U-SL1–U-SL14 全绿）。
- 三处机检（父侧 grep 工具实查）：`reveal` 于 `thincoder-core/agent-tools/design-slots.mjs` ∥ `subagent.mjs` ∥ `tool-docs/subagent.md` ⇒ **零命中 ×3** ✓。
- 行数实读：`design-slots.mjs` 271 → **245**（−26）∥ `subagent.mjs` 416 → **414**（−2）∥ `tool-docs/subagent.md` 44 → **43** ∥ `persona-engineering.md`（英）220 ±0 ∥ `log.mjs` 214 ±0 ∥ 测试档 **274**（新建）。

**上抛处置（`#83` 五条）**：

| # | 项 | 处置 |
|---|---|---|
| 1 | 设计 §9 受影响清单缺 `log.mjs` 行 | **已补** ✓（清单第 10 行，父侧机械执行 · 可回退） |
| 2 | §9 读数随删行漂移（≈247 → 245；subagent 414；tool-docs 43；测试档 274） | **已随正** ✓（父侧机械执行 · 可回退） |
| 3 | `API-CONTRACT.md` 生成区坐标陈旧 | **已重生成** ✓ —— `node scripts/api-contract.mjs --write` ⇒ `WROTE(api-contract): 4328 条`（父侧工程工具面直跑，读数在案） |
| 4 | `thincoder-core/CHANGELOG.md:17` 历史条目述 reveal | **历史条目照留**（历史归 git/CHANGELOG 本体，不改写）；`[Unreleased]` **已补 Removed 一行** ✓（父侧笔——CHANGELOG 属父侧维护面） |
| 5 | 悬空指针 `thincoder-cli/test/design-token-settlement.test.mjs` | **已挂 `#1613`** ✓（既有缺陷，本批不补造） |

**收口**：代码面 = 完成（14/14 · 三处零命中 · 净减 26 行）；设计槽 `770b68ab` 已 consume；台账 `#1608` 核销。
