# PATH-RESOLUTION · 路径解析统一层

> 本档是“相对路径如何解析为绝对路径”的机制单源。
> 实现 = `thincoder-core/path-resolve.mjs`；项目根 = `docs/core/design/MANIFEST.md`；声明仓 = `docs/core/design/MEMORY.md` 的 publicRepos 面。
> 勘察证据：已核 `path-resolve.mjs` 的 `resolvePathTarget`、`createResolutionSession`、后缀跳过集和五态结果。

## 1. 方案与理由

路径消费面只保留自己的受理规则：是否存在、是否文档、是否可读、是否允许落位。本层只回答“输入指向哪里”。

统一解析避免同一相对路径在批档、评审、台账和文档检查中得到不同答案。受理与授权仍归各业务面。

### 1.1 最近先例

文档锚点原先使用项目根与引用方目录两级解析。本层保留该顺序，并把批档等确有需要的面显式声明为 near-first。

### 1.2 勘察结论

本层是独立消费算法，不并入 manifest 读取器。它依赖项目根视图和声明出边投影，但不负责校验或修改声明。

## 2. 接口契约

### 2.1 函数与结果

```text
resolvePathTarget(anchor, given, opts) → Result
```

主要选项：

| 选项 | 含义 |
|---|---|
| `referrer` | 引用方文件，取其目录作为近基根 |
| `bases` | 当前面声明的额外解析基底 |
| `scanBases` | 只用于 dangling 同名提示，不放宽解析 |
| `kind` | file / dir / any / none |
| `order` | root-first / near-first |
| `declaredRepos` | 是否开启 publicRepos 声明仓腿 |
| `suffixFallback` | 是否开启文档指针后缀解析 |
| `domainRoots` | 候选腿必须落入的判域 |

结果态：

| state | 含义 |
|---|---|
| `resolved` | 得到绝对落点；后缀腿可带 how=suffix 与 multi |
| `ambiguous` | 参数坐标无法唯一确定，携带候选 |
| `dangling` | 域内解析无果，携带缺失段、层级和同名提示 |
| `unverified` | 声明仓根不在本机，存在性无法核实 |
| `outOfDomain` | 没有候选腿属于判域，不判也不输出 |

### 2.2 判定算法

1. 归一输入，区分参数缺省、空串和非字符串。
2. 绝对路径直接形成候选，由业务面继续受理。
3. `kind:"none"` 只提供调度路径，不检查存在性。
4. 按 order 走项目根、引用方目录和 bases。
5. `./` 与 `../` 开头时，引用方目录作为额外前置腿。
6. 每个候选先判 domainRoots，再判存在性；前两级首命中即定，bases 多落点可判 ambiguous。
7. 开启 declaredRepos 时，再尝试声明仓腿。
8. 开启 suffixFallback 时，再尝试仓内后缀索引。
9. 无域内腿为 outOfDomain；其他零命中为 dangling。

### 2.3 工作区与无项目

项目根视图为 workspace 时，不从子项目中猜根。参数坐标不能唯一确定时返回 ambiguous，候选来自工作区项目列表。

无项目但输入带相对路径时，可以把会话锚作为手上已有的基根继续解析。完全没有路径可判且没有根时，返回 base 层 dangling。

### 2.4 dangling 同名提示

dangling 可以在项目根、引用方目录、bases 和 scanBases 下查找同名项。它只帮助用户找到可能目标，不改变判定，不产 resolved。

提示扫描与后缀判定索引是两套不同用途的结构，不能共用深度、命中上限或跳过面。

### 2.5 消费面接线

| 面 | 解析参数 | 保留的业务规则 |
|---|---|---|
| 批档读取 | file、near-first、batches bases | 必须存在且可读 |
| 批档创建 | none、near-first、batches bases | 落位、嵌套和防多落点仍由批档面判 |
| 评审 documents | file、root-first、scanBases | 必须是项目内现存 Markdown |
| 子代理 files | none、near-first | 只调度，不检查存在性 |
| 台账 cwd | dir、root-first | 项目归属与台账边界不变 |
| doc_check target | dir、root-first | target 必填且只定位；无项目不运行文档门，不制造项目身份 |
| 文档锚点 | file、root-first、declaredRepos、suffixFallback、domainRoots | 档、节、引文仍按各自判据检查 |

只有文档锚面开启声明仓和后缀解析。其他工具参数不因此获得跨仓或后缀放宽。

doc_check 消费面的目标边界：目标及其祖先没有 `PROJECT-MANIFEST.json` 时不运行文档门，`target` 与会话锚只定位。悬空指针不开启声明仓腿，仓外、未声明别仓和已声明公共仓均不报；`index.publicRepos` 仍服务检索、合法引用与文档锚解析，不参与 doc_check 存在性判定。当前代码差异见 `docs/core/design/DOC-CHECK.md` 的「当前实现对照」，通用解析结果不因此改态。

