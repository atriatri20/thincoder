# apply_patch 工具权威语义（APPLY-PATCH）· 编辑工具板块

> 板块 = **编辑工具**；本档 = **apply_patch 语义的权威源**（逐工具权威档之一）。
> 地图与契约要点 = `docs/core/design/TOOLS.md` §6.6 · §8.2——本档不复制其内容（D2）。
> 共享底层 = `docs/core/design/EDIT-HELPERS.md`（EOL 写回 / 新建随目录多数派——本档只指不述）。
> 双端：CLI `thincoder-core/tools/patch.mjs`（`applyPatchTool`）· VSC `thincoder-vscode/src/tools/index.mjs`（`applyPatchTool` 再出口）——VSC 现体同指 `thincoder-core/tools/patch.mjs`。
> 模型可见描述 = `thincoder-core/tool-docs/apply_patch.md`（提示词面 / 产品代码）。
> 需求侧 = `docs/core/requirements/TOOLS.md`（工具系统板块；CLI 树无逐工具需求档）。

## 1. 定位

apply_patch = **统一 diff 形态应用到一或多文件**。**hunk 面原子**：任一 hunk 失败 ⇒ 全不写（hunk 校验与内容计算先于任何写）。**写盘面不原子**：提交段（逐档 `rename`）中途失败时，已提交的档留在盘上、不回滚——回执按盘上实况逐档报（§4 ∥ §7 D-P4）。

**注入径是写盘面的第三态**：编辑器已打开的档走 `thincoder-core/tools/write-path.mjs` 的 `tryInjectedPath`，在**暂存段**即提交（无暂存档）⇒ 暂存段失败时它已经在盘上了（§4）。

**适用**：一次新建多个文件（每文件 `--- /dev/null` 头）· 整文件替换 · 跨文件重构（改接口 + 全调用方）——一个 diff 调用覆盖整变更（一次授权 / 一个 undo 单元 / 一个 turn）。
**不是**：单文件小改（→ edit 更简单）、整文件重写（→ write）、删文件（→ delete 工具）。

## 2. 参数与语法

- `patch`（必须）——unified diff 文本。每文件 `--- a/<path>` / `+++ b/<path>` 头对，后接 `@@ -old,count +new,count @@` hunks；`--- /dev/null` = 新建文件。

**宽容格式**（三处）：

- `+++ b/<path>` 头对可省：既有文件可写 lone `--- a/<path>`（或 `--- b/<path>`）后直接接 hunk；**新建仍须** `--- /dev/null` + `+++ b/<path>`。
- **无坐标 hunk**：裸 `@@` 若上下文行 <2 且含 ≥1 `-` 行 → 定位锚 = hunk 内匹配行序列（空格上下文 + `-` 行按出现序）连续；唯一序列匹配即应用（`-` 后随 `+` = 替换、无 `+` = 删除）；0/1 上下文同待遇；多匹配 → 报错（matches N locations）；**纯 `+` 零上下文（无 `-` 锚）仍拒**（位置不明）；上下文 ≥2 走既有路径。
- **文件头容缺**：`--- /dev/null` 缺 `+++ b/<path>` → 仍拒并**特报**（新文件名不可从 `---` 侧推导）；`-- x` 内容删行不误判文件头；多文件补丁完整 / 容缺可混合；空段过滤（不虚报 touchedPaths）。

标准坐标格式 `@@ -old,count +new,count @@` 不变，两格式并存；hunk 体 `-` / `+` 行语义不变。

## 3. 定位规则（hunk）

hunk 按**上下文 / 删除行定位，非行号**——但上下文必须与文件**精确匹配**（先 `read` 再从实际内容生成 patch）；一 hunk 上下文匹配多处 → 拒绝（须补更多上下文）。

## 4. 约束

- **删文件不支持**（→ delete 工具；`--- b/... +++ /dev/null` 形态显式拒绝）。
- **hunk 面原子**：任一 hunk 失败 ⇒ 全不写（读盘 → 逐档把 hunk 应用到内存 → 暂存 → 提交；hunk 失败发生在第一段）。
- **写盘面非原子（登记行为）**：两段式在提交段（逐档 `rename`）中途失败时，已提交的档留在盘上、不回滚。「原子」在这两面不是一句话，回执不许把写盘面说成全有或全无。
- **注入径在暂存段即提交**：编辑器已打开的档由 `thincoder-core/tools/write-path.mjs` 的 `tryInjectedPath` 接管——它在默认径之前接 `op:"write"`，注释写「注入径例外：编辑器径无暂存档（即时提交）」，调用方据返回值里的 `via` 分辨（`thincoder-core/tools/patch.mjs` 的 `if (r.via === "editor") committedByEditor.add(p.abs)`）。
  所以「一个档都没动」只在**默认（暂存）径**上成立：暂存段失败时该段已写的 `<abs>.thincoder-tmp` 被清掉、那些目标档零字节；**注入径上已提交的档是真的在盘上**，回执必须把它们计进 `k` 并逐档列出——印 `0/N file(s) applied` 就是本批要灭的那句假话。
