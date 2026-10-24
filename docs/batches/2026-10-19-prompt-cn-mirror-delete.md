# 2026-10-19 · prompt-cn-mirror-delete
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 07:34 逐字「**删**」——R5（蓝图第 5 轮）：删除 `docs/core/design/prompts/` 下 16 个中文镜像档 + 引用清扫 + `scripts/prompt-refs-check.mjs` 删一目录元素。**前提 = R4 已收口**（文档陈述面单面化，盘上没有一句还指着该目录）。。
> 台账 = #1682（core · 归批）。前情 = docs/batches/2026-10-18-prompt-single-face.md §2.9 R5（已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-19 07:35）

**用户令**：07:34 逐字「**删**」（对 R5 删前清单的批准）。

**R5 是什么**：删除 `docs/core/design/prompts/` 下 **16 个中文镜像档**，并同批完成三件连带，使「提示词只有一份」在盘上成立。

| # | 动作 | 不同批即坏的后果 |
|---|---|---|
| 1 | 删 16 档 | — |
| 2 | `scripts/prompt-refs-check.mjs` 删一目录元素（`:25`）+ 两行注释（`:10` `:13`） | 脚本扫一个不存在的目录 ⇒ 空扫描静默绿（假绿） |
| 3 | 引用清扫（域内 `design/prompts` 归零） | 死指针 |

**前提已达成**（R4 收口读数）：文档陈述面单面化；判面一只剩 `scripts/prompt-refs-check.mjs` 三处——**那正是本批第 2 项**。

**完成判据**（蓝图 §2.9 R5 原判据）：

1. `grep -r "design/prompts" docs/ scripts/ --exclude-dir=batches --exclude-dir=_archive` **零命中**
2. `node scripts/prompt-refs-check.mjs` **绿（exit 0）**
3. `docs/**` 下 `prompts/` 目录**不存在**

**不可逆性**：git 保留全部历史；盘上不再有。回退 = `git revert` / `git checkout HEAD~ -- <path>`。

**不在本批**：`#1683`（`thincoder-core/agent/helpers.mjs` 三处常量注）——**代码面**，需 eng-coder + designToken，另批。

> 不适用：§2 —— 本批无独立设计。处置方案由蓝图 `docs/batches/2026-10-18-prompt-single-face.md` §2.9 **R5 行**逐项给定（删 16 档 + §2.7 D/M/E/W 四类清扫 + `scripts/prompt-refs-check.mjs` 删一目录元素 + 三条判据），并已经该批设计评审。本批 = 按已批准方案**直接执行**，前置于 §6。
>
> 不适用：§3 —— 无设计评审（同上：方案已随蓝图评审；本批零新设计、零新语义）。
>
> 说明：§5 为 eng-coder 段，本批未用（实施面 = 主 agent 直接执行的机械动作），实施记录与验收读数落 §6。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**用户批准（2026-10-19 07:34）**——用户对 R5 删前清单的逐字回复：「**删**」。

**批准范围**：删除 `docs/core/design/prompts/` 下 16 个中文镜像档 + 同批三项连带（脚本删一目录元素 · 注释随改 · 域内引用清扫）。

**删前已向用户交代的四项**（07:30 消息）：

| 项 | 内容 |
|---|---|
| 要删 | `docs/core/design/prompts/` 下 16 个中文提示词档（CN 镜像） |
| 同批必做 | `scripts/prompt-refs-check.mjs` 删一目录元素（`:25`）+ 注释两处（`:10` `/` `:13`）；`#1683` 一并收 |
| 为什么现在可删 | R1 语言已清 · R2 规则已进机制档 · R3 内容已补齐 · R4 陈述已单面（没有一句还指着它） |
| 不可逆性 | git 保留全部历史，盘上不再有；回退 = `git revert` / 从 HEAD~ 取回 |

**用户看过清单后回复「删」** ⇒ 批准成立，按 §6 记录执行。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 实施与验收（父侧直接执行 · 2026-10-19 07:42）

**笔域披露**：本批无 eng-coder 参与——删除 + 脚本改指 = **文档 / 工具面机械动作**（零新语义），按 `files` 与行号逐处执行。改动前已打 checkpoint `mvegqgp7-x8a0`（88 档快照），`checkpoint rewind` 可回退。（§5 留空 = eng-coder 段未用——本批实施面 = 主 agent 直接执行，记录落本节。）

| # | 动作 | 结果 |
|---|---|---|
| 1 | `git rm -r -f docs/core/design/prompts`（16 档） | 目录已不存在 |
| 2 | `scripts/prompt-refs-check.mjs`：`:25` `PROMPT_DIRS` 删第三元素 · `:10` 域注释删一段 · `:13` 排除注释改写 | 语法 OK；「缺档守卫」失败随之消除 |
| 3 | `docs/TODO.md:19` →「提示词档原文不外发（唯一副本 = `thincoder-core/prompts/`）」 | 域内零命中 |

