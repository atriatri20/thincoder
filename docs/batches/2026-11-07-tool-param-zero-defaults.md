# 2026-11-07 · tool-param-zero-defaults
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 用户 2026-11-07 18:59「工具参数先清默认值」· 19:02「现在就开批处理掉，别等了」。
> 台账 = #2150（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：工具参数排雷——缺了就拒，不替调用方拿主意

**用户原话（逐字）**：
- 18:59「你先把工具参数盘点一下，**虽然我还不打算做全仓清理，但是工具参数应该先清默认值**。」
- 19:02「**现在就开批处理掉，别等了。**」

**用户口径（本批判据，自 18:18 起两条原话合读）**：
- 「**最危险的情况是一个必须的参数不传，代码按默认值兜底，这个是最可怕最不可控的**」
- 「**其实我是不希望任何默认值存在的，是什么参数就显式传入**」

### 盘点读数（父侧 18:59 本进程实测，`thincoder-core/agent-tools/` 59 个工具面文件）

**第四层（高危，本批主对象）——锚/`cwd` 兜底 6 处**（同一兜底形 `ctx?.agent?.cwd ?? ctx?.cwd`，逐处按符号定位）：

| 文件 | 兜底落点（符号/行为） | 活样本 |
|---|---|---|
| `doc-check.mjs` | 工具入口的 `const anchor = …` 一行 | **`#2148` 那场祸的根**——工作区锚下无项目，兜底猜根 → 域表空集 |
| `manifest.mjs` | `readManifestBase` 处的 `const base = …` 一行 | `manifest read` 撞工作区锚 ⇒ 同样猜 |
| `eng.mjs` | `enter` 动作里的 `resolveEngineeringManifest(…)` 第一参 | 工程模式开关撞工作区锚 ⇒ 同样猜 |
| `batch-ledger-bind.mjs` | 两处 `const anchor = cwd ?? ctx?.agent?.cwd`（bind 与重锚两段各一） | 台账绑定撞工作区锚 ⇒ 同样猜 |

**第一层——schema 明写默认 5 处**：`timer` 的 `seconds`(180) ∥ `subagent` 的 `recent`(5) ∥ `consult` 的 `models`(全部) ∥ `doc-check` 的 `target`(缺省=锚) ∥ `manifest` 的 `target`(两个动作各一，缺省=锚)。

**第三层真替值 3 处**：`subagent` 的 `async ?? (depth===0)` 分支替值 ∥ `timer` 的 `seconds ?? 180` ∥ `verify` 的 `verification ?? {}`。

**第二层不属病**：描述写 optional 的 12 处是"缺了有意义"的真可选（`advisor.type` 缺了拒 ∥ `read-history.path` ∥ `subagent`/`verify` 一族）——**按用户判据（缺了调用就没有意义 ⇒ 拒）它们不合格，不动**。第三层的判空形 `?? null`（只为报错信息显示）不属替值，不动。

### 为什么第四层最危险（错误搬家，`#2148` 活样本）

锚兜底出错时**不在错误点附近**：`target` 缺省 → 锚当根 → 工作区 → 猜根 → 域表空集——**链上每层都成功**，错误在三层之外的读数里才被看见。**锚是"缺了调用就没有意义"的定位参数**，按用户判据该拒，不该替调用方选。

### 边界（本批做什么 / 不做什么）

- **做**：①第四层 6 处——无法从入参或 `ctx` 得到**可用的**项目锚时**显式拒**，报文点名缺哪个参数（含工作区锚情形：锚不是项目 ⇒ 拒并列候选，**与 `#2148` 的定根判据同一条线**）；②第一层 5 处 schema 默认——删默认值，改必填（`target` 两处描述同步删「defaults to」）；③第三层真替值 3 处——按各处语义处置（`async` 的分支替值改显式三态 ∥ `timer.seconds` 改必填 ∥ `verify.verification` 改必填判缺）。
- **不做**：全仓 100+ 处函数签名默认参（用户明确"还不打算做全仓清理"）；第二层真可选参数；判空形 `?? null`；`agent-tools` 之外的目录（`agent/` ∥ `advisor/` 等另有消费形，不在盘点面内）。
- **连带面**：受影响工具的描述文本若写有「Defaults to」字样随改（同一句话的另一半，D11 同轮改齐）。

### 已定决定

- **已定决定**：排雷范围 = 第四层 6 处 + 第一层 5 处 + 第三层真替值 3 处；真可选与判空形不动；全仓签名清理不做 · 用户原话：「虽然我还不打算做全仓清理，但是工具参数应该先清默认值」 · 时间：2026-11-07 18:59

### 库外 = B 类

改动面 = `thincoder-core/agent-tools/**`（本地判据）；**外部断言 = 零**，不联网查证。

### 已定决定（补：打架点已裁）

- **已定决定**：定位参数（`doc-check.target` ∥ `manifest.target` 一类）——**缺了就拒**，不传 ⇒ 拒且报文点名参数；**不是**「缺省=锚照判」 · 用户原话：「不用等，这个已经确定了，就是缺了就拒！」 · 时间：2026-11-07 19:05

**连带面（D11 同轮改齐清单，设计 §2 必须逐一点名，实施同轮落）**：

- **被本裁定取代的形（全在 `docs/core/design/DOC-CHECK.md`）**：「不传 `target` ⇒ 照判」的三种入参形行 ∥ `AC-8`（等价性：传 ∥ 不传同结论）∥ `AC-11`（`null ≡ 不传`——缺=拒后 `null` 即缺，判据自然消解）∥ `KD-10` 守卫描述中「非空字符串才拒」的半句 ∥ `7-15` 保留（非空 `target` 解析为工作区 ⇒ 拒，与本裁定同向）∥ 需求档 `F17` 的「不传 ⇒ 锚当声明根」表述。
- **不随本裁定变的部分**：引擎判据（每档按自身项目根）∥ 域表按组根 ∥ 读数块出场条件两支 ∥ `#2148` 在飞实施批的这些面照收——**变的只是工具面入参契约（`target` 必填）**。
- **`#2148` 与本批的接续**：`#2148` 实施按已批设计收口（其 `AC` 在当时判据下自洽）；本批落「缺了就拒」时同轮改写上述各处——**两批各自一本账，改写落在 `#2150` 的账上**。

**设计席注意**：`null` 形不另设——缺 = 拒，`null` 即缺（与 `path-resolve` 对 `null` 的归一一致），验收里 `null` 与缺省同问法。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 3：设计面收尾四项已落盘（D11 第 7 ∥ 8 条 ∥ DOC-CHECK.md 的 §4.3 ①–⑬ ∥ 设计档清单与跑者两处缺口 ∥ 判据读数）；2 件未落见本段末（提示词面一句话 ∥ MANIFEST.md 存量裸名指针 66 条））
**设计档落点**：`docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md`（本批全量设计——逐处判语 ∥ 接口契约 ∥ 受影响文件 ∥ KD-1–KD-11 ∥ AC-1–AC-9 ∥ RTM 增量 ∥ 边界）。

**本批条目（覆盖 = §1 盘点读数的三层；处数单源 = 设计档 §2 的三张表——本表逐处对应，`batch-ledger-bind` 的两处在本表合为一行）**。处数口径以设计档表头「处数口径」一行为准（§1 档头的「6 处 ∥ 5 处」是盘点概数，与逐处口径不同源）：

