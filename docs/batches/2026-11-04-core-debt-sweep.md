# 2026-11-04 · core-debt-sweep
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-04 · 来源 = 用户 2026-11-04 22:31「操，赖了四个，骂一个你就补一个？」——把本轮遗留的另外三笔一并清掉，不再等指鼻子。
> 台账 = #2047（core · 归批）。前情 = docs/batches/2026-11-04-advisor-guard-loop.md（已收口 2026-11-04）· docs/batches/2026-11-04-doc-check-list-bullets.md（已收口 2026-11-04）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-05
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 已定决定

- **已定决定**：本轮遗留的三笔债**并成一批**清掉，不一条一档、不等指鼻子再动。 · 用户原话：「操，赖了四个，骂一个你就补一个？」 · 时间：2026-11-04 22:31

**覆盖账 = #2047 [#2040, #2044, #2035, #2046]**

## 三笔债（父侧已实读的现场，设计席据此开工）

**① `#2040` 设计轮提醒无上限 + 陈旧注释 + 悬空裁定号**

- `thincoder-core/agent/post-turn.mjs` 常量 `DESIGN_TURN_NOTICE_AT = 5` ∥ `DESIGN_TURN_SKELETON_AT = 8` ∥ `DESIGN_FIRST_VERSION_TURNS = 15`。
- `designTurnReminder` 只对 `role === "eng-designer"` 生效；`used >= 5` 起**每轮注入一条**，`turn` = 链内累计轮号（跨段不重置）⇒ **没有上限、没有去重**。跑到 624 轮 = 600+ 条同形提醒。
- `thincoder-core/agent-tools/subagent-async.mjs` 注释称「engineering && AUTO 自动 resume——§6.7.3 D-A3」，而 `checkpoint.mjs` 的实现只有三条出路（父 `send` 兑现 ∥ 中止 ∥ 不可答），无自动 resume 分支；「§6.7.3 D-A3」在 `docs/**` 全域零命中 ⇒ **陈旧注释 + 悬空指针**。

**② `#2044` 集成并行抖动**

- `node test/run.mjs` 连跑 6 次：1 次非 0，红在 `test/integration/browser-start-window.test.mjs`（档级 ✖，其 4-1 ∥ 4-2 ∥ 4-3 三条在该次全绿）。
- 同档 `node --test` 单跑 6 次 = 6/6 全绿 ⇒ 并行负载下的时序抖动。
- 未查：抖的是哪一条资源（浏览器启动窗口 ∥ 端口 ∥ 临时目录 ∥ 计时阈值）。

**③ `#2035` timer 注入行在 Linux 呈豆腐块**

- 面向 `[System reminder: ⏰ timer — …]` 的字符在 Linux 终端渲染异常；Windows 正常。**本机无法直接复现**（无 Linux 交互终端），设计席须以代码面 + 终端能力判定给处置（换字 ∥ 能力探测后降级 ∥ 明确不修并写理由），**不许凭猜改字**。

## 本批边界

- 三笔各自独立收口，**一笔的处置不得连带另一笔**；设计席按笔分节写，§2 里逐笔给落点与验收。
- 批次档一份、设计评审一次、实施一轮——这是并批的目的；不做跨笔的机制化改造。
- 每笔都要「修前读数」：无读数的笔按未验处理，不许以「显然」代替。

## 评审轮 1 裁定（父侧 · 2026-11-05 02:44）

结论 `changes-required`（🔴 4 · 🟡 8 · 🔵 3），无 token。**逐条裁定如下，全部落修正轮**。

