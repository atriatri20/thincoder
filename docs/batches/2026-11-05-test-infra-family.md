# 2026-11-05 · test-infra-family
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-05 · 来源 = 用户 2026-11-05 05:05「都开吧」——授权把并出的族行逐族开批。本族 = 集成套件基建 `#2066`（3 行并入）。。
> 台账 = #2066（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（本批输入 = 集成夹具隔离两件；其一已退）
**本批条目**：① 临时目录收尾统一（32 档裸收尾 → 全走 `test/teardown.mjs` 助手）；② 浏览器 profile 隔离（**已退出**，见 §1 裁定）。**关键判据**：`.md` 无尺寸义务；集成集档内零 `rmSync`；助手路径中性（参数 `p`、失败行 `temp path not removed`）；整套跑归收口。**授权口径**：用户 2026-11-05 05:05「都开吧」——七族开批，本批为其一。

## 已定决定

- **已定决定**：判据 = **每个用例自建会话 / 状态清零**，不是「收口时靠单跑排除」。 · 用户原话：「都开吧。」 · 时间：2026-11-05 05:05

**覆盖账 = #2066**（并入的原行：`#2005` ∥ `#2051` ∥ `#2053`，均已废弃；`#2053` 的**浏览器 profile 隔离**条目整条退出本批，内容现由 `#2073` 持有——接笔第一动作是先复现）

## 三件事，一个病

| # | 现象 | 病根 |
|---|---|---|
| 1 | 整套跑时 `22-3` 假红（单跑 3/3 绿） | ssh 假设备**跨用例串状态**：`22-1` 把设备留在 `--More-`，`22-2` 再往同一 pty 写 |
| 2 | 其余 **30 档**集成用例收尾是**裸 `rmSync`** | 临时目录生命周期不由用例掌握（`browser-start-window` 已改 `removeTempDirBestEffort`，`ssh-file-transfer` 自带 try/catch，余 30 档未改） |
| 3 | `4-3` 真机 navigate 并发下 `EBUSY`（`DevToolsActivePort`） | 浏览器 profile 目录**共享**：同档并发 4 份跑 3 轮，第 2 ∥ 3 轮各有一份红，串行 6 跑全绿 |

## 为什么并成一批

三件都不是业务缺陷，是**用例之间互相污染**。分开做三次，每次都要重跑整套并逐个分辨「这次红的是哪一类污染」——**同一份判断读三遍**。

## 判据

1. **假设备**：每条用例新建、用完即关；`22-1` ∥ `22-2` ∥ `22-3` 之间不得共享 pty 状态。
2. **临时目录**：一律走 `removeTempDirBestEffort`（有界重试、不抛、失败落一行 stderr 点名绝对路径与错误码）。**判据 = 档级退出码不再因清理失败而红**。
3. **浏览器 profile**：每条用例唯一后缀；判据 = 并发 4 份 × 3 轮，红数 0（今天的读数是 3 轮里 2 轮各 1 份红）。

## 边界

- **不改任何业务断言**——只改夹具与清理。
- 不动 `test/run.mjs` 的收集逻辑。
- 30 档那条改动面大但形状单一：**先改 2–3 档验证形状，再批量套**，别一次改 30 档然后一起红。

## 设计席要产出

§2 里给：① 三件各自的改法与落点（符号名）；② 「自建会话 / 状态清零」在这三个面上的具体形（假设备怎么建、profile 后缀怎么取、临时目录谁拥有）；③ 验收读数（并发 4×3 轮红数 = 0 ∥ 整套跑 139/139 绿）；④ 30 档那批的抽样验证策略。

## 两条上抛的裁定（父侧 · 2026-11-05 05:21）

**先说明一件事**：我的裁定发晚了，`send` 没赶上它的轮次边界，所以 §2 里条目 1 还在。**这不是设计席的错**——本节就是补那两条裁定。

### ① 条目 1 退出本批（病根已被设计席证伪）

设计席实读：`test/integration/ssh-device-readability.test.mjs` 档内**已有 per-case `withSession`**（`connect` → `finally close`），而 `connectSsh`（`thincoder-core/agent-tools/ssh-session.mjs`）每次都 `createEntry` + `spawnSession`，**不复用 live 会话** ⇒ 「两例共用一个 pty」在代码上不可能。

**我 §1 写的那个病根作废**（照台账旧行的猜测写的，第五次犯同一件事）。

**裁定 = 条目 1 整条退出**，已另挂台账 `#2070`（写清：观察仍在 · 病根证伪 · 真因未定 · 接笔第一动作 = 先复现）。**本批不改 22-3 的任何断言与超时，也不做「定位」**——诊断不是本批的交付面，塞进来只会让 §6 出现一条「未完成」。

⇒ **本批对象 = 两条**：临时目录收尾统一 ∥ 浏览器 profile 隔离。

### ② 取「档内零 `rmSync`」，不开例外；但助手文案要同批跟上

设计席判得对：`test/teardown.mjs` 的 `removeTempDirBestEffort` 内部是 `rm(dir, { recursive: true, force: true, … })`，**`recursive` 对单文件也是合法调用**，所以 `tester-role.test.mjs` 那个单文件桩直接走它即可，不必开例外。

**但有一处不一致要在同批收掉**：它现在只叫「目录」——参数名 `dir`、JSDoc 写「删一个临时目录」、失败文案写 `temp home not removed`。**拿它删单文件时，失败会打出一句错的话。**改成路径中性（参数 `p` ∥ 文案 `temp path not removed`），`test/teardown.mjs` 在本批写域内。

### ③ 一处设计实质改动，我认

`browserPaths()` 基址是模块装载期常量、会话开启处不带参调用 ⇒ 只改 `HOME` 只能按档换 profile，**档内多例仍共用**。设计取注入缝 `_setBrowserPathsBaseForTest` / `_resetBrowserPathsBaseForTest`（成对式，照 `_setConfigPathForTest` 先例，缺省回落生产路径）——**这是把「为什么必须加缝」讲清楚了的少数几次**，保留。

