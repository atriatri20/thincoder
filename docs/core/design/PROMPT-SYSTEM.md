# 提示词系统（PROMPT-SYSTEM）· 设计

> 需求 = `docs/core/requirements/PROMPT-SYSTEM.md`。
> 最近先例：`CORE-UNIFICATION.md` 的资源随包与 `AGENT-LOOP.md` 的稳定 system。对齐 = 单副本、稳定前缀、显式注入。
> 勘察证据：已读分层、装配矩阵、overlay、工具描述、记忆边界与自动注入。相关 = 当前核内唯一文本面和三档提示词消费。

## 1. 资源与加载

prompt-files.mjs 以 import.meta.url 定位 prompts、prompts/knowledge、core/knowledge 和 tool-docs。loadPrompt、loadAdvisorPrompt 与 DESC 保持当前硬加载/降级语义。

`tool-docs/*.md` 与 prompts 母版同级：`DESC` 读出的是母版原文，不清锚；展开发生在 schema 装配期（§7）。

知识主题是随包静态 Markdown 资源，分两类：prompts/knowledge 是完整档可内联的提示词主题；core/knowledge 是三档都不内联的纯查询主题。加载器按全局唯一的主题标识读取，不以进程 cwd、项目根或用户记忆目录作为知识来源。目录说明 README 不注册为知识主题。

prompts/knowledge、core/knowledge、极简槽文件及知识工具描述都进入 @thincoder/core 包。VSIX 与 Desktop 物化资源时沿用同一边界。

## 2. 完整档与知识单源

完整档源文件同时是完整与极简的母版：正文由必须常驻的硬规则、详细知识主题和内部包含锚组成。装配器从 prompts/knowledge 读取主题，完整档把锚替换成正文，极简档移除锚及其独占正文位置，最后执行既有 overlay 和运行时注入。

包含锚只在装配器内部使用，不发送给模型。主题不存在、标识重复或锚无法解析时明确失败，不把残缺提示词当成可继续运行的结果。

minimal 槽不使用这些包含锚。knowledge 工具与完整档装配读取同一主题文件，因此不存在“完整档一份、知识库另一份”的漂移面。

主题文件只保存可独立理解的正文。主题标题用于 list/search，get 返回该主题正文，不叠加另一份机器生成摘要。

同一包含锚机制覆盖工具描述。一份工具描述被拆成两块：常驻面留在 `tool-docs/<档名>.md`，展开面整块搬进 `prompts/knowledge/tool-<档名>.md`，原位置换成独占一行的锚。

判据是内容，不是长度：一份描述里出现长示例、详细分支、完整错误说明或背景解释，那一段就是展开面，占多长都算；四类都没有的档，全文即常驻面，不拆。每份描述都要有处置，不按名单抽样——一份含展开面却整档留着的描述，就是漏判。

逐字一致要三个条件同时成立，缺一条就不是逐字一致：

1. 锚独占一行，前后空行与原文一致。
2. 主题正文逐字等于原文该位置的内容。
3. 主题文件不以换行结尾（`prompts/knowledge` 的主题文件都按此写）。

核对方法是改前改后各渲染一次做字符串比对——读的是两个字符串相等，不是行数或字数。

工具描述的锚与提示词母版的锚共用同一文法、同一重复标识失败、同一未解析失败。差别只在装配点：提示词的锚在 assemblePrompt 里展开，工具描述的锚在 schema 装配处按档展开（§7）。

工具面经 `expandToolDescription(text, mode)` 薄壳转交同一展开器（`thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics`）：壳只校验 mode 并选极简支，不复刻锚文法——另起一套展开器就是两处各写一遍逐字一致那条规则，漂一处查不出。

极简档里展开面缺席，模型需要时用 `knowledge get` 取回；展开面主题与提示词主题同一清单、同一 `get` 行为，不另设入口。

## 3. 知识主题目录

| 主题标识 | 内容 |
|---|---|
| doc-lookup | 查档范围、证据行和提问边界 |
| decision-quality | 方案权衡与成本顺序 |
| evidence-discipline | 引用、检查失败侧与证据等级 |
| business-gates | 默认值、重试、兜底与业务失败 |
| document-writing | 需求、设计、提示词与规范文本写作 |
| upstream-protocol | 子代理上抛与父侧处置 |
| tool-operations | 搜索、并行、上下文、git 与工具选择 |
| documentation-evaluation | 文档分层、归属与质量判据 |
| project-records | 台账、批次、状态档与目录域 |
| product-security | 配置 UI 与安全机制边界 |
| normal-coding-workflow | 编码、调试、重构、拆文件与 UI 自检 |
| normal-work-management | 复杂任务登记、批次推进与收尾 |
| normal-delivery-collaboration | 评审、测试、交付、委派、会诊与升级 |

主题按现有连续内容块拆分。get 的读取粒度就是单主题，不把多个大章节重新合并成巨型知识文件。

读取成本是这条目录设计的已知代价：读清单要读完每份主题全文取标题，`get` 与锚展开每次都重扫全部主题，所以 `knowledge list`、每次锚展开和每次 `get` 的读取量随主题总数增长，`tool-*` 展开面按同一口径计入。本批接受现状，不引入索引或缓存；主题总数再上一个量级时，改为清单只存标识与标题、正文按需读。

工具描述展开面的主题标识 = `tool-<工具描述档名>`，档名里的 `_` 换成 `-`（`doc_graph-read` → `tool-doc-graph-read`）。清单由 `knowledge list` 现读；本表不复制一份会漂的名单。标识撞车按重复主题失败，不按目录顺序覆盖。

## 4. 极简槽

