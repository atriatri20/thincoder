# RTM 分册 · guard

> 本册护的机制 = 门与判据引擎（doc_check ∥ 写门 ∥ 收口门 ∥ 行号坐标 ∥ 状态行 ∥ 台账行绑定）；族表与归属判据 = docs/core/design/TESTING.md §11.18.3。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 7. 收口只判本批改过的档

> 目的：收口门判的只是本批笔域集（含本批批档自身）——范围外的脏档不拦收口，也不进回执；两条判据不分适用面，工具描述面同样受段长约束。另有一道与本门并行的前置：**本批改面单测档仍在盘 ⇒ 拒收口**（单测零留存，判据见行 7-4）——这一道判的是「该删的删了没」，与本门判的「改过的档干净不干净」是两件事。
> 节注：回指 = docs/core/requirements/DOC-CHECK.md F9 ∥ AC-7（AC-2 为其范围面）∥ F13 ∥ AC-11（行 7-12 的判据）∥ F3（行 7-13 的判据）∥ F14 ∥ AC-12（行 7-14 的判据）∥ F16 ∥ AC-14（行 7-15 的判据）∥ docs/core/design/TESTING.md §3.5（行 7-4 的判据）；机制单源 = docs/core/design/DOC-DISCIPLINE.md §3.20「结构兜底」；交互组件 = `batch` 工具（append ∥ edit ∥ close）⟷ `runBatchGate`（范围 + 强制集）⟷ `doc-check` 引擎（锚 ∥ 段判据）；进入口 = 真 `batch` 工具调用（收口 = depth-0 ∥ 写段 = 子代理 append ∥ §2 改写 = 设计席 `edit`，写完的 §2 段体作 `pending` 进机检门；不直调 `runBatchGate`）；行 7-14 的交互组件与进入口另属写盘面 = `write-path.writeThroughPath`（`op === "write"` 调门）⟷ `doc-write-gate.runDocWriteGate`（改后整份内容走 `texts`、判定区走 `zones` ⇒ `doc-check` 锚判据），进入口 = 真 `edit` ∥ `write` 工具写一篇设计档；十九态（行序）= 7-1 正常 · 7-2 边界 · 7-3 错误 · 7-4 错误（本批单测档仍在盘）· 7-5 边界（段判据的围栏语义——嵌套围栏不入段；缺口来源与回指见该行）· 7-6 错误（收口面命中批档自身）· 7-7 正常（收口面含批档自身且放行）· 7-8 错误（写段面命中候选文本）· 7-9 错误（工具描述面：锚与段两条同时拦）· 7-10 正常（§2 就地改：目标行换掉、其余行逐字节不变；锚不唯一 ⇒ 拒）· 7-11 错误（收口面：声明一律拒 ∥ §3 状态词臂无条件）· 7-12 错误（写段面：候选文本里的引文与所指档不逐字一致 ⇒ 拒；改逐字后同一笔放行）· 7-13 正常（中文项目符号列表：`·` ∥ `•` ∥ `①` 三族各五项的档放行 ∥ 去标记的 400 字对照档照拒——段判据认得出列表项，阈值没动）· 7-14 错误（写盘面：设计档直写盘带悬空档名 ⇒ 拒写、目标档字节逐字不变；改成在盘全路径后同一笔落盘）· 7-15 正常（批档面互引不判：批档引已删的本批单测档 ⇒ 收口放行；同一指针写进设计档 ⇒ 仍判 `档缺`；`report` 面留痕一行）· 7-16 正常（写段与收口均判改动区：存量只出统一读数；改动区自带悬空 ⇒ 拒写）· 7-17 边界（批档 edit 替换区外存量不阻、区内失效引文照拒）· 7-18 边界（只动围栏内空行 ⇒ 改动区 → 判定区 → 阻断集、放行）· 7-19 边界（收口批级改动区；区未定 ⇒ 整档判）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 7-1 | 在夹具项目里跑一次 `batch` 收口，本批笔域集内各档零命中 | 收口放行，回执含 `[doc-check gate] DOC-CHECK GATE: PASS` 行（verdict 为 gate 段首行；close 回执首行 = 状态句），范围行档数 = 笔域集档数 | — | `test/integration/batch-close-gate.test.mjs` |
| 7-2 | 同一夹具，工作树里放一档范围外的档且含悬空指针，再收口 | 该档不入判、收口放行、回执零该档行（连档名都不出现） | — | `test/integration/batch-close-gate.test.mjs` |
| 7-3 | 同一夹具，把本批笔域集内一档的悬空指针放进本批改动区再收口；另备同档存量悬空、本批未改它的一格再收口 | 前半收口被拒（throw），§1 状态行字节不变；后半收口放行并出一行 `存量命中 1 条（不属本次改动区，不阻断交付；整档读数）` | — | `test/integration/batch-close-gate.test.mjs` |
| 7-4 | 同一夹具，收口前在批档同目录放本批自己的单元测试档 `<批档名>.test.mjs`（另备前缀变体 `<批档名>-extra.test.mjs`，盘上无 `<批档名>-extra.md`），再收口 | 收口被拒（throw）：拒串点名该档绝对路径 + 修法（删）；§1 状态行字节不变；删档后同跑收口放行 | — | `test/integration/batch-close-gate.test.mjs` |
| 7-5 | 夹具项目里放一档**嵌套围栏档**（外层四反引号包内层三反引号、内层代码合计 &gt;300 字），入本批笔域集，跑一次 `batch` 收口；另起一份夹具，把同长度**无围栏正文**对照档放进笔域集，同跑收口 | 嵌套围栏档 0 命中（其内代码不入段）· 收口放行；对照档命中 1 条（`clazz` = 文字太长）· 收口被拒——两半都成立才算过 | 缺口来源 = 2026-10-27 围栏闭合判定缺陷；回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7 · `docs/core/design/DOC-DISCIPLINE.md` §3.18「围栏行止」· §5 A-DD27 | `test/integration/batch-close-gate.test.mjs` |
| 7-6 | 夹具批档 §1 含一条带目录段、仓根相对、**不在批档根下**的悬空路径，跑一次 `batch close` | 收口被拒（throw）：拒串首行 `DOC-CHECK GATE: REFUSED`、命中行带 `§1（作者：主 agent）`；§1 状态行字节不变 | 探针带目录段 = 批档面互引不判之后裸名在批档面内被豁免（带目录段只走候选 ① ⇒ 面判不成立、照判 `档缺`）；回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7 ②（收口面含批档自身）；判据 = `docs/core/design/DOC-DISCIPLINE.md` §5 A-DD31 ③；用例号 = DD-129 | `test/integration/batch-close-gate.test.mjs` |
| 7-7 | 同一夹具，批档干净、笔域集各档干净，跑一次 `batch close` | 收口放行；回执 `[doc-check gate] DOC-CHECK GATE: PASS · 范围 N 档`，N = 实判档数且 ≥ 1（批档自身在内） | 回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7 ②；判据 = `docs/core/design/DOC-DISCIPLINE.md` §5 A-DD31 ④（判域恒非空）；用例号 = DD-135 | `test/integration/batch-close-gate.test.mjs` |
| 7-8 | 子代理 append §2，候选文本带一条带目录段、仓根相对、不在批档根下的悬空路径；随后改成在盘全路径再 append 一次 | 第一次被拒：命中行点名 `候选文本第 N 行`（N 与提交的那段文本逐行对得上）、且点名批档本体；批档字节逐字不变（零字节落盘）；第二次落盘，前文零变 | 探针带目录段 = 同 7-6 的理（裸名在批档面内被豁免）；回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7 ①（写段面强制集 = 候选文本）；判据 = `docs/core/design/DOC-DISCIPLINE.md` §5 A-DD31 ⑥；用例号 = DD-130 | `test/integration/batch-close-gate.test.mjs` |
| 7-9 | 夹具项目里放一档 `<夹具根>/thincoder-core/tool-docs/x.md`（内含一段 400 字符 + 一个解析不到的裸档名），入本批笔域集，跑一次 `batch close` | 收口被拒（throw）且拒因**锚与段两条同时点名**（命中行分别指向该裸档名 ∥ 该 400 字符段）；只删裸档名后同跑仍拒（段那条）；拆成两段后放行 | 回指 = `docs/core/requirements/DOC-CHECK.md` F3「判据不分适用面」· 判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.18 条 7 ∥ §5 A-DD35 判据 ①；缺口来源 = 改工具描述档一句文案，写段与收口被段判据拦下；用例号 = DD-137 ∥ DD-138 | `test/integration/batch-close-gate.test.mjs` |
| 7-10 | 工程模式设计席对一本在飞批档的 §2 作一次更正（把一行已作废的判据就地换掉）：`batch({action:"edit", segment:"§2", oldText, newText})`；随后同一句在 §2 出现两处时再改一次 | 第一次：回执点名替换字符数、机检门 `PASS`；**§2 那一行被换掉、其余行逐字节不变**（行数不变、旧行不残留——不留「以本节为准」指针）。第二次：拒（锚不唯一 + 点名命中行号），档字节一字不动 | 回指 = `docs/core/design/BATCH-RECORD.md` §4.19 ∥ §4.8 BR-77 · BR-78；本行起因 = 一份已收口批档的验收表留着已作废的判据，实施席照表落笔会把已删的分支写回来 | `test/integration/batch-edit-spec-section.test.mjs` |
| 7-11 | 夹具批档 §1 段体带一行 `> 不适用：§3 —— <理由>`（存量声明档的形态），跑一次 `batch close`；另起一份夹具，§2 / §3 / §4 / §6 各有内容但 §3 没有 `**状态行**：` 行，再跑一次 `batch close` | 前半：收口被拒（throw），拒串点名「声明已停用」+ 该行原文，§1 状态行字节不变；后半：收口被拒，拒串点名 `§3 状态行 = （无状态行）`且不提声明路——两半都成立才算过 | 回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6（声明机制退役 ∥ 收口门 §3 臂无条件）∥ §4 决策 28；缺口来源 = 同一份档：收口门认声明、核销门不认，用户 16:24 裁定一律封掉 | `test/integration/batch-close-gate.test.mjs` |
| 7-12 | 夹具项目内跑一次子代理 `batch({action:"append"})`，其**候选文本**里带一行 `依据 <在盘档>「<改了一个字的引文>」`——错引文写在这一次被写的正文里，不是写在别人已落盘的档里；随后把引文改成逐字再跑同一笔 | 写段被拒（throw），拒串首行逐字 `DOC-CHECK GATE: REFUSED（命中 1 条——候选文本（锚 1 条））` ∧ 命中行含 `✗ 锚·引缺 <批档本体> 候选文本第 N 行` ∧ 批档字节逐字不变；改逐字后同一笔放行、回执行 `DOC-CHECK GATE: PASS` | 回指 = `docs/core/requirements/DOC-CHECK.md` F13 ∥ AC-11；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.25「集成测试差量」∥ §5 `A-DD39` ⑩；缺口来源 = 两例真实事故（把一个不存在的条文挂到档名下 ∥ 把代码注释当契约） | `test/integration/doc-check-citation.test.mjs` |
| 7-13 | 夹具项目里放三份中文项目符号档（`·` ∥ `•` ∥ `①` 各五项 · 每项约 80 字）入本批笔域集，跑一次 `batch close`；另起一份夹具，把同内容去标记的对照档（400 字一段）放进笔域集，同跑收口 | 前半：三份中文列表档零命中 ⇒ 收口放行、回执含 `[doc-check gate] DOC-CHECK GATE: PASS`；后半：对照档命中 1 条 `文字太长，难于阅读` ⇒ 收口被拒（throw）、§1 状态行仍「进行中」——两半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F3（判据 = 锚 + 段长，400 字超阈口径不变）；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.18「集成测试差量」∥ §5 A-DD27 ⑧；缺口来源 = 用户 2026-11-04 报告：中文项目符号列表被写门拦下（合法文档进不来） | `test/integration/batch-close-gate.test.mjs` |
| 7-14 | 夹具项目内用 `edit` 往一篇设计档写一笔含悬空档名的文本；随后把那个名字改成在盘全路径、再写同一笔 | 前半：写调用被拒（throw），拒串首行逐字 `DOC-CHECK GATE: REFUSED（锚 1 条）` ∧ 命中行点名**目标档自身**的坐标 ∧ 判面行点名本笔改动区与判定区 ∧ 目标档字节逐字不变；后半：同一笔落盘成功、目标段之前逐字不变——两半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F14 ∥ AC-12；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.26 ∥ §5 `A-DD40` ③⑤；缺口来源 = ① 业务场景：设计 / 需求档直写盘没有门，坏字当场进盘 ② 生产真出过的同类问题：规范档绕过批档工具直接改，轮末才发现 | `test/integration/doc-write-gate.test.mjs` |
| 7-15 | 夹具批档 §5 写着本批单测档的仓根全路径，该档落盘后删掉，跑一次 `batch close`；另起一份夹具，同一指针写进一篇设计档，调 `doc_check({mode:"gate", docs:[设计档]})`；再对第一份夹具的批档调 `report` | 前半：收口放行、回执含 `[doc-check gate] DOC-CHECK GATE: PASS`（目标已删仍不判——死锁消失）；中半：仍 `REFUSED`、命中行 `✗ 锚·档缺`（规范档引批档照判）；后半：报面含 `批档面互引未判 1 处`——三半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F16 ∥ AC-14；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.29「集成测试差量」∥ §5 A-DD44 ②③⑥；缺口来源 = 台账 #2114 ∥ #2117 两次收口死锁（本批单测档删了判 `档缺`、不删又拒收口） | `test/integration/batch-close-gate.test.mjs` |
| 7-16 | 夹具里一份**带存量悬空锚**的设计档（悬空锚在基提交里），工作树里只改它别处一行，再以子代理身份对同批批档 `append` §2；随后同一夹具里父侧把该档置入触达账、跑一次 `batch close`；另起一份夹具，把该档改成改动区内自带一处悬空锚，再 `append` §2 | 前半：写入放行且出一行 `存量命中 1 条（不属本次改动区，不阻断交付；整档读数）`，拒面零该档命中行；中半：记入 `批起 sha` 的夹具下，存量锚不阻收口 ⇒ 放行 + 同一行存量读数；后半：改动区自带一处悬空 ⇒ 拒写、首行点名 `触达账改动区（锚 1 条）`、区外存量不进拒面、批档字节逐字不变——三半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7；判据 = `docs/core/design/DOC-CHECK.md` §2.9.4；用例号 = DD-214 ∥ DD-215 ∥ DD-219 | `test/integration/batch-touched-region-gate.test.mjs` |
| 7-17 | 批档两段各带一条失效引文，用真 `batch edit` 干净改写其中一段；另起夹具把失效引文写进本次替换区 | 前半落盘并出存量读数；后半拒写、批档字节不变、`Nothing was written` | 回指 = `docs/core/design/DOC-CHECK.md` §2.9.1 的 ⑥ 的答 | `test/integration/batch-edit-spec-section.test.mjs` |
| 7-18 | 用真 `edit` 只删围栏块内一个空行，块内另放一条不解析的示例路径 | 写入放行、块内示例路径不被当正文判 | 回指 = `docs/core/requirements/DOC-CHECK.md` F14 ∥ AC-12；判据 = `docs/core/design/DOC-CHECK.md` §2.9.2 | `test/integration/doc-write-gate.test.mjs` |
| 7-19 | 有 `批起 sha` 的夹具带存量锚并收口；另起同形夹具删掉该基线行再收口 | 前半放行 + 一行存量读数；后半整档判照拒，并点名 `收口改动区未定` 与基线缺失原因 | 回指 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7；判据 = `docs/core/design/DOC-CHECK.md` §2.9.4 | `test/integration/batch-touched-region-gate.test.mjs` |

