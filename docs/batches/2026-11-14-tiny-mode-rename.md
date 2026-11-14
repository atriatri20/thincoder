# 2026-11-14 · tiny-mode-rename
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 05:47 指示「都自动跑完吧，可以按顺序跑」；台账 #2410；前置批 2026-11-14-tool-desc-concise 已收口。
> 台账 = #2410（core · 归批）。前情 = docs/batches/2026-11-14-tool-desc-concise.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = f91bcf3900344f4e26c5c50c1804f000be29faa7
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

把工作模式的枚举值 `minimal` 改名 `tiny`。槽文件、三端界面、斜杠命令、状态栏、i18n、ACP 与测试全链一致。

### 为什么

用户不喜欢 `minimal` 这个名字。改名是纯措辞，但那句话背后的东西不是：这一档的用途是省钱（`#2411` 记了 256K 覆盖的同一动机）。名字短一点，斜杠命令也顺手。

### 边界：这个词还有另一个语义面

`minimal` 同时是**推理强度（reasoningEffort）**的合法取值。以下四处属该面，与本批无关，动了会把发给 provider 的 effort 改坏：

- `thincoder-core/model-specs.mjs` 的 `reasoningEffortEnum`（十余条模型）
- `bench/lib/params.mjs` 的 `EFFORT_VALUES`
- `thincoder-core/auto-think.mjs` 的档位阶梯
- i18n 的 `reasoning.minimal` 键

### 硬约束：旧槽读兼容

槽 JSON 持久化的是 `mode: "minimal"`。改名后该值不在枚举内，`resolveWorkMode` 会回落 `normal`——存量极简会话打开即静默变成普通档。

读兼容必须有：读到 `minimal` 视作 `tiny`，写入一律写新值。迁移时机由设计裁定（读时归一 ∥ 保存时重写）。

### 库内勘察

库内 = 已查：`grep '"minimal"'` 与 `grep 'slash.desc.minimal|MINIMAL'` 全仓 → 命中面分五类：

- **枚举与判定**：`thincoder-core/config-migrate.mjs` 的 `WORK_MODES`、`session-slot-write.mjs` 的字面量数组、`agent/setup.mjs`、`prompt-overlays.mjs`、`tools/shared.mjs`
- **CLI**：`cmd-eng.mjs`（`handleMinimalCommand` ∥ `/minimal`）、`cmd-config.mjs`、`slash-commands.mjs`、`status-line.mjs`（`MINIMAL` 横幅）
- **Desktop**：`renderer/events-flags.mjs`、`renderer/slash-commands.mjs`、`renderer/views/settings-agent.mjs`、`src/main/session-flags.mjs`、`renderer/i18n-*.mjs` 三组键
- **Server ∥ render-core**：`src/agent/member-routes.mjs`、`public/views-me-chat-composer.mjs`、`public/i18n-{en,zh}-core.mjs`、`deploy/sandbox/member-shell/core-run-util.mjs`、`thincoder-render-core/composer/controls.mjs`
- **测试 9 档**：`acp-work-mode`、`desktop-work-mode`、`minimal-mode`、`server-work-mode`、`tool-description-tiers`、`vsc-work-mode`、`work-mode-main`、`work-mode-renderer`、server `work-mode`

### 库外

库外 = B 类：改动面 = 本仓枚举、UI 文案、i18n 键、测试；外部断言 = 零。

### 授权

- **自动推进**：范围 = 本批（`#2410` 改名）与 `#2411`（tiny 档 256K 覆盖）；自 2026-11-14 05:47；用户原话：「都自动跑完吧，可以按顺序跑」
- **已定决定**：改名后的枚举值为 `tiny` · 用户原话：「1.改名选tiny」 · 时间：2026-11-14 05:21
- **已定决定**：进入 tiny 时把有效窗口覆盖 256K、切出即解除、模型自身窗口更小时取小者 · 用户原话：「长度限制不覆盖其他模式，只涉及tiny模式，进tiny模式限制，进别的模式解除限制。如果模型本身上下文更小，那就去小的。」 · 时间：2026-11-14 05:21（属 `#2411`，本批不做，只记在同一授权范围内）

### 上抛

无。

### 需求面已由主 agent 同轮改完

八份需求档的枚举值 `minimal` → `tiny`（含斜杠命令名与 `MODE` 取值表述）：

- `docs/core/requirements/CONFIG.md`（F13）· `docs/core/requirements/PROMPT-SYSTEM.md`（9 处）
- `docs/cli/requirements/TUI.md`（F21）· `docs/desktop/requirements/CHAT.md`（D5）· `docs/desktop/requirements/COMPOSER.md`（D34）· `docs/desktop/requirements/PROJECT.md`
- `docs/render-core/requirements/RENDER-CORE.md`（RC-C5）· `docs/vsc/requirements/WEBVIEW.md`（F-W24）

设计档与代码归设计席 / 实施席，本节不越界。

### 迁移时机的裁定权

旧槽 `mode: "minimal"` 的迁移时机（读时归一 ∥ 保存时重写 ∥ 两者兼有）由设计席在 §2 裁定并给判据。判据至少要回答：老槽打开后 `resolveWorkMode` 返回什么、槽文件何时被重写成新值、以及不改写时会不会每轮重复归一。

### 第 2 轮评审裁决（5 项）

- **🔴 #1 A11 量法不可满足** ⇒ 本轮修。命令收窄到 `WORK_MODES = ` 与裸 `const MODES = ` 两类（`UPDATE_MODES` / `SYNC_MODES` 是别的值域，不属本判据）；失败侧把「七处」改成同一条命令实测的数。
- **🟡 #2 值域来源不止一处** ⇒ 本轮修。`thincoder-core/session-slot-write.mjs` 与 `thincoder-desktop/renderer/views/settings-agent.mjs` 的内联三档数组并入 A11 覆盖面；机制设计一「唯一值域来源」这句按树改写。
- **🟡 #3 驼峰 `Minimal` 落在判据外** ⇒ 本轮修。A11 增一条覆盖 `handleMinimalCommand` 这类标识符，与「全部称谓」对齐。
- **🟡 #4 `test/RTM.md` 的 CLI 50 行不含 `minimal`** ⇒ 本轮修。该行从改动面移除，同句其余三处保留。
- **🔵 #5 A2 引文带省略号** ⇒ 本轮修。改成逐字可检索的引文。

授权：用户 2026-11-14「都自动跑完吧，可以按顺序跑。」⇒ 本批后续评审与实施按序自动推进，不再逐步确认。

### 第 3 轮评审裁决（2 项）

- **🔴 #6 VSC 端一面既不在改动面也不在判域** ⇒ 本轮修。`thincoder-vscode/webview/settings-agent.js` 进 §2 机读清单与受影响表；A11 增 `.js` 面，点名该档两条命中（`const defaultMode = ["minimal", "normal", "engineering"]` 与 `<select id="ag-mode">` 的同一数组）；`docs/core/design/CONFIG.md` §6 的「六处」改「七处」并点名该档。
- **🔵 #7 「九处」与 A11 ① 的 6 档不齐** ⇒ 本轮改「十处」，并在同段写明夹具 `test/integration/acp-work-mode.test.mjs` 计入哪一类。

核对结论：第 2 轮 5 项逐条实读成立，无「无理由不改」项；本轮两项均为实现面/计数缺口，不动已定口径（读时归一、写入面只产 `tiny`）。

### 第 4 轮评审裁决（1 🔴 + 3 🟡）

- **🔴 #1 英文界面文案未进改动面 —— 确认成立，本轮修。** 实读证据（按面列出）：
  - `thincoder-desktop/renderer/i18n-settings.mjs` 英文值 `"settings.agent.modeMinimal": "Minimal"`；`thincoder-vscode/locales/en.json` 同键同值。
  - `thincoder-desktop/renderer/i18n-views.mjs` ∥ `thincoder-server/public/i18n-en-core.mjs` 值 `toggle minimal ↔ normal work mode`。
  - `thincoder-cli/src/tui/slash-commands.mjs` 的 `/minimal` 行内联 `desc: "toggle minimal ↔ normal work mode"`。
  - `toolbar.modeMinimal` 英文值 `MIN`（desktop ∥ server ∥ vsc 三面）。
  - `thincoder-desktop/test/work-mode-renderer.test.mjs` 直接断言 `HOST_DICT.en["slash.desc.minimal"]` 等于 `toggle minimal ↔ normal work mode` —— 改文案必须同改该断言，该档已在机读清单内。
- **本项的口径由主 agent 定，不交设计席自选**：英文整词 `Minimal` → `Tiny`；句子 `toggle minimal ↔ normal work mode` → `toggle tiny ↔ normal work mode`；`toolbar.modeMinimal` 的英文值 `MIN` 不动、只改键名为 `toolbar.modeTiny`（`MIN` 与 `NORMAL` ∥ `ENG` 同排，是排版宽度缩写、不承载旧档名；`thincoder-server/test/work-mode.test.mjs` 断言 `["MIN", "NORMAL", "ENG"]`，改值会连带打红该例）；中文值一律不动（`极简` ∥ `切换极简 ↔ 普通工作模式`），按已定决策二。
- **🟡 #2 RTM 落点指向无字可改的行 —— 确认，本轮修。** 实测 `minimal` 在 `test/rtm/tooling.md` 落在 CLI 50 的「目的」行、在 `test/rtm/ends.md` 落在 `VSC 9` 的「目的」行，两处「节注」行都不含该字；`VSC 9` 全节未进改动面，A9 的判者列写的是用例档名不是 RTM 行。
- **🟡 #3 行数尺不一致 —— 确认，本轮改用 `countContentLines` 重取。** 该档末内容行实测 304，清单记 278 且自述「node 行扫」；另三档抽查相符，结论行不受影响。
- **🟡 #4 `expandKnowledgeTopics` 的 `minimal` 参数名 —— 确认，本轮裁决。** 它是这一档的第二个名字，与「去不去掉缺省」是两件事；须在本轮给明确处置并落到探针面。

### 第 5 轮：验收面改闭合清单式（主 agent 裁定）

- **为什么改**：四轮打回的发现各不相同，形状相同——判据靠「猜哪些字面会被改到」，义务面是「所有带旧称谓的地方」，前者永远比后者窄。第 3 轮的 `.js` 档漏在 `--include=*.mjs` 外、第 4 轮的英文值、驼峰标识符、裸字面比较，都是这个形状。
- **怎么改**：不再增补逐条探针。验收面改成由一次扫描生成的闭合清单：全仓扫 `minimal`（不区分大小写、不限扩展名，排除 `node_modules`、`.git`、`dist-*`、`.thincoder/tmp`），命中逐条列出，每条标三种归宿之一——**改**、**保留并写明理由**、**不适用并写明理由**。
- **判据**：清单里没有第四种归宿；实施后再扫同一命令，与清单的差异逐条可解释（新增的 `tiny` 字样属预期，其余差异即失败）。
- **三类保留面先定下来**，免得每轮重议：读兼容别名与旧值输入夹具（`resolveWorkMode` ∥ `resolveSessionWorkMode` 的归一、六处非核读面、旧槽夹具）；推理强度值域（`model-specs.mjs` 的 `reasoningEffortEnum` 及其在各端消费面）；排版缩写 `MIN`（`toolbar.modeTiny` 的值，与 `NORMAL` ∥ `ENG` 同排，改值会打红 `thincoder-server/test/work-mode.test.mjs` 的 `["MIN","NORMAL","ENG"]` 断言）。
- **采纳设计席上轮自推的两处**：`thincoder-cli/src/tui/cmd-config.mjs` 的档位选项文案（`minimal — compact prompts with on-demand knowledge`，同项 `action` 也是值域取值）与三处值域注释，属「英文用户可见文案跟档名走」的口径内，进清单。
- **清单住址**：§2 验收面（设计席笔）。实施席按清单执行，收口时按同一命令复跑并贴差异解释。

- **实施中裁决（用例面归属）**：10 档含旧名的用例档由本轮实施席一并改，不留给后续批。理由 = 改名是原子改动，只改产品面会把仓库测试留在红态、并让 RTM 证据列指向尚未改名的档；实测这些档 mtime 为昨日 19:43、本轮窗口无人写，无并发写者。`files` 是调度与披露通道、不是授权边界 ⇒ 越声明面不算违约，但 §5 须逐档披露并给「本批必需」的理由；§2 机读清单由设计席补行。口径：档名 `git mv`、旧槽夹具**输入**保留 `minimal`（读兼容的验证面）、断言改 `tiny`、标识符同改、`["MIN","NORMAL","ENG"]` 不动。

### 收口期核查（父侧实跑）与一处设计档改字

**读兼容判据实测通过**（本席 node 直调核）：

- `resolveWorkMode({ mode: "minimal" })` ⇒ `tiny`；`resolveSessionWorkMode({ mode: "minimal" }, {})` ⇒ `tiny`；`resolveWorkMode({ mode: "bogus" })` ⇒ `normal`（非法值语义未变）；`normalizeWorkMode("toString")` ⇒ `"toString"`（`Object.hasOwn` 守住了原型链）。
- 全仓 `minimal` 复扫 334 行，逐条归入三类保留面 + 记录面，无第四种归宿。

**待设计席改字（落地把两句弄假，改文档不改代码）**：

- `docs/core/design/CONFIG.md` §6「以下六处现行各自定义模式字面、不 import 核」——`thincoder-desktop/src/main/session-flags.mjs` 实读 import 了 `resolveSessionWorkMode` ∥ `setConfigWorkMode`（本地 `MODES` 只作写入校验）。改为如实表述：该面走核的读面归一、本地数组只守写入。
- `docs/core/design/SESSION.md` §8 ∥ `CONFIG.md` §6 的读兼容名单补 `thincoder-vscode/src/extension/panel-session-write.mjs`（旧槽写回面的归一点，实施期实测挖出）。

## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成





### 最近先例（三问）

