# 2026-10-20 · subagent-think-label
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-20 · 来源 = 用户令（2026-10-20 16:29 指出、16:32「对的，我在意的就是第一条，think 态把子代理名称吃掉」+「开」）：子代理块头状态词的 think 支携带干活者身份（嵌套 ⇒ `advisor#1/思考中…`），对齐 CLI。
> 台账 = #1720（VSC · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户报告（2026-10-20 16:29 / 16:32）**：「子agent live区的标题行，我觉得是cli端最好，因为在调用子agent时会显示成子agent的名称 explore/advisor这样，但是桌面和vsc都会显示成子agent里面再调用的工具和thinking」；追问场景后定界：**「我在意的就是第一条，think 态把子代理名称吃掉。2，不重要，我感觉不突出」**（#2 = 默认展开），并令「**开**」。

**父侧实读（两端对照 · 场景 = 主会话 spawn `eng-coder#3`，其内嵌套 `advisor#1`）**：

| 面 | CLI | 桌面 / VSC（共用核件） |
|---|---|---|
| 括号段 | `[▶ eng-coder#3 · async · model · 45s · turn 12/100]` | 逐字段相同（`activity-view.mjs` `headerText`） |
| 工具态 | `advisor#1/read — src/x.mjs`（`subagent-blocks.mjs:341` `path.label/rest`） | `advisor#1/read — src/x.mjs`（`noteChunk` 读 `m.sub`）——相同 |
| **think 态** | **不变**，仍是上一个工具 `advisor#1/read`（think/text 不碰 `currentTool`，`:308` / `:323`） | **换成裸 `思考中…`**——`noteChunk` 的 `kind==="think"` 支丢 `m.sub`（`activity-view.mjs:210`） |
| 正文 | 折叠（末 3 行） | 默认展开（`block.mjs:33`）——**用户明示本批不动** |

**根因**：状态词的两条写点（工具行 ∥ think）对「嵌套身份前缀」处理不一致——工具行带 `m.sub`，think 支不带。

**本批范围（一条）**：状态词的 think 支携带干活者身份——嵌套（`sub` 前缀在场）⇒ `<sub>/思考中…`（如 `advisor#1/思考中…`）；顶层 ⇒ `思考中…`（角色已在括号段，不重复）。桌面 + VSC 同源生效，CLI 零改。

**不做**：不改块头括号段 · 不改正文默认展开（用户明示不重要）· 不改 CLI · 不改状态词其余固定三态（审批 ∥ 待消化 ∥ 排队）。

**已确认**：用户 2026-10-20 16:32 逐字「开」= 开批。评审发起照旧等用户（本次未给整批令）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（含评审 #39 修正轮：九条 + 闭枚举缺省支 · 现行坐标见修正轮表）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 批次任务与设计（F-W23 子代理块头状态词 think 支携带干活者身份）

**本批条目（覆盖）**：F-W23 一条（需求档 `docs/vsc/requirements/WEBVIEW.md:43`）。
**不在本批（F-W23 边界原句）**：不改块头括号段 · 不改正文默认展开（用户 16:32 明示不重要）· 不改 CLI · 不改状态词固定三态（审批 ∥ 待消化 ∥ 排队）优先级 · 不改工具行支形态。

### 1. 规则定形（逐字）

状态词的 think 支：`m.sub` 在场（relay 嵌套前缀，如 `advisor#1`）⇒ `<sub>/<think 词>`；`m.sub` 缺席（顶层子代理）⇒ `<think 词>`。think 词源不变 = `W.thinking()`（`activity-view.mjs:38` = `t("status.thinking") + "…"`，静态形）。

- 嵌套示例：`advisor#1/思考中…`；深层嵌套：`advisor#1/explore#2/思考中…`（`sub` = `path.inner.join("/")`，与工具行同一前缀）。
- 顶层示例：`思考中…`（角色已在括号段 `[▶ role#id · …]`，不重复）。