### 2.6 报明

- resolved 通常静默。
- ambiguous 列出候选并要求显式路径。
- dangling 指出缺失段，可附同名提示。
- unverified 在通用文档锚的 report 面列报，不阻断；doc_check 不消费该状态。
- outOfDomain 不产生命中或读数行。
- 后缀解析的读数只在 report 面出现，gate 不增加额外输出。

### 2.7 声明仓引用

本表只适用于文档锚面，不是 doc_check 的存在性规则。文档指针可以写 `仓名/相对路径`，仓名来自当前项目 `index.publicRepos` 的声明目录名。

| 条件 | 结果 |
|---|---|
| 已声明，根在盘，目标在盘 | resolved |
| 已声明，根在盘，目标缺 | dangling |
| 已声明，根不在本机 | unverified |
| 未声明的同级仓形 | outOfDomain |
| 仓名形或余段非法 | dangling |

声明是跨仓引用的唯一入口。叶仓不需要自己的 manifest 才能被读取；环走查只沿实际声明出边，并只报告穿过当前起点的环。

### 2.8 后缀解析

后缀解析只用于文档锚面，解决“文档按包内相对写法、解析按仓根”的差异。

- 一个或多个后缀命中都可 resolved。
- 多命中带 multi=true，代表落点只用于读取和图边，不冒充唯一目标。
- 多解时不据此判节缺或引缺，因为主语不唯一。
- 零命中仍 dangling。
- 声明仓形不进入后缀兜底。
- 索引按项目根建立，使用文件系统而不是 git 跟踪状态。
- 跳过隐藏目录、_archive、node_modules、dist、build、coverage、obj。
- 索引在解析会话内惰性建立，不跨轮复用为当前事实。

## 3. 关键结构约束

- 本层只消费项目根和声明出边，不新增项目发现算法。
- 各面只声明解析选项，不复制多基根算法。
- 同名提示与后缀判定分开。
- 判域在候选腿上执行，避免域外不存在的路径被误报为 dangling。
- 解析结果缓存只在明确会话生命周期内使用。

## 4. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| KD-2 | 默认 root-first，批档等面可显式 near-first | 保持既有锚语义，同时尊重批档近基根契约 |
| KD-4 | 工作区参数不猜项目 | 选择根会改变整个调用的坐标系 |
| KD-7 | 同名提示有界 | 提示不需要为找名字重建无限索引 |
| KD-9 | 声明根不在本机时 unverified | 不能把没有 clone 当成路径写错 |
| KD-10 | 声明仓腿只用于文档锚 | 不放宽台账和评审参数受理面 |
| KD-15 | 后缀判定使用在盘文件树 | git 跟踪状态不等于文件是否存在 |
| KD-16 | 相对形先按引用方目录 | ./ 与 ../ 的语义是相对引用方 |
| KD-17 | 域外不判 | 不归当前项目管的目录不制造假命中 |

## 5. 验收判据

- 五态分别可由夹具触发。
- root-first 与 near-first 在同名双档夹具中可观察地区分。
- workspace 即使只有一个项目含目标也不替用户选根。
- dangling 同名提示不改成 resolved。
- 已声明在盘缺档、声明根缺失、未声明仓形分别得到不同状态。
- 后缀零命中仍拒绝，多命中不新增 gate 噪声。
- 相对引用方目录优先只对 ./ 与 ../ 生效。
- 域外存在与域外不存在都不产生域内命中。

## 6. 行为矩阵

| 输入 | 预期 |
|---|---|
| 绝对路径 | 直接形成候选 |
| 项目根相对现存路径 | resolved |
| 不存在的裸名 | dangling |
| 工作区相对参数 | ambiguous |
| 声明仓在盘缺档 | dangling |
| 声明仓不在本机 | unverified |
| 未声明同级仓 | outOfDomain |
| 后缀有命中 | resolved，how=suffix |
| 后缀零命中 | dangling |

## 7. 边界

- 不统一各面的授权、可读性或文档类型判据。
- 不新增工具或改变工具参数形状。
- 不用 git ls-files 代替在盘存在性。
- 不把台账指针归属规则改成文档引用规则。
- 不为后缀解析建立板块到包的猜测映射。
- 文档锚面不让跨仓引用绕过声明；doc_check 按本档消费边界不判跨仓。

## 8. 界面与交互

本机制没有独立 UI。交互只通过候选、缺段和未核信息完成；成功解析不占额外回执。

## 9. 集成场景

真实业务场景包括：工作区中定位项目、批档读取、评审文档受理、文档指针检查、公共仓引用和报告面读数。

是否新增常驻集成用例由当前业务 delta 决定。历史测试编号和一次增量清单不住本档。
