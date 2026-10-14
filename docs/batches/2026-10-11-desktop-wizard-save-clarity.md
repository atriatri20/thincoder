# 2026-10-11 · desktop-wizard-save-clarity
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 网友报障（原话：「在配置API的时候…找不着保存API的那个按钮在哪，翻到设置页面最下面点那个保存去了…一直存不上」+「把第一次配置API那个保存秘钥按钮设置的明显一点」）+ 用户 2026-10-11 13:24 裁「都做」（①保存钮显著化 ②主路径不丢数据 ③「保存并继续」合并 ④「完成」未配置不静默退场）+「自动跑完」（本批全链授权）。
> 台账 = #1277（desktop · 归批）。前情 = 无（独立批——同域最近批 = 2026-10-03-desktop-firstrun-provider-notice（台账 #840），其「完成径不阻断」口径本批按用户 2026-10-11 13:24 裁定改）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-11
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 2026-10-11 13:24 · 来源、范围与授权（主 agent）

- **来源**：网友报障（原话逐字 = 批头 `来源` 行）+ 父侧核因三处**实据**（逐条 file:line）：
  ① **唯一写盘钮 = 次级形**：`thincoder-desktop/renderer/settings.css:73-100`——`.settings-submit` 只 `border: 1px solid transparent`（透明底无描边）；**强调形（accent 描边）只给 `.wizard-next` ∥ `.wizard-finish`**（两个都不写盘的钮）。
  ② **步 1「下一步」只进步不写盘**：`thincoder-desktop/renderer/mount-onboarding.mjs:89-96`——`nextStep()` 步 1 ⇒ 只调 `enterModelStep()`，零 submit 调用、零提示（草稿域 `data-draft` 只保面上文本、不保盘上）。
  ③ **未配置也照退场**：同档 `:156-166`——`finishWizard()` 复读 `configured` 仍假 ⇒ `dismissWizard()`（向导退场，无报错）。
  ⇒ 现象链坐实 = 找不着保存钮 → 点「下一步 ∥ 完成」（都不保存）→ 界面照常前进/退场 → 「一直存不上」。
  用户 2026-10-11 13:24 裁：**四项全做**（见范围）+「自动跑完」（本批全链授权）。
  需求登记 = `docs/desktop/requirements/SETTINGS.md` D11 判据列补「**首启配置三保真**」（**不新开 D 号**）；台账 **#1277**；验收含真 Electron 使用面用例（D16 定规）。
- **范围（四项 · 逐项）**：
  ① **保存钮显著化**——唯一写盘钮显著可辨（不靠猜）。⚠️ 设计侧在册计数账须随动：`docs/desktop/design/UI.md:221`（控件族**次级 6**（含 `.settings-submit`）∥ **强调 2**（`.wizard-next`/`.wizard-finish`））——提级即改此账（禁静默改样式）。
  ② **主路径不丢数据**——步 1「下一步」不得静默丢已填 key（落盘再前进 ∥ 拦住 + 就地提示）。
  ③ **「保存并继续」合并钮**——消「两个钮谁管事」歧义。**②∥③ 的关系 = 设计轮必答**（并存 vs 合并成一条自洽形）——逐态说清：key 空 ∥ key 非法 ∥ 已存过 ∥ 未存但非空。
  ④ **「完成」未配置不静默退场**——须提示/拦住 + 二次确认。⚠️ **改既有口径**：`docs/desktop/design/SETTINGS.md:170` 现载「完成径 = 现行为零改（**不阻断完成**）」（2026-10-03 批定）——本批按用户今日裁定**改此条**；设计轮给新口径 + 依据；与既有「以后再说」出口（`docs/desktop/design/SETTINGS.md` §2.22 项 4 ⇒ `dismissWizard`）的关系须说清。
- **边界**：不动首启两路（团队 ∥ 本地）的路由与流程结构 ∥ 不动设置页其余段（七段值面语义不改）∥ 不动 `provider:verify` 探活口径（KD-11：探不通仍可保存）∥ 不动核 ∥ CLI ∥ VSC ∥ 零新 IPC 通道候选（若确需 ⇒ 单列理由 + 代价）。**已核**：本批面 = 向导尾控件 + 渠道表单提交钮 + 向导接线三处（`views/onboarding.mjs` ∥ `views/settings-controls.mjs` ∥ `mount-onboarding.mjs`）+ 样式档 `settings.css` + 词表；核 ∥ CLI ∥ VSC 零涉（本批零触面实读：`thincoder-core/**` ∥ `thincoder-cli/**` ∥ `thincoder-vscode/**` 不在改点表）。
- **合并扫描（点火前查账）**：本面无可并项——台账现存未决 = #1273（悬空 25 基线，core/desktop/render-core 域）∥ #1275（服务端设计档回填——已并入在飞的服务端小批 #206）；均非本件可并面（不同 face ∥ 不同批）。
- **授权（用户 13:24「自动跑完」·全链）**：设计评审点火 ∥ §4 代签 ∥ 修正轮派发 ∥ 实施轮派发 ∥ 收口核销 ∥ 提交双推 ∥ token 消费——父侧自动执行，不必逐次请点。
  **父侧自缚三条**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发）；② 新范围 ∥ 用户口径裁决 ⇒ 停、只摆那一条；③ 破坏性 ∥ 不可逆 ⇒ 先停。

### 2026-10-11 13:41 · 范围增补（用户「校验也修」——主 agent）

- **来源**：设计轮 #207 上抛（向导步 1「校验」钮零可见反馈——实读 `thincoder-desktop/renderer/views/onboarding.mjs:154` `verifyControl(null, handlers)` ∥ `wizardModel` 不含 `verify` ⇒ `settings.verify` 切片在向导树**零消费**）+ 用户 2026-10-11 13:41 裁「**校验也修**」。
- **增补内容**：向导步 1「校验」结果**就地可见**（复用核件既有 `data-verify-state` 三态 ∥ 短形词两键——沿轻通道轮六「校验反馈就地化」同族形；零第二实现）；台账 **#1278**（第二需求点——本批范围）；需求卷 D11 判据列补 **④ 校验看得见**（父侧已落）。
- **范围影响**：本批 = ①–④ 保存面 + ⑤ 校验面（**同一向导步 1 面 ∥ 同一核件 `settings-controls.mjs` ∥ 同一词表**）——设计轮 #207 的 §2.23 项 7①（原载「本批零改、登记待裁」）随正为「已裁入本批」；不另开小轮。
- **评审处置**：前一轮评审 **#209 已撤**（评审对象将变 ⇒ 撤后合一重评——token 未签发，零沉没成本）。
- 父侧自缚三条不变。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（首启向导保存 ∥ 校验面收正批 · 修正轮（评审 #213 · 发现 1–8 逐号）已落（2026-10-11）——设计面收正，待复审）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

### 批次任务 · 设计轮（覆盖条目 ∥ 范围 ∥ 设计档落点）

**需求锚**：需求卷 `docs/desktop/requirements/SETTINGS.md` **D11** 判据补「首启配置三保真」（① 点得着 ∥ ② 存得下 ∥ ③ 不退空——父侧已落 `:15`；变更行 `:27`）；台账 **#1277**（desktop · 归批）；来源 = 网友报障 + 用户 2026-10-11 13:24 裁「都做」（逐字 = 批档 §1）。

