# 2026-11-06 · vsc-test-face
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-06 · 来源 = 用户 2026-11-06 11:44「那都复启吧」；本批合并 #2098（N-W8 三条 + 覆盖面 7 条）与 #2095（F-W4 活卡面补测）——同一实现面 = VSC webview 测试用例。
> 台账 = #2098（vsc · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-06
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批覆盖账与要做什么（父侧 · 2026-11-06 11:45）

**已定决定**：`#2095` 与 `#2098` **合并为一批**——同一实现面 = VSC webview 测试用例。· 用户原话：「那都复启吧。」 · 时间：2026-11-06 11:44

**覆盖账 = #2098（本批自开）∥ #2095**

**要写的用例（三条来源，逐条带判据出处）**：

| # | 用例 | 判据出处 | 数量 |
|---|---|---|---|
| A | **N-W8 三条先红后绿**：① 打开路径快照到达（F-W8）② 未编辑控件的空值零写盘（F-W10）③ 推送后旧值不回写（F-W9） | `docs/vsc/requirements/WEBVIEW.md` N-W8 行 | 3 |
| B | **F-W14 覆盖面**：回合尾落盘**四路径**各一条断言——逐路径驱动到落盘点，断言槽复合（`provider:model`）= 回合内显式选定值（seed 不夺权） | F-W14 行 + `docs/vsc/design/WEBVIEW.md` §4.2 判据形 | 4 |
| C | **F-W17 掩码面**：**三处**渲染位逐处——已配置 ⇒ 该位呈 `****`；未配置 ⇒ 非掩码文案 | F-W17 行（含掩码面判据句）+ `docs/vsc/design/SETTINGS.md` §2.10 | 3 |
| D | **F-W4 活卡面**（来自 `#2095`）：`toolCall` / `toolOutput` / `toolResult` 接收面 | `docs/vsc/requirements/WEBVIEW.md` N-W5 登记例外 | 1 |

**⇒ 合计 11 条。**

**硬约束**：

1. **A 三条必须「修复前必红」**——先跑红再修到绿；不许写完直接绿（那证明不了用例在测东西）。
2. **B ∥ C 各条独立**——**只驱动 `panel-callbacks.mjs` 一条不构成覆盖**（设计判据形原话）。
3. **用例件落 `thincoder-vscode/test/`，档名登记进 `files.mjs`**（清单制，N-W8 行要求）。
4. **不得沿用 `test/smoke-settings.mjs` 那种「`openSettings()` 前手工灌 SS」的手法**——N-W8 明写那是掩盖源。

**边界**：本批只写用例与必要的测试档注册；**不改产品代码**——若某条用例必须改产品才写得成，**停手上抛**，不自行改源码。

### 父侧裁决：设计席三件（2026-11-06 11:48）

| 项 | 裁决 |
|---|---|
| **红证法**（A1–A3 的「修复前必红」） | **准做红证，但不许在工作树里临时回退**。改走**隔离工作树**：`git worktree add` 到修复前的提交 → 把新用例拷进去 → 跑出红 → 撤工作树；现树跑绿。**理由**：本仓工作树有 175 档未提交改动，**在其中回退产品档 = 拿别人的在途工作赌一次取证**。隔离工作树不碰现树一个字节，取证一样成立 |
| **`files.mjs` 本轮未动** | **准。**先登记的后果它说对了：`run.mjs` ①门「listed unit file does not exist」立红。**登记与建档同一次落地**，这正是 `run.mjs` 两道反查门的本意 |
| **B 若须改产品才驱动 ⇒ 停手上抛** | **准，且这是本批的硬边界。**用例写不成就报「写不成 + 为什么」，**不许为了让用例跑起来改产品代码**——那是拿被测物去迁就测试 |

**⇒ 红证法的判据（写死，不许含糊）**：

1. **红必须来自「修复前」的代码**，不是来自断言写错、夹具搭错、或故意传坏参。
2. **红要有读数**：哪条断言红、报什么。
3. **现树绿**，且 `git diff --stat` 对这 6 档为空——**证完不留痕**。
4. 取证失败（跑不出红）⇒ **如实报「红证不成立」**，并说明是被测行为已变还是断言写错。**不许把「跑绿了」说成「红过了」。**

### 父侧裁决：修正轮三件上抛（2026-11-06 11:56）

| 项 | 裁决 |
|---|---|
| **需求面三处反向陈述**（D1 落盘后成反向） | **分工照设计席所报**：需求档两处（F-W4 行末句 ∥ N-W5「登记在案的例外 1 条」）归父侧，**在 D1 落盘后的同一轮改**；设计档 §10 归设计席同轮删。**现在不改**——用例还没写，提前改成「已有专属用例」才是假话 |
| **`thincoder-vscode/test/files.mjs` 头注与在册形态不符** | **以在册形态为准，改头注。**事实：在册 5 档 + 本批 6 档全是 `test/<日期>-vsc-<主题>.test.mjs`，既非批次档名、也不住批次目录 ⇒ 头注那句是**旧约定的残留**。`files.mjs` 本来就在本批受影响文件里（要追加 6 项），**同一笔改掉，不另开轮** |
| **F-W10 是否立集成故事** | **本批不立，立账。**理由：它超出 §1 覆盖账的 11 条与「只写用例与登记」的边界；而它确有生产事故背景，**所以不能就这么丢了**——落台账一行（归批，复启条件 = VSC 集成面下次开批） |

**另两条知会照收**：

- **B 的驱动可行性未验**（`vscode` 桩能否撑住 `panel-callbacks.mjs` 顶层 import）——**撑不住就停手上抛，不许改产品代码迁就测试**（§1 硬边界的原话）。
- **需求档 F-W14「`title` 三态」与代码不符**——**已由父侧改成「两形」**（`title ? { seed: slotStamp, title } : { seed: slotStamp }`）。这一处是本席先前写错、评审 `#135` 指出后只改了设计档、需求档漏改；本轮补齐。

### §5 实施须知（父侧 · 2026-11-06 11:58）

评审轮次 2 指出一处脱轨，我在此补口，**实施席按本行办**：

> `thincoder-vscode/test/files.mjs` 的**头注**与本批裁决同轮改掉——即便 §2「受影响文件」表该行只写「改（+6 项登记）」。

