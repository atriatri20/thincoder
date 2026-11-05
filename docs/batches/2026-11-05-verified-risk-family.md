# 2026-11-05 · verified-risk-family
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-05 · 来源 = 用户 2026-11-05 12:01「今晚这三条也处理掉吧」——指父侧 06:41 状态表「真危险」行的三条。
> 台账 = #2073（core · 归批）。前情 = docs/batches/2026-11-05-batch-tool-gap-family.md（已收口 2026-11-05）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 三条的复跑观察（父侧 · 2026-11-05 12:05）

**纪律**：台账记的是**当时的现象**，不是现在的状态。接笔第一动作 = 复跑那次观察。三条读数如下，**两条与台账记录不符**。

### `#2073` 浏览器 profile EBUSY —— **复现不出**

| 读法 | 读数 |
|---|---|
| `node --test test/integration/browser-start-window.test.mjs` × 3 次串行 | 每次 **3 pass / 0 fail** |
| 同档 **4 进程并发**（四份 `Start-Job`） | 四份**全 fail 0**；无 `EBUSY`、无 `not removed` |

⇒ 台账记的「红是同进程 spawn ∥ 删竞态」**在本机复现不出来**。按 `#2070` 的纪律，**库存前提未验证 = 不下处方**。

### `#2079` 「179 条死锚」—— **数量级错了**

复跑（`checkAnchors` 扫 `docs/batches` 全量）：

- 档数 **307**，有命中者 **202 档**，命中总数 **14 775 条**。
- 最重三档：`docs/batches/2026-10-15-doc-ref-direction-cleanup.records.md` **3048** ∥ `docs/batches/2026-10-19-prompt-mech-single-face.md` **570** ∥ `docs/batches/2026-10-16-ref-citation-r2-landing.md` **416**。
- 形状样例（批档里的相对引用，从 `docs/batches/` 下解析不到）：

```text
sandbox/SANDBOX.md   ⇒ 档缺（候选在 docs/server/design/sandbox/SANDBOX.md）
```

⇒ **台账的 179 是引擎族当轮的「新增命中」**（E2 修好后新判出来那批），**不是存量全量**。存量 = **14 775**。

**这不是「清一批死引文」的活**，是**判据射程的决策题**：批档是**可整本删的过程档**，要求它每个 `.md` 提及都能解析，代价与收益不成比例。**待裁**。

### `#2080` 描述面与代码相反 —— **坐实**

描述面现文（`thincoder-core/tool-docs/doc_check.md`）关于非提示词面的那句，逐字如下：

```text
RTM.md is exempt only in its bare form, so write it path-qualified (e.g. test/RTM.md)
```

⇒ 读作「非提示词面裸写该名也免判」。

引擎现文（`thincoder-core/doc-check/anchors.mjs`）：`const isOperandFace = isPromptFace`，随后 `const stripOperands = isOperandFace(f) // 只有提示面剥` ⇒ **剥除只在提示词面发生**，非提示面裸写该名**照判**。

**⇒ 描述面承诺的东西，引擎没做。** 且**本批自己撞过两次**：写 §6 与写本节时各把该名写成裸名，门当场判 `档缺` 拒写——**门是对的，说明描述面错了**。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
