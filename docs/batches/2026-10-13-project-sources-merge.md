# 2026-10-13 · 项目面单入口合并（项目 ∥ Git 源 标签页）+ 添加源基址门修复
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 16:07 两条（原话：「我希望项目和gitee源放一个页面用标签页区分，不要分两个入口，否则很快入口就耗尽了」+「在添加源页面，选择了类型还让我填基址，你是认真的吗？」）→ 16:14「开批」。
> 台账 = #1356 ∥ #1357（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · 项目面单入口合并 + 添加源基址门修复**

- **来源**：用户 2026-10-13 16:07 两条原话——①「我希望项目和gitee源放一个页面用标签页区分，不要分两个入口，否则很快入口就耗尽了。」②「在添加源页面，选择了类型还让我填基址，你是认真的吗？」→ 16:14「开批」。台账 #1356 ∥ #1357（server · 归批）。
- **范围**：① 管理·项目面单入口合并（项目 ∥ Git 源 = 一页两标签；旧址 `#/admin/git-sources` 自动跳对应标签；管理组 11 ⇒ 10 项）——复用公共标签页组件（`public/tabs.mjs`；沙盒页先例 `TABS.md` §2.2 口径：标签进地址栏子段 ∥ 切到才取数 ∥ 卡片层不动 ∥ 零新样式变量）；② 添加源弹窗基址门修复（`hidden` 真隐藏）+ 全控制台同族扫描补全。
- **根因（②，父侧实读 2026-10-13）**：`views-git-sources.mjs:223` 门代码在位但 `hidden` 无效——`modal.mjs:91` `field()` 产出 `<label>` ∥ `style.css:144/:150` `.provider-form > label { display:flex }` 作者样式压过 UA `hidden` ⇒ 基址对任何平台永远显；同族第二例 = github 事件块（`:228` ↔ `.stack-box { display:flex }` = `style.css:235`）；既有按例补丁两处 = `style.css:71`（`.sidebar[hidden]`）∥ `:126`（`.tab-panel[hidden]`）。
- **入口名**：合并后入口名沿用「项目」（用户未提改名）；标签词拟「项目」∥「Git 源」——设计轮定，文案键拟零新增（复用既有键）。
- **需求档**：功能点 48 + AC-48 已入册 ∥ AC-44 补 ⑫ ∥ AC-12 与三处计数链随动（2026-10-13——均父侧直接执行 · 可 revert）。
- **边界**：`/me/projects`（我的·项目）零触（合并只涉管理侧）；Git 源后端（`src/project/` 路由 ∥ store）零触；桌面/VSC/CLI 零触。

**父侧直笔 · 跨批随正（承 #44 交付报告 §跨批清单——2026-10-13 17:2x）**

- **四件 nav/别名面**（`2026-10-12-team-projects-permissions-ui` ∥ `2026-10-13-team-ledger` ∥ `2026-10-11-admin-agent-chat-ui` ∥ `2026-10-10-runner-admin-console-ui`——管理 11 ⇒ 10 ∥ 删 git-sources 项 ∥ 别名 +1 键 ∥ 旧链解析断言改子段形）+ **六件键数面**（上四件 + `2026-10-10-server-small-fixes` + `2026-10-08-server-public-structure` 守卫——959 ∥ 964 ⇒ **962 ∥ 967**（sandbox-container-actions 批 +3/表）；守卫指纹两枚随正 zh `3a3cdf31…` ∥ en `1d8e1612…`）= 父侧直笔·可 revert；提交 `8305c828` 双推。
- 复跑读数：① 7/7 ∥ ② 30/30 ∥ ③ 7/7 ∥ ⑤ 8/8 ∥ ⑥ 6/6 ∥ ④ **7/8**（唯一红 = `views-sandbox.mjs 502 > 500`——**#1297 已登台账预存面**，非本批）。
- **设计档机械回填**（父侧直笔·可 revert）：`webui/PROJECTS.md` §3 三行（壳 ≈86 ⇒ **69** ∥ 源档 ≈276 ⇒ **278** ∥ nav 104 ⇒ **105**）+ 守卫行两值随正；`webui/STYLE.md` §2.3 核对表行 3 指针（`app.mjs:155/169` ⇒ `:154/168`）；两档各一条变更记录行。
- 待收口面：浏览器实走四件（两标签互切 ∥ 老址直打 ∥ 刷新落对应标签 ∥ 建源弹窗两平台两态——设计在案：视觉终判 = 收口轮）——候 B 批（#46）落定后一并部署实走。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-13（评审轮 1 pass（🟡 5 ∥ 🔵 5）——九号定点修复已全数落盘（§2 修复节在案））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-13）

### 2.0 本批条目（覆盖 ∥ 不在本批）

**覆盖**（需求档 = `docs/server/requirements/PROJECT.md` §2 功能点 48 ∥ AC-48；AC-44 补 ⑫）：

- **T1 = 功能点 48① 单入口合并**：管理·项目 ∥ 管理·Git 源 ⇒ **一页两标签**（标签词「项目」∥「Git 源」）；管理组 nav **11 ⇒ 10** 项；复用公共标签页组件（`public/tabs.mjs`——KD-SV-102）。
- **T2 = 功能点 48① 旧址跳转 + ② 标签进地址栏**：`#/admin/git-sources` ⇒ 项目页 Git 源标签（落点/刷新/直打均达）；子段形 `#/admin/projects/<tab>`（`projects` ∥ `git-sources`）。
- **T3 = 功能点 48② 基址门生效**：添加/编辑源弹窗——仅「自建」示基址；非自建平台**真隐藏**（`hidden` 实际生效，非仅属性位）；含 github 事件块两态。
- **T4 = 功能点 48② 同族扫描闭合**：全控制台 `hidden` 切换点逐处核对（核对表 = `webui/STYLE.md` §2.3）——被作者 `display` 压者全补（AC-48 ⑤）。

**不在本批（边界）**：`#/me/projects`（我的·项目）零触；Git 源后端（`src/project/**` 路由 ∥ store ∥ 同步）零触；`views-git-sources.mjs` 六族动作面（源表七列 ∥ 五钮 ∥ 添/编/删三窗 ∥ 事件块 ∥ PAT 掩码 ∥ 平台门逻辑）行为零触；provider ∥ 成员 ∥ 沙盒等其余弹窗行为零触；三端（CLI/VSC/桌面）零触；i18n 键集零增零减。