**改什么**：把「单元档 = 批次本地件（名随批次档、住批次目录）」这句旧约定改成在册实形（`test/<日期>-vsc-<主题>.test.mjs`）。依据 = 在册 5 档 + 本批 6 档全为该形。

**为什么必须同轮**：头注是**下一个写这批用例的人唯一会读的说明**。留着旧约定，他会按「住批次目录」去建档，**而那正是 `run.mjs` ①门会判红的位置**。

**判据**：头注句改完后，`thincoder-vscode/test/files.mjs` 内不再出现「住批次目录」这个短语。

### 整批令（用户 2026-11-06 12:33）

**已定决定**：本批全链自动跑完——实施 → 验证 → 修正 → 收口，不逐节点回问。· 用户原话：「都自动跑完吧。」 · 时间：2026-11-06 12:33

**整批令覆盖批准门**，但四种情形仍停手回问：评审 🔴 修不了或要改设计语义 ∥ 实施须偏离已批设计 ∥ 用户叫停 ∥ 范围变更。

### 父侧裁决：红证换法（2026-11-06 12:38）

**准。**但不是因为它写得省事——**是因为我 11:48 那条裁决的前提在它这里不成立。**

**我当时的判据**：「红必须来自修复前的代码，不是断言写错、夹具搭错、或故意传坏参」。

**它查出的实情**：`37cb1b34` 那个提交上，**本档夹具依赖的 `thincoder-core/config-io.mjs`、`shell-candidates.mjs` 与 embed / memory 缝都还不存在**——检出那个提交跑出来的红是**模块解析噪声**，不是行为红。**那恰好违反我判据的第①条。**

**⇒ 我的方案在本批不可行，而它给的理由正是我自己的判据。**改法：用 `module.registerHooks` 的 `load` 覆写，把**修复点源码**换回修复前原文，在现役夹具里跑红。

**这个改法其实更贴我的判据**：隔离工作树换掉的是整个提交（依赖、夹具、产品码一起变），**覆写只换那一个修复点**——变量更干净。

**四条红读数照收**（A1 三快照整批缺席 ∥ A2 实得 `{ settings: { uri: "", web: true }, type: "saveProxySettings" }` ∥ A3 三面 `'http://old-proxy:1080' !== 'http://new-proxy:8080'` ∥ A3 ④ `'****' !== '—'`）。

**⇒ 记一条给以后**：**我给的取法要连「那个提交上有没有可用的夹具」一起核**。没核，就是给了一个跑不通的方案，还怪执行者不照做。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
### 本批条目（覆盖 11 条 · 与 §1 覆盖账同源）

| # | 用例 | 判据出处 | 用例档 | 用例标题（`test()` 首句） |
|---|---|---|---|---|
| A1 | 打开路径快照到达 | 需求档 F-W8 行 | `thincoder-vscode/test/2026-11-06-vsc-settings-open-snapshots.test.mjs` | A1 打开设置页一拍内 proxySettings / websearchSettings / indexStatus 三快照到达且渲真值 |
| A2 | 未编辑控件的空值零写盘 | 需求档 F-W10 行 | `thincoder-vscode/test/2026-11-06-vsc-settings-empty-no-write.test.mjs` | A2 快照未达时 blur/Enter 代理控件 ⇒ 零发值；显式清空 ⇒ 才发删除 |
| A3 | 推送后旧值不回写 | 需求档 F-W9 行 | `thincoder-vscode/test/2026-11-06-vsc-settings-refill.test.mjs` | A3 推送回填活控件；随后改动任一控件 ⇒ 发回值 = 屏幕新值（旧值零回写） |
| B1 | 回合尾落盘路径 1 | 设计档 §4.2 判据形 | `thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` | B1 `panel-callbacks.mjs` 的 `_saveLines`·`turnSlot`（携 `...agentState`） |
| B2 | 回合尾落盘路径 2 | 同上 | 同上 | B2 `panel-callbacks.mjs` 同函数·`distillSlot`（携 `...lastAgentState`） |
| B3 | 回合尾落盘路径 3 | 同上 | 同上 | B3 `panel-turn-loop.mjs` 的 `_saveLines`·`turnSlot`（载荷只 `seed`） |
| B4 | 回合尾落盘路径 4 | 同上 | 同上 | B4 `panel-turn-stages.mjs` 的 `_saveLines`·`turnSlot`（`title` 两形同断言） |
| C1 | 掩码位 1 | 需求档 F-W17 行「掩码面」+ 设计档 §2.10 | `thincoder-vscode/test/2026-11-06-vsc-settings-mask-face.test.mjs` | C1 `#status-websearch`：已配置 ⇒ `****`；未配置 ⇒ `—` |
| C2 | 掩码位 2 | 同上 | 同上 | C2 `#status-embed`：同形 |
| C3 | 掩码位 3 | 同上 | 同上 | C3 `#rowline-<name>` 内 `.key-status` 的渲染文本：已配置 ⇒ `****`（行内有掩码值则显该值）；未配置 ⇒ `settings.notConfigured` 词条文本（驱动入口 = `window._editKey(name)` → 编辑器取消 ⇒ `restoreKeyRow` 就地复原，不直调档内私有函数） |
| D1 | 活卡接收面 | 需求档 F-W4 行 + N-W5 登记例外 | `thincoder-vscode/test/2026-11-06-vsc-live-tool-card.test.mjs` | D1 `toolCall` → 卡；`toolOutput` → 追加且展开；`toolResult` → 成功折叠 / 错误展开 |

**不在本批**（判据均已成文，与本次覆盖账无关）：

- F-W17 入口册六行删除确认门用例；
- F-W14 模型/推理按钮忙态门用例；
- F-W4 恢复卡与活卡对齐（需求档 P2-5 已登记缺口）；
- F-W4 的其余三面——卡体末行摘要 ≤100 字 / 卡体超 64K 截断加注 / 恢复卡折叠语义与活卡终态同形。D1 只断 `toolCall` ∥ `toolOutput` ∥ `toolResult` 三支接收面，**不是 F-W4 全覆盖**。

**归属对位（N-W8 的「现零测试命中」三符号）**——三条各断一次，不并成一条：

