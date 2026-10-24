# hashline_edit 工具权威语义（HASHLINE-EDIT）· 编辑工具板块

> 板块 = **编辑工具**；本档 = **hashline_edit 语义的权威源**（逐工具权威档之一）。
> 地图与契约要点 = `docs/core/design/TOOLS.md` §6.6 · §8.2——本档不复制其内容（D2）。
> 共享底层 = `docs/core/design/EDIT-HELPERS.md`（hash 域 / EOL 写回 / U+FFFD 常量——本档只指不述）。
> 双端：CLI `thincoder-core/tools/file.mjs`（`hashlineEditTool` · `hashLine`）。
> 模型可见描述 = `thincoder-core/tool-docs/hashline_edit.md`（提示词面 / 产品代码）。
> 需求侧 = `docs/core/requirements/TOOLS.md`（工具系统板块；CLI 树无逐工具需求档）。

## 1. 定位

hashline_edit = **按内容哈希寻址编辑**（非字符串匹配）——**位置无关**（行号漂移免疫）：hash 标识行内容而非行号，行增删后 hash 仍指向原内容。

**唯一不可替代点（与 edit 的差异）**：按内容哈希寻址、位置无关——edit 的 `line: N` 需行号新鲜（漂移即错），hashline_edit 不依赖行号（改前 `read(hashes=true)` 取 hash，改后行移动 hash 仍匹配）。

**不是**：插入新行（→ insert_after）、内容定位（→ edit）、整文件重写（→ write）。

**定位判定**：**保留独立工具**——唯一差异点 = 位置无关哈希寻址，写入两端描述。

## 2. 参数与 schema

- `path`（必须）——目标文件。
- `old_hashes`（必须）——待替换行的 SHA256 hash 数组（12-char hex）。单行 `[hash]`；连续块 `[hash1, hash2, ...]`（按序）。**只来自 `read(hashes=true)`**（数据新鲜度——改前 re-read）。
- `new_content`（必须）——替换文本（可多行）。**new_content 中不出现的旧行被删**；空 `new_content` = 删该块——**当前唯一的命名删行路径**（edit 的显式空串被拒）。

## 3. 语义

- **hash 算法**：`SHA256(line_content).slice(0, 12)`——与 `read(hashes=true)` 同算法（`thincoder-core/tools/file.mjs:376` `hashLine`）。位置无关：hash 标识内容而非行号。
- **匹配**：滑窗 hash 序列匹配（连续块按序）；歧义（多位置）→ 报错。
- **not-found**：错误含当前文件 hashes（可据此重试）+ 引导「for fresh hashes, re-read the file with hashes=true」。
- **U+FFFD 编码警告**：读入含 U+FFFD → 结果文本追加 `FFFD_WARNING`（不阻断——常量见 `docs/core/design/EDIT-HELPERS.md` §5）。
- **EOL 写回**：`detectFileEol(原文)` → `join(原行尾)`（`docs/core/design/EDIT-HELPERS.md` §4 F1）。
- **hash 域**：stripBom + normalizeEOL（CRLF 尾 `\r` 与 BOM 首行不造成哈希失配）。

## 4. 何时用（模型路由）

- 行号可能漂移（多次编辑后）/ 内容多空白 / 编码杂 → hashline_edit（hash 免疫漂移）；
- 删一块行（当前唯一命名删行路径——`new_content` 空）；
- 内容明确可给、行号新鲜 → edit（主工具）；加新行 → insert_after；整文件 → write。

## 5. 测试

**测试**：用例面（hash 匹配 / 歧义 / not-found 引导 / U+FFFD 警告）= §3 语义（单一权威源）；行为验证 = 单元测试档（用后即删——零留存；批档 §5 留读数行；复跑 = 单档直跑）。

## 6. 机制面

### 6.1 实现坐标

| 面 | 落点 | 实核 |
|---|---|---|
| 工具对象 / 执行 | `thincoder-core/tools/file.mjs:384`（`hashlineEditTool`） | 导出在位 |
| hash 计算 | `thincoder-core/tools/file.mjs:380`（`hashLine`） | 导出在位 |
| U+FFFD 常量 | `thincoder-core/tools/shared.mjs` `:162`（`FFFD_WARNING`） | 导出在位（逐字与 `EDIT-HELPERS.md` §5 同） |
| 描述面（模型可见） | `thincoder-core/tool-docs/hashline_edit.md` | 在位（`DESC()` 加载） |

**VSC 端差异**：VSC 端 `hashline-edit.mjs` 另含——① **BOM 处理**（磁盘写回带 BOM、编辑器分支不带——防双 BOM；hash 域 = stripBom + normalizeEOL 与 CLI 同）② **编辑器路径分支**（doc 已打开 → range 编辑，偏移经 `lfOffsetToRaw`——`docs/core/design/EDIT-HELPERS.md` §6）。

### 6.2 与 edit 的差异化定位（现行口径）

hashline_edit 的差异面 = **位置无关哈希寻址**一项——该差异点即其保留理由（§1 末）；路由段两端描述同此口径。

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-H1 | **保留独立工具**（不并入 edit） | 唯一差异点（位置无关 hash 寻址）在长会话多轮编辑下不可由行号形态替代 |
| D-H2 | hash 域做 **stripBom + normalizeEOL** | 否则 BOM / CRLF 尾字符使「同一行」哈希失配——假 not-found |
| D-H3 | U+FFFD → **警告不阻断** | 编码损坏时仍给模型一次尝试机会；阻断会令损坏文件整体不可编辑 |