## CLI 12. 写盘与跑命令都要报它替哪条台账行服务（不分面、不分类命令）

> 目的：工程模式下父侧的每一次落盘、每一次 `bash` / `execute` 都要带 `ledger:"#N"`，且同时给出项目（`bash` ∥ `memory` 用 `project`，其余用各自的定位参数）；该号是**声明项目**台账里一条 `status = 在途` 的行；门不判批档状态，也不判命令内容——`git status` 与 `rm -rf` 同判；`manifest` **整把不在本门**（三动作都不带项目不带号，见 12-15）；目标属另一个项目而写方在 `index.writableRepos` 里声明了它时，判据点换成**写方**（12-17，机制 = `docs/core/design/CROSS-REPO-WRITE.md` §2.2）；表外而目标属另一个项目 ⇒ **无条件拒**，不查那个项目的账（12-17 末格）；目标取不到项目根时写权表仍是界（12-18）；`execute` 的 `workdir` 同走这一判序（12-19）。
> 节注：回指 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 ∥ §2.10 ∥ §2.12；交互组件 = 写盘 / 跑命令的工具面 ↔ 笔-账绑定判定 ↔ 台账库；进入口 = 父侧工具调用（工程模式 depth-0）。十八态（行序）= 12-1 错误 · 12-2 正常 · 12-3 错误 · 12-4 错误 · 12-5 边界（同一案里拒与放行两支） · 12-6 借行（服务 R14 排除名单单源；迁出触发条件 = 该名单有独立故事节那一轮） · 12-7 错误 · 12-8 边界 · 12-9 正常 · 12-10 正常 · 12-12 错误 · 12-13 错误 · 12-14 边界 · 12-15 边界 · 12-16 错误（工作区根窄口的两条不成之路，回指 §2.3.1） · 12-17 边界（跨仓写：表内放行 ∥ 表外拒（含目标仓挂同号在途行那一格），回指 `docs/core/design/CROSS-REPO-WRITE.md` §2.2） · 12-18 边界（窄口 × 写权表三格：表空放行 ∥ 表外拒 ∥ 表内放行，回指 §2.3.1 条件 ⑤） · 12-19 边界（适用面：`execute` 的 `workdir` 表外拒、零副作用 ∥ 表内放行，回指 `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序 ②）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 12-1 | 工程模式父侧（有活设计槽、台账有在途行 `#A`）用 `write` 写 `<夹具根>/thincoder-core/agent/x.mjs`，不传 `ledger` | 拒：拒文含 `no ledger number on this call` 与用法句（`Pass project:` ∧ `ledger:"#N"` 两个输入都点出）；建批指引首选一次建批（`batch({action:"create", path:"<repo>/docs/batches/<batch>-<topic>.md", topic, source, board})` 四件俱在），接管既有行才先查号，同面未决行给 `newDebt` ∥ 接管两条出路，且不再把 `ledger add` 列为第一步；文件零改 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-2 | 同一会话同一目标，带 `ledger:"#A"` 写一次；再带 `ledger:"A"`（无 `#`）写一次 | 两次都照写，字节 = 写入内容——两形同判 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-3 | 带 `ledger:"#<已核销行>"` 写产品码；带 `ledger:"#999999"` 再写；带 `ledger:"#<待讨论行>"` 再写 | 三次全拒：拒文分别点名 `is "<已核销>"` / `does not exist` / `is "待讨论"`；文件零改 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-4 | 台账库不可读（库位是目录），再写产品码；另造一档项目根 manifest 坏 JSON 后再写 | 两态都拒：拒文含 `ledger row not bound` 与 `ledger unreadable — `（带台账原始错误）；文件零改。第二态与 12-5 成对照：有根但不可用 ≠ 没根 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-5 | 工程模式父侧，台账无在途行：写 `<仓外临时目录>/x.mjs`（不传号）；会话 cwd = 工作区根、写工作区根那份 `AGENTS.md`（不声明项目）；同一会话把 `project` 指到其下一个子项目并带上该子项目的在途号，再写同一目标；同会话再写 `<仓内路径>`（不传号）；再用 `bash` 把 `project` 指到容器根 `D:\teamcode`、带本仓在途号跑一条命令 | 仓外写拒（拒文含 `declared project is not a project`——项目之外没有判据点）；工作区根那一笔无声明同样拒（清单单位 = `unknown — no project owns this write's target`，不写 `none`）；**带子项目声明 + 在途号写同一目标 ⇒ 放行、字节落盘**（锚子树内 ∧ 锚下有带 manifest 的直接子目录 ∧ 显式声明三条同时成立，判据点换成声明根）；仓内拒（`no ledger number on this call`），文件零改；`project` 指容器根 ⇒ 同拒——「不是项目」与「不是这个项目」是两种拒，不是两种放行 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-6 | 在 `vendor/` · `node_modules/` · `dist/` 各放一份含标记文本的 `.mjs`，用 `grep` 搜该标记；再在普通目录放同文本 | 首次零命中（名单合并后三处都被剪）；普通目录那份命中——证明剪枝生效而非搜索坏了 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-7 | 台账无在途行时（工程模式父侧）跑 `bash` 一条只读命令（`git status`，带 `project:<本仓>`）；挂一条在途行后带同样的 `project` 与号跑同一条 | 第一次拒（拒文含 `no ledger number on this call`），命令零执行、无输出；第二次执行并回输出——只读命令与写命令同判 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-8 | 子代理（`depth > 0`）用 `write` 不传 `ledger`；同一子代理带号再写一次 | 两态都不被本门拒（拒因若现，只来自它自己的 token 门）——子代理的号来自绑定的批档档头，本门不核 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-9 | 仓库有暂存、台账无在途行时用 `git` 跑 `add` + `commit`；同一会话再用 `write` 写产品码（不带号） | `git add` + `commit` 照常生效——`git log` 出现该 message；同一会话里写盘工具缺号仍拒（拒文含 `no ledger number on this call`）、文件零改（门没被拆） | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-10 | 同一会话、台账无在途行时用 `git` 跑 `status`（不传号） | 照跑回输出（读到已暂存的 1 个文件）——名单只判审批，与写门无关 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-12 | 会话 cwd = 容器根（祖先链无 manifest）、台账无在途行：`bash` 跑 `git status` 不带 `project`；再带 `project:<本仓>` 但仍不带号；再带 `project` + 本仓在途号 | 第一次拒（含 `no project on this call`）、命令零执行；第二次拒（含 `no ledger number on this call`）；第三次执行并回输出；另：`memory({action:"put", layer:"project"})` 不带 `project` ⇒ 拒、项目内 memory 目录零写 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-13 | `bash` 的 `project` 指到容器根 `D:\teamcode`（自身无 manifest）并带本仓在途号；再声明 A 项目、号取自 B 项目 | 两条都拒：分别含 `declared project is not a project` 与 `does not exist in this project's ledger`；两条拒文都同时点出 `project` 与 `ledger` 两个输入 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-14 | 会话 cwd = `<本仓>/thincoder-cli`（项目子目录）：`bash` 带 `project:"<本仓根>"` + 本仓在途号跑一条命令；同一会话再跑同一条但不带 `project` | 第一次放行、命令执行并回输出（声明根含会话锚 ⇒ 相关）；第二次拒（含 `no project on this call`）、命令零执行 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-15 | 工程模式父侧、台账无在途行：`manifest({action:"write", target:"<既有项目根>", key:"phase", value:"production"})` 不带项目不带号；同一笔再带一个已从 schema 删的 `ledger:"#999999"` 跑一次；`manifest({action:"read", target})` 照跑；`manifest({action:"init", target:"<祖先链无 manifest 的新目录>"})` 不带项目不带号；同一时刻 `write` 写一份文档、再 `edit` 改一份现成档，两笔都不带号 | `write` 落盘成功、`PROJECT-MANIFEST.json` 可读回新值（`phase = production`）；带那个已删键的一笔与不带**逐字同判**（该键没有一处读它——不以「真能落盘」作判据，那测的是运行时对未声明键的处置）；`read` 照跑、`init` 在 target 落盘默认档；同一时刻写 / 改文档仍拒（`write` ∥ `edit` 两形**各**含 `no ledger number on this call`）、文件与字节零改——只开了这一口 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-16 | 工程模式父侧，两笔都带合法声明 + 声明项目的在途号：① 会话 cwd = 工作区根（其下有带 manifest 的子项目），目标是**锚外**文件（另建一条系统临时路径）；② 换一个锚（下只有 `bare-git/.git` 子目录、无带 manifest 的直接子目录），声明锚内更深一层的那个项目，写锚根文件 | 两笔都拒、各落自己那句：① 含 `target is outside the session anchor's subtree — the workspace-root opening does not apply`；② 含 `the session anchor carries no sub-project — the workspace-root opening does not apply`；两笔目标文件零改，清单单位都是 `unknown — no project owns this write's target`（不出现 `none`）；① 的拒文**不含** `declared project is not a project`——两支互不顶替 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-17 | 工程模式父侧，写方项目 W（会话锚，manifest 带 `index.writableRepos:["../B"]`）写同级项目 B 内的 `<B>/src/x.mjs`，带 W 的在途号 + `project:<W 根>`；同夹具把表改成 `["../plain"]` 再写 `<B>/src/y.mjs`；再清掉 `project` 写 `<B>/src/z.mjs`；再在 B 的账上挂一条与 W 在途行**同号**的在途行，表仍是表外，写 `<B>/src/w.mjs` | 表内 ⇒ 放行、字节落盘、W 台账逐行不变（号仍 在途）、B 台账零变；表外 ⇒ 拒，拒文含 `target belongs to another project and index.writableRepos of the declared project does not declare it` 与目标路径，清单单位 = `unknown — the declared project does not own this write's target`，文件零改；不带 `project` ⇒ 与本批前逐字同（`does not exist in this project's ledger`，拒文不含 `index.writableRepos`）；末格（B 账上有同号在途行）仍拒、仍出新串、文件零改——改前这一格放行，它断的就是那条回落臂 | — | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-18 | 工程模式父侧，会话 cwd = 工作区根（其下有带 manifest 的子项目 W，W 账上有在途行），目标是**锚根**一份非项目档（`resolveProjectRoot` = null），三笔都带 `project:<W>` 与同一条 W 在途号：① W 未声明写权表；② W 的 `index.writableRepos:["../elsewhere"]`（不含目标）；③ 把锚根目录（`..`）写进表 | ① 放行、字节落盘（表为空 ⇒ 窄口维持现状）；② 拒，拒文含 `target is not covered by index.writableRepos of the declared project` 与 `the workspace-root opening does not apply`，清单单位 = `unknown — no project owns this write's target`，**不**出现 `target belongs to another project`（这一支 R 不存在），文件零改；③ 放行、字节落盘（放行由判序 ① 决定） | 服务条目 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.4 末条（「目标无项目根时，写权表仍然是界」）；判据 = `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-11 三格 | `test/integration/batch-live-batch-lock.test.mjs` |
| 12-19 | 工程模式父侧，写方 W（会话锚）∥ 同级项目 R（R 的账上挂一条与 W 在途行**同号**的在途行），W 的 `index.writableRepos:["../plain"]`：① `execute({code, workdir:<R>, project:<W>})` + W 在途号；② 把 `../R` 写进表后重跑① | ① 拒、拒文含 `target belongs to another project and index.writableRepos of the declared project does not declare it`，标记文件不存在（脚本零执行）、R 的 manifest 字节零改（sha256）；② 放行（标记文件出现）——改前那一笔按 R 的账判（同号在途 ⇒ 放行、脚本执行），两读不同即成立 | 服务条目 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.4「入口一刀切」句；判据 = `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-12 | `test/integration/batch-live-batch-lock.test.mjs` |

## CLI 26. 清账要先有一把可复述的尺（行号坐标：`report` 清点 ∥ `gate` 拦）

> 目的：清存量行号引用之前，先让「还剩多少」可复述——同一份报面同时给出量法、两面读数与逐处坐标；并让变宽后的锚面在交付门当场判出悬空的代码路径（26-4）。
> 节注：回指 = `docs/core/requirements/DOC-CHECK.md` F11 ∥ AC-9（AC-9 ①②④）（26-1–26-3）· AC-9 ③（26-6）· F3 的锚一条 ∥ F12（26-4）· F15 ∥ AC-13（26-5）；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.23 条目 W（26-1–26-3）· §3.23「判面 = 正文面」块（26-6）· §3.20 的扩展名闭集与抽取面三免两条（26-4）· §3.20「行数读数」块（26-5）；交互组件 = `doc_check({mode:"report"})` → 报面构造 → 行号坐标采集器 → 清单块（`mode:"gate"` → 引擎 `hits` 组装 → 首行判决串）；进入口 = 真 `doc_check` 工具调用；六态（行序）= 26-1 正常 · 26-2 边界 · 26-3 错误 · 26-4 错误（锚面射程变宽后的交付门）· 26-5 正常（行数读数与缝档同源）· 26-6 正常（围栏内坐标不入判、只出读数行；围栏外照判）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 26-1 | 夹具档里三种写法各放一处（紧贴 ∥ 同段承名 ∥ 跨段承名，档名均为在盘档），调 `doc_check`（`mode:"report"` + 显式 `docs`） | 清单块首行是**量法行**（含档名抽取式 ∥ 坐标抽取式 ∥ 扫描域三串）· 合计行读 `合计 3 处` · 逐处行三行且形别 ① / ② / ③ 各一 · 末行仍是 `结论：…` | — | `test/integration/doc-check-line-refs.test.mjs` |
| 26-2 | 夹具档不含任何行号坐标，同一入口再跑一次 | 清单块仍出量法行 + 空态行「行号坐标 0 处」，块内无空行（空行读起来像「没跑」） | — | `test/integration/doc-check-line-refs.test.mjs` |
| 26-3 | 夹具档一处真坐标（档名在盘），先调 `doc_check({mode:"gate", docs})`，再对同夹具调 `report` | 首行 `DOC-CHECK GATE: REFUSED（行号坐标 1 处）` ∧ `hits.lineRefs = 1` ∧ 三数之和 = `hits.total`；同夹具的 `report` 清单合计与该值逐字相等 | 命中行形 = `✗ 行号坐标 <源档>:<行> <形别> <原文片段>` | `test/integration/doc-check-line-refs.test.mjs` |
| 26-4 | 夹具：一处解析不到的代码路径（非 `.md`）+ 一处带目录段、解析不到的类名 token；调 `doc_check({mode:"gate", docs})` | 首行 `DOC-CHECK GATE: REFUSED`，两条命中都归锚类（`档缺`）；同夹具把两处换成裸名 ∥ 在盘路径 ⇒ 首行 `PASS` | 裸名仍免（豁免只免裸名）；`.mjs` 等代码路径同样入判 | `test/integration/doc-check-line-refs.test.mjs` |
| 26-5 | 夹具三档（`.mjs` 812 行 ∥ `.mjs` 500 行 ∥ `.md` 900 行）调 `doc_check({mode:"report", docs, lines})`；随后取缝档 `scripts/doc-check-linecounts.mjs` 再出口的 `countContentLines` 对同一批档逐档读一次 | 逐档整数与缝档读数相等；812 行带 `越 800 硬限（必须拆）`、500 行不带标记、`.md` 900 行只出数且 `tier` 为 null；同一次调用与不给 `lines` 时 `hits` 逐字相等（末行仍是 `结论：…`） | 越线判据是严格大于（500 不标）；`gate` + `lines` ⇒ 明确拒绝 | `test/integration/doc-check-line-counts.test.mjs` |
| 26-6 | 夹具档：围栏块内一处坐标 + 围栏块外一处坐标；另备一份只留围栏内那处的档。调 `doc_check({mode:"gate", docs})` 两回（先判前者、再判后者），随后对前者调 `report` | 前半：首行 `DOC-CHECK GATE: REFUSED（行号坐标 1 处）`（只计围栏外那处）∧ 围栏内那处零 `✗` 命中行、只出一行读数 `围栏内行号坐标 1 处——快照里的位置，不是指针；不入判（report 清单照列）`；后半：只留围栏内那处 ⇒ 首行 `DOC-CHECK GATE: PASS`、零命中行、读数行仍在；第三半：`report` 清单读 `正文面 1 处 · 围栏内 1 处 · 合计 2 处`（清账读数仍含围栏内那处）——三半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F11 ∥ AC-9 ③；判据 = `docs/core/design/DOC-DISCIPLINE.md` §3.23「判面 = 正文面」块 ∥ §5 `A-DD37` 判据点 8；缺口来源 = 2026-11-07 11:13 实撞（逐字引用批档门自己的拒文，那段拒文里带着一处档名加冒号加数字的形 ⇒ 本次写入文本当场判 `REFUSED`） | `test/integration/doc-check-fence-verdict.test.mjs` |

## CLI 36. 跨项目文档清单的交付门按各档自身项目根判

> 目的：一次交付轮里判的档可以横跨两个项目——每个档按**自己落点的项目根**解析其指针，不因为清单里混了别的仓就判 `档缺`；报面仍是一条 verdict，并在 ≥2 根时把根清单摆进范围行；域表（`docRoot` 各键 ∥ `docRoot.batches`）同按各档自己的项目根读——批档面互引的豁免不跨项目。
> 节注：回指 = `docs/core/requirements/DOC-CHECK.md` F17 ∥ AC-15（36-1–36-4）· F3（36-5）；判据 = `docs/core/design/DOC-CHECK.md` §2.1（`rootOf` 按档定根）∥ §2.3（多根报面：标签 = 最短唯一定位后缀）∥ §2.5（域表按各档所属项目根读）∥ §2.7（排除面：判集过滤 ∥ 全排除 = 免检放行；验收 = AC-X3 ①）∥ §6 AC-1 ∥ AC-6 ∥ AC-7 ∥ AC-9；交互组件 = `doc_check` 工具面（`target` = 声明根）⟷ 引擎按根分组 ⟷ 域表按组根读 ⟷ 锚解析；进入口 = 真 `doc_check({mode:"gate", docs, target})` 调用（`target` = 该工作区绝对路径；会话锚 = 工作区，下辖两个项目、自身无 manifest）；五态（行序）= 36-1 正常 · 36-2 边界（两个项目根同名 ⇒ 两条标签互不相同）· 36-3 边界（域表按档根：B 档同基底互引豁免 ∥ A 档同 token 照判 `档缺`）· 36-4 边界（一个档都没判 ⇒ 首行判 `ERROR（0 档受检——空范围不判 PASS）`，不产 `PASS`——「没判」不得读成「全清」）· 36-5 边界（排除面内零命中 ∥ 清单只剩被排除那一档 ⇒ 免检放行、首行 `PASS` ∥ 移出后同一档出 1 条 `档缺`）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 36-1 | 夹具工作区下造两个各带 `PROJECT-MANIFEST.json` 的项目、各放一档（两档都干净，且各带一处只在自己项目根下解析得到的仓根相对指针——单一错根下必判 `档缺`），会话锚 = 该工作区，一次交付调用 `doc_check({mode:"gate", docs:[两档], target:"<该工作区绝对路径>"})`（`target` 必填——本行判的是「目标 = 工作区、清单跨两项目 ⇒ 各档按自身根判」，**不是**「`target` 缺省 = 锚」） | 首行逐字 `DOC-CHECK GATE: PASS` ∧ 范围行同时列出两个项目根的绝对路径 ∧ 全文 `DOC-CHECK GATE:` 只出现 1 次（一条 verdict） | 缺口来源 = 本批现场（工作区锚下一次交付调用 `doc_check` 拿不到令牌，评审因此拿不到设计凭证；读数口径 = 新进程直调盘上模块，会话进程可能加载旧模块——`docs/core/design/DOC-CHECK.md` §2）；口径单源 = `docs/core/design/DOC-CHECK.md` §2.4「声明根自身不是项目」不是触发条件；`target` 必填：不传 ⇒ 拒、点名 `target`——本行钉的是「目标 = 工作区、清单跨两项目 ⇒ 各档按自身根判」 | `test/integration/doc-check-per-file-root.test.mjs` |
| 36-2 | 夹具工作区下造两个**根目录同名**的项目（`site-a/web` ∥ `site-b/web`，各带 `PROJECT-MANIFEST.json`）、各放一档且各带一处悬空指针，会话锚 = 该工作区，一次交付调用 `doc_check({mode:"gate", docs:[两档], target:"<该工作区绝对路径>"})` | 首行 `DOC-CHECK GATE: REFUSED（锚 2 条）` ∧ 两条命中行的行首标签**互不相同**，且各是本次根集里的最短唯一定位后缀（`[site-a/web]` ∥ `[site-b/web]`）∧ 取根目录名那一形 `[web]` 零出 ∧ 全文 `DOC-CHECK GATE:` 只出现 1 次 | 反例读数：把标签改回 `basename(root)` 后本用例当场红（两行都写 `[web]`），改回即绿——本行断的是「读者分得清是谁的账」，不是格式好看；回指 = `docs/core/design/DOC-CHECK.md` §2.3 ∥ §6 AC-6 ∥ §7 用例 7-10 | `test/integration/doc-check-per-file-root.test.mjs` |
| 36-3 | 夹具工作区下造两个各带 `PROJECT-MANIFEST.json` 的项目（只有 B 的 manifest 声明 `docRoot.batches` = `docs/batches`）：B 的基底根下放一份批档、档内引同基底下一份**已不在盘**的伴档；A 放一份普通档引**同一 token**（A 无此路径、也未声明基底）；会话锚 = 该工作区，一次交付调用 `doc_check({mode:"gate", docs:[A 档, B 档], target:"<该工作区绝对路径>"})` | 首行 `DOC-CHECK GATE: REFUSED（锚 1 条）` ∧ 唯一命中行属 A（行首标签 `[projA]`、命中类 `档缺`）∧ B 那处零命中（全文零 `[projB]` 开头的命中行——同基底互引被面判豁免）∧ 全文 `DOC-CHECK GATE:` 只出现 1 次 | 反例读数（已验）：域表改回按声明根单根读（单组 · 根 = 声明根）⇒ B 那处转 `档缺`、首行变 `REFUSED（锚 2 条）` ⇒ 红；回指 = `docs/core/design/DOC-CHECK.md` §2.5 ∥ §6 AC-9 ∥ §7 用例 7-12 | `test/integration/doc-check-per-file-root.test.mjs` |
| 36-4 | `doc_check({mode:"gate"})` 四条空范围入口各跑一次：`docs: []` 显式 ∥ 省略 `docs` 而本会话零 `.md` 触达 ∥ 路径全不在盘 ∥ 全非 `.md`；对照 = 同一次调用换成一档干净档 | 四条首行逐字 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）` ∧ 报面照出「0 档受检」与 `范围为空：…` 说明行 ∧ 对照那档首行逐字 `DOC-CHECK GATE: PASS`——「没判」与「全清」不再同形 | 缺口来源 = 本批现场（用户实读首行 `PASS（0 档）`）；交互组件 = 工具面 → 引擎裁决 → 判据三面；业务可观察结果 = 交付门首行怎么读；进入口 = 用户收口时读首行 | 本批集成用例档（住 `test/integration/`，文件名住批档 §2 第五节围栏） |
| 36-5 | 夹具项目里一份带死指针的档落在 `index.docCheckExcludePaths` 声明的目录内、另一份干净档在排除面外：① 一次交付调用 `doc_check({mode:"gate", docs:[两档], target:"<该项目根>"})`；② 同一夹具同一命令，把清单收成**只含被排除那一档**（manifest 不动）；③ 把 manifest 里该键删掉、按 ① 的两档清单再跑一次 | ① 首行逐字 `DOC-CHECK GATE: PASS` ∧ 回执出一行 `排除 1 档（manifest 排除面命中，未判）：<夹具内那一档的相对路径>` ∧ 全文零 `✗ ` 命中行；② 全排除 = 免检放行：首行逐字 `DOC-CHECK GATE: PASS` ∧ 全文零「不得读作已检」∧ 排除桶点名该档；③ 首行 `DOC-CHECK GATE: REFUSED（锚 1 条）` ∧ 唯一命中行点名那份档（`档缺`）——三读都成立才算过 | 缺口来源 = 台账 #2195（用户 2026-11-08 15:48「我希望能在project-manifest里定义doc_check的排除目录.」）；判据 = `docs/core/design/DOC-CHECK.md` §2.7 ∥ AC-X3 ①；回指 = `docs/core/requirements/DOC-CHECK.md` F3；反例读数 = 把判集过滤拿掉（`checkFiles` 退回过滤前）⇒ ① 首行变 `REFUSED（锚 1 条）`、与 ③ 相等 ⇒ 红；把全排除判回 `ERROR` 并补免责句 ⇒ ② 那组断言红（读数见批档 §5） | `test/integration/doc-check-exclude-paths.test.mjs` |

