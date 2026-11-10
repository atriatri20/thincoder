# edit 工具权威语义（EDIT）· 编辑工具板块

> 板块 = **编辑工具**；本档 = **edit 语义的权威源**（逐工具权威档之一 · 主编辑工具）。
> 地图与契约要点 = `docs/core/design/TOOLS.md` §6.6 · §8.2——本档不复制其内容（D2）。
> 共享底层（EOL 写回 / 失败候选 / U+FFFD）= `docs/core/design/EDIT-HELPERS.md`（**不在此重复**）；行号形的**锚护栏判据**同住该档 §7（本档只指不述）。
> 双端：CLI `thincoder-core/tools/edit-diff.mjs` + `thincoder-core/tools/edit-batch.mjs` + `thincoder-core/tools/file.mjs`（`editTool` 壳 / schema）——CLI ∥ VSC ∥ 桌面同指核三档。
> 模型可见描述 = `thincoder-core/tool-docs/edit.md`（提示词面 / 产品代码——与语义须同改，见 §2 末）。
> 需求侧 = `docs/core/requirements/TOOLS.md`（工具系统板块；CLI 树无逐工具需求档）。

## 1. 定位

edit = **按精确区域替换 / 删除文件内容**——主编辑工具。定位两形态（互斥）+ 三级匹配 + 判定序 4 分支（§4）+ **删行形态**（行号 + 省略 `new_string`——§5 矩阵）。适用面：知道要改 / 删哪一行或哪一段、或能给出当前内容。

**不是**：插入新行（→ insert_after）、按内容哈希行定位（→ hashline_edit）、整块 diff 多文件（→ apply_patch）、整文件重写（→ write）。（路由在模型可见描述的 Routing 段。）

## 2. 参数与 schema

- `path`（必须）——目标文件。
- **形态二选一**：
  - **行号形态（D1）**：`line: N`（单行，1-based）／ `startLine: N, endLine: M`（行范围，1-based 闭区间）——替换该行 / 范围为 `new_string`，**不需 `old_string`**；行号须过**行号锚护栏**（判据 = `docs/core/design/EDIT-HELPERS.md` §7——上一笔写之后目标区落在受影响区内即拒，拒文带漂移量与两条下一步）；
  - **内容形态**：`old_string`（必须）——变化区当前内容；`new_string`——该区期望结果。
- `new_string`——内容形态必须；行号形态**可省略（= 删行 / 删范围）**；**显式空串 `""` 两形态皆拒**（§5 矩阵）。
- `replace_all`——字面替换每处（内容形态 only；行号形态不适用）。
- `edits`（数组批量）——`[{path?, old_string?, new_string?, line?, startLine?, endLine?, replace_all?}]`（条目同顶层形态语义——行号条目省略 `new_string` = 删）；互斥：`edits` 与顶层 `old_string`/`new_string`/`line`/`startLine`/`endLine`。

**两处维护点**：`thincoder-core/tool-docs/edit.md` 是模型可见文本（运行时经 `DESC()` 加载为 description）——与本文档语义一致，改语义须同改。

## 3. 匹配档位（D2——内容形态）

`old_string` 匹配三级档序（宽容——模型差异容忍）：

1. **逐字**——精确字符串匹配。
2. **唯一空白差异窗口**——逐字 occurrences=0 时按行 `trim()` 等价的唯一窗口自动应用（附 note）；多窗口歧义仍 not-found（不猜）。
3. **模糊匹配**——唯一窗口：行级 normalize（统一基准 = 去首尾空白 + 去行尾空格／tab→2 空格／`'`·`‘’`·`“”`·反引号单遍映射到 `"`（无顺序依赖）／无行内折叠）后逐行相等比例 **≥90%** 即匹配（附 `fuzzy matched` note 明示）；多窗口歧义 / 不足阈值仍 not-found 报错（不猜）。

## 4. 判定序（内容形态）

替换后做行级 diff 判定（在 normalize(LF) 域做行级 LCS）：

1. **分支 0（就地替换）**：old 恰单行 ∧ new 恰单行 ∧ 全文唯一匹配 ∧ new 非空 → 就地整行替换（行数不变）。
2. **零重叠**（old 每行都不在 new）：**替换即删**（D3——breaking：old 行整体删除、new 取而代之；新增行改用 insert_after）。
3. **一般 LCS diff**：公共行保留（LCS 序）、old 独有删、new 独有插。
4. **平凡**：new 与 old 行级全等 → 原样替换（no-op 成功）。

**行号形态**（不经判定序；**先过行号锚护栏**——判据见 `docs/core/design/EDIT-HELPERS.md` §7，通过后）：定位行 / 范围 → 替换为 `new_string`（行数 = 范围行数 → new 行数）；**省略 `new_string` = 删行**（行数 → 0），返回 `Deleted line N of <path>` ／ `Deleted lines N-M of <path>` + diff。越界 / 互斥见 §5。

## 5. 约束

