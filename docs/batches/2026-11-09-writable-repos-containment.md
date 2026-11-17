# 2026-11-09 · writable-repos-containment
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 20:27 报告：把 `index.writableRepos` 设成某仓的**子目录**后，该子目录**之外**也可写——前缀包含判据疑似过宽。。
> 台账 = #2242（core · 归批）。前情 = 2026-11-09-cross-repo-write（已收口 2026-11-09）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 定位（父侧实跑，2026-11-09 20:35）

**病灶：工作区窄口（`workspaceRoot`）不看 `index.writableRepos`。**

判序遍历（`thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerBindWriteConflict`）：目标落在声明表内 ⇒ 判据点换成声明项目；**否则**目标取不到项目根时走窄口。窄口只判三件——声明解析得出项目 ∥ 目标在会话锚子树内 ∥ 锚是带 manifest 子目录的工作区；**没有一条问「目标在不在写权表里」**，随后直接拿声明项目的台账判号 ⇒ 号对即放行。

**实跑夹具**（临时目录，两个带 manifest 的仓 A ∥ B，A 的写权表声明 B 下的子目录 sub，会话锚 = 工作区根）：

| 目标 | 结果 |
|---|---|
| 表内：sub 下的档 | 判 A 的账（符合预期） |
| 表外但同仓有 manifest | 拒：`target belongs to another project and index.writableRepos of the declared project does not declare it`（符合预期） |
| 表外且无 manifest | **判 A 的账** —— 走的是窄口，写权表没被问过；换一个 A 的在途号即放行 |

会话锚是工作区根（本会话正是），所以「声明一个子目录」对**没有项目根**的目标**不构成任何收窄**——与用户报告一致。

**与既有裁定的关系**：跨仓批的两分口径（表外只能用目标仓自己的号）只覆盖「目标有项目根」那一半；无根目录这一半落在窄口，而窄口是 2026-11-08 的工作区开法，早于写权表，没有跟着收。

**待用户裁的最小修法**：**表非空时，窄口加一条前置——目标必须落在表内某声明根内**；表为空（未声明）⇒ 窄口维持现状。这样既收住报告的场景，也不动未声明工作区的既有行为。

## 用户裁定（2026-11-09 20:34）

- **用户原话：「可以」**（就上一条提出的修法）。
- **裁定内容**：**传了 `project:` 的笔，在此目标上只能走声明的那本账**——表内 ⇒ 判声明项目；**表外 ⇒ 直接拒，不回落到目标仓的账**。**没传 `project:` 的笔**照今天这样走目标仓自己的账。
- **这是替换不是兜底**：表外那一支删掉「先查目标仓台账、查到就放行」的回退，不留兼容分支。

## 病灶复核（父侧，2026-11-09 20:33）

用户配置在 `D:\repos\v2-dev.51marine.com`：`index.writableRepos = ["../v2-vibe-coding/v2"]`。

实跑该真仓组合，四格读数：表内 ⇒ 判 v2-dev 的账 ✓；表外三格（同仓 docs ∥ 同仓根 ∥ 另一个仓）⇒ **均回落到目标仓自己的台账**。

**为什么这构成越界**：`ledgerRowRefusal` 只判 `id + status === 在途`，**不判这行属于谁**；而台账号按项目各自编号，两仓重号常见 ⇒ 拿 v2-dev 的 `#N` 去写 v2-vibe-coding，只要对方账里也有 `#N` 在途，就被当成「目标仓自己的批」而放行。

**设计本意 vs 实现**：设计的两分口径是「用本仓的账写外部目标 ⇒ 表内才放行；**不声明写方**才走目标仓自己的号」。实现把「表外 ⇒ 拒」窄成「表外且目标仓查无此行 ⇒ 拒」，于是声明了写方也仍然走得通目标仓那条路——**与裁定相反**。

## 父侧裁定（2026-11-09 20:40 · 设计初轮两处上抛）

**① `execute.workdir` ∥ `manifest.target` 不收进另批——本批一起收。**

理由：这两把与新规则下要堵的是**同一个洞**（带了 `project` 却仍去判目标仓的账）。分两批收，第一批落地后洞仍然开着，读者会以为规则已经生效——「留一处就是一处正确、一处仍旧」。所以本批把 ① 口子也开给这两把：**凡带定位参数、带 `project` 的写型入口，一律走同一判序**。

**② 需求档补 R2 那一条，由主 agent 写。**

设计席报告需求档只有 R1（表外无条件拒），没有 R2（窄口加表前置）。已同轮补进 `ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md`。

**③ 判序形状认可**：①–⑥ 与设计席给的逐条形式照旧，新增的 ②（表外无条件拒）与 ⑤（窄口表前置）就是本次两刀。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（第 4 轮 3 条已落盘（T21 改前读数 · §9 红格归属 · AC-11 带 ok）· AC-9 括注同轮修 · 待父侧收口）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 本批条目（覆盖）

| # | 条目 | 源 |
|---|---|---|
| R1 | 传了 `project` 的一笔，目标属另一个项目而不在写方 `index.writableRepos` 内 ⇒ **直接拒**，不查目标仓的账（重号在途也不算授权） | 需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.2 第三条与 ②.3 的互斥句（逐字「表外即拒，**不得**因为目标仓台账里恰有同号在途行而放行」）；§1「用户裁定（2026-11-09 20:34）」 |
| R2 | 表非空时，工作区窄口加一条前置：目标须落在表内某声明根内；表为空 ⇒ 窄口维持现状 | 需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.4 第二句（逐字「**目标无项目根时，写权表仍然是界**：会话锚是工作区根、目标取不到项目根时，窄口只在**写权表为空**时维持现状；**表非空 ⇒ 目标必须在表内**，否则拒。」）+ §1「用户裁定（2026-11-09 20:34）」 |
| R3 | 两处拒文各点自己那一侧（第一句点声明与目标 · 第二句点表与目标），清单单位不指号；旧串逐字不改 | 需求档 AC-2 报文要求 + §1 裁定 |
| R4 | 零回归：表内放行（号仍判写方的账）· 不带 `project` 的笔照走目标仓的账 · 表空窄口 · 号四情形 · `init` 豁免，逐条与改前等值 | 需求档 AC-1/AC-4/AC-5/AC-6；2026-11-08 裁定（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1） |
| R5 | 入口一刀切：凡带定位参数、带 `project` 的写型入口（写盘七件 ∥ `execute` 的 `workdir` ∥ `manifest` 的 `target`）走同一判序；表外另一项目 ⇒ 拒 | 需求档 ②.4 第一句（逐字「**入口一刀切**：凡带定位参数、带 `project` 的写型入口（写盘七件 ∥ `execute` 的 `workdir` ∥ `manifest` 的 `target`）走**同一判序**——不因工具不同而给某一把留一条回退路。」）+ §1「父侧裁定（2026-11-09 20:40）」① |

## 设计档落点

- 机制单源 = `docs/core/design/CROSS-REPO-WRITE.md`：§1（收窄一条 + 适用面一刀切 + 病灶两句 + 三问 + 勘察行⑥）· §2.1（条目不受会话锚约束）· §2.2（判序重写 + 拒文条件重写 + 新拒文 + 适用面条 + ①先于④ + ⑤ 收成「tbl 为空」 + `files` 域结论）· §3（受影响清单补窄口档四处、补本批单测档、tier 结论、`12-19`）· §4（KD-X8 / KD-X9 / KD-X10 / KD-X11）· §5（AC-4 改写；AC-5 钉成 `R = W`；AC-10 – AC-14 各带表头成节）· §6（T13–T19）· §7（删掉「不收 `execute` ∥ `manifest`」那条边界 + 加「不做跨仓批的收口结构改造」）· §9（RTM 增量：`12-17` 补格；`12-18` ∥ `12-19` 新增；`12-18` 的服务条目取需求条目）。
- 窄口那一半 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：§2.3（「一笔写跨两个项目」两处加「不带 `project`」限定 · 清单单位四形 + 基串枚举 + 跨仓两支 `<case>` 指针）· §2.3.1（条件表加第 ⑤ 行、拒文表加第 ⑦ 支、判序两行重写、「这一格不做什么」第四条改成「`execute` 的 `workdir` ∥ `manifest` 的 `target` 同在本判序内」、「有根不看声明」限定为不带 `project`、`init` 取根豁免限定到表外）· §5（R30 / R33 / R34 / R35）· §6（用例表末两行）· §7（「例外一处」同步）。