### 2.1 设计档落点

- **主落点 = `docs/server/design/webui/PROJECTS.md`**：§1 增 KD-SV-149（本批决策）∥ §2.2 改「管理·项目（两标签壳）」∥ 增 §2.4（Git 源面板）∥ §3 文件账随正 ∥ §4 增 AC-48 行 + AC-12/AC-14 行随正 ∥ §5 边界。
- **随动**：`webui/WEBUI.md`（§1 档目链 ∥ §2 IA 表两行合一行 + 旧链迁移句 ∥ §2.12 ∥ §5 nav/app/views 行 ∥ §6 AC-12 行 ∥ §7 KD-SV-20 枚举）∥ `webui/STYLE.md`（增 §2.3 隐藏语义兜底 + 核对表；§1 增 KD-SV-150；§3 style.css 行；§4 增 AC-48 样式侧行）∥ `webui/TABS.md`（§1/§2.2 消费面登记第二例 + §5 边界句）∥ `design/PROJECT.md` §5 预算链一行。
- 需求档 = 父侧笔（本席零触——功能点 48 ∥ AC-48 ∥ AC-44 ⑫ ∥ 计数链已由父侧入册）。

### 2.2 机制设计

**① 合并形（页面归属 ∥ 面板拆分）**：

- **壳 = `views-admin-projects.mjs`（原管理·项目页升级）**：`renderAdminProjects(ctx, mount, sub = null)`——页题 `admin.projects.title`（「项目」）+ `createTabs(ctx, { tabs, initial: sub, onChange })`；`onChange: (id) => history.replaceState(null, "", \`#/admin/projects/${id}\`)`（沙盒先例——不触发 hashchange ⇒ 零重渲）。
- **面板①「项目」** = 现项目表件（搜索行 + 「添加仓」钮 + 表卡——件型零改，从原页函数原样移入 `buildProjectsPanel`）。
- **面板②「Git 源」** = `views-git-sources.mjs` 的 `renderGitSources(ctx, mount)`（**导出名不变**——三入口同名保留）：**删页题 h2**（面题入标签——「卡题与标签同词者去重」沿沙盒先例）；「添加源」钮行 + 表卡逐件零改 ⇒ 面板形。
- **零新档**：`public/` 文件集不变（跨批结构件快照 `PUBLIC_SNAPSHOT` 不动）；两档行数仍在 ≤500 内（壳 ≈+45 行 → ≈86；源档 −2 行 → ≈276）。
- **标签 id = 子段名**：`projects` ∥ `git-sources`（词面 = 原管理组两入口词 1:1；旧址 `#/admin/git-sources` 与子段尾段同名——可记可分享）。

**② 路由（旧址别名 ∥ 重定向带子段）**：

- `nav.mjs`：管理组删 `gitSources` 项（11 ⇒ 10）；`ROUTE_ALIASES` 增一行 `"/admin/git-sources": "/admin/projects/git-sources"`（静态别名机制现成——`resolveRoute` 裁末段得 `sub`）。
- `app.mjs` `:162` 重定向句收正：`navigate(resolved.sub === undefined ? resolved.path : \`${resolved.path}/${resolved.sub}\`)` —— **理由**：别名指向带子段的规范址时，`resolved.path` 已裁去子段，照旧只跳 `path` 会把标签丢掉；带子段者仅别名径一处（其余 redirect 无 `sub`），改法精确。`app.mjs` 同时删 `renderGitSources` import + `PAGES` 行（页不再直挂——`/admin/git-sources` 不在 `PAGES`，走别名）。
- 解析链核验（实施轮直测）：`/admin/git-sources` ⇒ `{ path: "/admin/projects", sub: "git-sources", redirect: true }` ⇒ 落 `#/admin/projects/git-sources` ⇒ 标签②；`/admin/projects/git-sources` 直打/刷新 ⇒ 同落标签②；`/admin/projects/projects` ∥ 非法子段 ⇒ 标签①回落（组件 `initial` 静默回落——既有口径）；user 角色 ⇒ redirect 先行 ⇒ 落 `/admin/projects` 后 `denied` 块（页面级——服务端仍判据）。

**③ 懒读口径（沙盒先例㈢「切到才取数」）**：面板首激活建 —— 标签①建 ⇒ 触发项目列表读；标签②建 ⇒ 触发源清单读；未激活面板零读（首屏只读一个列表）。`build()` 内异步读不 await（组件 `build` 为同步口——续沿沙盒件法）。

**④ 基址门修法形态（本批拍）——全局兜底规则**：

- **修法 = `style.css` 增一条全局规则 `[hidden] { display: none !important; }`**（置于 `* { box-sizing }` 归一处——底座区），**并删两处按例补丁**（`.sidebar[hidden]` `:71` ∥ `.tab-panel[hidden]` `:126`——其职能被全局规则吸收 ⇒ 冗余规则删净，不留残迹）。
- **理由三条**：① 根因是**类**不是点——UA `[hidden]{display:none}` 被任何作者 `display` 声明压过（作者样式优先于 UA 样式，与特异性无关）；按例补丁已铺两处仍漏两处（本批实锤 = 基址 label ∥ github 事件块），**每加一个 hidden 切换点就重陷一次**——一次性闭合该类（沿铁律 2「撞上错结构当场修，不得叠最小补丁盖症状」）；② `!important` 在此编码的正是语义本身——「`hidden` = 不渲染，任何布局 display 不得把它复活」（非布局覆盖）——样式面全局仅此一条 `!important`，可点名可机检；③ 净效果 = 增 1 行删 2 行，规则数反降。
- **被否候选**：㈠ **按例补**（`.provider-form > label[hidden]` ∥ `.stack-box[hidden]` 两条）——先例形（`:71`/`:126`）但其已两度漏网；且 `.provider-form.stacked > label` 与补丁同特异性 ⇒ 须靠「写在后面」决胜，脆弱。㈡ **组件侧**（`field()` 加包层 div ∥ 改切换为内联 `style.display`）——动 DOM 形/动 17+ 处切换点 API，改面最大且不消类（包层仍可能被作者 display 命中）。㈢ **`[hidden]` 全局无 `!important`**——特异性 (0,1,0) 仍输 `.provider-form > label` (0,1,1)，**无效**（不可选）。
- **组件侧零改**：`views-git-sources.mjs:223/:228` 的 `hidden` 切换逻辑逐字不动（修的是 CSS 侧）；事件块两态（github ∧ event ⇒ 显）同规。

