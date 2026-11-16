# edit 工具（EDIT）· 设计

> 需求 = `docs/core/requirements/TOOLS.md` 的 `F16`（edit 批量逐条成败）；共享底层 = `EDIT-HELPERS.md`。

## 1. 参数

工具入口 = `editTool`（`thincoder-core/tools/file.mjs`，`name: "edit"`）。

支持顶层单次或 edits 数组。定位可用 line/startLine+endLine 或 old_string；形态互斥。replace_all 只服务内容形。

`new_string` 的空值按形态分两种结局，判据是**删除意图由谁表达**：行号形的删除意图由行号表达，内容形的删除意图只能由内容表达。

| 形态 | 删除意图由谁表达 | `new_string: ""` 的结局 |
|---|---|---|
| 行号（`line` ∥ `startLine`+`endLine`） | 行号已指明删哪一行 ∥ 范围 | 删除该行 ∥ 范围，与省略 `new_string` 逐字段相同——`deleted: true`，回执 `Deleted line N of <path>` ∥ `Deleted lines N-M of <path>`（`deleteTarget`，`thincoder-core/tools/edit-diff.mjs`） |
| 内容（`old_string`） | 只有 `new_string` 的内容能表达 | 显式错：报文点名这是内容形、说明内容形不能收空串的理由、并指到行号形可传空串（`EMPTY_NEW_STRING`，`thincoder-core/tools/edit-diff.mjs`） |

内容形不能放开：`replace_all: true` 配空串会删掉全部匹配，无界意图不能被当成删除。

行号形的空值没有第三种结局：`""` 与省略是同一条路，不是两条判据。填这个字段的人与省略这个字段的人，得到同一个结果。

**工具描述面与本表同口径**：`thincoder-core/tools/file.mjs` 的五段描述与本表同口径，但这五段上的「同口径」是分段的，不是同一句复制五遍——每段只写自己管的那一形态：

- `new_string` 与 `edits` 两段两侧都写：行号形传空串即删除（`edits` 段写「or pass an empty string — same delete」），内容形传空串是显式错。
- `line` ∥ `startLine` ∥ `endLine` 三段只写行号侧（「an empty string deletes too」），不写内容形那半句：这三段自述 `mutually exclusive with old_string`，在声明互斥的同一段里解释另一形态的空串结局，与同段自相抵。

`thincoder-core/prompts/knowledge/tool-edit.md` 有两处删除句——「give new_string to replace, or OMIT new_string (an empty string deletes too) to delete the line/range」与「Delete a line/range by number → omit new_string (an empty string deletes too)」——两处按同一句改，只改一处就还是两份活本。

模型读描述就等于读本节：描述说「空串是错误」而本节说「空串是删除」，就是同一条规则两份活本。

## 2. 匹配与应用

内容匹配依次尝试精确、唯一空白差异窗口和唯一模糊窗口。模糊窗口的阈值常量是 `FUZZY_MATCH_THRESHOLD`（`thincoder-core/tools/edit-batch.mjs`，行级 normalize 后逐行相等比例 ≥ 0.9）。歧义或找不到时报错并给候选。

行号必须通过 `lineAnchorVerdict`（`thincoder-core/tools/write-path.mjs`）。批量行号条目先按 startLine 降序，重叠双方失败；内容条目随后按调用序。

**行号形的应用单点 = `applyLineEdit`（`thincoder-core/tools/edit-batch.mjs`）。** 开头取一次局部量：

```
const target = entry.new_string === "" ? undefined : entry.new_string
```

其后的删行分支与替换分支都读 `target`。「归一」指的就是这一次取值——`""` 在这里被读成 `undefined`，与调用方省略 `new_string` 得到同一个局部量。

结果于是走既有的 `deleted: true` 分支，不靠 `splitLines("")` 切出空数组的巧合。

**不就地改条目对象**：批量里条目是调用方数组的元素，就地赋值会把兄弟条目一起改掉。

