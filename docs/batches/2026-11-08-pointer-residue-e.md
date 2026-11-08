# 2026-11-08 · pointer-residue-e
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——E 簇：`docs/core/design` 长尾 15 档。
> 台账 = #2178（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 尺子与写法（先说约束，因为它决定了本档怎么写）

**写门与本批判据是同一个引擎**（`thincoder-core/doc-check/index.mjs`，`suffixFallback` 常开，单位 = 段，段里剩一条红整笔拒）。所以**本档自己的文字也必须干净**：凡在正文或表格里逐字抄一个改前 token，就等于在这个档里留一条死指针。

本席第一版正是这样被拒的（10 条，全在处置表的「改前 token」列）。**改前形只出现在下面那个围栏里**——围栏是逐字证据（改前 ∥ 改后成对），判据面跳过整块；正文一律只写**改后形**。

**判据取哪把尺**（`docs/core/design/DOC-DISCIPLINE.md` 求值口径）：依据 `docs/core/design/DOC-DISCIPLINE.md`「直接 `import` 引擎函数只作临时诊断，」——验收一律取内置 `doc_check`（同一引擎 `runDocCheck`），或静态面（源面 `grep` ∥ 直读文件 ∥ `git diff` 改动面）。

```text
doc_check({ target: "D:\\teamcode\\thincoder", mode: "report", docs: [
  "docs/core/design/SEND-STALL-DISTILL.md", "docs/core/design/TIMEOUT-DIGEST.md",
  "docs/core/design/BASH-EXECUTOR-FACE.md", "docs/core/design/INSERT-AFTER.md",
  "docs/core/design/LOGGING.md", "docs/core/design/MODEL-SPECS.md",
  "docs/core/design/PROMPT-FIXTURE.md", "docs/core/design/TURN-CAP-CONTINUE.md",
  "docs/core/design/VERIFY-REDESIGN.md", "docs/core/design/WORKSPACE.md",
  "docs/core/design/EDIT-HELPERS.md", "docs/core/design/I18N.md",
  "docs/core/design/STRUCTURE-DEBT.md", "docs/core/design/TEAM-LEDGER.md",
  "docs/core/design/TEAM.md" ] })
A2 ∥ A5 = 同一入口，mode:"gate"
```

**下面这条手跑形只作临时诊断，不作任何判据**（设计轮两读曾不一致：手跑 42 ∥ 工具 221，差异来自会话内跑着的旧构建；两数都只当诊断，谁也不作判据）：

```text
cd D:\teamcode\thincoder
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const d=['docs/core/design/SEND-STALL-DISTILL.md','docs/core/design/TIMEOUT-DIGEST.md','docs/core/design/BASH-EXECUTOR-FACE.md','docs/core/design/INSERT-AFTER.md','docs/core/design/LOGGING.md','docs/core/design/MODEL-SPECS.md','docs/core/design/PROMPT-FIXTURE.md','docs/core/design/TURN-CAP-CONTINUE.md','docs/core/design/VERIFY-REDESIGN.md','docs/core/design/WORKSPACE.md','docs/core/design/EDIT-HELPERS.md','docs/core/design/I18N.md','docs/core/design/STRUCTURE-DEBT.md','docs/core/design/TEAM-LEDGER.md','docs/core/design/TEAM.md'];const r=m.runDocCheck(process.cwd(),{docs:d,mode:'report'});console.log(String(r.report).split('\n').find(l=>l.includes('命中')))})"
```

**设计轮读数 = `命中 42 条（锚 42）`。实施席进场实跑 = `命中 37 条（锚 37）`。本席落盘前按判据（内置 `doc_check`，report）复跑 15 档 = `命中 0 条（锚 0）`。**

差 5 处 = `docs/core/design/LOGGING.md` 3 ∥ `docs/core/design/I18N.md` 2——前序已落（现态 = 仓根全路径），**本批零动**，不进 A3 对号；**可动集 = 42 − 5 = 37**。

分型两读一致：清一色 `锚·档缺`；`引缺` 0 · 段落 0 · 行号坐标 0。

逐档红脚手数（进场实测）：

