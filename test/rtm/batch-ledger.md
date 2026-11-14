# RTM 分册 · batch-ledger

> 本册护的机制 = 批档 ∥ 台账 ∥ 评审 ∥ 凭证结清；族表与归属判据 = docs/core/design/TESTING.md。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 5. 顾问评审超时改了马上生效

> 目的：超时可热改、可清除、非法值被拒。
> 节注：回指 = docs/core/requirements/AGENT-PARAMS.md 条目 F-AP1 ∥ F-AP2；三态（行序）= 5-1 正常 · 5-2 边界 · 5-3 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 5-1 | `settings set` 把超时改成 3000，再跑下一次评审 | 下一次评审按 3s 结束并带回超时尾 | 无 | `test/integration/advisor-timeout-hot.test.mjs` |
| 5-2 | 把超时删掉（设为 null），再跑同一评审 | 评审跑完（约 5s 流），无超时尾 | 无 | `test/integration/advisor-timeout-hot.test.mjs` |
| 5-3 | 给超时写入非法值 abc | 被拒，回执点名该键与可消费形态；配置面读回不变 | 无 | `test/integration/advisor-timeout-hot.test.mjs` |

## CLI 6. 设计评审的文档范围按项目根受理

> 目的：仓内文档都能被设计评审读到，写错的路径当场说清怎么写。
> 节注：回指 = docs/core/requirements/ADVISOR-CONVERGENCE.md 条目 F18（判据 = docs/core/design/ADVISOR-GUARDS.md「评审文档路径与受理」）；三态（行序）= 6-1 正常 · 6-2 错误 · 6-3 错误 · 6-4 错误 · 6-5 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 6-1 | 会话锚在项目内（cwd = 项目根或其子目录）时发起设计评审，`documents` 传一份非 `docRoot` 树下的仓内文档（项目根相对形，如 `thincoder-core/tool-docs/advisor.md`） | 工具层受理（回执不是 `scope-not-doc` 拒发；异步 ack 或评审输出正常），评审读得到该文档 | — | `test/integration/review-doc-scope.test.mjs` |
| 6-2 | 同一入口，`documents` 传项目内的代码文件（如 `thincoder-core/agent-tools/advisor.mjs`） | 当场拒发：文案含 `criterion=scope-not-doc`、解析后路径、期望形两句；零评审实例、零 token、零 LLM | — | `test/integration/review-doc-scope.test.mjs` |
| 6-3 | `documents` 传绝对路径指到项目外（工作区下无项目归属的 `.md`） | 当场拒发：`criterion=scope-not-doc` + `outside-project` 拒因 + 期望形；零评审实例 | — | `test/integration/review-doc-scope.test.mjs` |
| 6-4 | 会话锚 = 工作区根（下辖两项目、根无 `PROJECT-MANIFEST.json`），`documents` 传项目根相对的 `.md` | 当场拒发：`criterion=scope-not-doc` + 拒因 `ambiguous-path`，文案报锚态、候选全列与期望形（项目根相对例 / 绝对路径）；零评审实例、零 token。反证格：`cwd` 换成下辖项目 ⇒ 同调用改判 `not-doc-file`（不再拒于基根） | — | `test/integration/review-doc-scope.test.mjs` |
| 6-5 | 会话锚 = 非项目目录（根无 `PROJECT-MANIFEST.json`、下辖 1 个项目），`documents` 传项目根相对的 `.md` | 当场拒发：`criterion=scope-not-doc` + 拒因 `ambiguous-path`，不把唯一下辖项目当根（该目录只作候选出现）；文案报期望形（项目根相对例 / 绝对路径）；零评审实例、零 token | — | `test/integration/review-doc-scope.test.mjs` |

## CLI 8. 批次档建在项目里（工作区锚报明、不落锚目录）

> 目的：会话锚是多根工作区（自身无档、下辖有项目）时，建批次档要报明项目并给路，不静默落到锚目录。
> 节注：回指 = `docs/core/design/BATCH-RECORD.md`「路径归属」∥ `docs/core/design/MANIFEST.md`「项目解析」；三态（行序）= 8-1 错误 · 8-2 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 8-1 | 夹具目录（根无 `PROJECT-MANIFEST.json`、下辖 1 个带档项目），以该目录为会话锚调 `batch` create（`path` = `docs/batches/<x>.md`） | 当场拒（throw）：文案含 `belongs to no project` + 该唯一项目绝对路径 + 显式路径指引；锚目录下零 `docs/batches` 新建、零档 | — | `test/integration/batch-anchor-create.test.mjs` |
| 8-2 | 同一夹具，以该目录为会话锚调 `batch` create（`path` = `<下辖项目>/docs/batches/<x>.md`——目标所属 ∈ 下辖集） | 正常路径不误报：档落该项目声明基底，回执路径 = 该项目内绝对路径；锚目录下零 `docs/batches` 新建 | — | `test/integration/batch-anchor-create.test.mjs` |