- **在哪**：`thincoder-core/config-migrate.mjs` 的 `resolveWorkMode` ∥ `resolveSessionWorkMode`（经 `thincoder-core/config.mjs` re-export）。旧值读兼容的现成接缝已经在那里——`agent.engineering` 布尔值的读兼容就落在这两个函数里。
- **叫什么**：逐字沿用 `WORK_MODES` ∥ `resolveWorkMode` ∥ `resolveSessionWorkMode`。本批是改名，不是新造。
- **谁用**：`thincoder-core/session-slot-write.mjs` · `thincoder-core/tools/shared.mjs` · `thincoder-core/agent-tools/settings.mjs` · `thincoder-cli/src/acp/handlers-session.mjs` · `thincoder-vscode/src/extension/panel-messages-settings.mjs` ∥ `panel-session-write.mjs` ∥ `settings-panel-write.mjs` · `thincoder-server/src/agent/member-session-patch.mjs`。
- **采用**：归一加进这两个既有函数——同一接缝、同一形态，写入面不动。
- **不采用**：另起一次写盘迁移（把 config.json 与所有槽一次性改写成 `tiny`）。理由见「机制设计」二：读取路径写盘在多实例下造竞争，收益只是省一次字符串比较。

### 勘察证据

已查仓外公开源档两份（manifest `index.publicRepos`）：`../.thincoder` 全 `*.md` 的 `minimal` 命中全落在 `.thincoder/tmp/` 的旧快照副本与英文常句「minimal intrusion」，无一条规定工作模式取值；`../thincoder.com` 全 `*.md` 按 `minimal|工作模式|tiny` 查，命中 0。结论 = 无一相关，本批语义源只有本仓需求档与设计档。

### 本批条目（覆盖）

把工作模式的枚举值与全部称谓从 `minimal` 改为 `tiny`，并保留旧值的读兼容。需求面已由主 agent 同轮改完（§1「需求面已由主 agent 同轮改完」）；本批条目与需求档一一对应：

| 需求条目 | 覆盖 |
|---|---|
| `docs/core/requirements/CONFIG.md` F13 | agent.mode 的值域与唯一权威 |
| `docs/core/requirements/PROMPT-SYSTEM.md` §2 ∥ §9 | 三档表、工具面、极简槽行为 |
| `docs/cli/requirements/TUI.md` F21 | `/tiny` ∥ `/normal` ∥ `/eng` 矩阵 |
| `docs/desktop/requirements/CHAT.md` D5 · `docs/desktop/requirements/COMPOSER.md` D34 · `docs/desktop/requirements/PROJECT.md` | MODE 三档与状态行取值 |
| `docs/render-core/requirements/RENDER-CORE.md` RC-C5 | 共享控件的三档字符串 |
| `docs/vsc/requirements/WEBVIEW.md` F-W24 | 设置与会话模式控件 |

**不做**（§1 边界）：`#2411`（tiny 档 256K 有效窗口覆盖）；推理强度面四处 —— `thincoder-core/model-specs.mjs` 的 `reasoningEffortEnum` · `bench/lib/params.mjs` 的 `EFFORT_VALUES` · `thincoder-core/auto-think.mjs` 的档位阶梯 · i18n 的 `reasoning.minimal` 键。

### 设计档落点

核心规则只在一处：`docs/core/design/CONFIG.md` §5.4 持有枚举值域、旧值归一与归一时机、以及档名在各称谓面的单一写法，§6 持有各端归一、档位选项表、i18n 键与英文值的义务。其余各档只换字面：

- `docs/core/design/SESSION.md` §8 —— 恢复路径引用 CONFIG §5.4。
- `docs/core/design/PROMPT-SYSTEM.md` §2 §4 §6 §7 §9 · `docs/core/design/TOOLS.md` §1 —— 三档取值表述。
- `docs/cli/design/TUI-COMMANDS.md` §1 · `docs/cli/design/ACP-CLIENT.md` §3 · `docs/desktop/design/IPC.md` §1 · `docs/render-core/design/RENDER-CORE.md` §4.1 · `docs/server/design/webui/CHAT.md` §2 · `docs/vsc/design/SETTINGS.md` §1 · `docs/vsc/design/WEBVIEW-PROTOCOL.md` §1.3 · `docs/vsc/design/WEBVIEW.md` §5 —— 命令名、协议取值与界面档位表述。

### 机制设计

**一、枚举与写入面。** 核的 `WORK_MODES` = `tiny` / `normal` / `engineering`（`thincoder-core/config-migrate.mjs`）是新值的命名源。

同值字面在树里共十二档，分五类（§1 #7 的「十处」是补上夹具后的数；再加 #6 的 `.js` 档与 `index.html` 各一档，共十二）：

- 核一处：`thincoder-core/config-migrate.mjs` 的 `WORK_MODES`。
- 读面六处：`thincoder-desktop/src/main/session-flags.mjs`（import 核，读槽 mode 走 `resolveSessionWorkMode`，本地数组只守写入）· 下五处不 import 核、各自就地归一（§三）：`thincoder-desktop/renderer/events-flags.mjs` · `thincoder-render-core/composer/controls.mjs` · `thincoder-server/public/views-me-chat-composer.mjs` · `thincoder-server/src/agent/member-routes.mjs` · `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`。
- 内联三值数组三处：`thincoder-core/session-slot-write.mjs` 的槽写入校验 · `thincoder-desktop/renderer/views/settings-agent.mjs` 的选项表 · `thincoder-vscode/webview/settings-agent.js` 的 `defaultMode` 校验与选项表（同档两处）。
- HTML 选项表一处：`thincoder-vscode/webview/index.html` 的 `#mode-select`。
- 测试夹具一处：`test/integration/acp-work-mode.test.mjs` 自带的 `const WORK_MODES`——它是夹具、不是实现面，夹具自行声明三值，归宿与实现面同为「改」。

设计约束不是「只有一处字面」，而是「同值字面同改」：改值时上面每一档同改，验收面按「验收面：闭合清单」逐处判。

所有写入面只接受新枚举：`setSlotMode`、`setConfigWorkMode`、settings 工具的 `agent.mode`、ACP 的 `set_config_option`、各端 `setMode`。旧字面在写入面是非法值，走既有拒绝语义，不放行第二套。

**二、旧值读兼容 = 读时归一，不在读取路径写盘。** 回答 §1「迁移时机的裁定权」要求的三问：

1. 老槽打开后 `resolveWorkMode` 返回什么 —— `tiny`，不是 `normal`。
2. 槽文件何时被重写成新值 —— 该会话下一次写 mode 时（模式命令、宿主控件、设置写入）。读取路径不写。
3. 不改写会不会每轮重复归一 —— 会，每轮读一次归一次。归一是纯比较、无副作用、无磁盘 IO，不累积成本。

否掉的：保存时重写。理由 = 读取路径写盘把一次「打开会话」变成一次磁盘写；历史读面（`pageHistory` 一类）本就只读；槽文件在多实例下可能被另一进程同时写，读时改写会造出一处谁先写的竞争。收益只是省一次字符串比较。

**三、归一的落点。** 核侧一处实现：`thincoder-core/config-migrate.mjs` 的 `normalizeWorkMode`（旧别名表，只换别名、不判合法），由 `resolveWorkMode` ∥ `resolveSessionWorkMode` 调用，VSC 槽写回面直接调用。

五面现行各自定义模式字面、不 import 核，故各面就地实现同一句映射、语义以 CONFIG §5.4 为源：

- `thincoder-server/public/views-me-chat-composer.mjs`
- `thincoder-render-core/composer/controls.mjs`
- `thincoder-desktop/renderer/events-flags.mjs`
- `thincoder-server/src/agent/member-routes.mjs`
- `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`

另两面走核、不另写映射：`thincoder-desktop/src/main/session-flags.mjs` 读槽 mode 走 `resolveSessionWorkMode`，本地 `MODES` 只作写入校验；`thincoder-vscode/src/extension/panel-session-write.mjs` 在槽写回前以 `normalizeWorkMode` 归一 `extra.mode ?? existing.mode`，旧槽的 `minimal` 不会被原样写回。后者不带旧字面，故闭合清单里没有该档的命中行——它是归一点，不是命中处。

**四、称谓与显示。** 值面与键面分开裁；每一面的旧值与新值如下：

| 面 | 旧 | 新 |
|---|---|---|
| 枚举值 ∥ 槽值 ∥ 协议取值 | `minimal` | `tiny` |
| 斜杠命令名 | `/minimal` | `/tiny` |
| 状态栏横幅 | `MINIMAL` | `TINY` |
| 设置页档位标签（英文值） | `Minimal` | `Tiny` |
| 命令说明（英文值） | `toggle minimal ↔ normal work mode` | `toggle tiny ↔ normal work mode` |
| CLI 设置里的档位选项文案 | `minimal — compact prompts with on-demand knowledge` | `tiny — compact prompts with on-demand knowledge` |
| 档位按钮缩写（英文值） | `MIN` | `MIN`（只改键名，值不动） |
| 中文值 | 极简 | 极简（不动） |

中文文案保持「极简」——需求档同轮已按此落（`docs/core/requirements/PROMPT-SYSTEM.md` §2 表格一行「tiny … 极简常驻规则」），本批不为中文另造新词。

档位按钮缩写 `MIN` 的值不动：它与 `NORMAL` ∥ `ENG` 同排，是排版上的宽度缩写；键名跟值域走，值跟排版走。

**五、i18n 键与英文值。** 键名由值派生（`settings.agent.mode${Mode}`），故取键处随值自动改，键名必须同轮在场；键改了英文值不同轮改，用户看见的还是旧名 —— 键面和值面是一件事的两半：

- 键名：`toolbar.modeMinimal` → `toolbar.modeTiny`、`settings.agent.modeMinimal` → `settings.agent.modeTiny`、`slash.desc.minimal` → `slash.desc.tiny`
- 英文值：`settings.agent.modeTiny` 的值 `Minimal` → `Tiny`；`slash.desc.tiny` 的值 `toggle minimal ↔ normal work mode` → `toggle tiny ↔ normal work mode`；`toolbar.modeTiny` 的值保持 `MIN`
- 非词表的内联英文两处：`thincoder-cli/src/tui/slash-commands.mjs` 的 `/minimal` 行 `desc: "toggle minimal ↔ normal work mode"` 同句同改；`thincoder-cli/src/tui/cmd-config.mjs` 的档位选项文案 `minimal — compact prompts with on-demand knowledge` 同步换 `tiny`，同项的 `action` 是值域取值、随枚举改
- 落点 = `thincoder-desktop/renderer/i18n-composer.mjs` ∥ `i18n-settings.mjs` ∥ `i18n-views.mjs` · `thincoder-server/public/i18n-en-core.mjs` ∥ `i18n-zh-core.mjs` · `thincoder-vscode/locales/en.json` ∥ `zh.json`
- 按值 ∥ 按键断言的用例同轮改：`thincoder-desktop/test/work-mode-renderer.test.mjs` 直接断言 `HOST_DICT.en["slash.desc.minimal"]` 的值原文，另带一份键清单；`thincoder-server/test/work-mode.test.mjs` 带两份键清单。不同轮改，本批自己把用例弄红
- **不动** `reasoning.minimal`——推理强度面，另一个值域；`thincoder-desktop/renderer/i18n-composer.mjs` ∥ `thincoder-server/public/i18n-en-core.mjs` ∥ `thincoder-vscode/locales/en.json` 三处的英文值 `Minimal` 属该面，一并保留

**六、测试档改名。** `test/integration/minimal-mode.test.mjs` → `test/integration/tiny-mode.test.mjs`，用例编号不变。

**七、裸字面与标识符面。** 有两种形态既不是数组、键也不带引号，前几条探针命不中，单列：

- 裸字面比较：`thincoder-server/public/views-me-chat-composer.mjs` 的 `/minimal` 行一行三样 —— 命令名、`descKey`、`run: (ctx) => ctx.actions.setMode(handlers.mode?.() === "minimal" ? "normal" : "minimal")` 里的两个裸字面；`thincoder-core/prompt-overlays.mjs` ∥ `thincoder-core/tools/shared.mjs` 各有 `mode === "minimal"`。这些是命令与读面的出站判定，随枚举同改。
- 以档名命名的参数：`thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics(text, { minimal = false } = {})` 是这一档的第二个名字。本批把选项键改成 `tiny`，两个调用点（`thincoder-core/prompt-overlays.mjs` ∥ `thincoder-core/tools/shared.mjs` 的 `{ minimal: mode === "minimal" }`）同改。缺省本身不属命名面，按 §1 口径不在本批处置。

- 字面之外的旧名：`thincoder-cli/src/tui/cmd-config.mjs` 的档位选项文案、`thincoder-core/config-defaults.mjs` 的值域行注、`thincoder-render-core/composer/controls.mjs` 与 `thincoder-cli/src/tui/cmd-eng.mjs` 的行注、`test/integration/acp-work-mode.test.mjs` 头注里的 `minimal/normal/engineering`。这些改成新名之后仍跑得过测试，正因如此没人会回头改它们——留着就是把旧名教给下一个读者。闭合清单把这几处逐档标「改」。

### 受影响文件与测试覆盖

**档位结论**：下表每一档都未越设计时线 500（最大 `thincoder-core/tools/shared.mjs` 497），无拆分方案。读数 = `countContentLines`，取批起快照 `f91bcf39` 的各档正文本。

Rename 的处理：`test/integration/minimal-mode.test.mjs`（174 行）由 `git mv` 改为 `test/integration/tiny-mode.test.mjs`，下表两行是同一档的前后位。

**补入一档（初稿漏登）**：`thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs`（304 内容行，量法 `countContentLines`，取批起快照 `f91bcf39` 的正文本）不在初稿机读清单里，却带 24 处 `"minimal"` 断言。

它的运行面是实的：`thincoder-vscode/package.json` 的 `"test": "node test/run.mjs"`，而 `test/run.mjs` 递归收集 `*.test.mjs`，盘上未登记即 fail。改枚举后它必红 ⇒ 按改字面处置，不删（vscode 包历来把批次单测档留在包内并登记）。

