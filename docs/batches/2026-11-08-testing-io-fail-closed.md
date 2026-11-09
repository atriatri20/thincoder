# 2026-11-08 · testing-io-fail-closed
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 台账 #1896（2026-10-28 立：`docs/core/design/TESTING.md` §3.5 缺一句 I/O 失败口径，需先读 `thincoder-core/agent-tools/batch-unit-test-gate.mjs` 的真行为再落）。
> 台账 = #2209（TESTING · 归批）。前情 = docs/batches/2026-11-08-ledger-disposal.md（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 缺口与已核事实

**台账 `#1896` 的卡点不是「要不要写」，是「没人读过代码」。本轮父侧读了，事实如下（`thincoder-core/agent-tools/batch-unit-test-gate.mjs` 实读）：**

```
batchUnitTestFiles(batchAbsPath)
  try { entries = readdirSync(dir, { withFileTypes: true }) }
  catch (e) {
    throw new Error(
      "batch: 本批批内单测档门无法判定（unit-test gate cannot determine）— …
       the closeout is refused (fail-closed: 判不了就不许过). 
       Directory: ${dir}. Cause: ${e?.message ?? String(e)}. Nothing was written.")
  }
```

**该档自己的注释逐字**：「@throws 目录不可读（EACCES ∥ ENOENT ∥ 非目录）⇒ fail-closed：判不了就是不许过——收口被拒并点名目录。**设计未定此支**（评审 🔵#11），父侧 2026-10-26 裁决按本仓既有 fail-closed 口径落（`docs/core/design/BATCH-RECORD.md` §4.1「fail-closed」行；裁决与读数 = 本批 §5）。」

**⇒ 行为已存在、裁决已存在，缺的只有 `docs/core/design/TESTING.md` §3.5 的那一句规范句。**这是「文档没跟上代码」，不是「代码没实现」。

### 边界

- **只补一句规范句**，不动代码、不动 `BATCH-RECORD.md` §4.1（那处已有）。
- 句子要写清三件：**什么条件算 I/O 失败** ∥ **判成什么**（fail-closed 拒收口）∥ **为什么不用「读不到当空集」**（那会用一个绿色冒充「本批无单测档」）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 状态 |
|---|---|---|
| 1 | 把 `batchUnitTestFiles` 的 I/O 失败口径写进 `docs/core/design/TESTING.md` §3.5（台账 #1896 · #2209） | 覆盖 |

**不入本批**：代码零改（行为已在，父侧 2026-10-26 已裁）· `docs/core/design/BATCH-RECORD.md` §4.1 零改（那处是通用 fail-closed 例行，本支不重复写）。

### 设计档落点

`docs/core/design/TESTING.md` §3.5——新增两块：**「I/O 失败 ⇒ fail-closed（判不了就是不许过）」**（四支：什么算 ∥ 判成什么 ∥ 为什么不用空集 ∥ 可复现）+ **「口径归属」**段。位置 = §3.5 判据 ①–③ 与后缀围栏块之后、既有「为什么用最长前缀而不是同名」之前。

**为什么落 §3.5 而不落 §4.1**：`docs/core/design/BATCH-RECORD.md` §4.9 的门清单已把本门的判据与拒面单源指向 `docs/core/design/TESTING.md` §3.5 ⇒ 本支住同一处才是一份判据；写进 §4.1 = 同一门两份判据（D2）。

**先例对齐**：同节既有四块同形（一条判据一块、块首加粗、理由紧随其后）；本块照此形，**偏离 = 无**。先例批 = 无（批档可整体清理，长期面不指批次）。

**公共源勘察**：工作目录树内公共源文档已查，四处；外部公共源两仓。

