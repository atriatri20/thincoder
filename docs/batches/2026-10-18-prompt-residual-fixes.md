# 2026-10-18 · prompt-residual-fixes
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 06:54「这三个也都处理掉吧」= 授权开批处置 `#1640` `#1641` `#1642`。
> 台账 = #1643（core · 归批）。前情 = docs/batches/2026-10-18-en-why-form.md（EN 面因果化 · 已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（4 族 · 1 条撤回）**：英文运行面四项残留 —— ① 写门「非机械改」carve-out 缺失 ② 评审参数缺失 ③ 工具路由表结构断裂 ④ 读数快照漂。① ② 是**能力差**（CN 规格有、EN 运行面没有 ⇒ 模型读不到 = 不会执行）；③ 是**渲染缺陷**；④ 是**快照污染**。

**关键判据**：
- **① ② 判为真缺口而非措辞差**：模型执行的是 EN 提示词；CN 面写了而 EN 面没写 = 那条规矩在运行时不存在。
- **③ 只重排结构，不改任何一条规矩的文字**。
- **④ 删数字、改定性**（父侧裁）：`8645 of 71117` 会随文档变动而漂，三值互斥本身就是证据；补一个新数字下月又错。**规矩不依赖那个数字**，数字只是论据 —— 删数字不损规矩。
- **撤回一项**：台账 `#1642`③「`design points & forbidden scope` 与 CN `设计要点与边界` 命名不一」判**不成立** —— 中文规格写中文名、EN 运行面写机器门读的字段名，是双语映射；且机器门 `spawn-gates.mjs` 读 `/\s+design\s+points\s*/i`，改 EN 名会直接把门打掉。

**授权口径**：用户 2026-10-18 06:54「这三个也都处理掉吧」。

**批径**：`thincoder-core/prompts/**` = 产品码面 ⇒ 走设计 → 评审 → eng-coder（token gate）。

**父侧撤回一次错误裁决（2026-10-18 06:5x · 用户当场纠正）**

- **原裁决（错）**：台账 `#1642`③「`design points & forbidden scope` 与 CN「设计要点与边界」命名不一」判**不成立**，理由写「机器门 `spawn-gates.mjs` 读 EN 的 `design points`，改名破门」。
- **错在哪**：① **没读那个文件就下结论** —— 只凭实施报告里一句「`spawn-gates.mjs:21` 的 `/design\s+points/i` 仍命中」推断出「必须命中这个」；② 实读后：`spawn-gates.mjs:21` = `{ label: "设计要点与禁止范围 (design points & forbidden scope)", markers: [/设计要点/, /design\s+points/i] }`，`:59` = `markers.some(...)` ⇒ **双 marker，中文或英文任一命中即过，改名不会破门**；③ 更根本的一层：**即使真会破门，也不构成拒绝统一的理由** —— 门是给规矩站岗的，规矩不该为门变形；门的判据该跟着规矩改，不是反过来（用户 2026-10-18 06:57 原话：「为什么还在用机器门？！因为机器门所以不能改，你听听，这合理吗！」）。
- **现行裁决**：⑤ 项**复活并纳入本批**。三方措辞统一到**门 label 的形**：门 label = `设计要点与禁止范围 (design points & forbidden scope)` ⇒ CN `discipline-normal.md:207` 的「设计要点与边界」→「设计要点与禁止范围」；EN `persona-engineering` 的 `**Design points & boundary**`（W5 已把 `forbidden scope` 改成 `boundary`）→ `**Design points & forbidden scope**`。判据 = **一词一物**（同一字段在门 label / CN 规格 / EN 运行面三处必须同名，现在三处三样）。
- **教训（写进本档）**：**「某文件里的某个字面」是测量，不是推断** —— 报过这一行不等于读懂了它的判定逻辑（`some()` 与 `every()` 差一个词，结论相反）。父侧本轮已第二次犯「拿二手读数当事实」的错（前一次 = 派单数字误抄四例）。

**本批条目（现 5 族）**：① 写门「非机械改」carve-out 缺失 ② 评审参数缺失 ③ 工具路由表结构断裂 ④ 读数快照漂 ⑤ 字段名三方不一（撤回后复活）。

**父侧扩范围：第 ⑥ 项升为主线（用户 2026-10-18 06:58 裁定）**

用户原话：「取消双语机器门才是关键！这类问题不能靠机器门解决！」

- **对象**：`thincoder-core/agent-tools/spawn-gates.mjs` 的任务书五段文本字段门（`:18-24` `TASK_BOOK_FIELDS` 双语正则 + `:57-60` 判定 + `:62-67` 拒 spawn 文案）。
- **为什么删（四条判据）**：
  1. **拦不住它想拦的**：该文件 `:14-15` 自述「判据 = 段标题在场…**内容够不够由执行者拒收兜底**（不做内容校验）」⇒ 原文写「目标与理由：略」也能过门。烂任务书照过，好任务书本来就会写这五段——**两端都无收益**。
  2. **只产生一种行为**：为了让正则认出来，写任务书的人得记住五种写法、中英各一套 ⇒ **为了过门而写标签**，不是为了让子代理读懂。
  3. **双语 marker 是补丁的补丁**：加英文 marker 是因为中英文案不同，两种都留是因为不知道会写哪种 —— **这本身证明判据不该建在文字上**。
  4. **用户判据**：「不希望机制再复杂化」「更相信知其然知其所以然」。用正则查「任务书有没有写清楚」正是机制复杂化的教科书案例。
- **删 / 留边界**：删五段文本校验；**留 `round` 枚举校验**（`:52-56`，结构化参数，非文字匹配）；**留 `ENG_TASK_BOOK_MIN`**（`:35-41`，正面样例模板，不是判据，但注释里「F2 契约的正面样例」要改成「任务书模板」）。
- **连带**：`subagent-spawn.mjs:31` 的调用只删文本校验段；`bench/probe/data.mjs:11` 若依赖「缺字段必抛」的断言，随门一起删。
- **不碰**：提示词里那五段任务书模板保留（给人照抄用，不是门的判据）。

**变更面分组**：①②③④⑤ = 提示词文本面；⑥ = 产品码面（`spawn-gates.mjs` + `subagent-spawn.mjs` + 夹具）。实施必须**分面派单**。

**本批条目（现 6 项）**：① 写门 carve-out 缺 ② 评审参数缺 ③ 表结构断 ④ 读数快照漂 ⑤ 字段名三方不一 ⑥ **删任务书五段文字门（主线）**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-10-18 07:3x 改判轮（用户 07:24 / 07:26：`bench/test/` 不删、改名 `bench/check/*.check.mjs`、内容零改）⇒ 6.6 重写（断言搬至 `bench/check/probe.check.mjs:104`，⑥ 同轮收正）、AC-14 改为机检真判据（`missing mandatory field` 零命中 ∧ round 行为断言在盘）、2.5 扫面换名 + 表列该档、2.7 / 2.8 #10 / 2.9 同步；分两舱（A 提示词文本面 / B 产品码面，B 排在 bench 改名批后））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目（覆盖 · 无新增需求条目）

需求源 = 台账 `#1640` / `#1641` / `#1642`（归批总行 `#1643`）+ 批档 §1 + 父侧 2026-10-18 06:5x / 06:58 两次现行裁决。本批为运行面 / 规格面缺陷修补 ⇒ **无新增需求条目；三行需求档随 ⑥ 失真，在本链内订正**（2.10 ①；舱 D = 父侧笔；验收 AC-15——三行不订正，§6 不得收口）；三条链 = 本节条目 ↔ 2.6 验收 ↔ 台账行。

| # | 条目 | 台账 | 判性 | 处置 |
|---|---|---|---|---|
| ① | 写门「非机械改」carve-out 与「机械改」定义缺失 | #1642 ① | 能力差（真缺口） | EN 三处译入（2.3.1；AC-1/2/3） |
| ② | 评审「设计档在不在」参数缺失 | #1642 ② | 能力差（真缺口） | EN 两处译入（normal 面 `:175` ∥ engineering 面 `:42`；2.3.2；AC-4） |
| ③ | 工具路由表被正文切断（八行脱表） | #1641 | 渲染缺陷 | 只重排、表字不动（2.3.3；AC-5） |
| ④ | 读数快照漂（同指标三值互斥） | #1640 | 快照污染 | 删读数、改定性（2.3.4；AC-6） |
| ⑤ | 任务书字段名三方不一 | #1642 ③ | 一词一物缺陷 | 统一到 `设计要点与禁止范围 (design points & forbidden scope)` 形（2.3.5；AC-7） |
| ⑥ | 任务书五段文本字段门（正则查标题） | 父侧 06:58 裁决 | 机制缺陷（拦不住内容、只产标签） | 拆文字门、留 `round`（2.3.6；AC-8..12 · AC-14 · AC-15） |

⑤ 纳入依据 = 父侧 2026-10-18 06:5x 现行裁决。实读 `thincoder-core/agent-tools/spawn-gates.mjs:21`（门 label = `设计要点与禁止范围 (design points & forbidden scope)`；markers = `/设计要点/` ∥ `/design\s+points/i`）+ `:59`（`markers.some(...)`）⇒ 中英任一命中即过，改名不破门。
⑥ 判据 = 父侧 §1：判据只查标题在场、不查内容（「目标与理由：略」照过门）；为过门背五种写法 = 标签成本；双语 marker 是补丁的补丁；用户口径「机制不再复杂化」。

### 2.2 设计档落点

- 本批设计载体 = 本 §2（六项逐处改前改后 + 验收 + 决策）。
- 本席设计轮已落笔：
  - ⑤ CN 两处（一词一物，同判据）：`docs/core/design/prompts/discipline-normal.md:207` ∥ `docs/core/design/prompts/persona-engineering.md:167`。
  - ⑥ 设计档随正：`docs/core/design/AGENT-LOOP-SUBAGENT.md` 十处（§6.22 五处 / §6.30 五处）+ `docs/core/design/ENGINEERING-MODE-V2.md:265`。
  - ② CN 工程模式面（修复轮新增）：`docs/core/design/prompts/discipline-engineering.md` 一句（`:57` 写权条后 = 新 `:58`）——本席笔，随本链落（舱 C）。
- 非本席笔：需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md:12/:430/:433` 仍写「六字段 + 缺字段即拒」⇒ 父侧随正（2.10 ①；验收 AC-15）。
- 生成面：`docs/core/design/API-CONTRACT.md` 由 `node scripts/api-contract.mjs --write` 重生成（不手改）。

### 2.3 机制设计（逐处 · 改前 → 改后）

#### 2.3.1 ① 写门 carve-out —— `thincoder-core/prompts/discipline-engineering.md` 三处（行内改写，行数不变）

**①-1 `:19` 变更面表 · 工程工具面 · 授权格**

改前（授权格）：

```text
parent direct edit (no spawn/designToken) + gate prevails + explicit commit
```

改后（授权格）：

```text
**a mechanical change** ⇒ direct edit (no spawn/designToken) + gate prevails + explicit commit; **a non-mechanical change ⇒ still goes through design**
```

**①-2 `:23` 直改两条硬约束（补定义括号）**

改前（全行）：

```text
- **Two hard constraints on direct engineering-tools edits**: ① mechanical change ⇒ direct edit + **actually run it and report the reading**; ② any direct edit ⇒ report it as "parent direct execution" + single-commit revertable.
```

改后（全行）：

```text
- **Two hard constraints on direct engineering-tools edits** (**mechanical change** = one that does not alter judgment semantics; one that alters judgment semantics — extracting a predicate / a threshold / what counts as a violation — ⇒ still goes through design, not on the direct-edit face): ① mechanical change ⇒ direct edit + **actually run it and report the reading**; ② any direct edit ⇒ report it as "parent direct execution" + single-commit revertable.
```

**①-3 `:25` 判定句**

改前（全行）：

```text
- **Judgment line**: paths not in the enumeration ⇒ full flow as product-code face (fail-closed); mechanical engineering-tools edits ⇒ direct edit + run + report "parent direct execution".
```

改后（全行）：

```text
- **Judgment line**: paths not in the enumeration ⇒ full flow as product-code face (fail-closed); mechanical engineering-tools edits ⇒ direct edit + run + report "parent direct execution"; **a non-mechanical change (one that alters judgment semantics) ⇒ still goes through design**.
```

#### 2.3.2 ② 评审参数 —— normal 面 `:175`（行内追加）+ engineering 面 `:42`（新增一条 · 修复轮）

改前（全行）：

```text
- **Advisor:** call after changing code. Must provide scope: `paths` (files/dirs to review) or `documents` (context).
```

改后（全行）：

```text
- **Advisor:** call after changing code. Must provide scope: `paths` (files/dirs to review) or `documents` (context). **Reviewing whether a design doc exists requires `type:"design"` with `documents` carrying the design doc itself** (otherwise that criterion never enters the review and the check does not fire).
```

**②-2 工程模式面（新增 · 判据 = 模型读不到的规矩在运行时不存在）**

依据：`thincoder-core/prompt-overlays.mjs:42` 的 engineering 槽 = `persona-engineering.md` ∥ `common.md` ∥ `discipline-engineering.md`——`discipline-normal.md` 只在 normal / explore / coder / plan 装配（`:43` / `:46-48`）⇒ 工程模式里发设计评审的调用方（主 agent）看不到 `:175` 那一句。只补 normal 面 = ② 只对一半会话闭合。

落两层（同句，两模式面各载一份——模式→槽位表把两档装进互不相交的会话；语义单源 = 本条）：

EN `thincoder-core/prompts/discipline-engineering.md`——`:41`（写权条，末句「fires reviews」）后新增一条（新 `:42`，全行）：

```text
   - **Design-review parameter**: reviewing whether a design doc exists requires `type:"design"` with `documents` carrying the design doc itself — otherwise that criterion never enters the review and the check does not fire.
```

CN `docs/core/design/prompts/discipline-engineering.md`——`:57`（写权条）后新增一条（新 `:58`，全行）：

```text
   - **设计评审参数**：评审「设计档在不在」必须用 `type:"design"` 且 `documents` 带设计档本体——否则该判据不进场、核不触发。