| # | 裁定 | 要求 |
|---|---|---|
| 1 🔴 | 改 | `docs/core/design/AGENT-LOOP.md` §6.2 的「规则适用所有回合（… depth>0 子代理）」与 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3 的「AUTO 一档同样不自动续跑」是同一机制的反向描述。收正 §6.2，并把文档面写进机判判据（域含 `docs/`）。 |
| 2 🔴 | 改 | `thincoder-core/agent-tools/batch.mjs` = 538 行 > 500 软线，结论句「均未越」错。结论行点名它，并给拆分计划或主动拆分复核结论（点名可拆缝），再定本笔落哪半。 |
| 3 🔴 | 改 | 验收剔除整套入口：只留改面档多跑读数；并跑形收窄为「同档并发 N 份」，或移入收口行由父侧报。 |
| 4 🔴 | 改 | C 笔集成 delta 的「缺失 0」与「要用例但没有夹具」二择一：补行（CLI 入口，结构面断言）或把「不新造夹具」换成可机检的实理由。 |
| 5 🟡 | 改 | §6.2 保留集补 `_batchWrites` ∥ `_designTurnNotices` 两名（§6.2 是这条语义的唯一陈述面）。 |
| 6 🟡 | 改 | AC-1 补齐本设计自造的两支，或直接以 §6.6 机判清单为验收清单。 |
| 7 🟡 | 改 | AC-5 点名注入缝（模块级 setter ∥ 参数覆盖 + `??` 默认回退），按缝写断言。 |
| 8 🟡 | 改 | `docs/core/design/TESTING.md` §4.6 的「一律」与只改一档不符：收射程，或登记其余集成档的裸收尾为后续条目。 |
| 9 🟡 | 改 | 三笔各补一行最近先例（坐标 ＋ 对齐 ∥ 偏离）。 |
| 10 🟡 | 改 | 补公共源勘察行（三笔判据全在仓内，写实即可）。 |
| 11 🟡 | 改 | 新名三问（`DESIGN_TURN_NOTICE_MAX` ∥ `agent._designTurnNotices` ∥ `_batchWrites`）。 |
| 12 🟡 | 改 | `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3 与 `docs/cli/design/TUI.md` §7.6 现文已是改后形——逐处点名待改句与改后逐字，堵住「把 `⏰` 写回文档」的空间。 |
| 13 🔵 | 改 | 关键读数补时刻。 |
| 14 🔵 | 改 | AC-7 ①② 退为 ③ 的下位读数（同根因不三写）。 |
| 15 🔵 | 记 | `_batchWrites` 扩面已由 KD-3 与上抛写实，无动作。 |

**修正轮边界**：只落上表 14 项，不动三笔的机制方向、不扩符号面、不新增第 4 笔。

## 父侧复核算正（2026-11-05 02:49）

**§2 那行读数差一，须按实测改正**：§2 写「`batch.mjs` = **537** > 500（本席 2026-11-05 实测，`split(/\r?\n/)` 计行）」。

父侧本轮两种计法各跑一次，**都得 538**：

| 计法 | 读数 |
|---|---|
| `split(/\r?\n/).length` | 538 |
| `split("\n").length` | 538 |
| `read` 工具报的档行数 | 538 |

⇒ 设计档点名的计法自己得出 538，却写了 537——**计法与读数不自洽**；537 应是「末尾换行前最后一行号」那种口算，不是该计法结果。**越线结论不变（538 > 500）**，但读数须改成 538。

**实施轮要求**：`§2` 的 537 改为 **538**，计法保留 `split(/\r?\n/)`（该法得 538）。此项并入本批修正，不单列发现。

**已核过、不成立的疑点**（父侧逐处实读，§2 所述属实）：

- `docs/core/design/AGENT-LOOP.md` §6.2 续跑句已改为「射程 = **depth-0 主会话回合**（用户回合 / auto-turn）；**depth>0 子代理不自动续跑**」。
- 同档 §6.2 保留集已补 `_batchWrites` / `_designTurnNotices` 两名并带理由。
- `docs/core/design/TESTING.md` §4.6 已收为「**射程 = 已按本节处置的档**——现 = `test/integration/browser-start-window.test.mjs`」。

## 评审轮 2 裁定（父侧 · 2026-11-05 02:53）

结论 `changes-required`（上轮 15 条：14 修好 / 1 维持；**新增 🔴2 · 🟡2 · 🔵1**）。四条老红确认清掉，本轮只落五条新项。

| # | 裁定 | 要求 |
|---|---|---|
| 16 🔴 | 改 | `AC-4` 的文档面机检串与实文对不上：要求 §6.7.3 出现「depth>0 子代理不自动续跑」，该档现文只有「**AUTO 一档同样不自动续跑**」⇒ 该条验收在盘上即红。**二择一**：① 把 §6.7.3 现状句改成含同一串（该档本就在 A 的写面）；② 把 AC-4 第二半改成各档实有的串（如「不自动续跑」逐档一次）。**推荐 ②**——判据跟着事实走，不为了迎合验收去改一句本来没错的话。 |
| 18 🔴 | 改 | `docs/core/design/TESTING.md` §4.6 的「**落点 = 共用助手 `test/teardown.mjs` 的 `removeTempDirBestEffort(dir, opts)`**」条目出现两次，两遍只差转义：一处 `line + "\\n"`（**反斜杠+n 字面量，不是换行**）、一处 `line + "\n"`。§2 的 B 设计 1 与 AC-5 又是第三种写法（裸 `process.stderr.write`）。⇒ 留**一条**落点条目，取 `"\n"` 形；§2 两处改成同一串。 |
| 17 🟡 | 改 | `batch.mjs` 行数：§2 两处（拆分节结论行 ∥ 「本笔在 537 行的现档上加那两行」）按 §1「父侧复核算正」改为 **538**。越线结论不变。 |
| 19 🟡 | 改 | 两条「后续条目」并入 §2「上抛项」：`batch.mjs` 拆分（缝已点名）∥ 其余 32 档集成用例裸收尾（`docs/core/design/TESTING.md` §4.6 已登记）。现在那份清单以「待裁项：无。」收尾，父侧无从建台账行。 |
| 20 🔵 | 改 | `AC-1` 的「机判清单五条」与 §6.6 实数不符（实为四条：纯函数 / 长链 / `batch` 写面 / 续跑 + 接线；纯函数那条列六款）。计数与枚举对齐。 |

**修正轮边界**：只落上表五条；不动三笔机制方向、不改判据本体、不扩面。

## 父侧追加裁定（2026-11-05 03:42）——C 笔的域收口

**上一轮我把要求说在对话里，落成了「受影响文件表新增一行标未落」——那不是派活，是记录欠账。**本轮按记录派。

**裁定**：C 笔（timer 注入行去字形）的射程**本来就不是两档核心文件**，而是「谁还在写旧字形」。核查发现还剩两处端产品注释，机制零改、只改注释文字：

- `thincoder-desktop/src/main/timer-watch.mjs`（第 20 行注释携 `[System reminder: ⏰ timer — …]`）
- `thincoder-vscode/webview/chat-messages.js`（第 286 行同形）

**要求（写进 §2，不留在 §1）**：

1. 这两档进 §2 的**受影响文件表**，且状态从「未落」改为**本批要做**——实施席只读 §2，标「未落」它不会去改。
2. `AC-7` 的域从「两处核心档零命中」扩成「**全仓 `⏰` 零命中**，例外 = 端状态行符号形（`⏰N` ∥ `⏰${n}`，宿主能力面，保留）」。
3. 验收写可执行形：`thincoder-core/**` ∥ `thincoder-desktop/**` ∥ `thincoder-vscode/**` 逐档扫 `⏰`，只允许命中的是状态行符号形那几处。
4. 不改机制、不动端状态行、不动任何行为——**只有注释文字**。

**为什么不放它到下一批**：这条与已改好的四端设计档（`docs/desktop/design/IPC.md` ∥ `docs/vsc/design/WEBVIEW-PROTOCOL.md` ∥ `docs/server/design/agent/ADMIN-AGENT.md` ∥ `docs/desktop/design/E2E-TESTING.md`）是同一处漂移——设计档已写新形、产品码注释还写旧形，**这就是「同一机制两份互斥的逐字」**，留着它，下次读代码的人又照旧形实施。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 4：C 笔域收口（两处端注释进本批 · AC-7 扩为三方树 · 字形扫描读数 · 汇聚点坐标与盘面一致））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 覆盖（台账 #2047 · 三笔并批）

| 笔 | 条目 | 设计节 | 收口方式 |
|---|---|---|---|
| ① | #2040 设计轮提醒无上限 + 陈旧注释 + 悬空裁定号 | A | 逐笔验收，互不连带（父侧 §1 本批边界） |
| ② | #2044 集成并行抖动 | B | 同上 |
| ③ | #2035 timer 注入行 Linux 豆腐块 | C | 同上 |

设计档落点：`docs/core/design/AGENT-LOOP.md`（A 的机制面）· `docs/core/design/AGENT-LOOP-SUBAGENT.md`（A 的注释面与 §6.7.3 补句）· `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 与 `docs/cli/design/TUI.md`（C 的文本面）· `docs/core/design/TESTING.md`（B 的收尾纪律一句）。

---

### A · 设计轮提醒：有上限、有去重（#2040）

**修前读数（本席实读）**

- 判据只有下界（修前，2026-11-05 设计轮实读）：依据 `thincoder-core/agent/post-turn.mjs`「if (!Number.isFinite(used) || used < DESIGN_TURN_NOTICE_AT) return null」——`turn ≥ 5` 之后每轮都返回非 null；现形在该行之后加帽判据 `DESIGN_TURN_NOTICE_MAX`（见 §5）。
- 调用点无条件推入：修前（2026-11-05 设计轮实读）`injectPostTurn` 内为单行 `if (designReminder) agent.history.push(...)`——无上界、无去重；现形 = 判据 + 注入后紧邻自增 `_designTurnNotices`（`thincoder-core/agent/post-turn.mjs` 的 `injectPostTurn`，逐字见 §5）。
- 轮号是链内累计：`thincoder-core/agent/turn-loop.mjs:99` 依据 `thincoder-core/agent/turn-loop.mjs`「agent._currentTurn = frame.turn」——长链逐轮往上走，注入条数随轮数线性增长。

**设计**

1. 注入改「里程碑 + 每链帽」：两档阈值原样保留（`DESIGN_TURN_NOTICE_AT` = 5 首条、`DESIGN_TURN_SKELETON_AT` = 8 第二条）；新增常量 `DESIGN_TURN_NOTICE_MAX = 2`——每条跨档后只发一次，到帽即静默。
2. 判据全在纯函数：`designTurnReminder({ role, turn, wrote, notices })`——`notices >= MAX` ⇒ `null`；`notices === 0 ∧ turn >= 5` ⇒ 常行；`notices === 1 ∧ turn >= 8` ⇒ 降级行（`!wrote`）∥ 常行；其余 `null`。两条注入串逐字不动（本笔只改「何时发」，不改「发什么」）。
3. 载体 = `agent._designTurnNotices`（计数，初值 0）。复位点 = `thincoder-core/agent/run-start.mjs` 的 `if (!resume)` 块，与 `_emptyRetries` 同点；resume 保留（续跑不重置，与 `docs/core/design/AGENT-LOOP.md` §6.2 保留集同形）。初值落 `thincoder-core/agent.mjs` 的状态工厂。
4. 计数在注入点自增（紧邻 `push`）——判据与自增同一处，不写第二份。

**连带回正：`wrote` 判据（设计档已有、修前产品码未落）**

- 设计档依据 `docs/core/design/AGENT-LOOP.md`「wrote = (agent._touchedFiles ?? []).length > 0 || (agent._batchWrites ?? 0) > 0」。
- 修前（2026-11-05 设计轮实读）`thincoder-core/agent/post-turn.mjs` 的 `wrote` = `(agent._touchedFiles ?? []).length > 0,`——`_batchWrites` 当时在产品码里零命中（本席全仓实扫）；本笔已补 `|| (agent._batchWrites ?? 0) > 0`（现形见 §5）。
- 后果正落在 A 上：设计席只经 `batch append` 落 §2 时，注入句仍报「nothing has been written」——句与盘面相反。本批按设计补齐计数器：初值 · 每 run 复位 · `onWritten` 各汇聚点自增。
- 汇聚点实读**六处**（读数 2026-11-05 实施后，本席逐处实读在盘）：`thincoder-core/agent-tools/batch.mjs:271` ∥ `:423` ∥ `batch-lifecycle.mjs:252` ∥ `:266` ∥ `:298` ∥ `batch-ledger-bind.mjs:144`。

**注释面两件（#2040 另一半）**

- **陈旧**：修前（2026-11-05 设计轮实读）`thincoder-core/agent-tools/subagent-async.mjs` 的注释写「engineering && AUTO 自动 resume——§6.7.3 D-A3」——与实现相反、裁定号悬空；本笔已改指 §6.7.3 的现状句（现形见 §5）。
- 反证 ①（同族代码）：`thincoder-core/agent-tools/subagent-run.mjs:170` 依据 `thincoder-core/agent-tools/subagent-run.mjs`「(no panel, no re-dispatch) until the parent answers send / cancel — AUTO included.」
- 反证 ②（需求面）：`docs/core/requirements/TURN-CAP-CONTINUE.md` 依据该档「AUTO 一律不再自动批准续期」⇒ 前者是陈旧注释。
- **悬空**：`D-A1` / `D-A3` / `D-A4` / `D-A6` 四个裁定号在 `docs/**` 只命中一份讲上下文压缩池化比的无关批档；`§6.7.3` 本身存在，但不携裁定号 ⇒ 代码注释引的是一个不存在的裁定。
- **处置（机械可判）**：`thincoder-core/**` 注释里的 `D-A*` 裁定号一律删除，改指**确实载该规则的节**。异步撞帽行为 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3（本批在该节补一句现状：async 子代理撞帽 ⇒ 注册父侧检查点、挂起等父 `send` / `cancel`，AUTO 亦不自动续跑）+ `docs/core/requirements/TURN-CAP-CONTINUE.md` F8。

---

### B · 集成并行抖动（#2044）

**修前读数（父侧实跑，本席引用原件）**

```text
Error: EPERM, Permission denied: \\?\C:\Users\liwei\AppData\Local\Temp\tc-int-browser-home-6DKQch
code: 'EPERM',
```

- 落点：`test/integration/browser-start-window.test.mjs:43` 依据该档「rmSync(HOME, { recursive: true, force: true })」——模块级 `after` 里裸调，无 try、无重试。
- `HOME` / `USERPROFILE` 在同档 `:32-33` 指向 `mkdtempSync` 的临时目录 ⇒ 浏览器 profile 与 `DevToolsActivePort` 全落其中；并行负载下浏览器进程仍占着它。
- 档级 ✖ 的成因：`node --test` 的文件级判红只能来自测试体之外的异常。本档测试体之外只有这个模块级 `after` 与环境装配 ⇒ 收尾钩子抛错把整档判红，而 4-1 / 4-2 / 4-3 当次全绿。

**候选资源排除（本席结构面实读）**：端口 = 唯一监听 `server.listen(0, "127.0.0.1", …)`（同档 `:103`），内核分配、无固定端口可撞；计时阈值 ∥ 启动窗口 = 失手会红**用例**而非档，与读数不符；临时目录 = 唯一能把全绿判红的结构路径。

**设计**

1. **清理失败不判红整档，但必须可见**：落点 = 共用助手 `test/teardown.mjs` 的 `removeTempDirBestEffort(dir, opts)`——有界重试（`maxRetries: 10` · `retryDelay: 100`，上限 ≈1s）+ `try/catch` + 失败写一行 stderr（`[teardown] temp home not removed: <abs> (<code>)`）不抛。注入缝 = `opts.rm ?? rmSync` ∥ `opts.log ?? ((line) => process.stderr.write(line + "\n"))`（纪律单源 = `docs/core/design/TESTING.md` §4.6；三处同一串）；集成档只调助手。
2. **为什么这是合法兜底**（业务门纪律要求在案）：业务结果 = 三条断言过没过，清理成败不改它；残留目录不是业务结果，且不静默——stderr 一行点名路径与错误码，下一次复发自带读数。先例 = `thincoder-core/agent/timers.mjs` 的尽力面清理（「try { clear(h) } catch { /* 已触发 / 不可清——尽力面 */ }」）。
3. **不做的**：不改三条用例的断言与超时；不改成「清理失败就 skip」（skip 不算验过）；不加第二次 kill。
4. **修后读数（实施轮必跑，命令逐字）**：`node --test test/integration/browser-start-window.test.mjs` 串行连跑 6 次 ⇒ 档级退出码 0 ×6（已达成）。同档并发 4 份只登记读数、不作判据：3 轮里 2 轮的 1 份红在 4-3 用例体内（`EBUSY … DevToolsActivePort`，改面无关），该抖动另立台账 `#2053`（2026-11-05 03:26 裁定）。整套入口 `node test/run.mjs` 由父侧收口行报（不入本轮验收——判据见 AC-6）。

---

### C · timer 注入行 Linux 豆腐块（#2035）

**修前读数（本席实读）**

