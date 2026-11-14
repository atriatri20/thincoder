# 文档检查（DOC-CHECK）· 设计

> 需求层 = `docs/core/requirements/DOC-CHECK.md`。写作要求 = `docs/core/design/DOC-DISCIPLINE.md`。
> 最近先例：`docs/core/design/DOC-SYSTEM.md` 的「声明与机制分層」。对齐 = 声明面、判据、实现坐标和验收分开；偏离 = 本档只描述当前检查机制，不保存施工记录。
> 勘察证据：已读需求 F1–F12、`thincoder-core/doc-check/` 的模块划分、写门与收口调用面。相关 = 三项判据、三个调用时点、变更区和声明排除面；未使用外部公共源。

## 1. 只判三件事

| # | 判据 | 实现面 |
|---|---|---|
| ① | 正文段落超过 300 字 | `thincoder-core/doc-check/paragraph.mjs` 的 `paragraphHits` |
| ② | 正文出现「档名 + 冒号 + 数字」的行号锚 | `thincoder-core/doc-check/line-refs.mjs` |
| ③ | 应在仓内存在的文档路径无法找到 | `thincoder-core/doc-check/existence.mjs` |

三项共用同一套正文抽取和报面。除此之外不增加判据。

文档不量文件行数。代码和单元测试的内容行数只服务批次档位与读数门，量法 = `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `countContentLines`，档位语义 = `docs/core/standards/CODE-TIER.md`。

## 2. 怎么数「一段」

- 一段 = 相邻的非空正文行。标题、表格、列表、引用、围栏代码块和缩进代码块各自成界，不计入正文段落。排除单位是完整块：列表的缩进续行、懒惰续行和疏松列表内部空行也属于列表；无首尾竖线的表格由表头与分隔行共同确认。
- 缩进代码块以四格空格或 Tab 起头，块首必须位于文档开头、空行之后或另一缩进代码行之后；普通段落后的缩进续行不因此变成代码块。
- 提示词面每行自成一界，因为提示词中的换行是版式，不是段落组织；表格块、列表块和代码块仍整体排除。
- 字数按字符计，一个汉字算一个。阈值 300 是产品常量，不读项目配置。
- 段内包含变更行时，段长判据检查整段；完全未变更的段不进入变更区判定。

## 3. 项目身份与仓内路径（目标契约）

项目根 = 从被检文档向上找到的最近 `PROJECT-MANIFEST.json` 所在目录。目标及其祖先没有该文件时，目标不属于项目，report 与 gate 都不运行文档门。显式 `target` 和会话锚只负责定位，不把无项目目录变成受管项目。

对仓内路径只做两种存在性判断：项目根相对路径直接在盘，或仓内某一文档以该完整 token 结尾。任一成立即存在，不判唯一性。

以下对象不报悬空：

1. 仓外相对路径、绝对路径和其他项目的文档。
2. `.thincoder/` 下的运行期路径。
3. 在途批档 §2「受影响文件（机读清单）」登记的在建路径。
4. `docRoot.batches` 下的批档正文所提到的路径。

在建路径由 `plannedPathsOf` 读取；批档状态行变成已收口后，该清单不再提供豁免。批档例外只适用于悬空指针，写入时的段长和行号锚仍照常判定。

`.thincoder/` 例外同样只适用于悬空指针，不妨碍同一行命中行号锚。

## 4. 仓外一律不看（目标契约）

机械检查不解析其他项目的目录结构，也不根据 `index.publicRepos` 扩展存在性判定。仓外相对形、绝对路径、未声明别仓和已声明公共仓均不报。公共源声明解决检索和引用权限，不改变本检查的仓内边界。

仓外路径写错时由写者和评审负责发现，不由本检查产生猜测性命中。

### 4.1 当前实现对照（技术债）

- **跨仓缺口**：`thincoder-core/doc-check/existence.mjs` 的 `existenceHits` 目前只经 `siblingProjectForm` 跳过「同级目录且有 `PROJECT-MANIFEST.json`」的别仓路径，不读取 `index.publicRepos`。已声明公共仓不符合这一目录形时，缺失目标仍会命中悬空指针，与「所有跨仓引用一律不报」不同。
- **无项目缺口**：`thincoder-core/agent-tools/doc-check.mjs` 的 `execute` 目前在项目视图不是 ok 时把 `target` 赋给 root；`thincoder-core/doc-check/index.mjs` 的 `projectRootOf` 也以调用方基根兜底。无项目目标因此仍进入检查，与「无项目不运行文档门」不同。

这两项是待修技术债，不能按目标契约视为当前行为。

## 5. 报什么

无命中时只出：

```text
DOC-CHECK GATE: PASS
```

有命中时首行为 `REFUSED`，随后每项一行，分别说明不存在的文档、超长段落或行号锚。同一套句子用于报告和阻断，调用面只决定是否拒绝当前操作。

判域内的目标文件不存在或无法读取时，报「不在盘，未判」或「读不到，未判」，不把这种文件计入干净面。

## 6. 判域与变更区

| 调用面 | 判定范围 | 区间来源 |
|---|---|---|
| `doc_check(mode:"report")` | 指定文档的整份内容 | `region = null` |
| `doc_check(mode:"gate")` | 当前批次变更区 | 批起快照到当前工作树 |
| `batch close` 与 `status → 已收口` | 当前批次变更区 | 批起快照到当前工作树 |
| 工程模式普通 `.md` 写门 | 本次写入改动的行 | 盘上现文与改后文本 |
| 工程模式批档 `append` ∥ `edit` | 本次写入改动的行 | 盘上现文与改后文本 |

### 6.1 批次变更区

`thincoder-core/agent-tools/batch-regions.mjs` 的 `changedRegionsOf` 解析 `git diff -U0` 的结果。批起基线来自批档 §1 的 `批起 sha`，指向建档时的工作树快照，而不是仅含已提交内容的 HEAD。

收口和 `gate` 面在取区前通过 `stageDocs` 按路径暂存本批文档，使新文档进入 diff。不能使用 `git add -A`。无法暂存且原本不在索引中的文档没有可取变更区，不产生命中。

没有基线、基线不可读、非 git 环境或文件已在当前工作树删除时，该文件没有可判的变更区，不回退为整份判定。

### 6.2 写时点变更区

`thincoder-core/doc-check/index.mjs` 的 `changedRegionOf(oldText, newText)` 直接比较两份文本。实现使用按行对齐和 Hirschberg 回溯，不建立行数乘积的二维表。

返回形为 `{ rows, gaps }`：

- `rows` = 改后文本中的变更行。
- `gaps` = 纯删形成的零宽位置，只供段长判定识别拼接后的段落。
- 行号锚和悬空指针只检查 `rows`。
- 多处改动取并集。

新文件或盘上现文无法读取时，写门按整份检查。新旧文本逐字相同时提前返回，不再求区。

### 6.3 区间消费

`judgeText` 和 `runDocCheck` 显式接收区间；`null` 表示整份，区间表表示只判指定行。引擎不自行读取 git，区间由调用方提供。

没有变更行时不出命中、不增加说明，也不把文件计入实际检查数量。

## 7. 实现落点

| 模块 | 责任 |
|---|---|
| `thincoder-core/doc-check/paragraph.mjs` | 正文分块、段长与段落区间归属 |
| `thincoder-core/doc-check/line-refs.mjs` | 行号锚识别 |
| `thincoder-core/doc-check/existence.mjs` | 路径抽取、项目根、存在性与面别例外 |
| `thincoder-core/doc-check/doc-names.mjs` | 文档名和路径词法 |
| `thincoder-core/doc-check/doc-tokens.mjs` | 正文 token 抽取 |
| `thincoder-core/doc-check/index.mjs` | 判定装配、变更区、判域过滤和报面 |
| `thincoder-core/agent-tools/doc-check.mjs` | `doc_check` 工具入口 |
| `thincoder-core/tools/doc-write-gate.mjs` | 普通文档写门 |
| `thincoder-core/agent-tools/batch-gate.mjs` | 批档写入与收口调用面 |
| `thincoder-core/agent-tools/batch-regions.mjs` | git 变更区和按路径暂存 |

模型可见参数与行为描述住在 `thincoder-core/tool-docs/doc_check.md`，必须与当前调用面一致。

## 8. 码档原始行数门

本门属于批次收口，不是文档检查的第四项判据。它检查批档 §2 的「受影响文件（机读清单）」是否为本批代码文件携带正确的原始行数。

### 8.1 块头、表形与取值

**块头两形都认**：行首粗体 `**受影响文件（机读清单）**`；或同名标题行——`#{1,6}` 起头，标题文字剥掉粗体符、行内代码符与句末冒号后**以这个名字结尾**。`### 受影响文件（机读清单）` 与 `### 3. 受影响文件（机读清单）` 都算；`### 受影响文件（机读清单）的写法` 不算——那一行是在提它，不是在开这一块。理由：小标题是历史批档里最常见的一种写法，只认粗体会让整块静默读成零行，下游再把零行说成「漏写了行」。