**⑤ 同族扫描（全控制台 `hidden` 切换点核对表——落 `webui/STYLE.md` §2.3）**：逐点核对 = 元素 ∥ 命中作者 `display` 的规则 ∥ 判定（明细表在设计档）。实锤受压两处 = 基址 label（`style.css:102` 全局 `label` ∥ `:144` `.provider-form > label` ∥ `:150` `.provider-form.stacked > label`）∥ github 事件块 `.stack-box`（`:235`）；既受压已补两处 = `.sidebar`（`:70` ⇒ 补丁 `:71`）∥ `.tab-panel`（`:125` ⇒ 补丁 `:126`）；余 ~60 切换点（`.hint`/`.secret`/`.flash`/无类节点族——无 `display` 声明）结构性安全。全局规则落地后 = 全列安全（两个旧补丁删除）。

**⑥ 机检形（AC-48 ④⑤）**：

- **④「不在视觉层」**（单测档无 CSS 引擎——静态规则断言 + 收口轮视觉断言两段）：单测 = ① `style.css` 在册 `[hidden]` 覆盖规则且确含 `display: none` 与 `!important`（正则/规则表解析断言）；② 弹窗源码断言：非自建平台 ⇒ `baseField.hidden === true`（只切 `hidden` 属性、不手写内联 display）；③ 自建 ⇒ `hidden === false` 且提交门要求非空（源码断言 `selfhosted` 必填句在册）。收口轮（浏览器实走）= 建源弹窗两平台两态截图核对（非自建 ⇒ 基址不可见）。
- **⑤ 核对表闭合**（机检）：单测断言 = 全局规则在册 ∧ 单 `!important` 唯一（`style.css` 全文 `!important` 计数 = 1）∧ 旧两处按例补丁零残留（`.sidebar[hidden]`/`.tab-panel[hidden]` 字面零命中）。
- **①②③** = nav 直测（组/项 10 项 ∥ 别名 ∥ sub 回传 ∥ denied 态）+ 页面级单测（两标签在场 ∥ 惰性读 ∥ `replaceState` 写子段 ∥ 老址径端到端解析）+ 收口轮浏览器实走。

### 2.3 受影响文件与测试覆盖（产品面）

| 档 | 现读 | 预期 Δ | 改法 |
|---|---|---|---|
| `thincoder-server/public/nav.mjs` | 101 | ≈ +2 | 删 `gitSources` 项（`:28`）∥ `ROUTE_ALIASES` +1 行（`:41`）∥ 档头注释随正 |
| `thincoder-server/public/app.mjs` | 202 | ≈ −1 | 删 `renderGitSources` import（`:31`）+ `PAGES` 行（`:110`）∥ 重定向带子段（`:162`） |
| `thincoder-server/public/views-admin-projects.mjs` | 41 | ≈ +45 | 升级为两标签壳（`sub` 第三参 ∥ `createTabs` ∥ 面板①②建 ∥ `replaceState`） |
| `thincoder-server/public/views-git-sources.mjs` | 278 | ≈ −2 | 删页题 h2（面板形——`renderGitSources` 导出名不变）∥ 档头注释随正 |
| `thincoder-server/public/style.css` | 357 | +1 −2 | 全局 `[hidden]` 兜底 +1 ∥ 删 `.sidebar[hidden]`/`.tab-panel[hidden]` 按例补丁 |
| i18n 两档（project ∥ shell） | —— | 0 | **零触**（标签词复用 `nav.page.admin.projects` ∥ `nav.page.admin.gitSources`——键集/指纹零动） |
| `thincoder-server/public/tabs.mjs` ∥ `modal.mjs` ∥ `views-projects.mjs` ∥ `views-audit.mjs` ∥ 其余视图档 | —— | 0 | 零触 |

**测试覆盖（本批单测档 = `docs/batches/2026-10-13-project-sources-merge.test.mjs`——实施轮写）**：nav 直测（10 项 ∥ 别名 ∥ `sub` ∥ redirect 带子段解析）∥ app 装配（`PAGES` 无 git-sources 行 ∥ 三参透传 ∥ `SHELL_PAGES` 五路径零改）∥ 页装配（两标签 ∥ 惰性读时点/次数 ∥ `replaceState` 子段 ∥ 非法子段回落）∥ 面板②零回归（源表七列/五钮在场——沿既有件）∥ CSS 静态（全局规则 ∥ `!important` 计数 1 ∥ 旧补丁零残留）∥ 弹窗两态（`hidden` 真值切换 ∥ 自建必填门）。**收口轮**（父侧）= 浏览器实走四件：两标签互切、老址直打、刷新落对应标签、建源弹窗两平台两态。

### 2.4 验收对照（AC-48 逐条 → 判据）

| AC 条 | 设计级判据 | 载体 |
|---|---|---|
| ① 单入口 | 管理组 nav = 10 项（直测）∥ 项目页两标签在场（标签词 = 原两入口词）∥ 互切可用（点按 ∥ ←/→ ∥ Home/End——组件在册）∥ 面板保活（重切不重建） | 单测档 + 收口轮 |
| ② 老址跳转 | `resolveRoute("/admin/git-sources")` ⇒ `{ path: "/admin/projects", sub: "git-sources", redirect: true }`（直测）∥ app 重定向带子段（源码断言）∥ 直打/刷新落标签② | 单测档 + 收口轮 |
| ③ 标签进地址栏 | 子段形 `#/admin/projects/<tab>` ∥ 切换 = `replaceState`（零 hashchange/零重渲）∥ 直打落对应标签 ∥ 非法子段回落标签① | 单测档 + 收口轮 |
| ④ 基址门 | 非自建平台 ⇒ 基址输入不在视觉层（CSS 覆盖规则在册 ∧ `hidden` 真值切换）∥ 自建 ⇒ 示且必填（提交门在册） | 单测档 + 收口轮（浏览器实走两平台两态） |
| ⑤ 同族扫描 | 核对表在册（`webui/STYLE.md` §2.3——全切换点 ∥ 受压者全补）∥ 全局兜底规则在册 ∧ `!important` 计数 1 ∧ 旧补丁零残留 ∥ github 事件块两态在判 | 单测档 |
| AC-12（IA）随正 | 管理 11 ⇒ **10** ∥ 别名集 +1 ∥ 其余（我的 6 ∥ 角色默认 ∥ denied ∥ 子段容许）零改 | 单测档 |
| AC-14（多语言）· 本批 | 键集/指纹零动（零增零减——标签词复用既有键）∥ 引用闭合（`t` 字面量 ⊆ 两表） | 单测档 |