```

层次归属 = **纪律层**（「怎么干 / 工具怎么用」→ 纪律层；人格层答「你是谁 / 交付什么 / 边界在哪」），不落 `persona-engineering.md`。

#### 2.3.3 ③ 工具路由表重排 —— `thincoder-core/prompts/common.md:144-173`（纯重排，零字改）

改前结构：

```text
144      | Tool | Use it for | Not ... |      ← 表头
145      |---|---|---|
146-159  14 行数据行（read … git）
160      （空行）
161-162  两段 git why 正文
163-170  8 行数据行（process … question）
171      （空行）
172-173  两段 wait_for 正文
```

改后结构：

```text
144      | Tool | ... |                        ← 表头
145      |---|---|---|
146-167  22 行数据行（read … question，连续无空行）
168      （空行）
169-170  两段 git why 正文
171      （空行）
172-173  两段 wait_for 正文
```

行号映射（旧 → 新）：

| 旧 | 新 | 内容 |
|---|---|---|
| 144-159 | 144-159 | 表头 + 分隔 + 前 14 行（不动） |
| 160（空行） | 168 | 表后空行 |
| 161 | 169 | `**Why the \`git\` tool …**` 段 |
| 162 | 170 | `The bash tool has a matching guard …` 段 |
| 163-170 | 160-167 | 后 8 行数据行（process … question） |
| 171 | 171 | 空行（不动） |
| 172-173 | 172-173 | `wait_for` 两段（不动） |

约束：表格行文字一字不改（行多重集恒等）；两段正文逐字搬移；文件行数不变（269）。

#### 2.3.4 ④ 读数删除 —— `thincoder-core/prompts/persona-eng-designer.md:76`（行数不变）

改前（全行）：

```text
**A design/requirement doc carries the current state only** (user ruling 2026-10-15). A changelog is the single largest injection-pollution source — measured 12.2% of all doc lines (8645 of 71117), up to 51% in the worst doc — and every reader model burns that share on "what changed in the past" instead of "what should be now". Traceability lives in **git commit messages + the batch record** (§1 process notes, §5 implementation record), not inside the spec doc. A design doc states the current truth; the past is not its business.
```

改后（全行）：

```text
**A design/requirement doc carries the current state only** (user ruling 2026-10-15). A changelog is the largest single injection-pollution source we have measured — every reader model burns that share on "what changed in the past" instead of "what should be now". Traceability lives in **git commit messages + the batch record** (§1 process notes, §5 implementation record), not inside the spec doc. A design doc states the current truth; the past is not its business.
```

删面 = `12.2%` / `(8645 of 71117)` / `up to 51% in the worst doc` 三处读数；规矩句（只写当前态 ∥ 历史住 git + 批档 ∥ 过去不归它管）逐字不动。

#### 2.3.5 ⑤ 字段名统一（权威形：`设计要点与禁止范围 (design points & forbidden scope)`）

**⑤-1 `docs/core/design/prompts/discipline-normal.md:207`（CN 设计档 · 已落）**

改前：`  **设计要点与边界**`
改后：`  **设计要点与禁止范围**`

**⑤-2 `docs/core/design/prompts/persona-engineering.md:167`（CN 设计档 · 同字段第二处 · 已落）**

改前：`  **设计要点与边界**（模板字段名，指的是本批的设计要点与作业边界）`
改后：`  **设计要点与禁止范围**（模板字段名，指的是本批的设计要点与作业边界）`

说明：⑤-2 是父侧裁决只点名 ⑤-1 后、本席按同一判据（一词一物）实扫出的第二处同名字段；不改则 CN 面仍留两个名（`禁止范围` ∥ `边界`），判据不闭。只改字段名，括注释义不动。

**⑤-3 `thincoder-core/prompts/persona-engineering.md:163`（EN 运行面 · eng-coder 落笔）**

改前：`  **Design points & boundary**`
改后：`  **Design points & forbidden scope**`

**⑤-4 同形面（已是权威形，不动）**：`thincoder-core/prompts/discipline-normal.md:210` = `  **design points & forbidden scope**`（词同形，仅该档列表句式小写）；三处**活过 ⑥**的锚同形——`ENG_TASK_BOOK_MIN` 设计要点条目（终态 `spawn-gates.mjs:23` = `"设计要点与禁止范围：仅落设计档受影响文件清单；禁夹带新语义。"`）∥ `thincoder-core/tool-docs/subagent.md:23`（`设计要点与禁止范围 (design points & forbidden scope)`）∥ `:29`（`**设计要点与禁止范围**：…`）。

#### 2.3.6 ⑥ 拆任务书五段文本字段门 —— `spawn-gates.mjs`（111 → 91 行）+ 连带三档 + 探针前置依赖

**判据**：删的是「用正则查自然语言标题」这一判据；结构化参数校验不在删除面。

**留 `round` 的理由（单独说明，不是半删）**：`round` 是 schema 声明的结构化参数（`agent-tools/subagent.mjs:152` 的 enum，值集 = `ROUND_VALUES`），判据 = `ROUND_VALUES.includes(a.round)`——不读任何自然语言写法；它承载「初始轮 / 修正轮」语义（修正轮只定点改），决定子代理拿到的轮次语义。删文字门不触及它。

**6.1 `thincoder-core/agent-tools/spawn-gates.mjs`**

| 动作 | 位置（改前） | 内容 |
|---|---|---|
| 删 | `:12-25` | `TASK_BOOK_FIELDS` 注释块 + 双语正则数组 + 尾随空行（14 行） |
| 删 | `:57-60` | `const text = …` + `for (const f of TASK_BOOK_FIELDS) …` 文本校验循环（4 行） |
| 改 | `:4` | `F2（round 结构化参数 + 任务书五段文本字段校验）` → `F2（round 结构化参数校验）` |
| 改 | `:6` | F4 裁撤理由「由 F2 五段字段覆盖」→「由 F2 的 round 参数承载轮次语义」 |
| 改 | `:31-34` | 模板注释 4 行 → 3 行：`任务书模板（五段文本字段的写法样例——供人照抄，不是门的判据；门只校结构化参数 round）。` |
| 改 | `:43-49` | 注释重写（round 参数校验）+ 函数名 `validateTaskBookFields` → `validateRoundParam` |
| 改 | `:62-67` | 拒 spawn 文案 6 行 → 5 行：只报 round，不列五段字段名 |

改后 `spawn-gates.mjs` 前 48 行（F2 面终态；`ENG_TASK_BOOK_MIN` 原样保留）：

```text
 1 /**
 2  * spawn-gates.mjs — M5 委派与 spawn 门新门禁统一落点（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.3）：
 3  * 全部新增门禁逻辑集中于此——装配点（buildSpawnChild / normalizeFileList）只加 import 调用。
 4  * 已实现：F2（round 结构化参数校验）· F6（files 声明面拦截谓词）。
 5  * 裁撤（2026-09-17 主 agent 裁定——不落代码）：
 6  *   - F4 修复轮窄带：全量勘察散文 marker 不可机判（误拒风险不可接受）→ 由 F2 的 round 参数承载轮次语义；
 7  *   - F5 advisor 角色：advisor 不入 spawn 通道（评审走 advisor 工具）——enum 收正为
 8  *     explore/eng-designer/eng-coder。
 9  * 零依赖：本模块零 import（叶子——纯谓词层，无环、无反向依赖）。
10  */
11
12 /** F2 round 合法值（初始轮 / 修正轮——「派单必带」= 无默认值）。
13  * 单源：本档为唯一字面量处——schema 面（`agent-tools/subagent.mjs`）与谓词面（本档）同引用（D2）。
14  */
15 export const ROUND_VALUES = ["initial", "fix"]
16
17 /**
18  * 任务书模板（五段文本字段的写法样例——供人照抄，不是门的判据；门只校结构化参数 round）。
19  */
20 export const ENG_TASK_BOOK_MIN = [
21   "目标与理由：实现批准设计（夹具任务书——五段文本字段齐备）。",
22   "已知事实：设计已评审通过、token 已签发、批次档在册。",
23   "设计要点与禁止范围：仅落设计档受影响文件清单；禁夹带新语义。",
24   "验收标准：设计档验收标准逐条可机验、项目验证链全绿。",
25   "交付报告格式：交付表 + 文件路径 + 验证命令与结果。",
26 ].join("\n")
27
28 /**
29  * F2 round 结构化参数校验（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.2）：
30  * round 枚举（initial|fix，必带集合 = eng-coder/eng-designer）。
31  * 缺 / 非法 → 抛错（派单缺陷——spawn 机械拒）。
32  * 任务书五段文本字段只作模板，不做机械校验——文字判据查得到标题、查不到内容。
33  */
34 export function validateRoundParam(args) {
35   const a = args ?? {}
36   const missing = []
37   if (!ROUND_VALUES.includes(a.round)) {
38     missing.push(a.round === undefined || a.round === null
39       ? `round (${ROUND_VALUES.join("|")}) — the structured round parameter`
40       : `round ∈ {${ROUND_VALUES.join(", ")}} (got ${JSON.stringify(a.round)})`)
41   }
42   if (missing.length === 0) return
43   throw new Error(
44     `Engineering spawn round gate: ${missing.join(" · ")}. ` +
45     `The spawn contract requires the structured round parameter (initial|fix); ` +
46     `the five task-book text segments are a template, not a gate — ` +
47     `a missing or invalid round is a dispatch defect and the spawn is refused.`)
48 }
```

原 `:70-111`（F6 两谓词，42 行）逐字不动，整体前移 20 行（旧 `:70` → 新 `:50`）。

**关于终态块里 `missing` 数组**：五段文本标签删后至多只 push 一项，数组 + `.join(" · ")` 是被删门的死泛化——**保留数组形 = 压 diff**（不改控制流、不改错误文案拼接），不视为遗漏；若要极简化，单判据直接抛也是合法形态，二选一须在实施轮一致。

**6.2 `thincoder-core/agent-tools/subagent-spawn.mjs`（412 → 412 行）**

- `:29` 注释改写（`:30` 不动——仍是 import 说明）：`// M5 F2（… §2.3）：任务书六强制字段校验本体落` → `// M5 F2（… §2.3）：任务书 round 结构化参数校验本体落`（+7 字符；否则旧机制说明活过改名）。
- `:31` `import { validateTaskBookFields } from "./spawn-gates.mjs"` → `validateRoundParam`（−4 字符）
- `:225-228` 注释重写：`round 结构化参数门——工程角色必带 round（initial|fix）；任务书五段文本字段只作模板，不做机械校验（文字判据查得到标题、查不到内容——内容由执行者拒收兜底，需求 §1.14 #9 行为面）。落点 = batchDoc 门之后、token 门之前。explore/plan/coder 豁免。`
- `:230` `validateTaskBookFields(args)` → `validateRoundParam(args)`（round 校验的调用保留；`if (role === …)` 分支不动）

**6.3 夹具腿（`bench/probe/data.mjs` 221 → 217 行；改名批已落，原 `fixtures.mjs`）**

- `:11`（import）连 `:12`（空行）删除——`validateTaskBookFields` 已无消费面，本档不再引 `spawn-gates.mjs`。
- `:142-143` 注释：「版本整数 + 逐族树形态 + 五段任务书过核门（`spawn-gates.mjs` 单源判定）+ `targets` ⊆ 树内档」→「版本整数 + 逐族树形态 + **任务书在场（非空串）** + `targets` ⊆ 树内档」。
- `:150-154`（5 行）→ 3 行数据校验：

```js
    if (typeof f.taskBook !== "string" || f.taskBook.trim() === "") {
      throw new Error(`夹具族「${id}」任务书缺失或为空`)
    }
```

- 依据：门删后「夹具任务书过门」不再存在；`taskBook` 是探针 run 的输入数据 ⇒ 校验面从「过门」退到「在场」（数据形态），判据真、不测已删机制。round 常量冒烟**不留**——探针 driver 恒传 `round: "initial"`，常量自证无信息量；round 行为面 = `validateRoundParam` 行为断言（批次定向单测 AC-9 ∥ 常驻自检 6.6 / AC-14）。

**6.4 `thincoder-core/tool-docs/subagent.md:23`（42 → 42 行）**

改前（全行）：

```text
Task book (eng-coder / eng-designer spawns — six mandatory fields): 目标与理由 (goal & why), round (initial|fix — the structured parameter), 已知事实 (known facts), 设计要点与禁止范围 (design points & forbidden scope), 验收标准 (acceptance criteria), 交付报告格式 (delivery-report format). Keep the labels (Chinese or the English equivalents) — the gate matches these markers; a missing field is a dispatch defect and the spawn is refused.
```

改后（全行）：

```text
Task book (eng-coder / eng-designer spawns — five text segments + the structured round): 目标与理由 (goal & why), round (initial|fix — the structured parameter), 已知事实 (known facts), 设计要点与禁止范围 (design points & forbidden scope), 验收标准 (acceptance criteria), 交付报告格式 (delivery-report format). The five segments are the template — write a task book the child can act on; only round is checked mechanically (a missing or invalid round is refused).
```

理由：门删后「the gate matches these markers / a missing field is refused」成假话；五段中文标签保留（工具面自解释不降级，需求 §8.2① 的可发现性不损）。**字面单源**：改后全行 = `docs/core/design/AGENT-LOOP-SUBAGENT.md:662-665` 代码块四行按单空格拼接的逐字结果（本席实测 `joined === newLine` = true）；两处一字不改、只许一处改时同步另一处（D2）。

**6.5 设计档随正（本席已落，行数不变）**

- `docs/core/design/AGENT-LOOP-SUBAGENT.md`：`:246` 定位句 · `:253` F2 行 · `:257` 落点函数名 · `:264` AC-M5-2 · `:311` U5 · `:655` §6.30 标题 · `:657` 来源句去旧机制断言 · `:659`/`:662-665` 描述面段落 · `:669` KD-TF1 · `:672` §6.30 边界 —— 共十处，行数 673 不变。
- `docs/core/design/ENGINEERING-MODE-V2.md:265`：M5 委派治理句改为「五段 = 人写模板，不做机械校验；唯一机械必带项 = `round`」，行数 524 不变。

