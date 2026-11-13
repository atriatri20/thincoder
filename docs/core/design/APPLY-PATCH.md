# apply_patch 工具（APPLY-PATCH）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。
> 最近先例：`EDIT.md` 的部分失败回执。对齐 = hunk 预检、写后如实报告。
> 勘察证据：已读统一 diff、hunk 定位、两段写与编辑器注入。相关 = 当前多文件写面。

## 1. 语法

patch 为 unified diff。支持多文件、/dev/null 新建、当前 lone header 与无坐标 hunk 容缺。

无坐标纯添加且没有可靠锚时拒绝。删除文件不使用本工具。

## 2. 定位与原子性

hunk 按上下文/删除行定位，多匹配拒绝。所有 hunk 在写前计算；hunk 阶段失败则尚未写目标文件。

写盘阶段逐文件提交，中途失败时已提交文件保留。编辑器注入路径可在当前 stage 点即时提交，回执必须计入。

## 3. 回执与记账

全成返回 Applied patch。失败时按补丁序列出 modified/created/not committed 和当前失败原因，末行给真实 k/M。

已写文件永不回滚，不能声称零写。已提交文件统一 markDirty/clearLastWrite，包括编辑器注入。

EOL 与新建目录多数派由 EDIT-HELPERS 负责。

## 4. 验证

验证多文件、新建、无坐标锚、歧义、hunk 失败零写、写盘中途失败、编辑器已提交和回执真值。