### 2.5 关键决策（本批——KD-SV-149 ∥ KD-SV-150）

- **KD-SV-149 页面归属 = 壳住管理·项目页档（`views-admin-projects.mjs`）∥ Git 源页转面板件（导出名不变）∥ 零新档**：理由 = 单入口的「一页」= 用户点名的管理·项目；转面板 ≠ 新建档（`public/` 文件集不动 ⇒ 跨批结构快照件零改）；**被否**：新开合并档（多一档多一 import——无收益）∥ 我的·项目页扩面（用户点名 = 管理面两入口）∥ 面板各写详情（漂移）。
- **KD-SV-150 隐藏语义 = 全局 `[hidden]` 兜底（`!important`）+ 删按例补丁**：理由与被否候选 = §2.2④。
- 其余口径沿先例（子段形/懒读/`replaceState` = `TABS.md` §2.2 四岔口——本批为**第二个消费面**，口径零新）。

### 2.6 上抛项（跨批件改法清单——父侧直笔；他批批内件受跨批写锁）

- **[上抛·待裁] 跨批件随正清单**（本席不直写——父侧执行；改毕 = 这些旧件恢复绿）：
  1. `docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs`：`:172-173` 删 `"/admin/git-sources"`（管理 11 ⇒ 10）；`:168` 标题句「管理 11」⇒「管理 10」；`:176` 别名集补 `"/admin/git-sources": "/admin/projects/git-sources"`；`:180` ⇒ `{ path: "/admin/projects", sub: "git-sources", redirect: true }`；`:278` wiring 删第三项（`views-git-sources.mjs` 一项——`renderGitSources` 不再由 app 直挂）；`:182` 断言（`.denied === true`）**无需改**（redirect + denied 共存）。
  2. `docs/batches/2026-10-13-team-ledger.test.mjs`：`:859-860` 删 `"/admin/git-sources"`（管理 11 ⇒ 10）；`:863` 别名集补同上一行；标题/消息句「管理 11」随正。
  3. **不动**：`docs/batches/2026-10-08-server-public-structure.test.mjs`（i18n 键零增零减 ⇒ 指纹/键数 959∥964 不动 ∥ 文件集零变 ∥ 三视图 ≤500 仍成立）；`…-console-tabs-component.test.mjs`（其子段/别名断言不涉新表项）；`2026-10-12-team-projects-permissions.test.mjs` ∥ `…-sync.test.mjs`（后端面零触）。
  4. **老件（2026-10-06 批组等）**：nav 表早已漂（不含 project 面）——**不扫**（批内件非门、零维护在案 2026-10-12 裁）；本清单只列「本批会使其在**现绿**基础上转红」的其他批件。
- **[上抛·知会] 观察项两件**：① `admin.gitSources.title` 键自本批起引用面变窄（页题 h2 撤销）——键保留（删键会动键数与两处指纹，跨批成本 > 收益；引用闭合机检不受影响（该键无 `t` 字面量悬挂断言反向面））；② `views-git-sources.mjs` 档头自述「页」措辞随实施轮收正为「面板」。

**同轮自校注（D6 读回 + 一致性面随正——逐条报）**：

1. **设计档节次收正**：`webui/PROJECTS.md` —— 面板①「项目」= §2.2 ∥ **合并形机制 = 新增 §2.3**（壳/子段/别名/懒读/零回归）∥ Git 源面板 = **§2.4**（原 §2.3 位续号——节号连号无缺）；指针全链随正（§2.1 本批落点节亦已同拍）。
2. **跨面档随正两处**（一致性面——已在盘）：`webui/LEDGER.md` §2 页数链 + §4 AC-12 行（管理 11 ⇒ **10**——team-ledger 批陈述随本批收正，含变更记录随正行）∥ `webui/I18N.md` §2.1 覆盖范围（十七页 ⇒ **十六页**——页集少一；键集零增零减；变更记录随正行在盘）。
3. **板档 `design/PROJECT.md` 随正**：§4 决策索引 1–148 ⇒ **1–150**（KD-SV-149 自 `webui/PROJECTS.md` §1 ∥ KD-SV-150 自 `webui/STYLE.md` §1）+ webui 行补注 ∥ §7 webui 行 + **AC-48** ∥ §6 本批预算块（服务端 ±0 ∥ webui 净 ≈+42；零新档）∥ 变更记录。
4. **读回核（grep 实读）**：webui 面档内 `管理 11` ∥ `三页承载` 字面**仅存于变更记录行**（记录面——合规）；规范面（IA 表/AC 行/页数链/KD 行）旧值零残留。
5. **本批零触面复核**：`#/me/projects` 面 ∥ Git 源后端（`src/project/**`）∥ i18n 键集 ∥ 需求档（父侧笔——AC-48/AC-44⑫/计数链已入册，本席只回指）。
6. **实施轮开工前提（交 eng-coder）**：受影响五档现读 = `nav.mjs` **104** ∥ `app.mjs` **206** ∥ `views-admin-projects.mjs` **41** ∥ `views-git-sources.mjs` **278** ∥ `style.css` **356**（2026-10-13 设计轮实读——以实施当刻盘面为准；`auth` 无）；跨批件两步：先落产品码 ⇒ 再改 §2.6 两件 ⇒ 跑本批单测档 + 两跨批件。

**6 条实核收正（2026-10-13 计行——上条陈写一处收正）**：五档现读 = `nav.mjs` **104** ∥ `app.mjs` **206** ∥ `views-admin-projects.mjs` **41** ∥ `views-git-sources.mjs` **278** ∥ `style.css` **358**（上条陈写 356——差 2，随本条收正）；预估 Δ 相应：`nav` **±0**（删一项 ∥ 别名 +1 行）∥ `app` ≈**204** ∥ 壳 ≈**86** ∥ 源档 ≈**276** ∥ `style` 净 **−1**（⇒ ≈357）。`webui/PROJECTS.md` §3 三行（nav ∥ app ∥ style）已按「B2 批实读 ⇒ 现读（2026-10-13 实核）⇒ 本批 Δ」三段式收正。