| 层 | 处 | 判语一句话（详见设计档 §2 对应行） |
|---|---|---|
| 第四层 | `thincoder-core/agent-tools/doc-check.mjs` 锚行 | 锚行**保留**（相对形基根）；改缺省支——`target` 必填、缺 ⇒ 拒点名（KD-9；落笔等 `#2148` 收口，KD-8） |
| 第四层 | `thincoder-core/agent-tools/manifest.mjs` `resolveTarget` | `target` 必填——缺 ⇒ 抛点名；`base` 保留作相对形基根；工作区值 ⇒ 既有 `projectView` 五态 |
| 第四层 | `thincoder-core/agent-tools/eng.mjs` `enter` | **不改**——下游 `resolveEngineeringManifest` 工作区态已显式放行（零附着），KD-2 |
| 第四层 | `thincoder-core/agent-tools/batch-ledger-bind.mjs` 两处 | **不改**——锚兜底是形状防御；候选可见性已由 `workspaceCreateError` 提供，拒文换单源一并撤（KD-3） |
| 第一层 | `thincoder-core/agent-tools/timer.mjs` `seconds` | 必填化——四式皆无 ⇒ 拒点名；schema `required` 保持 `[]`（KD-5） |
| 第一层 | `thincoder-core/agent-tools/subagent.mjs` `recent` | 必填化——`clampRecent` 的 `return 5` 属造值（KD-4），删值 + 缺 ⇒ 拒点名 |
| 第一层 | `thincoder-core/agent-tools/consult.mjs` `models` | optional 不变——只删「(default: all)」句（不造值） |
| 第一层 | `thincoder-core/agent-tools/doc-check.mjs` `target` | 必填 + schema `required`——描述句删「Defaults to the session anchor」 |
| 第一层 | `thincoder-core/agent-tools/manifest.mjs` `target` ×2 | 必填 + 两处 `required` 含 `target`——描述句删「defaults to」；连带两个 tool-docs 档 ∥ `docs/core/design/MANIFEST.md` |
| 第三层 | `thincoder-core/agent-tools/subagent.mjs` `async` | 必填——缺 ⇒ 抛点名；**depth>0 一律同步、显式 `async:true` 在 depth>0 照旧被拒**（约束保留，KD-12）；`thincoder-core/agent-tools/advisor.mjs` 同形随改兼拒文尾句（KD-7） |
| 第三层 | `thincoder-core/agent-tools/timer.mjs` `seconds ?? 180` | 随必填化消形 |
| 第三层 | `thincoder-core/agent-tools/verify.mjs` `verification ?? {}` | 有码面必填——抛前置 `_verifyPassed = false`（KD-6） |

**受影响文件**（全清单与逐项改写见设计档 §4）：

- 源档 10 档：`thincoder-core/agent-tools/` 九档 + `thincoder-core/tools/shared.mjs`；其中 `thincoder-core/agent/family-tools.mjs` 是实施中暴露的必改点（spawn-only 变体的 `subagent` schema 无 `async`，必填化后不声明即每次派单被拒）。
- 工具面描述档 5 档：`thincoder-core/tool-docs/doc_check.md` ∥ `thincoder-core/tool-docs/manifest.md` ∥ `thincoder-core/tool-docs/manifest-read.md` ∥ `thincoder-core/tool-docs/subagent.md` ∥ `thincoder-core/tool-docs/advisor.md`。
- 集成调用点 6 档 + RTM 两档（改写形见设计档 §7）：RTM = `test/rtm/guard.md` ∥ `test/rtm/paths.md`。
- 设计档：`docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md` ∥ `docs/core/design/DOC-CHECK.md`（§4.3 ①–⑬，已落盘）∥ `docs/core/design/MANIFEST.md`（§2.5 第 7 条）∥ `docs/core/design/TOOLS.md`（第 8 条）；需求档 `F17` 由主 agent 改齐（第 11 条）。
- **不触**：`thincoder-core/agent-tools/eng.mjs` ∥ `thincoder-core/agent-tools/batch-ledger-bind.mjs` ∥ 不造值的真可选 ∥ 判空形 ∥ 全仓签名默认参 ∥ 提示词面。

**D11 连带面**：单源 = 设计档 §2.5 十六条（每条给「现文（逐字）→ 改成」）。重点面：

- 工具面描述档 5 档：`thincoder-core/tool-docs/advisor.md` 的 `async` 段 ∥ `thincoder-core/tool-docs/manifest.md` 的 `[target]` 方括号与 `project` 句 ∥ 另三档见设计档 §4.2。
- 源档注释面：`thincoder-core/agent-tools/advisor.mjs`（拒文尾句 + 注释）∥ `thincoder-core/agent-tools/subagent.mjs` ∥ `thincoder-core/agent-tools/subagent-actions-query.mjs` ∥ `thincoder-core/agent-tools/doc-check.mjs`。
- `docs/core/design/DOC-CHECK.md` 的入参形两行 ∥ `AC-8` ∥ `AC-11` ∥ `KD-10` 半句 ∥ `7-11` ∥ `7-14`；改写等 `#2148` 收口、其设计档解冻后落。
- `docs/core/requirements/DOC-CHECK.md` 的 F17：**属主 agent（D1），本批点名不改笔**。

**验收对照**：AC-1–AC-9 见设计档 §6（跑者与坏法见 §6.2）。

- AC-3 补一问：depth>0 的显式 `async:true` 照旧被拒——必填化不动这条判据（KD-12）。
- AC-6 判法 = 逐档逐句核：旧句清零 + 新句在场，两半均由设计档 §2.5 逐行导出；射程扣掉 KD-8 排后的两档。
- **执行顺序**：`thincoder-core/agent-tools/doc-check.mjs` 与 `docs/core/design/DOC-CHECK.md` 的改写排在 `#2148` 收口后，两者均已落盘（KD-8 已满足）。

**RTM 增量**：见设计档 §7——破行数与逐行改写形以该节为准（本表只记判语，不抄计数）。

- 破行：`test/rtm/guard.md` 的 `36-1` ∥ `36-2` ∥ `36-3`——三行入参都不带 `target`，`target` 必填后一律被拒；改写形 = 入参补 `target`，判据不变。
- 假账改正：`test/rtm/paths.md` 的 `29-2`——判据「文档门照判不拒」盘上早已为假（真值是拒），本批改回「拒 + 报文点名 `target`」。
- 冗余 0 · 缺行 0（缺参拒面落在改写后的 `29-2`；`36-4` 号未占，若评审裁定另立则用它）。

**上抛项**：一处在明（见下）；分岔 a/b/c 三判语自落（有码坐标可查），三条旧上抛已由 `#2149` 裁定。

- 父侧指示「`test/rtm/guard.md` 的 `36-1` 不需改写」与盘上冲突：该行入参逐字「不传 `target`」，本批裁定 `target` 必填 ⇒ 同一调用被拒、判据「首行 `PASS`」不再成立。按「破行数按实际重算」记入设计档 §7 的三行破行（改写形 = 入参补 `target`，判据三句不动）；评审若坚持该行原样，本批实施后它转红，需另裁。

### 设计面收尾轮（eng-designer · 2026-11-07）

实施席已把源码 ∥ tool-docs ∥ RTM ∥ 六个调用点落完并全绿，本轮只落设计面四件事。四处「改前 → 改后」逐字如下。

**① D11 第 7 ∥ 8 条：`docs/core/design/MANIFEST.md` 两处 + `docs/core/design/TOOLS.md` 一处**