## CLI 38. 交付门看得见花括号组形：解不到就判红，命中点名原 token 与缺的展开名

> 目的：一个花括号组形（本行夹具那一形见本节末围栏）在门里既不红也不绿——`{` `,` `}` 都不在档 token 的字符类内，它整个不在判面里。「不要强行要求写法」那句也否掉了「要求大家展开写」这条出路，所以正路是让门看见它：展开成具体名后按同一条判据（解不到就是错的）处理，不新增第二条规则。
> 节注：回指 = `docs/core/design/DOC-DISCIPLINE.md` §3.27 条目 AA 的边界句 ∥ §5 `A-DD42` ⑤（判据本体零改，花括号组展开是抽取面新加的一支）；交互组件 = `doc_check` 工具面 ⟷ 锚抽取面（花括号组展开）⟷ 解析序（逐名判存在性）⟷ 命中报面；进入口 = 用户收口时读首行（与 26-3 ∥ 36-4 同一读面）；一态一行 = 38-1 错误（红半 ∥ 绿半 ∥ 反证三半同行）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 38-1 | 夹具项目里一份设计档正文一行写本节末围栏里那一形（两个展开名都不在盘），调 `doc_check({mode:"gate", docs:[该档], target:"<夹具项目根>"})`；另一夹具把 `i18n-zh-core.mjs` ∥ `i18n-en-core.mjs` 两个展开名落到盘、同一行照写，同跑；反证 = 第三份夹具写组内含 `/` 的 `{ running / queued / done }` 与 `x-{a/b,c}.md`，同跑 | 红半：首行逐字 `DOC-CHECK GATE: REFUSED（锚 2 条）` ∧ 两条命中行各点名原花括号 token（逐字见本节末围栏）与一个缺失的展开名（`i18n-zh-core.mjs` ∥ `i18n-en-core.mjs` 各一处）；绿半：首行逐字 `DOC-CHECK GATE: PASS` ∧ 全文零 `✗ ` 命中行（结论行 = `0 段有问题`）；反证：首行 `PASS` ∧ 零 `✗ ` 命中行（取值枚举 ∥ 组内带 `/` 的形都不是文件名列举，展开会凭空造出名字）——三半都成立才算过 | 缺口来源 = 台账 #2191（该形 16 处从未入判）；判据本体（解析序 ∥ 判决词 ∥ 豁免谓词 ∥ 阈值）零改——判决仍走现成的 `档缺`；回指 = `docs/core/design/DOC-DISCIPLINE.md` §3.27 条目 AA 的边界句 ∥ §5 `A-DD42` ⑤ | `test/integration/doc-check-brace-group.test.mjs` |

