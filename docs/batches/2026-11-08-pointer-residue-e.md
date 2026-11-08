# 2026-11-08 · pointer-residue-e
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——E 簇：`docs/core/design` 长尾 15 档。
> 台账 = #2178（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 尺子与写法（先说约束，因为它决定了本档怎么写）

**写门与本批判据是同一个引擎**（`thincoder-core/doc-check/index.mjs`，`suffixFallback` 常开，单位 = 段，段里剩一条红整笔拒）。所以**本档自己的文字也必须干净**：凡在正文或表格里逐字抄一个改前 token，就等于在这个档里留一条死指针。

本席第一版正是这样被拒的（10 条，全在处置表的「改前 token」列）。**改前形只出现在下面那个围栏里**——围栏是逐字证据（改前 ∥ 改后成对），判据面跳过整块；正文一律只写**改后形**。

会话内 `doc_check` 工具读得比盘上引擎多（同一份 15 档：工具 221 ∥ 盘上 42）——那是会话里跑着旧构建，**不是第二把尺子**，也不作为任何判据。本批一律取盘上引擎。

```text
cd D:\teamcode\thincoder
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const d=['docs/core/design/SEND-STALL-DISTILL.md','docs/core/design/TIMEOUT-DIGEST.md','docs/core/design/BASH-EXECUTOR-FACE.md','docs/core/design/INSERT-AFTER.md','docs/core/design/LOGGING.md','docs/core/design/MODEL-SPECS.md','docs/core/design/PROMPT-FIXTURE.md','docs/core/design/TURN-CAP-CONTINUE.md','docs/core/design/VERIFY-REDESIGN.md','docs/core/design/WORKSPACE.md','docs/core/design/EDIT-HELPERS.md','docs/core/design/I18N.md','docs/core/design/STRUCTURE-DEBT.md','docs/core/design/TEAM-LEDGER.md','docs/core/design/TEAM.md'];const r=m.runDocCheck(process.cwd(),{docs:d,mode:'report'});console.log(String(r.report).split('\n').find(l=>l.includes('命中')))})"
```

改前读数（本席实跑）= `命中 42 条（锚 42 · 文字太长 0 · 行太长 0）`；分型 = 清一色 `锚·档缺`；`引缺` 0 · 段落 0 · 行号坐标 0（只就这 15 档）。

逐档处数：SEND-STALL-DISTILL 4 ∥ TIMEOUT-DIGEST 4 ∥ BASH-EXECUTOR-FACE 3 ∥ INSERT-AFTER 3 ∥ LOGGING 3 ∥ MODEL-SPECS 3 ∥ PROMPT-FIXTURE 3 ∥ TURN-CAP-CONTINUE 3 ∥ VERIFY-REDESIGN 3 ∥ WORKSPACE 3 ∥ EDIT-HELPERS 2 ∥ I18N 2 ∥ STRUCTURE-DEBT 2 ∥ TEAM-LEDGER 2 ∥ TEAM 2（合计 42，与派单逐档一致）。

### 本批条目（覆盖）

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | 现态指针写成错包 ∥ 旧布局前缀：改指盘上那一档 | 覆盖 | 「R1」29 处 |
| 2 | 多候选：按本处上下文定一支，写仓根全路径 | 覆盖 | 「R1」同上 |
| 3 | 非仓内名（拟新增 ∥ 运行期配置 ∥ 示例 ∥ 通配）：改无路径叙述 | 覆盖 | 「R2」7 处 |
| 4 | 盘上已无该件的旧指针（实现件 ∥ 批档测试档）：改角色叙述 | 覆盖 | 「R3」6 处 |
| 5 | 判不了的逐条列出（档 + 处 + 原因） | 覆盖 | 「判不了」 |
| 6 | 段落 ∥ 行号坐标（全仓面） | **不在本批** | 派单「不在射程，别顺手改」 |
| 7 | 15 档 `hits` 归零，且全量 `引缺` 不增 | 覆盖 | 「验收」A1 ∥ A2 |

条目 5 与 1–4 并列，不是兜底：**把判不了的猜掉，比留着红更贵**——猜错那处会以「已清」的样子留在规范面上。

### R1–R6 落到本批（共 42 处：R1 29 ∥ R2 7 ∥ R3 6；R4 ∥ R5 ∥ R6 见本节末）

**R1 现态指针 → 仓根全路径（29 处）**。两支：**多候选**按本处上下文定一支；**错包 ∥ 旧布局前缀**改指盘上实档。这一族只改指针形，不动句子语义。

**R2 非仓内名 → 不带路径形态的叙述（7 处）**。四个子类在本批都出现了：拟新增档（今天没有真档）、运行期配置名（读的是哪一类目录）、示例拼写、通配残段。

**R3 盘上已无该件 → 角色叙述，不写档名（6 处）**。判法：**只说现态由谁承载**，不写死件名、不写「已删 ∥ 已退役」这类历史句（那类句子留的是死指针的替身）。

**R4 沿革段旧路径（本批 0 处）**。15 档里没有独立的沿革段；30 出头的对位表行虽带历史注记，token 都落在现态列上，按 R1 处置。

**R5 站点仓件（本批 0 处）**。本批 15 档无站点仓指针。

**R6 按段推进**：一处一段，段内多处同笔清完；段里剩一条红整笔拒，所以「段」就是实施席的推进单位与验收单位。

### 逐处处置（改前形逐字，改后形逐处）

围栏内是**改前 ∥ 改后**成对证据：左列逐字抄自盘上，右列是本批要落的形。