**三条完成判据实测**

| # | 判据 | 读数 | 判 |
|---|---|---|---|
| ① | 域内（`docs/` + `scripts/`，扣 `batches` / `_archive` / `TODO*.md`）`design/prompts` | **0** | ✅ |
| ② | `node scripts/prompt-refs-check.mjs` 绿 | **FAIL · 5 条命中** | ❌ **既有违规阻塞** |
| ③ | `docs/**` 下 `prompts/` 目录不存在 | **不存在** | ✅ |

**判据② 的诚实读数（不冒充通过）**：5 条**全部既有**——`git stash push -- scripts/prompt-refs-check.mjs` 对照实测，HEAD 版（`032d09c3`）同样输出这 5 条（且多一条「缺档守卫」失败，本批已消除）。**本批未引入，也未修掉**：

- `thincoder-core/tool-docs/batch.md:1 §4.1`
- `thincoder-core/tool-docs/doc_check.md:12 file.md` · `:33 check.md`
- `thincoder-core/agent-tools/batch-lifecycle.mjs:460 §4.18-A` · `:504 §4.18-B`

**处置**：入台账 `#1684`（`trigger = 归批`）——修 = 产品代码面（tool-docs + agent-tools）⇒ 需 eng-coder + designToken，不属本批笔域。

**记录面残留（声明排除，不动作）**：`docs/TODO-archive.md:260` 含完整字面——归档台账 = 记录面（D8 保留零触），且本批判据域已排除 `TODO*.md`。

**结算核对**：台账 `#1682` 保持**在途**（覆盖 R1–R6，R5 是其中一轮）；本批新增 `#1683`（代码常量注，条件触发）· `#1684`（refs-check 5 条，归批）。

**文档机检门**：`DOC-CHECK GATE: PASS`（§6 写入回执）。

### 收口被门拒 → 发现设计缺口（2026-10-19 07:52）

**`batch close` 被 doc-check gate 拒：`REFUSED（命中 89 条）`，全是 `锚·档缺`**——`common.md` / `persona-engineering.md` / `advisor-design.md` 这类**裸提示词档名**不再解析。

**根因（父侧实读引擎 + 全量实测）**：

| 事实 | 证据 |
|---|---|
| 归档检查的解析序 = ① 仓根相对 → ② 域根相对（`scanDirs`，本仓 = `["docs"]`）→ ③ 引用方目录相对 → ④ 域内唯一 basename | `thincoder-core/doc-check/anchors.mjs:9–11` |
| CN 镜像一直在兼任「裸提示词档名的解析目标」（它是 `docs/` 内唯一同名档） | 删档前 gate PASS；删档后同批 89 条 `档缺` |
| R4 只清了「`design/prompts` 路径字面」与「双面制陈述」，**未清裸档名引用** | R4 §6 ② 判义表：全为陈述面，无裸档名判面 |
| 全量实测：**306 行 / 447 处 / 37 档**裸提示词档名已悬空 | 父侧 node 逐行扫（含排除集外 11 行在 `TODO-archive.md`） |

**已做的两个可逆实验（均还原）**：

1. `checkConfig.scanDirs` 加 `thincoder-core/prompts` ⇒ **锚 0 ✅ 但行宽 252 ❌**（提示词档本来就长篇；且与「提示词档不在行宽机检域」的现行陈述相抵）→ 已还原 `["docs"]`。
2. 查 `checkConfig.exemptions` ⇒ 引擎**根本不读**该键（`index.mjs` / `width.mjs` 零命中）→ 无配置面解法。

**结论**：这不是 R5 的执行错，是**设计缺口**——蓝图的 R4→R5 依赖只写了「指针不改完就删 = 死链」，R4 的判面没有「裸档名」这一类。

**二选一（待父侧与用户裁）**：

| 选项 | 做法 | 代价 |
|---|---|---|
| **A. 改文档** | 306 行裸档名 → 全路径 `thincoder-core/prompts/X.md` | 与「代码档一律全路径」的现行惯例一致；但 37 档大改，且 `design/PROMPT-SYSTEM.md` 单档 137 行 |
| **B. 改引擎** | `anchors.mjs` 增解析根（或把 `thincoder-core/prompts/*.md` 判为「非文档」跳过） | 一处小改；但属**产品代码面** ⇒ 需设计 + 评审 + token + eng-coder 走全链 |

**当前状态**：16 档已删（用户批准）· 脚本已改 · 判据①③ 达成 · **判据② 被 5 条既有违规阻塞（`#1684`）· 本批 gate 未过、§1 仍「进行中」**——账户保持打开，等裁。