- SEND-STALL-DISTILL 4 ∥ TIMEOUT-DIGEST 4 ∥ BASH-EXECUTOR-FACE 3 ∥ INSERT-AFTER 3
- MODEL-SPECS 3 ∥ PROMPT-FIXTURE 3 ∥ TURN-CAP-CONTINUE 3 ∥ VERIFY-REDESIGN 3 ∥ WORKSPACE 3
- EDIT-HELPERS 2 ∥ STRUCTURE-DEBT 2 ∥ TEAM-LEDGER 2 ∥ TEAM 2
- `docs/core/design/LOGGING.md` 0 ∥ `docs/core/design/I18N.md` 0（前序已落）
- 合计 37

### 本批条目（覆盖）

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | 现态指针写成错包 ∥ 旧布局前缀：改指盘上那一档 | 覆盖 | 「R1」29 处（可动 24，另 5 处本批零动） |
| 2 | 多候选：按本处上下文定一支，写仓根全路径 | 覆盖 | 「R1」同上 |
| 3 | 非仓内名（拟新增 ∥ 运行期配置 ∥ 示例 ∥ 通配）：改无路径叙述 | 覆盖 | 「R2」7 处 |
| 4 | 盘上已无该件的旧指针（实现件 ∥ 批档测试档）：改角色叙述 | 覆盖 | 「R3」6 处 |
| 5 | 判不了的逐条列出（档 + 处 + 原因） | 覆盖 | 「判不了」 |
| 6 | 段落 ∥ 行号坐标（全仓面） | **不在本批** | 派单「不在射程，别顺手改」 |
| 7 | 15 档 `hits` 归零，且全量 `引缺` 不增 | 覆盖 | 「验收」A1 ∥ A2 |

条目 5 与 1–4 并列，不是兜底：**把判不了的猜掉，比留着红更贵**——猜错那处会以「已清」的样子留在规范面上。

### R1–R6 落到本批（设计轮共 42 处：R1 29 ∥ R2 7 ∥ R3 6；可动集 37 处 = R1 24 ∥ R2 7 ∥ R3 6；R4 ∥ R5 ∥ R6 见本节末）

**R1 现态指针 → 仓根全路径（29 处，其中 5 处本批零动 ⇒ 可动 24 处）**。两支：**多候选**按本处上下文定一支；**错包 ∥ 旧布局前缀**改指盘上实档。这一族只改指针形，不动句子语义。

**R2 非仓内名 → 不带路径形态的叙述（7 处）**。四个子类在本批都出现了：拟新增档（今天没有真档）、运行期配置名（读的是哪一类目录）、示例拼写、通配残段。

**R3 盘上已无该件 → 角色叙述，不写档名（6 处）**。判法：**只说现态由谁承载**，不写死件名、不写「已删 ∥ 已退役」这类历史句（那类句子留的是死指针的替身）。

**R4 沿革段旧路径（本批 0 处）**。15 档里没有独立的沿革段；30 出头的对位表行虽带历史注记，token 都落在现态列上，按 R1 处置。

**R5 站点仓件（本批 0 处）**。本批 15 档无站点仓指针。

**R6 按段推进**：一处一段，段内多处同笔清完；段里剩一条红整笔拒，所以「段」就是实施席的推进单位与验收单位。

### 逐处处置（改前形逐字，改后形逐处）

围栏内是**改前 ∥ 改后**成对证据：左列逐字抄自盘上，右列是本批要落的形。

