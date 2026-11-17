# 文档体系（DOC-SYSTEM）· 设计

> 需求层 = `docs/core/requirements/DOC-SYSTEM.md`。当前逐档地图 = `docs/README.md`。
> 最近先例：`docs/README.md` 的板块—需求—设计组织。对齐 = 板块优先、分层明确、逐档登记；偏离 = 本档只描述当前结构，不再承担迁移执行。
> 勘察证据：已读 `PROJECT-MANIFEST.json` 的 `docRoot`、`docs/README.md` 的当前地图、`docs/core/design/DOC-DISCIPLINE.md` 的 D2 与 D17。相关 = 声明根、主题归属、单一权威源和终态性；未使用外部公共源。

## 1. 定位

本档规定文档的目录结构、主题归属、命名和引用形态。

它回答“文档放在哪里、由谁负责、如何指向”。写作要求归 DOC-DISCIPLINE，机械检查归 DOC-CHECK，批次和台账机制归各自设计文档。

## 2. 声明模型

`PROJECT-MANIFEST.json` 是文档根的机器声明。目录存在不等于进入检索域，进入检索域也不改变主题的语义归属。

| 声明 | 当前根 | 消费含义 |
|---|---|---|
| `docRoot.requirements` | `docs/core/requirements` · `docs/cli/requirements` · `docs/vsc/requirements` · `docs/desktop/requirements` · `docs/server/requirements` · `docs/RELEASE.md` | 需求与发布要求的检索面 |
| `docRoot.specs` | `docs/core/requirements` | 工程规格的需求面 |
| `docRoot.design` | 六个板块的 `design/` 根 | 设计文档检索面 |
| `docRoot.modules` | `docs/core/design/modules` | 模块级设计面 |
| `docRoot.batches` | `docs/batches` | 批次过程记录面 |
| `docRoot.standards` | `docs/core/standards` | 跨主题标准面 |

`index.excludePaths` 控制索引排除，`index.docCheckExcludePaths` 控制机械检查排除，`index.publicRepos` 声明可检索和可引用的外部公共源。三者不互相替代。

## 3. 文档层

| 层 | 内容 | 不承载 |
|---|---|---|
| 需求 | 当前目标、功能点、边界、非功能要求和验收条件 | 实现步骤和批次过程 |
| 设计 | 当前结构、接口、关键决策、持久理由和实现归属 | 一次性执行清单和失效方案 |
| 标准 | 跨需求、设计、编码和评审共用的规则 | 单一模块的实现细节 |
| 地图 | 当前文档的主题归属和入口 | 规则正文、库存计数和迁移史 |
| 批次 | 一轮工作的设计任务、评审、实施和收口记录 | 需要长期独立存在的权威规则 |
| RTM | 业务故事、集成用例和覆盖状态 | 未执行测试的通过声明 |

## 4. 目录结构

```text
thincoder/
├── docs/
│   ├── README.md
│   ├── RELEASE.md
│   ├── TEST-ENV-ECS.md
│   ├── batches/
│   ├── core/
│   │   ├── requirements/
│   │   ├── design/
│   │   └── standards/
│   ├── cli/{requirements,design}/
│   ├── vsc/{requirements,design}/
│   ├── desktop/{requirements,design}/
│   ├── render-core/design/
│   └── server/{requirements,design}/
├── test/
│   ├── RTM.md
│   ├── rtm/
│   └── integration/
└── thincoder-core/prompts/
```

板块与代码面的对应：

| 板块 | 代码或业务面 |
|---|---|
| `core` | `thincoder-core/` 及跨板块共享机制 |
| `cli` | `thincoder-cli/` |
| `vsc` | `thincoder-vscode/` |
| `desktop` | `thincoder-desktop/` |
| `render-core` | `thincoder-render-core/` |
| `server` | `thincoder-server/` |

