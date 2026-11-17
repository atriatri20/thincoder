# 2026-11-16 · claim-closed-batches
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-16 · 来源 = 台账 #2469（认领判据漏掉已收口批）+ #2462（changedSurface 吞 ok:false）+ #2468（单测档残留）；用户 2026-11-16「2468 / 2469 跑吧」。
> 台账 = #2469（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-16
批起 sha = 67b783cb40f4999317de4701daa78f39c58203b5
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**覆盖账 = #2469 #2462 #2468**

- **已定决定**：本批只处置这三条，不扩到 #2463 ∥ #2470。 · 用户原话：「2468 / 2469 跑吧」 · 时间：2026-11-16 00:32（取自本轮系统提示的当前时间）

**库内** = 已查：`docs/core/design/BATCH-RECORD.md` §4.18.1 · `thincoder-core/agent/batch-changed-surface.mjs` · `thincoder-core/agent-tools/batch-regions.mjs` 的 `committedDocs` · `thincoder-core/agent-tools/batch-closeout.mjs` 的 `changedSurface` → 见「现状」四条，均逐字读到。

**库外** = B 类：改动面 = `thincoder-core/agent/batch-changed-surface.mjs` · `thincoder-core/agent-tools/batch-regions.mjs` · `thincoder-core/agent-tools/batch-closeout.mjs` · `docs/core/design/BATCH-RECORD.md`；外部断言 = 零（判据只读本仓 git 与批档）。

## 现状（四条，均为本轮实读）

- **判据本身**。`batch-changed-surface.mjs` 的 `neighborListClaims` 里有一行 `if (!isBatchRecord(src) || readBatchStatusLine(src) !== "open") continue`：**只收可读地未收口的批档**。
- **这是有意为之，不是漏写**。同档注释给的理由：收口批的 `committedDocs` 上界是现在的 HEAD、会一直往后长，「该档在它的 baseSha..HEAD 之内」对它几乎恒真 ⇒ 计划面会变成所有权。
- **设计档已把它记为已知边界**。§4.18.1 末两条列了两个缺口，第二条原文「那一批收口之后计划源也不再认领它（计划源只给未收口的批）⇒ 跨会话并行时那一档仍会被要一行镜像行」，末句定性为「拿不准就往判的方向倒」。
- **上界确实钉不住**。`batch-regions.mjs` 的 `committedDocs(root, sha)` 取 `git diff --name-only <base> HEAD`，**没有上界入参**；`changedSurface` 调用处也只有 `(root, baseSha)`。

## 因此本批的真正问题

不是「补一条漏掉的判据」，而是**要不要给已收口批一个有限区间**。若给，上界来源要先定（候选：该批档最后一次被改动的提交，`git log -1 --format=%H -- <批档>`，即收口提交）。

这条会改变门的语义：收口批从「永不给认领权」变成「在其自身区间内给」。**设计席先答这一问，答不出就别动代码。**

## 合并扫描（开批前扫台账同族）

- **#2462 并**：`changedSurface` 与 `neighborListClaims` 同一个函数面，第 158 行 `committed.files ?? []` 直接吞掉 `committed.ok`。两笔分开改同一个函数是浪费。
- **#2468 并**：用户点名；纯删三份单测档，与代码面无冲突。
- **#2463 不并**：措辞族跨 `BATCH-RECORD.md` §4.7 与 §4.18.1 加需求档两处，其复启条件写的是「整族一次改净」。本批只动 §4.18.1 的认领一段；若改写顺手消掉其中两条，**收口在 §6 记明销掉哪几条**，不宣称整族已清。
- **#2470 不并**：机制不同（长驻工具进程的 ESM 模块缓存在批起后不刷新），需自己的设计。但本批恰好改收口门自身 ⇒ **收口时按 #2470 记的读法，用 `execute` 起新进程 import 盘上模块复跑判据**，不拿 `batch close` 的拒绝当结论。

## 待裁（留给设计席，答不上来就回到我这里）

- 已收口批的区间上界取什么，取不到时怎么办。
- 区间内认领与「观测源不看批档状态」那条怎么并存，会不会出现同一档被两源给出不同答案。

- **自动推进**：范围 = 本批 #2469 #2462 #2468 全链（设计 → 评审 → 实施 → 收口）· 自 2026-11-16 00:32 起 · 用户原话：「2468 / 2469 跑吧」

## 设计稿核验（主 agent · 2026-11-16 00:40）→ 退回设计席一轮

已核通过的部分：§4.18.1 五条认领规则确实在盘（区间上界随状态定 · 上界取不到不认领 · 两源并集 · diff 读不出即拒 · 被认领只报不判）；`readBatchStatusLine` 实返 `closed` ∥ `open` ∥ `unknown` 三值，与 §2 的三分支对得上；② 要改的回执串正是既有的一处自相矛盾（`batch-closeout.mjs` 第 186 行注释写「串里不写『在途』那一个限定」，第 197 行实串却写着「盘上在途批的 §2 清单」）。

**须改两处**：

- **F1 · 邻居腿与自家腿的失败面必须分开写。** 事实链：`baseShaOf` 读不到「批起 sha」行 ⇒ 返回 `null`（`batch-gate.mjs`，`if (!line.includes("批起 sha")) continue` 后 `return null`）；`committedDocs(root, null)` 落进 catch ⇒ `{ok:false, files:[]}`（`batch-regions.mjs` 的 `committedDocs`）。§2 ③ 只写了「本批 diff 腿 `ok:false` ⇒ 抛拒」，**没写邻居腿**。实施席若把这条规则套到邻居腿，一份老批档（无「批起 sha」行）或一次 git 失败会让**本批收口被拒**——别的批档的缺陷挡住本批，方向反了。须写明：邻居腿读不出 ⇒ 不认领、该档照判（fail-closed）；`ok:false ⇒ 抛` 只属于本批自己的 diff 腿。
- **F2 · 两处描述文字随行为放宽而失准，§2 没安排。** `test/rtm/guard.md` 第 7-32 行写「另一会话的在途批靠计划面」，`test/integration/changed-surface-per-batch.test.mjs` 头注写「盘上在途批档的 §2 清单是计划面」——改后已收口批同样靠计划面认领，这两句会说一件不真的事。§2 只声明断言不变，没说文字要改。须补进档外表，写明改哪几个字。