**补入三面（第 3 轮评审 #6 起）**：VSC 端的改动面不止测试档，还有三面不在初稿清单里。

- `thincoder-vscode/webview/settings-agent.js`（210 内容行，量法 `countContentLines`，取批起快照 `f91bcf39`）：两处三值数组——`const defaultMode = ["minimal", "normal", "engineering"].includes(as.defaultMode) ? as.defaultMode : "normal"` 与 `<select id="ag-mode">` 的同一数组，并据值派生 `settings.agent.mode…` 键名。改后仍只列三档，机读清单补一行。
- `thincoder-vscode/webview/index.html`（136 内容行）：`#mode-select` 的三行选项（`<option value="minimal">MIN</option>` 等）是会话工具栏的档位表，值随枚举改。
- `thincoder-vscode/locales/en.json` ∥ `zh.json`（各 368 内容行）：`toolbar.modeMinimal` 与 `settings.agent.modeMinimal` 两键随值改名；同档的 `reasoning.minimal` 属推理强度面，不动。

`.html` ∥ `.json` 不在 `batch-tier-gate.mjs` 的 `CODE_EXTS`（`.mjs` / `.cjs` / `.js`）里，故只列于此、不入机读清单；`.js` 那档在 `CODE_EXTS` 内，入表。

RTM 索引档跟着改字面，落点逐行实测点名（两节的「节注」行都不含该字，别照节名去找）：

- `test/rtm/tooling.md`：`CLI 50`「目的」行的 `minimal 收窄自动注入` · `CLI 50-1` 行的 `/minimal` 与「minimal 不自动注入」及其用例档路径 · `CLI 50-2` ∥ `CLI 50-3` 的用例档路径 · `CLI 52-1` 行的 `写 minimal/engineering`。
- `test/rtm/ends.md`：`VSC 9`「目的」行的 `MODE 的 minimal/normal/engineering 三选项` · `12-2` 行的 `/minimal` · `2-1` 行的 `minimal/eng 切换矩阵`。

`VSC 9` 整节因此进改动面：它的两态 `9-1` ∥ `9-2` 的用例档 `test/integration/vsc-work-mode.test.mjs` 本就在清单里，A9 的判者列点名这一节。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/config-migrate.mjs | — | 191 |
| thincoder-core/config-defaults.mjs | — | 101 |
| thincoder-core/agent/setup.mjs | — | 310 |
| thincoder-core/prompt-overlays.mjs | — | 87 |
| thincoder-core/prompt-files.mjs | — | 177 |
| thincoder-core/prompts/knowledge/tool-settings.md | — | — |
| thincoder-core/prompts/discipline-engineering.md | — | — |
| thincoder-core/knowledge/README.md | — | — |
| thincoder-core/knowledge/prompt-resources.md | — | — |
| thincoder-core/tools/shared.mjs | — | 497 |
| thincoder-core/session-slot-write.mjs | — | 292 |
| thincoder-cli/src/tui/cmd-eng.mjs | — | 72 |
| thincoder-cli/src/tui/cmd-config.mjs | — | 327 |
| thincoder-cli/src/tui/slash-commands.mjs | — | 198 |
| thincoder-cli/src/tui/status-line.mjs | — | 204 |
| thincoder-desktop/renderer/events-flags.mjs | — | 47 |
| thincoder-desktop/renderer/slash-commands.mjs | — | 76 |
| thincoder-desktop/renderer/views/settings-agent.mjs | — | 208 |
| thincoder-desktop/src/main/session-flags.mjs | — | 115 |
| thincoder-desktop/renderer/i18n-composer.mjs | — | 157 |
| thincoder-desktop/renderer/i18n-settings.mjs | — | 238 |
| thincoder-desktop/renderer/i18n-views.mjs | — | 440 |
| thincoder-server/src/agent/member-routes.mjs | — | 488 |
| thincoder-server/public/views-me-chat-composer.mjs | — | 476 |
| thincoder-server/public/i18n-en-core.mjs | — | 149 |
| thincoder-server/public/i18n-zh-core.mjs | — | 152 |
| thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs | — | 221 |
| thincoder-render-core/composer/controls.mjs | — | 252 |
| test/integration/minimal-mode.test.mjs | — | 174 |
| test/integration/tiny-mode.test.mjs | — | 新 |
| test/integration/acp-work-mode.test.mjs | — | 174 |
| test/integration/desktop-work-mode.test.mjs | — | 184 |
| test/integration/server-work-mode.test.mjs | — | 205 |
| test/integration/tool-description-tiers.test.mjs | — | 278 |
| test/integration/vsc-work-mode.test.mjs | — | 140 |
| thincoder-desktop/test/work-mode-main.test.mjs | — | 220 |
| thincoder-desktop/test/work-mode-renderer.test.mjs | — | 159 |
| thincoder-server/test/work-mode.test.mjs | — | 381 |
| thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs | — | 304 |
| thincoder-vscode/webview/settings-agent.js | — | 210 |
| thincoder-vscode/src/extension/panel-session-write.mjs | — | 161 |
| docs/core/design/CONFIG.md | — | — |
| docs/core/design/SESSION.md | — | — |
| docs/batches/2026-11-14-tiny-mode-rename.test.mjs | — | 新 |

**补入两档加两份设计档（收口期改字）**：`thincoder-vscode/src/extension/panel-session-write.mjs`（161 内容行，量法 `countContentLines`，取批起快照 `f91bcf39`）是旧槽写回面的归一点，§5「越界披露」已逐字记录其改动理由；`docs/core/design/CONFIG.md` ∥ `docs/core/design/SESSION.md` 是「六处各自映射」那句的改字落点，`.md` 档不带行数读数。三档都在设计时线内，无拆分方案。

### 验收对照

| # | 需求锚 | 判据 | 判者 |
|---|---|---|---|
| A1 | F13（`CONFIG.md`） | `WORK_MODES` 恰为 `tiny`/`normal`/`engineering`；settings 工具写 `minimal` 被拒且报错点名值域；写 `tiny` 落到 `config.agent.mode` | 批内单测 `docs/batches/2026-11-14-tiny-mode-rename.test.mjs` · `node --test docs/batches/2026-11-14-tiny-mode-rename.test.mjs` |
| A2 | `docs/core/requirements/CONFIG.md` §6 验收「旧值 `minimal` 在配置文件与会话槽里都恢复为 `tiny`；写入面拒绝 `minimal`」· 设计 CONFIG §5.4 | `resolveWorkMode({mode:"minimal"})` 与 `resolveSessionWorkMode({mode:"minimal"})` 均返回 `tiny`；非法值 `"bad"` 仍回落 `normal`（既有语义不变） | 同 A1 档、同一条命令 |
| A3 | 同上需求锚 · 设计 SESSION §8 | 盘上旧槽（`mode:"minimal"`）恢复后 `agent.config.agent.mode === "tiny"`；该次恢复不改槽文件 mtime | 同 A1 档、同一条命令 |
| A4 | F21（`TUI.md`） | `/tiny` 在 tiny↔normal 之间切换并落槽；`/eng`、`/normal` 矩阵不变；`/minimal` 不再出现在命令表 | 集成 `CLI 50-1` |
| A5 | PROMPT-SYSTEM §2 §4 §7 | tiny 会话下一轮系统提示词无内联主题正文、不自动注入文档/记忆/大纲、项目规则保留 | 集成 `CLI 50-1` |
| A6 | D5 ∥ D34 ∥ PROJECT | MODE 三档取值为 `tiny/normal/engineering`；`/tiny` 与控件共用 `setMode`；状态行显示当前档 | 集成 `ends 12-2` + 桌面单测 |
| A7 | CHAT §2 | 控件与 slash 都发 `setMode`；三档词表中英齐全 | 集成 `ends 2-1` |
| A8 | RC-C5 | `controls.mjs` 的 `MODES` 为三档新值，循环与 `setMode` 出站一致 | 集成 `ends 2-1` |
| A9 | F-W24 | `setMode {value:"tiny"}` 写槽并推设置；非法值零写 | 集成 `VSC 9-1` ∥ `VSC 9-2`（`test/rtm/ends.md` 那两行；用例档 `test/integration/vsc-work-mode.test.mjs`） |
| A10 | ACP-CLIENT §3 | `workMode` 的 options 恰为三项，显示名由值派生为 `Tiny`；非法值零状态变零通知 | 集成 `CLI 52-1` |
| A11 | 一物一词（闭合清单） | 全仓扫描的清单里每一处命中只有三种归宿之一（改 ∥ 保留 ∥ 不适用），无第四种；标「改」的处实施后不再有旧称谓 | 命令读数，见「验收面：闭合清单」 |
| A12 | 一物一词（保留面） | 标「保留」的处逐条可指，且理由落在三类之一：读兼容别名与旧值夹具 · 推理强度值域 · 排版缩写 `MIN` | 同 A11，清单逐条 |
| A13 | CONFIG §6 | 七面读到旧值都归一为 `tiny`（五面就地映射；`thincoder-desktop/src/main/session-flags.mjs` 与 VSC 槽写回面经核）：`thincoder-server/test/work-mode.test.mjs` 的 `workModeOf({mode:"minimal",engineering:true})` 与 `sessionRowOf(...).flags.mode` 均断言 `tiny`；desktop 两档对应断言同理；VSC 槽写回面由 `2026-11-13-vsc-work-mode.test.mjs` 的「旧槽 engineering 仅作读取迁移；合法槽 mode 优先」一例判——旧槽 `minimal` 写回后槽上为 `tiny`、旧布尔退役 | `node --test thincoder-server/test/work-mode.test.mjs` ∥ `node --test thincoder-desktop/test/work-mode-main.test.mjs` ∥ `node --test thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs` |

**验收面 = 一次扫描生成的闭合清单。**

量法 = 内置 `grep` 工具（项目文本读数尺），模式 `minimal`，不区分大小写、不限扩展名，按包分次跑。仓根单次跑实测截断在 200 条封顶，故按包拆；桌面整包跑会命中 `dist-r3` 里的二进制文本（实测），故只扫 `renderer/` ∥ `src/` ∥ `test/`。排除面 = `node_modules` · `.git` · `dist*` · `.thincoder/tmp`。

判据 = 清单里每一处命中只有三种归宿：**改** · **保留并写明理由** · **不适用并写明理由**，无第四种。实施后按同一命令复跑，与清单的差异逐处可解释：新出现的 `tiny` 字样属预期，其余差异即失败。

保留面的理由只落三类：① 读兼容别名与旧值输入夹具——归一落点读到 `minimal` 才成立，夹具喂的就是旧值；② 推理强度值域——`reasoningEffortEnum` ∥ `EFFORT_VALUES` ∥ 自动思考的档位阶梯 ∥ i18n 的 `reasoning.minimal` 键与同面英文值，另一个值域；③ 排版缩写 `MIN`——与 `NORMAL` ∥ `ENG` 同排，随排版不随档名。

产品面读数：核 45 处 · CLI 13 处 · 桌面 49 处 · Server 39 处 · render-core 2 处 · VSC 36 处 · 集成与 RTM 75 处 · bench 2 处 · 状态档 9 处。逐处如下。

**`thincoder-core`（45 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `config-migrate.mjs` | `WORK_MODES = Object.freeze(["minimal", "normal", "engineering"])` | 改 |
| `config-defaults.mjs` | 值域行注 `sole work-mode authority for new sessions: minimal \| normal \| engineering` | 改 |
| `session-slot-write.mjs` | 槽写入校验 `if (!["minimal", "normal", "engineering"].includes(value))` | 改 |
| `agent/setup.mjs` | `const minimal = mode === "minimal"` · 三处 `!minimal` | 改 |
| `prompt-overlays.mjs` | `expandKnowledgeTopics(content, { minimal: mode === "minimal" })` | 改 |
| `tools/shared.mjs` | 同上形状（`{ minimal: mode === "minimal" }`） | 改 |
| `prompt-files.mjs` | 5 处：`for minimal` 函数注 · `expandKnowledgeTopics(text, { minimal = false } = {})` · `In minimal mode…` 注 · `minimal ? /…/ : KNOWLEDGE_ANCHOR_RE` · `return minimal ? "" : …` | 改 |
| `prompts/knowledge/tool-settings.md` | `agent.mode` accepts exactly `minimal`, `normal` or `engineering` | 改 |
| `prompts/discipline-engineering.md` | `minimal and normal load no engineering discipline and no write gate` | 改 |
| `knowledge/README.md` | `never inlined into minimal, normal, or engineering system prompts` | 改 |
| `knowledge/prompt-resources.md` | `minimal prompts omit the anchored bodies` | 改 |
| `prompts/discipline-engineering.md` | `a minimal patch masks the symptom` | 不适用（英文形容词，非档名） |
| `prompts/knowledge/normal-coding-workflow.md` | `minimal intrusion` · `the minimal form` | 不适用（英文形容词） |
| `prompts/persona-engineering.md` | `minimal evidence line` | 不适用（英文形容词） |
| `markdown.mjs` | `Minimal YAML subset parser` | 不适用（英文形容词） |
| `auto-think.mjs` | `minimal classification prompt` · `["low", "minimal", "none", "low"]` · `minimal tokens` | 保留（推理强度值域 + 英文形容词） |
| `model-specs.mjs` | 19 处 `reasoningEffortEnum: [… "minimal" …]` 与同面 API 校验行注 | 保留（推理强度值域） |