**四项 ↔ 判据映射**：① 保存钮显著化 ⇒ 点得着；② 步 1 不丢已填 key ⇒ 存得下；③「保存并继续」合并钮 ⇒ ② 的机制（见「裁定」）；④「完成」未配置不静默退场 ⇒ 不退空。

**不在本批（显式）**：首启两路（团队 ∥ 本地）路由与流程结构 ∥ 设置页其余段（七段值面语义）∥ `provider:verify` 探活口径（KD-11 零动）∥ 核 ∥ CLI ∥ VSC ∥ IPC 通道与载荷（零新通道）∥ `.settings-submit` 次级族本体（弹窗 ∥ 行内 ∥ 路由屏各径）∥ 模型步 ∥ 目录步语义。

### ②∥③ 裁定（单列最前）

**合并成一条**（并存被否）：步 1 前向唯一径 = 表单内「保存并继续」（`wizard.saveAndNext`——写盘 + 前进同钮）；② 的保证「已填不丢」由 ③ 的机制构造成立；步 1 尾控件「下一步」退场（两钮并存 = 「谁管事」歧义本体；步 2「下一步」零改）。
**逐态**：key 空 ⇒ 零写前进（无数据可丢——「零输入可走」性质保持；未配置结局由 ④ 兜底）∥ key 非法（校验未过）⇒ 照存 + 前进（KD-11 零动）∥ 已存过 ⇒ 同路重发（核保存语义零动；会话内此态不可达——向导无回退径）∥ 未存但非空 ⇒ **先存后进**（写败 ⇒ 原地留步 + 失败串，零静默、零乐观前进）。
**不做的代价**（择要）：并存形下用户仍可点「下一步」预期它保存（歧义不消）；或「下一步」自动存 = 隐式写盘（不可预期）。

### ④ 口径（旧句替换）

`finishWizard` 复读 `configured`：已配 ⇒ 照退（零改）∥ 未配 ⇒ **不退场** + 就地护栏（旗 `settings.wizard.finishBlocked`——`patchSettings` 直写，`store.mjs` 零改；提示句 + 两钮：「去保存渠道」= 步 1 + 清旗（锚 `wizard:guardBack`）∥ 「仍要退出」= 复用既有 `dismissWizard`（锚 `settings:close`——单一实现））；退路 = ✕ 恒在场 ∥ 零 Esc ∥ 零背板（沿现行为）。旧口径句（SETTINGS.md §2.14「不阻断完成」）退场——设计档已按新口径替换（grep 旧句零命中）。

### 设计档落点（file:line）

- `docs/desktop/design/SETTINGS.md`：§1 增 **KD-79**（`:34`，含被否候选六项）∥ §2.6 首启向导行收正（`:104`）∥ §2.14 向导收尾句改写（`:171`）∥ 新增 **§2.23**（`:334` 起——七项）∥ §3.1 五行现值（`:390` / `:396` / `:399` / `:408` / `:409`）∥ §3.2 本批块（`:554` 起——九行）∥ §5 +**T-DSK67**（`:632`）∥ 变更记录（`:651`）。
- `docs/desktop/design/UI.md`：§1「本批注（外壳视觉降噪 · D24）」项 5 控件族计数随动（`:221-222`——**8 ⇒ 9** = 次级 6 + 强调 3）∥ §4.1 `i18n.mjs` 行现值（`:520`）∥ 变更记录（`:618`）。
- `docs/desktop/design/PROJECT.md`：§2 KD 索引 +KD-79 行（`:133`）∥ 变更记录（`:1818`）。

### 机制设计（摘要——全文 = 设计档 KD-79 ∥ §2.23；通道 ∥ 载荷 ∥ 核语义零新）

- ① **保存钮提级** = 新单类 `.wizard-save`（强调形：`border-color` ∥ `color` = `var(--accent)`；`channelFormTree` +`submitClass` 参——缺省 `settings-submit` ⇒ 弹窗径零变；`settings.css` 四组各 +1 选择器；**控件族计数 8 ⇒ 9**）。
- ②③ **合并钮**：接线 = `mount-onboarding.mjs` `submitAndContinue`（自读表单 `key`：空 ⇒ 零写直进 ∥ 非空 ⇒ `submitChannel` 返回 `true` 才进）；`submitChannel` 成功径 `return true`（`mount-settings-exits.mjs`；弹窗径 `void` 消费零变）；`nextStep()` 步 1 支删（不可达——防双径漂移）。
- ④ **完成护栏**（上述）；旗随任意步写收束（`setStep` 单点清）。
- **词表**：删 `wizard.save`（消费归零 ⇒ 键面随退）；+4 键 × 两语 = `wizard.saveAndNext`（保存并继续 / Save & continue）∥ `wizard.finishGuard` ∥ `wizard.finishGuardGo` ∥ `wizard.finishGuardExit`；键数链 **346 ⇒ 349**（届盘实读——实施轮续链）。

### 受影响文件与测试面（现行 ⇒ 预期；实读 2026-10-11）

| # | 文件 | 现行 ⇒ 预期 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/views/onboarding.mjs` | **264 ⇒ ≈295**（护栏节点 ∥ 旗投影 ∥ `channelBody` 两参 ∥ `footNode` 步判 ∥ 档头注） |
| 2 | `thincoder-desktop/renderer/mount-onboarding.mjs` | **188 ⇒ ≈220**（+`submitAndContinue` ∥ 护栏支 ∥ `clearFinishGuard` ∥ 旗清；−`nextStep` 步 1 支） |
| 3 | `thincoder-desktop/renderer/views/settings-controls.mjs` | **188 ⇒ ≈191**（+`submitClass` 参——缺省零变） |
| 4 | `thincoder-desktop/renderer/mount-settings-exits.mjs` | **310 ⇒ ≈312**（`submitChannel` 成功径 `return true`） |
| 5 | `thincoder-desktop/renderer/settings.css` | **348 ⇒ ≈357**（+`.wizard-save` 四组 + 护栏族 + 注释；越 300 在册续期 ∥ ≤500 ✓） |
| 6 | `thincoder-desktop/renderer/i18n.mjs` | **441 ⇒ ≈450**（−1 键 + 4 键 × 两语 + 链注） |
| 7 | 零改面 | `store.mjs` **374** ∥ `views/settings.mjs` **454** ∥ `mount-settings.mjs` **306** ∥ `i18n-settings.mjs` **206** ∥ `src/**` ∥ 核 ∥ CLI ∥ VSC |
| 8 | 测试面 | 批内件 `docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`（拟——五腿：构树 ∥ 逐态接线 ∥ 护栏 ∥ 弹窗负控 ∥ 词表）；真机 = **T-DSK67** |

### 验收（点回 D11 三判据）

- ① 点得着 ⇒ 步 1 写盘钮 = 强调形 + 词「保存并继续」（构树腿机检；T-DSK67 ①）。
- ② 存得下 ⇒ 已填非空点前向钮 ⇒ 写盘发生（`config.json` 在场）之后才前进（接线腿；T-DSK67 ②）；写败 ⇒ 原地留步 + 失败串（错误腿）。
- ③ 不退空 ⇒ 未配点「完成」⇒ 不退场 + 护栏在场（T-DSK67 ④）；「去保存渠道」⇒ 回步 1（⑤）；「仍要退出」⇒ 退场（⑥）；已配置负控 ⇒ 照退（⑦）。
- **门禁（设计轮实读）**：`node scripts/doc-check.mjs`（workdir `thincoder/`）= 悬空 **25**（= 既有基线 · 零新增）∥ 行宽 **OK（0 行 >300 字符）**；`git status` = 产品码零触（`renderer/**` ∥ `src/**` 零改）。