**给实施轮的一条提醒（不改设计）**：那三份待删单测档若已入库，`delete` 工具会拒删，须走 `git rm`。

本轮不做：#2463 措辞族其余各条 · #2470 的模块缓存机制 · §2 清单三列语义 · 档位门第三列比对规则。

## 设计评审裁定（主 agent · 2026-11-16 00:45）

评审 `03cc1c46`：🔴 0 · 🟡 7 · 🔵 3，通过。逐条处置：

| # | 处置 | 依据 |
|---|---|---|
| 1 | 不成立 | 三个名字全在盘且已导出：`selfAttributedOf` 与 `neighborListClaims` 在同档第 40、78 行（`batch-changed-surface.mjs`），`changedSurface` 在 `batch-closeout.mjs` 第 152 行（待导出）。实施席不必自选落点。 |
| 2 | 不成立 | 并回面只有一条：`mergeChildMutations` 单点定义于 `subagent-async.mjs` 第 461 行，第 469 行 `mergeAttribution(parent, child)`；同步 spawn 经 `subagent.mjs` 第 374 行、escalate 经 `subagent-actions.mjs` 第 201/221/233 行，全部走同一函数。归属表这一半**已实现**，本批不动。 |
| 3 | 不成立 | 区间不会反向：批起 sha 是建档时的 HEAD，必是该档首次提交的祖先；该档最后一次提交又在首次提交之后。反向只在「重开改写批起 sha 且未提交」时成立，无场景，不加守卫。 |
| 4 | 延后到交付后 | §4.8 ∥ §4.13 ∥ §4.18 未同步新的拒收口面。受审字节被 token 封住，落盘只能等实施交付后；本轮实施不受影响。 |
| 5 | 不成立 | `DOC-CHECK.md` §8 只是**消费**「本批改动面」（第 183、194 行），不定义它怎么取材；第 195 行还明写数值单源在 `CODE-TIER.md` §2.2 与 `batch-tier-gate.mjs`。取材的单源就是 §4.18.1，无重复描述。 |
| 6 | 不成立 | 现成件已在 §4.18.1 正文点名：复用 `committedDocs` 的 `diffBaseOf` 与仓根还原，新增 `lastCommitOf`；§2「已查（现成件）」另有 `existing:` 与 `none found:` 两行。 |
| 7 | 延后到交付后 | §4.18.1 后一处只引 `record-results.mjs` 一处记账点，与前一处「那两处」口径不同（`turn-loop.mjs` 第 291 行确是第二处）。同属受审冻结面。 |
| 8 | 不成立 | 成本面不是本批新增：现有 `neighborListClaims` 本就逐批档调一次 `committedDocs`；本批每份已收口批只多一次 `git log -1`，同阶。 |
| 9 | 不成立 | 同项目根这一支是**既有**判据，不是本批新增；且场景真实——工作区里两个仓根同名的 `AGENTS.md` 就是一对。 |
| 10 | 不成立 | 评审看不到 §2；我已实读：机读清单八行带行读数、档位结论「全部 ≤ 500」、验收对照 ①–⑦、集成面 delta 一条俱在。 |

**交付后本批内要补的两处（#4 ∥ #7）**：收口前落到设计档，只改措辞与交叉引用，不动语义，故不另走评审。已记在 `#4` ∥ `#7` 上，收口时不宣称「无遗留」。

## 实施中裁定：集成用例编号（主 agent · 2026-11-16 00:44）

§2 写的 `CLI 7-33` 撞号，实施席上抛后我实读复核：

- `test/rtm/guard.md` 第 41 行已有 `| 7-33 |`，证据列 = `test/integration/batch-close-gate.test.mjs`；该档第 652 行实有 `test('CLI 7-33 错误 · 越过收口线而 §2 第二列无方案 ⇒ 拒（点名该档与 800）…`。
- `CLI 7-34` 在 `test/integration/` 全树与 `guard.md` 均无占用。

裁定：**新用例用 `CLI 7-34`**。依据 = `docs/core/design/TESTING.md`「编号只增不复用，删除的编号不回收」与「编号没有重复」——同号即不合格，而这批是新增不是复用。

由此产生一处 §2 ∥ §5 差异（§2 两处写 7-33，实施落 7-34）。处置：§2 的笔归设计席，本批在实施交付后派一轮设计修正改这两处；**不自行改 §2**。收口时 §6 记这笔差异与它的落地。

另一条同时交代给实施席：用例标题的 `正常 ∥ 边界 ∥ 错误 ∥ 异常` 位取该族既有取值（7-30 `边界`、7-31 `边界`、7-32 `正常`、7-33 `错误`，未见 `异常`），不得新造词。

## 实施交付后的修正轮（主 agent · 交付核验完毕）

交付已核：单测 4/4（我复跑）· 集成 `CLI 7-32` ∥ `CLI 7-34` 双绿（我复跑）· `batch-close-gate.test.mjs` 19/19（我复跑）· 三处主体改动逐行读过，与设计一致。全仓两红 `CLI 43-1` ∥ `43-2` 我另起干净 worktree 在批起快照上复现过：同样 `pass 3 · fail 2`、同样两条断言 ⇒ **先红，与本批无关**。

本轮派设计修正笔，四件事，**都不改语义**：

