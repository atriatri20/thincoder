# 2026-10-19 · decision-landing
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令（2026-10-19 22:35「开批」）：谈定的需求必须当轮落盘——hash 路由定案只留在对话里、随后文档写反；修复 = 同轮落笔 + 压缩后重锚 + 未落盘决定入台账。
> 台账 = #1713（ENGINEERING-MODE · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**现象（用户报告 · 2026-10-19）**：`D:\repos` slot 4 会话中，hash 路由需求在讨论里**定案**——用户原话「导航到子页面要有 hash 路由，别一刷新就回首页」＋「筛选方案按照你建议，hash 方案也按照你建议」；实例回「三项已定，我先记下：位置 pushState、筛选 replaceState；hash 形 `#/cases?og=og1&type=X&state=running`；弹窗不入 hash」。**但没有任何写盘调用**。随后需求册 U1 写成「地址栏不变、不发生整页刷新」、设计档 D42 把 hash 路由列进**否决项**、§7.2 写「不做界面路由与深链」——全是实例自己写的。用户追问「你答应我的 hash 路由呢？！」它才承认「盘上三处写的都是相反口径」。同类还有一次：case type / doctype 视图未进需求册，用户点名后才补。

**根因（四步）**：① 决定只存在于对话（「我先记下」是一句话，不是一次写入）；② 隔了时间 + 上下文压缩（实例自述「中间有一段对话被压缩过，如果那句话落在被压缩的区间里，那就是我漏记了」）；③ 后续文档从当时的上下文写起，不是从决定清单写起；④ 设计档把反面写成「决策」——从漏记升级成记反。

**版本核对（用户质疑「是以前就这样，还是取消中文样本后变成这样」）**：
- 两天前英文运行面（commit `58b6ffdc`，2026-10-17）：`persona-engineering.md` 只有「唯一豁免：记录用户刚做的决定」（许可，非义务）·「欠账入清单」（管工作项）·「新债当日入账」；`discipline-engineering.md` 零命中；`common.md` 只有「上下文自掌舵」三条。**三条款从未存在**。
- 中文镜像（`docs/core/design/prompts/discipline-engineering.md`，10-17 在盘）只有 **why**：「用户向你表达的需求，会随着上下文的压缩而灭失……」⇒「需求档是那个『为什么』的唯一耐久载体」；**没有动作规则**。该镜像于 2026-10-19 10:44（commit `84dd0b5b`）随中文镜像取消而删除。
- 结论：不是翻译丢条款，是规则从未建立；被删掉的是唯一记录过风险的地方。

**用户对机制的修正（2026-10-19 22:29）**：「主动压缩他知道啥时候压缩，被动压缩他不知道啊，这条纪律怎么起作用？」⇒ **「压缩前冲刷」不可执行**（被动压缩在请求间安全点触发，模型收不到临近信号）；可执行的是**压缩后重锚**——模型能看到 `context.mjs:34-37` 的 `[Context was automatically compacted…]` 标记（自带「Check memory search for any missing decisions」）。

**本批范围（三条）**：
1. **同轮落笔**：任何需求决定（形态 / 参数 / 边界 / 排除项）在做出当轮写盘——优先需求档；尚未到需求档时写进批次档 §1「已定决定」清单（一行：决定 + 用户原话 + 时间）。「我先记下」只有在同一轮有真实写入时才成立。
2. **压缩后重锚**：看到 `[Context was automatically compacted…]` 标记（或主动压缩回执）后，第一个动作 = 回读当前批次档 §1 决定清单 + 台账，核对摘要是否丢了决定；丢了立即补写。
3. **未落盘决定 = 台账行**：谈定但尚未进需求档的决定，立即挂一行台账（可见债务）；决定进需求档后核销该行。

**为什么**：上下文压缩会丢掉对话里的需求（用户原话，来源可指认）；需求档是「为什么」的唯一耐久载体；文档写反比漏更坏——它会变成后续实施的依据。

**不做**：不改压缩机制（阈值 / 摘要指令）· 不写「压缩前」动作（触发点不可观察）· 不改台账 schema · 不改普通模式（另裁）· 不改批次档六段结构。

**已确认**：用户 2026-10-19 22:35 逐字「开批」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>


## 本批条目（覆盖）