**读数列**：32 档含 `rmSync` ∥ 31 档裸收尾 ∥ 30 档临时目录面——**三个数各有来源，别再合成一个数**。

## 读数更正：待改面是 32 档，不是 30（父侧 · 2026-11-05 05:29）

设计席实测（`Get-ChildItem test/integration -Filter *.test.mjs` + 内容匹配）：

- `test/integration/` 现 **37** 个测试档（目录内零非测试 `.mjs`）
- 内容含 `rmSync` 的 **32 档**——**全部**未调助手（`ssh-file-transfer` 的写在手搓 `try/catch` 里，也算自写）
- 已走助手的 **1 档** = `browser-start-window.test.mjs`，**它不含 `rmSync`**，所以根本不在那 32 档里

⇒ **我 §1 的「32 ∥ 31 ∥ 30」是纸面推演**：从 32 里减掉 `browser-start-window`（它本就不在 32 里）再减掉 `tester-role`（它有**两处**：删临时目录 + 删夹具桩单文件）。**减法做错了两次。**

**裁 = 以 32 为准。**判据本身不受影响（AC-2 是关系式「零 `rmSync` 命中」，不是档数），受影响的只是实施面大小——**按 30 派活会漏 2 档**。

**这是今晚第六次同一形状**：我用「纸面减法」代替「实读」，而实读一次就把三个数都定了。**档数这类东西不许推，只能量。**

## 评审轮 1 的裁定（父侧 · 2026-11-05 05:33）

结论 `changes-required`（🔴 1 · 🟡 7 · 🔵 3）。**11 条全收。**

### 那条 🔴：条目 2 的病根被它的判据出卖了

评审读出来的链条是硬的：

- `test/integration/browser-start-window.test.mjs` 在 `mkdtempSync(...)` 之后赋 `process.env.HOME`，并注明「`configDir` 在模块装载时取值，故先设环境再动态 import」；
- `thincoder-core/config-io.mjs` 的 `configDir = join(homedir(), …)`、`thincoder-core/browser/launch.mjs` 的 `browserPaths(base = configDir)` 合起来 ⇒ **每份并发副本（独立进程）本来就落在各自的临时家目录、各自的 profile 上**。

**而 AC-4 量的正是「同档并发 4 份 × 3 轮」**——那个场景**本来就已经隔离了**。设计新加的缝 `_setBrowserPathsBaseForTest` 只分化「**档内多例**」，够不到 AC-4 的场景。

**裁（二选一，不许模糊）**：

1. **给出 EBUSY 那次的复现命令**（4 份怎么起、几轮、谁跑、当时 `HOME` 设在哪），并据此把「③ 为什么需要新缝」重写成与实读一致的说法——若副本本就各持 profile，则写明这条缝守护的是**哪一次观察**（档内多例共享 profile 的那次红在哪个档、怎么复现）；
2. **给不出就退出本批**：条目 2 整条退出，我另挂台账行（写清「病根未证实、观察来自 X、接笔第一动作 = 先复现」），本批只剩条目 2 之外的那条——临时目录收尾统一。

**理由**：AC-4 是这次改动的验收，而它与改动之间**没有因果链**。留着它，实施完 AC-4 仍红，只能说「走了运」；说它绿了，也证明不了缝有用。**判据必须指到一条能跑的命令。**

### 其余 10 条

- **#2 读数漂（37/32 对实测 38/33）**：改成检时实测值，档数与受影响文件表同源。
- **#3 档位结论**：「测试档零行数义务」不是本仓口径——`.`md` 才是唯一豁免面。补一行：`test/integration/context-overflow-guard.test.mjs` 实测 **508 行**越 500 预警档，给出处置（本批只换一行收尾 ⇒ 不拆 / 拆分计划）。
- **#4 AC-2 半个判断句**：折成两半各自机判，或写成「调助手的集合 = 原 `rmSync` 命中集合」这种两边相等的形。
- **#5 两份验收表打架**：`docs/core/design/TESTING.md` §4.7 的 AC-1 把 T-1 ∥ T-2 也算进单测档，§2 的只算 T-3 ∥ T-4；且 AC-3 ∥ AC-5 在两档里语义互换 ⇒ **同号同义**。
- **#6 归属档漏了**：`docs/core/design/BROWSER-TOOL.md`（`docs/README.md` 指定为该模块的权威档，缝清单住那儿）不在受影响文件表里——要么列进去，要么写明为什么不动它。
- **#7 行号引用**：`timers.mjs:135` ∥ `:55`–`:60` 改符号名；先例行补全「实现坐标 ∥ 设计节 ∥ 先例批」三件。
- **#8 产品码无确定性验证**：补两条——不设缝时基址仍是生产路径 ∥ 设后复位生效。
- **#9 ∥ #10 ∥ #11**：AC-6 归收口（登记备查，不改）；射程形与判据形收敛到同一 glob；§1 模板占位行删掉。

**边界**：只落上表；临时目录那条（条目 2 之外）方向不动。

## 评审轮 2 新提三条与实施席一问的裁定（父侧 · 2026-11-05 05:58）

### 评审新提三条：全收，两条改判法、一条留给收口

**① AC-4 判面不专属本批（🟡 可选 → 父侧直接改判）**

评审实读：AC-4 写「`git diff -U0 -- test/integration` 的增删行里 `assert` 零命中」，而**同夜另一批已把该目录两档列入改面**（`batch-close-gate.test.mjs` 扩 `7-5`、`context-overflow-guard.test.mjs` 扩 `11-5`，均带新 `assert`）。

**⇒ 我裁：这条不是「可选」，是必须改判**——因为它与本夜另一处实测同源：`#43` 实读 `git status --porcelain -- thincoder-core/doc-check` 命中两档（引擎族在途）。**共享工作树上，「某目录 diff 为零」型验收恒假。**