**① §2 两处编号**：`CLI 7-33` 一律改 `CLI 7-34`（撞 `test/integration/batch-close-gate.test.mjs` 既有 `CLI 7-33`）。位置 = 「集成面 delta 对 `test/RTM.md`」那一段，与「验收对照」表的 ⑤ 行。同处的态词 `异常` 一并改 `边界`（该族既有取值为 正常 ∥ 边界 ∥ 错误，用实施已落的那个）。

**② §2 受影响文件清单缺两行**：补 `test/integration/close-gate-fixture.mjs` 与 `test/integration/batch-close-gate.test.mjs`（在 §5「档外改动」表里已列，但机读清单没有）。**这是收口前置**：本批 HEAD 未动，提交 diff 腿为空，改动面 = 触达账全量，档位门会逐个判这两个在盘码档，缺行即拒。行数用 `countContentLines` 量，档位结论（现写「全部 ≤ 500」）随之复核后重述。

**③ 设计档 §4.18.1 内部口径统一**（评审 #7）：同一节先说「记账面 = `record-results.mjs` 与 `turn-loop.mjs` 里那两处 `_touchedFiles.push`」，后一处却写「归属只能从记账面取」且只引 `record-results.mjs` 一处——读者会把后者读成单一记账点。二选一：删后一处留带两处的那句，或把重复引文收成一次。`subagent-spawn.mjs` 的绑定引文同样出现两次，一并收。

**④ 设计档门面同步**（评审 #4）：新拒收口面（提交 diff 读不出 ⇒ 拒）只写在 §4.18.1，同档承载它的两处没跟上——§4.13 那份检查序列、§4.18「正常批」的前置集，以及 §4.8 的验证面（归属 ∥ 认领 ∥ 取材一个都没列）。补进 §4.13 与 §4.18 的前置，§4.8 加一项。

**本轮明确不做**：不改任何代码档；不动 §5（实施席的笔）；不动 `#2463`（措辞族跨两处，须整族一次改净）· `#2470`（长驻模块缓存，需自己的设计）；不改已冻结的 §2 语义与验收判据（只改编号字面与清单行）。修完照旧不宣称该族已清。

**②之补充 · 读数基准**：机读清单的「行数」格是**批起快照**的内容行数，不是工作树行数——`readingGapOf` 拿格子里的数与 `countContentLines(git show 67b783cb:<档>)` 比，量错地方会红成「写的是 X，基线是 Y」。

我已在快照上把十档量全（同一把尺，`countContentLines` 由 `thincoder-core/agent-tools/batch-tier-gate.mjs` 导出）：四档既有读数（112 ∥ 166 ∥ 419 ∥ 170）与 §2 现值一致；新增两行用 **200**（`close-gate-fixture.mjs`）与 **694**（`batch-close-gate.test.mjs`，工作树现 696，**不写 696**）；三份待删残留 97 ∥ 319 ∥ 209 不变。

**连带一处结论要改**：`batch-close-gate.test.mjs` 基线 694 > 500，故 §2 那句「全部 ≤ 500，两条线都不越」不成立。按 `docs/core/standards/CODE-TIER.md` §2.1「`> 500`：基准是修改代码前的长度。设计席自觉判断，并在过程记录里写下处置：拆（分拆在本批内落成，不推到下一批）；或写明不拆的理由。」⇒ 该档「分拆方案」格写不拆的理由（本批只改夹具两行，档长是既有的）。**800 线不触发**：工作树 696 ≤ 800，`tierPlanHeader` 只在 `> FILE_CLOSE_MAX` 时要求方案。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成



## 本批条目（覆盖）

| 台账 | 题 | 本批处置 | 验收读数 |
|---|---|---|---|
| #2469 | 认领判据漏掉已收口批 | 计划面给已收口批一个钉死的区间上界，取不到上界就不认领 | 单测档 ① |
| #2462 | `changedSurface` 吞 `ok:false` | diff 腿读不出即拒收口，不再当「本批没有提交改动」 | 单测档 ② |
| #2468 | 三份已收口批单测档残留 | 删除三份档 | 验收对照 ① |

不覆盖 #2463 ∥ #2470（判决见 §1，本批不宣称整族已清）。

## 设计档落点

`docs/core/design/BATCH-RECORD.md` §4.18.1「本批改动面的取材」：判据二末句改写；认领一段扩写，新增「区间上界随批档状态定」「上界取不到就不认领」「两源是并集」「提交 diff 读不出 ⇒ 拒收口」「邻居腿的失败面不拒收口」（末一条应评审 F1——两条腿的失败面各写一条）；边界末两条改写与新增；`D-BR44` 决策行同步。已落盘。

## 已查（现成件）

- `existing: thincoder-core/agent-tools/batch-regions.mjs · name: "committedDocs" · consumers: batch-changed-surface.mjs ∥ batch-closeout.mjs ∥ batch-gate.mjs` ⇒ 上界这一侧复用它的 `diffBaseOf` 与仓根还原，只把 diff 右端换成入参，不另造一套取材。
- `none found: thincoder-core/agent-tools/batch-regions.mjs ∥ thincoder-core/agent/batch-changed-surface.mjs ∥ thincoder-core/agent-tools/batch-closeout.mjs` 无「取某档最后一次提交」的函数 ⇒ 新增 `lastCommitOf`。
- 数据事实：本设计对数据面的断言只有行读数与 git 提交，均由命令得出（`countContentLines` ∥ `git log`），无需读业务数据行。
- 库内已查：设计档 §4.18.1 ∥ §8 ∥ D-BR44 · `docs/core/standards/CODE-TIER.md` §2.1–§2.2 · `test/RTM.md` · `test/integration/changed-surface-per-batch.test.mjs`（`CLI 7-32`）。

## 机制设计

### ① 已收口批的区间上界（#2469）

`neighborListClaims` 的状态闸从「只收未收口」改成「状态可读即收，上界随状态定」：

- `open` ⇒ 上界 = `null`，走 `committedDocs`（右端仍是 HEAD，答「目前改到哪」）。
- `closed` ⇒ 上界 = `lastCommitOf(root, 该批档)`；取到 `null` ⇒ `continue`，不认领。
- `unknown` ⇒ `continue`，照旧按冻结处置（不明不等于未收口）。