本节末围栏（38-1 的夹具形；名与真档位置。围栏内的名字不是指针）：

```text
夹具设计档正文那一行：i18n-{zh,en}-core.mjs
两个展开名：i18n-zh-core.mjs ∥ i18n-en-core.mjs   （真档在 thincoder-server/public/）
```

## CLI 44. 交付门认得中文档名与真后缀，代码表达式与版本号不误报

> 目的：识别面放宽之后有两条判据同时要成立——**认得出**（中文档名、真文件后缀，含项目自己在 manifest 里增补的后缀）与**不误报**（普通中文词 ∥ 代码表达式 ∥ 版本号 ∥ 归档名 ∥ 清单外的伪后缀一条都不成候选）。只做到前一半，现盘文档会成片报红，人就回去整目录排除，这条能力当场作废。
> 节注：回指 = `docs/core/requirements/DOC-CHECK.md` F18 ∥ AC-16 ∥ F19 ∥ AC-17；判据 = `docs/core/design/DOC-CHECK.md` §2.6（名字字符类 ∥ 扩展名形护 ∥ 生效清单 = 缺省 ∪ 项目项，装配处过滤）∥ 同档 §2.10.3（形分档：带目录段的一族同判，裸名须后缀落文档名族）∥ `docs/core/design/DOC-DISCIPLINE.md` §3.20；交互组件 = 文本 → 抽取面 → 谓词（清单查末段后缀 + 形分档）→ 解析序 → 命中数；进入口 = 用户收口时读 `doc_check({mode:"gate", docs, target})` 的首行与命中区；两态（行序）= 44-1 正常（七段同一条用例；第七段 = 中文散文紧贴的形）· 44-2 边界（命令段与路径段同行，路径照判）。
> 夹具里的字面 token 住本节末围栏（围栏内的名字不是指针）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 44-1 | 夹具工作区下两个各带 `PROJECT-MANIFEST.json` 的项目：甲写 `index.docCheckExts` = 两个项（其中一个缺省清单里没有的真后缀），乙不写该键。甲档正文写本节末围栏的「甲档」那一组（中文悬空名 ∥ 中文在盘档 ∥ 真后缀 ∥ 伪后缀 ∥ 数字形 ∥ 代码表达式 ∥ 版本区间 ∥ 归档名 ∥ 增补后缀），乙档写同一组里的增补后缀 token（两仓都写成**带目录段**的形：形分档下裸写的代码族档名不成候选）；一次交付调用 `doc_check({mode:"gate", docs:[甲档, 乙档], target:"<该工作区绝对路径>"})`，同一夹具再跑一次 `report`；把甲的键改成只含 `md` 一项、按同一清单再跑一次 `gate`；另备一档把在盘中文档名**紧贴**在散文后（前面无分隔），再备两档把同一指针分别用反引号包住 ∥ 与前后汉字留一个空格写出，三份各跑一次 `gate` | ① 中文悬空名判 `档缺`、中文在盘档零命中、普通中文词（「需求档」「设计档」一类）零命中；② 真后缀那一处判 `档缺`；③ 伪后缀 ∥ 数字形 ∥ 代码表达式 ∥ 版本区间 ∥ 归档名 **全零命中**；④ 增补后缀 token 在甲判 `档缺`、在乙零命中（清单按档所属项目根读，甲写的不替乙生效）；⑤ `report` 出 `扩展名清单：缺省 + 本仓 2 项`（甲）且乙零出；⑥ 把甲的键收成 `md` 后，真后缀那一处仍判 `档缺`（并集不替换）；⑦ 紧贴形**多报一条整段 token**（`档缺`，点名的是散文 + 档名连起来那一长串——这是该形的**实测方向**，不是零命中），两条写法出口（反引号包住 ∥ 与前后汉字留一个空格）各回到零命中（首行 `PASS`、零 `✗` 行）——七段都成立才算过 | 缺口来源 = 台账 #2237（用户 2026-11-09 贴入 R1/R2：中文档名一律看不见 ∥ 12 项闭集把真后缀挡在外面；第七段的方向 = 用户 2026-11-09 裁定「机制不动，照实写实测方向」——词法上分不开「真中文档名」与「汉字紧贴档名」，任何「砍掉前面几个汉字再试」的回退都会把真悬空洗成解析成功）；反例读数 = 名字字符类换回纯 ASCII ⇒ ① 前半红；扩展名式去掉「首字符字母」⇒ ③ 的数字形成候选 ⇒ 红；把取形过滤移到谓词之后 ⇒ 甲写进去的单字符后缀 ∥ 归档项生效 ⇒ 红；回指 = `docs/core/design/DOC-CHECK.md` §2.6 ∥ §6 AC-R1–AC-R4 | `test/integration/doc-check-recognition.test.mjs` |
| 44-2 | 夹具档同一行放一个命令码段与一个不解析路径码段，调 `doc_check gate`；随后去掉命令码段再跑 | 两跑均 `REFUSED（锚 1 条）`，唯一命中都落在该路径；命令里的字面量不成命中 | 回指 = `docs/core/requirements/DOC-CHECK.md` F18；判据 = `docs/core/design/DOC-CHECK.md` §2.9.6 | `test/integration/doc-check-recognition.test.mjs` |