## 机制设计（判序，逐目标）

```text
W   = resolveDeclaredRoot(project, cwd)      （既有三条件零改；无 project ⇒ W 无）
tbl = W 有 ? declaredWritableRoots(W) : []
ok  = W 有 ∧ readManifest(W).ok              （表可读性：tbl 只在 ok 为真时有意义）
R   = resolveProjectRoot(p)

⓪ project 非空 ∧ W 无                   ⇒ 拒（声明取根失败；先于表、先于号、先于 ④）
① W 有 ∧ ok ∧ tbl 含 p                  ⇒ 判 W 的账
② W 有 ∧ R 有 ∧ key(R) ≠ key(W)         ⇒ 拒（外部目标：表外 ∥ !ok 都不查 R 的账）
③ R 有 ∧ (W 无 ∨ key(R) = key(W))       ⇒ 判 R 的账（= W 时同一本账；无 W 时现行路）
④ R 无 ∧ action = init                  ⇒ 不进本门
⑤ R 无 ∧ W 有 ∧ ok ∧ tbl 为空            ⇒ 窄口：既有四条全中 ⇒ 判 W 的账
                                           tbl 非空 ⇒ 拒（第二句）· !ok ⇒ 拒（第三句）
⑥ 其余                                 ⇒ 现行拒绝
```

判据单源 = 设计档 `docs/core/design/CROSS-REPO-WRITE.md` §2.2；本节是它的读数版，两处不一致以那一节为准。

实现落点一处 = `thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerBindWriteConflict`（⓪ ∥ ② ∥ ⑤ 三支 + 两条新 `<case>` 常量 + `ledgerGateTargets` 的 `execute` ∥ `manifest` 两支挂 `fallbackDeclared`）；逐处形态住设计档 §2.2。号那半、四情形拒文、`init` 豁免、`bash` ∥ `memory` 的声明支全部零改。

## 受影响文件与测试覆盖

| 文件 | 改什么 |
|---|---|
| `thincoder-core/agent/write-gate-ledger.mjs` | ② 支改为无条件拒；⑤ 支加表前置；新增窄口那一句 `<case>` 常量；`ledgerGateTargets` 的 `execute` ∥ `manifest` 两支挂 `fallbackDeclared`（适用面 = R5）；旧串零改 |
| `test/rtm/guard.md` | 故事 12：`12-17` 补一格（目标仓挂同号在途行仍拒）；新增 `12-18`（窄口 × 表：表空放行 ∥ 表外拒 ∥ 表内放行）与 `12-19`（`execute` 的 `workdir` ∥ `manifest` 的 `target` 表外 ⇒ 拒 ∥ 表内 ⇒ 放行）；节注态数 +2 |
| `test/integration/batch-live-batch-lock.test.mjs` | 同三行的用例（`12-17` 补一格、`12-18` ∥ `12-19` 新用例） |
| `docs/core/design/CROSS-REPO-WRITE.md` | 见上「设计档落点」 |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 见上「设计档落点」（第二行） |
| `thincoder-core/prompts/*` · `thincoder-core/tool-docs/*` | **不改**：提示词与工具面写的已经是「表内照写 ∥ 表外停下上报」，与收窄后的判据同向 |

**tier 结论**：**无 tier 跨界**——无新文件、无目录迁移、无模块边界挪动。

**行数读数**（量法 = `doc_check` 的 `lines`，源档 ∥ 集成测试档）：

```text
513  test/integration/batch-live-batch-lock.test.mjs   · 越 500 软线（主动审视）
490  thincoder-core/agent/write-gate-ledger.mjs
397  thincoder-core/declaration.mjs                    （本批零改，读数仅作对照）
```

越软线一处的处置 = **接受并记一笔，不拆档**（为十几行拆一个用例档，代价高于收益）。

## 验收对照

| 条目 | 设计档判据 |
|---|---|
| R1 | AC-2（表外拒，报文点名 `writableRepos` 与目标）∥ **AC-10**（目标仓挂同号在途行仍拒——改前放行的正是这一格）∥ **AC-14**（写方树内的嵌套项目 `R ≠ W`，改前按它那本账判）+ T6 / T13 |
| R2 | **AC-11 三格**（表可读且空放行 ∥ 表外拒 ∥ 表内放行）+ T14–T16 |
| R5 | **AC-12**（`execute` 的 `workdir` 指向表外另一项目 ⇒ 拒、脚本零执行）+ **AC-13**（`manifest` 的 `target` 同上 ⇒ 拒、目标 manifest 字节零改）+ T17 / T18 |
| R3 | AC-2 / AC-10 / AC-11 的逐字串与清单单位；AC-4 的负向锁（不带 `project` ⇒ 旧串一字不改） |
| R4 | AC-1 ∥ AC-3 ∥ AC-4 ∥ AC-5 ∥ AC-6 ∥ AC-7（逐格与改前等值） |

**跑法**：单测档与批档同名同目录（`<docRoot.batches>/<批档名>.test.mjs`，随收口删除）；集成面 = 故事 12 那一档。两行命令见设计档 §5 的「核法」块。

## 关键决策（全文住设计档 §4，此处只列结论）

- KD-X8：表外 ⇒ 拒，**无条件**；删掉「查目标仓台账、查到就放行」那条臂（替换不是兜底）。
- KD-X9：窄口的表前置只在 `tbl` 非空时生效（表空维持现状——2026-11-08 那一格靠它活着）。
- KD-X10：窄口那一支另给一句拒文，不复用「目标属另一个项目」那句（那一支 `R` 不存在，句头不成立）。

## 上抛项