`lastCommitOf(root, abs)`（新增于 `batch-regions.mjs`）：`rev-parse --show-toplevel` 取仓根，`log -1 --format=%H -- <仓根相对路径>`；非 git ∥ 路径在仓外 ∥ 无提交 ⇒ `null`。

`committedDocsUpto(root, sha, upper)`（新增于同档）：与 `committedDocs` 共用 `diffBaseOf` 与仓根还原，diff 右端用 `upper`。**`upper` 必填、无缺省**——缺省会静默退回 HEAD，而那正是本批要消掉的那一形。

`committedDocs(root, sha)` 的契约不动，`batch-gate.mjs` 的调用点因此不受影响。

依据 `thincoder-core/agent-tools/batch-regions.mjs`「跑不出（非仓 ∥ sha 不可解析）⇒ `ok: false` + 空集（调用面按「基 sha 未定」明示，不静默）」。

### ② 两源并集（§1 待裁第二条）

`changedSurface` 把两源并进同一个 `claimed` 集，任一方认领即算认领 ⇒ 两源不必给同一答案，也不会互相推翻；并集只往「少判」一个方向收窄，判的方向仍由判据一压住（归属表里属本档 ⇒ 判，认领推不翻）。

回执串里「盘上在途批的 §2 清单」改成「盘上批档的 §2 清单」：已收口批也认领了，原文会说不真的事。

### ③ 两条 diff 腿、两套失败面（#2462）

**本批自己的腿读不出 ⇒ 拒。** `changedSurface` 取到 `committed.ok === false` 即抛 `changedSurfaceUnreadableError(root, baseSha)`，收口不进行。拒文点名根、批起 sha、下一步（`git diff --name-only <sha> HEAD` 看 git 报什么）与收尾句 `Nothing was written.`。

**邻居的腿读不出 ⇒ 不认领、本批照判，绝不拒。** `neighborListClaims` 按邻批各算一次，那几笔读不出（`baseShaOf(邻批档)` = `null`、`committedDocs` ∥ `committedDocsUpto` 回 `ok: false`、`lastCommitOf` 回 `null`）一律 `continue`：那一档不被它认领、照本批判，本批收口照跑。依据 = §4.18.1「邻居腿的失败面不拒收口」。

**为什么必须分开写**：混成一条，邻批的缺陷挡的是本批的收口，而拒文点名的是本批的根与批起 sha——说的不是它拦下的那件事。复现：老批档（无「批起 sha」行）令 `baseShaOf` 回 `null`，`committedDocs(<仓根>, null)` 实测回 `{"ok":false,…,"files":[]}`。

`baseShaOf` = `null` 的既有处置不动（diff 腿不启动，判据 = 归属 + 认领）。两条不是同一件事：一条是「没有基线可解」，一条是「有基线却读不出」。

为让这道门有可跑的失败面，`changedSurface` 从私有函数改为导出；生产调用点仍只有 `assertCloseoutGates` 一处。

### ④ 删三份单测档（#2468）

删 `docs/batches/` 下三份：`2026-11-11-designer-tier-rule.test.mjs` ∥ `2026-11-11-review-pass-signs-itself.test.mjs` ∥ `2026-11-12-ledger-query-default-limit.test.mjs`。规则本身（单测零留存、收口即删）已在 `docs/core/design/TESTING.md` §3.5，本批只清存量，不新增规则。