**改判成三件，缺一不可**：

- **正向**：`git diff --stat -- <本批声明碰过的档>` **非空**（证明真动了该动的；缺这件，一个啥也没做的轮次也能过）。
- **收窄**：`assert` 零命中只看**本批改过的那几行**（逐档「改前原文 ∥ 改后原文」照录 §5）。
- **环境**：`git status --porcelain -- test/integration` 原文进 §5，标明「含他批未提交改动」。

**② AC-5 未点档名（🟡 可选）**：收口时一并处理——把「形状先验的那三档」在 §4.7 点名，或绑到「§5 记录的那三档」这一固定落点。

**③ §2 上抛项 ① 已过期（🔵）**：§1 的模板占位行已不在盘，那条留档不改，收口时视为销号。

### 实施席一问：「不抛」契约的两个出口

它问：`const abs = resolve(p)` 在 `try` 之外、`catch` 里 `log(...)` 裸调——要不要加 `try/catch`？

**裁 = 不加，按设计原文收。**

**理由**：§2 把助手这一笔钉成「路径中性三处，**行为零变**」。加 `try/catch` 会改掉非字符串入参下的行为——**那是设计面没批的改动，静默做就是偏离**。它没做，是对的。

**但记一条事实**：`resolve(p)` 在 `try` 外、`log` 裸调，意味着「不抛」契约**只对字符串入参成立**。这是**已知边界**，不是缺口——33 档机械替换时若漏传参，会当场抛出来，**那正是我们想要的**（比静默不清理好）。

### 收口待办（父侧）

- 删 `docs/batches/2026-11-05-test-infra-family.test.mjs`（用毕即删，§5 那条读数即全部保留面）。
- 集成全量跑一次（父侧唯一那一次）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 2 三条已落（AC-4 折三件 ∥ AC-5 点名三档 ∥ 上抛项销号）；§5 披露的设计档两处表述差已收）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖 = 台账 #2066；并入 #2005 ∥ #2051）

| # | 条目 | 判据落点 | 现状 |
|---|---|---|---|
| 1 | 集成用例的临时目录收尾一律走 `removeTempDirBestEffort`——含 `ssh-file-transfer.test.mjs` 的手搓 `try/catch` ∥ `tester-role.test.mjs` 的两处自写清理（临时目录 + 夹具桩单文件） | 设计 `docs/core/design/TESTING.md` §4.6 射程行 ∥ §4.7 AC-2 ∥ AC-3 | 待实施 |

- **不在本批 · 两条，各有出处**：
  - **假设备 pty 跨例串状态**：整条退出（§1 裁定 ①）——本批不改 22-x 的断言与超时，也不做定位。
  - **浏览器 profile 每条用例一个唯一基址（注入缝 `_setBrowserPathsBaseForTest` ∥ `_resetBrowserPathsBaseForTest`）**：整条退出（§1 评审轮 1 裁定 ① 的第二支——给不出复现命令）。**父侧待办 = 另挂一行台账**；取数见下节。

### 浏览器 profile 条目为何退出（读数链，供父侧另挂行取用）

- 唯一在案的 EBUSY 观察 = 2026-11-04 批档的实施读数：同档并发 4 份 × 3 轮，第 1 轮 4/4 退出码 0，第 2 ∥ 3 轮各 3/4。
- 红点原文 = `AssertionError … 实际：Error: EBUSY: resource busy or locked, open '…\Temp\tc-int-browser-home-hRYm1p\.thincoder\browser\profile\DevToolsActivePort'`。
- 该路径落在**那一份副本自己的**临时家目录内 ⇒ 并发副本各持一份 profile，按进程隔离成立；红点是同进程内「它刚 spawn 的浏览器占着 `DevToolsActivePort`」时的开 ∥ 删竞态，不是 profile 共享。
- 档内多例共享 profile 的那次红：**无在案观察**（全仓 `EBUSY` 检索只命中上一条）。
- ⇒ 新缝只分化「档内多例」，够不到该观察的成因；判据与改动之间没有因果链 ⇒ 按 §1 裁定退出，不以「走了运」结案。

### 设计落点

- `docs/core/design/TESTING.md` §4.6：射程 = `test/integration/*.test.mjs`（与判据同一 glob）∥ 射程判据两半各自机判 ∥ 助手路径中性 ∥ 先例三件（已落）。
- `docs/core/design/TESTING.md` §4.7：隔离面两面（pty ∥ 临时目录）∥ 浏览器 profile 面现状写明（不改）∥ 用例表 T-1…T-3 ∥ AC-1…AC-6 ∥ 受影响文件 ∥ 边界（已落）。

### 机制设计（一句话）

用例用 `mkdtempSync` 建自己的临时根（建点三处实测在案：档装载期 ∥ 用例体内 ∥ 工厂内），绝对路径由档掌握；收尾调 `removeTempDirBestEffort(p)`——有界重试、不抛、失败写一行 stderr 点名绝对路径与错误码。档内零 `rmSync`，单文件删除同走助手（不开例外）。

- 依据 `test/teardown.mjs` 的 `removeTempDirBestEffort` 函数体：其 `rm(...)` 调用带 `recursive: true` 与有界重试（`maxRetries` ∥ `retryDelay`）——`recursive` 对单文件同样合法，故「删一个夹具文件」走同一助手。（父侧 2026-11-05 05:53 改写本条与下一条：原写法直引**本批即将改动**的那两行，`#42` 一落盘引文即死，连带把同轮其他批档的写门全卡住，见台账 `#2075`。）
- 依据 `test/teardown.mjs` 的失败文案一行：改前只说「目录」（参数名与文案同口径），拿它删单文件时失败句会说错话 ⇒ 改路径中性（判据 = 参数名与失败行同口径，逐字目标形见 §2 上方，§1 裁定 ②）。

### 受影响文件与测试覆盖

尺寸档位结论 = **零档跨档位**，无拆分计划：

