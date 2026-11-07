# 2026-11-06 · pointer-naming-sweep
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-06 · 来源 = 用户 2026-11-06 04:09「第三项也自动跑完吧」；清单来源 = 2026-11-05-line-refs-block-on-write 批档 §5 的「判断半」两张表（WEBVIEW 14 行 + #108 的 45 处）。
> 台账 = #2094（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-06
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批要做什么（父侧 · 2026-11-06 04:10）

**对象**：一批「只能指到档名一级」的指针——它们**本来能指到符号名，但写成了一档了之**。

**清单来源**（不是本批自造）：`docs/batches/2026-11-05-line-refs-block-on-write.md` §5 的「判断半」两张表——WEBVIEW 那 14 行，与 `#108` 的 45 处。**该批已收口冻结，清单仍可读**。

**已定口径（本席当场改口的理由在此，别按旧说法做）**：

先前本席判「这批只能我自己做，因为要判断」。**站了半小时看清形状后改口**：那 60 处要补的名字（`showLoadOlderIndicator` ∥ `applyPin` ∥ `updateProxySettings` 一族）**全都能从源码读出**，判据是「那处代码里那个函数叫什么」——**这是查证，不是判断**。

**真正需要判断的只有一类**：源码里那段**没有名字**（匿名回调 ∥ 内联表达式）——那种才该写「此处无符号，只能到档名一级」。

**三条硬约束（派单与实施都照此）**：

1. **读得到名字就写名字**——逐处实读源码，**不许从上下文猜、不许照邻近处的名字套**。
2. **读不到就明说「此处无符号，只能到档名一级」**——**不许编符号，也不许假装补了**。
3. **交回一张表**：哪几处有名、哪几处确实无名。**那个「无名数」才是这批的真实精度上限**——我要的不是「60 处都补上了」。

**边界**：只改指针的写法（档名一级 → 符号名），不改被指的那段代码，不改文档论断。源码注释里的 22 处**不动**（用户 2026-11-05「不扩」）。

### 订正：两个源头数（2026-11-06 04:15 · 设计席实点，父侧采纳）

| 项 | 本席原写 | 实数 | 差 |
|---|---|---|---|
| WEBVIEW 清单行数 | 14 行 | **15 行**（含 P2-6 ∥ P2-7 ∥ P2-3 三个登记条） | 差一 |
| `#108` 处数 | 45 处 | **43 处**（6+6+5+3+2+3+1+1+1+1+2+12） | 差二 |

**⇒ 这两个数是本席从 `docs/batches/2026-11-05-line-refs-block-on-write.md` §5 抄来的二手数，没回头逐条加。**设计席逐条点了一遍，对不上。

**已定口径**：**以设计席的逐条实点为据（15 / 43）**，不以本席转抄的（14 / 45）为据。此后凡涉处数，引用方一律回源重数。

### 顺序形态（自陈：这是推断，不是授权）

评审轮 1 指出本段自相矛盾：上句引 `#2089` 授权里那句「**下批按 D1 走，不援引本例外**」，下句就写「本批据此沿用该形态」。

**成立。本席改正，如实写清**：

| 项 | 事实 |
|---|---|
| 用户逐字 | **只有**「第三项也自动跑完吧。」（2026-11-06 04:09） |
| 用户是否就本批的**落笔顺序**授过权 | **没有。**「自动跑完」说的是跑完，没说「可以先落盘后批准」 |
| 本批为何仍落了盘 | **本席的推断**：同一晚同一组事，用户 03:14 刚以「B」接受过同一形态 ⇒ 推断他会接受同样的跑法 |
| 这条推断的性质 | **不是授权。**把推断写成「沿用授权」就是给自行决定找背书 |

**处置**：用户若不接受此形态，本批按 `git` 逐 hunk 撤回 `docs/vsc/requirements/WEBVIEW.md` 的 17 处换写，走完评审 → 批准 → 再落；撤回范围与 `#2089` 那次同法（逐 hunk 判归属，不整档丢）。

**⇒ 一句话**：**这批是先落了、后补说的，且补说时借了一句不该借的话。记录在此，不粉饰。**

### 父侧处置：修正轮三件上抛（2026-11-06 04:24）

| 项 | 裁决 |
|---|---|
| **G-5 ①** 档面 MCP 载体指错档（写 `settings-tools.js`，实件在 `settings-mcp.js`） | **已改**（父侧笔域 = 需求档）：改指 `thincoder-vscode/webview/settings-mcp.js` 的生成位 `mcp-del-btn` ∥ 绑定位 `_confirmSecretDelete` |
| **G-5 ②** 档面 F-W14 缺符号名 | **已改**：补 `panel-callbacks.mjs` 的 `_saveLines`（`turnSlot` ∥ `distillSlot` 两处） |
| **G-6** N-W5 到期件（F-W4 活卡面补测）已被本批触发 | **改期并落账，不在本批补**：本批边界 = 只改指针写法，补测是 `thincoder-vscode/test/` 的产品面改动。**立台账 `#2095`**（技术待办 · 归批 · 复启条件 = VSC 端测试面下一次开批，或 WEBVIEW 面再次被触碰，以先到者为准） |

**为什么改期不算「留着不动」**：到期件的两条出路只有「补」或「带新到期条件改期」。**这次是后者，而且新条件落在台账上、带复启句**——下次触碰时它是**一条会响的账**，不是文档里一句没人读的备注。

### 父侧裁决：修正轮 2 的三件上抛（2026-11-06 04:47）

| 项 | 裁决 |
|---|---|
| **N-W5 期限句在档面未同步** | **已改**（父侧笔域 = 需求档）：原句后补「**已触发一次并于 2026-11-06 改期**：触碰批 = 指针补名扫（该批边界只改指认形，不补测），新到期条件 = VSC 端测试面下一次开批，或 WEBVIEW 面再次被触碰，以先到者为准（台账在册）」。⇒ 档面读者不再看到一条已触发、无人处置的到期条件 |
| **G-7 ①** `seed: slotStamp` 的 `_saveLines` 全树 **4 处**，档面 F-W14 只写 2 处 | **停：这是范围变化，不自行扩**。理由见下 |
| **G-7 ②** `****` 掩码位全树 **3 处**，档面 F-W17 只数 2 处 | **停：同上** |

**为什么 G-7 两笔停住不办**：

它们问的**不是「这里叫什么名字」，是「这条要求该覆盖多大范围」**。前者是查证（本批一直在做），**后者是需求内容**——把「两处」改成「四处」「三处」，等于把一条已批准的要求悄悄扩大。

**⇒ 今晚已经有一次教训**：设计先落盘、我拿「成本」替用户开了例外。同一种动作换个壳就是这次：**替用户扩一条要求的射程。**