### 上抛 ∥ 登记（如实）

1. **向导步 1「校验」钮读数无渲出面**（`settings.verify` 切片在向导树零消费——实读 `views/onboarding.mjs:154` `verifyControl(null, handlers)` ∥ `wizardModel` 不含 `verify`）：与四项无涉 ⇒ 本批零改；建议归一笔（修 ∥ 挂账）——上抛，待裁。
2. **设计档存量滞后行未动**（#1242 在册）：本批 §3.2 块携实读值供回填轮取用（`SETTINGS.md` §3.1 ∥ `UI.md` §4.1 中本批触碰的五行已按实读收正）。
3. **用例号 T-DSK67 自铸披露**（若并行批占号 ⇒ 父侧并号裁定）。

### 批次任务 · 范围增补轮（⑤ 校验面 · eng-designer · 2026-10-11）

**需求锚**：需求卷 `docs/desktop/requirements/SETTINGS.md` **D11** 判据列 **④ 校验看得见**（`:15`；变更行 `:28`——父侧 13:41 已落）；台账 **#1278**（desktop · 本批范围增补）；来源 = 设计轮 #207 上抛 + 用户 2026-10-11 13:41 裁「校验也修」（逐字 = 批档 §1 增补节）。

**覆盖条目（本轮）**：⑤ **校验看得见**——向导步 1「校验」结果就地可见（本批唯一增量条目）。①–④ 保存面 = 设计轮 #207 已交付，本轮**零回改**——仅 §2.23 项 4/5/6 随补 ∥ 项 7① 收正（「登记待裁」⇒「已裁入本批」）。

**不在本批（显式 · 增量面）**：设置面既有校验反馈本体（渠道段本行态 + 明细行——零动）∥ 探活口径（KD-11 零动）∥ `verifyControl` 结构（三参形既有——零改）∥ 通道 ∥ 载荷 ∥ 词键（零新键——链 349 不变）∥ CSS 族 ∥ 状态切片（零第二份状态）∥ 向导其余步 ∥ 核 ∥ CLI ∥ VSC。

**⑤ 机制设计（摘要——全文 = 设计档 §2.23 项 8）**：

- **接线**：向导树消费既有 `settings.verify` 切片——`wizardModel` +`verify` 投影（同源 = `thincoder-desktop/renderer/views/settings.mjs:172`）；`channelBody` 以该投影归一态值（`"ok"` ∥ `"fail"`；kind 表外 ⇒ `null`——零假造）；实参形 = `verifyControl(null, handlers, verifyState)`（第三参 = 轮六态参——`thincoder-desktop/renderer/views/settings-controls.mjs:170`；**核件零改**）。
- **三态逐值（与设置面渠道段同源——单源 = 设计档 §2.12 项 1）**：① 未校验 = `null`（钮词「校验」；含「校验中」窗——点后旧读数先清、新读数未落（实读 `mount-settings-exits.mjs:133`）；**不立独立「校验中」面**）∥ ② 已成 = `"ok"`（短形「校验通过」+ 锚 `data-verify-state="ok"` + 明细行「校验通过 · N 个模型」）∥ ③ 已败 = `"fail"`（短形「校验失败」+ 锚 + 明细行「校验失败：原因」——原因经 `reasonWord`）。
- **同源复用（非复制）**：明细行 = 渠道段 `verifyNode` 形（`thincoder-desktop/renderer/views/settings-sections-providers.mjs:37`——出**导出面**供向导取用，零行为改；锚 `[data-verify]` + `.settings-verify` 既有样式 `thincoder-desktop/renderer/settings.css:198-201`）；**零行名匹配**（向导单钮面——语义 = 「上次校验读数」，沿 §2.12 留存口径；换渠不自动清——起手点校验即清）。
- **与「保存并继续」共存序（裁定）**：两条径**零互锁**（KD-11 延伸）——校验只出读数、不拦写；保存成 ⇒ 既有成功径同拍清读数（`mount-settings-exits.mjs:120` 零改）；在飞校验晚回 ⇒ 读数照落切片（零新增清理）。
- **接线零改面（实读）**：`mount-onboarding.mjs`（`:44 ∥ :172`）∥ `mount-settings-exits.mjs`（`:125-141`）∥ `store.mjs`（`:122`）∥ 重绘随既有订阅（`mount-settings.mjs:52 ∥ :264-269`）——全部零改。

**设计档落点（本轮 · file:line）**：

- `docs/desktop/design/SETTINGS.md`：§2.23 标题 ∥ 引文（`:334` / `:336-337`——判据列 ①–④）+ **新增项 8**（`:375-385`）∥ 项 4 补零新键（`:365`）∥ 项 5 腿数 五 ⇒ 六（`:368`）∥ 项 6 边界随补（`:369`）∥ 项 7① 收正（`:372`）∥ §2.6 向导行补「结果就地可见」（`:104`）∥ §3.1 三行（`:405` / `:409` / `:411`）∥ §3.2 本批块（`:569` 起——**九 ⇒ 十行**；行 7 = `settings-sections-providers.mjs` 新行）∥ §4 本批验收块（`:624-626`）∥ §5 **T-DSK67** 增 ⑧⑨（`:652`）∥ 变更记录（`:671`）。
- `docs/desktop/design/UI.md` ∥ `docs/desktop/design/PROJECT.md`：**零触**（无新 KD ∥ 无控件族计数变化——校验面零新 CSS ∥ 零新键）。

**受影响文件与测试面（本轮增量；实读 2026-10-11）**：

| # | 文件 | 现行 ⇒ 预期 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/views/onboarding.mjs` | **264 ⇒ ≈302**（#207 四项 ≈295 + 本轮：`wizardModel` +`verify` 投影 ∥ `channelBody` 态归一 + 明细行（`verifyNode` 同源复用）∥ import ∥ 档头注） |
| 2 | `thincoder-desktop/renderer/views/settings-sections-providers.mjs` | **210 ⇒ ≈212**（`verifyNode` 出导出面——向导步 1 同源复用，零行为改 ∥ 档头注） |
| 3 | `thincoder-desktop/renderer/views/settings-controls.mjs` | **188 ⇒ ≈191**（`submitClass` 参 = #207；本轮 `verifyControl` 参注半句随正——零行数） |
| 4 | 零改面（本轮） | `mount-onboarding.mjs` ∥ `mount-settings-exits.mjs` ∥ `store.mjs` ∥ `mount-settings.mjs` ∥ `i18n-settings.mjs` ∥ `i18n.mjs`（链 349 不变）∥ `settings.css` ∥ `src/**` ∥ 核 ∥ CLI ∥ VSC |
| 5 | 测试面 | 批内件 `docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`（拟——**六腿**：+校验消费（树面四径 ∥ 投影对拍 ∥ 共序负控））；真机 = **T-DSK67 ⑧⑨**（§5） |