**设计评审轮 1 修复（fix 轮——九号定点，2026-10-13）**：承 §3 轮次 1（VERDICT pass——🔴 0 ∥ 🟡 5 ∥ 🔵 5）；父侧逐号裁定 = 9 条定点修（号 1–8、10）；号 9（需求档注行射程）父侧已笔、本席零触（实读确认 `docs/server/requirements/PROJECT.md:374` ⇒ AC-31–AC-49）。逐号落点：

1. **基线统一（号 1）**：`design/PROJECT.md` §9 本批块——nav **实读 104** ⇒ **±0** ∥ app **实读 206** ⇒ ≈**204** ∥ style **实读 358** ⇒ 净 **−1**；webui 净额重算闭合（分项和 = +45 −2 ±0 −2 −1 = **≈+40**；「净 ≈+42」收正）∥ `webui/STYLE.md` §3 style 行 + 面小计基线 344 ⇒ **358** ∥ `webui/WEBUI.md` §5 nav/app 两行链尾补「实读 **104** ∥ 实读 **206**」（链上 ≈106/≈212 陈估为实读取代）∥ `webui/PROJECTS.md` §3 nav 行 Δ 同拍。落笔前五档逐档实读复核（nav 104 ∥ app 206 ∥ style 358 ∥ 壳 41 ∥ 源档 278）。
2. **`webui/WEBUI.md` 三处补（号 2）**：§5 app 行补本批段（≈204；删 import/`PAGES` 行 + 重定向带子段）∥ §6 AC-12 管理链补「⇒ **11**（2026-10-12 team-projects-permissions 批——项目 ∥ Git 源两页）」∥ §7 KD-SV-20 我的组枚举补「**团队台账**」。
3. **守卫件处置定论（号 3）**：`webui/PROJECTS.md` §3 行改写——B2 面**已办**登记 ∥ 本批**零改**（零新档 ∥ 键集零动 ⇒ PARTS/DOMAINS/键数 959 ∥ 964/指纹逐件零动）；行数核清单在册者逐项（`app.mjs` ≤300 ⇒ ≈204；三视图 ≤500 ⇒ 壳 ≈86 ∥ 源档 ≈276；`nav.mjs` ∥ `style.css` 零在册）；该件实读 **168**（2026-10-13 实核——项目档 163 陈值收正，`webui/LEDGER.md` §3 167 同拍收正）；§6 随动句结为定论（B2 残项清）。
4. **nav 解析序写明（号 4）**：`webui/PROJECTS.md` §2.3 旧址条 + `webui/WEBUI.md` §2 路由解析句明写「别名先行、别名目标再走子段裁分 ⇒ `sub` 回传」（`resolveRoute` 实读 2026-10-13）；nav 侧零额外改 ⇒ Δ 校正 = **±0**（`webui/PROJECTS.md` §3 ∥ `design/PROJECT.md` §9 同拍）。
5. **入壳判据定论（号 5）**：本两页 = **非壳页**（沿沙盒页/key 表先例）——`webui/PROJECTS.md` §2.3（壳面归属条）/§4（AC-19/AC-20 行「实施随正」句结为定论）/§5（边界）；`webui/STYLE.md` §2.2① 排除面登记。
6. **AC-48 行（号 6）**：`webui/WEBUI.md` §6 增 AC-48 行（⇒ `webui/PROJECTS.md` §4 ∥ `webui/STYLE.md` §4——沿 AC-39/AC-44 先例）。
7. **引用坐标（号 7）**：`webui/PROJECTS.md` §2.4 卡题去重坐标 `webui/TABS.md` §2.3 ⇒ **§2.2**。
8. **措辞统一（号 8）**：`webui/PROJECTS.md` §2.2「页首『添加仓』钮」⇒「『添加仓』钮（面板①内——非页头位）」。
9. **号 9**：零触（父侧已落需求档注行；本席实读确认）。
10. **机检穷尽性（号 10）**：`webui/STYLE.md` §2.3 机检补第 ⑤ 条 = 核对表穷尽性集合断言（`public/**` 含 `hidden` 字面档集 ⊆ 核对表在册档集——「面上全列」机械化）。

**同轮附带（D8 一致性面——列报）**：`webui/PROJECTS.md` §1 KD-SV-124 行去废标（「（2026-10-13 收正——原『三页承载』合并后作废）」删——规范面不留废止 corpse；历史留存于变更记录行）；`webui/LEDGER.md` §3 守卫件读数收正（167 ⇒ 168）。

**§2.3 表陈值处置**（记录面）：表内 nav 101/≈+2 ∥ app 202/≈−1 ∥ style 357 三行已被「6 条实核收正」（上条）取代；本轮现读/Δ 复核 = nav ±0 ∥ app ≈204 ∥ style 净 −1（append-only——旧行不回改）。落点 = 4 设计档（`webui/PROJECTS.md` §1/§2.2/§2.3/§2.4/§3/§4/§5/§6 ∥ `webui/WEBUI.md` §2/§5/§6/§7 ∥ `webui/STYLE.md` §2.2/§2.3/§3 ∥ `design/PROJECT.md` §9 + 四档变更记录）+ 随动 1 档（`webui/LEDGER.md` §3 + 变更记录）。**产品码零触（设计轮·fix 轮）。**

## §3 设计评审（评审子代理）
**状态行**：评审完成（轮次 1：VERDICT pass（🔴 0 ∥ 🟡 5 ∥ 🔵 5））



### 轮次 1（评审子代理）