**⇒ 处置**：两笔**原样留在此处与 §9**，等你一句话——**扩（写明四处 ∥ 三处的处置）还是维持两处（写明理由与漏覆盖的风险）**。**我不替你选。**

**另记**：`#133` 自检发现 **A5 的原判法不成立**（该档批前基线不在 git，`git diff` 读到的是两批合成）⇒ 改按「逐笔给出改前 ∥ 改后 自陈」，并注明机判不可用。**这印证了评审轮次 2 第 4 条**——那条我当初认了「有据不改」，认错了；实施席随后也报了同一个读数。**三个席位三份读数，最终落回「机判不可用」。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（第 4 轮修订：按 §5 实施读数与 §3 轮次 2 第 13–15 条回写记录态——106 格 / 42 档 · 未定位 0 · 15 行全落；A5 判法改按可用读数（该档批前基线不在 git）；新增 G-7 两处覆盖面待裁。只动指针形与记录态，未改要求本体）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 批次任务与设计（eng-designer · 2026-11-06）

#### 1. 本批条目（覆盖）

| # | 条目 | 载体 | 本批写域 |
|---|---|---|---|
| C1 | `webview 界面面` 需求档内「只能指到档名一级」的指认处，逐处补齐符号名 | `docs/vsc/requirements/WEBVIEW.md` | 本 spawn（已声明） |
| C2 | `docs/core/requirements` 侧同族 43 处（§1 记 45 处，见 G-2） | 十二档 | 另一 spawn，本席零触 |

**判据一句话**（承 §1 已定口径）：那处代码里那个函数 / 常量**叫什么**——**实读源码即是查证**；源码那段**没有名字**（匿名回调 ∥ 内联表达式 ∥ CSS 规则）时，只写「此处无符号」并保留档名一级。

#### 2. 设计（改法：一处一读，三形定指）

每处的换形只从三形里取，逐处实读源码后落笔：

1. **符号名**——`export function` / `const` / 状态槽键名，逐处 `grep` 在位才写。
2. **逐字引文**——该处是 CSS 规则 / 字面串（无符号）时，引规则或串的原文承接（与「档名 + 符号名」同级可解析）。
3. **「此处无符号」标记**——三者都取不到时显式写标记，**不编名字**（§1 硬约束 2）。

**行号漂移的处置**：§1 清单里的旧行号只作**定位线索**，不作判据；实测漂移的（`state.js` 两个槽位现位于 `_nextIdx` / `_hasOlder` 邻域）**按符号名重定**，并在本段表格记「线索失效 · 按符号重定」。

#### 3. 受影响文件

| 档 | 改动 | 谁 |
|---|---|---|
| `docs/vsc/requirements/WEBVIEW.md` | 指认形（档名一级 ⇒ 符号名 / 逐字引文 / 无符号标记） | 本 spawn |
| `docs/core/requirements/` 侧十二档 | 同上（43 处） | 另一 spawn |

**跨档**：无。

**测试面**：本笔为纯文档指认形改写，无代码路径 ⇒ 无单测；集成差量自 `test/RTM.md` 起笔（见 3.2）。

#### 3.1 设计前置：最近先例与勘察证据

- **最近先例**：同族两处 —— 前批 `docs/batches/2026-11-05-line-refs-block-on-write.md` §5 的两张「判断半」表（本批清单即出自此，稠密档面 → 符号名的换写形态已在那里定形）；同晚 `#2089` 的顺序形态。**对齐**：换写只动指认形、只写实读到的符号名、读不到的显式留档名一级。**偏离**：无。
- **勘察证据**：已查仓内 —— 设计侧三档（`docs/vsc/design/WEBVIEW.md` · `docs/vsc/design/WEBVIEW-PROTOCOL.md` · `docs/vsc/design/WEBVIEW-INPUT.md`）与逐处源码实件；**公开源**（项目清单声明的外部仓）本批零相关 —— 改动面只是仓内需求档的证据段指认形，外部源码不参与判定。记「查过，无相关」，不是「没查」。

#### 3.2 集成差量（读 `test/RTM.md` 后作答）

现状：VS Code 端节 1 个故事（「归档块重开 ∥ reload 后，子代理行还是子代理行」）2 行（1-1 ∥ 1-2）；Desktop 端节尚无用例。

- **断掉的既有行**：0 —— 本批不改变任何业务可观察结果，没有哪一行断言的东西变了。
- **冗余行**：0。
- **缺失行**：0 —— 集成用例只有两个入题（产品真需要的业务场景 / 生产真出过的问题），本批两者都不成立：它只改需求档证据段的写法。
- **窗宽**：VS Code 端 2 / 50–100，本批零增。

#### 4. 验收对照（逐条机判）

| # | 判据 | 判法 |
|---|---|---|
| A1 | 每处新写的符号名在所指源档命中 ≥1 | 逐名在**所指源档**实读其声明行（`export function` ∥ `const` ∥ 状态槽键名），读数入第 7 节 |
| A2 | 编造符号 0 处 | 逐名实读声明行在位。**零命中只说明这个名字不写，不推出「该处无符号」**——「此处无符号」须实读该段确认无名字后才写 |
| A3 | 计数与列表同变（D3） | 表内行态计数 = 第 7 节行数（现 15 = 15）；未定位处数 = 第 8 节终态声明的处数（现 = 0）——该节「原登记」两行是**已落定**的复核指针，其处数（2 + 1）不计入未定位 |
| A4 | 交付门 | `doc_check` 的 gate 态对 `docs/vsc/requirements/WEBVIEW.md` ⇒ 首行 `PASS` |
| A5 | 要求本体零改 | 逐笔改动表（改前 ∥ 改后）在案，且每笔的字面差只落在 `证据 =` 段 ∥ 路径指认形 ∥ 表体分隔符：判定句与范围边界列的**句子**零改 |
| A6 | 逐名读数留档 | 第 7 节的（源档, 名字）格逐格计数，可复算——106 格 / 42 档，格数与 7.1 的块逐行同数 |

**A5 判法的可用面（本轮改按实测）**：`git diff` 对 HEAD **不可用于归属**——该档的批前基线不在 git（前批与本批的改动同为未提交，`git diff` 读到的是两批合成；实读 only-in-current 36 行 ∥ only-in-HEAD 36 行，其中含前批的整段换形）。可执行的判法只有一种：**改动方逐笔给出改前 ∥ 改后**，据此判归属；本批的读数在 §5 §1 的六笔表里。机判不可用 ⇒ 如实记作自陈，不冒充读数。原「`git rev-parse` = `true` ⇒ 判法可执行」一句不成立：仓在盘只说明 git 可用，不说明有基线可比。