**验收（点回 D11 ④）**：④ 校验看得见 ⇒ 点「校验」⇒ 钮态短形 + 锚 + 明细行就地可见（树面四径机检；T-DSK67 ⑧）；探不通 ⇒ fail 读数（原因句在）+ **保存零阻**（错误径；T-DSK67 ⑨）。
**门禁（范围增补轮实读）**：`node scripts/doc-check.mjs`（workdir `thincoder/`）= 悬空 **26**（= 基线 25 + 仅 **1** 条——`docs/desktop/requirements/SETTINGS.md:28` 短形 `views/onboarding.mjs:154`，父侧 13:41 笔面；**本笔零残留**：本笔新增 4 条已全修）∥ 行宽 **OK（0 行 >300 字符）**；`git status` = 产品码零触（`thincoder-desktop/**` 零改——实读）。

**上抛 ∥ 登记（本轮 · 如实）**：

1. **[上抛·待裁] 需求档 `:28` 悬空 1 条**（短形 `views/onboarding.mjs:154` ⇒ 悬空）：一字修 = 补前缀 `thincoder-desktop/renderer/`；需求卷笔面 = 主 agent（本笔不写）。
2. **`verifyNode` 出导出面披露**（`settings-sections-providers.mjs` 私有 ⇒ 导出）：跨档复用面最小化、零行为改；备选 = 向导侧自建明细行（复制——与「单一 owner」口径相悖，不推荐）。
3. **三项口径披露**：不立独立「校验中」面（在飞窗 = `null` 值）∥ 零行名匹配（单钮面）∥ 换渠不自动清（起手清）；另：`presets` 空（无渠可选）径 = 既有表单门（占槽期落 `wizard.notice`）+ 零切片写——既有面，非本增量引入。
4. **用例号 T-DSK67 ⑧⑨ 自铸披露**（若并行批占号 ⇒ 父侧并号裁定）。

### 批次任务 · 修正轮（评审 #213 · 发现 1–8 逐号 · 父侧裁 = 全采纳）· eng-designer · 2026-10-11

**来源** = 父侧派单（承本档 §3 轮次 1 · 八项发现逐号）· 台账 #1277 ∥ #1278。**写域** = 3 设计档（`docs/desktop/design/{SETTINGS,UI,PROJECT}.md`，各含一行变更记录）+ 本块；**产品码零触**。

**号 1（D24 计数相抵 · 🟡）→ `docs/desktop/design/UI.md:806`**——现读重数：`thincoder-desktop/renderer/settings.css:75-89` 基形带 = **8 选择器**（`.settings-lang` ∥ `.settings-close` ∥ `.settings-submit` ∥ `.wizard-dismiss` ∥ `.wizard-submit` ∥ `.wizard-next` ∥ `.wizard-finish` ∥ `.settings-theme-opt`）∥ `:96-100` 强调带 = **2**（`.wizard-next` ∥ `.wizard-finish`）⇒ **「次级 6」成立**（8 = 6 + 2；本批 +`.wizard-save` ⇒ 9 = 6 + 3——现值行 `:221` ∥ 变更行 `:620` 零改）；旧记录行（主题批 2026-09-30）收 **as-of 口径**（控件族 8 ⇒ 9 ∕ 次级 6 ⇒ 7 ∕ 强调 2 + 续链 **9 ⇒ 8**〔扁平化随动收口批〕+ 本批再 8 ⇒ 9；现值指针 = 本段 2026-10-11 行）——改前基数自此在档面可判。

**号 2（文件账滞后 · 🟡）→ `SETTINGS.md:405` ∥ `:415` ∥ `UI.md:524`**——实读三值（2026-10-11）：`views/settings.mjs` = **454** ∥ `mount-settings.mjs` = **306** ∥ `i18n-settings.mjs` = **206**；三行现值收正 + 设计估/前读链下移（每档单一现值）；差源 = 登录面补全批实施落盘未回填（**#1242 在册——归属不动**）。

**号 3（测试面行数标注 · 🟡）→ `SETTINGS.md:584`**——批内件行补 **0 ⇒ ≈300** 行 ∥ ≤500 ✓（六腿——无拆分预案需求）。

**号 4（规范面残句 · 🟡）→ `SETTINGS.md:170-172`**——作废件行（首跑补全退场件）删（沿革归记录面）；活句去沿革从句（「2026-10-11 …按用户裁定改——」）只留现行口径 + 单源指针。

**号 5（参名不定 · 🔵）→ `SETTINGS.md:341`（§2.23 项 1）∥ §3.1 `settings-controls.mjs` 行**——钮两参定形：词键 = 既有注入位 `form.submitKey`（实读 `thincoder-desktop/renderer/views/settings-controls.mjs:154`——缺省 `settings.save`；向导步 1 传 `wizard.saveAndNext`）∥ 钮类 = `submitClass`（缺省 `settings-submit`——弹窗径零变）。

**号 6（向导径节点 ∥ 单源 · 🔵）→ `SETTINGS.md:381-383`（项 8）∥ `:142`（§2.12 项 1）**——向导径点名 **直取 `verifyNode`**（`fallbackVerifyNode` 不用——`section.rows` 匹配语义不适用）；§2.12 项 1 补向导径消费面（单源扩）；**切预设后旧读数 = 保留** 显式口径 + 逐态四支（① 切预设照留 ∥ ② 起手点校验先清后落 ∥ ③ 保存成同拍清 ∥ ④ 保留态不拦写）。

**号 7（索引可达 · 🔵）→ `PROJECT.md:133` ∥ `:1818`-`:1819`**——KD-79 索引行 ∥ 变更行补 **⑤ 校验看得见 ∥ #1278** 指针（D11 ④ 从索引面可达）。

**号 8（300 线登记 · 🔵）→ `SETTINGS.md:414` ∥ `:576`**——`views/onboarding.mjs` 两行补「**越 300 咨询线在册**（新入册——拆分评估窗口 = 下次结构性触碰）∥ ≤500 ✓」（同表 `settings.css` ∥ `i18n.mjs` 行同式）。

**三档变更记录各补一行**（`SETTINGS.md:674` ∥ `UI.md:619` ∥ `PROJECT.md:1819`）。

**门禁（本笔实读）**：`node scripts/doc-check.mjs`（workdir `thincoder/`）= 悬空 **25**（= 父侧基线；非本笔新增）∥ **行宽 OK**（首跑 2 行超宽〔`:141` ∥ 原 `:380`——本笔新加所致〕⇒ 分段收正后复跑归 ✓）∥ exit 1（仅因 25 条基线悬空，阈值 0）；行数面报告态 6 条（回填清单——非本笔）。`git status` = 本笔写域 3 档；`thincoder-desktop/renderer` ∥ `thincoder-desktop/src` **零改** ✓（他面在途改动 = 并行批 ∥ 需求档笔，非本笔）。

**披露 ∥ 未收处（逐条给因）**：
1. `UI.md:791`（扁平化随动收口批 · 修复轮变更行）仍记「控件族 8 ⇒ 7」——与该批 §3 轮次 1 发现 3 的收正指令（「7⇒6 ∥ 9⇒8」）及现值链（9 ⇒ 8）不符；**未列项 ⇒ 本笔未动**（现值链已由号 1 收为可判）——留父侧裁。
2. `mount-settings-exits.mjs`（**310 ⇒ ≈312**，已越 300）之两行（§3.1 ∥ §3.2）无越 300 登记句——与号 8 同族现象但**未入发现表 ⇒ 本笔未动**——留父侧裁。
3. 300 线制度背景：500/800 口径更换批（2026-10-08）载「咨询线 300 ⇒ 500」；桌面域行仍沿「越 300 咨询线在册」自携注记（同表 `settings.css` ∥ `i18n.mjs` 行；`PROJECT.md` §4.1 册面现为 500 层制）——号 8 按同族式落；如父侧判该口径应统一改记 ⇒ 另轮。
4. 行数面报告（`settings-sections.mjs` 表 100 ⇒ 实读 101 ∥ `mount-settings-team.mjs`〔盘无档〕等）= 回填清单在册——非本笔（归 #1242/回填轮）。