- `.mjs` 受影响档的变动是收尾调用替换，只减不增。
- 受影响档最长者 = `test/integration/context-overflow-guard.test.mjs`（当刻未越 500 预警档）：本批对它替换两处收尾——模块级 `after` 一处 ∥ 用例体内 `t.after` 一处，不拆。
- `docs/core/design/BROWSER-TOOL.md` **不列**：本批不新增缝、不改 `thincoder-core/browser/launch.mjs`，该档所载缝清单（与 `launch.mjs` 头注「注入缝（N-BT6）」同源）仍为现文。

| 文件 | 变动 | 面 |
|---|---|---|
| `test/integration/*.test.mjs`（`rmSync` 命中档全数，读数见下节） | 收尾改调 `removeTempDirBestEffort` | 产品 |
| `test/integration/ssh-file-transfer.test.mjs` | 手搓 `try/catch` 换成助手 | 产品 |
| `test/integration/tester-role.test.mjs` | 两处 `rmSync`（临时目录 + 夹具桩单文件）换成助手 | 产品 |
| `test/teardown.mjs` | 路径中性三处：参数名 `dir` ⇒ `p` ∥ JSDoc「删一个临时路径」∥ 失败行 `temp path not removed`（行为零变） | 产品 |
| `docs/core/design/TESTING.md` | §4.6 射程行 ∥ 助手路径中性 ∥ §4.7 | 设计档 |

- **产品面四行全走 eng-coder**（需设计凭证）：助手的行为零变，缺省 = 原实现。
- **单元测试档**：`docs/batches/2026-11-05-test-infra-family.test.mjs`——T-2（单文件路径走助手）∥ T-3（清理必失败：假 `rm` 抛 `EPERM` + 捕获 `log`）；用毕即删，读数留 §5。

### 验收对照（编号与设计 §4.7 同号同义）

| AC | 判据（机判） | 回指 |
|---|---|---|
| AC-1 | `node --test docs/batches/2026-11-05-test-infra-family.test.mjs` 全绿（T-2 ∥ T-3） | 条目 1 |
| AC-2 | 两半各自机判：① `test/integration/*.test.mjs` 内 `rmSync` 零命中；② `{含 mkdtempSync 的档} 减 {含 removeTempDirBestEffort 的档}` = ∅ | 条目 1 |
| AC-3 | `test/teardown.mjs` 里 `temp home` 零命中 ∧ 参数名 `p` ∧ 失败行 = `[teardown] temp path not removed: <abs> (<code>)` | 条目 1 |
| AC-4 | 断言零改，三件缺一不可：① 正向 `git diff --stat -- <受影响文件表所列档>` 非空；② 收窄 `assert` 零命中只判本批改过的行（逐档「改前原文 ∥ 改后原文」照录 §5）；③ 环境 `git status --porcelain -- test/integration` 原文进 §5，标明含他批未提交改动 | 边界 |
| AC-5 | T-1 抽样三档直达绿——三档点名在设计 §4.7「批量套用」：`context-percent-calibrated` ∥ `digest-empty-round` ∥ `batch-anchor-create`（三形各一） | 条目 1 |
| AC-6 | 整套 `node test/run.mjs` 退出码 0 ∧ `fail 0`——**归收口（父侧一次跑），批内不跑**，登记备查 | 收口 |

- AC-1…AC-6 全部可机判；**整套那一次跑归收口**（父侧），批次内只跑改动面。

### 读数（本席实跑 · 2026-11-05 · 命令即方法）

三个数各有来源，不合成一个：

- **射程 38 档**（当刻 38 · 方法 = `readdirSync` 过滤 `.test.mjs` · 2026-11-05）——`test/integration/` 下 `*.test.mjs` 的文件数，该目录零非测试 `.mjs`。
- **待改面 33 档**（改前读数 · 方法 = 文件内容匹配 `rmSync` 的档数 · 2026-11-05 实施前）——实施后已归零，见下行。
- **当刻 0 命中**（方法 = 38 档逐档 `readFileSync` + 正则 · 2026-11-05 本席复量）——`rmSync` ∥ `rmdirSync` ∥ `unlinkSync` ∥ `.rm(` 四形全 0。
- **当刻集合等式成立**（同方法，逐档集合比对而非数档数）——含 `mkdtempSync` 34 档 ∥ 含 `removeTempDirBestEffort` 34 档 ∥ 差集 ∅。
- 档数与行数只作读数、不作判据（AC-2 是关系式）；`context-overflow-guard.test.mjs` 当刻未越 500 预警档 ⇒ 无拆分计划。

- `tester-role.test.mjs` 两处自写清理：删临时目录一处 + 删夹具桩单文件一处 ⇒ 两处同走助手，不开例外（§1 裁定 ②）。
- `ssh-file-transfer.test.mjs` 的 `rmSync` 在手搓 `try/catch` 内 ⇒ 换成助手。
- 判据取「档内零 `rmSync`」的关系式，不取档数：档数是读数、会漂（评审轮已抓到 37/32 与实测 38/33 两套），关系式逐轮可机判。

### 抽样验证策略

设计 `docs/core/design/TESTING.md` §4.7「批量套用」：先改 3 档验三种清理形（单 `cwd` 一处 ∥ `cwd` + `logsDir` 两处 ∥ `t.after` 内联一条），形状定后一次铺开；铺开后由 AC-2 机判替代逐档跑（AC-5 的抽样三档是形状验证，不是逐档验）。

### 关键决策

