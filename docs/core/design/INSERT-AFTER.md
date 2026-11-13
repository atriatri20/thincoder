# insert_after 工具（INSERT-AFTER）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。
> 最近先例：`EDIT.md` 的行号锚。对齐 = 同一漂移判据、纯插入。
> 勘察证据：已读 after_line/after_regex、优先级与记账。相关 = 当前 read-before-insert 门。

## 1. 参数

path/content 必填。after_line 或 after_regex 至少一个；同时给时 after_line 优先。

after_regex 必须恰好匹配一行，多匹配列候选并拒绝。

## 2. 插入与护栏

在目标行后插入 content，不改现有行。after_line 使用 EDIT-HELPERS 的 lineAnchorVerdict，插入边界与替换边界不同。

正则定位按当前文件内容；dirty 状态仍按当前判据处理。

## 3. 写回

按原 EOL 与当前编辑器路径写回，成功后 recordWrite 记 insert 类型与位置。

## 4. 验证

验证两定位、优先级、零/多匹配、陈旧行号、插入边界、EOL 和记账。