本节末围栏（44-1 的夹具形；围栏内的名字不是指针）：

```text
甲档正文：不存在的中文名文档.md ∥ docs/子目录/设计.md（在盘）∥ 真后缀一处（.py）∥ 伪后缀一处（.xyz）∥ 数字形 1.5 ∥ 2.0 版本 v2.0 ∥ 代码表达式 JSON.parse ∥ console.log ∥ process.env ∥ 版本区间 20.x/22.x ∥ 归档名 build/app.tar.gz ∥ 增补后缀一处（.tsv）
乙档正文：同一增补后缀 token（.tsv），乙的 manifest 不写该键
紧贴形（多报一条整段 token）：见在盘档.md 前面的汉字没分隔
写法出口一（反引号包住，零命中）：见 `在盘档.md` 前面有分隔
写法出口二（与前后汉字留一个空格，零命中）：见 在盘档.md 前面有空格
```

## CLI 45. 已裁定的假阳照列不阻断，撤销后重新计入

> 目的：有些命中是规则自己要求的（例如「计划新建的档得先写出路径」），改文档等于违规、整目录排除又造出一片盲区。第三档给的是第三条路：**看了、已裁定、不拦**——每次报告照样逐条列出（哪一条 ∥ 哪一份档 ∥ 理由 ∥ 复审），交付门不再被它挡住；撤销登记，那条当场回到命中里。
> 节注：回指 = `docs/core/requirements/DOC-CHECK.md` F20 ∥ AC-18 ∥ F21 ∥ AC-19；判据 = `docs/core/design/DOC-CHECK.md` §2.7（条目五字段 ∥ 识别键 = 档 + 判据类 + 文本、不含行号 ∥ 装配处分类 ∥ 排除优先）；交互组件 = manifest 的 `index.docCheckExemptions` → 装配处分类 → `hits` 与 `exempted` 两桶 → 首行判决词；进入口 = 与 44-1 同一个入口（同一次调用面）；八段（行序）= 45-1（未登记 ∥ 登记 ∥ 插一行 ∥ 改一个字 ∥ 撤销 ∥ 无效条目 ∥ 与排除面并存，同一条用例内逐段判定）· 45-2（坐标类豁免键 = 整行原文）。
> 夹具里的字面 token 住本节末围栏（围栏内的名字不是指针）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 45-1 | 夹具项目一档正文引一个不在盘的路径（本节末围栏），依次跑：① 无登记 `gate`；② manifest 的 `index.docCheckExemptions` 登记该条（五字段齐）；③ 命中所在一行之上插一行空行再跑；④ 把那段文字改一个字再跑；⑤ 删掉登记再跑；⑥ 登记保留但缺 `review` 字段再跑；⑦ 同一档落进 `index.docCheckExcludePaths` 声明的目录、登记保留，再跑 | ① 首行 `REFUSED（锚 1 条）`、零豁免块；② 首行 `PASS` ∧ 回执出 `豁免 1 条（已裁定假阳，不阻断交付）：` 且该行四项齐全（判据类 + 命中文本 ∥ 档 ∥ 理由 ∥ 复审）∧ `hits.anchors` = 0；③ 仍 `PASS`（识别键不含行号）；④ 回 `REFUSED` 且出 `登记未命中 1 条`；⑤ 回 `REFUSED（锚 1 条）`、豁免块零出；⑥ 仍 `REFUSED`，回执出 `豁免登记无效 1 条` 并点名缺 `review`；⑦ 首行 `PASS`、该档进排除桶、豁免块零出（排除优先）——七段都成立才算过 | 缺口来源 = 台账 #2237（用户 2026-11-09 15:15 裁定按原文落 R4：现场有现场的情况）；反例读数 = 登记表读成空 ⇒ ② 变 `REFUSED`；把登记做成「一经命中永久放行」的缓存 ⇒ ⑤ 仍 `PASS` ⇒ 红；识别键换成 `file` + 行号 ⇒ ③ 变 `REFUSED` ⇒ 红；回指 = `docs/core/design/DOC-CHECK.md` §2.7 ∥ §6 AC-X1–AC-X5 | `test/integration/doc-check-exemptions.test.mjs` |
| 45-2 | 夹具正文带一处行号坐标，manifest 以该行的整行原文登记 `行号坐标` 豁免；随后把那一行改一个字再跑 | 登记后 `PASS`、`豁免 1 条`；改字后 `REFUSED（行号坐标 1 处）` 并出 `登记未命中 1 条` | 回指 = `docs/core/requirements/DOC-CHECK.md` F21 ∥ AC-19；判据 = `docs/core/design/DOC-CHECK.md` §2.7 ∥ §2.9.5 | `test/integration/doc-check-exemptions.test.mjs` |

