# 2026-11-11 · review-pass-signs-itself
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 23:37「这个问题也发生无数次了，为什么不在评审通过的时候处理？」——评审判 VERDICT: pass 后 §3 状态行仍停「进行中」，§5 写门锁死，只能再发一轮评审补签。。
> 台账 = #2342（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = 48482678ab9c708d3eaf63d5d49f520d2041ae34

### 条目与授权口径（父侧）

**用户原话**（2026-11-11 23:37）：「这个问题也发生无数次了，为什么不在评审通过的时候处理？」

**病**：评审判 `VERDICT: pass` 后 §3 状态行仍停「进行中」⇒ §5 写门只认「评审通过」⇒ 实施席写不进 §5 ⇒ 只能再发一轮评审补签。

**根因**：签字现在是**评审席的第二次动作**，与写结论之间只靠「记得」。同族病灶今晚已出现两次（档位规则靠提示词纪律、一份批档一张任务书靠人记）。

**本批范围**：

```
① 挂点 = advisor-settle 的 pass 结算那一笔（与 persistEngTokens 同成功/失败边界）
② 只对设计评审生效（代码评审无 token、不改 §3）
③ 写失败 ⇒ 整笔回退，不留半张
```

**边界**：18 份开放批档 §3 无状态行的存量，另行处置，不并入本批。

**授权**：本条起于用户提问，非我自设；设计面归设计席，评审与批准按常规流程。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
**条目（覆盖）**：#2342 `review-pass-signs-itself`——设计评审判 `VERDICT: pass` 后 §3 状态行不自签，§5 写门锁死，只能再发一轮评审补签。

| # | 条目 | 判据落点（设计档） |
|---|---|---|
| ① | 挂点 = 结算那一笔（签字与 token 落盘同成一笔，写档在前、落盘在后） | `design §4.23`「机制」表 +「顺序」 |
| ② | 只对设计评审生效（`type="code"` 结构上不可达） | `design §4.23`「只对设计评审生效」 |
| ③ | 写失败整笔回退（写档失败 ⇒ 零写；落盘失败 ⇒ 档字节写回 + token Map 回 `preMap`，不签半张） | `design §4.23`「机制」②③ + 分支依据表 |

**设计档落点**：

| 档 | 节 | 载什么 |
|---|---|---|
| `docs/core/design/BATCH-RECORD.md` | §4.23 | 机制本体：三件一笔、复用 `statusPassPlan`、顺序、两轨同判、回退、测试缝、已收口档、分支依据表、红侧两支、验收回指、集成 delta |
| `docs/core/design/ADVISOR-GUARDS.md` | §1.1 判据② · 判定位置 · 对称另一半 · U-2/U-3/U-5 · A-AG22 | 闸的面：拒因从「别人没置位」改为「签字写不进 ∥ 回读不等于 pass」；缺状态行不再拒 |

**受影响文件**：

- `thincoder-core/agent-tools/design-token.mjs`——判据②改签字节拍；返回形加 `sign`；写通道收在模块级引用并导出 `__setRecordWriterForTest`（测试缝，生产路径不调）。
- `thincoder-core/agent-tools/advisor-settle.mjs`——pass 分支先签后落盘；落盘失败回写档字节；两句回执。
- 单测档 `docs/batches/<批档名>.test.mjs`（用毕即删）。
- 集成两处：`test/rtm/batch-ledger.md` 的 `27-3` 行 + `test/integration/batch-status-auto-set.test.mjs`。
- 零改面 = `design §4.23` 的「零改面」行。

**档层结论（表级 · 覆盖全部源档与测试档）**：三档既有档——`design-token.mjs` ∥ `advisor-settle.mjs` ∥ `test/integration/batch-status-auto-set.test.mjs`——实测均不越设计器硬线 500 行；第四档（本批单测档）为新增，读数随 §5。