```text
# R1 —— 现态指针（29 处）# 改前 token ⇒ 改后形
- SEND-STALL-DISTILL ×4（发射函数句 ∥ 现体消费句 ∥ 表·轮末发射行 ∥ 表·re-export 行）：改前 token 逐字见下块「对号键」
- ⇒ 改后 = thincoder-vscode/src/explore-distill.mjs（发射函数本尊所在）；面板级调用点 = thincoder-vscode/src/extension/panel-turn-loop.mjs
- VERIFY-REDESIGN ×3（对位表 VSC 列三行：guard 首闸 ∥ 重试 ∥ 耗尽）：改前 token 逐字见下块「对号键」
- ⇒ 改后 = 核单源叙述（核 thincoder-core/agent/completion.mjs 常量）
BASH-EXECUTOR-FACE ×3                        prompt-injections.mjs（本句自述三端）
                                             ⇒ 逐处写全三档：thincoder-cli/src/prompt-injections.mjs
                                               ∥ thincoder-vscode/src/prompt-injections.mjs
                                               ∥ thincoder-desktop/src/main/prompt-injections.mjs
LOGGING ×3（本批零动·前序已落）              log.mjs ⇒ thincoder-core/log.mjs
I18N ×2（本批零动·前序已落）                 i18n.mjs ⇒ thincoder-vscode/src/i18n.mjs
MODEL-SPECS ×1                               settings.mjs ⇒ thincoder-vscode/src/extension/settings.mjs
EDIT-HELPERS ×1                              shared.mjs ⇒ 删裸名（同句括注已有 thincoder-core/tools/shared.mjs）
STRUCTURE-DEBT ×1                            search.mjs ⇒ 展开花括号为三档：thincoder-core/tools/file.mjs
                                               ∥ thincoder-core/tools/patch.mjs ∥ thincoder-core/tools/search.mjs
TEAM-LEDGER ×1                               package.json（三端泛指）⇒ 删泛指裸名，保留同句三全路径
TEAM-LEDGER ×1                               team.mjs ⇒ thincoder-core/team.mjs
TEAM ×1                                      provider-admin.mjs ⇒ thincoder-cli/src/tui/provider-admin.mjs
TIMEOUT-DIGEST ×3                            config.mjs ⇒ thincoder-core/config.mjs
                                             proxy.mjs ⇒ thincoder-core/proxy.mjs
                                             suspension.mjs ⇒ thincoder-core/agent/suspension.mjs
TURN-CAP-CONTINUE ×1                         turn-face.mjs（同行两条全路径的简写）⇒ 写全
                                               thincoder-desktop/src/main/turn-face.mjs
PROMPT-FIXTURE ×1                            ../thincoder-core/provider/index.mjs（import 相对形）
                                             ⇒ thincoder-core/provider/index.mjs
PROMPT-FIXTURE ×1                            run.mjs ⇒ prompt-fixture/run.mjs
WORKSPACE ×2                                 src/peer-instances.mjs ⇒ thincoder-core/peer-instances.mjs
                                             src/peer-domains.mjs   ⇒ thincoder-core/peer-domains.mjs

# R2 —— 非仓内名（7 处）
PROMPT-FIXTURE ×1                            package.json（该句断言仓根没有它）⇒ 改述「根下不承载包清单」
TURN-CAP-CONTINUE ×2                         package.json（运行期读同目录）⇒ 改述「读同目录的包清单」
MODEL-SPECS ×1                               thincoder-core/model-specs-table.mjs（拟新增）
                                             ⇒ 「本包内拟新增的表档（去扩展名命名）」
MODEL-SPECS ×1                               src/extension/settings-snapshots.mjs（拟新增 + v1 前缀）
                                             ⇒ 「VSC 扩展目录下拟新增的快照档（去扩展名命名）」
EDIT-HELPERS ×1                              ./a.md（拼写差异示例）⇒ 改述「带 ./ 前缀与不带的两种写法」
TIMEOUT-DIGEST ×1                            .test.mjs（通配残段）⇒ 改述「与批档同名的单测档」

# R3 —— 盘上已无该件（6 处）
INSERT-AFTER ×3                              thincoder-vscode/src/tools/more-file.mjs
                                             ⇒ 角色叙述：VSC 端 insert_after 由核 thincoder-core/tools/file.mjs 承载，
                                               无自有 dirty 面（不写死件名）
STRUCTURE-DEBT ×1                            thincoder-vscode/src/agent/tool-gates.mjs
                                             ⇒ 角色叙述：消费面 = thincoder-core/agent-tools/design-token.mjs
WORKSPACE ×1                                 thincoder-vscode/src/extension/rules.mjs（该行自述已删）
                                             ⇒ 角色叙述：VSC 经核件直取（该行结论本就是「已消解」）
TEAM ×1                                      docs/batches/2026-10-15-team-token-rotation.test.mjs
                                             ⇒ 角色叙述：本批单测档（随批删，「零留存」）
```

```text
# 改前 token 逐字（A3 对号键：run-stages 一族）
SEND-STALL-DISTILL ×4 ∥ VERIFY-REDESIGN ×3   改前 = thincoder-vscode/src/agent/run-stages.mjs
                                             （VSC 端 agent 目录下，盘上已无该档）
```

### 定支依据（R1 的每一支都是盘读，不是选一个像的）

**错包 ∥ 旧布局**（处数以围栏为准，本节只给理由，不另立数）：