**测试面（本笔）**：批内件未建（文档轮——零产品码）；真机 = T-SDK67 面（`SETTINGS.md` §5）不变。**仓套件未跑**（文档轮遵约——父侧收口为唯一 repo 套件运行面）。

**笔误收正（同轮自检）**：上段「测试面」句「真机 = T-SDK67 面」⇒ 正确用例号 = **T-DSK67**（本档全幅他处皆 `T-DSK67`；`:168` 单字笔误，全幅无第二处）。

### 批次任务 · 实施后回填轮（读数收正）· eng-designer · 2026-10-11

**来源** = 父侧派单（承本档 §5 实施记录——批内件 6/6 ∥ 两回归 9/9 + 6/6 ∥ 行数八件父侧逐值实核通过）· 台账 #1277 ∥ #1278。**写域** = `docs/desktop/design/SETTINGS.md`（§3.1 六行 ∥ §3.2 本批块）+ `docs/desktop/design/UI.md`（§4.1 `i18n.mjs` 行 + 变更记录）+ 本块；**产品码零触 ∥ 零新语义**（只收读数）。

**读数收正（口径 `content.split("\n").length − 1`；逐件实读 2026-10-11——本笔自读盘面）**：

| # | 件 | 估 ⇒ 实读 | 落点（设计档 file:line） |
|---|---|---|---|
| 1 | `thincoder-desktop/renderer/views/onboarding.mjs` | ≈302 ⇒ **302** | SETTINGS.md §3.1:414 ∥ §3.2 行 1 |
| 2 | `thincoder-desktop/renderer/mount-onboarding.mjs` | ≈220 ⇒ **235**（实增 +15） | SETTINGS.md §3.1:426 ∥ §3.2 行 2 |
| 3 | `thincoder-desktop/renderer/views/settings-controls.mjs` | ≈191 ⇒ **193**（实增 +2） | SETTINGS.md §3.1:408 ∥ §3.2 行 3 |
| 4 | `thincoder-desktop/renderer/mount-settings-exits.mjs` | ≈312 ⇒ **312** | SETTINGS.md §3.1:417 ∥ §3.2 行 4 |
| 5 | `thincoder-desktop/renderer/settings.css` | ≈357 ⇒ **357** | SETTINGS.md §3.1:427 ∥ §3.2 行 5 |
| 6 | `thincoder-desktop/renderer/i18n.mjs` | ≈450 ⇒ **450** | UI.md §4.1:521 ∥ SETTINGS.md §3.2 行 6 |
| 7 | `thincoder-desktop/renderer/views/settings-sections-providers.mjs` | ≈212 ⇒ **212** | SETTINGS.md §3.1:412 ∥ §3.2 行 7 |
| 8 | 批内件 `docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs` | ≈300 ⇒ **357**（实增 +57；六腿；≤500 ✓） | SETTINGS.md §3.2 行 9 |

- **形态** = 「设计估 ⇒ 实读」逐行收正（`**N ⇒ M**（实读 2026-10-11——…实施落盘（…；设计估 ≈X——吻合 ∥ 实增 +d））`——前读 ∥ 估链保留；§3.2 块头 ∥ 列头「现行 ⇒ 预期」⇒「现行 ⇒ 实读（实施落盘）」）。
- **三处实增**（`mount-onboarding.mjs` +15 ∥ `settings-controls.mjs` +2 ∥ 批内件 +57）——均 ≤500 ✓、零拆分需求；余五件估数吻合（数值零动，仅形态收正）。
- **「≈」占位零残留（本批行）**：≈ 仅存沿革注记「设计估 ≈X」形——沿本档既有转正形（先例 = `docs/desktop/design/SETTINGS.md:419`「原估 ≈195」）。
- **变更记录**：`docs/desktop/design/SETTINGS.md` ∥ `docs/desktop/design/UI.md` 各补一行（实施后回填 · 读数收正——「零新语义」）。

**门禁（本笔实读）**：`node scripts/doc-check.mjs`（workdir `thincoder/`）= 悬空 **25**（= 父侧基线；零新增）∥ 行宽 **OK**；`git status --porcelain` = 本笔写域 `docs/desktop/design/SETTINGS.md` ∥ `docs/desktop/design/UI.md` + 本档；`thincoder-desktop/**` **零命中** ✓。

**测试面（本笔）**：文档轮——零产品码；批内件复跑零需（父侧已 6/6）；**仓套件未跑**（父侧收口为唯一 repo 套件运行面）。

**披露 ∥ 未收处（逐条给因）**：