#### 5. 关键决策

- **K1 · 旧行号不作判据**：清单里的行号是 2026-11-05 的定位线索，代码已漂；判据是符号在位。理由：拿过期行号当「那处就是它」会把指认钉在错的地方。
- **K2 · CSS / 字面串不编符号**：`thincoder-vscode/webview/chat.css` 的离屏跳过是一对声明（`content-visibility` ∥ `contain-intrinsic-size`），无符号可写 ⇒ 引原文，不造选择器名。
- **K3 · 只动指认形，不动要求**：遗留的语义疑点一律上抛，不顺手修。
- **K4 · 线索失效 ≠ 未定位**：旧座标指向的那段若不是句子里说的那件事，判据 = 句子本身 + 实读该段，取下真正对应的符号。F-W8 的第二处旧座标实读到的是测试连接 case，与「打开拍到达」无对应 ⇒ 记线索失效，不计作未定位。依据 `thincoder-vscode/src/extension/panel-messages-settings.mjs`「打开拍回批——既有 `getAgentSettings` 拉取的回批固定序」——档面指的那一处，源码注释自己点名 F-W8。
- **K5 · 要求档的指认错，报不改**：档面把一处指认指到了错的档（F-W17 的 MCP 行 ✕ 载体）属**要求句一处**，本席笔域不覆盖 ⇒ 交主 agent 处置（G-5），不在本段自行改句。理由：改要求句等于我替用户改了要求。

#### 6. 上抛项

G-1 – G-7 的终态见第 9 节：G-1 ∥ G-2 ∥ G-4 ∥ G-5 已了结，G-3 是读数，G-6 已裁（改期落账），G-7 两处待主 agent。本段无本席待处置项。

#### 7. 本席实读结果（`docs/vsc/requirements/WEBVIEW.md` · 逐处）

**量法**：每处的旧行号只作线索（K1）；按线索打开源档实读，取该段**实际有名字的那个符号**。落笔后逐名回扫，按「（源档, 名字）」逐格计数——**106 格（指认格 103 + 删除断言格 3）· 源档 42（41 档带名字格 + 1 档「档在盘」）· 指认格命中 103 · 零命中 0**，逐格读数见 7.1。三处删除断言格（`saveCustomProvider` ∥ `saveEmbeddingConfig` ∥ `_delKey`）零命中即档面「已删」断言本身，不是编造的反证。

| # | 需求位 | 补成的指认（源档 → 符号） | 状态 |
|---|---|---|---|
| 1 | F-W2 | `thincoder-vscode/webview/scroll.js` → `updateScrollBottomVisibility` · `thincoder-render-core/subblocks/block.mjs` 两处 → `initBlockFollow` ∥ `maybeScrollBlock` · `thincoder-vscode/webview/streaming.js` → `createStreamRenderer` 的 `frameEnd` | 补齐 |
| 2 | F-W3 | `history.js` → `applyHistoryPage` · `state.js` 两槽 → `_nextIdx` ∥ `_hasOlder` · `ui.js` → `trimOldMessages` | 补齐 |
| 3 | F-W4 | `ui.js` → `addTool` ∥ `finishTool` · `chat-messages.js` → `initMessageLoop` 的 `toolCall` ∥ `toolOutput` ∥ `toolResult` · `lib.mjs` → `MAX_TOOL_OUTPUT` ∥ `capText` | 补齐 |
| 4 | F-W5 | `input.js` → `composerState` ∥ `createComposerPanel` · `send.js` → `send` | 补齐 |
| 5 | F-W8 | 消费面 → `updateProxySettings`（同拍 `refillProxyControls`）· `updateWebsearchSettings` ∥ `updateIndexStatus`；打开拍 → `openSettings` ∥ `requestAgentSettingsThen` ∥ `buildSettings`；宿主 → `handleGetAgentSettings`（两拍均 await：`_pushIndexStatus` 先、`_pushSettingsLight` 后） | 补齐 · 档面已落 · 旧座标第二处属线索失效（实读为测试连接 case，无「打开拍」对应，见 K4） |
| 6 | F-W9 | `settings-tools.js` → `updateIndexStatus` → 同拍 `renderIndexStatus` | 补齐 · 档面已落 |
| 7 | F-W11 | `settings-env.js` → `envCardHtml` 渲染 ∥ `seedBaselines` 基线 | 补齐 · 档面已落 |
| 8 | F-W17 | 两处密钥入口 → `websearchRowHtml` ∥ `embedRowHtml`（动作 `KEY_ROW_ACTIONS` · 绑定 `bindToolsControls`）· provider 卡 → `providersCardHtml` · **MCP 行 ✕ → `thincoder-vscode/webview/settings-mcp.js` 的 `mcp-del-btn`（生成位）∥ `_confirmSecretDelete`（绑定位）** · 配置档 → `thincoder-vscode/src/config-mcp.mjs` | 补齐 · MCP 行载体已由父侧改指 `thincoder-vscode/webview/settings-mcp.js`（`mcp-del-btn` ∥ `_confirmSecretDelete`，G-5 ① 了结）· 掩码位两处已落名 `websearchRowHtml`（`#status-websearch`）∥ `embedRowHtml`（`#status-embed`）（U-1 已消）· 余 `config-mcp.mjs` 一处留档名一级：该段无单一保存符号可指（`addMcpServer` ∥ `updateMcpServer` 二取一属要求句判断，本席不自裁） |
| 9 | F-W14 | `thincoder-vscode/src/extension/panel-callbacks.mjs` → `_saveLines` 两处（`turnSlot` ∥ `distillSlot`），两笔均携 `seed: slotStamp` | 补齐 · 档面已落（`_saveLines` 两处 = `turnSlot` ∥ `distillSlot`，均携 `seed: slotStamp`）——G-5 ② 了结 |
| 10 | F-W15 | `thincoder-desktop/src/main/session-slots.mjs` → `pageHistory`（`stripAtRefs`） | 补齐 |
| 11 | F-W16 | `thincoder-vscode/src/tools/shell.mjs` → `bashTool` | 补齐 |
| 12 | P2-6 | `ui.js` → `trimOldMessages` 裁窗族 | 补齐 |
| 13 | P2-7 | `thincoder-vscode/src/extension/panel-index.mjs` → `buildIndex` 的 `onProgress`（`scan` ∥ `index` ∥ `done`） | 补齐 |
| 14 | P2-3（默认值物化） | `settings-agent.js` 三处 → `agentCardHtml` ∥ `consultAdvisorCardHtml` ∥ `bindAgentControls` | 补齐 |
| 15 | N-W2 | `ui.js` → `trimOldMessages`（`MAX_MESSAGE_BLOCKS`）· `lib.mjs` → `MAX_TOOL_OUTPUT` ∥ `capText` · `chat.css` → 逐字声明（**无符号**，见 K2） | 补齐 |