- 注入行：`thincoder-core/agent/timers.mjs:102` 修前形 =「const line = `[System reminder: ⏰ timer — ${t.message}]`」——`⏰` = U+23F0（本笔去字形，现形 = `[System reminder: timer — ${t.message}]`，见 §5）。
- 缺省消息自带同枚字形：`thincoder-core/agent-tools/timer.mjs:193` 修前形 =「⏰ Time's up (」⇒ 不传 message 的 timer 到期行**一行两枚豆腐块**（`… ⏰ timer — ⏰ Time's up (60s)…`）；本笔四处缺省消息的字形均已删。
- **该行确实进用户终端**：`thincoder-cli/src/tui/tool-events.mjs:448-453` 依据该档「if (last?.role === "user" && typeof last.content === "string" && last.content.startsWith("[System reminder:")) {」→ `pushLine(shown, C.warn)` ⇒ 工具轮末把 history 末条系统提醒镜像进会话流；到期件经 `deliverExpiredTimers` 的 `onLine` 也落同一流。结论 = **有用户可见面，不是纯模型面**，「不修」不成立。

- **两处端产品注释（本批面，读数 2026-11-05 03:41 本席实扫）**：`thincoder-desktop/src/main/timer-watch.mjs` ∥ `thincoder-vscode/webview/chat-messages.js` 各一行注释引 `[System reminder: ⏰ timer — …]`——机制已改、注释未跟 ⇒ 同一机制两份互斥逐字（父侧 2026-11-05 03:42 裁定）。
- **三方树 `⏰` 分布（同上时刻，源档实扫）**：修前 10 处 = 8 处状态行符号形（保留）+ 2 处旧形注释（本批改），逐处见下「字形扫描读数」。

**设计：换字（去符号，留词 `timer`）**

- 两处落点：注入前缀（`thincoder-core/agent/timers.mjs` 的 `injectTimerReminders` 串）· 缺省消息（`thincoder-core/agent-tools/timer.mjs` 四处缺省消息串——修前形携 `⏰`，本笔已删）。
- 改后形态：`[System reminder: timer — <message>]`；缺省消息 `Time's up (<槽>)…`。
- 依据（既有裁决，非本席口味）：`docs/cli/design/TUI.md` 依据该档「在 Linux 终端无字形（渲成豆腐块）」⇒ CLI 面已定「换词不换符号、不做字体探测分支」。同一枚字形、同一个成因 ⇒ 处置只能是同一条。
- **Linux 可读的判据（机检，可机判的部分）**：① 改后三方树源档 `⏰` 只余状态行符号形（8 处，逐处见下「字形扫描读数」）；② 注入行逐字 = `[System reminder: timer — <msg>]`（直调 `injectTimerReminders` 断言）；③ 注入行前缀段不含任何非 ASCII 装饰字符（`/^[\x20-\x7E]+$/` 覆盖到 `timer —` 之前）。字形本身在本机（Windows 有字形）无法机检，故判据取「不携缺字形字符」这一同根因形，不冒充「已在 Linux 上看过」。
- **否决**：能力探测后降级——终端字体覆盖没有可靠探针（`TERM` / `LANG` 都不报字形覆盖），探不出就是猜；保留不改——用户终端一行两枚豆腐块，属可修缺陷。

**端产品注释落点（本批做 · 只改注释文字）**

- `thincoder-desktop/src/main/timer-watch.mjs`：该行注释里 `[System reminder: ⏰ timer — …]` ⇒ `[System reminder: timer — …]`（删 `⏰` 与紧随的一空格，该行其余文字逐字不动）。
- `thincoder-vscode/webview/chat-messages.js`：同串、同改法，该行其余文字逐字不动。
- 面：机制 ∥ 行为 ∥ 端状态行符号形（`⏰N` ∥ `⏰${n}`）零改。

**字形扫描读数（2026-11-05 03:41 本席实扫；域 = 源档 `*.mjs` ∥ `*.js` ∥ `*.json` ∥ `*.md`，构建产物 `thincoder-desktop/dist-*/**` 除外）**

| 树 | 命中（修前 10 处） | 串 | 判 |
|---|---|---|---|
| `thincoder-core` | 无 | — | 零命中（本笔已落） |
| `thincoder-desktop` | `renderer/i18n.mjs` 两处 · `src/main/timer-watch.mjs` 一处 | `"status.timer": "⏰${n}"` ∥ `[System reminder: ⏰ timer — …]` | 前两处 = 状态行符号形（保留）· 后一处 = 旧形注释（本批改） |
| `thincoder-vscode` | `AGENTS.md` · `src/extension/panel-callbacks.mjs` · `webview/state.js` · `webview/status-bar.js`（状态行 `⏰N`）· `locales/en.json` · `locales/zh.json`（`"status.timer": "⏰${n}"`）· `webview/chat-messages.js`（旧形注释） | 同左 | 前六处 = 符号形（保留）· 末一处 = 旧形注释（本批改） |

- 改后 = 8 处，全为状态行符号形（桌面 2 · VSC 6）。
- 同一扫描过 `thincoder-server`：`deploy/sandbox/member-shell/protocol.mjs` ∥ `public/views-me-chat-composer.mjs` 各一处，均符号形——不另立判据。
- `thincoder-desktop/dist-r3` ∥ `dist-r4` 的 `resources/app.asar` 仍携旧串：构建产物，随下次构建从源重生成，本批不重建 ⇒ 不入扫描域。

- **端差**：状态行 `⏰N` 不动（VSC ∥ 桌面 ∥ 服务端字形齐备，已裁为宿主能力例外）；本笔改核心注入行 + 两处端产品注释的同串引文（只改注释文字），状态行符号形不动 ⇒ 端差零新增。

---

### 受影响文件与层级结论

| 文件 | 层 | 本笔 | 本轮 |
|---|---|---|---|
| `docs/core/design/AGENT-LOOP.md` | 设计面 | A | 写（§6.2 续跑射程收正 + 保留集加两名 + §6.6 注入判据 / 常量 / 机判） |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计面 | A | 写（§6.7.3 补现状句 + 注释裁定号纪律） |
| `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` | 设计面 | C | 写（§6.30.3 补「字符面」约束段 · 清单外） |
| `docs/cli/design/TUI.md` | 设计面 | C | 写（§7.6 落流行改「定形（逐字）」+ 前缀段全 ASCII · 清单外） |
| `docs/core/design/TESTING.md` | 设计面 | B | 写（§4.6 射程收到已处置档 + 共用助手落点 · 清单外） |
| `test/teardown.mjs` | 产品面（测试夹具） | B | 新建：`removeTempDirBestEffort(dir, opts)`（两处注入缝） |
| `test/integration/timer-reminder-glyph.test.mjs` | 产品面（集成） | C | 新建：RTM 行 `33-1`（标题同号） |
| `test/RTM.md` | 产品面（集成索引） | C | 写：故事 33 + 行 `33-1` |
| `thincoder-core/agent/post-turn.mjs` | 产品码 | A | 实施：判据 + 自增 + `wrote` |
| `thincoder-core/agent.mjs` · `agent/run-start.mjs` | 产品码 | A | 实施：`_designTurnNotices` / `_batchWrites` 初值 + 复位 |
| `thincoder-core/agent-tools/batch.mjs` · `batch-lifecycle.mjs` · `batch-ledger-bind.mjs` | 产品码 | A | 实施：六处 `onWritten` 汇聚点计 `_batchWrites` |
| `thincoder-core/agent-tools/subagent-async.mjs` | 产品码（注释） | A | 实施：陈旧句收正 + 裁定号清除 |
| `thincoder-core/agent/run-stages.mjs` · `agent/spawn-child.mjs` · `agent-tools/{subagent-run,subagent-spawn,subagent-scheduler,escalate-async}.mjs` | 产品码（注释） | A | 实施：同一条去裁定号规则 |
| `thincoder-core/agent/timers.mjs` · `agent-tools/timer.mjs` | 产品码 | C | 实施：两处字形删除 |
| `test/integration/browser-start-window.test.mjs` | 产品面（测试） | B | 实施：收尾尽力面 + stderr 读数 |
| `thincoder-desktop/src/main/timer-watch.mjs` · `thincoder-vscode/webview/chat-messages.js` | 产品码（注释） | C | 本批要做：两处注释的同串引文去字形（改前 ∥ 改后逐字见 C 节「端产品注释落点」）；机制 ∥ 行为 ∥ 端状态行零改 |

**层级结论**：设计面九档，零跨层；实施轮跨产品码（核心 ∥ 两端注释）与集成测试档。

- **行数软线（读数 2026-11-05 实施后，`split(/\r?\n/)` 计行）**：`thincoder-core/agent-tools/batch.mjs` = **541** > 500 软线——本笔在该档两处 `onWritten` 汇聚点各加一行（含一行注释），越线不能含混过去。
- 其余受影响档均 < 500（最大 = `thincoder-core/agent-tools/subagent-async.mjs` 487，同法同日读数）。
- 清单外三档（ASYNC-POOL ∥ TUI ∥ TESTING）已回指，理由 = 三者是该笔机制的既有权威住所（机械收在别处即第二份）。

**`batch.mjs` 拆分计划（点名可拆缝）**

- **缝** = 执行面 ∥ 工具面：`appendBatchRecord`（起 `thincoder-core/agent-tools/batch.mjs:173`）与 `editBatchRecord`（起 `:339`），连同共用的 `segmentNumber`（`:99`）∥ `allowedSegment`（`:107`）∥ `sanitizeText`（`:126`）∥ `insertIntoSection`（`:141`）∥ `sectionBodySpan`（`:304`）∥ `statusLineSpans`（`:316`）与四条 §3 拒串，外移到 `thincoder-core/agent-tools/batch-record-write.mjs`。
- **留** = `batchTool`（schema + action 分发，起 `:434` 至档尾 541）+ 注入缝（`configureBatchSegment` ∥ `resetBatchSegment`）+ `batchDocForReview`。
- **本笔两行落执行面那一半**（`thincoder-core/agent-tools/batch.mjs:271` ∈ `appendBatchRecord`、`:423` ∈ `editBatchRecord`）——拆分后住 `batch-record-write.mjs`。
- **本批不拆**：拆档要动 `batch` 工具族的 import 面与端侧 shim，属另一笔；登记为后续条目（`[上抛·知会]`，父侧建台帐行）。本笔在 541 行的现档上加那两行。

---

### 验收对照（逐笔机判）

| # | 笔 | 判据 | 机检 ⇒ 期望 |
|---|---|---|---|
| AC-1 | A | 注入判据 = `docs/core/design/AGENT-LOOP.md` §6.6 的「机判」清单**四条**（① 纯函数**六款** · ② 长链恰 2 条 · ③ `batch` 写面 · ④ 续跑 + 接线）——逐款原文只住 §6.6，本节不复述；计数与 §6.6 枚举对齐 | 批内单测档，照 §6.6 清单逐条 |
| AC-2 | A | 长链不刷屏：连驱 30 个工具轮（`_currentTurn` 1→30，未落盘）⇒ history 内该形态**恰 2 条**（修前 26 条——先红） | 同上 |
| AC-3 | A | `_touchedFiles = []` ∧ `_batchWrites = 1` ∧ `turn 8` ⇒ 含 `something has been written`、不含 `nothing has been written`（修前反向——先红）；被拒的 `batch append` 不增计数 | 同上 |
| AC-4 | A | 裁定号清零：`thincoder-core/**` 内 `D-A[0-9]` 零命中（含注释）。**文档面同判**：`docs/**`（`docs/batches/**` 除外）内「规则适用所有回合」零命中，且「不自动续跑」在 `docs/core/design/AGENT-LOOP.md` §6.2（现文「**depth>0 子代理不自动续跑**」）与 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3（现文「**AUTO 一档同样不自动续跑**」）**两档逐档全文各命中 1 次** | 扫描 ⇒ 0 命中 ∧ 两处各 1（UTF-8 感知：`grep` 工具 ∥ node 行扫——不用 `findstr`） |
| AC-5 | B | 清理失败不判红、且可见——按共用助手的注入缝写：`removeTempDirBestEffort(dir, { rm, log })`，`opts.rm ?? rmSync` ∥ `opts.log ?? ((line) => process.stderr.write(line + "\n"))`；传假 `rm`（抛 `{ code: "EPERM" }`）+ 捕获 `log` ⇒ 返回 `false` ∧ 末行逐字 `[teardown] temp home not removed: <abs> (EPERM)` ∧ 不抛 | 批内单测档（直调 `test/teardown.mjs`，两缝都注入） |
| AC-6 | B | 只判改动面档、多跑取读数：`node --test test/integration/browser-start-window.test.mjs` 串行 6 跑档级退出码 0（已达成 6/6）。**并发读数不作判据**——同档并发 4 份实测 3 轮里 2 轮各有 1 份红在 4-3 用例体内（`EBUSY … DevToolsActivePort`，与模块级 `after` 的改面无关），按 2026-11-05 03:26 裁定只登记读数，4-3 抖动另立台账 `#2053` | 逐字命令串行 6 跑（`node test/run.mjs` 归收口行由父侧报，不入本验收） |
| AC-7 | C | 字符面一条判据：注入行前缀段（至 `timer —` 之前）全落在 `/^[\x20-\x7E]+$/` ∧ 缺省消息不含 U+23F0。**字形域 = 三方树**：`thincoder-core/**` ∥ `thincoder-desktop/**` ∥ `thincoder-vscode/**` 的源档逐档扫 `⏰` ⇒ 改后只余状态行符号形（8 处，逐处见 C 节「字形扫描读数」）。例外 = 状态行符号形 `⏰N` ∥ `⏰${n}`（宿主能力面，保留）。下位读数（同一根因，不另判）= 注入行逐字 `[System reminder: timer — <msg>]` | 批内单测档直调 `injectTimerReminders` ∥ `timer` 工具；字样扫描 = `grep` 工具（UTF-8 感知，不用 `findstr`） |
| AC-8 | 全 | 触碰档 `doc_check(mode:"gate")` 首行 PASS | 逐字命令 |

