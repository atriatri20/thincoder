# write 工具（WRITE）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。
> 最近先例：`EDIT.md` 的写路径。对齐 = 整文件语义、写前门与记账一致。
> 勘察证据：已读整文件写、EOL、语法检查和编辑器路径。相关 = 当前 writeTool。

## 1. 参数与用途

path/content 必填。用于新建或整文件替换；区域改用 edit，插入用 insert_after，多文件 diff 用 apply_patch。

## 2. 写入

writeTool 创建必要父目录并写完整内容。覆盖前按当前读取与写门规则处理。

既有文件按原 EOL，新建按当前目录多数派。写后 JS 类文件运行当前 autoSyntaxCheck，并返回字符数、diff 与语法注记。

编辑器已打开时按当前注入路径写，成功写统一 recordWrite。

## 3. 验证

验证新建、覆盖、父目录、EOL、写门失败、语法错误、编辑器路径与记账。