## CLI 10. 收口即清账（批档收口即消费该批设计凭证）

> 目的：收口成功即该批凭证不再放行写产品码；收口被拒即凭证仍活、状态行未变。
> 节注：回指 = docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md F-D7 ∥ F-D8（机制 = docs/core/design/DESIGN-TOKEN-SETTLEMENT.md）；交互组件 = `thincoder-core/agent-tools/batch-lifecycle.mjs` 收口通路 ↔ `thincoder-core/agent-tools/design-slots.mjs` 消费核 ↔ 槽文件 I/O；进入口 = 父侧经 `batch` 工具收口（工程模式）；五态 = 10-1 正常 · 10-2 错误 · 10-3 正常 ∥ 错误（核销机检三件 ∥ 存量声明档） · 10-4 正常 · 10-5 错误 ∥ 正常（核销只有一条边 · 认领三步全过）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 10-1 | 工程模式夹具里以 `batchDoc` 带批档跑一次设计评审——夹具前提 = §3 由结算落块并置位（轮次块 + 段级状态行 = `评审通过`），再调 `batch close` 收该批 | close 回执含 `[design tokens]` 且点名消费 1 枚；随后同 designId 的 eng-coder spawn 被机械拒；`design-slots` 里该槽不在 | — | `test/integration/batch-close-token-consume.test.mjs` |
| 10-4 | 工程模式夹具里以 `batchDoc` 带批档跑一次设计评审（夹具前提同 `10-1`），再调 `subagent` `action:'design-slots'` | 该槽行 `batch=<批档 basename>`（不是 `—`）；其余列零变 | — | `test/integration/batch-close-token-consume.test.mjs` |
| 10-2 | 同一夹具，把 `persistEngTokens` 注入为抛错后再 close | close 被拒且回执点名消费失败；§1 状态行字节不变；槽仍在盘（内存已回滚） | — | `test/integration/batch-close-token-consume.test.mjs` |
| 10-3 | 分别让待核销行指向已收口、未收口、未评审与带存量声明的批档：未收口那一档走 `ledger close` 与 `ledger update` 两条入口，已收口三档凭既有工作证据核销；证据负例（无证据 ∥ 空白覆盖）落在已收口夹具 | 未收口档下两条入口同拒（拒文含 `批档未收口` 且指回 `batch close`），行整笔不变；已收口三档均核销成功且 `closed_at` 落值（评审状态与存量声明行都不进归档判据）；无证据与空白覆盖均拒且整行不变 | 回指 = `docs/core/design/LEDGER.md`「锚批门」（证据负例移到 CLOSED 夹具 = 本批 delta） | `test/integration/ledger-close-proof.test.mjs` |
| 10-5 | 待讨论 / 待设计 / 在途分别直接核销；待核销正常勾销；已核销再撤回，已废弃重复撤回及再核销 | 非待核销直接核销均拒且行不变；正常链成功；两种归档态都拒绝后续归档写入，状态与时间戳不变 | 回指 = `docs/core/design/LEDGER.md`「状态机」 | `test/integration/ledger-close-proof.test.mjs` |

## CLI 13. 建批档就有台账