| # | 决策 | 为什么 |
|---|---|---|
| K-1 | 隔离面归用例所有 | 共享面上的红不是被验的行为坏了；「收口单跑排除」把判断按次数翻倍 |
| K-2 | 清理统一走助手 | 每档手搓 = 同一纪律 N 份副本 |
| K-3 | 助手取路径中性，不开单文件例外 | `recursive` 对单文件同样合法；例外清单会随批生长（§1 裁定 ②） |
| K-4 | 批量档形状先验再铺开 | 一次改 33 档再一起红 = 同一个判断读 33 遍 |
| K-5 | 判据取关系式，不取档数 | 档数是读数、会漂；关系式（零命中 ∥ 两集合相等）逐轮可机判 |
| K-6 | 浏览器 profile 面退出本批 | 病根被唯一在案读数证伪、无复现命令 ⇒ 判据与改动无因果链（§1 评审轮 1 裁定 ①） |
| K-7 | 假设备 pty 整条退出本批 | 档内已有 per-case `withSession`，两例共用一个 pty 在代码上不可能 ⇒ 病根证伪（§1 裁定 ①） |

### 边界

- 不改任何断言行与超时阈值（那才是业务结果）。
- 不动 `test/run.mjs` 收集面。
- 不改产品运行行为（助手缺省 = 原实现）。
- 不做 22-x 假红的定位；不动浏览器 profile 基址面（不加注入缝）。

### 上抛项

- **已销号**：两条退出的条目都已在台账挂行——假设备 pty = `#2070` ∥ 浏览器 profile = `#2073`（均写清「病根未证实 · 接笔第一动作 = 先复现」，取数见上节读数链）。
- **父侧待办（§1 归主 agent，本席 `batch` 写会被判非作者）**：§1 头部「并入的原行 `#2005` ∥ `#2051` ∥ `#2053`，均已废弃」未提 `#2053` 的接替行 `#2073`——浏览器 profile 条目整条退出本批，其内容现由 `#2073` 持有，§1 那行按现态补指即可。

### 评审轮 2 处置（父侧 2026-11-05 05:58 三条）

| 条 | 处置 | 落点 |
|---|---|---|
| ① AC-4 判面不专属本批（父侧改判 = 必须改） | 折成三件、缺一不可：正向（`git diff --stat` 非空）∥ 收窄（`assert` 只判本批改过的行）∥ 环境（`git status --porcelain` 如实留证） | 设计 `docs/core/design/TESTING.md` §4.7 的 AC-4 行 + 表下「AC-4 的三件」块 ∥ 本段验收对照 AC-4 行 |
| ② AC-5 未点档名 | 设计 §4.7「批量套用」点名三档、一形一档，AC-5 绑到该点名。**不绑 §5**——设计档是一级状态面，指批次段会随批档删除而死 | 设计 §4.7 ∥ 本段验收对照 AC-5 行 |
| ③ 上抛项 ① 已过期 | 销号删除（§1 模板占位行已不在盘） | 本段「上抛项」 |

**§5 披露的设计档表述差两处，已收**：

- 临时目录建点原写「档装载期」——实读亦有用例体内 ∥ 工厂内建（`context-percent-calibrated.test.mjs` 在用例体内建 `cwd`）⇒ 改为三处并列。
- `context-overflow-guard.test.mjs` 原写「只替换收尾一处」——实读两处（模块级 `after` 的 `cwd` ∥ `logsDir` ∥ 用例体内 `t.after` 的 `sessCwd`）⇒ 改为两处；尺寸结论不变。

**AC-5 三档的来路（如实）**：§5 载读数 `tests 4 · pass 4` 但未点名档；本席按「三形各一 + 该读数合计 4 例」点出 `context-percent-calibrated`（1 例）∥ `digest-empty-round`（1 例）∥ `batch-anchor-create`（2 例），三档的形与例数当刻逐档实读（2026-11-05）。若实施席当时所用三档不同，父侧收口按点名三档复跑一次，读数以那次为准。

**本段当刻读数**（方法见「读数」节）：射程 38 档 ∥ `rmSync` 0 命中 ∥ 含 `mkdtempSync` 34 档与走助手 34 档差集 ∅——AC-2 两半现态成立。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 本轮结论（设计评审 · 对象 = 本批 §2 + `docs/core/design/TESTING.md` §4.6 ∥ §4.7）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §4.7 ③「同档并发 4 份 × 3 轮，红数 = 0」对 `browser-start-window.test.mjs`「const HOME = mkdtempSync(join(tmpdir(), "tc-int-browser-home-"))」＋「`configDir` 在模块装载时取值，故先设环境再动态 import」：并发副本各持独立临时家目录 ⇒ profile 已按进程唯一；新缝只分「档内多例」，够不到 AC-4 量的并发副本场景；EBUSY 读数无复现命令 |
| 2 | 🟡 | 待处置 | §2 读数块「37 档」∥「32 档含 `rmSync`」对检时实测（`test/integration` = 38 档 / 33 档含 `rmSync`）；受影响文件表「（32 档，`ssh-file-transfer` ∥ `tester-role` 两档单列）」随之少列一档 |
| 3 | 🟡 | 待处置 | §4.7 受影响文件「零档跨档位」∥「测试档与设计档零行数义务」，对 `context-overflow-guard.test.mjs` 实读 508 行（>500 预警档） |
| 4 | 🟡 | 待处置 | §4.7 AC-2「凡自建临时目录的档收尾调助手（无一档自写清理）」非机判半句；机判式只点名 `rmSync` |
| 5 | 🟡 | 待处置 | `docs/core/design/TESTING.md` §4.7 AC-1「T-1…T-4 全绿」对 §2 AC-1「（T-3 ∥ T-4）」；且两份验收表 AC-3 ∥ AC-5 含义互换 |
| 6 | 🟡 | 待处置 | §2 ∥ §4.7 受影响文件表无 `docs/core/design/BROWSER-TOOL.md`，而 `docs/README.md` 指名「浏览器工具面 **1 档**」为该档；`launch.mjs` 头注「注入缝（N-BT6）」为该模块缝清单 |
| 7 | 🟡 | 待处置 | §4.6「`thincoder-core/agent/timers.mjs:135`」∥ §4.7「（`HOME` ∥ `USERPROFILE` 指向 `mkdtemp` 假家目录，`:55`–`:60`）」——行号引用形（判据 13 禁用） |
| 8 | 🟡 | 待处置 | §4.7 用例表 T-1…T-4 无一条断言 `browserPaths()` 缺省 = 生产路径 ∥ `_resetBrowserPathsBaseForTest()` 复位生效；`launch.mjs` 的缝只有 T-2 这种统计读数 |
| 9 | 🔵 | 记录 | §4.7 AC-6「（归收口，父侧一次跑）」——整套跑已归收口，不构成轮内成本（无需处置） |
| 10 | 🔵 | 待处置 | §4.6「射程 = 全部集成用例档（`test/integration/**/*.mjs`）」对射程判据「`grep -n "rmSync" test/integration/*.test.mjs` 零命中」——射程形与判据形不同 |
| 11 | 🔵 | 待处置 | §1 仍带 `<§1 模板占位：本批条目 / 关键判据 / 授权口径>` |