批内单测档 = `docs/batches/2026-11-04-core-debt-sweep.test.mjs`（名随批档，`node --test` 直达，收口即删）。

**集成面 delta（起点 = `test/RTM.md`）**

- A：模型面提醒，无用户可见入口 ⇒ 不加行；破坏 0 / 冗余 0 / 缺失 0。
- B：4-1 / 4-2 / 4-3 三行断言的业务结果零变（断言未改），本笔只改收尾 ⇒ 三行不改、不增、不删。
- C：破坏 0 / 冗余 0 / **缺失 1**——生产真出过的问题（Linux 终端读成豆腐块）有用户可见面 ⇒ 立行。选项 ②「改前改后在非终端夹具里逐字同形」不成立：改前串里有一枚字形、改后没有，夹具读得出差别。

| 行 | 所评的组件间交互 | 断言到的业务结果 | 用户进入点 | 回指 |
|---|---|---|---|---|
| 33-1 | 核注入行（`thincoder-core/agent/timers.mjs` 的 `injectTimerReminders`）⟷ CLI 会话流镜像（`thincoder-cli/src/tui/tool-events.mjs` 的回合尾镜像分支） | 用户在会话流里读到 timer 到期行：该行前缀段至 `timer —` 之前全落在 `/^[\x20-\x7E]+$/`，缺字形字符零命中（修前红——`⏰` 在串里） | CLI 会话里挂一个 timer 等它到期（模块直驱：假 `state` + 真核注入串 + 真镜像分支） | 本批 C 节 · `docs/cli/design/TUI.md` §7.6 |

号从哪来：`test/RTM.md` CLI 端既有故事号至 32（末行 `32-4`）⇒ 新故事 = 33，行 = `33-1`；用例标题 `test('33-1 …')` 与本表同号，用例档 = `test/integration/timer-reminder-glyph.test.mjs`。

---

### 关键决策

| # | 决策 | 否决的替代 | 理由 |
|---|---|---|---|
| KD-1 | 里程碑 + 每链帽 2 | 逐轮注入（现状）∥ 按「turn === 5 ∥ 8」等值触发 | 逐轮是病根；等值触发在该轮无工具调用时漏档、并把语义绑死在轮号上；计数是唯一能把「无上界」变成「有上界」的判据 |
| KD-2 | 计数载体 = agent 字段 | 从 `_currentTurn` 推导条数 | 推导在续跑 / 自动回合混合时会算错，且仍要一个上界才能停 |
| KD-3 | `_batchWrites` 本批补齐 | 删掉设计档那段、只认 `_touchedFiles` | 删它就是改需求语义（设计已裁「§2 落盘算落盘」）；不补则 A 的注入句与盘面相反 |
| KD-4 | 删裁定号，改指节 | 在节里补一个 `D-A3` 编号 | 裁定号是批档时代的身份证，状态档不携；节本来就是权威 |
| KD-5 | 收尾尽力面 + stderr 读数 | 静默吞掉 ∥ 保持裸调 | 静默吞掉留垃圾且不合「失败要可见」；裸调把全绿的档判红——两者都错 |
| KD-6 | timer 行删字形 | 能力探测后降级 ∥ 不修 | 无可靠字形探针（探不出就是猜）；不修则用户终端一行两枚豆腐块 |

### 上抛项

- `[上抛·知会]` `_batchWrites` 本批补齐：设计档已有、盘上未落，缺它 A 的判据与盘面相反。
- `[上抛·知会]` 同族悬空号 `D-A1` / `D-A4` / `D-A6` 一并清：同一条机械判据（AC-4），只清 `D-A3` 会把这四个同形缺陷留在同几个文件里。
- `[上抛·知会]` **后续条目 ①** `thincoder-core/agent-tools/batch.mjs` 拆分：缝已点名（执行面 `appendBatchRecord` ∥ `editBatchRecord` 外移 `batch-record-write.mjs`，工具面 `batchTool` 留）——本批不拆，理由 = 拆档要动 `batch` 工具族 import 面与端侧 shim。建议台账 `trigger = 归批`。
- `[上抛·知会]` **后续条目 ②** 其余集成档的裸收尾：`docs/core/design/TESTING.md` §4.6 已登记（本席 2026-11-05 实测：`test/integration/**` 35 档中 32 档含 `rmSync`，除本笔的 `browser-start-window.test.mjs` 与已带 try/catch 的 `ssh-file-transfer.test.mjs` 外 30 档仍裸调）——逐档处置不在本节射程内。建议台账 `trigger = 条件`。
- 待裁项：无。

### 修正轮补项（评审轮 1 裁定 #9 ∥ #10 ∥ #11 ∥ #13）

**最近先例（逐笔一行——坐标 + 对齐 ∥ 偏离）**

- A：先例 = `thincoder-core/agent/run-start.mjs` 的 `if (!resume)` 复位块（`_emptyRetries` 族）。对齐 = 同一复位点、同一「链起点复位 / 续跑不清零」形。偏离 = 载体是**计数帽**不是额度——到帽即静默，额度不参与判据。
- B：先例 = `thincoder-core/agent/timers.mjs` 的注入面尽力清理（`try { clear(h) } catch { /* 已触发 / 不可清——尽力面 */ }`）。对齐 = 同一「失败不抛」形。偏离 = 本笔多一条可见性（stderr 一行点名路径与错误码）——「失败要可见」的要求，先例那条是沉默面。
- C：先例 = `docs/cli/design/TUI.md` §7.6 的既有裁决（状态行 `timer N` 用文字形，因 `⏰` 在 Linux 终端无字形）。对齐 = 同一枚字形、同一个成因 ⇒ 同一处置（去符号、留词）。偏离 = 无。

**公共源勘察（本批）**：`index.publicRepos` = 空（manifest 实读，2026-11-05），无外仓可查；三笔判据全在仓内档与代码（AGENT-LOOP 三档 ∥ TUI ∥ TESTING ∥ `thincoder-core/**` 对应实现）。结论 = 外部公开源无相关。

**既有件三问（新名）**

- `DESIGN_TURN_NOTICE_MAX`：`none found: thincoder-core/**`（检索式 = `DESIGN_TURN_NOTICE_MAX`，2026-11-05 本席实扫零命中）——新常量，住 `thincoder-core/agent/post-turn.mjs`，消费方 = `designTurnReminder` 一处。
- `agent._designTurnNotices`：`none found: thincoder-core/**`（检索式 = `_designTurnNotices`，同日零命中）——新字段，初值落 `thincoder-core/agent.mjs` 状态工厂，消费方 = `designTurnReminder` 的 `notices` 实参 + 注入点自增。
- `_batchWrites`：`none found: thincoder-core/**`（检索式 = `_batchWrites`，同日零命中——设计档原句「设计已有、盘上未落」即此读数）——新字段，初值 `thincoder-core/agent.mjs`、复位 `thincoder-core/agent/run-start.mjs` 的 `if (!resume)` 块，消费方 = `thincoder-core/agent/post-turn.mjs` 的 `wrote` 判据。

**读数时刻**：本节标「本席实读 / 实测」的读数均为 2026-11-05 本席实取；行数为 `split(/\r?\n/)` 计法。

### 修正轮补项 ②（#1 文档面 ∥ #12 两档改句）

**#1 文档面（已落 `docs/core/design/AGENT-LOOP.md` §6.2）**：现文 = 「射程 = **depth-0 主会话回合**（用户回合 / auto-turn）；**depth>0 子代理不自动续跑**」，并接三条出路（父 `send` 兑现 ∥ 中止 ∥ 不可答）与 AUTO 同判。机判见 AC-4 的文档面半。

**#12 两档改句（已落，逐处点名）**