#### 7.1 逐名读数（复算入口）

量法：对每个「(源档, 名字)」格，读该源档全文并按名字切分计数（`fs.readFileSync` + `split(name).length - 1`）。**106 格 = 指认格 103 + 删除断言格 3**，源档 42（41 档带名字格 + 1 档「档在盘」）；指认格**命中 103 · 零命中 0**。格集取自档面**已写出的指认处**（不是从清单反推），逐格如下：

```text
thincoder-vscode/webview/scroll.js             updateScrollBottomVisibility=1
thincoder-render-core/scroll.mjs               NEAR_BOTTOM_PX=3  applyPin=2  createPinWatch=2
thincoder-vscode/webview/ui.js                 scrollDown=4  maybeScrollDown=9  maybeScrollActivity=2  initScrollFollow=2
                                               trimOldMessages=3  addTool=1  finishTool=5  MAX_MESSAGE_BLOCKS=2
thincoder-render-core/subblocks/block.mjs      initBlockFollow=2  maybeScrollBlock=2  renderSubagentChunk=2
thincoder-vscode/webview/streaming.js          createStreamRenderer=3  frameEnd=1  finish=4  _turnStart=1
thincoder-vscode/webview/history.js            applyHistoryPage=1  showLoadOlderIndicator=2  loadOlder=1
thincoder-vscode/webview/state.js              _nextIdx=1  _hasOlder=2
thincoder-core/history-window.mjs              HISTORY_PAGE_SIZE=2
thincoder-vscode/webview/chat-messages.js      initMessageLoop=2  toolCall=2  toolOutput=2  toolResult=2  providerError=1  _turnFrame=2
thincoder-render-core/lib.mjs                  MAX_TOOL_OUTPUT=2  capText=1  isToolFailure=2
thincoder-render-core/flow/tool-card.mjs       finishToolCard=3
thincoder-render-core/composer/panel.mjs       send=32
thincoder-render-core/composer/model-menu.mjs  removeProvider=3
thincoder-render-core/composer/atmenu.mjs      _atActive=6
thincoder-vscode/webview/input.js              composerState=2  createComposerPanel=3
thincoder-vscode/webview/send.js               send=4
thincoder-vscode/webview/chat-status.js        showDigestStatus=4
thincoder-vscode/webview/settings-env.js       updateProxySettings=1  refillProxyControls=2  updateShellCandidates=1
                                               envCardHtml=2  seedBaselines=2  _pxBaseline=7
thincoder-vscode/webview/settings-tools.js     updateWebsearchSettings=2  updateIndexStatus=1  renderIndexStatus=4
                                               websearchRowHtml=6  embedRowHtml=6  KEY_ROW_ACTIONS=2  bindToolsControls=1
                                               status-websearch=1  status-embed=1
thincoder-vscode/webview/settings.js           openSettings=5  initSettings=1  requestAgentSettingsThen=2  buildSettings=5
                                               _lastFailure=7  showSettingsError=2
thincoder-vscode/webview/settings-agent.js     agentCardHtml=1  consultAdvisorCardHtml=1  bindAgentControls=1  updateAgentSettings=1
thincoder-vscode/webview/settings-providers.js providersCardHtml=2  updateProviderStatus=1  renderProvidersCard=3
thincoder-vscode/webview/settings-mcp.js       mcp-del-btn=2  _confirmSecretDelete=1
thincoder-vscode/webview/permission.js         showBatchPermissionRequest=1
thincoder-vscode/webview/chat.css              content-visibility=1  contain-intrinsic-size=1
thincoder-vscode/src/extension/panel-messages-settings.mjs  handleGetAgentSettings=1  _pushIndexStatus=1  _pushSettingsLight=9
                                               handleGetShellCandidates=1  saveShellSettings=3  handleSaveShellSettings=1
thincoder-vscode/src/extension/panel-messages.mjs            saveShellSettings=1
thincoder-vscode/src/extension/settings-panel-write.mjs      saveShellSettingsFromPanel=2
thincoder-vscode/src/extension/panel-mcp.mjs                 mcpReconnected=1
thincoder-vscode/src/extension/panel-turn-stages.mjs         slotStamp=7
thincoder-vscode/src/extension/panel-callbacks.mjs           _saveLines=2  turnSlot=3  distillSlot=4
thincoder-vscode/src/extension/panel-index.mjs               buildIndex=2  onProgress=8
thincoder-vscode/src/extension/panel-session.mjs             _agent=1
thincoder-vscode/src/extension/permission-gate.mjs           releasePermission=5  permissionWithdrawn=4
thincoder-vscode/src/config-mcp.mjs            （档在盘；该段无单一保存符号可指）
thincoder-vscode/src/tools/shell.mjs           bashTool=2
thincoder-core/tools/bash.mjs                  bashTool=1
thincoder-desktop/src/main/session-slots.mjs   pageHistory=4  stripAtRefs=2
thincoder-core/shell-candidates.mjs            shellCandidates=2  commandExists=5
thincoder-core/provider/list-models.mjs        _admission=4  recordAdmission=3
thincoder-render-core/tool-summary.mjs         BASH_MARKER=2
thincoder-cli/src/tui/subagent-panel.mjs       currentTool=3
```

**删除断言三格（零命中 = 断言成立，不是编造的反证）**：

| 名字 | 源档 | 零命中为何是断言 |
|---|---|---|
| `saveCustomProvider` | `thincoder-vscode/src/extension/panel-messages.mjs` | 档面自记「三 case 真退场」——零命中正是该断言 |
| `saveEmbeddingConfig` | 同上 | 同上 |
| `_delKey` | `thincoder-vscode/webview/settings-providers.js` | 档面自记「死 handler 已清」——零命中正是该断言 |

**读数合计（D3：表与数同变）**：15 行中**补齐 15 行 · 部分 0 行 · 未定 0 行**；**未定位 0 处**；**无符号类 1 处**（`thincoder-vscode/webview/chat.css` 的离屏两声明，以逐字引文承接，K2）；档面落点 = **15 行全落**。

#### 8. 未定位清单（这批的真实精度上限 · 逐处）

**终态：未定位 0 处。** 原登记两笔，落定读数如下（逐名命中数见 7.1）：