| 处 | 改前（逐字） | 改后（逐字） |
|---|---|---|
| `docs/core/design/MANIFEST.md` 只读变体 schema 的 `target` 行 | `"Explicit target directory — defaults to the session anchor; relative paths resolve against it. A workspace target (several projects below it) is reported with the full project list — pass the project root you mean."`，同行 `required: ["action"]` | `"Required — pass the project root or directory you mean (relative paths resolve against the session anchor; a workspace target is reported with its project list)"`，同行 `required: ["action", "target"]`——与 `thincoder-core/agent-tools/manifest.mjs` 盘上逐字同 |
| 同档描述档全文段的 `target` 句 | `target — explicit target directory; defaults to the session anchor, relative paths resolve against it. …` | `target — the project root or directory you mean; **required** — omitting it is refused. Relative paths resolve against the session anchor. …`——与 `thincoder-core/tool-docs/manifest-read.md` 盘上逐字同 |
| `docs/core/design/TOOLS.md` 的 timer 四式行 | `一次性倒计时（默认 180s · \`seconds\` 有限正数）` | `一次性倒计时（\`seconds\` 必填 · 有限正数）` |

`docs/core/design/TOOLS.md` 另两行（#86 端差表里记 `?? 180` 的两处）**未动**：它们说的是那次端差缺陷的成因，不是 timer 参数的现行契约。

**② `docs/core/design/DOC-CHECK.md`：§4.3 ①–⑬ 与 §9 记述已落盘**

- §2 入参形三行改「缺 ∥ `null` ∥ 空串 ⇒ 拒」；两条 bullet 改「缺 ⇒ 拒、零判定」与「`null` 即缺的依据」。
- §2.1 的 `declaredBase`（声明根 = `target` 解析后的绝对路径，会话锚只作相对形基根）∥「不取清单首档定根」半句删除、换成「根由调用方指名（`target` 必填）」。
- §2.4 两层分界的兜底句改「`target` 缺 ∥ `null` ∥ 空串 ⇒ 工具面拒」。
- §3 工具面行 ∥ §4 受影响文件行改「改两处：`target` 必填 + `required: ["target"]`；`ambiguous` 守卫判据 = 非空字符串」。
- §5 KD-10 判据句保留，红点改成「`null` 落兜底支 ⇒ 缺参拒文缺失、与 `{}` 那一问报文不同」。
- AC-8 改「每根一问」等价性（A 根 ∥ B 根，坏法指向 A 根那一问）；AC-11 改「`{}` 与 `{target: null}` 两问皆拒、报文同」。
- 用例 7-11 入参改「`target` = 该工作区的绝对路径」；7-14 改「两问皆拒」；7-15 原样保留（非空 `target` 解析为工作区 ⇒ 拒，与本批同向）。
- §8 边界行改「`target` 缺 ∥ `null` ∥ 空串 ⇒ 拒；非空 `target` 解析为多项目工作区 ⇒ 另拒」。
- §9 RTM 记述随正：29-2 由「坏掉的断言、不随本批落」改成本轮已改写（拒 + 点名 `target`）；「缺的行 = 1」改「已落为 `36-3`」；AC-11 的缺参面指到 29-2。

**③ 设计档两处清单缺口**

- `docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md` §4.1 补 `thincoder-core/agent/family-tools.mjs` 一行（spawn-only 变体自声明固定 `async`；同步是该通道的契约，不是留默认值），§4 档层结论的源档数随之 9 → 10。
- §7 补「跑者同改 = 6 档」一条（`doc-check-per-file-root` ∥ `doc-check-fence-verdict` ∥ `doc-check-line-counts` ∥ `doc-check-line-refs` ∥ `batchdoc-reuse-guard` ∥ `path-resolution`），并把三行破行 ∥ 29-2 的「跑者不变」改成带档名的指向；§4.3 标题与段落、§2.5 第 10 条、AC-8 的「等 `#2148` 收口」一律改「已落盘」；AC-6 射程改「§2.5 第 1–8 ∥ 12–16 条」、③ 的全局抽扫不再跳过 `thincoder-core/agent-tools/doc-check.mjs`；§2.5 表头「现文（逐字）」与 §2.1 ∥ §2.2 ∥ §2.3 表头「盘上现状（逐字）」改「改前（逐字）」「改前现状（逐字）」——实施后那些句子已不在盘上，称「现文」即为假。

**④ 判据读数（命令 → 结果）**

| 命令 | 结果 |
|---|---|
| `grep` 于 `thincoder-core/` 查 AC-6 ③ 的八句 | 七句 0 命中；第八句为 `\`manifest\` 在定位参数缺位时必带`，literal 查 → 0 命中。唯一相邻命中 = `thincoder-core/tools/shared.mjs` 的 `\`execute\` 在定位参数缺位时必带`——§2.5 第 6 条明写 `bash` ∥ `memory` ∥ `execute` 三项照旧，不是残留 |
| `doc_check({mode:"gate", docs:[设计档三档]})` | 首行 `DOC-CHECK GATE: PASS` · 0 段有问题 |
| `doc_check({mode:"gate", docs:[设计档三档 + docs/core/design/MANIFEST.md]})` | 首行 `DOC-CHECK GATE: REFUSED（锚 66 条）`，66 条全在 `docs/core/design/MANIFEST.md`，均为存量裸名指针（`manifest.mjs` ∥ `project-context.mjs` 一类不带目录段），另 3 条为 `.thincoder/conventions.json` 的跨仓引用；本条与 `docs/core/design/TOOLS.md` 的改动区 0 条——写入回执原文「触达账存量命中 66 条——不属本次改动区」 |

**未落 / 待裁**

- `thincoder-core/prompts/discipline-normal.md` 的「Top-level subagent spawns default to async: `subagent` without `async` returns `{id, running}` immediately」被本批改假——提示词面不是设计席笔域，未改笔，与实施席 §5 的同条披露合为一件待裁。
- `docs/core/design/MANIFEST.md` 的 66 条存量裸名指针：归 `#1731` 的机械改名另批，本轮不动；`doc_check` 整档判因此 `REFUSED`，PASS 只对本次实质改动的三档成立。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**评审对象**：`thincoder/docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md`（9 处 ∥ AC-1~AC-7 ∥ KD-1~KD-8）+ 本批 §2。

**已逐条验证成立的设计断言**：