1. 本批件「（拟——」三处未动（`docs/desktop/design/SETTINGS.md` §2.23 项 5 ∥ §4 机检面 ∥ §5 T-DSK67 机检面——批内件六腿句）——非读数面 ⇒ 本笔零改；建议收口轮随批件激活一并清（零语义）。
2. 行数面报告态：差异 **6** 条（沿基线）；本批 §3.1 六行 + `docs/desktop/design/UI.md` §4.1 行为「行式异常：配对失败（档 1 ∕ 数 2）」态（`N ⇒ M` 双数格——配对机检对双数格不配对；沿既有形态，本笔零新增）。
3. 全宽括号配平存量：本批六行链式长行计数差额（+3 ∥ +2 ∥ +1 ∥ +3 ∥ +1 ∥ +4）经**反向替换复原法核 = 本笔 editDelta 0**（未增未减）——为沿革链积存现象，同族他行同型（§3.1 `:397`/`:398`/`:405`/`:406`/`:416` 等）——非本笔、未动。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：desktop-wizard-save-clarity 批设计全幅（① 保存钮提级 ∥ ②③ 合并「保存并继续」∥ ④ 完成护栏 ∥ ⑤ 校验看得见）——SETTINGS.md §1 KD-79 ∥ §2.6/§2.14 收正 ∥ §2.23（八项）∥ §3.1/§3.2 ∥ §5 T-DSK67（含 ⑧⑨）；UI.md D24 注项 5 计数 ∥ §4.1 i18n 行；PROJECT.md §2 KD 索引；需求面 = requirements/SETTINGS.md D11 三保真 + ④ 校验看得见。
**审查限制**：无「项目标准」档 ∥ 无文档地图（方法学按 AGENTS.md + 档内既有纪律判）；未读产品码（按评审范围）——坐标 ∥ 行数只做跨档一致性核对。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 文档一致性（D24 计数） | 🟡 | 项 5 现值为「控件族 **9**：**次级 6**」「**强调 3 保留**（`.wizard-next` / `.wizard-finish` / **`.wizard-save`**」（`docs/desktop/design/UI.md:221`）+ 本批变更行「项 5 控件族计数随动（**8 ⇒ 9**」（`UI.md:619`）；同一注旧变更行记「控件族 8 ⇒ 9 ∕ 次级 6 ⇒ 7」（`UI.md:805`）——两行各自声称同一次 8 ⇒ 9，且「次级 6」与「次级 7」不能同真 ⇒ D11 ① 判据「控件族计数随动」的改前基数在档面不可判 | 以 `thincoder-desktop/renderer/settings.css` `:75-89` ∥ `:96-100` 两带现读重新点数族成员，把相抵的一处（现值行或旧记录行）改齐为同一组「次级 N + 强调 M = 族计数」 |
| 2 | 文件账（值行单源） | 🟡 | 同档两处「现行」值相抵：§3.1 值行（值行单源 = `docs/desktop/design/PROJECT.md:224`）记 `views/settings.mjs`「**448**（实读 2026-10-10——B1 批」（`docs/desktop/design/SETTINGS.md:402`）∥ `mount-settings.mjs`「**292**（实读 2026-10-10——B1 批」（`SETTINGS.md:412`），本批 §3.2 零改面行记「（**454**——`channelFormTree` re-export 面零改）」∥「（**306**）」（`SETTINGS.md:580`）；`i18n-settings.mjs` 同型（`UI.md:524` 仍为「**190 ⇒ ≈206**（登录面补全批设计估」，本批记 **206**）——差值 = 登录面补全批实施落盘未回填（§2.23 项 7 ② 登记 #1242 在册），受影响文件表「现行」列因此非单源 | 把 §3.1 该三行 ∥ 登录面补全批块 ∥ `UI.md` §4.1 对应行一并读齐，或逐处标注 as-of——使受影响文件表「现行」列每档只有一个现值 |
| 3 | 受影响文件标注（判据 8） | 🟡 | 本批测试面行「批内件 `docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`（拟——**六腿**」（`SETTINGS.md:581`）无现行 ∥ 预期行数标注（同族先例 = 「无 ⇒ 182」（`SETTINGS.md:461`）∥「≤500 ✓」（`SETTINGS.md:290`））⇒ 该新档的 500 层拆分判据不可核 | 补 `0 ⇒ ≈N` 并注明与 500 线的关系（预计越 500 ⇒ 随附拆分预案） |
| 4 | 文档卫生（规范面残句） | 🟡 | 本批改写的 §2.14 活面仍留修订痕两处：作废件「**首跑补全（`provider:save` 补写）——已随 2026-10-09 清除批退场**」（`SETTINGS.md:170`）∥ 活句内沿革从句「2026-10-11 首启保存面收正批按用户裁定改——单源 = 本档 §2.23」（`SETTINGS.md:171`）——2026-09-18 文档卫生裁定要求规范面只留现行句（沿革归记录面） | 删作废件行（其沿革归 §变更记录 ∥ 批档），活句只留现行口径 + 单源指针 |
| 5 | 清晰度（参名） | 🔵 | 共用表单树参名两处不一：KD-79 ② 记「`submitKey: "wizard.saveAndNext"`」（`SETTINGS.md:34`）∥ §3.2 行 1 记 `channelBody` 两参（`submitKey` ∥ `submitClass`），而 §2.23 项 1 ∥ §3.1 只点名「+`submitClass` 参（缺省 `settings-submit`——弹窗径零变）」（`SETTINGS.md:405`）——钮词键的传参位未定形 | 在 `channelFormTree` 签名处把 `submitKey` ∥ `submitClass` 两参一并写明（或点明词键由何处注入） |
| 6 | 清晰度 ∥ 单源 | 🔵 | 项 8 明细行取渠道段「结果明细行 = 既有 `verifyNode` 形落于本行」之件并「**零行名匹配**（向导单钮面——读切片即渲；」（`SETTINGS.md:380`），而校验反馈单源 §2.12 项 1 把本行呈现绑于行名匹配、无行情形交「**无行渲出结果**（名不在列表 ∥ kind 表外）⇒ 段末回退（`fallbackVerifyNode`）」（`SETTINGS.md:141`）；向导径未点名所取节点（`verifyNode` ∥ `fallbackVerifyNode`），且「换渠不自动清」（`SETTINGS.md:380`）⇒ 切预设后旧读数仍显 | 点明向导径复用的节点名（并说明是否把 §2.12 单源扩为含向导径），并对「切预设后旧读数」给出显式口径 |
| 7 | 索引可达性（⑤） | 🔵 | 项目级 KD 索引行只覆盖四项 ⊥ #1277（「| KD-79 | → `docs/desktop/design/SETTINGS.md` §1（首启向导保存面收正——保存钮提级 `.wizard-save`」（`PROJECT.md:133`）），变更行亦只记 #1277（`PROJECT.md:1818`）——⑤ 校验看得见（#1278）只落 SETTINGS.md 侧（§2.23 项 8 ∥ §2.6 ∥ §4 ∥ §5） | 在项目级索引 ∥ 变更行补 ⑤ / #1278 指针，使 D11 ④ 的决策从索引面可达 |
| 8 | 登记（300 咨询线） | 🔵 | `views/onboarding.mjs` 本批「**264 ⇒ ≈302**」（`SETTINGS.md:411` ∥ `:573`）无「越 300 咨询线」登记句，而同表 `settings.css` 行有「**越 300 咨询线在册（续期）** ∥ ≤500 ✓」（`SETTINGS.md:577`）——同族行标注不齐 | 若域行仍按 300 咨询线登记 ⇒ 为该档补入册句 + 拆分评估窗口；若 300 线已随 500/800 口径更换批退役 ⇒ 在档面点明（防读作漏登） |

**计数**：🔴 0 ∥ 🟡 4 ∥ 🔵 4（发现 8 条）。需求覆盖（D11 ①–④ + D16 真机用例义务）无缺口；可行性无阻塞项；无新档 ∥ 无 IA 改动 ∥ 核 ∥ CLI ∥ VSC 零触，文档归属为既有 owner 档（SETTINGS.md ∥ UI.md ∥ PROJECT.md）。

VERDICT: pass

## §4 用户批准（主 agent）

### 2026-10-11 · 用户批准（代签——主 agent）

用户 2026-10-11 13:24「都做」+「自动跑完」+ 13:41「校验也修」= 本批全链授权（含 §4 代签口径）；§1 自缚三条在效。

**代签三条件（逐条核——父侧实读）**
1. 设计评审 **#213 = pass**（🔴 0 ∥ 🟡 4 ∥ 🔵 4；发现表 + VERDICT 在 §3 轮次 1）；
2. 修正轮 **#214 八号逐条落位**、父侧实读核验通过：`docs/desktop/design/UI.md:806`（旧记录行收 as-of + 现链指针）∥ `docs/desktop/design/SETTINGS.md:405`/`:415`（现值收正 454 ∥ 306）∥ `UI.md:524`（206）∥ `SETTINGS.md:584`（`0 ⇒ ≈300`）∥ `:170-172`（残句清、活句单源）∥ `:341`（两参定形——词键 = 既有位 `form.submitKey`）∥ `:381-383` + `:142`（直取 `verifyNode` ∥ 回退件不用 ∥ 保留口径四支 ∥ 单源含向导径）∥ `PROJECT.md:133` + `:1818-1819`（⑤/#1278 指针）∥ `SETTINGS.md:414`（300 线入册）。闸面复读：悬空基线 **25** ∥ 行宽 **OK** ∥ 产品码零触（设计轮）；
3. 评审通过 **token 已签发**（凭证值不入档——沿「凭据值不进文档」律）。

**父侧直接执行一处（机械补记——可 revert）**：`SETTINGS.md` §3.2 行 4（`mount-settings-exits.mjs`）补「越 300 咨询线在册（续期）」登记句（本批触碰行同族齐——评审未列、修正轮披露项，父侧裁定 = 补）。