| 原登记 | 落定（源档 → 符号） | 命中读数 |
|---|---|---|
| U-1 · F-W17 掩码位 2 处 | `thincoder-vscode/webview/settings-tools.js` 的 `websearchRowHtml`（`#status-websearch` 承载 `****`）∥ `embedRowHtml`（`#status-embed`） | 1 / 1 |
| U-2 · F-W2 的 `ui.js` 四帧调用点 | 同档 `scrollDown`（显式回底）∥ `maybeScrollDown`（自动跟滚门）∥ `maybeScrollActivity`（活动区）∥ `initScrollFollow`（两区监听装配） | 4 / 9 / 2 / 2 |

**本批读数的界面 = 档面已写出的指认处**。两处「覆盖面该多大」属要求句判断（G-7），不改本批格数。

**线索失效（不计未定位）2 处**：F-W8 的第二处旧座标（实读为测试连接 case）∥ F-W14 的两处旧座标（实读为 `usage` 投递行与 `onToolResult`）。两处的真身都已按句子重定（第 7 节第 5 / 9 行）——旧线索错了，不是这批定位不到；两者混记会把精度上限算低。

#### 9. 本轮发现（在册 · 本席笔域外的处置已由父侧落定）

- **G-1（计数与列表不同源）· 已了结**：§1 已于 04:15 订正为 **15 行**，并记「以设计席逐条实点为据」；本段读数（15 行）与之一致。原报「§1 记 14 行」不再成立。
- **G-2（同族）· 已了结**：§1 同处订正为 **43 处**（6+6+5+3+2+3+1+1+1+1+2+12）；本批不触该族（另一 spawn）。
- **G-3（线索漂移，读数不是判断）**：旧行号在本轮多处不再落回原处（F-W8 ∥ F-W14 两行已如第 8 节记）；`settings-env.js` 的旧座标落到 `updateProxyTestResult`，而该行自己的句子绑定的是 proxySettings 快照的消费面 ⇒ 本席按句子取 `updateProxySettings`，并在 F-W8 写全「落 `SS.proxySettings` → 同拍 `refillProxyControls`」以备复核。
- **G-4（形）**：F-W17 的 `config-mcp.mjs` 是不带目录段的裸代码档名（D4 禁的正是这一形）⇒ 档面已补全为 `thincoder-vscode/src/config-mcp.mjs`（全仓唯一）。属指认形修正，未动要求。
- **G-5（档面指认错 / 缺）· 已了结（父侧 04:24 落档）** 两处原始发现：
  ① **F-W17 的 MCP 行 ✕ 载体指错档**：档面写「载体 `settings-tools.js` 的生成位 / 绑定位」，实件已出档到 `thincoder-vscode/webview/settings-mcp.js`（`settings-tools.js` 只经 `bindMcpControls` 转入；生成位 `mcp-del-btn`、绑定位 `_confirmSecretDelete` 都在 `settings-mcp.js`）。**已改**。
  ② **F-W14 的回合尾落盘缺符号名**：档面写「回合尾两处落盘（`panel-callbacks.mjs`）」，实件是 `_saveLines` 的两处调用（`turnSlot` ∥ `distillSlot`，均携 `seed: slotStamp`）。**已补**。
  判据：依据 `thincoder-vscode/webview/settings-tools.js`「MCP 面（表单控件绑定 ∥ 列表渲染 ∥ 状态请求）——`settings-mcp.js`（MCP 面出档）」；依据 `thincoder-vscode/src/extension/panel-callbacks.mjs`「panel._saveLines(fullHistory, history, { seed: slotStamp, ...agentState }, turnSlot)」。
- **G-6（到期条件已触发）· 已裁（§1 04:24）= 改期并落账，不在本批补**：`docs/vsc/requirements/WEBVIEW.md` 的 N-W5 给 F-W4 活卡面（`toolCall` / `toolOutput` / `toolResult` 接收）登记了 1 条无专属用例的例外，到期条件 = WEBVIEW 面下次被触碰时 / 收口前；**本批即触碰** ⇒ 已触发。台账 **`#2095`**（技术待办 · 归批 · 复启条件 = VSC 端测试面下一次开批，或 WEBVIEW 面再次被触碰，以先到者为准）。补测属 `thincoder-vscode/test/` 的产品面改动，不在本批写域。
- **G-7（要求句覆盖面，两处 · 待主 agent）**：本席实读核过，两处读数比档面写出的多：
  - **G-7 ①** 携 `seed: slotStamp` 的 `_saveLines` 全树 **4 处**（`panel-callbacks.mjs` 两处 · `panel-turn-loop.mjs` 一处 · `panel-turn-stages.mjs` 一处），档面 F-W14 只写两处；
  - **G-7 ②** `****` 掩码位全树 **3 处**（`settings-tools.js` 两处 · `settings-providers.js` 的 `restoreKeyRow` 一处），档面 F-W17 只数两处。
  「覆盖面该多大」是要求句判断 ⇒ 本席不改要求句，也不改本批格数（本批只覆盖档面已写出的指认处）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**本轮结论表（设计审阅 · 内容评审 · 对象 = §2 三形定指设计 + `docs/vsc/requirements/WEBVIEW.md` 换写）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 第 3 节「受影响文件」的「测试面」行「本笔为纯文档指认形改写，无代码路径 ⇒ 无单测」—— 无自 `test/RTM.md` 起笔的集成设计节，窗宽理由「无单测」不成其为该节唯一成立的立据 |
| 2 | 🟡 | 未处置 | §7「量法」句「52 枚符号名在所指源档全部命中，0 缺失」+「读数见本节末」—— 节末只有行态读数合计，无逐名读数，52 不可复算 |
| 3 | 🟡 | 未处置 | A2「凡未命中的名字一律改「此处无符号」并登记」—— grep 未命中 ≠ 无符号 |
| 4 | 🟡 | 未处置 | A5「`git diff` 逐处只动指认形」—— 评审上下文「No git repository detected」，范围守卫无可行判法 |
| 5 | 🟡 | 未处置 | §8 U-1「只补了能实读确证的第一处（`handleGetAgentSettings`）」 vs `docs/vsc/requirements/WEBVIEW.md` F-W8「宿主 = `panel-messages-settings.mjs`（`handleGetAgentSettings`——打开拍 await 序」——「部分」态在档面不可见 |
| 6 | 🟡 | 未处置 | `docs/vsc/requirements/WEBVIEW.md` N-W5「到期条件 = WEBVIEW 面下次被触碰时 / 收口前」（F-W4 活卡面）—— 本批即触碰，§2 无处置 |
| 7 | 🟡 | 未处置 | §1「且写明「下批按 D1 走，不援引本例外」」 vs §1「沿用该形态」—— 自引的到期条款与本批援引相反 |
| 8 | 🟡 | 未处置 | §2 无最近先例行、无勘察证据行（先例在手：`docs/batches/2026-11-05-line-refs-block-on-write.md` §5 两表 · #2089 顺序形） |
| 9 | 🟡 | 未处置 | §2「旧座标 `panel-messages-settings.mjs` 的 185 至 188 与 193 至 196」·「旧座标 238 与 253」—— 以行号指认，落点符号已在同句 |
| 10 | 🟡 | 未处置 | §7 表按需求行计（15 行），处级未枚举（F-W2 的「`ui.js`（四帧调用点）」仍在档名一级），换写完备无可核依据 |
| 11 | 🔵 | 未处置 | §3 受影响文件表并列「另一 spawn」十二档；§8 U-2 记「四处」而枚举 ①② |
| 12 | 🔵 | 已核（非缺陷） | 受影响文件全为 `.md` ⇒ 免档级判定，无需分档计划 |