- `proxySettings`：由 A2 / A3 逐拍断言（快照到达 ⇒ SS 落值 ⇒ 控件回填）。
- `saveProxySettingsFromPanel` = 代理整块：`docs/vsc/design/SETTINGS.md` §2.8 路径册 #1——显式清空 `#px-uri` ⇒ payload 恰含 `uri:""` ⇒ 宿主删 `proxy` 键；驱动经 `saveProxySettings` 消息。
- `handleSetProviderProxy` = provider 行的 `providers[].proxy` 布尔：同档 §2.16 ③「行写 = 同档 `handleSetProviderProxy`（`true` 写 ∥ `false` 删键）」；驱动经 `setProviderProxy` 消息。
- 后两条都由 A2 第二半覆盖，不另立用例。

### 设计档落点

判据一条都不新立：F-W14 判据形 = `docs/vsc/design/WEBVIEW.md` §4.2；掩码面判据形 = `docs/vsc/design/SETTINGS.md` §2.10；N-W8 先红后绿 = 需求档 `docs/vsc/requirements/WEBVIEW.md` 的 N-W8 行。

本批的设计面 = 11 条的落档、驱动法与红证法，落在本段 §2（批次范围内的设计）。产品代码与既有判据零改；**设计档章节零增**——若「机制设计 2」的宿主驱动桩最终需要共享件，其形态才写进 `docs/vsc/design/WEBVIEW.md` §4.2 的用例落点句。

**最接近先例**：`thincoder-vscode/test/2026-10-21-vsc-stateword-flicker.test.mjs`——happy-dom 注册 + webview 模块直驱 + 一条 `test()` 一句判据。C 三条与 D1 沿用同形（对齐）；**偏离** = 宿主层直驱在本目录无先例（既有 5 档全为 webview 层），偏离理由 = B 的判据在宿主落盘点，webview 层不可达（能力面，非喜好）。

**勘察源**（`publicRepos` 为空，工作树内无独立文档仓；无外部对象可查）：

- 需求档 `docs/vsc/requirements/WEBVIEW.md` 的 F-W4 · F-W8 · F-W9 · F-W10 · F-W14 · F-W17 · N-W5 · N-W8 行；
- 依据 `docs/vsc/design/WEBVIEW.md`「只驱动 `panel-callbacks.mjs` 一条不构成覆盖」（§4.2 判据形）；
- `docs/vsc/design/SETTINGS.md` §2.10 的掩码面三落点；
- 依据 `docs/vsc/requirements/WEBVIEW.md`「`test/smoke-settings.mjs` 在 `openSettings()` 前手工灌 SS 的手法 = 掩盖源」（N-W8 行）；
- `thincoder-vscode/test/files.mjs`（清单 5 项）与同目录 `run.mjs`（两道反查门）、5 档既有用例。

**数据事实**：本批无需读数据——11 条判据全是代码行为（渲染文本 / 消息载荷 / 落盘槽值），代码与文档可判。

### 机制设计

1. **交付面**：11 条用例 / 6 档，全落 `thincoder-vscode/test/`，逐档登记进 `thincoder-vscode/test/files.mjs`。
   - 依据 `thincoder-vscode/test/run.mjs`「unregistered unit file (register it in test/files.mjs — an unregistered file is never executed)」——登记与建档必须同一批同一次落地，故登记归实施步（§5），不先登记后建档（先登记 ⇒ `run.mjs` 第 ① 门「listed unit file does not exist」立红）。

2. **驱动面分两层**（判据面不同，不混一层）：
   - **前端层**（A1 · A2 的前端半 · A3 · C1–C3 · D1）：happy-dom（`GlobalRegistrator.register()`）+ `acquireVsCodeApi` 桩，断言渲染文本与 postMessage 载荷；
   - **宿主层**（A2 的落盘半 · B1–B4）：直驱 `thincoder-vscode/src/extension/*.mjs`，`vscode` 模块桩 + 配置文件落点隔离——核 `thincoder-core/config-io.mjs` 的 `_setConfigPathForTest`（「Test seam: override the config file location」）把 `config.json` 指到临时路径，断言落盘点写出的槽复合 `provider:model` 与 `config.json` 逐字不变；
   - **A1 归前端层**：其判据 = 打开拍三快照到达且渲真值（`docs/vsc/requirements/WEBVIEW.md` F-W8 行「新窗口 / Reload 后**直接**打开设置页 ⇒ 三个快照到达且渲染真值」）——断言点在 webview 的 SS 与渲染文本，宿主层没有可断言的落盘面。

3. **B 逐路驱动**（四处落点本轮实读到行，行号不入档，以符号 + 载荷形为址）：
   - 路径 1 = `panel-callbacks.mjs` 的 `_saveLines(fullHistory, history, { seed: slotStamp, ...agentState }, turnSlot)`；
   - 路径 2 = 同档 `_saveLines(fullHistory, history, { seed: slotStamp, ...lastAgentState }, distillSlot)`（前置槽守卫 `panel._slot !== distillSlot` 即返——驱动须令守卫通过）；
   - 路径 3 = `panel-turn-loop.mjs` 的 `_saveLines(fullHistory, history, { seed: slotStamp }, turnSlot)`；
   - 路径 4 = `panel-turn-stages.mjs` 的 `_saveLines(fullHistory, history, title ? { seed: slotStamp, title } : { seed: slotStamp }, turnSlot)`（两形同一条断言）。
   判据 = 落盘点写出的槽复合 = 回合内显式选定值（`seed` 不夺权）。静态对账不算覆盖——设计档 §4.2 已明写静态扫只数调用点、判不出哪处让 `slotStamp` 夺权。
   驱动入口（实读）：`finalizeTurn` ∥ `enterSuspensionTurn`（`panel-turn-stages.mjs` 导出）· `runTurnLoop`（`panel-turn-loop.mjs` 导出）· 路径 1/2 在 `buildPanelCallbacks` 的回调闭包内——须经回调触发，不能直调。