**think 是否覆盖上一个工具名 —— 结论：覆盖（保留 `<sub>/` 前缀）**。理由：需求 F-W23 ①/② 逐字指定了 think chunk 到达时的状态值；若保留旧工具名，顶层 think 会显示工具名而非 `思考中…`，直接违反 ②。CLI「think/text 不碰 `currentTool`」（`thincoder-cli/src/tui/subagent-blocks.mjs:308` / `:323`）是实现副产品——`currentTool` 只在工具 call 时写、从不因 think 清；CLI 的兜底词是裸 `thinking...`（`thincoder-cli/src/tui/subagent-panel.mjs:106`）。用户「CLI 最好」的判据 = **名称可见**，该判据由 `<sub>/` 前缀复现，不靠停在上一个工具名上。
拒绝的替代：① 保留旧工具名（违 ②）；② 删除 think 支（同违 ②，且 think 无任何状态表达）。

### 2. 设计档落点（D2 单源）

| 面 | 落点 | 动作 |
|---|---|---|
| **规则单源** | `docs/vsc/design/WEBVIEW.md` §5.2「块头与状态词（形态与字段）」（`:309-313`） | 取值闭枚举行补「三项均可带 `<sub>/` 前缀」+ 新增两条：嵌套身份前缀（工具行 ∥ think 同一条规则）· think 覆盖前一状态词 |
| 只引 | `docs/render-core/design/RENDER-CORE.md:82`（模块判定表 `activity-view.js` 行） | 行内追加指针「块头与状态词形态单源 = `docs/vsc/design/WEBVIEW.md` §5.2」；零抄写 |
| 已核无同规则句 | `docs/desktop/design/UI.md` | 桌面块面委核件直消费（`:127` / `:268`），无独立 think 规则句 ⇒ 零改 |

**为何单源留在 VSC 设计档**：核件自身注释已声明「取值源闭枚举 = `WEBVIEW.md` §5.2」（`thincoder-render-core/subblocks/activity-view.mjs:102-103`）；RENDER-CORE.md 的结构是决策表 + 边界表（`:82` = 模块判定行），没有逐构件形态的散文位。搬去 RENDER-CORE 要改核件注释、把块头机制拆成两档，收益为零。

### 3. 机制设计（唯一实现）

`thincoder-render-core/subblocks/activity-view.mjs` `noteChunk`（`:210-213`）think 支：

```js
} else if (kind === "think") {
  const who = (typeof m?.sub === "string" && m.sub) ? `${m.sub}/` : ""
  meta.stateWord = `${who}${W.thinking()}`
  refreshBlock(block)
}
```

- `stateWord()` 缺省支（`:113` `meta.stateWord || W.thinking()`）**零改**：落到缺省时还没有任何 chunk，也就不存在 `m.sub`；顶层形态恰是正确缺省。不新增 `meta` 字段。
- 前缀逐 chunk 重算 ⇒ 嵌套工具行后接顶层 think 不会残留前缀；工具行支（`:204-207`）零改。
- **同源生效**：VSC = `webview/activity-view.js`（`:1-2` 两行 `export *` shim → `node_modules/@thincoder/render-core/subblocks/activity-view.mjs`）；桌面 = 协议根 `/rc/` 直映射核包（`/rc/subblocks/activity-view.mjs`，`renderer/views/chat-subagent.mjs:27` 等直 import）。CLI 自带 `subagent-panel.mjs`，零改。
- `m.sub` 产者已实读：`thincoder-render-core/subblocks/relay.mjs:161`（`sub = path.inner.length > 0 ? { sub: path.inner.join("/") } : {}`）· `:172`（think/text 支同携 `...sub`）⇒ think chunk 载荷本就有 `sub`，只是 `noteChunk` 丢了它。

### 4. 受影响文件（当前行数 → 预计）

| 文件 | 现行行数 | 预计增量 | 说明 |
|---|---|---|---|
| `thincoder-render-core/subblocks/activity-view.mjs` | 215 | +1~2（think 支 +2 行；文档注释同拍改写，行数不变） | 唯一实现 |
| `thincoder-vscode/test/2026-10-20-vsc-subagent-think-label.test.mjs` | — | 新增 ≈70 | 用例载体（批次本地件） |
| `thincoder-vscode/test/files.mjs` | 9 | 0（同第 8 行数组内追加一项） | 登记 |
| `docs/vsc/design/WEBVIEW.md` | 685 | +3 → ≈688 | 规则单源 |
| `docs/render-core/design/RENDER-CORE.md` | 524 | 0（`:82` 行内追加指针） | 只引 |

**合计 5 文件**（≤15 一单面）。设计档自身：WEBVIEW.md 685 → ≈688；RENDER-CORE.md 524 → 524。