**6.6 常驻自检连带：断言随改名落在 `bench/check/probe.check.mjs:104`，⑥ 同轮收正（用户 2026-10-18 07:24 / 07:26 裁定）**

**裁定**：`bench/test/` → `bench/check/`、`*.test.mjs` → `*.check.mjs`，**内容零改**（他批 `2026-10-18-bench-test-cleanup` 以 `git mv` 执行；**改名批已落**：现盘 `bench/check/` 在盘、`bench/test/` 已不存在；该批另把 `bench/probe/fixtures.mjs` → `bench/probe/data.mjs`）。依据 = 用户裁定：bench 是产品，其自检是产品代码，不是单元 / 集成测试 ⇒ **「单元测试零留存」不适用于它，它必须保持绿**（`bench/README.md:229`：不进 CI / 发布门）。

**实测事实**：`bench/probe/driver.mjs:98` = `const args = { task: taskBook, round: "initial", batchDoc, model }`（round 恒 `"initial"`）；`bench/check/probe.check.mjs:104` = `assert.throws(… taskBook: "目标与理由：只给一段。" …, /missing mandatory field/)` ⇒ ⑥ 删文字门后该断言**必红**。

**处置（⑥ 实施轮落笔 · 只改这一处断言，不碰其它 check 档）**：

- 新增 1 行 import（相对导入组内，现 `:16`（`probe-frozen.mjs`）之后）⇒ 其下全部 +1 行：`import { validateRoundParam } from "../../thincoder-core/agent-tools/spawn-gates.mjs"`
- 断言块：改前 `:103-104`（注释 + 断言，2 行）→ 改后 `:104-106`（3 行）：

```js
    // 反例用例②：round 结构化参数缺失 / 非法 ⇒ 机械拒（五段文本 = 模板，不做机械校验）
    assert.throws(() => validateRoundParam({}), /round/)
    assert.doesNotThrow(() => validateRoundParam({ round: "initial" }))
```

- 反例①（`batchDoc` 那条）不改：spawn 门经 `assembleProbeChild` 的行为覆盖仍由它承担。
- 不改 `bench/probe/driver.mjs`——探针 driver 是产品码，为自检加 round 入参 = 改产品接口面（被否，2.8 #10）。
- round 行为面的常驻归属：批次定向单测随收口删除 ⇒ 这一档是它收口后唯一的常驻覆盖点。

**顺序约束**：⑥ 的实施**排在 bench 改名批之后**（前置 = `bench/check/probe.check.mjs` 在盘，AC-14 ①）——改名前落笔 = 与改名批争同一文件。

### 2.4 对位表（EN ↔ CN 逐点 · ① ② ⑤）

| EN 句（改后） | CN 源 | 对位点 |
|---|---|---|
| `**a mechanical change** ⇒ direct edit (no spawn/designToken) …` | `discipline-engineering.md:35`「**机械改**可直改（不 spawn、不需 designToken）…」 | 机械改 + 直改许可 |
| `**a non-mechanical change ⇒ still goes through design**` | 同处「**非机械改 ⇒ 仍走设计**」 | carve-out |
| `gate prevails` ∥ `explicit commit` | 同处「门禁为准」∥「显式路径提交」 | 既有句未改 |
| `(**mechanical change** = one that does not alter judgment semantics` | `:39`「（**机械改** = 不改判据语义的改动」 | 定义 |
| `one that alters judgment semantics — extracting a predicate / a threshold / what counts as a violation —` | `:39`「改判据语义的——抽取谓词 / 阈值 / 什么算违规——」 | 举例枚举 |
| `⇒ still goes through design, not on the direct-edit face` | `:39`「⇒ 仍走设计，不属直改面」 | 归属 |
| `① mechanical change ⇒ direct edit + actually run it and report the reading` | `:39` ① | 既有句未改 |
| `② any direct edit ⇒ report it as "parent direct execution" + single-commit revertable` | `:39` ② | 既有句未改 |
| `; **a non-mechanical change (one that alters judgment semantics) ⇒ still goes through design**.` | `:41`「非机械改（改判据语义的）⇒ 仍走设计」 | 判定句 |
| `**Reviewing whether a design doc exists requires `type:"design"` with `documents` carrying the design doc itself**` | `discipline-normal.md:172`「**评审「设计档在不在」时必须用 `type:"design"` 且 `documents` 带设计档本体**」 | 参数 + 对象 |
| `(otherwise that criterion never enters the review and the check does not fire)` | 同处「（否则该判据不进场、核不触发）」 | 后果 |
| `**Design points & forbidden scope**` | ⑥ 后存活面：`ENG_TASK_BOOK_MIN` 条目（终态 `spawn-gates.mjs:23`）英文半 ∥ `tool-docs/subagent.md:23` ∥ CN 两档「**设计要点与禁止范围**」（`discipline-normal.md:207` / `persona-engineering.md:167`） | 一词一物 |

### 2.5 受影响文件与测试覆盖（分面 · 实施分组）

计数口径：行数 = `\n` 计数（`wc -l` 口径）；`##` = 行首 `## `；字符 = UTF-16 code unit；读数 = 2026-10-18 本席在盘实读 / 内存模拟（标注「预测」者由实施轮实测复核）。

| 文件 | 面 | 改前（行/`##`/字符） | 改后（预测） | Δ |
|---|---|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | EN 运行面 | 197 / 10 / 32485 | 198 / 10 / 33112 | +1 行 · +627（① 三处 +402 ∥ ② 一条 +225） |
| `thincoder-core/prompts/discipline-normal.md` | EN 运行面 | 262 / 8 / 36155 | 262 / 8 / 36350 | 行 0 · +195 |
| `thincoder-core/prompts/common.md` | EN 运行面 | 269 / 19 / 41479 | 269 / 19 / 41479 | 全 0（纯重排；行多重集恒等已模拟） |
| `thincoder-core/prompts/persona-eng-designer.md` | EN 运行面 | 84 / 9 / 16092 | 84 / 9 / 16027 | 行 0 · −65 |
| `thincoder-core/prompts/persona-engineering.md` | EN 运行面 | 226 / 17 / 53198 | 226 / 17 / 53205 | 行 0 · +7 |
| `docs/core/design/prompts/discipline-normal.md` | CN 设计档 | 256 / 8 / 12752 | 256 / 8 / 12754 | 行 0 · +2（**已落**） |
| `docs/core/design/prompts/persona-engineering.md` | CN 设计档 | 232 / 17 / 18416 | 232 / 17 / 18418 | 行 0 · +2（**已落**） |
| `docs/core/design/prompts/discipline-engineering.md` | CN 设计档 | 206 / 10 / 14590 | 207 / 10 / 14673 | +1 行 · +83（② CN 工程面，**待落**） |
| `thincoder-core/agent-tools/spawn-gates.mjs` | 产品码 | 111 / — / 5414 | 91 / — / 4259 | −20 行 · −1155 |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品码 | 412 / — / 23223 | 412 / — / 23239 | 行 0 · +16 |
| `bench/probe/data.mjs` | 产品码（`bench/**` 未列工程工具面 ⇒ fail-closed） | 221 / — / 13188 | 217 / — / ≈13128 | −4 行 · −160 |
| `bench/check/probe.check.mjs` | 产品码（bench 自检 · 常驻；改名批已落，现盘 265 行 / 18,159 B） | 265 / — / 18159 | 267 / — / ≈18219 | +2 行（⑥ 收正断言：改前 `:103-104` 2 行 → 3 行 + 1 行 import） |
| `thincoder-core/tool-docs/subagent.md` | 产品码（工具描述） | 42 / — / 9761 | 42 / — / 9785 | 行 0 · +24 |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档 | 673 / 12 / — | 673 / 12 / — | 行 0（十处改） |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 设计档 | 524 / 3 / — | 524 / 3 / — | 行 0（一处改） |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | 需求档（父侧笔 · 舱 D） | 760 / 13 / 33456 | 760 / 13 / — | 行 0 · 三行改写（预测） |
| `docs/core/design/API-CONTRACT.md` | 生成面 | — | 重生成 | 只改生成区 |

**实施分组（分面 · 一舱一单面）**

| 舱 | 面 | 文件 | 排期 |
|---|---|---|---|
| A | 提示词文本面 | EN 五档（① 三处 · ② 两处（normal `:175` + engineering `:42`）· ③ · ④ · ⑤-3） | 与 B 无共享文件 ⇒ **可并行** |
| B | 产品码面 | `spawn-gates.mjs` ∥ `subagent-spawn.mjs` ∥ `bench/probe/data.mjs` ∥ `bench/check/probe.check.mjs`（6.6 收正断言） ∥ `tool-docs/subagent.md` → 再 `api-contract --write` | 与 A 并行；API-CONTRACT 重生成在码改之后、同舱内；**B 舱实施排在 bench 改名批之后**（6.6 · AC-14 ①） |
| C | 设计档面（本席） | ⑤ CN 两档 + ② CN 工程面一档 + ⑥ 两设计档 | ⑤/⑥ 已落；② CN 随本链落 |
| D | 需求档面（父侧） | `docs/core/requirements/ENGINEERING-MODE-V2.md` 3 行 | 父侧随正（2.10 ①；AC-15） |

必须分开的依据：A 与 B 跨变更面（提示词文本 ∥ 产品码），提示词改动与码改动各有独立验收面；两舱文件零重叠，可并行。C 的 ⑤/⑥ 已落，② CN 一句随本链落（不占实施舱的排期）。

**测试覆盖**

- 门字面扫面（本席 2026-10-18 实测 · 改前盘）：`thincoder-core/test/` 仅 `run.mjs` / `slow.mjs`；全仓 `.mjs` 扫面（除 `.thincoder/tmp`）命中门字面（`validateTaskBookFields` / `TASK_BOOK_FIELDS` / `missing mandatory field`）的文件 = **4**：`spawn-gates.mjs`（`:18/:49/:58/:63`，删除面）∥ `subagent-spawn.mjs`（`:31/:230`，改名面）∥ `bench/probe/data.mjs`（`:11/:151`，改数据校验；改名批已落，原 `fixtures.mjs`）∥ `bench/check/probe.check.mjs`（`:104` = 原断言 `/missing mandatory field/`，⑥ 收正面；改名批已落 ⇒ 现盘名 `bench/check/probe.check.mjs`，行号不变（`:104` 仍为原断言））。
- 常驻自检连带：`bench/check/probe.check.mjs:104`（改名后位置）⑥ 删门后必红 ⇒ **⑥ 同轮收正**（改成 `validateRoundParam` 的 round 断言；6.6）；前置 = 该档在盘（改名批已落，AC-14 ①）；⑥ 后 `node bench/check/run.mjs` exit 0（AC-14 ④）。
- 本批定向单测（eng-coder 写、跑、收口随批删）：`docs/batches/2026-10-18-prompt-residual-fixes.test.mjs` —— 逐条断言 AC-1..AC-15（文本扫描 + `common.md` 行多重集比较 + `validateRoundParam` 行为 + `validateFixtures()` 冒烟）。
- 装载面冒烟（A 舱）：`assemblePrompt` 五场景（engineering / normal / eng-coder / eng-designer / explore）warnings 为空，且新句进入 prompt 串（`prompt-overlays.mjs:68-79` ∥ `prompt-files.mjs:38-40`）。
- 集成测试：不新增（本仓核心无集成套件；父侧收口按项目验证链实跑，读数落 §6）。

### 2.6 验收对照（逐条回指 2.1）