计数 = 🔴 1 ∥ 🟡 7 ∥ 🔵 3（共 11）

VERDICT: changes-required

### 轮次 2（评审子代理）

### 本轮结论（轮 2 · 只验轮 1 十一条 · 对象 = 本批 §2 ∥ `docs/core/design/TESTING.md` §4.6 ∥ §4.7）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已闭环 | §2「浏览器 profile 每条用例一个唯一基址…整条退出（§1 评审轮 1 裁定 ① 的第二支——给不出复现命令）」＋读数链「该路径落在**那一份副本自己的**临时家目录内」；`docs/core/design/TESTING.md` §4.7「并发副本各持一份（各自 `mkdtempSync`）」且 AC 表不再圈 profile 面 |
| 2 | 🟡 | 已闭环 | §2 读数「**38 档**」∥「**33 档含 `rmSync`**」＝本轮实测同值（`test/integration` 38 档、含 `rmSync` 33 档）；受影响表改成关系式「`rmSync` 命中档全数」 |
| 3 | 🟡 | 已闭环 | `docs/core/design/TESTING.md` §4.7 受影响文件「受影响档中最长者为 `test/integration/context-overflow-guard.test.mjs`，本节对它只替换收尾一处，不拆」；本轮实测该档 495 行（未越 500 预警档）⇒ 结论行与实测相符 |
| 4 | 🟡 | 已闭环 | `docs/core/design/TESTING.md` §4.7 AC-2「两半各自机判」②「{含 mkdtempSync 的档} 减 {含 removeTempDirBestEffort 的档} = ∅」——原来的判断题变成集合等式 |
| 5 | 🟡 | 已闭环 | 两侧同号同义：AC-1 = T-2 ∥ T-3、AC-2 = 两半机判、AC-3 = 助手路径中性、AC-4 = 断言零改、AC-5 = T-1 抽样三档、AC-6 = 整套归收口；§4.7 表头「编号与批档 §2 同号同义」 |
| 6 | 🟡 | 已闭环 | §2「`docs/core/design/BROWSER-TOOL.md` **不列**：本批不新增缝、不改 `thincoder-core/browser/launch.mjs`，该档所载缝清单…仍为现文」——给了不动的理由，且该理由随条目退出而成立 |
| 7 | 🟡 | 已闭环 | `docs/core/design/TESTING.md` §4.6「实现坐标 = 该档的定时器清理支；设计节 = 本档 §4.6；先例批 = 无」；§4.7「实现坐标 = `test/integration/anthropic-tool-roundtrip.test.mjs` 的 `home` ∥ `cwd`」——两处零行号，先例三件齐 |
| 8 | 🟡 | 已闭环 | 条目退出后产品码零改面成立：§2 边界「不改产品运行行为（助手缺省 = 原实现）」＋`docs/core/design/TESTING.md` §4.7 边界「不动浏览器 profile 基址面…不加模块级注入缝」；受影响文件只剩 `test/teardown.mjs` ∥ 集成用例档 ∥ 本档 |
| 9 | 🔵 | 记录 | `docs/core/design/TESTING.md` §4.7 AC-6「**归收口（父侧一次跑），批内不跑**」——与 §1.1 收口分工一致，不构成轮内成本，无需处置 |
| 10 | 🔵 | 已闭环 | `docs/core/design/TESTING.md` §4.6「射程 = 全部集成用例档（`test/integration/*.test.mjs`——单层，且与射程判据同一 glob）」——射程形与判据形已同 glob |
| 11 | 🔵 | 已闭环 | 本档 §1「**状态行**：🔄 进行中（本批输入 = 集成夹具隔离两件；其一已退）」——模板占位行已不在盘 |
| 12 | 🟡（新 · 可选） | 待处置 | `docs/core/design/TESTING.md` §4.7 AC-4「`git diff -U0 -- test/integration` 的增删行里 `assert` 零命中」；`docs/batches/2026-11-05-small-drift-family.md` §2 决策 7「同日另有多本批档与 `test/integration/` 在改…`git diff` 分不出本批动了哪几档」；`docs/batches/2026-11-05-integration-gap-family.md` §5.6 把 `test/integration/batch-close-gate.test.mjs` ∥ `test/integration/context-overflow-guard.test.mjs` 列为同夜改面 ⇒ AC-4 的判面不专属本批 |
| 13 | 🟡（新 · 可选） | 待处置 | `docs/core/design/TESTING.md` §4.7 AC-5「T-1 抽样三档直达绿（形状先验的那三档）」，而同档「批量套用」节只写「先改 2–3 档」未点档名；§2 却称「AC-1…AC-6 全部可机判」 |
| 14 | 🔵（新） | 待处置 | §2 上抛项「§1 的模板占位行 `<§1 模板占位：本批条目 / 关键判据 / 授权口径>` 仍在盘（评审 #11）」——本档 §1 现无该行，该条已满足 |

