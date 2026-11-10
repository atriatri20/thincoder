# 2026-11-11 · p3-1-doccheck-tier-wording
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 02:49「为啥挂帐不改？」——`doc_check` 的行数读数面仍印旧口径「越 500 软线（主动审视）」，须同轮改正，不作挂账。。
> 台账 = #2326（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = f3c69ca7d406450b7c184fcae82371d447f45942
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（印面五处（两条标记 ∥ 合计行 ∥ 两处头注）+ 26-5 加 700 档夹具；键名不动（D-3）；U-1/U-2 待裁）
**本批一句话**：`doc_check` 的 `lines` 读数面仍把「越 500 软线（主动审视）」这句旧口径印给读者；本批只改**印面**（两条标记 ∥ 合计行 ∥ 两处注释），判据、阈值、`lines` 参数语义一点不动。

**§2.1 本批条目（覆盖）**

| # | 条目 | 验收 |
|---|---|---|
| E1 | `sizeTierMark` 两条标记按新口径印：500 = 设计器硬线 ∥ 800 = 其他检查硬线；「软线」一词不再出现在印面 | 26-5 用例按新字面断言并绿 |
| E2 | `lineReadBlock` 合计行同口径换名（计数与顺序不变） | 26-5 合计行断言 |
| E3 | `DOC_CHECK_BUILTINS` 头注 ∥ `sizeTier` 头注不再写「软线 / 硬限 / 主动审视」 | 反证检索：`软线` ∥ `主动审视` 在 `thincoder-core/doc-check/index.mjs` 零命中（node 行扫描） |
| E4 | 500 那条标记有可失败断言（现状：三档夹具里无「越 500 未越 800」档 ⇒ 主要改动点没人判） | 26-5 夹具加一个 700 行 `.mjs` 档，红侧缺新字面、绿侧命中 |

**§2.2 设计档落点**：本批不写设计档（工具面小批，父侧指令）。机制单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」，已在盘、本批不改。

依据 `docs/core/design/DOC-GRAPH.md`「设计器硬线 = 500（只有设计轮用这一条）」

依据 `docs/core/design/DOC-GRAPH.md`「其他检查硬线 = 800（实施轮 ∥ 收口轮 ∥ 评审轮都只判这一条）」

**§2.3 改动点（逐处：现值逐字 → 改后逐字）**

1. `thincoder-core/doc-check/index.mjs` · `sizeTierMark` 的 hard 支
   - 现：`` `越 ${DOC_CHECK_BUILTINS.fileHardMax} 硬限（必须拆）` ``
   - 改：`` `越 ${DOC_CHECK_BUILTINS.fileHardMax}（其他检查硬线：必须拆）` ``
2. 同函数 · soft 支
   - 现：`` `越 ${DOC_CHECK_BUILTINS.fileSoftMax} 软线（主动审视）` ``
   - 改：`` `越 ${DOC_CHECK_BUILTINS.fileSoftMax}（设计器硬线：设计轮必给分拆方案）` ``
3. `DOC_CHECK_BUILTINS` 的两行头注
   - 现：`` `fileSoftMax` 越线 = 主动审视（报面标「软线」）∥ `fileHardMax` 越线 = 必须拆（标「硬限」）。``
   - 改：`500 = 设计器硬线（设计轮判改代码前的长度，>500 必给分拆方案）∥ 800 = 其他检查硬线（实施 ∥ 收口 ∥ 评审只判这条，>800 必须拆）——两条都是硬线，没有「软线」一档（口径单源 = docs/core/design/DOC-GRAPH.md §3）。`
4. `sizeTier` 头注
   - 现：`越硬限 ⇒ hard ∥ 越软线 ⇒ soft ∥ 未越线 ∥ 非源档 ⇒ null。`
   - 改：`越其他检查硬线 ⇒ hard ∥ 越设计器硬线 ⇒ soft ∥ 未越线 ∥ 非源档 ⇒ null（返回取值本批不改，见 D-3）`
5. `lineReadBlock` 合计行
   - 现：`` `合计 ${reads.length} 档（越硬限 ${hard} · 越软线 ${soft} · 未越线 ${rest}）` ``
   - 改：`` `合计 ${reads.length} 档（其他检查硬线 ${hard} · 设计器硬线 ${soft} · 未越线 ${rest}）` ``

**§2.4 消费者清单（全仓 grep，2026-11-11 本轮）**