口径命令 = 本仓 D15 的长度读数尺 `doc_check` 的 `lines`：`doc_check({target:"<仓根>", mode:"report", docs:["docs/core/design/BATCH-RECORD.md"], lines:[<上列四档路径>]})`。逐档绝对读数住 §5，本段不落。

**验收对照**：条目 → `design §4.23`「验收回指」表五行（① ② ③a ③b ④），加集成 `27-3` 一行。

- ① `edit §3` 写块 + pass 结算后状态行 = `评审通过` 且 `passed:true`。
- ② code 轨结算前后档字节相等。
- ③a 写通道注入抛错 ⇒ 档字节相等 ∧ 槽数相等 ∧ 回执无 `Approved`。
- ③b 签字成功 + `persistEngTokens` 注入失败 ⇒ 档字节 = 签字前 ∧ 槽 Map = `preMap` ∧ 回执点名落盘失败且无 `Approved`。
- ④ 状态行改写仍只在 `updateSectionStatusLine` 一处（内置 `grep` 口径，取函数调用形；调用点闭集 = 六处五档，逐处列名 = `design §4.23` 验收回指 ④）。

跑法 = `node --test docs/batches/<批档名>.test.mjs`（单测档随批收口删除，故不写死路径）；上面五行跑在同一次 `node --test` 上。

读数（单测 N/N、集成、`doc_check` gate）住 §5 / §6，本段不写绝对读数。

**边界（不做）**：不改 `batch` 工具的状态行写入权（§3 仍只有评审席身份能写，本批改的是谁在什么时候调它）· 不给 `edit §3` 加裁定行闸 · 不批量补签存量批档 · 不在结算面判台账（账链门只判点火）。

**存量交接**：18 份开放批档 §3 无状态行（desk 三份 ∥ lane01–12 ∥ node-floor）由主 agent 单独处置，不进本批；本机制只在该批下次复评时把它们补齐。

**需求层同轮改（D11 · 主 agent 本轮自领）**：需求档 §5.3 现文逐字「**§3 状态行由工具置位，不由评审手写**：写 `append §3` 那一笔同时落状态行」——本批把签字扩到结算那一笔，该句须同轮改成「写通道与结算两处都落」的两处口径。

需求笔归主 agent；不改则该层仍是旧口径，读者按哪句都行。

**fix 轮落点（评审发现 + 父侧裁决，逐条住设计档）**：

| 项 | 落点 |
|---|---|
| 调用点闭集按实读对齐（六处五档，非三处） | `design §4.23` 验收回指 ④ + `docs/core/design/ADVISOR-GUARDS.md` §1.1 判据 2 |
| 写档失败补「写回签字前原文」支（半截写） | `design §4.23` 机制 ② +「写不进 ⇒ 写回签字前原文」+ 验收 ③a |
| 返回形 `sign` = `{ before, rollback() }` | `design §4.23` 新名三问 ① + 受影响面 |
| 结算写盘不进批档写面的记账面（记明，不接线） | `design §4.23`「这一笔不进批档写面的记账面（口径）」+ 边界 |
| `persistEngTokens` 邻近 try 的过期句 | `docs/core/design/ADVISOR-GUARDS.md` §1.1 判据 1 子项 |
| `REVIEW_RECORD_MARK` 恢复句射程外置一句（不改文案） | `docs/core/design/ADVISOR-GUARDS.md` §1.1 |