**评审对象**：2026-10-13 project-sources-merge 批设计（功能点 48：项目面单入口合并 + 基址门修复）∥ 评审范围 = `webui/PROJECTS.md` ∥ `webui/WEBUI.md` ∥ `webui/STYLE.md` ∥ `webui/TABS.md` ∥ `webui/LEDGER.md` ∥ `webui/I18N.md` ∥ `design/PROJECT.md` ∥ `requirements/PROJECT.md`（批档 `docs/batches/2026-10-13-project-sources-merge.md` 不在范围）。
**范围限制（如实披露）**：无项目标准档声明、无文档地图 ⇒ 文档归属判据降级；源码不读（审查面 = 文档）⇒ 行数读数仅做跨档互校（未对盘）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 文件账/预算 | 🟡 | 同一批基准读数三档互异、且 `design/PROJECT.md:743` 净额与分项和不闭合：`webui/PROJECTS.md:70` 记 nav「现读 104（2026-10-13 设计轮实核）⇒ **±0**」，而 `design/PROJECT.md:743` 记「`nav.mjs` **实读 101** ⇒ ≈103（删 `gitSources` 项 ∥ 别名 +1 行）」——净 ±0 与 ⇒103 自相矛盾，且该行「webui **净 ≈+42**」与自身分项和（45 −2 +2 −1 −1 = +43）不闭合；`webui/WEBUI.md:150` 链尾为「≈106 ⇒ 净 ±0」；app.mjs 202（`design/PROJECT.md:743`）vs 206（`webui/PROJECTS.md:71` 现读、`webui/LEDGER.md:37` 实读）；style.css 344（`webui/STYLE.md:276`）vs 352（`design/PROJECT.md:743`）vs 358（`webui/PROJECTS.md:74`） | 取一个基线（建议 2026-10-13 实核：nav 104 ∥ app 206 ∥ style 358）逐档收正，并重算 `design/PROJECT.md` §9 净额使分项和与总净一致 |
| 2 | 文档随正 | 🟡 | `webui/WEBUI.md` 随正缺口三处：① §5 `app.mjs` 行（`:147`）链尾止于 sandbox-outbound-member-face 批「两在途批序以实施当刻盘面实读为准」，无本批段——但 `app.mjs` 本批实改（`webui/PROJECTS.md:71` ∥ `design/PROJECT.md:743` 均在账）；② §6 AC-12 管理链缺 team-projects-permissions 批的「⇒ 11」一步（`:207` 作「⇒ **9**（admin-agent-chat 批——`webui/CHAT.md` §2.1）⇒ **10**（2026-10-13 project-sources-merge 批——Git 源并入项目页两标签；KD-SV-149）」——需求档 `requirements/PROJECT.md:328` 该步在册）⇒ 链不闭合；③ §7 KD-SV-20 我的组枚举「组 = 我的（key/用量/账户设置/**项目**/**工作区**）」（`:250`）缺 `#/me/ledger`（§2 表六项在册——`:48`） | 三处补齐：§5 `app.mjs` 行补本批 Δ；§6 管理链补「⇒ 11」步；§7 我的枚举补「团队台账」 |
| 3 | 文件账/守卫件 | 🟡 | 跨批结构守卫件处置两说：`webui/PROJECTS.md:13` 理由栏称「零新档 ⇒ `public/` 文件集不动（跨批结构快照件零改）」，同档 `:108` 却列「跨批守卫件随正（本档 §3 行——实施轮执行）」、`:75` 该行标「随正（PARTS/DOMAINS + `project` ∥ 指纹/键数 + 新档入行数核清单——实施轮执行）」（含 B2 残项——本批零新档 ∥ 键集零动）；同一行读数 163 与 `webui/LEDGER.md:43`「（已落盘——实读 167）」不一致 | 明写本批该件的处置（零新档 + 键集零动 ⇒ 预期零改；若守卫含既档行数核清单则逐项列 Δ），并统一读数 |
| 4 | 清晰度/可行性 | 🟡 | 别名 → 子段的重定向合成未落到 nav 侧：AC-48② 要求落子段（`webui/PROJECTS.md:89`「⇒ `{ path: "/admin/projects", sub: "git-sources", redirect: true }`」），`webui/PROJECTS.md:38` 只写「重定向 = `app.mjs` 带 `sub` 跳转（`resolved.path ∥ sub` 拼回）」；nav 侧仅记「删 `gitSources` 项 −1 ∥ 别名 +1 行」（`:70`）——`resolveRoute` 的解析序（别名先 ∥ 子段「裁末段试前缀」先——`webui/WEBUI.md:63`）与「别名目标是否再走子段裁分」未写；按「+1 行别名」最小改可能落标签①（不达 AC-48②） | 写明解析序与 nav 侧改法（别名目标再走子段裁分 ⇒ `sub` 回传），并据此校正 nav 行数 Δ |
| 5 | 验收/样式 | 🟡 | 标签化后本两页的入壳判据仍悬置：`webui/PROJECTS.md:95` 仅「表页视口高壳沿既有族（本面两页三表入壳判据随 `webui/STYLE.md` §2.2 口径——实施随正）」；`webui/STYLE.md:225` 高度链取直子选择器「`.page-area > .card`」，而标签面板 `.tab-panel`（`webui/TABS.md:21`）会夹在 `.page-area` 与 `.card` 之间（沙盒页显式标「非壳页」——`webui/WEBUI.md:59`；本两页未标） | 明写本两页 = 非壳页（或给出标签面板入壳的高度链补法），把「实施随正」升为定论 |
| 6 | 验收索引 | 🔵 | `webui/WEBUI.md` §6 无 AC-48 行——先例 = 每批补行（`:243`「AC-44（功能点 44——团队项目与权限；控制台面）」）；AC-48 ①②③ 只经 `:207` AC-12 行与 `webui/PROJECTS.md:89` 承载 | 补 AC-48 行（⇒ `webui/PROJECTS.md` §4 ∥ `webui/STYLE.md` §4），或明写「壳面腿随 AC-12 行」 |
| 7 | 引用坐标 | 🔵 | `webui/PROJECTS.md:48`「「卡题与标签同词者去重」沿沙盒先例 `webui/TABS.md` §2.3」——该规则在 `webui/TABS.md:33`「**卡题去重**：运行面卡 h3 去（面题入标签——同词不双题）」（§2.3 = 消费面登记，只回指 §2.2） | 坐标改指 §2.2（或 §2.2 与 §2.3 并引） |
| 8 | 清晰度 | 🔵 | 「添加仓」钮所在层两说：`webui/PROJECTS.md:31`「+ 搜索 + 页首「添加仓」钮」vs `:13`「面板①「项目」= 原项目表件（搜索 ∥ 添加仓钮 ∥ 表卡）」 | 统一为面板①内（页头位会在标签②仍在场） |
| 9 | 需求档残值 | 🔵 | `requirements/PROJECT.md:374`「AC-31–AC-47 为需求级判据」——AC-48（`:371`）∥ AC-49（`:372`）已入册（历批先例 = 射程随入册同步收正） | 射程改 AC-31–AC-49 |
| 10 | 机检穷尽性 | 🔵 | `webui/STYLE.md:268` 第 6 组判定 = 「结构性安全（面上全列；「安全」= 命中规则集内无 `display` 声明，非逐点实测）」——清单穷尽性无机械断言（AC-48⑤ 机检 ①–④ 不校验「清单 ⊇ 全目录含 `hidden` 档」） | 机检加一条集合断言：核对表覆盖 = 全目录含 `hidden` 字面档全集 |