| AC | 判据（可机判） | 回指 |
|---|---|---|
| AC-1 | `discipline-engineering.md:19` 含 `**a mechanical change**` ∧ `**a non-mechanical change ⇒ still goes through design**`，且 `|` 计数 = 4（3 列不破） | ① |
| AC-2 | `:23` 含 `**mechanical change** = one that does not alter judgment semantics` ∧ `what counts as a violation` ∧ `not on the direct-edit face` | ① |
| AC-3 | `:25` 含 `**a non-mechanical change (one that alters judgment semantics) ⇒ still goes through design**` | ① |
| AC-4 | `discipline-normal.md:175` 含 `type:"design"` ∧ `carrying the design doc itself` ∧ `the check does not fire`；`discipline-engineering.md:42` 含 `Design-review parameter` ∧ 同句三片段；CN `docs/core/design/prompts/discipline-engineering.md:58` 含 `设计评审参数` ∧ `type:"design"` | ② |
| AC-5 | `common.md` 从 `| Tool | Use it for` 行到 `| \`question\` |` 行连续 24 行无空行；两段 git why 在新 169/170 行；表格行多重集与改前全等（排序比较） | ③ |
| AC-6 | `persona-eng-designer.md` 全文 `12.2%` / `8645` / `71117` / `51%` / `of all doc lines` 零命中；`:76` 含 `largest single injection-pollution source we have measured`；规矩三句在 | ④ |
| AC-7 | `设计要点与边界` 在 CN 两档零命中、`设计要点与禁止范围` 各 1 命中（`:207` / `:167`）；EN `persona-engineering.md` 全文 `Design points & boundary` 零命中、`:163` = `  **Design points & forbidden scope**`；**存活锚三处同形**：`spawn-gates.mjs:23`（`ENG_TASK_BOOK_MIN` 设计要点条目）∧ `tool-docs/subagent.md:23`（含 `设计要点与禁止范围 (design points & forbidden scope)`）∧ `:29`（`**设计要点与禁止范围**`） | ⑤（**⑥ 后核**：`spawn-gates.mjs:23` 属 ⑥ 终态——现盘同一字面在 `TASK_BOOK_FIELDS:21` / `ENG_TASK_BOOK_MIN:38`） |
| AC-8 | `spawn-gates.mjs`：`TASK_BOOK_FIELDS` / `validateTaskBookFields` 零命中；`validateRoundParam` 1 命中；`ENG_TASK_BOOK_MIN` 1 命中；行数 = 91 | ⑥ |
| AC-9 | 行为：`validateRoundParam({round:"initial"})` ∥ `({round:"fix"})` 放行；`({})` ∥ `({round:"v2"})` 抛；抛错文案含 `round`、五段字段名零命中 | ⑥ |
| AC-10 | `subagent-spawn.mjs` 旧名 `validateTaskBookFields` / `TASK_BOOK_FIELDS` 零命中；`validateRoundParam` import + 调用各 1；`:29` 注释含 `round 结构化参数校验本体落` ∧ 该档 `六强制字段` 零命中；`spawn-gates.mjs` 内 `六强制字段` / `六字段` 零命中；空 task + `round:"initial"` 放行（旧门会拒） | ⑥ |
| AC-11 | `tool-docs/subagent.md:23` **全行**与 `docs/core/design/AGENT-LOOP-SUBAGENT.md:662-665` 代码块四行按单空格拼接**逐字全等**（整句断言，非碎片包含）；`six mandatory fields` / `the gate matches these markers` 零命中；`:29` = `**设计要点与禁止范围**：…` 仍在 | ⑥ |
| AC-12 | `node --check` 三档通过（`spawn-gates.mjs` / `subagent-spawn.mjs` / `bench/probe/data.mjs`）；`validateFixtures()` 返回 `{families:3}`；`API-CONTRACT.md` 重生成后旧名 0 命中、新名 1 行 | ⑥ |
| AC-13 | 档级读数 = 2.5 表（EN 五档 198/262/269/84/226；CN 三档 256/232/207；`##` 全同改前）；本批只触 2.5 表列档。**⑥ 触档的绝对值按落笔时现盘重测**（`probe.check.mjs` 现盘 265 → 改后 267；其余见 2.5） | 全部 |
| AC-14 | 四条全绿：① `bench/check/probe.check.mjs` 在盘（改名批已落）；② 该档全文 `missing mandatory field` 零命中；③ round 行为断言在盘 = `validateRoundParam` import ≥1 ∧ `assert.throws(() => validateRoundParam({}), /round/)` 形 ≥1 ∧ `assert.doesNotThrow(() => validateRoundParam({ round: "initial" }))` ≥1；④ `node bench/check/run.mjs` exit 0（引擎已换自写 harness——单档 `node --test` 会绕开 run.mjs 的登记反查） | ⑥（同轮收正该断言） |
| AC-15 | 舱 D：`docs/core/requirements/ENGINEERING-MODE-V2.md` 全文 `六字段` / `六个字段` / `缺字段即拒` / `门禁自己不动` 零命中；`:12` / `:430` / `:433` 三行**各含 `round`**（订正形 = 2.10 ①，行内改写、行数不变） | ⑥（舱 D） |

### 2.7 用例表（正常 / 边界 / 错误）

| 类 | 输入 / 动作 | 期望 | 验的是 |
|---|---|---|---|
| 正常 | 按 2.3 改后原文逐字落笔 | AC-1..AC-4 / AC-7 / AC-11 绿 | 文本面 |
| 正常 | `common.md` 重排 | AC-5 绿 | 结构 |
| 正常 | `validateRoundParam` 两合法值 | 放行 | round 保留 |
| 边界 | `:19` 行内追加 | `|` 计数仍 4 | 不破表 |
| 边界 | `:23` 括号含 `⇒` / `—` / `/` | 无 `|`、无换行 | 不破枚举 |
| 边界 | 夹具任务书为空串 | `validateFixtures()` 抛「任务书缺失或为空」 | 数据形态判据 |
| 边界 | 只有 round、五段文本全缺的任务书 | 放行（旧门会拒） | 删门生效 |
| 错误 | 只改 `:23`、不改 `:19`/`:25` | AC-1 / AC-3 红 | 三处必须齐 |
| 错误 | 重排后表内留空行 | AC-5 红 | 又断一次表 |
| 错误 | ④ 保留任一读数 | AC-6 红 | 快照未清 |
| 错误 | 只删 `TASK_BOOK_FIELDS`、不删 `:57-60` 循环 | 运行期 ReferenceError / AC-8 红 | 半删必崩 |
| 边界 | 改名前启动 ⑥（`bench/check/` 不在盘） | AC-14 ① 红（前置未满足） | 顺序约束 |
| 错误 | ⑥ 落门但未改 `bench/check/probe.check.mjs:104` | AC-14 ② 红（`missing mandatory field` 仍命中）且该档跑红 | 断言必须随门同轮改 |

### 2.8 关键决策（含被否方案）

1. **① 三处齐改**，不做「一处定义 + 引用」——CN 三处各自成句；只改一处 ⇒ 另两处仍读成无 carve-out 的规矩（写门可被绕过）。
2. **① 用 CN 现形**（两条硬约束 + 定义括号），不回退旧三约束形（`.thincoder/tmp/lc818-baseline/en-discipline-engineering.md:23` 是已被 CN 取代的旧形；回退 = 造第三种说法）。
3. **② 追加原 bullet 内**，不另起 bullet——CN `:172` 是同一条；另起会被读成可选项。
4. **③ 正文移到表后**而非表前——两段 why 解释的是表里的 `git` 行；放表前 = 解释先于被解释者，且与 `wait_for` 段隔开。
5. **④ 删读数、留定性**；被否：换一个新读数——数字随文档变动而漂，盘上三值互斥本身就是证据（#1640），补新数下月又错。
6. **⑤ 统一到 `设计要点与禁止范围 (design points & forbidden scope)` 形**；裁定时的权威依据 = 用户可见的报错文案（门 label，2026-10-18 06:57 裁决时在盘）；⑥ 删该门后权威锚改指**存活面**——`tool-docs/subagent.md:23`（模型可见描述面）∥ `ENG_TASK_BOOK_MIN`（终态 `spawn-gates.mjs:23`）∥ CN 两档——**字面一字不变，只换锚**。⑤-2 为同判据实扫所得（不改则 CN 面仍有两个名）。
7. **⑥ 函数改名 `validateRoundParam`**——名字必须说真话；被否：留旧名（零改调用，但旧名承诺的字段校验已不存在，后来者会以为文本门还在）。
8. **⑥ `ENG_TASK_BOOK_MIN` 留作模板**（父侧裁：人写任务书时照抄），删门不删模板。**权威形 = 提示词模板**（六段名以 CN `discipline-engineering.md` / `persona-engineering.md` 为准）；该常量与 `tool-docs/subagent.md:25`–`:31` 骨架均为**样例副本**，门删后无机制维持三者同步——不一致时以提示词为准。
9. **⑥ 设计档随正在本席落笔**（机制所有者档与代码同拍）；`PROMPT-SYSTEM.md` 决策记录面不随改（2.10 ②）。
10. **⑥ 的常驻自检连带 = ⑥ 实施轮同轮收正一处断言**（用户 2026-10-18 07:24 / 07:26 裁定：`bench/test/` 不删、改名 `bench/check/`、内容零改）：`bench/check/probe.check.mjs:104` 的 `/missing mandatory field/` 反例随文字门一起失效 ⇒ 同轮改写成 `validateRoundParam` 的 round 行为断言（6.6）。理由：bench 是产品、其自检是产品代码（不是单元测试）⇒ 零留存纪律不适用于它，它必须保持绿；且批次定向单测随收口删除，round 行为面的常驻覆盖只能落在这一档。被否：① 不修、指望它随文件消失——文件不删、内容零改（`git mv`），断言照样存活；② 给 `bench/probe/driver.mjs` 加 round 入参——为自检改产品接口面。
11. **② 选 (a)——补工程模式面**：`prompt-overlays.mjs:42` 证实 engineering 槽不含 `discipline-normal.md` ⇒ 只补 normal 面 = ② 只对一半会话闭合，而本批判据是「模型读不到 = 不会执行」。落纪律层不落人格层（规则是「工具怎么用」，人格层答「你是谁 / 交付什么 / 边界在哪」）。被否 (b)「明写只覆盖 normal 面」——等于承认工程模式调用方继续缺参数，AC-4 绿而缺口在。

### 2.9 边界（不做）

- 不改任何表格行文字（③）；不改 ④ 规矩句；不改任何 prompt 的五段任务书模板（⑥ 明确不碰提示词）。
- 不碰 CN 设计档其它处、其它 prompt 档；需求档 = 父侧笔（舱 D，2.10 ①；AC-15）。
- **不碰 `bench/check/**` 的其它档**（他批改名面）：本批只改 `bench/check/probe.check.mjs` 的 `:103-104` 一处断言 + 1 行 import（6.6 / AC-14），不改其它 check 档、不改改名批的 import / 头注字面；不新增常驻自检；不动任何机器门的其它判据（只删文本字段门，`round` 校验与 F6 谓词零改）。
- 不做 `PROMPT-SYSTEM.md` / `DOC-DISCIPLINE.md` / `TOOLS.md` 的记录面随改——收口条件见 2.10 ②。

### 2.10 范围外注记 / 随正项（上抛）

① **需求档随正（父侧笔 · 舱 D · 验收 AC-15）**：`docs/core/requirements/ENGINEERING-MODE-V2.md` 三处行内改写（行数不变）——`:12`「spawn 六字段 + `batchDoc` 体检」→「五段模板 + `round` 结构化必带 + `batchDoc` 体检」；`:430`「派单模板强制字段（…——缺字段即拒）」→「派单模板五段 = 人写模板、不做机械校验；唯一机械必带 = `round`」；`:433`「六字段要可见…门禁自己不动」→「五段 + `round` 要可见…门禁只校 `round`（文字门已撤）」。三行不订正则 AC-15 红、§6 不得收口。
② **决策记录面旧引用**（设计档，本批不改）：`docs/core/design/PROMPT-SYSTEM.md:281/:647/:854` 仍以 `validateTaskBookFields` 六字段判据集作边界 / 避让依据；`docs/core/design/TOOLS.md:917` 节名「spawn 六字段入描述面」· `:950` 边界句「门禁判据集零改（六字段标记…）」；`docs/core/design/DOC-DISCIPLINE.md:1400` 引旧 §6.30 标题。**收口条件**：三档行已订正 ∥ 父侧明写「记录面，留作历史」裁定——二者未具其一，§6 不得收口（否则三份设计档把已删的门当活机制 / 活边界读）。
③ **过程面读数不属本批**：`9001/73576` 在 `docs/batches/2026-10-15-doc-ref-direction-cleanup.md:356`；`8672` 在同档（例 `:605` / `:647`）——批档为过程档，历史读数合法，不改。
④ **CN∥EN changelog 语义差**（本批发现，不属本批射程）：EN `persona-eng-designer.md:76`「doc carries the current state only」vs CN `docs/core/design/prompts/persona-eng-designer.md:55`「设计档 8 项 + 变更记录」+ `:76`「变更记录：一行注记」+ CN `discipline-engineering.md:200`「变更记录落一行注记」⇒ 同一机制两面说法不一（EN 禁、CN 允一行）。按多实现面纪律机制面差异默认应消；改 CN 面不在本批，请父侧裁。
⑤ **工作树携前批大量未提交改动**（本席开工时 `git status` = 145 修改 + 22 未跟踪）⇒ 本批验证用工作树内容扫描，不用 `git diff` 归因。

### 2.11 先例勘察与公共源勘察（设计前置）

**同类先例（逐项）**：

| 项 | 先例坐标 | 对齐 ∥ 偏离 |
|---|---|---|
| ① | `docs/core/design/prompts/discipline-engineering.md:35`（机械改可直改 + 非机械改仍走设计）· `:39`（定义括号：抽取谓词 / 阈值 / 什么算违规）· `:41`（判定句） | **对齐**：CN 三句逐点对位成 EN（对位表 = 2.4），不另造说法 |
| ② | `docs/core/design/prompts/discipline-normal.md:172`（评审「设计档在不在」必须 `type:"design"` + `documents` 带本体） | **对齐**：同句译入 EN normal 面；**补面**：工程模式面（`prompt-overlays.mjs:42` 不含 normal 档）——同句再载一份，语义单源 = 本条 |
| ③ | **无先例**（仓内无同形「表被正文切断」的修复处置；`docs/core/design/prompts/common.md:112-117` 对应节是散文段、无表格） | **偏离**：两段 why 正文移到表后——CN 无对应项可依；依据 = 解释句跟在其所解释的 `git` 行之后（2.8 #4）；表行一字不动 |
| ④ | **无先例**（本仓首次处置「同指标读数三值互斥」；内规 D8 只说「状态档无历史」，未言读数） | 依据 = 父侧裁「删数字、改定性」：数字随文档漂、三值互斥自证，规矩不依赖数字 |
| ⑤ | `docs/core/design/prompts/discipline-normal.md:207` ∥ `docs/core/design/prompts/persona-engineering.md:167`（CN 字段名） | **对齐**：EN / CN 统一到同一字面；⑥ 后权威锚 = 存活面（2.3.5 ⑤-4） |
| ⑥ | `thincoder-core/agent-tools/spawn-gates.mjs:5-8`（F4 / F5 裁撤先例：裁撤写进头注、理由写清、不落代码） | **对齐**：删门同形——头注记裁撤 · 理由在场 · 新增零依赖；`ENG_TASK_BOOK_MIN` 留作模板（2.8 #8） |

**公共源勘察（证据行）**：