- `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3：原「投递形态（D-TW2）」段字面不动；其后补一段「字符面（D-TW2 的约束面）」——前缀段不携任何非 ASCII 字符（`/^[\x20-\x7E]+$/` 覆盖到 `timer —` 之前），缺字形的图标字符不入本行。
- `docs/cli/design/TUI.md` §7.6：句头「**不动位**：触发落流行 `[System reminder: timer — <message>]` 逐字保持」改成「**定形（逐字）**：触发落流行 = `[System reminder: timer — <message>]`；前缀段不携任何非 ASCII 字符……」。
- 两处都不写「本轮前为某字形」一类历史句：状态档只述现状，而「原先是什么」恰好是把字形写回文档的入口——正面写死「不入本行」即可堵住。

### 修正轮 3（§5 上抛「设计档漂移」第 2 条处置）

**四端设计档的引用形收正——机制零改，只改「引核注入行」这一形**：

| 档 | 处 | 改后逐字 |
|---|---|---|
| `docs/desktop/design/IPC.md` | `ev:timer` 行（`text` = 交付原文） | `[System reminder: timer — …]` |
| `docs/vsc/design/WEBVIEW-PROTOCOL.md` | §3.2 行 19（`text` = 交付原文） | 同上 |
| `docs/server/design/agent/ADMIN-AGENT.md` | B70 ∥ N74（送达行落库行文）∥ §14.1 timer 到期行（`{消息}` 占位） | 同上 |
| `docs/desktop/design/E2E-TESTING.md` | T-DSK44 ① | 同上 |

- **端状态行 `⏰N` 不动**：宿主能力例外（单源 = `docs/cli/design/TUI.md` §7.6「端差（登记 · 宿主能力例外）」）——本笔只改上述五处引文，`⏰N` 与 `status.timer` 的 `⏰${n}` 全留。
- **两条假红已消**：B70 ∥ N74 ∥ T-DSK44 是验收判据行，现与核注入行逐字一致，照文实施不再对不上。
- **两处端产品注释收进本批**（`thincoder-desktop/src/main/timer-watch.mjs` ∥ `thincoder-vscode/webview/chat-messages.js`，各一行）：按父侧 2026-11-05 03:42 裁定，二档进受影响文件表、状态 = 本批要做（改前 ∥ 改后逐字见 C 节「端产品注释落点」），机制 ∥ 行为零改。
- **读数**（2026-11-05 本席实测，node 行扫四档）：`System reminder:` + `timer` 五处全为改后形；`⏰` 只剩状态行符号形（`⏰N` ∥ `⏰${n}`）。

**同批收正：`docs/core/design/AGENT-LOOP.md` §6.6 的六处汇聚点坐标**（实施后读数 = `batch.mjs:271` ∥ `:423` ∥ `batch-lifecycle.mjs:252` ∥ `:266` ∥ `:298` ∥ `batch-ledger-bind.mjs:144`）——§5 所报 🔵 坐标漂移，属设计席写面，已收正；六处计数不变。

**设计面档数**：九档（机制面五 = `docs/core/design/` 下 AGENT-LOOP ∥ AGENT-LOOP-SUBAGENT ∥ AGENT-LOOP-ASYNC-POOL ∥ TESTING，加 `docs/cli/design/TUI.md`；端面四 = IPC ∥ WEBVIEW-PROTOCOL ∥ ADMIN-AGENT ∥ E2E-TESTING，路径见上表），均零跨层。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审对象 = 本批 §2（A ∥ B ∥ C 三节）＋评审域五份设计档。本轮实读 = 五档全文 ＋ 受影响文件表现量（逐档 `read` 取总行数，见下表）。

| 受影响档（本笔） | 实测总行数 |
|---|---|
| `thincoder-core/agent-tools/batch.mjs` | 538 |
| `thincoder-core/agent-tools/subagent-async.mjs` | 487 |
| `thincoder-core/agent-tools/subagent-scheduler.mjs` | 486 |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 475 |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 372 |
| `thincoder-core/agent-tools/escalate-async.mjs` | 310 |
| `thincoder-core/agent/spawn-child.mjs` | 260 |
| `thincoder-core/agent-tools/timer.mjs` | 227 |
| `thincoder-core/agent-tools/subagent-run.mjs` | 224 |
| `thincoder-core/agent-tools/batch-ledger-bind.mjs` | 184 |
| `thincoder-core/agent/run-start.mjs` | 168 |
| `thincoder-core/agent/timers.mjs` | 165 |
| `test/integration/browser-start-window.test.mjs` | 119 |
| `thincoder-core/agent.mjs` | 107 |
| `thincoder-core/agent/post-turn.mjs` | 105 |

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 文档归属 | 🔴 | 同一机制在两处反向描述。`docs/core/design/AGENT-LOOP.md` 写「续跑规则：`engineering && autoApprove → 自动 resume`，否则询问是否续跑。规则适用所有回合（depth-0 用户回合 / auto-turn / depth>0 子代理）。」；`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3 写「**AUTO 一档同样不自动续跑**（需求面 = `docs/core/requirements/TURN-CAP-CONTINUE.md` F8）」。A 笔只落后者，§6.2 那句一字未动；AC-4 的扫描域 = `thincoder-core/**`，文档面这条判不到 | 本轮把 §6.2 的「规则适用所有回合」一并收正（或改为指向 §6.7.3 的三条出路），并把文档面收进一条机判判据（grep 形，域含 `docs/**`）。否则实施轮把同一机制的三份说法留在盘上 |
| 2 | 受影响文件层级 | 🔴 | 层级结论「均未越 500 行软线，无拆分计划」与本轮实测不符：`thincoder-core/agent-tools/batch.mjs` = 538 行，而本笔恰要在该档两处 `onWritten` 汇聚点加码 | 结论行点名 `batch.mjs`（538 > 500 软线），在 §2 给出拆分计划 ∥ 主动拆分复核结论（可拆缝 = action 分发面 ∥ append 迁移面），再定本笔加法落哪一半 |
| 3 | 验收 | 🔴 | AC-6 把整套集成入口写进验收：AC 表「真面读数：`node --test test/integration/browser-start-window.test.mjs` 6 跑全 0；`node test/run.mjs` 2 跑退出码 0」；B 节设计第 4 条同为「`node test/run.mjs` 连跑 2 次 ⇒ 退出码 0」。验收 = 实施轮跑的东西，整套入口在此即把发布门摊成一轮成本 | 验收只留改动面档（`node --test test/integration/browser-start-window.test.mjs`，多跑取读数）；并跑形要么收窄成「同档并发 N 份」，要么移入收口行由父侧报，不入本轮验收 |
| 4 | 集成测试设计 | 🔴 | C 节集成 delta 同时写了两句相反结论：「状态行面零改 ⇒ 破坏 0 / 冗余 0 / 缺失 0」与「会话流那一行要在集成面钉住需一个 TUI 流渲染夹具，现有集成面不驱动 TUI 流 ⇒ 登记为已知缺口（不新造夹具）」。同节修前读数已判「结论 = **有用户可见面，不是纯模型面**」——生产真出过的问题有可见面却无验收行，理由「没有夹具」不属唯一成立的那条 | 二择一。① 从 CLI 入口补行：用户进入点 = 会话流收到 timer 到期行，断言取结构面（前缀段字符类 `^\x20-\x7E` 覆盖，不写散文锚）。② 若确断「改前改后在非终端夹具里逐字同形」，就把这条理由在该节写实，不用「不新造夹具」 |
| 5 | 文档归属 | 🟡 | §6.6 断言「两集合都在 resume 保留集内（§6.2「resume 保留集」）」，`agent._designTurnNotices` 亦写「`resume` 保留（续跑不重置）」；但 §6.2 的枚举是「`_mutatedThisRun` / `_verifiedThisRun` / `_verifyRetries` / `_touchedFiles` / `_advisorRound` 保留」＋`_emptyRetries`＋`_compressFailures`。两名都不在清单内，而 §6.2 是这条语义的唯一陈述面 | 受影响文件表 `docs/core/design/AGENT-LOOP.md` 一行补 §6.2 保留集（加两名），否则保留集与实际复位面两处不等 |
| 6 | 验收 | 🟡 | AC-1 五形漏掉本设计自己造的两支：`notices 1 ∧ turn ≥ 8 ∧ wrote` ⇒ 常行（§6.6 机判同句已有）、`notices 0 ∧ turn ≥ 12` ⇒ 常行且印 12（§6.6「续跑段后果」）。漏判的恰是本笔新判据面 | AC-1 补齐两形，或直接以 §6.6 机判清单为验收清单——同一判据不各写一份 |
| 7 | 清晰度 | 🟡 | AC-5 写「假 HOME + 假 `rmSync` 注入」，全篇未点名注入缝：`rmSync` 自 `node:fs` 直取，无替换点，实施轮无从落手 | §2 B 节点名缝形（模块级 setter ∥ 参数覆盖 + `??` 默认回退；缺省 null ⇒ 生产行为不变，`finally` 复原），AC-5 按该缝写 |
| 8 | 文档归属 | 🟡 | `docs/core/design/TESTING.md` §4.6 写成通则「集成用例自己搭的隔离面——临时 HOME ∥ 临时目录 ∥ 端口 ∥ 子进程——收尾一律按**尽力面**处理」，而 B 笔只改 `test/integration/browser-start-window.test.mjs` 一档 | 要么把 §4.6 射程收到「已处置档」，要么在 §2 登记「其余集成档的裸收尾」为后续条目。通则而全仓不满足，就是下一批的假判据 |
| 9 | 方法论 | 🟡 | §2 三节均无最近先例行（先例坐标 ＋ 对齐 ∥ 偏离理由）。A 的最近同形先例就在同档（§6.5①「先例（最近 · 同级同形）：`_zeroWriteStreak` 族」），C 引了 `docs/cli/design/TUI.md` §7.6 的既有裁决——都没按「坐标 ＋ 对齐/偏离」写出来 | 每笔补一行先例句。A = `_emptyRetries` 复位形（对齐；偏差点 = 载体是计数帽非额度）· B = `thincoder-core/agent/timers.mjs` 尽力面清理（对齐）· C = `docs/cli/design/TUI.md` §7.6（对齐，同一枚字形同一成因） |
| 10 | 方法论 | 🟡 | §2 无公共源勘察行（查过哪些公开源 ∥ 有无相关）。三笔判据全在仓内，是一句可写实的结论；缺行即读作「未查」 | 批级或逐笔补一行：「外部公开源无相关（判据全在仓内档与代码）」，并点名查过的档 |
| 11 | 既有件三问 | 🟡 | 新名 `DESIGN_TURN_NOTICE_MAX` ∥ `agent._designTurnNotices` 无三问答案（住哪 · 逐字名 · 谁消费）；`_batchWrites` 只有「产品码里零命中」的散文，未成三问形 | 按三形逐项答（`existing:` ∥ `none found:` ∥ `existing but unusable:`）；`_batchWrites` 答 `none found` 并写检索域 |
| 12 | 清晰度 | 🟡 | 受影响文件表把 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 与 `docs/cli/design/TUI.md` 标成「写（timer 注入行文本面）」，但两档现文已是改后形。前者 §6.30.3「`history.push({ role: "user", content: "[System reminder: timer — <message>]" })`」；后者 §7.6「**不动位**：触发落流行 `[System reminder: timer — <message>]` 逐字保持」。要改哪几个字、朝哪个方向改，设计没说 | 逐处点名待改句与改后逐字。前者：无字面改动，只补「本轮前为 U+23F0 ⏰」一句现状；后者：把「逐字保持」改成「改后逐字 = …」。否则实施轮有把 `⏰` 写回文档的空间 |
| 13 | 读数归属 | 🔵 | §2 的「本席实读」「本席全仓实扫」未带时刻；`docs/core/design/TESTING.md` §1.3 要求读数带「谁的笔 · 什么时候」 | 关键读数补时刻（如「本席 2026-11-05 实读」），否则下次重算即两数 |
| 14 | 测试纪律 | 🔵 | AC-7 ① ② 断言注入串逐字（`[System reminder: timer — <msg>]`）= 提示词句子断言（`docs/core/design/TESTING.md` §6.1 C1-a 命中 ①）；③ 的 `/^[\x20-\x7E]+$/` 已覆盖同一根因 | 保留 ③ 与「缺省消息不含 U+23F0」；①② 退为 ③ 的下位读数——同根因不必三写 |
| 15 | 范围 | 🔵 | A 笔的 `_batchWrites` 使落点扩到批次工具族三档（`batch.mjs` ∥ `batch-lifecycle.mjs` ∥ `batch-ledger-bind.mjs`）；已由 KD-3 与「上抛·知会」写实，属知情扩面，非越界 | 无需动作。仅提示实施轮按六处汇聚点逐点报读数 |