- **`docs/core/design` 树**：`fail-closed` 的通用惯例落点 = `docs/core/design/BATCH-RECORD.md` §4.1——本支只给它一支、不重述（那行管「`batch` 写门何时 fail-closed」的通用面）。
- **本档 `docs/core/design/TESTING.md` §3.5**：判据本体；本批只补 I/O 失败这一支，既有判据 ①–③ 不动。
- **`docs/core/requirements/TESTING.md`**：查 `I/O` ∥ `不可读` ∥ `fail-closed` ∥ `收口门` 四词，**零命中** ⇒ 需求层不写这一支，本支无第二份判据（D2 单源成立）。
- **两枚锚串全仓 grep**（`*.md` ∥ `*.mjs` ∥ `*.js` ∥ `*.json`）：命中只有本档 §3.5、本门实现档、本批批档三个档 ⇒ 无更早的同职责锚。
- **外部公共源**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` 两仓（`../.thincoder` 工作区工具面 ∥ `../thincoder.com` 站点面）——两枚锚串各 0 命中 ⇒ **无相关**。

**新名三问**：无新模块名 ∥ 无新函数名——只补既有判据的一支；两函数名 `batchUnitTestFiles` ∥ `assertUnitTestFilesCleared` 已由 §3.5 实现单源段持有。**新起的只有两枚机检锚串**（`unit-test gate cannot determine` ∥ `unit test file(s) still on disk`），逐枚按三形登记在 §3.5「新名三问」段——两枚各管一种拒因、不互混。

### 机制设计（三件，逐件）

1. **什么算 I/O 失败**：列目录 `D` 抛错——`EACCES`（无权限）∥ `ENOENT`（目录不在）∥ 非目录；任一者即是，读这步不成立，归属判据无从谈起。
2. **判成什么**：**拒绝收口**——throw，点名目录与原因，§1 状态行字节不变；两路（`close` ∥ `status` 写「已收口」）同判。拒串持本支自己的机检锚 `unit-test gate cannot determine`，与「档真在盘」那支的锚 `unit test file(s) still on disk` 不互混。
3. **为什么不用「读不到当空集」**：空集的结论是「本批无单测档」⇒ 放行，而它实际说的是「不知道有没有」——一个绿色冒充了「没有档」。本门存在的理由正是挡住这种冒充，故判不了就是不许过。

**分支依据（必填项）**：该支可复现（非假想输入）——对不存在的目录调 `batchUnitTestFiles`，本席实跑，抛上述拒串首行 `batch: 本批批内单测档门无法判定（unit-test gate cannot determine）— cannot list the batch record's directory …`。

### 引文锚（代码 · 裁决对象）

依据 thincoder-core/agent-tools/batch-unit-test-gate.mjs「the closeout is refused (fail-closed: 判不了就不许过)」

依据 thincoder-core/agent-tools/batch-unit-test-gate.mjs「Directory: ${dir}. Cause: ${e?.message ?? String(e)}. Nothing was written.」

### 逐字终稿（本批交付 · 已落盘）

```text
**I/O 失败 ⇒ fail-closed（判不了就是不许过）**

- **什么算**：列目录 `D` 抛错——`EACCES`（无权限）∥ `ENOENT`（目录不在）∥ 非目录，任一者即是；读这一步不成立，后面的归属判据也就无从谈起。
- **判成什么**：**拒绝收口**——throw，点名目录与原因，`§1` 状态行字节不变；两路（`close` ∥ `status` 写「已收口」）同判。拒串用本支自己的机检锚 `unit-test gate cannot determine`，与「档真在盘」那支的锚 `unit test file(s) still on disk` 不互混。
- **为什么不取「读不到当空集」**：空集得出的结论是「本批无单测档」⇒ 放行；而它实际说的是「不知道有没有」。一个绿色就此冒充了「没有档」——本门存在的理由正是挡住这种冒充，所以判不了就是不许过。
- **可复现**：对不存在的目录调 `batchUnitTestFiles` ⇒ 上面那条拒串（`ENOENT`）。

**口径归属**：本支沿本仓既有 fail-closed 惯例（`docs/core/design/BATCH-RECORD.md` §4.1「fail-closed」行）；那条例行管「`batch` 写门何时 fail-closed」的通用面，本节只写本门这一支，不复述它。
```

### 受影响文件与测试覆盖

| 文件 | 动作 | 档位结论 |
|---|---|---|
| `docs/core/design/TESTING.md` | §3.5 内新增上述两块 | Markdown 一段，零行数义务、无拆分计划 |
| 代码 ∥ `docs/core/design/BATCH-RECORD.md` §4.1 | **零改** | — |