## §3 设计评审（评审子代理）
**状态行**：评审通过（轮 1：🔴 0 · 🟡 8 · 🔵 2）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处置 | 批档 §2「上抛（待裁 · 需求层同轮改）」——「不改则该层仍是旧口径，读者按哪句都行」；`ENGINEERING-MODE-V2.md` §5.3 仍只写 append 笔，未进任何落点/验收表 |
| 2 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.1「段内一个写面」行——「实现 = `statusPassPlan`，落点 `thincoder-core/agent-tools/batch.mjs` 的「通过即置位」条」；未留 §4.23 指针 |
| 3 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23「档层结论」只点两档代码；批档 §2「受影响文件」无一句表级档位结论 + 无口径命令（实测 281 / 247 / 193 行，合于结论） |
| 4 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23「集成测试设计」破 = 0 行（只核 27-1 / 14-1 / 14-2 / 14-8）；对读 `ADVISOR-GUARDS.md` §1.3「两例直调 `settleDesignReview`（`settleWithBatchDoc` 自造 `run`）」 |
| 5 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23 无「分支依据」列；对读 `ADVISOR-GUARDS.md` §2 第 6 条「分支依据（每个分支一条实读，无实读的删掉）」 |
| 6 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23 验收回指 ③「单测：只读批档 ⇒ 档字节相等 ∧ 槽数相等 ∧ 回执不含 `Approved`」——失败注入机制未定 |
| 7 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23「边界（不做）」无冻结档一支；对读 §7 D-BR35「已收口档六段一律不可就地改」 |
| 8 | 🟡 | 待处置 | `BATCH-RECORD.md` §4.23 机制③「`persistEngTokens` 失败 ⇒ 用 ② 之前的档字节写回」v.s. 验收回指 ③（验的是写档先失败的支）——回退支无验收项 |
| 9 | 🔵 | 记录 | 批档 §1 残留「<§1 模板占位：本批条目 / 关键判据 / 授权口径>」∥ §2 上抛「§1 仍是模板占位」，而 §1 已有「### 条目与授权口径（父侧）」正文 |
| 10 | 🔵 | 记录 | `BATCH-RECORD.md` §4.23 验收回指 ④「状态行改写仍只在 `updateSectionStatusLine` 一处」——未给命令，未给 `node --test <file>` 面 |

计数：🔴 0 · 🟡 8 · 🔵 2

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（四件交付 · 单测 9/9 · 集成 4/4 · 回归 38/38 · 自审 1 轮 + 代码评审 1 轮（VERDICT pass，🔴 0）· 修正 0 轮，终态 clean）



### 实施摘要（四件落点）

| # | 件 | 落点 |
|---|---|---|
| ① | 写档收进模块级引用 + 测试缝 | `thincoder-core/agent-tools/design-token.mjs`：`let recordWriter = writeFileSync`（签字与回退写同经这一个引用）· 导出 `__setRecordWriterForTest(fn)`（传非函数即还原；生产路径零调用，全仓唯一消费方 = 本批单测档） |
| ② | pass 结算并笔 | 同档 `settleDesignReview`：`const plan = statusPassPlan(batchSrc, 3, rawResult, "")` ⇒ `updateSectionStatusLine(batchSrc, 3, plan.statusValue)`（**算全文在 try 之外**——§3 段头缺失照 throw，不落成拒因）⇒ `recordWriter` ⇒ 回读盘上字节判 `readSectionStatusWord`；计划空 = 幂等零写。返回形第三格 `sign = { before, rollback() }`。`advisor-settle.mjs`：先签后落盘；`durable === false` ⇒ Map 回 `preMap` + `sign.rollback()` 写回档字节 + 回执两句（落盘失败 ∥ 回退写也失败）并报 |
| ③ | 单测档 | `docs/batches/2026-11-11-review-pass-signs-itself.test.mjs`（9 条：① ② ③a ③a′ ③a″ ③b ③b′ ④ ⑤；用毕即删） |
| ④ | 集成行 27-3 | `test/rtm/batch-ledger.md` 的 `27-3` 行 + 节注「三态」；用例落 `test/integration/batch-status-auto-set.test.mjs`（同一档 27-1 ∥ 27-2 未动，零回归） |

### 判据对账（`design §4.23` 验收回指五行 → 用例 → 读数）

