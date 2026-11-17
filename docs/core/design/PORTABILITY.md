# 可移植性（PORTABILITY）· 设计

> 需求 = `docs/core/requirements/PORTABILITY.md`。
> 最近先例：`docs/core/design/DOC-SYSTEM.md` 的项目声明消费面。对齐 = 项目根、manifest 和文档根都使用声明；偏离 = 本档额外解释分类与写门的不同判据。
> 勘察证据：已读 `thincoder-core/conventions.mjs` 的 `classifyPath`、`thincoder-core/declaration.mjs` 的 `loadProjectDeclaration` 和 `declarationForTarget`、`thincoder-core/agent/write-face.mjs` 的 `faceDetail`。相关 = 当前分类优先级、缓存、降级和四格写门。

## 1. 当前边界

可移植性由两组不同判据组成：

1. **分类**：回答路径是 code、doc、temp、aux 还是 state，服务索引、检索、验证和评审等消费面。
2. **写面**：回答父侧设计门是否把目标视作产品面，服务工程模式写权。

两者不能互相替代。尤其 `aux`、`temp`、`state` 不等于父侧写门放行。

## 2. 项目声明

声明由 `thincoder-core/declaration.mjs` 装载，并从 `thincoder-core/conventions.mjs` 转口给既有消费者。

| 面 | 当前语义 |
|---|---|
| `codePaths` | 代码路径段序列；显式声明，不提供默认代码段 |
| `index.codeExtensions` | 追加代码索引扩展名 |
| `index.docExtensions` | 追加文档索引扩展名 |
| `index.excludePaths` | 排除索引路径 |
| `index.publicRepos` | 声明可检索、可引用的外部仓 |
| `root` | 当前声明所属项目根 |
| `declared` | 声明值是否偏离缺省，不由键是否存在决定 |

### 2.1 装载与缓存

`loadProjectDeclaration(cwd)` 通过 `manifestFilePath` 和 `readManifest` 使用同一条项目根与 manifest 读取链。

- 结果按 manifest 文件路径缓存。
- `clearDeclarationCache` 同时清理声明与范围缓存。
- manifest 缺失时使用缺省声明，保留已解析的项目根。
- manifest 非法或读取失败时回退到缺省，并输出警告和日志事件。
- 旧 `.thincoder/conventions.json` 只做存在性检查；每次缓存未命中时告警，不解析内容。

### 2.2 目标所属项目

`declarationForTarget(targetAbs)` 从目标绝对路径沿祖先链找到最近的 manifest 项目。没有所属项目时返回 `null`。

项目发现梯不参与此判定。调用方先把相对目标解析为绝对路径，再查询所属项目。

## 3. 路径分类

唯一实现 = `thincoder-core/conventions.mjs` 的 `classifyPath`。

### 3.1 优先级

按以下顺序先命中先定：

1. 声明的代码段序列 → `code`。
2. 临时文件名称或扩展名 → `temp`。
3. 文档扩展名 → `doc`。
4. 缺省辅助路径序列 → `aux`。
5. 项目状态文件标记 → `state`。
6. 其余 → `code`。

缺省辅助路径由 `DEFAULT_AUX_PATHS` 给出。声明代码段优先，因此代码段中的 `.md` 仍是 code；将辅助路径列入 `codePaths` 可以把它收回为 code。

状态标记包括任意层的 `PROJECT-MANIFEST.json` 和旧声明路径。它只影响分类，不扩大写权。

### 3.2 项目根相对面

代码段与辅助段的项目内匹配使用项目根相对路径：

- 根之下的绝对路径使用根内剩余段。
- 根名和根之上的祖先目录不参与项目内辅助面判定。
- 根外、根未知或含跳段的面按保守规则处理。
- 代码段在面不可判时保留全段匹配，避免缩小拦截面。
- 辅助面在面不可判时不命中，避免把机器目录结构当成项目豁免。

`isCodePath`、`isAuxPath` 和 `isStatePath` 从 `classifyPath` 派生。`isDocPath` 检查文档扩展名且不落入声明代码段。

## 4. 父侧写门

`thincoder-core/agent/write-face.mjs` 的 `faceDetail` 使用四格顺序：

| 顺序 | 条件 | 结果 |
|---|---|---|
| 1 | 目标祖先链没有 manifest | `pass`，原因是 `out-of-jurisdiction` |
| 2 | 目标位于所属项目声明的文档根内 | `pass`，原因是 `doc-root` |
| 3 | 目标恰为所属项目的 `PROJECT-MANIFEST.json` | `pass`，原因是 `manifest-state` |
| 4 | 其他目标 | `product`，fail-closed |

`faceOf` 返回上述 `face`。路径含 test / tests 段只影响拒绝消息变体，不改变面值。

因此：

- 父侧门不调用 `classifyPath`。
- 旧 `.thincoder/conventions.json` 即使分类为 state，也不是 `manifest-state` 放行对象。
- test、scripts、临时文件和其他未命中放行格的路径均按产品面处理。
- eng-coder 的角色与令牌约束不由本文件分类替代。

## 5. 消费面

| 消费面 | 当前机制 |
|---|---|
| 评审上下文 | 从项目声明和文档根发现上下文；缺失时注入明确降级消息 |
| 索引 | 使用声明扩展名与范围；无 git 时走文件遍历；报告未列入扩展名 |
| 验证与变更记账 | 使用分类读数判断代码变化，不把 state、temp、aux 自动当产品代码 |
| 工程入口 | 不要求自研仓专属文件才能开启 |
| checkpoint | 无 git 时明确报告不可用 |

各消费面可以按业务目的决定如何处理分类结果，但不能自行重写分类算法。

## 6. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D1 | 代码段无内置默认 | 不替未声明项目猜测目录结构 |
| D2 | 声明统一进入 manifest | 避免两份项目声明互相漂移 |
| D3 | 非 git 索引用遍历回退 | 保持检索可用，同时让评审说明变更上下文缺失 |
| D4 | 分类与写门分开 | 索引相关性不是工程写权，混用会制造错误豁免 |
| D5 | 写门按目标最近项目判定 | 多项目工作区不能用会话 cwd 决定另一个项目的规则 |
| D6 | 旧声明只告警不读取 | 避免退役格式继续暗中生效 |

## 7. 验证

验证至少覆盖：分类优先级、项目根边界、缺失与非法声明、旧声明告警、非 git 回退、目标项目归属、写门四格和跨项目目标。

分类正确不等于写门正确，两类验证分别报告。不得用旧测试编号或一次命中计数作为当前正确性的证明。