**测试载体选择**：核包零 devDep、不引 happy-dom（`docs/render-core/design/RENDER-CORE.md:352-353`：「DOM 构件层用例宿主 = 消费端测试树，非核包」）⇒ 用例落 **VSC 测试树**（devDep `@happy-dom/global-registrator`，先例 `test/2026-10-20-vsc-queue-band.test.mjs`），经 `node test/run.mjs` 跑（清单单源 = `test/files.mjs`；实读现 **2 条**登记：`2026-10-19-vsc-reasoning-expanded` / `2026-10-20-vsc-queue-band`）。

### 5. 验收（F-W23 ①–④ 逐条机判）

| # | 判据 | 机判 |
|---|---|---|
| ① | 嵌套 think ⇒ 状态词 = `<sub>/思考中…` | `renderSubagentChunk(block, { role:"eng-coder", id:3, kind:"think", sub:"advisor#1", text:"…", face:"think" })` ⇒ 头行文本含 `advisor#1/思考中…` |
| ② | 顶层 think ⇒ 恰为 `思考中…` | 同载荷去 `sub` ⇒ 头行以 `] 思考中…` 结尾且不含 `/思考中…` |
| ③ | 工具行支零变 | `{kind:"tool", tool:"read", cmd:"src/x.mjs", sub:"advisor#1"}` ⇒ `advisor#1/read — src/x.mjs`；无 `sub` ⇒ `read — src/x.mjs`；`face:"toolOutput"` chunk ⇒ 状态词不变 |
| ④ | 桌面 + VSC 同源，CLI 零改 | 测试直接 import 核包路径 `../node_modules/@thincoder/render-core/subblocks/activity-view.mjs`（= 桌面 `/rc/subblocks/activity-view.mjs` 同一文件）；静态断言 VSC `webview/activity-view.js` 为纯再导出（`export *`，无本地 `noteChunk`）；`thincoder-cli/**` 零改 |

命令 = `cd thincoder-vscode; node test/run.mjs`（全绿；本批新增用例数 ≥4）。

### 6. 用例表

| 类 | 输入 | 期望输出 |
|---|---|---|
| 正常 | 嵌套 think（`sub:"advisor#1"`） | `advisor#1/思考中…` |
| 正常 | 顶层 think（无 `sub`） | `思考中…` |
| 正常 | 嵌套工具行 | `advisor#1/read — src/x.mjs`（零变） |
| 边界 | 深层嵌套（`sub:"advisor#1/explore#2"`） | `advisor#1/explore#2/思考中…` |
| 边界 | 先嵌套工具行、后顶层 think | `思考中…`（前缀不残留） |
| 边界 | 先工具行、后嵌套 think | 覆盖为 `<sub>/思考中…`（不留旧工具名） |
| 边界 | `sub` 为空串 / 非字符串 | 顶层形态，零前缀、不抛 |
| 错误 | 冻结块（`frozen:true`）收 think chunk | 零改写（`noteChunk` 首行守卫保持） |

### 7. 边界（不做）

不改块头括号段 · 不改正文默认展开 · 不改 CLI · 不改状态词固定三态优先级 · 不改工具行支形态 · 不改词源（`W.thinking()`）· 不改 `stateWord()` 缺省支 · 不新增 `meta` 字段 · 不改 relay 载荷（`sub` 已在）。

### 8. 同面读数（登记，不本批处置）

- `docs/desktop/design/UI.md:25`「状态词闭枚举 8 词」声称界面各处（含活动块）取词出自该集，而核件块面实产 `思考中…` / 工具名，两者既有张力（本批前已存在——`思考中…` 本就不在 8 词集内）。本批只改前缀，不扩大也不收窄该张力；处置归主 agent（语义面）。
- `thincoder-cli/src/tui/subagent-panel.mjs:106` 兜底词 = 裸 `thinking...`（CLI 自有词面），与两端 i18n `思考中…` 的端差既有登记，本批不动。

### 9. 上抛项

无待裁项。

**坐标读数（落盘后实测）**：WEBVIEW.md §5.2 规则句实占 `:309-314`（全文 688 行 = 685 + 3）——上文落点表的 `:309-313` 是写入前预计，以本行为准。RENDER-CORE.md 指针行 = `:82`（全文 524 行，零增行）。§2 状态行 = 设计完成；doc_check gate = PASS（2 档，0 命中；批档按声明域排除，由 batch 工具自带门判 PASS）。