**准予实施**：本批设计（① 提级 ∥ ②③ 合并「保存并继续」∥ ④ 完成护栏 ∥ ⑤ 校验看得见）——派 eng-coder 依设计实施；实施面 = `thincoder-desktop/renderer/**` 七件 + 批内件一件（`docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`）；主进程 ∥ 核 ∥ CLI ∥ VSC 零触。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-11（七件 + 批内件；6/6 绿 · 审计零偏差 · 代码评审 pass（🟡1 记录面收口 + 🔵3 非阻塞）· 跨批读数五条上抛）



### 2026-10-11 · 实施记录（eng-coder）

**交付摘要**

- 实施面 = 设计 §3.1/§3.2 七件（`thincoder-desktop/renderer/**`）+ 批内件一件；核 ∥ CLI ∥ VSC ∥ `thincoder-desktop/src/**` 零触（`git status --porcelain` 实读：改动面恰七件 + 批内件）。
- ① `.wizard-save` 提级：`channelFormTree` 增 `submitClass` 参（缺省 `settings-submit`——弹窗径零变）+ CSS 四组各 +1 选择器（基形 ∥ 强调 ∥ cursor ∥ `align-self`）。
- ②③ 步 1「保存并继续」：空 key ⇒ 零写直进（「零输入可走」保持）∥ 非空 ⇒ 先存后进、`submitChannel` 返回 `true` 才进、写败留步 ∥ 尾控件步判 `step === 2`（步 1「下一步」退场）∥ `nextStep` 步 1 支净删 ∥ 出口族成功径 `return true`。
- ④ 完成护栏：未配 ⇒ `settings.wizard.finishBlocked` 旗 + 不退场 + 就地护栏（提示句 + 「去保存渠道」∥「仍要退出」两钮，锚 `wizard:guardBack` ∥ `settings:close`）∥ 已配 ⇒ 照退（零改）∥ 任意步写经 `setStep` 单点清旗。
- ⑤ 校验看得见：`wizardModel.verify` 同源投影（≡ `views/settings.mjs` 取值位）+ 态归一（kind 表外 ⇒ `null`，零假造）+ 明细行复用导出面 `verifyNode`；`fallbackVerifyNode` 不入向导径；零新键（复用 `settings.providers.verify*` 五键）∥ 零互锁（verify = fail 在场两径照走）。
- 词表：净删 `wizard.save`（两语）；+4 键 × 两语（`wizard.saveAndNext` ∥ `wizard.finishGuard` ∥ `wizard.finishGuardGo` ∥ `wizard.finishGuardExit`）；键数链 346 ⇒ **349**（两语实读 349、键集相等、旧键渲染面源扫零命中）。
- 行数实读（口径 `split("\n").length−1`）：`views/onboarding.mjs` 302（估 ≈302）∥ `mount-onboarding.mjs` **235**（估 ≈220）∥ `views/settings-controls.mjs` 193（≈191）∥
  `mount-settings-exits.mjs` 312（≈312）∥ `settings.css` 357（≈357）∥ `i18n.mjs` 450（≈450）∥ `views/settings-sections-providers.mjs` 212（≈212）∥ 批内件 **348**（估 ≈300）。
- 回填提示（设计面 §3.2 两行）：`**188 ⇒ ≈220**` 实读 235（+15）∥ `**0 ⇒ ≈300** 行` 实读 348（+48）——均 ≤500 ✓，零拆分需求。

**决策透明表（实施期裁定）**

| # | 事项 | 裁定 | 依据 |
|---|---|---|---|
| 1 | 出口族 `handlers.onSubmit` 去 `void`（值贯链） | 采——②③ 消费面的必要实现（设计称「唯一 +1 行为行」；实际两行，属设计措辞不精） | 消费者核查：`mount-settings.mjs:258` 注入向导（要值）∥ `wire` 直挂 DOM（返回值被忽略）⇒ 零受害面 |
| 2 | 「+两 handler 键」读法 | 落形 = 新增 1（`onGuardBack`）+ 改义 1（`onSubmit`） | 退钮复用 `onDismiss`/`settings:close`（单一实现优先——与头 ✕ 同语义同出口） |
| 3 | 护栏钮行类名 `wizard-finish-guard-actions`（设计未点名） | 自定新族名（零新变量 · 零新键） | 容器族 + 提示句色语汇照设计 |
| 4 | CSS 注释随正 | 三处计数（档头行数 357 ∥ 控件形「强调 3」∥ 交互态组「强调 3」）+ 一处名单补齐（D24 括注补「推进」） | 计数与名单同步（D3）——末处为审计提示后自修（名单漏项系既有） |
| 5 | `settings.configured === null` 时向导不占槽（「null 边」） | 零改（不可达） | 装配面只在 `configured === false` 时占槽；切片补写 | 
| 6 | `mount-onboarding.mjs` 超设计估 +15 | 采（≤500 ✓、净增与点名改动对得上） | 行数实读 |

**审计与代码评审轮次 · 终态**

- 内部 explore 分歧审计（轮 1）：四类偏差（部分实现 ∥ 静默简化 ∥ 越清单 ∥ 注释漂移）**零发现**；三条预先披露逐条核验（去 `void` 零受害消费者 ∥ 235 行 ∥ 注释随正）；提示 3 条（均 🔵 级）。
- 内部 advisor 代码评审（轮 1 · type=code）：**pass**；发现 = 🟡 1（记录面收口：§5/§6 空白 + 设计估未回填——本文即其一半）+ 🔵 3（`.wizard-save` 不入交互态组——D24 在册口径「强调 3 保留 accent 框，零动」，非缺陷 ∥ 「控件 → form」惯用式第三副本 ∥ 读数不带渠名——设计 §2.23 项 8 在册裁定）；🔴 0。
- fix round：共 1 轮 —— 批内件腿六锚断言技法（描述符缺 prop = `undefined` 键 ⇒ 改比对值）+ 上述注释名单补齐；无产品码语义修正。
- 终态：**clean**（零遗留待修项；🟡/🔵 均为非阻塞项，见上）。

**验证读数**

- 批内件：`node --test docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`（workdir `thincoder/`）⇒ **6/6 pass**（六腿：构树 ∥ 逐态接线 + 桥面 ∥ 护栏 ∥ 弹窗负控 ∥ 词表 ∥ 校验消费）。
- 语法检：七件 + 批内件 `node --check` 全绿。
- 同面定向回归：`2026-10-10-login-entry-completion.test.mjs` 9/9 绿 ∥ `2026-10-07-provider-config-parity-desktop.test.mjs` 6/6 绿。
- **未跑仓级 `npm test`**（本链不跑——父侧收口单跑）。

**跨批读数（不改他批件 · 上抛父侧）**

