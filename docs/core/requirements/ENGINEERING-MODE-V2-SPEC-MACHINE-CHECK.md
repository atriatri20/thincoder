# Function Spec · M8 机检引擎

> 当前权威 = `docs/core/requirements/DOC-CHECK.md` 与 `docs/core/design/DOC-CHECK.md`。本规格保留模块入口，不另立第二套判据。

## ① 模块目标

文档机检使用单一 doc_check 引擎，只判段长、行号锚和悬空指针。判据常量内建；项目只能通过 index.docCheckExcludePaths 调整判集。

## ② 功能点

1. report 整档诊断，gate 只判本批变更区。
2. 目标项目由目标自身或祖先的 PROJECT-MANIFEST.json 决定；无项目声明时 report 与 gate 都不运行。显式 target 和会话锚只定位，不制造项目身份。
3. 批次档在读取面不判；写入时仍按当前写门判段长与行号锚。
4. 计划创建文件与项目声明排除路径按 DOC-CHECK 的豁免处理。
5. 台账一致性由 ledger schema、写核和 batch check 承担，不属于 doc_check。
6. 语义质量、覆盖完整性和需求契合由评审负责，不伪造成 doc_check 判据。

## ③ 边界

- 不读取退役的 checkConfig。
- 不运行旧的 doc-anchors、check-doc-width 或 check-ledger 脚本族。
- 不把“运行过”当成“判据覆盖”。
- 不把 report 模式当作交付 gate。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M8-1 | doc_check 三类命中与 DOC-CHECK 一致 |
| AC-M8-2 | 阈值和命中类没有项目级配置 |
| AC-M8-3 | index.docCheckExcludePaths 只改变判集 |
| AC-M8-4 | report 与 gate 的范围差异可复现 |
| AC-M8-5 | 台账一致性由 ledger/batch 机制承担 |
| AC-M8-6 | 无命中时 PASS；不可判对象明确标未判 |
| AC-M8-7 | 无项目目录收到显式 target 或相对会话锚定位时，report 与 gate 均不运行 |

## ⑤ 依赖

MANIFEST、PATH-RESOLUTION、DOC-DISCIPLINE、LEDGER。
