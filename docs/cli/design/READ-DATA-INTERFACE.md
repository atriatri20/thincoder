# 只读数据接口 · 设计

> 需求 = `docs/cli/requirements/READ-DATA-INTERFACE.md`。
> 最近先例：`LEDGER.md` 的只读查询与 `ACP-CLIENT.md` 的处理器装配。对齐 = 核导出、协议薄壳。
> 勘察证据：已读 ledgerExport、readOnly、batch-read 与指纹通知。相关 = 当前 CLI/ACP 双出口。

## 1. 核读取

ledgerExport({cwd,family,full}) 用 ledgerQuery/ledgerCount 等核 API，读库以 readOnly 打开且零 DDL。缺表按空账，旧库缺列按当前 null 归一。

schemaVersion 独立只读 PRAGMA user_version。family 使用 discoverFamily，输出按项目分组。

listBatchRecords 从当前 batchDocBases 收集 Markdown，readSectionStatusWord 使用 STATUS_WORDS 解析各段。

## 2. CLI

runLedgerList 严格解析 --json/--full/--family/--cwd。成功 stdout 只有一段 JSON；解析或读取失败 stderr 并非零。

## 3. ACP

createReadDataHandlers 返回 handlers/watcher，经 ACP 凭据门。

ledger/list 调 ledgerExport；ledger/count 直传核计数；batch/list 调 listBatchRecords。

watcher 以当前间隔比较库与批次文件指纹，首查只立基线，变化发 ledger/changed 或 batch/changed。失败写 stderr 并按相同原因去重，不污染协议 stdout。

## 4. 验证

验证 JSON 同源、evidence 开关、空库、只读文件不变、旧版本、三方法、通知首查静默/变化可见和 watcher 失败。