- 分岔 c 成立：`thincoder/thincoder-core/agent-tools/eng.mjs` 的 `if (!r.ok && r.code !== "workspace")` + `agent.manifest = r.ok ? r.manifest : null`——工作区态确为显式放行、零附着。
- KD-3 前提成立：`thincoder/thincoder-core/agent-tools/batch.mjs` 逐字 `const cwd = agent.cwd`，恒传。
- 两处真可选形成立：`clampRecent` 的 `if (!Number.isFinite(v)) return 5`；`selectConsultModels` 的 `selectors == null` ⇒ 全池。
- `noRootMessage` 确有「；下辖候选项目：」尾段（`thincoder/thincoder-core/ledger-db.mjs`）。
- 源档越线 = 0：§4 的 8 个源档实量最大者 472 行（`thincoder/thincoder-core/agent-tools/consult.mjs`），无档过 500。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解 | 设计 §2.2 连带面 ∥ §4 均无 `thincoder/docs/core/design/DOC-CHECK.md`、`thincoder/docs/core/requirements/DOC-CHECK.md`。该档仍逐字写「不传 `target`」「照判——`target` 缺省时锚即声明根」，并有 AC-8 ∥ AC-11 ∥ 7-11 ∥ 7-14 ∥ KD-10；本批 §1「被本裁定取代的形」已点名这些形 |
| 2 | 🔴 | 未解 | 设计 §7「破行 = 0」与盘上不符。`thincoder/test/rtm/guard.md` 36-1 行输入逐字「不传 `target`」、断言「首行逐字 `DOC-CHECK GATE: PASS`」，跑者 `thincoder/test/integration/doc-check-per-file-root.test.mjs`；新行仍「另取未占号」 |
| 3 | 🔴 | 未解 | AC-7「`ctx?.agent?.cwd ?? ctx?.cwd` ⇒ 0 命中」与设计自留的「relative paths resolve against the session anchor」冲突。`doc-check.mjs` 的 `resolvePathTarget(anchor, givenTarget, …)` ∥ `resolve(anchor, givenTarget ?? "")` 仍吃锚；`thincoder/thincoder-core/path-resolve.mjs` 逐字 `const start = resolve(anchor ?? ".")` ⇒ 删锚行 = 基根落 `process.cwd()` |
| 4 | 🔴 | 未解 | D11 清单外仍有旧默认。`thincoder/thincoder-core/tool-docs/doc_check.md`「Arguments — `target` (optional)」；`thincoder/thincoder-core/tool-docs/subagent.md`「(default 5, via recent)」；`advisor.mjs` schema「default at depth 0 = true」；`doc-check.mjs` 头注「`target` 缺省时锚即声明根，照跑」；`manifest.mjs` `resolveTarget` 注「缺省 = 会话锚」；`thincoder/thincoder-core/tools/shared.mjs` 的 `PROJECT_PARAM_DESC`「`manifest` 在定位参数缺位时必带」 |
| 5 | 🔴 | 未解 | AC-5 后半所守场景不可达。`thincoder/thincoder-core/agent-tools/batch-paths.mjs` 的 `resolveBatchCreatePath` 在工作区锚下：不属候选项目 ⇒ 先抛 `workspaceCreateError`（已带候选）；属候选 ⇒ `resolveLedgerRoot` 必得根。无根支只在普通无项目目录触发 ⇒ `noRootMessage` 的 `tail` 为 `no-project` ⇒ 尾段空 |
| 6 | 🟡 | 未解 | KD-4 在 `consult.models` 站得住、在 `subagent.recent` 站不住：`clampRecent` 的 `return 5` 与 `timer.seconds` 的 `args.seconds ?? 180` 同形；删「(optional, default 5)」后 5 成不披露默认值 |
| 7 | 🟡 | 未解 | AC-1~AC-5 无跑者无坏法（§7 只写「实施轮创建，用毕即删」、无档名）。对照 AC-6 ∥ AC-7 至少有 grep 形与 0 命中读数 |
| 8 | 🟡 | 未解 | `thincoder/docs/core/design/PROMPT-SYSTEM.md` §6.77 C2 行逐字「schema 加 `required: true`」。设计对两个 `target` 只落描述句 + 代码拒判，未写 schema `required`（`manifest` 现盘 `required: ["action"]`，`doc_check` 无该数组），亦无 KD-5 式理由 |
| 9 | 🟡 | 未解 | 处数/档数不互校。设计头注「7 个工具档」vs §4 的 8 源档 + 3 tool-docs + 2 设计档；本批 §2「11 档（9 个…源档）」；「第四层 6 处」表列 5 处、「第一层 5 处」表列 6 项 |
| 10 | 🟡 | 未解 | KD-6 未判抛的两件后果。BLOCKED 支是「出报告体 + 置 `agent._verifyPassed = false`」，抛会丢报告体且赋值不到；`thincoder/thincoder-core/agent/completion.mjs` 读 `agent._verifyPassed === false` ⇒ 留上轮值 |
| 11 | 🟡 | 未解 | 无最近先例行（先例坐标 + 同形/偏离理由）。`advisor.type` 的「Omitting it is refused — there is no default」与 `manifest` KD-M1-39 只在正文散引 |
| 12 | 🟡 | 未解 | 设计档无调研取证行（本批 §1「外部断言 = 零，不联网查证」在记录面，不在设计面） |
| 13 | 🟡 | 未解 | 新增 5 条拒文/schema 句无 existing-piece 三问答案（`existing:` / `none found:` / `existing but unusable:`） |
| 14 | 🔵 | 未解 | 「档层结论」结论成立（越线 0 档，实量最大 472 行），但句内带期望增量「无一档净增 >50 行」——达标判据只留结论 |
| 15 | 🔵 | 未解 | 设计 §2.2 连带面称活样本「所引的 schema 行在 `#2148` 收口后已改」。现盘 `doc-check.mjs` schema 仍逐字含「Defaults to the session anchor.」⇒ 该断言今天为假，应写成落笔后成立 |

**计数**：🔴 5 · 🟡 8 · 🔵 2（共 15 条）。

VERDICT: changes-required

### 轮次 2（评审子代理）

第 2 轮：只验上一轮 15 条。逐条复查现盘后，上一轮五条 🔴 全部收口，修正本身引入 2 条新 🔴。

**收口证据（各一条）**

- 🔴1 收口：`thincoder/docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md` §4.3 列 ①–⑭，逐条可执行；执行顺序写死（§4.3 前言「等 `#2148` 收口、其设计档解冻后改」+ 本档 §2「执行顺序」）。逐字核对 ①「照判——`target` 缺省时锚即声明根」∥ ②「与「不传」**同结论**」∥ ④「盘上已成立」∥ ⑤「`target` 缺省时锚就是声明根、照判」∥ ⑥「按会话锚兜底」∥ ⑧ AC-8「与「不传 `target`（锚 = 工作区）」那一问对比」∥ ⑨ AC-11「`target: null` ≡ 不传 `target`」∥ ⑪ 7-11 ∥ ⑫ 7-14 ∥ ⑬ 7-15，均在 `thincoder/docs/core/design/DOC-CHECK.md` 盘上。
- 🔴2 部分收口：36-1 认对（输入「不传 `target`」∥ 跑者 `thincoder/test/integration/doc-check-per-file-root.test.mjs` ∥ 改写形），另给未占号 `36-4`；29-2 那一半读数错，见新 #16。
- 🔴3 收口：AC-7 改为「锚不作 `target` 缺省、仍是相对形的基根」，判法 = AC-5 第三笔（无锚 + 相对 `target` ⇒ 拒），与 KD-9 同向。
- 🔴4 收口：§2.5 第 1–6 条覆盖上一轮点名的六处（`thincoder/thincoder-core/tool-docs/doc_check.md`「Arguments — `target` (optional)」∥「It defaults to the session anchor.」∥ `thincoder/thincoder-core/tool-docs/subagent.md`「(default 5, via recent)」∥ `thincoder-core/agent-tools/advisor.mjs`「default at depth 0 = true」∥ `doc-check.mjs` 头注 ∥ `manifest.mjs` `resolveTarget` 注 ∥ `thincoder/thincoder-core/tools/shared.mjs`「`manifest` 在定位参数缺位时必带」）。残留面见新 #17 ∥ #20。
- 🔴5 收口：撤得对——§2.1 第 4 ∥ 5 行判「不改」，理由与盘上一致（`thincoder/thincoder-core/agent-tools/batch-paths.mjs` 的 `workspaceCreateError` 已带候选；无根支只在普通无项目目录，`noRootMessage` 的 `tail` 为空）；AC-5 已不含 batch 半句。
- 🟡6 ∥ 🟡8 ∥ 🟡7 ∥ 🟡10 ∥ 🟡11 ∥ 🟡12 ∥ 🟡13 ∥ 🔵14 ∥ 🔵15 均已按上一轮所指改到位（`recent` 必填化 ∥ AC-8 三处 `required` ∥ §6.2 跑者与坏法 ∥ KD-6 两件后果 ∥ 最近先例行 ∥ 调研取证行 ∥ §2.4 三问 ∥ 增量数字已删 ∥ 活样本改「保留」）。