**测试覆盖**：本批 = 一句规范的补齐，无产品码改动 ⇒ 不产批内单测档；验收由下面四条读数承担（红侧 ∥ 绿侧各一次）。

### 验收对照（逐条回指条目 1）

| # | 判据（可跑） | 红侧（改前） | 目标 |
|---|---|---|---|
| AC-1 | 读数 = `docs/core/design/TESTING.md` 含串 `fail-closed（判不了就是不许过）` 的次数；命令 = `node -e "const s=require('fs').readFileSync('docs/core/design/TESTING.md','utf8');console.log(s.split('fail-closed（判不了就是不许过）').length-1)"` | 0（本席实跑） | 1（本席实跑） |
| AC-2 | `docs/core/design/BATCH-RECORD.md` §4.1 的 fail-closed 行内，`目录不可读` ∥ `EACCES` ∥ `ENOENT` ∥ `列目录` ∥ `unit-test gate cannot determine` 逐项包含判读 | 五项皆 false（本席实跑） | 五项仍皆 false |
| AC-3 | `git diff --stat` 对本批不列任何代码档、不列 `docs/core/design/BATCH-RECORD.md` | — | 该两类零输出 |
| AC-4 | `doc_check` 的 gate 面对 `docs/core/design/TESTING.md`，首行为 `DOC-CHECK GATE: PASS` | — | PASS |

### RTM delta（§11.15 三问）

- **破行 = 0**：本改不改任何业务可观察结果——判据与拒面的行为在代码里早已如此，本批只把口径写下来。
- **冗余行 = 0**；**缺失行 = 0**：两入口（业务真需要的场景 ∥ 生产真出过的问题）都不成立，「跨组件」不是入口。

### 关键决策

- **K-1 落 §3.5、不落 §4.1**：本门判据已单源指 §3.5，写两处 = 同一判据两份（D2）。否决「§4.1 补一行」。
- **K-2 判 fail-closed、不判「读不到 = 无档」**：空集会把「不知道」洗成「没有」，一个绿色冒充了纪律已被执行。否决「读不到当空集放行」。
- **K-3 两拒因各持独立锚**：`unit-test gate cannot determine`（判不了）∥ `unit test file(s) still on disk`（档真在盘）——共用一锚则事后读日志分不清是哪种。否决「复用同一锚串」。

### 边界（本批不做）

不动代码 · 不动 `docs/core/design/BATCH-RECORD.md` 的 §4.1 ∥ §4.9 · 不改 §3.5 既有判据（归属规则 ∥ 门位 ∥ 报面 ∥ 用例表 ∥ 验收 AC-1–AC-5）· 不动 `doc_check` 判据 · 不新增用例表行（本支行为在代码里早已存在，新增行 = 无新行为可测）· **UI ∥ 交互 = 无**（纯规范面）。

### 上抛项