## 修正轮（设计评审 #39 · 轮次 1 · 🟡8 + 🔵2）

**处置口径**：九条由本席落设计档侧；第 4 条的 requirements §4 行归父侧（不触）。两条核心规则语义零变（`<sub>/` 前缀 ∥ think 覆盖）；产品代码 / CLI / 桌面端 / 批次档其余段零改。

| # | 严重度 | 改动落点 | 处置 |
|---|---|---|---|
| 1 | 🟡 AC④ 处置句缺失 | `docs/vsc/design/WEBVIEW.md:329` | 「落点 = 核 `subblocks/activity-view.mjs`（桌面同源）∥ CLI 零改（F-W23 AC④）」——VSC 经 2 行 shim 取同件 · 桌面经 `/rc/` 直映射同件 · CLI 自持 `subagent-panel.mjs` 零改 |
| 2 | 🟡 写点坐标自相矛盾 | `WEBVIEW.md:315` | 写点改核坐标（核 `subblocks/activity-view.mjs:198` `noteChunk`），同句注明端档 `webview/activity-view.js` = 2 行 `export *` shim、零逻辑——写点不落在端档 |
| 3 | 🟡 无载体/判据/用例 | `WEBVIEW.md:319`（载体）· `:320`（两路径同值）· `:483-490`（T-A33–T-A40） | 载体 = 块级 `block._subMeta.stateWord` 单字段（写点核 `:207` ∥ `:211`；缺省 = 字段缺席）；两刷新路径（1 s 拍 ∥ 覆盖式重建）同值断言；用例 8 条 = T-A33–T-A40（含冻结块负控 T-A40 ∥ 多段嵌套 T-A38 ∥ 旧载荷无 `tool` T-A35③ ∥ 出生前缺省 T-A39） |
| 4 | 🟡 先例/偏离未显式 | `WEBVIEW.md:325-327` | precedent = CLI 工具行前缀（`subagent-blocks.mjs:341`）；对齐 = 工具行前缀逐字同构；偏离 = think 覆盖（CLI `currentTool` 不被 think 改写，兜底裸 `thinking...` `:106`）；理由逐句在档；requirements §4 行父侧落 |
| 5 | 🟡 无勘察源行 | `WEBVIEW.md:308-312` | 五源逐条结论：requirements（相关）· RENDER-CORE §1.3/§2/§3（相关）· 核件源码 `:38`/`:104`/`:113`/`:198-213`（相关）· CLI 对位件（对位参照，未重读）· 独立档仓（不适用） |
| 6 | 🟡 无受影响档表 | `WEBVIEW.md:330-331` · `:465`（T-A15） | 核件现 215 行 ⇒ `≤ +2`（≪500，零拆分计划）· 端档 0 · RENDER-CORE 零增行 · 本档规则块 + 用例行；T-A15 门集补核件 ≤500（现 215） |
| 7 | 🟡 登记面缺行 | `WEBVIEW.md:636-638`（D-W41–D-W43）· `:664`（U-W21）· `:689`（§10 行 20） | D-W41 补 U-W20 所引悬空（推理按钮中性档）；D-W42 = 嵌套前缀 · D-W43 = think 覆盖；U-W21 + §10 行 20 回指 F-W23 |
| 8 | 🟡 取值未绑词键 | `WEBVIEW.md:315-316` · `:321-322` · `:323-324` | 三处改「词键 `status.thinking` + 静态 `…`（`W.thinking()` 核 `:38`）」；zh 字面 `思考中…` 仅例示 |
| 9 | 🔵 指针坐标不一致 | `docs/render-core/design/RENDER-CORE.md:82` · `:76` | `:82` 删漂移坐标，只保核件路径（`refreshBlock` ∥ `updateStopButton` ∥ `noteChunk` ∥ `tailLines`）+ 端档 2 行 shim + 形态单源指针；§3 前置句声明「行号 = 勘察时点读数，以源码为准」 |
| 10 | 🔵 闭枚举缺省支 | `WEBVIEW.md:315` · `:318` | 改述「状态区取值 = 写点闭集 + 缺省支」+ 补缺省支句（`stateWord` 缺席 ⇒ 裸 think 词，核 `:113`；缺省支零改） |