**块的范围** = 块头行的下一行起，到下一个标题行或下一个块头之前；块内的表 = 范围内第一张连续表行。标题形的块头自己也是标题行，所以扫描必须从下一行起：把块头行当作块界，每一份小标题形清单都会读成零行。

粗体形的块头不是标题行，所以除标题行外还须另认块头。两个块头相邻、表只跟在后一个之下是正常写法（先举例、再写真清单）；只按标题行划界，同一张表会被两个块各算一遍。

表头为 `| 档 | 分拆方案 | 行数 |`。2 格与 3 格都收（2 格行的读数格按缺读数算），4 格以上跳过；分隔行、表头行与 `<…>` 占位行不是记录；表行必须连续，中间夹一个空行即截断，其后的行读不到。行数只接受两种值：

- 非负整数：该文件在批起快照中的内容行数。
- `新`：批起快照中不存在该文件。

空值、约数、区间、带单位文本和其他占位均按缺读数处理。`.md` 文件不承担此义务。

### 8.2 基线与量法

批起快照是建档时的工作树快照。它使用临时索引和 `commit-tree` 形成，并挂在 `refs/thincoder/baseline/` 下，避免对象被回收。读取内容使用批档记录的 sha，不以收口时的文件长度代替。

`countContentLines` 是唯一量法：末尾换行产生的空尾段不计为一行。