- **两个失败段，同一套回执**：
  - **hunk 段**（读盘 + 内存算 + 全部 hunk 应用）——任一档失败 ⇒ 一个字节都没写：失败那档出 `— failed:` 行并带 hunk 序，其余档 `not committed`，末行 `k = 0`。
  - **写盘段**（暂存 ∥ 提交）——失败那档出 `— failed:` 行、只报档（hunk 早已应用过）；**此前任一经已落盘的档照列 `modified` / `created` 并计入 `k`**，其后未落盘的档 `not committed`。
- **返回值（全成）**：`Applied patch to N file(s)` + 每文件变更行 + 变更 JS 文件的 syntax-check 注。
- **抛出内容（未全成）**：本工具的失败走**抛错面**（不是返回值）——错误文本 = 逐档行 + 末行汇总；骨架与 `edit` 批面同一（骨架单源 = `docs/core/design/EDIT-HELPERS.md` §7.6「跨工具失败回执骨架」，填充物见 §7 D-P4）：
  - 逐档一行、按补丁序：已落盘档 `  modified <path>` ∥ `  created <path>`（新档）——**逐字复用全成路径那一行**（`thincoder-core/tools/patch.mjs` 的 `  ${p.isNew ? "created " : "modified"} ${p.path}`）；未落盘且没有自身原因的档 `  not committed <path>`。
  - **失败的那一档写失败行** `<定位> — failed: <原因原文>`——hunk 段失败带 hunk 序（`<path> hunk <n> — failed: …`），写盘段失败只有档（`<path> — failed: …`）。没有原因原文的档不出 `— failed:` 行：不替它编一个原因。
  - **末行**逐字 `apply_patch: <k>/<M> file(s) applied, <M−k> failed`；`k ≥ 1` 时后接 `: ` + 已落盘档路径（补丁序、分隔 `, `）。本工具报单位 = 写单位 = 档（一次 `rename` 一档）⇒ 末段 ` — <K> file(s) written` 省略（条件见 `docs/core/design/EDIT-HELPERS.md` §7.6）。`k = 0` 同一形，不回退到别的报法。
- **`not committed` 的场景（可复现）**：三档补丁、第 2 档的 hunk 上下文对不上 ⇒ hunk 段失败：第 2 档出 `b.md hunk 1 — failed: Hunk 1 in b.md does not apply — context not found: …`（该句逐字来自 `thincoder-core/tools/patch.mjs` 的 `Hunk ${h + 1} in ${path} does not apply`），第 1 / 3 档各写自己的 `  not committed a.md` ∥ `  not committed c.md`，末行 `apply_patch: 0/3 file(s) applied, 3 failed`，盘上零字节。写盘段的同一支：三档补丁、第 1 档走注入径（编辑器已打开）已提交、第 2 档写前文档门拒 ⇒ 第 3 档 `not committed`、第 1 档 `modified`、`k = 1`。
- **记账面**：只对**已落盘的档**落 `markDirty` + `clearLastWrite`，成功路径与失败路径同——**注入径那批也在内**（它的 `stage` 调用不传 `record`，写点不替它记）。已落盘却未记账的档会让行号锚护栏拿着写前快照（`docs/core/design/EDIT-HELPERS.md` §7.1 第 4 行会放行），下一笔行号编辑按旧行号改到别处。
- **EOL**：写回按原行尾（`docs/core/design/EDIT-HELPERS.md` §4 F1）；新建按目录多数派（F2）。

## 5. 何时用（模型路由）

跨文件 / 多文件 / 整块 / 新建多个 → apply_patch（一次授权）；单文件小改 → edit；加新行 → insert_after；整文件重写 → write。（路由权威 = AGENT-LOOP 板。）

## 6. 机制面

### 6.1 实现坐标