**偏离说明（第 6 条 · 用例档名）**：受影响表只落「用例 = T-A33–T-A40 · 载体 = VSC 测试树 · 清单单源 `test/files.mjs`」，不落具体用例档名——单元用例件收口即删，设计档写档名即成悬空指针；档名已在 §2 上文受影响表在册。

**读数**：`doc_check gate` = PASS（2 档，0 命中——首跑 REFUSED 1 条：`WEBVIEW.md:315` 319 字符，同轮拆行后复跑 PASS）· WEBVIEW.md 688 → 716 行 · RENDER-CORE.md 524 行（零增行，两处行内改写）。

**坐标时效**：本节上文「坐标读数（落盘后实测）」行（`:309-314` / 全文 688 行）是修正轮前的时点读数；修正轮改写后现行坐标 = 本节修正轮表（规则块 `:315-330` · 全文 716 行）——实施席一律按修正轮表取坐标。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`docs/vsc/design/WEBVIEW.md` §5.2（状态区取值闭枚举 ∥ 嵌套身份前缀 ∥ think 覆盖）+ `docs/render-core/design/RENDER-CORE.md:82` 单源指针（F-W23 设计轮）。
**局限**：无项目标准档（判据 = Project Guide + 评审准则）· 无文档地图（ownership 检查降级）· 源码不在本轮射程 ⇒ 受影响档行数与代码坐标无法实核（unverified）。ownership 结果 = 通过（改动落在拥有该主题的两档：§5.2 正文 + 核档指针，零新档碎片）。scope = 通过（只收 think 支 + 负向「输出面零写入」，无夹带）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements coverage | 🟡 | F-W23 AC④（桌面 + VSC 同源生效 ∥ CLI 零改——`docs/vsc/requirements/WEBVIEW.md:43`）在 §5.2 无处置句：全节只写形态规则，未声明落点 = 共享核件（⇒ 桌面随核同收）、亦未声明 CLI 零触。 | 规则块末补一行「落点 = 核 `subblocks/activity-view.mjs`（桌面同源）∥ CLI 零改」并回指 F-W23 AC④。 |
| 2 | Clarity | 🟡 | 写点坐标自相矛盾：`WEBVIEW.md:309` 称写点 = `activity-view.js` `noteChunk`，同档 `:53` 记该端档为「本端档 = 2 行 `export *` shim」、`noteChunk` 实现单源 = 核 `subblocks/activity-view.mjs` `:198`；按字面落点会把唯一实现写进 shim（AC④ 桌面面失效）。 | 写点改核坐标（核 `subblocks/activity-view.mjs` `noteChunk` 的 think 支），同句注明端档为零逻辑 shim；坐标惯例对照 `:306` ∥ `:319`（已用核路径）。 |
| 3 | Acceptance criteria | 🟡 | 新规则无判据/载体/用例：①状态区取值的块级活态载体未点名，而 `:320` 断言 1 s 同点刷与覆盖式重建两路均重绘头词/状态区 ⇒ 纯 DOM 写入会被 1 s 拍抹掉（缺「两路同值」断言——对照同档 `:167` ∥ `:174` 刷新路径断言惯例）；②无边界/错误用例（冻结块收 think ∥ 多段嵌套 ∥ 旧载荷无 `tool` 字段 ∥ 出生前缺省支）；③无机检档名。 | 补「载体 = 块级 meta 字段」+ 两刷新路径同值断言 + AC①-④ 各一条用例（含冻结块负控）。 |
| 4 | Closest-precedent | 🟡 | think 覆盖支的先例/偏离未显式：`:312` 只给工具行的 CLI 先例（`subagent-blocks.mjs:341`），而 `:315` 自陈「CLI 状态区 = `currentTool` + `command≤60`」⇒ think 覆盖在 CLI 侧无对应形态 = 有意偏离；`:313-314` 的理由只述动机、未点勘察到的先例与「既有形为何不适用」，也未按端差口径（`docs/vsc/requirements/WEBVIEW.md:114` ∥ 本档 `:3`）落 requirements §4 行（§4 表无 F-W23 行）。 | 补先例行（precedent 坐标 ∥ 对齐部分（工具行前缀逐字）∥ 偏离部分（think 覆盖）∥ 理由），并在 requirements §4 落对齐/端差结论。 |
| 5 | Survey-evidence | 🟡 | 全节（及本档）无勘察源行：未记本轮检查过哪些公开源档（独立档仓）∥ 有无相关 ⇒ 与「未勘察」不可分。 | 补一行：勘察源清单 + 逐源结论（相关 ∥ 不适用）。 |
| 6 | Affected-file size | 🟡 | 本批无受影响档表：核 `subblocks/activity-view.mjs` 现况行数 ∥ 期望增量（`≤±N` ∥ 结构不变）∥ 测试档均未给；该件是否越 500 拆分门无从判（本档 `:449` T-A15 已有「改动后 <500」机检先例可挂）。 | 补受影响档表（核件现行行数 + `≤±N`；>500 附拆分计划）+ 新增用例档名，挂 T-A15 同口径。 |
| 7 | Methodology compliance | 🟡 | 登记面缺行：§10「验收与需求回指」表（行 1–19）无 F-W23 行（形态单源已由 `RENDER-CORE.md:82` 认定在本档 §5.2）⇒ 需求→设计→验收链在此断裂；§8 U-W 表亦无对应行；§6 决策表止于 `:611` D-W40，而同档 `:636` U-W20 已引 `D-W41`（悬空）⇒ 决策表先于本批已缺行。 | 补 §10 行（回指 F-W23 AC①-④ + 用例）+ §8 行；同批补齐 D-W41+（含 U-W20 所指与本批两规则）。 |
| 8 | Clarity | 🟡 | 取值以 zh 字面表述、未绑词键：`:309` ∥ `:313` 写 `思考中…`，未指词源（对照 `:213` 同形表述 `t("status.thinking") + "…"` 与「活动块状态词 `W.thinking`」）⇒ 共享核件内固化 zh 字面则桌面/EN 面失配。 | 三处取值改「词键 + `…` 来源」表述，zh 字面仅作例示。 |
| 9 | Document ownership | 🔵 | 单源指针 `RENDER-CORE.md:82` 坐标与 `WEBVIEW.md:53` 不一致：指针给 `activity-view.js` 的 `:118` `refreshBlock` ∥ `:152` ∥ `:184`；本档给核件 `refreshBlock` `:132` ∥ `updateStopButton` `:166`，且端档现为 2 行 shim ⇒ 坐标无法与任一在档文件对齐（数值漂移；以源码为准须实测——源码不在射程）。 | 指针行只保形态单源 + 核件路径，坐标标注为勘察时点或删；核档 §3 表体若沿勘察行号惯例应同句声明。 |
| 10 | Clarity | 🔵 | 「取值源（闭枚举）」只覆盖写点，未覆盖写入前缺省：块出生至首 chunk 之间状态区取值未述（是否同 `思考中…`、带不带前缀未定）⇒ 闭枚举名不副实。 | 补缺省支一句，或改述为「写点闭集 + 缺省支」。 |