计数：🔴 1 · 🟡 9 · 🔵 2 —— 档面换写与 `docs/vsc/requirements/WEBVIEW.md` N-W7「档名 + 符号名」同向（已核）；受限声明 = 无 PROJECT 标准档、无文档地图；来源清单 `docs/batches/2026-11-05-line-refs-block-on-write.md` §5 与 D1/D4 标签定义均在评审面外 ⇒ G-1/G-2 数与本轮「52 枚」读数在本轮 unverified。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 结论表（只验轮次 1 的 12 条 + 修正轮引入的新问题 · 对象 = §2 三形定指设计 + `docs/vsc/requirements/WEBVIEW.md` 换写）**

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴 | 已修 | §2 §3.2「集成差量（读 `test/RTM.md` 后作答）」——「**断掉的既有行**：0 —— 本批不改变任何业务可观察结果」+「缺失行：0」；独一成立理由与 RTM 差量齐，节已存在 |
| 2 | 2 | 🟡 | 已修 | §7.1「逐名读数（复算入口）」+ §7 量法「**85 格（名字格 83 + 档在盘格 2）· 名字命中 79 · 零命中 4**」+ A6「逐格计数，可复算」；「52 枚 · 读数见本节末」已撤 |
| 3 | 3 | 🟡 | 已修 | A2「**零命中只说明这个名字不写，不推出「该处无符号」**」 |
| 4 | 4 | 🟡 | Accepted（有据不改） | 新增「**A5 可执行性**：本仓 `git rev-parse --is-inside-work-tree` 读数 = `true`」+ 逐 hunk 归属判法；该读数本轮无工具可复核 ⇒ unverified |
| 5 | 5 | 🟡 | Accepted（有据不改） | K4「F-W8 的第二处旧座标实读到的是测试连接 case，与「打开拍到达」无对应 ⇒ 记线索失效，不计作未定位」+ 行 5 状态改「补齐」；K4 所引源档注释在评审面外 ⇒ unverified |
| 6 | 6 | 🟡 | Accepted（改期落账） | §1「**改期并落账，不在本批补**」+「**立台账 `#2095`**（技术待办 · 归批 · 复启条件 = …以先到者为准）」；台账本体在评审面外 ⇒ unverified |
| 7 | 7 | 🟡 | 已修 | §1「顺序形态（自陈：这是推断，不是授权）」——「这条推断的性质 = **不是授权**」「这批是先落了、后补说的」 |
| 8 | 8 | 🟡 | 已修 | §3.1「设计前置：最近先例与勘察证据」——先例坐标（前批 §5 两表 ∥ #2089）+「**对齐**」「**偏离**：无」+「记「查过，无相关」，不是「没查」」 |
| 9 | 9 | 🟡 | 已修 | §2 内具体行号已全撤，只余 K1「**旧行号不作判据**」与「按符号名重定」；旧座标改以落点符号指认（`updateProxyTestResult` 一族） |
| 10 | 10 | 🟡 | 已修 | §8 新增 U-2 记 F-W2「四帧调用点」为未定位；未定位处数与两条目同数（U-1 两处 + U-2 一处 = 3） |
| 11 | 11 | 🔵 | 已修 | §8 U-1「掩码位两处」单列、U-2 只余一处，「四处 ∥ ①②」错配不复存在 |
| 12 | 12 | 🔵 | 已核（非缺陷） | 受影响文件仍全为 `.md` ⇒ 免档级判定 |
| 13 | (新) | 🟡 | 新（记录态滞后，非阻批准） | §7「档面落点：**13 行已落 · 2 行待主 agent 落**（G-5）」+ 行 8「**档面仍把 MCP 载体写成 `settings-tools.js` ⇒ G-5**」 vs §1「G-5 ① … **已改**」与档面 F-W17「`settings-mcp.js` 的生成位 `mcp-del-btn` / 绑定位 `_confirmSecretDelete`」 |
| 14 | (新) | 🟡 | 新（判法失配，非阻批准） | A3「未定位处数 = 第 8 节**条目数**」 vs 读数合计「**未定位 3 处**」而 §8 只有 U-1 ∥ U-2 两条 ⇒ 机械跑 A3 得 3 ≠ 2 |
| 15 | (新) | 🔵 | 新 | 行 9「补齐（本轮消 **U-3**）」——§8 已无 U-3 条；§2 状态行「11 条…（1 🔴 + 9 🟡 + 1 🔵）」 vs §3 计数「🔴 1 · 🟡 9 · 🔵 2」 |

计数：原 12 条 = 🔴 1 已修 · 🟡 6 已修 / 3 Accepted（有因有据）· 🔵 2 已修或已核。新 3 条 = 🟡 2（记录态滞后 · 判法失配）+ 🔵 1，均非「批准前必修」。未决 🔴 = 0。受限声明：无 PROJECT 标准档、无文档地图；先例清单 `docs/batches/2026-11-05-line-refs-block-on-write.md` §5 与台账 `#2095` 均在评审面外 ⇒ G-1/G-2 数、79/83/85 读数、`#2095` 落账均 unverified。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-11-06 04:48 补记）

| 时点 | 用户原话 | 批的什么 |
|---|---|---|
| 2026-11-06 04:09 | 「第三项也自动跑完吧。」 | 第三项（本批）**全链自动跑完**——设计 → 评审 → 修正 → 实施 → 收尾，不再逐节点回问 |

**⇒ 批的是「怎么跑」，不是「内容对」**：内容对错由评审轮（`#128` 打回 · `#130` 通过）与实施轮的两份独立读数（100/100 ∥ 103/103）判。

**⇒ 落笔顺序的偏离**：本批设计轮回写活文档早于评审与批准，§1「顺序形态（自陈：这是推断，不是授权）」已如实记明——**用户未就该形态授过权，是父侧推断**；用户若不接受，按 §1 那条处置（逐 hunk 撤回 17 处换写）。