> 目的：`batch create` 一次调用同时成立「档」与「台账行」——不传号新建、传号接管、**先登记意图后建档则认领那一行**；已归档 / 已结账 / 他批占用的行拒；**同面有未决行时新建须声明新事**。
> 节注：回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` ∥ §2.17（13-6 档头号集一致性）∥ `docs/core/design/LEDGER.md`（13-1 前提 ∥ 13-4 同面判）∥ §6.4（13-5 预定批指针与认领）；六态（行序）= 13-1 正常 · 13-2 正常 · 13-3 错误 · 13-4 边界 · 13-5 边界 ∥ 错误 · 13-6 错误 ∥ 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 13-1 | 同面无未决行**且无预定行**时不传 `ledger` 建一档 | 台账 +1 行：`status = 在途` · `task_book` = 该档 · `trigger = 归批`；档头 `> 台账 = #N（… · 归批）` 写真实行号（无 `#<编号>` 占位） | 题设补一格：有预定行时走 13-5（认领径） | `test/integration/batch-ledger-bind.test.mjs` |
| 13-2 | 传一条 `待讨论` 行的号建一档 | 该行变 `在途`、指针回填本档；不新建行（行数不变） | — | `test/integration/batch-ledger-bind.test.mjs` |
| 13-3 | 传一条 `已核销` 行的号建一档 | 拒（拒文含 `an archived row cannot carry a new batch record`）；档零落盘；行逐列零改 | — | `test/integration/batch-ledger-bind.test.mjs` |
| 13-4 | 同一 `board` 面预置一条未决行（`待讨论`），再省略 `ledger` 建一档；随后改携 `newDebt` 重试 | 第一次拒：拒文列该行（`#<id> <status> <title>`）、批档零落盘、台账零行写入；第二次成功：档落盘、新行 `evidence` 含 `新事理由：` 前缀、本批收口回执引该理由一行 | — | `test/integration/batch-ledger-bind.test.mjs` |
| 13-5 | 先用 `ledger add` 登记带值尾标记 `（预定）` 的意图行（所指档未建），再 `batch create` 建该档；另跑「同值去标记」「标记指在盘档」「两条预定行指同一档」三支 | 登记通过、`taskBookOnDisk = false`；去标记 ⇒ 拒（既有串逐字）；标记指在盘档 ⇒ 拒（点名「标记多余」）；建档 ⇒ **认领同一行**（不开新行）、指针变规范形、行 `在途`、档头写认领到的号；两条指同一档 ⇒ `create` 拒并逐行点名、批档零落盘 | — | `test/integration/batch-ledger-bind.test.mjs` |
| 13-6 | 已建档且一条 `在途` 行绑在该档；`attach` 补第二行后把它退回解绑，再往档头加缺号；另以 `onWrite` 置只读 + UPDATE 触发器执行真实 attach 双失败；`check` 后从档头删号 | 行仍存在但已解绑不命中；缺号与真实 attach 残态均 ⇒ `consistent = false`、`headerRows` 点名 `inLedger = false`、命中 `header-row-missing` 并给删号主路径与 `attach` 次路前置；删号后本批仍有 1 行 `在途`，六类均不命中、`consistent = true` | 回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「attach」∥「一致性读数」 | `test/integration/batch-ledger-bind.test.mjs` |

## CLI 14. 评审过、完成清单收口、重开回、被取代冻结