### 8.3 判定

`thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `assertTierPlan` 接收调用方提供的基线读取函数：

| 读取结果 | 含义 | 判定 |
|---|---|---|
| 字符串 | 快照中存在该文件 | 表中数字必须等于快照内容行数 |
| `null` | 快照中不存在该文件 | 表中只接受 `新` |
| `undefined` | 基线不可判 | 整批拒绝，不逐档猜测 |

缺少行、缺少数值或数值不符都明确拒绝。基线不可判同样拒绝，因为此时无法完成核对。

### 8.4 清单读不出行时的拒文

读数是逐档比对的，但「整份清单一行都读不出」不是缺行，是表形不对——这两种状态的下一步动作不同，拒文也不同。

- **触发** = 三个条件同时成立：本批改动面里有在盘的码档、机读清单解析出零行、档全文出现块名 `受影响文件（机读清单）`。
- **结果** = 一条专门拒文，不逐档报「清单里没有这一档的行」。逐档报缺行会把「表形不对」说成「你漏写了」，诊断成本全推给下一个收口的人。
- **拒文写什么** = 两种可接受的块头形、表须 2–3 列、表行须连续（空行会截断）；并说明表里只剩表头行或全是占位行同样是零行。三者任一不满足都读不出行。
- **不触发的形** = 档全文没有块名。那时「§2 没有机读清单」本身就是事实，逐档「没有这一档的行」照旧成立。

判据落在 `thincoder-core/agent-tools/batch-tier-gate.mjs`：解码面与解析面同在，拒文由它一条给出，解析器（`thincoder-core/agent-tools/batch-segment-vocab.mjs`）只报「读出了哪几行」，不解释为什么读到零行。

## 9. 两个时点与判域过滤

| 时点 | 批档处理 | 调用面 |
|---|---|---|
| 写时点 | 段长与行号锚照判，悬空指针按批档例外不判 | 普通写门、批档 `append` ∥ `edit` |
| 收口时点 | 批档整份不进判域 | `batch close`、`status → 已收口`、`doc_check` 的两种 mode |

`thincoder-core/doc-check/index.mjs` 的 `judgedDomainDocs(docs, { moment, root })` 是判域过滤单点：

- `moment` 必须属于 `MOMENT.writer` 或 `MOMENT.close`。
- 写时点保留非排除文档，包括批档。
- 收口时点移除 `docRoot.batches` 下的文档。
- 两种时点都应用 `index.docCheckExcludePaths`。

空输入清单是调用错误；输入全部在判域外则是合法状态，返回零命中且实际检查清单为空。批档被排除后显示的范围不包含它。

写门调用点在 `agent.config.agent.engineering === false` 时直接跳过内容检查：普通 `.md` 写盘由 `writeThroughPath` 判断，批档 `append/edit` 由 `batch-record-write.mjs` 判断。无 agent 上下文的低层调用保持原行为；收口与主动 `doc_check` 不使用这个开关。

## 10. 排除面：`index.docCheckExcludePaths`

项目通过 manifest 的 `index.docCheckExcludePaths` 声明不进入判域的项目根相对路径前缀。

- 归一使用 `thincoder-core/declaration.mjs` 的 `normalizePathList`。
- 命中只包括与前缀相等，或以「前缀 + `/`」开头的路径。
- 被排除文档不判三项，不进入实际检查清单，也不产生额外说明。
- 写时点与收口时点使用同一排除面。
- manifest 缺失、不可读或键形无效时没有排除放行，文档仍按普通规则判定。

`index.excludePaths` 服务索引，`index.docCheckExcludePaths` 服务检查，两者不得互相替代。

## 11. 验收回指

行为验收以 `docs/core/requirements/DOC-CHECK.md` 的 AC-1–AC-19 为准。常驻业务链由 `test/RTM.md` 和 `test/rtm/guard.md` 的 CLI 7 故事承载。

评审和复核必须同时看到放行侧与拒绝侧。仅在干净输入上得到 `PASS`，不能证明门能够拒绝错误输入。