**计数**：🔴 × 0 ∥ 🟡 × 5 ∥ 🔵 × 5（共 10）；需求覆盖（48 ①②③④⑤ ∥ AC-48 五行）逐条在册，无 🔴。

VERDICT: pass

（批档 `docs/batches/2026-10-13-project-sources-merge.md` 不在评审范围，正式「最近先例行」未核对；范围内先例坐标与偏离理由在册：`webui/STYLE.md` §1 KD-SV-150（点名先例补丁 `:71`/`:126` 并述何以不再适用）∥ `webui/TABS.md` §2.3（消费面② 差异两点）。）

## §4 用户批准（主 agent）

**§4 用户批准**：父侧代签（用户 2026-10-13 16:53「自动跑」授权 + 依据：评审 #36 = pass（🔴×0）∧ 修轮 #37 九号全落盘并经父侧核验（净额 ≈+40 闭合 ∥ 守卫件读数 168 ∥ `WEBUI:244` AC-48 行 ∥ `PROJECTS:95/:104` 非壳页定论与不做面 ∥ 五档实读 104/206/358/41/278 同拍）∧ designToken 已签发）——准予进入实施轮（eng-coder #44）。

## §5 实施记录（eng-coder）

**状态行**：实施完成 2026-10-13（产品码五档 + 批内单测件；⑦ 腿域面化后 7/7 绿；审计 1 轮 + 评审 2 轮均 pass；终态 clean）

**2026-10-13 · project-sources-merge 批 · 实施轮（eng-coder #44）——功能点 48 ∥ AC-48：产品码五档 + 批内单测件**

- **交付摘要（逐件）**：① 单入口合并 = `views-admin-projects.mjs` 升级两标签壳（`createTabs`——标签 id/子段 `projects` ∥ `git-sources`；标签词复用既有 nav 键 ⇒ i18n 零动）；② 老址 `#/admin/git-sources` = 静态别名 + 重定向带子段（解析序现成——nav 侧零额外改）；③ 懒读（面板首激活建即读 ∥ 未激活零读）+ `replaceState` 写子段（零 hashchange/零重渲）+ 非法/缺省子段回落标签① + 面板保活；④ 基址门 = `style.css` 底座区全局 `[hidden] { display: none !important; }` + 删两按例补丁（字面零残留）——组件侧零改（`:223`/`:228` 切换逐字不动）；⑤ 批内单测件 7 条腿 7/7 绿（含核对表穷尽性集合断言）。

- **改动 file:line 清单**（实读以 2026-10-13 实施当刻盘面为准）：
  1. `thincoder-server/public/nav.mjs`（104 ⇒ **105** 行）：`:2-3` 档头随正（管理 10）∥ 删管理组 `gitSources` 项（原 `:28`）∥ `:39-41` 别名 +1 行（含注释随正）∥ `:64-66` `resolveRoute` 文档注补解析序。**唯一代码行为改 = 删一项 + 别名表项一。**
  2. `thincoder-server/public/app.mjs`（206 ⇒ **205** 行）：删 `renderGitSources` import（原 `:31`）∥ 删 `PAGES` 行（原 `:110`）∥ `:161` 重定向带子段（`resolved.sub === undefined ? resolved.path : \`${resolved.path}/${resolved.sub}\``）∥ `:9` 档头旧链句随正。
  3. `thincoder-server/public/views-admin-projects.mjs`（41 ⇒ **69** 行）：`renderAdminProjects(ctx, mount, sub = null)` 两标签壳——`buildProjectsPanel`（原项目表件移入 ∥ 建即读不 await）∥ `buildGitSourcesPanel`（`renderGitSources(ctx, panel)`——导出名不变）∥ `createTabs` 装配 + `replaceState`（`:60-68`）。
  4. `thincoder-server/public/views-git-sources.mjs`（278 ⇒ **278** 行）：`:66` 删页题 h2（面板形）∥ `:2` 档头收正（面板/§2.4/标签②）∥ `:31` 节注收正。**动作面逐件零改**（表七列 ∥ 五钮 ∥ 添/编/删三窗 ∥ 事件块 ∥ PAT 掩码 ∥ 平台门）。
  5. `thincoder-server/public/style.css`（358 ⇒ **357** 行，净 −1）：`:66` 增全局兜底规则（底座区——`* { box-sizing }` 后）∥ 删 `.sidebar[hidden]`（原 `:71`）∥ 删 `.tab-panel[hidden]`（原 `:126`）。
  6. 新建 `docs/batches/2026-10-13-project-sources-merge.test.mjs`（378 行——不入任何门 ∥ 不入任何链）。
  零触面（如实）：i18n 两档 ∥ `tabs.mjs` ∥ `modal.mjs` ∥ `views-projects.mjs` ∥ 需求档 ∥ 四跨批单测件 ∥ 后端 `src/**` ∥ `index.html`。

- **决策透明表**：无新决策——逐件沿设计（§2.2 合并形 ∥ §2.2② 路由 ∥ §2.2③ 懒读 ∥ §2.2④ 修法形态 + KD-SV-149/150）；实现即设计，未引入替代方案。实读与设计估存差（nav **105** vs 记 104〔±0 预估〕∥ 壳 **69** vs 估 ≈86 ∥ 源档 **278** vs 估 ≈276；`app` **205** ≈ 估 204 ∥ `style` **357** = 估 357 合）——档内「以实施实读为准」面，交收口轮文档回填（advisor 评审 🔵②同指）。