> 目的：`§5` 只在评审通过后开写；两条收口通路都以 `completed` + `closeEvidence` 明确完成行，**一次收口即结算**（点名行两跳至 `已核销`、既有 `待核销` 行一并结清）；台账写失败 ⇒ 档回滚 + 拒（不静默成功），半状态可用 `batch check` 查出来；重开把 `待核销` 行带回工作位；对象已消失、永不实施的批由 `supersede` 冻结（命名取代者，不伪造 §3/§4/§6）。
> 节注：回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「实施与关闭门」∥「收口重锚」∥「重开回收」∥「一致性读数」∥「写序与补偿」与 `docs/core/design/LEDGER.md`「批档与台账双向收口」∥ `docs/core/design/BATCH-RECORD.md`；十四态（行序）= 14-1 错误 · 14-2 错误 · 14-3 正常 ∥ 错误 · 14-4 正常 · 14-5 正常 · 14-6 正常 · 14-7 错误 · 14-8 错误 · 14-9 正常 ∥ 错误 · 14-10 正常 ∥ 错误 · 14-11 错误 · 14-12 错误 · 14-13 正常 ∥ 错误 · 14-14 正常 ∥ 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 14-1 | `§3` 无结论时以 eng-coder 绑定 append `§5`；父侧派设计评审后评审 `append §3` 写一笔无裁定行（`batch append §3` ↔ `§3` 写入闸）；再夹具直写一笔含无裁定块的存量档（不经工具）并置 `§3 = 评审通过`，重试 `append §5`；最后补一块携 `VERDICT: pass` 的轮次块重试 | 第一次拒（拒文含 `§5 append refused`，§5 字节不变）；工具写无裁定行的 `§3` ⇒ 拒（拒文逐字 = `R-G3`，档字节不变、轮次块数不变）；存量无裁定块 ⇒ `append §5` 拒（拒文逐字 = `R-G2b`，块内裁定 = 无裁定行）；末块携 pass 裁定 ⇒ 写入成功。服务条目 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「评审状态」∥「实施与关闭门」 | — | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-2 | `§3` 非 pass 时 `batch close` | 拒，拒文含 `§3 状态行 = …，须 = 评审通过`；§1 状态行字节不变 | — | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-3 | 换一个会话（ctx 无槽 / 无 designId）用 `ledger close`：先核销一条指向未收口档的待核销行，再核销一条指向已收口档的同形行；另以未收口档执行在途行的放弃边 | 换会话不绕过锚批门：未收口 ⇒ 拒（拒文指回 `batch close`）、行整笔不变；已收口 ⇒ 放行；放弃边在未收口档拒且点出「先退回 待讨论」 | 回指 = `docs/core/design/LEDGER.md`「锚批门」 | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-4 | `batch close` 一个含 1 行 `在途` + 1 行 `待讨论` 的批，先携空 `completed`（并携证据），再点名在途行并携 `closeEvidence` | 空清单在写档前拒绝，令牌、批档、台账不变；点名行**同笔两跳至 `已核销`**、未动行落 `条件`；回执逐行点名该行（`在途 → 待核销 → 已核销`），无默认推进文案；末尾带 `[ledger consistency]` 一行 | — | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-5 | `batch status` 写 §1 `已收口`，先漏列在途行（仍携证据），再携其 id 与 `closeEvidence` | 与 close 共用预检和重锚；漏列时令牌、批档、台账不变；点名后同笔结清、`evidence` 带 `收口 <日期>：` 前缀，回执无默认推进与替行主人判断的文案 | — | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-6 | 以 `completed` + `closeEvidence` 收口后，用 `ledger update` 造一条 `待核销` 行（收口即结算，行已是归档终态），把它手工回退到在途并显式传旧 executor，再回待核销并以 `batch status` 重开（`§1 → 进行中` + note）；随后先不带号写产品码，再带重开那条在途号写同一目标 | 手工回退与重开后 executor 均为当前会话，显式旧值不覆盖；重开回执第一行点名 1 行；不带号写 ⇒ 拒且文件零改；带号写同一目标 ⇒ 照写 | 题设改写：收口后行已 `已核销`（重开不回收），夹具只能靠 `ledger update` 手工推进 | `test/integration/batch-gates-ledger.test.mjs` |
| 14-7 | 收口后造一行 `待核销` + 一行 `已核销`（后者建后核销），再重开 | 前者 → `在途`、后者零改；回执两行（待核销行回收 1 行 / 已核销行不可回收逐 id 点名 2 行） | 题设改写：收口即结算 ⇒ 两态并存只能在收口之后造 | `test/integration/batch-gates-ledger.test.mjs` |
| 14-8 | 一批已 in 一轮 `pass`（§3 状态行 = `评审通过`）后，同一批判 `changes-required` 并 append `§3` 打回；随后 `append §5`；再 `status` 置 `评审通过` 后重试；最后追加一块携 `VERDICT: pass` 的 `§3` 轮次块重试 | 打回那一笔同时改 §3 状态行**字节** → `进行中（第 N 轮打回）` 并在本轮块首留痕；`append §5` 被拒（拒文含 `§3 状态行 = 进行中，须 = 评审通过`，§5 字节不变）；`status` 单写仍拒（`R-G2b`：末块仍携 `VERDICT: changes-required`）；补块 ⇒ `append §5` 放行 | — | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-9 | 在途行与待核销行分别退回待讨论，先缺理由 / 空白理由，再携本笔理由 | 缺理由均拒且整行不变；成功后 executor / task_book / trigger 清空、created_at 保持、理由追加 evidence，工具回执带 `reason` | — | `test/integration/batch-gates-ledger.test.mjs` |
| 14-10 | 批含 1 行 `在途` + 1 行父侧已置 `待核销` + 1 行 `待讨论` + 1 行 `待设计`（`trigger = 认账不排期`）：先以三种空白 `closeEvidence` 收口，再一次收口携 `completed` + 证据 | 三次空证据均在写档前拒、档字节与台账零改、令牌未消费；一次收口后前两行都 `已核销`、证据带收口前缀；`待讨论` 行状态不动而 `trigger = 条件`，`认账不排期` 行零触；回执两种起点各一行；正常收口后 `check` 不命中 `closed-but-open-rows`、`consistent = true` | — | `test/integration/batch-gates-ledger.test.mjs` |
| 14-11 | 第二连接持台账写锁后 `batch close`，放开锁后 `check` 与重试；再以 `onWrite` 置只读 + 持锁分别执行「点名在途」「`completed: []` 待重锚」「`completed: []` 非空全归档」三次补偿失败收口并读 `check` | 回滚成功时拒文逐字 = 新第一条串、档账与 `check` 读数回到写前；重试成功。前两种残态命中 `closed-but-open-rows`；全归档且档头不缺号 ⇒ `record = closed · consistent = true`，不重开、不重试 | 回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「close」∥「一致性读数」；补偿失败用 `onWrite` 同步置只读作确定注入 | `test/integration/batch-gates-ledger.test.mjs` |
| 14-12 | 收口后造一条 `待核销` 行，记录重开前 `check`；持写锁重开，放开锁后复读；再以 `onWrite` 置只读 + 持锁执行补偿失败重开并 `check`，修复后重开；另以非空全归档起点执行失败重开 | 重开拒、拒文逐字 = 新第一条串、档回到已收口字节、行仍 `待核销`，`check` 与重开前逐项相等并点名旁行原态 `closed-but-settling`；修复后重开成功；残态命中 `open-but-unwritable`；全归档起点回滚后读数逐项相等且 `consistent = true` | 回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「reopen」∥「一致性读数」 | `test/integration/batch-gates-ledger.test.mjs` |
| 14-13 | 全归档批（先正常收口结清行，再重开 ⇒ 档 open、行全归档）：分别以 `close` 与 `status` 写 §1 已收口补关；再以未签字的在途行现场与「全归档 + 档头号不在账」两种现场试补关 | 两路均补关成功：档冻结、§1 段尾落一行 `**补关记录**`（行数 +1、其余字节不变）、回执出 `[ledger repair]`、台账行字节不变，`check` 的 `open-but-settled` 读形补关后消失；在途行现场 ⇒ 链门照拒（档账零改）；额外半状态 ⇒ 补关拒、逐项点名半状态并指回 `batch({action:"check"})` | 回指 = `docs/core/design/LEDGER.md`「补关」∥ `docs/core/design/BATCH-RECORD.md`「收口分流」 | `test/integration/batch-gates-reanchor.test.mjs` |
| 14-14 | 一本 §5 空、行 = 3 `待核销` + 8 `在途` 的批档（对象已消失、永不实施）调 `batch({action:"supersede"})` 并点名取代者；再以同形档试四种拒面（取代者空白 ∥ 解不到 ∥ 指回本档 ∥ 行集全归档）与 `completed` 点名的正路 | 状态行变 `已收口 <日期>（被取代）`、§1 段尾落 `**取代记录**`、§3/§4/§6 逐字节不变、此后 `append` 拒；3 行结清为 `已核销`（证据带 `收口 <日期>：` 前缀）；8 行退回 `待讨论` 并改挂 `条件`（续启句入 `resume_when`，`task_book` / `executor` 清空）；`check` 读一致。空白 ∥ 解不到 ∥ 指回本档 ∥ 全归档 ⇒ 各拒并点名（全归档指回 `close` / 补关），档账零改；`completed` 点名的那条结清、其余退回 | 新增（回指 = `docs/core/design/BATCH-RECORD.md` ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md`） | `test/integration/batch-gates-reanchor.test.mjs` |

## CLI 17. 评审记录落进批档才签发（块写不进 ⇒ 拒签、档零字节）

> 目的：评审通过后由结算把轮次块与段级状态行写进批档 §3——写不进即拒签、档字节零变；而没有批档绑定的设计评审根本发不出去（批次档是评审的前提，不是纸张）。下游 spawn 拿不到授权（代价不落到实施席头上）。
> 节注：回指 = `docs/core/requirements/ADVISOR-CONVERGENCE.md` F11 ∥ F20；机制单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.2「§3 记录与结算判据」∥「点火顺序」∥「账链门」；交互组件 = 准入面（`advisor` 工具入参门）⟷ 账链面（台账库读取）⟷ 结算面（`settleDesignReview`）⟷ 批档 §3 读写 ⟷ spawn 门 ⟷ 槽清点；进入口 = 父侧发设计评审（工程模式 depth-0）→ 读回执 → 派 eng-coder；三态（行序）= 17-1 错误 · 17-2 错误 · 17-3 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 17-1 | 工程模式设计轨夹具，批档 §3 无轮次块、无段级状态行，结算直接进场（评审席在工程模式没有 §3 通道）。正半幅 = 回 pass 的评审；失败半幅 = 注入块写失败后跑同一调用 | 正半幅 = §3 落本轮块 1 块（块内结算头点名已签发）、段级状态行 = `评审通过`、同 designId 的 spawn 门放行；失败半幅 = 不签发、回执含 `review record incomplete`、档字节 = 写前（零字节）、同 designId 的 eng-coder 机械拒 | — | `test/integration/advisor-record-gate.test.mjs` |
| 17-2 | 不带 `batchDoc` 的设计评审（`documents` 只放设计档） | 当场拒发：回执首行点名 `batchDoc` 必填（标识行 `criterion=batchdoc-missing`）+ 两条期望形 + 无档时先 `batch create` 的下一步；拒发登记；跑前跑后槽数不变、零评审实例、零 LLM；随后同 designId 的 eng-coder spawn 因无授权被机械拒 | 修前红 = 准入判据未落地 ⇒ 不带 `batchDoc` 照常签发——本行断言的就是那条已退场的旧行为 | `test/integration/advisor-record-gate.test.mjs` |
| 17-3 | 批档的未决行已被撤（`已废弃`）后，携该 `batchDoc` 发设计评审 | 拒发：回执含 `criterion=batchdoc-no-ledger` ∧ `reason=no-pending-row` ∧ `Record:` 读数 `unsettled: 0`；零实例 / 零 token / 零 LLM。反证格 = 另一本带未决行的批档发同调用 ⇒ 放行 | 修前红 = 账链门未落地 ⇒ 未决行被撤后照常发评审、token 照签而无收口能收 | `test/integration/advisor-record-gate.test.mjs` |

## CLI 20. 一本批档只服务一个并发 spawn

> 目的：同一本批档同时只有一个写者——第二席被拒、点名占用者，而不是两边都写坏档。
> 节注：回指 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`（判据 ∥ 拒因文案）· 集成行设计 = 同档；机制单源 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`；交互组件 = spawn 门（`buildSpawnChild`）⟷ 异步池在飞表（`getAsyncPool`）⟷ 第二席的返回；进入口 = 工程模式父侧并发派两席共一本批档；两态（行序）= 20-1 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 20-1 | 工程模式父侧并发派两席共一本批档：第一席 async 在飞，紧接着派第二席（同一 `batchDoc`） | 第二席被拒，返回文本点名该批档路径、占用者 `<role>#<id>` 与其 status，并给可执行下一步（等其 settle ∥ cancel 它）；第一席照常交付、档上只有一套写者。**修前红**：两席都被接受 | ① 只断第二席被拒 + 点名 + 池面不变（池内仅第一席、其条目零改、队列空）；「第一席照常交付」需真 LLM 子代理，夹具以池条目字面量代其在场（形态所限的收窄，非省事）。② 集成桩 `subagent-*` 侧 | `test/integration/batchdoc-reuse-guard.test.mjs` |