来源 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.12（FR34）；台账 `#1713`。设计档 = `docs/core/design/PROMPT-SYSTEM.md` §6.36（L1407 起）。

| # | 条目 | 落点 | 覆盖 |
|---|---|---|---|
| 1 | 同轮落笔：决定做出当轮写盘，需求档优先，否则批次档 §1 `已定决定` 行 | `persona-engineering.md:29` 后（块 A 第 1 条） | 全部 |
| 2 | 压缩后重锚：标记 / 回执后首动作 = 回读 §1 清单 + 台账 | `persona-engineering.md:29` 后（块 A 第 2 条） | 全部 |
| 3 | 未落盘决定 = 台账行，进需求档当轮核销 | `persona-engineering.md:96` 条尾（块 B） | 全部 |
| 4 | `discipline-engineering.md` 需求步判定 | `discipline-engineering.md:37` 后新增一行（块 C） | 判为加，理由 = 设计档 K4 |
| 5 | `common.md` 判定 | 零改 | 判为不落，理由 = 设计档「common.md 判定」四条 |
| 6 | 「已定决定」行形 | §1 内行约定（行首标记），非子块；六段结构零改 | 全部 |
| 7 | 与既有条款逐句对照 | 设计档对照表七行，结论 = 零矛盾 | 全部 |

**不在本批**：压缩机制（阈值 / 摘要指令）· 台账 schema · 批次档六段结构 · 普通模式（另裁）· 机械门 / 工具 / 状态 · `thincoder-core/prompts/**`（实施轮 eng-coder 的笔）。

## 受影响文件

| 文件 | 现行 | Δ | 说明 |
|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 240 行 / 59,774 字符 | +2 行 / +1,380 字符 | 块 A + 块 B；改后 61,154 ≤ 61,567（+3%） |
| `thincoder-core/prompts/discipline-engineering.md` | 200 行 / 36,773 字符 | +1 行 / +256 字符 | 块 C；改后 37,029 ≤ 37,876（+3%） |
| `thincoder-core/prompts/common.md` | 273 行 / 43,080 字符 | ±0 | 判为不落 |
| `docs/core/design/PROMPT-SYSTEM.md` | 1,491 行 / 124,794 字符 | 本笔 = §6.36 | 实施轮零触 |

测试覆盖：零单测（纯文本、无分支）；机判 = `scripts/prompt-refs-check.mjs` + doc_check 交付门。

## 验收对照（回指 §13.12 ①–⑥）

| # | 验收 | 判法 |
|---|---|---|
| A1 | ① 同轮落笔句在场 | 子串 `A decision lands in the round it is made` 1 次 |
| A2 | ② 重锚句在场 | 子串 `[Context was automatically compacted` · `read back the current batch record §1` 各 1 次 |
| A3 | ③ 台账行句 + 核销条件 | 子串 `is a debt of the same shape` · `closes in the round the decision reaches the requirements doc` 各 1 次 |
| A4 | ④ 携 why、无禁令腔 | 新增区段禁令词扫描 = 0（设计轮已预扫） |
| A5 | ⑤ 提示词面零文档引用 · 体量 ≤ +3% | `prompt-refs-check.mjs` 命中 0；字符数 ≤ 上限 |
| A6 | ⑥ 逐句对照无矛盾 | 设计档对照表七行 = 零矛盾；行为观察下一批 |
| A7 | 三条触发模型侧可观察 | 决定当轮 / 标记或回执 / 谈定当轮 |

## 关键决策

K1 权威句落 `persona:29` 后（许可句旁）· K2 规则 3 落 `persona:96` 条尾（同族债务）· K3 「已定决定」= §1 行约定非子块（append-only）· K4 纪律档需求步 +1 行（该步现文只给最终落点，是「我先记下」的文本来源）· K5 `common.md` 不落（范围 + 读者 + 问题不同）· K6 不写压缩前动作 · K7 提示词引用真实标记串。详见设计档 §6.36。

## 上抛项

无。

## 本轮修订（设计档 · 父侧内容核验 2026-10-19）