极简主会话沿用普通 persona，并使用同一公共与普通纪律母版的极简展开结果。母版只保留需求所列硬规则、具体查询触发指引和 knowledge 查询入口。

极简子代理沿用各自身份档与 subagent-base，并使用同一公共母版的极简展开结果。explore、plan、coder、tester 等角色分别保留自己的读写权限、任务书输入和报告要求，不因为文本精简而把只读角色变成可写角色。

minimal 始终使用普通工作流，不加载工程 discipline，也不启用工程设计令牌或工程写门。normal 与 engineering 继续使用既有完整场景槽。

consult 与 advisor 的独立基底不经过极简槽替换。工具面同一口径：advisor 与 consult 装配的工具描述取完整档，不随会话 mode 变化——独立基底被极简装配改写，就与 requirements §9.1 的「不被极简装配改写」当场矛盾。

## 5. 装配入口

assemblePrompt 接收场景和当前互斥 mode。场景继续表达主代理或子代理角色，mode 只决定完整或极简资源组合。

prepareRun 在每次运行时读取当前会话的 mode，并将它同时用于：

1. 系统提示词装配。
2. 文档、记忆和项目大纲的自动注入策略。
3. knowledge 工具准入（三档均提供）。
4. 派生的 engineering 工作流事实。
5. 工具描述的分档装配（§7）。

配置或会话命令在运行中切换 mode 后，下一次 prepareRun 自然使用新值；不修改历史消息，也不回写旧请求。

## 6. knowledge 工具

knowledge 使用第一方内置工具实现，资源读取由 prompt-files 的知识加载函数提供，并在 minimal、normal、engineering 三档工具表中提供。

| 动作 | 实现行为 |
|---|---|
| list | 从两类随包主题清单返回全局唯一标识与标题 |
| search | 对主题标识、标题和正文做本地关键词匹配，按主题返回有界定位片段；行动前必须再用 get 读完整主题 |
| get | 按精确主题标识返回完整正文 |

未知动作、缺少必要参数和未知主题都显式失败。两个资源目录出现同标识时也明确失败，不按目录顺序覆盖。search 无匹配返回明确的空结果，不伪造主题。工具不执行主题中的命令，不把主题文本当成工具调用指令来源。

工具描述保持短小，只说明何时查询及三个动作。知识正文不进入工具 schema。

## 7. 自动注入策略

minimal 下 prepareRun 跳过相关文档、历史记忆和项目目录大纲的自动注入。模型需要时使用 doc_search、memory、repo_outline 主动查询。

项目 AGENTS、项目规则与 skills 能力清单仍按现有入口提供。环境、时间和 git 等短事实继续通过既有用户上下文通道注入。

normal 与 engineering 的自动注入保持现状。injectDocs、injectProjectRules、injectMemories 等既有键不在 minimal 中形成第二套互相矛盾的模式状态；minimal 的注入策略由唯一 mode 决定。

工具 schema（参数、必填、枚举、校验）不因档位改写。工具描述按档装配：完整档把常驻面与展开面装配成与改造前逐字相同的那份文本；极简档只给常驻面，展开面经 `knowledge get` 取回。

极简档描述的目标文本 = 母版经同一极简展开后的字符串：锚及其后至多两个换行被移除。展开面落在描述末尾时，结果尾部余一个空行，属目标文本的一部分——判据是「不含锚字面、不含展开面正文」，不追加行尾清理。

体量分四项分别测量——系统提示词、工具声明、自动注入、完整请求——不互相冒充。

## 8. 内容归属

| 面 | 内容 |
|---|---|
| 完整 persona/common/discipline | 公共与普通纪律母版的硬规则及知识包含锚 |
| 极简槽 | 必须常驻的硬规则与查询指引 |
| prompts/knowledge | 完整档与 knowledge 工具共享的提示词主题正文 |
| core/knowledge | 三档均不内联、只供 knowledge 查询的参考知识 |
| subagent-base | 各极简与完整子代理共同使用的完整角色边界、范围和报告义务 |
| advisor/consult | 各自完整评审或会诊规则 |
| tool-docs | 工具描述的常驻面：路由、参数、错误与副作用中每次调用都要看见的部分 |
| prompts/knowledge 的 tool-* | 被拆出的展开面：长示例、详细分支、完整错误说明、背景解释 |

规范正文由负责设计档管理；提示词内不引用它来解释规则。执行坐标可以指向批次 §2 等实际工作对象。

## 9. 变更与验证

改规则时同步负责设计档、运行文本、schema/工具行为和受影响测试。不得为省上下文删除业务门、角色权限或验证义务。

验证包括：

- 完整 normal/engineering 渲染对照，确认主题内联没有改变模型可见内容。
- 极简主代理与子代理角色矩阵、硬规则标记、知识正文缺席和 knowledge 准入。
- 包含锚缺档、重复主题、未知主题、搜索无匹配和资源打包。
- minimal 自动注入收窄与项目规则保留。
- 运行中切换后下一轮 prepareRun 使用新 mode。
- 系统提示词、工具声明、自动注入和完整请求分别计量。
- 完整档工具面逐字一致：改造前后各渲染一次全部工具描述，比对字符串是否相等。
- 极简档工具面只含常驻面，工具数量与 schema 键集不缩水；目标文本按 §7 判，不按尾空行判。
- advisor 装配点的工具描述取完整档，极简会话内不变。
- 每份被拆的工具描述都能 `knowledge get` 取回展开面原文，逐份遍历，不抽样。
- 每份工具描述都有处置记录（拆出展开面 ∥ 整档保留），没有一档因为「看起来短」而跳过判定。