**⇒ G-7 两笔（要求射程扩不扩）不在本批准范围内**——那是新范围，须用户另裁。

## §5 实施记录（eng-coder）
**状态行**：实施完成（C1 15 行补齐 15 · 未定位 0 · 名字格 100/100 · 交付门 PASS）



### 实施记录（eng-coder · 2026-11-06）

**任务面** = §2 条目 C1：`docs/vsc/requirements/WEBVIEW.md` 的 15 处指认形（档名一级 → 符号名）。

**开工实读**：档面 17 处换写**已由前手落盘**（含 §1 04:24 记的 G-5 ① ② 两处），本席的活 = 逐名回扫 + 补 U-1 ∥ U-2 + 修一处配档错 + 表体形态修复。设计判据（三形定指 ∥ 一处一读 ∥ 读不到就明说）全程照做。

#### 1. 改了什么（逐处 · 全部同行内改写）

| # | 位置 | 改前 | 改后 |
|---|---|---|---|
| 1 | §2 F-W2（ui.js 段） | `ui.js`（四帧调用点） | 四帧调用点 = `scrollDown` 显式回底 ∥ `maybeScrollDown` 自动跟滚门 ∥ `maybeScrollActivity` 活动区 ∥ `initScrollFollow` 两区监听装配（**消 U-2**） |
| 2 | §2 F-W17（掩码位） | `settings-tools.js`（两处） | `settings-tools.js` 的 `websearchRowHtml`（`#status-websearch` 承载 `****`）∥ `embedRowHtml`（`#status-embed` 承载 `****`）两处（**消 U-1**） |
| 3 | §2 F-W11（extension 侧） | 三档共用一个名 `saveShellSettings` | 分派 case `saveShellSettings`（`panel-messages.mjs`）→ `handleSaveShellSettings`（`panel-messages-settings.mjs`）→ 写面 `saveShellSettingsFromPanel`（`settings-panel-write.mjs`） |
| 4 | §2 F-W16（核侧产者） | 核 `thincoder-core/tools/bash.mjs`（裸档名） | 核 `thincoder-core/tools/bash.mjs` 的 `bashTool` |
| 5 | §3 N-W3 ∥ N-W4 | 两处单元格分隔符缺空格（`）|`） | 补空格（`） |`） |
| 6 | §2 ∥ §3 表体 | 四处空行（原 25 / 31 / 35 / 107 行）把表切成四段 | 删空行，两表各自连成一块（零文字改动，−4 行） |

**第 3 处为什么算必修（不是润色）**：原句把同一个名字挂到三档，`settings-panel-write.mjs` 里 `saveShellSettings` **零命中**（实件是 `saveShellSettingsFromPanel`）——A1「每处写的名字在所指源档命中 ≥1」在这一格不成立。本席实读三档后按真实三环改写。

**第 5 ∥ 6 处属越出「只改指认」字面，逐条披露**：① 第 6 处是**表体形态修复**——空行把 §2 功能需求表切成四段、§3 表切成两段，按 GFM 只有第一段是表，其后各段渲染成竖线段落；零文字增删，只删 4 个空行。② 第 5 处是同一行的单元格分隔符补空格（同一行已因指认改写落盘，顺手归一）。两处都不动论断。

#### 2. 读数（同一量法 · 可复算）

| 面 | 读数 | 判法 |
|---|---|---|
| 名字格（源档, 名字） | **100 格 · 命中 100 · 零命中 0**（42 档） | 逐档 `fs.readFileSync(f)` 后 `src.split(name).length - 1`，逐格读数见 §2 §7.1 的扩表口径（本席复跑同一量法） |
| 档面自记「已删」的断言 | `_delKey` 0 ∥ `saveCustomProvider` 0 ∥ `saveEmbeddingConfig` 0 ∥ `case "settings"` 0 | 零命中正是该断言（不是编造的反证） |
| 15 行行态 | **补齐 15 · 部分 0 · 未定 0** | §2 §7 的「部分 1（F-W17）」由本轮补 U-1 消除 |
| 未定位 | **0 处**（U-1 两处 ∥ U-2 一处，本席逐处实读后落名） | 每处都读到具体符号才写 |
| 无符号类 | **1 处**（`thincoder-vscode/webview/chat.css` 的离屏两声明，逐字引文承接，K2） | 不造选择器名 |
| 交付门 | `doc_check(mode:"gate")` ⇒ 首行 `DOC-CHECK GATE: PASS` | `docs/vsc/requirements/WEBVIEW.md` 整档 |

#### 3. 验收对照（§2 §4 的 A1–A6）

| # | 判据 | 读数 |
|---|---|---|
| A1 | 每个新写符号名在所指源档命中 ≥1 | 100/100（含本轮新增的 `scrollDown` ∥ `maybeScrollDown` ∥ `maybeScrollActivity` ∥ `initScrollFollow` ∥ `status-websearch` ∥ `status-embed` ∥ `handleSaveShellSettings` ∥ `saveShellSettingsFromPanel` ∥ 核侧 `bashTool`） |
| A2 | 编造符号 0 | 零命中格全部是档面自记的「已删」断言；无一处编名 |
| A3 | 计数与列表同变（D3） | 15 行行态与 §2 §7 表逐行对应；未定位 0 与 §2 §8 三条的处置一致（见上抛 5：记录态待回写） |
| A4 | 交付门 | PASS（上表） |
| A5 | 要求本体零改 | 本席 6 笔改动逐笔实读：4 笔落在 `证据 = ` 段 ∥ 路径指认形，2 笔是分隔符 / 空行；判定句与范围边界列零字节改动。**`git diff` 逐 hunk 机判未跑**（本席无 git 工具面），属自陈 |
| A6 | 逐名读数留档 | 见上表「名字格 100 格」，量法一处、可复算 |

#### 4. 审计 ∥ 评审轮（本会话内）

| 轮 | 面 | 结论 | 处置 |
|---|---|---|---|
| 1 | explore 只读审计（语义保真：编造 ∥ 错挂 ∥ 句内破损；15 行逐处 + 抽样 20 余处正向复核） | `divergence: 2`（a 1 ∥ b 1 ∥ c 0） | b 1（`ui.js` 的「四帧调用点」错挂到 `maybeScrollDown` 单函数）= **已修**（改为组级 + 四函数各自具名，依据源档头注「本档留帧调用点（四函数）」）；a 1（`smoke-settings.mjs` 不在盘）= 存量，转报（见上抛 3） |
| 2 | advisor 代码评审（`type:"code"`，面 = `docs/vsc/requirements/WEBVIEW.md`，判据来源 = 本批档 §2） | **pass**：🔴 0 ∥ 🟡 5 ∥ 🔵 1 | 🟡 一（F-W16 核侧裸档名，而 `bashTool` 可读）= **已修**；🟡 二 ∥ 三 ∥ 四 ∥ 五（F-W14 落盘覆盖面 ∥ N-W5 到期条件 ∥ 测试档不在盘 ∥ 记录态滞后）= **转报**（要求句 ∥ 记录面，非本席笔域）；🔵 一（P2 编号重复）= 转报 |