## 受影响文件（机读清单）

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent/batch-changed-surface.mjs | — | 112 |
| thincoder-core/agent-tools/batch-regions.mjs | — | 166 |
| thincoder-core/agent-tools/batch-closeout.mjs | — | 419 |
| test/integration/changed-surface-per-batch.test.mjs | — | 170 |
| test/integration/close-gate-fixture.mjs | — | 200 |
| test/integration/batch-close-gate.test.mjs | 未拆：档长是既有的，本批对它的改动只是夹具那一处实参 `record(null)`，拆一个集成档不在本批范围（拆它要连 `test/rtm/guard.md` 按档登记的用例一起重排，属它自己的一批）。收口线 800 不越，不触 §2.2。下一批为它扩例时先给分拆方案 | 694 |
| docs/batches/2026-11-11-designer-tier-rule.test.mjs | — | 97 |
| docs/batches/2026-11-11-review-pass-signs-itself.test.mjs | — | 319 |
| docs/batches/2026-11-12-ledger-query-default-limit.test.mjs | — | 209 |
| docs/batches/2026-11-16-claim-closed-batches.test.mjs | — | 新 |
```

档位结论：十行 = 九档快照读数 + 一档 `新`。设计时线 500 只有 `test/integration/batch-close-gate.test.mjs` 越线（694），处置写在该行第二列（不拆的理由，不是分拆方案）；其余八档 ≤ 500，第二列 `—`。收口线 800：本批在盘码档无一越线，该档收口时仍在 800 之下。行数 = 批起快照 `67b783c` 上的内容行数，量法 `countContentLines`；工作树现值不入这一列。

档外表：`docs/core/design/BATCH-RECORD.md`（设计档，`.md`，不计行读数）、`test/rtm/guard.md`（`.md`）。

**随行为改写的文字（评审 F2·只改字、不改断言）**——行为放宽到「已收口批也认领」后，下列各处把计划源限定成「在途批」的说法不再成立：

- `thincoder-core/agent/batch-changed-surface.mjs` 的 `neighborListClaims` 头注：条件 ③「那份批档**可读地未收口**（状态词 = `进行中`）」与其末句「已收口的批走观测源（本会话归属表）」改成「状态可读即收、上界随状态定：`closed` 取那份批档自己的最后一次提交」；`unknown` ⇒ 不认领照旧。
- `thincoder-core/agent-tools/batch-closeout.mjs` 的 `changedSurface` 头注：「计划源（盘上批档的 §2 机读清单）只给可读地未收口的批」→ 改成随上界定的那一句。
- 同档 `changedSurfaceReceiptLine` 的头注与实串：头注说「串里不写『在途』那一个限定」，实串却写着「盘上在途批的 §2 清单」——两处都改成「盘上批档的 §2 清单」。
- `test/integration/changed-surface-per-batch.test.mjs` 头注：「盘上在途批档的 §2 清单是计划面」→「盘上批档的 §2 清单是计划面」。
- `test/rtm/guard.md`：CLI 7 目的段「按别的在途批的认领收窄」→「按别的批的认领收窄」；7-32 态描述「另一会话的在途批靠计划面」→「另一会话的批靠计划面（在途批取 HEAD、已收口批取它自己的收口提交）」。7-32 行内「C 是另一会话开的在途批」是那一条用例的夹具事实，不动。

## 测试覆盖

单测档 = `docs/batches/2026-11-16-claim-closed-batches.test.mjs`，收口即删。三件失败面各一条：

① 已收口批的区间：临时 git 仓 + 三份批档。已收口批 A 在其自身区间（批起 → 收口提交）内的档被认领；区间之后才提交的档不被它认领；A 的批档从未提交时，它的档一档都不被认领。

② diff 腿读不出：批起 sha 指向仓里不存在的对象 ⇒ `changedSurface` 抛 `changedSurfaceUnreadableError`。这条同时是「业务门必带失败面」那一条：门喂了不满足的输入，断的是拒绝与它可读的理由。

③ 邻居腿读不出不挡本批：夹具里邻批批档缺「批起 sha」行（`baseShaOf` 回 `null`），它 §2 列的一档确在提交 diff 里 ⇒ `changedSurface` **不抛**，那一档落进 `judged`（不被认领、照本批判）。与 ② 配对：一条断「本批有基线却读不出 ⇒ 拒」，一条断「邻批读不出 ⇒ 不拒」——两腿混成一条规则时，②③ 必有一条红。

集成面 delta 对 `test/RTM.md`：**增一条** —— `CLI 7-34 边界 · 已收口批的 §2 清单按它自己的收口提交认领（区间内只报不判、区间外照判）`，落 `test/integration/changed-surface-per-batch.test.mjs`，登记 `test/rtm/guard.md` 的 CLI 7 族。**不删改 `CLI 7-32`**：它第二步收的 B 批，邻批 A 在夹具里从未提交 ⇒ `lastCommitOf` = `null` ⇒ 走「上界取不到不认领」，与改前同形，读数不变。

## 验收对照

| # | 判据 | 谁读、读到什么算对 |
|---|---|---|
| ① | 本仓 `docs/batches/` 下已没有那三份单测档 | 收口席跑 `glob docs/batches/*.test.mjs`：只剩本批那一份 |
| ② | 已收口批的区间是它自己的收口提交，不是 HEAD | 实施席看 `neighborListClaims` 里 `lastCommitOf` 与 `committedDocsUpto` 的调用：`closed` 支传入的是它自己的上界 |
| ③ | 本批 diff 腿读不出时收口被拒，且拒文可读 | 单测档 ② 跑通；评审席读拒文：点名根、sha、下一步、`Nothing was written.` |
| ④ | 两源并集，`unknown` 状态不给认领权 | 评审席读设计档 §4.18.1 的认领规则：任一方认领即认领、`unknown` ⇒ `continue`、区间上界随批档状态定 |
| ⑤ | 集成面新增 `CLI 7-34`，`CLI 7-32` 读数不变 | 收口席跑集成套件：两案都绿；`git diff` 显示 `CLI 7-32` 的断言未改 |
| ⑥ | 邻居腿读不出时不认领、本批照判，收口不被拒 | 实施席读 `neighborListClaims`：`baseShaOf` = `null` ∥ `committedDocsUpto` 的 `ok: false` 两支都 `continue`；单测档 ③ 跑通 |
| ⑦ | 「计划源只给在途批」的说法已随行为改净 | 评审席逐个读：`neighborListClaims` 头注 · `changedSurface` 头注 · `changedSurfaceReceiptLine` 的头注与实串 · 集成档头注 · `test/rtm/guard.md` 的 CLI 7 目的段与 7-32 态描述——每一处都不再把计划源限定成在途批 |

## 关键决策

- **弃「收口时写一份认领清单」**（甲案）：认领事实已能从 git 区间算出来，再写一份清单就是第二份真相，写漏一次就与 git 矛盾，而谁对说不出。试过的那一手：`git log -1 --format=%H -- docs/batches/2026-11-15-closeout-surface-per-batch.md` 直接得到收口提交 `23736451`，上界现成可算。
- **弃「`ok:false` 只进回执不判」**（乙案）：回执是「只报不判」的面，收口不看它 ⇒ 一个没核对过的改动面照样被冻成历史，业务失败变成功。
- **弃「`ok:false ⇒ 抛` 套到两条腿」**（丁案）：邻批批档缺「批起 sha」行时 `baseShaOf` 回 `null`，`committedDocs(<仓根>, null)` 实测回 `{"ok":false,…,"files":[]}`；同一条规则落到邻居腿，一份老批档就拒掉别人的收口，拒文却点名被拒那一批的根与 sha。故拒只留本批自己的腿（§4.18.1「邻居腿的失败面不拒收口」）。
- **弃「给 `committedDocs` 加第三参（无缺省）」**（丙案）：第三个调用点在 `batch-gate.mjs`，那是收口门自己的一条腿；改签名把本批改动面推到另一个门面，且读的人要记「第三参传 `null` = HEAD」。两个具名函数各自回答一问，代价只是多一个名字。

## 上抛项

无。§1 的两条待裁都已在本节答完（①区间上界、②两源并存）；#2463 ∥ #2470 不并入，按 §1 判决留在台账。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：已签发（pass）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | §4.18.1「`changedSurface` 把两源并进同一个 `claimed` 集」·「`neighborListClaims` 按邻批各算的那几笔读不出」·「`selfAttributedOf` 取 `attributedTo` 的原值」均无载体档 |
    | 2 | 🟡 | New | §4.18.1「再由 `thincoder-core/agent-tools/subagent-async.mjs` 的 `mergeChildMutations` 并回父侧」 |
    | 3 | 🟡 | New | §4.18.1「已收口 ⇒ 上界 = **该批档最后一次被改动的提交**」缺反向/空区间处置 |
    | 4 | 🟡 | New | §4.13「它先检查链完整性、文档、凭证和工作项，再写已收口并结算」· §4.18「正常批：链完整、评审通过、用户批准、验证与完成证据齐全。」· §4.8「验证段域、绑定、骨架、路径、凭证剥除…」（均无取材/拒收口一句） |
    | 5 | 🟡 | New | CODE-TIER §2.2「基线判定与拒绝语义见 `docs/core/design/DOC-CHECK.md` §8」；§4.18.1 无该指向（DOC-CHECK 侧 unverified） |
    | 6 | 🟡 | New | 档头「> 最近先例：`docs/core/design/LEDGER.md` 的逐行写核和 `PATH-RESOLUTION.md` 的统一解析。」无本节坐标与先例批 |
    | 7 | 🟡 | New | §4.18.1「归属只能从记账面取：`thincoder-core/agent/record-results.mjs`…」对「那两处 `agent._touchedFiles.push(abs)`」收窄 |
    | 8 | 🔵 | New | §4.18.1「批档目录 = `batchDirs`（`thincoder-core/doc-check/existence.mjs`）」无枚举上界与成本取舍 |
    | 9 | 🔵 | New | §4.18.1「两批同工作树并行时，任一方收口都会要求另一方补镜像行」·「那份批档与本次收口**同项目根**（路径按仓根相对归一后再比，win32 再折大小写）」无出处实例 |
    | 10 | 🔵 | New | 评审范围只含 `docs/core/design/BATCH-RECORD.md`，批档记录 §2 的档位结论/命令、验收行与 RTM 增量 unverified |
    VERDICT: pass
    计数：🔴 0 · 🟡 7 · 🔵 3 · 未标 0

## §4 用户批准（主 agent）

**用户指令（原话）**：「2468 / 2469 跑吧」。

**这条指令覆盖什么**：整批一次跑完——设计 · 评审 · 实施 · 收口，逐步不再单独请示。实施席的派出以此句为据。

**范围**：#2469（认领判据补上已收口批）· #2462（同一函数吞掉 `ok:false`，一并处理）· #2468（三份残留单测档，用户点名的纯删除）。

**未在此列的**：#2463 措辞族与 #2470 模块缓存按 §1 判决不并入本批，收口时记明销哪几条，不宣称整族已清。

**设计评审**：已过（结论 pass；🟡 7 条、🔵 3 条，无 🔴）。其中 #4 ∥ #7 两条在交付后落盘，其余判为不成立并逐条记在 §1。评审期间受审档保持冻结，未被改动。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施交付（eng-coder）

**交付概述**：机制按 §2 落地为三处代码改动、一处集成用例、一处 RTM 登记、一份批内单测档；#2468 的三份存量残留由父侧执行删除（本席被绑定门拒，见「待裁与外因」）。

#### 逐条交付表

| # | 状态 | 要求（§2 原句片段） | 落点与读数 |
|---|---|---|---|
| 1 | ✅ 完成 | ①「`closed` ⇒ 上界 = `lastCommitOf(root, 该批档)`；取到 `null` ⇒ `continue`」 | `batch-changed-surface.mjs` 的 `neighborListClaims`：`status === "unknown"` ⇒ `continue`；`closed` 支取上界走 `lastCommitOf` + `committedDocsUpto`；`open` 支仍走 `committedDocs`（右端 HEAD）。单测 ①-1 ∥ ①-2 绿 |
| 2 | ✅ 完成 | ①「`lastCommitOf`（新增于 `batch-regions.mjs`）：`rev-parse --show-toplevel` `+ log -1 --format=%H -- <仓根相对路径>`；非 git ∥ 仓外 ∥ 无提交 ⇒ `null`」 | 同档新增导出面；仓外判据 = `relative()` 结果以 `../` 起头或为绝对路径；无提交 = 空输出不匹配 40–64 位十六进制 |
| 3 | ✅ 完成 | ①「`committedDocsUpto(root, sha, upper)`：与 `committedDocs` 共用 `diffBaseOf` 与仓根还原，右端用 `upper`；**`upper` 必填、无缺省**」 | 同档把两个具名函数共用的取材抽成私有 `diffSince(root, sha, end)`；`committedDocs` 契约未动（`diffSince(root, sha, "HEAD")`），`batch-gate.mjs` 的调用点零改。`upper` 非字符串 ∥ 空白串 ⇒ `ok:false` + 空集（不猜右端、不静默退回 HEAD） |
| 4 | ✅ 完成 | ③「本批自己的腿读不出 ⇒ 拒。`changedSurface` 取到 `committed.ok === false` 即抛 `changedSurfaceUnreadableError(root, baseSha)`」 | `batch-closeout.mjs` 新增导出 `changedSurfaceUnreadableError`；`changedSurface` 由私有改导出（生产调用点仍只有 `assertCloseoutGates` 一处）。拒文点名根、批起 sha、下一步 `git diff --name-only <sha> HEAD`，收尾句 `Nothing was written.`——单测 ② 逐点断言四个要件 |
| 5 | ✅ 完成 | ③「邻居的腿读不出 ⇒ 不认领、本批照判，绝不拒」 | 三笔失败面（`baseShaOf` 回 `null` · `committedDocsUpto` ∥ `committedDocs` 回 `ok:false` · `lastCommitOf` 回 `null`）一律 `continue`，函数全文无 `throw`；单测 ③ 断言「不抛、那一档落进 `judged`」 |
| 6 | ✅ 完成 | ②「两源并进同一个 `claimed` 集，任一方认领即算认领」 | `changedSurface` 里 `sessionClaimsOf` 与 `neighborListClaims` 同灌 `claimed`，判据一（归属表）仍压住判的方向——该段未改，只改了计划源的状态闸 |
| 7 | ✅ 完成 | ②「回执串里「盘上在途批的 §2 清单」改成「盘上批档的 §2 清单」」 | `changedSurfaceReceiptLine` 实串与头注同改；头注原来自述「串里不写『在途』那一个限定」而实串写着，本笔把两处对齐 |
| 8 | ✅ 完成 | 随行为改写的文字五处 | `neighborListClaims` 头注 ∥ `changedSurface` 头注 ∥ `changedSurfaceReceiptLine` 头注与实串 ∥ 集成档头注 ∥ `test/rtm/guard.md` 的 CLI 7 目的段与 7-32 态描述——全仓复扫「在途批」后，机制面上零残留；7-32 行内「C 是另一会话开的在途批」按 §2 不动 |
| 9 | ✅ 完成 | ④「删 `docs/batches/` 下三份」 | **由父侧执行**（depth 0，逐条「Deleted」）；本席实测 `glob docs/batches/*.test.mjs` 只剩 `2026-11-16-claim-closed-batches.test.mjs` |
| 10 | ✅ 完成 | 测试覆盖 ①②③ + 集成面 delta | 单测档四例：①-1 区间内被认领／区间外不被认领 · ①-2 批档从未提交 ⇒ 零认领 · ② 本批腿读不出 ⇒ 抛拒且拒文四件齐 · ③ 邻居腿读不出 ⇒ 不抛、落进 `judged`。集成：新增 `CLI 7-34 边界 · 已收口批的 §2 清单按它自己的收口提交认领（区间内只报不判、区间外照判）` |

#### 决策披露（实施席自决的、§2 没写死的地方）

| 决定 | 理由 | 影响面 |
|---|---|---|
| `committedDocsUpto` 对 `upper` 加形状闸（非字符串 ∥ 空白串 ⇒ `ok:false`） | §2 要求「必填、无缺省」，JS 不给运行期强制；不加闸时缺省值一路走到 `git diff … undefined` 才失败，失败面落在 git 而不是本函数。闸把它挪到函数门口，方向 = 认领不成立（fail-closed） | 只在调用方传错时生效；生产调用只有 `neighborListClaims` 的 `closed` 支 |
| 集成用例编号用 `CLI 7-34`、态词用「边界」 | 父侧裁定：§2 写的 7-33 与在盘既有 `CLI 7-33`（`batch-close-gate.test.mjs`）撞号，`docs/core/design/TESTING.md` 的「编号只增不复用」与「编号没有重复」使同号即不合格；态词按父侧要求取该族既有值（7 族已在用 正常／边界／错误），本用例的判别点正是区间边界，故取「边界」而不新造「异常」 | §2 两处仍写 7-33，由父侧派设计修正笔改；本席未动 §2 与批档任何段落 |
| 单测档留在盘上、未自删 | 设计写「收口即删」，删的时点在收口那一笔；本席把读数写在这里，文件留给收口席删（单测零留存门会拦着收口不放，这正是它的用途） | 收口前置：`docs/batches/2026-11-16-claim-closed-batches.test.mjs` 必须先删 |

#### 档外改动（两处，均因本批行为放宽而使既有夹具前提失效）

| 档 | 改了什么 | 为什么必须改 |
|---|---|---|
| `test/integration/close-gate-fixture.mjs` | `record(sha)` 支持 `sha === null` ⇒ §1 不写「批起 sha」记入行 | 真实非 git 仓／无可取快照的现场就是「没有那一行」；夹具需要一个能表达它的形 |
| `test/integration/batch-close-gate.test.mjs` | `CLI 7-7` 夹具的 `record("0".repeat(40))` → `record(null)`（**断言一行未改**，diff 里「`PASS · 范围 0 档`」那行仍是上下文行） | 新规则下「有基线却读不出」就是拒收口那一形；旧夹具用全零占位 sha 造出了一次「有基线读不出」，7-7 断的是判域 0 档，不是这条拒。改后 7-7 仍断同一件事，且不再借一个假的基线 |

#### 内部审计轮次与终态

- 内部发散审计（`explore` 角色，只读，对 §2 与设计档 §4.18.1 逐条比对）：**1 轮**，结论 = 符合 20 条 · 偏离 2 条（即上表两处档外改动，均已披露）· 未做 0 条。
- 自修轮次：**0 轮**（审计无待修项）。审计提出的一条建议（把这两档补进 §2 档外表）归父侧与设计席，本席未改 §2。
- 终态：**clean**（无未修项；两项待裁见下）。

#### 验证读数

- 单测：`node --test docs/batches/2026-11-16-claim-closed-batches.test.mjs` ⇒ `tests 4 · pass 4 · fail 0`。
- 失败侧（同一档对旧代码跑，三个源档暂存回 HEAD 后跑、跑完还原）：①-1 红（旧代码里已收口批不给认领 ⇒ 区间内那一档认领不到）、② 红（旧代码未导出 `changedSurface`，门无从跑失败面）、①-2 ∥ ③ 按设计仍绿（它们是护栏：新规则不得把邻居腿也变成拒）。
- 集成（本批判别面）：`node --test test/integration/changed-surface-per-batch.test.mjs` ⇒ `tests 2 · pass 2`（`CLI 7-32` 与 `CLI 7-34`）。
- 集成失败侧（同一档对旧代码跑，源档回 HEAD 后跑、跑完还原）：`CLI 7-32` 绿 ∥ `CLI 7-34` 红，红因 = 收口被 `tier-reading gate` 拒并点名 `src/alpha.mjs`「§2 清单里没有这一档的行；基线是 1」——正是「已收口批不认领 ∪ 本批 §2 没列它 ⇒ 照判」。
- 收口相关集成子集（12 档：`batch-*` 全族 + `machine-list-head-form` + 本档）⇒ `tests 71 · pass 71 · fail 0`。
- 全仓集成套件 `node test/run.mjs` ⇒ `tests 224 · pass 222 · fail 2`；两红是 `doc-anchor-graph.test.mjs` 的 `CLI 43-1` ∥ `43-2`。**非本批所致**：在批起快照 `67b783c` 的独立 worktree 上跑同一档，同样 `tests 5 · pass 3 · fail 2`、同样两条断言（「第 1 跳须含设计档」∥「需求档那条须在」）。根因侧写：`docs/core/requirements/TOOLS.md` 现文已无 `EDIT.md` 引用，而该档最后改动 `eb4870e4` 是 `67b783c` 的祖先。
- `doc_check(mode:"gate", docs:["test/rtm/guard.md"])` ⇒ `DOC-CHECK GATE: PASS`。

#### 落地核对

**落地核对：无**（本笔落地未使设计档任何一句变为不真；§4.18.1 五条规则与代码逐条对得上）

#### 待裁与外因

- **[上抛·知会] §2 ④ 由父侧执行**：三份（`docs/batches/2026-11-11-designer-tier-rule.test.mjs` ∥ `2026-11-11-review-pass-signs-itself.test.mjs` ∥ `2026-11-12-ledger-query-default-limit.test.mjs`）父侧 depth 0 删除，回执逐条 `Deleted`。本席动不了它们的原因：`delete` 被 `write-gate.mjs` 的 `batchRecordWriteConflict` 拒（原话「cross-batch batch-record write … belongs to a different batch」），本席未用 `bash git rm` 绕门。
- **[上抛·知会] §2 的集成用例编号修正**：由 §2 的 `7-33` 修正为 `7-34`，理由 = 撞在盘既有 `CLI 7-33`（`test/integration/batch-close-gate.test.mjs`，越线方案支）。父侧已裁定并另行派设计修正笔改 §2；§2 与 §5 的这处不一致由父侧记进 §6。
- **[上抛·知会] 档外两处**：见上表，请父侧决定是否补进 §2 档外表。
- **[上抛·知会] 与本体无关的存量红**：`CLI 43-1` ∥ `43-2` 在批起快照上就红（读数见上），不在本批笔域，未修、未绕。

## §6 验证与收口（父代理）

**验证读数**（除注明外均由父侧复跑）

| 面 | 命令 | 结果 |
|---|---|---|
| 本批单测（删档前） | `node --test docs/batches/2026-11-16-claim-closed-batches.test.mjs` | tests 4 · pass 4 |
| 单测失败侧 | 源档回 HEAD 同跑同一档 | ①-1 红 ∥ ② 红（`changedSurface` 未导出）；①-2 ∥ ③ 绿 |
| 改动面取材 | `node --test test/integration/changed-surface-per-batch.test.mjs` | 2 / 2（`CLI 7-32` ∥ `CLI 7-34`） |
| 收口门全族 | `node --test test/integration/batch-close-gate.test.mjs` | 19 / 19 |
| 全仓套件 | `node test/run.mjs` | 224 条 · 222 pass · 2 fail |

那 2 红是 `CLI 43-1` ∥ `CLI 43-2`，**先红**：在批起快照 `67b783cb` 的独立 worktree 上跑同一档，得到同样两条断言红。

**收口判据在新进程 · 新模块上挣得**（#2470 的处置）。`changedSurface` 与 `assertTierPlan` 在独立 node 进程里跑，喂真实触达账 13 档 ⇒ judged 13 · reported 0；档位门实际判 6 档码档 ⇒ PASS。

**同一笔的失败侧**（同进程同输入，只改记录文本）：抽掉 `close-gate-fixture.mjs` 那一行 ⇒ 拒；`200` 改 `201` ⇒ 拒；`694` 改 `696`（照工作树量）⇒ 拒。三次分别点名「§2 清单里没有这一档的行」与「写的是 X，基线是 Y」。

**长驻进程的说明**：这一笔 `batch close` 走会话内已加载的模块（进程起于本批改动之前）。新旧两版在本批的输入上结论相同（diff 腿为空、无邻批认领），但上面那份 PASS 是新进程拿新模块挣的，不以会话内这一笔为据。

**单测零留存**：本批单测档已删，`glob docs/batches/*.test.mjs` 零命中。**文档门**：`doc_check(mode:"gate", docs:["docs/core/design/BATCH-RECORD.md"])` ⇒ PASS。

**落地核对**：§4.18.1 与实施一致（`closed` 支走批档自身提交作上界、`unknown` 不认领、`ok:false` 只属本批自己的腿）；§4.8 ∥ §4.13 ∥ §4.18 三处门面本轮已同步。无「设计说一套、代码做另一套」的句子。

**§2 ↔ §5 差异**：§5 两处写「§2 仍写 `7-33`，由父侧派设计修正笔改」。本批已改净（§2 现为 `CLI 7-34`），该差异落地关闭，不是遗留。

**拒收口的那道门正好挡住本批自身**：本批改的就是收口门，故见上「新进程」一笔。会话内那一笔的结论不作证据。

**本批新债 1 条**：#2482（`test/integration/batch-close-gate.test.mjs` 越设计时线 694 行、未拆，复启条件已写）。设计评审 10 条中 🟡 两条（#4 ∥ #7）已在交付后落盘，其余八条为不成立或口径澄清，逐条理由在 §1。

**遗留指向台账**：#2463（措辞族跨两处，须整族一次改净）· #2470（长驻模块缓存在批起后不刷新，需自己的设计）。本批不宣称该族已清。
