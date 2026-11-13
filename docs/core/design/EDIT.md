# edit 工具（EDIT）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。
> 最近先例：`WRITE.md` 的写路径与 `APPLY-PATCH.md` 的部分失败。对齐 = 最新读、真实回执。
> 勘察证据：已读行号/内容形、匹配、批量和 ACP 桥。相关 = 当前 edits 数组。

## 1. 参数

支持顶层单次或 edits 数组。定位可用 line/startLine+endLine 或 old_string；形态互斥。

new_string 在内容形必填；行号形省略表示删除；显式空串按当前错误规则。replace_all 只服务内容形。

## 2. 匹配与应用

内容匹配依次尝试精确、唯一空白差异窗口和当前阈值的唯一模糊窗口。歧义或找不到时报错并给候选。

行号必须通过 lineAnchorVerdict。批量行号条目先按 startLine 降序，重叠双方失败；内容条目随后按调用序。

同档在内存累积并一次写；条目失败不撤销其他已写条目，档级失败使该档条目失败。回执按原调用序并报告真实条目/文件数。

## 3. 写与桥

writeThroughPath 统一当前文档门、写盘、编辑器路径和记账。ACP 桥使用同一 planEditEntries/applyPlannedEntries 与回执构造器，IO 是 IDE 缓冲。

桥不伪造盘面 diff、语法检查或上下文。

## 4. 验证

验证互斥、空串/省略、匹配档、歧义、陈旧行号、重叠、部分失败、档级失败、ACP 桥和真实汇总。