| 条目 | 判据 | 用例 | 终端读数 |
|---|---|---|---|
| ① 挂点 = 结算那一笔 | `edit §3` 写块 + pass 结算 ⇒ 状态行 = `评审通过` ∧ `passed:true` | 单测 ① · 集成 `27-3` | 9/9 · 4/4 绿 |
| ② 只对设计评审生效 | code 轨结算前后档字节逐字相等 | 单测 ②（携 token ∥ 回显 ∥ pass 裁定） | 绿 |
| ③a 写档失败 ⇒ 零写不留半张 | 档字节相等 ∧ 槽数相等 ∧ 回执无 `Approved` | 单测 ③a；半截写两支 = ③a′（**写回签字前原文**）∥ ③a″（两处并报） | 绿 |
| ③b 落盘失败 ⇒ 整笔回退 | 档字节 = 签字前 ∧ 槽 Map = `preMap` ∧ 回执点名落盘失败、无 `Approved` | 单测 ③b；回退写也失败 = ③b′ | 绿 |
| ④ 不新增写路径 | `**状态行**：` 插值生成只在 `updateSectionStatusLine` 体内 · 调用点闭集 · 回读同值 | 单测 ④ | 绿 |
| 分支依据 ①（现场形 = 状态行停在 `进行中`） | 原位改写而不插第二行 | 单测 ⑤ | 绿 |

### 红侧实跑（每支一次「撤掉实现就红」）