- `run-stages` 七处：`thincoder-vscode/src/agent` 目录实读无该名；全仓该名只在 `thincoder-core/agent/run-stages.mjs`
- **核档不承载被述语义**：`fireEndOfRunDistill` 全仓只在 `thincoder-vscode/src/explore-distill.mjs`
- `MAX_VERIFY_*` 常量面在 `thincoder-core/agent/completion.mjs`；`thincoder-vscode/src/agent/run-helpers.mjs` 只注记取值来源
- ⇒ 七处按**语义本尊**改：蒸馏 4 处 → `thincoder-vscode/src/explore-distill.mjs`；verify 3 处 → 核单源叙述
- `thincoder-core/peer-instances.mjs` ∥ `thincoder-core/peer-domains.mjs` 两处：仓根无 `src`（旧 v1 布局），核包两档在盘。
- `thincoder-core/config.mjs` ∥ `thincoder-core/proxy.mjs` ∥ `thincoder-core/agent/suspension.mjs` 三处：消费面同句已给（`loadConfig` 提升段 ∥ 传输层缺省 ∥ 池存活判据），核包各一档。`thincoder-server/src/ops/config.mjs` ∥ `thincoder-server/src/gateway/proxy.mjs` ∥ `thincoder-vscode/src/extension/suspension.mjs` 三档不是本句的主体。

**多候选逐处上下文**：

- 核 = `thincoder-core/log.mjs`：该表是双端同路径融合记录，融合后单源在核。
- VSC = `thincoder-vscode/src/i18n.mjs`：两处先行词都是「VSC」，同句已出现 VSC 字典位全路径。
- VSC = `thincoder-vscode/src/extension/settings.mjs`：组边界（快照族 ∥ 渠道路由族 ∥ 密钥 MCP 族）与「拆出扩展目录」都指 VSC 侧。
- 核 = `thincoder-core/team.mjs`：本句主体是「不改登录 ∥ 凭据面」；核档 282 行含 64 处 login ∥ credential ∥ token，端侧两档各 13 ∥ 11 处（薄壳）。
- CLI = `thincoder-cli/src/tui/provider-admin.mjs`：全仓该谓词的 export 面只有 CLI 两档，服务端同名档无该符号。
- 夹具 = `prompt-fixture/run.mjs`：本段在述夹具入口；同句的比对脚本已因唯一后缀转绿，可见夹具包是它的归属。
- 桌面 = `thincoder-desktop/src/main/turn-face.mjs`：该行主格是桌面对位表，括注是同一行两条全路径的简写。
- 三端全列 = `thincoder-cli/src/prompt-injections.mjs` ∥ `thincoder-vscode/src/prompt-injections.mjs` ∥ `thincoder-desktop/src/main/prompt-injections.mjs`：本句字面写「三端」，盘上恰三档；写任一支都是改错语义。
- 删重复 = `thincoder-core/tools/shared.mjs`：同句括注已给该全路径，裸名与三端泛指（`package.json`）都是冗余。

### 判不了的逐条（条目 5）

**① 两处「状态列」被指针修复照出，但不在本批处置权内。**

`docs/core/design/WORKSPACE.md` 状态列写「建核补齐」的两行，而核包两档已在盘；`docs/core/design/STRUCTURE-DEBT.md` 状态列写「跨端仍分叉」的那一行，而 VSC 自持件已不在盘。

指针按 R1 ∥ R3 改（改完各自可解析），**但「合并是否已完」要读两端实现才定得了**，不是补目录段。⇒ 不改状态列，逐条报。

**② 判据面缺口：拟新增档与「断言不存在」今天没有合规写法。**

R2 的七处里，五处落在这一类（拟新增两处 ∥ 运行期包清单三处——其中一处是「根下确实没有这个档」这种断言句），只能靠「不带可解析档名」的叙述避红。**判据面表达不了「将来才有的档」与「这里确实没有这个档」**——与上一批撞上的运行期档名族同源。规则面在 `docs/core/design/DOC-DISCIPLINE.md`，不在本批 15 档内，本席不改。

**③ `prompt-injections` 三处写全三档后句子变长。**

「三端某档」这种泛指在判据面上没有紧凑合规形（花括号展开不是可解析路径）。本批取写全三档，代价是句长；若判据面将来给泛指族开口子，可回收。

### 引文风险

本批只改指针形与叙述形，**一条 `依据 <档>「逐字」` 都不动**。改完仍须跑一次全量：`引缺` 与改前逐位相同才算过。红侧 = 打断任一引文后复跑，`引缺` 变大。