**`thincoder-cli`（13 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `src/tui/cmd-eng.mjs` | 头注 `/minimal toggles` 与 `minimal↔normal` · `export async function handleMinimalCommand` · `current === "minimal" ? "normal" : "minimal"` 与 `"/minimal"` | 改 |
| `src/tui/slash-commands.mjs` | import `handleMinimalCommand` · `{ name: "/minimal", group: "Agent", desc: "toggle minimal ↔ normal work mode" }` · `"/minimal": handleMinimalCommand` | 改 |
| `src/tui/status-line.mjs` | `const minimalBanner = … === "minimal" ? … MINIMAL …` · banner 拼接行的 `MINIMAL│` · `minimalBanner` 插值 | 改 |
| `src/tui/cmd-config.mjs` | `{ text: "minimal — compact prompts with on-demand knowledge", action: "minimal" }` | 改 |
| `src/tui/cmd-shell.mjs` | `extremely minimal` | 不适用（英文形容词） |
| `src/tui/mouse.mjs` | `deliberately minimal` | 不适用（英文形容词） |
**`thincoder-desktop`（49 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `renderer/events-flags.mjs` | `WORK_MODES = Object.freeze(["minimal", "normal", "engineering"])` | 改 |
| `src/main/session-flags.mjs` | `const MODES = Object.freeze(["minimal", "normal", "engineering"])` | 改 |
| `renderer/views/settings-agent.mjs` | 两处 `["minimal", "normal", "engineering"]`：`const selected = …` 校验与 `return […].map(…)` 选项表 | 改 |
| `renderer/slash-commands.mjs` | `name: "/minimal"` · `descKey: "slash.desc.minimal"` · `setMode(currentMode() === "minimal" ? "normal" : "minimal")` | 改 |
| `renderer/i18n-settings.mjs` | `"settings.agent.modeMinimal": "Minimal"` | 改（键 + 英文值 `Tiny`） |
| `renderer/i18n-settings.mjs` | `"settings.agent.modeMinimal": "极简"` | 改键，值不动 |
| `renderer/i18n-views.mjs` | `"slash.desc.minimal": "toggle minimal ↔ normal work mode"` | 改（键 + 英文句） |
| `renderer/i18n-views.mjs` | `"slash.desc.minimal": "切换极简 ↔ 普通工作模式"` | 改键，值不动 |
| `renderer/i18n-composer.mjs` | `"toolbar.modeMinimal": "MIN"` 两处（en ∥ zh） | 改键，值留 `MIN` |
| `renderer/i18n-composer.mjs` | `"reasoning.minimal": "Minimal"` ∥ `"最小"` | 保留（推理强度值域） |
| `test/work-mode-main.test.mjs` | 13 处：`{ mode: "minimal " }` 与 `{ mode: "minimal", extra: true }` 两条非法输入探针 · `const minimal = setFlags(…)` 与同段四处断言 · `minimal 允许 PLAN` 注 · 三档循环 · `settingsAgent({ patch: { "agent.mode": "minimal" } })` 与三处断言 | 改 |
| `test/work-mode-main.test.mjs` | `saveSlot(4, { mode: "minimal", engineering: true })` | 保留（旧槽输入夹具） |
| `test/work-mode-main.test.mjs` | 该夹具的断言 `pageHistory(…).flags.mode` 期望 `"minimal"` | 改（归一后应为 `tiny`） |
| `test/work-mode-renderer.test.mjs` | 19 处全部：`slash.desc.minimal` 的值原文断言 · 键清单 · 选项表与选中项断言 · 夹具与两处注释 | 改 |

**`thincoder-server`（39 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `public/views-me-chat-composer.mjs` | `WORK_MODES = Object.freeze([...])` · `{ name: "/minimal", group: "Agent", descKey: "slash.desc.minimal", run: … === "minimal" ? "normal" : "minimal" }` | 改 |
| `src/agent/member-routes.mjs` | `WORK_MODES = Object.freeze([...])` | 改 |
| `deploy/sandbox/member-shell/core-run-util.mjs` | 同面的三值字面 | 改 |
| `public/i18n-en-core.mjs` | `"slash.desc.minimal": "toggle minimal ↔ normal work mode"` | 改（键 + 英文句） |
| `public/i18n-en-core.mjs` | `"toolbar.modeMinimal": "MIN"` | 改键，值留 `MIN` |
| `public/i18n-en-core.mjs` | `"reasoning.minimal": "Minimal"` | 保留（推理强度值域） |
| `public/i18n-zh-core.mjs` | `"slash.desc.minimal": "切换极简 ↔ 普通工作模式"` · `"toolbar.modeMinimal": "MIN"` | 改键，值不动 |
| `public/i18n-zh-core.mjs` | `"reasoning.minimal": "最小"` | 保留（推理强度值域） |
| `test/work-mode.test.mjs` | 24 处：三档选项断言 · `select.value = "minimal"` 与写回断言 · `WORK_MODES` 断言 · `/minimal` 命令面 · 键清单 · 建会话与恢复断言 · 连续写序 | 改 |
| `test/work-mode.test.mjs` | `workModeOf({ mode: "minimal", engineering: true })` 与 `sessionRowOf(… flags: { mode: "minimal", engineering: true } })` 的**输入** | 保留（旧值输入夹具） |
| `test/work-mode.test.mjs` | 上述两行的**期望值** | 改（归一后应为 `tiny`） |
| `test/mini-dom.mjs` | `Minimal DOM fixture` | 不适用（英文形容词） |

**`thincoder-render-core`（2 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `composer/controls.mjs` | 行注 `只持 minimal/normal/engineering 一个状态` · `const MODES = ["minimal", "normal", "engineering"]` | 改 |

**`thincoder-vscode`（36 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `webview/settings-agent.js` | `const defaultMode = ["minimal", "normal", "engineering"].includes(…)` · `<select id="ag-mode">` 的同一数组（并据值派生 `settings.agent.mode…` 键名） | 改 |
| `webview/index.html` | `<option value="minimal">MIN</option>` | 改值，文本 `MIN` 不动 |
| `locales/en.json` | `"toolbar.modeMinimal": "MIN"` · `"settings.agent.modeMinimal": "Minimal"` | 改（键；后者值 `Tiny`） |
| `locales/en.json` | `"reasoning.minimal": "Minimal"` | 保留（推理强度值域） |
| `locales/zh.json` | `"toolbar.modeMinimal": "MIN"` · `"settings.agent.modeMinimal": "极简"` | 改键，值不动 |
| `locales/zh.json` | `"reasoning.minimal": "最小"` | 保留（推理强度值域） |
| `test/2026-11-13-vsc-work-mode.test.mjs` | 25 处：选项表与逐档循环 · `"minimal "` 带空格非法输入探针 · 推送与恢复断言 · 幂等断言 · 面板保存载荷 | 改 |
| `test/2026-11-13-vsc-work-mode.test.mjs` | `saveSlot(3, { mode: "minimal", engineering: true })` | 保留（旧槽输入夹具） |
| `test/2026-11-13-vsc-work-mode.test.mjs` | 该夹具的断言 `agentSettings(…).mode` 期望 `"minimal"` | 改（归一后应为 `tiny`） |

**`test/`（75 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `integration/acp-work-mode.test.mjs` | 18 处：`const WORK_MODES` 夹具 · 头注两行 · `value: "minimal"` 请求与各处 `workModeOf(…)` 断言 · `/workMode must be one of minimal\/normal\/engineering/` 报错原文 | 改 |
| `integration/desktop-work-mode.test.mjs` | 5 处：`setMode { value: "minimal" }` 与 store ∥ 槽 ∥ pageHistory ∥ 事件四处断言 | 改 |
| `integration/minimal-mode.test.mjs`（改名 `tiny-mode.test.mjs`） | 18 处：文件名与头注的 `minimal` · `handleMinimalCommand` import 与调用 · `QUERY` 标记串 · 两处临时目录前缀 `minimal-int-` · 六处值断言 | 改 |
| `integration/server-work-mode.test.mjs` | 三档选项断言 `["minimal", "normal", "engineering"]` | 改 |
| `integration/tool-description-tiers.test.mjs` | 19 处：`/minimal` 入口与 `handleMinimalCommand` · `expandToolDescription(…, "minimal")` · `minimalBody` 一族局部量与断言 · `{ mode: "minimal" }` 装配 | 改 |
| `integration/vsc-work-mode.test.mjs` | 三档选项断言两处 · `"minimal "` 非法探针 | 改 |
| `rtm/tooling.md` | `CLI 50`「目的」行 `minimal 收窄自动注入` · `50-1` 行的 `/minimal` 与「minimal 不自动注入」及用例档路径 · `50-2` ∥ `50-3` 用例档路径 · `52-1` 行 `写 minimal/engineering` | 改 |
| `rtm/ends.md` | `VSC 9`「目的」行 `MODE 的 minimal/normal/engineering 三选项` · `12-2` 行 `/minimal` · `2-1` 行 `minimal/eng 切换矩阵` | 改 |

**`bench`（2 处）**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `lib/params.mjs` | `EFFORT_VALUES = ["none", "minimal", "low", "medium", "high", "xhigh", "max"]` | 保留（推理强度值域） |
| `README.md` | `取值 ∈ {none, minimal, low, …}` | 保留（同上） |

**状态档与记录面**

| 档 | 命中（逐处） | 归宿 |
|---|---|---|
| `docs/core/design/CONFIG.md` | 6 处：`旧值 minimal 是 tiny 的历史写法` · 称谓面那句 · §6 读到旧字面归一 · 选项表不列旧值 · 旧值到不了三张选项表 · i18n 键映射 `modeMinimal` → `modeTiny` | 保留（设计档陈述旧别名与映射） |
| `docs/core/design/SESSION.md` | `旧字面 minimal 归一为 tiny，见 CONFIG §5.4` | 保留（同上） |
| `docs/core/requirements/CONFIG.md` | `枚举值取名 tiny 之前写下的 minimal 是同一档的历史写法` · §6 验收 `旧值 minimal … 恢复为 tiny；写入面拒绝 minimal` | 保留（需求档陈述旧值读兼容与验收） |
| `docs/batches/**` | 已收口批档与在途本档的记录面 | 不适用（历史记录：已收口档是settled account，改写它等于重写已经结清的账；本档是本批自己的账） |
| 仓根 `_fix88-cli-wrap.log` | `minimal` 一次（`.gitignore` 已收的临时日志） | 不适用（不是源码） |

夹具里的同名局部量按所指处置，不按名字：`thincoder-desktop/test/work-mode-main.test.mjs` 的 `const minimal = setFlags("1", { mode: "minimal" })` 指**旧值输入**，归宿「保留」；`test/integration/minimal-mode.test.mjs` 的 `const minimal = endpoint.requests.at(-1).body` 指档位本身，随档改名。清单已把两处分别标定。

跑法 = 内置 `grep` 工具。`git grep` 不作读数尺：本次实测它经 PowerShell 输出把非 ASCII 解坏，且同一命令加 `-c` 与加 `-n` 的数不一致（322 对 268），两个数之间无法比较。

**保留面与改动面的分界**：清单里每一处「保留」都落在上面三类之一，逐条已在上表点名；旧值面因此不是「还剩几处没改」，而是「哪几处按设计就该留」。

- ① 推理强度面：`bench/lib/params.mjs` 的 `EFFORT_VALUES` · `thincoder-core/model-specs.mjs` 的 `reasoningEffortEnum` · `thincoder-core/auto-think.mjs` 的档位阶梯。
- ② 旧值归一落点：`thincoder-core/config-migrate.mjs` 的 `normalizeWorkMode` 一处，加 CONFIG §6 点名的五处就地映射（各一句），再加经核归一的 `thincoder-desktop/src/main/session-flags.mjs` ∥ `thincoder-vscode/src/extension/panel-session-write.mjs` 两面。
- ③ 旧槽与旧值**输入**：各端测试档里的 `mode: "minimal"` 夹具，以及断言「旧值读成 tiny」的用例输入。

**旧别名必须留在这份命中里。** `minimal` 是读兼容的输入值，它出现在归一落点与夹具是本批的设计结果，不是没改完。把别名写成 `"mini" + "mal"` 一类拼串让 grep 转绿，等于让判据去写它要判的记录——本批禁止这种形态，评审也按此判。同理 A12 的清单不是把残留合法化，而是逐处点名：清单内每一处要么属另一个值域，要么是归一的输入端，要么是夹具的输入值。

**失败侧。** 清单本身就是改前的读数：标「改」的每一处今天在盘上都还是旧称谓（上面已逐处列出），实施后按同一扫描复跑，这些处必须只剩 `tiny`；标「保留」的每一处应原样在场。

判据两个方向都能红：标「改」的处复跑后仍带旧称谓 ⇒ 红；标「保留」的处复跑后不见了 ⇒ 红（读兼容被删掉，老槽打开即静默回落 `normal`，正是本批要防的那件事）。

**清单不是把残留合法化**，而是逐处点名：每一处命中要么属于另一个值域，要么是归一的输入端，要么是夹具的输入值，三种之外没有第四种归宿。

### 集成增量（对照 `test/RTM.md`）

- **改写**（用例文字与用例文件路径跟改，断言不变）：`CLI 50-1` · `CLI 50-2` · `CLI 50-3` · `CLI 50-4` · `CLI 52-1` · `ends 12-2` · `ends 2-1`。
- **节级改字不属用例改写**：`test/rtm/ends.md` 的 `VSC 9` 节「目的」行含旧字，随本批改字面；该节 `9-1` ∥ `9-2` 两行的做法、判据与证据都不变，故不入上一条。
- **删除**：无。
- **新增**：无。

判据不变的理由 = 本批只换枚举字面与用例文件路径，没有一条断言的对象变了；`CLI 50-1` 里的「minimal 不自动注入」改成「tiny 不自动注入」是同一段行为。

### 关键决策