本节末围栏（45-1 的夹具形；围栏内的名字不是指针）：

```text
夹具档正文：见 docs/planned/NEW.md。（该路径不在盘，命中类 = 锚·档缺，命中文本 = docs/planned/NEW.md）
登记条目：{ file: "docs/design/X.md", kind: "锚·档缺", text: "docs/planned/NEW.md", why: "规则要求计划新建件先写路径", review: "2027-01-31" }
```

## CLI 47. 评审在评审里调文档机检，拿得到判决而不是错误

> 目的：评审的第一件产物就是它的判决，而判决靠文档机检。这条链断在工具执行面的一行收尾句上——评审拿到的是 `execution_error`，等于让它闭着眼睛判：它既没法自检手上的设计档，也没法预探哪个指针解析得到，于是写面只能靠猜。修法住在循环里、不住在工具里——工具的 `execute` 允许同步返回，循环把返回值归一成 Promise，所有同步返回的工具一并治好。
> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §8（交界面契约：产物落盘、消息只报告——评审的第一件产物就是它的判决）；判据 = `docs/core/design/ADVISOR-CONVERGENCE.md` §18 ∥ A-AC19；交互组件 = 评审装配（`advisorToolsFor`）→ 工具循环 → 返回值归一 → 工具结果文本；进入口 = 主 agent 发起设计评审、评审者在评审里调 `doc_check`；一态一行 = 47-1 正常（`PASS` ∥ `REFUSED` 两半同条）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 47-1 | 夹具项目一档干净、一档带一处悬空指针；按评审装配取工具表、走评审工具循环——注入的模型回一轮 `doc_check` 工具调用、再回一轮无工具调用的收尾文本；两份夹具各跑一次 | 回填进会话的那条工具结果首行是 `DOC-CHECK GATE:`（`PASS` ∥ `REFUSED` 都算通过），全文不含 `execution_error`——两半都成立才算过 | 反例读数 = 去掉循环侧归一、把 `execute` 的返回值原样赋给竞速变量 ⇒ 工具结果变 `Error (execution_error): toolPromise?.catch is not a function`（与生产实录逐字同形）；缺口来源 = 跨实例方与父侧各一次实录；回指 = 同节注 | `test/integration/`（用例档落地归另一轮） |