- `fileSoftMax` / `fileHardMax`：代码 = `thincoder-core/doc-check/index.mjs`（定义 + `sizeTier` + `sizeTierMark`）；测试 = `test/integration/doc-check-line-counts.test.mjs`（26-5 断言内插 `fileHardMax`）；设计档 = `docs/core/design/DOC-DISCIPLINE.md`（常量表两行 ∥ 读数口径行 ∥ 报面形行）。
- 同一对键在 config ∥ manifest ∥ 工具 schema 面：**已查无**（无一处把这两个键当配置项读）⇒ 不是对外契约面。
- `软线` 在本读数面内 4 处：`thincoder-core/doc-check/index.mjs` 的头注 ∥ `sizeTier` 头注 ∥ soft 标记 ∥ 合计行 —— 四处全部落在 §2.3 的五处改动里（改后该档零命中）。
- `软线` 在本读数面外：测试档 3 处（26-5 的夹具注释与合计行断言，本批改）；`thincoder-core/tool-docs/doc_check.md` **已查无**；其余约 30 处全在代码档的**拆档缘由头注**（`bench/lib` 三档 ∥ `thincoder-core` 数档 ∥ `thincoder-server` 十余档，形如「拆档缘由 = 该件越 500 软线」）—— 不是本读数面的输出，本批一字不动，见 §2.8 U-6。
- `主动审视` 在代码面：本读数面 2 处（同一头注 ∥ soft 标记，本批改）；`thincoder-core/config.mjs` ∥ `thincoder-core/config-reload.mjs` 的档头注各 1 处讲当年拆档原因（不改）；`thincoder-core/prompts/advisor-design.md` 是提示词面旧口径（§2.8 U-3）。
- 标记文本的下游消费者：`test/rtm/guard.md` 的 26-5 行（期望列逐字引 800 标记）；`test/RTM.md` 不引字面。**无任何代码按标记串分支（已查无）** ⇒ 改字面不破解析。
- 工具描述档 `thincoder-core/tool-docs/doc_check.md`：`软线` ∥ `硬限` ∥ `行数` 均零命中 ⇒ **无需改**。

**§2.5 受影响文件与档层结论**

| 档 | 改动 | 档层结论 |
|---|---|---|
| `thincoder-core/doc-check/index.mjs` | 五处字面 / 注释（净增约 0 行） | **越 800 其他检查硬线（存量）**；本批不动结构，拆分归另批 |
| `test/integration/doc-check-line-counts.test.mjs` | 26-5 期望字面 + 夹具加一档 700 | 未越线 |
| `test/rtm/guard.md` | 26-5 行期望列 | 文档档，只出数、无档位义务 |

本轮读数（`doc_check(mode:"report", lines:[…])` 原样，含它此刻印的旧字面——这就是红侧实物）：

```text
行数读数（量法 = countContentLines · 档位标记只给源 / 单元测试档；.md 档只出数不标）
  108  test/integration/doc-check-line-counts.test.mjs
  157  test/rtm/guard.md
  1076  thincoder-core/doc-check/index.mjs  · 越 800 硬限（必须拆）
合计 3 档（越硬限 1 · 越软线 0 · 未越线 2）
```

存量越 800 由既有台账行承接（早前按 500 线登记的 `#2139`），按新口径重述归父侧（§2.8 U-5）。

**§2.6 验收对照（红绿两侧怎么读）**

红侧（改代码前，先把 26-5 的期望改成新字面）：`node --test test/integration/doc-check-line-counts.test.mjs` ⇒ 26-5 红。断言回显的实物形：

```text
硬限标记：  812  src/big.mjs  ·  越 800 硬限（必须拆）
合计三数：合计 3 档（越硬限 1 · 越软线 0 · 未越线 2）
```

两条都与改后期望不等（期望 = `越 800（其他检查硬线：必须拆）` ∥ `其他检查硬线 1 · 设计器硬线 0`）；700 档那一行红侧无标记，期望有。

绿侧（改代码后）：同一条命令 ⇒ 26-5 绿（含 700 档印 `越 500（设计器硬线：设计轮必给分拆方案）`），gate+lines 拒绝那一例仍绿；再跑 `doc_check(mode:"report", lines:[…])` 看印面 ⇒ 三条落点逐字新口径，合计行含「其他检查硬线 ∥ 设计器硬线」。

反证第二读（D15 中文串走 node 面）：在 `thincoder-core/doc-check/index.mjs` 内，`软线` 改前 4 处 ⇒ 改后 0 处，`主动审视` 改前 2 处 ⇒ 改后 0 处（同一检索两串各读一次，改前读数即 §2.4 那一组）。

**§2.7 关键决策**