## CLI 21. 跨项目读账读的是目标项目

> 目的：进程锚与目标项目不同时，`ledger list --json` ∥ ACP `ledger/list` ∥ `ledger/count` 读的是目标项目的行与数——不是空账，也不是进程锚那个项目的。
> 节注：回指 = `docs/cli/requirements/READ-DATA-INTERFACE.md`「CLI」∥「ACP」（载荷形 = `docs/cli/design/READ-DATA-INTERFACE.md`「CLI」∥「ACP」）；机制单源 = `docs/core/design/LEDGER.md`「库键与项目根」；交互组件 = 命令面 runner（`thincoder-core/ledger-read.mjs` `runLedgerList`）∥ ACP 两出口（`thincoder-cli/src/acp/read-data.mjs` `ledger/list` ∥ `ledger/count`）⟷ `ledgerExport` ∥ `ledgerCount` ⟷ 根推导界 ⟷ 键控库读取；进入口 = 进程锚 ≠ 目标项目时跑 `thincoder ledger list --json --cwd <目标项目>`；四态（行序）= 21-1 正常 · 21-2 边界 · 21-3 正常 · 21-4 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 21-1 | 夹具项目 A ∥ B 各在台账建行；`process.chdir(A)`，再跑 `ledger list --json --cwd <B>` | 退出码 0 · 单段 JSON · `projects.length === 1` · `projects[0].root` = B · 行 id 集 = B 的行 · 零 A 行 · `schemaVersion` = 3（现行结构的载荷值） | 缺口来源 = 修前 `{"projects":[]}` → 修后 1 项 / 1 行 | `test/integration/ledger-read-cross-project.test.mjs` |
| 21-2 | 同一 A 锚，`--cwd <带档但无台账库的项目>` | 退出码 0 · `projects` = `[]` · stderr 零行——空账不改成抛 | 回指 = `docs/cli/requirements/READ-DATA-INTERFACE.md`「CLI」的「无台账返回空 projects 和 exit 0」；夹具两项 = 目标带 `PROJECT-MANIFEST.json`、键控库不在盘 | `test/integration/ledger-read-cross-project.test.mjs` |
| 21-3 | 同 21-1 的进程锚与目标，走 ACP `ledger/list`（`params.cwd` = B） | 回包与 CLI 载荷深等：1 项 · 根 = B · 行集 = B 的行 · 零 A 行 | 业务入口 = 扩展拉取选中项目的台账；缺口来源 = 同一缺陷的第二出口（ACP 读账） | `test/integration/ledger-read-cross-project.test.mjs` |
| 21-4 | 同 21-1 的进程锚与目标，走 ACP `ledger/count`（`params.cwd` = B，会话锚 = A） | `count` = B 的未决四态行数（≠ 0）· `overdue` ∥ `evidenceTooLong` 与 B 的读数一致 | 缺口来源 = 用户 2026-10-28 13:06 裁定 A（`count` 的界跟 `list`）；现行 `thincoder-cli/src/acp/read-data.mjs` 走 `ctx.getCwd()` ⇒ 修前回 0 | `test/integration/ledger-read-cross-project.test.mjs` |