### 边界

可以改：本批 15 档。不许动：别的档 · 产品码 · 需求档 · 台账 · 本档 §1 ∥ §3 ∥ §4 ∥ §6。判据共用档只读不改，发现缺口一律上抛。

### 受影响文件与测试覆盖

- **受影响档 = 15 档设计档 + 本批档**。15 档的全列 = A1 那条 `doc_check` 调用的 docs 清单（单一来源，此处不重抄）。
- **分层结论**：全部是 `.md` 文档档 ⇒ 源码行数软线 ∥ 硬限**不适用**（文档档零行数义务）；本批零源码档、零跨层改动。
- **测试覆盖**：本批不改产品码 ⇒ 无改面单测档（那类档只在有产品码改动时产生，且用毕即删）。
- **验证三面**：内置 `doc_check`（A1 ∥ A2 ∥ A5）∥ 手跑形（临时诊断，不入判）∥ 静态面 `git diff`（改动只落在上面 15 档 + 本批档）。

### 集成测试设计（RTM 差量 · 起手读 `test/RTM.md`）

**差量 = 破 0 ∥ 冗余 0 ∥ 缺 0。**

- **破 0**：本改动只编辑文档正文（指针形 ∥ 叙述形），不动产品码、不动门禁行为、不重编号任何节。
- **破 0 的实读**：`grep` 扫 `test/`，命中这 15 档共 4 行——`test/integration/sse-first-chunk-window.test.mjs` 档头 1 行（判据来源注释）∥ `test/rtm/loop.md` 节注 2 行（故事 19 ∥ 25）∥ `test/rtm/tooling.md` 节注 1 行（故事 28）；**全是回指，无一处断言这 15 档的正文**。
- **冗余 0**：没有一行因为本改动失去它所评估的交互。
- **缺 0（唯一可接受的理由）**：本改动**没有产生任何用户可进入的业务场景，也没解决任何生产问题**——它把设计档里的死指针改成能解析的形，读文档的人看到的东西变了，产品行为一处没变。集成用例只从两个入口长出（业务场景 ∥ 生产问题），本批两个都不满足 ⇒ 不新增行。
- **三处跨档回指的节号本批一字未动**：`docs/core/design/TIMEOUT-DIGEST.md` §2.4 与 `docs/core/design/EDIT-HELPERS.md` §7.1 ∥ §7.2 ∥ §7.3 已实读在盘；`docs/core/design/TURN-CAP-CONTINUE.md` §6 本席未复读——本批不动该节，它与本批改动无关。
- **为什么不是「跨了组件所以要一个用例」**：本批跨的是文档层与判据引擎层，两者之间没有用户可见入口；「跨组件」不是长出用例的入口，那两个入口才是。

### 验收（每条带命令；红侧实测）

**A1 15 档 `hits` 归 0**：命令 = 内置 `doc_check`（`mode:"report"`，docs = 15 档全列）。红侧 = 同一调用、同一清单在设计轮的读数 **42**（本席落盘前按同一判据复跑 = **0**）。手跑 `import` 形只是临时诊断，不作判据。

**A2 全量 `引缺` 不增**：内置 `doc_check`（`mode:"gate"`）跑一次 `docs/**`（扣 `_archive`），`引缺` 与改前逐位相同。**域为什么要全量**：`引缺` 在**引用方**判——只判这 15 档，看不见别人引它们时把引文写坏，红侧因此只能在全量面上取。

**A3 逐处对号**：可动集 **37 处**（R1 24 ∥ R2 7 ∥ R3 6）按「档 + 改前 token」逐处落，**不按行号**（行号随本批改动漂移）；另 5 处（`docs/core/design/LOGGING.md` 3 ∥ `docs/core/design/I18N.md` 2）本批零动，不进对号。设计轮总数 42 = 37 + 5。

**A4 判不了清单给出**：条目 5 三条；为空也要写「无」——空与漏记在报面上同形。

**A5 本档自身干净**：`§2` 落盘后本档入判（内置 `doc_check`，`mode:"gate"`），首行 `DOC-CHECK GATE: PASS`。红侧 = 本席第一版被拒 10 条（真跑过，不是推演）。

### 验收对照（批次条目 → 判据）