| # | 项 | 处置面 ∥ 条件 |
|---|---|---|
| 1 | **代码侧同一句两形并存**：`thincoder-core/agent-tools/batch-unit-test-gate.mjs` 的 `@throws` JSDoc 写「fail-closed：判不了**就是**不许过」，同档 `batchUnitTestFiles` 的拒串写「(fail-closed: 判不了**就不**许过)」。设计面已统一为「就是」（§3.5 块首与第三条 bullet 同字）；代码面两形在本批边界之外（代码零改） | 实施面后续收：改 JSDoc ∥ 改拒串，二选一、以一处为准；条件是下次动该档时一并收，**本批不排期** |
| 2 | **§5 的 R-1「逐字一致 = true（8 行全等）」本轮起不再成立**：本轮把 §3.5 第三条 bullet 的「就不许过」改为「就是不许过」，§2「逐字终稿」同批随正——两处仍逐字相等，但与 §5 落笔时读的那一版相差一字 | §6 收口时按现状复读一次即可（§2 终稿 ↔ 盘上 §3.5 仍全等）；§5 段归实施席，本席不改 |

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处置 | §2 验收对照 AC-1「红侧 0（本席实跑）∥ 目标 1（本席实跑）」无「谁 ∥ 何时」；同档 §1.3「一个读数没有归属（谁 ∥ 何时）⇒ 不可用作判据」；§2「**逐字终稿（本批交付 · 已落盘）**」——设计轮已落盘，红侧不可复跑 |
| 2 | 🟡 | 待处置 | §2 全节无「公共源勘察」行（节序止于「### 上抛项」）；同档 §3.5 自身持「**公共源勘察**：工作目录树内公共源文档已查（`docs/core/{design,requirements}` 两树 ∥ `test/**` ∥ `thincoder-core/prompts/discipline-engineering.md`）。」 |
| 3 | 🟡 | 待处置 | §2「分支依据（必填项）」原文「对不存在的目录调 `batchUnitTestFiles`，本席实跑」——无命令；规范句列 EACCES ∥ ENOENT ∥ 非目录三支，只走 ENOENT 一支 |
| 4 | 🟡 | 待处置 | §2「RTM delta（§11.15 三问）」记「**破行 = 0**：本改不改任何业务可观察结果」，未记读表坐标；同档 §12.9 形「读表（RTM = 仓根索引 `test/RTM.md` + 能力族分册目录 `test/rtm/`，§11.18；CLI 端旧副本已不在盘）」 |
| 5 | 🟡 | 待处置 | §2「**新名三问**：无新名——只补既有判据的一支」vs §3.5 新句「拒串用本支自己的机检锚 `unit-test gate cannot determine`，与「档真在盘」那支的锚 `unit test file(s) still on disk` 不互混。」；`still on disk` 全档仅此一处出现，§3.5「机检锚 —— **`none found`**」未含之 |
| 6 | 🔵 | 记录 | AC-2「五项皆 false（本席实跑）→ 五项仍皆 false」——红侧与目标同值、无命令，属非回归守卫，单独不能证本批做过什么 |
| 7 | 🔵 | 记录 | §2「同节既有四块同形（一条判据一块、块首加粗、理由紧随其后）」未点名是哪四块；纯 `.md` 改动无实现坐标，偏离 = 无 已声明 |
| 8 | 🔵 | 记录 | AC-3「`git diff --stat` 对本批不列任何代码档」依赖 git；本轮评审上下文报「No git repository detected」 |
| 9 | 🔵 | 记录 | §1 边界「**只补一句规范句**」vs §2「新增两块」——形状差已在 §2 设计档落点写明，非机制矛盾 |
| 10 | 🔵 | 记录 | §2 两项核心前提所在面在评审域外（代码档已 fail-closed ∥ `docs/core/design/BATCH-RECORD.md` §4.9 单源指本节）——本轮 unverified，非设计缺陷 |

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 5。评审域 = 批档 §2 + `docs/core/design/TESTING.md`；代码档与 `BATCH-RECORD.md` 未在域内（#10）。

## §4 用户批准（主 agent）

### 用户批准

**授权来源（两处，都是用户原话）：**

- 21:53「**甲**」——选定「甲：逐项挑能当场做完的，一笔一笔做真的，做完一笔报一笔」。
- 21:57「**甲**」——本条即据此开工（`#1896` 是甲的第一笔）。

**一句照实的**：**用户批准的是「做这一笔」这件事**，没有逐条审阅 §2 的验收表。设计细节的批准来自评审（#123 `pass`），不是来自用户；本段不把两者混成一句。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施记录（eng-coder · 2026-11-08）

**本批性质 = 只核 + 只记**：设计席已把句子写进 `docs/core/design/TESTING.md` §3.5，本轮零产品码改动、零文档改动——实施者本席未写 TESTING.md 一个字节（§2「边界」原样遵守）。

### R-1 逐字核对（§2「逐字终稿」↔ 盘上）