- 已查（仓内）：`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.30（工具面描述正本）· `docs/core/design/TOOLS.md` §6.20 / §6.30（边界口径）· `docs/core/design/DOC-DISCIPLINE.md`（D1–D9）· `docs/core/design/PROMPT-SYSTEM.md`（落点 / 避让口径）· `docs/core/requirements/ENGINEERING-MODE-V2.md` §8.2 · `thincoder-core/prompt-overlays.mjs`（模式→槽位表）· `bench/probe/*`（探针腿）· `bench/README.md:229`（跑法）。
- 相关结论：本批全部判据来自仓内需求档 / 设计档 / 实读代码；**无外部源相关**。
- 工作树内独立公共源文档仓：**无**（`thincoder.com/` / `thinworker.com/` = 站点静态资源，非技术源文档）。
- `D:\ref\` 参考系（`kimi-code` / `MiMo-Code` / `opencode` / `oh-my-pi` / `openclaw`）：`PROJECT-MANIFEST.json:56` 的 `index.publicRepos` = `[]`（未声明）⇒ **本批未查**；本批为提示词措辞与门裁撤，无外部 API / 协议面。

**修复轮落点索引（§3 十号 → 改后位置）**：1 → 2.3.5 ⑤-4 / 2.4 末行 / AC-7；2 → 2.3.6 6.6 / 2.5 测试覆盖 / AC-14；3 → 2.11；4 → 2.11；5 → 2.3.6 6.4 / AC-11；6 → 2.3.6 6.2 / AC-10；7 → 2.1 / 2.10 ① / AC-15；8 → 2.10 ②；9 → 2.3.2 ②-2 / 2.8 #11 / AC-4；10 → 2.3.6 6.3 / 2.8 #10。

**上抛项**：无批准阻塞项；①④ 为父侧裁 / 随正项（① = AC-15，② 的收口条件已内联）；⑥ 的实施顺序受 AC-14 前置约束（**改名批已落 ⇒ AC-14 ① 现绿，可开工**）；其余按本设计执行。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance criteria | 🔴 | AC-7 pins the gate-label line as untouched — "`spawn-gates.mjs:21` 零改" (docs/batches/2026-10-18-prompt-residual-fixes.md:389) — and ⑤-4 declares "门 label `spawn-gates.mjs:21` 与 `spawn-gates.mjs:38` 夹具同形" (:213), while ⑥ deletes `:12-25` ("`TASK_BOOK_FIELDS` 注释块", :225), the array containing :21. Both ACs cannot hold in the final state, and ⑤'s stated authority form ("门 label 形") ceases to exist once ⑥ lands. | Re-anchor ⑤ / AC-7 on the literals that survive ⑥ — `ENG_TASK_BOOK_MIN`'s 设计要点与禁止范围 entry (= new :23, the terminal-state listing at :258) and `thincoder-core/tool-docs/subagent.md:23/:29` — and drop or restate the ":21 零改" clause in both AC-7 and ⑤-4. |
| 2 | Feasibility / affected files | 🔴 | ⑥ removes the six-field throw, but a standing self-check depends on it: `thincoder/bench/test/probe.test.mjs:104` asserts "/missing mandatory field/" for `taskBook: "目标与理由：只给一段。"` on a spawn whose round is fixed to "initial" (`round: "initial"`, thincoder/bench/probe/driver.mjs:98) ⇒ the test goes red (suite is run via "`bench/test/*.test.mjs` 手动跑（`node --test bench/test/*.test.mjs`）", thincoder/bench/README.md:229). §2 asserts the opposite — "全仓 `.mjs` 扫面（除 `.thincoder/tmp`）无活用例引用该门 ⇒ 删门无既有用例连带" (:374) — and 2.5's affected-file table omits the file, so AC-13 ("本批只触 2.5 表列档") would verify over a broken test. | Add `thincoder/bench/test/probe.test.mjs` (263 lines) to the 2.5 table with its delta and to ⑥'s edit list in 2.3.6; dispose of the assertion (delete it, or re-anchor the negative case on a direct `validateRoundParam` call, since the probe path always passes round:"initial"); restate the sweep sentence in 2.5 to name the surfaces actually scanned. |
| 3 | Methodology | 🟡 | No closest-precedent line. `discipline-engineering.md:37` makes it a design precondition ("Closest-precedent survey (design precondition)"), and §2 carries no coordinates (implementation ∥ design-doc section ∥ precedent batches) and no alignment ∥ deviation rationale. The nearest material is scattered: an in-file 裁撤 precedent (spawn-gates.mjs:5-8, F4/F5), the CN-form precedent invoked only inside 2.8 #2, and no explicit "no precedent" declaration anywhere. | Add one closest-precedent line covering each item — ③/④ have no precedent ⇒ declare it; ⑥ aligns with the F4/F5 裁撤 precedent in spawn-gates.mjs:5-8; ①/⑤ align with the CN design-doc form (discipline-engineering.md:35/:39/:41, discipline-normal.md:207) — with the deviation stated where the form differs (e.g. ③ moves prose after the table, which has no CN counterpart: the CN common.md:112-117 section is prose, not a table). |
| 4 | Methodology | 🟡 | No survey-evidence line. `discipline-engineering.md:38` requires recording which public source docs were checked ∥ whether anything was relevant ("Public-source survey (design precondition)"), including a "none relevant" outcome. The only outside reference in §2 is `.thincoder/tmp/lc818-baseline/en-discipline-engineering.md:23` (2.8 #2), which is an internal baseline copy, not a public-source survey. | Add a survey-evidence line naming the docs checked (including the `D:\ref\` reference-frame repos or an explicit "none relevant / not surveyed" statement). |
| 5 | Document ownership | 🟡 | The tool-doc literal is stated two ways. 6.4's landing text says "round (initial|fix — the structured parameter, mechanically required)" (:313), while the design-doc section that owns this literal verbatim renders it "round (initial|fix — the structured parameter)" (docs/core/design/AGENT-LOOP-SUBAGENT.md:662) and ends "(a missing or invalid round is refused)" (:665) vs "…(missing or invalid = refused)" (:313). AC-11 matches fragments only, so either wording passes ⇒ the drift is undetectable at verification. | Converge on one literal: adopt the §6.30 rendering verbatim in 6.4 (or amend §6.30 in the same chain), and make AC-11 assert the full sentence rather than fragments. |
| 6 | Clarity / completeness | 🟡 | 6.2 lists :31/:225-228/:230 for `subagent-spawn.mjs`, but the import's own comment at :29-30 still reads "任务书六强制字段校验本体落" spawn-gates.mjs — a stale mechanism statement that survives the rename. AC-10 checks the old identifier only ("旧名零命中"), so it will not catch the phrase. | Add `subagent-spawn.mjs:29-30` to 6.2's rewrite list, and extend AC-10 to the phrase (e.g. 六强制字段 zero hits in that file). |
| 7 | Requirements coverage | 🟡 | 2.1 states "需求档零改" (:54) while 2.2/2.10① record that ⑥ falsifies three requirement-doc lines — "⑥ 后三句失真" (:433) — and the requirement doc still reads "spawn 六字段 + `batchDoc` 体检" (docs/core/requirements/ENGINEERING-MODE-V2.md:12), "派单模板强制字段（目标/已知事实/禁止范围/验收/报告格式——缺字段即拒）" (:430), "门禁自己不动" (:433). Until舱 D lands, the three-chain equality (batch §2 entries = design AC ↔ requirement entries, persona-eng-designer.md:79) is broken, and no AC covers舱 D. | Reword 2.1 to "no new requirement entries; three requirement-doc lines go stale and are corrected in this chain", and bind舱 D to an acceptance item so §6 cannot close with the requirement doc still asserting the six-field gate. |
| 8 | Scope coordination | 🟡 | 2.10② lists PROMPT-SYSTEM.md:281/:647/:854, TOOLS.md:917 and DOC-DISCIPLINE.md:1400, but TOOLS.md:950 is also falsified and unlisted ("门禁判据集零改（六字段标记"); after ⑥ three design docs still assert the deleted gate as live mechanism/boundary. | Extend the 2.10② list with TOOLS.md:950, and give the item a closeout condition (lines corrected, or an explicit "record face, kept as history" ruling written down) so the gate is not left described as live in three design docs. |
| 9 | Requirements coverage | 🟡 | ② lands only in a slot engineering mode never loads. The rule is added to `discipline-normal.md:175` (EN), but the mode→slot map loads that file only for normal/explore/coder/plan — "engineering: [\"persona-engineering.md\", \"common.md\", \"discipline-engineering.md\"]" (prompt-overlays.mjs:42). Engineering-mode sessions therefore still never see "type:\"design\"` with `documents` carrying the design doc itself" when firing a design review — the gap §1:12 describes. The CN spec has the same placement (discipline-normal.md:172 "评审「设计档在不在」时必须用 `type:\"design\"` 且 `documents` 带设计档本体"), so the mirror is faithful; the residual is placement, not translation. | State whether the engineering-mode face needs the same sentence (persona-engineering.md or discipline-engineering.md), or record that ② is closed for normal-mode sessions only — otherwise AC-4 passes while an engineering-mode caller still omits the parameter. |
| 10 | Test coverage | 🔵 | After 6.3 the fixtures leg stops discriminating: `validateFixtures()` would call `validateRoundParam({ round: "initial" })` (planned at :298) with a constant per family, so a malformed fixture `taskBook` (data kept by decision, 2.8 #8) is no longer caught by any assertion. | Either keep a real assertion on the fixture data (e.g. non-empty `taskBook` ∥ template round-trip against `ENG_TASK_BOOK_MIN`) or note in 2.5 that this leg is now a round-constant smoke with no task-book coverage. |

Counts: 🔴 2 · 🟡 7 · 🔵 1 · total 10.

VERDICT: changes-required

### 轮次 2（评审子代理）

### 复审（轮次 2 · 只核轮次 1 的十号 + 新问题）

| # | Orig# | Status | Verification（本轮实读证据） |
|---|-------|--------|------------------------------|
| 1 | 1 | Fixed | ⑤-4 重锚为「三处**活过 ⑥** 的锚同形」（`:234`：`ENG_TASK_BOOK_MIN` 终态 `spawn-gates.mjs:23` ∥ `tool-docs/subagent.md:23` ∥ `:29`），AC-7 同步改写（`:428`）；全文检索 `spawn-gates.mjs:21` 仅剩 §1 证据句（`:24`/`:65`），「零改」子句已消失。终态行号核对：删 `:12-25` 后 old `:38` → new `:23`，与 §2.3.6 终态表 `:279` 一致。 |
| 2 | 2 | Accepted（有理非修） | ① 假话已收正：2.5 扫面句改为「命中门字面的文件 = 4」（`:412`），本轮全仓 grep 复核**恰好 4 个 .mjs**（`spawn-gates.mjs:18/49/58/63` ∥ `subagent-spawn.mjs:31/230` ∥ `bench/probe/fixtures.mjs:11/151` ∥ `bench/test/probe.test.mjs:104`）；文档面命中归 2.10② 与 AC-12（API-CONTRACT `:705`）。② 处置改为前置依赖：6.6 记「不修为待删资产改断言」+ AC-14「`bench/test/` 空或不存在 ⇒ ⑥ 方可实施」（`:435`）+ 2.8 #10 记被否方案；上游批 `docs/batches/2026-10-18-bench-test-cleanup.md` §2 已有设计（18/18 删，`probe.test.mjs` 在列，`:58`/`:114`）。理由成立，本项关闭。 |
| 3 | 3 | Fixed | 新增 2.11 先例表（`:488-495`）：六项逐项给实现坐标 ∥ 设计档节 ∥ 先例（⑥ = `spawn-gates.mjs:5-8` 的 F4/F5 裁撤先例），③④ 明写「无先例」并给依据。 |
| 4 | 4 | Fixed | 2.11 公共源勘察（`:497-502`）：仓内已查清单 + 「无外部源相关」+ `D:\ref\` 未查及理由（`PROJECT-MANIFEST.json:56` `index.publicRepos = []`）——「none relevant / not surveyed」形已具。 |
| 5 | 5 | Fixed | 6.4 改后（`:341`）与 `docs/core/design/AGENT-LOOP-SUBAGENT.md:662-665` 四行按单空格拼接**逐字符比对全等**（含 `round (initial|fix — the structured parameter),` 与 `(a missing or invalid round is refused).`）；AC-11 改为整句全等断言（`:432`）。两版并存已消。 |
| 6 | 6 | Fixed | 6.2 增 `:29` 注释改写（`:311`，`:30` 不动）；AC-10 增「该档 `六强制字段` 零命中」（`:431`）。实读 `subagent-spawn.mjs:29` = `// M5 F2（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.3）：任务书六强制字段校验本体落` ⇒ 修改点定位准确、改后仍与 `:30` 衔接。 |
| 7 | 7 | Fixed | 2.1 改述为「无新增需求条目；三行需求档随 ⑥ 失真，在本链内订正……AC-15——三行不订正，§6 不得收口」（`:54`）；AC-15 在册（`:436`）。可满足性实测：需求档 `六字段\|六个字段\|缺字段即拒\|门禁自己不动` 全文**仅 3 命中** = `:12` / `:430` / `:433`，与「三行改写」一致 ⇒ AC-15「全文零命中」可达成。 |
| 8 | 8 | Fixed | 2.10② 已补 `TOOLS.md:950` 并给收口条件（`:479`）；实读 `TOOLS.md:950` = 「**边界（本节不做）**：门禁判据集零改（六字段标记 ∥ …）」、`:917` 亦在档。 |
| 9 | 9 | Fixed | ② 补工程面：EN `discipline-engineering.md` 新 `:42`（`:144-148`）+ CN 新 `:58`（`:150-154`），AC-4 覆盖三处（`:425`），2.8 #11 记选 (a) / 被否 (b)（`:467`），2.5 增 CN `discipline-engineering.md` 行 206→207。实读 CN 档 = 206 行（`wc -l` 口径）、`:57` = 写权条 ⇒ 定位与 Δ 成立。 |
| 10 | 10 | Fixed | 6.3 改为真断言「任务书在场（非空串）」（`:319-326`）+ 「round 常量冒烟不留」依据（`:328`）+ 2.8 #10 记录；实读 `fixtures.mjs:146` = `if (FIXTURE_IDS.length !== 3) throw …`、`:166` = `return { families: FIXTURE_IDS.length }` ⇒ AC-12 的 `{families:3}` 成立；`:150-154` 5 行 → 3 行、`:11`+`:12` 删除（`:11` = import、`:12` = 空行）⇒ 221→217 行自洽。 |
| 11 | (new) | 🔵 | AC-7 第三锚 `spawn-gates.mjs:23` 只在 ⑥ 落地后存在（终态表 `:279`），而舱 A ∥ B + AC-14 ⇒ 舱 A 自检时 AC-7 必红；另 `:506`「**上抛项**：无阻塞项」与 AC-14（⑥ 受外部批前置约束，该批 §3/§4 尚空）表述相抵。建议：AC-7 标注「⑥ 后核」，并把该句改为「无批准阻塞项；⑥ 实施受 AC-14 门控」。非阻塞。 |

**范围外注记（无严重度）**：`docs/batches/2026-10-18-bench-test-cleanup.md` §2.6（`:115`）/ §2.8（`:138`）/ §2.11（`:173`）/ AC-7（`:153`）仍称本批 §2.5 表列 `bench/test/probe.test.mjs`（263 行 / +47）、AC-12 含 `node --test bench/test/probe.test.mjs` 腿——本批现 §2 两者皆无（2.5 `:380-397` 无该行；AC-12 `:433` = `node --check` 三档 + `validateFixtures()` + API-CONTRACT）。两档各说一套，需在该批一面各改一行对账（不在本评审范围）。

Counts: 旧 10 = Fixed 9 · Accepted 1 · Unfixed 0；新增 🔵 1 · 🔴 0。

### 轮次 3（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Feasibility / Acceptance criteria | 🔴 | 6.3 的编辑目标 `bench/probe/fixtures.mjs`（`thincoder/docs/batches/2026-10-18-prompt-residual-fixes.md:316` / `:318`）盘上不存在：该模块已由前置批改名为 `bench/probe/data.mjs`（`thincoder/bench/probe/data.mjs:2` 自档头注 = `probe/data.mjs`；`:11` = import 行；`:142-143` = 6.3 引的注释；`:150-154` = 6.3 引的 try/catch——行级锚全对，只有文件名错）。⇒ AC-12 的 `node --check` 三档（`:449`）含一条不存在路径，构造上取不到绿；2.5 行（`:407`）与 2.5 扫面句（`:428`）同误。设计的前置约束（6.6 / AC-14 ①，`:372` / `:451`）只覆盖 `bench/test` → `bench/check` 改名，未覆盖同一批的 `probe/fixtures` → `probe/data` 改名。 | 把 6.3 / AC-12 / 2.5 重锚到 `bench/probe/data.mjs`（`:11` / `:142-143` / `:150-154` 与 221 → 217 的算术均不变），并把 AC-14 ① 的前置写成两处改名都在盘（`bench/check/probe.check.mjs` ∧ `bench/probe/data.mjs`）。 |
| 2 | Acceptance criteria | 🟡 | AC-13（`:450`）判「档级读数 = 2.5 表」，但 `bench/check/probe.check.mjs` 行（`:408`）写 263 → 265：该档在前置批里已换引擎（`thincoder/bench/check/probe.check.mjs:13` = `import { after, check, run } from "./harness.mjs"`、`:265` = `await run()`）⇒ 现盘 265 内容行，⑥ 的 +2 落地后 = 267 ⇒ AC-13 必假红。其余抽验行与盘一致（spawn-gates 111 · data.mjs 221 · subagent-spawn 412 · tool-docs 42 · AGENT-LOOP-SUBAGENT 673 · ENGINEERING-MODE-V2 524 · CN discipline-engineering 206）。 | 落笔前按现盘重测该行（pre 265 → post 267）并同步 2.5 与 AC-13 的期望集；或 AC-13 只留 Δ（+2 行）、不留绝对值。 |
| 3 | Clarity | 🔵 | 6.1 尾句写「原 `:70-112`（F6 两谓词）逐字不动」（`:307`），而 `thincoder/thincoder-core/agent-tools/spawn-gates.mjs` 止于 :111（F6 = :70-111，42 行 → 新 :50-91，正是 AC-8 的 91）。 | 重测时把区间改成 :70-111（AC-8 的 91 已自洽，不动）。 |
| 4 | Acceptance criteria | 🔵 | AC-14 ④（`:451`）用 `node --test bench/check/probe.check.mjs` 判绿，但前置批已移除 `node:test`、改 `./harness.mjs`，并声明唯一入口 = `node bench/check/run.mjs`（`thincoder/bench/README.md:229` · `thincoder/bench/check/run.mjs:28-35`）；单档 `node --test` 绕开 run.mjs 的登记反查（未登记档 ⇒ exit 1）。 | 把 AC-14 ④ 的命令换成 `node bench/check/run.mjs`，或写明单档跑是刻意选择。 |
| 5 | Scope / simplify | 🔵 | 终态 `validateRoundParam`（`:290-298`）仍保留 `missing` 数组 + `.join(" · ")` 累加器，而五段文本标签删后至多只 push 一项——是被删门的死泛化。 | 二选一：改成单判据直接抛；或在设计里写明「保留数组形 = 压 diff」。 |
| 6 | Document ownership | 🔵 | ⑥ 后 `ENG_TASK_BOOK_MIN` 零代码消费（全仓仅 `thincoder/thincoder-core/agent-tools/spawn-gates.mjs:35` 自声明命中；`thincoder/bench/probe/data.mjs` 只 import `validateTaskBookFields`），而决策保留它作人写模板（`:481`）⇒ 五段模板此后有三份互不联动的副本（该常量 ∥ `thincoder/thincoder-core/tool-docs/subagent.md:25`–`:31` 骨架 ∥ §2.9 明令不碰的提示词模板），门删后无任何机制维持同步。 | 写明 ⑥ 后哪份是权威形（或该常量只作样例、不承担单源），使「一词一物」在三份副本间可判。 |
| 7 | Methodology（轮次 2 #11 处置） | 🔵 | #11（`:562`）在 §2 仍未处置：AC-7（`:444`）仍把 ⑥ 终态锚 `spawn-gates.mjs:23` 与舱 A 腿混在一条、未加「⑥ 后核」门注；上抛项（`:523`）仍写「无阻塞项」而 AC-14 把 ⑥ 挂在外批前置上。事实面已大半消解（改名批已落 ⇒ AC-14 ① 现绿），故非阻塞。 | 二选一：给 AC-7 加「⑥ 后核」并改述上抛项；或在 §3/§5 记「#11 已被事实面吸收而关闭」。 |

**范围外注记（无严重度）**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md:159` 仍写「非测试资产不动：`bench/probe/fixtures.mjs`…」，而同一档 §2.11 B（`:346`）与 §5（`:1074`）记该档 `→ data.mjs` 且已落盘——该批档自相矛盾；本批 ⑥ 的路径失效即由此而来（不在本评审范围）。

**限制声明**：文档地图与项目标准文档均未随上下文提供（归属按拥档主题判据判断）；本轮只读本批档，为核 §2.3.6 / AC-8..15 的坐标与行数做了定向 spot-check 读（`spawn-gates.mjs` · `subagent-spawn.mjs` · `subagent.mjs:146-160` · `bench/probe/data.mjs` · `bench/check/probe.check.mjs` · `bench/check/run.mjs` · `bench/README.md` · `tool-docs/subagent.md` · `AGENT-LOOP-SUBAGENT.md:650-674` · `ENGINEERING-MODE-V2.md:261-265/519-525` · CN `discipline-engineering.md:52-63` · `requirements/ENGINEERING-MODE-V2.md`）；无 shell ⇒ 未跑 `node --check` / `node --test` / `wc -l`，行数按文件读取器的内容行口径（已用 spawn-gates 111 与 probe.check 265 双向校准尾行约定）。

Counts: 🔴 1 · 🟡 1 · 🔵 5 · total 7.

VERDICT: changes-required

### 轮次 4（评审子代理）

### 复审（轮次 4 · 只核轮次 3 的七号 + 新问题）

| # | Orig# | Status | Verification（本轮实读证据） |
|---|-------|--------|------------------------------|
| 1 | 1 | Fixed | 6.3 表头已重锚：`**6.3 夹具腿（`bench/probe/data.mjs` 221 → 217 行；改名批已落，原 `fixtures.mjs`）**`（`:318`）；AC-12 三档改 `node --check` 三档通过（`spawn-gates.mjs` / `subagent-spawn.mjs` / `bench/probe/data.mjs`）（`:451`）；2.5 行 = `221 / — / 13188 | 217 / — / ≈13128 | −4 行 · −160`（`:409`）、扫面句同改（`:430`）；`:355` 记入 `该批另把 `bench/probe/fixtures.mjs` → `bench/probe/data.mjs``。盘面复核：`data.mjs:2` = ` * probe/data.mjs — 矛盾上抛探针夹具（设计 §10.4 逐字正本 → 运行面副本；§10.2 三层同源）。`、`:11` = `import { validateTaskBookFields } from "../../thincoder-core/agent-tools/spawn-gates.mjs"`、`:142-143` = 6.3 引的注释、`:150-154` = 5 行 try/catch、221 内容行（读 222 行 = 含尾空）⇒ 221 → 217 自洽，全仓无 `bench/probe/fixtures.mjs` 活引用（余下命中皆为历史注记 `:318`/`:355`/`:430` 与 §3 旧轮记录）。 |
| 2 | 2 | Fixed | 2.5 行（`:410`）= `265 / — / 18159 | 267 / — / ≈18219 | +2 行（⑥ 收正断言：改前 `:103-104` 2 行 → 3 行 + 1 行 import）`；AC-13（`:452`）增 `**⑥ 触档的绝对值按落笔时现盘重测**（`probe.check.mjs` 现盘 265 → 改后 267；其余见 2.5）`。盘面复核：该档 265 内容行（读 266 行 = 含尾空）、`ls` = 18159 B ⇒ 改前读数与字节数逐字对上，⑥ 后的 267 与 +2 自洽。 |
| 3 | 3 | Fixed | `:307` = `原 `:70-111`（F6 两谓词，42 行）逐字不动，整体前移 20 行（旧 `:70` → 新 `:50`）。` —— 区间与 AC-8 的 91 自洽（111 − 20 = 91；实读 `spawn-gates.mjs:111` = `}`，尾空行为格式面）。 |
| 4 | 4 | Fixed | AC-14 ④（`:453`）= `④ `node bench/check/run.mjs` exit 0（引擎已换自写 harness——单档 `node --test` 会绕开 run.mjs 的登记反查）`；2.5 测试覆盖句（`:431`）同步为 `⑥ 后 `node bench/check/run.mjs` exit 0（AC-14 ④）`。 |
| 5 | 5 | Accepted | 新增 `:309` 段明写 `**保留数组形 = 压 diff**（不改控制流、不改错误文案拼接），不视为遗漏`，并裁「若要极简化…二选一须在实施轮一致」——有理非修，本项关闭（不计残留）。 |
| 6 | 6 | Fixed | 2.8 #8（`:483`）改写为 `**权威形 = 提示词模板**（六段名以 CN `discipline-engineering.md` / `persona-engineering.md` 为准）`，并把该常量与 `tool-docs/subagent.md:25`–`:31` 骨架标为「样例副本」、给「不一致时以提示词为准」的裁定规则——三副本的权威形已可判。 |
| 7 | 7 | Fixed | AC-7（`:446`）尾注 = `⑤（**⑥ 后核**：`spawn-gates.mjs:23` 属 ⑥ 终态——现盘同一字面在 `TASK_BOOK_FIELDS:21` / `ENG_TASK_BOOK_MIN:38`）`；上抛项（`:525`）改为 `无批准阻塞项；①④ 为父侧裁 / 随正项` ∧ `**改名批已落 ⇒ AC-14 ① 现绿，可开工**`。盘面复核：`spawn-gates.mjs:21` = `  { label: "设计要点与禁止范围 (design points & forbidden scope)", markers: [/设计要点/, /design\s*points/i] },`、`:38` = `  "设计要点与禁止范围：仅落设计档受影响文件清单；禁夹带新语义。",` ⇒ 括注与门注均准确。 |

**本轮抽验无新增问题**：AC-8（91 行，111 − 20 = 91 自洽）· AC-12（三档皆为现盘真路径，`validateFixtures()` 的 `{families:3}` 判据仍在 `data.mjs:146` / `:166`）· AC-13（2.5 各行读数与盘一致，`probe.check.mjs` 已按现盘重测）· AC-14（① 现绿、② 该档全文 `missing mandatory field` 仅 `:104` 一处、③ 断言形与 6.6 块一致、④ 走 canonical 入口）· AC-15（需求档四禁词仅 `:12`/`:430`/`:433` 三命中，可零化）全绿。

Counts: 旧 7 = Fixed 6 · Accepted 1 · Unfixed 0；新增 🔴 0 · 🟡 0 · 🔵 0。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-10-18 10:28）——舱 B 开工**

- **原话**：「开工」（承接 10:31 对 `validateTaskBookFields` 的追问与 10:34「为什么需要五个字段就给五个参数」——父侧答：五段是自然语言、无值域，拆参只换来「必填」；`round` 是枚举、机器能判，故留）。
- **射程**：舱 B = 第 ⑥ 项（拆任务书五段文本字段门）——`spawn-gates.mjs` + `subagent-spawn.mjs` + `bench/probe/data.mjs` + `bench/check/probe.check.mjs` + `tool-docs/subagent.md` + `API-CONTRACT.md` 重生成。
- **评审状态**：`§3` 轮次 1 changes-required（10 条）→ 轮次 2 处置（Fixed 9 · Accepted 1）→ 轮次 3 changes-required（7 条，🔴 1 = `fixtures.mjs` 已改名 `data.mjs`）→ 父侧直改 18 处 → **轮次 4 pass**（旧 7 = Fixed 6 · Accepted 1 · Unfixed 0 · 新增 0）。
- **前置已满足**：改名批已落（`bench/check/**` 在盘 ∧ `bench/probe/data.mjs` 在盘），AC-14 ① 现绿。
- **舱 A 已在册**：§5.1–5.3 五档已落并验收；舱 B 为本轮剩余面。
- **作者归属**：设计档随正（`AGENT-LOOP-SUBAGENT.md` 十处 / `ENGINEERING-MODE-V2.md:265`）已由设计席落笔；需求档三行（AC-15 · 舱 D）为父侧笔，随本轮收口落。

## §5 实施记录（eng-coder）
**状态行**：实施完成（舱 A 五档 + 舱 B ⑥ · 审计 clean · 评审 pass · fix round 0）



### 5.1 实施摘要（舱 A · EN 提示词文本面）

按 §2.3.1–2.3.5 逐字落笔，只触五档：`discipline-engineering.md`（① 三处 + ② 新条）· `discipline-normal.md`（② 追加）· `common.md`（③ 纯重排）· `persona-eng-designer.md`（④ 删读数）· `persona-engineering.md`（⑤-3 字段名）。未碰 `agent-tools/**`（⑥ 面）、CN 设计档、需求档、`tool-docs/**`、`bench/**`。

### 5.2 逐处处置表（file:line + 改后整行）

| # | file:line | 改后整行 |
|---|---|---|
| ①-1 | `thincoder-core/prompts/discipline-engineering.md:19` | `\| **Engineering-tools face** \| \`scripts/**\` · \`test/**\`/\`tests/**\` · \`.thincoder/tmp/**\` · tool-config · CI · lockfiles \| **a mechanical change** ⇒ direct edit (no spawn/designToken) + gate prevails + explicit commit; **a non-mechanical change ⇒ still goes through design** \|` |
| ①-2 | `:23` | `- **Two hard constraints on direct engineering-tools edits** (**mechanical change** = one that does not alter judgment semantics; one that alters judgment semantics — extracting a predicate / a threshold / what counts as a violation — ⇒ still goes through design, not on the direct-edit face): ① mechanical change ⇒ direct edit + **actually run it and report the reading**; ② any direct edit ⇒ report it as "parent direct execution" + single-commit revertable.` |
| ①-3 | `:25` | `- **Judgment line**: paths not in the enumeration ⇒ full flow as product-code face (fail-closed); mechanical engineering-tools edits ⇒ direct edit + run + report "parent direct execution"; **a non-mechanical change (one that alters judgment semantics) ⇒ still goes through design**.` |
| ②-2 | `:42`（新增） | `   - **Design-review parameter**: reviewing whether a design doc exists requires \`type:"design"\` with \`documents\` carrying the design doc itself — otherwise that criterion never enters the review and the check does not fire.` |
| ②-1 | `thincoder-core/prompts/discipline-normal.md:175` | `- **Advisor:** call after changing code. Must provide scope: \`paths\` (files/dirs to review) or \`documents\` (context). **Reviewing whether a design doc exists requires \`type:"design"\` with \`documents\` carrying the design doc itself** (otherwise that criterion never enters the review and the check does not fire).` |
| ③ | `thincoder-core/prompts/common.md:144-173` | 表头 `:144` + 分隔 `:145` + 22 行数据行 `:146-167` 连续无空行；`:168` 空行；两段 git why `:169/:170`；`:171` 空行；`wait_for` 两段 `:172/:173`。表行文字零改、两段正文逐字搬移，行数 269 不变。 |
| ④ | `thincoder-core/prompts/persona-eng-designer.md:76` | `**A design/requirement doc carries the current state only** (user ruling 2026-10-15). A changelog is the largest single injection-pollution source we have measured — every reader model burns that share on "what changed in the past" instead of "what should be now". Traceability lives in **git commit messages + the batch record** (§1 process notes, §5 implementation record), not inside the spec doc. A design doc states the current truth; the past is not its business.` |
| ⑤-3 | `thincoder-core/prompts/persona-engineering.md:163` | `  **Design points & forbidden scope**` |

以上八处改后文本与 §2.3 逐字符比对全等（独立审计复核，见 5.6）。

### 5.3 AC 逐条自检读数（AC-1..AC-7 · AC-13）

- **AC-1 ✅**：`:19` 含 `**a mechanical change**` ∧ `**a non-mechanical change ⇒ still goes through design**`；`|` 计数 = 4。
- **AC-2 ✅**：`:23` 含三片段全在（定义 / 举例枚举 / `not on the direct-edit face`）；行内无 `|`、无换行。
- **AC-3 ✅**：`:25` 含判定句全句。
- **AC-4 ✅（EN 两处；CN 腿属舱 C 未落，见 5.7）**：`discipline-normal.md:175` ∧ `discipline-engineering.md:42` 各含 `type:"design"` ∧ `carrying the design doc itself` ∧ `the check does not fire`；`:42` 另含 `Design-review parameter`，全文 1 命中。
- **AC-5 ✅**：`| Tool | Use it for` 行（`:144`）到 `` | `question` `` 行（`:167`）连续 24 行无空行；两段 git why 在 `:169/:170`；与改前副本逐行排序比较**行多重集全等**（字符数前后同为 41479，字节数同为 42560）。
- **AC-6 ✅**：全文 `12.2%` / `8645` / `71117` / `51%` / `of all doc lines` 零命中；`:76` 含 `largest single injection-pollution source we have measured`；规矩三句在。
- **AC-7 ✅（舱 A 腿）**：CN 两档 `设计要点与边界` 零命中、`设计要点与禁止范围` 各 1（`:207` / `:167`，舱 C 已落）；EN `persona-engineering.md` 全文 `Design points & boundary` 零命中、`:163` 精确等于目标串；`tool-docs/subagent.md:23/:29` 同形在盘。**舱 B 锚 `spawn-gates.mjs:23` 属 ⑥ 终态**（现值：同一字面在 `TASK_BOOK_FIELDS:21` 与 `ENG_TASK_BOOK_MIN:38`），⑥ 后核——与 §3 轮次 2 #11 的门控一致。
- **AC-13 ✅**：见 5.4，五档读数与 §2.5 逐档相等。

### 5.4 档级读数（行数 = `\n` 计数 · 字符 = UTF-16 code unit）

| 文件 | 改前（行/`##`/`###`/字符） | 改后 | §2.5 预期 | 判 |
|---|---|---|---|---|
| `discipline-engineering.md` | 197 / 10 / 7 / 32485 | 198 / 10 / 7 / 33112 | 198 / 10 / 33112 | ✅ |
| `discipline-normal.md` | 262 / 8 / 17 / 36155 | 262 / 8 / 17 / 36350 | 262 / 8 / 36350 | ✅ |
| `common.md` | 269 / 19 / 5 / 41479 | 269 / 19 / 5 / 41479 | 269 / 19 / 41479 | ✅ |
| `persona-eng-designer.md` | 84 / 9 / 1 / 16092 | 84 / 9 / 1 / 16027 | 84 / 9 / 16027 | ✅ |
| `persona-engineering.md` | 226 / 17 / 0 / 53198 | 226 / 17 / 0 / 53205 | 226 / 17 / 53205 | ✅ |

增量与 §2.5 Δ 逐档吻合：+627 / +195 / 0 / −65 / +7（③ 字节数前后同为 42560）。

### 5.5 冒烟（`assemblePrompt` 五场景）

| 场景 | warnings | 串长 | 新句进场 |
|---|---|---|---|
| engineering | 0 | 127800 | ①-1 ✓ · ②-2 ✓ · ⑤-3 ✓ |
| normal | 0 | 84216 | ②-1 ✓ |
| eng-coder | 0 | 81109 | ①-1 ✓ · ②-2 ✓ |
| eng-designer | 0 | 92790 | ①-1 ✓ · ②-2 ✓ · ④ ✓ |
| explore | 0 | 80908 | ②-1 ✓ |

反向探针：engineering 串**不含** normal 面 advisor 句；normal 串**不含**工程面四步句（槽位隔离未破）。

### 5.6 审计与代码评审（轮次 · 终态）

- **内部发散审计（explore · 只读）**：21 项检查全 PASS——八处文本逐字符比对、③ 行多重集恒等、五档行/`##`/`###` 读数、AC-1..AC-7/AC-13 独立复算、五档之外无本单归属改动。终态 **`clean`**。
- **内部代码评审（advisor · type=code）**：轮次 1 = **pass**；0 🔴 · 1 🟡 · 2 🔵。
  - 🟡（协调项 · 非阻塞）：`persona-engineering.md:101` 的角色路由句仍无条件写「engineering-tools face → parent direct edit (no spawn)」，与 `:19` 新 carve-out 同机制两说法；CN 同档同句（`docs/core/design/prompts/persona-engineering.md:106`）亦无条件 ⇒ 共享源残留，且 §2.9 把「其它 prompt 档」划在舱外。
  - 🔵：发评审调用面 `persona-engineering.md:120` 只列 `batchDoc`（② 按 §2.3.2 归纪律层）；③ 重排后 `common.md:169` 的 `the rule above` 先行词隔 10 行。
  - 处置：三条均 **Deferred**（#1 待父侧裁是否另开两面对齐一笔；#2 依 §2.3.2 层次归属不改；#3 修它需先改 §2.3.3「逐字搬移」约束）。
- **fix round**：0 轮（无 🔴）。实施中一处自纠：③ 重排时误在第二段 git why 行尾带入一个 `|`，随即按基线副本 diff 发现并改回——终态该行与改前逐字节相同。

**终态：`clean`**（审计 clean · 评审 pass · 无未决 🔴）。

### 5.7 决策透明表

| # | 决策 | 依据 |
|---|---|---|
| 1 | 改动归因用改前快照（`.thincoder/tmp/cabin-a-baseline/`，gitignored）做 `git diff --no-index`，不用 HEAD 侧 numstat | §2.10 ⑤：工作树携前批未提交改动；HEAD 侧读数（67/62 · 54/53 · 54/54 · 29/29 · 92/86）含前批，不可归因本单 |
| 2 | 本舱未创建 §2.5 的批次级定向单测档 `docs/batches/2026-10-18-prompt-residual-fixes.test.mjs` | 本派单验收面 = AC-1..AC-7 读数 + 五场景冒烟；该档含 AC-8..AC-15（舱 B / AC-14 前置），此刻落盘会携红断言；验证以 inline 断言脚本执行、读数入 5.3。父侧可交舱 B 派单落该档 |
| 3 | 未碰 CN 设计档 / `agent-tools/**` / `tool-docs/**` / `bench/**` | 派单边界 + §2.9 |
| 4 | 改前快照保留在 `.thincoder/tmp/`（不进 git） | 供父侧复核「只动预期行」；临时区，无仓内污染 |

**diff 读数（改前快照 → 现盘，`--numstat`）**：`4/3 · 1/1 · 3/3 · 1/1 · 1/1`（五档依序），与八处处置逐处对应；`common.md` 的 3/3 为纯搬移（排序多重集恒等、字节数不变）。

### 5.8 舱 B（第 ⑥ 项）实施摘要

按批档 §2.3.6 6.1–6.6 逐处落笔，只触五档 + 生成面：`spawn-gates.mjs`（删五段文本门、留 `round`、函数改名）· `subagent-spawn.mjs`（import / 注释 / 调用改名）· `bench/probe/data.mjs`（import 删除 + 校验面退到「任务书在场」）· `bench/check/probe.check.mjs`（1 行 import + 断言换形）· `tool-docs/subagent.md:23`（描述面随门走）· `API-CONTRACT.md`（`node scripts/api-contract.mjs --write` 重生成）。未碰 `bench/check/**` 其它档、`bench/probe/driver.mjs`、提示词档、需求档、设计档。

### 5.9 逐处处置表（file:line + 改后整行）

| # | file:line（改后） | 改后整行 |
|---|---|---|
| 6.1-a | `spawn-gates.mjs:4` | ` * 已实现：F2（round 结构化参数校验）· F6（files 声明面拦截谓词）。` |
| 6.1-b | `spawn-gates.mjs:6` | ` *   - F4 修复轮窄带：全量勘察散文 marker 不可机判（误拒风险不可接受）→ 由 F2 的 round 参数承载轮次语义；` |
| 6.1-c | `spawn-gates.mjs:18` | ` * 任务书模板（五段文本字段的写法样例——供人照抄，不是门的判据；门只校结构化参数 round）。` |
| 6.1-d | `spawn-gates.mjs:34` | `export function validateRoundParam(args) {` |
| 6.1-e | `spawn-gates.mjs:43-47` | `  throw new Error(` 起五行：`` `Engineering spawn round gate: ${missing.join(" · ")}. ` + `` ∥ `` `The spawn contract requires the structured round parameter (initial|fix); ` + `` ∥ `` `the five task-book text segments are a template, not a gate — ` + `` ∥ `` `a missing or invalid round is a dispatch defect and the spawn is refused.`) `` |
| 6.1-f | `spawn-gates.mjs:12-15` | `export const ROUND_VALUES = ["initial", "fix"]`（保留；注释 4 行） |
| 6.1-g | `spawn-gates.mjs:20-26` | `export const ENG_TASK_BOOK_MIN = [` … `].join("\n")`（五段模板保留，注释改「任务书模板」） |
| 6.1-h | `spawn-gates.mjs:50-91` | F6 两谓词逐字未动、整体前移（旧 `:70` → 新 `:50`） |
| 6.2-a | `subagent-spawn.mjs:29` | `// M5 F2（ENGINEERING-MODE-V2-MODULE-DELEGATION §2.3）：任务书 round 结构化参数校验本体落` |
| 6.2-b | `subagent-spawn.mjs:31` | `import { validateRoundParam } from "./spawn-gates.mjs"` |
| 6.2-c | `subagent-spawn.mjs:225-228` | `// M5 F2（… §2.2）：round 结构化参数门——工程角色必带` ∥ `// round（initial|fix）；任务书五段文本字段只作模板，不做机械校验（文字判据查得到标题、` ∥ `// 查不到内容——内容由执行者拒收兜底，需求 §1.14 #9 行为面）。落点 = batchDoc 门之后、` ∥ `// token 门之前。explore/plan/coder 豁免。` |
| 6.2-d | `subagent-spawn.mjs:230` | `    validateRoundParam(args)` |
| 6.3-a | `bench/probe/data.mjs:9-11` | 原 `:11` import + `:12` 空行删除（本档不再引 `spawn-gates.mjs`） |
| 6.3-b | `bench/probe/data.mjs:140-141` | `/** 夹具 schema 校验（fail-closed——装载期即拒）：版本整数 + 逐族树形态 + **任务书在场（非空串）**` ∥ ` *  + `targets` ⊆ 树内档（沙箱内相对形态）。 */` |
| 6.3-c | `bench/probe/data.mjs:148-150` | `    if (typeof f.taskBook !== "string" || f.taskBook.trim() === "") {` ∥ ``      throw new Error(`夹具族「${id}」任务书缺失或为空`) `` ∥ `    }` |
| 6.4 | `tool-docs/subagent.md:23` | 改后全行 = 设计 6.4 文本；AC-11 逐字全等读数见 5.10 |
| 6.6-a | `bench/check/probe.check.mjs:17` | `import { validateRoundParam } from "../../thincoder-core/agent-tools/spawn-gates.mjs"` |
| 6.6-b | `bench/check/probe.check.mjs:104-106` | `    // 反例用例②：round 结构化参数缺失 / 非法 ⇒ 机械拒（五段文本 = 模板，不做机械校验）` ∥ `    assert.throws(() => validateRoundParam({}), /round/)` ∥ `    assert.doesNotThrow(() => validateRoundParam({ round: "initial" }))` |
| 生成面 | `API-CONTRACT.md:702-705` | `ROUND_VALUES` → `spawn-gates.mjs:15` ∥ `ENG_TASK_BOOK_MIN` → `:20` ∥ `validateRoundParam` → `:34` ∥ `rejectEngineeringFilePaths` → `:77`（四个行号与现盘逐一对上） |