**也不在 `computeEditEntry`（`thincoder-core/tools/edit-diff.mjs`）里另造一个 `new_string: undefined` 的条目送进下游**：批面（`thincoder-core/tools/edit-batch.mjs` 的条目预扫）与桥面（`thincoder-cli/src/acp/buffered-edit.mjs` 的分组步）都先调 `validateEditEntry`，那里一拒，改写出来的条目就到不了 `applyLineEdit`。

要让它到达下游，就得两处同时放宽、又同时保留下游防御——一个输入两套语义，正是要灭的漂移。

**行号形空串的判定只有一处**：`thincoder-core/tools/edit-diff.mjs` 的 `validateEditEntry` 行号分支不再对 `""` 报错，`thincoder-core/tools/edit-batch.mjs` 的 `applyLineEdit` 也不再报错，结局由上面那一次取值决定。为此退场的有：常量 `EMPTY_NEW_STRING_LINE`，以及 `edit-batch.mjs` 对它的导入。

**保留不动的**：`thincoder-core/tools/edit-diff.mjs` 的 `applyPatchLines` 对内容形空 `newText` 的失败返回、同档 `isSingleLineReplace` 的 `new_string !== ""` 守卫、内容形的全部判定序（空串先于 `replace_all` 分支）、`applyLineEdit` 的越界与互斥校验。

同档在内存累积并一次写；条目失败不撤销其他已写条目，档级失败使该档条目失败。回执按原调用序并报告真实条目/文件数。

## 3. 写与桥

`writeThroughPath`（`thincoder-core/tools/write-path.mjs`）统一当前文档门、写盘、编辑器路径和记账。ACP 桥使用同一 `planEditEntries`/`applyPlannedEntries`（`thincoder-core/tools/edit-diff.mjs`）与回执构造器，IO 是 IDE 缓冲。

**路由门**（`thincoder-cli/src/acp/bridge.mjs`）：`base === "edit"` 且单形态给了字符串 `new_string` 且（给了 `old_string` 或 `hasLineParams(args)`）即走桥——`hasLineParams` 从 `thincoder-core/tools/edit-diff.mjs` 导入。空串是字符串，所以行号形传 `""` 经桥就是一次删除。

**回执说真话**：经桥的单形态行号删除与核面同措辞——`Deleted ${deleteTarget(out)} of ${p}`，不得印成 `OK: edited`。跨端对同一输入的结局与说法必须同形。

桥不伪造盘面 diff、语法检查或上下文。

## 4. 验证

以下是本机制的常驻判据，读者按「输入 → 操作 → 可观察结果」读：

- **行号形空值与省略同结局**：同一份内容、同一行号，一笔传 `new_string: ""`、一笔省略 `new_string` → 两次返回的 `updated` ∥ `deleted` ∥ `lineShift` ∥ `occurrences` 逐字段相等，回执都是 `Deleted line N of <path>`。
- **范围形同一条**：`startLine`+`endLine` 配 `""` → 同一范围被删，回执 `Deleted lines N-M of <path>`，与省略逐字段相等。
- **批量里两笔混用**：`edits` 里一条 `""`、一条正常替换 → 两行回执分别以 `Deleted line N` 与 `Edited …replaced N occurrence(s)` 起头，各自生效；调用方传入的条目对象读回来与传入时逐字段相同。
- **内容形仍拒**：`old_string` + `new_string: ""` → 抛错，报文点名这是内容形并指到行号形；`replace_all: true` 配空串同样抛错，不静默删掉全部匹配。
- **工具描述面**：读者读 `file.mjs` 的 `new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits` 描述与 `tool-edit.md` 的删除句，得到的空串结局与 §1 的表一致；哪一段说「空串是错误」，哪一段就不合格。
- **ACP 桥**：行号形传 `""` 经 IDE 缓冲的单形态删除 → 回执以 `Deleted` 起头，不是 `OK: edited`。省略 `new_string` 的单形态走不到桥（路由门要字符串 `new_string`），它的回执由核面出。
- **失败面各归其位**：越界、行号重叠、内容歧义/未匹配仍报自己的句；行号形空串不再出现在任何报错面。