- `2026-09-29-desktop-head-toolcolor.test.mjs:70-73`：锚键 `wizard.save` 随批净删 ⇒ `:72` 锚断言新红（`:70` 计数锁 292 本批前已滞后）；仓套件清单为空（`thincoder-desktop/test/files.mjs` = `export default []`）⇒ 无 CI 红面。
- `2026-10-03-desktop-firstrun-provider-notice.test.mjs:286-291`：步 1 `handlers.onNext()` 推进腿随步 1 支净删而新红（其「完成径不阻断」旧口径已由用户 13:24 裁定改）。
- `2026-09-29-i18n-split.test.mjs`：A1 自有块 83 ⇒ 86、`SETTINGS_DICT` 84 ≠ 77（B1 批后既有滞后）∥ A2 基线（2026-10-10 重冻）全量对拍随 349 新红 ∥ A4 `i18n.mjs` 450 > 437 上限（本批 +9 前 441 已越线）∥ A6 `statusline.mjs` 264 ≠ 204（既有滞后）。
- `2026-10-04-desktop-channel-tier-retire.test.mjs:174`（338）∥ `2026-10-05-attach-file-support.test.mjs:363-364`（338）：绝对键数锁随历批增键滞后（本批 −3 前已红）。
- `2026-10-07-provider-config-parity-desktop.test.mjs:158,162`：桩以字面 `submitKey: "wizard.save"` 构造，两侧同取 `t()` ⇒ 仍绿（词面回落键名）——旧键已不存在，留旧批注记。

**披露**

- 越出申报面一处：`mount-onboarding.mjs` 实读 235（设计估 ≈220）。其余改动均在设计点名面内；零新 IPC ∥ 零新载荷 ∥ 零新 CSS 变量 ∥ 零新档。
- 测试件形态：假 `FormData` + 桩出口族，零真配置写入；腿二含桥面断言（`createExits().handlers.onSubmit` 成 ⇒ `true`），腿三含构树目视边（旗 ⇒ 护栏可见）。

- 补记（2026-10-11 · 收口前自检）：批内件行数更正 **348 ⇒ 357**（腿三补「仍要退出 ⇒ 退场（同 `dismissWizard`）∥ 退场后零占槽」一断言块——设计验收 ④ 第 ⑥ 行机检补齐）；六腿重跑 **6/6 绿**；§5 长行（>300 字符）一处已回折为两行（自撰面随正——他段 11 处存量长行未动，读数见交付报告）。

## §6 验证与收口（父代理）

### 6.1 收口核验（父侧亲验 · 逐面）

| # | 面 | 结论 | 证据 |
|---|----|------|------|
| 1 | ① 点得着（步 1 写盘钮 = 强调形 + 词「保存并继续」） | ✅ | 批内件构树腿；父侧实读 `renderer/views/onboarding.mjs:163`（`submitClass: "wizard-save"`）+ `views/settings-controls.mjs:83-84`（缺省 `settings-submit`——弹窗径零变） |
| 2 | ② 存得下（先存后进 ∥ 写败留步 ∥ 空 key 直进） | ✅ | 批内件逐态接线腿（四态）；`mount-settings-exits.mjs:124` 成功径 `return true`（唯一行为行 +1——父侧实读） |
| 3 | ③ 合并钮（步 1「下一步」退场 + `nextStep` 步 1 支净删） | ✅ | 批内件；父侧实读 `mount-onboarding.mjs:102-103`（仅步 2 支）+ `:108-123`（`submitAndContinue`） |
| 4 | ④ 完成护栏（未配不退场 + 两钮；已配照退） | ✅ | 批内件护栏腿；旗 `settings.wizard.finishBlocked`（`mount-onboarding.mjs:81-82` 单点清 ∥ `store.mjs` 零改） |
| 5 | ⑤ 校验看得见（直取 `verifyNode` ∥ `verifyControl(null, …)`） | ✅ | 父侧实读 `views/onboarding.mjs:168`（首参恒 `null`）+ `views/settings-sections-providers.mjs:39`（出导出面）+ 批内件校验消费腿 |
| 6 | 词表（−`wizard.save` +4 键 × 两语） | ✅ | 父侧实算 `HOST_DICT` **349 ∥ 349**；旧键零残留 |
| 7 | 行数面（八件逐值） | ✅ | 父侧实读 302 ∥ 235 ∥ 193 ∥ 312 ∥ 357 ∥ 450 ∥ 212 ∥ 357（批内件）——与交付报告逐值吻合 |
| 8 | 零触面 | ✅ | 批内件 + 父侧 `git status` 实读（`thincoder-desktop/src/**` ∥ 核 ∥ CLI ∥ VSC 零改） |

### 6.2 随正面（父侧直接执行 · 可 revert）

- **键数/基线族三件修绿**（承台账 #1221 族）：`2026-10-04-desktop-channel-tier-retire` **8/8**（键数 77∥338 ⇒ 84∥349）∥ `2026-10-05-attach-file-support` **16/16**（合并表 338 ⇒ 349）∥ `2026-09-29-i18n-split` **5/5**（自有块 83 ⇒ 87 ∥ `SETTINGS_DICT` 77 ⇒ 84 ∥ A4 阈值 437 ⇒ 455 ∥ A6 冻面 12 档重锚 ∥ **A2 基线 2026-10-11 全量重冻 349 条**——`2026-09-29-i18n-split.baseline.json`）∥ `2026-09-29-desktop-head-toolcolor` 计数锁 292 ⇒ 349 + 锚键换位（`wizard.save` 净删 ⇒ `wizard.saveAndNext`）。
- **本批因果腿改写一件**：`2026-10-03-desktop-firstrun-provider-notice` T4 ②——步 1 `onNext()` 旧口径 ⇒ 新口径（`onNext()` 步 1 零动作 + `onSubmit`（保存并继续）步入步 2 时 `loadModels(现渠 ∥ null)`——覆盖保住）。
- **定向复跑（父侧实跑）**：批内件 **6/6** ∥ `login-entry-completion` **9/9** ∥ `provider-config-parity-desktop` **6/6**——全绿。

### 6.3 门禁与交付链

- 仓套件（`npm test` = `node test/run.mjs`，workdir `thincoder-desktop`）⇒ **清单空、零用例 = 绿**（exit 0；2026-09-28 全量重置在册）——本批验证面 = 批内件 + 定向件实跑（读数如 6.2）。
- 文档闸（父侧实读）：行宽 **OK** ∥ 锚悬空 **25**（= 基线；本批零新增）。
- 设计档回填轮（eng-designer）：§3.1 六行 + §3.2 本批块（八行）估数收正为实读（235 ∥ 193 ∥ 357——其余五件数值吻合、形态收正）；两档变更记录各一行；批档 §2 回填块（`:172-196`）在案。
- 提交链：`27c954c1`（feat——产品 7 件 + 批内件 1 件）⇒ `797e73eb`（随正 6 件——含基线重冻）⇒ 本收口笔（设计 3 档 + 需求 1 档 + 本档）——**双推**（origin ∥ github）。
- 台账核销：**#1277** ∥ **#1278** ⇒ 已核销（evidence = 本档 §5/§6 + 提交链）。

### 6.4 真机走查 T-DSK67（归用户）与遗留

- **T-DSK67**（①–⑩：保存面七腿 + 校验面两腿 + 零 `pageerror`）= 真 Electron 走查，逐腿见设计档 §5 本批行；**归用户**（沿母批 **T-DSK66** 同判——父侧无 Electron 走查车具；机检面已由批内件六腿覆盖，真机面 = 人工走查）。
- 遗留（如实，均在账）：① **存量红 3 腿**（非本批因果——本批触面零涉；台账 **#1279**：`head-toolcolor` T5 头行色 ∥ `firstrun` T2 词路由 ∥ T3 core `providerSave` 回执）；② **#1221 族余项**（假 DOM 桩缺族 + `i18n.mjs:27` 存量指针）；③ 本批件「（拟——」三处旧标记（`SETTINGS.md` §2.23 项 5 ∥ §4 ∥ §5）——零语义，随下次触碰清。
