# write 工具权威语义（WRITE）· 编辑工具板块

> 板块 = **编辑工具**（edit / insert_after / hashline_edit / apply_patch / write + 共享 helper）；本档 = **write 语义的权威源**（逐工具权威档之一）。
> 地图与契约要点 = `docs/core/design/TOOLS.md` §6.6（编辑工具地图）——本档不复制其内容（D2 单一权威源）。
> 共享底层 = `docs/core/design/EDIT-HELPERS.md`（行尾 / 失败候选 / U+FFFD 编码探测——本档只指不述）。
> 双端：CLI `thincoder-core/tools/file.mjs`（`writeTool`）· VSC `thincoder-vscode/src/tools/file.mjs`（同机制，各自实现）。
> 模型可见描述 = `thincoder-core/tool-docs/write.md`（提示词面 / 产品代码——本档不复述）。
> 需求侧 = `docs/core/requirements/TOOLS.md`（工具系统板块；CLI 树无逐工具需求档）。

## 1. 定位

write = **整文件替换 / 新建**——覆盖已有文件（read 后确认整改意图）或创建新文件（含父目录）。

**不是**：精确区域改（→ edit）、加新行（→ insert_after）、按内容哈希寻址（→ hashline_edit）、多文件 diff（→ apply_patch）。

## 2. 参数与 schema

- `path`（必须）——目标路径。
- `content`（必须）——全文内容。

## 3. 语义

- **整文件替换**：write 覆盖 WHOLE 文件；模型可见描述明示「先 read：小改动用 edit / insert_after」（防误覆盖——描述面 `thincoder-core/tool-docs/write.md`）。
- **原子**：要么完整写、要么失败（不残留半写）。
- **autoSyntaxCheck**：写 JS 类文件（`.mjs` / `.cjs` / `.js`）后自动 syntax-check，结果附注（`node --check`）。
- **返回**：`Wrote N chars to <path>` + git diff + syntax-check note。

## 4. EOL 语义（两条规则分清——细则见 `docs/core/design/EDIT-HELPERS.md` §4）

- **覆盖既有文件（F1）**：写回按**原行尾**（`detectFileEol` / `joinWithEol`——原 CRLF → CRLF，diff 只含改动行）。
- **新建文件（F2）**：默认 LF；**同目录 CRLF 多数派** → 跟随 CRLF（`majorityEol`——防仓库行尾混杂）。

## 5. 何时用（模型路由）

新建文件 / 整文件重写 → write（read 先确认）；小改 → edit；加行 → insert_after；多文件 / 整块 → apply_patch。

## 6. 机制面

### 6.1 实现坐标

| 面 | 落点 | 实核 |
|---|---|---|
| 工具对象 / 执行 | `thincoder-core/tools/file.mjs:192`（`writeTool`） | 导出在位 |
| 写路径记账（dirty / lastWrite） | `thincoder-core/tools/write-path.mjs:41`（`recordWrite`）· `:74`（`dirtyRefusalMessage`） | 由 `file.mjs:43` re-export |
| 行尾 helper | `thincoder-core/tools/shared.mjs:67`（`detectFileEol`）· `:73`（`joinWithEol`）· `:82`（`majorityEol`） | 导出在位 |
| 描述面（模型可见） | `thincoder-core/tool-docs/write.md` | 在位（`DESC()` 加载） |
| 注册面 | `thincoder-core/tools/index.mjs`（`builtinTools` · file 组） | 组陈述见 `docs/core/design/TOOLS.md` §6.2 |
| VSC 对位实现 | `thincoder-vscode/src/tools/file.mjs` | 同名机制 · 独立实现 |

**VSC 端差异**：VSC 端 `file.mjs`（`writeTool`）——① **编辑器路径**：doc 已打开 → 编辑器写（undo 单元）；否则本地写盘；② autoSyntaxCheck 与 EOL 两规则（F1 覆盖按原行尾 / F2 新建随目录多数派）双端同口径（`docs/core/design/EDIT-HELPERS.md` §4）。

### 6.2 与 edit / hashline_edit 的语义边界

write 恒为**整文件**域；edit 为**区域**域（含删行形态）；hashline_edit 为**位置无关**域（hash 寻址）；insert_after 为**纯插入**域；apply_patch 为**多文件 / 整块**域。

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-E1 | 编辑工具**一个工具一权威档**（正文不与地图同档） | 多工具正文塞一档会超限且难维护；共享 helper 单源（同 `docs/core/design/TOOLS.md` §6.6） |
| D-E2 | **覆盖按原行尾 + 新建随目录多数派**（F1 / F2 两条分开） | 单一条规则两头都错：覆盖转行尾 ⇒ diff 全红；新建恒 LF ⇒ CRLF 仓库风格冲突 |
| D-E3 | 写入后 **autoSyntaxCheck**（JS 类文件） | 语法错在写入点暴露，优于延后到 lint / 测试轮 |