render-core 的需求入口目前在 `docs/desktop/requirements/PROJECT.md`，设计正文在 `docs/render-core/design/RENDER-CORE.md`。地图必须显式给出这条跨板块关系。

## 5. 归属判据

### 5.1 P1–P5

| # | 判据 |
|---|---|
| P1 | 共享机制：核心实现位于 `thincoder-core/`，或规则本身跨板块适用，归 `docs/core/`。 |
| P2 | 板块机制：接口、行为或业务面只属一个产品或共享模块，归对应 `docs/<板块>/`。 |
| P3 | 项目过程：批次、地图和项目级发布流程归 `docs/` 的项目级位置，不按产品拆分。 |
| P4 | 提示词：运行期提示词和工具描述是产品代码，归 `thincoder-core/prompts/` 与相应代码文档面，不归 `docs/`。 |
| P5 | 冲突顺序：明确的模块归属优先于“被多少地方使用”；项目过程优先于业务板块；同一主题出现两种归属判断时，先停下消解，不各建一份。 |

引用次数只说明使用关系，不决定权威归属。模块镜像优先保证代码树与文档树具有同一模块边界。

## 6. 命名规则

| # | 规则 |
|---|---|
| N-a | 同一目录内档名唯一；档名使用能识别主题的大写或既有约定形，不为避免改名而制造同名不同物。 |
| N-b | 同一主题的一对一需求和设计使用同名文件；一对多时，各文档头显式指出需求或设计归属。 |
| N-c | 同名文件存在于多个板块时，引用必须带足以区分板块和层的路径。 |
| N-d | 提示词只有产品代码面正本，不在文档层建立同名镜像。 |

文件名只承担识别，不通过文件数量表达覆盖是否完整。

## 7. 交叉引用形态

| # | 关系 | 形态 |
|---|---|---|
| R1 | 同板块、同层且档名无歧义 | 档名 + 节名或节号；发生移动或产生同名时补全路径。 |
| R2 | 同板块的需求与设计互指 | 带 `requirements/` 或 `design/` 层前缀，或直接使用仓根相对全路径。 |
| R3 | 跨板块引用 | `docs/<板块>/<层>/<档>.md` + 节名或节号。 |
| R4 | 跨仓引用 | 仅限 `index.publicRepos` 已声明的公共源，使用声明源目录名 + 仓内路径。 |
| R5 | 代码对象 | 优先使用符号名、导出件名或配置键；不使用行号作为长期坐标。 |
| R6 | 非仓库对象 | 用户数据、系统临时目录和依赖内部对象不冒充仓内文档指针；机械边界归 DOC-CHECK。 |

引用章节时，节号必须来自目标文档当前标题。`doc_check` 不验证节号和引文，因此写者与评审仍须实际打开目标章节。

## 8. 地图维护

`docs/README.md` 按板块和主题登记当前文档。新建、移动、改名或删除文档时，同一轮完成以下动作：

1. 更新地图中的归属项。
2. 更新直接指向该文件的引用。
3. 检查是否产生第二份同主题权威正文。
4. 运行适用于改动文档的检查，并人工复核语义目标。

地图不写文件总数、目录总字数或一次盘点的结论。地图中的文档列举是登记，不代替正文中的语义引用。

## 9. 与其他规范的分工

| 文档 | 唯一负责的问题 |
|---|---|
| `docs/README.md` | 当前每份文档住在哪里、属于哪个主题 |
| `docs/core/design/DOC-DISCIPLINE.md` | 写作、更新、失效删除和证据纪律 |
| `docs/core/design/DOC-CHECK.md` | 三项机械检查的算法、范围和报面 |
| `docs/core/design/BATCH-RECORD.md` | 批次过程如何记录和收口 |
| `docs/core/design/LEDGER.md` | 待办与需求条目的状态和证据 |
| `docs/core/design/MANIFEST.md` | manifest 的值域、解析和消费机制 |

本档只引用这些机制，不复制其正文。
