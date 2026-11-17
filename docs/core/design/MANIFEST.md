# 项目状态档（MANIFEST）· 设计

> 需求 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md`。
> 最近先例：`docs/core/design/PORTABILITY.md` 的声明投影和目标项目归属。对齐 = 同一项目根与同一读取器；偏离 = 本档负责 schema、完整读写和情境行。
> 勘察证据：已读 `manifest-schema.mjs` 的 `DEFAULT_MANIFEST`、`validateManifest`、`fillDefaults`，`manifest-discovery.mjs` 的发现与归属导出，`manifest.mjs` 的读写入口，以及 `tool-docs/manifest.md` 的工具契约。

## 1. 需求层

### 1.1 总体需求

`PROJECT-MANIFEST.json` 是项目级机器状态与声明。core 统一负责发现、归属、读取、校验、写入和向消费者提供解析结果。

### 1.2 功能范围

- 五个顶层键：version、phase、docRoot、codePaths、index。
- 普通读取、缺键补默认、非法形态拒绝、未知键诊断。
- 主 agent 初始化与点改，子代理只读。
- 多项目归属、工作区报告、文档根解析和工程模式情境行。
- 标准层、公共仓、可写外部目录和索引排除等声明消费。

### 1.3 非功能要求

- 只使用标准库与第一方模块。
- 校验是纯函数，不依赖文件系统。
- 读取与写入共用项目根、schema 和默认值。
- 缺档、缺键、非法和工作区是不同状态，不合并成静默默认。
- 写入失败保持磁盘不变。

### 1.4 边界

不承载台账业务、评审结论、用户凭据、模式开关或历史记录。不为某个端维护另一份 schema。

## 2. 设计层

### 2.1 方案与理由

实现分为三个核心文件：

| 文件 | 职责 |
|---|---|
| `thincoder-core/manifest-discovery.mjs` | 项目与仓发现、归属和项目根视图 |
| `thincoder-core/manifest-schema.mjs` | 默认值、schema、校验和缺键填充 |
| `thincoder-core/manifest.mjs` | 文档根解析、读取、工程入口和写入门 |

`thincoder-core/declaration.mjs` 将声明投影为索引和分类消费者使用的稳定对象。工具层只组装动作，不复制业务规则。

### 2.2 接口与数据流

主要接口：

| 接口 | 契约 |
|---|---|
| `discoverProjects` | 报告锚自身、workspace 或 none，并列直接子目录候选 |
| `discoverRepos` | 为 git 工具提供仓发现，不与项目发现混用 |
| `owningProject` | 沿祖先链取最近 manifest 项目 |
| `projectRootView` | 返回 ok / workspace / none 与 root、candidates |
| `projectView` | 在归属与发现之上读取 manifest，形成完整读侧状态 |
| `resolveProjectRoot` | 返回归属根，不向下选择子项目 |
| `manifestFilePath` | 统一项目 manifest 路径 |
| `readManifest` | 读取、补默认、校验并返回结构化状态 |
| `validateManifest` | 纯函数校验 errors、missingKeys、unknownKeys |
| `writeManifest` / `initManifest` | 经作者门与校验写入 |
| `docRootPaths` | 将文档层声明解析为绝对路径数组 |
| `resolveEngineeringManifest` | 工程入口共用读取、附着和可选初始化决策树 |

发现只使用文件系统存在性，不解析候选项目内容。归属也不因候选数量改变。

### 2.3 Schema 与默认值

`DEFAULT_MANIFEST` 包含：

- `version: 1`
- `phase: "initial-dev"`，合法值为 `initial-dev` / `production`
- `docRoot`：requirements、specs、design、modules、batches、standards
- `codePaths: []`
- `index`：codeExtensions、docExtensions、excludePaths、docCheckExcludePaths、publicRepos、writableRepos

`docRoot.standards` 默认 null，其余文档层具有各自默认目录。codePaths 没有默认代码段。

缺键由 `fillDefaults` 补齐。非法形态由 `validateManifest` 拒绝。未知键进入 `unknownKeys`，不作为合法声明继续消费。

### 2.4 读取与写入

`readManifest(cwd)`：

1. 通过统一项目根和 manifestFilePath 定位文件。
2. 缺档返回 missing。
3. 解析 JSON，非法时返回 invalid。
4. 对合法对象补默认并再校验。
5. 返回 ok、manifest、missingKeys、unknownKeys、errors、reason 等当前契约字段。

`writeManifest` 只接受 `writer: "main"`。`initManifest` 使用同一写门写默认档。工具层额外保证 init 不覆盖、write 不建档、点改后重新校验。

### 2.5 项目解析

- 目标目录自身或文件所在目录可以作为上溯起点。
- 最近 manifest 项目优先，嵌套项目各自归属。
- 项目根视图的上溯边界是目标所在盘根。
- 台账的归属边界由 LEDGER 自己规定，不改本模块接口。
- workspace 是正常读数，root 为 null，candidates 为直接子目录项目。
- 测试覆盖位只在显式测试 seam 存在时短路真实判定。

### 2.6 情境行

工程模式顶层会话使用会话锚项目的 phase 或项目状态行。

- 普通模式装配钩子不因 manifest 读写阻断。
- 相同值重复注入返回 false。
- 值变化时替换旧行情，保持单活体。
- 行被压缩移除后可重新注入。
- 通过 mtime 决定是否重读；读取失败时沿用上次已知好值。
- 子代理、无锚和非工程会话不注入顶层项目情境行。
- 对非锚项目的 manifest 写入不直接改写锚项目的内存状态。

### 2.7 docRoot

每个文档层接受：

```text
非空字符串 | 非空字符串数组 | null
```

字符串表示一个根；数组表示完整多根声明；null 表示本层不存在。`docRootPaths` 负责 trim、分隔符归一、按项目根 resolve、去重和保序。

缺键与显式 null 不同：缺键补默认，null 保持为空根。非法形态在 validateManifest 拒绝，docRootPaths 不负责洗白。

### 2.8 工程入口

`resolveEngineeringManifest` 是入口和模式翻转共用的决策树。

- 合法项目：附着 manifest。
- 允许初始化的缺档场景：通过主 agent 写门创建默认档。
- workspace：报告候选，不选择子项目。
- invalid：保留错误，不覆盖坏档。
- `init: false`：只读，不创建。
- 状态结果和异常结果分开，调用方不得把正常 no-project / workspace 当作系统故障。

### 2.9 消费面

| 消费面 | 使用内容 |
|---|---|
| 文档检查与文档图 | docRoot 层、docCheckExcludePaths |
| 评审 | 文档根、标准层、项目状态 |
| 分类与索引 | codePaths、index 扩展名和范围 |
| 写门 | 目标项目、docRoot、manifest-state、writableRepos |
| 会话与工程入口 | phase、项目附着状态 |
| 跨仓检索 | publicRepos |

各消费面通过声明投影或本模块接口读取，不自行解析 JSON。

### 2.10 manifest 工具

动作：

- `read`：报告 ok / missing / invalid / workspace / no-project。
- `init`：在明确项目中创建默认档，不覆盖。
- `write`：按 key 点改一个节点，读回校验后写盘。

`target` 必填。相对 target 按会话锚解析。workspace 上的 init / write 拒绝。

key 允许 version、phase、codePaths、docRoot 子键和 index 子键。拒绝整对象覆盖 docRoot / index，以及 schema 之外的键。

value 先按 JSON 解析，失败后按字面字符串。`null` 是 docRoot 的合法“本层不存在”，不是删除键。

子代理只获得 action=read 的工具变体；执行入口仍再次拒绝写动作。

### 2.11 文档地图

文档地图从 docRoot 声明派生：

1. 按声明层顺序寻找各根下的 README.md。
2. 若未找到，再检查所有声明根公共祖先下的 README.md。
3. 仍无地图时，评审消息明确降级。

地图只回答文档主题归属，不替代文档检查的规则源。

### 2.12 标准层

`docRoot.standards` 声明一个或多个目录。层内成员是目录及全部子目录中的 `.md`，按层根相对路径排序；不跟随符号链接，嵌套根按实际文件去重。

标准层注入区分：

- 未声明或 null：说明项目没有标准层。
- 声明但不可读：指出路径和原因。
- 部分可读：注入可读内容，并列出不可读项。
- 全部可读：注入各文档定位注和正文。

标准层进入 REVIEW_ROOT_KEYS，使写面、评审范围与文档图使用同一层集合。内容超过注入预算时明确截断，不把残缺标准当作完整输入。

## 3. 验证

### 3.1 验收面

- schema：合法与非法值、缺键、未知键、显式 null。
- 读写：读写往返、作者门、失败零写、init 不覆盖、write 不建档。
- 解析：项目内子目录、嵌套项目、workspace、无项目和跨项目目标。
- 情境行：幂等、单活体、压缩恢复、mtime 更新和失败保守。
- 文档层：多根、去重、递归、不可读和符号链接。
- 工具：target 必填、点改白名单、子代理只读。

### 3.2 验证纪律

优先使用行为断言和结构化结果。只有在结构本身是契约时才检查源码结构，不用某句注释或历史用例编号代替当前行为。

本档不保存一次测试运行、历史用例表、施工文件清单或行数读数。
