# 2026-10-19 · tech-todo-sweep
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 08:28 逐字「**技术待办现在就开始处理，没有什么卡点，那些所谓的卡点就是你要做的工作。**」——清账轮 2026-10-19 首遍核销 19 条后，余项按面分类、逐批实做，不再以「等条件」搁置。。
> 台账 = #1686（core · 归批）。前情 = docs/batches/2026-10-19-prompt-chain-r6-closeout.md（已收口 2026-10-19）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**：技术待办清账第一批 = 文档面（零语义变更 · 零新机制）。台账五行：`#1535`（文档数与盘上不符）· `#1675`（坐标漂移）· `#1678`（报面块缺 stale 注记行）· `#1658`（体量表读数漂）· `#1630`（批名标签族残点）。

**设计档落点**：全部为既有设计档的就地收正（无新档、无迁移、无机制改动）——主 agent 笔的需求档（`requirements/TURN-CAP-CONTINUE.md` · `requirements/PORTABILITY.md`）与 `docs/README.md` 不在本批。

**机制设计**：无。本批是**读数收正 + 死标签删除**两类机械动作，判据为「改后句子可读 ∧ 读数实读 ∧ 指针不悬空」。

**逐条落点（台账号 → 改动 file:line · 改前 → 改后）**：

| # | 台账 | file:line | 改前 → 改后 | 为什么 |
|---|---|---|---|---|
| 1 | `#1535` | `docs/core/design/ARCHITECTURE.md:59` | `工具描述面（模型可见文本——24 档）` → `…——53 档` | 盘上 `thincoder-core/tool-docs/*.md` 实读 53 |
| 2a | `#1535` | `docs/core/design/CORE-UNIFICATION.md:213` | `（实测：槽位 15 + 工具描述 24，集合**相等** ⇒ 无独有档）` → `（两端集合**相等** ⇒ 无独有档）` | 该括注只记迁移期实测（设计档不载历史）；规则句保留、旧数去掉 |
| 2b | `#1535` | 同上 :888 | **未命中**——全档「工具描述 24 / 槽位 15」仅 :213 一处（grep 实核） | 单上抛（见下 U3） |
| 3 | `#1535` | `docs/core/design/DOC-SYSTEM.md:150` | `design/_archive/` 50 档 → `design/_archive/` **非提示词档 46 档** | 实读：`thincoder-cli/docs/_archive/design` 顶层 md = 46（提示词档 15 另列，未变）；批次档 41 = 归档 40 + 原地 1（口径补明） |
| 4a | `#1675` | `docs/core/design/MODEL-BENCH.md:1357` | `turn-loop.mjs:77` → `:96`；`:66` → `:74` | 实读：`:96` = `onToken(\`⟦ev⟧turn…\`)`，`:74` = `_currentTurn = frame.turn` |
| 4b | `#1675` | `docs/core/design/CONTEXT-COMPACTION.md:661` | `:360`/`:364`/`:392`/`:497` → `:367`/`:371`/`:399`/`:505` | 实读 `cmd-config.mjs` 四处 `ctDisplay` 消费点 |
| 4c | `#1675` | `docs/core/design/AGENT-LOOP.md:336` | `post-turn.mjs:17` → `:42` | 实读：`:42` = `export function injectPostTurn(…)` |
| 5 | `#1678` | `docs/core/design/DOC-DISCIPLINE.md:1161-1173` | 报告态报面块**补 stale 注记行**（围栏首行）+ 块后一句「陈旧 ⇒ 注记行居首行之前」 | 原块无注记行，与 :1102「位置 = 首行之前」并存 = 块缺一行 |
| 6 | `#1658` | `docs/core/design/PROMPT-SYSTEM.md:284` | `142,991`（1.381×）→ `143,572`（1.387×） | 实跑 `node scripts/tool-schema-size.mjs`：总量 143,572 / 基线 103,529 ⇒ 1.387 |
| 7a | `#1630` | `docs/core/design/CORE-UNIFICATION.md:565` | `；**批 B 补** \`setSlotPrefs\`` → `；补 \`setSlotPrefs\`` | 批名 = 一次性产物名（批档可删 ⇒ 死指针）；事实照留 |
| 7b | `#1630` | `docs/core/design/DOC-MIGRATION.md:401` | `+ 批 B 注附件` → `+ 会话面四件注附件` | 同族：块已改名 `会话面四件注`（`UI.md:47` 在盘），旧名指向不存在块 |
| 7c | `#1630` | `docs/desktop/design/SESSIONS.md:121` | `；**批 B**：\`effort\` 槽字段落地` → `；\`effort\` 槽字段落地` | 同上 |
| 7d | `#1630` | `AGENT-LOOP.md:139` · `AGENT-LOOP-UPSTREAM.md:352` · `AGENT-LOOP-ASYNC-POOL.md:568`/`573`/`574`/`575` | 六处 `（2026-09-29 · parity-b1-vsc-core …）` → `（收编后现态）` / `**现态**` | 批名标签删除、现态事实保留 |

