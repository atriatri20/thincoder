# hashline_edit 工具（HASHLINE-EDIT）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。
> 最近先例：`EDIT.md` 的行号锚。对齐 = 内容身份取代易漂移行号。
> 勘察证据：已读 hash 域、连续块、not-found 与写回。相关 = 当前 read(hashes=true)。

## 1. 参数

path、old_hashes、new_content 必填。old_hashes 来自当前 read(hashes=true)，是连续行的 12 位 SHA256 前缀序列。

new_content 替换整个目标块；未包含的旧行删除，空内容删除整块。

## 2. 匹配

hashLine 在 stripBom + normalizeEOL 域计算。滑窗匹配整个序列，多个位置时报歧义。

找不到时错误带当前 hashes 并引导重新 read。U+FFFD 给编码警告。

## 3. 写回

按原 EOL 与当前 BOM/编辑器规则写回并记账。目标内容已变时失败，不按旧 hash 改其他行。

## 4. 验证

验证单行/连续块、删除、漂移后仍命中、歧义、not-found、CRLF/BOM、U+FFFD 和编辑器路径。