| # | 问题 | 落点 | 状态 |
|---|---|---|---|
| 1 | 块 C 落 `discipline-engineering.md`，该档读者含 eng-coder / eng-designer（`thincoder-core/prompt-overlays.mjs:44-45`）；二者不能写需求档 / 批次档 §1（D1）⇒ 原文是给无法执行它的角色下的指令（与设计 K5 同一判据相抵） | 块 C 逐字文本补动作主体 = 主 agent（`docs/core/design/PROMPT-SYSTEM.md:1462`）；落点表 L3 字符数 +255 → +300 字符 + 1 换行（`:1471`）；受影响文件表 +256 → +301、改后 37,074 ≤ 37,876（`:1506`）；验收 A1 加子串 `the main agent writes it down in that round`（`:1516`）、A5 预计字符数 37,074（`:1520`）；K4 补读者面 + 主体判据（`:1533`） | 已落 · 设计档 doc_check PASS |
| 2 | §13.12 ⑥ 要求「对照结论记入批次档」，A6 未给批次档落点 | 验收 A6 补「对照结论在收口时落批次档 §6（主 agent 笔）」（`docs/core/design/PROMPT-SYSTEM.md:1521`） | 已落 |

**读数（2026-10-19 本席）**：块 C 300 字符（原 255）；新增区段禁令词扫描 A / B / C 各 0 命中；`node scripts/prompt-refs-check.mjs` ⇒ 提示词面 69 档 + 代码面 463 档、命中 0；`doc_check(mode:"gate", target:"thincoder", docs:["docs/core/design/PROMPT-SYSTEM.md"])` ⇒ DOC-CHECK GATE: PASS（0 条命中）。

**零改**：`thincoder-core/prompts/**` · 需求档 · 产品代码 · 块 A / B 语义与落点 · `common.md` 判定 · 普通模式 · 块 C 的插入位置（`discipline-engineering.md:37` 后）不变。

## 本轮修订 2（设计评审 · 九条 · 2026-10-19 本席）

来源 = §3 评审表 #1–#9（父侧全部受理）。逐条落点（修正后实读）：

| # | 级别 | 修法 | 落点（设计档 = `docs/core/design/PROMPT-SYSTEM.md`） |
|---|---|---|---|
| 1 | 🟡 | 块 C 插入位改条文本锚（引步骤 1 收束段两段原文，逐字）+ 层次说明（`:30`–`:38` 各属哪层）；A1 加位置判据（块 C 行 > 收束段行、< 步骤 2 行，同档内比较） | 插入位说明 `:1461-1464`；A1 `:1522` |
| 2 | 🟡 | §1 行约定归属：在批次档格式拥有档登记一行（回指 §6.36）+ K8 记归属判由 + 需求档 §5.3 枚举随动列上抛（主 agent 笔） | `docs/core/design/BATCH-RECORD.md:248-251`；K8 `:1543`；上抛 `:1547`；边界同步 `:1530` |
| 3 | 🟡 | 勘察证据行补两个记录面拥有档的已查结论（批次档格式 ∥ 台账用法面，各给坐标与「相关」判定） | `:1443-1444` |
| 4 | 🔵 | A4 拆两句判据：禁词扫描 0（机械）+ 三块逐块 why 在场的一次性核对（列出四段 why 子句原文） | A4 `:1525` |
| 5 | 🔵 | A7 增一次性常量比对：提示词所引前缀必须是 `COMPACTION_PREFIX` 的前缀（方向写死） | A7 `:1528` |
| 6 | 🔵 | §6.30 K4 约定串清单补 `已定决定` + 注明「成员为示例、判据按类」 | `PROMPT-SYSTEM.md:813` |
| 7 | 🔵 | 块 C 标题改为与块 A 同句（`in the round it is made`），动作句不动；`settles` 零残留（实读 = false） | 块 C `:1467`；L3 `:1476`；A1 `:1522` |
| 8 | 🔵 | 块 A 逐字携完整行形（`- **已定决定**：<decision> · 用户原话：「<verbatim words>」 · 时间：<time>`，含标记词 / 全角冒号 / ` · ` 分隔符）；K3 判由同步 | 块 A `:1451`；K3 `:1538` |
| 9 | 🔵 | 用例 C8（已挂台账行的决定进需求档前被推翻 ⇒ 按既有「已废弃」态撤回或改写绑定新决定；§1 行不回改）；块 B 关闭条件补该半句 | C8 `:1505`；块 B `:1458` |

**读数（2026-10-19 本席）**：