1. **归一时机 = 读时归一，读取路径不写盘。** 理由 = 读取路径写盘把一次「打开会话」变成一次磁盘写，并在多实例下造出一处谁先写的竞争；而归一是纯比较、无副作用、不累积成本。落点 = CONFIG §5.4。
2. **中文文案保持「极简」，不随英文另造新词。** 理由 = 用户否的是英文枚举名 `minimal`；另造中文名会让同一档在两份档里有两个词。需求档同轮已按此落。
3. **i18n 键与英文值随档名同轮改；`toolbar.modeTiny` 的值与 `reasoning.minimal` 不动。** 理由 = 键名与用户看见的词是同一件事的两半，只改键等于界面照旧显示旧名；档位按钮的 `MIN` 是排版上的宽度缩写（与 `NORMAL` ∥ `ENG` 同排），随排版而不随档名；推理强度是另一个值域，改它会把发给 provider 的 effort 改坏。
4. **测试档改名而不是留原名。** 理由 = 一物一词；留旧名等于仓里两份名字指同一档，下一个人会去找 `minimal` 对应的实现。
5. **归一只在核内实现一处，非核读面各自一句映射。** 理由 = 那五面现行各自定义模式字面、不 import 核；为省五个字面而加一条跨包依赖，代价落在打包面，收益不抵。另两面本就 import 核（`thincoder-desktop/src/main/session-flags.mjs` ∥ `thincoder-vscode/src/extension/panel-session-write.mjs`），直接调核的归一点，不另写一份。
6. **VSC 档位选项表只换值、不加 `minimal` 分支。** 理由 = 该面的输入已由核归一：`thincoder-vscode/src/extension/settings.mjs` 的 `loadAgentSettings` 以 `mode: resolveWorkMode(a)` 产出 `defaultMode`，`minimal` 到不了它；为一个走不到的输入加映射，等于给不存在的数据流写代码。桌面同名选项表按同一句处理——上游输出旧字面时，归一点仍在读取口。

### 上抛项

§1「第 4 轮评审裁决」#1 已把 `toolbar.modeMinimal` 的口径定为主线：只改键名、值保持 `MIN`（`MIN` 与 `NORMAL` ∥ `ENG` 同排，是排版宽度缩写）。§2 的「四、称谓与显示」与「五、i18n 键与英文值」按该口径落，无待裁项。

其余无冲突：需求面已由主 agent 同轮改完，`#2411` 与本批无交叉。

### Leads（不进本批，交主 agent 处置）

- `thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics(text, { tiny = false } = {})` 带参数缺省：漏传的调用方静默取完整档，错处要到文本明显变长才显形。本批只把选项名改成 `tiny`；缺省的去留不属命名面，按 §1 口径不在本批（去掉 = 两个调用点显式传值、漏传即在边界报错），交主 agent 决定记不记一行。
- `test/integration/vsc-work-mode.test.mjs` 的两条用例标题不带 RTM 编号（RTM 里是 `VSC 9-1` ∥ `9-2`），标题形与 `CLI 50-1` 一类不同。本批不动标题（用例编号不变，标题不在改动面），交主 agent 决定是否另记。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 本轮结论（独立设计评审）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 「A11 的量法」期望改后 `grep '"minimal"'` 只余 `bench/lib/params.mjs` · `model-specs.mjs` · `auto-think.mjs` 三处，与 §2 机制设计 §二「老槽打开后 `resolveWorkMode` 返回 `tiny`」及 A2 相互矛盾：旧值归一必须让该字面在场才成立（`thincoder-core/config-migrate.mjs` 的 `WORK_MODES`、`thincoder-desktop/src/main/session-flags.mjs` 的 `MODES` 等读面 + 本批单测里的旧槽夹具），判据只能靠把别名写成 grep 命不中的形态才转绿 |
| 2 | 🟡 | 未处置 | §2 全段无「最近先例」行；F2-6 验收要求能指出最近先例、采用点与不采用的原因 |
| 3 | 🟡 | 未处置 | §2 无勘察证据行（查了哪些公开源档 · 有无相关）；该信息只在 §1「库内 = 已查」∥「库外 = B 类」 |
| 4 | 🟡 | 未处置 | A1–A3 判者列只写「批内单测」，未点名 `docs/batches/2026-11-14-tiny-mode-rename.test.mjs` 与 `node --test` 命令 |
| 5 | 🟡 | 未处置 | §2 机制设计 §三 的六个非核读面无验收判据；`thincoder-server/test/work-mode.test.mjs` 现断言 `workModeOf({ mode: "minimal", engineering: true })` 为 `"minimal"`，改名后该面应为 `tiny` |
| 6 | 🟡 | 未处置 | `docs/core/design/CONFIG.md` §6 把自带 `WORK_MODES` 字面而不 import 核的面写成「浏览器与渲染 bundle、服务端盒内 shell」，漏掉 §2 六面中的 `thincoder-desktop/src/main/session-flags.mjs` 与 `thincoder-server/src/agent/member-routes.mjs` |
| 7 | 🟡 | 未处置 | `docs/core/requirements/CONFIG.md` 无旧值 `minimal` 读兼容条目；验收对照 A2 ∥ A3 的「需求锚」列指向设计档 §5.4 ∥ SESSION §8，行为没有需求锚 |

档位旁证（抽样复量，量法 `countContentLines`）：

- `thincoder-core/tools/shared.mjs` 497 · `thincoder-server/src/agent/member-routes.mjs` 488
- `thincoder-server/public/views-me-chat-composer.mjs` 476 · `thincoder-desktop/renderer/i18n-views.mjs` 440
- `thincoder-core/session-slot-write.mjs` 292 · `thincoder-core/config-migrate.mjs` 191
- 结论：读数与机读清单逐档吻合，无一档越设计时线 500，档位结论行成立。

VERDICT: changes-required

计数：🔴 1 · 🟡 6 · 🔵 0

### 轮次 2（评审子代理）

### 本轮结论（第 2 轮 · 复核轮 1 的 7 项）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2「A11 的量法」① `grep -rn 'MODES = ' --include=*.mjs` 称「每处取值恰为 `["tiny", "normal", "engineering"]`（核一处 + CONFIG §6 点的六处自带数组）」；该命令在仓根实测命中 10 处，其中 `thincoder-server/src/ops/config.mjs` 的 `UPDATE_MODES = Object.freeze([false, "notify", "auto"])` 与 `thincoder-server/src/project/git-sources.mjs` 的 `SYNC_MODES = Object.freeze(["poll", "event"])` 永不取三档值，且 `test/integration/acp-work-mode.test.mjs` 的 `const WORK_MODES` 不在「核一处 + 六处」之内；失败侧「命中七处数组全为 `["minimal", ...]`」亦与实测（8 处工作模式数组 · 10 处总命中）不符 ⇒ 按字面不可满足，只能靠收窄命令或放宽结论才转绿 |
| 2 | 🟡 | 未处置 | §2 机制设计 一「`WORK_MODES` … 仍是唯一值域来源」与树相左：`thincoder-core/session-slot-write.mjs` 自带 `if (!["minimal", "normal", "engineering"].includes(value)) return false`，`thincoder-desktop/renderer/views/settings-agent.mjs` 自带两处 `["minimal", "normal", "engineering"]`；A11 的「六处自带模式数组」未含这两面 |
| 3 | 🟡 | 未处置 | A11 三条命令无一命中驼峰 `Minimal`：`handleMinimalCommand`（`test/integration/minimal-mode.test.mjs` 与 `test/integration/tool-description-tiers.test.mjs` 均 import 它）既不在 `/minimal`∥`MINIMAL` 面，也不在 `modeMinimal`∥`slash.desc.minimal` 面，更不在 `"minimal"` 面 ⇒ 与 §2「本批条目」的「全部称谓」不齐 |
| 4 | 🟡 | 未处置 | §2「受影响文件与测试覆盖」称「`test/RTM.md` 的 CLI 50 行」跟改字面，但该行逐字为「三档模式切换、极简提示词与知识查询」，不含 `minimal` 也不含用例档路径；同句的 `tooling.md`「CLI 50 节注与三行」∥「CLI 52 行」与 `ends.md` 的「12-2 ∥ 2-1 与节注」逐条核对为实 |
| 5 | 🔵 | 未处置 | A2 的需求锚引文带省略号「旧值 `minimal` … 恢复为 `tiny`」，需求档原行为「旧值 `minimal` 在配置文件与会话槽里都恢复为 `tiny`；写入面拒绝 `minimal`」⇒ 该引文逐字检索不到 |

轮 1 七项复核（逐项）：

- 第 1 项：已按 A11/A12 拆分并补「旧别名必须留在这份命中里」∥「失败侧」，方向成立；但 ① 的取值面与计数不成立（见 #1）。
- 第 2、3 项：最近先例三问 ∥ 勘察证据已落 §2。
- 第 4 项：A1–A3 已点名 `docs/batches/2026-11-14-tiny-mode-rename.test.mjs` 与 `node --test` 命令。
- 第 5 项：已补 A13，且 `thincoder-server/test/work-mode.test.mjs` 的 `workModeOf({ mode: "minimal", engineering: true })` 断言在盘上为实。
- 第 6 项：CONFIG §6 六面已含 `session-flags.mjs` ∥ `member-routes.mjs`，与 §2 机制设计 三的六面成员一致。
- 第 7 项：需求 `docs/core/requirements/CONFIG.md` §6 验收已有旧值条（见 #5）。

档位旁证（本轮抽样复量）：

- `thincoder-core/tools/shared.mjs` 末内容行 497（表列 497）· `thincoder-server/src/agent/member-routes.mjs` 末行 488（表列 488）。
- 两档与机读清单吻合，无一档越设计时线 500，「无拆分方案」结论成立。
- 函数档位未做机械读数（本批不改函数体，mjs 无 LSP 可用）。

VERDICT: changes-required

计数：🔴 1 · 🟡 3 · 🔵 1

### 轮次 3（评审子代理）

### 本轮结论（第 3 轮 · 复核第 2 轮 5 项）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2「A11 的量法」① `grep -rn 'WORK_MODES = '` ⇒ 命中恰为 6 档：核 `thincoder-core/config-migrate.mjs` + `thincoder-desktop/renderer/events-flags.mjs` ∥ `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs` ∥ `thincoder-server/public/views-me-chat-composer.mjs` ∥ `thincoder-server/src/agent/member-routes.mjs` + 夹具 `test/integration/acp-work-mode.test.mjs`（本轮实跑逐档相符）；② `grep -rn 'const MODES = '` ⇒ 恰为 2 档 = `thincoder-desktop/src/main/session-flags.mjs` ∥ `thincoder-render-core/composer/controls.mjs`。`UPDATE_MODES` / `SYNC_MODES` 已出判域，失败侧改由同两条命令读数 |
| 2 | 🟡 | 已修 | 机制设计 一 改为「同值字面在树里共九处……核一处 + 六处非核读面（§三）+ 两处内联数组」，不再称「唯一值域来源」；A11 ③ 收 `thincoder-core/session-slot-write.mjs` 的槽写入校验 ∥ `thincoder-desktop/renderer/views/settings-agent.mjs` 的选项表 |
| 3 | 🟡 | 已修 | A11 ④ 模式含 `handleMinimalCommand` ∥ `minimalBanner` ∥ `"/minimal"` ∥ `modeMinimal` ∥ `slash\.desc\.minimal` ⇒ 0；四个驼峰/命令面在盘上均有命中（`thincoder-cli/src/tui/cmd-eng.mjs` ∥ `status-line.mjs` ∥ 三组 i18n 键），判据与「全部称谓」对齐 |
| 4 | 🟡 | 已修 | RTM 那句已删 `test/RTM.md`，只余 `test/rtm/tooling.md` 的 CLI 50 节注与三行 · CLI 52 行、`test/rtm/ends.md` 的 12-2 ∥ 2-1 与节注（后三处第 2 轮已逐条核为实，本轮未改） |
| 5 | 🔵 | 已修 | A2 需求锚改为逐字引文；`docs/core/requirements/CONFIG.md` §6 验收原行即「旧值 `minimal` 在配置文件与会话槽里都恢复为 `tiny`；写入面拒绝 `minimal`。」，逐字可检索 |
| 6 | 🔴 | 新出 · 未处置 | 端侧有一面同时落在受影响文件表与 A11 五条命令之外：`thincoder-vscode/webview/settings-agent.js` 持 `const defaultMode = ["minimal", "normal", "engineering"].includes(as.defaultMode) ? as.defaultMode : "normal"` 与 `<select id="ag-mode">` 的同一三值数组（并据值派生 `settings.agent.mode…` 键名）；`thincoder-vscode/webview/settings.js` 以 `import { agentCardHtml, … } from "./settings-agent.js"` 挂载它 ⇒ 面是活的。§2 机读清单无一档 `.js`，A11 五条命令全为 `--include=*.mjs` ⇒ 该面既不在改动面也不在判域 |
| 7 | 🔵 | 新出 · 未处置 | 机制设计 一「同值字面在树里共九处」与 A11 ① 自报的 6 档不齐：① 的 6 档里含夹具 `test/integration/acp-work-mode.test.mjs`，而「九处」的枚举（核一处 + 六处非核读面 + 两处内联数组）不含它 ⇒ 同段两处读数是十档 ∥ 九处 |

第 2 轮 5 项复核结论 = 5 项全修、逐条实读成立；未留「无理由不改」项。

新出第 6 项的后果（照 A2 ∥ 需求 §6 的「写入面拒绝 `minimal`」推）：改后 VSC 设置 Agent 卡仍只提供 `minimal/normal/engineering`，用户选「极简」发出的是被写面拒绝的旧值；而 §2 五 把 `settings.agent.modeMinimal` 改成 `modeTiny` 后，该文件据 `minimal` 派生的键名也不再存在。属实现面漏档，不是措辞问题。

第 7 项只是计数口径，不改判据本身（① / ② 的命中集逐档正确）。

本轮未加置 §3 状态行：其唯一合法值为「评审通过」，与本轮 verdict 相反。

VERDICT: changes-required

计数：🔴 1 · 🟡 0 · 🔵 1

### 轮次 4（评审子代理）

### 本轮结论（第 4 轮 · 复核第 3 轮 2 项 + 新判 4 项）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 新出 · 未处置 | §2 四「英文枚举值与英文界面文案 = `tiny`」把界面文案判进判域，§2 五只改键名 ⇒ 键改名后 A11 ④ 与 A12 全为 0，而用户可见标签仍显示旧名；A10 又要求 ACP 显示名派生为 `Tiny`，同一档两端显示不同名 |
| 2 | 🟡 | 新出 · 未处置 | §2 的 RTM 落点写「CLI 50 节注」∥「12-2 ∥ 2-1 与节注」，实测两处 `minimal` 落在「目的」行（CLI 50 · VSC 9），两条节注行都不含该字 ⇒ 落点指向无字可改的行；VSC 9 全节不在改动面，A9 判者列写的是用例档名 |
| 3 | 🟡 | 新出 · 未处置 | 机读清单 `thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs` 记 278 且自述「node 行扫」；该档末内容行 304，量法不是 CODE-TIER §7 的唯一量法（另抽样三档相符，结论行不变） |
| 4 | 🟡 | 新出 · 未处置 | `thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics(text, { minimal = false } = {})` 参数名仍是这一档的第二个名字，该档已在机读清单；A11 六条命令与 A12 都命不中裸标识符；§2 Leads 只交「去不去掉缺省」，未裁参数名 |