**计数**：🔴 0 · 🟡 8 · 🔵 2

**VERDICT: pass**

## §4 用户批准（主 agent）

## 用户批准

**批准依据（批级放行，覆盖批准门）**：用户 2026-10-20 16:32 逐字「**开**」（开批）+ 16:38 逐字「**自动跑完**」（批级放行 = 批内全链自动跑完，评审照走）。按用户 2026-10-19 23:29 裁定（整批令覆盖批准门），本批不再单停批准门。

- 评审链完整：设计 #38 → 评审 #39（pass · 🔴0/🟡8/🔵2）→ 修正 #40（九 Fixed + 一条 Simplified〔用例档名不入状态档——收口即删，防悬空指针〕）→ requirements §4 端差行（父侧）→ 实施 #41 → 内部审计 CLEAN + 代码评审两轮 pass → 收口。
- 无跳步；无 🔴 遗留。

## §5 实施记录（eng-coder）

## 实施记录（F-W23 · 子代理块头状态词 think 支携带干活者身份）

**状态行**：实施完成（自审 + explore 审计 CLEAN + advisor code review 两轮 pass；1 轮自修）

**实施面**：3 档（1 实现 + 1 用例 + 1 登记），全在 §2 受影响表内；禁改面零触（`thincoder-vscode/webview/activity-view.js` 2 行 shim · `thincoder-desktop/**` · `thincoder-cli/**` · 设计档 · 需求档）。

### 1. 实现（唯一写点）