- **D-1 两条标记直接用设计档的两个名字，不自造第三套词**：读者不必在「软 / 硬」与「设计器 / 其他检查」之间换算，产品输出与设计档同名（依据见 §2.2）。
- **D-2 500 的标记带上归属与动作**（设计轮必给分拆方案）：旧字面「主动审视」把判断点留在实施轮读者手上——正是新口径要去掉的那个纠结；新字面说清这条线归设计轮判，实施面只判 800。
- **D-3 常量键名 `fileSoftMax` / `fileHardMax` 与返回取值 `"soft"` 本批不改**。① 不是对外契约面：消费者只有本档 ∥ 一份测试断言 ∥ 设计档常量表，无 config ∥ manifest ∥ 工具 schema 键。② 改名须同轮改 `docs/core/design/DOC-DISCIPLINE.md`（常量表两行 ∥ 读数口径行 ∥ 报面形行），而本批按父侧边界不写设计档 ⇒ 改名会把设计档变成死指针。③ 改后产品代码已无「软线」二字，标识符里的 `Soft` 不印给任何读者。代价如实：标识符与新口径不同名，请父侧立一条后续行（本席无台账写面）。
- **D-4「硬限」一词随字面退役**：`越 800 硬限` ⇒ `越 800（其他检查硬线…）`。设计档与需求档统称「硬线」，留一个「硬限」就是第二个名字；连带 `test/rtm/guard.md` 26-5 期望列同改。
- **D-5 合计行只换名字、不动计数与顺序**：三个数之和 = 档数是既有断言（D3 一致性面），换名不动算术。

**§2.8 上抛项**

- **U-1 [上抛·待裁] 设计档 `docs/core/design/DOC-DISCIPLINE.md` 与本批改后产品输出相反**：§3.20 报面形句与示例块逐字写死旧字面（`越 <fileSoftMax> 软线（主动审视）`），常量表两行写「文件档软线——`lines` 读数面的软线标记」，§3.10 读数口径行与尺寸档位判据行仍写「软线 500 / >500 主动审视」。我的倾向 = **同轮由本席改这几句**（设计档属我笔域，父侧一句话即可派）；不派则须另批，此期间档码相反。
- **U-2 [上抛·待裁] 需求档 `docs/core/requirements/DOC-CHECK.md` F15 仍是旧口径**：原文「`>800` 必需拆 ∥ `>500` 主动审视」。需求档 = 主 agent 笔域，本席不写。
- **U-3 [上抛·知会] 提示词面旧口径**：`thincoder-core/prompts/advisor-design.md` 写「>500 lines → proactive split review, >800 lines → must split」——设计评审子代理读的正是这句。提示词 = 产品代码，本席不写，须另令。
- **U-4 [上抛·知会] 其余旧口径状态档**：`docs/core/design/DOC-CHECK.md`「软线 = 主动审视」两处；`docs/core/standards/METHODOLOGY.md` F3-1「>500 必拆」（第三种读法）。
- **U-6 [上抛·待裁] 代码档的「软线」旧词残留约 30 处**：全是拆档缘由头注（`bench/lib` 三档 ∥ `thincoder-core` 数档 ∥ `thincoder-server` 十余档），形如「拆档缘由 = 该件越 500 软线」。它们不印给任何读者、不影响判据，但按新口径同属旧词。我的倾向 = **本批不动**（父侧边界只到读数面），由父侧另开一批 sweep；若父侧要同轮清，本席可加，但会跨 `thincoder-server` ∥ `bench` 两片、超出本批声明面。
- **U-5 [上抛·知会] 存量档层与台账**：`thincoder-core/doc-check/index.mjs` 越 800 其他检查硬线（本批不动结构）；早前按 500 线登记的 `#2139` 按新口径重述归父侧。

**§2.9 边界（不做项）**

- 阈值 500 ∥ 800、「严格大于」判据、`lines` 参数语义、`gate` + `lines` 的拒绝、`hits` ∥ verdict ∥ `lineReads[].tier` 取值：**零改**。
- 工具描述档 `thincoder-core/tool-docs/doc_check.md`：已查无旧词，不改。
- 设计档 ∥ 需求档 ∥ 提示词面的旧口径：见 §2.8，本批不写。
- **§9 integration delta**：本批改的正是业务可观察的结果（读数面印出的字面），故 `test/rtm/guard.md` 的 26-5 一行**改写**（期望列新字面 + 加一档 700）、**零新增行**；用例文件 = `test/integration/doc-check-line-counts.test.mjs`。
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
