# 记忆与索引（MEMORY）· 需求

> 设计 = `docs/core/design/MEMORY.md`；声明 = `MANIFEST.md`；会话历史 = `SESSION.md`。

## 1. 范围

系统提供 personal/project/team 三层知识，以及代码、文档和大纲索引。会话消息历史不属于记忆检索。

## 2. 存储与检索

- 默认单库 ~/.thincoder/memory.db，使用 node:sqlite、FTS5/BM25 与向量 BLOB。
- personal 是纯 DB 条目；project 的 markdown 是知识本体；team 使用当前 git 同步仓。
- project/team 文件可人工编辑和 git 管理，DB 是其可重建索引。
- 检索结合 FTS 与向量，使用当前 RRF 合并。
- 嵌入不可用可降级纯 FTS；模型/维度不兼容不能返回无效向量结果，状态必须可见。
- 嵌入输入使用 UTF-16 安全截断和发送前清洗。

## 3. memory 工具

单工具六动作 search/put/list/delete/clear/maintain。

- search/list 只读。
- put 需要合法 type/title/content 与 layer。
- 单条 delete 按 uid 路由；批量 delete 需要 layer、过滤条件和 confirm:true。
- clear 仅允许 personal 且 confirm:true。
- maintain 默认干跑，confirm:true 才写，并报告实际动作。

子代理按当前只读变体获得查询能力，不获得共享层写权。

## 4. 索引范围

1. 只索引锚项目 manifest 的 docRoot 目录与 codePaths，以及一级子目录中带 manifest 项目的声明面。
2. 无声明不回落全树。
3. index.excludePaths 与内建 SKIP 规则在声明面内继续生效。
4. docRoot.batches 对应的批档无条件不进入检索和自动注入。
5. 范围外或排除的存量行在读取面即时不可见；删除走维护面，不把声明变更当无备份删除。
6. index.publicRepos 声明的本地来源按当前多 origin 规则接入，不递归展开。

## 5. 性能与规模

- 向量扫描使用键序分块、有界 top-K 和事件循环让出，召回语义保持全表可比。
- 大库读路径不做全表嵌入重写；失配降级，重建在维护入口。
- 计数和大纲限定 origin 并有界。
- memoryStatus 提供库字节与逐 origin 行数。
- 行预算当前 WARN=100000、CAP=300000；只停新增，不自动删存量。
- 正常规模显示真实数，不用低阈值制造故障观感。

## 6. 维护

maintainMemory 统一鬼行 GC、压实和备份轮转。自动与 agent 触发复用同一引擎。

- 仅 ENOENT 判定文件死亡，其他错误保留。
- 写操作备份先行、干跑可读、写后回读。
- 压实按当前 freelist 绝对量与比例联合触发。
- 备份只轮转本机制严格命名产物，保留数有下界。
- 低峰触发幂等，正常状态零写入。

## 7. 配置与归属

memory.dbPath、memory.projectDir、memory.team.dir 等路径按当前 ~ 展开规则在 loadConfig 单点处理，不改写配置原文。

origin 入口归一盘符与分隔符，同一树不重复索引。不同项目按 origin 隔离。

## 8. 验收

验证三层存储、检索降级、模型失配、六动作权限、声明范围、批档排除、公共源、分块等价、事件循环让出、预算、维护安全和路径展开。