计数：轮 1 十一条 = 🔴 1 已闭环 · 🟡 7 已闭环 · 🔵 3 已闭环（1 条登记不需处置）；本轮新提 = 🟡 2（可选，不阻塞）· 🔵 1。**未处置 🔴 = 0。**

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**用户原话**：「**都开吧**」（2026-11-05 05:05）——七族开批，本批为其一；覆盖全链。

**批准面**：

- §2 定稿的一条交付：集成用例档收尾统一走 `test/teardown.mjs` 助手（待改面实测 32 档）；助手改路径中性（参数 `p` ∥ 失败行 `temp path not removed`）。
- 评审轮 1 的 `changes-required`（🔴 1）及其 11 条处置的落位。

**父侧裁定**：原条目「浏览器 profile 隔离」**整条退出本批**——病根被实读证伪（并发副本各持临时家目录），已另挂 `#2073`（接笔第一动作 = 先复现）。

**批准即开工**：实施席按 §2 先改 2–3 档验三种清理形，再铺开；AC-2 两半机判。

## §5 实施记录（eng-coder）
**状态行**：实施完成（本席写域 = 助手路径中性 + 批内单测档；集成 33 档归同批另一实施面）



### 交付面（本席实改两档）

| 文件 | 变动 | 判据 |
|---|---|---|
| `test/teardown.mjs` | 路径中性三处：形参 `dir` ⇒ `p` ∥ JSDoc「删一个临时路径（目录 ∥ 单个夹具文件）」∥ 失败行 `temp home not removed` ⇒ `temp path not removed`；另加头注一段写明路径中性的理由 | AC-3 |
| `docs/batches/2026-11-05-test-infra-family.test.mjs` | 批内单测档（用毕于收口删除）：缺省行为一条 ∥ T-2 ∥ T-3 ∥ AC-3 源码形一条 | AC-1 |

- 行为零变的实读落点：`rm(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })` ∥ `opts.rm ?? rmSync` ∥ `opts.log ?? ((line) => process.stderr.write(line + "\n"))` 三处与改前同形，动的只有形参名与两句文案。
- 唯一既有消费者 `test/integration/browser-start-window.test.mjs` 走位置实参 `removeTempDirBestEffort(HOME)`，改名不破调用点。

### 读数（本席实跑 · 2026-11-05）

- `node --test docs/batches/2026-11-05-test-infra-family.test.mjs` ⇒ `tests 4 ∥ pass 4 ∥ fail 0`（AC-1）。
- AC-3 三条机判（`readFileSync` + 正则，脚本即方法）：`temp home` 命中 0 ∥ 形参名 `p` = true ∥ `[teardown]` 行唯一一句 `temp path not removed`。
- 面读数（开工前与收笔后同值，即本席未动集成面）：`test/integration` 现 38 档 ∥ 含 `rmSync` 33 档 ∥ 已走助手 1 档（`browser-start-window`）。

### 轮次与终态

| 轮 | 内容 | 结论 |
|---|---|---|
| 内部审计（explore · 只读） | §2 ∥ §4.6 ∥ §4.7 对交付逐条比对，含「超派活文件表且未披露」一项 | `AUDIT: clean`（四类偏差均未发现） |
| 代码评审（advisor · type=code） | `test/teardown.mjs` + 批内单测档 | `VERDICT: pass`（🟡 1 可选 ∥ 🔵 5） |
| 自修（一轮） | 收 🔵 三条：删掉单测档里重复的一条断言 ∥ 首条用例收尾改 `try/finally` ∥ AC-3 的形参正则放宽到耐受空白 | 复跑 4/4 绿 |

**终态 = clean**（无 🔴；剩 🟡 1 条未改，理由见下节）。

### 写域外，未动（交父侧）

- **集成本面（AC-2 ∥ AC-4 ∥ AC-5）**：`test/integration/*.test.mjs` 的 33 档收尾替换归同批另一实施面，本席派活文件表只有 `test/teardown.mjs`，故一档未动；AC-2 两半现读数 = ① 33 命中 ∥ ② 待改集合 33 档，尚未收敛。
- **整套跑（AC-6）**：归父侧收口那一次跑，本批内未跑。
- **批内单测档留在盘**：按纪律「用毕即删」的删除动作随收口发生；父侧收口前须删它，且 §5 这条读数即它的全部保留面。

### 未改而披露的一件（🟡 · 交父侧裁）

- 评审 🟡（可选）：助手的「不抛」契约留了两个出口——`const abs = resolve(p)` 在 `try` 之外先跑（非字符串 `p` 同步抛 `TypeError`），`catch` 里的 `log(...)` 也裸调（logger 一抛即逃出助手）。
- 本席没改的理由：§2 把助手这一笔钉成「路径中性三处（**行为零变**）」，加 `try/catch` 会改掉非字符串入参下的行为 ⇒ 设计面没批的改动，静默做即偏离。要改请另开一笔或挂台账；不改就按设计原文收。
- 文档漂移：本笔不触碰设计档归属节，§4.6 ∥ §4.7 所载受影响文件行与本次交付逐点相符，无漂。

### 交付面（第二实施面 · 集成 33 档收尾统一）

- 写域 = 声明文件表 33 档 = 实读的 `rmSync` 命中档全数。每档去掉自写收尾，改调 `removeTempDirBestEffort(p)`。
- 三种清理形全覆盖：单 `cwd` 一处 ∥ `cwd` + `logsDir` 两处 ∥ `t.after` 内联一条。两类特例同走助手：`ssh-file-transfer` 的手搓 `try/catch`、`tester-role` 的两处自写清理（临时目录 + 夹具桩单文件）。
- 顺手改掉三档里描述旧机制的注释：原句讲 `force` 只忽略 ENOENT、不重试 EPERM/EBUSY；现句只说走助手（有界重试、失败只写一行 stderr、不判红整档）。
- 助手导入形态统一：`node:` 组尾、注释一行随行、不在组内劈开。删掉的 `rmSync` 同步从 `node:fs` 具名表里去掉，无残留未用导入。
- 写域外零改动。