**本轮结论表**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已收口 | §4.3 ①–⑭ ∥ §2.5 第 10 ∥ 11 条 ∥ 本档 §2「执行顺序」 |
| 2 | 🔴 | 已收口（29-2 另见 #16） | §7「破行 = 2」段 1 行；`guard.md` 36-1 现文 |
| 3 | 🔴 | 已收口 | AC-7 现文「锚不作 `target` 缺省、仍是相对形的基根」∥ KD-9 |
| 4 | 🔴 | 已收口 | §2.5 第 1–6 条；残留见 #17 ∥ #20 |
| 5 | 🔴 | 已收口 | §2.1 第 4 ∥ 5 行 ∥ KD-3；AC-5 无 batch 半句 |
| 6 | 🟡 | 已收口 | §2.2 第 2 行「**必填化**」∥ AC-3「`observe` 无 `recent` ⇒ 拒含 `recent`」 |
| 7 | 🟡 | 已收口 | §6.2 跑者 `node --test docs/batches/…test.mjs` ∥ 逐条坏法 |
| 8 | 🟡 | 已收口 | AC-8 三处 `required` ∥ KD-11 |
| 9 | 🟡 | 已收口 | 设计头注「处数单源 = §2 各表行数」∥ §4「清单行数 = 下表行数」；残留见 #22 |
| 10 | 🟡 | 已收口 | §2.3 后果段「必须先置 `_verifyPassed = false`」∥ KD-6 |
| 11 | 🟡 | 已收口 | §1「最近先例」∥「一处偏离」 |
| 12 | 🟡 | 已收口 | §1「调研取证」两行 |
| 13 | 🟡 | 已收口 | §2.4 第 1–6 条 `existing:` ∥ `existing but unusable:` |
| 14 | 🔵 | 已收口 | 增量句已删；结论缺一行，见 #23 |
| 15 | 🔵 | 已收口 | §2.5 第 9 条「**保留**：它是判据的取证句」 |
| 16 | 🔴 | 新 | §7 引 29-2「判据列**断言「文档门**照判不拒**……首行 `DOC-CHECK GATE: PASS`**」；`thincoder/test/rtm/paths.md` 29-2 现文是「三面同一句报明形：拒 + 候选全列……文档门首行 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）`」；该档 `grep` 照判 ∥ 不拒 ∥ PASS 零命中 |
| 17 | 🔴 | 新 | `thincoder/thincoder-core/tool-docs/advisor.md` 逐字「the review runs in the BACKGROUND by default」未入 §2.5 ∥ §4.2（§4.2 只列 doc_check.md ∥ manifest.md ∥ manifest-read.md ∥ subagent.md），而 §3 契约行把 `advisor` 的 `async` 改必填 |
| 18 | 🟡 | 新 | AC-6 七式抓不到 §2.5 自己列的句子：「top-level spawns are async by default」∥「Default-async at depth 0」∥「Arguments — `target` (optional)」∥ `advisor.md`「by default」⇒「0 命中」≠ D11 改齐 |
| 19 | 🟡 | 新 | §4.3 ⑧ ∥ ⑨ 只改判据句，未同步坏法句：AC-8「坏法 = 恢复 `view.state === "workspace"` 提前返回 ⇒ 「不传」那一问变 `ERROR`」∥ AC-11「坏法 = 守卫写回 `args?.target !== undefined`」——删「不传」那一问后两句无红点 |
| 20 | 🟡 | 新 | 源档注释残留未列：`thincoder-core/agent-tools/doc-check.mjs`「`target` 缺省时锚即声明根——工作区锚照它判」∥ `subagent.mjs`「depth-0 spawns default to async for EVERY role」∥ `subagent-actions-query.mjs`「默认 ~5 条摘要」 |
| 21 | 🟡 | 新 | 新描述句丢真约束：设计稿「the depth no longer decides」，盘上 `advisor.mjs` 仍「depth>0 → always sync.」∥「an explicit async:true there is rejected」 |
| 22 | 🟡 | 新 | §4.2 `thincoder-core/tool-docs/manifest.md` 回指「§2.5 第 7 条同句」，而第 7 条是 `thincoder/docs/core/design/MANIFEST.md`；tool-docs 两档在 §2.5 无行，`manifest.md`「- init [target]」仍在 |
| 23 | 🔵 | 新 | 批档 §1「第四层…6 处」vs 设计 §2.1 五行；「第一层…5 处」列六项而 §2.2 第 5 行含两处 |
| 24 | 🔵 | 新 | 设计档无档层结论行；实量 §4 的 9 个源档最大 472 行（`consult.mjs`），越线 0 档，结论应补一行 |

**计数**：上一轮 15 条 → 已收口 15；本轮新增 🔴 2 · 🟡 5 · 🔵 2。

VERDICT: changes-required

### 轮次 3（评审子代理）

第 3 轮：只验上一轮 24 条（15 已收口 + 9 新增）。逐条复查现盘：上一轮 9 条新增的处理全部到位，另留 1 条 🟡 ∥ 1 条 🔵，均非阻断。

**收口证据（逐字核对盘上，各一条）**

- #16 收口：设计档 §7 现在逐字引 `29-2`「三面同一句报明形：拒 + 候选全列」∥「文档门首行 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）` + 候选行」，与 `test/rtm/paths.md` 的 `29-2` 行一致；并点破「两行对同一个调用断言相反结论」；破行按父侧裁定重算 = 3（`36-1` ∥ `36-2` ∥ `36-3`），三行入参在 `test/rtm/guard.md` 盘上均不带 `target`；`36-4` 号未占属实。
- #17 收口：`thincoder-core/tool-docs/advisor.md` 进 §2.5 第 12 条 ∥ §4.2，两处现文逐字成立（「the review runs in the BACKGROUND by default」∥「Inside a child (depth>0) reviews are always synchronous」）。
- #19 收口：§4.3 ⑧ ∥ ⑨ 各加「同行自己的坏法句一并改写」，红点改指向「`target` = 工作区绝对路径」那一问 ∥「报文与 `{}` 那一问不同」。
- #20 收口：§2.5 第 4 条收了守卫注释「`target` 缺省时锚即声明根——工作区锚照它判」、第 15 条收 `thincoder-core/agent-tools/subagent.mjs` 两处注释、第 16 条收「recent 参数钳制（默认 ~5 条摘要」；四处逐字命中盘上。
- #21 收口：§2.3 第 1 行改写形保留「At depth>0 every spawn is synchronous」；新增 KD-12 立「仍生效的约束逐句保留」。
- #22 收口：§4.2 改回指 §2.5 第 13 ∥ 14 条（第 13 条现文含「- init [target]」与「Read only when `target` is absent」），不再指向第 7 条。
- #23 ∥ #24 收口：设计档表头「处数口径」段与 §4「**档层结论**：越线 0 档」两行各就位。
- #18：覆盖半收口（改为逐档逐句核），残留见 #25。