**#1 逐处证据**（键改名后仍显示旧名的面）：

- `thincoder-desktop/renderer/i18n-settings.mjs` 的 `"settings.agent.modeMinimal": "Minimal"`；中文同名键值为「极简」（按决策 2 不动）。
- `thincoder-vscode/locales/en.json` 同键同值 `"Minimal"`。
- `thincoder-desktop/renderer/i18n-views.mjs` 的 `slash.desc.minimal` 值为「toggle minimal ↔ normal work mode」。
- `thincoder-server/public/i18n-en-core.mjs` 的同一键、同一值。
- `thincoder-cli/src/tui/slash-commands.mjs` 的 `/minimal` 行内联 `desc: "toggle minimal ↔ normal work mode"`（④ 只命中同行的 `"/minimal"`）。
- 标签取词处 = `thincoder-desktop/renderer/views/settings-agent.mjs` 的 `modeOptions`：`t("settings.agent.mode" + 首字母大写)`，故词表值就是用户看见的字。
- 六条探针的形状（引号三值数组 / `WORK_MODES` / `const MODES` / `modeMinimal`∥`slash\.desc\.minimal` / 状态栏 `MINIMAL` / `value="minimal"`）与 A12 的 `grep '"minimal"'` 逐条都对不上「Minimal」与句内「minimal」。
- `toolbar.modeMinimal` 值「MIN」同类未裁（§2 四只裁了状态栏横幅 = `TINY`）。

**#2 逐处证据**：`test/rtm/tooling.md` 的「## CLI 50」节「> 目的：…minimal 收窄自动注入…」；`test/rtm/ends.md` 的「## VSC 9」节「> 目的：MODE 的 minimal/normal/engineering 三选项…」；两节的「> 节注：」行均不含 `minimal`。`test/RTM.md` 的 VSC 9 故事（「三档模式从控件落到会话，重开后仍一致」）在 §2 集成增量里也无对应行。

**#3 旁证**：`thincoder-core/tools/shared.mjs` 末内容行 497（表列 497）· `thincoder-server/src/agent/member-routes.mjs` 488（表列 488）· `thincoder-vscode/webview/settings-agent.js` 210（表列 210）⇒ 「无一档越设计时线 500」成立，仅该测试档读数与量法需重取。

**第 3 轮 2 项复核**：🔴 #6 已修（`thincoder-vscode/webview/settings-agent.js` 进机读清单（210）与受影响表，A11 ③ 收该档两处三值数组，CONFIG 设计 §6 新增「新会话默认档的选项表」三条并点名该档）；🔵 #7 已修（机制设计 一 改为「十二档」，枚举 = 核一处 + 非核六处 + 内联三处 + HTML 一处 + 夹具一处，与 ① 的 6 档自报对齐）。未留「无理由不改」项。

**已核成立、不进结论的**：设计档与本批无施工账（F2-4 成立）；`docs/core/design/CONFIG.md` §6 的六处非核读面与 §2 机制设计 三 成员逐字一致；需求 `docs/core/requirements/CONFIG.md` §6 已有旧值读兼容与验收两行；本批 13 份设计档的 `minimal` 命中全为旧值/旧别名表述（无「现行值 = minimal」的残留）；`doc_check report` 对 13 档判 PASS。

VERDICT: changes-required

计数：🔴 1 · 🟡 3 · 🔵 0

### 轮次 5（评审子代理）

### 本轮结论（复核第 3 轮 7 项 · 逐项实读）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2 的「A11 的量法」已由「验收面 = 一次扫描生成的闭合清单」取代，旧命令对不复存在。本轮实跑复核两条数组命令：`WORK_MODES = ` = `thincoder-core/config-migrate.mjs` + `thincoder-desktop/renderer/events-flags.mjs` ∥ `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs` ∥ `thincoder-server/public/views-me-chat-composer.mjs` ∥ `thincoder-server/src/agent/member-routes.mjs` + 夹具 `test/integration/acp-work-mode.test.mjs`；`const MODES = ` = `thincoder-desktop/src/main/session-flags.mjs` ∥ `thincoder-render-core/composer/controls.mjs`。与「非核读面六处」逐档相符；`UPDATE_MODES` ∥ `SYNC_MODES` 不在判域 |
| 2 | 🟡 | 已修 | 机制设计 一 现行口径「设计约束不是「只有一处字面」，而是「同值字面同改」」；内联三值数组三处（槽写入校验 · 桌面 `views/settings-agent.mjs` 选项表 · VSC `webview/settings-agent.js`）逐处在闭合清单标「改」 |
| 3 | 🟡 | 已修 | 判域改成全仓 `minimal` 扫描（不区分大小写、不限扩展名），驼峰标识符由扫描立案：`cmd-eng.mjs` 行的 `export async function handleMinimalCommand` 在列、归宿「改」 |
| 4 | 🟡 | 已修 | RTM 落点只余 `test/rtm/tooling.md`（CLI 50「目的」行 · 50-1 · 50-2 ∥ 50-3 · 52-1）与 `test/rtm/ends.md`（VSC 9「目的」行 · 12-2 · 2-1），并写明「两节的「节注」行都不含该字」；旧句里的 `test/RTM.md` 行已不在 |
| 5 | 🔵 | 已修 | A2 需求锚为逐字引文「旧值 `minimal` 在配置文件与会话槽里都恢复为 `tiny`；写入面拒绝 `minimal`」，逐字可检索 |
| 6 | 🔴 | 已修 | 机读清单新行「thincoder-vscode/webview/settings-agent.js | — | 210」；「补入三面」段点名该档两处三值数组与 `settings.agent.mode…` 键派生；闭合清单 VSC 段该档归宿「改」；A11 判域已改为全扩展名扫描，`.js` 不再落在 `--include=*.mjs` 之外 |
| 7 | 🔵 | 已修 | 机制设计 一 改为「同值字面在树里共十二档」，枚举 = 核一处 + 非核读面六处 + 内联三值数组三处 + HTML 选项表一处 + 测试夹具一处，并注明夹具计入哪一类，与 ① 自报命中集对齐 |

复核结论：第 3 轮 7 项逐条实读成立，未留「无理由不改」项；无遗留 🔴。

本轮未置 §3 状态行：其唯一合法值为「评审通过」，由工具侧写入。

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0

### 轮次 6（评审子代理）

> 状态行重置：第 6 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-14

### 本轮结论（实施面评审 · 首轮全范围）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 本批 §2 机读清单内的用例面未落（改名未发生、断言与 import 仍指旧名）：`test/integration/minimal-mode.test.mjs` 的 `import { handleMinimalCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"` 指向已不存在的导出（`cmd-eng.mjs` 现仅 `handleTinyCommand`）；`thincoder-server/test/work-mode.test.mjs` 断言 `workModeOf({ mode: "minimal", engineering: true })` 为 `"minimal"`，实现已归一为 `tiny`；`thincoder-desktop/test/work-mode-renderer.test.mjs` 命令表仍列 `/minimal`。⇒ A11「标改的处实施后不再有旧称谓」、A13 判者命令、仓级 `npm test` 均红 |
| 2 | 🔴 | 未处置 | `test/rtm/tooling.md` 的 CLI 50-1 ∥ 50-2 ∥ 50-3 证据列已改成 `test/integration/tiny-mode.test.mjs`，该档不在盘（盘上只有 `test/integration/minimal-mode.test.mjs`）⇒ RTM 悬空指针；§5 以 doc_check 的「计划档」口子为据，是检查器豁免换来的绿，不是引用正确 |
| 3 | 🟡 | 未处置 | `docs/core/design/CONFIG.md` §6「以下六处现行各自定义模式字面、不 import 核，故各面就地实现同一句映射」与实况不符：`thincoder-desktop/src/main/session-flags.mjs` 的 `import { loadConfig, resolveSessionWorkMode, setConfigWorkMode } from "@thincoder/core/config.mjs"` 表明它 import 核且无本地映射（§2 机制设计三同句）⇒ 行为成立、形式陈述失真 |
| 4 | 🔵 | 未处置 | `thincoder-cli/src/tui/status-line.mjs` 的 TINY 横幅读 `agent.config?.agent?.mode === "tiny"`，未走 `resolveWorkMode` ⇒ 盘上旧值配置在首次 run 归一前不显横幅（改前会显 MINIMAL） |
| 5 | 🔵 | 未处置 | `thincoder-core/session-slot-write.mjs` 同档两处值域判定：`newSlotData` 用 `WORK_MODES`，`setSlotMode` 用内联三值数组 |
| 6 | 🔵 | 未处置 | `thincoder-core/config-migrate.mjs` 的 `resolveSessionWorkMode` 对 `normalizeMode` 连调两次 |

已核成立（不进结论）：核 ∥ CLI ∥ 桌面 ∥ render-core ∥ server ∥ VSC 的实现面字面与设计逐条相符；`reasoning.minimal` 与 `MIN` 两个保留面原样在场；写入面（`setSlotMode` ∥ `settingsTool` ∥ `patchFailure` ∥ `setConfigWorkMode` ∥ ACP `workMode`）一律拒旧值；`docs/batches/2026-11-14-tiny-mode-rename.test.mjs` 的 import 面全部可解析。

VERDICT: changes-required

计数：🔴 2 · 🟡 1 · 🔵 3

### 轮次 7（评审子代理）

### 本轮结论（第 7 轮 · 复核第 6 轮 findings 的修复）

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴 | 已修 | 用例面已落：`test/integration/tiny-mode.test.mjs` 在盘（旧档 `minimal-mode.test.mjs` 已不在盘），首部 `import { handleTinyCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"` 与实现导出一致；`thincoder-server/test/work-mode.test.mjs` 的 `assert.equal(workModeOf({ mode: "minimal", engineering: true }), "tiny", …)`；`thincoder-desktop/test/work-mode-renderer.test.mjs` 命令表 `["/model", "/auto", "/plan", "/eng", "/tiny", "/normal", "/help"]`。全仓扫描 `handleMinimalCommand`∥`modeMinimal`∥`slash.desc.minimal`∥`minimal-mode` 仅剩 `docs/batches/*.md`（过程档）与 CONFIG §6 的键映射句（保留类） |
| 2 | 2 | 🔴 | 已修 | `test/rtm/tooling.md` 的 CLI 50-1 ∥ 50-2 ∥ 50-3 与 52-1、`test/rtm/ends.md` 的 12-2 ∥ 2-1 证据列所指用例档均在盘（`tiny-mode` ∥ `acp-work-mode` ∥ `desktop-work-mode` ∥ `server-work-mode`）⇒ 悬空指针消失 |
| 3 | 3 | 🟡 | 接受（有据不改） | §5「落地核对」逐字记录了 CONFIG §6「以下六处现行各自定义模式字面、不 import 核」与 `thincoder-desktop/src/main/session-flags.mjs` 实况（该档 `import … resolveSessionWorkMode … from "@thincoder/core/config.mjs"`、无本地读口）不符，并注明处置属设计席笔。行为成立、非实施缺陷，理由成立 ⇒ 关闭；余下仅设计档该句待改 |
| 4 | 4 | 🔵 | 已修 | `thincoder-cli/src/tui/status-line.mjs` 的 `const tinyBanner = resolveWorkMode(agent.config?.agent) === "tiny" ? …`（横幅与 `bannerPrefix` 两处同走归一） |
| 5 | 6 | 🔵 | 已修 | `thincoder-core/config-migrate.mjs` 的 `resolveSessionWorkMode` 已提局部量：`const mode = normalizeWorkMode(data.mode)` + `if (WORK_MODES.includes(mode)) return mode` |
| 6 | 5 | — | 声明排除 | 按本轮 review-object 声明：`session-slot-write.mjs` 档内内联三值数组是 §2「机制设计 一」明列的「改」行，换 import 会令闭合清单少一行，属改设计 ⇒ 不判 |
| 7 | (new) | 🔵 | 新（档卫生） | 批次档 §5「残面」仍写着「文件改名 `tiny-mode.test.mjs` 未发生」并列出六档旧称谓，与盘上实况（改名已落、六档断言已改 `tiny`）相反 —— 记录为历史快照、不阻断收口，收口时顺带改这句即可 |

新增 🔴：0。用例面与实现面未见修复引入的新缺陷（`cmd-eng.mjs` 三导出 `handleEngCommand` ∥ `handleTinyCommand` ∥ `handleNormalCommand`、`session-slot-write.mjs` 的 `newSlotData` ∥ `saveSlotData` ∥ `setSlotMode` 均与用例 import 面相符）。

VERDICT: pass

计数：🔴 0 · 🟡 0（1 项有据关闭） · 🔵 1

## §4 用户批准（主 agent）

### 批准记录

- **授权形式 = 整批自动推进**。用户原话：「**都自动跑完吧，可以按顺序跑。**」——该句覆盖本批从设计评审到实施收口的整条链，故本批未逐步回头确认。
- **口径来源（用户逐步给定，均属本批范围）**：
  - 名字选定：用户先提议 `tiny`，并在我列出 `tiny` ∥ `lean` ∥ `slim` 后确认取 **`tiny`**。
  - 迁移边界：用户要求「单独开批，可能等当前批做完以后再开始」——本批即在 `#2407` 收口后开工。
  - 读兼容要求：由主 agent 依据 `resolveWorkMode` 的「不在枚举内即回落 `normal`」实读提出，用户授权范围内采纳并落为 A2 ∥ A3。