**受影响文件**（9 档，全文档面 · 零源码 · 零测试档）：`ARCHITECTURE.md` · `MODEL-BENCH.md` · `CONTEXT-COMPACTION.md` · `AGENT-LOOP.md` · `AGENT-LOOP-UPSTREAM.md` · `AGENT-LOOP-ASYNC-POOL.md` · `DOC-SYSTEM.md` · `DOC-DISCIPLINE.md` · `CORE-UNIFICATION.md` · `DOC-MIGRATION.md` · `PROMPT-SYSTEM.md` · `SESSIONS.md`。

**验收对照（机器可验）**：
1. 每条改动处**实读**目标档现行号/现行数（禁照抄任务单）——已逐处实读。
2. `doc_check(mode:"gate", target="d:\teamcode\thincoder")` ⇒ 首行 `DOC-CHECK GATE: PASS`，12 档 0 命中——**已跑，PASS**。
3. 域内 `parity-b1-vsc-core` 零命中（grep · 六部分 design/requirements 域）——**已跑，零命中**。
4. 改后句子读得通（逐处目视回读）——已回读。

**关键决策**：① `#1535`(g) 两处按「设计档不载历史」处置：只记迁移期实测的括注**去数保规则**；承载规则者保留规则。② `#1630` 七处按 `DOC-DISCIPLINE.md` §4.5.9 判身份——均属「① 被引用的一次性产物 ⇒ 删」，机制正文零动。③ `DOC-MIGRATION.md:401` 的 `批 B 注附件` 改写为**现行块名**（`会话面四件注`，`UI.md:47` 实读在盘），不作纯删除以免句子失去所指。

**上抛项**：
- 〔上抛·知会〕U1：`AGENT-LOOP*.md` 的 `parity-b1-vsc-core` 实读 **6 处**（任务单记 5 处）——六处全改。
- 〔上抛·待裁〕U2：`#1658` 任务单说「单档帽 / top5 两行读数漂」——实读两行**未漂**（`subagent` 17,191 ∥ `browser` 11,924 ∥ `git` 7,894 ∥ `ssh` 7,472 ∥ `batch` 6,553，与实测 top10 逐字同）；真正漂的是同表「当前」行（142,991 → 143,572）。已改「当前」行，两行未动。任务单所称「EN 三档 persona 行数」与该表无关（该表是 tool-docs 字符面）。
- 〔上抛·待裁〕U3：`CORE-UNIFICATION.md` 的「:888 同族旧数」实读不存在（全档仅 :213 一处），该子项无需改动。
- 〔上抛·待裁〕U4：`DOC-SYSTEM.md:147-152`「底本 = CLI 树 84 档 = 设计 47 + 需求 37」已失效（CLI 树已归档：`design/*.md` 1 · `requirements/*.md` 1）——本批只按要求校正了括注三数，未动 84 这个基数句（属语义面，请裁是否整段按历史删除）。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