### 读数（本席实跑 · 2026-11-05）

- AC-2 ①：`rmSync` 在集成用例面 **0 命中**（38 档全扫；`unlinkSync` ∥ `rmdirSync` ∥ `.rm(` 亦 0）。
- AC-2 ②：含 `mkdtempSync` 的 **34 档** 逐档都含 `removeTempDirBestEffort` ⇒ 差集 = ∅（第 34 档 = 范围外的 `browser-start-window`，本就用助手）。
- AC-4：本席作者行（导入行 ∥ 注释行 ∥ 助手调用行）与删除行（原 `rmSync` 行 ∥ 旧注释）里 `assert` **0 命中**；全 diff 的删除行亦 0。
- AC-5：形状先验三档直达绿 ⇒ `tests 4 · pass 4 · fail 0`，stderr 零 `[teardown]` 行。
- must-fix 修复后补跑 `ssh-file-transfer` ∥ `ssh-device-readability` ⇒ `tests 5 · pass 5 · fail 0`，零 `[teardown]` 行。
- 逐档实参核对（脚本即方法）：每档原 `rmSync` 首参表达式在新档里逐条对上，0 档不符。
- 语法面：38 档 `node --check` 全过。

### 轮次与终态

| 轮 | 内容 | 结论 |
|---|---|---|
| 内部审计（explore · 只读） | 五类逐档比对：未处置的自写收尾 ∥ 断言与超时被改 ∥ 清理实参变形 ∥ 注释仍写旧机制 ∥ 导入块被劈开 | `AUDIT: clean` |
| 代码评审 1 轮（advisor · type=code） | 33 档 + 设计档；出 🟡 2（1 条 must-fix）∥ 🔵 3 | `changes-required` |
| 自修 1 轮 | must-fix 落盘：`ssh-file-transfer` 收尾改点名本档临时根（`let scratch` 提到模块作用域 + `if (scratch)` 守卫），不再用 `join(project, "..")` 推导 | 复跑 5/5 绿 |
| 代码评审 2 轮（advisor · 复核） | 只验 must-fix 一条 + 是否引入新问题 | `VERDICT: pass` |

**终态 = clean**（must-fix 0；剩 🟡 1 条 optional + 🔵 3 条，理由见下节）。

### 未改而披露（交父侧与设计席）

- **设计档表述差两处（设计席的笔，本席不改）**：设计档 §4.7 把临时目录自建形写成「档装载期 `mkdtempSync` 建」，而多档实为用例内 ∥ 工厂内建（如 `context-percent-calibrated` 在用例体内建 `cwd`）。同节「本节对它只替换收尾一处，不拆」指 `context-overflow-guard`，该档实读两处收尾块（装载期一处、用例内 `t.after` 一处）。尺寸结论（未越 500 行、不拆）不受影响。
- **一处 🔵 未改**：`tester-role` 的夹具根不登记到集合，收尾只挂在唯一一条用例的 `t.after`。当前行为正确（`makeProject` 只调一次），属惯例不一致而非缺陷。
- **AC-4 判面不专属本批（收口须知）**：同树另有在改面落在本批两档上——`context-overflow-guard` 的 11-5 用例与 `batch-close-gate` 的 7-5 用例属另一批。故 `git diff -U0 -- test/integration` 的**新增**行里含 `assert` 不归本批；本席读数按作者行口径取（本批新增 161 行 ∥ 删除 60 行，`assert` 0 命中）。
- **本面不新增单测档**：AC-1 归同批另一实施面；该档案仍在盘，按其记录于收口前删。

## §6 验证与收口（父代理）

## 验证与收口（父侧 · 2026-11-05 06:41）

### 交付核对

| # | 判据 | 读数 |
|---|---|---|
| AC-1 | 批内单测档全绿（T-2 ∥ T-3） | `node --test docs/batches/2026-11-05-test-infra-family.test.mjs` ⇒ **4 pass / 0 fail**（档本已删，读数取自 §5） |
| AC-2 ① | 集成用例面 `rmSync` 零命中 | 38 档逐档扫 ⇒ **0**（`rmdirSync` ∥ `unlinkSync` ∥ `.rm(` 亦 0） |
| AC-2 ② | `{含 mkdtempSync} − {含助手}` | **34 − 34 = ∅**（逐档集合比对，非数档数） |
| AC-3 | 助手路径中性 | 参数 `p` ∥ JSDoc「删一个临时路径」∥ 失败行 `temp path not removed`；`temp home` 命中 **0** |
| AC-4 | 断言零改 | 按父侧改判三件取：正向非空 ∥ 只看本批改过那几行 ∥ 环境读数留证 |
| AC-5 | 抽样三档直达绿 | 三形各一档实跑 ⇒ **4 pass / 0 fail**，stderr 零 `[teardown]` |
| AC-6 | 整套跑归父侧收口 | 见下 |

### 实施中发现并修掉的真危险

`test/integration/ssh-file-transfer.test.mjs` 原收尾删 `join(project, "..")`，而 `project` 只在 `before` 内赋值 ⇒ **空串时会解析到进程 cwd 的上一级再 `recursive` 强删**。已改为模块作用域 `let scratch` + `if (scratch)` 守卫。**这是「清理代码比不清理更危险」的实例，且它一直都在。**

### 收口门读数

- **集成全量**：`node test/run.mjs` ⇒ **`tests 143 · pass 143 · fail 0`**，exit 0。
- **doc-check 门**：本档 append 回执 `PASS`。
- **暂缓批复核**：无。

### 移出本批的一条（父侧裁定）

原条目「浏览器 profile 隔离」**整条退出**——病根被实读证伪（并发副本各持 `mkdtempSync` 家目录），已挂 `#2073`（接笔第一动作 = 先复现）。本批射程收成**单条**：集成夹具收尾统一。

### 台账

`#2066` 在途 → 待核销 → 已核销。
