# 工具输出额度与截断（TOOL-OUTPUT-LIMITS）· 设计

> 需求 = `docs/core/requirements/TOOLS.md` 的资源与输出上限条目；报告注入 = `TIMEOUT-DIGEST.md`。
> 最近先例：`CONTEXT-COMPACTION.md` 的双线保留。对齐 = 内联有界、全文可达。
> 勘察证据：已读 offload、UTF-16 切片、advisor 截断和 read 尾窗。相关 = 当前 64K 预算。

## 1. 工具与报告

普通非多模态工具结果超过 64K 字符时全文落盘并给头尾预览。报告族 force 无条件落盘，但短报告仍内联正文一份。

## 2. 头尾预览

TOOL_RESULT_OFFLOAD_LIMIT 与 TOOL_RESULT_PREVIEW 当前均为 64K。

预览由头部、实际省略数注记和尾部组成；总长度不超过预算。tail 取预算余量，不硬编码固定值。

safeSliceUTF16 与 safeSliceUTF16Tail 保证切点不制造孤立代理。失败回退也使用头尾形态，不退回纯头截断。

## 3. 落盘

offloadToolResult(text, callId, dir?, {force}) 负责保留期清理、目录创建、全文写入和回执。

默认保留期与目录由当前配置/常量定义。写失败必须有可见说明，不能伪报路径。

## 4. advisor 截断

truncateAdvisorResult 按行分配头尾预算，保留尾部裁决。省略注和 offset 续读提示保留，不切半行。

MAX_RESULT_CHARS 与主链预算对齐；compactMessages 是评审自身上下文兜底。

## 5. read 读回

大文件窗口未覆盖全部时，read 可返回请求头窗、真实中部省略数和文件尾窗。

尾区与头窗重叠时去重；无剩余时不伪造省略注。hashes 模式对头尾行保持同一 hash 语义。

read 不再对头尾结果套第二次纯头截断；超限由主 offload 兜底。

## 6. 验证

验证边界值、预览总长、真实省略数、UTF-16 代理对、落盘失败、advisor 尾结论、read 重叠/无省略和全文可读。