计数：🔴 4 · 🟡 8 · 🔵 3。

VERDICT: changes-required

### 轮次 2（评审子代理）

评审轮 2 = 轮 1 裁定表 15 项逐条复核（每项按本轮 `read` ∥ `grep` 的现行档面判）＋ 修正轮引入的新面五行。

**上轮 15 项的现行档面（本轮实读）**：`docs/core/design/AGENT-LOOP.md` §6.2 续跑句、§6.2 保留集、§6.6 机判四条、`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3 字符面段、`docs/cli/design/TUI.md` §7.6 定形句、`docs/core/design/TESTING.md` §4.6 射程句——六处均与 §2 所述一致（逐条判据见下表）。

| # | 上轮# | 严重度 | 状态 | 判据（本轮实读） | 建议 |
|---|---|---|---|---|---|
| 1 | 1 | 🔴 | Fixed | §6.2 现文「射程 = **depth-0 主会话回合**（用户回合 / auto-turn）；**depth>0 子代理不自动续跑**」，与 §6.7.3「**AUTO 一档同样不自动续跑**」同向；AC-4 已加文档面扫描半 | —（机检串对不上，见新增 #16） |
| 2 | 2 | 🔴 | Fixed | 结论行已点名 `thincoder-core/agent-tools/batch.mjs` 越 500 软线，并给拆分计划（缝 = 执行面 ∥ 工具面，点名 `appendBatchRecord` / `editBatchRecord` 与六个辅助符号、留 `batchTool`）＋「本批不拆」上抛 | —（读数 537 待改 538，见新增 #17） |
| 3 | 3 | 🔴 | Fixed | AC-6 现为「只判改动面档、多跑取读数：……串行 6 跑档级退出码 0 ∧ 同档并发 4 份 × 2 轮全 0」，机检注「`node test/run.mjs` 归收口行由父侧报，不入本验收」；B 设计 4 同句 | — |
| 4 | 4 | 🔴 | Fixed | 集成 delta C 现「破坏 0 / 冗余 0 / **缺失 1**」，并列行 33-1（组件间交互 / 业务结果 / 用户进入点 / 回指四列齐），用例档 `test/integration/timer-reminder-glyph.test.mjs` + `test/RTM.md` 故事 33 | — |
| 5 | 5 | 🟡 | Fixed | §6.2 保留集现含「`_batchWrites` / `_designTurnNotices` —— §6.6 的 `wrote` 判据与注入帽按整轮累计读」 | — |
| 6 | 6 | 🟡 | Fixed | AC-1 现指 §6.6「机判」清单，并补两支（`notices 1 ∧ turn ≥ 8 ∧ wrote` ⇒ 常行；`notices 0 ∧ turn 12` ⇒ 常行且印 12） | —（计数措辞见新增 #20） |
| 7 | 7 | 🟡 | Fixed | 缝已点名（`opts.rm ?? rmSync` ∥ `opts.log ?? …`），AC-5 按缝写 | —（两档写法不一，见新增 #18） |
| 8 | 8 | 🟡 | Fixed | §4.6 已收射程「**射程 = 已按本节处置的档**——现 = `test/integration/browser-start-window.test.mjs`」，其余 32 档登记为后续条目 | —（后续条目未入上抛项，见新增 #19） |
| 9 | 9 | 🟡 | Fixed | 「最近先例（逐笔一行——坐标 + 对齐 ∥ 偏离）」A / B / C 三行齐 | — |
| 10 | 10 | 🟡 | Fixed | 「**公共源勘察（本批）**：`index.publicRepos` = 空（manifest 实读，2026-11-05）……结论 = 外部公开源无相关。」 | — |
| 11 | 11 | 🟡 | Fixed | 「既有件三问（新名）」三名齐，均 `none found: thincoder-core/**` + 检索式 + 消费方 | — |
| 12 | 12 | 🟡 | Fixed | ASYNC-POOL §6.30.3 已补「**字符面（D-TW2 的约束面）**」段；TUI §7.6 已改「**定形（逐字）**：触发落流行 = `[System reminder: timer — <message>]`」；两档互指单源 | — |
| 13 | 13 | 🔵 | Fixed | 「**读数时刻**：本节标「本席实读 / 实测」的读数均为 2026-11-05 本席实取；行数为 `split(/\r?\n/)` 计法。」 | — |
| 14 | 14 | 🔵 | Fixed | AC-7 现为「字符面一条判据……下位读数（同一根因，不另判）= 两档 `⏰` 零命中 ∥ 注入行逐字 …」 | — |
| 15 | 15 | 🔵 | Accepted | 扩面已由 KD-3 与「上抛·知会」写实，无需动作 | — |
| 16 | (new) | 🔴 | New | AC-4 文档面机检写「「depth>0 子代理不自动续跑」在 `docs/core/design/AGENT-LOOP.md` §6.2 与 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3 各命中一次」，而 §6.7.3 现文只有「**AUTO 一档同样不自动续跑**」——该串在 §6.7.3 零命中（本轮 `grep` 全域只命中 §6.2 一处）⇒ 验收在现档上即为红，且设计未授权改该句 | 二择一：把 §6.7.3 那句改成含同一串（属 A 的写面），或把 AC-4 第二半改成对 §6.7.3 实文的串，逐档恰一次 |
| 17 | (new) | 🟡 | New | 行数读数与自报计法不自洽：「`thincoder-core/agent-tools/batch.mjs` = **537** > 500 软线」，而 `split(/\r?\n/)` 与 `read` 两法均 538（本批 §1「父侧复核算正」表已列）；拆分节仍写「本笔在 537 行的现档上加那两行」 | 按 §1 的结定把两处 537 改 538（越线结论不变） |
| 18 | (new) | 🔴 | New | 同一个 `log` 注入缝三处三种写法，且 TESTING §4.6 的同一枚「落点」条目出现两次：`opts.log ?? process.stderr.write`（§2 B 设计 1 ∥ AC-5）· `opts.log ?? ((line) => process.stderr.write(line + "\\n"))` · `opts.log ?? ((line) => process.stderr.write(line + "\n"))`——后二者只差一个转义（前者写的是字面反斜杠 + n），前者是裸方法引用 | TESTING §4.6 只留一条「落点」条目并取 `"\n"` 一形；§2 B 设计 1 与 AC-5 改成同一串，三处一形 |
| 19 | (new) | 🟡 | New | 两条「后续条目」只在散文里登记，未入 §2「上抛项」清单（该清单以「待裁项：无。」收尾）：`batch.mjs` 拆分（「登记为后续条目（`[上抛·知会]`，父侧建台帐行）」）与其余集成档裸收尾（TESTING §4.6「登记为后续条目，逐档处置不在本节射程内」） | 两条并入「上抛项」，与 `_batchWrites` / 悬空号两行同列，父侧才建得了台账行 |
| 20 | (new) | 🔵 | New | AC-1 写「§6.6 的「机判」清单五条（纯函数五形 ∥ 长链恰 2 条 ∥ `batch` 写面 ∥ 续跑 + 接线）」——§6.6 实为四条机判（`**机判（纯函数）**` / 长链 / `batch` 写面 / 续跑 + 接线），纯函数那条列 6 款 | 计数与枚举对齐（四条；或把纯函数 6 款逐一列出），免实施轮凑第五条 |

计数：🔴 2（新增）· 🟡 2（新增）· 🔵 1（新增）；上轮 15 项 = 14 项 Fixed ∥ 1 项 Accepted。机制矛盾、层级结论、整套入口、集成 delta 四条 🔴 均已落地。

VERDICT: changes-required

### 轮次 3（评审子代理）

评审轮 3 = 只验评审轮 2 的五条（🔴 #16 ∥ 🔴 #18 ∥ 🟡 #17 ∥ 🟡 #19 ∥ 🔵 #20）。本轮另复读上轮 15 项是否回退。判据全取本轮 `read` ∥ `grep` 的现行档面。

| # | 上轮# | 严重度 | 状态 | 一句话判据 |
|---|---|---|---|---|
| 1 | 16 | 🔴 | Fixed | AC-4 改断言各档实有的串，现盘两档各 1 命中 |
| 2 | 18 | 🔴 | Fixed | `docs/core/design/TESTING.md` §4.6 只留一条落点条目，三处同一串 |
| 3 | 17 | 🟡 | Fixed | §2 两处行数已按 §1 复核为 538 |
| 4 | 19 | 🟡 | Fixed | 两条后续条目已入 §2 上抛项 |
| 5 | 20 | 🔵 | Fixed | AC-1 四条 ∥ 六款，与 §6.6 实读对齐 |

**#16 逐处读数**

- AC-4 现在断言的串 = 「不自动续跑」，并给两档各自的现文为注。
- `docs/core/design/AGENT-LOOP.md`：本轮 `grep` 恰 1 命中，正是「**depth>0 子代理不自动续跑**」。
- `docs/core/design/AGENT-LOOP-SUBAGENT.md`：本轮 `grep` 恰 1 命中，正是「**AUTO 一档同样不自动续跑**」。
- `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 另有 1 命中（「撞帽**不自动续跑**」），属该档自动回合句，不在 AC-4 的两档域内。
- 同条前半「规则适用所有回合」零命中：本轮五档 `grep` 无匹配。

**#18 逐处读数**

- `docs/core/design/TESTING.md` §4.6 现只一条「**落点 = 共用助手 `test/teardown.mjs` 的 `removeTempDirBestEffort(dir, opts)`**」条目。
- 该条目里的缝 = 「注入缝两处——`opts.rm ?? rmSync` ∥ `opts.log ?? ((line) => process.stderr.write(line + "\n"))`」。
- 该档 `grep process.stderr.write` 仅此 1 命中，`"\\n"` 那一遍已删。
- §2 B 设计 1 与 AC-5 已是同一串，B 节自述「三处同一串」。

**#17 ∥ #19 ∥ #20 逐处读数**

- #17：结论行「`thincoder-core/agent-tools/batch.mjs` = **538** > 500 软线」；拆分节「本笔在 538 行的现档上加那两行」。
- #19：「`[上抛·知会]` **后续条目 ①** `thincoder-core/agent-tools/batch.mjs` 拆分……」∥「`[上抛·知会]` **后续条目 ②** 其余集成档的裸收尾……」两行齐，`trigger` 分别写归批 ∥ 条件。
- #20：`docs/core/design/AGENT-LOOP.md` AC-1 写「清单**四条**（① 纯函数**六款** · ② 长链恰 2 条 · ③ `batch` 写面 · ④ 续跑 + 接线）」。
- 同档 §6.6 实读四条机判，纯函数那一条列六款 ⇒ 计数与枚举一致。

**上轮 15 项复读**：14 项 `Fixed` ∥ 15 项 `Accepted`，无回退。本轮重读的定点六处，全部在位：

- `docs/core/design/AGENT-LOOP.md` §6.2：「射程 = **depth-0 主会话回合**（用户回合 / auto-turn）；**depth>0 子代理不自动续跑**」。
- 同档 §6.2 保留集：「`_batchWrites` / `_designTurnNotices` —— §6.6 的 `wrote` 判据与注入帽按整轮累计读」。
- `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.3：「**AUTO 一档同样不自动续跑**」。
- `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3：「**字符面（D-TW2 的约束面）**」。
- `docs/cli/design/TUI.md` §7.6：「**定形（逐字）**：触发落流行 = `[System reminder: timer — <message>]`」。
- `docs/core/design/TESTING.md` §4.6：「**射程 = 已按本节处置的档**——现 = `test/integration/browser-start-window.test.mjs`」。

计数：本轮新开 0 条；上轮五条 = 5 Fixed（🔴 2 ∥ 🟡 2 ∥ 🔵 1）；上轮 15 项 = 14 Fixed ∥ 1 Accepted。无未解 🔴。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

- **原话一**：「操，赖了四个，骂一个你就补一个？」（2026-11-04 22:31）——把本轮遗留三笔并批清掉，不一条一档。
- **原话二**：「可以，都评审吧，自动跑完」（2026-11-05 02:59）——整批令，覆盖批准门与本批全链。

**批准范围**：三笔（`#2040` 设计轮提醒上限 + 陈旧注释 + 悬空裁定号 ∥ `#2044` 集成 teardown 抖动 ∥ `#2035` timer 注入行字形）。

## AC-6 的处置（父侧裁定 · 2026-11-05 03:26 · 用户批准范围内）

设计原文要求「同档并发 4 份 × 2 轮全 0」。实施轮实测：串行 6 跑 6/6 全 0；并发 3 轮里第 1 轮 4/4、第 2 ∥ 3 轮各 3/4，红点集中在 **4-3 用例体内** `EBUSY … DevToolsActivePort`，与 B 笔改面（模块级 `after` 的收尾清理）无关。

**裁定 = AC-6 收为「串行 6 跑全 0」（已达成）＋ 并发读数如实登记**，不要求并发全绿；4-3 并发抖动另立台账行（`#2053`）。理由 = 修它要动 4-3 的浏览器启动等待 ∥ 重试，而设计 B 明文「不改三条用例的断言与超时」——**为让一条验收变绿去改被测行为，是本末倒置**。

## §5 实施记录（eng-coder）

### 交付面（三笔逐条）

| 笔 | 改面 | 落点（实读） | 状态 |
|---|---|---|---|
| A | 判据 + 帽 | `thincoder-core/agent/post-turn.mjs`：`DESIGN_TURN_NOTICE_MAX = 2`；`designTurnReminder({role,turn,wrote,notices})` 四支（notices 0 ⇒ 5 轮起常行 ∥ 1 ⇒ 8 轮起降级行/常行 ∥ 到帽 ⇒ null）；`injectPostTurn` 的 `wrote` 取 `_touchedFiles ∪ _batchWrites`、注入后同址自增 `_designTurnNotices` | ✅ |
| A | 载体初值 ∥ 复位 | `thincoder-core/agent.mjs` 状态工厂（`_batchWrites: 0, _designTurnNotices: 0`）· `thincoder-core/agent/run-start.mjs` 的 `if (!resume)` 块内、与 `_emptyRetries` 同点 | ✅ |
| A | `_batchWrites` 六处汇聚点 | `batch.mjs` append ∥ edit · `batch-lifecycle.mjs` reopen ∥ status ∥ close · `batch-ledger-bind.mjs` create——六处全在 `writeFileSync` 之后（被拒路径先 throw） | ✅ |
| A | 注释面 | `thincoder-core/**` 内 `D-A[0-9]` 零命中（含 `audit-block.mjs`）；`subagent-async.mjs` 陈旧句改为「撞帽即注册父侧检查点、挂起等父 `send` / `cancel`，AUTO 档亦不自动续跑——§6.7.3」 | ✅ |
| B | 收尾尽力面 | 新建 `test/teardown.mjs` 的 `removeTempDirBestEffort(dir, {rm, log})`（两处注入缝 + `maxRetries:10`/`retryDelay:100` + 失败写一行不抛）；`test/integration/browser-start-window.test.mjs` 的模块级 `after` 只调它 | ✅ |
| C | 去字形 | `thincoder-core/agent/timers.mjs` 注入行 = `[System reminder: timer — <message>]`；`thincoder-core/agent-tools/timer.mjs` 四处缺省消息去 `⏰`；两档 `⏰` 零命中 | ✅ |
| C | 集成面 | `test/integration/timer-reminder-glyph.test.mjs`（行 `33-1`，标题同号）· `test/RTM.md` 故事 33 + 行 `33-1` | ✅ |

### 决策披露（无新裁，只记落地取形）

- `_batchWrites` 六处用内联一行（设计「各加一行」），未新造共享 helper：不扩符号面，也不在 `batch.mjs` ↔ `batch-lifecycle.mjs` 之间造环。
- 纯函数内 `notices` 先判帽、再判档位，与 §6.6 的列举顺序相反但结果集合相同（各支返回同一串）；先判帽可少一次分支。
- 未做的（设计明文）：不改 4-1/4-2/4-3 的断言与超时、不加 skip、不加第二次 kill、不做字形能力探测、不改状态行 `⏰N`（宿主能力例外）。

### 读数（逐条命令 + 结果 + 时刻；2026-11-05 03:30–03:45 本席实跑）

| # | 命令（逐字） | 结果 |
|---|---|---|
| AC-1 ∥ AC-2 ∥ AC-3 ∥ AC-4 ∥ AC-5 ∥ AC-7 | `node --test docs/batches/2026-11-04-core-debt-sweep.test.mjs` | `tests 23 · pass 23 · fail 0`（约 0.6 s） |
| AC-7 + 33-1 | `node --test test/integration/timer-reminder-glyph.test.mjs` | `tests 1 · pass 1 · fail 0` |
| AC-6 串行半 | `node --test test/integration/browser-start-window.test.mjs` ×6（串行） | 退出码 **0 ×6**（每次 4.5–5.3 s） |
| AC-6 并发读数 | 同档并发 4 份，共 3 轮 | 见下三行 |
| — 第 1 轮 | 4 份并发 | 4/4 退出码 0（约 8.1 s） |
| — 第 2 轮 | 4 份并发 | 3/4 退出码 0；1 份红在 4-3 用例体内：`AssertionError [ERR_ASSERTION]: 首动作回执应以 [navigate] + 页 URL 起头，实际：Error: EBUSY: resource busy or locked, open 'C:\Users\liwei\AppData\Local\Temp\tc-int-browser-home-hRYm1p\.thincoder\browser\profile\DevToolsActivePort'` |
| — 第 3 轮 | 4 份并发（`--test-force-exit` 取全表） | 3/4 退出码 0；1 份红，红点同第 2 轮（`EBUSY … DevToolsActivePort`），`pass 2 fail 1` |
| AC-8 | `doc_check(mode:"gate", docs:["test/RTM.md"])` | 首行 `DOC-CHECK GATE: PASS`（范围 1 档，0 段有问题） |

**并发面结论（按父侧 2026-11-05 03:26 裁定口径）**：并发面是 4-3 真机浏览器起不来的抖动（`EBUSY … DevToolsActivePort`，落在用例体内、非档级），与本笔改面无关；修 4-3 要动它的等待 ∥ 重试，属另一笔。

**B 笔交付目标达成面**：改前模块级 `after` 裸调 `rmSync` 在并发下抛 `EPERM` ⇒ 全绿的档判红（#2044 的原读数）；改后同一条件下实测触发尽力面且档不判红，可见行原文：

`[teardown] temp home not removed: C:\Users\liwei\AppData\Local\Temp\tc-int-browser-home-hRYm1p (EPERM)`

### 审计与代码评审轮次（含自修）

| 轮 | 来源 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 偏差审计（对 §2 逐条） | `DIVERGENT` 7 条：4 PARTIAL ∥ 2 DOC-DRIFT ∥ 1 OUT-OF-LIST；**静默简化 0** | 自修 3 条：补「续跑 + 接线」两半断言 · 补空文本拒形（改成临时档钉 `nothing to append`）· AC-4 扫描域从 `*.mjs` 扩到 `thincoder-core/**` 全档类 |
| 2 | 内部 advisor 代码评审（`type:"code"`，20 档） | `changes-required`：🔴1 · 🟡3 · 🔵2 | 自修 3 条：§5 空段（本轮补上）· AC-3 空文本拒形未验（已补）· 有界重试无机检（假 `rm` 现在断言选项） |
| — | 未修（本席无写面） | 🔴 = 四端设计档 + 两个端产品注释仍把交付原文记成携字形形；🔵 = `docs/core/design/AGENT-LOOP.md` §6.6 六处汇聚点坐标随本笔后移 | 见下「上抛」与「设计档漂移」两节 |

**终态：`stalled`** —— 一条 🔴 卡在本席写面之外（设计档归设计席、端产品注释不在本笔设计写面），其余全清；三笔机制方向零偏离。

### 清单外改动（逐项 + 理由）

| 档 | 理由 |
|---|---|
| `thincoder-core/agent-tools/audit-block.mjs` | AC-4 的域 = `thincoder-core/**`；该档两行注释携 `D-A1.2` 裁定号，不清则 AC-4 在盘上即红。改的是注释指向（改指 §6.7.6 与「审计报告模板」），零行为改动 |
| `test/RTM.md` · `test/integration/timer-reminder-glyph.test.mjs` · `docs/batches/2026-11-04-core-debt-sweep.test.mjs` | 三者已在 §2 受影响文件表与「集成面 delta」内（故事 33 / 行 33-1 / 批内单测档名随批档） |

### 设计档漂移（上报，本席不改）

1. `docs/core/design/AGENT-LOOP.md` §6.6 的「实读六处」坐标：`batch.mjs` 两处 `_batchWrites` 自增随本笔插入的注释/计数行后移；机制描述本身仍准，仅坐标旧了。
2. 同一族的 `[System reminder: ⏰ timer — …]` 引用（携字形形）仍在：`docs/desktop/design/IPC.md` · `docs/vsc/design/WEBVIEW-PROTOCOL.md` · `docs/server/design/agent/ADMIN-AGENT.md`（B70 ∥ N74 ∥ §14.4）· `docs/desktop/design/E2E-TESTING.md`（T-DSK44）。后两处是**验收判据行**，照它实施即对不上现核心注入行。

### 上抛项

- `[上抛·待裁]` 上面「设计档漂移」第 2 条：四端设计档 + `thincoder-desktop/src/main/timer-watch.mjs` ∥ `thincoder-vscode/webview/chat-messages.js` 两处注释仍写携字形形。设计档归设计席、端注释不在本笔写面 ⇒ 建议另派修正轮（只改引用形，机制零改），否则「同一机制两份互斥的逐字」留在盘上，且两条端验收行是假红。
- `[上抛·知会]` AC-6 的并发半按父侧 2026-11-05 03:26 裁定登记为读数、不作为验收判据；4-3 真机并发抖动另记一条。
- `[上抛·知会]` 内部评审 🔵 两条：一条已修（有界重试断言），一条未修（`docs/core/design/AGENT-LOOP.md` 的坐标漂移，设计席写面）。

### 修正轮 2（代码评审复评 · 2026-11-05 03:52）

- 复评结论 `VERDICT: pass`。三条修正核到盘面：§5 读数已落 · AC-3 空文本拒形钉在 `nothing to append` 那一支（临时档，不读真实仓）· 有界重试选项已有断言（假 `rm` 收第二参并比对各选项）。
- **终态改判：`clean`（笔内）**。上一节所记「终态 `stalled`」是评审第 1 轮后的状态，以本行为准。那条 🔴（四端设计档 + 两个端产品注释仍写携字形形）按「本席写面外 + 逐条登记 + 建议另派修正轮」关闭——**不等于已修**：那五处仍是旧形，两条端验收行（`docs/server/design/agent/ADMIN-AGENT.md` 的 N74、`docs/desktop/design/E2E-TESTING.md` 的 T-DSK44）照现文实施即假红，收口时不得当已消。
- 新开协调项（不阻本笔，父侧裁量）：AC-6 的「同档并发 4 份 × 2 轮全 0」在盘上 3 轮里 2 轮不成立，而「按父侧裁定只作读数」这一解释目前在盘上没有落点（`## §4 用户批准（主 agent）` 是空段）⇒ 收口时请在 §6 落一句，免得判据与读数两处不等。

### 收口前须知（父侧 · 本席不能改的面）

`docs/batches/2026-11-04-core-debt-sweep.md` §2 的三行「修前读数」引的旧码已被本笔改掉，机检现报 3 条「已落段命中」——不阻本轮写，但收口面 fail-closed 会拦：

| §2 行 | 引的旧码（现盘已无此串） | 建议改法 |
|---|---|---|
| 第 121 行 | `if (designReminder) agent.history.push({ role: "user", content: designReminder })` 单行形 | 改述为「修前形 = 单行 push（本笔改为块 + 自增，见 §5）」 |
| 第 134 行 | `wrote: (agent._touchedFiles ?? []).length > 0,` | 补为现状形（含 `|| (agent._batchWrites ?? 0) > 0`），或改述为修前形 |
| 第 140 行 | `engineering && AUTO 自动 resume` 那一句 | 改述为「修前形（本笔已删并改为现状句，见 §5）」 |

三行属 §2（设计席段）；本席按「一段一作者」不动它。

### 修正轮 3（C 笔域收口 · 两处端产品注释 · 2026-11-05 04:10）

**落地面**（按父侧 2026-11-05 03:42 裁定：机制 ∥ 行为 ∥ 端状态行符号形零改，只改注释文字）。两处逐字，删 `⏰` 与紧随的一空格，该行其余文字逐字不动：

| 档 | 改前形 | 改后形 |
|---|---|---|
| `thincoder-desktop/src/main/timer-watch.mjs` | `[System reminder: ⏰ timer — …]` | `[System reminder: timer — …]` |
| `thincoder-vscode/webview/chat-messages.js` | 同上 | 同上 |

改后行实读（本席 2026-11-05 04:07）：

```text
thincoder-desktop/src/main/timer-watch.mjs:20
 *  逐条落流。返回交付条数（0 = 无到期项——零注入零行）。`text` = 交付原文逐字（`[System reminder: timer — …]`）；

thincoder-vscode/webview/chat-messages.js:286
 *  `text` = 交付原文逐字（`[System reminder: timer — …]`）；显示裁 = ≤3 行 + `…`（CLI `timer-watch.mjs`
```

与核注入单点同串：依据 `thincoder-core/agent/timers.mjs`「const line = `[System reminder: timer — ${t.message}]`」。

**读数（2026-11-05 04:06–04:10 本席实取）**

| # | 检查（逐字） | 结果 |
|---|---|---|
| AC-7 字形域 | `grep` 工具，三域 = `thincoder-core` ∥ `thincoder-desktop` ∥ `thincoder-vscode`，档类 `*.mjs` ∥ `*.js` ∥ `*.json` ∥ `*.md` | 核心 **0** · 桌面 **2**（`renderer/i18n.mjs` 两处 `"status.timer": "⏰${n}"`）· VSC **6**（`AGENTS.md` · `src/extension/panel-callbacks.mjs` · `webview/state.js` · `webview/status-bar.js` · `locales/en.json` · `locales/zh.json`）—— 合计 **8**，全为状态行符号形；两处目标档零命中 |
| 目标档引用面 | `grep System reminder` 逐档 | 两档各恰 1 处，均为 `[System reminder: timer — …]` |
| 语法 | 编辑回执内置检查 | 两档 `Syntax: OK` |
| 批内单测（AC-1…AC-5 ∥ AC-7） | `node --test docs/batches/2026-11-04-core-debt-sweep.test.mjs` | `tests 23 · pass 23 · fail 0`（约 0.59 s） |
| 差异面 | `git diff` 两档 | 各 1 行、均在 JSDoc 注释块内（函数体在下一行起）；零代码行变动；行数 = 77 ∥ 302，均在 500 软线下 |

**审计与代码评审轮次（本轮）**

| 轮 | 来源 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 偏差审计（对 §2 C 节「端产品注释落点」+ AC-7） | `TERMINAL: clean` · 静默简化 **0** · 四类偏差零 | 无需自修 |
| 2 | 内部 advisor 代码评审（`type:"code"`，两档 + 批档） | `VERDICT: pass`（🔴 0 · 🟡 2 · 🔵 1；三条全在**记录面**，代码面零阻塞） | 记录面三条转父侧，见下「上抛」 |

**终态：`clean`**（代码面零未解；记录面三条不阻收口，已逐条登记）。

**清单外改动**：无 —— 两档均在本 spawn 声明写面内，且已在 §2 受影响文件表标「本批要做」。

**上一轮读数更正（同段内更正，不改他人文字）**

- 取消：「那五处仍是旧形」∥「两条端验收行照现文实施即假红」——两说均出自我上一轮的本段记录。
- 现状：四端设计档与两处端注释全为改后形，实读见下两条。
- 依据 `docs/desktop/design/E2E-TESTING.md`「流内触发行恰一行（`[System reminder: timer — …]` 原文——显示裁 ≤3 行）」
- 依据 `docs/vsc/design/WEBVIEW-PROTOCOL.md`「`text` = 交付原文（`[System reminder: timer — …]` 逐字」
- 后果：§6 收口不得把那条 🔴 当未修。

**上抛项（本轮新增）**

- `[上抛·知会]` 本轮交付面与读数已在本节补齐（§5 前「交付面」表无这两档的行、读数表 AC-7 只挂批内单测档的缺口，由本节两表承担）——§6 直接引用本节即可，不必再跑。
- `[上抛·知会]` AC-7 射程在记录里有两种写法：§1 追加裁定第 2 条写「全仓 `⏰` 零命中」，第 3 条与 §2 AC-7 收为三方树。字面「全仓」在盘上即红且属有意留档 —— `test/integration/timer-reminder-glyph.test.mjs` 的「修前红」注释 ∥ `docs/batches/2026-11-04-core-debt-sweep.test.mjs` 的 AC-7 用例名各携一枚，均在三方树之外。§6 请只引可执行形（三方树 + 8 处例外），免下轮判出假红。

## §6 验证与收口（父代理）

## 验证与收口（父侧 · 2026-11-05 04:12）

### 父侧亲自复核的读数

| 项 | 方式 | 结果 |
|---|---|---|
| 本批单测 | `node --test docs/batches/2026-11-04-core-debt-sweep.test.mjs` | `tests 23 / pass 23 / fail 0` |
| 集成 33-1 | `node --test test/integration/timer-reminder-glyph.test.mjs` | `tests 1 / pass 1 / fail 0` |
| A 笔 | 读 `thincoder-core/agent/post-turn.mjs` | `DESIGN_TURN_NOTICE_MAX = 2` 在位；`_batchWrites` 判据在位 |
| C 笔 · 核心注入行 | 读 `thincoder-core/agent/timers.mjs` | 注入行 `[System reminder: timer — ${t.message}]`，**无 `⏰`** |
| C 笔 · 两处端注释 | 读两档 | `thincoder-desktop/src/main/timer-watch.mjs` ∥ `thincoder-vscode/webview/chat-messages.js`：`⏰` = 0、`System reminder: timer` = 1 |
| C 笔 · AC-7 三方树 | `grep` 逐档扫 `⏰`（`*.mjs` ∥ `*.js` ∥ `*.json` ∥ `*.md`，排除 `dist-*` ∥ `.thincoder/tmp`） | **8 处**，全为状态行符号形：`thincoder-desktop/renderer/i18n.mjs` 2 ∥ `thincoder-vscode/AGENTS.md` 1 ∥ `thincoder-vscode/locales/en.json` 1 ∥ `thincoder-vscode/locales/zh.json` 1 ∥ `thincoder-vscode/src/extension/panel-callbacks.mjs` 1 ∥ `thincoder-vscode/webview/state.js` 1 ∥ `thincoder-vscode/webview/status-bar.js` 1 |

### AC-7 的判法（写死，收口只认这一形）

**可执行形** = 三方树（`thincoder-core/**` ∥ `thincoder-desktop/**` ∥ `thincoder-vscode/**`）内 `⏰` 只余状态行符号形（上表 8 处）。例外 = `⏰N` ∥ `⏰${n}`（宿主能力面，保留）。

**不用「全仓零命中」这一形**：`test/integration/timer-reminder-glyph.test.mjs` 与 `docs/batches/2026-11-04-core-debt-sweep.test.mjs` 各携一枚旧的 `⏰` 形态，**是故意留的「修前红」基线**——照字面判会判出一条假红。判据写误了不改活，改判据。

### 收口前的那条 🔴 已消

上一轮的「两处端注释仍携旧形」在 §5 修正轮 3 里已落（见上表两档读数）；四端设计档的五处引用也已是改后形。§6 不把它当未修。

### 未做项（如实登记）

- **`dist-r3` ∥ `dist-r4` 的打包产物未重建**：`app.asar` 仍携旧串，属构建产物、随下次构建从源重生成；§2 已声明不入扫描域。不重建 = 本批边界，不是欠账。
- **4-3 用例的并发抖动不在本批**：台账 `#2053`（`EBUSY … DevToolsActivePort`）。

### 三笔的交付对账

- `#2040` 设计轮提醒有上限有去重（26 条 → 恰 2 条）+ 陈旧注释收正 + 悬空裁定号清零 → 落。
- `#2044` 集成收尾抖动：`test/teardown.mjs` 尽力面，EPERM 只落一行 stderr 不判红 → 落；AC-6 按 §4 裁定收为「串行 6 跑全 0」。
- `#2035` timer 注入行去字形：核心注入行 + 四处缺省消息 + 两处端注释 + 四端设计档五处引用 → 全落；AC-7 余 8 处状态行符号形。

### 台账

`#2035` ∥ `#2040` ∥ `#2044` ∥ `#2047` → 已核销（父侧本轮落）。