4. **红证法（A1–A3 —— 走隔离工作树，现树零改）**：三条修复已在产品侧落地，故「修复前必红」按**离线取证**执行——`git worktree add` 检出该条修复点之前的提交 → 把新用例档拷进去 → 跑该档 ⇒ 红 → 撤工作树；现树跑同档 ⇒ 绿。现树一个字节不动（依据 §1 裁决「不许在工作树里临时回退」——本仓工作树有在途未提交改动，在其中回退产品档 = 拿别人的在途工作赌一次取证）。
   红读数（命令 + 红在哪一句断言）与回退基线（提交 + 文件 + 符号名）写进 §5；现树 `git diff --stat` 为空，产品代码与既有判据零改。

5. **禁沿用**：A1 / A3 不得用 `test/smoke-settings.mjs` 那种「`openSettings()` 前手工灌 SS」的手法——N-W8 明写那是掩盖源。A1 必须自**推送/拉取**路径进快照；A3 必须先等推送到达再改控件。

### 受影响文件与测试覆盖

| 文件 | 性质 |
|---|---|
| `thincoder-vscode/test/2026-11-06-vsc-settings-open-snapshots.test.mjs` | 新增 |
| `thincoder-vscode/test/2026-11-06-vsc-settings-empty-no-write.test.mjs` | 新增 |
| `thincoder-vscode/test/2026-11-06-vsc-settings-refill.test.mjs` | 新增 |
| `thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` | 新增 |
| `thincoder-vscode/test/2026-11-06-vsc-settings-mask-face.test.mjs` | 新增 |
| `thincoder-vscode/test/2026-11-06-vsc-live-tool-card.test.mjs` | 新增 |
| `thincoder-vscode/test/files.mjs` | 改（+6 项登记） |

**档位结论**：六档皆新增，无既有档跨档位、无拆档计划；`thincoder-vscode/test/files.mjs` 是清单单档（职责只有登记一项），本批追加 6 项后仍是一档一职责、不跨档。不触碰协议、export 面、产品源码与集成索引。

### 集成测试设计（从 `test/RTM.md` 索引起）

读仓根 `test/RTM.md` 作差量。VS Code 端现只有故事 1「归档块重开 ∥ reload 后，子代理行还是子代理行」（行 1-1 ∥ 1-2，证据档 `test/integration/vsc-record-sublabel.test.mjs`）。

| 差量 | 结论 |
|---|---|
| 断掉的行 | 无——本批只增单元档，不改任何业务可观察结果；1-1 ∥ 1-2 断的是归档块子标在重开后的存续，与六档无交集 |
| 冗余的行 | 无 |
| 缺的行 | 无——`test/RTM.md` 明写「单元测试档不进本表（内部回路、用毕即删）」，六档皆 `node --test` 直跑的单元档 |

**为什么本批不长出集成行**：集成用例只有两个来源——产品真需要的业务场景 ∥ 生产真出过的问题。六档断的是设置面与回合尾落盘的内部回路，其用户入口（打开设置页 ∥ 回合跑完）已由既有故事承载。

**一条候选（父侧裁）**：F-W10 的空值静默清除有过生产事故，从 VS Code 入口看确有用户可见面——打开设置页 → 清空代理 URI → 读 `config.json` 是否被动过。立它 = 新增一条 VS Code 集成故事 + 一个集成档，超出 §1 覆盖账的 11 条与「本批只写用例与登记」的边界。未立，请父侧裁。

### 验收对照

| 需求行 | 机判 |
|---|---|
| 需求档 N-W8 行（A1–A3 先红后绿 + 登记） | 三条各自回退取证读红（§5 记读数）后转绿：`node --test test/2026-11-06-vsc-settings-open-snapshots.test.mjs test/2026-11-06-vsc-settings-empty-no-write.test.mjs test/2026-11-06-vsc-settings-refill.test.mjs` 全绿；`files.mjs` 含三档 |
| 需求档 F-W14 行（四处落盘路径） | `node --test test/2026-11-06-vsc-turn-save-slots.test.mjs` 4 条全绿，逐条对应一个落盘点 |
| 需求档 F-W17 行「掩码面」（三位逐处） | `node --test test/2026-11-06-vsc-settings-mask-face.test.mjs` 3 条全绿，每位已配置/未配置两态各断一次 |
| 需求档 N-W5 登记例外（F-W4 活卡面补测） | `node --test test/2026-11-06-vsc-live-tool-card.test.mjs` 1 条全绿，三支接收面各断一次 |
| 登记面（N-W5 ∥ N-W8 的「档名在册」） | `thincoder-vscode/test/files.mjs` 的清单数组含 6 个新档名且六档在盘——即 `run.mjs` 两道反查门判的那一对。**全量跑不入本批门**：需求档 N-W5 ∥ N-W8 行里的 `node test/run.mjs` ∥ `npm test` 绿是父侧收口那一次跑，§5 只报逐档 `node --test` 读数 |

### 关键决策

1. **6 档而非一档**：判据面不同（happy-dom 全局注册 vs 宿主直驱），混一档则前者的 DOM 全局注册污染后者对宿主模块的断言；红证也要能单档重跑。A2 一档内的两半（前端半 + 落盘半）是同一条判据的两端，故同一条 `test()` 顺次断两半，不拆档。取舍 = 多 5 次清单登记，换红证与并跑都成立。
2. **红证走隔离工作树，不改产品代码**：§1 边界禁改产品码、并明令不许在现树临时回退；而「先红后绿」要的读数是「这条用例真在测东西」——隔离工作树检出修复前提交跑红，给出同一读数且现树零改。
   前提已实读：三条修复都在产品侧在位，故现树直接写必绿。回退基线（§5 逐条点名提交 + 红读数）：A1 = `panel-messages-settings.mjs` 的 `_pushIndexStatus` 先落序；A2 = `webview/settings-env.js` 的 `_pxBaseline` 改动门；A3 = `webview/settings-env.js` 的 `refillProxyControls` 同拍回填。
3. **登记归 §5**：`run.mjs` 两道门是一对（登记即须在盘、在盘即须登记），只能同一次落地。
4. **掩码面逐位断言，不做宽松断言**：设计档 §2.10 判据形 = 逐落点一条、漏一处即该处不成立；故三位各一条 `test()`，不用「任一位置出现 `****`」的合并断言。
5. **文件命名沿用本目录先例** `<日期>-vsc-<主题>.test.mjs`，主题取需求档已拟名（`settings-open-snapshots` / `settings-refill` / `settings-empty-no-write`），新增档不另造词。
6. **A 三条的用例标题以 `A1`/`A2`/`A3` 起头**：§5 与 §6 要逐条对位回退读数，编号即对位键。
7. **六档收口后存活**：六档留在 `thincoder-vscode/test/` 并在 `files.mjs` 在册——依据 §1 硬约束 3 与需求档 N-W8 行「档名在册」；同目录既有 5 档自 2026-10-19 起同样在册存活（先例）。`test/RTM.md` 的「用毕即删」管的是集成表成员资格，不是删除动作。