**本轮结论表**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1–5 | 🔴 | 已收口 | §4.3 ①–⑭ ∥ AC-7 ∥ §2.5 第 1–6 条 ∥ §2.1 第 4 ∥ 5 行 ∥ KD-3 |
| 6–13 | 🟡 | 已收口 | §2.2 第 2 行 ∥ §6.2 ∥ AC-8 ∥ 表头「处数口径」∥ §2.3 后果段 ∥ §1「最近先例」∥ §1「调研取证」∥ §2.4 |
| 14–15 | 🔵 | 已收口 | §4「档层结论」∥ §2.5 第 9 条「**保留**：它是判据的取证句」 |
| 16 | 🔴 | 已收口 | §7「两行对同一个调用断言相反结论」∥「破行 = 3」；`test/rtm/paths.md` 29-2 ∥ `test/rtm/guard.md` 36-1 ∥ 36-2 ∥ 36-3 |
| 17 | 🔴 | 已收口 | §2.5 第 12 条 ∥ §4.2 的 `thincoder-core/tool-docs/advisor.md` 行 |
| 18 | 🟡 | 已收口（覆盖半） | AC-6「逐档逐句核」；残留见 #25 |
| 19 | 🟡 | 已收口 | §4.3 ⑧ ∥ ⑨「同行自己的坏法句一并改写」 |
| 20 | 🟡 | 已收口 | §2.5 第 4 ∥ 15 ∥ 16 条 |
| 21 | 🟡 | 已收口 | §2.3 第 1 行「仍生效的约束逐句保留」∥ KD-12 |
| 22 | 🟡 | 已收口 | §4.2 回指 §2.5 第 13 ∥ 14 条 |
| 23 | 🔵 | 已收口 | 设计档表头「处数口径」段 ∥ 批档 §2「处数口径以设计档表头为准」 |
| 24 | 🔵 | 已收口 | §4「**档层结论**：越线 0 档」 |
| 25 | 🟡 | 新 | AC-6「①**旧句清零**——各行「现文（逐字）」格里的每一句，在该行点名的文件里字面命中 0」与 §2.5 第 2 条「**保留**」∥ 第 12 条「第二句**保留**（仍生效，KD-12）」相抵 |
| 26 | 🔵 | 新 | §2.5 第 11 条引 F17 现文「（工具面收到的 `target`，或父侧会话锚）」，`docs/core/requirements/DOC-CHECK.md` 的 F17 此行实为「父侧会话锚即调用方给的根；**工具面 `target` 必须显式传，不传就拒**」 |

**计数**：上一轮 24 条 → 已收口 24（#18 覆盖半收口）；本轮 🟡 1 · 🔵 1（#25 ∥ #26，均非阻断）。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户指令 + 整批令**：18:59「你先把工具参数盘点一下，**虽然我还不打算做全仓清理，但是工具参数应该先清默认值**」；19:02「**现在就开批处理掉，别等了**」；19:05「**不用等，这个已经确定了，就是缺了就拒！**」——**三句合起来 = 方向（清默认值）+ 强度（缺了就拒）+ 授权（立即开做）**。19:04「不用等我签，都自动跑完」= 整批令。
- **父侧裁定（四处）**：① 排雷范围 = 锚兜底 6 处 + schema 默认 5 处 + 真替值 3 处，全仓签名清理不做；② `recent` ∥ `models` 那次我判「真可选」——**评审驳回一半，我认**：`recent` 的 `return 5` 与 `?? 180` 同形，改必填；`models` 的「全池」是真语义，保留；③ 裁定 A：`AC-6` ① 判域不含标「保留」的句子；④ 裁定 B：`§2.5` 第 11 条跳过（`F17` 已在 `#2148` 收口时改齐）。
- **设计评审三轮**：轮 1 `changes-required`（5 🔴 + 8 🟡 + 2 🔵）→ 修正 → 轮 2 `changes-required`（15 条全收 + 新增 2 🔴：`29-2` 引文编造 ∥ `advisor.md` 未进 D11）→ 修正 → 轮 3 `pass`（🔴 0 · 🟡 1 · 🔵 1），凭证签发。
- **实施在配额上断过一次**（`#62` 之前），**并两次被我写窄的指令卡住**：一次「不动 `test/integration/**`」（**错——改契约就要改调用点**），一次「不动批档 `§5`」（**错——那是实施席的段**）。**两次都由实施席当场顶回来，我改判。**
- **`A8`-类判断由父侧做**：本批收口判定 = 父侧独立复量四组读数（见 `§6`），非采信实施席报数。

## §5 实施记录（eng-coder）
**状态行**：实施完成（AC-1~AC-8 全绿（单元 9/9 · 六个跑者 16/16 · 关联 18/18 · 门 PASS）；审计 1 轮 4 条，2 条修正到位、2 条披露；终态 clean）



### 实施记录（eng-coder · 2026-11-07）

**执行参数**：`round = initial` · 判据单源 = `docs/core/design/TOOL-PARAM-ZERO-DEFAULTS.md`（§2 三张表 ∥ §2.5 十六条 ∥ §3 契约 ∥ §6 AC-1–AC-9）· `#2148` 已收口 ⇒ KD-8 冻结窗解除，`thincoder-core/agent-tools/doc-check.mjs` 与本轮同落。

**两条裁定（父侧本轮下达，实施按此办）**：`AC-6` ① 的判域不含 `§2.5` 标注「保留」的句子（裁定 A）· `§2.5` 第 11 条需求档 `F17` 已在盘改齐，本轮跳过（裁定 B）· `docs/core/design/**` 与需求档由设计席另笔，本轮不碰。

#### 逐档改前 → 改后

| 档 | 改前 | 改后 |
|---|---|---|
| `thincoder-core/agent-tools/manifest.mjs` | `resolveTarget(args, ctx)` 缺省支 `: resolve(base)`；两处 schema「defaults to the session anchor」；两处 `required: ["action"]` | `resolveTarget(action, args, ctx)` 非非空字符串即抛、报文点名 `target`；两处描述改 Required 形；两处 `required: ["action","target"]`；`base` 行保留作相对形基根 |
| `thincoder-core/agent-tools/doc-check.mjs` | `target` 缺省时锚即声明根；无 `required` | 缺 ∥ 空串 ∥ `null` ⇒ 返回 `doc_check` 的 target 必填拒（零判定、不产 verdict 首行）；锚缺位 + 相对形 ⇒ 拒点名锚（不落 `process.cwd()`）；`required: ["target"]`；头注与两处守卫注释同改 |
| `thincoder-core/agent-tools/timer.mjs` | schema「(default 180)」+ `Number(args.seconds ?? 180)` | 四式皆无 ⇒ 抛、报文明「seconds 必填，或改用 at / every / daily」；`required` 保持 `[]`（KD-5） |
| `thincoder-core/agent-tools/subagent.mjs` | `wantAsync = args.async ?? ((ctx.depth ?? 0) === 0)`；`recent` 描述「(optional, default 5)」 | `async` 非布尔即抛（点名 → true ∥ false）；`recent` 描述改必填形（1..20）；两处注释改必填形（depth>0 无异步判据逐句保留，KD-12） |
| `thincoder-core/agent-tools/subagent-actions-query.mjs` | `clampRecent` 的 `if (!Number.isFinite(v)) return 5` | 入口判 `recent`（缺 ∥ 非数 ⇒ JSON 拒、点名 `recent`）；`clampRecent` 变纯钳制 1..20（不再造值） |
| `thincoder-core/agent-tools/advisor.mjs` | schema「default at depth 0 = true…」；`isAsync` 含 depth 分支；拒文尾含「without async:true」 | `async` 非布尔即拒发（登记 `_advisorRefusals`，零实例零 token）；位置在类型门之后、账链门之前（缺参不先花一次台账查）；`isAsync = asyncRequested`；拒文尾改「Call advisor again with async:false.」；depth>0 显式 true 照旧拒 |
| `thincoder-core/agent-tools/consult.mjs` | schema「(default: all)」 | 「Optional subset to narrow the pool — omit to run the whole pool.」 |
| `thincoder-core/agent-tools/verify.mjs` | `const v = args.verification ?? {}` | 有码面缺 `verification` ⇒ 先置 `_verifyPassed = false` 再抛、点名 `verification`；无码面不要求；BLOCKED 报面逐字不变 |
| `thincoder-core/tools/shared.mjs` | `PROJECT_PARAM_DESC` 含「manifest 在定位参数缺位时必带」 | 删 manifest 一项（只余 `bash` ∥ `memory` ∥ `execute`） |