`thincoder-render-core/subblocks/activity-view.mjs` `noteChunk` think 支（215 → 217 行，设计许可 `≤ +2`）：

```js
} else if (kind === "think") {
  // 嵌套身份前缀（F-W23 · `WEBVIEW.md` §5.2 D-W42）：`sub` 逐 chunk 重算；think 覆盖前一状态词（D-W43）
  const who = (typeof m?.sub === "string" && m.sub) ? `${m.sub}/` : ""
  meta.stateWord = `${who}${W.thinking()}`
  refreshBlock(block)
}
```

- 载体 = `block._subMeta.stateWord` 单字段；think 无条件覆盖（不保留上一工具名——D-W43）。
- 词源零改 = `W.thinking()`（词键 `status.thinking` + 静态 `…`）。
- 边界：`m.sub` 空串 ∥ 非字符串 ∥ `m` 缺省 ⇒ `who = ""` ⇒ 顶层形，零抛。
- 工具行支（`:204-208`）· `toolOutput` 门 · `stateWord()`（`:113`）· `refreshBlock`（`:132`）· `headerText`（`:54`）零改；`noteChunk` docstring 的 think 括注同拍改写（`:195`，行数不变）。

### 2. 用例（批次本地档 + 登记）

- 新档 `thincoder-vscode/test/2026-10-20-vsc-subagent-think-label.test.mjs`（8 用例 T-A33–T-A40；宿主 = happy-dom；状态词读真 DOM 头行 + `_subMeta` 载体）。
- 登记 `thincoder-vscode/test/files.mjs`（同数组行追加一项，行数零增）。

| 用例 | 断言要点 | 读数 |
|---|---|---|
| T-A33 | 嵌套 think ⇒ `advisor#1/` + think 词（载体 + 头行） | 修前红 → 修后绿 |
| T-A34 | 顶层 think ⇒ 裸词；前缀不残留；`sub` 空串/数字 ⇒ 顶层形（批档 §6 边界行） | 绿 |
| T-A35 | 工具行支零变（嵌套/顶层）；`toolOutput` 无 `tool` ∥ 旧载荷无 `tool` ⇒ 零改写 | 绿 |
| T-A36 | VSC 端档 = 纯 `export *` shim；核路径 realpath = `thincoder-render-core` 同件；CLI 不消费核 activity-view | 绿 |
| T-A37 | ① 真 tick 体 `refreshLiveHeaders`（块入活动区 + 入 `S._subBlocks`）∥ ② 覆盖式重建 ⇒ 同值；DOM-only 写入在此会红 | 修前红 → 修后绿 |
| T-A38 | 深层嵌套 `advisor#1/explore#2/` + think 词 | 修前红 → 修后绿 |
| T-A39 | 出生前缺省 = 裸 think 词（读侧） | 绿 |
| T-A40 | 冻结块收 think ⇒ 状态词 / 头行 / 内容零改写 | 绿 |

### 3. 机检读数

- 修前（实现未落）：`cd thincoder-vscode && node test/run.mjs` ⇒ 19 tests / **16 pass / 3 fail**（T-A33 · T-A37 · T-A38——恰为嵌套前缀三例；证明用例真抓缺陷，非串匹配桩）。
- 修后：`node test/run.mjs` ⇒ **19 tests / 19 pass / 0 fail**（既有 11 例 + 本批 8 例）；`npm test` 同读数（19/19，duration ≈ 4.5 s）。
- `npm run lint` ⇒ `check-syntax: 142 JS files OK`。
- 本批 diff 面：`thincoder-render-core/subblocks/activity-view.mjs`（M）· `thincoder-vscode/test/files.mjs`（M）· `thincoder-vscode/test/2026-10-20-vsc-subagent-think-label.test.mjs`（新增）。禁改面 `git status` 零输出（webview shim / 桌面 / CLI 均零改动）。
- `doc_check(mode:"gate")` ⇒ `DOC-CHECK GATE: PASS（0 档）`（批档在声明域外，由 batch 工具自带门判）。

### 4. 审计与评审轮次（终态 = clean）