### 上抛项

- **[上抛·待裁] 需求面三处反向陈述（D1 落盘后）**：`docs/vsc/requirements/WEBVIEW.md` 的 F-W4 行末句「活卡面…现无专属用例」、同档 N-W5 行「登记在案的例外 1 条」、`docs/vsc/design/WEBVIEW.md` §10「登记例外 1 条」——D1 落盘后三处都成反向陈述。需求档两处归主 agent（语义面，我不改）；设计档 §10 那句我在 D1 落盘后同一轮删。
- **[上抛·待裁] `thincoder-vscode/test/files.mjs` 头注与在册形态不符**：该档头注写「单元档 = 批次本地件（名随批次档、住批次目录）」，而在册 5 档与本批 6 档都是 `test/<日期>-vsc-<主题>.test.mjs`（既非批次档名、也不住批次目录）。哪条是本仓现行约定须父侧裁——它是产品面文案，不在我的笔域。
- **[上抛·待裁] 集成行候选**：见「集成测试设计」末段（F-W10 的 VS Code 用户入口是否立一条集成故事）。
- **[上抛·知会] B 的驱动可行性已缩到一处未验**：四处落点与三个驱动入口已实读在位（见「机制设计 3」）。未验的一处 = 路径 1/2 在 `buildPanelCallbacks` 的回调闭包内，驱动它需要 `vscode` 模块桩能撑住 `panel-callbacks.mjs` 的顶层 import。若该桩撑不住、而必须抽函数或加导出才能驱动 ⇒ 那是改产品代码 ⇒ 停手上抛，B 四条转「不可写」并给出缺口读数。
- **[上抛·知会] A 的红证前提已实读成立**：三条修复确在产品侧（`settings-env.js` 的 `_pxBaseline` 门与 `refillProxyControls` · `settings-tools.js` 的 `updateWebsearchSettings` / `updateIndexStatus` · `panel-messages-settings.mjs` 的 `_pushIndexStatus` → `_pushSettingsLight` 序）。故 A1–A3 现树直接写必绿，「先红」只能由隔离工作树的修复前提交给出。
- **[上抛·知会] 需求档 F-W14 行的「`title` 三态」与代码不符**：该行写 `panel-turn-stages.mjs` 同函数 `turnSlot` 的 `title` 三态，而设计档 §4.2 与代码都是两形——`title ? { seed: slotStamp, title } : { seed: slotStamp }`。B4 按两形断言；需求档该计数归主 agent（计数与清单同改）。
- **[上抛·知会] 本批不落设计档章节**：判据面零改是前提；若评审认为「6 档落点表」属长期面，则改落 `docs/vsc/design/WEBVIEW.md` §4.2，我另行补写。
## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

本轮结论（11 条用例设计评审 · 对象 = §2 批次任务与设计）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2「机制设计 4」=「把该条对应的修复点临时改回修复前形态」；§1 父侧裁决 =「不许在工作树里临时回退」（改走 `git worktree` 隔离树）——同一取证法两处两说，且与「边界：不改产品代码」冲突 |
| 2 | 🔴 | 未处置 | §2「归属对位」称 `handleSetProviderProxy` 由 A2 第二半驱动；`docs/vsc/design/SETTINGS.md` §2.8 路径册 #1 =「代理整块（宿主删 `proxy` 键）」，同档 §2.16 ③ =「行写 = 同档 `handleSetProviderProxy`」——两个符号两条写面 |
| 3 | 🔴 | 未处置 | §2「验收对照」末行 =「`node test/run.mjs`」——全量跑写进验收门 |
| 4 | 🔴 | 未处置 | §2 无集成测试设计节，「勘察源」五条无 `test/RTM.md`；`test/RTM.md` 已有 VS Code 端故事 1（1-1 ∥ 1-2），且「单元测试档不进本表（内部回路、用毕即删）」 |
| 5 | 🟡 | 未处置 | A1 标题「三快照到达且渲真值」vs「机制设计 2」把 A1 归宿主层；「关键决策 1」的「混一档则前者的 DOM 全局污染后者断言」vs A2 一档含前端半 + 落盘半 |
| 6 | 🟡 | 未处置 | C3 标题 =「`restoreKeyRow`：已配置 ⇒ `s0.masked || "****"`」——断言实现表达式，非渲染可观察面；驱动入口未点名 |
| 7 | 🟡 | 未处置 | 「机制设计 2」宿主层只写「`vscode` 模块桩 + 临时工作目录」；A2 落盘半要断「`config.json` 逐字不变」，隔离缝（`docs/vsc/design/SETTINGS.md` §2.10 跨面夹具 = `_setConfigPathForTest`）未点名 |
| 8 | 🟡 | 未处置 | 「受影响文件与测试覆盖」=「分层结论：无文件跨层」——模块分层结论，非档面尺寸档位结论（实测 `thincoder-vscode/test/files.mjs` 8 行 / 5 项，+6 项不越档；六档皆新增） |
| 9 | 🟡 | 未处置 | `docs/vsc/requirements/WEBVIEW.md` F-W4 行「现无专属用例」∥ 同档 N-W5「登记在案的例外 1 条」∥ `docs/vsc/design/WEBVIEW.md` §10「登记例外 1 条」——D1 落地后三处成反向陈述，设计未列更新面 |
| 10 | 🟡 | 未处置 |「关键决策 5」档名形 vs `thincoder-vscode/test/files.mjs` 头注「单元档 = 批次本地件（名随批次档、住批次目录）」∥ `test/RTM.md`「用毕即删」——六档收口后是否存活（N-W8「在案」）未定 |
| 11 | 🔵 | 未处置 | D1 只覆盖三支接收面；F-W4 行的摘要 / 64K 加注 / 恢复卡对齐在射程外，宜明写以免读作 F-W4 全覆盖 |