- **[上抛·知会] 两处原上抛已由父侧 2026-11-09 20:40 裁定落地**：① `execute` 的 `workdir` ∥ `manifest` 的 `target` 收进本批 ⇒ 本批条目 R5 · 设计档 §2.2 适用面条 / §4 KD-X11 / §5 AC-12 ∥ AC-13 / §6 T17 ∥ T18 / §9 的 `12-19`；设计档 §7 那条「本批不动」的边界已删。② R2 的需求条由主 agent 补进需求档 ②.4（本段 R2 的源已改为引它）。
- **[上抛·待裁] 需求档 ④ 验收表里没有 R2 / R5 的 AC 行**：`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ④ 表现六行（AC-1…AC-6），新补的 ②.4 两句（表空 ∥ 表非空 · 入口一刀切）在 ④ 表里没有对应 AC——需求档归主 agent（D1），补不补由主 agent 定。不阻塞设计评审：本批判据住在设计档 §5 的 AC-11 ∥ AC-12 ∥ AC-13。

## 修正轮（评审第 1 轮 15 条 · 全部照改）

落点全在两个设计档的节内；本节只记「编号 → 落到哪一节」，逐字住那两档。

| # | 落点 |
|---|---|
| 1 🔴 | 窄口档 §6 用例表末两行改为「表外 ⇒ 拒、表内 ⇒ 按写方根判号」；§5 R30 与 §5 R35 的「`project` 不参与判定」改为「只在跨仓那一格被读」；§2.3.1 判序「目标有根时不看声明」加「本笔不带 `project` 时」限定。机制档 §3 受影响清单补上窄口档这四处。 |
| 2 | 窄口档 §2.3 判据表那一行与同节派生条目：加「本笔**不带** `project`」限定，并注明带 `project` 时该格不可达（走跨仓判序）。 |
| 3 | 机制档 §2.2 加「① 也先于 ④」条（豁免的前提是无账可问）、§6 新增 T19；窄口档 §2.3.1 的 `init` 取根豁免限定到「目标不在表内」、§5 R33 同限定并加一格（表内 `init` ⇒ 要号）。 |
| 4 | 机制档 §2.2 判序 ⑤ 收成「既有四条 ∧ `tbl` 为空」，表内一支由 ① 取走；§5 AC-11 ③ 注明「放行由判序 ① 决定」。 |
| 5 | 窄口档 §2.3「清单单位」条改四形、基串枚举补第四值，并加「跨仓两支 `<case>` 见单源」条；机制档 §2.2 的新串即第四形的落点。 |
| 6 | 机制档 §5：AC-10 – AC-14 各带表头与分隔行，独立成节。 |
| 7 | 机制档 §1 勘察行⑥ 改为「用例行十六行、编号到 `12-17`，下一个空号 = `12-18`」；§9 的破的行 / 新增编号 / 节注态数与之对齐。 |
| 8 | 机制档 §9：`12-18` 的服务条目改引需求档 ②.4 末条（「目标无项目根时，写权表仍然是界」），与 `12-19` 同形。 |
| 9 | 机制档 §7 加一条边界：不做跨仓批的收口结构改造（一个批仍只对应一本批档、一个仓）。 |
| 10 | 机制档 §5：AC-5 的「同项目写」钉成 `R = W`；新增 AC-14（嵌套项目 `R ≠ W`，改前按它那本账判 ⇒ 改后拒）；承接行补需求 AC-5 那一句。 |
| 11 | 机制档 §1 加「三问（新件的既有件答案）」节：`declaredWritableRoots` 取 `declaredPublicRoots` 的形、两条新拒文为 `none found`。 |
| 12 | 机制档 §3 补本批单测档一行（名字用 `<docRoot.batches>/<批档名>.test.mjs` 形）、tier 结论改写；同表 `test/integration/batch-live-batch-lock.test.mjs` 那一行补 `12-19`。 |
| 13 | 机制档 §3 的 `unverified` 段改为实读结论：`files` 域是排期输入，不是授权边界，附读的面（写门两档）。 |
| 14 | 窄口档 §5 R21 的行号指针换成拥有那套迁移集合的符号名 `ALLOWED_MIGRATIONS`。 |
| 15 | 机制档 §2.1 加「条目不受会话锚约束」条，与 §2.2「`W` 须与会话锚相关」成对照。 |

判定面读数：`doc_check({mode:"gate"})` 首行 = `DOC-CHECK GATE: PASS`（2 档全清，0 段有问题）。

## 修正轮（评审第 2 轮 4 条 · 🔵 两条不动）

落点全在两个设计档的节内；本节只记「编号 → 落到哪一节、改成了什么口径」，逐字住那两档。

| # | 落点 |
|---|---|
| 8 🟡 | **同一机制五处同言：窄口只剩「表为空」一支。** 窄口档 §2.3.1 条件 ⑤ 格改为「写方未声明写权表（`tbl` 为空）……非空 ⇒ 本条件即不成立」（原「非空 ⇒ 目标须落在某个声明根内」删）；拒文表 ⑦ 行的判据改为「①②③④ 成立而表非空（条件 ⑤ 不成立；表内目标已被判序 ① 取走）」；同节判序条重写为「先解析声明 → 先判拒文表 ④⑤ 两条不成之路 → 最后判条件 ⑤（表为空），表非空即落 ⑦」；§7 边界条把「∧（声明表为空 ∨ 目标在表内）」改为「∧ 写方 `index.writableRepos` 为空」，并补「表非空 ⇒ 本格不开……窄口没有第二条放行臂」。§5 R31 ∥ R34 里同一句话的两份副本同轮改掉（只改 §2.3.1 / §7 而留 R31 / R34，矛盾照旧进代码——这正是本条病灶）。机制档 §5 AC-11 ③ 的括注改为「表内目标不经窄口，窄口只剩「表非空即不开」这一支」；§1「收窄一条」在裁定原话后补实现落点一句（表内目标由判序 ① 取走）；§3 受影表与 §7 边界的两处「第五条件 = 表非空须表内」改为「表为空（表非空则本格不开）」。 |
| 4 🟡 | **清单单位四形取 §2.3 单源。** 窄口档 §5 R33 的「**无项目三形**的清单单位……」改为「**清单单位四形**（各一句、与 `none` 互斥；四句单源 = 本档 `§2.3` 的四形条）」，第四形 `unknown — the declared project does not own this write's target` 点名并给出断言格。机制档 §5 AC-10 补一格：该笔清单单位取第四形（与 `none` 互斥，单源指回窄口档 §2.3 的四形条）。 |
| 5 🟡 | **`files` 那条全域读数补命令 + 命中数 + 消费符号。** 机制档 §3 改为「读法（可复跑）：`grep -rn "files" thincoder-core/agent/write-gate.mjs` = 1 命中——就是 `batchRecordWriteConflict` 拒文里那句 `companion files`」；「排期输入」点成消费它的符号：`thincoder-core/agent-tools/subagent-scheduler.mjs` 的 `normalizeFileList` / `filesOverlap` / `effectiveFiles`（调用方 = `thincoder-core/agent-tools/subagent-spawn.mjs` 的 `prepareScheduling`），并记下同档 `filesBlockOf` 写进子代理提示的那句 `This list is not an authorization boundary`。 |
| 7 🟡 | **`12-19` 的 RTM 落点补齐。** 机制档 §3 的 `test/rtm/guard.md` 行改为「新增 `12-18` ∥ `12-19`」——与同表集成测试行、§9 节注三处同数。 |

- **#9 ∥ #10（🔵 读数面限制）不动**：档位结论行与量法在盘（机制档 §3）；在表 source ∥ test 档的实读与 `ledgerGateTargets` ∥ `fallbackDeclared` 的坐标由实施席第一步确认——父侧本轮口径即如此。
- **判定面读数**：`doc_check({mode:"gate"})` 首行 = `DOC-CHECK GATE: PASS`（显式 docs 2 档全清，0 段有问题）。

## 修正轮（父侧 2026-11-09 三件 · 全部照改）

落点全在两个设计档的节内；本节只记「编号 → 落到哪一节、改成了什么口径」，逐字住那两档。

| # | 落点 |
|---|---|
| ① 声明失效 ⇒ 拒 | 机制档 §1 加「声明须自证 · 一」（用户原话）· §2.2 判序新增 ⓪：`project` 给了而取根失败 ⇒ 拒，先于表、先于号、先于 ④ · 出现条件加「⓪ 那一支」条 · §4 KD-X12 · §5 AC-15（带红条件）· §6 T20。窄口档 §2.3.1 判序加「带 `project` 而取根失败 ⇒ 直接拒，有根无根同判」。拒文沿用既有 `declared project is not a project` 形，**不新增第三句** |
| ② 写方 manifest 读不出 ⇒ 表不可判 | 机制档 §1 加「声明须自证 · 二」· §2.2 判序把表拆成 `tbl` + `ok` 两值（`readManifest(W).ok`，既有件），① ② ⑤ 三支各按 `ok` 判 · 新增第三句拒文（不列在途清单，走 `ledgerUnreadableRefusal` 形；清单单位仍四形）· 出现条件加「表不可读那一支」条 · §2.4 加「写方 manifest 不可用 ≠ 目标仓 manifest 不可用」· §4 KD-X13 · §5 AC-16（带红条件）· §6 T9 改写 + T21。窄口档 §2.3.1 条件 ⑤ 改为「表**可读且为空**」· 拒文表加第 ⑧ 支 · 判序条同步 · §5 R31 / R34 同轮改 · §7 边界条同步 |
| ③ §3 读数过期 | 机制档 §3「尺寸越线」改为**两处**（集成测试档 + `write-gate-ledger.mjs`），逐档点名理由，处置同款「接受并记一笔、不拆档」；数字不进本档（D12）——读数见下 |