| 条目 | 判据 | 红侧（同一命令同一清单） |
|---|---|---|
| 1 现态指针改指盘上那一档 | A1 ∥ A3 | 设计轮 42 ⇒ 落盘前 0 |
| 2 多候选按本处上下文定一支 | A1 ∥ A3 | 同上；每支的盘读见「定支依据」 |
| 3 非仓内名改无路径叙述 | A1 ∥ A3 | 同上 |
| 4 盘上已无该件的旧指针改角色叙述 | A1 ∥ A3 | 同上 |
| 5 判不了逐条列出 | A4 | 三条，逐条见「判不了的逐条」 |
| 6 段落 ∥ 行号坐标（不在本批） | 零改动 | `git diff` 不见这两类 |
| 7 15 档 `hits` 归零 ∧ 全量 `引缺` 不增 | A1 ∥ A2 | A1 = 42；A2 = 与改前逐位相同 |
| 设计席自身（本档） | A5 | 第一版被拒 10 条 |

### 关键决策

**KD-1 R1 不只换路径，同笔改述「某端自持一档」那句。**

只换路径会造出「同一行两列写同一档」的表，读者看不出双端已并。`run-stages` 七处与 `insert_after` 三处都按此改述。理由：指针绿了而句子仍说「两端各一份」，是**把假话留在规范面**。

**KD-2 R2 写计划 ∥ 环境叙述，不写路径。**

拟新增档写成路径，就是给自己造一条今天不成立、将来才成立的指针；判据面判它红是对的。取「不带后缀的档名 + 所在包」，语义（要拆出这一档）一字不动。

**KD-3 R3 只写现态承载者，不写「已删 ∥ 已退役」。**

历史句是死指针的替身：读的人照样会去解析那个件名。四组（`more-file` ∥ `tool-gates` ∥ `rules` ∥ 批档测试档）一律写「现态由谁承载」。

**KD-4 状态列判断不并入本批。** 见「判不了 ①」。

### 上抛项

**1〔知会〕判据面缺口两条**（拟新增档 ∥ 断言不存在），规则面在 `docs/core/design/DOC-DISCIPLINE.md`，本席无权改；本批按叙述形规避，缺口本身要另立处置。

**2〔知会〕三处状态列可能已被实盘推翻**（`docs/core/design/WORKSPACE.md` 两行 ∥ `docs/core/design/STRUCTURE-DEBT.md` 一行），本批只修指针；它挡不住本批验收（A1 打在 token 上，不在状态列上）。

### 最近先例 ∥ 调研证据 ∥ 待裁三件

**最近先例**

- 同形处置 = `docs/batches/2026-11-08-pointer-debt.md`（同日收口的指针批，R1/R3 同族）
- 对齐：处置族划分 · 逐处对号按 token 不按行号 · 验收双半（锚归零 ∥ 引缺不增）照搬
- 偏离：本簇多出「多候选按本处上下文定支」与「零命中改角色叙述」两族，故新增「定支依据」逐支给盘读

**调研证据**

- 查过 `docs/core/design/DOC-DISCIPLINE.md`（求值口径 ∥ §3.27 条目 AA ∥ §3.28 条目 AB）∥ `docs/core/design/EDIT-HELPERS.md` §6 ∥ `docs/core/design/TOOLS.md` §6.6 ∥ §8.2
- **现成写法有两条，就在 `docs/core/design/DOC-DISCIPLINE.md` §3.28 条目 AB**：依据 `docs/core/design/DOC-DISCIPLINE.md`「行内必须提一个假设档名时写尖括号占位形」——同档 §3.27 条目 AA 同形（三处示例路径「改成不指真档的占位形」）。
- **为什么它的射程够不到本批三类**：占位形换掉的是**词干**（`thincoder-core/doc-check/anchors.mjs` 的 `PLACEHOLDER_STEMS` 含 `name`，实读），所以它只表达「一个还没取名的假设档」。本批三类都不是那件事：① 拟新增档**名字已定**（要说清拆哪一档，名字不能丢）② 运行期包清单说的是「这个位置读到什么」，不是某个档 ③ 「根下确实没有这个档」是**否定断言**——写成占位形等于把它改成「这里有一个假设档」，语义反了。
- 结论：判据面对上面三类无合规写法——**查过，有相关但不是同一件事**（不是「什么都没有」），按叙述形规避，缺口逐条上抛。
- 库外 = B 类：改动面 = 15 档设计档；外部断言 = 零

**待裁三件（谁裁 · 条件 · 到期）**