```text
# R1 —— 现态指针（29 处）# 改前 token ⇒ 改后形
SEND-STALL-DISTILL ×4 ∥ VERIFY-REDESIGN ×3   thincoder-vscode/src/agent/run-stages.mjs
                                             ⇒ thincoder-core/agent/run-stages.mjs（并把 VSC 列改述为「现体 = 核档」）
BASH-EXECUTOR-FACE ×3                        prompt-injections.mjs（本句自述三端）
                                             ⇒ 逐处写全三档：thincoder-cli/src/prompt-injections.mjs
                                               ∥ thincoder-vscode/src/prompt-injections.mjs
                                               ∥ thincoder-desktop/src/main/prompt-injections.mjs
LOGGING ×3                                   log.mjs ⇒ thincoder-core/log.mjs
I18N ×2                                      i18n.mjs ⇒ thincoder-vscode/src/i18n.mjs
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

### 定支依据（R1 的每一支都是盘读，不是选一个像的）

**错包 ∥ 旧布局（11 处）**：

- `run-stages` 七处：`thincoder-vscode/src/agent` 目录实读 = `agent-state.mjs` ∥ `run-helpers.mjs` ∥ `setup-reminders.mjs` ∥ `setup-tooltable.mjs` ∥ `setup.mjs` ∥ `tool-table.mjs` ∥ `turn-domains.mjs`，**无 run-stages**；全仓该名只在 `thincoder-core/agent/run-stages.mjs`。⇒ 七处 VSC 列全改核档。
- `peer-instances` ∥ `peer-domains` 两处：仓根无 `src`（旧 v1 布局），核包两档在盘。
- `config` ∥ `proxy` ∥ `suspension`：三档的消费面同句已给（`loadConfig` 提升段 ∥ 传输层缺省 ∥ 池存活判据），核包各一档。`thincoder-server/src/ops/config.mjs` ∥ `thincoder-server/src/gateway/proxy.mjs` ∥ `thincoder-vscode/src/extension/suspension.mjs` 三档不是本句的主体。

**多候选（18 处）逐处上下文**：

- `log.mjs` → 核：该表是双端同路径融合记录，融合后单源在核。
- `i18n.mjs` → VSC：两处先行词都是「VSC」，同句已出现 VSC 字典位全路径。
- `settings.mjs` → VSC：组边界（快照族 ∥ 渠道路由族 ∥ 密钥 MCP 族）与「拆出扩展目录」都指 VSC 侧。
- `team.mjs` → 核：本句主体是「不改登录 ∥ 凭据面」；核档 282 行含 64 处 login ∥ credential ∥ token，端侧两档各 13 ∥ 11 处（薄壳）。
- `provider-admin.mjs` → CLI：全仓该谓词的 export 面只有 CLI 两档，服务端同名档无该符号。
- `run.mjs` → 夹具包：本段在述夹具入口；同句 `compare.mjs` 已因唯一后缀转绿，可见夹具包是它的归属。
- `turn-face.mjs` → 桌面：该行主格是桌面对位表，括注是同一行两条全路径的简写。
- `prompt-injections.mjs` → 三端全列：本句字面写「三端」，盘上恰三档；写任一支都是改错语义。
- `shared.mjs` ∥ `package.json`（三端泛指）→ 删重复：同句括注已给全路径，裸名是冗余。

### 判不了的逐条（条目 5）

**① 两处「状态列」被指针修复照出，但不在本批处置权内。**

`docs/core/design/WORKSPACE.md` 的 172 ∥ 173 两行状态列写「建核补齐」，而核包两档已在盘；`docs/core/design/STRUCTURE-DEBT.md` 的 #4 行状态写「跨端仍分叉」，而 VSC 自持件已不在盘。

指针按 R1 ∥ R3 改（改完各自可解析），**但「合并是否已完」要读两端实现才定得了**，不是补目录段。⇒ 不改状态列，逐条报。

**② 判据面缺口：拟新增档与「断言不存在」今天没有合规写法。**

R2 里四处（两处拟新增 ∥ 三处运行期包清单中的两处）只能靠「不带可解析档名」的叙述避红。**判据面表达不了「将来才有的档」与「这里确实没有这个档」**——与上一批撞上的运行期档名族同源。规则面在 `docs/core/design/DOC-DISCIPLINE.md`，不在本批 15 档内，本席不改。

**③ `prompt-injections` 三处写全三档后句子变长。**

「三端某档」这种泛指在判据面上没有紧凑合规形（花括号展开不是可解析路径）。本批取写全三档，代价是句长；若判据面将来给泛指族开口子，可回收。

### 引文风险

本批只改指针形与叙述形，**一条 `依据 <档>「逐字」` 都不动**。改完仍须跑一次全量：`引缺` 与改前逐位相同才算过。红侧 = 打断任一引文后复跑，`引缺` 变大。

### 边界

可以改：本批 15 档。不许动：别的档 · 产品码 · 需求档 · 台账 · 本档 §1 ∥ §3 ∥ §4 ∥ §6。判据共用档只读不改，发现缺口一律上抛。

### 验收（每条带命令；红侧实测）

**A1 15 档 `hits` 归 0**：命令 = 「尺子与写法」那条。改前读数 **42** 就是它的红侧（同一命令、同一清单），无需另造变异。

**A2 全量 `引缺` 不增**：`docs/**` 跑一次 `mode:"gate"`，`引缺` 与改前逐位相同；改前基线本席实跑取数，读数进 §5。

**A3 逐处对号**：42 处按 R1 ∥ R2 ∥ R3 逐处落，实施席按「档 + 改前 token」对号，**不按行号**（行号随本批改动漂移）。

**A4 判不了清单给出**：条目 5 三条；为空也要写「无」——空与漏记在报面上同形。

**A5 本档自身干净**：`§2` 落盘后本档入判，`hits` 0。本席第一版被拒 10 条即此项的红侧读数（真跑过，不是推演）。

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

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