计数：🔴 4 · 🟡 6 · 🔵 1

VERDICT: changes-required

### 轮次 2（评审子代理）

### 本轮结论（轮次 2 · 只验轮次 1 的 4🔴 6🟡 1🔵 处置）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | 「机制设计 4」现为「红证法（A1–A3 —— 走隔离工作树，现树零改）」+「现树一个字节不动（依据 §1 裁决「不许在工作树里临时回退」」——与 §1 裁决同法 |
| 2 | 🔴 | 已修 | 「归属对位」改四支分列：`saveProxySettingsFromPanel` 驱动经 `saveProxySettings` 消息（`docs/vsc/design/SETTINGS.md` §2.8 路径册 #1）、`handleSetProviderProxy` 驱动经 `setProviderProxy` 消息（同档 §2.16 ③）；两条消息在 `docs/vsc/design/WEBVIEW-PROTOCOL.md` §12 在册为「活」 |
| 3 | 🔴 | 已修 | 「验收对照」末行 = 「全量跑不入本批门」——`run.mjs` ∥ `npm test` 归父侧收口那一次跑，§5 只报逐档 `node --test` |
| 4 | 🔴 | 已修 | 新增节「集成测试设计（从 `test/RTM.md` 索引起）」：差量三行（断掉 / 冗余 / 缺 = 无）+「为什么本批不长出集成行」+ 一条候选上抛 |
| 5 | 🟡 | 已修 | 「A1 归前端层」与 A1 标题「三快照到达且渲真值」对齐；「关键决策 1」把 A2 两半同档明写作例外（「同一条判据的两端」） |
| 6 | 🟡 | 已修 | C3 标题改为「`#rowline-<name>` 内 `.key-status` 的渲染文本」，驱动入口 = `window._editKey(name)`，「不直调档内私有函数」 |
| 7 | 🟡 | 已修 | 「机制设计 2」宿主层点名 `_setConfigPathForTest`（「Test seam: override the config file location」）把 `config.json` 指到临时路径 |
| 8 | 🟡 | 已修 | 「档位结论」=「六档皆新增，无既有档跨档位、无拆档计划」——档面尺寸结论，不再是模块分层结论 |
| 9 | 🟡 | 接受 | 需求档两处与设计档 §10 的更新面已列出并指名作者与时点；§1 裁决「分工照设计席所报…现在不改」——非修有据 |
| 10 | 🟡 | 已修 | 「关键决策 7」=「六档收口后存活」并给依据（N-W8「档名在册」+ 在册先例）；`files.mjs` 头注冲突另列入上抛 |
| 11 | 🔵 | 已修 | 「不在本批」明写「D1 只断 `toolCall` ∥ `toolOutput` ∥ `toolResult` 三支接收面，**不是 F-W4 全覆盖**」 |
| N1 | 🟡 | 新 | 上抛仍标「[上抛·待裁]」，而 §1（11:56）已逐条裁决（「以在册形态为准，改头注」「本批不立，立账」）；「受影响文件」表 `files.mjs` 只写「改（+6 项登记）」，裁决要求的头注一笔未入影响面 |
| N2 | 🔵 | 新 | 「关键决策 7」把 `test/RTM.md`「用毕即删」读作「管的是集成表成员资格，不是删除动作」——读法与字面有张力，结论另有 §1 裁决与在册先例支撑 |

计数：本轮新增 🟡 1 · 🔵 1；未决 🔴 = 0。轮次 1 的 11 项全部收口（🔴 4 已修 · 🟡 5 已修 + 1 接受 · 🔵 1 已修）。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-11-06 12:41 补记）

| 时点 | 用户原话 | 批的什么 |
|---|---|---|
| 2026-11-06 11:44 | 「那都复启吧」 | 复启本批（`#2098` ∥ `#2095` 合并） |
| 2026-11-06 12:33 | 「都自动跑完吧」 | 整批令：设计 → 评审 → 实施 → 收口全链自动跑完 |
| 2026-11-06 12:38 | （准红证换法） | 父侧裁决：隔离工作树在 `37cb1b34` 上跑不通，准改用模块源码覆写 |

**批的是范围与跑法，不是内容对**——内容由设计评审 `#139`/`#143`（轮 2 pass）与代码复核 `#155`（pass，🔴 0）判。

## §5 实施记录（eng-coder）
**状态行**：实施完成（6 档 11 条全绿；A1–A3 红证读数在册；红证换法与四条设计漂移待父侧裁）



### 交付摘要（11 条 / 6 档 / 产品码零改）

| # | 用例档 | 状态 | 驱动面（实读） |
|---|---|---|---|
| A1 | `thincoder-vscode/test/2026-11-06-vsc-settings-open-snapshots.test.mjs` | ✅ 落盘 · 绿 · 红证成立 | 真 `openSettings()` + 真 `handleGetAgentSettings`（真 ChatPanel 两条推送方法）→ 真分发器 `initMessageLoop` |
| A2 | `thincoder-vscode/test/2026-11-06-vsc-settings-empty-no-write.test.mjs` | ✅ 落盘 · 绿 · 红证成立 | 前端改值门 + 真 `handleSaveProxySettings` ∥ 真 `handleSetProviderProxy` |
| A3 | `thincoder-vscode/test/2026-11-06-vsc-settings-refill.test.mjs` | ✅ 落盘 · 绿 · 红证成立（四面各一条读数） | 真 `openSettings()` + 三拍推送 |
| B1–B4 | `thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` | ✅ 落盘 · 绿 | `buildPanelCallbacks` 的 `onComplete` ∥ `onDistilled` · `runTurnLoop`（中止支）· `finalizeTurn`（title 两形） |
| C1–C3 | `thincoder-vscode/test/2026-11-06-vsc-settings-mask-face.test.mjs` | ✅ 落盘 · 绿 | 真分发器投 `websearchSettings` ∥ `indexStatus` ∥ `providerStatus`；C3 经 `window._editKey(name)` → 取消 |
| D1 | `thincoder-vscode/test/2026-11-06-vsc-live-tool-card.test.mjs` | ✅ 落盘 · 绿 | 真 `initMessageLoop` 的 `toolCall` ∥ `toolOutput` ∥ `toolResult` 三支 |