- 判据面缺口（拟新增档 ∥ 断言不存在）：裁 = 用户；条件 = 规则面给出合规写法后复核；到期 = 本批收口仍无写法 ⇒ 转台账一行
- 三处状态列（`docs/core/design/WORKSPACE.md` 两行 ∥ `docs/core/design/STRUCTURE-DEBT.md` 一行）：裁 = 用户；条件 = 读两端实现定「合并是否已完」；到期 = 下一触及该面的批
- 泛指族（三端某档）无紧凑合规形：裁 = 用户；条件 = 判据面给泛指族开口子；到期 = 下次做该族时回收

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**第 2 轮核对**：原表 11 条（2 🔴 ∥ 7 🟡 ∥ 2 🔵）逐条对现档复核；新条 3（1 🔴 ∥ 2 🔵）。

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|-----|--------|------|--------------|
| 1 | 1 | 🔴 | 已修 | §2「集成测试设计（RTM 差量）」在册：破 0 ∥ 冗余 0 ∥ 缺 0；缺 0 携「本改动没有产生任何用户可进入的业务场景」与「两个入口」论证；实读 test/ 面四处回指 |
| 2 | 2 | 🔴 | 已修 | §2「尺子与写法」验收取内置 `doc_check`；手跑 import 形落围栏且标「只作临时诊断，不作任何判据」；A1 改指内置入口 |
| 3 | 3 | 🟡 | 已修 | 「可动集 = 42 − 5 = 37」；处置栅 LOGGING ∥ I18N 标「本批零动·前序已落」；A3 改判 37 处 |
| 4 | 4 | 🟡 | 已修 | 原话「R2 的七处里，五处落在这一类（拟新增两处 ∥ 运行期包清单三处——其中一处是「根下确实没有这个档」这种断言句）」，与栅逐处相合 |
| 5 | 5 | 🟡 | 已修 | 新设栅「改前 token 逐字（A3 对号键：run-stages 一族）」给出该族改前形；围栏整块跳过 ⇒ 不违自定书写规则 |
| 6 | 6 | 🟡 | 已修 | 调研证据点名条目 AB-3 与条目 AA（两处引文经在盘实读确认逐字在场），并给出射程够不到的三类理由；结论改「查过，有相关但不是同一件事」 |
| 7 | 7 | 🟡 | 已修 | 判不了① 与待裁行改「状态列写「建核补齐」的两行」——位置改由内容定位，行号已删 |
| 8 | 8 | 🟡 | 已修 | §2 模板占位行已除；补出「受影响文件与测试覆盖」∥「验收对照」两段（§1 占位仍在，属主 agent 席，记协调项不入本表） |
| 9 | 9 | 🟡 | 已修 | 「定支依据」正文九条 bullet 头改仓根全路径，裸名已除，与自定「正文一律只写改后形」齐 |
| 10 | 10 | 🔵 | 已修 | 「分层结论：全部是 `.md` 文档档」在册，档位面判了「不适用」 |
| 11 | 11 | 🔵 | 已修 | A2 携「域为什么要全量」——引缺在引用方判 ⇒ 只能在全量面取红侧 |
| 12 | — | 🔴 | 新 | 同一清单的三读不可比：原话「手跑 42 ∥ 工具 221」∥「复跑 15 档 = `命中 0 条（锚 0）`」∥ A1「红侧 = 同一调用、同一清单在设计轮的读数 **42**」——工具读数在册两值（221、0），A1 却把 42 记成「同一调用」；若 0 为真，A1 绿侧在改动前即成立（恒绿），红侧不成立 |
| 13 | — | 🔵 | 新 | 对号键给 7 处（两档）共用一条改前形；逐处书写形未逐处列，实施席需逐处核（形不符则对号断） |
| 14 | — | 🔵 | 新 | 「三处跨档回指的节号本批一字未动」一腿自承「未复读」，而本批确改该档三处；节号不动则影响面小，建议补读该节或在句内点名落点 |

VERDICT: changes-required

计数：🔴 1 条（新，未解）· 🟡 0 条未修 · 🔵 2 条（新）· 已修 11 / 11（原 2 🔴 + 7 🟡 + 2 🔵 全部核销）。intake 范围外的读物：`test/RTM.md` ∥ `test/integration/**` ∥ `thincoder-vscode/src/agent/**` 只作存在性核（引用的四条测试面与「agent 目录无 run-stages」两项成立）。

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