## CLI 24. 评审的方法论符合度不再恒空

> 目的：项目声明了标准层（一个目录），评审就拿到层内正文、按它判方法论；没声明 ∥ 声明了读不到，各自说清是哪一种——不再对任何项目都空着。
> 节注：回指 = `docs/core/requirements/ADVISOR-CONVERGENCE.md`「项目上下文注入」（未声明与不可读必须区分，24-2 与 24-3 的负向锁断在这里）；判据 ∥ 文案单源 = `docs/core/design/MANIFEST.md`「标准层」；交互组件 = 项目数据档 `docRoot.standards`（目录层）→ 数据档读取 → 层读取 → 注入器 → 评审消息组装面；进入口 = 工程模式会话里对一本批档发起一次设计评审（`batchDoc` 绑定）；三态（行序）= 24-1 正常 · 24-2 错误 · 24-3 边界 · 24-4 正常 · 24-5 错误 · 24-6 正常 · 24-7 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 24-1 | 夹具项目声明 `docRoot.standards` = 一个在盘目录（层内一份标准档），在该项目里发起一次设计评审 | 评审消息组装面含 `## Project Standards` + 用途句 + 该档定位注（绝对路径）+ 该档正文首行；返该档绝对路径 | — | `test/integration/review-standards-injection.test.mjs` |
| 24-2 | 同一夹具把声明值改成不存在的路径，再发起一次设计评审 | 注入面出现态 2 句（含该声明路径字面 + `no such directory`），**且与 24-3 的句子不等**；零正文注入 | — | `test/integration/review-standards-injection.test.mjs` |
| 24-3 | 同一夹具删掉该键（或整档），再发起一次设计评审 | 注入面出现 `NO_STANDARDS_NOTICE`；零正文、零路径字面、零 `declared` | — | `test/integration/review-standards-injection.test.mjs` |
| 24-4 | 同一夹具层内放两份档（`b.md` · `a.md`），再发起一次设计评审 | 两份正文都在，且注入序 = `a.md` 在前（层根相对路径码点序——同目录即名序） | — | `test/integration/review-standards-injection.test.mjs` |
| 24-5 | 把声明值改成一个文件路径（旧值形），再发起一次设计评审 | 出现态 2 句含 `not a directory`；零正文；评审照常收尾（不抛） | — | `test/integration/review-standards-injection.test.mjs` |
| 24-6 | 夹具层内建一个子目录，把一份标准档放进该子目录，再发起一次设计评审 | 该档正文与绝对路径定位注都在评审消息里（层内成员递归）；注入序按层根相对路径码点序 | — | `test/integration/review-standards-injection.test.mjs` |
| 24-7 | 夹具 = 工作区锚（无数据档、有 AGENTS.md）+ 其下子项目（数据档声明 docRoot.standards，子项目内有 docs/README.md），设计档在子项目内；agent.cwd = 锚，发起一次设计评审 | 评审消息 `## Project Standards` 段含该标准档正文与绝对路径定位注、不含 NO_STANDARDS_NOTICE，**且** `## Document Map` 段含子项目 docs/README.md 正文、不含 NO_DOC_MAP_NOTICE | — | `test/integration/review-standards-injection.test.mjs` |