- **实施中两处需裁、由主 agent 在授权内裁定并在 §1 留痕**：
  - `toolbar.modeTiny` 的英文值留 `MIN`（与 `NORMAL` ∥ `ENG` 同排的宽度缩写），只改键名——依据是 `thincoder-server/test/work-mode.test.mjs` 断言 `["MIN","NORMAL","ENG"]`。
  - 用例面 10 档由实施席同轮改完（改名是原子改动，只改产品面会把仓库测试留在红态）。
- **未由用户逐条过目的部分**：设计第 1–5 轮的具体发现与处置由评审与主 agent 完成；用户授权的是「跑完」，不是「逐条确认」。此处如实记明，免日后把自动推进读成逐条批准。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 本席交付面

本席 = 实施席（eng-coder）。交付面 = 本席机读清单 32 档 + 3 档越界披露（见下「越界披露」）。用例档（`test/integration/*-work-mode*.test.mjs`、`thincoder-{desktop,server,vscode}/test/work-mode*.test.mjs`、`test/integration/minimal-mode.test.mjs` 改名）不在本席清单内，本席未动，见「残面（交父侧路由）」。

### 改了什么

- **核**：`config-migrate.mjs` 的 `WORK_MODES` = `tiny`/`normal`/`engineering`，新增 `LEGACY_MODE_ALIASES`（`{ minimal: "tiny" }`）与 `normalizeMode`，由 `resolveWorkMode` 与 `resolveSessionWorkMode` 调用（读取面归一，读取路径不写盘）；`session-slot-write.mjs` 的槽写入校验只认新值；`agent/setup.mjs` 的 `minimal` 局部量改 `tiny`；`prompt-overlays.mjs` ∥ `tools/shared.mjs` 的调用点改 `{ tiny: mode === "tiny" }`；`prompt-files.mjs` 的档位选项名 `minimal` → `tiny`（缺省 `= false` 按 §1 口径不动）；`config-defaults.mjs` 的值域行注改。
- **CLI**：`handleMinimalCommand` → `handleTinyCommand`、`/minimal` → `/tiny`、命令说明改 `toggle tiny ↔ normal work mode`、状态栏横幅 `MINIMAL` → `TINY`、`cmd-config.mjs` 档位选项文案与 `action` 改 `tiny`、`cmd-eng.mjs` 文件头注改。
- **桌面**：`events-flags.mjs` 三值数组改 + `modeOfFlags` 读取口归一；`src/main/session-flags.mjs` 写入校验数组改新值；`views/settings-agent.mjs` 选项表两处改；三份 i18n 键与英文值改（`toolbar.modeTiny` 值留 `MIN`、`settings.agent.modeTiny` 英文 `Tiny`、中文 `极简` 不动、`slash.desc.tiny` 英文句改）。
- **render-core**：`controls.mjs` 三值 `MODES` 改、`modeOf` 读取口归一、行注改。
- **Server**：`public/views-me-chat-composer.mjs` 三值数组 + `workModeOf` 归一 + `/tiny` 命令行；`src/agent/member-routes.mjs` 三值数组 + `sessionRowOf` 读面归一（新增 `workModeFromFlags`）；`member-shell/core-run-util.mjs` 三值数组 + `workModeOf` 归一 + `mergeSlotControl` 恢复面归一；两份 i18n 键与英文句改。
- **VSC**：`webview/settings-agent.js` 两处三值数组改；`webview/index.html` 的 `#mode-select` 选项值改（文本 `MIN` 不动）；`locales/{en,zh}.json` 两键改名（英文值 `Tiny`、中文 `极简`）。
- **提示词 / 知识档**：`prompts/knowledge/tool-settings.md`、`prompts/discipline-engineering.md`、`knowledge/README.md`、`knowledge/prompt-resources.md` 的档名表述改。
- **RTM**：`test/rtm/tooling.md`（CLI 50 目的行 · 50-1 ∥ 50-2 ∥ 50-3 · 52-1）、`test/rtm/ends.md`（VSC 9 目的行 · 12-2 · 2-1）逐处改字面，用例档路径跟 `tiny-mode.test.mjs`。
- **本批单测**：`docs/batches/2026-11-14-tiny-mode-rename.test.mjs`（5 例，收口删除）。

### 交付对照（逐条验收点）

| # | 验收点 | 状态 | 落点 / 读数 |
|---|---|---|---|
| A1 | `WORK_MODES` 恰三档新值；settings 工具拒 `minimal` 并点名值域；写 `tiny` 落到 `config.agent.mode` | ✅ 完成 | 单测例 1：`deepEqual(WORK_MODES, ["tiny","normal","engineering"])` · 拒句匹配 `expects one of tiny, normal, engineering` 且点名 `"minimal"` · 盘上 `config.json` 的 `agent.mode` = `tiny` |
| A2 | `resolveWorkMode` ∥ `resolveSessionWorkMode` 旧值返回 `tiny`；`"bad"` 仍回落 `normal` | ✅ 完成 | 单测例 2（含旧布尔迁移两支、`setConfigWorkMode(config,"minimal")` 抛错） |
| A3 | 盘上旧槽恢复成 `tiny`；恢复不改槽 mtime | ✅ 完成 | 单测例 3（`applySession` 真恢复路径：mode = `tiny`、mtime 不变、盘上仍留 `minimal`） |
| A4 | `/tiny` 在 tiny↔normal 切换落槽；`/minimal` 不在命令表 | ✅ 完成（CLI 面） | 冒烟读数：命令表含 `/tiny`（`toggle tiny ↔ normal work mode`）、不含 `/minimal`；dispatch 表同。矩阵行为由集成 `CLI 50-1` 判（用例档在另席） |
| A5 | tiny 会话下一轮提示词不内联主题正文、不自动注入文档/记忆/大纲、项目规则保留 | ✅ 完成（核面） | `setup.mjs` 的 `tiny` 判点三处 + `expandKnowledgeTopics` 选项名改（单测例 5 证改名生效）；端到端由集成 `CLI 50-1`（另席） |
| A6 | MODE 三档取值；`/tiny` 与控件共用 `setMode`；状态行显示当前档 | ✅ 完成（桌面面） | 冒烟：`pageHistory` 旧槽 → `flags.mode = tiny`；`setFlags({mode:"tiny"})` → 槽 `tiny` + 一次 `ev:flags`；`status.banner.mode` 值为 `MODE:${mode}` 插值，随值显示 `tiny` |
| A7 | 控件与 slash 都发 `setMode`；三档词表中英齐全 | ✅ 完成 | 词表实测：`COMPOSER_DICT` ∥ `SETTINGS_DICT` ∥ `VIEWS_DICT` 的 en/zh 两节新键齐、旧键零残留、`reasoning.minimal` 保留 |
| A8 | `controls.mjs` 的 `MODES` 三档新值，循环与出站一致 | ✅ 完成 | 冒烟五行：`{mode:"minimal"}` → 控件值 `tiny`；`{mode:"bad"}` → `normal`；`{engineering:true}` → `engineering`；选项表 = `tiny,normal,engineering` |
| A9 | `setMode {value:"tiny"}` 写槽并推设置；非法值零写 | ✅ 完成（改动面） | VSC 设置卡两处三值数组与 `#index.html` 选项表改；用例 `VSC 9-1` ∥ `9-2` 判在另席用例档 |
| A10 | ACP `workMode` options 三项、显示名由值派生 | ✅ 无需改 | `thincoder-cli/src/acp/handlers-session.mjs` 以 `WORK_MODES.map(首字母大写)` 派生显示名，随枚举自动成 `Tiny`；该档本席未动 |
| A11 | 闭合清单三种归宿、无第四种 | ✅ 完成（本席面） | 复扫读数见下「闭合清单复扫」，本席文件只剩「保留」类命中 |
| A12 | 标「保留」处逐条可指、理由落三类 | ✅ 完成 | 保留处 = ① 旧值别名常量（`LEGACY_MODE_ALIASES` / `normalizeMode` 注释）×6 面 · ② `reasoning.minimal` 键与同面英文值 `Minimal`（桌面 ∥ server ∥ VSC） · ③ `bench` 的 `EFFORT_VALUES` ∥ README |
| A13 | 六处非核读面各自把旧值归一为 `tiny` | ✅ 行为完成 / ⚠️ 形式差一处 | 五面各有本地映射并有读数（见上）；`thincoder-desktop/src/main/session-flags.mjs` 的行为由核归一达成（`pageHistory(...).flags.mode` = `tiny` 实测），其本地三值数组只用于写入校验，无本地读口 —— 与 CONFIG §6 那句「六处……各面就地实现同一句映射」形式不符，见「落地核对」 |

### 闭合清单复扫（A11 / A12）

量法 = 内置 `grep` 工具（项目文本读数尺），模式 `minimal`，不区分大小写、不限扩展名，按包分次跑；排除 `node_modules` · `.git` · `dist*` · `.thincoder/tmp`。

- **`thincoder-core`**：本席 7 档零命中（只剩 `config-migrate.mjs` 的别名常量与注释 = 「保留」）。余 = `model-specs.mjs` ∥ `auto-think.mjs`（推理强度值域，保留）、`markdown.mjs` ∥ `prompts/**` 两处形容词（不适用）。`knowledge/` 两份档改后零命中。
- **`thincoder-cli`**：本席 4 档零命中。余 = `cmd-shell.mjs` ∥ `mouse.mjs` 的英文形容词（不适用）。
- **`thincoder-desktop`**（`**/*.{mjs,js,json,html,css,ts,md}`）：本席 8 档零命中（只剩 `events-flags.mjs` 别名 = 「保留」、`i18n-composer.mjs` 的 `reasoning.minimal` 两键 = 「保留」）。余 = `test/work-mode-*.test.mjs` 两档（另席）。
- **`thincoder-render-core`**：本席 1 档零命中（只剩别名 = 「保留」）。
- **`thincoder-server`**：本席 5 档零命中（别名同行注 = 「保留」；`reasoning.minimal` 两键 = 「保留」）。余 = `test/work-mode.test.mjs`（另席）、`test/mini-dom.mjs` 形容词（不适用）。
- **`thincoder-vscode`**：本席 4 档零命中（`reasoning.minimal` 两键 = 「保留」）。余 = `test/2026-11-13-vsc-work-mode.test.mjs`（另席）。
- **`test/`**：本席 2 档（RTM 两份）零命中。余 = `integration/{acp,desktop,minimal,server,tool-description-tiers,vsc}-*.test.mjs` 六档（另席）。
- **`bench`**：`lib/params.mjs` ∥ `README.md`（推理强度值域，保留）。

### 越界披露（机读清单外改的档，逐条给理由）

| 档 | 为什么越界改 |
|---|---|
| `thincoder-desktop/renderer/slash-commands.mjs` | 它是本席改过的写面 `src/main/session-flags.mjs` 的**调用点**：`setMode(currentMode() === "minimal" ? "normal" : "minimal")` 在新写面下会被拒（`invalid-patch`）。改签名就得改调用点，留着即半成品；改为 `/tiny` + `setMode("tiny")`。 |
| `thincoder-core/knowledge/README.md` · `thincoder-core/knowledge/prompt-resources.md` | §2 机读清单在列、标「改」，但未进本席机读清单；两处是同一档名的英文表述（`tiny prompts omit…`），不改则把旧名教给下一个读者。纯字面替换，目标态与本批口径一致。 |

### 验证读数（本席跑过的命令与结果）

- `node --test docs/batches/2026-11-14-tiny-mode-rename.test.mjs` → `# tests 5 / # pass 5 / # fail 0`。
- `node --test test/integration/context-overflow-guard.test.mjs`（回归：驱动 `prepareRun` 的档位判点）→ `# tests 10 / # pass 10 / # fail 0`。
- `node --check` × 26 档（本席改的全部 `.mjs`/`.js` + 本批单测）→ 全绿。
- 读面冒烟（真模块、`registerHooks` 把 `@thincoder/core/` ∥ `/rc/` 指回源树，未用物化副本）：桌面 `modeOfFlags({mode:"minimal"})` → `tiny`；`applyFlags` 拒 `{mode:"minimal"}`、收 `{mode:"tiny"}`；server `workModeOf` ∥ `flagsOf` ∥ `mergeSlotControl` ∥ `sessionRowOf` 旧值全 → `tiny`；render-core 控件五行；CLI 命令表。
- 桌面写面冒烟（`createSessionFlags` + 临时槽根）：`setFlags({mode:"minimal"})` → `{ok:false, reason:"invalid-patch"}`、槽零写、零推送；`setFlags({mode:"tiny"})` → `{ok:true, flags.mode:"tiny"}`、槽 `tiny`、一次 `ev:flags`。
- 词表核数：桌面三份 + server 两份 + VSC 两份，en/zh 各节新键齐、旧键零残留、`reasoning.minimal` 在。
- `doc_check(mode:"gate")` 于本席改的 6 份 `.md` → `DOC-CHECK GATE: PASS`。

### 落地核对（设计档 / 任务书里被落地改得不成立的那句）

- **`docs/core/design/CONFIG.md` §6（「各端归一」条）**，原句逐字：「以下六处现行各自定义模式字面、不 import 核，故各面就地实现同一句映射，语义以 §5.4 为源、互不 import：`thincoder-desktop/renderer/events-flags.mjs` · `thincoder-desktop/src/main/session-flags.mjs` · `thincoder-render-core/composer/controls.mjs` · `thincoder-server/public/views-me-chat-composer.mjs` · `thincoder-server/src/agent/member-routes.mjs` · `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`。」—— 其中 `thincoder-desktop/src/main/session-flags.mjs` 本就 import 核（`resolveSessionWorkMode`），落地后它仍无本地映射：该面读槽 mode 走核，本地 `MODES` 只用于写入校验。行为（旧槽读成 `tiny`）成立，形式与该句不符。处置不属本席（设计档 = 设计席笔）：或改该句为「五处就地映射 + 该面经核归一，本地数组只作写入校验」。
- **`docs/batches/2026-11-14-tiny-mode-rename.md` §2 三**，同句同义（逐字：「这些面现行各自定义模式字面（四处常量名为 `WORK_MODES`、两处为 `MODES`）、不 import 核，故就地实现、语义以 CONFIG §5.4 为源」）。
- 其余：CONFIG §5.4 的归一时机三问、写入面只产新值、i18n 键值映射、英文值口径、中文值不动、源码行注三处 —— 落地后逐句成立（设计档本席未改一字）。