驱动面共同点：`vscode` 宿主模块用 `module.registerHooks` 桩掉（先例 = 仓根 `test/integration/tester-role.test.mjs`）；配置 ∥ 会话目录指临时目录（`_setConfigPathForTest` ∥ `_setSessionsDirForTest`）；shell 探测走 `_setShellDetectForTest`。**未验的那一处已验**：`panel-callbacks.mjs` 顶层 import 撑得住该桩（四条 B 全绿），故无需抽函数 ∥ 加导出，未触产品码。

### 红证读数（A1–A3「修复前必红」）

判据 = 需求档 N-W8 行的依据「三条**先红后绿**用例在案且修复前必红」。

**方法（与 §1 裁决的隔离工作树不同，理由与读数一并记）**：现树零改，用 `module.registerHooks` 的 `load` 覆写把**该条修复点换回修复前原文**后重跑该档。

换法理由（可核）：`git show 37cb1b34:thincoder-vscode/webview/settings-env.js` 在盘、`thincoder-core/config-io.mjs` ∥ `thincoder-core/shell-candidates.mjs` 在该提交**不在盘**——本批夹具的两条隔离缝与记忆面缝都由它们提供，检出该提交跑出的是模块解析噪声，不是行为红（§1 判据① 禁「红来自断言写错 ∕ 夹具搭错」）。

| 条目 | 回退点（换回修复前原文） | 命令 | 红读数（哪句断言 ∥ 报什么） |
|---|---|---|---|
| A1 | `panel-messages-settings.mjs` 的 `handleGetAgentSettings` → 修复前 case 体（只回 `agentSettings`，出处 `37cb1b34:thincoder-vscode/src/extension/panel-messages.mjs` 的 case “getAgentSettings”） | `node .thincoder/tmp/red-proof.mjs a1` | 「打开拍回批须含 indexStatus … **实得 [agentSettings]**」——三快照整批缺席 |
| A2 | `webview/settings-env.js` 的 `bindEnvControls` → 修复前 `autoSaveProxy`（每个控件 change 整块发值） | `node .thincoder/tmp/red-proof.mjs a2` | 「未编辑过的控件 ⇒ 零发值」——实得 `{ settings: { uri: '', web: true }, type: 'saveProxySettings' }` |
| A3 ①②③ | `settings-env.js` 的 `updateProxySettings` ∥ `updateShellCandidates`、`settings-tools.js` 的 `updateWebsearchSettings` → 只存 SS 不回填 | `node .thincoder/tmp/red-proof.mjs a3` | 「① updateProxySettings ⇒ 活控件回填新值」——`'http://old-proxy:1080'` ≠ `'http://new-proxy:8080'` |
| A3 ④ | `settings-tools.js` 的 `renderIndexStatus` → 去掉首行 `#row-embed` 同拍重绘（D-W5 扩面） | `node .thincoder/tmp/red-proof.mjs a3d` | 「④ updateIndexStatus ⇒ #row-embed 同拍重绘」——`'****'` ≠ `'—'` |

取证器 `red-proof.mjs` 落 gitignored `.thincoder/tmp/`（一次性件，未入仓）；上面四条「回退点」列即重建它的全部输入。取证完成后现树零改（`git status` 只列本批 7 档）。

### 绿读数（现树）

- `node --test test/2026-11-06-vsc-settings-open-snapshots.test.mjs test/2026-11-06-vsc-settings-empty-no-write.test.mjs test/2026-11-06-vsc-settings-refill.test.mjs test/2026-11-06-vsc-turn-save-slots.test.mjs test/2026-11-06-vsc-settings-mask-face.test.mjs test/2026-11-06-vsc-live-tool-card.test.mjs`（cwd = `thincoder-vscode`）⇒ **tests 11 · pass 11 · fail 0**，连跑两次同结果。
- `npm run lint`（`scripts/check-syntax.mjs`）⇒ `check-syntax: 151 JS files OK`。
- 登记配对（静态）：`test/files.mjs` 清单 11 项；`test/` 盘上 `*.test.mjs` 11 档；两侧差集皆空——即 `run.mjs` 两道反查门判的那一对。
- 产品码零改：`git status --porcelain -- thincoder-vscode` 只列 6 新档 + `test/files.mjs`；`git diff -- thincoder-vscode/src thincoder-vscode/webview` 为 0 行。

**全量跑不入本批门**（§2 验收对照末行）：`node test/run.mjs` ∥ `npm test` 归父侧收口那一次跑。

### 登记面（N-W5 ∥ N-W8「档名在册」）

`test/files.mjs` 追加 6 项（5 → 11）；同轮按 §1 11:56 裁决改头注：旧约定句改为在册实形 `test/<日期>-vsc-<主题>.test.mjs`，并把 `run.mjs` 两道反查门的配对关系写清。判据「全文不再出现『住批次目录』」已核（0 命中）。

### 设计漂移（归设计席 ∥ 父侧，本席不改他人段与设计档）

1. **§2「机制设计 2」的 A1 层归属**：原文「A1 归前端层」+「宿主层没有可断言的落盘面」。实交 A1 = 宿主半 + 前端半——缺陷面（`handleGetAgentSettings` 的回批）只有宿主半能断，只测前端半则修复前必红取不出来（前端 `requestAgentSettingsThen` 在修复前就已在位）。
2. **§2「关键决策 1」的「不混一层」**：A1 一档内两半并存。实测无污染（happy-dom 与 `vscode` 桩同进程共存，A1 全绿），但那条理由句需按实测收正。
3. **§2「关键决策 2」红证法**：见上「方法」与取证器四条回退点。
4. **§2「受影响文件与测试覆盖」表的 `files.mjs` 行**：只写「改（+6 项登记）」，实交还改了头注（§1 11:56 裁决要求同轮改）。

### 审计与复核轮次（终态：clean，一条待裁）

