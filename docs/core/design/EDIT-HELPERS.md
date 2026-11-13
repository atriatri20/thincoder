# 编辑共享底层（EDIT-HELPERS）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；消费方 = EDIT、APPLY-PATCH、WRITE、HASHLINE-EDIT、INSERT-AFTER。
> 最近先例：`TOOL-OUTPUT-LIMITS.md` 的 UTF-16 安全。对齐 = 匹配/写回域分离、判据单源。
> 勘察证据：已读 EOL、失败候选、行号锚与批量帧。相关 = 当前 write-path 记账。

## 1. EOL

detectFileEol 按首个换行判断；joinWithEol 按原文写回。majorityEol 用当前有界目录采样决定新建行尾，默认 LF。

匹配在规范化 LF 域，写回恢复原 EOL。BOM 与编辑器路径按当前专门规则。

## 2. 失败候选

findCandidates 使用当前有界 LCS 相似度、阈值和 top-N，给 not-found 提供可行动候选。多行 old_string 只按当前首行规则。

FFFD_WARNING 在 hashline 读入替换字符时提示编码风险。

## 3. 行号锚

write-path.mjs 保存 lastWrites 与 dirtyPaths。lineAnchorVerdict 依次处理：

- 无写且非 dirty 放行。
- dirty 与快照冲突拒绝。
- 全文写后旧行号拒绝。
- 目标在受影响区之前按 edit/insert 边界放行。
- 其他受影响位置拒绝并给当前漂移。
- 无快照但 dirty 拒绝。

lineAnchorRefusal 统一说明重读或 old_string/hashline 替代。read 清当前快照；apply_patch 对已提交档记 dirty 并清快照。

## 4. 批量帧

planEditEntries 给行号条目降序并拒重叠；applyPlannedEntries 累积内容、收集条目失败并按原调用序返回。

回执由 editEntryFailureLine/editBatchSummary 统一构造。桥与本地共享纯函数，各自负责 IO 与记账。

## 5. 边界

记账覆盖当前进程结构化写与 ACP 桥。其他进程与 bash 外部写不在该内存表内，不能宣称跨进程完整。

## 6. 验证

验证 EOL/BOM、候选预算、六类锚判定、插入/编辑边界、批量顺序、重叠、桥记账和失败回执。