## CLI 48. 证据格里的指针解不到只列读数，被拒的命中行四件齐备

> 目的：结论表的最后一格是「证据」，那里放的是**指向**，不是「这份档存在」的证明。把指向当存在证明判，作者得先造出它正要引用的每一份档才写得下一笔；而拒文不点名被拒的那一条时，作者只知道「有东西不对」，唯一出路是整段重写，再撞一次同一道门。两件事是同一条链：放行该放行的，点名该拒的。
> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §8（拒文就是「改哪一处」那份报告）；判据 = `docs/core/design/BATCH-RECORD.md` §4.22（证据格识别 ∥ 三条腿同判 ∥ 拒文四件）；交互组件 = `batch` 写面 → 批次档门（证据格识别 → 锚面分流 → 拒文组装）；进入口 = 评审 ∥ 设计席用 `batch({action:"append"})` 写 §2 ∥ §3 时读回执；一态一行 = 48-1（放行 ∥ 照拒 ∥ 闭集 ∥ 收口 四半同条）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 48-1 | 夹具批档上子代理写一笔 §2：同一张表的表头末列写 `证据`、格内一条盘上不存在的路径，正文里另写一条不同的不存在路径；随后把表头改写成 `依据` 再写一笔；最后对同一份批档跑一次收口；同一夹具里再备一条「证据格里的悬空指针已落盘」的批档，跑一次无关的段内就地改 | 第一笔落盘、回执含 `[doc-check gate] DOC-CHECK GATE: PASS` 与一行 `指针读数 1 处…`（点名证据格里那一条）、拒面零该 token ∧ 正文里那条照拒、拒文四件齐备（引用方档 ∥ 行号 ∥ 该 token ∥ 该档的判定根）∧ 表头写成 `依据` 那一笔照拒 ∧ 收口首行 `PASS` ∧ 已落证据格悬空的那份批档，无关就地改放行——五半都成立才算过 | 反例读数 = 证据格判据只在本笔文本上生效（整档腿 ∥ 收口腿照判）⇒ 收口那半变 `REFUSED`，作者改不动自己那一段（与段内就地改消掉的死锁同形）；把写面锚判据整体放宽 ⇒ 正文那半变绿、四件那半拿不到反例；缺口来源 = 本批现场（本批自己的一笔 §2 因正文点名一份盘上没有的档而整笔被拒，一字未落盘）；回指 = 同节注 | `test/integration/`（用例档落地归另一轮） |