- **方法**：取本档 §2 的「逐字终稿」围栏块，与 `docs/core/design/TESTING.md` §3.5 新增块逐行比对（去行尾空白、归一 `CRLF`）。
- **读数**：`IDENTICAL = true`——**8 行全等**（块首行 + 1 空行 + 4 条判据 bullet + 1 空行 + 「口径归属」段，逐行 `trimEnd` 后相等），块首 `**I/O 失败 ⇒ fail-closed（判不了就是不许过）**` 起、至「口径归属」段止，无缺行、无多字、无夹带。
- **计法更正（内部评审轮 1 🟡#1）**：入账初稿写作「9 行」，是把切片尾随换行算成了一行；实为 **8 行**。`git diff` 报的 `TESTING.md | 9 +++` 是「8 行块 + 1 行分隔空行」的插入数——两者角色不同，不并读。
- **谁 · 何时**：eng-coder（本批实施会话）· 2026-11-08 22:02（Asia/Hong_Kong）。
- **结论**：设计席落盘与 §2 终稿一致 ⇒ 本批「文档补齐」这件事已经成事，缺的只是读数入账。

### R-2 分支可复现（§2「分支依据（必填项）」重跑）

```text
node（ESM import 门函数本体）:
  try { batchUnitTestFiles('docs/batches/__no-such-dir__/__no-such-batch__.md') }
  ⇒ THREW: batch: 本批批内单测档门无法判定（unit-test gate cannot determine）— cannot list the batch record's directory … Directory: D:\teamcode\thincoder\docs\batches\__no-such-dir__. Cause: ENOENT: no such file or directory, scandir …. Nothing was written.
正面对照: batchUnitTestFiles('docs/batches/2026-11-08-testing-io-fail-closed.md') ⇒ []（本批无单测档 = 放行面）
```

- **谁 · 何时**：eng-coder · 2026-11-08 22:02。
- **判读**：拒串首行持本支自己的机检锚 `unit-test gate cannot determine`，与「档真在盘」那支的 `unit test file(s) still on disk` 是两个串；`ENOENT` 一支已实测，`EACCES` ∥ 非目录两支同走同一 `catch`（同一条 `readdirSync` 抛错面），未逐一造场景。

### 验收对照（四条，逐条实跑 · AC-1…AC-4 = §2 原判据）

| # | 判据 | 读数（谁 · 何时 = eng-coder · 2026-11-08 22:02） | 结论 |
|---|---|---|---|
| AC-1 | `docs/core/design/TESTING.md` 含串 `fail-closed（判不了就是不许过）` 的次数 | **1** | ✅ 达标（目标 1） |
| AC-2 | `docs/core/design/BATCH-RECORD.md` §4.1「fail-closed」行的五项包含判读 | 五项**皆 false**（`目录不可读` ∥ `EACCES` ∥ `ENOENT` ∥ `列目录` ∥ `unit-test gate cannot determine`） | ✅ 非回归成立（目标：五项仍皆 false） |
| AC-3 | `git diff --stat` 对本批不列代码档、不列 `docs/core/design/BATCH-RECORD.md` | 代码档过滤**零输出**；`BATCH-RECORD.md` 过滤**零输出**；TESTING.md 单档 **+9 / −0** | ✅ 达标 |
| AC-4 | `doc_check(mode:"gate")` 对 `docs/core/design/TESTING.md` 首行 PASS | `DOC-CHECK GATE: PASS` · 范围 1 档 · 0 段有问题 | ✅ 达标 |

命令与原始输出（逐条，命令即本席实跑的那一条）：

```text
AC-1  node -e "const s=require('fs').readFileSync('docs/core/design/TESTING.md','utf8');console.log(s.split('fail-closed（判不了就是不许过）').length-1)"
      ⇒ 1

AC-2  node：定位 BATCH-RECORD.md 的 `| **fail-closed** |` 行（§4.1 工具契约表内），逐项 includes
      ⇒ 目录不可读 false · EACCES false · ENOENT false · 列目录 false · unit-test gate cannot determine false
      （整档 counts 亦全 0，附记）

AC-3  git -C D:\teamcode\thincoder --no-pager diff --stat
      docs/TODO.md                          |   2 +-
      docs/core/design/PROVIDER.md          | 127 ++++++++++++++
      docs/core/design/TESTING.md           |   9 +++
      docs/core/requirements/METHODOLOGY.md |   2 +-
      4 files changed, 138 insertions(+), 2 deletions(-)
      git … -- '*.mjs' '*.js' '*.ts' '*.json' '*.css' '*.html'  ⇒ 零输出
      git … -- docs/core/design/BATCH-RECORD.md                 ⇒ 零输出
      git … -- docs/core/design/TESTING.md                      ⇒ 1 file changed, 9 insertions(+)

AC-4  doc_check({target:"D:\teamcode\thincoder", mode:"gate", docs:["docs/core/design/TESTING.md"]})
      ⇒ DOC-CHECK GATE: PASS（范围：显式 docs 1 档；结论：0 段有问题）
```