- 禁词扫描（块 A 第 1/2 条、块 B、块 C）= 0 命中；why 子句在场（块 A 两条 / 块 C）= 三条 `true`。
- 触发字面比对：`[Context was automatically compacted` 是 `COMPACTION_PREFIX`（`thincoder-core/context.mjs:34-37`）的前缀 = `true`（方向 = 常量 `startsWith` 提示词前缀）。
- 块 C 位置模拟（收束段行 37 < 块 C 行 38 < 步骤 2 行 39）= 通过；块 C 三空格缩进 = 通过。
- 体量（模拟落笔后）：`persona-engineering.md` 242 行 / 61,449 字符 ≤ 61,567；`discipline-engineering.md` 201 行 / 37,074 字符 ≤ 37,876；块 C 300 字符（标题换词等长）。
- `doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md","docs/core/design/BATCH-RECORD.md"])` ⇒ DOC-CHECK GATE: PASS（0 条命中）。

**零改**：三条规则的判定 / 落点 / 触发点 · 块 A / B / C 的语义（仅补定位、归属、判据、用例与行形）· `thincoder-core/prompts/**` · 需求档 · 产品代码 · `common.md` 判定 · 普通模式 · 六段结构。

**上抛项（待裁 · 主 agent 笔）**：`requirements/ENGINEERING-MODE-V2.md` §5.3（`:175`）对 §1 的构成枚举未列「已定决定」行；格式归属已在 `BATCH-RECORD.md` §4.10 登记，枚举是否随动（补「决定清单」）归主 agent 裁定。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