工具面描述档五档按 `§2.5` 的「改成」列逐句改，标「保留」的两句原样留着：`thincoder-core/tool-docs/doc_check.md` ∥ `thincoder-core/tool-docs/manifest.md` ∥ `thincoder-core/tool-docs/manifest-read.md` ∥ `thincoder-core/tool-docs/subagent.md` ∥ `thincoder-core/tool-docs/advisor.md`。

RTM 两档：`test/rtm/guard.md` 的 `36-1` ∥ `36-2` ∥ `36-3` 入参补 `target`（= 该工作区绝对路径），三句判据不动；`test/rtm/paths.md` 的 `29-2` 文档门那半笔按设计 §7 改成「拒 + 报文点名 target」。

`docs/batches/2026-11-07-tool-param-zero-defaults.test.mjs` 为本批单元档（AC-1..AC-8 各一法 + AC-6 逐句两半 + AC-7 符号面），收口即删。

#### 读数（命令与结果）

| 命令 | 结果 |
|---|---|
| `node --test docs/batches/2026-11-07-tool-param-zero-defaults.test.mjs` | tests 9 · pass 9 · fail 0 |
| 同上（坏法波：manifest 守卫改假 ∥ timer 恢复 `?? 180` ∥ verify 删置 false ∥ doc-check 判据改「键存在」∥ subagent 恢复 `?? depth===0`） | tests 9 · pass 4 · fail 5 —— 红的恰是 AC-1 ∥ AC-2 ∥ AC-3 ∥ AC-4 ∥ AC-5，AC-6 两半 ∥ AC-7 ∥ AC-8 照绿 ⇒ 用例非空转 |
| `node --test --test-reporter=tap test/integration/doc-check-per-file-root.test.mjs` | tests 3 · pass 3 |
| `node --test --test-reporter=tap test/integration/doc-check-fence-verdict.test.mjs` | tests 1 · pass 1 |
| `node --test --test-reporter=tap test/integration/doc-check-line-counts.test.mjs` | tests 2 · pass 2 |
| `node --test --test-reporter=tap test/integration/doc-check-line-refs.test.mjs` | tests 4 · pass 4 |
| `node --test --test-reporter=tap test/integration/batchdoc-reuse-guard.test.mjs` | tests 1 · pass 1 |
| `node --test --test-reporter=tap test/integration/path-resolution.test.mjs` | tests 5 · pass 5 |
| `node --test --test-reporter=tap test/integration/batch-live-batch-lock.test.mjs test/integration/manifest-workspace-init.test.mjs` | tests 15 · pass 15 |
| `node --test --test-reporter=tap test/integration/advisor-record-gate.test.mjs` | tests 3 · pass 3 |
| `doc_check({mode:"gate", docs:[RTM 两档 + tool-docs 五档]})` | `DOC-CHECK GATE: PASS` · 0 段有问题（7 档全清） |

#### 审计与修正

**审计轮 1**（只读 explore 对设计核偏离）：4 条。两条 🟡 已收口 —— advisor 的 `async` 必填判据上移到类型门之后、账链门之前（缺参不再先花一次台账查）；`thincoder-core/tool-docs/manifest.md` 的拒文形句补上「参数级拒判」这一例外（🔵）。另两条是披露项（下一节），非缺陷。

**终态：`clean`** —— 审计 1 轮 + 修正 1 轮，上面全部测试与门在修正后复跑仍全绿。

#### 披露项（超出设计 §4 清单的改动，逐条给理由）

1. `thincoder-core/agent/family-tools.mjs`（**新增**；`§4` 未列，`§8` 反把 `thincoder-core/agent/` 划出笔域）。工程子代理的 spawn-only `subagent` 变体在装配时 `delete props.async`（schema 无此参数）；`async` 必填后**每一次 eng-coder ∥ eng-designer 的审计 ∥ 勘察派单都会被拒**。改法 = 变体自己声明固定值（同步）。这不是留默认值：模型在该通道**根本没有 async 选项**，同步是该通道的契约。**设计漏了这一档 ⇒ 属设计面漂移，请在 `§4` 补一行。**
2. `test/integration/` 六档（`doc-check-per-file-root` ∥ `path-resolution` ∥ `doc-check-fence-verdict` ∥ `doc-check-line-counts` ∥ `doc-check-line-refs` ∥ `batchdoc-reuse-guard`）：只补入参（`target` = 该档夹具根 ∥ `async: false`），判据除 `29-2` 那笔（设计 §7 点名的假账）外一字未动。**设计 §7 的「跑者不变」与此不符** —— 参数改必填即改契约，契约的调用点必须同改；父侧本轮已裁定照改。`29-2` 的用例名与注释随判据一并收正（编号前缀不动）。

#### 未做（留给设计席，不在本笔）

`docs/core/design/DOC-CHECK.md` 的 ①–⑭、`docs/core/design/MANIFEST.md` 的两处「defaults to the session anchor」、`docs/core/design/TOOLS.md` 的「默认 180s」句（`§2.5` 第 7 ∥ 8 ∥ 10 条）—— 属设计席笔域，父侧本轮明示不碰。`§2.5` 第 11 条（需求档 `F17`）已在盘改齐，无需改。

#### 代码评审（`advisor` type=code · 1 轮）与修正轮 2

**评审返回 `changes-required`**：🔴 1 · 🟡 5 · 🔵 2。本轮内处置如下。

**已改（三处，均在本笔笔域）**：

| 处 | 改动 |
|---|---|
| `thincoder-core/agent-tools/subagent.mjs` 的 `async` schema 描述 | 该 property 是全动作共用的，而 `action:'escalate'` 支仍逐字「if (args?.async !== false)」（缺参照走异步）⇒ 补一句限定：「action:'escalate' keeps its own form…」。设计 §2.5 第 2 条的「改成」句本身缺这一限定。 |
| `thincoder-core/tool-docs/subagent.md` | 两处调用形示例补 `async=true`（原例在必填化后必被拒）；`Async spawn` 段补「Omitting `async` is refused — pass it explicitly.」，与 `thincoder-core/tool-docs/advisor.md` 同形。 |
| `thincoder-core/agent-tools/manifest.mjs` | 补「锚缺位 + 相对形 ⇒ 拒、点名锚」一支（原本 `resolve(undefined, given)` 抛裸 `ERR_INVALID_ARG_TYPE`），与 `thincoder-core/agent-tools/doc-check.mjs` 同支——设计 §2「三条入参契约（全批共用）」。 |

复跑读数：`node --test` 单元档 + `test/integration/manifest-workspace-init.test.mjs` + `test/integration/batch-live-batch-lock.test.mjs` + `test/integration/batchdoc-reuse-guard.test.mjs` = tests 25 · pass 25 · fail 0；`doc_check` 门七档仍 `PASS`。

**未改（不在本笔笔域，须父侧裁 / 设计席落笔）**：