| 面 | 落点 | 实核 |
|---|---|---|
| 工具对象 / 执行 | `thincoder-core/tools/patch.mjs` 的 `applyPatchTool` | 导出在位 |
| 删文件拒绝 | `thincoder-core/tools/patch.mjs` 的 `Deleting files via patch is not supported` 拒路 | 错误文案在位 |
| `/dev/null` 缺 `+++` 特报 | `thincoder-core/tools/patch.mjs` 的 `needs a "+++ b/<path>" line` 拒路 | 错误文案在位 |
| 返回文案 | `thincoder-core/tools/patch.mjs` 的 `Applied patch to N file(s)` | 在位（全成路径） |
| 写盘段回执（未全成） | `thincoder-core/tools/patch.mjs` 的 `failureReceipt`（写盘段 ∥ hunk 段的 `catch` 同调）组装逐档行 + 末行 `apply_patch: <k>/<M> file(s) applied, <M−k> failed`，随错误抛出。**已落盘集合 = `committed`**（= `committedByEditor` 注入径已提交 ∪ 提交段 `rename` 成功的档）；`inFlight` 记正在处理的那一档，`catch` 靠它点名失败档（错误对象不带路径），hunk 段失败时 hunk 序由 `err.hunkNumber` 带出 | 已落 |
| 注入径（编辑器已打开） | `thincoder-core/tools/write-path.mjs` 的 `tryInjectedPath`——返回 `{ written: true, via: "editor" }`，与 `stage` 组合时目标档已提交、无暂存档 | 已落（`apply_patch` 按 `r.via === "editor"` 把该档计入 `committedByEditor` 与 `committed`——回执与记账两处都算它） |
| 批级记账面 | `thincoder-core/tools/patch.mjs` 的 `markDirty` + `clearLastWrite` 循环，对已落盘的档跑（成功 ∥ 失败两路，注入径那批在内） | 已落（`recordCommitted` 对 `committed` 里的档跑 `markDirty` + `clearLastWrite`，成功 ∥ 失败两路同） |
| 注册面 | `thincoder-core/tools/index.mjs`（import 行 ∥ 工具表注册行） | patch 组（apply_patch / delete） |
| 描述面（模型可见） | `thincoder-core/tool-docs/apply_patch.md` | 在位（`DESC()` 加载） |
| VSC 对位实现 | `thincoder-vscode/src/tools/index.mjs`（`applyPatchTool` 再出口）——现体 = 核 `thincoder-core/tools/patch.mjs` | 同名机制 |

**VSC 端差异（编辑器路径面）**：VSC 端 `thincoder-vscode/src/tools/index.mjs` 的 `applyPatchTool`（核件再出口）——同机制；EOL 写回 / 新建随目录多数派（F1 / F2）同口径（`docs/core/design/EDIT-HELPERS.md` §4）；**无编辑器路径分支**（apply_patch = 整文件域、不进编辑器 range——见 §1）；宽容格式三处（§2）双端同。

### 6.2 描述面（模型可见）落点

`thincoder-core/tool-docs/apply_patch.md` 是提示词面（产品代码）。两处落点均已在位，与 §4 的登记行为一致：

- 首行 `Apply a unified diff to one or more files, atomically: if any hunk fails to apply, nothing is written.` 保留（它对 hunk 面为真，且已点名失败条件）。
- Notes 段的 `one call` 后缀写的是 `every hunk is checked before anything is written`（不对写盘面许诺原子），并有一条失败回执（骨架取自 `docs/core/design/EDIT-HELPERS.md` §7.6「跨工具失败回执骨架」，与 `edit` 批面同一形）：

  ```text
  - A failure in the write phase reports every file block in patch order (`modified` / `created` / `not committed`),
    the block that failed as `<path> — failed: <reason>`, and a final line
    `apply_patch: <k>/<M> file(s) applied, <M−k> failed` plus the committed paths.
    Files already committed stay on disk and are never rolled back.
  ```

写盘段失败时，已落盘的档同样按这两形列出——**注入径在暂存段即提交的那些也算已落盘**：它们不是「没写」，而是先写的那一批。

### 6.3 集成面（RTM 增量）

本工具的失败回执从一个用户可见入口进：一次多档补丁的写盘段失败。增量表与判法住在编辑工具族的共享表，本档只登记自己那行：

| 行 | 动作 |
|---|---|
| `CLI 42-1`（新故事 `CLI 42`：补丁改多档：写盘段中途失败，回执说清哪几档已落盘） | 新增。组件交互 = `apply_patch` 提交段 ⟷ 注入径即时提交 ⟷ 批级记账；断言 = 抛错正文逐档行（`modified a.md` ∥ `b.md — failed: …` ∥ `not committed c.md`）+ 末行 `apply_patch: 1/3 file(s) applied, 2 failed: a.md`，盘上 `a.md` 已改 |
| `CLI 41-1`（既有） | 不改：它判的是核 `edit` 批面，本批不动那一面的行为 |

```text
行号先定在 test/RTM.md / test/rtm/tooling.md，再写用例标题（test('CLI 42-1 …')）。
用例档（实施席新建）= test/integration/apply-patch-write-phase.test.mjs
```

全表与四列口径见 `docs/core/design/EDIT.md` §7。

**先例（写盘段回执）**：先例坐标 = 核批面 `thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch` 收尾——它走同一对构造器（`editEntryFailureLine` / `editBatchSummary`，住 `thincoder-core/tools/edit-receipt.mjs`）：逐条行在前、末行汇总恒为末行。