## 设计评审 · PROMPT-SYSTEM.md §6.36（谈定即落笔 · FR34）

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Clarity | 🟡 | 块 C 的插入坐标自相矛盾：`PROMPT-SYSTEM.md:1459` 说「步骤 1 的子 bullet、三空格缩进，与 `:31–35` 同层」，落点表却写 `:37` 后（`PROMPT-SYSTEM.md:1471`），`:36`/`:37` 是什么未说明；而验收 A1 只做子串在场比对（`PROMPT-SYSTEM.md:1516`），块 C 落错步骤（如落进步骤 2）仍全绿。本档已有一条成文口径可承此风险：`PROMPT-SYSTEM.md:261`「落笔前按条文本复核，行号不作定位依据」。 | 把插入位改成条文本锚（引步骤 1 最后一条子 bullet 的原文句，逐字给出），并说明 `:36`–`:37` 属哪一层；验收补一条位置判据（块 C 必须落在步骤 1 的条区间内），使错位可判。 |
| 2 | Document ownership | 🟡 | 新增的 §1 行约定（`- **已定决定**：<决定> · 用户原话：「<逐字>」 · 时间：…`，`PROMPT-SYSTEM.md:1432`）是批次档格式面元素，但全节只在本档登记（`PROMPT-SYSTEM.md:1435` K3 判由、`:1532`），既未引也未改拥有该格式的 `docs/core/design/BATCH-RECORD.md`（需求档：`ENGINEERING-MODE-V2.md:559`「就地更新 = M3 批次档六段」）；同时需求档 §5.3 对 §1 的构成陈述「§1 主 agent 目标+前情+条目」（`ENGINEERING-MODE-V2.md:175`）因此多出第四类内容而未对账。边界仍写「批次档六段结构零改 · … · 需求档零笔」（`PROMPT-SYSTEM.md:1524`），即把这条格式约定的归属留白。 | 明确该行约定归哪一档拥有：或在 `BATCH-RECORD.md` 段落形约定处登记一行（并回指 §6.36），或在本节写明「格式面只在提示词侧成立」的判据并同时登记需求档 §5.3 的枚举随动（可作上抛项）；两者选一，不要留白。 |
| 3 | Survey evidence | 🟡 | 勘察证据行（`PROMPT-SYSTEM.md:1441`–`:1442`）点名的是提示词三档 / 两处代码坐标 / 本档四节 / 需求档 §13.12·§13.10，并只对「独立公共源文档仓」给出「工作目录内无独立公共源文档仓——已查无」；本节实际动了两个记录面约定（批次档 §1 行形、台账债务行），其拥有档（批次档格式 ∥ 台账用法面）既未列入已查清单，也没有「已查、无相关」的记录——按判据，缺记录读作未勘察。 | 在证据行补齐这两面：列出所查的拥有档（存在则给坐标，不存在或已查无则逐项写「已查无」），使「有没有相关」对每条约定都有落字。 |
| 4 | Acceptance criteria | 🔵 | A4 标题写「§13.12 ④：携 why、无禁令腔」（`PROMPT-SYSTEM.md:1519`），判法只有禁令词扫描 0 命中——④ 的「携 why」一半没有判据；逐块看，块 A 第二条的 why 解释的是触发点边界（为何不写压缩前动作），块 B 的 why 倚靠宿主 bullet（`persona-engineering.md:96` 欠账条自身）而非本句自带。 | A4 拆成两句判据：禁令词扫描 0（机械）+ 逐块 why 在场的一次性核对（三块各指出 why 子句），并在 A4 的判法列写明核对对象，避免「携 why」只靠阅读印象。 |
| 5 | Acceptance criteria | 🔵 | FR34 ② 整条依赖 `[Context was automatically compacted…]` 这一字面（块 A 第二条，`PROMPT-SYSTEM.md:1450`），A7 仅称该触发「模型侧可观察」（`PROMPT-SYSTEM.md:1522`）；但没有任何验收核对提示词里引的字面与运行时标记常量同形（`thincoder-core/context.mjs:34-37` 不在本次评审面，本席未核）。若该常量改形，FR34 ② 整条静默失效，而 A1/A2/A7 仍全绿。 | A5 或 A7 增一条一次性常量比对：断言提示词所引前缀是运行时标记常量的前缀（子串方向写死），并把读数记入批次档；这样触发点失效会被读数暴露。 |
| 6 | Document ownership | 🔵 | §6.30 的 K4 表按类列举「写进中文批次档 / 台账的约定串」（`PROMPT-SYSTEM.md:813`），成员为 `评审通过` / `暂缓批复核：无` / `暂缓 · 复核条件` / `已查无`；本节以「§6.30 K4 字面类」为据把 `已定决定` 写进英文提示词（`PROMPT-SYSTEM.md:1435`），但 K4 行未随动——提示词面中文合法字面的分类表与在盘字面出现分离。 | 在 K4 行的约定串清单里补 `已定决定`（表是分类单源，成员应齐），或在 K4 行注明「成员为示例、判据按类」以消歧；两者取一，别留两可。 |
| 7 | Clarity | 🔵 | 同一条规则在两个面用了两个名字：人格档块 A 标题「A decision lands in the round it is made」（`PROMPT-SYSTEM.md:1449`）∥ 纪律档块 C 标题「A decision lands in the round it settles」（`PROMPT-SYSTEM.md:1462`）；要求档原措辞是「在做出当轮」（`ENGINEERING-MODE-V2.md:754`）。两档同链装配、同一模型先后读到，与既有命名纪律「同一个东西在所有面只用一个名」（`PROMPT-SYSTEM.md:417`）相抵。 | 两处统一为要求档措辞的同一句（made / 做出当轮），块 C 只改标题词、动作句不动。 |
| 8 | Clarity | 🔵 | K3 的成立理由之一是「行首固定标记让每条自足、可全文扫读，回读时按标记收行」（`PROMPT-SYSTEM.md:1435`），但落到提示词的只有词本身（块 A「a 已定决定 line in batch record §1 (the decision · the user's exact words · the time)」，`PROMPT-SYSTEM.md:1449`）——完整行形（加粗标记 + 全角冒号 + 分隔符）只住设计档 `:1432`，写盘者会各写各的形状，「固定标记」并不固定；回读按词扫仍可用，但 K3 的理由只兑现一半。 | 把行形逐字并入块 A（一行，约 40 字符，体量预算有余量），或明确写「标记词固定、标点可变」，使 K3 的理由与落地文本对齐。 |
| 9 | Acceptance criteria | 🔵 | 用例表 C1–C7 覆盖正常 / 边界 / 错误，但缺一条：已挂台账行的决定在进需求档前被推翻 / 作废（不再是已定项）时，该行如何收口。块 B 只给出一条关闭条件「closes in the round the decision reaches the requirements doc」（`PROMPT-SYSTEM.md:1456`），该类行会永久挂在池面。 | 补用例 C8（决定被推翻 ⇒ 该行按台账既有已废弃态收口，或改写绑定新决定），并在块 B 的关闭条件里补这半句；相邻纪律（清账轮锚点复核）可作回指依据。 |

**计数：🔴 0 · 🟡 3 · 🔵 6（共 9 条）**

**评审范围限制（写在结论前）**：(a) 本次未声明项目标准文档，方法论合规按 Project Guide 判；(b) 未提供文档地图，「文档归属」判据降级——拥有档的判定取自 `ENGINEERING-MODE-V2.md:559` / `:175` 在内的在册表述；(c) 受影响文件的行数 / 字符数只能核跨节一致性（§6.35 表 239 行 / 59,256 字符 → §6.36 表 240 行 / 59,774 字符 = +518，与 §6.35 的 +518 自洽；discipline 36,773 与 §6.35 表同数），提示词档本体不在评审面，未实读。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**2026-10-19 23:07:16 · 用户逐字：「批准」**

- **批准对象** = 设计档 `PROMPT-SYSTEM.md` §6.36（块 A / B / C + 落点表 L1–L5 + 验收 A1–A7），含评审 #13 九条修正后的文本。
- **口径**：批准 = 实施启动；本批一舱（提示词文本面，两档三处），同轮派工。
- **评审链**：轮 1 pass（🔴0 · 🟡3 · 🔵6）→ 修正轮 #14 九条全 Fixed → 父侧逐条核验通过。
- **上抛项裁决**：需求档 §5.3（`:175`）§1 构成枚举已由父侧补为「目标+前情+条目+已定决定清单」；格式归属登记在 `BATCH-RECORD.md` §4.10。
- **父侧机械更正披露（父侧直接执行 · 可回退 · 无新语义）**：设计档上抛项一行由「待裁」改为「无 + 已裁说明」；三档 `DOC-CHECK GATE: PASS`。

## §5 实施记录（eng-coder）

**状态行**：✅ 实施完成（2026-10-19）

**实施席**：eng-coder（本 session）· 授权 = 设计档 §6.36（`docs/core/design/PROMPT-SYSTEM.md:1407` 起）+ 批次档 §2 任务书 · 设计评审 §3 九条修正 · 用户 §4 批准。

### 落点（三处 · 逐字照设计档）

| # | 文件:line（改后） | 动作 | 逐字源 |
|---|---|---|---|
| L1 | `thincoder-core/prompts/persona-engineering.md:30-31` | 在「唯一豁免」条（`:29`）后新增两条 bullet（同列表、行间无空行；`:29` 零改） | 设计档 `PROMPT-SYSTEM.md:1451-1452`（块 A） |
| L2 | `thincoder-core/prompts/persona-engineering.md:98` 条尾 | 「Debts go on the list」条内续写一句（行数 ±0；L1 的 +2 行后按条文本锚定位，不按行号） | 设计档 `:1458`（块 B，含起首单空格） |
| L3 | `thincoder-core/prompts/discipline-engineering.md:38` | 步骤 1 收束段（`:37`）之后新增三空格缩进子 bullet（第 6 条） | 设计档 `:1467`（块 C） |

### 逐字命中读数（实施席实测 · node 逐字子串比对）

| 块 | 命中 | 设计档行长 | 附注 |
|---|---|---|---|
| A1 | 1 | 722 字符 | `—` / `…` / `§` / 全角冒号 / ` · ` / 「」 逐字一致 |
| A2 | 1 | 524 字符 | `[Context was automatically compacted…]` 的 `…` 逐字 |
| B | 1 | 427 字符（含起首空格） | 续写起点 = `chases it. A decision`（单空格） |
| C | 1 | 300 字符 | 三空格缩进 `   - `；`settles` 0 次 |

A1/A2/A3 子串读数（按档）：`A decision lands in the round it is made` = 1 · `otherwise one line in batch record §1, in the fixed form` = 1 · `- **已定决定**：` = 1 · `[Context was automatically compacted` = 1 · `read back the current batch record §1` = 1 · `and the ledger` = 1 · `is a debt of the same shape` = 1 · `closes in the round the decision reaches the requirements doc` = 1；discipline 档 `A decision lands in the round it is made` = 1 · `the main agent writes it down in that round` = 1。

### 位置判据（同档行索引）

`discipline-engineering.md`：收束段行 37（含 `are the marker that requirements were accepted.`）< 块 C 行 38 < 步骤 2 行 39 ⇒ 通过；块 C 行首 = 三空格 + `- ` ⇒ 通过。

### 体量实测

| 文件 | 改前 | 改后 | 上限（+3%） | 判 |
|---|---|---|---|---|
| `persona-engineering.md` | 240 行 / 59,774 字符 | 242 行 / 61,449 字符 | 61,567 | 通过 |
| `discipline-engineering.md` | 200 行 / 36,773 字符 | 201 行 / 37,074 字符 | 37,876 | 通过 |

### 机检

`cd thincoder && node scripts/prompt-refs-check.mjs` ⇒ `汇总：提示词面 69 档 · 代码面 463 档 · 命中 0`（exit 0）。

### 零改核对

- `persona-engineering.md:29` 原句逐字保留（`record a decision the user just made … done in the same turn`）；宿主欠账条原句是 `:98` 的前缀，块 B 只作条尾续写——两条均「仅追加」。
- `discipline-engineering.md` 步骤 1 其余行零改：`:30` 编号行 / `:31-35` 五子 bullet / `:36` 空行 / `:37` 收束段逐字在盘；与 HEAD 重建比对 = 逐字相等（仅块 C 一行插入）。
- `git diff --name-only -- thincoder-core/prompts` ⇒ 两档（persona / discipline）；`common.md` 与其余提示词档零改（`已定决定` / `A decision lands…` 全目录只命中两档）。
- 反推核对：现档删去三块 = 改前基线（persona 59,774 字符 / 240 行；discipline 与 HEAD 重建逐字相等）⇒ 除三块外零增删。
- **披露**：工作树在本轮前已带其他在途批次的未提交改动（`PROMPT-SYSTEM.md` / `BATCH-RECORD.md` / 需求档 / subagent 工具档等）；`git diff --name-only` 全库 13 项，其中本笔 = 2 项（其余非本席笔、非本批范围）。批次档本段经 batch 工具写入。

### A4 / A7 读数

- A4 ①：块 A1 / A2 / B / C 禁词（`never|do not|don't|must not|may not|forbidden`）扫描 = 各 0 命中。
- A4 ②：why 子句四段在场 = 全部 true（A1 `a decision held only in the conversation…` · A2 `Nothing before the compaction…` · B 宿主 bullet `a debt living only in report prose…` · C `waiting for the discussion to close…`）。
- A7：`COMPACTION_PREFIX`（`thincoder-core/context.mjs:34-37`）`.startsWith('[Context was automatically compacted')` = **true**；反向（常量 startsWith 带 `…]` 的提示词全字面）= false——方向按设计写死（提示词前缀 ⊆ 运行时常量）。

### 内部探索审计（轮 1）

- 结论：文本面（块 A / B / C 逐字、位置、体量、禁词、why、常量比对）全部通过；1 条 🟡 = 本节（§5）尚未写入。自修 = 本节写入，文本面读数不变。
- 非偏差观察（不属本席笔）：§2 的受影响文件表仍为修订前读数（+1,380 / +256 · 61,154 / 37,029），与设计档最终表（`:1511-1512`）及盘上读数（61,449 / 37,074）不一致——§2 = eng-designer 笔，报父侧路由，本席不改。

### 决策披露

| # | 决策 | 依据 |
|---|---|---|
| 1 | 块 B 逐字含起首单空格（`chases it. A decision…`） | 设计档 `:1458` 行形逐字；设计 +427 字符含该空格 |
| 2 | L2 按条文本锚（「Debts go on the list」条）定位，不用行号 | L1 的 +2 行使 `:96` 位移到 `:98`（任务书已预告） |
| 3 | L3 直接插在收束段行后、步骤 2 行前，不加空行 | 设计档层次说明 `:1464`；Δ = +1 行 |
| 4 | 零新增 `##` 节、既有行文零改（仅 `:98` 条尾续写） | 设计边界 `:1530` |

**终态**：clean（文本面零偏差；审计唯一缺口 = §5 缺位，由本节写入关闭）。

### 内部代码评审（轮 1 · advisor type=code · 2026-10-19）

- 结论：**pass**（🔴 0 · 🟡 2 · 🔵 2）。逐字 / 位置 / 子串 / why / 触发常量五项与已批准设计一致；`settles` 在块 C = 0；`common.md` 与其余提示词档零命中；A7 常量比对经评审席独立复算 = true。
- 🟡 #1 = §2 受影响文件表读数滞后（`+1,380 / +256` · 61,154 / 37,029，对照设计档 `PROMPT-SYSTEM.md:1511-1512` 与盘上 61,449 / 37,074）——§2 = eng-designer 笔，本席不修，报父侧路由（本段上方「非偏差观察」同一条）。
- 🟡 #2 = 设计 A6 第二半「对照结论落批次档 §6」（`PROMPT-SYSTEM.md:1527`）尚待收口时落笔——父侧收口步（协调项），非提示词档缺陷。
- 🔵 #3 / #4 = 触发字面为截断前缀形、以及与运行时标记自带 `Check memory search for any missing decisions.]`（`thincoder-core/context.mjs:37`）的并读建议——可选；设计 K7 / `:1419` 已裁，本席不擅改已批准措辞。
- 自修轮：0（无本席可修项；未改任何已落文本）。
- **终态：clean**（设计逐字台面零偏差；余项均在其他笔或属可选提示）。

## §6 验证与收口（父代理）

## 验证与收口

**交付核验（父侧实读 + 复跑 · 2026-10-19 23:14）**

- **L1** `persona-engineering.md:30-31`：块 A 两条 bullet 逐字在位（含 `已定决定` 行形、全角冒号、` · ` 分隔符）；`:29` 原句零改。
- **L2** `:98`：块 B 条尾续写（含「被推翻 ⇒ 按已废弃态撤回或改写绑定新决定」半句）；宿主条原文是其前缀。
- **L3** `discipline-engineering.md:38`：块 C 三空格缩进子 bullet；位置判据成立（37 收束段 < 38 块 C < 39 `2. **Design**`）；`settles` 在块 C 零残留。
- **体量实测**：persona **242 行 / 61,449 字符**（≤ 61,567）· discipline **201 行 / 37,074**（≤ 37,876）。
- **机检（父侧复跑）**：`prompt-refs-check` ⇒ 提示词面 69 档 · 代码面 463 档 · **命中 0**。
- **逐字命中**：块 A / B / C 各 1 次；`A decision lands in the round it is made`（persona 1 ∥ discipline 1）。
- **零改**：本笔仅两档；`git diff` 其余 11 项为本批设计轮与在途他批改动，非本笔（实施席报告与父侧实读一致）。

**验收勾销（A1–A7）**

| # | 判据 | 读数 | 判定 |
|---|---|---|---|
| A1 | 同轮落笔句在场（含固定行形） | 块 A 1 次；`- **已定决定**：` 1 次 | ✅ |
| A2 | 重锚句在场（触发 / 回读 §1 + 台账） | `[Context was automatically compacted` · `read back the current batch record §1` · `and the ledger` 各 1 | ✅ |
| A3 | 台账行句 + 核销条件（含推翻半句） | `is a debt of the same shape` 1；`closes in the round the decision reaches the requirements doc` 1 | ✅ |
| A4 | 携 why、无禁令腔 | 禁词扫描 0；四段 why 逐段在场（A1/A2/B 宿主/C） | ✅ |
| A5 | 零文档引用 · 体量 ≤ +3% | `prompt-refs-check` 0；61,449 ≤ 61,567 · 37,074 ≤ 37,876 | ✅ |
| A6 | 对照无矛盾 + 结论落批次档 | 七行对照结论 = 零矛盾（依据 = 设计档 §6.36 对照表）；**本节即批次档落点** | ✅ |
| A7 | 三条触发模型侧可观察 | 决定当轮 / 压缩标记或回执 / 决定谈定当轮；`COMPACTION_PREFIX` 前缀比对 true | ✅ |

**上抛处置**：① §2 受影响文件读数（+1,380 / +256 · 61,154 / 37,029）滞后于实测（+1,675 / +301 · 61,449 / 37,074）——**以 §5 / 本节实测为准**（§2 append-only，不回改）；② 设计档上抛项已裁：需求档 §5.3 §1 枚举已补「已定决定清单」，格式归属登记于 `BATCH-RECORD.md` §4.10。

**收口清单**

- doc_check 交付门（close 触发）：PASS（close 回执确认）。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无用户文档面变更。
- 台账：`#1713` 在途 → 待核销 → **已核销**（证据 = 本节 + §5 + 两档坐标）。
- 设计令牌：链终消费。
- 新债：批次档 §2 陈旧计数无传导（`#1714`，条件 = 用户裁定开批）。