| 撤什么 | 读数 |
|---|---|
| 签字整支撤掉（`if (plan)` 永不入） | 单测 ① ③a ③a′ ③a″ ③b′ ⑤ 红；集成 `27-3` 红且回执逐字 `reason: status-not-passed`（`27-1` 仍绿 ⇒ 夹具确实是判别器） |
| 结算回退不调 `sign.rollback()` | 单测 ③b 红（档上留签字、状态行仍 `评审通过`）、③b′ 红 |
| 回退失败吞掉（`rollbackErr = null`） | 仅 ③b′ 红（`签字回写也失败了` 缺）——②失败并报这一支单独被守住 |
| code 轨限定撤掉（`if (entry.designToken && result)`） | 单测 ② 红（代码轨也签发） |
| 半截写不写回（`void 0`） | 单测 ③a′ 红（档停在 30 字节残档）、③a″ 红（并报缺第二处） |
| 第二个写路径（`**状态行**：${v}` 造在 design-token） | 单测 ④ 红——**此支首版判据过窄（键 `${value}` 而非插值形）曾漏判，本轮内收正为 `/`\*\*状态行\*\*：\$\{/` 后复红** |

### 决策披露（与设计档字面的偏离，逐条给依据）

1. **`sign` 多带一格 `rollback()`**：设计登记的是 `sign.before`（新名三问只登记 `sign` 一格）。回退写必须经同一个 `recordWriter`（否则注入缝对回退无效、③b′ 不可造），而写通道在本模块内 ⇒ 以闭包交出，不新开导出名。`before` 仍按设计给，`rollback` 只一个消费者（`settleAdvisorRun`）。
2. **半截写这一支加「写回签字前原文」**：`design §4.23` 机制② 只写拒因，未写回退；但验收行 ③a 的字面是「写档失败 ⇒ 零写不留半张」，而半截写恰恰留下半张（截断的批档没有第二条恢复路径）。写回经同一 `recordWriter`，失败则并报。**这是父级可推翻的一笔**——若判该支保持原样，删掉那 6 行即可。
3. **不回退实例态（如实注）**：`settleDesignReview` 同拍还翻了 `run.open` ∥ `run.priorOutput`，落盘失败只回退「档字节 + 槽 Map」两处（= 本批 §2 ③b 的口径）⇒ 失败后重跑是全新一轮评审，不是同一实例重评。已在 `advisor-settle.mjs` 注释里写明，不留「结算未发生」这种与代码不符的断言。

### 设计档漂移（实施侧如实上报，不由本席改设计档）

1. **`design §4.23` 验收回指 ④ 与 `ADVISOR-GUARDS.md` §1.1「三处调它」都写「调用点仍只三处（append 笔 ∥ `status` ∥ 结算签字）」**：实测闭集是 5 档 6 处——`batch-lifecycle.mjs` 2（`status` ∥ 收口）∥ `batch-record-write.mjs` 1（append §3）∥ `batch-reopen.mjs` 1 ∥ `batch-supersede.mjs` 1 ∥ `design-token.mjs` 1（结算签字）。单测 ④ 按实读钉闭集（比「三处」更强），两档枚举待设计席与实读对齐。
2. **`ADVISOR-GUARDS.md` §1.1 第 1 条「邻近唯一的 try 包的是 `persistEngTokens(agent)` 那一处」已过期**：本批在同一函数加了第二个 try（`settled.sign.rollback()`）。「`const settled = settleDesignReview(…)` 本身不被包」这一核心断言仍成立。
3. **结算这次写盘不进批档写面的记账面**：其余六个写面写盘后都 `agent._batchWrites += 1` + `onWritten?.(agent, abs)`，并先过 `runBatchGate` 文档机检门；结算签字只有一次 `recordWriter` ⇒ 端侧触碰账与 §6.6 `wrote` 判据少计这一笔。口径归父级（设计档记明或接线），本席未自行新开注入缝。
4. **`REVIEW_RECORD_MARK` 的固定恢复句**（「补写该批档 §3 … 后重跑设计评审」）对新增的写失败面不贴切：§3 已写好，缺的是状态下不去（真因在 `detail`）。§1.1 判该两行为恒定位、逐字不动，故本席未动，只报。

### 读数（本批实跑）

- 单测：`node --test docs/batches/2026-11-11-review-pass-signs-itself.test.mjs` ⇒ **9/9 pass · 0 fail**。
- 集成本档：`node --test test/integration/batch-status-auto-set.test.mjs` ⇒ **4/4 pass**（27-1 ∥ 27-2 ∥ 27-2 负半幅零改仍绿）。
- 回归面（设计档「破 = 0」点名的同函数夹具）：`batch-close-token-consume` 3/3 · `advisor-record-gate` 3/3 · `batch-gates-reanchor` 14/14 · `batch-close-gate` 14/14 —— 全绿。
- `doc_check` gate（范围 = 本席写过的 `test/rtm/batch-ledger.md` + 本批档）⇒ 首行 `DOC-CHECK GATE: PASS`。
- 档层读数（D15 尺 = `doc_check` 的 `lines`）：单测档 319 ∥ 集成档 236 ∥ `advisor-settle.mjs` 265 ∥ `design-token.mjs` 340 —— 4 档全在设计器硬线 500 以内。

### 内部轮次与终态

- 自审（divergence audit，1 轮）：记 4 条——④「三处」与实读不符（报设计席）· `updateSectionStatusLine` throw 被 try 吞成拒因（**本轮内改**：算全文移出 try）· 计划空支无依据（**本轮内删**：改为按计划入支，空即幂等零写）· `rollback` 未登记（如实披露于「决策披露 1」）。
- 代码评审（1 轮，独立 advisor）：`VERDICT: pass`，🔴 0；🟡 5 / 🔵 2 全为建议级。本轮内处置 2 条（半截写写回 · 原位改写支补用例 ⑤）；余 4 条转设计席/父级（见「设计档漂移」）。
- 修正轮：**0 轮**（无 🔴；上述两条发现当场改并复跑，未开新轮）。
- 终态：**clean**（单测 9/9 · 集成 4/4 · 回归 38/38 · gate PASS）。

### 边界与未做

- 18 份开放批档 §3 无状态行的存量，本批不补（§2 边界）；本机制只在该批下次复评时把它补齐。
- 未动：`statusPassPlan` ∥ `statusResetPlan` ∥ `updateSectionStatusLine` ∥ 段白名单 ∥ `batch` 三写面 ∥ `§5` 写门 ∥ `persistEngTokens` ∥ 需求档（主 agent 的笔）。

## §6 验证与收口（父代理）