**终态：`clean`**（6 处改写 · 名字格 100/100 · 15 行补齐 15 · 未定位 0 · 无符号 1 · 交付门 PASS · 审计 1 轮 2 条（1 修 1 转）· 评审 1 轮 pass（2 修 4 转）· 零编造符号 · 零行号）

#### 5. 上抛 ∥ 转报（本席不裁）

1. **`[上抛·待裁]` F-W14 的「回合尾两处落盘」只覆盖 `panel-callbacks.mjs`**（第 272 ∥ 287 行）。全树 `_saveLines` 七处调用，其中携 `seed: slotStamp` 的另有两处：`panel-turn-stages.mjs` 的 `panel._saveLines(fullHistory, history, title ? { seed: slotStamp, title } : { seed: slotStamp }, turnSlot)` ∥ `panel-turn-loop.mjs` 的 `panel._saveLines(fullHistory, history, { seed: slotStamp }, turnSlot)`。按 F-W14 的机制（stamp 优先 ⇒ 回合内选择被静默覆盖），这两处也在机制内。「两处」是 §2 §7 第 9 行的读数，扩不扩属要求句判断，本席零改。
2. **`[上抛·待裁]` N-W5 例外的到期条件已触发、档面未同步**：档面仍写「到期条件 = WEBVIEW 面下次被触碰时 / 收口前」，而本批正是触碰；§1 已裁「改期并落账（台账 #2095）」，该改期只落在批档与台账，档面读者看到的仍是一条已触发的到期条件。改哪一句属要求句判断。
3. **`[上抛·知会]` 档面三处测试档指认不在盘**：`thincoder-vscode/test/activity-live-ux.test.mjs`（N-W3）· `thincoder-vscode/test/protocol-coverage.test.mjs`（N-W7，档面还写「已落」）· `test/smoke-settings.mjs`（N-W8）。现盘 `thincoder-vscode/test/` = 5 个 `.test.mjs` + `files.mjs` / `run.mjs` / `slow.mjs`，`files.mjs` 清单亦无上述三档。前批已登记其中两处「早于本轮」，本批零触。
4. **`[上抛·知会]` F-W17 掩码位实为三处，档面数了两处**：`thincoder-vscode/webview/settings-providers.js` 的 `restoreKeyRow` 另有 `s0.masked || "****"`（全 `webview/` 目录 `****` 共 3 行）。档面「掩码位 = `settings-tools.js` 两处」只数面板工具卡两面；provider 行那处进不进「实测入口册」属要求句判断。
5. **`[上抛·知会]` §2 §7 第 8 ∥ 9 行与 §8 U-1 ∥ U-2 的记录态已落后于档面**：那三处在档面本轮已全部指名（`settings-mcp.js` 的 `mcp-del-btn` ∥ `_confirmSecretDelete`、`_saveLines`、掩码位 `websearchRowHtml` ∥ `embedRowHtml`、`ui.js` 四函数）。⇒ A3「未定位处数 = 第 8 节条目数」现读 3 ≠ 档面实测 0。请设计席 / 父侧收口时按档面改记「已消」——那才是 §1 硬约束 3 要的「无名数」。

#### 6. 未做 ∥ 偏差（如实记）

- **无单测、未跑集成**：纯文档指认形改写，无代码路径；§2 §3.2 已判集成差量 0（断掉 0 ∥ 冗余 0 ∥ 缺失 0 ∥ 窗宽 VSC 端 2 / 50–100 零增）。
- **A5 的机判未跑**：本席工具面没有 git，逐 hunk 归属是自陈（逐笔实读），不是机检读数。
- **保留「档名一级」一处**：F-W17 的 `MCP token/headers 唯一路径 = 表单清空保存 `thincoder-vscode/src/config-mcp.mjs``（该处无单一保存符号可指——`addMcpServer` ∥ `updateMcpServer` 二取一属判断，本席不在要求句段落自裁）。
- **越界披露**：本轮改动集 = spawn 声明的 `docs/vsc/requirements/WEBVIEW.md` 一档，无第二档；批档本节为记录面写入。

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-11-06 04:48）

**终点（§1 硬约束 3 要的那张表）**：

| 面 | 终态读数 |
|---|---|
| WEBVIEW 15 行 | **补齐 15 · 部分 0 · 未定 0** |
| 未定位处 | **0**（U-1 ∥ U-2 经实读全部指名） |
| 真正无符号 | **1 处**（`chat.css` 离屏两声明——以逐字引文承接，未造选择器名） |
| 名字格 | **106 格 = 指认 103（命中 103 · 零命中 0）+ 删除断言 3（全零，断言成立）**，源档 42 |
| 编造符号 | **0** |

**父侧核验**：交付门对 `docs/vsc/requirements/WEBVIEW.md` 与本批档 PASS；`#131` ∥ `#133` 两轮独立读数一致（100/100 与 103/103 的差是格集口径，后者含删除断言格）。

**本批最该记的一条自查**：`#131` 发现 F-W11 原句「同一个名字挂三档」，而其中一档该名**零命中**——**名字是真的、挂错了档**。这类错能通过「名字存在」的检查，只能靠「名字在**所指那一档**里存在」抓住。

**未闭合（交下一批 ∥ 待用户裁，不写成已清）**：

1. **G-7 ① ∥ ②（待用户裁，范围变化）**：`seed: slotStamp` 的 `_saveLines` 全树 4 处而档面写 2 处；`****` 掩码位全树 3 处而档面数 2 处。**扩不扩是需求射程，本席不代裁。**
2. **`#2095`**：F-W4 活卡面补测（N-W5 到期件已触发、已改期落账）。
3. **三处测试档指认不在盘**（N-W3 ∥ N-W7 ∥ N-W8 所引 `thincoder-vscode/test/` 与 `test/` 下三档）——本批零触，如实转下一批。

**A5 口径**：本批的「只动指认形」是**逐笔自陈**，不是机检读数——该档批前基线不在 git，`git diff` 读到两批合成。**记在此，不当作已验证。**

**暂缓批复核**：无。**doc-check**：两档 PASS。**凭证**：`a9e9db13` 链终已消费。