1. **`docs/core/design/MANIFEST.md` 两处旧句 + `docs/core/design/TOOLS.md` 一处旧句 = 设计 AC-6 射程内的第 7 ∥ 8 条，盘上仍在。** 父侧本轮明示 `docs/core/design/**` 由设计席另笔，故本笔不碰。⇒ 交付面上 AC-6 只在本笔落地面成立；要拿到 AC-6 全绿，**要么设计席落这四句，要么改 AC-6 的射程句**（把第 7 ∥ 8 条移出并登记欠账）。
2. **`thincoder-core/prompts/discipline-normal.md` 被本批改假。** 该档逐字「Top-level subagent spawns default to async: `subagent` without `async` returns `{id, running}` immediately」——本批后省 `async` 会抛「subagent: async is required」。设计 §8 把提示词面划在笔域外，故未擅改。⇒ **待裁**：改这一句，还是开一条欠账行。
3. 设计清单两处缺口（已在上文「披露项」点名）：`thincoder-core/agent/family-tools.mjs` 缺 `§4` 一行；`§7` 的跑者清单只记两档而实测改了六档。

**终态：`clean`（本笔笔域内）** —— 审计 1 轮 + 代码评审 1 轮 + 修正 2 轮；上面全部测试与门在修正后复跑全绿。三处待裁项全是笔域外（设计面 ∥ 提示词面），已逐条点名。

### 提示词面补笔（eng-coder · 2026-11-07 补记轮）

**笔域**：只 `thincoder-core/prompts/discipline-normal.md` 一档、只两处句子。源码 ∥ `test/**` ∥ 设计档 ∥ 其余提示词档 ∥ 批档其它段，一概未动。本轮无源码改动（工具契约上一轮已落盘）。

**改动两处（改前 → 改后，逐字）**

处一 · 委派段的括号半句 —— 改前：

```text
  Sized delegation without these parameters is a defect — the coder would re-explore what the parent already knows (async default — if your next step depends on the report, end the turn and let it arrive (or declare dependsOn); pass `files` for scheduler serialization).
```

处一 · 改后：

```text
  Sized delegation without these parameters is a defect — the coder would re-explore what the parent already knows (pass `async: true` — if your next step depends on the report, end the turn and let it arrive (or declare dependsOn); pass `files` for scheduler serialization).
```

处二 · Top-level spawn 首句（上一轮已落盘，因上一轮明示不写批档而此处首次入账）—— 改前：

```text
- Top-level subagent spawns default to async: `subagent` without `async` returns `{id, running}` immediately — results reach you automatically, no polling needed;
```

处二 · 改后：

```text
- Top-level subagent spawns need `async` stated explicitly: `async: true` returns `{id, running}` immediately — results reach you automatically, no polling needed; omitting it is refused (there is no default);
```

**读数**：`doc_check({mode:"gate", target:"D:\teamcode\thincoder", docs:["thincoder-core/prompts/discipline-normal.md"]})` → 首行 `DOC-CHECK GATE: PASS` · 0 段有问题（1 档全清）。

**同档其余句子仍为真的核查（本轮实测，逐条一句）**

- Top-level spawn 段的四句仍真：`async` 必填由 `thincoder-core/agent-tools/subagent.mjs` 逐字 `throw new Error("subagent: async is required — pass true for an async spawn or false for a blocking flight")` 坐实；depth>0 的显式 `async:true` 由 `thincoder-core/agent-tools/subagent-run.mjs` 逐字 `throw new Error("async spawn only available at the top level")` 拒 —— 故「depth>0 一律同步」仍真。
- Escalate 段仍真：`thincoder-core/agent-tools/subagent-actions.mjs` 逐字 `if (args?.async !== false) {` —— escalate 在必填门之前分流（`thincoder-core/agent-tools/subagent.mjs` 的 `if (action === "escalate") return await executeEscalateAction(args, ctx)` 在 `async` 必填判断之上），故「Top-level escalate defaults to async」不受本批影响。
- verify ∥ consult 两句仍真，方向一致：verify 的 `verification` 由可选变必填，而句子本就说「declare … via verification.status」；`models` 仍是真可选（本批只删「(default: all)」句，「Requires agent.consultModels configured」不受影响）。
- 结论：同档提 `async` 的句子中，为假的只有上面两处；余者是推荐形（「async spawn with the design as the task book」）或调度面陈述（`files` ∥ `dependsOn`），与本批契约不冲突。

**审计与评审**：本轮无源码、无设计面改动，审计 0 轮 ∥ 代码评审 0 轮（同档真值核查由本笔逐条对代码核完，读数即上节）。**终态：`clean`。**

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **七档跑者全绿** | 逐档 `node --test`（单测档 + 六个调用点档） | **`tests 25 · pass 25 · fail 0`**（单测 9 ∥ 集成 16） |
| **契约面** | 逐档搜 schema 与拒文 | `doc-check` `required: ["target"]` ✓ ∥ `manifest` 两处 `["action","target"]` ✓ ∥ `timer` 无 `?? 180` ✓ ∥ `subagent` 无 depth 默认 ✓ ∥ `async is required` ✓ ∥ `verification is required` ✓ |
| **锚不越界** | `doc-check.mjs` 是否仍持锚行 | **在**——锚退出「`target` 的缺省」，仍作相对形基根（KD-9） |
| **旧默认句残留** | 六个模式扫 `thincoder-core/**`（`.mjs` ∥ `.md`） | **0 命中** |

**实施席自报且我复核的三处**

- **`family-tools.mjs`（越出设计清单）**——`async` 必填后工程子代理的 spawn-only 变体必须自己声明固定值，**不改则每条审计派单都被拒**。**判：必要，已在设计档 §4 补行。**
- **六档集成调用点**——只补 `target` ∥ `async:false`，**断言除 `29-2`（设计点名的假账）外一字未动**，补完无一档转红。**判：改契约就要改调用点，属本批。**
- **坏法实跑**——改回五处 ⇒ `pass 4 · fail 5`，红的恰是 `AC-1`~`AC-5`；改回即全绿。**判：验收有牙齿。**

**两处被本批改假的提示词句（已同轮修）**

`thincoder-core/prompts/discipline-normal.md` 第 278 行「without `async` returns `{id, running}`」→「need `async` stated explicitly … omitting it is refused」；第 267 行「(async default — …」→「(pass `async: true` — …」。**同档其余提 `async` 的句子逐条核过仍为真**（`escalate` 的省缺仍等于异步飞刀 ∥ depth>0 一律同步 ∥ `async:false` 语义未动）。

**带债收口（不静默）**

- **`docs/core/design/MANIFEST.md` 整档门 `REFUSED（锚 66 条）`**——**66 条全是存量裸名指针**，写入回执原文「触达账存量命中 66 条——不属本次改动区，不阻本次写」。**归 `#1731`（机械改名另批）**。**⇒ 本批的文档门只对实质改动的三档成立，不含该档。**
- **`AC-6` ① 的「保留句」**：`§2.5` 第 2 ∥ 12 条末尾的 depth>0 同步句**明确保留**（KD-12），**不列入「旧句清零」判域**——父侧裁定 A，写入本档。
- **`§2.5` 第 11 条（需求档 `F17`）**：盘上已成立（父侧在 `#2148` 收口时改齐），本批跳过——裁定 B。

**这批存在的理由**

用户 18:59 的原话：「**工具参数应该先清默认值**」。而盘点出来的最危险那一层不是数字默认，**是锚**——`doc-check` 缺 `target` 时拿会话锚当根，锚是工作区就没有项目，于是一路猜过去、每一层都"成功"。**改完之后，缺参数就是一句话：拒，并点名缺哪个。**

**收口**

- 台账 `#2150`：**在途 → 待核销 → 已核销**。
- `#2152`（`29-2` 与 `path-resolution.test.mjs` 的同句假断言）：**随本批核销**。