### 5.10 AC 逐条读数（含改前对照）

- **AC-8 ✅**：`TASK_BOOK_FIELDS` **0**（改前 2：数组定义 + 循环引用）· `validateTaskBookFields` **0**（改前 3：定义 + import + 调用）· `validateRoundParam` **1**（`:34`）· `ENG_TASK_BOOK_MIN` **1**（`:20`）· 行数 **111 → 91**（−20）；字符 5414 → **4259**（§2.5 预测 4259，逐字命中）。
- **AC-9 ✅（behavior · inline 实跑）**：`{round:"initial"}` / `{round:"fix"}` 放行；`{}` / `{round:"v2"}` / `undefined` / `{round:null}` 抛；抛错文案含 `round`，五段字段名（目标与理由 / 已知事实 / 设计要点与禁止范围 / 验收标准 / 交付报告格式）及其英文等价形**零命中**。
- **AC-10 ✅**：`subagent-spawn.mjs` 旧名 0（改前 `:31` import + `:230` 调用）· `validateRoundParam` import **1**（`:31`）+ 调用 **1**（`:230`）· `:29` 含「round 结构化参数校验本体落」∧ 该档「六强制字段」**0**（改前 1，`:29`）· `spawn-gates.mjs` 内「六强制字段」「六字段」**0**（改前各 1，`:13` / `:44`）· **空 task + `round:"initial"` 放行**（实测 `{task:"", round:"initial"}` ∥ `{task:"   ", context:"", round:"initial"}` 均 return；改前 `:57-60` 五段 marker 循环必抛）。
- **AC-11 ✅**：`tool-docs/subagent.md:23` **全行** === `docs/core/design/AGENT-LOOP-SUBAGENT.md:662-665` 四行按单空格拼接（程序比对 `true`）· `six mandatory fields` **0**（改前 1）· `the gate matches these markers` **0**（改前 1）· `:29` = `**设计要点与禁止范围**：…` 仍在。
- **AC-12 ✅**：`node --check` 三档 exit **0**（`spawn-gates.mjs` / `subagent-spawn.mjs` / `bench/probe/data.mjs`）· `validateFixtures()` → **`{"families":3}`**（空串任务书反例实测抛「夹具族「p1」任务书缺失或为空」）· `node scripts/api-contract.mjs --write` 重生成（4328 条 · 截断 5 行 −33 符号）· `API-CONTRACT.md` 旧名 **0**、`validateRoundParam` **1 行**（`:704`，坐标 `spawn-gates.mjs:34`）。
- **AC-13（本舱触档）✅**：见 5.11 五行，逐行与 §2.5 相等。
- **AC-14 ✅**：① `bench/check/probe.check.mjs` 在盘；② 该档全文 `missing mandatory field` **0**（改前 1，`:104`）；③ round 行为断言三形在盘（import 1 ∥ `assert.throws(() => validateRoundParam({}), /round/)` 1 ∥ `assert.doesNotThrow(() => validateRoundParam({ round: "initial" }))` 1）；④ `node bench/check/run.mjs` exit **0**，汇总 **116 passed, 0 failed**（改前基线同为 116 / 0 / exit 0）。
- **AC-7 后核腿 ✅**：`spawn-gates.mjs:23` = `"设计要点与禁止范围：仅落设计档受影响文件清单；禁夹带新语义。"`，与 `tool-docs/subagent.md:23` ∥ `:29` 三处同形。