- **脱轨审计（explore，只读）1 轮**：结论 PARTIAL ×2（§5 空缺 ∥ A3 ④ 面红证缺失）+ SILENT-SIMPLIFICATION ×1（红证换法）+ 无出列改动。处置：§5 即本文；④ 面单独取证见上表第四行；换法在本文与三档头注写明。
- **代码复核（advisor，type=code）1 轮**：changes-required（🟡 7 · 🔵 4）。逐条处置：
  - 🟡「红/绿读数无出处」⇒ 本文补全（A1/A2/A3 红读数 + 绿读数 + 命令）。
  - 🟡「A3 未聚焦控件断言空转」⇒ 该拍推送改 `web: true` 并断 `checked === true`（推反值才分得出回填与跳过）。
  - 🟡「A1 `display:flex` 断言空转」⇒ 删该断言，改断「建面后 `#settings-body` 非空」（打开当刻它为空）。
  - 🟡「C3 建面径未断 `glm`」⇒ 处置为**不改**：`glm`（已配置 + `masked` 空串）是夹具造态、现网不可达（宿主对已配置行恒下发 `MASKED`），该造态只为跑到 F-W17 明写的 `s0.masked || "****"` 兑底支；档头已注明，不为不可达态加断言。
  - 🟡「红证换法」⇒ 见「方法」与上抛项。
  - 🟡「A1 分层与设计相反」⇒ 见「设计漂移 1/2」。
  - 🟡「B 的选定前提由被测函数自身写入」⇒ 载荷形与 `panel-messages.mjs` `selectModel` 径逐字同（该行现文：`panel._saveLines(data.history ?? [], data.contextHistory ?? [], { activeProvider: msg.provider, activeModel: msg.model }, slot)`）；档头与本文均写明边界 = 四条证明「落盘点不夺权」，不覆盖「selectModel 消息 → 写槽」那一径。
  - 🔵 ×4 ⇒ B3 改断「本回合用户输入进了槽」（条数随核收尾行浮动，原 `=== 1` 偶红已修）；D1 摘要断言加注（词面来自核分流件，非 i18n）；A1 索引状态改断单态词条；A1 `after()` 补 `setMemoryFaceGate(null)`。
- **未跑第 2 轮复核（收敛验证）**：预算取舍，故写在此处而非省略——上表每条处置逐项可复核，测试读数已复跑两次。

### 上抛项

- **[上抛·待裁] 红证换法须父侧裁决**：§1 裁决写隔离工作树、§2 关键决策 2 同；实交用模块源码覆写（理由与读数已给）。若父侧要原法，需先在修复前提交上补夹具缝或改夹具——那是另一轮的活。
- **[上抛·知会] 需求面三处反向陈述仍待父侧同一轮改**：`docs/vsc/requirements/WEBVIEW.md` 的 F-W4 行末句 ∥ 同档 N-W5 行、`docs/vsc/design/WEBVIEW.md` §10 的「登记例外 1 条」——D1 已落盘，三句现成反向陈述。
- **[上抛·知会] F-W10 集成故事（`#2095` 候选）**：按 §1 11:56 裁决本批不立、立账；本席未动台账（写面归主 agent）。

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-11-06 12:42）

**交付了什么**：6 个单元用例档 / **11 条 `test()`**——A1–A3（F-W8 ∥ F-W10 ∥ F-W9 先红后绿）· B1–B4（F-W14 回合尾四处落盘）· C1–C3（F-W17 三掩码位）· D1（F-W4 活卡接收面）。产品代码零改；`thincoder-vscode/test/files.mjs` 登记 5 → **11 项**，头注同轮改成在册实形。

**读数**（父侧采信实施席与复核席的实跑）：

| 面 | 读数 |
|---|---|
| `node --test` 六档 | tests 11 · pass 11 · fail 0（连跑两次同结果） |
| `npm run lint` | `check-syntax: 151 JS files OK` |
| 清单 ↔ 盘上 | 11 项 ⟷ 11 档，双向差集为空 |
| 红读数 A1 | 三快照整批缺席 |
| 红读数 A2 | 实得 `{ settings: { uri: "", web: true }, type: "saveProxySettings" }` |
| 红读数 A3 ①②③ | `'http://old-proxy:1080' !== 'http://new-proxy:8080'` |
| 红读数 A3 ④ | `'****' !== '—'` |

**评审**：设计 `#139` changes-required（4🔴 6🟡 1🔵）→ `#143` 轮 2 **pass**；代码 `#155` **pass**（🔴 0，4🟡 全标「可选不阻塞」，3🔵）。

**§2 ↔ §5 对账（差异照实记）**：实施席报四处设计漂移，四条都是实施后的事实、§2 未回改——本批以 §5 与代码为准，§2 保留作决策记录：

| # | 漂移 |
|---|---|
| 1 | §2「A1 归前端层」与实交两半相反 |
| 2 | §2「不混一层」与 A1 一档两半并存 |
| 3 | §2 红证法（隔离工作树）已按父侧裁决换成模块覆写 |
| 4 | 受影响文件表 `files.mjs` 行只写「+6 项登记」，实交还改了头注 |

**未闭合（照实入账）**：

1. **需求档 N-W5 我一度写成「例外 0 条」，已由父侧改回 1 条**——F-W4 的「卡体超 64K 截断加注」∥「末行摘要 ≤100」仍无用例（代码复核 `#155` 第 2 条指出）。消解路径与到期条件已在需求档在位。
2. **F-W14 的按钮面未驱动**（`#155` 第 1 条）：B1–B4 只证「落盘点不夺权」，`selectModel` 消息 → 写槽那一径没用例——**该径回归时四条仍绿**。已立账。
3. **5 档各存一份 `vscode` 桩**（`#155` 第 3 条）：产品新增一处 vscode API 要改 5 处，改漏即红噪声。已立账。
4. **`AGENTS.md` 的 Testing 段仍写「清单现为空」**（`#155` 第 4 条）：文档面滞后，已立账。
5. **六档用例档的存续**：按 §2「关键决策 7」六档常驻并在册（依据 = N-W8「档名在册」+ 同目录既有 5 档先例）。**本批收口不删除**——这不是「单测档免删」，而是六档承担的正是 N-W8 要求的「在案」。

**暂缓批复核**：无。**docs 交付门**：改动档 `DOC-CHECK GATE: PASS`。

**⇒ 这批最该记住的一句**：**11 条用例全部绿色，而红证是另外做出来的。**如果没有那四条红读数，「全绿」只说明用例不报错——**说明不了它在测东西**。