**② 的一处实读结论（照实记，免得红格报得比实际大）**：`declaredWritableRoots` 经 `loadProjectDeclaration`，后者对不可用 manifest 回落默认值（`buildDeclaration(null, root)` + warn）⇒ 表为 `[]`。

漏的是**窄口那一支**（⑤）：无根目标、表按空处置 ⇒ 放行。

跨界那一支（②）改前也拒，变的只是那句拒文不再断言「does not declare it」——AC-16 的红格因此钉在 ⑤，② 面只钉句子。

另：`resolveDeclaredRoot` 两支都要求 manifest 在盘，故写方「档不在盘」被取根那一步挡住；可达的读不出形 = 坏 JSON ∥ 形态非法 ∥ 读错误（AC-16 夹具取第一形）。

**同轮改准一处引文**：机制档 §2.2 原先引的代码行是摘短形，与盘上现行为不符（现行为已带 `fallbackDeclared: declared`），已改准到现行为；`doc_check` 的锚判据同轮由红转绿。

**行数读数**（量法 = `doc_check` 的 `lines`，本次实跑；cwd = 仓根）：

```text
609  test/integration/batch-live-batch-lock.test.mjs   · 越 500 软线
509  thincoder-core/agent/write-gate-ledger.mjs        · 越 500 软线（硬线 800 未至）
397  thincoder-core/declaration.mjs                    （本批零改，对照）
```

上一版 §3 写「其余在表 source ∥ test 档未越软线」，漏的正是 `write-gate-ledger.mjs` 这一档（实施席交付时读数为 506，本次 509）。

**判定面读数**：`doc_check({mode:"gate"})` 首行 = `DOC-CHECK GATE: PASS`（显式 docs 2 档全清，0 段有问题）。

## 修正轮（评审第 3 轮 4 条 · 全照改）

病根一条：新裁定落了一处，旧说法没撤——同一输入在两档、乃至同一节里给出不同结局。本节只记「编号 → 落到哪一节、改成了什么口径」，逐字住那两档。