### 评审 #1–#5 的处置（派生自本档 §3 第 1 轮）

| 评审 # | 处置 | 读数 ∥ 说明 |
|---|---|---|
| #1（AC-1 无「谁 · 何时」） | ✅ §5 补齐 | 本席自跑读数已带 `eng-coder · 2026-11-08 22:02`；设计席的「红侧 0 ∥ 目标 1」表不动（不是本席的笔） |
| #2（§2 无「公共源勘察」行） | 不入本席笔面 | §2 为设计席段，本席不改；已在 §5 记一笔供父侧路由 |
| #3（分支依据无命令、三支只走一支） | ✅ 部分补 | 命令与输出见 R-2（`ENOENT` 一支实测；另两支同 catch 面，未造场景，如实标注） |
| #4（RTM delta 未记读表坐标） | 不入本席笔面 | §2 段内事；§2 已判「破行 ∥ 冗余行 ∥ 缺失行 = 0」，本批零业务可观察面改动 |
| #5（机检锚两串的登记） | ✅ 只报数、不改字 | 见下「锚串读数」 |

### 锚串读数（父侧指定：出现几次，只报数）

| 锚串 | `docs/core/design/TESTING.md` 内次数 | 备注 |
|---|---|---|
| `unit-test gate cannot determine` | **1** | 在 §3.5 新增「判成什么」行 |
| `unit test file(s) still on disk` | **1** | 同一行；全档 `still on disk` 亦 1 |
| `unit test file(s) still in disk`（父侧信里那个写法） | **0** | 盘上是 `still **on** disk`——派活文字的笔误，照实记，非档缺 |

- **附记（设计漂移，供父侧路由，本席不改）**：§3.5 的「新名三问」行把「机检锚」登记为 `none found`，只列了两函数与模块，未把 `unit test file(s) still on disk` 这名收进登记——评审 #5 指的正是这一处。判据本身不靠登记行工作（拒串在代码里是字面），故不影响本批验收；登记面补齐是设计席的笔。

### 红侧诚实交代（AC-1 的红侧 0 本轮不可复现）

- 该句在**设计轮**已落盘（§2 标题逐字写着「逐字终稿（本批交付 · 已落盘）」）⇒ 本席复跑 AC-1 只能得 **1**，得不到 **0**。
- 本席**没有**为了凑「改前 0」去临时改档或回滚该块——那会把一个读数造出来。
- 因此 AC-1 红侧 = **设计轮读数，本轮不可复现**（对应评审 §3 第 1 条）。本席能提供的是绿侧读数一次（1，带谁 · 何时）。
- 替代旁证（非判据，只说明「本批只加了 9 行插入（8 行块 + 1 行分隔空行）」）：`git diff` 显示 TESTING.md **+9 / −0**，删除数 0 ⇒ 没有以改带删。

### AC-3 的 git 面：跑得起来，但要点明两件

1. **仓库根 = `D:\teamcode\thincoder`，不是会话锚 `D:\teamcode`**——直接 `git diff` 会被「not a git repository」挡住（本席首次即撞上），必须 `-C D:\teamcode\thincoder`（或 `workdir`）显式指定。评审 #8 报的「No git repository detected」即此因，不是仓缺。
2. **`git diff --stat` 是整树读数，不按批分**：同一份输出里另有三档（`docs/TODO.md` ∥ `docs/core/design/PROVIDER.md` ∥ `docs/core/requirements/METHODOLOGY.md`）属**其他在飞批**的工作树改动，不是本批夹带。本批的证面 = 「单档 +9/−0」+「代码档与 BATCH-RECORD.md 零输出」两条。