### 5.11 档级读数（行数 = `\n` 计数）

| 文件 | 改前 | 改后 | §2.5 预期 | 判 |
|---|---|---|---|---|
| `spawn-gates.mjs` | 111 | **91** | 91 | ✅ |
| `subagent-spawn.mjs` | 412 | **412** | 412 | ✅ |
| `bench/probe/data.mjs` | 221 | **217** | 217 | ✅ |
| `bench/check/probe.check.mjs` | 265 | **267** | 267 | ✅ |
| `tool-docs/subagent.md` | 42 | **42** | 42 | ✅ |

字符面两条留档：`spawn-gates.mjs` 5414 → 4259（与 §2.5 预测相等）· `subagent-spawn.mjs` 23223 → **23200**（Δ = −23，§2.5 预测「行 0 · +16」⇒ 偏差 −39；§2.5 的 +16 只算了三处改名（+7 / −4 / −4 = −1），未算 `:225-228` 注释重写。AC-13 已容「落笔时现盘重测」，故不阻断，仅记录）。

### 5.12 审计与代码评审（轮次 · 终态）

- **内部发散审计（explore · 只读）**：A–G 七面全查 —— 五档与 6.1–6.6 逐字对照（`spawn-gates.mjs` 前 48 行 48/48 命中；F6 新 `:50-91` 未动）、AC-8/9/10/11/12/14 静态面独立复算、越界检查（五档改动全可归因 6.1–6.6；`bench/probe/driver.mjs:98` 未动；`bench/check/**` 其它档零触）、旧机制说明残留扫面。四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）**零**；1 条 🔵 = `bench/check/probe.check.mjs:67` 的 check 标题仍写「五段任务书过核门」（设计 6.6 只授权改一处断言 ⇒ 设计射程缺口，非实施偏差）。终态 **`clean`**。
- **内部代码评审（advisor · type=code）**：轮次 1 = **pass**；**0 🔴 · 2 🟡 · 3 🔵**。
  - 🟡#1 `bench/check/probe.check.mjs:67` 标题残留（同上；建议设计面补一句授权后改标题）——**未擅改**，上抛。
  - 🟡#2 round 常驻覆盖偏薄：`{round:"fix"}` 与 `{round:"v2"}` 无断言、装配点「仍调用谓词」无断言、批次定向单测档不在盘；另两条断言挂在 sandbox 装配腿内 —— 设计 6.6 逐字只给两条断言 ⇒ 记录不改。
  - 🟡#3 舱 B 验收读数无书面落点 —— **本节即落**（5.8–5.13）。
  - 🔵#4 §2.5 字符预测 +16 vs 实测 −23（doc drift，见 5.11）。
  - 🔵#5 夹具任务书形态无断言（设计 2.8 #10 已裁，提示级）。
  - 处置：🟡#1 / #2 按「设计未授权不改」留作上抛；#3 已消；🔵 记录不改代码。