- **对齐**：逐档 / 逐条行在前、汇总恒为末行；失败的定位行 `— failed: <原因原文>`。
- **偏离一**：单位词与工具名换成 `apply_patch` / `file(s)`，末段按单位省（§7 D-P4）——因为本工具报单位 = 写单位 = 档。
- **偏离二**：逐档行多了第三态 `not committed`（`edit` 批面不列零成功档，它把失败写在条目行上）——本工具要先报「哪些档已经在盘上」，未落盘的档不给原因，不能编。

**公开源调研证据**：`doc_search` 查「写入工具 失败回执 已提交清单 部分落盘」⇒ 命中全在 `thincoder/docs/**`（本档 §1/§4/§7 · `docs/core/design/EDIT.md` §5/§8 · `docs/core/design/EDIT-HELPERS.md` §7.3/§7.4），无一条讲写入工具在部分落盘时的回执形；`index.publicRepos` 声明的 `../.thincoder` · `../thincoder.com` 零相关命中 ⇒ 骨架只能从本仓 `edit` 批面那一条来，外部无先例可参。

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-P1 | **hunk 按锚序列定位**（无坐标 hunk 须含 ≥1 `-` 行） | 上下文/删除行是唯一可靠锚；纯 `+` 无锚 = 位置不明（宁可拒，不许猜） |
| D-P2 | **hunk 面原子**（任一 hunk 失败 ⇒ 全不写）；**写盘面非原子**（提交段中途失败留下已提交档，不回滚） | hunk 校验能先于任何写完成，所以「全不写」在那一面成立；提交是逐档的 IO，进程在中间死掉或 `rename` 抛错时，已提交的档就是盘上事实——许诺「全有或全无」等于许诺一件做不到的事，回执于是只能说假话。**注入径还多一层**：编辑器已打开的档在暂存段即提交（`thincoder-core/tools/write-path.mjs` 的 `tryInjectedPath`「注入径例外：编辑器径无暂存档（即时提交）」）⇒ 「暂存段失败 ⇒ 目标档全未动」只在默认径成立，回执必须按径分开说 |
| D-P4 | **失败回执骨架跨工具统一**：失败行 `<定位> — failed: <原因原文>`、末行 `<工具名>: <k>/<M> <单位> applied, <M−k> failed`（`<单位>` ≠ 档时再接 ` — <K> file(s) written`），两工具逐字同形，只换工具名与单位词，末段有无按单位定（`edit` = `edit batch` / `entries`；`apply_patch` = `apply_patch` / `file(s)`）。骨架单源 = `docs/core/design/EDIT-HELPERS.md` §7.6「跨工具失败回执骨架」。**成功行不统一**：它是业务语（`Edited …` ∥ `Deleted …` ∥ `Applied patch to N file(s)`），不是「哪一条没成」这个问题的答案 | **同一个问题只有一种好样子**：失败回执回答的是同一件事——哪一条没成、为什么、成了几条、写了几档。两种说法让用户学两遍，改一处也不知道另一处该跟着改——两个批面并列看，不统一就是同一个问题被拆成两批走的结果。**内容不统一、骨架统一**：两者的失败对象不同（`edit` = 条目，同档多条各自成 ∥ 不成 ⇒ `k/M` 才有意义；`apply_patch` = 档，hunk 面没有部分成功 ⇒ 单位词 `file(s)`、`k` 即已写档数故末段省略）——差异全部落在骨架的填充位里。**判据共用**：回执只说盘上实况，两个批面都不许出现「什么都没写」而实际写了一部分（`docs/core/design/EDIT.md` §5「文本不说批级谎」） |
| D-P3 | 文件头**容缺但特报**（新建名缺 `+++` 显式拒） | 新文件名不可推导——特报优于笼统语法错 |

### 7.1 三问（本批新件）

| 新件 | 三问答案 |
|---|---|
| 逐档行 `modified` / `created` | `existing: thincoder-core/tools/patch.mjs` · 名 `modified` / `created`（全成汇总 `  ${p.isNew ? "created " : "modified"} ${p.path}`）· 消费者 = 全成路径的回执 ⇒ 失败回执**复用这一行**，逐字同形 |
| 逐档行 `not committed <path>` | `none found: thincoder-core/tools/patch.mjs` 的逐档回执只有上面两态（同坐标），第三态不存在 · 消费者 = 失败回执要点名「这档没落盘」⇒ 新立，沿用同一前缀与两空格缩进 |
| 末行 `apply_patch: <k>/<M> file(s) applied, <M−k> failed` | `existing: thincoder-core/tools/edit-receipt.mjs` 的 `editBatchSummary`（先例 = 核批面 `edit-batch.mjs` 收尾的 `edit batch: … entries applied, … failed — … file(s) written` 那形）· 名 `editBatchSummary` · 消费者 = 核批面 + 桥面 + 本工具 ⇒ 复用同一构造器换工具名与单位词，不新造第二份骨架 |