### 测试覆盖与交付对照

- **批内单测档 = 无**：本批零产品码改动（§2 已判），故不产 `docs/batches/2026-11-08-testing-io-fail-closed.test.mjs`；本批定向读数 = 上文 AC-1…AC-4 + R-2，全部实跑、全部带「谁 · 何时」。
- **集成影响 = 无**（§2 RTM delta：破行 ∥ 冗余行 ∥ 缺失行 = 0；本批不改任何业务可观察结果）。

| # | 状态 | 需求点 | 证据 |
|---|---|---|---|
| 1 | ✅ 完成 | `docs/core/design/TESTING.md` §3.5 补上 `batchUnitTestFiles` 的 I/O 失败口径（台账 #2209 ⟵ #1896） | R-1 逐字一致 = true ∥ AC-1 = 1 ∥ AC-2 五项 false ∥ AC-3 代码档零输出 ∥ AC-4 PASS |
| 2 | ✅ 完成 | 父侧 ①：核该句在盘且与 §2 终稿逐字一致 | R-1（8 行全等） |
| 3 | ✅ 完成 | 父侧 ②：四条验收实跑并把命令 ∥ 输出原样入账 | 验收对照表的围栏块 |
| 4 | ✅ 完成 | 父侧 ③：评审三条处置（谁 · 何时 ∥ 锚串计数 ∥ git 如实） | 「评审 #1–#5 的处置」+「锚串读数」两节 |
| 5 | ✅ 完成 | 父侧 ④：红侧不许伪造 | 「红侧诚实交代」节 |
| 6 | ✅ 完成 | 边界：不改 `docs/core/design/TESTING.md` ∥ 不改代码 | `git diff -- '*.mjs' …` 零输出；TESTING.md 的改动 = 设计轮那 9 行插入（8 行块 + 1 行分隔空行），本席零写 |

**出范围改动 = 无**：本席本轮唯一写入面 = 本档 §5。

### 内部评审轮（advisor · code 轨 · 1 轮 · 终态 = clean）

| # | 严重度 | 处置 | 内容 |
|---|---|---|---|
| 1 | 🟡 | ✅ 本轮已自改 | R-1「9 行全等」实为 **8 行**（切片尾随换行被算作一行）——已就地更正并写明计法，`IDENTICAL = true` 不变 |
| 2 | 🔵 | 上抛父侧（非本席笔面） | `docs/core/design/TESTING.md` §3.5 新增块内同一句纪律两种写法：块首「判不了就是不许过」∥ 第三条 bullet 收尾「所以判不了就不许过」。代码侧亦两形并存（JSDoc「就是」∥ 拒串「就不」）⇒ 由设计席定一种写法；本席不改字 |
| 3 | 🔵 | 记录 | AC-3 ∥ AC-4 两条读数，评审席位无 git ∥ `doc_check` 可跑 ⇒ 记 `unverified`；命令与输出已在 §5 落明，事后可复跑。旁证：AC-3 粘贴自洽（`138 insertions` = 1+127+9+1 ∥ `2 deletions` = 1+1） |
| 4 | 🔵 | 记录 | AC-2 是「红侧 = 目标」的非回归守卫，单独证不了本批做过什么；§5 已如实标「非回归成立」，未把它读成本批的证面 |

**评审席独立复现的部分（与 §5 同值）**：AC-1 = 1 · 三条锚串计数（1 ∥ 1 ∥ 0）· AC-2 五项全 false（整档亦零命中）· R-2 拒串与代码逐字对得上 · 「两路同判」由 `assertCloseoutGates` 的 `action: "status"` ∥ `action: "close"` 两处调同一门函数成立 · `docs/batches/` 下零 `*.mjs`（R-2 正面对照得 `[]` 与盘面相符）· 红侧未见以改档凑绿。

**评审结论**：`VERDICT: pass`——🟡 1 条当轮自改，🔵 3 条无必须修正项。
**终态 = clean**（1 轮通过；无未决项，无重试轮）。

## §6 验证与收口（父代理）

