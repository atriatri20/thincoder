# 文档锚点图（DOC-GRAPH）· 设计

> 需求 = `docs/core/requirements/DOC-GRAPH.md`。
> 最近先例：`LEDGER.md` 的同库读写和 `DOC-CHECK.md` 的逐行解析。对齐 = 同库、同解析；偏离 = 图按 scope 整档换边，而非逐行迁移。
> 勘察证据：已读当前 doc_graph 工具契约、DOC-CHECK 与 LEDGER。相关 = 动作、六类边、投影和只读子代理面。

## 1. 方案

doc_check 的逐行解析在产出判决的同时通过回调产出边。扫描结果写入台账同一 SQLite 文件的 doc_edges 表。

查询由独立 doc_graph 工具承担，避免把图查询文本混入 doc_check 的 PASS/REFUSED 判决面。

## 2. 节点与边

### 2.1 节点身份

```text
req:<编号>
doc:<项目相对路径>
doc:<项目相对路径>#<节号>
case:<用例编号>
symbol:<符号名>
ledger:#<行号>
board:<板块名>
session:<会话 id>
```

节号按字符串身份处理。整档与节是不同目标，但查询时按档折叠邻接。

需求编号与用例编号的全局唯一性是调用方约定；本面不按内容语义去重。

### 2.2 存储边

| kind | 来源 |
|---|---|
| cites | 文档路径 token、节指示和依据行 |
| cites-req | 需求编号 token |
| mentions-case | 带族名的用例编号 |
| case-file | RTM 节标题、行首用例号和行末文件配对 |
| cites-symbol | 反引号内标识符 |
| imports | 用例文件的具名 import 与解析到的模块 |

只存单向边，反向由索引查询。src 为文档级节点，出处细节放 evidence。

src 与 dst 逐字相同的自环在统一落边点过滤；doc:P 到 doc:P#N 不是自环。

### 2.3 状态

| state | 适用 |
|---|---|
| ok | 已验证存在的文档目标 |
| 目标不在盘 | 已验证不存在的文档目标 |
| 判不了存在性 | 非文档目标、投影或不可检查的声明仓目标 |

失败边也落库，dst 不替换。

## 3. 存储

doc_edges 与 items 在同一数据库。字段包含 src、src_label、kind、dst、dst_label、evidence、state、scope、scanned_at。

evidence 形态 = `<引用方文件> @ <运行时行号> 「<行首片段」`。行号只用于本次打开，不是节点身份或长期文档引用。

scope 是引用方文件。重扫某档时先删该 scope 旧边，再插入新边；别档不动。

## 4. 台账投影

查询时把 items 的 task_book、req_doc、board、executor 投影为 ledger 节点的四条边。

投影不写入 doc_edges，随当前台账行变化。投影 evidence 使用行号与列名，state 为判不了存在性。

## 5. 工具面

| action | 参数 | 行为 |
|---|---|---|
| scan | target，可选 scope | 扫描并重建对应边 |
| forward | target、node，可选 kind | 列出出边 |
| reverse | target、node，可选 kind | 列出入边 |
| chain | target、node、depth，可选 kind | 分层走查 |

target 是项目根，必填。node 与 depth 的必填规则按工具契约。缺参、非法 kind、不可读库和未扫描状态均明确报告。

depth-0 使用含 scan 的全量面；depth>0 使用同名只读面，只含三种查询。schema 枚举之外仍由 execute 再拒一次。

## 6. 查询细节

### 6.1 档级折叠

doc:P 与 doc:P#N 共享邻接查询，但输出保留每条边真实 dst。这样整档引用与节引用不会因写法不同断链。

### 6.2 kind

kind 只接受 cites、cites-req、mentions-case、case-file、cites-symbol、imports。

省略时包含六类与台账投影。投影名不是合法 kind 筛选值。筛选后为空与节点无邻居使用不同表述。

### 6.3 chain

一步是一条边，允许正反向交替。按到起点的边数分层，每节点只入队一次。

层宽受 LAYER_CAP 限制；超出时按确定顺序输出并给 kind 收窄提示。达到 depth 后仍有未展开节点时另给深度截断说明。

forward/reverse 不截断单节点结果。

## 7. 抽取接入

checkAnchors 接受可选 onEdge。回调在既有跳过规则之后触发，不得改变 hits 或判决。

cites-symbol 从码段取形，因此不错过它自己的来源；文档 token 仍由原锚面处理。

case-file 需要 RTM 跨行节标题上下文，imports 需要代码 import 语句；两者由扫描编排产出，再走同一落边点。

回调异常作为扫描读数可见，不改变 doc_check 判定。

## 8. 实现归属

- doc-graph/anchors.mjs：共享解析与回调。
- doc-graph/graph-tokens.mjs：新增 token 与 RTM 配对纯函数。
- doc-graph.mjs：扫描、落库、查询、走查与降级。
- ledger-db.mjs：doc_edges schema 与边类闭集。
- agent-tools/doc-graph.mjs：工具入口。
- family-tools.mjs：全量/只读装配。

node:sqlite 的消费侧遵循动态 import 与端壳闭包约束。

## 9. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| KD-1 | 复用 doc_check 遍历 | 防止边与判决对同一文本读法不同 |
| KD-2 | 独立 doc_graph | 查询不是 PASS/REFUSED 判决 |
| KD-3 | 只存单向东 | 反向由索引，不双记 |
| KD-4 | 台账查询时投影 | 避免行变化后边表过期 |
| KD-5 | 失败边保留 | 反向查询需要发现已消失的引用目标 |
| KD-6 | 用例到代码只认 import | 不做语义反推 |
| KD-7 | 节身份不归一 | 保留真实指向 |
| KD-8 | 查询按档折叠 | 消除整档/节写法造成的断链 |

## 10. 边界

不做运行时覆盖、语义相似度、相关度排序或常驻 watcher。图中没有边不等于业务上没有关系；证据仍以当前文件为准。
