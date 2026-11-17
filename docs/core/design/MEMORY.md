# 记忆与索引（MEMORY）· 设计

> 需求 = `docs/core/requirements/MEMORY.md`。
> 最近先例：`DOC-GRAPH.md` 的显式扫描与 `MANIFEST.md` 的声明目录。对齐 = 声明范围、读面不写、维护可回退。
> 勘察证据：已读三层存储、检索、声明范围、规模预算和维护。相关 = 当前 memory 六动作与批档排除。

## 1. 存储

createMemory 打开 ~/.thincoder/memory.db，设置 WAL、busy_timeout 和当前 WAL 卫生，按 user_version 事务迁移。

entries 保存 personal；files 索引 project/team markdown；code_chunks/doc_chunks 保存索引；meta 保存模型键和 per-origin commit 锚。

FTS 触发器与行同步，embedding 是随行 BLOB。

## 2. 三层

- personal：纯 entries 行。
- project：项目 .thincoder/memory/ 文件为源，putMarkdown 后索引，syncDir 可重建；不自动 git commit。
- team：当前 gitmem 同步；文件写入、拉取、提交推送和冲突按 gitmem 当前契约。

Server 团队记忆的已裁定目标是改用 Server 数据库，代码落地由 #2380 承接。该目标尚未改变当前 core 行为：配置 `memory.team.repo` 后仍 clone 到本地目录，put 仍写 markdown 并经 gitmem 提交推送；迁移完成前不得将 team 层描述为 Server 数据库实现。

uid 使用 layer 前缀。project/team 的路径解析按 uid 尾部 path，支持 Windows origin。

## 3. 检索

buildFtsQuery 做标点和 CJK 分段。ensureEmbeddings 懒回填；模型失配时读面降级 FTS-only 并可见，不返回旧向量结果。

向量扫描按 PK 键序分块，有界 top-K，按时间片 yield。FTS 与向量候选经 RRF 合并。

safeSliceUTF16 截断嵌入正文；发送前 sanitizeLoneSurrogates；批次毒行失败按当前逐条隔离。

search 默认覆盖 personal、当前 project 和 team；其他项目行不混入。codeSearch/docSearch 返回 chunk 坐标和分数。

## 4. 文件发现与范围

listProjectFiles 优先 git ls-files，非 git 使用有界 walk。扩展名、大小和 SKIP 规则统一。

正向范围 = 当前锚 manifest 的 docRoot 目录 ∪ codePaths 段匹配 ∪ 一级子目录 manifest 的对应声明。无声明零索引。

isExcludedRelPath 统一 index.excludePaths、批档排除和路径基面换算。所有同步起点和读面准入使用同一谓词。

范围外/排除存量行不随声明变化自动删除；读取不可见，维护另行处理。

## 5. 同步

gitSync 使用 per-origin commit 锚和 --relative diff；过大或失锚回退全量。只有同步成功才推进锚。

codeSync/docSync 按 mtime 增量，全扫收尾清 stale，并在长循环让出。reindexFile 处理当前写工具后的单文件更新。

publicRepos 展开一层；多 origin 分趟检索并按稳定 PK 合并。缺位根跳过并留日志，不伪造空检索。

## 6. 大库预算

待回填探针使用当前部分索引。计数和大纲按 origin 限定并有界。

createRowBudget 在每文件落库前判定。WARN 给中性信息；CAP 停后续新增，保留已有可检索行，处理顺序确定并报告 budgetSkipped。

读路径不做全表 embedding 清零；失配执行归同步/reindex/维护。

## 7. memory 六动作

- search：空查询短路，返回带 id 的条目。
- put：按 layer 写 DB 或 markdown。
- list：按当前目录限定共享层，紧凑返回。
- delete：单条按 uid；批量以磁盘文件为真相，路径包含校验后删除并 syncDir。
- clear：只清 personal。
- maintain：调用 maintainMemory，默认 dry-run。

批量 delete/clear 的 confirm 是业务门。team 文件本地删除不自动推送，远端传播仍由 gitmem。

## 8. 维护

maintainMemory 统一：

1. 鬼行 GC：跨 origin，ENOENT-only，活行不动。
2. 压实：freelist 达到当前绝对量且占比门槛才 VACUUM。
3. 备份轮转：严格匹配本机制文件名，保留 backupKeep，最少一份。

写操作备份先行并回读；干跑不产生备份。启动后低峰拍与工具调用幂等。

## 9. 配置与 origin

expand-home 在 loadConfig 统一处理 ~、~/、~\；不支持 ~user，不写回绝对路径。

normalizeOrigin 统一盘符和分隔符。projectDir 相对路径仍按当前项目根语义。

## 10. 验证

验证迁移事务、文件重建、检索等价、失配无旧向量、声明范围、批档与公共源、读面零写、行预算、维护干跑/确认/回滚、路径与权限负例。