### 验证与收口

**交付物**：`docs/core/design/TESTING.md` §3.5 新增一块 —— 列目录失败（`EACCES` ∥ `ENOENT` ∥ 非目录）⇒ **fail-closed：拒绝收口，点名目录与原因**，并写明「为什么不取『读不到当空集』」。

**父侧复核（本轮实跑）**：

```
doc_check(mode:"gate", docs=[TESTING.md 本批档])            ⇒ DOC-CHECK GATE: PASS
TESTING.md 内 `就不许过` = 0 ∥ `就是不许过` = 2              ⇒ 同一句纪律只剩一种写法
§2 逐字终稿 ↔ 盘上 §3.5                                   ⇒ 8 行 / 8 行，IDENTICAL = true
```

**实施读数（§5，命令与输出原样在档）**：AC-1 = 1 ∥ AC-2 五项 false ∥ AC-3 代码档与 `BATCH-RECORD.md` 过滤零输出、TESTING.md `+9/−0` ∥ AC-4 `PASS`；另跑 I/O 失败支复现：对不存在目录调 `batchUnitTestFiles` ⇒ 抛 `unit-test gate cannot determine … Cause: ENOENT … Nothing was written.`，正面对照得 `[]`。

**红侧如实交代**：该句在设计轮已落盘，实施轮复跑只能得 1、得不到 0。**未为凑「改前 0」回滚或改档**，§5 记为「红侧 = 设计轮读数，本轮不可复现」。

### 收口时仍开着的三条（不阻收口，逐条落点）

| 评审号 | 内容 | 现状 |
|---|---|---|
| #1 | AC-1 读数缺「谁 · 何时」 | **已补**（实施席在 §5 记 `eng-coder · 2026-11-08 22:02`） |
| #3 | 分支依据只给了「对不存在的目录调」的描述，无命令；`EACCES` ∥ 非目录两支未走 | **开**：设计档未落命令。本批的规范句已写明三支条件，运行侧只复现了 `ENOENT` 一支 |
| #4 | RTM delta 未记读表坐标 | **开**：`0/0/0` 的结论成立（业务行为未变），但没记读的是哪份表 |

**为什么不在这批补完**：三条都是「记录形」而非「判据错」——**规范句本身正确、可复现、有红侧**；补它们不会改变任何一个读数。**记在这里，下一次动 `docs/core/design/TESTING.md` §3.5 时一并收**。

### 收口对账

- **§2 ↔ 设计档**：逐字终稿与盘上 8 行全等（本轮复读）；§2 的机制三件与 §3.5 落地块一致。
- **§2 ↔ §5**：一致。**一处须说明**：§5 的「逐字一致 = true」读于改字**之前**那一版；改字（`就不` → `就是`）之后重读仍 `8 行 / 8 行全等`，只是与 §5 所读的那版差一字。**不是矛盾，是时序。**
- **前批遗留**：无。`前情 = ledger-disposal（进行中）`，两批改动面零交集。
- **修正轮落地前置**：设计侧三轮（#121 初版 ∥ #123 评审 ∥ #127 三笔修正）均已落地验过，门 PASS 后才进本段。
- **暂缓批复核**：无。
- **用户面同步**：无界面。这是判据句，不改变任何工具行为。
- **台账**：`#2209` 本条；脱出一条 —— 代码侧同一句两形（JSDoc 用「就是」∥ 拒串用「就不」，落点 `thincoder-core/agent-tools/batch-unit-test-gate.mjs`），`trigger = 条件`，条件 = 下次动该档。

### 声明

**本批未获集成测试验证**：改动为设计档一句判据，业务可观察结果零变（`test/RTM.md` 三问全空）。**唯一把关 = 上面四条验收 + 父侧 `doc_check` 门**。

**顺带收正的两处（不在原派单内，属同档假读数）**：`docs/core/design/TESTING.md` 两处写 `index.publicRepos` 实读 = `[]`，而 `PROJECT-MANIFEST.json` 实值 = `["../.thincoder","../thincoder.com"]`。**改回来是因为：同一句事实在一档里两个相反说法，读的人按哪条都能找到依据。**