- **空串 vs 省略矩阵（D-8.1 裁定）**：
  - 内容形态空 `new_string` = **显式错误**（提示须带保留上下文行；单行替换永不成删除——防删除保护先于分支 0；含 `replace_all` 空串——守卫先于 replace_all 分支）；
  - 行号形态**省略 `new_string`** = 删行 / 删范围（有界意图——删哪行是显式声明）；
  - 行号形态**显式空串 `""`** = 显式错误（防误删——提示「省略 new_string 以删行」）；
  - **批量 `edits` 条目**同顶层（条目含行号 + 省略 `new_string` = 删行；内容条目空串拒）。
- **互斥**：行号形态与 `old_string`；`line` 与 `startLine`/`endLine`；`edits` 与顶层形态——均显式报错。
- **行号校验**：`line`/`startLine`/`endLine` 正整数；`startLine ≤ endLine`；`endLine ≤ 文件行数`（越界报错）；删行形态同校验。
- **`replace_all`**：每处 old→new **字面替换**（不做插入 / 分支 0）；多匹配无 `replace_all` → occurrences 错误。
- **`edits` 数组（逐条成败）**：**写单位 = 档，报单位 = 条**——这两个单位不同，别混：
  - **一档一次写**：同一 `path` 的多条编辑按帧（`docs/core/design/EDIT-HELPERS.md` §7.3）在内存累积，该档**只写一次**；写前文档门判的是该档**最终内容**。
  - **一条失败只废它自己**：条目校验 ∥ 行号锚护栏 ∥ 应用都在内存里逐条做，一条抛错 ⇒ 它记一次失败、累积内容不动，**同档其余条照常应用、其余档照常落盘**。批内零回滚。
  - **该档写不成就整档不成**：档读不到 ∥ 该档最终内容被写前门拒 ∥ 该档写盘抛错 ⇒ **该档所有条失败**，其他档照落。**原因归属**：尚无自己失败原因的条目取档级错误原文（门拒文 ∥ ENOENT）；**已有一条自己原因的条目保留自己那一句**——一条回执讲一件事，把 `old_string not found` 覆写成门拒文会丢掉用户自己能修的那条线索。
  - **行号条目范围重叠**：两条互指对方、**两条都废**（先改哪条都改意），同档其余条照应用。
  - **落法 = 就地写**：逐档一次 `writeThroughPath(abs, content, {op:"write", record})`——记账与写同一跳。**不落暂存档、不走 `rename`**（§8 D-12）；编辑器径（注入面已打开且干净的档）走同一次调用、同一记账点，调用方**无须读 `via`**——没有提交跳，也就没有要跳过的档。
  - **写前文档门挂在 `op === "write"` 之前**：依据 `thincoder-core/tools/write-path.mjs`「if (op === "write") await runDocWriteGate({ abs, content })」——命中即 throw，该档本体一个字节没动；本批不新增门的调用点。
  - **清理面为空**：没有暂存档，就没有要清的东西；门的 `.docgate-*` 片段档由门自己在 `finally` 里删（依据 `thincoder-core/tools/doc-write-gate.mjs`「for (const f of frags) {」）。
- **条目与顺序**：条目内同样二选一（`old_string` 或行号）；顶层 `path` = 无自带 path 条目的默认，条目自带 path 优先。应用顺序分两类（判据见 `docs/core/design/EDIT-HELPERS.md` §7.3）：**行号条目先应用、按 `startLine` 降序**——行号锚在模型 `read` 到的那份快照上，不被同批自己顶偏；范围重叠 ⇒ 那两条都废、两条都报（同档其余条照应用）。**内容条目随后按数组序串行累积**——位置无关寻址，无帧问题。**跨档串行**：逐档依次「读 → 帧排 → 累积 → 写」（依据 `thincoder-core/tools/edit-batch.mjs`「for (const g of groups.values()) {」内的顺序 await）；回显恒为调用序。
- **批量回执（逐条 + 末行计数）**——本批的核心交付是这一块，比「原子」重要：
  - **逐条一行，按调用序回原位**（位置 = 该条在 `edits` 里的下标，跨档交错也一样——模型是按位置对号的）：
    - **成** ⇒ 现成功回执一字不改（`Edited …` ∥ `Deleted …` + diff + 写入点上下文）。
    - **败** ⇒ 逐字 `edits[<i>] — failed: <原因原文>`（i = 该条下标；原因原文 = 抛出的错误文本逐字——含它自带的 `edit for <path>: ` 前缀 ∥ not-found 的 `searched:` 与 `similar lines` 引导 ⇒ 用户能自己修那一条）。
  - **末行恒为一行汇总**（位置 = 末行，理由同 §8 D-9——大回执 preview 保尾，`docs/core/design/TOOL-OUTPUT-LIMITS.md` §2）：逐字 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`；`K ≥ 1` 时后接 `: ` + 已写档路径（条目原样形、去重保序首现序、分隔 `, `）。
  - **三个符号各一义**：`M` = 条目总数 · `k` = 应用成功的条目数 · `K` = 实际写盘的档数（一档多条只写一次 ⇒ `K ≤ M`）。全成 = `edit batch: 3/3 entries applied, 0 failed — 2 file(s) written: a.md, b.md`；一条不成也照同一形，不回退到别的报法。
  - **跨工具失败回执骨架**：表与四条判据住在 `docs/core/design/EDIT-HELPERS.md` §7.6（两工具共用 ⇒ 落共享层，本档不复制）。本批面只填自己的格：定位 = `edits[<i>]`（i = 该条在 `edits` 里的下标）· 工具名 `edit batch` · 单位 `entries`（≠ 档）⇒ 接末段 · `M`/`k` 记条目 · `K` = 已写档数 · 清单去重保首现序、分隔 `, `。
  - **成功行不进骨架**：它是业务语，各工具自持（`Edited …` ∥ `Deleted …` ∥ `Applied patch to N file(s)`）——成功不是「哪一条没成」这个问题的答案。
  - **射程 = 两个批面**：核 `thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch` 与 ACP 桥 `thincoder-cli/src/acp/buffered-edit.mjs` 的 `editBatch` 同一形——逐条一行按调用序 + 末行汇总行。两面的唯一差别在**逐条成功行的措辞**：核 `Edited <path>: replaced N occurrence(s)` + diff + 语法检查 + 写入点上下文；桥 `OK: edited <path> via IDE (N occurrence(s))` ∥ `Deleted <line N|lines N-M> of <path> via IDE`——桥写的是 IDE 缓冲、读不到盘面 ⇒ 无 diff ∥ 无语法检查 ∥ 无上下文（§8 D-16）。
  - **文本不说批级谎**：失败原因里**不出现**「no files written」∥ `nothing written`——那句在批面为假。单档写点说它是真话，故 `doc-write-gate.mjs` 拒文与单形态 `edit` 的 `— nothing written` 后缀**一字不改**（§8 D-11）。成因两入口见 §8 D-5 ∥ D-14。
- **入参容器守卫**：`edits` 真值非数组（字符串 / 对象 / 数字等）或空数组 ⇒ 成形错误「edits must be a non-empty array of {path, old_string | line/startLine+endLine, new_string}」——空数组与真值非数组 = 同一错误面；假值 `edits`（`""` / `0` / `false` / `null`）视同缺席 ⇒ 单形态面（不触本守卫）。
- **条目守卫**：条目非对象（`null` / 字符串 / 数字 / 数组）⇒ 条目级成形错误「edits[i] must be an object of {path, old_string | line/startLine+endLine, new_string}」（i = 数组下标）。
- **守卫与文案单源**：容器守卫 `assertEditsContainer` + 四文案（`EDITS_CONTAINER_ERROR` / `editsEntryError(i)` / `EDIT_ENTRY_NO_PATH` / `editEntryLabel(p)`）单源 = `thincoder-core/tools/edit-diff.mjs`。两个批面（核 ∥ 桥）同传 **`scope:"batch"`** 这一个开关，由它压掉 ` — nothing written` 后缀与任何前缀（§8 D-14 ∥ D-15）。**批级回执文案单源、两个构造器各领各的**：逐条失败行 ← `editEntryFailureLine(label, reason)`；汇总行与其 `<K> file(s) written` 计数 ← `editBatchSummary({ tool, applied, total, unit, filesWritten })`（新档，档位见 §6「档位结论」）。**第一参是定位串、不是下标**：`edit` 批面传 `edits[<i>]`、`apply_patch` 传 `<path>` / `<path> hunk <n>`——两工具的定位天然不同，按下标收只有 `edit` 填得进，`apply_patch` 就只好再写一份 `— failed: ` 字面量（骨架与填法见 `docs/core/design/EDIT-HELPERS.md` §7.6）。两个批面**同调用、各零字面副本**（§8 D-16）。
- **调用点**：核 `thincoder-core/tools/edit-batch.mjs` 与 ACP 桥 `thincoder-cli/src/acp/bridge.mjs` 一律引用调用——桥零字面副本（§6 入参守卫行 / §8 D-7）。
- **零裸抛**：`touchedPaths` 钩子（`execute` 前被多处消费）不抛——真值非数组容器 ⇒ 零触达（返 `[]`；假值视同缺席 ⇒ 顶层 `path` 分支）、非对象条目 ⇒ 按「缺 path」尽力提取（§8 D-6）；**`args` 自身为 null 或非对象 ⇒ 一律按 `{}` 处理**（消费边界规范化——单源谓词 `toolTouchPaths`，见 `docs/core/design/TOOLS.md` §6.17）。
- **桥面同口径**：ACP 桥 `editBatch` 与核批面同一判据面——容器守卫 `assertEditsContainer` 整批拒（经 `toolRouter` catch 渲染 `Error: <msg>` 工具结果）；非对象条目 ∥ 缺 path ∥ 条目校验不过 ∥ 行号锚拒 ∥ 范围重叠 ⇒ **该条失败**，文案同句单源（`editsEntryError(i)` ∥ `EDIT_ENTRY_NO_PATH` ∥ `validateEditEntry` ∥ `lineAnchorRefusal` ∥ `planEditEntries` 的 `reason`）——零裸 TypeError、零反向 RPC（§8 D-15）。
- **非数组容器归宿**：`edits` **真值**非数组 ⇒ 两通道同判——桥 `edit` 路由与核 `execute` 同为真值判 ⇒ 走容器守卫同一错误面（携合法单形态参数的窄形态同样落此面——**不存在「桥径单形态应用」分支**）；`edits` 假值（缺席）⇒ 单形态面（见 §8 D-8）。
- **行数上限**：old/new 各 ≤1000（超限报 edit region too large）。
- **not-found 引导**：错误含 `searched:` + grep 建议 + `similar lines (top 3, score)` 段（LCS 连续子串 / 阈值 0.5 / top3，单行亦覆盖；零候选省略——算法权威见 `docs/core/design/EDIT-HELPERS.md` §2 `findCandidates`）。
- **数据新鲜度**：`old_string` / 行号只来自最新 `read`——改前 re-read；行号形态的漂移不靠自觉，由行号锚护栏机械判（`docs/core/design/EDIT-HELPERS.md` §7），拒文给「重 read」与「改走位置无关寻址」两条下一步。

## 6. 实现单一权威（落点与落位）

**`落位` 列 = 该机制今天在盘的是什么**：`已落` = 在盘可用；`未落` = 落点已定、代码或文本待改（契约看 §5，行内另注者从其注）。契约说什么看 §5，落点在哪儿、在不在盘看本节——两半合起来才是现状。

| 面 | 落点 | 落位 |
|---|---|---|
| 工具对象 / schema | `thincoder-core/tools/file.mjs` 的 `editTool`（含 `parameters`） | 导出在位 |
| diff 内核 / 判定序 | `thincoder-core/tools/edit-diff.mjs` 的 `applyPatchLines` · `computeEditEntry` | 导出在位 |
| 校验 / 互斥 / 删行 | `thincoder-core/tools/edit-diff.mjs` 的 `assertEditArgsExclusive` · `validateEditEntry` · `deleteTarget` · `hasLineParams` · `splitLines` | 导出在位 |
| 入参守卫 | 单源 `thincoder-core/tools/edit-diff.mjs`（`assertEditsContainer` + 四文案：`EDITS_CONTAINER_ERROR` / `editsEntryError(i)` / `EDIT_ENTRY_NO_PATH` / `editEntryLabel(p)`）· 调用点两个、判据同一：核批面 `thincoder-core/tools/edit-batch.mjs` 与桥面 `thincoder-cli/src/acp/buffered-edit.mjs` 都走 `assertEditsContainer`（容器成形错整批抛）+ 逐条判（条目非对象 ⇒ 该条失败，文案 = `editsEntryError(i)`）· `thincoder-core/tools/file.mjs` 的 `editTool.touchedPaths`（零抛、尽力提取） | 已落：两个批面同走 `assertEditsContainer`（容器成形错整批拒）+ 逐条判；`assertEditEntries` 随 D-17 退役，全仓零命中 |
| D1/D2 纯函数 | `thincoder-core/tools/edit-batch.mjs` 的 `normalizeEditLine` · `findFuzzyWindow` · `applyLineEdit` · `FUZZY_MATCH_NOTE` | 导出在位（edit-diff 调用期导入——ESM 循环安全） |
| 三通道共用 | 本地单形态 / `edits` 批量 / ACP 桥 | 同内核 |
| 批量回执汇总行 | 单源构造器 `editBatchSummary({ tool, applied, total, unit, filesWritten })`（新档，坐标见本节末「档位结论」）；两个批面同调（核 `applyEditBatch` 收尾 ∥ 桥 `editBatch` 收尾） | 已落：构造器住 `thincoder-core/tools/edit-receipt.mjs`（§8 D-16），两个批面同调——核 `applyEditBatch` 收尾 ∥ 桥 `editBatch` 收尾 |
| 批量逐条落盘 | `thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch`（逐档一次 `writeThroughPath` `{op:"write", record}`；一条失败只废它自己、同档其余条照应用；档级失败 ⇒ 该档所有条失败） | 已落。承载面 = `thincoder-core/tools/write-path.mjs`（就地 `writeFile` + 同一跳记账） |
| 批量逐条回执 | `thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch`（逐条 `edits[<i>] — failed: <原因原文>` 失败行 · 末行 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`） | 已落：失败行 ← `editEntryFailureLine(label, reason)`、汇总行 ← `editBatchSummary(...)`（两构造器住 `thincoder-core/tools/edit-receipt.mjs`，核 ∥ 桥同调，§8 D-16）；单档拒文字面仍归 `thincoder-core/tools/doc-write-gate.mjs` 与写点自持、不改（§8 D-11） |
| 帧面逐条失败 | `thincoder-core/tools/edit-diff.mjs`（`planEditEntries` 返 `rejections: [{index, reason}]` · `applyPlannedEntries` 的 `onEntryError:"collect"` · `validateEditEntry` ∥ `computeEditEntry` ∥ `applyLineEdit` 的 `scope` 选项） | 已落；两个调用点同一组显式实参——`onEntryError:"collect"` + `scope:"batch"`（核批面 ∥ 桥面，§8 D-15） |
| 注册面 | `thincoder-core/tools/index.mjs` 的静态注册表（`file.mjs` 组） | file 组 |
| 描述面（模型可见） | `thincoder-core/tool-docs/edit.md` | 已落——逐条成败文本在位：`each entry reported as its own block … an entry that fails is named and the rest still apply` ∥ `overlap ⇒ those two entries fail … the rest of the batch still applies` ∥ 末行计数行（契约见 §2 末 ∥ §8 D-11） |
| VSC 对位实现 | `thincoder-vscode/src/tools/index.mjs` 的 import 行直接取核 `editTool`（`@thincoder/core/tools/file.mjs`）——端侧零实现副本 | 同机制（同一份判据与记账表） |

**行号锚护栏的通道覆盖**：判据与拒文单源（`docs/core/design/EDIT-HELPERS.md` §7）；通道闭集（五条逐条判「已接 ∥ 不接 ∥ 不适用」）同住 §7.4——本档不复制那张表。

桥面读 IDE 缓冲、写回走 `fs/write_text_file`，不经 `writeThroughPath` ⇒ 判据在 `editSingle` / `editBatch` 里同调；记账由桥在写回成功后自落，键 = `resolveInCwd` 后的绝对路径。桥的批量逐条成败与核同一条流水线（§8 D-15）。

**桥面已落**：`thincoder-cli/src/acp/buffered-edit.mjs` 的 `editBatch` 走六段流水线——① `assertEditsContainer` 整批拒 → ② 分组 → ③ 逐档读缓冲 → ④ 行号锚逐条判 → ⑤ `applyPlannedEntries` 配 `onEntryError:"collect"` + `scope:"batch"` → ⑥ 有成功条的档写缓冲一次并记合并快照；收尾调 `editEntryFailureLine` / `editBatchSummary`（§8 D-15 ∥ D-16）。其余三面：

- **三入口各记一笔**：`write` / `editSingle` / `editBatch`。
- **帧**：同 R1–R4。
- **连坐范围**：读缓冲失败 ∥ 写缓冲失败只连坐该档；零成功的档不写、不记账。
- **合并快照只累计成功条目**：`startLine` = 成功条 `editStartLine` 最小，`shift` = 成功条 `lineShift` 之和。

**VSC 端差异**：仅编辑器路径——doc 已打开 → WorkspaceEdit range 替换（定位偏移与 `doc.positionAt` 同坐标系——`lfOffsetToRaw` 把 LF 域偏移映射回 CRLF 原文，见 `docs/core/design/EDIT-HELPERS.md` §6）。工具实现与描述面均单源引自核（VSC 自持实现面已于 W14 退场）——行号锚护栏因此在两端同判，无端面分叉。

**同类扫描**：「真值判断后点链」缺陷类——`thincoder-core/tools/**` 全扫仅 `file.mjs` 的 `touchedPaths` 一处（已卫）；其余工具触摸面（`read` / `insert_after` / `hashline_edit` 单参形态；`apply_patch` 有 try/catch 包裹）无一命中。**桥面**（`thincoder-cli/src/acp/bridge.mjs`）：`[null]` / 非对象条目同守卫同文案、跨档文案零副本（同批收——§5 / §8 D-7）。

**消费面续扫**：钩子消费点十处（核 6 · VSC 4——逐点坐标见 `docs/core/design/TOOLS.md` §6.17 表）已归单源谓词 `toolTouchPaths`；本档 `touchedPaths` 本体零改。

**档位结论（本批）**：无档跨档。

- `thincoder-core/tools/edit-diff.mjs` 已贴近 500 行硬线，**本批不在它里面加件**：两件批级回执构造器落一个新档，`edit-diff.mjs` 本批零增长——这正是选新建档而非就地加的理由（§8 D-16）。
- 其余本批改动档（`edit-batch.mjs` ∥ `patch.mjs` ∥ `write-path.mjs` ∥ `file.mjs` ∥ `buffered-edit.mjs`）均在档内。
- 行数读数不进本档：读数口令 = `doc_check lines`。

```text
新档（实施席新建）= thincoder-core/tools/edit-receipt.mjs
```

- **批量落盘的做法与先例**（对齐优先，偏离给理由）：先例坐标 = `docs/core/design/APPLY-PATCH.md` §4「多文件原子」与 §6.1 的实现坐标（`thincoder-core/tools/patch.mjs` 的 `applyPatchTool`）——它走 `writeThroughPath` 的 `stage:true` → `op:"commit"` 两段缝，回执在提交段失败时抛裸 `rename` 错误、不报已提交清单。**本批不走那条缝**：用户撤掉「失败即全无」之后，暂存的唯一产物消失（§8 D-12），就地写反而保住模式位、符号链接、硬链接、属主。偏离理由 = **前提消失**，不是先例不好；`patch.mjs` 本批零改，它自己的两段式原样在位。
- **公开源调研证据**：`doc_search` 查「批量 edits 原子落盘 两段式 失败回执 暂存档」⇒ 命中全在 `thincoder/docs/**`（`EDIT-HELPERS.md` §7.3 批帧 · 本档 §5/§6/§8 三条 · `TOOL-OUTPUT-LIMITS.md` §3 · `BATCH-RECORD.md` §4.19 · `AGENT-LOOP-SUBAGENT.md` §6.58.3 · `TOOLS.md` §4.2），无一条讲多档落盘的原子性做法；`index.publicRepos` 声明的 `../.thincoder` · `../thincoder.com` 零相关命中。

## 7. 集成测试设计（RTM 增量）

本批从索引起算（`test/RTM.md` 的故事索引 + `test/rtm/<族>.md` 的用例行），不另列「本批需要哪些场景」。

| 行 | 断 ∥ 冗余 ∥ 缺 | 组件交互 | 断言什么业务结果 | 用户可见入口 | 回指 |
|---|---|---|---|---|---|
| `CLI 41-1` | 不断、不冗：它判核 `edit` 批面，本批不动那一面行为 | `edit` 的 `edits` 形 ⟷ 逐档就地写 ⟷ 写前文档门 | 一条失败只废那一条；末行 `edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: <name>.txt` | 真 `edit` 调用 | `F16` |
| `CLI 41-2` | **缺**（新增，用例已落）——它判桥面逐条成败；`CLI 41-1` 判的是核批面，判不到这一面 | ACP 桥 `editBatch` ⟷ IDE 缓冲读写（`fs/read_text_file` ∥ `fs/write_text_file`） ⟷ 帧排 ∥ `onEntryError:"collect"` | 一条 `old_string` 匹配不到 ⇒ 回执 `edits[1] — failed: …` + 末行 `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: …`，IDE 缓冲只含成功条 | ACP 客户端（IDE）发起一次批量编辑 | `F16` · `F17` |
| `CLI 42-1`（新故事 `CLI 42`） | **缺**（新增，用例已落）——它判 `apply_patch` 写盘段的回执；两个 `edit` 批面的行都判不到 | `apply_patch` 提交段 ⟷ 注入径即时提交 ⟷ 批级记账 | 第 2 档失败 ⇒ 抛错正文逐档行（`modified a.md` ∥ `b.md — failed: …` ∥ `not committed c.md`）+ 末行 `apply_patch: 1/3 file(s) applied, 2 failed: a.md`，盘上 `a.md` 已改 | 真 `apply_patch` 调用 | `F17` |

**行号先行**：三行的编号先落 `test/RTM.md` 的索引与 `test/rtm/tooling.md` 的节，再写用例标题（用例名逐字带编号，如 `test('CLI 41-2 …')`）。

```text
用例档：CLI 41-1 = test/integration/edit-batch-entry-outcome.test.mjs（既有）
        CLI 41-2 = test/integration/acp-bridge-batch-outcome.test.mjs（新建）
        CLI 42-1 = test/integration/apply-patch-write-phase.test.mjs（新建）
```

**41-2 的入口若有障碍**：本仓无真 IDE 驱动器时，以 `thincoder-cli/src/acp/bridge.mjs` 的会话入口 + 桩对端驱动。它仍判「桥 ⟷ IDE 缓冲」两侧交互，不是单档内部分支；不得改成一次性断言桥内部函数的返回值——那退化成单测。

**本批单测（改完面反馈环，收口删）**：档按惯例住批次档目录、名随该档（同名 + `test` + `.mjs`），本档不写死它的路径；跑 `node --test <该档>`。

各例逐条回对本档 §5 ∥ §7 的契约面与需求条目 `F16` ∥ `F17`：回执三形、逐条失败、档级连坐、注入径记账各一例；另两例走命令面（退役符号零命中 ∥ 记账归属的 `grep` 量法）；集成面归 `CLI 41-2` ∥ `CLI 42-1`，不在单测档内判。

## 8. 并入的关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-1 | **行号形态**（`line:` / `startLine–endLine`）与内容形态并存 | 行号形态免除「编造上下文」 |
| D-2 | 三级匹配**宽容档序**（逐字 → 空白窗口 → 模糊 ≥90%） | 模型生成的 `old_string` 常带空白 / 缩进 / 引号差异；一律 not-found 会逼模型重头重写 |
| D-3 | **零重叠 ⇒ 替换即删**（breaking） | 「插入保留旧行」使简单替换产生双份内容（实害） |
| D-4 | 显式空串 = **错误**、省略 = 删行 | 空串是手滑最可能形态（防误删）；省略是有界显式意图 |
| D-5 | `edits` 数组 = **逐条成败、逐档落盘**：内存里逐条校验 ∥ 应用，一条失败只废它自己；每档一次就地写 + 同一跳记账。**不作「失败即全无」的许诺** | 用户 2026-11-09 11:54 定的口径——一条不成功就反馈那一条，不要整批返工。旧设计把「原子」焊在准备段（任一条失败 ⇒ 全批零写），代价是**一条坏条目让全批重做**；那次实报（回执说零字节、盘上写了一半，复现三次）正是这个许诺撑不住的证据。跨档一次写盘在本平台不存在——既然不承诺它，就不必用暂存去伪装它。**写单位 = 档**（同档多条必须合成一次写，否则第二条读到写前的旧内容）、**报单位 = 条**：两个单位不同，回执两个都报（`<k>/<M> entries` ∥ `<K> file(s)`） |
| D-6 | 入参守卫落 **`touchedPaths` 零抛 + 执行阶段单源成形错误** | 钩子内抛错（即便成形文案）会从首个未守卫点逸出（实测 = VSC L3 前置查询段→`Promise.all` 批级拒绝、裸 TypeError 直达用户）；零抛 ⇒ 拒绝统一落 `applyEditBatch`（与空数组同点同文）。**消费侧兜底**：十处消费点归单源谓词 `toolTouchPaths`（`docs/core/design/TOOLS.md` §6.17）——零抛契约两侧同护。 |
| D-7 | 跨档单源 = **`thincoder-core/tools/edit-diff.mjs`**（桥面同批收）：两守卫 + 五文案，核 `thincoder-core/tools/edit-batch.mjs` 与 ACP 桥 `thincoder-cli/src/acp/bridge.mjs` 同调用、桥零副本 | 两侧已共同导入 `edit-diff` 校验词汇（`assertEditArgsExclusive` / `validateEditEntry` 等先例）——单源住共用导入面，条件与文案同时锁死 |
| D-8 | 非数组容器的通道归宿 = **归一**：桥 `edit` 路由判据改与核同（`Boolean(args?.edits)` 真值判）——`edits` 真值 ⇒ 两通道同入批量分支、同容器错误面；假值 ⇒ 单形态面。窄形态（真值非数组 + 合法单形态参数）不再有「桥径单形态应用」分支 | 分歧的代价 = 窄形态下写落地而门禁 / 变更记账 / L3 看到零路径（fail-open 面——`touchedPaths` 真值非数组返 `[]` 的前提「该调用必败」被打破）；归一恢复该前提 ⇒ `[]` 语义重新为真，该判据零改 |
| D-9 | 汇总行 = **恒定末行**（不设「仅大回执」分支） | tail 恒保留 ⇒ 末行恒可见；恒定 = 判据单点（无阈值分支、无临界尺寸二义）；小回执多一行 = 零害 |
| D-10 | 失败的边界**只到失败的那一条 ∥ 那一档**：一条失败不清、不回滚任何已写的档；同档其余条照应用，其他档照落盘 | 盘上留下的是事实——用户要的是「成了的不许返工」，回滚正好把已成的那几条重新变成待办。清理面为空：本批不落暂存档，`.docgate-*` 片段档由门自己在 `finally` 里删（依据 `thincoder-core/tools/doc-write-gate.mjs`「for (const f of frags) {」） |
| D-11 | 写前文档门拒文 **一字不改**（含「本次写入未落盘——目标档字节逐字不变（零字节）。」那句）；单形态 `edit` 的 `— nothing written` 后缀同不改 | 那句对**它报的那一档**为真（该档确实零字节），逐条回执把它原样当作该档条目的失败原因 ⇒ 它从「批面的假结论」变回「那一档的真话」。改门文等于让单档面去替批面说话，而批面已不再需要它代说 |
| D-12 | **就地写，不落暂存档**：逐档一次 `writeThroughPath(abs, content, {op:"write", record})`——记账与写同一跳 | 上一版走 `stage` → `commit`（暂存 + `rename`），为的是「任一跳失败 ⇒ 目标档零字节」那个许诺。用户 2026-11-09 11:54 撤掉该许诺（要逐条成败、成了的不许返工）⇒ **暂存唯一的产物随之消失**，核过一遍没有别的东西需要暂存：写前文档门挂在 `op === "write"` 之前（依据 `thincoder-core/tools/write-path.mjs`「if (op === "write") await runDocWriteGate({ abs, content })」），命中即 throw，「该档一个字节没动」**不依赖暂存**。就地写反而保住模式位 ∥ 符号链接 ∥ 硬链接 ∥ 属主——上一版为补模式位要外加 `stat` + `chmod`，为保不住那三样要登记接受，两笔账同时消失 |
| D-13 | **就地写的登记后果**：进程在 `writeFile` 中途被杀，目标档可能被截断（暂存 + `rename` 能挡这一窗）；已写成的档**不回滚**——失败只让失败的那一条 ∥ 那一档不成 | 崩溃窗与平台其余内容写点同形（单形态 `edit` ∥ `write` ∥ `insert_after` ∥ `hashline_edit` 全部就地写），不是批面引入的新形态。写下来而不是留白：没写下的风险与已接受的代价，在回执上读起来一样。不回滚的理由 = 回滚是同一个 IO 面上的第二串写，它失败时留下「写了一半又回滚了一半」且无记录；按名逐条报永真，回滚做不到 |
| D-14 | **批级回执文案三件**（单源本批上提为具名构造器——D-16）：逐条失败行 ○ `edit batch:` 汇总行 ○ `<K> file(s) written` 计数。核批面与桥面同传 **`scope:"batch"`** 这一个开关，由它同时压掉前缀与 ` — nothing written` 后缀 | **现件（实况）**：两件具名构造器住 `thincoder-core/tools/edit-receipt.mjs`——`editEntryFailureLine(label, reason)` ∥ `editBatchSummary({ tool, applied, total, unit, filesWritten })`；核批面与桥面同调、各自零字面副本（D-16）。`edits[` 起头的**文案**两件、**并存不归一**：`thincoder-core/tools/edit-diff.mjs` 的 `editsEntryError(i)`（`edits[${i}] must be an object of …`——入参成形错、整批抛）与两个调用点传进构造器的定位串 `edits[${i}]`（`thincoder-core/tools/edit-batch.mjs` ∥ `thincoder-cli/src/acp/buffered-edit.mjs`——逐条结果、不回抛）。两者同一下标标签族：一个答「你这批的入参不成形」，一个答「这一条没成」，改一处须同看另一处。`— failed: ` 字面量单源 = `thincoder-core/tools/edit-receipt.mjs` 的 `editEntryFailureLine`；`failed:` 在核内其余命中全在别的工具面（`thincoder-core/agent-tools/browser-async.mjs` 的 `failed: ${clip(entry.error)}` ∥ `thincoder-core/agent-tools/bash-async.mjs` 的 `spawn failed: …`）——跨工具一家族，不是编辑工具的回执件，不复用。**`scope:"batch"` 一个开关压两件**：开它即压掉前缀与 ` — nothing written` 后缀。原先「少传一个参数就两种翻车」的两条路（`rich` 反转、缺省 `abortPrefix` 自己回来）随 `EDIT_ABORT_PREFIX` / `assertEditEntries` / `abortPrefix` 形参链退役而不存在（D-17）——今天没有「必须记得传某个参数，否则假后缀自己回来」这一面 |
| D-15 | **桥面批量 = 核批面同一口径**（逐条成败、逐档一次写回、批内零回滚）。`thincoder-cli/src/acp/buffered-edit.mjs` 的 `editBatch` 走与 `applyEditBatch` 同一条六段流水线：① 容器守卫（整批拒）② 分组（非对象条目 ∥ 缺 path ∥ 条目校验不过 ⇒ 该条失败、不进组）③ 逐档读缓冲（读不到 ⇒ 该档所有条失败，原因取读错误原文）④ 行号锚护栏逐条判（命中只废那一条）⑤ 帧排 + `onEntryError:"collect"` 累积（重叠两条互指、各得一行）⑥ 有 ≥1 条成功的档写缓冲一次并记合并快照，零成功的档不写不记账；写缓冲抛错只连坐该档、已有自己原因的条目保留自己那句。桥的 IO 缝（`readBuffer` / `writeBuffer` / `absOf`）与消息契约字段零改 | 用户 2026-11-09 12:53「端侧也要改」——同一机制两个口径是缺陷。桥原本的两段结构（先全算、再逐档写回）不是原子性装置：第一阶段从「闸」变成「逐条判定点」，两段仍成立、不拆档——`readBuffer` / `writeBuffer` 指的是 IDE 文档缓冲（传输事实），不是暂存区。模型可见描述早已按逐条成败写（依据 `thincoder-core/tool-docs/edit.md`「Each entry gets its own block in the receipt, in call order: one that fails is named, and the rest still apply.」∥「and a final count line: `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: a.md, b.md`」）——桥此前的行为与描述面相反，本条把实现拉回描述面 |
| D-16 | **批级回执文案上提为具名构造器**（`editEntryFailureLine` ∥ `editBatchSummary`，落新档——档位见 §6「档位结论」），核批面与桥面同调；桥面**补上末行汇总行** | 汇总行的数字（`M` / `k` / `K` / 已写档清单）全在内存里，不读盘、不起进程 ⇒ 桥面与核面的这条差别没有宿主能力依据，属该消除的面差（`EDIT-HELPERS` §7.4「桥面不写的三样」只剩 `diff` / 语法检查 / 写入点上下文，那三样读盘面内容）。且描述面对汇总行无条件承诺（D-15 引句）——桥不写它，是描述面与实现面相反 |
| D-17 | **`EDIT_ABORT_PREFIX` ∥ `assertEditEntries` ∥ `abortPrefix` 形参链退役** | 两者的最后一个使用者都是桥面：`EDIT_ABORT_PREFIX` 只被 `thincoder-cli/src/acp/buffered-edit.mjs` 拼回（另有 `applyPlannedEntries` 的缺省值），`assertEditEntries` 的注释自己写着「调用面 = 整批拒的调用方：ACP 桥」。桥改 `scope:"batch"` + 逐条判定后两者零使用者——留着就是教下一个读这里的人「桥面整批 abort」，那是假话。退役面 = 常量 ∥ 函数 ∥ `abortPrefix` 形参及三处拼接（`computeEditEntry` 的 `prefix` ∥ `applyLineEdit` 的 `prefix` ∥ `applyPlannedEntries` 的缺省值）；`scope:"batch"` 开关保留（它还压 ` — nothing written` 后缀） |

