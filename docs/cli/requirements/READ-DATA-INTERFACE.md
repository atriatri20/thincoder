# 只读数据接口 · 需求

> 设计 = `docs/cli/design/READ-DATA-INTERFACE.md`。

## 1. CLI

`thincoder ledger list --json [--full] [--family] [--cwd <dir>]` 输出可解析 JSON。

- 当前项目、指定 cwd 和 family 三范围按 core 定义。
- projects 按项目分组，含 root/name/schemaVersion/rows。
- 行字段与 core 当前导出一致；evidence 默认省略，full 时包含。
- 无台账返回空 projects 和 exit 0。
- 只读不得建库、迁移或执行 DDL。

## 2. ACP

提供 ledger/list、ledger/count、batch/list 只读方法与 ledger/changed、batch/changed 通知。

batch/list 返回文件与 §1–§6 当前状态；没有状态词的段如实标识，不造状态。

通知只带 cwd，数据由拉取方法取得。参数错误使用当前 JSON-RPC invalid params。

## 3. 单源与版本

CLI/ACP 共用 core 序列化，不复刻 SQL 或表名。schemaVersion 如实读取库的 user_version，旧库未标不能伪报新版本。

## 4. 边界

不提供写方法，不推断无版本历史库结构，不增加桌面平行接口。