- **审计与代码评审轮次与终态**：内部 divergence 审计（read-only explore）1 轮 ⇒ **四类偏差均未发现**（实现完整性 ∥ 静默简化 ∥ 清单外改动 ∥ 文档漂移逐项「一致」；其唯一观察 = 本条 §5 当时未写）；内部 advisor 代码评审 1 轮 ⇒ **VERDICT pass（🔴 0 ∥ 🟡 0 ∥ 🔵 2——① `admin.gitSources.title` 键零引用〔设计知会项①在案，保留免动键数/指纹〕② 设计档三行行账待实读回填〔收口轮文档面〕）**。**fix round = 0**（无 must-fix 项；两 🔵 均无须代码动作）。终态 = **clean**。

- **验证读数**（自 `thincoder/` 仓根——零网络 ∥ 零真模型）：
  - `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-project-sources-merge.test.mjs` ⇒ **tests 7 ∥ pass 7 ∥ fail 0**。
  - `node --check` × 四档（`nav.mjs` ∥ `app.mjs` ∥ `views-admin-projects.mjs` ∥ `views-git-sources.mjs`）⇒ 全绿。
  - 跨批结构守卫件复跑：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-08-server-public-structure.test.mjs` ⇒ **6/6 绿**（零新档 ∥ 键集零动）。
  - 静态面实核：`style.css` 全档 `!important` 计数 = **1**（唯新规则）∥ `.sidebar[hidden]`/`.tab-panel[hidden]` 字面零命中 ∥ `public/**` 含 `hidden` 字面档集 = 20 档（与核对表在册集恰等）。

- **跨批件实读（父侧直笔清单——本席零触；本批使其在现绿基础上转红）**：
  1. `2026-10-12-team-projects-permissions-ui.test.mjs`：`:172-173`（管理 11 表 ⇒ 删 `/admin/git-sources` 一项）∥ `:176`（别名集三键 ⇒ 补 `"/admin/git-sources": "/admin/projects/git-sources"`）∥ `:180`（`{ path: "/admin/git-sources" }` ⇒ `{ path: "/admin/projects", sub: "git-sources", redirect: true }`）∥ `:278`（wiring 第三项 `["views-git-sources.mjs", "renderGitSources", "/admin/git-sources"]` ⇒ 删项）。
  2. `2026-10-13-team-ledger.test.mjs`：`:859-860`（同表删项）∥ `:863`（同别名集补键）。
  3. `2026-10-11-admin-agent-chat-ui.test.mjs`：`:322` 标题句「管理 11」∥ `:328`（`assert.equal(admin.items.length, 11, ...)` ⇒ 10）∥ `:332`（别名集三键 deepEqual ⇒ 四键）。
  4. `2026-10-10-runner-admin-console-ui.test.mjs`：`:489` 标题句 ∥ `:496`（`assert.equal(admin.items.length, 11, ...)` ⇒ 10）。
  实跑读数：各件 `--import` 钩子下 fail 1（首个断点即列行）；其余断言（`:182` denied 共存 ∥ `:497` sandbox 末位 ∥ 档目 54∥53 等）仍真。

- **未做项（如实）**：① 收口轮浏览器实走四件（两标签互切 ∥ 老址直打 ∥ 刷新落对应标签 ∥ 建源弹窗两平台两态）——父侧面（设计在案：视觉终判 = 收口轮）；② 设计档三行行账按实读回填——收口轮文档面（advisor 🔵②）；③ 四跨批件补改——父侧直笔（用户 2026-10-13 裁定 + 父侧受理）。

- **同轮补记（2026-10-13 并行批实证 + 本件收正）**：本批实施期间另一在途批（`docs/batches/2026-10-13-sandbox-container-actions.md`——非本席面）17:06 落盘 `i18n-{zh,en}-sandbox.mjs`（门面键数 959/964 ⇒ **962/967**），使本件 ⑦ 腿原「门面全局键数」冻结断言转红（fail 1——读数：`962 !== 959` @ 件 `:366`）。**收正**：⑦ 腿改按本批零触面域断言——`shell` 部件 **61** ∥ `project` 部件 **154**（两表逐表键数零动 + 键集对位 + 标签词逐字 + en 零 CJK）；门面全局键数/指纹归跨批结构守卫件（他批增键不得动本批判定——口径入件头注）。收正后复跑 ⇒ **tests 7 ∥ pass 7 ∥ fail 0**。五档产品码零改（并行批动面 = sandbox 域两表 + `views-sandbox-containers.mjs`——与本批面零交叠；`git status`/`git diff` 实读：本席五档差异逐行在账）。

## §6 验证与收口（父代理）

**收口 · 2026-10-13（主 agent）**——实施核验通过；收口轮实走与部署全绿；本批闭合。

**① 收口轮浏览器实走（父侧 · .5 部署像 `363057e3db9f` · healthz 200）**：四件全绿——(1) **两标签互切**：项目 ⇄ Git 源点按互切，URL 回写子段（`#/admin/projects/git-sources`），面板①保活（重切不重建）；(2) **老址直打**：`#/admin/git-sources` ⇒ `#/admin/projects/git-sources`（重定向带子段）；(3) **刷新落对应标签**：子段址冷载 ⇒ 标签②在场（Git 源面板渲染、`添加源` 钮在场）；(4) **建源弹窗两平台两态**：非自建（gitee）⇒ 基址字段隐（全局 `[hidden]` 覆盖规则生效）∥ 切自建 ⇒ 显（`wrapHidden=false` ∥ `display:flex` ∥ 视口内）。
**② 文档面收口**：三行行账按实读回填（`webui/PROJECTS.md` ∥ `webui/STYLE.md`——随提交 `3beb2110`）；四跨批件补改 + 六件随正落盘（提交 `8305c828`——含守卫件指纹两枚；A 件复跑 **7/7** 绿）。
**③ 部署**：.5 拉取（`d934c4d..1456dff`）⇒ 构建（像 `363057e3db9f`）⇒ `up -d --force-recreate` ⇒ healthz 200——A+B 两批一并发车。
**④ 跨批随正核**：26 处全落、复跑绿（① 7/7 ∥ ② 30/30 ∥ ③ 7/7 ∥ ⑤ 8/8 ∥ ⑥ 6/6；④ 7/8 唯一红 = `views-sandbox.mjs 502 > 500` = **#1297 预存面**在册，非本批）。
**⑤ 暂缓批复核**：无（本批无暂缓项）。
**⑥ 收口判定**：实施完成 ∧ 收口轮实走全绿 ∧ 部署在案 ⇒ **成立**——本批收口（记录冻结）；台账 #1356 ∥ #1357 → 已核销。