### 残面（不在本席清单，交父侧路由；本席核对时仍在盘上）

本席核对时刻（2026-11-14）下列面仍带旧称谓，本席未动、不认作本席缺陷：

- `test/integration/acp-work-mode.test.mjs` · `desktop-work-mode.test.mjs` · `server-work-mode.test.mjs` · `tool-description-tiers.test.mjs` · `vsc-work-mode.test.mjs` · `minimal-mode.test.mjs`（文件改名 `tiny-mode.test.mjs` 未发生 —— 现 RTM 两档已指向 `tiny-mode.test.mjs`，该名在本批 §2 机读清单内，故 doc_check 不判为悬空指针）。
- `thincoder-desktop/test/work-mode-main.test.mjs` · `work-mode-renderer.test.mjs` · `thincoder-server/test/work-mode.test.mjs` · `thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs`。
- 语义提示（给接手用例档的一席）：按 §2「写入面只产新值」，`setFlags({ mode: "minimal" })` 现在返回 `{ok:false, reason:"invalid-patch"}`，`settingsAgent({patch:{"agent.mode":"minimal"}})` 与 `setSlotMode(...,"minimal")` 同理被拒；旧槽输入夹具的**断言**应改为 `tiny`，**输入**仍是 `minimal`。

### 内部偏差审计（1 轮）

- **explore 审计（read-only，本批 §2 为判据）**：1 轮，2 项。① YELLOW —— `thincoder-desktop/src/main/session-flags.mjs` 与 CONFIG §6「六处各面就地映射」形式不符（行为成立）⇒ 本席判定属设计档/任务书口径问题，落进上方「落地核对」，不改代码（那一面没有本地读口，加映射即写一个没人走的分支）。② BLUE —— §5 尚未落笔 ⇒ 本轮补齐。
- **终止态**：clean（本席面无可改偏差；余下 1 项为设计席笔的口径修正，已逐字入「落地核对」）。

### 修正轮（父侧裁决 2026-11-14 · 用例面归本席本轮落）

**裁决要点**：「这 10 档由你本轮落，一次收口……`files` 是调度与披露通道，不是授权边界。越出声明面不算违约，但必须如实披露……§2 机读清单由设计席补行，你不写 §2。」

**用例面（10 档，逐档处置 —— 旧值输入留字面、断言改新值）**：

| 档 | 改了什么 |
|---|---|
| `test/integration/minimal-mode.test.mjs` → `tiny-mode.test.mjs`（`git mv`） | 头注档名与跑法注释 · `handleTinyCommand` import 与调用 · `QUERY` 标记串改 `quixotictinymarker` · 两处临时目录前缀 `tiny-int-` · 6 处值断言改 `tiny`（`mode: tiny` 由 `setup-reminders.mjs` 的 `mode: ${mode}` 插值而来） |
| `test/integration/tool-description-tiers.test.mjs` | 头注 `/tiny` · `handleTinyCommand` import/调用 · `expandToolDescription(…, "tiny")` 两处 · `tinyBash` ∥ `tinyBody` ∥ `tinyRun` 局部量一族 · `{ mode: "tiny" }` 装配 |
| `test/integration/acp-work-mode.test.mjs` | `WORK_MODES` 夹具三档新值 · 头注两行 · `value: "tiny"` 请求两处 · `workModeOf` 断言五处 · 报错原文 `/workMode must be one of tiny\/normal\/engineering/` |
| `test/integration/desktop-work-mode.test.mjs` | `setMode { value: "tiny" }` 与 store ∥ 槽 ∥ pageHistory ∥ 事件四处断言 |
| `test/integration/server-work-mode.test.mjs` | 三档选项断言 → `tiny` |
| `test/integration/vsc-work-mode.test.mjs` | 三档选项断言两处 · `"tiny "` 非法探针 |
| `thincoder-desktop/test/work-mode-main.test.mjs` | 两条非法探针改新值 · `tiny` 写成功支断言四处 · 三档循环 · `settingsAgent` 三处；**旧值写面输入支重写**：`setFlags("1", { mode: "minimal" })` 留字面并断言 `{ok:false, reason:"invalid-patch"}` + 槽零写 —— 原支断言 `ok:true` 与「写入面只产新值」冲突，不能照抄；旧槽夹具 `saveSlot(4, { mode: "minimal", engineering: true })` 留字面，其断言改 `tiny` |
| `thincoder-desktop/test/work-mode-renderer.test.mjs` | 19 处：`slash.desc.tiny` 值原文 · 键清单三键改 `modeTiny` · 选项表与选中项 · 命令表 `/tiny` · 夹具与两处注释 |
| `thincoder-server/test/work-mode.test.mjs` | 24 处：三档选项 · 写回 · `WORK_MODES` · `/tiny` 命令面 · 两键（`toolbar.modeTiny` ∥ `slash.desc.tiny`）· 建会话与恢复 · 连续写序；**保留** `workModeOf({ mode: "minimal", engineering: true })` 与 `sessionRowOf(… flags: { mode: "minimal", engineering: true } )` 的**输入**，期望值改 `tiny`（A13 判者） |
| `thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs` | 25 处：选项表与逐档循环 · `"tiny "` 非法探针 · 推送与恢复 · 幂等 · 面板保存载荷；**保留** `saveSlot(3, { mode: "minimal", engineering: true })`，其断言改 `tiny` |

**用例面之外多出的两处（越界披露，均为落地必需）**：

| 档 | 为什么改 |
|---|---|
| `thincoder-core/config-migrate.mjs` | 旧值归一从档内私有 `normalizeMode` 提为**导出** `normalizeWorkMode`（`Object.hasOwn` 守原型，只换别名不判合法性）。理由 = 下面那档已经 import 核，取单源；不导出就得再抄一份别名表（本批刚判过「同一值域两处定义」）。 |
| `thincoder-vscode/src/extension/panel-session-write.mjs` | **实测打红挖出的真缺陷**：`saveLines` 用 `WORK_MODES.includes(slotMode)` 判槽上 mode 是否合法 —— 旧槽 `mode:"minimal"` 换名后不再合法，落槽时保留 `engineering` 布尔并把 `minimal` 原样写回（`2026-11-13-vsc-work-mode.test.mjs` 的「合法 mode 保存后旧布尔退役」一例红）。修 = 读口就地归一 `const slotMode = normalizeWorkMode(extra.mode !== undefined ? extra.mode : existing.mode)`。§2 的六面名单与关键决策 6 都没点到这一面。 |

**代码评审自修（两处 🔵 采纳）**：`thincoder-cli/src/tui/status-line.mjs` 的 TINY 横幅改读 `resolveWorkMode(agent.config?.agent)`（旧值配置在首次 run 前也显档）；`config-migrate.mjs` 的 `resolveSessionWorkMode` 归一只算一次。

**未采纳一处 🔵**：`session-slot-write.mjs` 的 `setSlotMode` 仍用内联三值数组 —— 该字面是 §2「机制设计 一」明列的「改」行，换 import 常量会让闭合清单少一行而清单未改，属改设计不属实施席自选；留作 lead。

**改后读数（本席实跑）**：

- `node --test docs/batches/2026-11-14-tiny-mode-rename.test.mjs` → `# pass 5 / # fail 0`（改后复跑）。
- `test/integration/tiny-mode.test.mjs` → `3/3`（A4 ∥ A5 判者）· `tool-description-tiers.test.mjs` → `2/2`（CLI 50-4 ∥ 50-5）· `acp-work-mode.test.mjs` → `4/4`（A10 判者）· `desktop-work-mode` → `2/2` · `server-work-mode` → `2/2` · `vsc-work-mode` → `2/2`。
- 回归：`context-overflow-guard.test.mjs` → `10/10`；`context-percent-calibrated.test.mjs`（状态行读数面）→ `1/1`。
- 包级：`thincoder-desktop npm test` → `14/14`；`thincoder-vscode npm test` → `48/48`；`thincoder-server npm test` → `11/11`；`thincoder-render-core npm test` → `6/6`。`thincoder-cli` ∥ `thincoder-core` 的 `npm test` 是「本包无集成集」的 fail-closed 门（不跑用例、非零退出，设计如此），其覆盖面由仓根集成用例承担。
- 全仓 `minimal` 复扫（A11 同一量法，按包）：**改动面零命中**；余下全部落在三类保留面 —— ① 旧值别名与旧值输入夹具（`LEGACY_MODE_ALIASES` + 4 档用例夹的 `minimal` 输入）② 推理强度值域（`model-specs.mjs` ∥ `auto-think.mjs` ∥ `bench` ∥ 三处 `reasoning.minimal` 键）③ 英文形容词（`markdown.mjs` ∥ `prompts/**` 四处 ∥ `mini-dom.mjs`）。无第四种归宿。

**残面**：无。原「残面」一节的 10 档已落完；RTM 两档的证据列所指档现在在盘，悬空指针消除（上面那条「残面」记述为上一轮的时点快照，已被本轮取代）。

### 代码评审轮（advisor，bind 本批 §3）

- **第 1 轮**（全量）：changes-required —— 🔴 2（用例面未落；RTM 指向不存在档）· 🟡 1（CONFIG §6「六处…不 import 核」与 `session-flags.mjs` 不符）· 🔵 3（横幅读裸字段 · 档内两套值域判定 · 归一算两遍）。
- **处置**：2 🔴 全部修（上节用例面 + 改名）；🔵 横幅与重复归一已改；🔵 档内两套值域按 §2 的「改」行口径不采纳并记 lead；🟡 属设计席笔，逐字记入上一节「落地核对」。
- **第 2 轮**（修复复核）：pass —— 2 🔴 均以盘面读数确认已落，2 🔵 确认已改，🟡 以「落地核对」的显式记录 + 转交设计席理由成立而关闭；另记 1 条 🔵（本档「残面」节已成时点快照，收口时改为「已由用例席落」）。
- **轮次**：内部 explore 偏差审计 1 轮（2 项）· advisor 代码评审 2 轮（6 + 7 项）· 自修 2 轮。**终止态 = clean**。

## §6 验证与收口（父代理）

### 验证（父侧实跑）

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-tiny-mode-rename.test.mjs` | 5 pass / 0 fail |
| 本批集成 | `tiny-mode` ∥ `tool-description-tiers` ∥ `acp-work-mode` ∥ `desktop-work-mode` ∥ `server-work-mode` ∥ `vsc-work-mode` | 全绿（3/3 · 2/2 · 4/4 · 2/2 · 2/2 · 2/2） |
| 全量集成 | `node --test test/integration/*.test.mjs` | **214 例 / 212 绿 / 2 红** |
| 文档门 | `doc_check(mode:"gate")` 覆盖 21 档（12 设计 + 8 需求 + 1） | `DOC-CHECK GATE: PASS` |

两红 = `CLI 43-1` ∥ `CLI 43-2`，`docs/core/design/DOC-GRAPH.md` 重写遗留（台账 `#2404`），本批未碰该面。**不写成「全绿」。**

### 核心判据读数（父侧实跑 `resolveWorkMode` 家族）

| 输入 | 输出 | 判什么 |
|---|---|---|
| `resolveWorkMode({mode:"minimal"})` | `"tiny"` | 旧配置读兼容 |
| `resolveSessionWorkMode({mode:"minimal"}, {})` | `"tiny"` | 旧槽读兼容——改名唯一真实风险 |
| `resolveWorkMode({mode:"bogus"})` | `"normal"` | 非法值语义未变 |
| `normalizeWorkMode("toString")` | `"toString"` | `Object.hasOwn` 守住原型链 |

### 全仓复扫（A11 判者）

量法：`minimal` 不分大小写、五类扩展名、排除 `node_modules`/`.git`/`dist*`/`.thincoder/tmp`，共 **334 行**，逐条归入三类保留面，**无第四种归宿**。

- **旧值别名与夹具输入**：`LEGACY_MODE_ALIASES` 六处、三档测试的 `mode: "minimal"` 输入、已收口批档。
- **推理强度值域**：`model-specs.mjs` 19 处、`bench/lib/params.mjs` 的 `EFFORT_VALUES`、四份 `reasoning.minimal`。
- **英文形容词**：「minimal patch」「minimal intrusion」「Minimal YAML subset」。

### 落地核对（设计档被落地改得不成立的句子）

- `docs/core/design/CONFIG.md` §6「六处…不 import 核」：实为五处就地映射 + `thincoder-desktop/src/main/session-flags.mjs` ∥ `thincoder-vscode/src/extension/panel-session-write.mjs` 走核。已由设计席 `#48` 改为如实表述。
- `docs/core/design/SESSION.md` §8 读兼容名单未点 VSC 槽写回面：已补 `panel-session-write.mjs`。
- 实施侧另修一处实测挖出的真缺陷：`saveLines` 以 `WORK_MODES.includes(slotMode)` 判槽 mode，旧槽 `minimal` 换名后不再合法 ⇒ 原样写回并保留旧布尔；已改走 `normalizeWorkMode`。

### 台账与债

- 覆盖行 `#2410` 随本笔结算并冻结本档。
- **本批无新债**。三条 Lead 属范围外、不记账：`setSlotMode` 内联数组（值已更新为三新值，换 import 属设计改动）· `test/integration/vsc-work-mode.test.mjs` 用例标题不带 RTM 编号 · `expandKnowledgeTopics` 参数缺省保留。

### 档位

`countContentLines` 对机读清单逐档复核，最大 `thincoder-core/tools/shared.mjs` 497、`thincoder-server/src/agent/member-routes.mjs` 488，**无越 500 档，分拆方案列全 `—`**。

本批是改名，无体量目标；工具面与提示词体量随 `#2406` ∥ `#2407` 已记，此处不重复测。