| 轮 | 面 | 结论 | 处置 |
|---|---|---|---|
| 自审 | 逐文件复读 + 修前/修后双跑 + 禁改面 status | 无遗留 | — |
| explore 审计（只读） | 设计 ↔ 实现逐条（T-A33–T-A40 · AC①–④ · 文件面） | **AUDIT: CLEAN**（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST 四类均无） | 仅报设计档坐标漂移（见 §5.5） |
| advisor code review 轮 1 | 三档代码 + 设计/需求/批档 | **VERDICT: pass**（🔴0 · 🟡1 可选 · 🔵3） | 自修 1 轮（3 条，均用例档） |
| advisor code review 轮 2 | 复核修复 + 新问题 | **VERDICT: pass**（无新问题） | — |

自修内容（1 轮）：
1. T-A34 补 `sub` 空串/非字符串边界断言（批档 §6 行；实现本已正确，补回归护栏，折叠进 T-A34 保持八例）。
2. T-A37 路径① 改走真 tick 体（`ctx.activityEl` + `S._subBlocks` + `refreshLiveHeaders`），不再是直调核叶——门 `!frozen ∧ isConnected` 实测满足。
3. T-A39 断言信息收窄为读侧口径（产者坐标 `state.mjs:65` 降为引证，不再声称本用例验证产者）。

### 5. 设计档漂移（披露，归父侧笔面）

`docs/vsc/design/WEBVIEW.md:319`「工具行写核 `:207` ∥ think 写核 `:211`」——实现后 think 写实际在 `activity-view.mjs:213`（新增注释 `:211` + `who` 行 `:212` 各后移一行；工具行 `:207` 仍准，同档 `:310` 的区间读数 `:198-213` 不受影响）。设计档不在本席笔面，未改，请父侧路由。

### 6. 未触面确认

CLI · 桌面端 · VSC webview shim · 需求档 · 设计档：本批零改动（`git status` 实证）。

## §6 验证与收口（父代理）

## 验证与收口

**交付核验（父侧复跑 · 2026-10-20 16:55）**

- `cd thincoder-vscode && node test/run.mjs`：**19 tests / 19 pass / 0 fail**（既有 11 + 本批 8，≈3.8 s）——父侧重跑，与 #41 读数一致；修前 3 红恰为嵌套前缀三例（T-A33 ∥ T-A37 ∥ T-A38），证明用例抓缺陷而非串匹配。
- `node scripts/check-syntax.mjs`：`check-syntax: 142 JS files OK`——父重跑。
- 代码面父侧实读（`thincoder-render-core/subblocks/activity-view.mjs:198-216`）：`kind === "think"` 支 = `const who = (typeof m?.sub === "string" && m.sub) ? `${m.sub}/` : ""` ⇒ `meta.stateWord = `${who}${W.thinking()}`` ⇒ `refreshBlock`；冻结守卫 `:199` 保持；工具行支 `:204-208` 零改；文件 217 行（设计许可 ≤ +2）。
- `doc_check` gate：**PASS**（3 档 · 0 命中）。

**验收勾销（F-W23 ①–④）**

| # | 判据 | 读数 | 判定 |
|---|---|---|---|
| ① | 嵌套 think ⇒ `<sub>/思考中…` | T-A33 / T-A38（深层 `advisor#1/explore#2`）绿；载体与头行同值 | ✅ |
| ② | 顶层 think ⇒ 恰 `思考中…`（零前缀） | T-A34 / T-A39 绿（含 `sub` 空串 ∥ 非字符串边界、嵌套工具后接顶层 think 无残留） | ✅ |
| ③ | 工具行支零变 | T-A35 绿（嵌套 `advisor#1/read — …` ∥ 顶层 `read — …` ∥ `toolOutput` 与旧载荷零改写） | ✅ |
| ④ | 桌面 + VSC 同源、CLI 零改 | T-A36 绿（端档纯 shim · 核路径 realpath · CLI 不消费核件）· `git status` 对桌面 ∥ CLI 零输出 | ✅ |

**漂移收正（一条 · 父侧机械小改）**：`WEBVIEW.md:319` 的 think 写点 `:211` → `:213`（实施后行号后移；工具行 `:207` 仍准）——坐标-only 改动，可回退。

**收口清单**

- doc_check 交付门（close 触发）：PASS。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无。
- 台账：`#1720` 在途 → 待核销 → **已核销**。
- 设计令牌：链终消费（designId `a020c5a9…`）。
- 新债：无（评审 8🟡/2🔵 全落；#41 内部评审 🟡1/🔵3 自修 / 收正）。