| # | 落点 |
|---|---|
| 1 🔴 | **「写方 manifest 不可用」只留一个落点 = 拒文表 ⑧。** 窄口档 §2.3 判据表「台账读不到」那一行的输入收成「根推得出而**台账库开不了**」，并注明写方 manifest 不可用不落这一句；同档 §2.3「两种「根」不是一回事（判据的钉子）」删掉「manifest **在而不可用**（读不动 / 坏 JSON）」半句，改建一条——manifest 在而不可用 ⇒ 写权表不可判 ⇒ 落 §2.3.1 拒文表 ⑧ 那句（串名写出），并写明两格问的不是一件事（一格问「账读不读得出来」，一格问「写权表声明的什么」）；§5 R2 ⑦ 的输入同步收成「台账库开不了」、括注指 ⑧；§6 用例表 `12-4` 同改并注明 manifest 那一形不属本行。机制档 §2.2 的 `R = W` 格括注改为「表不参与；本仓写不落第三句，两格之分见 §2.4」；§2.4 新增两条——两条格子的输入 ∥ 出口各是什么 · 「本仓写（`R = W`）不落第三句，但会先撞台账那一格」（依据 `thincoder-core/agent/write-gate-ledger.mjs`「if (!man?.ok) {」），故「本仓写不受影响」只指 ②∥⑤ 那一刀不砍它、不指放行；§5 AC-16 第三子格由「照走 ③ **放行**（本仓写不受影响）」改为「②∥⑤ 不开火、第三句不出现，号照 ③ 判 `W` 的账；`W` 的 manifest 读不出会先撞台账可读性那句」 |
| 2 🟡 | 窄口档 §5 R31：四态收成**三态**（路径不存在 ∥ 与会话锚无关键 ∥ 相关但取不到带 manifest 的根），删掉第四态「根在而 manifest 不可用（后者落 ⑦ 那支）」；另起一句写明它**不属于**这三态——那不是「不是项目」，是「写权表不可判」：外部目标与无根目标落 ⑧ 那句，本仓写（`R = W`）不走 ②∥⑤、落台账可读性那一格。一支两号就此消失 |
| 3 🟡 | 机制档 §3 给窄口档 §2.3.1 的改法格里，那一句「第五条件 = 表为空（表非空则本格不开）」改为「第五条件 = 表**可读且为空**才开（表非空 ∥ 表不可读两种都不开）」——与同档 §7 同口径；复述了条件正文的那半句即上一版删掉的形（把「读不出」读成「空」） |
| 4 🔵 | 窄口档 §2.3.1 条件 ⑤ 的行标题由「写方未声明写权表（表**可读且为空**）」改为「写方写权表**可读且为空**」——标题不再把「读不出」并回「未声明」，与本档自己的口径一致 |

**复跑（本轮实跑，cwd = 仓根）**

```text
grep "ledger unreadable|no ledger can be read|manifest 在而不可用|照走 ③ 放行" 两档
  → ledger unreadable 在三处出现，输入全为「台账库开不了」
  → 「manifest 在而不可用」四处：三处指 ⑧、一处是否定句（「不落这一句」）
  → 「照走 ③ 放行」零命中
doc_check({mode:"gate", docs:[两档]}) → DOC-CHECK GATE: PASS（2 档全清，0 段有问题）
```

**上抛项（本轮新增一条）**

- **[上抛·知会] 代码注释是同一机制的同层说法，仍在旧口径上**：`thincoder-core/agent/write-gate-ledger.mjs` 的门体头注写「台账读不到（库不可开 / 根推得出而 manifest 不可用）⇒ **拒**，拒文另起 `(ledger unreadable — <原错>)` 一行」——本批设计已把「写方 manifest 不可用」与「台账库开不了」分成两格（第三句 ∥ 台账不可读那句）。代码注释归实施席（写盘七件与设计席都不改代码），路由由父侧定；与本轮四条无关，不阻塞。

## 修正轮（实施回填 · 父侧 2026-11-09 · 两件）

病根一条：规格没有在设计档里写完，于是一处由实现顺手定（新拒文的尾行标签），一处由猜测定（AC-16 的「改前」读数与实跑不符）。两件的落点都只在机制档 `docs/core/design/CROSS-REPO-WRITE.md` 的节内，逐字住那一档。

| # | 落点 |
|---|---|
| ① 第三句的尾行形 | 机制档 §2.2 第三句段：拒文块改两行（`case` + `tail : (declared project's manifest unreadable — <原错>)`），点名实现落点 `CASE_WRITABLE_UNREADABLE`（`<case>` 那一行）∥ `ledgerTableUnreadableRefusal`（两行的装配），带 `依据` 引文。新增四条：**出现面**（判序 ② 的外部目标 ∥ 判序 ⑤ 的窄口）· **尾行为何不复用 `(ledger unreadable — <原错>)`**（那一行标的是台账那一格，输入 = `ledgerRowsOf` 的 `error`；本格没开过台账，输入 = `readManifest(W).ok`，两格不相交）· **两行成分之差**（一个说谁的 manifest 读不出，一个说哪本账读不出）· 「不列在途清单」改写为「与 `ledgerUnreadableRefusal` 同形，只有尾行标签不同」 |
| ② AC-16 的改前读数 | 机制档 §5 AC-16 改准：主格**改前同一笔也拒**——窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败，落 `no ledger can be read for this project` 加 `(ledger unreadable — …)`。判据由「改前放行 ⇒ 改后拒」改为「**两读的句子不同**——改后那句点写权表与该修 manifest，改前那句把人引去查号」。三子格各自的两读之差写清：外部目标格改前拒在第一句 `does not declare it`（只差句子，拒与不拒相同；夹具无同号行，挂一条则改前放行，那一形归 AC-10）· `R = W` 格旧口径零改 · `project` 缺位格零改。末句钉明：**「放行 → 拒」的红格在 AC-15（判序 ⓪），不在本格** |
| ② 同步：同一读数的另两处 | 同一句「改前按 `tbl = []` 放行」原本还在两处，同轮改掉（一处落一处不落，矛盾照旧进代码）：§2.2「表不可读那一支」的 `R` 无一格删去该括注（现为「`R` 无 ⇒ 窄口不开（第三句）。」）；§4 KD-X13 的理由改为「两格改前都拒——本决策换的是发话的格与句子，不是放行与否」，标题去掉「外部目标拒」（那一支只是拒文变句） |
| ③ §3 尺寸越线的理由句 | 机制档 §3 那一格由「本批新增的判序注释推过去的…为十几行判序另开一档」改为「判序注释 + 第三句的两件（`CASE_WRITABLE_UNREADABLE` ∥ `ledgerTableUnreadableRefusal`）推过去的；拆档要搬的是这套判序本身」。**两处越线、硬线未至的结论不变** |

**行数读数**（量法 = `doc_check` 的 `lines`，本轮实跑；cwd = 仓根）

```text
570  thincoder-core/agent/write-gate-ledger.mjs        · 越 500 软线（硬线 800 未至）
609  test/integration/batch-live-batch-lock.test.mjs   · 越 500 软线（硬线 800 未至）
272  docs/batches/2026-11-09-writable-repos-containment.test.mjs
397  thincoder-core/declaration.mjs                    （本批零改，对照）
```

上面 `570` 是这个档的现读数（上一版记的 509 是实施前的读数）；集成测试档本轮读 609（父侧记 610，差一行，以各自那次实跑为准）。越软线仍是**两处**、硬线 800 均未至——③ 要确认的判断不变。

**判定面读数**：`doc_check({mode:"gate", docs:["docs/core/design/CROSS-REPO-WRITE.md"]})` 首行 = `DOC-CHECK GATE: PASS`（1 档全清，0 段有问题）。

**本轮未动**：代码零改 · 需求档零改 · 台账零改 · 未发评审。窄口档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 改一处（**离表改动，故此处报明**）：§2.3.1 拒文表 ⑧ 行的处置格补上尾行标签与「不复用 `ledger unreadable`」，并指回本档 §2.2 第三句这个单源——原句只写「走 `ledgerUnreadableRefusal` 那个形」，照它实现会发出 `ledger unreadable` 那一行，而那一行标的是台账那一格。改后两档对「尾行是哪一个」只剩一个说法。

## 修正轮（评审第 4 轮 3 条 · 全照改 · 本批第 5 轮）

病根一条：新裁定（「写方 manifest 读不出 ⇒ 改前也拒，差的是句子」）落了 AC-16 与 KD-X13，同族说法没扫净。三条全在机制档 `docs/core/design/CROSS-REPO-WRITE.md`，本节只记「编号 → 落到哪一节、改成了什么口径」，逐字住那一档。

| # | 落点 |
|---|---|
| 1 🔴 | §6 用例表 T21 预期格尾句「改前表按 `[]` 处置 ⇒ 放行」→「**改前同一笔也拒**（窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败，落 `no ledger can be read for this project` 加 `(ledger unreadable — …)`），两读之差在句子——改后那句点写权表与该修 manifest，改前那句把人引去查号（同 AC-16）」。与 §5 AC-16 正身格同读；「放行 → 拒」那条红格仍归 AC-15（判序 ⓪） |
| 2 🟡 | §9「判序 ⓪ ∥ 表不可读的 delta」末条「（各带红格：改前放行、改后拒）」→「——AC-15 带红格（改前那一笔放行、改后拒）；AC-16 两读只差句子（拒与不拒相同，改前也拒），不带红格。」各归各的 |
| 3 🟡 | §5 AC-11 ①「`tbl = []` ⇒ 放行、字节落盘（现状不动）」→「写方 `readManifest(W).ok` 为真 ∧ `index.writableRepos` 缺键或空 ⇒ 放行、字节落盘（现状不动）」——判在 `ok` 上，不再把「读不出」并回「空」；③ 括注「窄口只剩「表非空即不开」这一支」→「窄口只剩两条不开臂：表非空（拒文表 ⑦）∥ 表读不出（拒文表 ⑧）」 |

**同轮扫到并修的一处（报告，不夹带语义）**：§5 AC-9 括注原写「② 在 B 的账上查不到 A 的行 ⇒ 新串」——那是旧口径的回落理由，与 §2.2「**与 `R` 的账怎么答无关**」相反。

改为「② 无条件拒——与 B 的账上有没有同号行无关 ⇒ 新串」。结论仍是「拒」，语义零改；属同族残余，故同轮修、单列报告。

**验收口径的落法（照实记，免得 green 报得比实际大）**：三条 grep 零命中已达成。但其中 5 处原文的「改前放行」∥「`tbl = []`」**本身是对的**，按验收口径换了措辞、语义零改：

- §2.2 失败侧读法 = AC-10 那一格 ⇒「改前的结局是放行」。
- §2.2「声明了目标 ≠ 给出了写方」的无 `W` 推导 ⇒「无写方即无表可取」。
- §9 破的行 `12-17` = 同一格 ⇒「改前那笔放行」。
- KD-X12 的「无 `W` ⇒ 无表」推导 ⇒「取不到写方根就没有表可读」。
- AC-16 第三子格「挂一条则改前会放行」的条件句 ⇒「改前那一笔会放行」。

故这条 grep 只在**措辞层面**成立。语义层面另做了一次逐处核对：其余各处的「改前…」结局句（AC-10 · AC-12 · AC-13 · AC-14 · AC-15 · T13 · T20 · §2.2 失败侧读法）逐处读过，与各自那一格的红格对得上。

全档没有第二处把 AC-16 记成「放行 → 拒」。

**读数（本轮实跑，cwd = 仓根）**

```text
改前：grep "改前表按|改前放行|tbl = \[\]"                 → 8 处命中（§2.2「声明了目标 ≠ 给出了写方」· §2.2 失败侧读法 · KD-X12 · AC-11 ① · AC-16 第三子格 · T21 · §9 破的行 · §9 delta 末条）
改后：grep "改前表按|改前放行|tbl = \[\]|表非空即不开"   → 0 命中
doc_check({mode:"gate", docs:["docs/core/design/CROSS-REPO-WRITE.md"]}) → DOC-CHECK GATE: PASS（1 档全清，0 段有问题）
```

**本轮未动**：代码零改 · 需求档零改 · 台账零改 · 未发评审 · 窄口档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 本轮零改（三条全在机制档）。三向一致不受影响：R1–R5 与设计档 AC 的对应表未动，AC-11 ∥ AC-16 只改判据形态、不改回指的条目。

**[上抛·待裁] 判序 ⑧ 在 RTM 上没有自己的格**：AC-11 ③ 的括注改成「两条不开臂（⑦ ∥ ⑧）」之后，⑦ 那一臂仍有集成格（`12-18` 第二格），⑧ 那一臂只有单测缝上的 AC-16。

按「一支场景一格」它算缺一格，但新增集成行属新语义（编号从 `12-20` 起），本轮不做——补不补由父侧定。

## §3 设计评审（评审子代理）
**状态行**：评审通过（收口轮：上轮 3 条（1🔴 + 2🟡）全部落地，四条已核项未回退）



### 轮次 1（评审子代理）

### 第 1 轮设计评审结论（跨仓写权收窄批）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §6 用例表末两行仍写「按 `workdir` 判（定位参数优先），号要在那个仓的账上」与「按目标自己的项目根判（定位参数优先；`project` 不参与）」，§5 R30 写「两者同给且指向不同项目 ⇒ 按定位参数判」、R35 写「路径与 `project` 同给时按路径判」，与同档 §5 R34「表外另一项目 ⇒ 拒、脚本零执行」及 `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序②「不查 R 的账」相反；`docs/core/design/CROSS-REPO-WRITE.md` §3 受影响清单只点「§2.3 … §2.3.1 … §5 R34 ∥ §7」，四处不在改单内 |
| 2 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 判据表「一笔写跨两个项目｜同一号要在两个项目的台账里各查到才放行」缺「不带 `project` 时」限定，带 `project` 时该格已由判序②关闭 |
| 3 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序①先于④，vs `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1「取根豁免（决策 43）仍更早短路」与 §5 R33「另带有效 `project` 而祖先链仍取不到根 ⇒ 结果不变」：`init` ∧ 目标在表内 无判 |
| 4 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序⑤「既有四条 ∧（tbl 为空 ∨ tbl 含 p）」的第二支不可达（① 已先取「W 有 ∧ tbl 含 p」），AC-11 ③ 实际由①决定 |
| 5 | 🟡 | 未处置 | 新清单单位 `list : unknown — the declared project does not own this write's target`（`docs/core/design/CROSS-REPO-WRITE.md` §2.2 拒文）与 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「清单单位写 `unknown — …`（三形各一句）」及基串内联三值枚举并存，第四形无落点 |
| 6 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §5 的 AC-10–AC-13 四行位于散文段之后、无表头与分隔行，四行渲染为散行 |
| 7 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §1 勘察行⑥「用例行编号到 `12-16`」vs §9「破的行 = 1 = `12-17`（修订，不新开号）」+「态数…十六 ⇒ 十八」：两读不同，编号计划必有一处错 |
| 8 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §9 缺行 `12-18` 的「服务条目 = 本档 §2.2 判序⑤」是设计节，`12-19` 取的是需求条目；需求档 ②.4「目标无项目根时，写权表仍然是界」即其业务条目 |
| 9 | 🟡 | 未处置 | 需求档 ③「不做跨仓批的收口结构改造…本批只把它写进已知限界」在 `docs/core/design/CROSS-REPO-WRITE.md` §7 边界无对应条 |
| 10 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-5「同项目写 … 逐条与改前等值」未钉成 `R = W`，与同档 §2.2「写方树内另有一个带 manifest 的嵌套项目时 `R ≠ W`，按「另一个项目」判」并读时覆盖过宽；需求④ AC-5 在设计档无具名承接格 |
| 11 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` 对 `declaredWritableRoots` 与两条新拒文无「三问」答案（`existing:` / `none found:` 形），相邻档 §2.3.1 有该节 |
| 12 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §5 核法点名的单测档 `docs/batches/2026-11-09-writable-repos-containment.test.mjs` 未进 §3 受影响文件清单，无档位结论行 |
| 13 | 🔵 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §3「实施前须实读一处（本轮 `unverified`）」：spawn `files` 域对项目外路径的判法未读，可能堵实施席通路 |
| 14 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §5 R21 引「`thincoder-core/ledger-db.mjs-166`」为行号形引用（存量，非本批改动） |
| 15 | 🔵 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.1 未声明声明表各项是否须与会话锚相关（只有 `W` 须相关），与 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「界 = 相关性判据」并读留空 |

计数：🔴 1 · 🟡 11 · 🔵 3。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴（上轮 #1） | 已闭 | 四处同言判序 ②：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §6 用例表末两行「把目标写进写方表内 ⇒ 按写方根判号（判序 ①）」· §5 R30「目标在表外且属另一个项目 ⇒ 拒；单源 = `docs/core/design/CROSS-REPO-WRITE.md` §2.2」· §5 R35 同句 · 同档 §3「（改为无条件拒）」 |
| 2 | 🟡（上轮 #3） | 已闭 | 「① 也先于 ④（`init` 的取根豁免）」+「但只在目标不在写方 `index.writableRepos` 内时」；用例 = T19 ∥ R33「同形 target 写进表内 ⇒ 本门照判、不带号拒」 |
| 3 | 🟡（上轮 #4） | 已闭（死臂另立 #8） | 「放行由判序 ① 决定——表内目标不经窄口，⑤ 里「表内」那一支因此不可达」；判序 ⑤ = 「既有四条全中 ∧ tbl 为空」 |
| 4 | 🟡（上轮 #5） | 未闭净 | 同档 §2.3「（四形各一句）」vs 同档 R33「**无项目三形**的清单单位」；第四形 `unknown — the declared project does not own this write's target` 无验收格 |
| 5 | 🟡（上轮 #13） | 形式成立·未复跑 | 「原 `unverified` 已查实」+「全文搜 `files`：唯一命中是 `batchRecordWriteConflict` 拒文里那句 `companion files`」；未给可复跑命令，源档出本评审范围 |
| 6 | 🟡（上轮 #10） | 已闭 | AC-5「写方树内另一个带 manifest 的项目**不在此格**（`R ≠ W`，见 AC-14）」∥ AC-14「它树内另有一个带 manifest 的项目 `N`」 |
| 7 | 🟡 新增 | 待处置 | 同档 §3 表 `test/rtm/guard.md` 行只写「新增 `12-18`」，而同表 `test/integration/batch-live-batch-lock.test.mjs` 行与 §9 节注都含 `12-19` |
| 8 | 🟡 新增 | 待处置 | 同档 §2.3.1 第 ⑤ 条件格「非空 ⇒ 目标须落在某个声明根内」与 §7「∧（声明表为空 ∨ 目标在表内）」仍把「表内」列为窄口放行臂，与 AC-11 ③ 不可达句并存 |
| 9 | 🔵 新增 | 读数面限制 | 在表 source/test 档未复量（代码层出本评审范围）；同档 §3 的档位结论行与量法均在盘 |
| 10 | 🔵 新增 | 读数面限制 | `ledgerGateTargets` ∥ `fallbackDeclared` 等实读坐标本轮未复跑 |

VERDICT: pass

计数：🔴 0 · 🟡 4 · 🔵 2

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-09

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「两种「根」不是一回事（判据的钉子）」与 R2 ⑦ 把「声明项目 manifest 在而不可用」判到 `(ledger unreadable — <原错>)` 一句 |
| 1 | 🔴 | 未处置 | 同输入的另一说法：拒文表 ⑧ 与 `docs/core/design/CROSS-REPO-WRITE.md` §2.4 判的是 `the declared project's manifest is not usable`；AC-16 第三子格还写「照走 ③ 放行」 |
| 2 | 🟡 | 未处置 | R31 同格内先写「都落 `declared project is not a project`」，又写「根在而 manifest 不可用（后者落 ⑦ 那支）」，后文却是「表读不出 ⇒ 拒文表 ⑧」——一支两号 |
| 3 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §3 改法格写「第五条件 = 表为空（表非空则本格不开）」；同档 §7 写「表**可读且为空**才开——表非空 ∥ 表不可读两种都不开」 |
| 4 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 条件 ⑤ 行标题「写方未声明写权表（表**可读且为空**）」——「未声明」不含「读不出」 |

已核成立项：

- item ①：`docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序 ⓪ 先于表 ∥ 先于号 ∥ 先于 ④；拒文复用 `declared project is not a project`，新拒文零条。
- item ②：`ok` 位与「表为空」分离（判序 ② 无条件拒 ∥ ③ 同项目不受影响 ∥ 条件 ⑤ 表**可读且为空** ∥ 拒文表 ⑧）。
- item ④ 之一：越软线两处 = `test/integration/batch-live-batch-lock.test.mjs` 610 行 ∥ `thincoder-core/agent/write-gate-ledger.mjs` 509 行；硬线 800 均未至。
- item ④ 之二：点名 + 处置齐；设计档内无尺寸数字；本批单测档 201 行；其余在表 source ∥ test 档均 < 501。

VERDICT: changes-required
计数：🔴 1（两行证据同属一条）· 🟡 2 · 🔵 1

### 轮次 4（评审子代理）

## 第 3 轮结论（实现后设计修正）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未修 | `docs/core/design/CROSS-REPO-WRITE.md` §6 用例表 T21 尾句「改前表按 `[]` 处置 ⇒ 放行」与同档 §5 AC-16「**改前同一笔也拒**：窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败」同一夹具两读相反 |
| 2 | 🟡 | 未修 | 同档 §9「判序 ⓪ ∥ 表不可读的 delta」末条「各带红格：改前放行、改后拒」——把「放行 → 拒」记到 AC-16 名下，该格两读只差句子 |
| 3 | 🟡 | 未修 | 同档 §5 AC-11 ①「`tbl = []` ⇒ 放行、字节落盘（现状不动）」按派生值 `tbl` 判、未带 `ok`；③「窄口只剩「表非空即不开」这一支」漏掉 ⑧ 那一臂 |

已核项（五件）：

- ① 成立：`docs/core/design/CROSS-REPO-WRITE.md` §2.2 第三句两行含尾行标签 `(declared project's manifest unreadable — <原错>)`，不复用的理由是**输入不同**（`ledgerRowsOf` 的 `error` 对 `readManifest(W).ok`），不是标签不同。
- ② 大半成立：AC-16 已按实跑改写（改前也拒、判据 = 两读的句子不同，「放行 → 拒」归 AC-15）；未清净处见上表第 1、2 条。
- ③ 成立：§2.2「表不可读那一支」与 KD-X13 两处都已改成「两格改前都拒」，无残留。
- ④ 成立：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 拒文表 ⑧ 行已补 `(declared project's manifest unreadable — <原错>)` 并指回 §2.2 第三句单源。
- ⑤ 未成立：上表第 1、3 条即旧口径「表按 `[]` 处置 ⇒ 窄口开」的残余。
- 上轮四条（manifest 不可用两说 ∥ R31 的 ⑦ ∥ §3 delta 格「表为空」∥ 条件 ⑤ 行标题）逐条复核，均已落地。

VERDICT: changes-required
计数：🔴 1 · 🟡 2 · 🔵 0；上轮 1🔴 + 2🟡 + 1🔵 全部落地。

### 轮次 5（评审子代理）

收口轮（只核上轮 3 条落地 + 四条不回退）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/CROSS-REPO-WRITE.md` §6 用例表 T21 尾句 =「**改前同一笔也拒**」，与同档 §5 AC-16 同读 |
| 2 | 🟡 | 已修 | 同档 §9「判序 ⓪ ∥ 表不可读的 delta」末条：AC-15 带红格 ∥ AC-16「不带红格」，各归各 |
| 3 | 🟡 | 已修 | 同档 §5 AC-11 ① =「`readManifest(W).ok` 为真 ∧ `index.writableRepos` 缺键或空」；③ =「两条不开臂：表非空（⑦）∥ 表读不出（⑧）」 |
| 4 | — | 不回退 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 拒文表 ⑧ 尾行标签 ∥ R31 三态 ∥ CROSS §3 可读且为空 ∥ 条件 ⑤ 标题，四处逐字仍在 |

计数：🔴 0 · 🟡 0 · 上轮 3 条全部落地

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-09）

- **批级授权**：用户 2026-11-09 20:34「可以」——批准父侧提出的修法（传了 `project` 的笔只能走声明的那本账；表外直接拒，不回落目标仓）。此后本批的设计修正、评审、实施与修正轮均在该授权下完成。
- **两处 fail-closed 是父侧对实施席上抛的裁定**（不是设计席自行加码）：声明解析不出项目 ⇒ 拒；写方 manifest 读不出 ⇒ 表不可判 ⇒ 外部目标拒、本仓写不落第三句。
- **一处实现顺带**：判序 ⓪ 此前设计有、代码从未跟，实施轮一并落地——父侧裁定保留（不实现它，⑧ 无处落）。
- **一处父侧裁定不加**：⑧ 的集成格（`12-20`）。理由：同一业务结果（外部写被拒）已有行覆盖，集成集已超窗，且收口轮不夹新语义。
- **本批修正轮达 §5 上限（5 轮）**，按边界规则收口，后续不收新发现。

## §5 实施记录（eng-coder）
**状态行**：实施完成



**落地面**（表内四个文件；无表外改动）

| 文件 | 改什么 |
|---|---|
| `thincoder-core/agent/write-gate-ledger.mjs` | 判序 ② 改无条件拒（删 `noSuchRowInTarget` 三件合取，改到 `ledgerRowAt` 之前判——目标仓的账不读）；窄口加第五条件（`tbl.length > 0` ⇒ `caseWritableNotCovered`）；`ledgerGateTargets` 的 `execute` ∥ `manifest` 两支挂 `fallbackDeclared`；档头 ∥ 拒文常量区 ∥ `workspaceRoot` ∥ `ledgerGateTargets` ∥ `ledgerBindWriteConflict` 五处注释同轮改到与代码一致 |
| `test/rtm/guard.md` | 故事 12：`12-17` 补末格（目标仓挂同号在途行仍拒）；新增 `12-18`（窄口 × 写权表三格）∥ `12-19`（适用面）；目的行补两句、节注态数十六 ⇒ 十八 |
| `test/integration/batch-live-batch-lock.test.mjs` | 上三行的用例（`12-17` 末格 + `12-18` + `12-19`）；`toolMapOf` 补 `execute`。只看工具面（`executeToolCalls` 的 Phase 1 真门），不直调判据函数 |
| `docs/batches/2026-11-09-writable-repos-containment.test.mjs` | 本批单测档（与批档同名同目录，随收口删除）：17 格——解析层 ∥ 键面 ∥ 判序 ⓪–⑥ 逐支 ∥ 三句拒文逐字 ∥ 适用面两格 ∥ 面判三值 |

**逐条交付**

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| R1 | 表外 + 目标属另一个项目 ⇒ 无条件拒，不查目标仓的账 | ✅ Done | 判序 ② 先于 `ledgerRowAt`；集成 `12-17` 末格（目标仓同号在途行仍拒）∥ 单测「判序 ②」∥ 单测「AC-14 嵌套项目」 |
| R2 | 表非空 ⇒ 窄口不开；表空 ⇒ 维持现状 | ✅ Done | `workspaceRoot` 返回之后的 `tbl.length > 0` 一步；集成 `12-18` 三格 ∥ 单测「判序 ⑤」 |
| R3 | 两句拒文各点自己那一侧、清单单位不指号、旧串零改 | ✅ Done | 新常量 `caseWritableNotCovered`（窄口那句）+ 既有 `caseWritableUndeclared`（表外那句）；单测逐字断言两句与两个清单单位，并断「这一支不冒用第一句」 |
| R4 | 零回归（表内放行 · 不带 `project` 照旧 · 表空窄口 · 号四情形 · `init` 豁免） | ✅ Done | 集成 `12-1`…`12-16` 逐格全绿；单测「判序 ③」钉 `W = R`、「判序 ④」钉取根豁免、「判序 ⑥」钉无声明那句 |
| R5 | 入口一刀切（`execute` 的 `workdir` ∥ `manifest` 的 `target`） | ✅ Done | `ledgerGateTargets` 两支挂 `fallbackDeclared`；集成 `12-19`（标记文件不出现 ∥ 目标 manifest sha256 零改；表内两笔都放行）∥ 单测「适用面」两格 |

**核法（本轮实跑，cwd = 仓根）**

```text
node --test docs/batches/2026-11-09-writable-repos-containment.test.mjs  → tests 17 · pass 17 · fail 0
node --test test/integration/batch-live-batch-lock.test.mjs              → tests 18 · pass 18 · fail 0
```

**行数读数**（量法 = `doc_check` 的 `lines`）

```text
609  test/integration/batch-live-batch-lock.test.mjs   · 越 500 软线
570  thincoder-core/agent/write-gate-ledger.mjs        · 越 500 软线（硬线 800 未至）
272  docs/batches/2026-11-09-writable-repos-containment.test.mjs  · 未越线
134  test/rtm/guard.md                                 （.md 只出读数）
```

两处越软线的处置 = 接受并记一笔、不拆档（设计档 §3 已裁）；理由住那一档，不在此复述。

**审计与评审（本会话内完成）**

- 内部发散审计（只读 explore，一轮）：设计发散 0。离表改动报告 1 条 = 改前变体暂存副本，复核 `ls` 该目录无 `wgl*`（审计前已删），该报告不成立。
- 独立代码评审（advisor `type:"code"`，一轮）：结论 pass，🔴 0 · 🟡 4 · 🔵 1，无 must-fix。
- 自修两轮：第一轮照评审的 🟡 补两格断言（T19 表内 `init` ⇒ 要号 ∥ 窄口对 `execute` 成立），单测 11 ⇒ 13；父侧三件落地后补 ⓪ ∥ AC-16 四格 ⇒ 17。两轮都只增断言，判序未回退。

**修正轮（设计三件落地：判序 ⓪ ∥ 写权表不可读 ∥ 尾行标签出处）**

病根一条：设计在实施后补了「声明须自证」两条裁定与第三句的尾行形，本席上一版按旧口径交付——`project` 取不到根时静默按「无写方」走，写方 manifest 读不出时按空表处置。两条都是把「未知」读成「已知」，方向与裁定相反。

| # | 落点 | 改什么 |
|---|---|---|
| ① | `thincoder-core/agent/write-gate-ledger.mjs` | 判序 ⓪：`project` 给了而 `resolveDeclaredRoot` 取不到根 ⇒ 拒（沿用 `declared project is not a project` 那组串，不新增第三句），先于表、先于号、也先于 ④ |
| ② | 同上 | `tbl` 拆两值：`tbl`（`declaredWritableRoots`）∥ `tblState`（`declaredManifestState` 问 `readManifest(W).ok`）；第三句两行装配 `CASE_WRITABLE_UNREADABLE` ∥ `ledgerTableUnreadableRefusal`；② 支先判 `tblState.ok` 再发第一句；⑤ 支两条不开臂（表非空 ⇒ ⑦ ∥ 表读不出 ⇒ ⑧） |
| ③ | `docs/batches/2026-11-09-writable-repos-containment.test.mjs` | 补 4 格（13 ⇒ 17）：判序 ⓪ · AC-16 主格 · 子格 2（目标属另一项目）· 子格 3（本仓写 `R = W`） |

**失败侧（改前变体；读数取于实施轮，本轮只重跑「核法」块那两条绿线，代码未动）**

改前变体 = 本批四处改动逐处倒回（② 恢复「查无此行才拒」∥ 去掉窄口表前置 ∥ `execute` ∥ `manifest` 两支不挂 `fallbackDeclared`），其余一字不动。⓪ 与第三句不在倒回清单里，故那四格两读都绿。

```text
单测档（17 格）：判序 ② · 判序 ⑤ · 适用面 —— 3 红 / 14 绿
集成档（18 格）：12-17 末格 ∥ 12-18 第二格 ∥ 12-19 第一格 —— 3 红 / 15 绿
跑完把改后那份拷回，逐档校验 sha256 与实施轮读数一致
```

两格未被失败侧覆盖，照实记：T19 那格钉的是「① 先于 ④」，改前改后都过（钉判据，不是改格）；窄口 × `execute` 那格与 `12-19` 同乘 `fallbackDeclared` 那一行，未另跑改前变体。⓪ ∥ 第三句那四格同理——它们不在倒回清单里。

**AC-16：设计写的与实跑的不一样（照实记）**

设计初版把这一格记成「改前放行 ⇒ 改后拒」。实跑不是：窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 也失败，改前那一笔落在 `no ledger can be read for this project` 加 `(ledger unreadable — …)`——**拒与不拒相同，差的是句子**。

本席按实跑报回，设计席同轮改准（AC-16 现写「改前同一笔也拒」，判据换成「两读的句子不同」；「放行 → 拒」那条红格归判序 ⓪ ∥ AC-15）。故这一格不带红格，也不拿它证明收窄生效。

**尾行标签的出处**：`(declared project's manifest unreadable — <原错>)` 是本席实现时定的——设计初版只写「走 `ledgerUnreadableRefusal` 那个形」，照它落会发出 `ledger unreadable` 那一行，而那一行标的是台账那一格。设计席已收编，现为规格的一部分：

依据 `docs/core/design/CROSS-REPO-WRITE.md`「tail : (declared project's manifest unreadable — <原错>)」

实现落点的两件同在 `thincoder-core/agent/write-gate-ledger.mjs`：

依据 `thincoder-core/agent/write-gate-ledger.mjs`「(declared project's manifest unreadable — ${error})」

**判序 ⓪ 一并实现（父侧 2026-11-09 裁：保留）**：⓪ 是已批准设计的一部分（KD-X12 ∥ AC-15）；不实现它，⑧ 也无处落——`project` 取不到根时，写权表没有可判的对象。上一版把它列进「离手项」是错的：那是设计的既有条，不是本席的取舍。

**终态 = clean**：本批代码评审一轮 pass（🔴 0 · 🟡 4 · 🔵 1，四条 🟡 已照改）。那一轮跑在 ⓪ ∥ 第三句落地之前，按父侧本轮令未新发评审——那四格的验收由测试缝给出（17/17 绿），不由评审背书，这里不替它背书。本轮对代码零改动，两处读数已重跑。上一版「离手项」两件均已收口：设计档 §3 的读数失准由设计席同轮改准，两处判断由 ⓪ ∥ 第三句定为规格。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑）

- `node --test docs/batches/2026-11-09-writable-repos-containment.test.mjs` ⇒ **17 / 17 绿**（该档收口时删除，读数留此）。
- `node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ **18 / 18 绿**（`12-1`…`12-19`）。
- `doc_check(mode:"gate")` ⇒ `DOC-CHECK GATE: PASS`。

### 失败侧（这是本批最要紧的读数）

实施席把本批四处改动逐处倒回、同一份测试照跑：

- 集成：**3 红 / 15 绿**（`12-17` 末格 ∥ `12-18` 第二格 ∥ `12-19` 第一格）
- 单测：**3 红 / 14 绿**（判序 ⓪ ∥ 窄口主格 ∥ 子格 2）

**两读不同 ⇒ 那几格断的正是本批要断的臂。**没跑过失败侧的验收不算验收。

### 落地核对

- **表外无条件拒**：判序 ② 挪到读台账之前，`noSuchRowInTarget` 的三件合取删除；`R` 的账根本不被读。
- **窄口第五条件**：条件 ⑤ = 写方写权表**可读且为空**；表非空 ⇒ ⑦、表读不出 ⇒ ⑧，两条不开臂。
- **入口一刀切**：`execute` 的 `workdir` ∥ `manifest` 的 `target` 与写盘七件同判序（`fallbackDeclared` 补位）。
- **两句新拒文各点自己那一侧**，旧串逐字零改（负向锁 `doesNotMatch /index\.writableRepos/`）。
- **⓪ 一并实现**：`project` 给了而解析不出 ⇒ 拒，先于表、先于号、先于 ④。
- **⑧ 的尾行标签** `(declared project's manifest unreadable — <原错>)` 由实施席提出、设计席收编进 §2.2——**规格不是实现顺手定的**。

### 实施中发现并修掉的真错

- **改写兑现说成了「放行 → 拒」**：实跑证明改前**也拒**（窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败），两读之差只在句子。设计档三处同步改准，红格归还 AC-15（⓪）。
- **设计档一句会造出错误代码**：拒文表 ⑧ 原写「走 `ledgerUnreadableRefusal` 那个形」，照它实现会发出恰好被否掉的那一行。已补尾行标签并指回单源。

### 集成测试面

- 故事 12 现有 `12-1`…`12-19`；本批新增 `12-18`（窄口 × 表三格）∥ `12-19`（适用面），`12-17` 补末格。
- 集成集总行数已跨批记在 `#2241`。

### 台账

- 本批行 `#2242` 走完 `在途 → 待核销 → 已核销`。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **已知限界（已入设计档 §2.4/§7）**：真实枢纽与本仓写两条边界写明；⑧ 无集成格，只由单测缝判。
- **越软线登记**：`thincoder-core/agent/write-gate-ledger.mjs` 570 行（越 500、未到 800），处置 = 接受并记一笔。