## CLI 27. 状态行由工具置位，不另调 status

> 目的：绑了批档的评审不必记得再签一次 `status`：设计轨的轮次块与段级状态行都由结算在同一笔里写（评审席没有 §3 通道）；代码轨由评审自己 `batch append §3`，段级状态行仍由工具同笔置位。漏签不再白跑一轮评审。
> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`「评审记录」；机制 + 判据单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「评审状态」∥「实施与关闭门」∥ `docs/core/design/BATCH-RECORD.md`「§3 评审记录」∥「评审通过与凭证」∥「状态行：主动 status 与被动同笔写」；交互组件 = `batch append §3`（代码轨评审的建块轨；块内改写仍走同档「edit」的段内精确替换，`thincoder-core/agent-tools/batch.mjs`）⟷ §3 段级状态行（`updateSectionStatusLine`）⟷ 结算面（`settleDesignReview`）∥ `§5` 写入门（`assertSectionFiveGate`）⟷ §2／§5 写正文那一笔（eng-designer ∥ eng-coder）⟷ 段头区状态行；进入口 = 设计轨由父侧派设计评审（工程模式 depth-0，`batchDoc` 绑定）→ 读回执 → 派 eng-coder（与 17-1 同一入口、同一格回执），代码轨由父侧对工具面批 fire 一轮评审（`batchDoc` + `documents` 同档），写出段由 eng-designer ∥ eng-coder 经 `batch append` 写自己那段；两态（行序）= 27-2 正常（工程模式代码轨 · 异常格 = 工程设计轨）· 27-4 正常 ∥ 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 27-2 | 工具面批夹具（交付件全在仓根 `scripts/**`、无设计档），工程模式。父侧 fire 一轮**代码轨**评审，携 `batchDoc` = 本批批次档、`documents` = 同档、`paths` = 交付件 | 评审员工具表含 `batch`（请求体 `tools` 里有该名）⇒ 它把 §3 写进绑定档、轮次块 +1、段级状态行由工具置位成 `评审通过`；两次模型请求（工具调用 + 收尾）、回执带回模型文本；收口门与核销门随后放行 | 同一夹具走工程模式**设计轨** ⇒ 工具表不含 `batch`、`§3` 对调用者关闭、§3 零块且无段级状态行（fail-closed） | `test/integration/batch-status-auto-set.test.mjs` |
| 27-4 | 先给 §2 写一笔只含占位行的正文，再由 eng-designer 写一笔非空正文（全程不调 `status`）；随后代码轨评审写 §3，eng-coder 写一笔非空 §5 正文 | 占位行那一笔 ⇒ §2 状态行不动（仍缺）；非空正文那一笔 ⇒ 回执点名 `状态行 = 设计完成`、§2 段内 = `设计完成`；写 §5 正文那一笔 ⇒ 回执点名 `状态行 = 实施完成`、§5 段内 = `实施完成`；四条段级状态行四值齐备（`进行中` ∥ `设计完成` ∥ `评审通过` ∥ `实施完成`），§1 不动 | — | `test/integration/batch-status-auto-set.test.mjs` |

## CLI 51. 台账查询分页：每页十条，翻页仍读同一本账

> 目的：`ledger({action:"query"})` 候选超过十条时只把当前页交给模型，尾行给出「总数 + 本页位次 + 下一页命令」；照抄尾行整条翻页仍是同一本账（过滤不丢、总数不变）；`count` 与页总数各按自己口径成立。
> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` `AC-M2-41`；机制 + 判据单源 = `docs/core/design/LEDGER.md`「分页」；交互组件 = 工具面 `query` 分支（`thincoder-core/ledger-tools.mjs`）⟷ 核 `ledgerQuery`（`thincoder-core/ledger-cmd.mjs`，仍回全量）⟷ 键控库读；进入口 = 模型调 `ledger({action:"query"})`；用例 = 51-1（正常 ∥ 边界 ∥ 错误同一条：首回 ∥ 连翻 ∥ 带过滤翻页 ∥ 末页 ∥ `count` 另一本账 ∥ 游标形不合被拒）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 51-1 | 夹具项目种 30 行（25 条技术待办 + 5 条需求，其中 3 条撤回 `已废弃`），调 `ledger({action:"query"})`；再按尾行给出的命令（回显的过滤 + `cursor` 整条照抄）连翻；另带 `kind` 过滤重复一遍；调 `ledger({action:"count"})`；最后把尾行游标截断（丢 `|`）再调一次 | 无过滤首回恰 10 行 + 尾行「共 30 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页」；照抄尾行 ⇒ 第 2 页 10 行、`<N>` 不变；带 `kind` 过滤命中 25 行 ⇒ 仍 10 行一页、三页全是该过滤集、`<N>` 恒 25、末页 = `已到末页`；`count` = 27（只数未决四态）≤ 页总数 30；游标截断 ⇒ 拒（拒文含 `cursor 非法`）、不回首页、行集零返回；形对而游标落在末行之后 ⇒ `共 30 行 · 本页无行` | 无 | `test/integration/ledger-query-paging.test.mjs` |