- **fix round：0**（无 🔴；三条 🟡 无一是代码缺陷）。
- **终态：`clean`**（审计 clean · 评审 pass · 无未决 🔴）。

### 5.13 决策透明表

| # | 决策 | 依据 |
|---|---|---|
| 1 | 未创建批次定向单测档 `docs/batches/2026-10-18-prompt-residual-fixes.test.mjs`；AC 读数以 inline 脚本 + bench 常驻自检为证 | 本派单验收面 = AC-8..AC-12 / AC-14 逐条读数；舱 A §5.7 #2 已记同一处置；该档随收口删、属批次级 |
| 2 | `bench/check/probe.check.mjs:67` 标题未改 | 设计 6.6「只改这一处断言」+ §2.9 边界；改它 = 未经批准的设计面变更 ⇒ 上抛 |
| 3 | `data.mjs` 校验面退到「非空串」、不保留 round 常量冒烟 | 设计 2.3.6 6.3 + 2.8 #10 |
| 4 | `API-CONTRACT.md` 用 `--write` 整区重生成；生成区含工作树他批未提交漂移（非本舱笔） | 设计 2.2 / 2.5 指定生成面；§2.10⑤ 已记工作树携前批改动；整区替换是生成器设计行为 |
| 5 | 未改 `bench/probe/driver.mjs`（不加 round 入参） | 设计 2.8 #10 被否方案 |
| 6 | 三个 `.mjs` 逐个 `node --check` + bench 全量自检实跑后才声明完成 | 项目硬规矩「Every change must be verified by running it」 |

## §6 验证与收口（父代理）

### 一、本批交付（两舱）

| 舱 | 内容 | 验证 |
|---|---|---|
| **A** | EN 提示词五档（① 三处 · ② 两处 · ③ 重排 · ④ 删读数 · ⑤-3 统一形） | §5.1–5.3 在册 · AC-1..AC-7 / AC-13 绿 |
| **B** | ⑥ 拆任务书五段文本字段门（5 源档 + `API-CONTRACT.md` 重生成） | AC-8..AC-12 / AC-14 全绿（见下） |
| **D** | 需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` 三行订正（父侧笔） | AC-15 绿（见下） |

### 二、父侧亲验读数（2026-10-18 10:43 · 全部本席实跑）

| 判据 | 读数 | 期望 |
|---|---|---|
| **AC-8** `spawn-gates.mjs` | **91 行** · `TASK_BOOK_FIELDS` **0** · `validateTaskBookFields` **0** · `validateRoundParam` **1** · `ENG_TASK_BOOK_MIN` **1** · `六强制字段/六字段` **0** | 同 |
| **AC-9** 行为 | `{round:"initial"}` **PASS** · `{round:"fix"}` **PASS** · `{}` **THROW** · `{round:"v2"}` **THROW** | 同 |
| **AC-10** 新行为边界 | **空 task + `round:"initial"` = PASS**（旧门会拒）· 旧名 0 · 新名 import/调用各 1 · `:29` 含新注释 | 同 |
| **AC-11** 逐字全等 | `tool-docs/subagent.md:23` === `AGENT-LOOP-SUBAGENT.md:662-665` 单空格拼接（程序比对 true）· 两旧短语 0 | 同 |
| **AC-12** | `node --check` ×3 exit 0 · `validateFixtures()` = `{families:3}` · API-CONTRACT 旧名 0 / 新名 1 行 | 同 |
| **AC-14** | ① 在盘 ② `missing mandatory field` **0** ③ import/throws/doesNotThrow = 1/1/1 ④ **`node bench/check/run.mjs` exit 0 · `bench/check: 116 passed, 0 failed`** | 同 |
| **AC-15** 舱 D | 四禁词 `六字段` / `六个字段` / `缺字段即拒` / `门禁自己不动` **全 0** · `:12` / `:430` / `:433` 各含 `round` · 档 760 行不变 | 同 |
| 五档行数 | `spawn-gates` **91** · `subagent-spawn` **412** · `data.mjs` **217** · `probe.check` **267** · `tool-docs/subagent.md` **43** | 前四与设计一致；第五见下 |

### 三、父侧直接执行（标记 · 可逐条 revert）

| # | 改动 | 依据 |
|---|---|---|
| 1 | `bench/check/probe.check.mjs:67` 用例标题「五段任务书**过核门**」→「**任务书在场（非空串）**」 | `eng-coder#155` 上抛：门已删，标题成假话；设计 6.6 只授权改断言、未授权改标题 ⇒ 父侧补 |

### 四、实施回执的三条知会（父侧裁定）

| # | 事项 | 裁定 |
|---|---|---|
| 1 | `subagent-spawn.mjs` 字符预测 `+16` vs 实测 **−23** | **接受**——§2.5 只算了三处改名，漏算 `:225-228` 注释重写；AC-13 允许按现盘重测 |
| 2 | `tool-docs/subagent.md` 设计记 42 → 实测 **43**（`git diff` 净 −1 = 改前 44 → 43） | **接受**——设计的 42 是旧快照读数；真实变化 = 净 −1 行，实质一致 |
| 3 | `API-CONTRACT.md` `--write` 整区替换，扫入约 40 行前批未提交漂移 | **接受**——生成面整区重写是设计行为；本舱归属行 = `spawn-gates` 四行（`:702-705`），其余属前批 |

### 五、`2.10②` 记录面处置（设计给的第二条路径）

`PROMPT-SYSTEM.md`（7 处）· `TOOLS.md`（2 处）· `DOC-DISCIPLINE.md`（1 处）仍以「六字段 / `validateTaskBookFields`」描述已删的门。

**裁定 = 记录面，留作历史**（设计 2.10② 明列的两条路径之一）：

- 这三档的相关行是**决策记录 / 批边界声明**（「当时这一批做了什么、边界在哪」），不是现行机制描述；
- 改成现态 = 篡改历史记录；**规范面已净**（需求档 AC-15 四禁词全 0）；
- 后续读者若按这些行找门，会在 `spawn-gates.mjs` 得到否定答案 —— 记录面与现行面的差异由本批档承载。

### 六、遗留（登记待办 · 不在本批）

| # | 项 | 去向 |
|---|---|---|
| 1 | 任务书五段**参数化**（用户 10:37「要求本身要提」） | 已开新批 `docs/batches/2026-10-18-taskbook-params.md`（`eng-designer#156` 设计中） |

### 七、结论

本批三舱（A 提示词五档 · B 删文本门 · D 需求档三行）全部交付并亲验。**任务书的机械校验面从「正则撞五个中文标题」收敛为「只校 `round` 结构化参数」**；五段退为模板（供人照抄），内容质量不再由机械门假装承担。

**状态行** → 已收口 2026-10-18
